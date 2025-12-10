class Player extends Plane {
    
    setup() {
        super.setup('player');
        this.initBullet('playerBullet', this.scene.playerBullets);
        this.mouseListener = null;
        this.mouseDownListener = null;
        this.event();
    }

    up() {
        if (this.y <= 0) return;
        this.y -= this.speed;
    }
    left() {
        if (this.x <= 0) return;
        this.x -= this.speed;
    }
    right() {
        if (this.x + this.w >= config.game.w) return;
        this.x += this.speed;
    }
    down() {
        if (this.y + this.h >= config.game.h) return;
        this.y += this.speed;
    }

    event() {
        const called = callback => {
            if (!this.run) return;
            if (this.scene.pauseFlag) return;
            if (this.scene.game.data.end) return;
            callback.call(this);
        };

        // Configuração de teclas para movimentação
        const keys = {
            'w': this.up.bind(this),
            'a': this.left.bind(this),
            's': this.down.bind(this),
            'd': this.right.bind(this),
        };
        Object.keys(keys).forEach((key) => {
            hotkey.reg(key, () => {
                called(keys[key]);
            }); 
        });

        // Configuração para disparo com a barra de espaço
        hotkey.reg(' ', () => {
            called(() => {
                res.replay('shoot');
                this.fire();
            });
        }, true);

        // Adiciona evento para movimentação com o mouse (otimizado com debounce)
        this.mouseListener = (event) => {
            if (!this.run) return;
            if (this.scene.pauseFlag) return;
            if (this.scene.game.data.end) return;

            const rect = this.scene.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Atualiza a posição do jogador com base no cursor do mouse
            this.x = Math.min(Math.max(0, mouseX - this.w / 2), config.game.w - this.w);
            this.y = Math.min(Math.max(0, mouseY - this.h / 2), config.game.h - this.h);
        };
        
        this.scene.canvas.addEventListener('mousemove', this.mouseListener, false);

        // Adiciona evento para disparo com clique do mouse
        this.mouseDownListener = (event) => {
            if (!this.run) return;
            if (this.scene.pauseFlag) return;
            if (this.scene.game.data.end) return;

            res.replay('shoot');
            this.fire();
        };
        
        this.scene.canvas.addEventListener('mousedown', this.mouseDownListener, false);
    }

    // Limpa os listeners de mouse quando o jogador é destruído
    destroy() {
        if (this.mouseListener) {
            this.scene.canvas.removeEventListener('mousemove', this.mouseListener);
        }
        if (this.mouseDownListener) {
            this.scene.canvas.removeEventListener('mousedown', this.mouseDownListener);
        }
    }
}
