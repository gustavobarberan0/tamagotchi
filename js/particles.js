/**
 * Sistema de Partículas para Tamagotchi Ultimate
 * Con soporte para reducción de movimiento
 */
class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.isActive = false;
        this.animationFrame = null;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Escuchar cambios en preferencia de movimiento
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.reducedMotion = e.matches;
            if (this.reducedMotion && this.isActive) {
                this.clear();
            }
        });
    }

    /**
     * Inicia el sistema de partículas
     */
    start(type = 'happy') {
        // Si el usuario prefiere movimiento reducido, no mostrar partículas
        if (this.reducedMotion) {
            return;
        }
        
        this.isActive = true;
        this.clear();
        
        const colors = {
            happy: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#f093fb', '#a29bfe'],
            sad: ['#6b6bff', '#8b8bff', '#a0a0ff', '#4a4a8a'],
            sleep: ['#4a4a6a', '#5a5a7a', '#6a6a8a', '#3a3a5a'],
            celebration: ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff', '#f093fb', '#a29bfe', '#ff9ff3'],
            love: ['#ff6b6b', '#ff4757', '#ff6348', '#ff7979']
        };

        const colorSet = colors[type] || colors.happy;
        const count = type === 'celebration' ? 35 : type === 'love' ? 25 : 18;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.setAttribute('aria-hidden', 'true');
            
            const size = 4 + Math.random() * 10;
            const color = colorSet[Math.floor(Math.random() * colorSet.length)];
            const isCircle = Math.random() > 0.5;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${isCircle ? '50%' : '2px'};
                pointer-events: none;
                left: ${20 + Math.random() * 60}%;
                top: ${20 + Math.random() * 60}%;
                opacity: 1;
                box-shadow: 0 0 15px ${color}60;
                will-change: transform, opacity;
            `;
            
            this.container.appendChild(particle);
            
            this.particles.push({
                element: particle,
                x: parseFloat(particle.style.left),
                y: parseFloat(particle.style.top),
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 - 2,
                life: 1,
                decay: 0.005 + Math.random() * 0.015,
                size: size,
                color: color,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 4
            });
        }

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.animate();
    }

    /**
     * Anima las partículas
     */
    animate() {
        if (!this.isActive || this.reducedMotion) return;

        let hasLivingParticles = false;

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.life -= p.decay;
            p.rotation += p.rotationSpeed;
            
            if (p.life > 0) {
                hasLivingParticles = true;
                p.element.style.left = p.x + '%';
                p.element.style.top = p.y + '%';
                p.element.style.opacity = p.life;
                p.element.style.transform = `scale(${p.life}) rotate(${p.rotation}deg)`;
                p.element.style.width = (p.size * p.life) + 'px';
                p.element.style.height = (p.size * p.life) + 'px';
            } else {
                p.element.style.opacity = 0;
            }
        });

        if (hasLivingParticles) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.clear();
        }
    }

    /**
     * Limpia todas las partículas
     */
    clear() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.particles.forEach(p => {
            if (p.element && p.element.parentNode) {
                p.element.remove();
            }
        });
        this.particles = [];
    }

    /**
     * Tipos de partículas predefinidos
     */
    celebration() {
        this.start('celebration');
    }

    happy() {
        this.start('happy');
    }

    sad() {
        this.start('sad');
    }

    sleep() {
        this.start('sleep');
    }

    love() {
        this.start('love');
    }

    /**
     * Efecto de lluvia de estrellas
     */
    stars(count = 20) {
        if (this.reducedMotion) return;
        
        this.clear();
        this.isActive = true;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.setAttribute('aria-hidden', 'true');
            
            const size = 2 + Math.random() * 4;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: #ffffff;
                border-radius: 50%;
                pointer-events: none;
                left: ${Math.random() * 100}%;
                top: ${-10 + Math.random() * 5}%;
                opacity: 0.8;
                box-shadow: 0 0 10px #ffffff80;
                will-change: transform, opacity;
            `;
            
            this.container.appendChild(particle);
            
            this.particles.push({
                element: particle,
                x: parseFloat(particle.style.left),
                y: parseFloat(particle.style.top),
                vx: (Math.random() - 0.5) * 0.5,
                vy: 1 + Math.random() * 2,
                life: 1,
                decay: 0.005 + Math.random() * 0.01,
                size: size,
                color: '#ffffff',
                rotation: 0,
                rotationSpeed: 0
            });
        }
        
        this.animate();
    }

    /**
     * Efecto de corazones
     */
    hearts(count = 15) {
        if (this.reducedMotion) return;
        
        this.clear();
        this.isActive = true;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.setAttribute('aria-hidden', 'true');
            particle.textContent = '❤️';
            
            const size = 16 + Math.random() * 20;
            
            particle.style.cssText = `
                position: absolute;
                font-size: ${size}px;
                pointer-events: none;
                left: ${20 + Math.random() * 60}%;
                top: ${20 + Math.random() * 60}%;
                opacity: 0.8;
                will-change: transform, opacity;
            `;
            
            this.container.appendChild(particle);
            
            this.particles.push({
                element: particle,
                x: parseFloat(particle.style.left),
                y: parseFloat(particle.style.top),
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3 - 2,
                life: 1,
                decay: 0.008 + Math.random() * 0.012,
                size: size,
                color: '#ff6b6b',
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 3
            });
        }
        
        this.animate();
    }
}

// Instancia global del sistema de partículas
let particleSystem = null;

function initParticles(container) {
    particleSystem = new ParticleSystem(container);
    return particleSystem;
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParticleSystem, initParticles };
}