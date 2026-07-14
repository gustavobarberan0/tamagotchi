/**
 * Clase principal de Tamagotchi - Versión Corregida
 */
class Tamagotchi {
    constructor(name = 'Tamagotchi') {
        this.name = name;
        this.hunger = 100;
        this.energy = 100;
        this.happiness = 100;
        this.age = 0;
        this.weight = 10;
        this.discipline = 50;
        this.generation = 1;
        this.isAlive = true;
        this.isSleeping = false;
        this.lastUpdate = Date.now();
        this.birthTime = Date.now();
        this.mood = 'happy';
        this.evolutionStage = 0;
        this.evolutionName = 'Bebé';
        this.friendship = 0;
        this.totalCare = 0;
        this.minigameWins = 0;
        this.itemsPurchased = 0;
        this.coins = 50;
        this.specialMoves = [];
        this.actionCooldowns = {
            feed: 0,
            play: 0,
            sleep: 0,
            clean: 0,
            train: 0,
            pet: 0,
            medicine: 0
        };
        this.sick = false;
        this.poopCount = 0;
        this.maxPoop = 3;
        this.inventory = {
            food: 0,
            toy: 0,
            energy: 0,
            skin: 0
        };
        this.skinColor = '#7fc97f';
        this.skinSecondary = '#4a8f4a';
        this.theme = 'dark';
        this.sleepTime = null; // Para rastrear cuándo empezó a dormir
    }

    // ============================================
    // MÉTODOS PRINCIPALES
    // ============================================
    
    feed() {
        if (!this.isAlive) return { message: '💀 Ya no está con nosotros...', success: false };
        if (this.isSleeping) return { message: '😴 Está durmiendo...', success: false };
        if (this.actionCooldowns.feed > 0) return { message: `⏳ Espera ${Math.ceil(this.actionCooldowns.feed)}s`, success: false };
        
        let bonus = 0;
        if (this.inventory.food > 0) {
            this.inventory.food--;
            bonus = 10;
        }
        
        this.hunger = Math.min(100, this.hunger + 20 + bonus);
        this.weight += 0.3;
        this.happiness = Math.min(100, this.happiness + 5);
        this.totalCare++;
        this.friendship += 2;
        this.coins = (this.coins || 0) + 1;
        this.updateMood();
        this.setCooldown('feed', 5);
        
        return { 
            message: `🍖 ¡Ñam! +${20 + bonus} hambre${bonus > 0 ? ' (Premium)' : ''}`, 
            success: true 
        };
    }

    play() {
        if (!this.isAlive) return { message: '💀 Ya no está con nosotros...', success: false };
        if (this.isSleeping) return { message: '😴 Está durmiendo...', success: false };
        if (this.actionCooldowns.play > 0) return { message: `⏳ Espera ${Math.ceil(this.actionCooldowns.play)}s`, success: false };
        if (this.energy < 20) return { message: '😫 ¡Está muy cansado para jugar!', success: false };
        
        this.happiness = Math.min(100, this.happiness + 25);
        this.energy = Math.max(0, this.energy - 15);
        this.hunger = Math.max(0, this.hunger - 10);
        this.totalCare++;
        this.friendship += 3;
        this.weight = Math.max(5, this.weight - 0.2);
        this.coins = (this.coins || 0) + 2;
        this.updateMood();
        this.setCooldown('play', 8);
        
        return { message: '🎮 ¡Qué divertido! +25 felicidad', success: true };
    }

    sleep() {
        if (!this.isAlive) return { message: '💀 Ya no está con nosotros...', success: false };
        if (this.actionCooldowns.sleep > 0 && !this.isSleeping) return { message: `⏳ Espera ${Math.ceil(this.actionCooldowns.sleep)}s`, success: false };
        
        if (this.isSleeping) {
            // Verificar si ya pasó el tiempo mínimo para despertar
            const sleepRemaining = this.getSleepRemaining();
            if (sleepRemaining !== null && sleepRemaining > 0) {
                return { message: `😴 Aún duerme. Faltan ${this.formatSleepTime(sleepRemaining)}`, success: false };
            }
            this.isSleeping = false;
            this.energy = Math.min(100, this.energy + 40);
            this.updateMood();
            this.setCooldown('sleep', 30);
            this.sleepTime = null; // Limpiar tiempo de sueño al despertar
            return { message: '🌅 ¡Buenos días! +40 energía', success: true };
        }
        
        this.isSleeping = true;
        this.sleepTime = Date.now(); // Guardar cuándo empezó a dormir
        this.energy = Math.min(100, this.energy + 10);
        this.setCooldown('sleep', 60);
        return { message: '😴 Zzz... durmiendo profundamente', success: true };
    }

    /**
     * Despierta a la mascota (alias para sleep cuando está durmiendo)
     */
    wakeUp() {
        return this.sleep();
    }

    /**
     * Obtiene el tiempo restante para despertar (en segundos)
     */
    getSleepRemaining() {
        if (!this.isSleeping || !this.sleepTime) return null;
        const sleepDuration = 60000; // 60 segundos
        const elapsed = Date.now() - this.sleepTime;
        const remaining = Math.max(0, Math.ceil((sleepDuration - elapsed) / 1000));
        return remaining;
    }

    /**
     * Formatea el tiempo restante para mostrarlo
     */
    formatSleepTime(seconds) {
        if (seconds === null) return '';
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }

    clean() {
        if (!this.isAlive) return { message: '💀 Ya no está con nosotros...', success: false };
        if (this.isSleeping) return { message: '😴 Está durmiendo...', success: false };
        if (this.actionCooldowns.clean > 0) return { message: `⏳ Espera ${Math.ceil(this.actionCooldowns.clean)}s`, success: false };
        
        this.happiness = Math.min(100, this.happiness + 15);
        this.poopCount = Math.max(0, this.poopCount - 1);
        this.totalCare++;
        this.coins = (this.coins || 0) + 1;
        this.setCooldown('clean', 10);
        
        return { message: '🧹 ¡Quedó limpio y brillante!', success: true };
    }

    train() {
        if (!this.isAlive) return { message: '💀 Ya no está con nosotros...', success: false };
        if (this.isSleeping) return { message: '😴 Está durmiendo...', success: false };
        if (this.actionCooldowns.train > 0) return { message: `⏳ Espera ${Math.ceil(this.actionCooldowns.train)}s`, success: false };
        if (this.energy < 30) return { message: '😫 Está muy cansado para entrenar', success: false };
        
        this.discipline = Math.min(100, this.discipline + 15);
        this.energy = Math.max(0, this.energy - 20);
        this.happiness = Math.max(0, this.happiness - 5);
        this.totalCare++;
        this.coins = (this.coins || 0) + 3;
        this.setCooldown('train', 12);
        
        return { 
            message: this.discipline > 80 ? '🏋️ ¡Muy disciplinado!' : '🏋️ ¡Entrenamiento completado!', 
            success: true 
        };
    }

    pet() {
        if (!this.isAlive) return { message: '💀 Ya no está con nosotros...', success: false };
        if (this.isSleeping) return { message: '😴 Está durmiendo...', success: false };
        if (this.actionCooldowns.pet > 0) return { message: `⏳ Espera ${Math.ceil(this.actionCooldowns.pet)}s`, success: false };
        
        this.happiness = Math.min(100, this.happiness + 10);
        this.friendship += 5;
        this.totalCare++;
        this.coins = (this.coins || 0) + 1;
        this.setCooldown('pet', 15);
        
        return { message: '🤗 ¡Le encanta que lo acaricies!', success: true };
    }

    medicine() {
        if (!this.isAlive) return { message: '💀 Ya no está con nosotros...', success: false };
        if (this.isSleeping) return { message: '😴 Está durmiendo...', success: false };
        if (this.actionCooldowns.medicine > 0) return { message: `⏳ Espera ${Math.ceil(this.actionCooldowns.medicine)}s`, success: false };
        if (!this.sick) return { message: '💊 No está enfermo', success: false };
        
        this.sick = false;
        this.happiness = Math.min(100, this.happiness + 10);
        this.totalCare++;
        this.setCooldown('medicine', 60);
        
        return { message: '💊 ¡Se curó!', success: true };
    }

    // ============================================
    // MÉTODOS DE TIENDA
    // ============================================
    
    buyItem(item) {
        const prices = {
            food: 50,
            toy: 30,
            energy: 40,
            skin: 100
        };

        if (this.coins < prices[item]) {
            return { message: '❌ No tienes suficientes monedas', success: false };
        }

        if (!this.inventory) {
            this.inventory = { food: 0, toy: 0, energy: 0, skin: 0 };
        }

        this.coins -= prices[item];
        this.inventory[item] = (this.inventory[item] || 0) + 1;
        this.itemsPurchased = (this.itemsPurchased || 0) + 1;

        if (item === 'skin') {
            // Aplicar skin inmediatamente - cambiar colores aleatoriamente
            const skins = [
                { primary: '#ff6b6b', secondary: '#c0392b' }, // Rojo
                { primary: '#4d96ff', secondary: '#2b5797' }, // Azul
                { primary: '#ffd93d', secondary: '#f39c12' }, // Amarillo
                { primary: '#6bcb77', secondary: '#27ae60' }, // Verde
                { primary: '#f093fb', secondary: '#8e44ad' }, // Morado
                { primary: '#ff9ff3', secondary: '#e84393' }, // Rosa
                { primary: '#a29bfe', secondary: '#6c5ce7' }  // Lavanda
            ];
            const randomSkin = skins[Math.floor(Math.random() * skins.length)];
            this.skinColor = randomSkin.primary;
            this.skinSecondary = randomSkin.secondary;
        } else {
            switch(item) {
                case 'food':
                    this.hunger = Math.min(100, this.hunger + 30);
                    this.happiness = Math.min(100, this.happiness + 5);
                    break;
                case 'toy':
                    this.happiness = Math.min(100, this.happiness + 20);
                    break;
                case 'energy':
                    this.energy = Math.min(100, this.energy + 25);
                    break;
            }
            this.totalCare++;
        }

        return { 
            message: item === 'skin' ? '✅ ¡Skin aplicada!' : `✅ ¡Artículo comprado!`, 
            success: true,
            item: item
        };
    }

    // ============================================
    // MÉTODOS DE ACTUALIZACIÓN
    // ============================================
    
    update() {
        if (!this.isAlive) return;
        
        const now = Date.now();
        const deltaMinutes = (now - this.lastUpdate) / (1000 * 60);
        this.lastUpdate = now;

        if (deltaMinutes < 0.1) {
            this.updateCooldowns();
            return;
        }

        const hungerDecrease = deltaMinutes * 2.5;
        const energyDecrease = deltaMinutes * 1.8;
        const happinessDecrease = deltaMinutes * 1.5;

        this.hunger = Math.max(0, this.hunger - hungerDecrease);
        this.energy = Math.max(0, this.energy - energyDecrease);
        
        if (!this.isSleeping) {
            this.happiness = Math.max(0, this.happiness - happinessDecrease);
        } else {
            this.energy = Math.min(100, this.energy + deltaMinutes * 0.8);
        }

        const newAge = Math.floor((now - this.birthTime) / (1000 * 60 * 3));
        if (newAge > this.age) {
            this.age = newAge;
            this.checkEvolution();
        }

        if (Math.random() < 0.01 && this.poopCount < this.maxPoop) {
            this.poopCount++;
        }

        if (this.hunger < 30 || this.happiness < 30) {
            if (Math.random() < 0.01) {
                this.sick = true;
            }
        } else {
            this.sick = false;
        }

        this.updateMood();
        this.updateCooldowns();

        if (this.hunger <= 0 || this.happiness <= 0 || this.age > 100) {
            this.isAlive = false;
            this.mood = 'dead';
        }

        if (this.weight > 30 || this.weight < 3) {
            this.isAlive = false;
            this.mood = 'dead';
        }
    }

    updateMood() {
        if (!this.isAlive) {
            this.mood = 'dead';
            return;
        }

        if (this.isSleeping) {
            this.mood = 'sleeping';
            return;
        }

        if (this.sick) {
            this.mood = 'sick';
            return;
        }

        const avg = (this.hunger + this.energy + this.happiness) / 3;
        
        if (avg > 80) this.mood = 'happy';
        else if (avg > 60) this.mood = 'neutral';
        else if (avg > 30) this.mood = 'sad';
        else this.mood = 'very-sad';
    }

    checkEvolution() {
        const oldStage = this.evolutionStage;
        
        if (this.age >= 70) {
            this.evolutionStage = 4;
            this.evolutionName = 'Rey Dino';
        } else if (this.age >= 40) {
            this.evolutionStage = 3;
            this.evolutionName = 'T-Rex';
        } else if (this.age >= 20) {
            this.evolutionStage = 2;
            this.evolutionName = 'Raptor';
        } else if (this.age >= 10) {
            this.evolutionStage = 1;
            this.evolutionName = 'Dino Joven';
        } else {
            this.evolutionStage = 0;
            this.evolutionName = 'Bebé';
        }

        if (oldStage !== this.evolutionStage && this.isAlive) {
            this.totalCare += 10;
            return true;
        }
        return false;
    }

    // ============================================
    // MÉTODOS DE COOLDOWN
    // ============================================
    
    setCooldown(action, seconds) {
        this.actionCooldowns[action] = seconds;
    }

    updateCooldowns() {
        for (let key in this.actionCooldowns) {
            if (this.actionCooldowns[key] > 0) {
                this.actionCooldowns[key] -= 0.1;
                if (this.actionCooldowns[key] < 0) this.actionCooldowns[key] = 0;
            }
        }
    }

    // ============================================
    // MÉTODOS DE ESTADO Y EMOJI
    // ============================================
    
    getEmoji() {
        if (!this.isAlive) return '🦴';
        if (this.isSleeping) return '😴';
        if (this.sick) return '🤒';
        
        // Emojis de dinosaurio para las etapas de evolución
        const stages = ['🦕', '🐉', '🦖', '🦎', '🐲'];
        let emoji = stages[Math.min(this.evolutionStage, stages.length - 1)];
        
        if (this.poopCount > 0) emoji = '💩' + emoji;
        
        switch(this.mood) {
            case 'happy': return emoji + '✨';
            case 'sad': return '😢';
            case 'very-sad': return '😭';
            case 'neutral': return '😐';
            default: return emoji;
        }
    }

    getState() {
        return {
            name: this.name,
            hunger: Math.round(this.hunger),
            energy: Math.round(this.energy),
            happiness: Math.round(this.happiness),
            age: this.age,
            weight: Math.round(this.weight * 10) / 10,
            discipline: Math.round(this.discipline),
            generation: this.generation,
            isAlive: this.isAlive,
            isSleeping: this.isSleeping,
            mood: this.mood,
            emoji: this.getEmoji(),
            evolutionStage: this.evolutionStage,
            evolutionName: this.evolutionName,
            friendship: Math.round(this.friendship),
            totalCare: this.totalCare,
            sick: this.sick,
            poopCount: this.poopCount,
            coins: this.coins || 0,
            inventory: this.inventory,
            actionCooldowns: { ...this.actionCooldowns },
            lastUpdate: this.lastUpdate,
            birthTime: this.birthTime,
            skinColor: this.skinColor,
            skinSecondary: this.skinSecondary,
            sleepTime: this.sleepTime
        };
    }

    // ============================================
    // MÉTODOS DE GUARDADO
    // ============================================
    
    save() {
        try {
            const state = this.getState();
            localStorage.setItem('tamagotchiData', JSON.stringify(state));
            return true;
        } catch (e) {
            console.error('Error al guardar:', e);
            return false;
        }
    }

    static load() {
        try {
            const data = localStorage.getItem('tamagotchiData');
            if (!data) return null;
            
            const state = JSON.parse(data);
            const tamagotchi = new Tamagotchi(state.name || 'Tamagotchi');
            
            // Restaurar todas las propiedades
            Object.keys(state).forEach(key => {
                if (key !== 'emoji' && key !== 'actionCooldowns') {
                    tamagotchi[key] = state[key];
                }
            });
            
            // Restaurar cooldowns si existen
            if (state.actionCooldowns) {
                tamagotchi.actionCooldowns = { ...state.actionCooldowns };
            }
            
            // Asegurar que existan propiedades necesarias
            if (!tamagotchi.inventory) tamagotchi.inventory = { food: 0, toy: 0, energy: 0, skin: 0 };
            if (!tamagotchi.actionCooldowns) {
                tamagotchi.actionCooldowns = {
                    feed: 0, play: 0, sleep: 0, clean: 0, train: 0, pet: 0, medicine: 0
                };
            }
            
            // Restaurar fechas
            tamagotchi.lastUpdate = state.lastUpdate || Date.now();
            tamagotchi.birthTime = state.birthTime || Date.now();
            
            return tamagotchi;
        } catch (e) {
            console.error('Error al cargar:', e);
            return null;
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.Tamagotchi = Tamagotchi;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tamagotchi;
}