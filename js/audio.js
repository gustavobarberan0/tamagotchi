/**
 * Sistema de audio para Tamagotchi Ultimate - VERSIÓN CORREGIDA
 * Con manejo de AudioContext y políticas de autoplay
 */
class TamagotchiAudio {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.initialized = false;
        this.volume = 0.3;
        this.pendingTones = [];
        this.isResuming = false;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Verificar estado del contexto
            if (this.audioContext.state === 'suspended') {
                console.log('🔇 AudioContext suspendido. Esperando interacción del usuario...');
                
                // Escuchar eventos de usuario para reanudar
                const resumeEvents = ['click', 'touchstart', 'keydown', 'touchend'];
                const resumeAudio = () => {
                    if (this.audioContext && this.audioContext.state === 'suspended') {
                        this.audioContext.resume().then(() => {
                            console.log('🔊 AudioContext reanudado');
                            // Reproducir tonos pendientes
                            this.processPendingTones();
                        }).catch(err => {
                            console.warn('No se pudo reanudar el audio:', err);
                        });
                    }
                    // Remover listeners después de la primera interacción
                    resumeEvents.forEach(event => {
                        document.removeEventListener(event, resumeAudio);
                    });
                };
                
                resumeEvents.forEach(event => {
                    document.addEventListener(event, resumeAudio, { once: true });
                });
            }
            
            this.initialized = true;
            console.log('🔊 Sistema de audio inicializado');
        } catch (e) {
            console.warn('⚠️ Web Audio API no soportada o bloqueada:', e);
            this.enabled = false;
            this.initialized = false;
        }
    }

    isAvailable() {
        return this.enabled && this.initialized && this.audioContext !== null;
    }

    isReady() {
        return this.isAvailable() && this.audioContext.state === 'running';
    }

    processPendingTones() {
        if (this.pendingTones.length > 0 && this.isReady()) {
            const tones = [...this.pendingTones];
            this.pendingTones = [];
            tones.forEach(({ frequency, duration, type, volume }) => {
                this.playTone(frequency, duration, type, volume);
            });
        }
    }

    ensureAudioReady() {
        if (!this.isAvailable()) return false;
        
        if (this.audioContext.state === 'suspended') {
            // Intentar reanudar
            try {
                this.audioContext.resume();
                return false; // No está listo aún
            } catch (e) {
                return false;
            }
        }
        return this.audioContext.state === 'running';
    }

    playTone(frequency, duration, type = 'sine', volume = null) {
        if (!this.isAvailable()) return;

        // Si el contexto no está listo, guardar el tono para después
        if (this.audioContext.state !== 'running') {
            this.pendingTones.push({ frequency, duration, type, volume: volume !== null ? volume : this.volume });
            
            // Intentar reanudar
            if (this.audioContext.state === 'suspended') {
                try {
                    this.audioContext.resume();
                } catch (e) {
                    // Silenciar error
                }
            }
            return;
        }

        try {
            const vol = volume !== null ? volume : this.volume;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.linearRampToValueAtTime(vol, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (e) {
            console.debug('Error reproduciendo tono:', e);
        }
    }

    playChord(frequencies, duration, type = 'sine', volume = 0.2) {
        if (!this.isAvailable()) return;
        if (this.audioContext.state !== 'running') {
            frequencies.forEach(freq => {
                this.pendingTones.push({ frequency: freq, duration, type, volume });
            });
            return;
        }

        try {
            frequencies.forEach(freq => {
                this.playTone(freq, duration, type, volume);
            });
        } catch (e) {
            console.debug('Error reproduciendo acorde:', e);
        }
    }

    // ============================================
    // SONIDOS ESPECÍFICOS - Con verificación de estado
    // ============================================
    
    playFeed() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 523.25, duration: 0.08, type: 'sine', volume: 0.25 });
            this.pendingTones.push({ frequency: 659.25, duration: 0.08, type: 'sine', volume: 0.25 });
            this.pendingTones.push({ frequency: 783.99, duration: 0.15, type: 'sine', volume: 0.2 });
            return;
        }
        this.playTone(523.25, 0.08, 'sine', 0.25);
        setTimeout(() => this.playTone(659.25, 0.08, 'sine', 0.25), 80);
        setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.2), 160);
    }

    playPlay() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            const notes = [440, 554.37, 659.25, 880, 659.25, 554.37];
            notes.forEach((note, i) => {
                this.pendingTones.push({ frequency: note, duration: 0.1, type: 'square', volume: 0.15 });
            });
            return;
        }
        const notes = [440, 554.37, 659.25, 880, 659.25, 554.37];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.1, 'square', 0.15), i * 120);
        });
    }

    playSleep() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 200, duration: 0.4, type: 'sine', volume: 0.15 });
            this.pendingTones.push({ frequency: 150, duration: 0.4, type: 'sine', volume: 0.12 });
            this.pendingTones.push({ frequency: 100, duration: 0.6, type: 'sine', volume: 0.1 });
            return;
        }
        this.playTone(200, 0.4, 'sine', 0.15);
        setTimeout(() => this.playTone(150, 0.4, 'sine', 0.12), 300);
        setTimeout(() => this.playTone(100, 0.6, 'sine', 0.1), 600);
    }

    playClean() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 800, duration: 0.08, type: 'sine', volume: 0.15 });
            this.pendingTones.push({ frequency: 1000, duration: 0.08, type: 'sine', volume: 0.15 });
            this.pendingTones.push({ frequency: 1200, duration: 0.12, type: 'sine', volume: 0.12 });
            return;
        }
        this.playTone(800, 0.08, 'sine', 0.15);
        setTimeout(() => this.playTone(1000, 0.08, 'sine', 0.15), 80);
        setTimeout(() => this.playTone(1200, 0.12, 'sine', 0.12), 160);
    }

    playTrain() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 300, duration: 0.12, type: 'sawtooth', volume: 0.15 });
            this.pendingTones.push({ frequency: 400, duration: 0.12, type: 'sawtooth', volume: 0.15 });
            this.pendingTones.push({ frequency: 500, duration: 0.15, type: 'sawtooth', volume: 0.12 });
            return;
        }
        this.playTone(300, 0.12, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(400, 0.12, 'sawtooth', 0.15), 120);
        setTimeout(() => this.playTone(500, 0.15, 'sawtooth', 0.12), 240);
    }

    playPet() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 440, duration: 0.25, type: 'sine', volume: 0.12 });
            this.pendingTones.push({ frequency: 550, duration: 0.25, type: 'sine', volume: 0.12 });
            this.pendingTones.push({ frequency: 660, duration: 0.25, type: 'sine', volume: 0.12 });
            this.pendingTones.push({ frequency: 550, duration: 0.3, type: 'sine', volume: 0.1 });
            this.pendingTones.push({ frequency: 660, duration: 0.3, type: 'sine', volume: 0.1 });
            this.pendingTones.push({ frequency: 770, duration: 0.3, type: 'sine', volume: 0.1 });
            return;
        }
        this.playChord([440, 550, 660], 0.25, 'sine', 0.12);
        setTimeout(() => this.playChord([550, 660, 770], 0.3, 'sine', 0.1), 200);
    }

    playDeath() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 400, duration: 0.25, type: 'sawtooth', volume: 0.25 });
            this.pendingTones.push({ frequency: 300, duration: 0.25, type: 'sawtooth', volume: 0.2 });
            this.pendingTones.push({ frequency: 200, duration: 0.4, type: 'sawtooth', volume: 0.15 });
            this.pendingTones.push({ frequency: 150, duration: 0.5, type: 'sine', volume: 0.1 });
            return;
        }
        this.playTone(400, 0.25, 'sawtooth', 0.25);
        setTimeout(() => this.playTone(300, 0.25, 'sawtooth', 0.2), 250);
        setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.15), 500);
        setTimeout(() => this.playTone(150, 0.5, 'sine', 0.1), 750);
    }

    playBirth() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((note, i) => {
                this.pendingTones.push({ frequency: note, duration: 0.12, type: 'sine', volume: 0.25 });
            });
            this.pendingTones.push({ frequency: 783.99, duration: 0.1, type: 'sine', volume: 0.2 });
            this.pendingTones.push({ frequency: 659.25, duration: 0.1, type: 'sine', volume: 0.2 });
            this.pendingTones.push({ frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.2 });
            return;
        }
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.12, 'sine', 0.25), i * 140);
        });
        setTimeout(() => {
            [783.99, 659.25, 523.25].forEach((note, i) => {
                setTimeout(() => this.playTone(note, 0.1, 'sine', 0.2), i * 100);
            });
        }, notes.length * 140 + 100);
    }

    playEvolution() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            const notes = [523.25, 587.33, 659.25, 783.99, 1046.50];
            notes.forEach((note, i) => {
                this.pendingTones.push({ frequency: note, duration: 0.12, type: 'sine', volume: 0.22 });
            });
            this.pendingTones.push({ frequency: 523.25, duration: 0.3, type: 'sine', volume: 0.15 });
            this.pendingTones.push({ frequency: 659.25, duration: 0.3, type: 'sine', volume: 0.15 });
            this.pendingTones.push({ frequency: 783.99, duration: 0.3, type: 'sine', volume: 0.15 });
            this.pendingTones.push({ frequency: 1046.50, duration: 0.3, type: 'sine', volume: 0.15 });
            return;
        }
        const notes = [523.25, 587.33, 659.25, 783.99, 1046.50];
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 0.12, 'sine', 0.22), index * 140);
        });
        setTimeout(() => {
            this.playChord([523.25, 659.25, 783.99, 1046.50], 0.3, 'sine', 0.15);
        }, notes.length * 140 + 100);
    }

    playWarning() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 440, duration: 0.15, type: 'square', volume: 0.2 });
            this.pendingTones.push({ frequency: 440, duration: 0.15, type: 'square', volume: 0.2 });
            this.pendingTones.push({ frequency: 440, duration: 0.3, type: 'square', volume: 0.15 });
            return;
        }
        this.playTone(440, 0.15, 'square', 0.2);
        setTimeout(() => this.playTone(440, 0.15, 'square', 0.2), 250);
        setTimeout(() => this.playTone(440, 0.3, 'square', 0.15), 500);
    }

    playButtonClick() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 800, duration: 0.04, type: 'sine', volume: 0.1 });
            return;
        }
        this.playTone(800, 0.04, 'sine', 0.1);
    }

    playWin() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 523.25, duration: 0.15, type: 'sine', volume: 0.2 });
            this.pendingTones.push({ frequency: 659.25, duration: 0.15, type: 'sine', volume: 0.2 });
            this.pendingTones.push({ frequency: 783.99, duration: 0.15, type: 'sine', volume: 0.2 });
            this.pendingTones.push({ frequency: 659.25, duration: 0.2, type: 'sine', volume: 0.2 });
            this.pendingTones.push({ frequency: 783.99, duration: 0.2, type: 'sine', volume: 0.2 });
            this.pendingTones.push({ frequency: 1046.50, duration: 0.2, type: 'sine', volume: 0.2 });
            return;
        }
        this.playChord([523.25, 659.25, 783.99], 0.15, 'sine', 0.2);
        setTimeout(() => this.playChord([659.25, 783.99, 1046.50], 0.2, 'sine', 0.2), 150);
    }

    playLose() {
        if (!this.isAvailable()) return;
        if (!this.ensureAudioReady()) {
            this.pendingTones.push({ frequency: 400, duration: 0.2, type: 'sawtooth', volume: 0.15 });
            this.pendingTones.push({ frequency: 350, duration: 0.2, type: 'sawtooth', volume: 0.15 });
            this.pendingTones.push({ frequency: 300, duration: 0.3, type: 'sawtooth', volume: 0.12 });
            return;
        }
        this.playTone(400, 0.2, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(350, 0.2, 'sawtooth', 0.15), 200);
        setTimeout(() => this.playTone(300, 0.3, 'sawtooth', 0.12), 400);
    }

    toggleSound() {
        this.enabled = !this.enabled;
        
        if (this.enabled && !this.initialized) {
            this.initAudioContext();
        }
        
        // Si se activa el sonido, intentar reanudar el contexto
        if (this.enabled && this.audioContext && this.audioContext.state === 'suspended') {
            try {
                this.audioContext.resume();
            } catch (e) {
                // Silenciar error
            }
        }
        
        const message = this.enabled ? 'Sonido activado' : 'Sonido desactivado';
        const announcer = document.getElementById('messageArea');
        if (announcer) {
            announcer.setAttribute('aria-live', 'polite');
            announcer.textContent = message;
        }
        
        return this.enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// Instancia global del sistema de audio
const audio = new TamagotchiAudio();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = audio;
}