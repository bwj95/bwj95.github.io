/* Dash Runner — third-person endless runner. Pure browser, no backend.
   Three.js (r128) is loaded globally as THREE. */
(() => {
  'use strict';

  // ---------- Constants ----------
  const LANES = [-2.2, 0, 2.2];        // x position of the 3 lanes
  const GROUND_W = 9;
  const GROUND_LEN = 300;
  const SPAWN_Z = -110;                // where new rows appear (far ahead)
  const CULL_Z = 14;                   // behind camera -> recycle
  const ROW_GAP = 10.5;                // base distance between obstacle rows (room to react)
  const COIN_Y = 1.0;
  const GRAVITY = -34;
  const JUMP_V = 12.5;
  const SLIDE_TIME = 0.62;
  const START_SPEED = 15;
  const MAX_SPEED = 36;
  const SPEED_RAMP = 0.55;             // units/sec added per second
  const TRAIN_VZ = 1.2;                // trains creep in a touch faster (not enough to overtake a row)
  const TRAIN_LEN = 6;                 // length of a train car (in z)
  const CHASE_GAP = 5.8;               // how far the cop trails behind during play
  const ARREST_GAP = 1.8;              // how close the cop gets when busting you

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const elScore = $('score'), elCoins = $('coins'), elBest = $('best');
  const elHud = $('hud'), elOverlay = $('overlay'), elGameover = $('gameover');
  const elFinalScore = $('finalScore'), elFinalCoins = $('finalCoins'), elFinalBest = $('finalBest');
  const elPause = $('pausebtn');

  const BEST_KEY = 'dashrunner.best';
  let best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
  elBest.textContent = best;

  // ---------- Renderer / Scene / Camera ----------
  const canvas = $('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const FOG = 0xcfe2f2;                                    // hazy daylight horizon
  // vertical sky gradient
  (function makeSky() {
    const c = document.createElement('canvas'); c.width = 16; c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#2766b8');     // deep zenith blue
    grd.addColorStop(0.45, '#6fa8de');
    grd.addColorStop(0.78, '#aecde9');
    grd.addColorStop(1, '#dcebf5');     // pale hazy horizon (matches fog)
    g.fillStyle = grd; g.fillRect(0, 0, 16, 256);
    const tex = new THREE.CanvasTexture(c);
    scene.background = tex;
  })();
  scene.fog = new THREE.Fog(FOG, 45, 120);

  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);
  const camBase = new THREE.Vector3(0, 5.4, 9.4);   // pulled back so the cop chase is visible
  camera.position.copy(camBase);

  // ---------- Lights ----------
  const hemi = new THREE.HemisphereLight(0xcfe2ff, 0x5a5346, 0.85); // sky / warm ground bounce
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.3);            // afternoon sun
  sun.position.set(-10, 22, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
  scene.add(sun);
  sun.target.position.set(0, 0, -8);
  scene.add(sun.target);

  // ---------- Ground (scrolling road texture) ----------
  function makeRoadTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#41444b'; g.fillRect(0, 0, 256, 256);             // grey asphalt
    // aggregate grain (light + dark specks)
    for (let i = 0; i < 1400; i++) {
      const v = Math.random();
      g.fillStyle = v < 0.5 ? `rgba(255,255,255,${Math.random() * 0.05})` : `rgba(0,0,0,${Math.random() * 0.10})`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    // faint tar cracks
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      g.beginPath(); let x = Math.random() * 256; g.moveTo(x, 0);
      for (let y = 0; y < 256; y += 32) { x += (Math.random() - 0.5) * 18; g.lineTo(x, y); }
      g.stroke();
    }
    // dashed white lane dividers
    g.fillStyle = '#e9e9e9';
    for (const lx of [256 / 3, (256 / 3) * 2]) {
      for (let y = 0; y < 256; y += 64) g.fillRect(lx - 3, y + 10, 6, 36);
    }
    // solid white edge lines
    g.fillStyle = '#dcdcdc';
    g.fillRect(7, 0, 6, 256); g.fillRect(243, 0, 6, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 34);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }
  const roadTex = makeRoadTexture();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_W, GROUND_LEN),
    new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.92, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -GROUND_LEN / 2 + 20;
  ground.receiveShadow = true;
  scene.add(ground);

  // sidewalks / verge alongside the road
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x6f7d66, roughness: 1 });
  for (const sx of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(40, GROUND_LEN), sideMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(sx * (GROUND_W / 2 + 20), -0.02, ground.position.z);
    m.receiveShadow = true;
    scene.add(m);
  }

  // ---------- Side scenery (recycling city buildings) ----------
  function makeBuildingTexture() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 128);          // base (tinted by material colour)
    const cols = 4, rows = 10, pad = 6;
    const cw = (64 - pad * (cols + 1)) / cols, ch = (128 - pad * (rows + 1)) / rows;
    for (let r = 0; r < rows; r++) for (let cI = 0; cI < cols; cI++) {
      const lit = Math.random() < 0.22;
      g.fillStyle = lit ? '#fff3c4' : '#2d3340';                 // warm lit vs dark glass
      g.fillRect(pad + cI * (cw + pad), pad + r * (ch + pad), cw, ch);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
  const facadeTex = makeBuildingTexture();
  const buildingTints = [0x9a9183, 0x8d7f6e, 0x7e8a93, 0xa39b8a, 0x6f7681, 0xb0a290];
  const pillars = [];                                            // (kept name; reused in loop)
  for (let i = 0; i < 20; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const h = 8 + Math.random() * 26;
    const w = 3 + Math.random() * 3;
    const map = facadeTex.clone(); map.needsUpdate = true;
    map.repeat.set(Math.max(1, Math.round(w / 2)), Math.max(2, Math.round(h / 3)));
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, w),
      new THREE.MeshStandardMaterial({ color: buildingTints[(Math.random() * buildingTints.length) | 0], map, roughness: 0.85 })
    );
    mesh.position.set(side * (8 + Math.random() * 9), h / 2 - 0.5, -i * 12 - Math.random() * 6);
    mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh);
    pillars.push(mesh);
  }

  // ---------- Clouds (soft drifting billboards) ----------
  function makeCloudTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128;
    const g = c.getContext('2d');
    for (let i = 0; i < 22; i++) {
      const x = 40 + Math.random() * 176, y = 60 + Math.random() * 48, r = 22 + Math.random() * 40;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, 'rgba(255,255,255,0.95)');
      grd.addColorStop(0.5, 'rgba(255,255,255,0.55)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    return new THREE.CanvasTexture(c);
  }
  const cloudTex = makeCloudTexture();
  const clouds = [];
  for (let i = 0; i < 12; i++) {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.85 + Math.random() * 0.15, depthWrite: false, fog: false }));
    const s = 16 + Math.random() * 26;
    spr.scale.set(s, s * 0.52, 1);
    spr.position.set((Math.random() - 0.5) * 140, 26 + Math.random() * 34, -50 - Math.random() * 150);
    spr.userData.drift = (0.4 + Math.random() * 0.6) * (Math.random() < 0.5 ? -1 : 1); // gentle wind
    scene.add(spr);
    clouds.push(spr);
  }

  // ---------- Player ----------
  const player = new THREE.Group();
  const body = new THREE.Group();         // inner group we can tilt/scale for slide
  player.add(body);
  scene.add(player);

  const matSkin = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.5 });    // deep brown / Black skin
  const matShirt = new THREE.MeshStandardMaterial({ color: 0xcf3a2e, roughness: 0.7 });   // red hoodie
  const matPants = new THREE.MeshStandardMaterial({ color: 0x26303f, roughness: 0.8 });   // dark jeans
  const matShoe = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6 });    // white trainers
  const matHair = new THREE.MeshStandardMaterial({ color: 0x14100d, roughness: 0.85 });   // black hair
  const matPack = new THREE.MeshStandardMaterial({ color: 0xe0a92e, roughness: 0.6 });

  function box(w, h, d, mat) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = true; return m; }

  const torso = box(0.62, 0.72, 0.34, matShirt); torso.position.y = 1.02; body.add(torso);
  const pack = box(0.42, 0.5, 0.2, matPack); pack.position.set(0, 1.04, 0.27); body.add(pack);
  const head = box(0.42, 0.42, 0.42, matSkin); head.position.y = 1.62; body.add(head);
  const hair = box(0.46, 0.16, 0.46, matHair); hair.position.y = 1.82; body.add(hair);

  // limbs on pivots so we can swing them
  function limb(px, py, w, h, d, mat) {
    const pivot = new THREE.Group(); pivot.position.set(px, py, 0);
    const m = box(w, h, d, mat); m.position.y = -h / 2; pivot.add(m);
    body.add(pivot); return pivot;
  }
  const armL = limb(-0.42, 1.32, 0.16, 0.46, 0.16, matShirt);   // hoodie sleeve
  const armR = limb(0.42, 1.32, 0.16, 0.46, 0.16, matShirt);
  // skin hands poking out of the sleeves
  const handL = box(0.17, 0.16, 0.17, matSkin); handL.position.y = -0.52; armL.add(handL);
  const handR = box(0.17, 0.16, 0.17, matSkin); handR.position.y = -0.52; armR.add(handR);
  const legL = limb(-0.17, 0.66, 0.2, 0.6, 0.22, matPants);
  const legR = limb(0.17, 0.66, 0.2, 0.6, 0.22, matPants);
  // shoes
  const shoeL = box(0.24, 0.16, 0.34, matShoe); shoeL.position.set(0, -0.6, 0.06); legL.add(shoeL);
  const shoeR = box(0.24, 0.16, 0.34, matShoe); shoeR.position.set(0, -0.6, 0.06); legR.add(shoeR);

  // ---------- Chaser: cop + dog ----------
  function matOf(c, rough) { return new THREE.MeshStandardMaterial({ color: c, roughness: rough == null ? 0.65 : rough }); }
  function makeRunner(cfg) {
    const g = new THREE.Group();
    const mk = (w, h, d, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = true; return m; };
    const shirt = matOf(cfg.shirt), pants = matOf(cfg.pants), skin = matOf(cfg.skin, 0.7);
    const torso = mk(0.66, 0.76, 0.38, shirt); torso.position.y = 1.02; g.add(torso);
    const belt = mk(0.68, 0.16, 0.4, matOf(0x111418)); belt.position.y = 0.64; g.add(belt);
    const head = mk(0.42, 0.42, 0.42, skin); head.position.y = 1.64; g.add(head);
    if (cfg.hat) {
      const cap = mk(0.5, 0.18, 0.5, matOf(cfg.hat)); cap.position.y = 1.9; g.add(cap);
      const brim = mk(0.52, 0.07, 0.22, matOf(cfg.hat)); brim.position.set(0, 1.84, -0.32); g.add(brim);
      const badge = mk(0.14, 0.14, 0.04, matOf(0xffd23f)); badge.position.set(0, 1.96, 0.02); g.add(badge);
    }
    const limbG = (px, py, w, h, d, mat) => { const p = new THREE.Group(); p.position.set(px, py, 0); const m = mk(w, h, d, mat); m.position.y = -h / 2; p.add(m); g.add(p); return p; };
    const armL = limbG(-0.45, 1.32, 0.17, 0.58, 0.17, shirt);
    const armR = limbG(0.45, 1.32, 0.17, 0.58, 0.17, shirt);
    const legL = limbG(-0.18, 0.66, 0.21, 0.62, 0.23, pants);
    const legR = limbG(0.18, 0.66, 0.21, 0.62, 0.23, pants);
    return { group: g, armL, armR, legL, legR };
  }
  function makeDog() {
    const g = new THREE.Group();
    const fur = matOf(0x4a3528, 0.8), dark = matOf(0x2a1c14, 0.8);
    const mk = (w, h, d, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = true; return m; };
    const torso = mk(0.5, 0.42, 0.95, fur); torso.position.y = 0.52; g.add(torso);
    const head = mk(0.4, 0.38, 0.42, fur); head.position.set(0, 0.62, -0.6); g.add(head);
    const snout = mk(0.22, 0.2, 0.24, dark); snout.position.set(0, 0.54, -0.86); g.add(snout);
    const ear1 = mk(0.1, 0.2, 0.06, dark); ear1.position.set(-0.14, 0.84, -0.5); g.add(ear1);
    const ear2 = mk(0.1, 0.2, 0.06, dark); ear2.position.set(0.14, 0.84, -0.5); g.add(ear2);
    const tail = mk(0.1, 0.1, 0.36, fur); tail.position.set(0, 0.64, 0.62); tail.rotation.x = -0.7; g.add(tail);
    const legG = (px, pz) => { const p = new THREE.Group(); p.position.set(px, 0.34, pz); const m = mk(0.13, 0.36, 0.13, dark); m.position.y = -0.18; p.add(m); g.add(p); return p; };
    const legs = [legG(-0.18, -0.32), legG(0.18, -0.32), legG(-0.18, 0.34), legG(0.18, 0.34)];
    return { group: g, legs };
  }
  const cop = makeRunner({ shirt: 0x274690, pants: 0x161a2e, skin: 0xffce9e, hat: 0x16233f });
  scene.add(cop.group);
  const dog = makeDog();
  scene.add(dog.group);
  let chaserPhase = 0;

  function updateChaser(dt, arrest) {
    const targetZ = arrest ? player.position.z + ARREST_GAP : CHASE_GAP;
    cop.group.position.z += (targetZ - cop.group.position.z) * Math.min(1, dt * (arrest ? 3.5 : 4));
    const tx = arrest ? player.position.x : player.position.x * 0.85;
    cop.group.position.x += (tx - cop.group.position.x) * Math.min(1, dt * 5);
    // dog runs just ahead and to the side of the cop
    dog.group.position.z += ((cop.group.position.z - 1.2) - dog.group.position.z) * Math.min(1, dt * 5);
    dog.group.position.x += ((cop.group.position.x - 0.65) - dog.group.position.x) * Math.min(1, dt * 5);

    chaserPhase += dt * (arrest ? 22 : 15);
    const s = Math.sin(chaserPhase);
    cop.legL.rotation.x = s * 1.0; cop.legR.rotation.x = -s * 1.0;
    if (arrest) { cop.armL.rotation.x = -2.5; cop.armR.rotation.x = -2.5; }   // lunging to grab
    else { cop.armL.rotation.x = -s * 0.95; cop.armR.rotation.x = s * 0.95; }
    const ds = Math.sin(chaserPhase * 1.6);
    dog.legs[0].rotation.x = ds * 1.3; dog.legs[3].rotation.x = ds * 1.3;
    dog.legs[1].rotation.x = -ds * 1.3; dog.legs[2].rotation.x = -ds * 1.3;
    dog.group.position.y = Math.abs(Math.sin(chaserPhase * 1.6)) * 0.16;   // bounding gait
  }

  // ---------- Obstacle factory + pools ----------
  function makeObstacle(type) {
    const g = new THREE.Group();
    if (type === 'block') {
      const m = box(1.7, 2.3, 1.3, new THREE.MeshStandardMaterial({ color: 0xff7b54, roughness: 0.5 }));
      m.position.y = 1.15; g.add(m);
      const roof = box(1.8, 0.25, 1.4, new THREE.MeshStandardMaterial({ color: 0x3a3f63 }));
      roof.position.y = 2.35; g.add(roof);
      // window stripe
      const win = box(1.72, 0.5, 1.32, new THREE.MeshStandardMaterial({ color: 0x12203f, roughness: 0.2, metalness: 0.4 }));
      win.position.y = 1.5; g.add(win);
    } else if (type === 'jump') {
      const m = box(1.8, 0.9, 0.7, new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.5 }));
      m.position.y = 0.45; g.add(m);
      const stripe = box(1.82, 0.28, 0.72, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      stripe.position.y = 0.6; g.add(stripe);
    } else if (type === 'train') { // long car that rushes toward you — change lanes
      const len = TRAIN_LEN;
      const bdy = box(1.62, 2.0, len, new THREE.MeshStandardMaterial({ color: 0x2f6df6, metalness: 0.5, roughness: 0.35 }));
      bdy.position.y = 1.1; g.add(bdy);
      const roof = box(1.72, 0.3, len, new THREE.MeshStandardMaterial({ color: 0x16233f })); roof.position.y = 2.15; g.add(roof);
      const win = box(1.66, 0.6, len - 0.8, new THREE.MeshStandardMaterial({ color: 0x0a1830, metalness: 0.6, roughness: 0.12 })); win.position.y = 1.42; g.add(win);
      const nose = box(1.64, 1.9, 0.22, new THREE.MeshStandardMaterial({ color: 0xffd23f })); nose.position.set(0, 1.1, -len / 2); g.add(nose);
      g.userData.halfLen = len / 2;
    } else if (type === 'drone') { // hovering hazard that strafes across lanes
      const bdy = box(1.15, 0.7, 1.15, new THREE.MeshStandardMaterial({ color: 0xff3b6b, emissive: 0x551122, emissiveIntensity: 0.5, roughness: 0.4 }));
      bdy.position.y = 1.5; g.add(bdy);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 8, 22), new THREE.MeshStandardMaterial({ color: 0x222633, metalness: 0.6 }));
      ring.position.y = 1.5; ring.rotation.x = Math.PI / 2; ring.castShadow = true; g.add(ring);
      g.userData.halfLen = 0.7;
    } else { // slide — overhead bar to duck under
      const barMat = new THREE.MeshStandardMaterial({ color: 0x00d2a8, roughness: 0.5 });
      const bar = box(1.9, 0.55, 0.6, barMat); bar.position.y = 1.75; g.add(bar);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x3a3f63 });
      const p1 = box(0.18, 2, 0.18, postMat); p1.position.set(-0.86, 1, 0); g.add(p1);
      const p2 = box(0.18, 2, 0.18, postMat); p2.position.set(0.86, 1, 0); g.add(p2);
    }
    g.userData.type = type;
    return g;
  }
  const pools = { block: [], jump: [], slide: [], train: [], drone: [] };
  const active = [];
  function spawnObstacle(type, lane, z) {
    let o = pools[type].pop();
    if (!o) { o = makeObstacle(type); scene.add(o); }
    o.visible = true;
    o.position.set(LANES[lane], 0, z);
    o.userData.lane = lane;
    o.userData.kind = 'obstacle';
    o.userData.baseX = LANES[lane];
    o.userData.vz = type === 'train' ? TRAIN_VZ : 0;          // extra forward speed (oncoming)
    o.userData.swayAmp = type === 'drone' ? 0.45 : 0;         // gentle in-lane wobble (stays in its lane)
    o.userData.swayHz = 0.5 + Math.random() * 0.3;
    o.userData.t = Math.random() * Math.PI * 2;
    active.push(o);
  }

  // ---------- Coins ----------
  const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16);
  const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.7, roughness: 0.25, emissive: 0x6b5200, emissiveIntensity: 0.4 });
  const coinPool = [];
  function spawnCoin(lane, z, y) {
    let c = coinPool.pop();
    if (!c) { c = new THREE.Mesh(coinGeo, coinMat); c.rotation.x = Math.PI / 2; c.castShadow = true; scene.add(c); }
    c.visible = true;
    c.position.set(LANES[lane], y, z);
    c.userData.kind = 'coin';
    c.userData.lane = lane;
    active.push(c);
  }

  function recycle(o) {
    o.visible = false;
    if (o.userData.kind === 'coin') coinPool.push(o);
    else pools[o.userData.type].push(o);
  }

  // ---------- Spawning logic ----------
  let spawnDist = 0;            // accumulates travel; spawn a new far row each ROW_GAP
  let safeLane = 1;             // a lane guaranteed clear & reachable from the last row's safe lane
  const TYPES = ['block', 'jump', 'slide'];
  function coinTrail(lane, z) {
    const arc = Math.random() < 0.35; // arcing coins to reward a jump
    const count = 3 + ((Math.random() * 3) | 0);
    for (let i = 0; i < count; i++) {
      const cz = z + i * 1.7;
      const y = arc ? COIN_Y + Math.sin((i / (count - 1)) * Math.PI) * 1.6 : COIN_Y;
      spawnCoin(lane, cz, y);
    }
  }
  function generateRow(z) {
    // Lanes reachable from the current safe lane with a single sideways move.
    const reachable = [safeLane - 1, safeLane, safeLane + 1].filter((l) => l >= 0 && l <= 2);
    // How many lanes to block this row (never all three, and never the whole reachable set).
    const want = Math.random() < 0.2 ? 0 : (Math.random() < 0.6 ? 1 : 2);
    const blocked = new Set();
    const order = [0, 1, 2].sort(() => Math.random() - 0.5);
    for (const l of order) {
      if (blocked.size >= want) break;
      // never block a lane if it would leave no reachable lane free — keeps a connected path
      const reachableStillFree = reachable.filter((r) => r !== l && !blocked.has(r));
      if (reachableStillFree.length === 0) continue;
      blocked.add(l);
    }
    const free = [0, 1, 2].filter((l) => !blocked.has(l));
    // advance the safe lane to a free lane reachable from the old one (single move guaranteed)
    const freeReachable = free.filter((l) => reachable.includes(l));
    const pickFrom = freeReachable.length ? freeReachable : free;
    safeLane = pickFrom[(Math.random() * pickFrom.length) | 0];

    // place obstacles
    for (const lane of blocked) {
      const r = Math.random();
      const t = r < 0.14 ? 'train' : r < 0.2 ? 'drone' : TYPES[(Math.random() * TYPES.length) | 0];
      spawnObstacle(t, lane, z);
    }
    // coins along a clear lane (usually the safe path, so following it is rewarding)
    if (free.length && Math.random() < 0.85) {
      const lane = Math.random() < 0.6 ? safeLane : free[(Math.random() * free.length) | 0];
      coinTrail(lane, z);
    }
  }

  // ---------- Game state ----------
  let state = 'menu';     // menu | playing | arrest | dead | paused
  let speed = START_SPEED;
  let distance = 0, coins = 0, score = 0;
  let targetLane = 1;
  let velY = 0, onGround = true, sliding = false, slideT = 0;
  let runTime = 0;
  let arresting = false, arrestT = 0, arrestSpeed = 0;

  function resetGame() {
    for (let i = active.length - 1; i >= 0; i--) recycle(active[i]);
    active.length = 0;
    speed = START_SPEED; distance = 0; coins = 0; score = 0;
    targetLane = 1; velY = 0; onGround = true; sliding = false; slideT = 0; runTime = 0;
    arresting = false; arrestT = 0; arrestSpeed = 0;
    safeLane = 1;
    player.position.set(0, 0, 0);
    body.scale.set(1, 1, 1); body.rotation.x = 0;
    armL.rotation.x = armR.rotation.x = 0;
    cop.group.position.set(0, 0, CHASE_GAP);
    dog.group.position.set(-0.65, 0, CHASE_GAP - 1.2);
    spawnDist = 0;
    // pre-fill the track from just ahead of the player out to the spawn line
    for (let z = -16; z > SPAWN_Z; z -= ROW_GAP) generateRow(z);
    updateHud();
  }

  function startGame() {
    resetGame();
    state = 'playing';
    elOverlay.classList.add('hidden');
    elGameover.classList.add('hidden');
    elHud.classList.remove('hidden');
    elPause.classList.remove('hidden');
  }

  function gameOver() {
    state = 'dead';
    if (score > best) { best = score; localStorage.setItem(BEST_KEY, String(best)); }
    elFinalScore.textContent = score;
    elFinalCoins.textContent = coins;
    elFinalBest.textContent = best;
    elBest.textContent = best;
    elGameover.classList.remove('hidden');
    elPause.classList.add('hidden');
  }

  function updateHud() {
    elScore.textContent = score;
    elCoins.textContent = coins;
    elBest.textContent = best;
  }

  // ---------- Input ----------
  function moveLeft() { if (state === 'playing') targetLane = Math.max(0, targetLane - 1); }
  function moveRight() { if (state === 'playing') targetLane = Math.min(2, targetLane + 1); }
  function jump() {
    if (state !== 'playing') return;
    if (onGround && !sliding) { velY = JUMP_V; onGround = false; }
  }
  function slide() {
    if (state !== 'playing') return;
    if (!sliding) {
      sliding = true; slideT = SLIDE_TIME;
      if (!onGround) velY = Math.min(velY, -4); // fast-fall into slide
    }
  }

  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft': case 'a': case 'A': moveLeft(); break;
      case 'ArrowRight': case 'd': case 'D': moveRight(); break;
      case 'ArrowUp': case 'w': case 'W': case ' ': jump(); break;
      case 'ArrowDown': case 's': case 'S': slide(); break;
      case 'p': case 'P': togglePause(); break;
      default: return;
    }
    e.preventDefault();
  }, { passive: false });

  // touch swipe — fire the instant the threshold is crossed (no wait for finger lift)
  let tStart = null, tFired = false;
  const SWIPE = 22;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    tStart = { x: t.clientX, y: t.clientY }; tFired = false;
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (!tStart || tFired) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - tStart.x, dy = t.clientY - tStart.y;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < SWIPE && ay < SWIPE) return;          // not far enough yet
    if (ax > ay) { dx > 0 ? moveRight() : moveLeft(); }
    else { dy > 0 ? slide() : jump(); }
    tFired = true;                                  // one action per swipe
  }, { passive: true });
  canvas.addEventListener('touchend', () => {
    if (tStart && !tFired) jump();                  // a tap (no swipe) = jump
    tStart = null;
  }, { passive: true });

  // mouse drag (desktop, optional)
  let mStart = null;
  canvas.addEventListener('mousedown', (e) => { mStart = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('mouseup', (e) => {
    if (!mStart) return;
    const dx = e.clientX - mStart.x, dy = e.clientY - mStart.y;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) { mStart = null; return; }
    if (Math.abs(dx) > Math.abs(dy)) dx > 0 ? moveRight() : moveLeft();
    else dy > 0 ? slide() : jump();
    mStart = null;
  });

  $('start').addEventListener('click', startGame);
  $('retry').addEventListener('click', startGame);

  function togglePause() {
    if (state === 'playing') { state = 'paused'; elPause.textContent = '▶'; }
    else if (state === 'paused') { state = 'playing'; elPause.textContent = '⏸'; last = performance.now(); }
  }
  elPause.addEventListener('click', togglePause);
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') togglePause(); });

  // ---------- Collision ----------
  function checkCollisions() {
    const feet = player.position.y;
    const head = feet + (sliding ? 0.85 : 1.7);
    const px = player.position.x;
    for (const o of active) {
      const hl = o.userData.halfLen || 0.6;
      const dz = o.position.z - player.position.z;
      if (Math.abs(dz) > hl + 0.5) continue;          // not at the player's depth yet
      const dx = Math.abs(px - o.position.x);

      if (o.userData.kind === 'coin') {
        if (dx < 0.7 && Math.abs(o.position.y - (feet + 0.85)) < 1.05) {
          coins++; score += 10; updateHud();
          o.userData.collected = true;
        }
        continue;
      }

      if (dx > 1.1) continue;                         // obstacle in another lane
      const t = o.userData.type;
      if (t === 'block' || t === 'train' || t === 'drone') return die();
      if (t === 'jump' && feet < 0.9) return die();   // didn't clear the hurdle
      // overhead bar occupies y∈[1.2,2.2]: slide under it, or clear it with a high jump
      if (t === 'slide' && feet < 2.2 && head > 1.2) return die();
    }
  }
  // a crash starts the arrest sequence; the cop catches up, then it's game over
  function die() {
    if (state !== 'playing') return;
    hitFlash = 1;
    state = 'arrest';
    arresting = true; arrestT = 0; arrestSpeed = speed;
    sliding = false;
    elPause.classList.add('hidden');
  }

  // ---------- Loop ----------
  let last = performance.now();
  let hitFlash = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.05) dt = 0.05; // clamp after stalls

    if (state === 'playing') {
      runTime += dt;
      speed = Math.min(MAX_SPEED, START_SPEED + runTime * SPEED_RAMP);
      const move = speed * dt;
      distance += move;
      score = Math.floor(distance) + coins * 10;

      // scroll road + scenery toward camera
      roadTex.offset.y -= move / GROUND_LEN * 34;
      for (const p of pillars) {
        p.position.z += move;
        if (p.position.z > 18) { p.position.z -= 20 * 12; p.position.x = (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 9); }
      }

      // move active objects, cull, collect
      for (let i = active.length - 1; i >= 0; i--) {
        const o = active[i];
        o.position.z += move + (o.userData.vz || 0) * dt;     // trains rush in faster
        if (o.userData.swayAmp) {                              // drones strafe across lanes
          o.userData.t += dt;
          o.position.x = o.userData.baseX + Math.sin(o.userData.t * o.userData.swayHz * Math.PI * 2) * o.userData.swayAmp;
        }
        if (o.userData.kind === 'coin') { o.rotation.z += dt * 6; }
        if (o.position.z > CULL_Z + (o.userData.halfLen || 0) || o.userData.collected) {
          o.userData.collected = false;
          recycle(o);
          active[i] = active[active.length - 1]; active.pop();
        }
      }

      // spawn ahead: feed a fresh row at the far line every ROW_GAP of travel
      spawnDist += move;
      while (spawnDist >= ROW_GAP) {
        spawnDist -= ROW_GAP;
        generateRow(SPAWN_Z);
      }

      // --- vertical physics ---
      velY += GRAVITY * dt;
      player.position.y += velY * dt;
      if (player.position.y <= 0) { player.position.y = 0; velY = 0; onGround = true; }

      // --- slide timer ---
      if (sliding) {
        slideT -= dt;
        if (slideT <= 0 && onGround) sliding = false;
        else if (slideT <= 0 && !onGround) sliding = false;
      }

      // --- lane move (snappy, no input lag) ---
      const tx = LANES[targetLane];
      player.position.x += (tx - player.position.x) * Math.min(1, dt * 30);
      if (Math.abs(tx - player.position.x) < 0.02) player.position.x = tx;   // settle instantly
      // banking tilt toward movement
      player.rotation.z = (tx - player.position.x) * 0.55;

      // --- character animation ---
      animateChar(dt);
      updateChaser(dt, false);

      checkCollisions();
      updateHud();
    } else if (state === 'arrest') {
      // world coasts to a stop while the cop and dog rush in to bust you
      arrestT += dt;
      arrestSpeed += (0 - arrestSpeed) * Math.min(1, dt * 2.5);
      const move = arrestSpeed * dt;
      roadTex.offset.y -= move / GROUND_LEN * 34;
      for (const p of pillars) p.position.z += move;
      for (const o of active) o.position.z += move;
      // settle the player to the ground, standing
      velY += GRAVITY * dt; player.position.y += velY * dt;
      if (player.position.y <= 0) { player.position.y = 0; velY = 0; onGround = true; }
      animateChar(dt);
      updateChaser(dt, true);
      if (arrestT > 1.5) { arresting = false; gameOver(); }
    }

    // drifting clouds (ambient, runs in every state)
    for (const cl of clouds) {
      cl.position.x += cl.userData.drift * dt;
      if (cl.position.x > 85) cl.position.x = -85;
      else if (cl.position.x < -85) cl.position.x = 85;
    }

    // camera follow with slight speed FOV + shake
    const targetFov = 62 + (speed - START_SPEED) * 0.35;
    camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 3);
    camera.position.x += (player.position.x * 0.35 - camera.position.x) * Math.min(1, dt * 6);
    if (hitFlash > 0) {
      hitFlash -= dt * 2;
      camera.position.x += (Math.random() - 0.5) * hitFlash * 0.6;
      camera.position.y = camBase.y + (Math.random() - 0.5) * hitFlash * 0.6;
    } else camera.position.y += (camBase.y - camera.position.y) * Math.min(1, dt * 6);
    camera.lookAt(player.position.x * 0.4, 1.1, -8);
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
  }

  let animPhase = 0;
  function animateChar(dt) {
    if (arresting) {
      // skid to a stop, throw hands up
      const k = Math.min(1, dt * 10);
      body.rotation.x += (0 - body.rotation.x) * k;
      body.scale.y += (1 - body.scale.y) * k;
      body.position.y += (0 - body.position.y) * k;
      legL.rotation.x += (0.2 - legL.rotation.x) * k;
      legR.rotation.x += (-0.2 - legR.rotation.x) * k;
      armL.rotation.x += (-2.9 - armL.rotation.x) * k;
      armR.rotation.x += (-2.9 - armR.rotation.x) * k;
      return;
    }
    if (sliding) {
      body.rotation.x += (1.0 - body.rotation.x) * Math.min(1, dt * 16);
      body.scale.y += (0.85 - body.scale.y) * Math.min(1, dt * 16);
      body.position.y += (-0.15 - body.position.y) * Math.min(1, dt * 16);
      armL.rotation.x = -1.6; armR.rotation.x = -1.6;
      legL.rotation.x = 0.4; legR.rotation.x = -0.2;
      return;
    }
    body.rotation.x += (0 - body.rotation.x) * Math.min(1, dt * 16);
    body.scale.y += (1 - body.scale.y) * Math.min(1, dt * 16);
    body.position.y += (0 - body.position.y) * Math.min(1, dt * 16);

    if (!onGround) {
      // tuck during jump
      legL.rotation.x = -0.7; legR.rotation.x = 0.3;
      armL.rotation.x = -2.3; armR.rotation.x = -2.3;
      return;
    }
    animPhase += dt * (8 + speed * 0.18);
    const s = Math.sin(animPhase);
    legL.rotation.x = s * 0.9; legR.rotation.x = -s * 0.9;
    armL.rotation.x = -s * 0.8; armR.rotation.x = s * 0.8;
  }

  // ---------- Resize ----------
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();

  // build an initial idle track behind the menu
  resetGame();
  state = 'menu';
  requestAnimationFrame(frame);

  // ---------- PWA service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
