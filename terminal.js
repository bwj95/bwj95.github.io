/**
 * Terminal Manager.
 * Implements a hidden root shell that parses interactive retro commands,
 * triggers glitch alarms, and handles the portal gravity physics override.
 */

class TerminalManager {
    constructor(glitchManager) {
        this.glitchManager = glitchManager;
        
        // Terminal DOM Elements
        this.overlay = document.getElementById('terminal-overlay');
        this.body = document.getElementById('terminal-body');
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.toggleBtn = document.getElementById('terminal-toggle');
        this.closeBtn = document.getElementById('terminal-close');
        
        // Physics items for the gravity cheat code
        this.physicsActive = false;
        this.physicsItems = [];
        this.physicsRAF = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle terminal with button
        this.toggleBtn.addEventListener('click', () => {
            this.glitchManager.playClick();
            this.toggleTerminal();
        });

        // Close button
        this.closeBtn.addEventListener('click', () => {
            this.glitchManager.playClick();
            this.toggleTerminal(false);
        });

        // Toggle with backtick key (`)
        window.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                e.preventDefault();
                this.glitchManager.playClick();
                this.toggleTerminal();
            }
        });

        // Parse command input
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                this.input.value = '';
                if (cmd) {
                    this.executeCommand(cmd);
                }
            } else {
                // Keystroke typing sound
                this.glitchManager.playKeystroke();
            }
        });

        // Close on clicking outside terminal window
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.toggleTerminal(false);
            }
        });
    }

    toggleTerminal(forceState) {
        const show = forceState !== undefined ? forceState : (this.overlay.style.display !== 'flex');
        
        if (show) {
            this.overlay.style.display = 'flex';
            this.input.focus();
            // Scroll to bottom
            this.body.scrollTop = this.body.scrollHeight;
        } else {
            this.overlay.style.display = 'none';
        }
    }

    printLine(text, type = 'info') {
        const p = document.createElement('p');
        
        if (type === 'cmd') {
            p.innerHTML = `<span class="prompt">root@neonexus:~$</span> <span class="cmd-text">${text}</span>`;
        } else if (type === 'error') {
            p.className = 'error-text';
            p.textContent = `[!] ERROR: ${text}`;
        } else if (type === 'success') {
            p.style.color = 'var(--neon-green)';
            p.textContent = text;
        } else if (type === 'warning') {
            p.style.color = 'var(--neon-yellow)';
            p.textContent = text;
        } else {
            p.innerHTML = text;
        }
        
        this.output.appendChild(p);
        this.body.scrollTop = this.body.scrollHeight;
    }

    executeCommand(cmdString) {
        this.printLine(cmdString, 'cmd');
        
        const parts = cmdString.toLowerCase().split(' ');
        const mainCmd = parts[0];
        const args = parts.slice(1);

        switch (mainCmd) {
            case 'help':
                this.cmdHelp();
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'matrix':
                this.cmdMatrix();
                break;
            case 'gravity':
                this.cmdGravity();
                break;
            case 'glitch':
                this.cmdGlitch();
                break;
            case 'nodes':
                this.cmdNodes();
                break;
            case 'launch':
                this.cmdLaunch(args);
                break;
            case 'beep':
                this.cmdBeep(args);
                break;
            case 'about':
                this.cmdAbout();
                break;
            case 'exit':
                this.toggleTerminal(false);
                break;
            default:
                this.glitchManager.playError();
                this.printLine(`Command not found: "${mainCmd}". Type "help" for active protocols.`, 'error');
        }
    }

    cmdHelp() {
        this.printLine('----------------------------------------------------');
        this.printLine('NEONEXUS SHELL // DIRECTORY OF CAPABILITIES:');
        this.printLine('  <span class="highlight">help</span>               Display this operational manifest.');
        this.printLine('  <span class="highlight">clear</span>              Purge logs from memory bank.');
        this.printLine('  <span class="highlight">about</span>              Print architecture history dossier.');
        this.printLine('  <span class="highlight">nodes</span>              Query registered website nodes.');
        this.printLine('  <span class="highlight">launch [node-id]</span>   Inject neural-link modal overlay for node.');
        this.printLine('  <span class="highlight">matrix</span>             Toggle Matrix override cascading colorway.');
        this.printLine('  <span class="highlight">gravity</span>            [WARNING] Disrupt grid gravity stabilizer.');
        this.printLine('  <span class="highlight">glitch</span>             Simulate electromagnetic impulse shield burst.');
        this.printLine('  <span class="highlight">beep [pitch]</span>       Synthesize tone generator (sound check).');
        this.printLine('  <span class="highlight">exit</span>               Logout from shell terminal.');
        this.printLine('----------------------------------------------------');
    }

    cmdAbout() {
        this.printLine('NODE IDENTIFIER: NEONEXUS v2.6.0');
        this.printLine('INFRASTRUCTURE: 100% Client-Side Modern Sandbox.');
        this.printLine('DESIGN PARAMETERS: HTML5 Custom Elements / ESM Modules / Canvas API.');
        this.printLine('AUDIO ENGINE: Web Audio API Oscillator Synth Core.');
        this.printLine('PORTAL GOAL: Showcase visual and computing paradigms possible in a bare browser sandbox without middleware.');
    }

    cmdMatrix() {
        this.glitchManager.playLaserSweep();
        const body = document.body;
        const isMatrix = body.classList.toggle('matrix-mode');
        this.printLine(`MATRIX MATRIX OVERRIDE: ${isMatrix ? 'ENABLED' : 'DISABLED'}.`, 'success');
    }

    cmdGlitch() {
        this.glitchManager.triggerFullscreenGlitch();
        this.printLine('Electromagnetic pulse discharged. Shield systems rebooting.', 'warning');
    }

    cmdNodes() {
        this.printLine('FETCHING CORE DIRECTORY DATABASE...', 'warning');
        window.SHOWCASE_DATA.forEach((item, index) => {
            this.printLine(`  [${index}] <span class="highlight">${item.id}</span> - ${item.title} (${item.badge})`);
        });
    }

    cmdLaunch(args) {
        if (!args[0]) {
            this.printLine('Launch error: Must specify [node-id] or index. Example: "launch cyber-snake"', 'error');
            return;
        }

        let node = window.SHOWCASE_DATA.find(n => n.id === args[0]);
        if (!node) {
            const index = parseInt(args[0], 10);
            if (!isNaN(index) && index >= 0 && index < window.SHOWCASE_DATA.length) {
                node = window.SHOWCASE_DATA[index];
            }
        }

        if (node) {
            this.printLine(`Establishing connection matrix to "${node.title}"...`, 'success');
            setTimeout(() => {
                this.toggleTerminal(false);
                // Trigger button launch
                const btn = document.getElementById(`btn-${node.id}`);
                if (btn) btn.click();
            }, 800);
        } else {
            this.printLine(`Unknown node target: "${args[0]}". Run "nodes" for database.`, 'error');
        }
    }

    cmdBeep(args) {
        const pitch = args[0] ? parseFloat(args[0]) : 600;
        if (isNaN(pitch) || pitch < 50 || pitch > 5000) {
            this.printLine('Invalid pitch. Choose between 50 and 5000 Hz.', 'error');
            return;
        }
        this.glitchManager.playBeep(pitch, 0.4, 'sine');
        this.printLine(`Frequency synthesized at ${pitch} Hz.`, 'success');
    }

    cmdGravity() {
        this.glitchManager.playLaserSweep();
        if (this.physicsActive) {
            this.disableGravityPhysics();
            this.printLine('Gravity stabilizer grids restored. Grid aligned.', 'success');
        } else {
            this.enableGravityPhysics();
            this.printLine('GRAVITY GENERATOR BLOWN. CARDS DETACHING!', 'error');
            this.printLine('Tip: You can click, drag, and toss the cards around!', 'warning');
        }
    }

    enableGravityPhysics() {
        this.physicsActive = true;
        this.physicsItems = [];
        
        const cards = document.querySelectorAll('.portal-card');
        const container = document.getElementById('portal-grid');
        
        if (cards.length === 0) return;
        
        // Hide standard grid behavior temporarily
        container.style.display = 'block';
        container.style.position = 'relative';
        container.style.height = container.clientHeight + 'px';

        cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const parentRect = container.getBoundingClientRect();

            // Set positions relative to container
            const x = rect.left - parentRect.left;
            const y = rect.top - parentRect.top;
            const w = rect.width;
            const h = rect.height;

            card.style.width = w + 'px';
            card.style.height = h + 'px';
            card.style.position = 'absolute';
            card.style.left = '0px';
            card.style.top = '0px';
            card.style.margin = '0px';
            card.classList.add('falling-card');
            
            // Random velocities
            const vx = (Math.random() - 0.5) * 8;
            const vy = -Math.random() * 12 - 4;
            const rotation = 0;
            const vrotation = (Math.random() - 0.5) * 0.05;

            const physItem = {
                element: card,
                x, y, vx, vy, w, h,
                rotation, vrotation,
                isDragging: false,
                dragStartX: 0,
                dragStartY: 0,
                lastMouseX: 0,
                lastMouseY: 0,
                mouseVx: 0,
                mouseVy: 0
            };

            this.setupDragOnCard(physItem);
            this.physicsItems.push(physItem);
        });

        this.animatePhysics();
    }

    disableGravityPhysics() {
        this.physicsActive = false;
        if (this.physicsRAF) {
            cancelAnimationFrame(this.physicsRAF);
        }

        const cards = document.querySelectorAll('.portal-card');
        const container = document.getElementById('portal-grid');

        // Reset elements back to grid CSS
        container.style.display = '';
        container.style.position = '';
        container.style.height = '';

        cards.forEach(card => {
            card.style.width = '';
            card.style.height = '';
            card.style.position = '';
            card.style.left = '';
            card.style.top = '';
            card.style.transform = '';
            card.classList.remove('falling-card');
            
            // Remove dragging listeners
            const clone = card.cloneNode(true);
            card.parentNode.replaceChild(clone, card);
        });

        // Re-init portal grid trigger bindings since clones deleted the event listeners
        // This is handled in main.js/portal.js via re-rendering
        document.dispatchEvent(new CustomEvent('rebind-portal'));
    }

    setupDragOnCard(item) {
        const el = item.element;
        
        const onMouseDown = (e) => {
            e.preventDefault();
            this.glitchManager.playClick();
            item.isDragging = true;
            
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            const containerRect = document.getElementById('portal-grid').getBoundingClientRect();
            item.dragStartX = clientX - containerRect.left - item.x;
            item.dragStartY = clientY - containerRect.top - item.y;
            
            item.lastMouseX = clientX;
            item.lastMouseY = clientY;
            item.mouseVx = 0;
            item.mouseVy = 0;
            
            item.vx = 0;
            item.vy = 0;
            item.vrotation = 0;
            
            el.style.zIndex = '2000';
        };

        const onMouseMove = (e) => {
            if (!item.isDragging) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if (clientX === undefined) return;
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            const containerRect = document.getElementById('portal-grid').getBoundingClientRect();
            
            item.x = clientX - containerRect.left - item.dragStartX;
            item.y = clientY - containerRect.top - item.dragStartY;
            
            // Calculate mouse velocity for throwing
            item.mouseVx = clientX - item.lastMouseX;
            item.mouseVy = clientY - item.lastMouseY;
            
            item.lastMouseX = clientX;
            item.lastMouseY = clientY;
        };

        const onMouseUp = () => {
            if (!item.isDragging) return;
            item.isDragging = false;
            
            // Throw!
            item.vx = item.mouseVx * 0.8;
            item.vy = item.mouseVy * 0.8;
            item.vrotation = (Math.random() - 0.5) * 0.05 + (item.mouseVx * 0.002);
            
            el.style.zIndex = '1000';
        };

        el.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        // Mobile touch support
        el.addEventListener('touchstart', onMouseDown, { passive: false });
        window.addEventListener('touchmove', onMouseMove, { passive: false });
        window.addEventListener('touchend', onMouseUp);
    }

    animatePhysics() {
        if (!this.physicsActive) return;

        const container = document.getElementById('portal-grid');
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const gravityForce = 0.45;
        const frictionAir = 0.99;
        const bounceCoeff = 0.55;

        this.physicsItems.forEach(item => {
            if (item.isDragging) {
                // Pos updated in event listeners, keep velocity at 0
                item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0px) rotate(0deg)`;
                return;
            }

            // Apply gravity
            item.vy += gravityForce;
            
            // Apply air resistance
            item.vx *= frictionAir;
            item.vy *= frictionAir;
            item.vrotation *= frictionAir;

            // Apply velocities
            item.x += item.vx;
            item.y += item.vy;
            item.rotation += item.vrotation;

            // Collision: Bottom Edge
            if (item.y + item.h >= containerH) {
                item.y = containerH - item.h;
                item.vy = -item.vy * bounceCoeff;
                item.vx *= 0.75; // ground friction
                item.vrotation = (Math.random() - 0.5) * 0.05; // tiny impact roll
                
                // Play tiny impact click if velocity is noticeable
                if (Math.abs(item.vy) > 2) {
                    this.glitchManager.playClick();
                }
            }

            // Collision: Top Edge (ceiling bounce)
            if (item.y <= 0) {
                item.y = 0;
                item.vy = -item.vy * bounceCoeff;
            }

            // Collision: Left Edge
            if (item.x <= 0) {
                item.x = 0;
                item.vx = -item.vx * bounceCoeff;
            }

            // Collision: Right Edge
            if (item.x + item.w >= containerW) {
                item.x = containerW - item.w;
                item.vx = -item.vx * bounceCoeff;
            }

            // Render transform updates
            item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0px) rotate(${item.rotation}rad)`;
        });

        this.physicsRAF = requestAnimationFrame(() => this.animatePhysics());
    }
}
window.TerminalManager = TerminalManager;
