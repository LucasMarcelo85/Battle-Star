// Responsividade para Mobile
class ResponsiveGame {
    static init() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            ResponsiveGame.setupMobile();
        } else {
            ResponsiveGame.setupDesktop();
        }
        
        // Listener para mudanças de orientação
        window.addEventListener('orientationchange', () => {
            ResponsiveGame.handleOrientationChange();
        });
    }

    static setupMobile() {
        // Ajusta o container principal
        const app = document.getElementById('app');
        if (app) {
            app.style.width = '100vw';
            app.style.height = '100vh';
            app.style.maxWidth = '100%';
            app.style.margin = '0';
            app.style.padding = '0';
        }

        // Ajusta o canvas para caber na tela
        const canvas = document.getElementById('canvas');
        if (canvas) {
            // Mantém a proporção original mas redimensiona se necessário
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // Se a tela é menor que o tamanho padrão, redimensiona proporcionalmente
            if (screenWidth < config.game.w || screenHeight < config.game.h) {
                const scaleW = screenWidth / config.game.w;
                const scaleH = screenHeight / config.game.h;
                const scale = Math.min(scaleW, scaleH) * 0.95; // 95% para deixar margem
                
                canvas.style.transform = `scale(${scale})`;
                canvas.style.transformOrigin = 'top left';
                canvas.style.width = config.game.w + 'px';
                canvas.style.height = config.game.h + 'px';
            }
        }

        // Oculta elementos desnecessários em mobile
        const logo = document.getElementById('logo');
        if (logo && logo.classList.contains('play-status')) {
            logo.style.display = 'none';
        }

        // Previne zoom no mobile
        document.body.style.touchAction = 'none';
    }

    static setupDesktop() {
        const app = document.getElementById('app');
        if (app) {
            app.style.width = config.game.w + 'px';
            app.style.height = config.game.h + 'px';
        }
    }

    static handleOrientationChange() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            setTimeout(() => {
                ResponsiveGame.setupMobile();
            }, 100);
        }
    }

    // Detecta se é mobile
    static isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }

    // Ajusta tamanho do jogo conforme a tela
    static scaleGameForMobile() {
        const isMobile = ResponsiveGame.isMobile();
        if (!isMobile) return;

        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        if (screenWidth < config.game.w || screenHeight < config.game.h) {
            const scaleW = screenWidth / config.game.w;
            const scaleH = screenHeight / config.game.h;
            const scale = Math.min(scaleW, scaleH) * 0.95;

            canvas.style.transform = `scale(${scale})`;
        }
    }
}

// Inicializa a responsividade quando o documento está pronto
document.addEventListener('DOMContentLoaded', function() {
    ResponsiveGame.init();
});
