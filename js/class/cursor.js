class Player extends Plane {
    
    setup() {
        super.setup('player');
        this.initBullet('playerBullet', this.scene.playerBullets);
        this.event();
    }

    event() {
        // Adiciona evento para movimentação com o mouse
        this.scene.canvas.addEventListener('mousemove', (event) => {
            if (!this.run) return;
            if (this.scene.pauseFlag) return;
            if (this.scene.game.data.end) return;

            const rect = this.scene.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Atualiza a posição do jogador com base no cursor do mouse
            this.x = Math.min(Math.max(0, mouseX - this.w / 2), config.game.w - this.w);
            this.y = Math.min(Math.max(0, mouseY - this.h / 2), config.game.h - this.h);
        });

        // Adiciona evento para movimentação com o clique do mouse
        this.scene.canvas.addEventListener('mousedown', (event) => {
            if (!this.run) return;
            if (this.scene.pauseFlag) return;
            if (this.scene.game.data.end) return;

            const rect = this.scene.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Atualiza a posição do jogador com base no clique do mouse
            this.x = Math.min(Math.max(0, mouseX - this.w / 2), config.game.w - this.w);
            this.y = Math.min(Math.max(0, mouseY - this.h / 2), config.game.h - this.h);
        });
    }
}
