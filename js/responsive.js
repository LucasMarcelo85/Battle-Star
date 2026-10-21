// Responsividade para Mobile/Tablet: escala o jogo para caber na tela mantendo a proporção
class ResponsiveGame {
    static isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
    }

    static init() {
        if (ResponsiveGame.isMobile()) {
            document.documentElement.style.cssText += ';height:100%;overflow:hidden;overscroll-behavior:none;';
            document.body.style.cssText += ';margin:0;padding:0;height:100%;overflow:hidden;overscroll-behavior:none;touch-action:none;background:#000;';
            ResponsiveGame.fit();
            window.addEventListener('resize', ResponsiveGame.fit);
            window.addEventListener('orientationchange', () => setTimeout(ResponsiveGame.fit, 150));
            if (window.visualViewport) window.visualViewport.addEventListener('resize', ResponsiveGame.fit);
            // Tela cheia + paisagem no primeiro toque (exige gesto do usuário)
            document.addEventListener('touchend', ResponsiveGame.enterFullscreen, { once: true });
        } else {
            const app = document.getElementById('app');
            if (app) {
                app.style.width = config.game.w + 'px';
                app.style.height = config.game.h + 'px';
            }
        }
    }

    // Escala o #app (tamanho original config.game.w x h) para caber na tela, centralizado
    static fit() {
        const app = document.getElementById('app');
        if (!app) return;
        const vv = window.visualViewport;
        const sw = vv ? vv.width : window.innerWidth;
        const sh = vv ? vv.height : window.innerHeight;
        const scale = Math.min(sw / config.game.w, sh / config.game.h);

        app.style.width = config.game.w + 'px';
        app.style.height = config.game.h + 'px';
        app.style.position = 'fixed';
        app.style.left = '50%';
        app.style.top = '50%';
        app.style.margin = '0';
        app.style.transformOrigin = 'center center';
        app.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    static enterFullscreen() {
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) {
            Promise.resolve(req.call(el)).then(() => {
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {});
                }
            }).catch(() => {});
        }
    }
}

document.addEventListener('DOMContentLoaded', () => ResponsiveGame.init());