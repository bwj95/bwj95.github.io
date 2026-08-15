document.addEventListener('DOMContentLoaded', () => {
    // Set Current Year in Footer


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

    // Intercept CTA clicks for shine animation
    document.querySelectorAll('.ghost-button, .service-cta, .hero-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault(); // Stop immediate navigation
                btn.classList.add('clicked-shine');
                
                // Navigate after the animation plays
                setTimeout(() => {
                    if (btn.getAttribute('target') === '_blank') {
                        window.open(href, '_blank');
                    } else {
                        window.location.href = href;
                    }
                    // Remove class in case they come back to the page
                    btn.classList.remove('clicked-shine');
                }, 500);
            } else {
                // If it's a dummy link, just shine
                btn.classList.add('clicked-shine');
                setTimeout(() => btn.classList.remove('clicked-shine'), 500);
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

    // Initialize notepad, theme, and advanced animations on load
    setTheme(localStorage.getItem('aura-theme') || 'light');
    initNotepad();
    initQuotes();
    if (typeof gsap !== 'undefined' && typeof lottie !== 'undefined') {
        initAdvancedAnimations();
    }
});

// =============================================
// Advanced Animations (GSAP, Canvas, Lottie)
// =============================================
function initAdvancedAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // 0. Hero Fade Out
    gsap.to('.hero-content', {
        opacity: 0,
        y: -100,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: '50% top',
            scrub: true
        }
    });

    // Unified Section Fade-in (handled by IntersectionObserver for simplicity and performance)
    // We can also add a subtle GSAP flourish here if needed, but the user requested "not separate transitions"

    // 1. Digital Circuit Lines (Trigger CSS Keyframes)
    ScrollTrigger.create({
        trigger: '#services',
        start: 'top 60%',
        onEnter: () => {
            document.querySelectorAll('.circuit-line').forEach(el => el.classList.add('active'));
        }
    });

    // Service rows will now use the standard professional fade-in transition
    const serviceRows = gsap.utils.toArray('.service-row');
    serviceRows.forEach((row) => {
        gsap.from(row, {
            scrollTrigger: {
                trigger: row,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 1.2,
            ease: 'power2.out'
        });
    });

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
            ScrollTrigger.create({
                trigger: '#contact',
                start: 'top 80%',
                end: 'bottom center',
                scrub: true,
                onUpdate: self => {
                    anim.goToAndStop(self.progress * (anim.totalFrames - 1), true);
                }
            });
        });
    }

    // 5. HTML5 Canvas Particle System (Server Rack assembly on scroll)
    initCanvasParticles();
}

function initCanvasParticles() {
    // ==========================================
    // 1. GLOBAL BACKGROUND CANVAS — BUBBLE SYSTEM
    // ==========================================
    const bgCanvas = document.getElementById('particleCanvas');
    if (!bgCanvas) return;
    const bgCtx = bgCanvas.getContext('2d');
    let bgWidth, bgHeight;
    let bubbles = [];
    let popFragments = [];
    const BUBBLE_COUNT = 45;

    // Expanded bubble colour palette — more vibrant and diverse
    const BUBBLE_HUES = [
        { h: 200, s: 90, l: 65 }, // Ocean Blue
        { h: 215, s: 85, l: 70 }, // Deep Sky Blue
        { h: 190, s: 95, l: 60 }, // Cyan
        { h: 225, s: 75, l: 75 }, // Periwinkle Blue
        { h: 180, s: 85, l: 55 }  // Tealish Blue
    ];

    function createBubble(id, instant) {
        const hue = BUBBLE_HUES[Math.floor(Math.random() * BUBBLE_HUES.length)];
        return {
            id: id,
            x: Math.random() * bgWidth,
            y: Math.random() * bgHeight,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -(Math.random() * 0.4 + 0.1),
            size: Math.random() * 12 + 5,
            baseSpeed: Math.random() * 0.2 + 0.05,
            hue: hue,
            alpha: instant ? (Math.random() * 0.4 + 0.3) : 0,
            targetAlpha: Math.random() * 0.4 + 0.3,
            fadeSpeed: Math.random() * 0.003 + 0.002,
            // Lifecycle: bubble fades out after a random time, then reappears
            lifecycleTimer: Math.random() * 800 + 400,
            lifecyclePhase: instant ? 'visible' : 'fadingIn',
            wobbleOffset: Math.random() * Math.PI * 2,
            popped: false
        };
    }

    function initBubbles() {
        bubbles = [];
        popFragments = [];
        for (let i = 0; i < BUBBLE_COUNT; i++) {
            bubbles.push(createBubble(i, true));
        }
    }



    function popBubble(bubble) {
        bubble.popped = true;
        // Spawn small burst fragments
        const fragCount = Math.floor(Math.random() * 5) + 4;
        for (let i = 0; i < fragCount; i++) {
            const angle = (Math.PI * 2 / fragCount) * i + Math.random() * 0.5;
            const speed = Math.random() * 3 + 1.5;
            popFragments.push({
                x: bubble.x,
                y: bubble.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 2 + 1,
                alpha: 0.6,
                hue: bubble.hue
            });
        }
    }

    function respawnBubble(bubble) {
        const hue = BUBBLE_HUES[Math.floor(Math.random() * BUBBLE_HUES.length)];
        bubble.x = Math.random() * bgWidth;
        bubble.y = bgHeight + Math.random() * 50;
        bubble.vx = (Math.random() - 0.5) * 0.3;
        bubble.vy = -(Math.random() * 0.4 + 0.1);
        bubble.size = Math.random() * 12 + 5;
        bubble.hue = hue;
        bubble.alpha = 0;
        bubble.targetAlpha = Math.random() * 0.4 + 0.3;
        bubble.lifecycleTimer = Math.random() * 800 + 400;
        bubble.lifecyclePhase = 'fadingIn';
        bubble.popped = false;
        bubble.wobbleOffset = Math.random() * Math.PI * 2;
    }

    // Click/tap pops nearby bubbles
    function handlePopInteraction(cX, cY) {
        const popRadius = 80;
        bubbles.forEach(b => {
            if (b.popped) return;
            const dx = b.x - cX;
            const dy = b.y - cY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < popRadius + b.size) {
                popBubble(b);
            }
        });
    }

    window.addEventListener('pointerdown', (e) => {
        // Ignore interactions on UI elements
        if (e.target.closest('button, a, textarea, input, .card-canvas, .floating-notepad')) return;
        handlePopInteraction(e.clientX, e.clientY);
    });

    function resizeGlobal() {
        bgWidth = bgCanvas.width = window.innerWidth;
        bgHeight = bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeGlobal);

    /// Draw a single bubble with translucent fill, rim stroke, and specular highlight
    /// Adapts opacity and colour depth based on the current light/dark theme
    function drawBubble(b) {
        if (b.alpha <= 0.01) return;

        const isLight = document.body.getAttribute('data-theme') === 'light';
        const { h, s, l } = b.hue;

        // Theme-adaptive values: light mode needs darker hues and stronger opacity
        const lAdj = isLight ? l - 25 : l;
        const sAdj = isLight ? Math.min(s + 15, 100) : s;
        const glowMul = isLight ? 0.35 : 0.5;
        const bodyMul = isLight ? 0.8 : 0.75;
        const rimMul = isLight ? 1.0 : 0.95;
        const highlightMul = isLight ? 1.0 : 1.0;

        bgCtx.save();

        // Drop shadow (light mode only — gives depth against white bg)
        if (isLight) {
            bgCtx.globalAlpha = b.alpha * 0.12;
            bgCtx.beginPath();
            bgCtx.arc(b.x + 2, b.y + 3, b.size * 1.05, 0, Math.PI * 2);
            bgCtx.fillStyle = `hsla(${h}, ${sAdj}%, 30%, 0.3)`;
            bgCtx.fill();
        }

        // Outer glow
        bgCtx.globalAlpha = b.alpha * glowMul;
        bgCtx.beginPath();
        bgCtx.arc(b.x, b.y, b.size * 1.6, 0, Math.PI * 2);
        bgCtx.fillStyle = `hsla(${h}, ${sAdj}%, ${lAdj}%, 0.3)`;
        bgCtx.fill();

        // Main bubble body — translucent fill
        bgCtx.globalAlpha = b.alpha * bodyMul;
        bgCtx.beginPath();
        bgCtx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        const grad = bgCtx.createRadialGradient(
            b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.1,
            b.x, b.y, b.size
        );
        grad.addColorStop(0, `hsla(${h}, ${sAdj}%, ${lAdj + 15}%, ${isLight ? 0.6 : 0.4})`);
        grad.addColorStop(0.7, `hsla(${h}, ${sAdj}%, ${lAdj}%, ${isLight ? 0.3 : 0.15})`);
        grad.addColorStop(1, `hsla(${h}, ${sAdj - 10}%, ${lAdj - 10}%, ${isLight ? 0.15 : 0.05})`);
        bgCtx.fillStyle = grad;
        bgCtx.fill();

        // Iridescent soapy sheen (multicolour tint)
        bgCtx.globalAlpha = b.alpha * (isLight ? 0.3 : 0.45);
        bgCtx.beginPath();
        bgCtx.arc(b.x, b.y, b.size * 0.92, 0, Math.PI * 2);
        const soapyGrad = bgCtx.createRadialGradient(
            b.x + b.size * 0.5, b.y + b.size * 0.5, b.size * 0.1,
            b.x, b.y, b.size
        );
        soapyGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        soapyGrad.addColorStop(0.4, `hsla(${(h + 130) % 360}, 90%, 80%, 0.15)`); 
        soapyGrad.addColorStop(0.7, `hsla(${(h + 240) % 360}, 90%, 80%, 0.15)`);
        soapyGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        bgCtx.fillStyle = soapyGrad;
        bgCtx.fill();

        // Rim stroke
        bgCtx.globalAlpha = b.alpha * rimMul;
        bgCtx.beginPath();
        bgCtx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        bgCtx.strokeStyle = `hsla(${h}, ${sAdj}%, ${lAdj}%, ${isLight ? 0.7 : 0.5})`;
        bgCtx.lineWidth = isLight ? 1.5 : 1;
        bgCtx.stroke();

        // Specular highlight arc (top-left)
        bgCtx.globalAlpha = b.alpha * highlightMul;
        bgCtx.beginPath();
        bgCtx.arc(
            b.x - b.size * 0.25,
            b.y - b.size * 0.25,
            b.size * 0.55,
            Math.PI * 1.1, Math.PI * 1.7
        );
        bgCtx.strokeStyle = isLight ? `hsla(0, 0%, 100%, 0.9)` : `hsla(0, 0%, 100%, 0.6)`;
        bgCtx.lineWidth = 1.5;
        bgCtx.lineCap = 'round';
        bgCtx.stroke();

        // Tiny bright dot highlight
        bgCtx.globalAlpha = b.alpha;
        bgCtx.beginPath();
        bgCtx.arc(b.x - b.size * 0.3, b.y - b.size * 0.35, b.size * 0.12, 0, Math.PI * 2);
        bgCtx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)';
        bgCtx.fill();

        bgCtx.restore();
    }

    function animateGlobal() {
        bgCtx.clearRect(0, 0, bgWidth, bgHeight);
        const now = Date.now();

        // Update and draw bubbles
        bubbles.forEach(b => {
            // If popped, wait then respawn
            if (b.popped) {
                b.alpha -= 0.05;
                if (b.alpha <= 0) {
                    // Respawn after a short delay
                    setTimeout(() => respawnBubble(b), Math.random() * 2000 + 500);
                    b.alpha = 0;
                    b.popped = 'respawning';
                }
                return;
            }
            if (b.popped === 'respawning') return;

            // Lifecycle phases
            if (b.lifecyclePhase === 'fadingIn') {
                b.alpha += b.fadeSpeed;
                if (b.alpha >= b.targetAlpha) {
                    b.alpha = b.targetAlpha;
                    b.lifecyclePhase = 'visible';
                }
            } else if (b.lifecyclePhase === 'visible') {
                b.lifecycleTimer--;
                if (b.lifecycleTimer <= 0) {
                    b.lifecyclePhase = 'fadingOut';
                }
            } else if (b.lifecyclePhase === 'fadingOut') {
                b.alpha -= b.fadeSpeed;
                if (b.alpha <= 0) {
                    b.alpha = 0;
                    respawnBubble(b);
                }
            }

            // Movement: gentle float upward with lateral wobble
            const wobble = Math.sin(now / 2000 + b.wobbleOffset) * b.baseSpeed * 1.5;
            b.x += b.vx + wobble;
            b.y += b.vy;
            b.vx *= 0.995;

            // Wrap around edges
            const margin = b.size + 20;
            if (b.y < -margin) {
                b.y = bgHeight + margin;
                b.x = Math.random() * bgWidth;
            }
            if (b.x < -margin) b.x = bgWidth + margin;
            if (b.x > bgWidth + margin) b.x = -margin;

            drawBubble(b);
        });

        // Update and draw pop fragments
        for (let i = popFragments.length - 1; i >= 0; i--) {
            const f = popFragments[i];
            f.x += f.vx;
            f.y += f.vy;
            f.vy += 0.05;
            f.vx *= 0.96;
            f.vy *= 0.96;
            f.alpha -= 0.02;

            if (f.alpha <= 0) {
                popFragments.splice(i, 1);
                continue;
            }

            const { h, s, l } = f.hue;
            const isLightFrag = document.body.getAttribute('data-theme') === 'light';
            const fragL = isLightFrag ? l - 20 : l + 10;
            const fragS = isLightFrag ? Math.min(s + 15, 100) : s;
            bgCtx.globalAlpha = isLightFrag ? f.alpha * 1.5 : f.alpha;
            bgCtx.beginPath();
            bgCtx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            bgCtx.fillStyle = `hsla(${h}, ${fragS}%, ${fragL}%, 0.8)`;
            bgCtx.fill();
        }

        bgCtx.globalAlpha = 1.0;
        requestAnimationFrame(animateGlobal);
    }

    resizeGlobal();
    initBubbles();
    animateGlobal();


    // Local card simulations removed for new detailing pricing layout
}

// =============================================
// Floating Notepad
// =============================================

/// Initialize drag, resize, and auto-save for the floating notepad
function initNotepad() {
    const notepad = document.getElementById('floatingNotepad');
    const header = notepad.querySelector('.notepad-header');

    const saved = localStorage.getItem('aura-note');
    if (saved) {
        document.getElementById('notepadContent').value = saved;
    }

    // Resize support disabled per user request

    // Auto-save to localStorage on every keystroke
    document.getElementById('notepadContent').addEventListener('input', (e) => {
        localStorage.setItem('aura-note', e.target.value);
    });
}

/// Toggle the notepad collapsed/expanded state, always deriving truth from the DOM class
function toggleNotepad() {
    const notepad = document.getElementById('floatingNotepad');
    // Read current state from the DOM — never from a JS variable that can drift
    const isCurrentlyCollapsed = notepad.classList.contains('collapsed');

    if (isCurrentlyCollapsed) {
        // --- EXPANDING ---
        const MARGIN = 8;
        const rect = notepad.getBoundingClientRect();

        // Restore saved dimensions (from before the last collapse) or fall back to CSS defaults
        const expandedH = parseInt(notepad.dataset.savedHeight) || 460;
        const expandedW = parseInt(notepad.dataset.savedWidth) || 360;
        if (notepad.dataset.savedWidth)  notepad.style.width  = notepad.dataset.savedWidth;
        if (notepad.dataset.savedHeight) notepad.style.height = notepad.dataset.savedHeight;

        // Only clamp when the notepad has been dragged (explicit top/left).
        // Default bottom/right CSS positioning grows the panel upward — no fix needed.
        const hasExplicitTop  = notepad.style.top  && notepad.style.top  !== 'auto';
        const hasExplicitLeft = notepad.style.left && notepad.style.left !== 'auto';

        if (hasExplicitTop) {
            const clampedTop = Math.min(
                Math.max(MARGIN, rect.top),
                window.innerHeight - expandedH - MARGIN
            );
            notepad.style.top = clampedTop + 'px';
        }

        if (hasExplicitLeft) {
            const clampedLeft = Math.min(
                Math.max(MARGIN, rect.left),
                window.innerWidth - expandedW - MARGIN
            );
            notepad.style.left = clampedLeft + 'px';
        }

        notepad.classList.remove('collapsed');
        document.getElementById('eyeOpen').style.display = '';
        document.getElementById('eyeClosed').style.display = 'none';
    } else {
        // --- COLLAPSING ---
        // Save any inline dimensions so they survive the collapse
        if (notepad.style.width)  notepad.dataset.savedWidth  = notepad.style.width;
        if (notepad.style.height) notepad.dataset.savedHeight = notepad.style.height;

        // Clear ALL inline styles to let the .collapsed CSS handle the size AND position (bottom-right anchor)
        notepad.style.width  = '';
        notepad.style.height = '';
        notepad.style.top = '';
        notepad.style.left = '';
        notepad.style.bottom = '';
        notepad.style.right = '';

        notepad.classList.add('collapsed');
        document.getElementById('eyeOpen').style.display = 'none';
        document.getElementById('eyeClosed').style.display = '';
    }
}


/// Toggle a green background glow on the notepad and the entire site
function toggleGlow() {
    const theme = document.body.getAttribute('data-theme') || 'dark';
    if (theme === 'light') return;

    const notepad = document.getElementById('floatingNotepad');
    const isGlowing = notepad.classList.toggle('has-glow');
    document.body.classList.toggle('bg-glow', isGlowing);

    // Use GSAP to smoothly animate the particle color variable
    const targetColor = isGlowing 
        ? '#00d4ff' 
        : (theme === 'light' ? '#1d1d1f' : '#f5f5f7');

    if (typeof gsap !== 'undefined') {
        gsap.to('body', {
            '--particle-color': targetColor,
            duration: 0.8,
            ease: 'power2.inOut'
        });
    }
}

/// Copy notepad content to the system clipboard, briefly flashing the button green
function copyNotepad() {
    const content = document.getElementById('notepadContent').value;
    if (!content.trim()) return;

    navigator.clipboard.writeText(content).then(() => {
        const btn = document.getElementById('copyNotepadBtn');
        btn.classList.add('copied');
        const originalTitle = btn.title;
        btn.title = 'Copied!';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.title = originalTitle;
        }, 1800);
    }).catch(() => {
        // Fallback for environments without clipboard API
        const textarea = document.getElementById('notepadContent');
        textarea.select();
        document.execCommand('copy');
    });
}

/// Apply a named theme to the page and persist it
/// Apply a named theme to the entire page and persist it
function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('aura-theme', themeName);

    // Turn off glow if switching to light mode
    if (themeName === 'light') {
        const notepad = document.getElementById('floatingNotepad');
        if (notepad.classList.contains('has-glow')) {
            notepad.classList.remove('has-glow');
            document.body.classList.remove('bg-glow');
            if (typeof gsap !== 'undefined') {
                gsap.to('body', {
                    '--particle-color': '#1d1d1f',
                    duration: 0.5
                });
            }
        }
    }

    // Mark active theme button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        const isActive = btn.getAttribute('onclick').includes(`'${themeName}'`);
        btn.classList.toggle('active', isActive);
    });
}

/// Randomize the philosopher quote at the bottom of the page
function initQuotes() {
    const quotes = [
        { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
        { text: "Everything has beauty, but not everyone sees it.", author: "Confucius" },
        { text: "The unexamined life is not worth living.", author: "Socrates" },
        { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
        { text: "Happiness depends upon ourselves.", author: "Aristotle" },
        { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
        { text: "The secret of happiness is not found in seeking more, but in developing the capacity to enjoy less.", author: "Socrates" },
        { text: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.", author: "Jean-Paul Sartre" },
        { text: "The mind is furnished with ideas by experience alone.", author: "John Locke" },
        { text: "Act only according to that maxim whereby you can will that it should become a universal law.", author: "Immanuel Kant" },
        { text: "Life must be understood backward. But it must be lived forward.", author: "Søren Kierkegaard" },
        { text: "The greater the difficulty, the more glory in surmounting it.", author: "Epicurus" }
    ];

    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');

    if (quoteText && quoteAuthor) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const selected = quotes[randomIndex];
        quoteText.textContent = selected.text;
        quoteAuthor.textContent = `— ${selected.author}`;
    }
}
