class CursorDots {
    constructor() {
        this.canvas = document.getElementById('mouse-dots-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 };
        this.isMouseDown = false;
        
        // Colors from our cyberpunk palette
        this.colors = [
            '#00f0ff', // neon blue
            '#ff007f', // neon pink
            '#05ff60', // neon green
            '#eaff00', // neon yellow
            '#ff5d00'  // neon orange
        ];

        this.particles = [];
        this.explosions = [];
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        
        // Create 15 spring particles with varying properties
        const numParticles = 15;
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            this.particles.push({
                x: this.mouse.x,
                y: this.mouse.y,
                vx: 0,
                vy: 0,
                // Orbit parameters for when mouse is static
                orbitRadius: 10 + Math.random() * 25,
                orbitSpeed: 0.02 + Math.random() * 0.03,
                orbitAngle: angle,
                
                // Spring physics parameters
                spring: 0.08 + (i * 0.01), // different spring constants make them stretch out
                friction: 0.85 - (i * 0.005),
                size: 6 + Math.random() * 8, // sizes range from 6px to 14px
                color: this.colors[i % this.colors.length],
                glowColor: this.colors[i % this.colors.length] + '80' // hex + alpha
            });
        }

        // Expose particle count for diagnostics
        const particleDiag = document.getElementById('diag-particles');
        if (particleDiag) {
            particleDiag.textContent = this.particles.length.toString();
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = e.clientX;
            this.mouse.targetY = e.clientY;
            
            // Diagnostic print
            const mxDiag = document.getElementById('diag-mx');
            const myDiag = document.getElementById('diag-my');
            if (mxDiag) mxDiag.textContent = Math.round(e.clientX).toString();
            if (myDiag) myDiag.textContent = Math.round(e.clientY).toString();
        });

        window.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.triggerExplosion(e.clientX, e.clientY);
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        // Touch support
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.targetX = e.touches[0].clientX;
                this.mouse.targetY = e.touches[0].clientY;
            }
        }, { passive: true });
        
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.isMouseDown = true;
                this.mouse.targetX = e.touches[0].clientX;
                this.mouse.targetY = e.touches[0].clientY;
                this.triggerExplosion(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });
    }

    triggerExplosion(x, y) {
        // Create 20 little sparks flying out
        const count = 20;
        const speedMultiplier = this.isMouseDown ? 6 : 3;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * speedMultiplier;
            this.explosions.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                size: 2 + Math.random() * 3
            });
        }
    }

    updateAndRender(time) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Ease main mouse position
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.25;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.25;

        const isMouseMoving = Math.abs(this.mouse.targetX - this.mouse.x) > 2 || 
                               Math.abs(this.mouse.targetY - this.mouse.y) > 2;

        // 2. Update and Draw Spring Swarm
        this.particles.forEach((p, index) => {
            p.orbitAngle += p.orbitSpeed;
            
            // Calculate orbital offset to make them swarm when mouse is still
            let targetX, targetY;
            
            if (isMouseMoving) {
                // If moving fast, follow the cursor directly with slight delay
                targetX = this.mouse.x;
                targetY = this.mouse.y;
            } else {
                // If static, hover in an orbital swarm around mouse
                targetX = this.mouse.x + Math.cos(p.orbitAngle) * p.orbitRadius;
                targetY = this.mouse.y + Math.sin(p.orbitAngle) * p.orbitRadius;
            }

            // Spring Physics logic: acceleration = (target - position) * spring
            const ax = (targetX - p.x) * p.spring;
            const ay = (targetY - p.y) * p.spring;
            
            p.vx += ax;
            p.vy += ay;
            p.vx *= p.friction;
            p.vy *= p.friction;
            
            p.x += p.vx;
            p.y += p.vy;

            // Draw glowing trailing lines between particles (spring thread effect)
            if (index > 0) {
                const prev = this.particles[index - 1];
                this.ctx.beginPath();
                this.ctx.strokeStyle = p.color + '15'; // Very transparent line
                this.ctx.lineWidth = p.size / 3;
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(prev.x, prev.y);
                this.ctx.stroke();
            }

            // Draw Particle Glow
            this.ctx.beginPath();
            const radGrad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
            radGrad.addColorStop(0, p.color);
            radGrad.addColorStop(0.3, p.color + '60');
            radGrad.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = radGrad;
            // Draw circle
            this.ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw Core Dot
            this.ctx.beginPath();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.arc(p.x, p.y, p.size / 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 3. Update and Draw Click Explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.x += exp.vx;
            exp.y += exp.vy;
            exp.vy += 0.05; // tiny gravity on explosion particles
            exp.alpha -= exp.decay;

            if (exp.alpha <= 0) {
                this.explosions.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.fillStyle = exp.color;
            this.ctx.globalAlpha = exp.alpha;
            
            // Draw spark with outer glow
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = exp.color;
            this.ctx.arc(exp.x, exp.y, exp.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Reset canvas context states
        this.ctx.globalAlpha = 1.0;
    }
}
window.CursorDots = CursorDots;
