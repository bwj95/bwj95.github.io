/**
 * Molecular Observation — Loki's Beach
 *
 * Sibling to Cosmic Observation. Where the cosmic sim used gravity to pull
 * planets into orbits, this one uses *interatomic force* to pull atoms into
 * molecules and lets you watch reactions happen.
 *
 * The physics in one breath:
 *   - Every pair of atoms feels a Lennard-Jones-style force: hard REPULSION
 *     when they overlap, gentle ATTRACTION in a shell just past contact,
 *     nothing beyond a cutoff. (This is the "gravity" of the molecular world.)
 *   - Atoms have a VALENCE (how many bonds they can hold). When two atoms with
 *     free valence drift close, they snap into a BOND — a stiff spring that
 *     holds them at an equilibrium length. Bonding is exothermic: it kicks a
 *     little kinetic energy back out (the flash).
 *   - TEMPERATURE injects random kinetic energy every frame. Turn it up and
 *     thermal jostling stretches bonds until they SNAP — you get dissociation.
 *     Turn it down and atoms settle into stable molecules.
 *
 * Emergent chemistry: 2 H + O -> H2O, C + 4 H -> CH4, Na + Cl -> NaCl, etc.
 */

document.addEventListener('DOMContentLoaded', () => {
    initMolecularCanvas();
    initControlPanel();
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ------------------------------------------------------------------ */
/* Element periodic data                                              */
/* ------------------------------------------------------------------ */

// radius drives both drawing size and the force's equilibrium distance.
// valence caps how many bonds an atom can hold.
// Colors follow the CPK convention chemists use in molecular models.
const ELEMENTS = {
    H:  { symbol: 'H',  name: 'Hydrogen',   color: '#dceeff', glow: '#7cc4ff', radius: 9,  mass: 1,   valence: 1 },
    O:  { symbol: 'O',  name: 'Oxygen',     color: '#ff6b6b', glow: '#ff9a9a', radius: 13, mass: 16,  valence: 2 },
    C:  { symbol: 'C',  name: 'Carbon',     color: '#5b6472', glow: '#aab4c4', radius: 14, mass: 12,  valence: 4 },
    N:  { symbol: 'N',  name: 'Nitrogen',   color: '#5b8def', glow: '#93b6ff', radius: 12, mass: 14,  valence: 3 },
    S:  { symbol: 'S',  name: 'Sulfur',     color: '#f4d03f', glow: '#f9e79f', radius: 15, mass: 32,  valence: 2 },
    P:  { symbol: 'P',  name: 'Phosphorus', color: '#ff9f43', glow: '#ffbe76', radius: 15, mass: 31,  valence: 3 },
    F:  { symbol: 'F',  name: 'Fluorine',   color: '#7bed9f', glow: '#b8f5c9', radius: 8,  mass: 19,  valence: 1 },
    Cl: { symbol: 'Cl', name: 'Chlorine',   color: '#4ade80', glow: '#9af0bd', radius: 15, mass: 35,  valence: 1 },
    Br: { symbol: 'Br', name: 'Bromine',    color: '#c0554a', glow: '#e08a7f', radius: 16, mass: 80,  valence: 1 },
    I:  { symbol: 'I',  name: 'Iodine',     color: '#a06bd0', glow: '#c9a5e8', radius: 18, mass: 127, valence: 1 },
    Na: { symbol: 'Na', name: 'Sodium',     color: '#c084fc', glow: '#dcb6ff', radius: 16, mass: 23,  valence: 1 },
};

// A molecule's identity is its composition, keyed by a canonical SIGNATURE
// (elements alphabetical, each with its count, e.g. water -> "H2O1"). This is
// decoupled from the DISPLAY formula, whose element order follows chemical
// convention (NH3, NaCl, HCl) rather than any single sortable rule.
const MOLECULES = {
    // stable molecules
    'H2':     { formula: 'H2',   name: 'Hydrogen gas' },
    'O2':     { formula: 'O2',   name: 'Oxygen gas' },
    'N2':     { formula: 'N2',   name: 'Nitrogen gas' },
    'Cl2':    { formula: 'Cl2',  name: 'Chlorine gas' },
    'H2O1':   { formula: 'H2O',  name: 'Water' },
    'H2O2':   { formula: 'H2O2', name: 'Hydrogen peroxide' },
    'C1H4':   { formula: 'CH4',  name: 'Methane' },
    'C2H6':   { formula: 'C2H6', name: 'Ethane' },
    'C2H4':   { formula: 'C2H4', name: 'Ethylene' },
    'H3N1':   { formula: 'NH3',  name: 'Ammonia' },
    'C1O1':   { formula: 'CO',   name: 'Carbon monoxide' },
    'C1O2':   { formula: 'CO2',  name: 'Carbon dioxide' },
    'Cl1H1':  { formula: 'HCl',  name: 'Hydrogen chloride' },
    'Cl1Na1': { formula: 'NaCl', name: 'Salt' },
    'N1O1':   { formula: 'NO',   name: 'Nitric oxide' },
    'N1O2':   { formula: 'NO2',  name: 'Nitrogen dioxide' },
    // radicals / fragments (mid-reaction) — named so they don't read "Unknown"
    'H1O1':   { formula: 'OH',   name: 'Hydroxyl' },
    'C1H3':   { formula: 'CH3',  name: 'Methyl' },
    'C1H2':   { formula: 'CH2',  name: 'Methylene' },
    'C1H1':   { formula: 'CH',   name: 'Methylidyne' },
    'H2N1':   { formula: 'NH2',  name: 'Amino' },
    'H1N1':   { formula: 'NH',   name: 'Imidogen' },
};

function compositionSignature(counts) {
    return Object.keys(counts).sort().map(el => el + counts[el]).join('');
}

/* ------------------------------------------------------------------ */
/* Main canvas + simulation                                           */
/* ------------------------------------------------------------------ */

let MOL = null; // exposed for the control panel wiring

function initMolecularCanvas() {
    const canvas = document.getElementById('moleculeCanvas');
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;

    /* --- tunable physics constants ---
       The whole feel of the sim is the tug-of-war between ATTRACTION (pulls
       atoms together so they can bond) and thermal energy (TEMPERATURE, jostles
       them apart). Attraction has to win at low temp or nothing ever forms. */
    const DT = 1;                    // base timestep
    const SUBSTEPS = 3;              // integration substeps per frame (stability)
    const CUTOFF_SCALE = 2.6;        // force range as a multiple of contact distance
    const REPULSION = 0.9;           // stiffness of the overlap push-apart
    const ATTRACTION = 0.22;         // strength of the van-der-Waals pull
    const THERMAL_SCALE = 0.3;       // how hard TEMPERATURE jostles atoms
    const BOND_STIFFNESS = 0.06;     // spring constant for a formed bond
    const BOND_EQ_SCALE = 0.92;      // equilibrium bond length vs. contact distance
    const CAPTURE_SCALE = 1.35;      // how close (vs contact) atoms must be to bond
    const BOND_BREAK_SCALE = 1.8;    // stretch (vs eq length) at which a bond snaps
    const BOND_KICK = 0.9;           // exothermic velocity kick on bond formation
    const GLOBAL_DAMPING = 0.99;     // bleeds energy so the sim settles
    const MAX_SPEED = 14;            // velocity clamp — keeps integration sane
    const WALL_BOUNCE = 0.82;        // energy kept when hitting a wall

    /* --- runtime state --- */
    let atoms = [];
    let flashes = [];
    let nextId = 0;
    let temperature = 0.2;           // 0 (frozen) .. 1.5 (plasma)
    let paused = false;
    let bondingEnabled = true;
    let showLabels = true;
    let currentElement = 'H';
    let spawnMode = 'atom';          // 'atom' | 'drag'

    const mouse = { x: width / 2, y: height / 2, down: false };
    let dragged = null;

    class Atom {
        constructor(element, x, y) {
            const e = ELEMENTS[element];
            this.id = nextId++;
            this.element = element;
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.mass = e.mass;
            this.radius = e.radius;
            this.valence = e.valence;
            this.bonds = new Set(); // ids of bonded atoms
            this.spawnT = performance.now();
        }
        get freeValence() {
            return this.valence - this.bonds.size;
        }
    }

    const byId = new Map();
    function rebuildIndex() {
        byId.clear();
        for (const a of atoms) byId.set(a.id, a);
    }

    class Flash {
        constructor(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.life = 1;
        }
        update() {
            this.life -= 0.045;
        }
        draw() {
            const r = this.radius * (1.6 - this.life * 0.6);
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
            grad.addColorStop(0, hexA(this.color, 0.55 * this.life));
            grad.addColorStop(1, hexA(this.color, 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* ---------------- spawning ---------------- */

    function spawnAtom(element, x, y) {
        const a = new Atom(element, x, y);
        atoms.push(a);
        byId.set(a.id, a);
        return a;
    }

    function spawnCluster(specs, cx, cy, spread = 70) {
        // specs: array of element symbols, scattered near (cx, cy)
        for (const sym of specs) {
            const ang = Math.random() * Math.PI * 2;
            const d = Math.random() * spread;
            spawnAtom(sym, cx + Math.cos(ang) * d, cy + Math.sin(ang) * d);
        }
    }

    function clearAll() {
        atoms = [];
        flashes = [];
        byId.clear();
    }

    /* ---------------- bond helpers ---------------- */

    function contactDist(a, b) {
        return a.radius + b.radius;
    }

    function bondKey(a, b) {
        return a.id < b.id ? a.id + '-' + b.id : b.id + '-' + a.id;
    }

    function formBond(a, b) {
        a.bonds.add(b.id);
        b.bonds.add(a.id);
        // Exothermic: shove them apart slightly so a fresh molecule doesn't
        // collapse, and flash to mark energy release.
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const nx = dx / d, ny = dy / d;
        a.vx -= nx * BOND_KICK / a.mass * 4;
        a.vy -= ny * BOND_KICK / a.mass * 4;
        b.vx += nx * BOND_KICK / b.mass * 4;
        b.vy += ny * BOND_KICK / b.mass * 4;
        flashes.push(new Flash((a.x + b.x) / 2, (a.y + b.y) / 2, contactDist(a, b) * 1.4, '#fde68a'));
    }

    function breakBond(a, b) {
        a.bonds.delete(b.id);
        b.bonds.delete(a.id);
    }

    /* ---------------- physics step ---------------- */

    function physicsStep(dt) {
        const n = atoms.length;

        // Thermal energy: random kick each atom, scaled by temperature and
        // inversely by mass (lighter atoms jitter more — like real gases).
        if (temperature > 0) {
            for (const a of atoms) {
                const kick = temperature * THERMAL_SCALE / Math.sqrt(a.mass);
                a.vx += (Math.random() - 0.5) * kick;
                a.vy += (Math.random() - 0.5) * kick;
            }
        }

        // Pairwise non-bonded force (the Lennard-Jones analog) + bond capture.
        // O(n^2). Fine for a few hundred atoms.
        for (let i = 0; i < n; i++) {
            const a = atoms[i];
            for (let j = i + 1; j < n; j++) {
                const b = atoms[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                let d = Math.hypot(dx, dy);
                if (d < 0.001) { d = 0.001; }

                const contact = contactDist(a, b);
                const cutoff = contact * CUTOFF_SCALE;
                if (d > cutoff) continue;

                const nx = dx / d, ny = dy / d;
                const bonded = a.bonds.has(b.id);
                let force = 0; // + = attract, - = repel

                if (bonded) {
                    // Harmonic bond spring toward equilibrium length.
                    const eq = contact * BOND_EQ_SCALE;
                    force = BOND_STIFFNESS * (d - eq);
                    // Bond snaps if thermal jostling stretches it too far.
                    if (d > eq * BOND_BREAK_SCALE) {
                        breakBond(a, b);
                        flashes.push(new Flash((a.x + b.x) / 2, (a.y + b.y) / 2, contact, '#93b6ff'));
                    }
                } else {
                    if (d < contact) {
                        // Overlap — steep repulsion (soft sphere).
                        force = -REPULSION * (contact - d);
                    } else {
                        // Shell attraction — STRONGEST right at contact and
                        // decaying to zero at the cutoff. (A sin() hump would
                        // leave a dead zone at contact and radicals would never
                        // close their last bond.)
                        const t = (d - contact) / (cutoff - contact); // 0..1
                        force = ATTRACTION * (1 - t) * (1 - t);
                    }

                    // Bond capture: compatible free valences drifting close enough.
                    if (bondingEnabled &&
                        d < contact * CAPTURE_SCALE &&
                        a.freeValence > 0 && b.freeValence > 0) {
                        formBond(a, b);
                    }
                }

                // Apply force along the axis, split by mass (Newton's third law).
                const fx = nx * force;
                const fy = ny * force;
                a.vx += fx / a.mass;
                a.vy += fy / a.mass;
                b.vx -= fx / b.mass;
                b.vy -= fy / b.mass;
            }
        }

        // Integrate + damping + walls + speed clamp.
        for (const a of atoms) {
            if (a === dragged) continue;
            a.vx *= GLOBAL_DAMPING;
            a.vy *= GLOBAL_DAMPING;

            const sp = Math.hypot(a.vx, a.vy);
            if (sp > MAX_SPEED) {
                a.vx = a.vx / sp * MAX_SPEED;
                a.vy = a.vy / sp * MAX_SPEED;
            }

            a.x += a.vx * dt;
            a.y += a.vy * dt;

            const r = a.radius;
            if (a.x < r) { a.x = r; a.vx = Math.abs(a.vx) * WALL_BOUNCE; }
            if (a.x > width - r) { a.x = width - r; a.vx = -Math.abs(a.vx) * WALL_BOUNCE; }
            if (a.y < r) { a.y = r; a.vy = Math.abs(a.vy) * WALL_BOUNCE; }
            if (a.y > height - r) { a.y = height - r; a.vy = -Math.abs(a.vy) * WALL_BOUNCE; }
        }
    }

    /* ---------------- molecule detection ---------------- */

    // Union-find over the bond graph -> connected components -> formulas.
    function detectMolecules() {
        const parent = new Map();
        const find = (x) => {
            while (parent.get(x) !== x) {
                parent.set(x, parent.get(parent.get(x)));
                x = parent.get(x);
            }
            return x;
        };
        const union = (x, y) => { parent.set(find(x), find(y)); };

        for (const a of atoms) parent.set(a.id, a.id);
        for (const a of atoms) {
            for (const bid of a.bonds) {
                if (byId.has(bid)) union(a.id, bid);
            }
        }

        const groups = new Map(); // root -> element counts
        for (const a of atoms) {
            const root = find(a.id);
            if (!groups.has(root)) groups.set(root, {});
            const counts = groups.get(root);
            counts[a.element] = (counts[a.element] || 0) + 1;
        }

        // Tally by composition signature. Skip lone atoms (size 1).
        const tally = new Map(); // sig -> { formula, name, n }
        for (const counts of groups.values()) {
            const total = Object.values(counts).reduce((s, v) => s + v, 0);
            if (total < 2) continue;
            const sig = compositionSignature(counts);
            if (!tally.has(sig)) {
                const known = MOLECULES[sig];
                tally.set(sig, {
                    formula: known ? known.formula : hillFormula(counts),
                    name: known ? known.name : 'Compound',
                    n: 0,
                });
            }
            tally.get(sig).n++;
        }
        return tally;
    }

    function hillFormula(counts) {
        // Hill order: C first, H second, then the rest alphabetical.
        const order = Object.keys(counts).sort((a, b) => {
            if (a === 'C') return -1;
            if (b === 'C') return 1;
            if (a === 'H') return -1;
            if (b === 'H') return 1;
            return a < b ? -1 : 1;
        });
        return order.map(el => el + (counts[el] > 1 ? counts[el] : '')).join('');
    }

    /* ---------------- rendering ---------------- */

    function draw() {
        // Fade previous frame slightly for soft motion trails.
        ctx.fillStyle = 'rgba(3, 6, 12, 0.32)';
        ctx.fillRect(0, 0, width, height);

        // Bonds first (under the atoms).
        ctx.lineCap = 'round';
        for (const a of atoms) {
            for (const bid of a.bonds) {
                if (bid < a.id) continue; // draw each bond once
                const b = byId.get(bid);
                if (!b) continue;
                ctx.strokeStyle = 'rgba(180, 220, 255, 0.35)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        // Flashes (energy release).
        for (const f of flashes) f.draw();

        // Atoms.
        for (const a of atoms) {
            const e = ELEMENTS[a.element];
            const r = a.radius;

            // Glow halo.
            const glow = ctx.createRadialGradient(a.x, a.y, r * 0.2, a.x, a.y, r * 2.1);
            glow.addColorStop(0, hexA(e.glow, 0.5));
            glow.addColorStop(1, hexA(e.glow, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(a.x, a.y, r * 2.1, 0, Math.PI * 2);
            ctx.fill();

            // Body with a soft 3D sheen.
            const body = ctx.createRadialGradient(
                a.x - r * 0.35, a.y - r * 0.35, r * 0.1,
                a.x, a.y, r
            );
            body.addColorStop(0, lighten(e.color, 0.35));
            body.addColorStop(1, e.color);
            ctx.fillStyle = body;
            ctx.beginPath();
            ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
            ctx.fill();

            // Symbol label.
            if (showLabels) {
                ctx.fillStyle = pickTextColor(e.color);
                ctx.font = `600 ${Math.round(r * 0.95)}px Outfit, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(e.symbol, a.x, a.y + 0.5);
            }
        }
    }

    /* ---------------- main loop ---------------- */

    let lastLegend = 0;
    function animate() {
        if (!paused) {
            const dt = DT / SUBSTEPS;
            for (let s = 0; s < SUBSTEPS; s++) physicsStep(dt);
        }

        // Age flashes.
        for (const f of flashes) f.update();
        flashes = flashes.filter(f => f.life > 0);

        draw();

        // Update the molecule legend a few times a second.
        const now = performance.now();
        if (now - lastLegend > 250) {
            renderLegend(detectMolecules(), atoms.length);
            lastLegend = now;
        }

        requestAnimationFrame(animate);
    }

    /* ---------------- input ---------------- */

    function atomAt(x, y) {
        // topmost first
        for (let i = atoms.length - 1; i >= 0; i--) {
            const a = atoms[i];
            if (Math.hypot(a.x - x, a.y - y) <= a.radius + 4) return a;
        }
        return null;
    }

    function pointerPos(e) {
        const t = e.touches ? e.touches[0] : e;
        return { x: t.clientX, y: t.clientY };
    }

    function onDown(e) {
        if (isUiTarget(e.target)) return;
        const p = pointerPos(e);
        mouse.x = p.x; mouse.y = p.y; mouse.down = true;

        if (spawnMode === 'drag') {
            const hit = atomAt(p.x, p.y);
            if (hit) { dragged = hit; return; }
        }
        // default: place an atom of the current element
        spawnAtom(currentElement, p.x, p.y);
    }

    function onMove(e) {
        const p = pointerPos(e);
        mouse.x = p.x; mouse.y = p.y;
        if (dragged) {
            dragged.vx = (p.x - dragged.x) * 0.4;
            dragged.vy = (p.y - dragged.y) * 0.4;
            dragged.x = p.x;
            dragged.y = p.y;
        }
    }

    function onUp() {
        mouse.down = false;
        dragged = null;
    }

    function isUiTarget(t) {
        return !!(t.closest && t.closest('.glass-nav, .control-panel, .legend-panel, .mobile-menu, button, a, input, select'));
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    resize();
    seedDemo();
    animate();

    // A gentle opening scene so the canvas isn't empty.
    function seedDemo() {
        spawnCluster(['H', 'H', 'O'], width * 0.48, height * 0.42, 55);
        spawnCluster(['H', 'H', 'O'], width * 0.4, height * 0.62, 55);
        spawnCluster(['H', 'H', 'H', 'H', 'C'], width * 0.63, height * 0.55, 60);
    }

    /* ---------------- expose controls ---------------- */

    MOL = {
        setElement: (el) => { currentElement = el; },
        getElement: () => currentElement,
        setTemperature: (t) => { temperature = t; },
        getTemperature: () => temperature,
        togglePause: () => { paused = !paused; return paused; },
        isPaused: () => paused,
        toggleBonding: () => { bondingEnabled = !bondingEnabled; return bondingEnabled; },
        toggleLabels: () => { showLabels = !showLabels; return showLabels; },
        setSpawnMode: (m) => { spawnMode = m; },
        getSpawnMode: () => spawnMode,
        clear: clearAll,
        preset: (name) => runPreset(name),
        breakAllBonds: () => {
            for (const a of atoms) a.bonds.clear();
            flashes.push(new Flash(width / 2, height / 2, 200, '#93b6ff'));
        },
        count: () => atoms.length,
    };

    function runPreset(name) {
        const cx = width / 2, cy = height / 2;
        switch (name) {
            case 'water':
                // 4 O + 8 H -> should settle into 4 water molecules.
                spawnCluster(['O', 'O', 'O', 'O', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'], cx, cy, 220);
                break;
            case 'combustion':
                // Methane + oxygen — crank the heat and watch it rearrange.
                spawnCluster(['C', 'H', 'H', 'H', 'H'], cx - 160, cy, 90);
                spawnCluster(['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'], cx + 120, cy, 200);
                break;
            case 'salt':
                spawnCluster(['Na', 'Na', 'Na', 'Na', 'Cl', 'Cl', 'Cl', 'Cl'], cx, cy, 220);
                break;
            case 'ammonia':
                spawnCluster(['N', 'N', 'H', 'H', 'H', 'H', 'H', 'H'], cx, cy, 200);
                break;
            case 'gases':
                spawnCluster(['H', 'H', 'O', 'O', 'N', 'N', 'Cl', 'Cl'], cx, cy, 260);
                break;
        }
    }
}

/* ------------------------------------------------------------------ */
/* Live molecule legend                                               */
/* ------------------------------------------------------------------ */

function renderLegend(tally, atomCount) {
    const list = document.getElementById('legendList');
    const countEl = document.getElementById('atomCount');
    if (countEl) countEl.textContent = atomCount;
    if (!list) return;

    if (tally.size === 0) {
        list.innerHTML = '<li class="legend-empty">No molecules yet — atoms are drifting free.</li>';
        return;
    }

    // Sort by count desc, then formula.
    const rows = [...tally.values()].sort((a, b) => b.n - a.n || (a.formula < b.formula ? -1 : 1));
    list.innerHTML = rows.map(({ formula, name, n }) => {
        return `<li>
            <span class="legend-formula">${formatFormula(formula)}</span>
            <span class="legend-name">${name}</span>
            <span class="legend-count">×${n}</span>
        </li>`;
    }).join('');
}

function formatFormula(f) {
    // Subscript the digits: H2O -> H<sub>2</sub>O
    return f.replace(/(\d+)/g, '<sub>$1</sub>');
}

/* ------------------------------------------------------------------ */
/* Control panel wiring                                               */
/* ------------------------------------------------------------------ */

function initControlPanel() {
    // Element picker buttons
    document.querySelectorAll('[data-element]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-element]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MOL.setElement(btn.dataset.element);
        });
    });

    // Temperature slider
    const temp = document.getElementById('tempSlider');
    const tempVal = document.getElementById('tempValue');
    if (temp) {
        temp.addEventListener('input', () => {
            const t = parseFloat(temp.value);
            MOL.setTemperature(t);
            if (tempVal) tempVal.textContent = describeTemp(t);
        });
    }

    // Presets
    document.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', () => MOL.preset(btn.dataset.preset));
    });

    // Toggles / actions
    wireToggle('pauseBtn', () => {
        const paused = MOL.togglePause();
        setPressed('pauseBtn', paused);
        document.getElementById('pauseBtn').title = paused ? 'Resume' : 'Pause';
    });
    wireToggle('bondingBtn', () => setPressed('bondingBtn', MOL.toggleBonding(), true));
    wireToggle('labelsBtn', () => setPressed('labelsBtn', MOL.toggleLabels(), true));
    wireToggle('dragBtn', () => {
        const mode = MOL.getSpawnMode() === 'drag' ? 'atom' : 'drag';
        MOL.setSpawnMode(mode);
        setPressed('dragBtn', mode === 'drag');
    });
    wireClick('breakBtn', () => MOL.breakAllBonds());
    wireClick('clearBtn', () => MOL.clear());

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const panel = document.querySelector('.control-panel');
    if (menuToggle && panel) {
        menuToggle.addEventListener('click', () => panel.classList.toggle('open'));
    }

    // default state reflected in UI
    setPressed('bondingBtn', true, true);
    setPressed('labelsBtn', true, true);
}

function wireToggle(id, fn) { wireClick(id, fn); }
function wireClick(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
}
function setPressed(id, on, active) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (active !== undefined) el.classList.toggle('active', on);
    else el.classList.toggle('active', on);
}

function describeTemp(t) {
    if (t < 0.15) return 'Frozen';
    if (t < 0.5) return 'Cool';
    if (t < 0.9) return 'Warm';
    if (t < 1.2) return 'Hot';
    return 'Plasma';
}

/* ------------------------------------------------------------------ */
/* Small color utilities                                              */
/* ------------------------------------------------------------------ */

function hexA(hex, a) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function lighten(hex, amt) {
    const { r, g, b } = hexToRgb(hex);
    const lr = Math.round(r + (255 - r) * amt);
    const lg = Math.round(g + (255 - g) * amt);
    const lb = Math.round(b + (255 - b) * amt);
    return `rgb(${lr}, ${lg}, ${lb})`;
}
function pickTextColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    // relative luminance
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? 'rgba(10,14,22,0.85)' : 'rgba(255,255,255,0.92)';
}
function hexToRgb(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
