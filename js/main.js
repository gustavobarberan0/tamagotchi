document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    let tamagotchi = null;
    let updateInterval = null;
    let messageTimeout = null;
    let soundEnabled = true;
    let currentTheme = 'dark';

    // ============================================
    // DETECCIÓN DE DISPOSITIVO MÓVIL
    // ============================================
    function isMobile() {
        return window.innerWidth <= 768 || 
               ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) ||
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function isSmallMobile() {
        return window.innerWidth <= 420;
    }

    // Añadir clase al body para estilos específicos
    if (isMobile()) {
        document.body.classList.add('is-mobile');
    }
    if (isSmallMobile()) {
        document.body.classList.add('is-small-mobile');
    }

    // Escuchar cambios de tamaño/orientación
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 420) {
            document.body.classList.add('is-small-mobile');
        } else {
            document.body.classList.remove('is-small-mobile');
        }
        
        if (window.innerWidth <= 768) {
            document.body.classList.add('is-mobile');
        } else {
            document.body.classList.remove('is-mobile');
        }
    });

    // ============================================
    // ELEMENTOS DEL DOM
    // ============================================
    const elements = {
        hunger: document.getElementById('hunger'),
        energy: document.getElementById('energy'),
        happiness: document.getElementById('happiness'),
        age: document.getElementById('age'),
        weight: document.getElementById('weight'),
        generation: document.getElementById('generation'),
        discipline: document.getElementById('discipline'),
        coins: document.getElementById('coins'),
        coinsDisplay: document.getElementById('coinsDisplay'),
        petName: document.getElementById('petName'),
        petStage: document.getElementById('petStage'),
        petBody: document.getElementById('petBody'),
        petMouth: document.getElementById('petMouth'),
        petBlush: document.getElementById('petBlush'),
        messageArea: document.getElementById('messageArea'),
        messageIcon: document.querySelector('.message-icon'),
        messageText: document.querySelector('.message-text'),
        resetBtn: document.getElementById('resetBtn'),
        saveBtn: document.getElementById('saveBtn'),
        soundToggle: document.getElementById('soundToggle'),
        themeToggle: document.getElementById('themeToggle'),
        exportBtn: document.getElementById('exportBtn'),
        importBtn: document.getElementById('importBtn'),
        ledIndicator: document.getElementById('ledIndicator'),
        hungerFill: document.getElementById('hungerFill'),
        energyFill: document.getElementById('energyFill'),
        happinessFill: document.getElementById('happinessFill'),
        friendshipFill: document.getElementById('friendshipFill'),
        friendshipLevel: document.getElementById('friendshipLevel'),
        leftEye: document.getElementById('leftEye'),
        rightEye: document.getElementById('rightEye'),
        achievementsGrid: document.getElementById('achievementsGrid'),
        notification: document.getElementById('notification')
    };

    // ============================================
    // FUNCIÓN GLOBAL DE NOTIFICACIÓN
    // ============================================
    window.showNotification = function(icon, text, duration = 3000) {
        const notif = elements.notification;
        if (!notif) {
            console.warn('Elemento de notificación no encontrado');
            return;
        }

        const iconEl = notif.querySelector('.notif-icon');
        const textEl = notif.querySelector('.notif-text');
        
        if (iconEl) iconEl.textContent = icon;
        if (textEl) textEl.textContent = text;
        
        notif.classList.add('show');
        notif.setAttribute('role', 'alert');
        
        clearTimeout(notif._timeout);
        notif._timeout = setTimeout(() => {
            notif.classList.remove('show');
        }, duration);
    };

    // ============================================
    // FUNCIONES DE UTILIDAD
    // ============================================
    
    function getElement(id) {
        const el = document.getElementById(id);
        if (!el) console.warn(`Elemento no encontrado: #${id}`);
        return el;
    }

    // ============================================
    // FUNCIONES DE MENSAJE
    // ============================================
    
    function showMessage(text, icon = null) {
        if (!elements.messageIcon || !elements.messageText) return;
        
        if (icon) {
            elements.messageIcon.textContent = icon;
        }
        elements.messageText.textContent = text;
        
        clearTimeout(messageTimeout);
        messageTimeout = setTimeout(() => {
            if (tamagotchi) {
                try {
                    const state = tamagotchi.getState();
                    if (state.isAlive) {
                        const messages = [
                            ['¿Cómo estás hoy?', '😊'],
                            ['¡Cuida de mí!', '❤️'],
                            ['¡Me encanta jugar contigo!', '🎮'],
                            ['¿Tienes algo de comer?', '🍖'],
                            ['¡Estoy feliz!', '😄'],
                            ['¡Dame cariño!', '🤗']
                        ];
                        const random = messages[Math.floor(Math.random() * messages.length)];
                        elements.messageIcon.textContent = random[1];
                        elements.messageText.textContent = random[0];
                    } else {
                        elements.messageIcon.textContent = '💀';
                        elements.messageText.textContent = 'Descansa en paz...';
                    }
                } catch (e) {
                    // Silenciar errores
                }
            }
        }, 4000);
    }

    // ============================================
    // FUNCIONES DE TEMA
    // ============================================
    
    function setTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('tamagotchi-theme', theme);
        if (elements.themeToggle) {
            elements.themeToggle.textContent = theme === 'dark' ? '🌙 Tema' : '☀️ Tema';
        }
        
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === 'dark' ? '#1a1a2e' : '#f0f0f0';
        }
    }

    function toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        window.showNotification('🎨', `Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
    }

    function loadTheme() {
        const saved = localStorage.getItem('tamagotchi-theme');
        if (saved && (saved === 'dark' || saved === 'light')) {
            setTheme(saved);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    }

    // ============================================
    // FUNCIONES DE ACTUALIZACIÓN
    // ============================================
    
    function updateStat(element, value) {
        if (element) {
            element.textContent = Math.round(value);
        }
    }

    function updateProgressBar(element, value) {
        if (element) {
            const rounded = Math.round(Math.min(100, Math.max(0, value)));
            element.style.setProperty('--progress', `${rounded}%`);
            element.style.width = `${rounded}%`;
            element.setAttribute('aria-valuenow', rounded);
        }
    }

    function updateStatColor(element, value) {
        if (!element) return;
        element.classList.remove('danger', 'warning', 'good');
        if (value < 30) element.classList.add('danger');
        else if (value < 60) element.classList.add('warning');
        else element.classList.add('good');
    }

    function updateButtons(state) {
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            const action = btn.dataset.action;
            if (!state || !state.isAlive) {
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');
                return;
            }
            btn.disabled = false;
            btn.setAttribute('aria-disabled', 'false');
            
            const cooldownElement = document.getElementById(`${action}Cooldown`);
            if (cooldownElement && state.actionCooldowns && state.actionCooldowns[action] > 0) {
                const remaining = Math.ceil(state.actionCooldowns[action]);
                cooldownElement.textContent = remaining;
                cooldownElement.classList.add('active');
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');
            } else if (cooldownElement) {
                cooldownElement.classList.remove('active');
                btn.disabled = false;
                btn.setAttribute('aria-disabled', 'false');
            }
        });
    }

    function updatePetAppearance(state) {
        if (!state) return;
        
        const body = elements.petBody;
        const mouth = elements.petMouth;
        const blush = elements.petBlush;
        const leftEye = elements.leftEye;
        const rightEye = elements.rightEye;

        if (!body) return;

        body.className = 'pet-body';
        if (mouth) mouth.className = 'pet-mouth';
        if (blush) blush.className = 'pet-blush';
        if (leftEye) leftEye.className = 'eye left';
        if (rightEye) rightEye.className = 'eye right';

        if (!state.isAlive) {
            body.classList.add('dead');
            body.style.background = 'radial-gradient(circle at 30% 30%, #666, #333)';
            if (mouth) mouth.style.display = 'none';
            if (leftEye) leftEye.style.display = 'none';
            if (rightEye) rightEye.style.display = 'none';
            body.setAttribute('aria-label', 'Mascota fallecida');
            return;
        }

        if (mouth) mouth.style.display = 'block';
        if (leftEye) leftEye.style.display = 'block';
        if (rightEye) rightEye.style.display = 'block';

        let color1, color2;

        switch (state.mood) {
            case 'happy':
                color1 = '#ff6b6b';
                color2 = '#c0392b';
                body.classList.add('happy');
                if (mouth) mouth.classList.add('happy');
                if (blush) blush.classList.add('show');
                if (leftEye) leftEye.classList.remove('closed');
                if (rightEye) rightEye.classList.remove('closed');
                break;
            case 'sad':
            case 'very-sad':
                color1 = '#6b6bff';
                color2 = '#2b2b8a';
                if (mouth) mouth.classList.add('sad');
                if (leftEye) leftEye.classList.remove('closed');
                if (rightEye) rightEye.classList.remove('closed');
                break;
            case 'sleeping':
                color1 = '#7f8c8d';
                color2 = '#2c3e50';
                body.classList.add('sleeping');
                if (mouth) mouth.classList.add('sleeping');
                if (leftEye) leftEye.classList.add('closed');
                if (rightEye) rightEye.classList.add('closed');
                break;
            case 'sick':
                color1 = '#ff6b6b';
                color2 = '#8b0000';
                if (mouth) mouth.classList.add('sad');
                if (leftEye) leftEye.classList.remove('closed');
                if (rightEye) rightEye.classList.remove('closed');
                break;
            default:
                color1 = '#ff6b6b';
                color2 = '#c0392b';
                if (mouth) mouth.classList.add('neutral');
                if (leftEye) leftEye.classList.remove('closed');
                if (rightEye) rightEye.classList.remove('closed');
        }

        // Usar colores personalizados si existen
        if (state.skinColor && state.skinSecondary) {
            color1 = state.skinColor;
            color2 = state.skinSecondary;
        }

        body.style.background = `radial-gradient(circle at 30% 30%, ${color1}, ${color2})`;
        body.setAttribute('aria-label', `Mascota ${state.mood || 'neutral'}`);
        
        const size = 100 + (state.evolutionStage * 10);
        body.style.width = size + 'px';
        body.style.height = size + 'px';

        if (state.poopCount > 0) {
            body.style.boxShadow = `0 0 30px rgba(139,69,19,0.5)`;
        } else {
            body.style.boxShadow = '0 5px 20px rgba(255,107,107,0.3)';
        }
    }

    // ============================================
    // FUNCIÓN UPDATE DISPLAY - EXPORTADA GLOBALMENTE
    // ============================================
    function updateDisplay() {
        if (!tamagotchi) {
            console.warn('Tamagotchi no inicializado');
            return;
        }
        
        try {
            const state = tamagotchi.getState();
            
            updateStat(elements.hunger, state.hunger);
            updateStat(elements.energy, state.energy);
            updateStat(elements.happiness, state.happiness);
            updateStat(elements.age, state.age);
            updateStat(elements.weight, state.weight);
            updateStat(elements.generation, state.generation);
            updateStat(elements.discipline, state.discipline);
            updateStat(elements.coins, state.coins || 0);
            updateStat(elements.coinsDisplay, state.coins || 0);

            updateProgressBar(elements.hungerFill, state.hunger);
            updateProgressBar(elements.energyFill, state.energy);
            updateProgressBar(elements.happinessFill, state.happiness);
            updateProgressBar(elements.friendshipFill, Math.min(100, state.friendship || 0));

            if (elements.petName) elements.petName.textContent = state.name;
            if (elements.petStage) elements.petStage.textContent = `${state.emoji || '🐣'} ${state.evolutionName || 'Bebé'}`;

            if (elements.friendshipLevel) {
                const friendship = state.friendship || 0;
                if (friendship > 80) elements.friendshipLevel.textContent = '💖';
                else if (friendship > 60) elements.friendshipLevel.textContent = '❤️';
                else if (friendship > 40) elements.friendshipLevel.textContent = '🧡';
                else if (friendship > 20) elements.friendshipLevel.textContent = '💛';
                else elements.friendshipLevel.textContent = '🤍';
            }

            updatePetAppearance(state);
            
            updateStatColor(elements.hunger, state.hunger);
            updateStatColor(elements.energy, state.energy);
            updateStatColor(elements.happiness, state.happiness);

            if (elements.ledIndicator) {
                if (state.isAlive) {
                    elements.ledIndicator.className = 'led-indicator';
                    elements.ledIndicator.setAttribute('aria-label', 'Dispositivo encendido');
                } else {
                    elements.ledIndicator.className = 'led-indicator off';
                    elements.ledIndicator.setAttribute('aria-label', 'Dispositivo apagado');
                }
            }

            updateButtons(state);

            if (typeof achievementSystem !== 'undefined' && achievementSystem && elements.achievementsGrid) {
                achievementSystem.renderAchievements(elements.achievementsGrid);
            }
        } catch (e) {
            console.error('Error actualizando display:', e);
        }
    }

    // EXPORTAR updateDisplay GLOBALMENTE para que otros módulos puedan usarla
    window.updateDisplay = updateDisplay;

    function updateCooldowns() {
        setInterval(() => {
            if (tamagotchi) {
                try {
                    const state = tamagotchi.getState();
                    updateButtons(state);
                } catch (e) {
                    // Silenciar errores de cooldown
                }
            }
        }, 1000);
    }

    // ============================================
    // FUNCIONES DE INICIO
    // ============================================
    
    function init() {
        try {
            loadTheme();
            
            if (typeof Tamagotchi === 'undefined') {
                console.error('Tamagotchi no está definido');
                window.showNotification('❌', 'Error al cargar el juego');
                return;
            }
            
            const saved = Tamagotchi.load();
            if (saved) {
                tamagotchi = saved;
                showMessage('📂 ¡Cargado con éxito!', '📂');
                if (tamagotchi.isAlive && typeof audio !== 'undefined' && audio.playBirth) {
                    audio.playBirth();
                }
            } else {
                tamagotchi = new Tamagotchi('Tamagotchi');
                showMessage('🐣 ¡Un nuevo amigo ha nacido!', '🐣');
                if (typeof audio !== 'undefined' && audio.playBirth) {
                    audio.playBirth();
                }
            }
            
            if (typeof initParticles === 'function') {
                const container = document.getElementById('particleContainer');
                if (container) {
                    initParticles(container);
                }
            }
            
            if (typeof initMinigames === 'function') {
                initMinigames(tamagotchi);
            }
            
            if (typeof initAchievements === 'function') {
                initAchievements(tamagotchi);
                if (typeof achievementSystem !== 'undefined' && achievementSystem && elements.achievementsGrid) {
                    achievementSystem.renderAchievements(elements.achievementsGrid);
                }
            }
            
            updateDisplay();
            startUpdates();
            updateCooldowns();
            
            setTimeout(() => {
                if (typeof achievementSystem !== 'undefined' && achievementSystem) {
                    achievementSystem.checkAchievements();
                    if (elements.achievementsGrid) {
                        achievementSystem.renderAchievements(elements.achievementsGrid);
                    }
                }
            }, 1000);
            
            console.log('🐣 Tamagotchi Ultimate iniciado con éxito!');
            
            // Anunciar inicio para lectores de pantalla
            const announcer = document.getElementById('messageArea');
            if (announcer) {
                announcer.setAttribute('aria-live', 'polite');
                announcer.textContent = '🐣 ¡Bienvenido a Tamagotchi Ultimate!';
            }
        } catch (e) {
            console.error('Error en la inicialización:', e);
            window.showNotification('❌', 'Error al iniciar el juego');
        }
    }

    // ============================================
    // FUNCIONES DE ACTUALIZACIÓN AUTOMÁTICA
    // ============================================
    
    function startUpdates() {
        if (updateInterval) clearInterval(updateInterval);
        
        updateInterval = setInterval(() => {
            if (!tamagotchi) return;
            
            try {
                tamagotchi.update();
                
                if (tamagotchi.checkEvolution && tamagotchi.checkEvolution()) {
                    if (typeof audio !== 'undefined' && audio.playEvolution) audio.playEvolution();
                    showMessage(`🌟 ¡Evolucionó a ${tamagotchi.evolutionName}!`, '🌟');
                    if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.celebration) {
                        particleSystem.celebration();
                        particleSystem.clearAfter(3000);
                    }
                }
                
                updateDisplay();
                
                if (!tamagotchi.isAlive) {
                    if (typeof audio !== 'undefined' && audio.playDeath) audio.playDeath();
                    showMessage('💀 ¡Oh no! Tu Tamagotchi ha muerto...', '💀');
                }
                
                const state = tamagotchi.getState();
                if (state.isAlive) {
                    if (state.hunger < 20) {
                        if (typeof audio !== 'undefined' && audio.playWarning) audio.playWarning();
                        showMessage('⚠️ ¡Tiene hambre! Aliméntalo', '⚠️');
                    } else if (state.happiness < 20) {
                        if (typeof audio !== 'undefined' && audio.playWarning) audio.playWarning();
                        showMessage('😢 Está muy triste... juega con él', '😢');
                    } else if (state.energy < 20) {
                        if (typeof audio !== 'undefined' && audio.playWarning) audio.playWarning();
                        showMessage('😴 Está muy cansado... ponlo a dormir', '😴');
                    }
                    
                    // Mostrar tiempo restante para despertar si está durmiendo
                    if (state.isSleeping && state.sleepTime) {
                        const sleepRemaining = tamagotchi.getSleepRemaining();
                        if (sleepRemaining !== null && sleepRemaining > 0) {
                            const formattedTime = tamagotchi.formatSleepTime(sleepRemaining);
                            
                            if (elements.messageArea) {
                                const messageIcon = elements.messageArea.querySelector('.message-icon');
                                const messageText = elements.messageArea.querySelector('.message-text');
                                if (messageIcon && messageText) {
                                    messageIcon.textContent = '⏰';
                                    messageText.textContent = `Despierta en ${formattedTime}`;
                                }
                            }
                        }
                    }
                }
                
                if (typeof achievementSystem !== 'undefined' && achievementSystem) {
                    const newAchievements = achievementSystem.checkAchievements();
                    if (newAchievements && newAchievements.length > 0 && elements.achievementsGrid) {
                        achievementSystem.renderAchievements(elements.achievementsGrid);
                        // Limpiar partículas de celebración después de 3 segundos
                        if (typeof particleSystem !== 'undefined' && particleSystem) {
                            particleSystem.clearAfter(3000);
                        }
                    }
                }
                
                if (Math.floor(Date.now() / 30000) % 2 === 0) {
                    tamagotchi.save();
                }
            } catch (e) {
                console.error('Error en el ciclo de actualización:', e);
            }
        }, 5000);
    }

    // ============================================
    // MANEJADORES DE ACCIONES
    // ============================================
    
    function handleAction(action) {
        if (!tamagotchi) {
            showMessage('❌ El juego no está inicializado', '❌');
            return;
        }
        
        if (!tamagotchi.isAlive) {
            showMessage('💀 Ya no está con nosotros...', '💀');
            return;
        }

        let result = { message: 'Acción no válida', success: false };
        
        try {
            switch (action) {
                case 'feed':
                    result = tamagotchi.feed();
                    if (result.success && typeof audio !== 'undefined' && audio.playFeed) audio.playFeed();
                    break;
                case 'play':
                    result = tamagotchi.play();
                    if (result.success && typeof audio !== 'undefined' && audio.playPlay) audio.playPlay();
                    break;
                case 'sleep':
                    result = tamagotchi.sleep();
                    if (result.success && typeof audio !== 'undefined' && audio.playSleep) audio.playSleep();
                    break;
                case 'wake':
                    result = tamagotchi.wakeUp();
                    if (result.success && typeof audio !== 'undefined' && audio.playSleep) audio.playSleep();
                    break;
                case 'clean':
                    result = tamagotchi.clean();
                    if (result.success && typeof audio !== 'undefined' && audio.playClean) audio.playClean();
                    break;
                case 'train':
                    result = tamagotchi.train();
                    if (result.success && typeof audio !== 'undefined' && audio.playTrain) audio.playTrain();
                    break;
                case 'pet':
                    result = tamagotchi.pet();
                    if (result.success && typeof audio !== 'undefined' && audio.playPet) audio.playPet();
                    break;
                case 'medicine':
                    result = tamagotchi.medicine();
                    if (result.success && typeof audio !== 'undefined' && audio.playFeed) audio.playFeed();
                    break;
                default:
                    result = { message: 'Acción desconocida', success: false };
            }
        } catch (e) {
            console.error(`Error en acción ${action}:`, e);
            result = { message: '❌ Error al realizar la acción', success: false };
        }
        
        if (result && result.message) {
            showMessage(result.message, result.success ? '✅' : '❌');
        }
        
        updateDisplay();
        
        if (typeof achievementSystem !== 'undefined' && achievementSystem) {
            achievementSystem.checkAchievements();
            if (elements.achievementsGrid) {
                achievementSystem.renderAchievements(elements.achievementsGrid);
            }
        }
        
        if (tamagotchi) tamagotchi.save();
    }

    // ============================================
    // FUNCIONES DE TIENDA
    // ============================================
    
    function handleShopBuy(item) {
        if (!tamagotchi) return;
        
        const result = tamagotchi.buyItem(item);
        showMessage(result.message, result.success ? '✅' : '❌');
        
        if (result.success) {
            if (typeof audio !== 'undefined' && audio.playButtonClick) audio.playButtonClick();
            updateDisplay();
            tamagotchi.save();
            
            if (typeof achievementSystem !== 'undefined' && achievementSystem) {
                achievementSystem.checkAchievements();
                if (elements.achievementsGrid) {
                    achievementSystem.renderAchievements(elements.achievementsGrid);
                }
            }
        }
    }

    // ============================================
    // FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN
    // ============================================
    
    function exportData() {
        if (!tamagotchi) {
            window.showNotification('❌', 'No hay datos para exportar');
            return;
        }
        
        try {
            const data = tamagotchi.getState();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `tamagotchi-backup-${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            window.showNotification('📤', '¡Datos exportados con éxito!');
        } catch (e) {
            window.showNotification('❌', 'Error al exportar datos');
            console.error('Export error:', e);
        }
    }

    function importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const newTamagotchi = new Tamagotchi(data.name || 'Tamagotchi');
                    Object.assign(newTamagotchi, data);
                    
                    newTamagotchi.lastUpdate = data.lastUpdate || Date.now();
                    newTamagotchi.birthTime = data.birthTime || Date.now();
                    
                    tamagotchi = newTamagotchi;
                    tamagotchi.save();
                    updateDisplay();
                    
                    window.showNotification('📥', '¡Datos importados con éxito!');
                    
                    if (typeof achievementSystem !== 'undefined' && achievementSystem) {
                        achievementSystem.loadAchievements();
                        if (elements.achievementsGrid) {
                            achievementSystem.renderAchievements(elements.achievementsGrid);
                        }
                    }
                } catch (err) {
                    window.showNotification('❌', 'Error al importar datos');
                    console.error('Import error:', err);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // ============================================
    // FUNCIONES DE RESET Y GUARDADO
    // ============================================
    
    function resetGame() {
        if (confirm('¿Seguro que quieres resetear? Se perderá todo el progreso.')) {
            localStorage.removeItem('tamagotchiData');
            localStorage.removeItem('achievements');
            tamagotchi = new Tamagotchi('Tamagotchi');
            if (typeof audio !== 'undefined' && audio.playBirth) audio.playBirth();
            showMessage('🔄 ¡Reiniciado! Un nuevo comienzo', '🔄');
            updateDisplay();
            tamagotchi.save();
            
            if (typeof achievementSystem !== 'undefined' && achievementSystem) {
                achievementSystem.unlockedAchievements = new Set();
                achievementSystem.saveAchievements();
                if (elements.achievementsGrid) {
                    achievementSystem.renderAchievements(elements.achievementsGrid);
                }
            }
            
            window.showNotification('🔄', '¡Juego reiniciado!');
        }
    }

    function saveGame() {
        if (tamagotchi && tamagotchi.save()) {
            window.showNotification('💾', '¡Guardado con éxito!');
            if (typeof audio !== 'undefined' && audio.playButtonClick) audio.playButtonClick();
        } else {
            window.showNotification('❌', 'Error al guardar');
        }
    }

    // ============================================
    // FUNCIONES DE SONIDO
    // ============================================
    
    function toggleSound() {
        if (typeof audio !== 'undefined' && audio.toggleSound) {
            soundEnabled = audio.toggleSound();
        } else {
            soundEnabled = !soundEnabled;
        }
        if (elements.soundToggle) {
            elements.soundToggle.textContent = soundEnabled ? '🔊 Sonido' : '🔇 Silencio';
        }
        window.showNotification(soundEnabled ? '🔊' : '🔇', soundEnabled ? 'Sonido activado' : 'Sonido desactivado');
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    // Botones de acción - Soporte para touch en móviles
    document.querySelectorAll('.action-btn').forEach(btn => {
        // Click para desktop
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (typeof audio !== 'undefined' && audio.playButtonClick) audio.playButtonClick();
            handleAction(action);
        });
        
        // Touch para móviles (evita doble click)
        btn.addEventListener('touchstart', (e) => {
            // Solo prevenir si es un toque válido
            if (e.touches.length === 1) {
                // No prevenir el evento para permitir el click
            }
        }, { passive: true });
        
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Botones de minijuegos
    document.querySelectorAll('.minigame-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const game = btn.dataset.game;
            if (typeof minigameManager !== 'undefined' && minigameManager) {
                if (typeof audio !== 'undefined' && audio.playButtonClick) audio.playButtonClick();
                minigameManager.startGame(game);
            } else {
                window.showNotification('❌', 'Sistema de juegos no disponible');
            }
        });
        
        btn.addEventListener('touchstart', (e) => {
            // Prevenir doble toque
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Botones de tienda
    document.querySelectorAll('.shop-buy').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.dataset.item;
            handleShopBuy(item);
        });
        
        btn.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
                b.setAttribute('tabindex', '-1');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            btn.setAttribute('tabindex', '0');
            
            document.querySelectorAll('.tab-panel').forEach(p => {
                p.classList.remove('active');
            });
            const panel = document.getElementById(`tab-${tab}`);
            if (panel) {
                panel.classList.add('active');
            }
            
            if (typeof audio !== 'undefined' && audio.playButtonClick) audio.playButtonClick();
        });
        
        btn.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        
        btn.addEventListener('keydown', (e) => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            const currentIndex = tabs.indexOf(btn);
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const next = tabs[(currentIndex + 1) % tabs.length];
                if (next) next.click();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
                if (prev) prev.click();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Controles
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetGame);
        elements.resetBtn.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        elements.resetBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                resetGame();
            }
        });
    }

    if (elements.saveBtn) {
        elements.saveBtn.addEventListener('click', saveGame);
        elements.saveBtn.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        elements.saveBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                saveGame();
            }
        });
    }

    if (elements.soundToggle) {
        elements.soundToggle.addEventListener('click', toggleSound);
        elements.soundToggle.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        elements.soundToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSound();
            }
        });
    }

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
        elements.themeToggle.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        elements.themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }

    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', exportData);
        elements.exportBtn.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        elements.exportBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                exportData();
            }
        });
    }

    if (elements.importBtn) {
        elements.importBtn.addEventListener('click', importData);
        elements.importBtn.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        elements.importBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                importData();
            }
        });
    }

    // Modales
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
        
        btn.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // No prevenir
            }
        }, { passive: true });
        
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });

    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // ============================================
    // EVENTOS DE VENTANA
    // ============================================
    
    window.addEventListener('beforeunload', () => {
        if (tamagotchi) {
            tamagotchi.save();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && tamagotchi) {
            tamagotchi.save();
        }
    });

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    console.log('🐣 Tamagotchi Ultimate cargado con éxito!');
    console.log('📱 Diseño responsive y accesible');
    console.log('🌙 Modo oscuro/claro soportado');
    if (isMobile()) {
        console.log('📱 Modo móvil activo');
    }
});