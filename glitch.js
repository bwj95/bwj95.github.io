class GlitchManager {
    constructor() {
        this.audioCtx = null;
        this.audioEnabled = false;
        this.glitchOverlay = document.getElementById('glitch-overlay');
        
        this.glitchTexts = document.querySelectorAll('.glitch-text');
        this.originalTexts = new Map();
        
        this.init();
        this.setupAudioControls();
    }

    init() {
        // Record original text for glitch effects
        this.glitchTexts.forEach(el => {
            this.originalTexts.set(el, el.textContent);
        });

        // Periodically trigger text glitches
        setInterval(() => {
            if (Math.random() < 0.2) {
                const elementArray = Array.from(this.glitchTexts);
                if (elementArray.length > 0) {
                    const randomEl = elementArray[Math.floor(Math.random() * elementArray.length)];
                    this.textGlitch(randomEl);
                }
            }
        }, 1500);

        // Random full screen visual glitches
        setInterval(() => {
            if (Math.random() < 0.05) {
                this.triggerFullscreenGlitch();
            }
        }, 4000);
    }

    setupAudioControls() {
        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                this.audioEnabled = !this.audioEnabled;
                if (this.audioEnabled) {
                    audioBtn.classList.remove('off');
                    audioBtn.classList.add('on');
                    audioBtn.textContent = 'ON';
                    
                    // Lazy-init audio context (browser requirement for user interaction)
                    if (!this.audioCtx) {
                        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    }
                    this.audioCtx.resume();
                    this.playBeep(440, 0.15, 'sine'); // startup sound
                } else {
                    audioBtn.classList.remove('on');
                    audioBtn.classList.add('off');
                    audioBtn.textContent = 'OFF';
                    if (this.audioCtx) {
                        this.audioCtx.suspend();
                    }
                }
            });
        }
    }

    // Audio Synthesizer Methods
    playBeep(frequency = 600, duration = 0.1, type = 'sine') {
        if (!this.audioEnabled || !this.audioCtx) return;
        
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
            
            // Envelope
            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            console.error('Audio synthesis failed:', e);
        }
    }

    playClick() {
        this.playBeep(800 + Math.random() * 400, 0.05, 'sine');
    }

    playKeystroke() {
        this.playBeep(1200 + Math.random() * 200, 0.03, 'sine');
    }

    playError() {
        if (!this.audioEnabled || !this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, this.audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(80, this.audioCtx.currentTime + 0.3);
            
            gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.3);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.3);
        } catch (e) {
            console.error(e);
        }
    }

    playLaserSweep() {
        if (!this.audioEnabled || !this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1800, this.audioCtx.currentTime + 0.6);
            
            gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.6);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.6);
        } catch (e) {
            console.error(e);
        }
    }

    playGlitchStatic() {
        if (!this.audioEnabled || !this.audioCtx) return;
        try {
            // Generate white noise buffer
            const bufferSize = this.audioCtx.sampleRate * 0.15; // 0.15s
            const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000 + Math.random() * 1500;
            
            const gain = this.audioCtx.createGain();
            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.15);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            noise.start();
        } catch (e) {
            console.error(e);
        }
    }

    // Visual Glitch Methods
    triggerFullscreenGlitch() {
        if (this.glitchOverlay) {
            this.glitchOverlay.style.opacity = '1';
            this.playGlitchStatic();
            
            setTimeout(() => {
                this.glitchOverlay.style.opacity = '0';
            }, 60 + Math.random() * 80);
            
            // Add a tiny random shake to body
            document.body.classList.add('active-shake');
            setTimeout(() => {
                document.body.classList.remove('active-shake');
            }, 200);
        }
    }

    textGlitch(element) {
        const originalText = this.originalTexts.get(element);
        if (!originalText) return;

        const chars = '01#$&%*@_-=+?X█▓░';
        let iterations = 0;
        
        const interval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (char === ' ') return ' ';
                    if (index < iterations) return originalText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
            
            iterations += 1 / 2;
            if (iterations >= originalText.length) {
                element.textContent = originalText;
                clearInterval(interval);
            }
        }, 30);
    }
}
window.GlitchManager = GlitchManager;
