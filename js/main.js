(() => {
    const introVideo = document.getElementById('intro-video');
    const app = document.getElementById('app');
    const game = new Game();
    let hasStarted = false;

    function startGame() {
        if (hasStarted) return;
        hasStarted = true;
        introVideo.pause();
        introVideo.style.display = 'none';
        app.style.display = 'block';
        game.start();
    }

    function enableIntroAudio() {
        if (introVideo.ended || introVideo.paused) return;
        introVideo.muted = false;
        introVideo.play().catch(error => {
            console.warn('Não foi possível ativar o áudio da abertura:', error);
        });
    }

    introVideo.addEventListener('ended', startGame, { once: true });
    introVideo.addEventListener('error', () => {
        console.error('Não foi possível carregar o vídeo de abertura.');
        startGame();
    }, { once: true });

    document.addEventListener('pointerdown', enableIntroAudio, { once: true });
    introVideo.muted = false;
    introVideo.play().catch(error => {
        console.warn('Autoplay com áudio indisponível; iniciando a abertura sem som:', error);
        introVideo.muted = true;
        introVideo.play().catch(playError => {
            console.error('Não foi possível iniciar o vídeo de abertura:', playError);
            startGame();
        });
    });
})();
