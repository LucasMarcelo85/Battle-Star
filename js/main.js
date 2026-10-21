(() => {
    const introVideo = document.getElementById('intro-video');
    const app = document.getElementById('app');
    const game = new Game();
    let hasStarted = false;

    function startGame() {
        if (hasStarted) return;
        hasStarted = true;
        introVideo.style.display = 'none';
        app.style.display = 'block';
        game.start();
    }

    introVideo.addEventListener('ended', startGame, { once: true });
    introVideo.addEventListener('error', () => {
        console.error('Não foi possível carregar o vídeo de abertura.');
        startGame();
    }, { once: true });

    introVideo.play().catch(error => {
        console.warn('Autoplay do vídeo de abertura indisponível:', error);
        startGame();
    });
})();
