/**
 * Portal manager for showcasing websites.
 * Dynamically renders, filters, and loads websites into the iframe sandbox HUD.
 */

const SHOWCASE_DATA = [
    {
        id: 'cyber-snake',
        title: 'CYBER_SNAKE v1.0',
        badge: 'GAME',
        category: 'game',
        desc: 'A glowing retro-arcade snake game built in pure HTML5 canvas. Features responsive keyboard controls, accelerating difficulty, and neon collision particle explosions.',
        url: 'showcases/cyber-snake.html',
        status: 'LOCAL_NODE_ONLINE',
        isLocal: true,
        icon: '🐍'
    },
    {
        id: 'vector-field',
        title: 'VECTOR_FIELD SIMULATOR',
        badge: 'TOOL',
        category: 'tool',
        desc: 'An interactive mathematical vector field flow simulator. Drag to inject wind currents, adjust gravity/drag coefficients, and watch 5,000 glowing nodes warp in real-time.',
        url: 'showcases/vector-field.html',
        status: 'LOCAL_NODE_ONLINE',
        isLocal: true,
        icon: '🌌'
    },
    {
        id: 'hardware-dossier',
        title: 'SYSTEM_HARDWARE DOSSIER',
        badge: 'INFO',
        category: 'info',
        desc: 'A hardware profiling matrix queries active browser APIs. Inspects WebGL extensions, battery depletion status, CPU logical cores, audio latency, and screen coordinates.',
        url: 'showcases/hardware-dossier.html',
        status: 'LOCAL_NODE_ONLINE',
        isLocal: true,
        icon: '🛡️'
    },
    {
        id: 'antigravity-google',
        title: 'ANTIGRAVITY GOOGLE',
        badge: 'INFO',
        category: 'info',
        desc: 'An interactive gravity playground. A tribute to floating particles, weightless DOM units, and experimental Web UI aesthetics.',
        url: 'https://antigravity.google/',
        status: 'EXTERNAL_LINK',
        isLocal: false,
        icon: '🛸'
    },
    {
        id: 'js13k-games',
        title: 'JS13K_GAMES ARCHIVE',
        badge: 'GAME',
        category: 'game',
        desc: 'An archive showcasing ultra-optimized Web games built in under 13 Kilobytes of JS code. Demonstrates high-performance procedural rendering.',
        url: 'https://js13kgames.com/',
        status: 'EXTERNAL_LINK',
        isLocal: false,
        icon: '👾'
    },
    {
        id: 'shadertoy',
        title: 'SHADERTOY GRAPHICS',
        badge: 'TOOL',
        category: 'tool',
        desc: 'An online community of WebGL pixel fragment shader experiments. Renders photorealistic 3D ray-marched terrains and fluid dynamics directly in the GPU.',
        url: 'https://www.shadertoy.com/embed/MsX3DN?gui=true&t=10&paused=false&muted=true',
        status: 'EXTERNAL_IFRAME',
        isLocal: false,
        icon: '🎨'
    }
];

class PortalManager {
    constructor(glitchManager) {
        this.glitchManager = glitchManager;
        this.grid = document.getElementById('portal-grid');
        this.searchInput = document.getElementById('portal-search');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        
        // Iframe Modal Elements
        this.modal = document.getElementById('iframe-modal');
        this.iframe = document.getElementById('portal-iframe');
        this.modalTitle = document.getElementById('iframe-title');
        this.modalClose = document.getElementById('iframe-close');
        this.modalOpenTab = document.getElementById('iframe-open-tab');
        
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.activeIframeUrl = '';
        
        this.init();
    }

    init() {
        this.renderGrid();
        this.setupFilters();
        this.setupSearch();
        this.setupModal();
    }

    setupFilters() {
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.glitchManager.playClick();
                this.filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                this.currentFilter = tab.getAttribute('data-filter');
                this.renderGrid();
            });
        });
    }

    setupSearch() {
        this.searchInput.addEventListener('input', (e) => {
            this.glitchManager.playKeystroke();
            this.currentSearch = e.target.value.toLowerCase();
            this.renderGrid();
        });
    }

    setupModal() {
        this.modalClose.addEventListener('click', () => {
            this.glitchManager.playClick();
            this.closeModal();
        });

        // Close on escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.closeModal();
            }
        });

        this.modalOpenTab.addEventListener('click', () => {
            this.glitchManager.playClick();
            if (this.activeIframeUrl) {
                window.open(this.activeIframeUrl, '_blank');
            }
        });
    }

    openModal(item) {
        this.glitchManager.playLaserSweep();
        this.activeIframeUrl = item.url;
        this.modalTitle.textContent = `NEURAL_LINK // connecting to ${item.title}...`;
        this.iframe.src = item.url;
        
        this.modal.style.display = 'flex';
        
        // Simulating progressive loading texts in HUD
        let statusTexts = [
            'CONNECTING PORT...',
            'ESTABLISHING SHIELD MATRIX...',
            'BYPASSING INTRUSION DETECTION...',
            'NEURAL_LINK ESTABLISHED'
        ];
        
        const statusEl = document.getElementById('iframe-status-text');
        let index = 0;
        
        const interval = setInterval(() => {
            if (statusEl && index < statusTexts.length) {
                statusEl.textContent = statusTexts[index];
                statusEl.style.color = index === statusTexts.length - 1 ? 'var(--neon-green)' : 'var(--neon-yellow)';
                index++;
            } else {
                clearInterval(interval);
            }
        }, 150.0);
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.iframe.src = '';
        this.activeIframeUrl = '';
    }

    renderGrid() {
        this.grid.innerHTML = '';
        
        const filtered = SHOWCASE_DATA.filter(item => {
            const matchesCategory = this.currentFilter === 'all' || item.category === this.currentFilter;
            const matchesSearch = item.title.toLowerCase().includes(this.currentSearch) || 
                                  item.desc.toLowerCase().includes(this.currentSearch) ||
                                  item.badge.toLowerCase().includes(this.currentSearch);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            this.grid.innerHTML = `
                <div class="no-results-msg" style="grid-column: 1/-1; text-align: center; padding: 40px; font-family: var(--font-mono); color: var(--neon-pink); text-shadow: 0 0 5px var(--neon-pink-glow)">
                    > ERROR: NO NODES MATCHING SEARCH METADATA
                </div>
            `;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = `portal-card ${item.category}`;
            card.id = `card-${item.id}`;
            
            card.innerHTML = `
                <div class="card-header-image">
                    <span class="card-badge">${item.badge}</span>
                    <div class="card-icon-container">
                        <span style="font-size: 24px;">${item.icon}</span>
                    </div>
                </div>
                <div class="card-body">
                    <h4 class="card-title">${item.title}</h4>
                    <p class="card-desc">${item.desc}</p>
                </div>
                <div class="card-footer">
                    <div class="node-status">
                        <span class="status-dot"></span>
                        <span>${item.status}</span>
                    </div>
                    <button class="launch-btn" id="btn-${item.id}">LAUNCH</button>
                </div>
            `;

            // Hover sounds & card triggers
            card.addEventListener('mouseenter', () => {
                this.glitchManager.playClick();
            });

            const launchBtn = card.querySelector('.launch-btn');
            launchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.isLocal || item.id === 'shadertoy') {
                    this.openModal(item);
                } else {
                    this.glitchManager.playLaserSweep();
                    window.open(item.url, '_blank');
                }
            });

            this.grid.appendChild(card);
        });
    }
}
window.SHOWCASE_DATA = SHOWCASE_DATA;
window.PortalManager = PortalManager;
