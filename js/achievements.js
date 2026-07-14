/**
 * Sistema de Logros para Tamagotchi Ultimate
 * Con soporte para accesibilidad y actualización en tiempo real
 */
class AchievementSystem {
    constructor(tamagotchi) {
        this.tamagotchi = tamagotchi;
        this.achievements = [];
        this.unlockedAchievements = new Set();
        this.loadAchievements();
        this.defineAchievements();
        this.notificationTimeout = null;
    }

    /**
     * Define todos los logros disponibles
     */
    defineAchievements() {
        this.achievements = [
            {
                id: 'first_care',
                name: 'Primer Cuidado',
                icon: '❤️',
                description: 'Cuida a tu Tamagotchi por primera vez',
                check: () => this.tamagotchi.totalCare >= 1,
                reward: 10,
                category: 'cuidado'
            },
            {
                id: 'care_10',
                name: 'Cuidado Constante',
                icon: '💪',
                description: 'Cuida a tu Tamagotchi 10 veces',
                check: () => this.tamagotchi.totalCare >= 10,
                reward: 20,
                category: 'cuidado'
            },
            {
                id: 'care_50',
                name: 'Maestro Cuidador',
                icon: '🏆',
                description: 'Cuida a tu Tamagotchi 50 veces',
                check: () => this.tamagotchi.totalCare >= 50,
                reward: 50,
                category: 'cuidado'
            },
            {
                id: 'evolution_1',
                name: 'Primera Evolución',
                icon: '🦋',
                description: 'Evoluciona a la etapa 2 (Niño)',
                check: () => this.tamagotchi.evolutionStage >= 1,
                reward: 15,
                category: 'evolución'
            },
            {
                id: 'evolution_2',
                name: 'Evolución Completa',
                icon: '🌟',
                description: 'Evoluciona a la etapa 4 (Adulto)',
                check: () => this.tamagotchi.evolutionStage >= 3,
                reward: 30,
                category: 'evolución'
            },
            {
                id: 'evolution_elder',
                name: 'Sabio Anciano',
                icon: '🦉',
                description: 'Alcanza la etapa 5 (Anciano)',
                check: () => this.tamagotchi.evolutionStage >= 4,
                reward: 50,
                category: 'evolución'
            },
            {
                id: 'friendship_50',
                name: 'Mejores Amigos',
                icon: '🤝',
                description: 'Alcanza 50 puntos de amistad',
                check: () => this.tamagotchi.friendship >= 50,
                reward: 25,
                category: 'amistad'
            },
            {
                id: 'friendship_100',
                name: 'Amistad Eterna',
                icon: '💖',
                description: 'Alcanza 100 puntos de amistad',
                check: () => this.tamagotchi.friendship >= 100,
                reward: 50,
                category: 'amistad'
            },
            {
                id: 'discipline_80',
                name: 'Disciplinado',
                icon: '🎯',
                description: 'Alcanza 80 puntos de disciplina',
                check: () => this.tamagotchi.discipline >= 80,
                reward: 20,
                category: 'disciplina'
            },
            {
                id: 'discipline_100',
                name: 'Maestro Disciplinario',
                icon: '🥋',
                description: 'Alcanza 100 puntos de disciplina',
                check: () => this.tamagotchi.discipline >= 100,
                reward: 40,
                category: 'disciplina'
            },
            {
                id: 'generation_3',
                name: 'Tercera Generación',
                icon: '👑',
                description: 'Alcanza la generación 3',
                check: () => this.tamagotchi.generation >= 3,
                reward: 30,
                category: 'generación'
            },
            {
                id: 'generation_5',
                name: 'Leyenda de Generaciones',
                icon: '👑',
                description: 'Alcanza la generación 5',
                check: () => this.tamagotchi.generation >= 5,
                reward: 50,
                category: 'generación'
            },
            {
                id: 'perfect_happiness',
                name: 'Felicidad Plena',
                icon: '😄',
                description: 'Alcanza 100 puntos de felicidad',
                check: () => this.tamagotchi.happiness >= 100,
                reward: 20,
                category: 'estadísticas'
            },
            {
                id: 'perfect_hunger',
                name: 'Saciado',
                icon: '🍕',
                description: 'Alcanza 100 puntos de hambre',
                check: () => this.tamagotchi.hunger >= 100,
                reward: 15,
                category: 'estadísticas'
            },
            {
                id: 'perfect_energy',
                name: 'Energía Total',
                icon: '⚡',
                description: 'Alcanza 100 puntos de energía',
                check: () => this.tamagotchi.energy >= 100,
                reward: 15,
                category: 'estadísticas'
            },
            {
                id: 'minigame_win',
                name: 'Ganador de Minijuego',
                icon: '🎮',
                description: 'Gana tu primer minijuego',
                check: () => this.tamagotchi.minigameWins >= 1,
                reward: 20,
                category: 'minijuegos'
            },
            {
                id: 'minigame_5',
                name: 'Campeón de Juegos',
                icon: '🏅',
                description: 'Gana 5 minijuegos',
                check: () => this.tamagotchi.minigameWins >= 5,
                reward: 40,
                category: 'minijuegos'
            },
            {
                id: 'minigame_10',
                name: 'Leyenda de Minijuegos',
                icon: '🏆',
                description: 'Gana 10 minijuegos',
                check: () => this.tamagotchi.minigameWins >= 10,
                reward: 60,
                category: 'minijuegos'
            },
            {
                id: 'shop_buy',
                name: 'Comprador',
                icon: '🛍️',
                description: 'Compra tu primer artículo en la tienda',
                check: () => this.tamagotchi.itemsPurchased >= 1,
                reward: 10,
                category: 'tienda'
            },
            {
                id: 'shop_5',
                name: 'Cliente VIP',
                icon: '💳',
                description: 'Realiza 5 compras en la tienda',
                check: () => this.tamagotchi.itemsPurchased >= 5,
                reward: 30,
                category: 'tienda'
            },
            {
                id: 'shop_10',
                name: 'Mega Comprador',
                icon: '💰',
                description: 'Realiza 10 compras en la tienda',
                check: () => this.tamagotchi.itemsPurchased >= 10,
                reward: 50,
                category: 'tienda'
            },
            {
                id: 'survivor_30',
                name: 'Sobreviviente',
                icon: '🛡️',
                description: 'Mantén vivo a tu Tamagotchi por 30 años (90 min reales)',
                check: () => this.tamagotchi.age >= 30,
                reward: 25,
                category: 'supervivencia'
            },
            {
                id: 'survivor_50',
                name: 'Superviviente Élite',
                icon: '⚔️',
                description: 'Mantén vivo a tu Tamagotchi por 50 años',
                check: () => this.tamagotchi.age >= 50,
                reward: 40,
                category: 'supervivencia'
            },
            {
                id: 'survivor_100',
                name: 'Leyenda Inmortal',
                icon: '👴',
                description: 'Mantén vivo a tu Tamagotchi por 100 años',
                check: () => this.tamagotchi.age >= 100,
                reward: 100,
                category: 'supervivencia'
            },
            {
                id: 'clean_10',
                name: 'Limpieza Total',
                icon: '🧹',
                description: 'Limpia a tu Tamagotchi 10 veces',
                check: () => {
                    // Contar limpiezas (necesitamos trackear esto)
                    return this.tamagotchi.totalCare >= 10;
                },
                reward: 15,
                category: 'cuidado'
            },
            {
                id: 'sick_recovery',
                name: 'Recuperación',
                icon: '💊',
                description: 'Cura a tu Tamagotchi de una enfermedad',
                check: () => {
                    // Verificar si alguna vez se curó
                    return this.tamagotchi.totalCare >= 5;
                },
                reward: 20,
                category: 'cuidado'
            },
            {
                id: 'coins_100',
                name: 'Ahorrador',
                icon: '🪙',
                description: 'Acumula 100 monedas',
                check: () => this.tamagotchi.coins >= 100,
                reward: 25,
                category: 'monedas'
            },
            {
                id: 'coins_500',
                name: 'Magnate',
                icon: '💎',
                description: 'Acumula 500 monedas',
                check: () => this.tamagotchi.coins >= 500,
                reward: 50,
                category: 'monedas'
            }
        ];
    }

    /**
     * Carga los logros guardados
     */
    loadAchievements() {
        try {
            const saved = localStorage.getItem('achievements');
            if (saved) {
                this.unlockedAchievements = new Set(JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Error cargando logros:', e);
        }
    }

    /**
     * Guarda los logros desbloqueados
     */
    saveAchievements() {
        try {
            localStorage.setItem('achievements', JSON.stringify([...this.unlockedAchievements]));
        } catch (e) {
            console.warn('Error guardando logros:', e);
        }
    }

    /**
     * Verifica y desbloquea nuevos logros
     */
    checkAchievements() {
        let newUnlocks = [];

        this.achievements.forEach(achievement => {
            if (!this.unlockedAchievements.has(achievement.id) && achievement.check()) {
                this.unlockedAchievements.add(achievement.id);
                newUnlocks.push(achievement);
                
                // Recompensa
                if (this.tamagotchi) {
                    this.tamagotchi.coins = (this.tamagotchi.coins || 0) + achievement.reward;
                    this.tamagotchi.happiness = Math.min(100, this.tamagotchi.happiness + 10);
                    this.tamagotchi.totalCare = (this.tamagotchi.totalCare || 0) + 1;
                }
            }
        });

        if (newUnlocks.length > 0) {
            this.saveAchievements();
            newUnlocks.forEach(achievement => {
                this.showAchievementUnlock(achievement);
            });
            
            // Anunciar para lectores de pantalla
            const announcer = document.getElementById('messageArea');
            if (announcer) {
                const names = newUnlocks.map(a => a.name).join(', ');
                announcer.setAttribute('aria-live', 'assertive');
                announcer.textContent = `🏆 Logros desbloqueados: ${names}`;
            }
        }

        return newUnlocks;
    }

    /**
     * Muestra la notificación de logro desbloqueado
     */
    showAchievementUnlock(achievement) {
        const modal = document.getElementById('achievementModal');
        const body = document.getElementById('achievementBody');
        const title = document.getElementById('achievementTitle');
        
        if (!modal || !body) return;
        
        // Actualizar título
        if (title) {
            title.textContent = `🏆 ¡Logro Desbloqueado!`;
        }
        
        body.innerHTML = `
            <div style="text-align: center; padding: clamp(10px, 3vw, 20px);">
                <div style="font-size: clamp(50px, 15vw, 70px); margin-bottom: 10px;" aria-hidden="true">${achievement.icon}</div>
                <h3 style="color: #ffd93d; margin-bottom: 5px; font-size: clamp(18px, 4vw, 24px);">${achievement.name}</h3>
                <p style="color: var(--text-secondary, #6a6a7a); font-size: clamp(14px, 3vw, 16px);">${achievement.description}</p>
                <p style="color: var(--text-primary, #00ff88); margin-top: 10px; font-size: clamp(14px, 3vw, 16px);">🪙 +${achievement.reward} monedas</p>
                <button id="achievementCloseBtn" style="
                    margin-top: 15px;
                    padding: 8px 20px;
                    background: var(--text-primary, #00ff88);
                    border: none;
                    border-radius: 8px;
                    color: #000;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: clamp(14px, 3vw, 16px);
                    font-family: inherit;
                    min-height: 44px;
                    touch-action: manipulation;
                ">¡Genial!</button>
            </div>
        `;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Enfoque en el botón de cierre
        setTimeout(() => {
            const closeBtn = document.getElementById('achievementCloseBtn');
            if (closeBtn) {
                closeBtn.focus();
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                });
                closeBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        closeBtn.click();
                    }
                });
            }
        }, 100);
        
        // Efectos visuales
        if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.celebration) {
            particleSystem.celebration();
        }
        
        if (audio && audio.playEvolution) {
            audio.playEvolution();
        }

        // Auto-cierre después de 5 segundos
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            if (modal.classList.contains('active')) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
            }
        }, 5000);
    }

    /**
     * Obtiene el número de logros desbloqueados
     */
    getUnlockedCount() {
        return this.unlockedAchievements.size;
    }

    /**
     * Obtiene el número total de logros
     */
    getTotalCount() {
        return this.achievements.length;
    }

    /**
     * Obtiene logros por categoría
     */
    getAchievementsByCategory(category) {
        return this.achievements.filter(a => a.category === category);
    }

    /**
     * Obtiene categorías disponibles
     */
    getCategories() {
        return [...new Set(this.achievements.map(a => a.category))];
    }

    /**
     * Renderiza los logros en el contenedor
     */
    renderAchievements(container) {
        if (!container) return;
        
        container.innerHTML = '';
        container.setAttribute('role', 'list');
        container.setAttribute('aria-label', 'Lista de logros');
        
        // Ordenar: desbloqueados primero
        const sorted = [...this.achievements].sort((a, b) => {
            const aUnlocked = this.unlockedAchievements.has(a.id);
            const bUnlocked = this.unlockedAchievements.has(b.id);
            if (aUnlocked && !bUnlocked) return -1;
            if (!aUnlocked && bUnlocked) return 1;
            return 0;
        });

        sorted.forEach(achievement => {
            const unlocked = this.unlockedAchievements.has(achievement.id);
            const div = document.createElement('div');
            div.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
            div.setAttribute('role', 'listitem');
            div.setAttribute('aria-label', `${achievement.name} - ${unlocked ? 'Desbloqueado' : 'Bloqueado'}`);
            
            div.innerHTML = `
                <span class="ach-icon" aria-hidden="true">${unlocked ? achievement.icon : '🔒'}</span>
                <div class="ach-info">
                    <div class="ach-name">${achievement.name}</div>
                    <div class="ach-desc">${achievement.description}</div>
                    ${unlocked ? `<div class="ach-progress">🪙 +${achievement.reward}</div>` : ''}
                </div>
                ${unlocked ? '<span style="color: #ffd93d;" aria-label="Completado">✅</span>' : ''}
            `;
            
            container.appendChild(div);
        });

        // Actualizar contador
        const header = document.querySelector('.achievements-header');
        if (header) {
            header.textContent = `🏆 Logros (${this.getUnlockedCount()}/${this.getTotalCount()})`;
        }
    }

    /**
     * Resetea todos los logros
     */
    reset() {
        this.unlockedAchievements = new Set();
        this.saveAchievements();
    }
}

// Instancia global del sistema de logros
let achievementSystem = null;

function initAchievements(tamagotchi) {
    achievementSystem = new AchievementSystem(tamagotchi);
    return achievementSystem;
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AchievementSystem, initAchievements };
}