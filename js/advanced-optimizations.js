// Otimizações Avançadas (Opcional)
// Este arquivo contém melhorias adicionais que podem ser implementadas no futuro

class AdvancedOptimizations {
    // 1. Ajuste de qualidade de gráficos baseado em FPS
    static adaptiveQuality = {
        enabled: false,
        minFPS: 30,
        maxFPS: 60,
        checkInterval: 1000,
        
        init() {
            if (!this.enabled) return;
            let frameCount = 0;
            let lastCheck = Date.now();
            
            const originalRaf = window.requestAnimationFrame;
            window.requestAnimationFrame = function(callback) {
                frameCount++;
                const now = Date.now();
                
                if (now - lastCheck >= this.checkInterval) {
                    const fps = frameCount * 1000 / (now - lastCheck);
                    this.adjustQuality(fps);
                    frameCount = 0;
                    lastCheck = now;
                }
                
                return originalRaf(callback);
            };
        },
        
        adjustQuality(fps) {
            // Se FPS cair abaixo de minFPS, reduz qualidade
            if (fps < this.minFPS) {
                console.log('Reduzindo qualidade para manter performance');
                // Aqui você pode reduzir partículas, efeitos, etc
            }
        }
    };

    // 2. Pré-carregamento otimizado
    static preloadAssets = {
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        
        load() {
            if (this.isMobile) {
                // Carrega assets em ordem de importância para mobile
                this.loadCriticalAssets();
                setTimeout(() => this.loadSecondaryAssets(), 500);
            }
        },
        
        loadCriticalAssets() {
            // Carrega player, inimigos básicos
            console.log('Carregando assets críticos');
        },
        
        loadSecondaryAssets() {
            // Carrega animações, sons, efeitos
            console.log('Carregando assets secundários');
        }
    };

    // 3. Pooling de objetos para reduzir alocações
    static objectPool = {
        pools: {},
        
        createPool(name, factory, initialSize = 10) {
            this.pools[name] = {
                available: [],
                factory: factory,
                create() {
                    return this.factory();
                },
                init: () => {
                    for (let i = 0; i < initialSize; i++) {
                        this.available.push(this.create());
                    }
                }
            };
            this.pools[name].init();
        },
        
        get(name) {
            const pool = this.pools[name];
            if (!pool) return null;
            
            if (pool.available.length > 0) {
                return pool.available.pop();
            } else {
                return pool.create();
            }
        },
        
        return(name, object) {
            const pool = this.pools[name];
            if (pool) {
                object.reset?.();
                pool.available.push(object);
            }
        }
    };

    // 4. Service Worker para cache offline
    static serviceWorker = {
        register() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('Service Worker registrado:', registration);
                    })
                    .catch(error => {
                        console.log('Service Worker erro:', error);
                    });
            }
        }
    };

    // 5. Vibração tátil para feedback
    static haptic = {
        isSupported: 'vibrate' in navigator,
        
        tap() {
            if (this.isSupported) {
                navigator.vibrate(50);
            }
        },
        
        shoot() {
            if (this.isSupported) {
                navigator.vibrate([50, 30, 50]);
            }
        },
        
        hit() {
            if (this.isSupported) {
                navigator.vibrate(100);
            }
        },
        
        gameOver() {
            if (this.isSupported) {
                navigator.vibrate([100, 50, 100, 50, 200]);
            }
        }
    };

    // 6. Gestos customizados
    static gestures = {
        register(element) {
            let touchStartX = 0;
            let touchStartY = 0;
            
            element.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });
            
            element.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                this.handleSwipe(
                    touchStartX, 
                    touchStartY, 
                    touchEndX, 
                    touchEndY
                );
            });
        },
        
        handleSwipe(startX, startY, endX, endY) {
            const diffX = endX - startX;
            const diffY = endY - startY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Swipe horizontal
                if (diffX > 0) console.log('Swipe direita');
                else console.log('Swipe esquerda');
            } else {
                // Swipe vertical
                if (diffY > 0) console.log('Swipe para baixo');
                else console.log('Swipe para cima');
            }
        }
    };

    // 7. Detecção de conexão offline
    static connectivity = {
        init() {
            window.addEventListener('online', () => {
                console.log('Conexão restaurada');
            });
            
            window.addEventListener('offline', () => {
                console.log('Conexão perdida');
                // Pausar jogo ou mostrar aviso
            });
        }
    };

    // 8. Full Screen API
    static fullscreen = {
        request(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        },
        
        exit() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    // 9. Orientação Lock
    static orientation = {
        lock(type = 'landscape-primary') {
            if ('orientation' in window) {
                if (window.screen.orientation?.lock) {
                    window.screen.orientation.lock(type).catch(err => {
                        console.log('Erro ao bloquear orientação:', err);
                    });
                }
            }
        },
        
        unlock() {
            if ('orientation' in window) {
                if (window.screen.orientation?.unlock) {
                    window.screen.orientation.unlock();
                }
            }
        }
    };

    // 10. Network Information API
    static network = {
        init() {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            if (connection) {
                connection.addEventListener('change', () => {
                    this.logNetworkStatus();
                });
                this.logNetworkStatus();
            }
        },
        
        logNetworkStatus() {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                console.log('Tipo de conexão:', connection.effectiveType);
                console.log('Velocidade estimada:', connection.downlink + ' Mbps');
            }
        }
    };
}

// ============================================
// EXEMPLO DE IMPLEMENTAÇÃO
// ============================================

/*

// Para usar Haptic Feedback (vibração):
if (AdvancedOptimizations.haptic.isSupported) {
    // No disparo:
    AdvancedOptimizations.haptic.shoot();
    
    // Ao acertar inimigo:
    AdvancedOptimizations.haptic.hit();
    
    // Game Over:
    AdvancedOptimizations.haptic.gameOver();
}

// Para criar Object Pool (reduz garbage collection):
AdvancedOptimizations.objectPool.createPool(
    'bullets',
    () => new Bullet(),
    20
);

// Usar bullet do pool:
const bullet = AdvancedOptimizations.objectPool.get('bullets');
bullet.fire(x, y);

// Retornar bullet ao pool quando não usar mais:
AdvancedOptimizations.objectPool.return('bullets', bullet);

// Para pedir fullscreen:
const canvas = document.getElementById('canvas');
AdvancedOptimizations.fullscreen.request(canvas);

// Para bloquear orientação em paisagem:
AdvancedOptimizations.orientation.lock('landscape-primary');

*/
