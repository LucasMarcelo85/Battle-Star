// Controles touch para mobile
class MobileControls {
    constructor(player, scene) {
        this.player = player;
        this.scene = scene;
        this.isTouching = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.currentTouchX = 0;
        this.currentTouchY = 0;
        this.currentElement = null;
        this.fireButton = null;
        
        // Bind methods para manter contexto
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
        
        this.init();
    }

    init() {
        // Cria botão de tiro
        this.createFireButton();
        
        // Configura canvas para aceitar touch
        const canvas = this.scene.canvas;
        canvas.style.touchAction = 'none';
        
        // Adiciona listeners de touch
        canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        canvas.addEventListener('touchend', this.boundTouchEnd, { passive: false });
        canvas.addEventListener('touchcancel', this.boundTouchEnd, { passive: false });
    }

    createFireButton() {
        // Remove botão anterior se existir
        const existing = document.getElementById('fire-btn-mobile');
        if (existing) existing.remove();

        const btn = document.createElement('button');
        btn.id = 'fire-btn-mobile';
        btn.textContent = 'ATIRAR';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
            color: white;
            border: 3px solid #fff;
            font-weight: bold;
            font-size: 12px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
        `;

        // Eventos do botão de tiro
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleFireButtonPress(true);
        }, false);

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleFireButtonPress(false);
        }, false);

        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.handleFireButtonPress(true);
        }, false);

        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.handleFireButtonPress(false);
        }, false);

        document.body.appendChild(btn);
        this.fireButton = btn;
    }

    handleFireButtonPress(isPressed) {
        if (!this.player.run || this.scene.pauseFlag || this.scene.game.data.end) return;
        
        if (isPressed) {
            res.replay('shoot');
            this.player.fire();
            this.fireButton.style.transform = 'scale(0.95)';
        } else {
            this.fireButton.style.transform = 'scale(1)';
        }
    }

    handleTouchStart(e) {
        if (!this.player.run || this.scene.pauseFlag || this.scene.game.data.end) return;
        
        const touch = e.touches[0];
        this.isTouching = true;
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.currentTouchX = touch.clientX;
        this.currentTouchY = touch.clientY;
    }

    handleTouchMove(e) {
        if (!this.isTouching || !this.player.run || this.scene.pauseFlag || this.scene.game.data.end) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        this.currentTouchX = touch.clientX;
        this.currentTouchY = touch.clientY;
        
        const rect = this.scene.canvas.getBoundingClientRect();
        const canvasX = this.currentTouchX - rect.left;
        const canvasY = this.currentTouchY - rect.top;
        
        // Atualiza posição do jogador para seguir o toque
        this.player.x = Math.min(Math.max(0, canvasX - this.player.w / 2), config.game.w - this.player.w);
        this.player.y = Math.min(Math.max(0, canvasY - this.player.h / 2), config.game.h - this.player.h);
    }

    handleTouchEnd(e) {
        this.isTouching = false;
    }

    // Método para remover controles quando sair da cena
    destroy() {
        if (this.fireButton) {
            this.fireButton.remove();
            this.fireButton = null;
        }
        
        this.scene.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this), false);
        this.scene.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this), false);
        this.scene.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this), false);
    }
}
