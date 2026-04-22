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
    setTheme(localStorage.getItem('aura-theme') || 'dark');
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

    // 0.5. Services Heading Fade In
    gsap.from('.services-heading-block', {
        opacity: 0,
        y: 50,
        scrollTrigger: {
            trigger: '#services',
            start: 'top 65%',
            end: 'top 20%',
            scrub: true
        }
    });

    // 1. Digital Circuit Lines (Trigger CSS Keyframes)
    ScrollTrigger.create({
        trigger: '#services',
        start: 'top 60%',
        onEnter: () => {
            document.querySelectorAll('.circuit-line').forEach(el => el.classList.add('active'));
        }
    });

    // 2. Individual Service Row Fades
    const serviceRows = gsap.utils.toArray('.service-row');
    serviceRows.forEach(row => {
        gsap.from(row, {
            scrollTrigger: {
                trigger: row,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
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
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    const particles = [];
    const numParticles = 60; 
    
    // Mouse tracking
    const mouse = { x: -1000, y: -1000, isOverCard: false };
    
    function updateMouseContext(e) {
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        
        if (x !== undefined && y !== undefined) {
            mouse.x = x;
            mouse.y = y;
            
            // Check if hovering over anything that looks like a card, nav, or terminal
            const target = document.elementFromPoint(x, y);
            mouse.isOverCard = !!(target && target.closest('.service-card, .hero-card, .cta-terminal, .learn-card, .floating-notepad, .glass-nav'));
        }
    }

    window.addEventListener('mousemove', updateMouseContext);
    window.addEventListener('touchmove', updateMouseContext, { passive: true });
    
    // Reset mouse when leaving
    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
        mouse.isOverCard = false;
    });

    // Generic Explosion Trigger
    function triggerExplosion(cX, cY) {
        // 1. Forceful push on existing dots (Scatter effect)
        particles.forEach(p => {
            const dx = p.x - cX;
            const dy = p.y - cY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const forceRadius = 400;
            
            if (dist < forceRadius) {
                const force = (forceRadius - dist) / forceRadius;
                const angle = Math.atan2(dy, dx);
                // Heavier impulse kick for the scatter
                p.vx += Math.cos(angle) * force * 35; 
                p.vy += Math.sin(angle) * force * 35;

                // INSTANTLY REVERT to original color on explosion
                p.color = null;
                p.explosionRevertTimer = 80; // Keep original color while flying away (~1.3s)
            }
        });
    }

    // Interaction Listeners
    window.addEventListener('mousedown', (e) => {
        // Check if user clicked a link or button to avoid annoying UX
        if (e.target.closest('button, a, textarea, input')) return;
        triggerExplosion(e.clientX, e.clientY);
    });

    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('button, a, textarea, input')) return;
        if (e.touches[0]) {
            triggerExplosion(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Init base particles
    for (let i = 0; i < numParticles; i++) {
        particles.push({ 
            x: Math.random() * width, 
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 2 + 1,
            baseSpeed: Math.random() * 0.5 + 0.2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        const style = getComputedStyle(document.body);
        const rawAccent = style.getPropertyValue('--accent-color').trim() || '#5b6cf9';
        
        particles.forEach(particle => {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 5000; 
            const safeRadius = 0; 

            // Handle luminosity & glow accumulation
            if (particle.explosionRevertTimer > 0) {
                particle.explosionRevertTimer--;
                particle.packedTicks = 0;
            } else if (!mouse.isOverCard && dist < 120) {
                 particle.packedTicks = (particle.packedTicks || 0) + 1;
            } else {
                particle.packedTicks = 0;
            }

            // Particles always on
            const visibility = 0.8;
            ctx.globalAlpha = visibility;

            const activeColor = rawAccent; 
            ctx.fillStyle = activeColor;
            ctx.shadowColor = activeColor;
            
            const glowBonus = Math.min(50, (particle.packedTicks || 0) / 3);
            
            // Particles drift naturally, no tracking
            ctx.shadowBlur = 12 + glowBonus;
            // Friction/damping — particles drift farther when mouse is over a card
            const friction = mouse.isOverCard ? 0.985 : 0.96;
            particle.vx *= friction;
            particle.vy *= friction;
            
            particle.x += particle.vx + (Math.sin(Date.now() / 1000 + particle.size) * particle.baseSpeed);
            particle.y += particle.vy + (Math.cos(Date.now() / 1000 + particle.size) * particle.baseSpeed);
            
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
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
    const notepad = document.getElementById('floatingNotepad');
    const header = notepad.querySelector('.notepad-header');

    const saved = localStorage.getItem('aura-note');
    if (saved) {
        document.getElementById('notepadContent').value = saved;
    }

    // Drag support
    let isDragging = false, startX, startY, initLeft, initTop;
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.notepad-btn') || e.target.closest('.theme-switcher')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = notepad.getBoundingClientRect();
        initLeft = rect.left;
        initTop = rect.top;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
    });

    function onDrag(e) {
        if (!isDragging) return;
        const MARGIN = 8;
        const rect = notepad.getBoundingClientRect();
        const newLeft = initLeft + (e.clientX - startX);
        const newTop = initTop + (e.clientY - startY);
        // Clamp so the notepad stays fully inside the viewport
        const clampedLeft = Math.min(
            Math.max(MARGIN, newLeft),
            window.innerWidth - rect.width - MARGIN
        );
        const clampedTop = Math.min(
            Math.max(MARGIN, newTop),
            window.innerHeight - rect.height - MARGIN
        );
        notepad.style.left = clampedLeft + 'px';
        notepad.style.top = clampedTop + 'px';
        notepad.style.bottom = 'auto';
        notepad.style.right = 'auto';
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    // Resize support — all 4 corners
    let isResizing = false, initW, initH;

    /// Attach a mousedown resize handler to a corner element.
    /// corner is one of: 'nw' | 'ne' | 'sw' | 'se'
    function attachCornerResizer(el, corner) {
        el.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // prevent drag from firing
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = notepad.getBoundingClientRect();
            initW = rect.width;
            initH = rect.height;
            initLeft = rect.left;
            initTop = rect.top;
            // Normalise to top/left positioning so all corners work uniformly
            notepad.style.left = initLeft + 'px';
            notepad.style.top = initTop + 'px';
            notepad.style.bottom = 'auto';
            notepad.style.right = 'auto';

            function onCornerResize(e) {
                if (!isResizing) return;
                const MARGIN = 8;
                const MIN_W = 280, MIN_H = 150;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                let newW = initW, newH = initH;
                let newLeft = initLeft, newTop = initTop;

                // Horizontal axis
                if (corner === 'ne' || corner === 'se') {
                    newW = initW + dx; // right edge moves
                } else {
                    newW = initW - dx; // left edge moves (NW / SW)
                    newLeft = initLeft + dx;
                }

                // Vertical axis
                if (corner === 'sw' || corner === 'se') {
                    newH = initH + dy; // bottom edge moves
                } else {
                    newH = initH - dy; // top edge moves (NW / NE)
                    newTop = initTop + dy;
                }

                // Enforce minimum dimensions, walking back the position delta
                if (newW < MIN_W) {
                    if (corner === 'nw' || corner === 'sw') newLeft = initLeft + (initW - MIN_W);
                    newW = MIN_W;
                }
                if (newH < MIN_H) {
                    if (corner === 'nw' || corner === 'ne') newTop = initTop + (initH - MIN_H);
                    newH = MIN_H;
                }

                // Viewport boundary clamping
                newLeft = Math.max(MARGIN, newLeft);
                newTop = Math.max(MARGIN, newTop);
                if (newLeft + newW > window.innerWidth - MARGIN) newW = window.innerWidth - newLeft - MARGIN;
                if (newTop + newH > window.innerHeight - MARGIN) newH = window.innerHeight - newTop - MARGIN;

                notepad.style.width = newW + 'px';
                notepad.style.height = newH + 'px';
                notepad.style.left = newLeft + 'px';
                notepad.style.top = newTop + 'px';
            }

            function stopCornerResize() {
                isResizing = false;
                document.removeEventListener('mousemove', onCornerResize);
                document.removeEventListener('mouseup', stopCornerResize);
            }

            document.addEventListener('mousemove', onCornerResize);
            document.addEventListener('mouseup', stopCornerResize);
        });
    }

    attachCornerResizer(document.getElementById('gtResizerNW'), 'nw');
    attachCornerResizer(document.getElementById('gtResizerNE'), 'ne');
    attachCornerResizer(document.getElementById('gtResizerSW'), 'sw');
    attachCornerResizer(document.getElementById('gtResizerSE'), 'se');

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
        // Clear inline size — lets the CSS .collapsed rules (42px / 190px) take effect
        notepad.style.width  = '';
        notepad.style.height = '';

        notepad.classList.add('collapsed');
        document.getElementById('eyeOpen').style.display = 'none';
        document.getElementById('eyeClosed').style.display = '';
    }
}

/// Clear notepad content after confirmation
function clearNotepad() {
    if (confirm('Clear all notes?')) {
        document.getElementById('notepadContent').value = '';
        localStorage.removeItem('aura-note');
    }
}

/// Minimize: always collapse to the compact header-bar state.
/// Saves inline dimensions first so the CSS .collapsed rules can take effect.
/// The eye button handles expanding again from there.
function minimizeNotepad() {
    const notepad = document.getElementById('floatingNotepad');
    // Save any inline dimensions before clearing them
    if (notepad.style.width)  notepad.dataset.savedWidth  = notepad.style.width;
    if (notepad.style.height) notepad.dataset.savedHeight = notepad.style.height;
    notepad.style.width  = '';
    notepad.style.height = '';

    notepad.classList.remove('minimized');
    notepad.classList.add('collapsed');
    document.getElementById('eyeOpen').style.display = 'none';
    document.getElementById('eyeClosed').style.display = '';
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
