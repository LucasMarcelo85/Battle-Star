# 🚀 Guia de Expansão Futura

Este documento contém ideias e exemplos de como expandir as funcionalidades mobile do jogo.

## 1. Adicionar Haptic Feedback (Vibração)

### Implementação Básica

```javascript
// Em mobile-controls.js, adicione ao handleFireButtonPress:
handleFireButtonPress(isPressed) {
    if (!this.player.run || this.scene.pauseFlag || this.scene.game.data.end) return;
    
    if (isPressed) {
        // Vibração ao atirar
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 30, 50]);
        }
        res.replay('shoot');
        this.player.fire();
        this.fireButton.style.transform = 'scale(0.95)';
    } else {
        this.fireButton.style.transform = 'scale(1)';
    }
}
```

### No Jogo

```javascript
// Em play.js, ao detectar colisão:
playerCollision(el, callback) {
    if ('vibrate' in navigator) {
        navigator.vibrate(100); // Ao ser atingido
    }
    this.collision(this.player, el, () => {
        el.death();
        callback(el);
    });
}
```

## 2. Joystick Virtual (Alternativa ao Arrastar)

### Implementação

```javascript
// Novo arquivo: js/virtual-joystick.js
class VirtualJoystick {
    constructor(scene, player) {
        this.player = player;
        this.scene = scene;
        this.joystickElement = null;
        this.joystickBase = null;
        this.joystickStick = null;
        
        this.init();
    }

    init() {
        this.createJoystickUI();
        this.setupEventListeners();
    }

    createJoystickUI() {
        // Container do joystick
        const container = document.createElement('div');
        container.id = 'joystick-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 120px;
            height: 120px;
            z-index: 999;
        `;

        // Base do joystick (círculo grande)
        const base = document.createElement('div');
        base.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(100, 100, 100, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.5);
            position: relative;
        `;

        // Stick do joystick (círculo pequeno)
        const stick = document.createElement('div');
        stick.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 100, 100, 0.8);
            position: absolute;
            top: 40px;
            left: 40px;
            cursor: pointer;
            transition: all 0.1s ease;
        `;

        base.appendChild(stick);
        container.appendChild(base);
        document.body.appendChild(container);

        this.joystickElement = container;
        this.joystickBase = base;
        this.joystickStick = stick;
    }

    setupEventListeners() {
        let isTouching = false;
        const radius = 60;

        this.joystickStick.addEventListener('touchstart', (e) => {
            isTouching = true;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isTouching) return;

            const touch = e.touches[0];
            const rect = this.joystickBase.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let deltaX = touch.clientX - centerX;
            let deltaY = touch.clientY - centerY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > radius) {
                deltaX = (deltaX / distance) * radius;
                deltaY = (deltaY / distance) * radius;
            }

            // Move o stick visualmente
            this.joystickStick.style.transform = 
                `translate(${deltaX}px, ${deltaY}px)`;

            // Move o player proporcionalmente
            const ratio = distance / radius;
            if (ratio > 0.1) {
                const angle = Math.atan2(deltaY, deltaX);
                const speed = this.player.speed;
                
                this.player.x += Math.cos(angle) * speed * ratio;
                this.player.y += Math.sin(angle) * speed * ratio;

                // Limita aos limites da tela
                this.player.x = Math.max(0, Math.min(this.player.x, 
                    config.game.w - this.player.w));
                this.player.y = Math.max(0, Math.min(this.player.y, 
                    config.game.h - this.player.h));
            }
        });

        document.addEventListener('touchend', () => {
            isTouching = false;
            this.joystickStick.style.transform = 'translate(0, 0)';
        });
    }

    destroy() {
        if (this.joystickElement) {
            this.joystickElement.remove();
        }
    }
}
```

## 3. Adicionar Botão de Pausa em Mobile

```javascript
// Em mobile-controls.js, adicione:
createPauseButton() {
    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'pause-btn-mobile';
    pauseBtn.textContent = 'II';
    pauseBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 5px;
        background: rgba(100, 100, 100, 0.8);
        color: white;
        border: 2px solid white;
        font-weight: bold;
        font-size: 20px;
        z-index: 1001;
    `;

    pauseBtn.addEventListener('click', () => {
        if (this.scene.pauseFlag) {
            this.scene.pause(); // resume
        } else {
            this.scene.pause();
        }
    });

    document.body.appendChild(pauseBtn);
    this.pauseButton = pauseBtn;
}
```

## 4. Gestos Customizados

```javascript
// Novo arquivo: js/gesture-controls.js
class GestureControls {
    constructor(player, scene) {
        this.player = player;
        this.scene = scene;
        this.setup();
    }

    setup() {
        let touchStartX = 0;
        let touchStartY = 0;

        this.scene.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.scene.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            this.handleGesture(
                touchStartX, touchStartY,
                touchEndX, touchEndY
            );
        });
    }

    handleGesture(startX, startY, endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;
        const threshold = 50;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Swipe horizontal
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.player.right();
                } else {
                    this.player.left();
                }
            }
        } else {
            // Swipe vertical
            if (Math.abs(diffY) > threshold) {
                if (diffY > 0) {
                    this.player.down();
                } else {
                    this.player.up();
                }
            }
        }
    }
}
```

## 5. Fullscreen em Mobile

```javascript
// Novo botão fullscreen em mobile-controls.js
createFullscreenButton() {
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.id = 'fullscreen-btn-mobile';
    fullscreenBtn.textContent = '⛶';
    fullscreenBtn.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 5px;
        background: rgba(100, 100, 100, 0.8);
        color: white;
        border: 2px solid white;
        font-weight: bold;
        font-size: 24px;
        z-index: 1001;
    `;

    fullscreenBtn.addEventListener('click', () => {
        const canvas = this.scene.canvas;
        
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        }
    });

    document.body.appendChild(fullscreenBtn);
    this.fullscreenButton = fullscreenBtn;
}
```

## 6. Salvar Score na LocalStorage

```javascript
// Em play.js, ao game over:
saveScore() {
    const score = this.data.score;
    const scores = JSON.parse(localStorage.getItem('battlestar_scores') || '[]');
    scores.push({
        score: score,
        date: new Date().toISOString()
    });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('battlestar_scores', JSON.stringify(scores.slice(0, 10)));
}
```

## 7. Progressive Web App (PWA)

### Criar arquivo `manifest.json`

```json
{
  "name": "Galácticos - Battle Star",
  "short_name": "Galácticos",
  "description": "Jogo de nave em ação",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#000",
  "theme_color": "#FFD700",
  "icons": [
    {
      "src": "/img/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/img/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Adicionar ao HTML

```html
<link rel="manifest" href="manifest.json">
```

## 8. Service Worker para Cache Offline

### Criar arquivo `sw.js`

```javascript
const CACHE_NAME = 'galacticos-v1';
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/common.css',
    '/css/style.css',
    '/css/mobile.css',
    '/js/main.js',
    // ... adicione todos os arquivos
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
```

## 9. Acelerar em Modo Paisagem

```javascript
// Em responsive.js, adapte para paisagem:
static handleOrientationChange() {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    
    if (orientation === 'landscape') {
        console.log('Modo paisagem - gameplay otimizado');
        // Aumentar dificuldade, remover animações extras
    } else {
        console.log('Modo retrato - jogabilidade adaptada');
    }
}
```

## 10. Sistema de Placares Online

```javascript
async function uploadScore(playerName, score) {
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playerName, score: score })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao enviar score:', error);
    }
}

async function getTopScores() {
    try {
        const response = await fetch('/api/scores?limit=10');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar scores:', error);
    }
}
```

---

## 🎯 Prioridade de Implementação

1. **Alta**: Haptic feedback, Joystick virtual
2. **Média**: Pausa em mobile, Fullscreen
3. **Baixa**: PWA, Service Worker, Placares online

## 📝 Notas

- Teste cada nova funcionalidade em dispositivo real
- Mantenha a performance em mente
- Documente todas as mudanças
- Versione seu código com Git

---

Boa sorte implementando! 🚀
