// Ajusta a área do jogo para telas touch e mantém o menu proporcional.
class ResponsiveGame {
    static isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent)) ||
            ('ontouchstart' in window && window.matchMedia('(pointer: coarse)').matches);
    }

    static isPortrait() {
        return window.matchMedia('(orientation: portrait)').matches;
    }

    static init() {
        if (ResponsiveGame.isMobile()) {
            document.documentElement.classList.add('touch-device');
            document.body.classList.add('touch-device');
            ResponsiveGame.fit();
            window.addEventListener('resize', ResponsiveGame.fit);
            window.addEventListener('orientationchange', () => setTimeout(ResponsiveGame.fit, 150));
            if (window.visualViewport) window.visualViewport.addEventListener('resize', ResponsiveGame.fit);
        } else {
            const app = document.getElementById('app');
            if (app) {
                app.style.width = config.game.w + 'px';
                app.style.height = config.game.h + 'px';
            }
        }
    }

    static startGameplay() {
        if (!ResponsiveGame.isMobile()) return;

        document.body.classList.add('mobile-game-active');
        ResponsiveGame.fit();
    }

    static endGameplay() {
        if (!ResponsiveGame.isMobile()) return;

        document.body.classList.remove('mobile-game-active');
        const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
        if (ResponsiveGame.fullscreenRequested &&
            (document.fullscreenElement || document.webkitFullscreenElement) && exitFullscreen) {
            ResponsiveGame.fullscreenRequested = false;
            const result = exitFullscreen.call(document);
            if (result && typeof result.catch === 'function') {
                result.catch(error => console.warn('Não foi possível sair da tela cheia:', error));
            }
        }
    }

    // Ocupa toda a viewport com o jogo, mantendo todos os elementos visíveis.
    static fit() {
        const app = document.getElementById('app');
        if (!app) return;
        const vv = window.visualViewport;
        const sw = vv ? vv.width : window.innerWidth;
        const sh = vv ? vv.height : window.innerHeight;
        const scale = Math.min(sw / config.game.w, sh / config.game.h);
        const scaleX = document.body.classList.contains('mobile-game-active') ?
            sw / config.game.w : scale;
        const scaleY = document.body.classList.contains('mobile-game-active') ?
            sh / config.game.h : scale;

        app.style.width = config.game.w + 'px';
        app.style.height = config.game.h + 'px';
        app.style.position = 'fixed';
        app.style.left = '50%';
        app.style.top = '50%';
        app.style.margin = '0';
        app.style.transformOrigin = 'center center';
        app.style.transform = `translate(-50%, -50%) scale(${scaleX}, ${scaleY})`;
    }

    static enterFullscreen() {
        if (!ResponsiveGame.isMobile()) return;

        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        let fullscreen = Promise.resolve();
        if (req) {
            try {
                fullscreen = Promise.resolve(req.call(el));
            } catch (error) {
                console.warn('Não foi possível ativar a tela cheia:', error);
                return;
            }
        }
        fullscreen.then(() => {
            ResponsiveGame.fullscreenRequested = Boolean(
                document.fullscreenElement === el || document.webkitFullscreenElement === el
            );
            if (window.screen && screen.orientation && screen.orientation.lock) {
                return screen.orientation.lock('landscape').catch(error => {
                    console.warn('Não foi possível bloquear a orientação:', error);
                });
            }
        }).catch(error => console.warn('Não foi possível ativar a tela cheia:', error));
    }
}

ResponsiveGame.fullscreenRequested = false;

document.addEventListener('DOMContentLoaded', () => ResponsiveGame.init());