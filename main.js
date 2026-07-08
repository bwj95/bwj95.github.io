/**
 * Main application coordinator & background grid renderer.
 * Handles the perspective grid animations, FPS counters, clock metrics,
 * and the secret Konami Code cheat listener.
 */

class App {
    constructor() {
        // Initialize managers
        this.glitch = new window.GlitchManager();
        this.dots = new window.CursorDots();
        this.portal = new window.PortalManager(this.glitch);
        this.terminal = new window.TerminalManager(this.glitch);
        
        // Background Grid Canvas
        this.gridCanvas = document.getElementById('bg-grid-canvas');
        this.gridCtx = this.gridCanvas.getContext('2d');
        
        // Parallax variables for grid
        this.mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.scrollOffset = 0;
        this.warpImpulses = []; // waves of click impulses
        
        // Frame rate monitoring
        this.fpsEl = document.getElementById('diag-fps');
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        
        // Konami Code sequence
        this.konamiSequence = [
            'ArrowUp', 'ArrowUp', 
            'ArrowDown', 'ArrowDown', 
            'ArrowLeft', 'ArrowRight', 
            'ArrowLeft', 'ArrowRight', 
            'b', 'a'
        ];
        this.konamiIndex = 0;

        this.init();
    }

    init() {
        this.resizeGrid();
        this.setupEventListeners();
        this.startClock();
        
        // Start animation loop
        requestAnimationFrame((t) => this.tick(t));
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeGrid());
        
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });

        // Click ripple impulses on the grid canvas
        window.addEventListener('click', (e) => {
            // Only trigger warp if not clicking inputs/buttons
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && !e.target.closest('.portal-card')) {
                this.warpImpulses.push({
                    x: e.clientX,
                    y: e.clientY,
                    radius: 0,
                    maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.8,
                    speed: 15,
                    force: 45
                });
            }
        });

        // Rebind portal triggers when gravity physics disables and cards are restored
        document.addEventListener('rebind-portal', () => {
            this.portal.renderGrid();
        });

        // Konami Code Cheat input listener
        window.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key === this.konamiSequence[this.konamiIndex]) {
                this.konamiIndex++;
                if (this.konamiIndex === this.konamiSequence.length) {
                    this.triggerKonamiCode();
                    this.konamiIndex = 0;
                }
            } else {
                this.konamiIndex = 0; // reset sequence on mistake
            }
        });
    }

    resizeGrid() {
        this.gridCanvas.width = window.innerWidth;
        this.gridCanvas.height = window.innerHeight;
    }

    startClock() {
        const timeEl = document.getElementById('time-display');
        const updateTime = () => {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            if (timeEl) {
                timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            }
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    triggerKonamiCode() {
        this.glitch.playLaserSweep();
        this.glitch.triggerFullscreenGlitch();
        this.terminal.toggleTerminal(true);
        this.terminal.printLine('----------------------------------------------------', 'warning');
        this.terminal.printLine('SYSTEM OVERRIDE DETECTED: CHEAT_CODE_ACCEPTED', 'success');
        this.terminal.printLine('INJECTING SYNTH WAVE OVERLOAD INTO BROWSER BUFFERS...', 'success');
        this.terminal.cmdMatrix(); // toggle green matrix mode
        
        // Spawn cards gravity automatically!
        setTimeout(() => {
            this.terminal.cmdGravity();
        }, 1000);
        
        this.terminal.printLine('----------------------------------------------------', 'warning');
    }

    // Main loops
    tick(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        
        // 1. Calculate FPS
        this.frameCount++;
        const delta = timestamp - this.lastTime;
        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta);
            if (this.fpsEl) this.fpsEl.textContent = this.fps.toString();
            this.frameCount = 0;
            this.lastTime = timestamp;
        }

        // 2. Render Background 3D Grid
        this.renderBgGrid(timestamp);

        // 3. Update mouse trailing physics
        this.dots.updateAndRender(timestamp);

        requestAnimationFrame((t) => this.tick(t));
    }

    renderBgGrid(time) {
        const ctx = this.gridCtx;
        const w = this.gridCanvas.width;
        const h = this.gridCanvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Cyberpunk colors
        const activeColor = document.body.classList.contains('matrix-mode') ? '#05ff60' : '#00f0ff';
        
        // Background base radial glow
        const glowGrad = ctx.createRadialGradient(w/2, h/3, 50, w/2, h/3, Math.max(w, h));
        glowGrad.addColorStop(0, '#0a0a19');
        glowGrad.addColorStop(0.5, '#040409');
        glowGrad.addColorStop(1, '#010103');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        // 3D Perspective vanishing point (horizon)
        const horizonY = h * 0.35;
        const vanishingX = w / 2 + (this.mousePos.x - w/2) * 0.08; // subtle parallax
        
        // 1. Update grid scroll speed
        this.scrollOffset += 0.45;
        if (this.scrollOffset > 40) this.scrollOffset = 0;

        // 2. Process warp click impulses
        for (let i = this.warpImpulses.length - 1; i >= 0; i--) {
            const imp = this.warpImpulses[i];
            imp.radius += imp.speed;
            if (imp.radius > imp.maxRadius) {
                this.warpImpulses.splice(i, 1);
            }
        }

        // Drawing helper: apply warp deflection to points
        const getWarpOffset = (x, y) => {
            let dx = 0;
            let dy = 0;
            
            // Warp 1: Mouse cursor gravity/repulsion
            const mx = this.mousePos.x;
            const my = this.mousePos.y;
            const mouseDist = Math.hypot(x - mx, y - my);
            const maxMouseDist = 180;
            
            if (mouseDist < maxMouseDist) {
                const force = (1 - mouseDist / maxMouseDist) * 15;
                const angle = Math.atan2(y - my, x - mx);
                dx += Math.cos(angle) * force;
                dy += Math.sin(angle) * force;
            }

            // Warp 2: Click wave impulses
            this.warpImpulses.forEach(imp => {
                const dist = Math.hypot(x - imp.x, y - imp.y);
                const waveThickness = 60;
                
                if (dist > imp.radius - waveThickness && dist < imp.radius + waveThickness) {
                    const diff = Math.abs(dist - imp.radius);
                    const forceRatio = (1 - diff / waveThickness);
                    const angle = Math.atan2(y - imp.y, x - imp.x);
                    
                    // Wave propagation pushes pixels outward
                    const force = forceRatio * imp.force * (1 - imp.radius / imp.maxRadius);
                    dx += Math.cos(angle) * force;
                    dy += Math.sin(angle) * force;
                }
            });

            return { dx, dy };
        };

        // RENDER: Perspective grid lines
        ctx.strokeStyle = activeColor + '18'; // very light line opacity
        ctx.lineWidth = 1;

        // Draw perspective converging column lines
        const numColumns = 36;
        for (let i = -numColumns; i <= numColumns; i++) {
            ctx.beginPath();
            
            // Start at bottom of screen
            const startX = w / 2 + (i * (w / 12));
            const startY = h;
            
            // Apply warp to start coordinate
            const wStart = getWarpOffset(startX, startY);
            ctx.moveTo(startX + wStart.dx, startY + wStart.dy);
            
            // Horizon point
            const endX = vanishingX + (i * 2);
            const endY = horizonY;
            
            // Intersecting points on line to make them bend organic-like
            const segments = 15;
            for (let s = 1; s <= segments; s++) {
                const ratio = s / segments;
                // Linear interpolation
                const px = startX + (endX - startX) * ratio;
                const py = startY + (endY - startY) * ratio;
                
                const warp = getWarpOffset(px, py);
                ctx.lineTo(px + warp.dx, py + warp.dy);
            }
            
            ctx.stroke();
        }

        // Draw horizontal receding lines
        const numRows = 22;
        for (let i = 0; i < numRows; i++) {
            ctx.beginPath();
            
            // Receding grid math: logarithmic spacing from horizon
            const progress = (i + (this.scrollOffset / 40)) / numRows;
            // Exponential spacing creates 3D depth
            const py = horizonY + (h - horizonY) * Math.pow(progress, 3);
            
            // Draw horizontal row using multi-segmented line to allow bending/warping
            const rowSegments = 30;
            for (let s = 0; s <= rowSegments; s++) {
                const px = (s / rowSegments) * w;
                const warp = getWarpOffset(px, py);
                
                if (s === 0) {
                    ctx.moveTo(px + warp.dx, py + warp.dy);
                } else {
                    ctx.lineTo(px + warp.dx, py + warp.dy);
                }
            }
            
            // Make front-most lines brighter and thicker
            ctx.lineWidth = 1 + Math.pow(progress, 2.5) * 1.5;
            ctx.strokeStyle = activeColor + (Math.floor(8 + Math.pow(progress, 2) * 28).toString(16)).padStart(2, '0');
            ctx.stroke();
        }

        // Horizon line glow separator
        ctx.beginPath();
        ctx.strokeStyle = activeColor + '40';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = activeColor;
        ctx.moveTo(0, horizonY);
        ctx.lineTo(w, horizonY);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
    }
}

// Bootstrap app on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.NEONEXUS_APP = new App();
});
