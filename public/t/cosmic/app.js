document.addEventListener('DOMContentLoaded', () => {
    // Set Current Year in Footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile Menu Toggle Logic
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuLinks = mobileMenu.querySelectorAll('a');

    const toggleMenu = () => {
        const isOpen = document.body.classList.contains('menu-open');
        if (isOpen) {
            document.body.classList.remove('menu-open');
            mobileMenu.classList.remove('active');
            // Re-enable scrolling
            document.body.style.overflow = '';
        } else {
            document.body.classList.add('menu-open');
            mobileMenu.classList.add('active');
            // Disable scrolling
            document.body.style.overflow = 'hidden';
        }
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (document.body.classList.contains('menu-open')) {
                toggleMenu();
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('visible');
                }
                if (entry.target.classList.contains('reveal')) {
                    entry.target.classList.add('active');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial animations trigger for hero
    document.querySelectorAll('.fade-in, .reveal').forEach(el => {
        observer.observe(el);
    });

    // Service Card Logic
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        const header = card.querySelector('.card-header');
        
        // 1. Specular Mouse Glare
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });

        // 2. Expansion Logic
        if (header) {
            header.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');
                
                // Close all other cards
                serviceCards.forEach(c => c.classList.remove('expanded'));
                
                // If the clicked card wasn't expanded, expand it
                if (!isExpanded) {
                    card.classList.add('expanded');
                }
            });
        }
    });

    // CTA email link — no form handler needed, mailto: triggers native email client

    // Scroll Effects for Navigation
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Initialize notepad and advanced animations on load
    initNotepad();
    if (typeof gsap !== 'undefined' && typeof lottie !== 'undefined') {
        initAdvancedAnimations();
    }
});

// =============================================
// Advanced Animations (GSAP, Canvas, Lottie)
// =============================================
function initAdvancedAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    const servicesSection = document.getElementById('services');
    const contactSection = document.getElementById('contact');

    // 1. Digital Circuit Lines (Trigger CSS Keyframes)
    if (servicesSection) {
        ScrollTrigger.create({
            trigger: servicesSection,
            start: 'top 60%',
            onEnter: () => {
                document.querySelectorAll('.circuit-line').forEach(el => el.classList.add('active'));
            }
        });
    }

    // 2. Dynamic Trailing Laser SVG
    const blueprintContainer = document.getElementById('blueprintContainer');
    const svg = document.getElementById('blueprintSvg');
    const cards = gsap.utils.toArray('.service-card');
    const terminal = document.querySelector('.cta-terminal');
       if (svg && cards.length && terminal) {
        let powerPath;
        let laserAnim;
        
        function drawDynamicLine() {
            svg.innerHTML = '';
            
            powerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            powerPath.classList.add('dynamic-power-path');
            
            const mainRect = document.querySelector('main').getBoundingClientRect();
            
            const getRelativeCenter = (el) => {
                const rect = el.getBoundingClientRect();
                return {
                    x: rect.left + rect.width / 2 - mainRect.left,
                    y: rect.top + rect.height / 2 - mainRect.top
                };
            };
            
            // Start the laser from the bottom of the ground symbol
            const groundSymbol = document.querySelector('.ground-symbol');
            let currentX, currentY;
            if (groundSymbol) {
                const gsRect = groundSymbol.getBoundingClientRect();
                currentX = gsRect.left + gsRect.width / 2 - mainRect.left;
                currentY = gsRect.top + gsRect.height - mainRect.top;
            } else {
                const gridCoords = document.querySelector('.services-grid').getBoundingClientRect();
                currentX = mainRect.width / 2;
                currentY = gridCoords.top - mainRect.top - 40;
            }
            
            let d = `M ${currentX} ${currentY} `;
            
            let cumulativeLength = 0;
            const triggerPoints = [];
            
            // Snake through each card
            cards.forEach((card) => {
                const pt = getRelativeCenter(card.querySelector('.card-header'));
                d += `L ${pt.x} ${pt.y} `;
                
                // Track mathematically exactly how far down the path this card resides
                const segmentLength = Math.sqrt(Math.pow(pt.x - currentX, 2) + Math.pow(pt.y - currentY, 2));
                cumulativeLength += segmentLength;
                
                triggerPoints.push({
                    card: card,
                    triggerLength: cumulativeLength
                });
                
                currentX = pt.x;
                currentY = pt.y;
            });
            
            // Connect the final trailing segment into the CTA terminal matrix
            const targetPt = getRelativeCenter(terminal);
            d += `L ${targetPt.x} ${targetPt.y}`;
            const finalSegmentLength = Math.sqrt(Math.pow(targetPt.x - currentX, 2) + Math.pow(targetPt.y - currentY, 2));
            cumulativeLength += finalSegmentLength;
            const terminalTriggerLength = cumulativeLength;
            
            powerPath.setAttribute('d', d);
            svg.appendChild(powerPath);
            
            // Enforce draw logic
            const length = powerPath.getTotalLength();
            powerPath.style.strokeDasharray = length;
            powerPath.style.strokeDashoffset = length;
            
            if (laserAnim) laserAnim.kill();
            
            // Map the SVG rendering to scroll
            laserAnim = gsap.to(powerPath, {
                strokeDashoffset: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#services',
                    start: 'top 50%',
                    endTrigger: '#contact',
                    end: 'center center',
                    scrub: 1,
                    onUpdate: (self) => {
                        // Dynamically calculate exactly how many pixels of the laser are currently visible
                        const currentDrawLength = self.progress * length;
                        
                        // Fire the glows strictly when the laser beam passes the card's center coordinate!
                        triggerPoints.forEach(point => {
                            if (currentDrawLength >= point.triggerLength - 30) {
                                point.card.classList.add('powered');
                            } else {
                                point.card.classList.remove('powered');
                            }
                        });
                        
                        // Trigger the terminal
                        if (currentDrawLength >= terminalTriggerLength - 30) {
                            terminal.classList.add('powered');
                        } else {
                            terminal.classList.remove('powered');
                        }
                    }
                }
            });
        }
        
        drawDynamicLine();
        window.addEventListener('resize', () => { setTimeout(drawDynamicLine, 100); });
    } 

    // 3. Lottie Framework
    const lottieContainer = document.getElementById('lottieContainer');
    if (lottieContainer) {
        const anim = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'data-animation.json'
        });

        anim.addEventListener('DOMLoaded', () => {
            if (contactSection) {
                ScrollTrigger.create({
                    trigger: contactSection,
                    start: 'top 80%',
                    end: 'bottom center',
                    scrub: true,
                    onUpdate: self => {
                        anim.goToAndStop(self.progress * (anim.totalFrames - 1), true);
                    }
                });
            }
        });
    }

    // 5. HTML5 Canvas Particle System (Server Rack assembly on scroll)
    initCanvasParticles();
}

function initCanvasParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];
    let flashes = []; // Visual effect flashes
    const numParticles = 300; // Increased to accommodate Saturn's rings
    const SYSTEM_EDGE_PADDING = 18;
    const SUN_HIT_RADIUS = 34;
    const SCATTER_RADIUS = 180;
    const SCATTER_FORCE = 5.2; // Slightly buffed for better destruction potential
    const SUN_GRAVITY = 290;
    const SUN_GRAVITY_SOFTENING = 26;
    const PLANET_GRAVITY_SCALE = 8.5;
    const PLANET_GRAVITY_SOFTENING = 8;
    const GRAVITY_ANCHOR_FORCE = 950; // Massively buffed
    const GRAVITY_ANCHOR_MAX_FORCE = 0.32; // Massively buffed
    const GRAVITY_ANCHOR_SOFTENING = 58;
    const NUMERICAL_DAMPING = 1;
    const POSITION_NOISE = 0;
    const IGNORE_TARGETS = 'button, a, input, textarea, select, label, .theme-btn, .floating-notepad, .glass-nav, #mobileMenu';
    const CARD_TARGETS = '.service-card, .hero-card, .cta-terminal, .learn-card, .floating-notepad, .glass-nav, #mobileMenu';
    canvas.width = width;
    canvas.height = height;

    // Solar System Data Model (Compressed for better focal point)
    const planetManifest = [
        { name: 'Mercury', dist: 30,  speed: 0.045, size: 2.0, color: '#A5A5A5', moons: 0 },
        { name: 'Venus',   dist: 50,  speed: 0.035, size: 3.5, color: '#E3BB76', moons: 0 },
        { name: 'Earth',   dist: 75,  speed: 0.025, size: 3.8, color: '#2271B3', moons: 1 },
        { name: 'Mars',    dist: 105, speed: 0.018, size: 3.0, color: '#E27B58', moons: 2 },
        { name: 'Jupiter', dist: 145, speed: 0.012, size: 8.0, color: '#D39C7E', moons: 4 },
        { name: 'Saturn',  dist: 190, speed: 0.009, size: 6.8, color: '#C5AB6E', moons: 4, hasRings: true },
        { name: 'Uranus',  dist: 235, speed: 0.006, size: 4.8, color: '#B5E3E3', moons: 2 },
        { name: 'Neptune', dist: 280, speed: 0.005, size: 4.6, color: '#4b70dd', moons: 1 }
    ];
    const asteroidFields = [
        {
            name: 'inner-scattered',
            weight: 0.16,
            min: 118,
            max: 150,
            speed: 0.013,
            flatten: 0.9,
            radialJitter: 8,
            verticalJitter: 8,
            palette: ['#c5c0b8', '#8f857a', '#d1c1ac']
        },
        {
            name: 'main-belt',
            weight: 0.52,
            min: 168,
            max: 228,
            speed: 0.009,
            flatten: 0.74,
            radialJitter: 14,
            verticalJitter: 7,
            palette: ['#d4cab9', '#91836e', '#b7a68b', '#8a8f96']
        },
        {
            name: 'outer-scattered',
            weight: 0.12,
            min: 238,
            max: 286,
            speed: 0.0068,
            flatten: 0.82,
            radialJitter: 20,
            verticalJitter: 12,
            palette: ['#c9d6df', '#8ba4b8', '#c2c8d6']
        },
        {
            name: 'kuiper',
            weight: 0.2,
            min: 316,
            max: 382,
            speed: 0.0045,
            flatten: 0.68,
            radialJitter: 26,
            verticalJitter: 12,
            palette: ['#b7d8ea', '#92a7c6', '#dce7f2']
        }
    ];

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function pickWeightedField() {
        const totalWeight = asteroidFields.reduce((sum, field) => sum + field.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const field of asteroidFields) {
            roll -= field.weight;
            if (roll <= 0) return field;
        }

        return asteroidFields[asteroidFields.length - 1];
    }

    class Particle {
        constructor(id, role = 'asteroid', parent = null) {
            this.id = id;
            this.role = role;
            this.parent = parent; // For moons, parent is the planet particle
            this.createdAt = Date.now();
            
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            
            // Physics / Timing
            this.angle = Math.random() * Math.PI * 2;
            this.moonAngle = Math.random() * Math.PI * 2;
            
            // Re-using the explosion timers
            this.explosionRevertTimer = 0;
            this.packedTicks = 0;

            // Individual planet/moon traits
            this.baseOrbitDist = 0;
            this.orbitDist = 0;
            this.orbitSpeed = 0;
            this.baseSize = 1 + Math.random() * 2;
            this.size = this.baseSize;
            this.color = '#ffffff'; // Default
            this.field = null;
            this.fieldFlatten = 1;
            this.radialJitter = 0;
            this.verticalJitter = 0;
            this.mass = 1;
            this.gravParam = 0;
            this.orbitDirection = 1;
            this.inertia = 1;
            this.scatterResponse = 1;
            this.tiltPhase = Math.random() * Math.PI * 2;
            this.inclinationPhase = Math.random() * Math.PI * 2;
            this.bandDrift = 0.2 + Math.random() * 0.6;
            this.baseSpeed = 0.5 + Math.random() * 0.5;

            if (this.role === 'asteroid') {
                this.field = pickWeightedField();
                this.baseOrbitDist = randomRange(this.field.min, this.field.max);
                this.orbitDist = this.baseOrbitDist;
                this.orbitSpeed = this.field.speed * (0.88 + Math.random() * 0.28) * (Math.random() > 0.06 ? 1 : -1);
                this.baseSize = 0.7 + Math.random() * 1.6;
                this.size = this.baseSize;
                this.color = this.field.palette[Math.floor(Math.random() * this.field.palette.length)];
                this.fieldFlatten = this.field.flatten;
                this.radialJitter = randomRange(2, this.field.radialJitter);
                this.verticalJitter = randomRange(1, this.field.verticalJitter);
                this.orbitDirection = Math.sign(this.orbitSpeed) || 1;
                this.mass = 0.5 + this.baseSize * 0.35;
                this.inertia = 0.9 + this.baseSize * 0.16;
                this.scatterResponse = 1.08;
            }
        }

        initAsPlanet(data) {
            this.name = data.name;
            this.baseOrbitDist = data.dist;
            this.orbitDist = this.baseOrbitDist;
            this.orbitSpeed = data.speed;
            this.baseSize = data.size;
            this.size = this.baseSize;
            this.color = data.color;
            this.orbitDirection = Math.sign(this.orbitSpeed) || 1;
            this.mass = 1.4 + data.size * 0.8;
            this.gravParam = PLANET_GRAVITY_SCALE * data.size * data.size;
            this.inertia = 1.45 + data.size * 0.26;
            this.scatterResponse = 0.58;
        }

        initAsMoon(parent) {
            this.baseOrbitDist = 8 + Math.random() * 8; // Moon distance from planet
            this.orbitDist = this.baseOrbitDist;
            this.orbitSpeed = 0.08 + Math.random() * 0.12; 
            this.baseSize = Math.max(1.2, parent.baseSize * 0.35);
            this.size = this.baseSize;
            this.color = '#e0e0e0';
            this.orbitDirection = Math.sign(this.orbitSpeed) || 1;
            this.mass = 0.6 + this.baseSize * 0.45;
            this.inertia = 1.05 + this.baseSize * 0.28;
            this.scatterResponse = 0.82;
        }

        initAsRing(parent) {
            const innerRadius = parent.baseSize * 1.5;
            const outerRadius = parent.baseSize * 2.8;
            this.baseOrbitDist = randomRange(innerRadius, outerRadius);
            this.orbitDist = this.baseOrbitDist;
            this.orbitSpeed = 0.12 + Math.random() * 0.04;
            this.baseSize = 0.4 + Math.random() * 0.8;
            this.size = this.baseSize;
            
            // Subtly vary ring rock colors based on parent color
            const hue = Math.floor(Math.random() * 2) > 0 ? 35 : 45; // Sandy/Dusty tones
            this.color = `hsl(${hue}, 15%, ${50 + Math.random() * 30}%)`;
            
            this.orbitDirection = Math.sign(parent.orbitSpeed) || 1;
            this.mass = 0.1 + this.baseSize * 0.1;
            this.inertia = 0.5;
            this.scatterResponse = 1.1;
        }
    }

    class Flash {
        constructor(x, y, radius, color = '#ffffff', decay = 0.032, alphaScale = 1.0) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.life = 1.0;
            this.decay = decay;
            this.alphaScale = alphaScale;
        }
        update(dt) {
            this.life -= this.decay * dt;
        }
        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.pow(this.life, 1.5) * this.alphaScale;
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, this.color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function getAsteroidTarget(particle, centerX, centerY, time = Date.now()) {
        const bandRadius = particle.orbitDist + Math.sin(time / 2600 + particle.tiltPhase) * particle.radialJitter;
        const ellipseRadiusY = bandRadius * particle.fieldFlatten;
        const inclinationOffset = Math.sin(time / 2300 + particle.inclinationPhase) * particle.verticalJitter;

        return {
            x: centerX + Math.cos(particle.angle) * bandRadius,
            y: centerY + Math.sin(particle.angle) * ellipseRadiusY + inclinationOffset
        };
    }

    function getOrbitTangent(x, y, direction = 1) {
        const length = Math.hypot(x, y) || 1;
        return {
            x: (-y / length) * direction,
            y: (x / length) * direction
        };
    }

    function getCircularOrbitSpeed(gravParam, radius, softening = 0) {
        const radiusSq = radius * radius;
        const softenedRadiusSq = radiusSq + softening * softening;
        const numerator = Math.max(0, gravParam) * radiusSq;
        const denominator = Math.max(1, Math.pow(softenedRadiusSq, 1.5));
        return Math.sqrt(numerator / denominator);
    }

    function applyGravityToParticle(particle, sourceX, sourceY, gravParam, softening, dt = 1) {
        const dx = sourceX - particle.x;
        const dy = sourceY - particle.y;
        const distSq = dx * dx + dy * dy + softening * softening;
        const dist = Math.sqrt(distSq);
        const accel = gravParam / distSq;

        particle.vx += (dx / dist) * accel * dt;
        particle.vy += (dy / dist) * accel * dt;
    }

    // Population
    let pIdx = 0;
    // 1. Create Planets
    planetManifest.forEach(pData => {
        const p = new Particle(pIdx++, 'planet');
        p.initAsPlanet(pData);
        particles.push(p);

        // 2. Add Moons for this planet
        for (let m = 0; m < pData.moons; m++) {
            const moon = new Particle(pIdx++, 'moon', p);
            moon.initAsMoon(p);
            particles.push(moon);
        }

        // 3. Add Rings if applicable
        if (pData.hasRings) {
            const numRingParticles = 80;
            for (let r = 0; r < numRingParticles; r++) {
                const ringPart = new Particle(pIdx++, 'ring', p);
                ringPart.initAsRing(p);
                particles.push(ringPart);
            }
        }
    });

    // 4. Fill the rest as asteroids/stars
    while (particles.length < numParticles) {
        particles.push(new Particle(pIdx++));
    }

    let orbitScale = 1;
    let maxSystemRadius = 0;
    let sunGlowRadius = 24;
    let particlesSeeded = false;
    let clickMode = 'scatter';
    const timeScales = [0.1, 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0];
    let timeScaleIndex = 1; // Starts at 0.25 (index 1) for a very slow, stable introduction
    let timeScale = timeScales[timeScaleIndex];
    let physicsAccumulator = 0;
    
    window.adjustTimeScale = (direction) => {
        timeScaleIndex = Math.max(0, Math.min(timeScales.length - 1, timeScaleIndex + direction));
        timeScale = timeScales[timeScaleIndex];
    };
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, isOverCard: false };
    const systemCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2, isPinned: true, vx: 0, vy: 0, mass: 10000, size: 20 };
    let customSunsPinned = false;
    let isVfxEnabled = false;
    const gravityAnchor = { x: width / 2, y: height / 2, active: false };
    const blackHole = { x: width / 2, y: height / 2, active: false };
    let isPlanetaryGravityEnabled = false;
    let dragState = {
        active: false,
        pointerId: null,
        target: null, // Refers to systemCenter or a Particle
        moved: false,
        startX: 0,
        startY: 0,
        startedPinned: false
    };
    const tapState = {
        pointerId: null,
        startX: 0,
        startY: 0,
        ignored: false
    };
    let resetCooldownUntil = 0;

    function clamp(value, min, max, fallback) {
        if (min > max) return fallback;
        return Math.min(max, Math.max(min, value));
    }

    function isIgnoredTarget(target) {
        return !!(target && target.closest(IGNORE_TARGETS));
    }

    function getTargetAt(x, y, fallbackTarget = null) {
        return document.elementFromPoint(x, y) || fallbackTarget;
    }

    function getPointerDistance(x1, y1, x2, y2) {
        return Math.hypot(x1 - x2, y1 - y2);
    }

    function measureSystemRadius(useScaledValues = false) {
        return particles.reduce((furthest, particle) => {
            const orbitDistance = useScaledValues ? particle.orbitDist : particle.baseOrbitDist;
            const parentOrbitDistance = particle.role === 'moon' && particle.parent
                ? (useScaledValues ? particle.parent.orbitDist : particle.parent.baseOrbitDist)
                : 0;
            const particleSize = useScaledValues ? particle.size : particle.baseSize;
            const glowPadding = particle.role === 'planet' ? 30 : (particle.role === 'moon' ? 20 : 10);
            return Math.max(furthest, parentOrbitDistance + orbitDistance + particleSize + glowPadding);
        }, SUN_HIT_RADIUS);
    }

    function applyOrbitScale() {
        const baseRadius = measureSystemRadius(false);
        const availableRadius = Math.max(24, (Math.min(width, height) / 2) - SYSTEM_EDGE_PADDING);
        orbitScale = Math.min(1, availableRadius / Math.max(baseRadius, 1));

        particles.forEach(particle => {
            particle.orbitDist = particle.baseOrbitDist * orbitScale;
            particle.size = Math.max(
                particle.role === 'asteroid' ? 0.8 : 1.2,
                particle.baseSize * (0.82 + orbitScale * 0.18)
            );
        });

        maxSystemRadius = measureSystemRadius(true);
    }

    function setSystemCenter(x, y) {
        systemCenter.x = x;
        systemCenter.y = y;
        systemCenter.vx = 0;
        systemCenter.vy = 0;
    }

    function setGravityAnchor(x, y) {
        gravityAnchor.x = clamp(x, SYSTEM_EDGE_PADDING, width - SYSTEM_EDGE_PADDING, width / 2);
        gravityAnchor.y = clamp(y, SYSTEM_EDGE_PADDING, height - SYSTEM_EDGE_PADDING, height / 2);
        gravityAnchor.active = true;
    }

    function syncParticleClickModeButton() {
        const modeBtn = document.getElementById('particleClickModeBtn');
        if (!modeBtn) return;

        const isGravityMode = clickMode === 'gravity' || gravityAnchor.active;
        modeBtn.classList.toggle('active', isGravityMode);
        modeBtn.setAttribute('aria-pressed', isGravityMode ? 'true' : 'false');
        modeBtn.title = `Click mode: gravity pull`;
        modeBtn.setAttribute('aria-label', modeBtn.title);

        const modeText = modeBtn.querySelector('.mode-text');
        if (modeText) {
            modeText.textContent = 'PULL';
        }
    }

    function deactivateAllModes() {
        const modeButtons = [
            'particleClickModeBtn', 
            'blackHoleModeBtn', 
            'addPlanetModeBtn', 
            'addSunModeBtn', 
            'asteroidToggleBtn'
        ];
        modeButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
                if (id === 'asteroidToggleBtn') {
                    btn.title = 'Asteroid Placement: Off';
                    const iconSlot = document.getElementById('asteroidIconSlot');
                    if (iconSlot) iconSlot.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="currentColor" opacity="0.3"/></svg>`;
                }
            }
        });
        gravityAnchor.active = false;
        blackHole.active = false;
    }

    function toggleClickMode() {
        const btn = document.getElementById('particleClickModeBtn');
        const isActive = btn.classList.contains('active');

        if (isActive || clickMode === 'gravity') {
            clickMode = 'scatter';
            deactivateAllModes();
        } else {
            deactivateAllModes();
            clickMode = 'gravity';
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
        syncParticleClickModeButton();
    }

    window.toggleParticleClickMode = toggleClickMode;

    function toggleBlackHoleMode() {
        const btn = document.getElementById('blackHoleModeBtn');
        const isActive = btn.classList.contains('active');

        if (isActive) {
            deactivateAllModes();
            clickMode = 'scatter';
        } else {
            deactivateAllModes();
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            clickMode = 'blackhole';
        }
        syncParticleClickModeButton();
    }
    window.toggleBlackHoleMode = toggleBlackHoleMode;

    function toggleAddPlanetMode() {
        const btn = document.getElementById('addPlanetModeBtn');
        const isActive = btn.classList.contains('active');

        if (isActive) {
            deactivateAllModes();
            clickMode = 'scatter';
        } else {
            deactivateAllModes();
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            clickMode = 'addPlanet';
        }
        syncParticleClickModeButton();
    }
    window.toggleAddPlanetMode = toggleAddPlanetMode;

    function toggleAddSunMode() {
        const btn = document.getElementById('addSunModeBtn');
        const isActive = btn.classList.contains('active');

        if (isActive) {
            deactivateAllModes();
            clickMode = 'scatter';
        } else {
            deactivateAllModes();
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            clickMode = 'addSun';
        }
        syncParticleClickModeButton();
    }
    window.toggleAddSunMode = toggleAddSunMode;


    function toggleAsteroidMode() {
        const btn = document.getElementById('asteroidToggleBtn');
        const iconSlot = document.getElementById('asteroidIconSlot');
        
        if (clickMode === 'addAsteroid') {
            // Switch to Field
            clickMode = 'addAsteroidField';
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            btn.title = 'Asteroid Placement: Field';
            iconSlot.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="6" cy="6" r="1.5" fill="currentColor"/><circle cx="18" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="16" r="2" fill="currentColor"/><circle cx="19" cy="18" r="1.2" fill="currentColor"/><circle cx="5" cy="18" r="0.8" fill="currentColor"/></svg>`;
        } else if (clickMode === 'addAsteroidField') {
            // Switch to Off
            deactivateAllModes();
            clickMode = 'scatter';
        } else {
            // Switch to Single
            deactivateAllModes();
            clickMode = 'addAsteroid';
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            btn.title = 'Asteroid Placement: Single Large';
            iconSlot.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="currentColor"/></svg>`;
        }
        syncParticleClickModeButton();
    }
    window.toggleAsteroidMode = toggleAsteroidMode;

    function togglePlanetGravity() {
        isPlanetaryGravityEnabled = !isPlanetaryGravityEnabled;
        const btn = document.getElementById('togglePlanetGravityBtn');
        if (isPlanetaryGravityEnabled) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            btn.title = 'Planet Gravity Affects Asteroids: Enabled';
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            btn.title = 'Planet Gravity Affects Asteroids: Disabled';
        }
        btn.setAttribute('aria-label', btn.title);
    }
    window.togglePlanetGravity = togglePlanetGravity;

    function toggleMainSunAnchor() {
        systemCenter.isPinned = !systemCenter.isPinned;
        const btn = document.getElementById('toggleMainSunAnchorBtn');
        if (systemCenter.isPinned) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            systemCenter.vx = 0;
            systemCenter.vy = 0;
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    }
    window.toggleMainSunAnchor = toggleMainSunAnchor;

    function toggleCustomSunsAnchor() {
        customSunsPinned = !customSunsPinned;
        const btn = document.getElementById('toggleCustomSunsAnchorBtn');
        
        if (customSunsPinned) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }

        // Apply to all existing suns
        particles.forEach(p => {
            if (p.role === 'sun') {
                p.isPinned = customSunsPinned;
                if (customSunsPinned) {
                    p.vx = 0;
                    p.vy = 0;
                }
            }
        });
    }
    window.toggleCustomSunsAnchor = toggleCustomSunsAnchor;

    function toggleVfx() {
        isVfxEnabled = !isVfxEnabled;
        const btn = document.getElementById('toggleVfxBtn');
        if (isVfxEnabled) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    }
    window.toggleVfx = toggleVfx;

    let scatterMode = 'none'; // 'normal', 'large', 'none'
    function toggleLargeScatter() {
        const btn = document.getElementById('largeScatterBtn');
        
        if (scatterMode === 'normal') {
            scatterMode = 'large';
            btn.classList.add('active');
            btn.classList.remove('disabled');
            btn.setAttribute('aria-pressed', 'true');
            btn.title = 'Scatter Size: Large';
        } else if (scatterMode === 'large') {
            scatterMode = 'none';
            btn.classList.remove('active');
            btn.classList.add('disabled');
            btn.setAttribute('aria-pressed', 'false');
            btn.title = 'Scatter: Disabled';
        } else {
            scatterMode = 'normal';
            btn.classList.remove('active');
            btn.classList.remove('disabled');
            btn.setAttribute('aria-pressed', 'false');
            btn.title = 'Scatter Size: Normal (Small)';
        }
        btn.setAttribute('aria-label', btn.title);
    }
    window.toggleLargeScatter = toggleLargeScatter;

    let isImpactEnabled = false;
    function toggleImpactEffects() {
        const btn = document.getElementById('impactModeBtn');
        isImpactEnabled = !isImpactEnabled;
        
        if (isImpactEnabled) {
            btn.classList.add('active');
            btn.classList.remove('disabled');
            btn.setAttribute('aria-pressed', 'true');
            btn.title = 'Impact Effects: Enabled';
        } else {
            btn.classList.remove('active');
            btn.classList.add('disabled');
            btn.setAttribute('aria-pressed', 'false');
            btn.title = 'Impact Effects: Disabled';
        }
        btn.setAttribute('aria-label', btn.title);
    }
    window.toggleImpactEffects = toggleImpactEffects;

    function resetSolarSystem() {
        resetCooldownUntil = Date.now() + 1000; // 1 second delay
        setSystemCenter(window.innerWidth / 2, window.innerHeight / 2);
        systemCenter.isPinned = true;
        clickMode = 'scatter';
        gravityAnchor.active = false;
        seedParticlePositions();
        syncParticleClickModeButton();

        // Reset modes
        blackHole.active = false;
        const bhBtn = document.getElementById('blackHoleModeBtn');
        if (bhBtn) bhBtn.classList.remove('active'), bhBtn.setAttribute('aria-pressed', 'false');
        
        const apBtn = document.getElementById('addPlanetModeBtn');
        if (apBtn) apBtn.classList.remove('active'), apBtn.setAttribute('aria-pressed', 'false');

        const sBtn = document.getElementById('addSunModeBtn');
        if (sBtn) sBtn.classList.remove('active'), sBtn.setAttribute('aria-pressed', 'false');
    }
    window.resetSolarSystem = resetSolarSystem;
    
    function resetToOriginalSystem() {
        resetCooldownUntil = Date.now() + 1000;
        
        // 1. Fully Clear and Reset System
        particles = [];
        pIdx = 0;
        setSystemCenter(window.innerWidth / 2, window.innerHeight / 2);
        systemCenter.isPinned = true;
        systemCenter.vx = 0;
        systemCenter.vy = 0;
        systemCenter.dead = false;
        
        // 2. Re-create Original Planets and Moons
        planetManifest.forEach(pData => {
            const p = new Particle(pIdx++, 'planet');
            p.initAsPlanet(pData);
            particles.push(p);

            for (let m = 0; m < pData.moons; m++) {
                const moon = new Particle(pIdx++, 'moon', p);
                moon.initAsMoon(p);
                particles.push(moon);
            }

            if (pData.hasRings) {
                for (let r = 0; r < 80; r++) {
                    const rp = new Particle(pIdx++, 'ring', p);
                    rp.initAsRing(p);
                    particles.push(rp);
                }
            }
        });

        // 3. Re-fill with original asteroid density
        while (particles.length < numParticles) {
            particles.push(new Particle(pIdx++));
        }
        
        // 4. Initial Layout and Mode Cleanup
        seedParticlePositions();
        deactivateAllModes();
        clickMode = 'scatter';
        syncParticleClickModeButton();
        applyOrbitScale();
    }
    window.resetToOriginalSystem = resetToOriginalSystem;
    
    function resetToSunsAndPlanets() {
        resetCooldownUntil = Date.now() + 1000;
        
        // 1. Fully Clear System
        particles = [];
        pIdx = 0;
        setSystemCenter(window.innerWidth / 2, window.innerHeight / 2);
        systemCenter.isPinned = true;
        systemCenter.vx = 0;
        systemCenter.vy = 0;
        systemCenter.dead = false;
        
        // 2. Re-create Original Planets and Moons Only
        planetManifest.forEach(pData => {
            const p = new Particle(pIdx++, 'planet');
            p.initAsPlanet(pData);
            particles.push(p);

            for (let m = 0; m < pData.moons; m++) {
                const moon = new Particle(pIdx++, 'moon', p);
                moon.initAsMoon(p);
                particles.push(moon);
            }

            if (pData.hasRings) {
                for (let r = 0; r < 80; r++) {
                    const rp = new Particle(pIdx++, 'ring', p);
                    rp.initAsRing(p);
                    particles.push(rp);
                }
            }
        });

        // 3. Layout and Cleanup
        seedParticlePositions();
        deactivateAllModes();
        clickMode = 'scatter';
        syncParticleClickModeButton();
        applyOrbitScale();
    }
    window.resetToSunsAndPlanets = resetToSunsAndPlanets;

    function seedParticlePositions() {
        particles.forEach(particle => {
            if (particle.role === 'planet') {
                particle.x = systemCenter.x + Math.cos(particle.angle) * particle.orbitDist;
                particle.y = systemCenter.y + Math.sin(particle.angle) * particle.orbitDist;
                const orbitalX = particle.x - systemCenter.x;
                const orbitalY = particle.y - systemCenter.y;
                const orbitalRadius = Math.hypot(orbitalX, orbitalY);
                const tangent = getOrbitTangent(orbitalX, orbitalY, particle.orbitDirection);
                const orbitalSpeed = getCircularOrbitSpeed(SUN_GRAVITY, orbitalRadius, SUN_GRAVITY_SOFTENING) * 0.995;
                particle.vx = tangent.x * orbitalSpeed;
                particle.vy = tangent.y * orbitalSpeed;
                return;
            }

            if (particle.role === 'moon' || particle.role === 'ring') {
                const parent = particle.parent;
                const phase = particle.role === 'ring' ? 1 : 2; // Tighter distribution for rings
                particle.x = parent.x + Math.cos(particle.angle * phase) * particle.orbitDist;
                particle.y = parent.y + Math.sin(particle.angle * phase) * particle.orbitDist;
                const orbitalX = particle.x - parent.x;
                const orbitalY = particle.y - parent.y;
                const orbitalRadius = Math.hypot(orbitalX, orbitalY);
                const tangent = getOrbitTangent(orbitalX, orbitalY, particle.orbitDirection);
                const orbitalSpeed = getCircularOrbitSpeed(parent.gravParam, orbitalRadius, PLANET_GRAVITY_SOFTENING) * 0.99;
                particle.vx = parent.vx + tangent.x * orbitalSpeed;
                particle.vy = parent.vy + tangent.y * orbitalSpeed;
                return;
            }

            const target = getAsteroidTarget(particle, systemCenter.x, systemCenter.y, 0);
            particle.x = target.x;
            particle.y = target.y;
            const orbitalX = particle.x - systemCenter.x;
            const orbitalY = particle.y - systemCenter.y;
            const orbitalRadius = Math.hypot(orbitalX, orbitalY);
            const tangent = getOrbitTangent(orbitalX, orbitalY, particle.orbitDirection);
            const orbitalSpeed = getCircularOrbitSpeed(SUN_GRAVITY, orbitalRadius, SUN_GRAVITY_SOFTENING) * randomRange(0.985, 1.015);
            particle.vx = tangent.x * orbitalSpeed + randomRange(-0.006, 0.006);
            particle.vy = tangent.y * orbitalSpeed + randomRange(-0.006, 0.006);
        });

        particlesSeeded = true;
    }

    function isInteractable(x, y) {
        return !!getDraggableTarget(x, y);
    }

    function getDraggableTarget(x, y) {
        // 1. Check Main Sun
        if (!systemCenter.dead && getPointerDistance(x, y, systemCenter.x, systemCenter.y) <= Math.max(SUN_HIT_RADIUS, (sunGlowRadius || 24) + 12)) {
            return systemCenter;
        }

        // 2. Check Black Hole
        if (blackHole.active && getPointerDistance(x, y, blackHole.x, blackHole.y) <= 30) {
            return blackHole;
        }

        // 3. Check Gravity Anchor
        if (gravityAnchor.active && getPointerDistance(x, y, gravityAnchor.x, gravityAnchor.y) <= 25) {
            return gravityAnchor;
        }

        // 4. Check Custom Suns and Planets (Prioritize larger bodies)
        for (const p of particles) {
            if ((p.role === 'sun' || p.role === 'planet') && getPointerDistance(x, y, p.x, p.y) <= (p.size * 3.5 + 15)) {
                return p;
            }
        }

        // 5. Check Moons
        for (const p of particles) {
            if (p.role === 'moon' && getPointerDistance(x, y, p.x, p.y) <= (p.size * 2.5 + 15)) {
                return p;
            }
        }

        return null;
    }

    function updateCursor(x = mouse.x, y = mouse.y) {
        if (dragState.active) {
            document.body.style.cursor = 'grabbing';
            return;
        }

        document.body.style.cursor = isInteractable(x, y) ? 'grab' : '';
    }

    function updatePointerState(x, y, target = null) {
        mouse.x = x;
        mouse.y = y;
        mouse.isOverCard = !!(target && target.closest(CARD_TARGETS));

        if (dragState.active) {
            // Dragging handles position updates
        }

        updateCursor(x, y);
    }

    function handlePointerMove(e) {
        const target = getTargetAt(e.clientX, e.clientY, e.target);
        updatePointerState(e.clientX, e.clientY, target);

        if (!dragState.active || dragState.pointerId !== e.pointerId) return;

        if (!dragState.moved && getPointerDistance(e.clientX, e.clientY, dragState.startX, dragState.startY) > 6) {
            dragState.moved = true;
        }

        // Track velocity for release momentum
        const timeNow = Date.now();
        const dt = (timeNow - (dragState.lastTime || timeNow)) / 1000;
        if (dt > 0) {
            dragState.lastVx = (e.clientX - (dragState.lastX || e.clientX)) / dt;
            dragState.lastVy = (e.clientY - (dragState.lastY || e.clientY)) / dt;
        }
        dragState.lastX = e.clientX;
        dragState.lastY = e.clientY;
        dragState.lastTime = timeNow;

        if (dragState.target === systemCenter) {
            setSystemCenter(e.clientX, e.clientY);
            systemCenter.isPinned = true;
        } else if (dragState.target) {
            dragState.target.x = e.clientX;
            dragState.target.y = e.clientY;
            dragState.target.vx = 0;
            dragState.target.vy = 0;
        }
    }

    function handlePointerDown(e) {
        if (Date.now() < resetCooldownUntil) return;

        const target = getTargetAt(e.clientX, e.clientY, e.target);
        updatePointerState(e.clientX, e.clientY, target);

        tapState.pointerId = e.pointerId;
        tapState.startX = e.clientX;
        tapState.startY = e.clientY;

        tapState.ignored = isIgnoredTarget(target);
        if (tapState.ignored) return;

        const dragTarget = getDraggableTarget(e.clientX, e.clientY);
        if (dragTarget) {
            dragState.active = true;
            dragState.target = dragTarget;
            dragState.pointerId = e.pointerId;
            dragState.moved = false;
            dragState.startX = e.clientX;
            dragState.startY = e.clientY;
            dragState.startedPinned = systemCenter.isPinned;
            dragState.lastX = e.clientX;
            dragState.lastY = e.clientY;
            dragState.lastTime = Date.now();
            dragState.lastVx = 0;
            dragState.lastVy = 0;
            
            if (dragTarget === systemCenter) {
                systemCenter.isPinned = true;
            }
            
            updateCursor(e.clientX, e.clientY);
        }
    }

    function clearTapState(pointerId) {
        if (tapState.pointerId !== pointerId) return;
        tapState.pointerId = null;
    }

    function clearDragState(pointerId = dragState.pointerId) {
        if (dragState.pointerId !== pointerId) return;
        dragState.active = false;
        dragState.pointerId = null;
        dragState.moved = false;
        dragState.target = null;
    }

    function handlePointerUp(e) {
        if (Date.now() < resetCooldownUntil) return;

        const target = getTargetAt(e.clientX, e.clientY, e.target);
        const tapMoved = tapState.pointerId === e.pointerId &&
            getPointerDistance(e.clientX, e.clientY, tapState.startX, tapState.startY) > 6;

        if (dragState.active && dragState.pointerId === e.pointerId) {
            const wasDragged = dragState.moved;
            const startedPinned = dragState.startedPinned;
            const targetObj = dragState.target;

            // Apply release velocity for momentum if it was dragged
            if (wasDragged && targetObj !== gravityAnchor && targetObj !== blackHole) {
                // Clamp velocity to prevent hyper-speed stars
                const maxV = 15;
                const vMag = Math.hypot(dragState.lastVx, dragState.lastVy);
                const scale = vMag > maxV ? maxV / vMag : 1;
                
                targetObj.vx = (dragState.lastVx || 0) * 0.1 * scale;
                targetObj.vy = (dragState.lastVy || 0) * 0.1 * scale;
            }

            clearDragState(e.pointerId);

            if (targetObj === systemCenter) {
                if (wasDragged) {
                    setSystemCenter(e.clientX, e.clientY);
                    // Unanchor main sun after it has been dragged
                    systemCenter.isPinned = false;
                }
            } else if (targetObj && targetObj.role === 'sun' && wasDragged) {
                // Unanchor custom suns once they are moved
                targetObj.isPinned = false;
            }
            
            updatePointerState(e.clientX, e.clientY, targetObj === systemCenter ? null : targetObj);
            clearTapState(e.pointerId);
            return;
        }

        if (!tapState.ignored && !tapMoved && !isInteractable(e.clientX, e.clientY) && !isIgnoredTarget(target)) {
            if (clickMode === 'gravity') {
                if (!gravityAnchor.active) {
                    setGravityAnchor(e.clientX, e.clientY);
                } else {
                    triggerExplosion(e.clientX, e.clientY);
                }
            } else if (clickMode === 'blackhole') {
                if (!blackHole.active) {
                    blackHole.x = e.clientX;
                    blackHole.y = e.clientY;
                    blackHole.active = true;
                } else {
                    triggerExplosion(e.clientX, e.clientY);
                }
            } else if (clickMode === 'addPlanet') {
                const dist = Math.hypot(e.clientX - systemCenter.x, e.clientY - systemCenter.y);
                const size = 2 + Math.random() * 6; // Random size
                const direction = Math.random() > 0.5 ? 1 : -1;
                const speed = getCircularOrbitSpeed(SUN_GRAVITY, dist, SUN_GRAVITY_SOFTENING) * orbitScale;
                const color = `hsl(${Math.random() * 360}, ${60 + Math.random() * 40}%, ${50 + Math.random() * 30}%)`;

                const p = new Particle(Date.now() + Math.random(), 'planet');
                p.x = e.clientX;
                p.y = e.clientY;
                p.angle = Math.atan2(e.clientY - systemCenter.y, e.clientX - systemCenter.x);
                
                const tangent = getOrbitTangent(e.clientX - systemCenter.x, e.clientY - systemCenter.y, direction);
                p.vx = tangent.x * speed;
                p.vy = tangent.y * speed;
                p.initAsPlanet({ dist, speed: speed * direction, size, color });

                particles.push(p);

                // Initialize random moons
                if (Math.random() > 0.5) {
                    const numMoons = Math.floor(1 + Math.random() * 3);
                    for (let i = 0; i < numMoons; i++) {
                        const moon = new Particle(Date.now() + Math.random() * 1000, 'moon', p);
                        moon.initAsMoon(p);
                        
                        const moonDist = moon.baseOrbitDist * orbitScale;
                        const moonSpeed = getCircularOrbitSpeed(p.gravParam, moonDist, PLANET_GRAVITY_SOFTENING) * orbitScale;
                        
                        const mAngle = Math.random() * Math.PI * 2;
                        moon.x = p.x + Math.cos(mAngle) * moonDist;
                        moon.y = p.y + Math.sin(mAngle) * moonDist;
                        
                        const mTan = getOrbitTangent(moon.x - p.x, moon.y - p.y, direction);
                        moon.vx = p.vx + mTan.x * Math.abs(moonSpeed);
                        moon.vy = p.vy + mTan.y * Math.abs(moonSpeed);

                        particles.push(moon);
                    }
                }

                // Initialize random asteroids/debris cloud around the new planet
                const numAsteroids = Math.floor(Math.random() * 10) + 6;
                for (let i = 0; i < numAsteroids; i++) {
                    const debris = new Particle(Date.now() + Math.random() * 5000, 'asteroid');
                    const offsetRadius = 15 + Math.random() * 40;
                    const offsetAngle = Math.random() * Math.PI * 2;
                    
                    debris.x = p.x + Math.cos(offsetAngle) * offsetRadius;
                    debris.y = p.y + Math.sin(offsetAngle) * offsetRadius;
                    debris.vx = p.vx + (Math.random() - 0.5) * 0.5;
                    debris.vy = p.vy + (Math.random() - 0.5) * 0.5;
                    
                    const dSize = 0.6 + Math.random() * 1.4;
                    debris.baseSize = dSize;
                    debris.size = dSize;
                    
                    particles.push(debris);
                }
                
                // Return to normal scatter mode so subsequent clicks scatter freely
                toggleAddPlanetMode();
            } else if (clickMode === 'addSun') {
                const dist = Math.hypot(e.clientX - systemCenter.x, e.clientY - systemCenter.y);
                const size = 5 + Math.random() * 5; 
                
                const hueChoices = [220, 45, 10, 0];
                const hue = hueChoices[Math.floor(Math.random() * hueChoices.length)];
                let sat = 80; let lum = 60;
                if (hue === 0) { sat = 0; lum = 95; } 
                else if (hue === 45) { sat = 90; lum = 70; } 
                else if (hue === 220) { sat = 90; lum = 75; } 
                const color = `hsl(${hue}, ${sat}%, ${lum}%)`;
                
                const sunP = new Particle(Date.now() + Math.random() * 100, 'sun');
                sunP.x = e.clientX;
                sunP.y = e.clientY;
                sunP.isPinned = customSunsPinned; // Use global toggle state
                
                const speed = getCircularOrbitSpeed(SUN_GRAVITY, dist, SUN_GRAVITY_SOFTENING) * 0.95;
                const tangent = getOrbitTangent(sunP.x - systemCenter.x, sunP.y - systemCenter.y, Math.random() > 0.5 ? 1 : -1);

                if (sunP.isPinned) {
                    sunP.vx = 0;
                    sunP.vy = 0;
                } else {
                    sunP.vx = tangent.x * speed;
                    sunP.vy = tangent.y * speed;
                }
                
                sunP.baseOrbitDist = dist;
                sunP.orbitDist = dist;
                sunP.orbitSpeed = sunP.isPinned ? 0 : speed;
                sunP.baseSize = size;
                sunP.size = size;
                sunP.color = color;
                
                sunP.mass = 200 + size * 40; 
                sunP.gravParam = SUN_GRAVITY * (0.8 + Math.random() * 1.5);
                sunP.inertia = 400; 
                sunP.scatterResponse = 0.05;
                particles.push(sunP);

                const numPlanets = 1 + Math.floor(Math.random() * 2);
                for (let i = 0; i < numPlanets; i++) {
                    const pDist = 40 + Math.random() * 60;
                    const pSize = 2 + Math.random() * 4;
                    const pSpeed = getCircularOrbitSpeed(sunP.gravParam, pDist, PLANET_GRAVITY_SOFTENING);
                    const planet = new Particle(Date.now() + Math.random() * 50, 'planet', sunP);
                    planet.initAsPlanet({ dist: pDist, speed: pSpeed, size: pSize, color: `hsl(${Math.random() * 360}, 60%, 50%)`});
                    
                    const mAngle = Math.random() * Math.PI * 2;
                    planet.x = sunP.x + Math.cos(mAngle) * pDist;
                    planet.y = sunP.y + Math.sin(mAngle) * pDist;
                    
                    const mTan = getOrbitTangent(planet.x - sunP.x, planet.y - sunP.y, 1);
                    planet.vx = sunP.vx + mTan.x * Math.abs(pSpeed);
                    planet.vy = sunP.vy + mTan.y * Math.abs(pSpeed);
                    
                    particles.push(planet);
                }
                toggleAddSunMode();
            } else if (clickMode === 'addMoon') {
                // Find nearest planet or custom sun
                let nearestParent = !systemCenter.dead ? systemCenter : null;
                let minDist = nearestParent ? Math.hypot(e.clientX - nearestParent.x, e.clientY - nearestParent.y) : Infinity;
                
                particles.forEach(p => {
                    if (p.role === 'planet' || p.role === 'sun') {
                        const d = Math.hypot(e.clientX - p.x, e.clientY - p.y);
                        if (d < minDist) {
                            minDist = d;
                            nearestParent = p;
                        }
                    }
                });

                if (nearestParent) {
                    const size = 1.5 + Math.random() * 2;
                    const moon = new Particle(Date.now() + Math.random(), 'moon', nearestParent);
                    moon.x = e.clientX;
                    moon.y = e.clientY;
                    
                    const dist = Math.hypot(moon.x - nearestParent.x, moon.y - nearestParent.y);
                    const speed = getCircularOrbitSpeed(nearestParent.gravParam || SUN_GRAVITY, dist, PLANET_GRAVITY_SOFTENING);
                    const tangent = getOrbitTangent(moon.x - nearestParent.x, moon.y - nearestParent.y, 1);
                    
                    moon.vx = (nearestParent.vx || 0) + tangent.x * speed;
                    moon.vy = (nearestParent.vy || 0) + tangent.y * speed;
                    moon.baseOrbitDist = dist;
                    moon.orbitDist = dist;
                    moon.size = size;
                    moon.baseSize = size;
                    moon.color = '#f0f0f0'; // Consistent pure moon color

                    particles.push(moon);
                }
                toggleAddMoonMode();
            } else if (clickMode === 'addAsteroid') {
                const p = new Particle(Date.now() + Math.random(), 'asteroid');
                p.x = e.clientX;
                p.y = e.clientY;
                
                // Single Large Asteroid (Impact Capable)
                const size = 3.6 + Math.random() * 2.2;
                p.baseSize = size;
                p.size = size;
                p.color = `hsl(25, 8%, ${55 + Math.random() * 20}%)`;
                
                const distFromCenter = Math.hypot(p.x - systemCenter.x, p.y - systemCenter.y);
                const orbitSpeed = getCircularOrbitSpeed(SUN_GRAVITY, distFromCenter, SUN_GRAVITY_SOFTENING) * (1.1 + Math.random() * 0.3);
                const tangent = getOrbitTangent(p.x - systemCenter.x, p.y - systemCenter.y, Math.random() > 0.5 ? 1 : -1);
                
                p.vx = tangent.x * orbitSpeed;
                p.vy = tangent.y * orbitSpeed;
                p.baseOrbitDist = distFromCenter;
                p.orbitDist = distFromCenter;
                p.scatterResponse = 0.95;
                p.inertia = 1.6;

                particles.push(p);
                toggleAddAsteroidMode();
            } else if (clickMode === 'addAsteroidField') {
                const num = 6 + Math.floor(Math.random() * 8);
                for (let i = 0; i < num; i++) {
                    const p = new Particle(Date.now() + Math.random() + i, 'asteroid');
                    const offsetX = (Math.random() - 0.5) * 60;
                    const offsetY = (Math.random() - 0.5) * 60;
                    p.x = e.clientX + offsetX;
                    p.y = e.clientY + offsetY;
                    
                    const dist = Math.hypot(p.x - systemCenter.x, p.y - systemCenter.y);
                    const speed = getCircularOrbitSpeed(SUN_GRAVITY, dist, SUN_GRAVITY_SOFTENING);
                    const tangent = getOrbitTangent(p.x - systemCenter.x, p.y - systemCenter.y, Math.random() > 0.5 ? 1 : -1);
                    
                    p.vx = tangent.x * speed + (Math.random() - 0.5) * 0.15;
                    p.vy = tangent.y * speed + (Math.random() - 0.5) * 0.15;
                    p.baseOrbitDist = dist;
                    p.orbitDist = dist;
                    p.isPinned = customSunsPinned;
                    p.size = 0.5 + Math.random() * 1.5;
                    p.baseSize = p.size;
                    p.color = `hsl(20, 5%, ${40 + Math.random() * 30}%)`;
                    particles.push(p);
                }
                toggleAddAsteroidFieldMode();
            }
 else {
                triggerExplosion(e.clientX, e.clientY);
            }
        }

        clearTapState(e.pointerId);
        updateCursor(e.clientX, e.clientY);
    }

    function handlePointerCancel(e) {
        clearDragState(e.pointerId);
        clearTapState(e.pointerId);
        updateCursor();
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        applyOrbitScale();

        const fallbackX = Number.isFinite(mouse.x) ? mouse.x : width / 2;
        const fallbackY = Number.isFinite(mouse.y) ? mouse.y : height / 2;
        const targetX = systemCenter.isPinned || dragState.active ? systemCenter.x : fallbackX;
        const targetY = systemCenter.isPinned || dragState.active ? systemCenter.y : fallbackY;
        setSystemCenter(targetX, targetY);
        if (!particlesSeeded) seedParticlePositions();
        updateCursor(targetX, targetY);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    resize();
    syncParticleClickModeButton();

    function triggerExplosion(cX, cY, customRadius, customForce, depth = 0) {
        // Limit depth to prevent runaway infinite chain reactions
        if (depth > 2) return;

        // If scatterMode is 'none', only allow explosions if custom parameters are provided (from collisions)
        if (scatterMode === 'none' && !customRadius) return;

        const radius = customRadius || (scatterMode === 'large' ? SCATTER_RADIUS * 3.2 : SCATTER_RADIUS);
        const force = customForce || (scatterMode === 'large' ? SCATTER_FORCE * 3.2 : SCATTER_FORCE);

        // Add scattered visual flashes (if enabled)
        if (isVfxEnabled) {
            const isSupernova = (customRadius && customRadius > 1000);
            const flashColor = isSupernova ? '#ffccaa' : '#ffea00';
            
            // Suns hit: half as long (double decay) and less bright (lower alpha)
            const flashDecay = isSupernova ? 0.032 * 2 : 0.032;
            const flashAlpha = isSupernova ? 0.6 : 1.0;

            // Primary core flash
            flashes.push(new Flash(cX, cY, radius * 0.7 * (0.9 + Math.random() * 0.2), flashColor, flashDecay, flashAlpha));
            
            // Scattered secondary bursts 
            const extraBursts = radius > 300 ? 3 : (radius > 100 ? 1 : 0);
            for (let i = 0; i < extraBursts; i++) {
                const offX = (Math.random() - 0.5) * radius * 0.4;
                const offY = (Math.random() - 0.5) * radius * 0.4;
                const subRadius = radius * (0.2 + Math.random() * 0.4);
                flashes.push(new Flash(cX + offX, cY + offY, subRadius, flashColor, flashDecay, flashAlpha * 0.8));
            }
        }

        particles.forEach(p => {
            if (p.dead) return;
            
            // Ring particles are very susceptible to being scattered
            const radiusMultiplier = p.role === 'ring' ? 1.5 : 1.0; 
            const dx = p.x - cX;
            const dy = p.y - cY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius * radiusMultiplier) {
                const angle = Math.atan2(dy, dx);
                const forceFalloff = Math.pow(1 - (dist / radius), 2);
                const impulse = (force * forceFalloff * p.scatterResponse) / Math.max(0.7, p.inertia);
                
                const tangentialDrift = impulse * 0.08 * (Math.random() > 0.5 ? 1 : -1);
                p.vx += Math.cos(angle) * impulse - Math.sin(angle) * tangentialDrift;
                p.vy += Math.sin(angle) * impulse + Math.cos(angle) * tangentialDrift;

                // Total Annihilation / Chain Reaction Logic:
                // 1. Direct Hit Zone: Inner ~42% of the explosion radius. 
                //    Objects here are vaporized and trigger chain reactions.
                // 2. Scatter Zone: Everything else within the radius is ONLY pushed.
                const isDirectHit = dist < (radius * 0.42);

                if (isImpactEnabled && isVfxEnabled && depth < 3 && isDirectHit) {
                    const destructionThreshold = p.role === 'sun' ? 3.5 : 0.15;
                    
                    if (impulse > destructionThreshold) {
                        p.dead = true;
                        // Trigger cascading chain reaction
                        const cascadeScale = customRadius ? 0.5 : 0.72; 
                        setTimeout(() => {
                            triggerExplosion(p.x, p.y, radius * cascadeScale, force * 0.65, depth + 1);
                        }, 45 + depth * 20);
                    }
                }
                // If VFX is off, we do nothing else here; the particle already received its impulse scatter above.
            }
        });
    }

    function resolveElasticCollision(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.hypot(dx, dy) || 0.01;
        
        // 1. Position Resolution (Push apart to prevent sticking)
        const minDistance = (p1.size + p2.size) * 0.85;
        if (distance < minDistance) {
            const overlap = minDistance - distance;
            const nx = dx / distance;
            const ny = dy / distance;
            
            const m1 = p1.mass || 1;
            const m2 = p2.mass || 1;
            const totalMass = m1 + m2;
            
            if (!p1.isPinned && !p2.isPinned) {
                p1.x += nx * overlap * (m2 / totalMass);
                p1.y += ny * overlap * (m2 / totalMass);
                p2.x -= nx * overlap * (m1 / totalMass);
                p2.y -= ny * overlap * (m1 / totalMass);
            } else if (!p1.isPinned) {
                p1.x += nx * overlap;
                p1.y += ny * overlap;
            } else if (!p2.isPinned) {
                p2.x -= nx * overlap;
                p2.y -= ny * overlap;
            }
        }

        // 2. Velocity Resolution (Elastic Collision)
        const nx = dx / distance;
        const ny = dy / distance;
        
        const rvx = p1.vx - p2.vx;
        const rvy = p1.vy - p2.vy;
        const velAlongNormal = rvx * nx + rvy * ny;
        
        if (velAlongNormal < 0) {
            const restitution = 0.65;
            const m1 = p1.mass || 1;
            const m2 = p2.mass || 1;
            const impulse = -(1 + restitution) * velAlongNormal / (1/m1 + 1/m2);
            
            if (!p1.isPinned) {
                p1.vx += (impulse / m1) * nx;
                p1.vy += (impulse / m1) * ny;
            }
            if (!p2.isPinned) {
                p2.vx -= (impulse / m2) * nx;
                p2.vy -= (impulse / m2) * ny;
            }
        }
    }

    function impactParticle(p1, p2) {
        // If Impacts are off, we don't do anything
        if (!isImpactEnabled) return;

        // If Visuals are off, we just bounce
        if (!isVfxEnabled) {
            resolveElasticCollision(p1, p2);
            return;
        }
        
        // Prevent moons from hitting their own parent planets
        if (p1.parent === p2 || p2.parent === p1) return;

        // Prevent siblings (moons/rings of the same planet) from hitting each other
        if (p1.parent === p2.parent && p1.parent !== null) return;

        // Calculate Impact Power based on size and relative velocity
        const relVx = (p1.vx || 0) - (p2.vx || 0);
        const relVy = (p1.vy || 0) - (p2.vy || 0);
        const relSpeed = Math.hypot(relVx, relVy);
        
        // Power scales with mass (size^2 roughly) and velocity
        const power = ((p1.size * p1.size) + (p2.size * p2.size)) * (relSpeed * 0.5 + 1);
        
        // Suns are immutable anchors unless hit by another massive object (optional)
        // Here we'll have Suns absorb anything smaller than them.
        const isP1Sun = p1.role === 'sun';
        const isP2Sun = p2.role === 'sun';

        if (isP1Sun && isP2Sun) {
            p1.dead = true;
            p2.dead = true;
            // Supernova: Massive explosion relative to solar power
            const supernovaRadius = Math.min(1600, power * 3.5 + 200);
            const supernovaForce = Math.min(25, power * 0.1 + 1.5);
            triggerExplosion(p1.x, p1.y, supernovaRadius, supernovaForce);
            return;
        }

        if (isP1Sun || isP2Sun) {
            const sun = isP1Sun ? p1 : p2;
            const other = isP1Sun ? p2 : p1;
            
            other.dead = true;
            // Surface Impact disturbance
            triggerExplosion(other.x, other.y, other.size * 25, 0.4);
            return;
        }

        if (p1.role === 'asteroid' && p2.role === 'asteroid') {
            p1.dead = true;
            p2.dead = true;
            // Tiny explosion for asteroid clusters
            triggerExplosion(p1.x, p1.y, (p1.size + p2.size) * 8, 0.2);
            return;
        }

        // Heavy vs Light (Planet/Moon vs Asteroid) logic
        const isP1Heavy = p1.role === 'planet' || p1.role === 'moon';
        const isP2Heavy = p2.role === 'planet' || p2.role === 'moon';

        if (isP1Heavy !== isP2Heavy) {
            const heavy = isP1Heavy ? p1 : p2;
            const light = isP1Heavy ? p2 : p1;

            // Immediate disintegration of the smaller body
            light.dead = true;
            
            // Atmospheric Burn-up: If the asteroid is tiny (< 1.1), it vaporizes silently
            if (light.size < 1.1) {
                return; 
            }

            // Destruction Check: Only destroy the planet/moon if hit by a substantial impactor
            if (light.size > heavy.size * 0.42) {
                heavy.dead = true;
                // Calculate explosion scale relative to the impact power
                const impactRadius = Math.min(900, power * 3.2 + heavy.size * 18);
                const impactForce = Math.min(15, power * 0.07 + 0.85);
                triggerExplosion(heavy.x, heavy.y, impactRadius, impactForce);
            } else {
                // Mid-sized Disintegration: Surface tremor without body destruction
                const tremorRadius = Math.min(320, power * 1.6 + light.size * 12);
                const tremorForce = Math.min(4.5, power * 0.02 + 0.35);
                triggerExplosion(light.x, light.y, tremorRadius, tremorForce);
            }
            return;
        }

        // Standard mutual destruction for Heavy vs Heavy (Planet vs Planet, Planet vs Moon)
        p1.dead = true;
        p2.dead = true;

        // Trigger dynamic scatter wave relative to collision power
        const scatterRadius = Math.min(800, power * 2.2 + 80);
        const scatterForce = Math.min(12, power * 0.04 + 0.6);
        
        triggerExplosion(p1.x, p1.y, scatterRadius, scatterForce);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles = particles.filter(p => !p.dead);

        // Identify all active attractors (suns and planets) once per frame for optimization
        const attractors = particles.filter(p => p.role === 'sun' || p.role === 'planet');

        // Perform sub-steps to allow safe time-scaling and smooth slow motion
        const steps = Math.ceil(timeScale);
        const dt = timeScale / steps;

        for (let i = 0; i < steps; i++) {
            if (!dragState.active && !systemCenter.isPinned) {
                // Pulled by black hole
                if (blackHole.active) {
                    applyGravityToParticle(systemCenter, blackHole.x, blackHole.y, SUN_GRAVITY * 25, SUN_GRAVITY_SOFTENING, dt);
                }
                
                // Pulled by custom suns
                attractors.forEach(p => {
                    if (p.role === 'sun') {
                        applyGravityToParticle(systemCenter, p.x, p.y, p.gravParam, SUN_GRAVITY_SOFTENING, dt);
                    }
                });

                const hasActiveAttractors = blackHole.active || attractors.some(p => p.role === 'sun');
                const damping = hasActiveAttractors ? NUMERICAL_DAMPING : 0.95;
                
                systemCenter.vx *= Math.pow(damping, dt);
                systemCenter.vy *= Math.pow(damping, dt);
                systemCenter.x += systemCenter.vx * dt;
                systemCenter.y += systemCenter.vy * dt;
                
                // Eat central sun!
                if (blackHole.active) {
                    const sdx = systemCenter.x - blackHole.x;
                    const sdy = systemCenter.y - blackHole.y;
                    if (sdx*sdx + sdy*sdy < 400) { // Slightly larger radius for the main sun (20px)
                        systemCenter.dead = true;
                    }
                }
            }

            particles.forEach((p, idx) => {
                if (p.isPinned) {
                    p.vx = 0;
                    p.vy = 0;
                    return;
                }

                if (!systemCenter.dead) {
                    applyGravityToParticle(p, systemCenter.x, systemCenter.y, SUN_GRAVITY, SUN_GRAVITY_SOFTENING, dt);
                }

                if (blackHole.active) {
                    applyGravityToParticle(p, blackHole.x, blackHole.y, SUN_GRAVITY * 25, SUN_GRAVITY_SOFTENING, dt);
                }
                
                // Pull from other attractors (suns and planets)
                attractors.forEach(other => {
                    if (other.id === p.id) return;
                    
                    if (other.role === 'sun') {
                        applyGravityToParticle(p, other.x, other.y, other.gravParam, SUN_GRAVITY_SOFTENING, dt);
                    } else if (other.role === 'planet' && p.role === 'asteroid' && isPlanetaryGravityEnabled) {
                        // Asteroids are slightly affected by planet gravity (45% of normal planet potential)
                        applyGravityToParticle(p, other.x, other.y, other.gravParam * 0.45, PLANET_GRAVITY_SOFTENING, dt);
                    }
                });

                if ((p.role === 'moon' || p.role === 'ring') && p.parent) {
                    applyGravityToParticle(p, p.parent.x, p.parent.y, p.parent.gravParam, PLANET_GRAVITY_SOFTENING, dt);
                }

                if (gravityAnchor.active) {
                    const anchorDx = gravityAnchor.x - p.x;
                    const anchorDy = gravityAnchor.y - p.y;
                    const anchorDistSq = anchorDx * anchorDx + anchorDy * anchorDy + GRAVITY_ANCHOR_SOFTENING * GRAVITY_ANCHOR_SOFTENING;
                    const anchorDist = Math.sqrt(anchorDistSq);
                    const anchorForce = Math.min(
                        GRAVITY_ANCHOR_MAX_FORCE,
                        GRAVITY_ANCHOR_FORCE / anchorDistSq
                    );

                    const radialX = anchorDx / anchorDist;
                    const radialY = anchorDy / anchorDist;
                    
                    // Radial pull
                    p.vx += radialX * anchorForce * dt;
                    p.vy += radialY * anchorForce * dt;

                    // Even Stronger Orbital (Tangential) pull: adds a circular bias to help establish orbits
                    const orbitalBias = anchorForce * 0.72; 
                    p.vx += (-radialY) * orbitalBias * dt;
                    p.vy += radialX * orbitalBias * dt;
                }

                // Optimized Collision Logic
                if (isImpactEnabled) {
                    for (let j = idx + 1; j < particles.length; j++) {
                        const other = particles[j];
                        if (other.dead) continue;

                        const dx = p.x - other.x;
                        const dy = p.y - other.y;
                        const dSq = dx * dx + dy * dy;
                        const combinedRadius = (p.size + other.size) * 0.82;
                        
                        if (dSq < combinedRadius * combinedRadius) {
                            impactParticle(p, other);
                            if (p.dead) break; 
                        }
                    }
                }

                // Check main sun individually
                if (isImpactEnabled && !p.dead && !systemCenter.dead) {
                    const sdx = p.x - systemCenter.x;
                    const sdy = p.y - systemCenter.y;
                    const combinedRadius = (systemCenter.size + p.size) * 0.85;
                    if (sdx * sdx + sdy * sdy < combinedRadius * combinedRadius) {
                        if (!isVfxEnabled) {
                            resolveElasticCollision(p, systemCenter);
                        } else {
                            if (p.role === 'sun') {
                                p.dead = true;
                                systemCenter.dead = true;
                                triggerExplosion(p.x, p.y, 2000, 40);
                            } else {
                                p.dead = true;
                                if (p.role === 'planet' || p.role === 'moon') {
                                    triggerExplosion(p.x, p.y, p.size * 30, 0.8);
                                }
                            }
                        }
                    }
                }

                p.vx *= Math.pow(NUMERICAL_DAMPING, dt);
                p.vy *= Math.pow(NUMERICAL_DAMPING, dt);
                p.x += (p.vx + (Math.sin(Date.now()/3000 + p.id) * POSITION_NOISE)) * dt;
                p.y += (p.vy + (Math.cos(Date.now()/3000 + p.id) * POSITION_NOISE)) * dt;
                
                if (blackHole.active) {
                    const bdx = p.x - blackHole.x;
                    const bdy = p.y - blackHole.y;
                    if (bdx*bdx + bdy*bdy < 144) { 
                        p.dead = true;
                    }
                }
                
                if ((p.role === 'moon' || p.role === 'ring') && p.parent && p.parent.dead) {
                    p.dead = true;
                }
            });
        }
        
        // Final cleanup of eaten cosmic bodies
        if (blackHole.active) {
            particles = particles.filter(p => !p.dead);
        }

        // Update and Draw Flashes
        flashes.forEach((f, i) => {
            f.update(dt);
            f.draw(ctx);
        });
        flashes = flashes.filter(f => f.life > 0);

        const style = getComputedStyle(document.body);
        const rawAccent = style.getPropertyValue('--accent-color').trim() || '#5b6cf9';
        
        // Draw a sun-like nucleus at the active gravity center.
        if (!systemCenter.dead && systemCenter.x >= 0 && systemCenter.x <= width && systemCenter.y >= 0 && systemCenter.y <= height) {
            const sunPulse = 4 + Math.sin(Date.now() / 300) * 0.8;
            sunGlowRadius = 24 + Math.sin(Date.now() / 450) * 4;
            const sunGradient = ctx.createRadialGradient(
                systemCenter.x, systemCenter.y, 0,
                systemCenter.x, systemCenter.y, sunGlowRadius
            );
            sunGradient.addColorStop(0, '#fff7c0');
            sunGradient.addColorStop(0.35, '#ffd86b');
            sunGradient.addColorStop(1, 'rgba(255, 184, 64, 0)');

            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.fillStyle = sunGradient;
            ctx.beginPath();
            ctx.arc(systemCenter.x, systemCenter.y, sunGlowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 22;
            ctx.shadowColor = '#ffd36b';
            ctx.fillStyle = '#ffe48f';
            ctx.beginPath();
            ctx.arc(systemCenter.x, systemCenter.y, sunPulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (gravityAnchor.active) {
            const anchorPulse = 9 + Math.sin(Date.now() / 220) * 1.4;
            const anchorGradient = ctx.createRadialGradient(
                gravityAnchor.x, gravityAnchor.y, 0,
                gravityAnchor.x, gravityAnchor.y, anchorPulse * 2.8
            );
            anchorGradient.addColorStop(0, 'rgba(206, 234, 255, 0.95)');
            anchorGradient.addColorStop(0.45, 'rgba(125, 192, 255, 0.55)');
            anchorGradient.addColorStop(1, 'rgba(91, 108, 249, 0)');

            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = anchorGradient;
            ctx.beginPath();
            ctx.arc(gravityAnchor.x, gravityAnchor.y, anchorPulse * 2.8, 0, Math.PI * 2);
            ctx.fill();

            const pulseRing = 12 + Math.sin(Date.now() / 150) * 4;
            ctx.shadowBlur = 15;
            ctx.shadowColor = rawAccent;
            ctx.strokeStyle = 'rgba(176, 225, 255, 0.75)';
            ctx.lineWidth = 1.25;
            ctx.beginPath();
            ctx.arc(gravityAnchor.x, gravityAnchor.y, pulseRing, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (blackHole.active) {
            const bhPulse = 18 + Math.sin(Date.now() / 200) * 2;
            
            // Ominous accretion disk / photon sphere glow
            const accretionGradient = ctx.createRadialGradient(
                blackHole.x, blackHole.y, bhPulse * 0.8,
                blackHole.x, blackHole.y, bhPulse * 2.2
            );
            accretionGradient.addColorStop(0, 'rgba(20, 10, 50, 0.8)');
            accretionGradient.addColorStop(0.3, 'rgba(70, 30, 200, 0.3)');
            accretionGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.save();
            ctx.fillStyle = accretionGradient;
            ctx.beginPath();
            ctx.arc(blackHole.x, blackHole.y, bhPulse * 2.2, 0, Math.PI * 2);
            ctx.fill();

            // The Singularity Core
            ctx.shadowBlur = 35;
            ctx.shadowColor = 'rgba(100, 50, 255, 0.4)';
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(blackHole.x, blackHole.y, bhPulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        particles.forEach(p => {
            // Glow / Intensity (Reference sun center proximity instead of mouse)
            const sunDx = systemCenter.x - p.x;
            const sunDy = systemCenter.y - p.y;
            const sunDist = Math.sqrt(sunDx * sunDx + sunDy * sunDy);
            
            // Fading creation
            const age = Date.now() - (p.createdAt || 0);
            let introScale = 1;
            let introAlpha = 1;
            if (age < 1500) {
                const progress = age / 1500;
                // Easing out cubic
                introScale = 1 - Math.pow(1 - progress, 4);
                introAlpha = progress; 
            }
            
            if (p.role === 'sun') {
                const sunPulse = (p.size * 0.5) + Math.sin(Date.now() / 300 + p.id) * 0.8;
                const customSunRadius = (p.size * 3.5) + Math.sin(Date.now() / 450 + p.id) * 4;
                
                const customGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, customSunRadius * introScale);
                customGradient.addColorStop(0, '#ffffff');
                customGradient.addColorStop(0.35, p.color);
                customGradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.save();
                ctx.globalAlpha = 0.95 * introAlpha;
                ctx.fillStyle = customGradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, customSunRadius * introScale, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 25 * introScale;
                ctx.shadowColor = p.color;
                ctx.fillStyle = '#ffffff'; // hot white center
                ctx.beginPath();
                ctx.arc(p.x, p.y, sunPulse * introScale, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                return; // skip standard simple dot rendering
            }

            if (sunDist < 180) p.packedTicks = Math.min(150, (p.packedTicks || 0) + 1);
            else p.packedTicks = 0;

            const visibility = Math.min(1, Math.max(0.15, 1 - (sunDist / 1000)));
            const roleAlphaBoost = (p.role === 'planet' || p.role === 'moon') ? 1.0 : (p.role === 'ring' ? 0.35 : 0.65);
            ctx.globalAlpha = Math.min(1, visibility * roleAlphaBoost) * introAlpha;
            
            const glowBonus = Math.min(40, p.packedTicks / 3);
            const baseGlow = (p.role === 'planet' || p.role === 'moon') ? 22 : 8;
            ctx.shadowBlur = (baseGlow + glowBonus) * introScale;
            
            // Use the particle's own color for planets, moons, and asteroids.
            // Sun and other UI effects use their specific logic or rawAccent.
            ctx.shadowColor = ctx.fillStyle = p.color || rawAccent;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * introScale, 0, Math.PI * 2);
            ctx.fill();

            // Special detail for moons: small craters for a "moon-coloured" rocky look
            if (p.role === 'moon') {
                ctx.save();
                ctx.globalAlpha = 0.25 * ctx.globalAlpha;
                ctx.fillStyle = '#000000';
                const seed = p.id || 0;
                for (let j = 0; j < 3; j++) {
                    const noise = Math.sin(seed * (j + 1) * 1337);
                    const angle = seed + j * (Math.PI * 2 / 3);
                    const dist = p.size * 0.35 * Math.abs(noise);
                    const rx = Math.cos(angle) * dist;
                    const ry = Math.sin(angle) * dist;
                    const craterSize = p.size * 0.18 * (0.5 + Math.abs(noise));
                    
                    ctx.beginPath();
                    ctx.arc(p.x + rx, p.y + ry, craterSize * introScale, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            // Special detail for Earth: green spots for continents
            if (p.name === 'Earth' && p.role === 'planet') {
                ctx.save();
                ctx.globalAlpha = 0.8 * ctx.globalAlpha;
                ctx.fillStyle = '#4ade80'; // Vibrant terrain green
                const seed = p.id || 7;
                for (let j = 0; j < 4; j++) {
                    const noise = Math.sin(seed * (j + 2) * 987);
                    const angle = (seed * 0.05) + j * (Math.PI * 2 / 3.2);
                    const dist = p.size * 0.45 * Math.abs(noise);
                    const rx = Math.cos(angle) * dist;
                    const ry = Math.sin(angle) * dist;
                    const spotSize = p.size * 0.32 * (0.7 + Math.abs(noise));
                    
                    ctx.beginPath();
                    ctx.arc(p.x + rx, p.y + ry, spotSize * introScale, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// =============================================
// Floating Notepad
// =============================================

/// Initialize drag, resize, and auto-save for the floating notepad
function initNotepad() {
    // Note-taking functionality removed.
}



