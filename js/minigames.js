/**
 * Sistema de Minijuegos para Tamagotchi Ultimate
 * Con soporte para accesibilidad y responsive design
 */

class MiniGameManager {
    constructor(tamagotchi) {
        this.tamagotchi = tamagotchi;
        this.currentGame = null;
        this.isPlaying = false;
        this.score = 0;
        this.modal = document.getElementById('minigameModal');
        this.body = document.getElementById('minigameBody');
        this.title = document.getElementById('minigameTitle');
        this.closeBtn = document.getElementById('minigameClose');
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeGame());
            this.closeBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.closeGame();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPlaying) {
                this.closeGame();
            }
        });
    }

    /**
     * Inicia un minijuego
     */
    startGame(gameType) {
        if (this.isPlaying || !this.modal) return;
        
        this.isPlaying = true;
        this.score = 0;
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        
        this.announceGameStart(gameType);

        switch(gameType) {
            case 'memory':
                this.startMemoryGame();
                break;
            case 'clicker':
                this.startClickerGame();
                break;
            case 'dance':
                this.startDanceGame();
                break;
            case 'quiz':
                this.startQuizGame();
                break;
            default:
                this.isPlaying = false;
                this.closeGame();
        }
    }

    /**
     * Anuncia el inicio del juego para lectores de pantalla
     */
    announceGameStart(gameType) {
        const names = {
            memory: 'Juego de Memoria',
            clicker: 'Juego de Clics',
            dance: 'Juego de Baile',
            quiz: 'Quiz'
        };
        const message = `🎮 Iniciando ${names[gameType] || gameType}`;
        
        const announcer = document.getElementById('messageArea');
        if (announcer) {
            announcer.setAttribute('aria-live', 'assertive');
            announcer.textContent = message;
        }
    }

    /**
     * Cierra el juego actual
     */
    closeGame() {
        if (this.currentGame && this.currentGame.timer) {
            clearInterval(this.currentGame.timer);
        }
        if (this.currentGame && this.currentGame.timeout) {
            clearTimeout(this.currentGame.timeout);
        }
        
        this.isPlaying = false;
        if (this.modal) {
            this.modal.classList.remove('active');
            this.modal.setAttribute('aria-hidden', 'true');
        }
        this.currentGame = null;
    }

    // ============================================
    // JUEGO DE MEMORIA
    // ============================================
    startMemoryGame() {
        const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        const pairs = [...emojis, ...emojis];
        const shuffled = pairs.sort(() => Math.random() - 0.5);
        let selected = [];
        let matched = 0;
        let attempts = 0;
        let isLocked = false;

        this.title.textContent = '🧠 Juego de Memoria';
        this.body.innerHTML = `
            <div class="memory-game" role="application" aria-label="Juego de memoria">
                <div class="memory-stats" role="status" aria-live="polite" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px; flex-wrap: wrap;">
                    <span>Intentos: <strong id="memoryAttempts">0</strong></span>
                    <span>Parejas: <strong id="memoryMatched">0/${pairs.length/2}</strong></span>
                </div>
                <div class="memory-grid" id="memoryGrid" role="grid" aria-label="Tablero de memoria"></div>
                <div id="memoryResult" class="game-result" aria-live="polite" style="text-align: center; margin-top: 10px; font-size: 18px;"></div>
            </div>
        `;

        const grid = document.getElementById('memoryGrid');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-top: 10px;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        `;

        shuffled.forEach((emoji, index) => {
            const card = document.createElement('button');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.emoji = emoji;
            card.setAttribute('role', 'gridcell');
            card.setAttribute('aria-label', `Carta ${index + 1}`);
            card.style.cssText = `
                aspect-ratio: 1;
                background: var(--bg-card, rgba(0,0,0,0.4));
                border: 2px solid var(--border-color, #4a4a5a);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: clamp(24px, 6vw, 36px);
                cursor: pointer;
                transition: all 0.3s ease;
                user-select: none;
                min-height: 44px;
                min-width: 44px;
                touch-action: manipulation;
                color: white;
            `;
            card.textContent = '❓';
            card.setAttribute('aria-label', `Carta ${index + 1} - Oculto`);
            
            card.addEventListener('click', () => {
                if (this.isPlaying && !isLocked && !card.classList.contains('matched')) {
                    this.handleMemoryCardClick(card, selected, shuffled, grid, () => {
                        attempts++;
                        document.getElementById('memoryAttempts').textContent = attempts;
                    });
                }
            });
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
            
            grid.appendChild(card);
        });

        this.currentGame = {
            type: 'memory',
            grid: grid,
            shuffled: shuffled,
            selected: selected,
            matched: matched,
            attempts: attempts,
            isLocked: false
        };

        setTimeout(() => {
            const firstCard = grid.querySelector('.memory-card');
            if (firstCard) firstCard.focus();
        }, 100);
    }

    handleMemoryCardClick(card, selected, shuffled, grid, updateAttempts) {
        if (selected.length >= 2) return;
        if (card.classList.contains('matched')) return;

        card.textContent = card.dataset.emoji;
        card.classList.add('selected');
        card.setAttribute('aria-label', `Carta - ${card.dataset.emoji}`);
        selected.push(card);

        if (selected.length === 2) {
            const [card1, card2] = selected;
            const match = card1.dataset.emoji === card2.dataset.emoji;
            
            updateAttempts();
            this.currentGame.attempts++;

            if (match) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                card1.classList.remove('selected');
                card2.classList.remove('selected');
                this.currentGame.matched++;
                document.getElementById('memoryMatched').textContent = 
                    `${this.currentGame.matched}/${this.currentGame.shuffled.length/2}`;

                if (this.currentGame.matched === this.currentGame.shuffled.length/2) {
                    setTimeout(() => {
                        this.endGame(true, this.currentGame.attempts);
                    }, 500);
                }
                selected.length = 0;
            } else {
                this.currentGame.isLocked = true;
                setTimeout(() => {
                    card1.textContent = '❓';
                    card2.textContent = '❓';
                    card1.classList.remove('selected');
                    card2.classList.remove('selected');
                    card1.setAttribute('aria-label', 'Carta - Oculto');
                    card2.setAttribute('aria-label', 'Carta - Oculto');
                    selected.length = 0;
                    this.currentGame.isLocked = false;
                }, 800);
            }
        }
    }

    // ============================================
    // JUEGO DE CLICKS
    // ============================================
    startClickerGame() {
        let clicks = 0;
        let timeLeft = 10;
        let target = 15;

        this.title.textContent = '👆 Clicker Game';
        this.body.innerHTML = `
            <div class="clicker-game" style="text-align: center; padding: 10px 0;">
                <div class="clicker-stats" style="margin-bottom: 15px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                    <span>Tiempo: <strong id="clickerTime" aria-live="polite">${timeLeft}s</strong></span>
                    <span>Clicks: <strong id="clickerClicks" aria-live="polite">0</strong></span>
                    <span>Meta: <strong>${target}</strong></span>
                </div>
                <button id="clickerButton" aria-label="Haz clic para acumular puntos" style="
                    font-size: clamp(40px, 12vw, 60px);
                    padding: clamp(20px, 5vw, 30px) clamp(30px, 8vw, 40px);
                    background: var(--bg-card, rgba(0,0,0,0.4));
                    border: 3px solid var(--text-primary, #00ff88);
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.1s ease;
                    min-height: 80px;
                    min-width: 80px;
                    touch-action: manipulation;
                    color: white;
                ">👆</button>
                <div id="clickerResult" class="game-result" style="margin-top: 15px; font-size: clamp(16px, 4vw, 18px);" aria-live="polite"></div>
            </div>
        `;

        const button = document.getElementById('clickerButton');
        const timeDisplay = document.getElementById('clickerTime');
        const clickDisplay = document.getElementById('clickerClicks');
        const resultDisplay = document.getElementById('clickerResult');

        button.addEventListener('click', () => {
            if (this.isPlaying) {
                clicks++;
                clickDisplay.textContent = clicks;
                button.style.transform = 'scale(0.9)';
                setTimeout(() => button.style.transform = 'scale(1)', 100);
                if (window.audio && window.audio.playButtonClick) {
                    window.audio.playButtonClick();
                }
            }
        });

        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });

        const timer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft + 's';
            
            if (timeLeft <= 3) {
                timeDisplay.style.color = '#ff4444';
                timeDisplay.setAttribute('aria-label', `Tiempo restante: ${timeLeft} segundos`);
            }

            if (timeLeft <= 0) {
                clearInterval(timer);
                const won = clicks >= target;
                resultDisplay.textContent = won ? 
                    `🎉 ¡Ganaste! ${clicks} clicks` : 
                    `😅 ${clicks} clicks - ¡Intenta de nuevo!`;
                resultDisplay.style.color = won ? '#6bcb77' : '#ff6b6b';
                this.endGame(won, clicks);
            }
        }, 1000);

        this.currentGame = {
            type: 'clicker',
            timer: timer
        };

        setTimeout(() => button.focus(), 100);
    }

    // ============================================
    // JUEGO DE BAILE
    // ============================================
    startDanceGame() {
        const moves = ['👆', '👇', '👈', '👉', '🖐️', '✊'];
        let sequence = [];
        let currentStep = 0;
        let score = 0;
        let combo = 0;
        let isShowing = false;
        let rounds = 0;

        this.title.textContent = '💃 Dance Game';
        this.body.innerHTML = `
            <div class="dance-game" style="text-align: center; padding: 10px 0;">
                <div class="dance-stats" style="margin-bottom: 15px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                    <span>Puntuación: <strong id="danceScore" aria-live="polite">0</strong></span>
                    <span>Combo: <strong id="danceCombo" aria-live="polite">0</strong></span>
                    <span>Ronda: <strong id="danceRound" aria-live="polite">1/10</strong></span>
                </div>
                <div id="danceDisplay" style="
                    font-size: clamp(60px, 20vw, 100px);
                    padding: clamp(15px, 4vw, 30px);
                    background: var(--bg-card, rgba(0,0,0,0.4));
                    border: 3px solid var(--border-color, #4a4a5a);
                    border-radius: 20px;
                    margin: 10px auto;
                    min-height: clamp(100px, 25vw, 160px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    max-width: 400px;
                ">💃</div>
                <div class="dance-buttons" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 15px; max-width: 400px; margin-left: auto; margin-right: auto;">
                    ${['👆', '👇', '👈', '👉', '🖐️', '✊'].map(move => `
                        <button class="dance-move" data-move="${move}" aria-label="Movimiento ${move}" style="
                            font-size: clamp(24px, 6vw, 36px);
                            padding: clamp(10px, 2vw, 15px);
                            background: var(--bg-card, rgba(0,0,0,0.4));
                            border: 2px solid var(--border-color, #4a4a5a);
                            border-radius: 10px;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            min-height: 44px;
                            touch-action: manipulation;
                            color: white;
                        ">${move}</button>
                    `).join('')}
                </div>
                <div id="danceResult" class="game-result" style="margin-top: 15px; font-size: clamp(14px, 3vw, 18px);" aria-live="polite"></div>
            </div>
        `;

        const display = document.getElementById('danceDisplay');
        const scoreDisplay = document.getElementById('danceScore');
        const comboDisplay = document.getElementById('danceCombo');
        const roundDisplay = document.getElementById('danceRound');
        const resultDisplay = document.getElementById('danceResult');

        const generateSequence = () => {
            const newMove = moves[Math.floor(Math.random() * moves.length)];
            sequence.push(newMove);
            return sequence;
        };

        const showSequence = async () => {
            if (isShowing) return;
            isShowing = true;
            
            for (let i = 0; i < sequence.length; i++) {
                display.textContent = sequence[i];
                display.style.borderColor = '#00ff88';
                display.setAttribute('aria-label', `Sigue el movimiento: ${sequence[i]}`);
                await new Promise(resolve => setTimeout(resolve, 400));
                display.textContent = '💃';
                display.style.borderColor = 'var(--border-color)';
                display.setAttribute('aria-label', 'Esperando tu movimiento');
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            isShowing = false;
            currentStep = 0;
            
            const announcer = document.getElementById('messageArea');
            if (announcer) {
                announcer.textContent = '🎮 ¡Tu turno! Repite el movimiento';
            }
        };

        const allMoves = document.querySelectorAll('.dance-move');
        allMoves.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isShowing || currentStep >= sequence.length || !this.isPlaying) return;
                
                const move = btn.dataset.move;
                if (move === sequence[currentStep]) {
                    currentStep++;
                    score += 10;
                    combo++;
                    scoreDisplay.textContent = score;
                    comboDisplay.textContent = combo;
                    
                    btn.style.borderColor = '#6bcb77';
                    setTimeout(() => btn.style.borderColor = 'var(--border-color)', 200);
                    
                    if (currentStep === sequence.length) {
                        rounds++;
                        roundDisplay.textContent = `${rounds}/10`;
                        
                        if (rounds >= 10) {
                            setTimeout(() => {
                                this.endGame(true, score);
                            }, 500);
                            return;
                        }
                        
                        setTimeout(() => {
                            generateSequence();
                            showSequence();
                        }, 500);
                        if (window.audio && window.audio.playPlay) {
                            window.audio.playPlay();
                        }
                    }
                } else {
                    combo = 0;
                    comboDisplay.textContent = '0';
                    resultDisplay.textContent = '❌ ¡Fallaste!';
                    resultDisplay.style.color = '#ff6b6b';
                    btn.style.borderColor = '#ff4444';
                    setTimeout(() => btn.style.borderColor = 'var(--border-color)', 200);
                    
                    setTimeout(() => {
                        sequence = [];
                        currentStep = 0;
                        rounds = 0;
                        roundDisplay.textContent = '1/10';
                        generateSequence();
                        showSequence();
                        resultDisplay.textContent = '';
                    }, 1000);
                }
            });
            
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        generateSequence();
        setTimeout(showSequence, 500);

        this.currentGame = {
            type: 'dance',
            generateSequence: generateSequence,
            showSequence: showSequence,
            timeout: setTimeout(() => {}, 0)
        };

        setTimeout(() => {
            const firstMove = document.querySelector('.dance-move');
            if (firstMove) firstMove.focus();
        }, 600);
    }

    // ============================================
    // JUEGO DE QUIZ
    // ============================================
    startQuizGame() {
        const questions = [
            { q: '¿Cuántas patas tiene un perro?', a: '4' },
            { q: '¿Qué color es el cielo?', a: 'azul' },
            { q: '¿Cuántas horas tiene un día?', a: '24' },
            { q: '¿Cuál es el planeta más grande?', a: 'jupiter' },
            { q: '¿Cuántos dedos tiene una mano?', a: '5' },
            { q: '¿Qué animal dice "miau"?', a: 'gato' },
            { q: '¿Cuántos meses tiene un año?', a: '12' },
            { q: '¿Cuál es el animal más rápido?', a: 'guepardo' }
        ];

        let currentQuestion = 0;
        let correctAnswers = 0;

        this.title.textContent = '❓ Quiz Game';
        this.body.innerHTML = `
            <div class="quiz-game" style="padding: 10px 0;">
                <div class="quiz-stats" style="text-align: center; margin-bottom: 15px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                    <span>Pregunta: <strong id="quizCurrent" aria-live="polite">1/${questions.length}</strong></span>
                    <span>Correctas: <strong id="quizCorrect" aria-live="polite">0</strong></span>
                </div>
                <div id="quizQuestion" style="
                    font-size: clamp(16px, 4vw, 20px);
                    text-align: center;
                    padding: clamp(15px, 3vw, 20px);
                    background: var(--bg-card, rgba(0,0,0,0.4));
                    border-radius: 10px;
                    margin-bottom: 15px;
                    color: white;
                "></div>
                <input id="quizInput" type="text" 
                    placeholder="Escribe tu respuesta..." 
                    aria-label="Escribe tu respuesta para la pregunta"
                    style="
                        width: 100%;
                        padding: clamp(10px, 2vw, 12px);
                        background: var(--bg-card, rgba(0,0,0,0.4));
                        border: 2px solid var(--border-color, #4a4a5a);
                        border-radius: 8px;
                        color: var(--text-body, #ffffff);
                        font-size: clamp(14px, 3vw, 16px);
                        margin-bottom: 10px;
                        font-family: inherit;
                    ">
                <button id="quizSubmit" style="
                    width: 100%;
                    padding: clamp(10px, 2vw, 12px);
                    background: var(--text-primary, #00ff88);
                    border: none;
                    border-radius: 8px;
                    color: #000;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: clamp(14px, 3vw, 16px);
                    min-height: 44px;
                    touch-action: manipulation;
                    font-family: inherit;
                ">Responder</button>
                <div id="quizResult" style="margin-top: 10px; text-align: center; font-size: clamp(14px, 3vw, 16px);" aria-live="polite"></div>
            </div>
        `;

        const questionDisplay = document.getElementById('quizQuestion');
        const currentDisplay = document.getElementById('quizCurrent');
        const correctDisplay = document.getElementById('quizCorrect');
        const input = document.getElementById('quizInput');
        const submit = document.getElementById('quizSubmit');
        const result = document.getElementById('quizResult');

        const showQuestion = () => {
            if (currentQuestion >= questions.length) {
                const won = correctAnswers >= questions.length * 0.7;
                result.textContent = won ? 
                    `🎉 ¡Excelente! ${correctAnswers}/${questions.length} correctas` : 
                    `😅 ${correctAnswers}/${questions.length} - ¡Practica más!`;
                result.style.color = won ? '#6bcb77' : '#ff6b6b';
                submit.disabled = true;
                input.disabled = true;
                this.endGame(won, correctAnswers);
                return;
            }

            questionDisplay.textContent = questions[currentQuestion].q;
            currentDisplay.textContent = `${currentQuestion + 1}/${questions.length}`;
            input.value = '';
            input.focus();
            result.textContent = '';
        };

        const handleAnswer = () => {
            const answer = input.value.trim().toLowerCase();
            if (!answer) return;

            const isCorrect = answer === questions[currentQuestion].a;
            if (isCorrect) {
                correctAnswers++;
                correctDisplay.textContent = correctAnswers;
                result.textContent = '✅ ¡Correcto!';
                result.style.color = '#6bcb77';
                if (window.audio && window.audio.playButtonClick) {
                    window.audio.playButtonClick();
                }
            } else {
                result.textContent = `❌ Incorrecto. Respuesta: ${questions[currentQuestion].a}`;
                result.style.color = '#ff6b6b';
            }

            currentQuestion++;
            setTimeout(showQuestion, 1000);
        };

        submit.addEventListener('click', handleAnswer);
        submit.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAnswer();
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submit.click();
            }
        });

        showQuestion();

        this.currentGame = {
            type: 'quiz',
            questions: questions,
            currentQuestion: currentQuestion,
            correctAnswers: correctAnswers
        };

        setTimeout(() => input.focus(), 100);
    }

    // ============================================
    // FINALIZACIÓN DEL JUEGO
    // ============================================
    endGame(won, score = 0) {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        if (this.currentGame && this.currentGame.timer) {
            clearInterval(this.currentGame.timer);
        }
        if (this.currentGame && this.currentGame.timeout) {
            clearTimeout(this.currentGame.timeout);
        }

        if (won) {
            const reward = 20 + Math.floor(score / 2);
            if (this.tamagotchi) {
                this.tamagotchi.happiness = Math.min(100, this.tamagotchi.happiness + reward);
                this.tamagotchi.coins = (this.tamagotchi.coins || 0) + Math.floor(reward / 2);
                this.tamagotchi.totalCare = (this.tamagotchi.totalCare || 0) + 1;
                this.tamagotchi.minigameWins = (this.tamagotchi.minigameWins || 0) + 1;
            }
            
            // Usar window.showNotification si está disponible
            if (typeof window.showNotification === 'function') {
                window.showNotification('🎮', `¡Ganaste! +${reward} felicidad y 🪙${Math.floor(reward/2)}`);
            } else {
                console.log(`🎮 Ganaste! +${reward} felicidad`);
            }
            
            if (window.audio && window.audio.playWin) {
                window.audio.playWin();
            }
            
            if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.celebration) {
                particleSystem.celebration();
            }
            
            const announcer = document.getElementById('messageArea');
            if (announcer) {
                announcer.setAttribute('aria-live', 'assertive');
                announcer.textContent = `🎉 Ganaste! ${reward} puntos de felicidad ganados`;
            }
        } else {
            if (typeof window.showNotification === 'function') {
                window.showNotification('😅', '¡Intenta de nuevo!');
            }
            if (window.audio && window.audio.playLose) {
                window.audio.playLose();
            }
            
            const announcer = document.getElementById('messageArea');
            if (announcer) {
                announcer.setAttribute('aria-live', 'assertive');
                announcer.textContent = '😅 Intenta de nuevo';
            }
        }

        // Restaurar la vista de la mascota después del juego
        setTimeout(() => {
            if (this.modal) {
                this.modal.classList.remove('active');
                this.modal.setAttribute('aria-hidden', 'true');
            }
            if (this.tamagotchi) {
                this.tamagotchi.save();
                // Forzar actualización de la vista usando la función global
                if (typeof window.updateDisplay === 'function') {
                    window.updateDisplay();
                }
            }
            this.currentGame = null;
            this.isPlaying = false;
        }, 2000);
    }
}

// Instancia global del manager de minijuegos
let minigameManager = null;

/**
 * Inicializa el sistema de minijuegos
 * @param {Tamagotchi} tamagotchi - Instancia del Tamagotchi
 * @returns {MiniGameManager} Instancia del manager
 */
function initMinigames(tamagotchi) {
    minigameManager = new MiniGameManager(tamagotchi);
    return minigameManager;
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MiniGameManager, initMinigames };
}

// Hacer accesible globalmente
if (typeof window !== 'undefined') {
    window.minigameManager = minigameManager;
    window.initMinigames = initMinigames;
}