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

    // Service Card Expansion Logic
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const isExpanded = card.classList.contains('expanded');
            
            // Close all other cards
            serviceCards.forEach(c => c.classList.remove('expanded'));
            
            // If the clicked card wasn't expanded, expand it
            if (!isExpanded) {
                card.classList.add('expanded');
            }
        });
    });

    // Form submission handling (Mock)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            
            btn.textContent = 'Sending...';
            btn.style.opacity = '0.7';
            
            // Mock API delay
            setTimeout(() => {
                btn.textContent = 'Message Sent!';
                btn.style.backgroundColor = '#10b981'; // Green
                contactForm.reset();
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.opacity = '';
                }, 3000);
            }, 1500);
        });
    }

    // Scroll Effects for Navigation
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Initialize notepad and theme on load
    setTheme(localStorage.getItem('aura-theme') || 'water');
    initNotepad();
});

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
