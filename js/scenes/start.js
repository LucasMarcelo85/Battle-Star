class Start extends Scene {
    setup() {
        super.setup();
        if (typeof ResponsiveGame !== 'undefined') {
            ResponsiveGame.endGameplay();
        }
        this.game.initData();
        this.event();
    }

    event() {
        const btn = $('#start-btn');
        on(
            btn,
            'click',
            () => {
                if (typeof ResponsiveGame !== 'undefined') {
                    ResponsiveGame.enterFullscreen();
                }
                btn.setAttribute('disabled', 'disabled');
                res.loadAssets(() => {
                    this.game.play();
                    btn.removeAttribute('disabled');
                })
            }
        )
    }
}