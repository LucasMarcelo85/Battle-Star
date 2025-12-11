(() => {
    const introVideo = document.getElementById('intro-video');
    const skipContainer = document.getElementById('skip-container');
    const introModal1 = document.getElementById('intro-modal-1');
    const introModal2 = document.getElementById('intro-modal-2');
    const introModal3 = document.getElementById('intro-modal-3');
    const app = document.getElementById('app');
    const skipBtns = document.querySelectorAll('.skip-btn');
    const playGameBtn = document.getElementById('play-game-btn');
    const videoOverlay = document.getElementById('video-overlay');
    const playVideoBtn = document.getElementById('play-video-btn');

    function startGame() {
        introVideo.style.display = 'none';
        skipContainer.style.display = 'none';
        app.style.display = 'block';
        const game = new Game();
        game.start();
    }

    function showIntroStep(step) {
        introModal1.style.display = 'none';
        introModal2.style.display = 'none';
        introModal3.style.display = 'none';

        if (step === 1) {
            introModal1.style.display = 'block';
        } else if (step === 2) {
            introModal2.style.display = 'block';
            setTimeout(() => showIntroStep(3), 5000);
        } else if (step === 3) {
            introModal3.style.display = 'block';
            setTimeout(() => {
                playGameBtn.textContent = 'Jogar';
            }, 5000);
        }
    }

    playVideoBtn.addEventListener('click', () => {
        videoOverlay.style.display = 'none';
        introVideo.play();
    });

    introVideo.onended = () => {
        skipContainer.style.display = 'flex';
        showIntroStep(1);
    };

    introVideo.onplay = () => {
        videoOverlay.style.display = 'none';
    }

    introVideo.onpause = () => {
        if (!introVideo.ended) {
            videoOverlay.style.display = 'flex';
        }
    }

    skipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (introModal1.style.display === 'block') {
                showIntroStep(2);
            } else if (introModal2.style.display === 'block') {
                showIntroStep(3);
            }
        });
    });

    playGameBtn.addEventListener('click', () => {
        startGame();
    });
    
    // Start the intro
    introVideo.play().catch(error => {
        videoOverlay.style.display = 'flex';
    });
})();