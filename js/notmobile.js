document.addEventListener("DOMContentLoaded", function () {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log("User Agent:", navigator.userAgent);
    console.log("É dispositivo móvel?", isMobile);

    // Adiciona o som de fundo
    const audio = document.createElement("audio");
    audio.src = "./sound/background.mp3";
    audio.autoplay = true;
    audio.loop = true;
    document.body.appendChild(audio);

    // Detecta se é mobile e ajusta o viewport e estilos
    if (isMobile) {
        // Ajusta o viewport para mobile
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
        }
        
        // Faz o jogo usar a tela cheia em mobile
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
    }
});
