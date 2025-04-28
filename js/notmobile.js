document.addEventListener("DOMContentLoaded", function () {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log("User Agent:", navigator.userAgent); // Para depuração
    console.log("É dispositivo móvel?", isMobile); // Para verificar o teste

     // Adiciona o som de fundo
     const audio = document.createElement("audio");
     audio.src = "./sound/background.mp3"; // Update the path to match the correct location
     audio.autoplay = true;
     audio.loop = true;
     document.body.appendChild(audio);

    if (isMobile) {
        document.body.style.background = `url('./img/background-1.jpg') no-repeat center center fixed`;
        document.body.style.backgroundSize = "cover";
        document.body.innerHTML = `
            <div style="text-align: center; margin-top: 20%; font-family: Arial, sans-serif; color: #fff;">
            <h1 style="
            background: linear-gradient(to right, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 3rem;
            margin-bottom: 1rem;
            ">
            Galácticos
            </h1>
            <p style="
            color:rgb(223, 41, 41);
            border: 2px solid rgb(223, 41, 41);
           background-color: rgba(255, 255, 255, 0.8);
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: bold;
            ">
            Por favor, acesse o site em um computador para uma melhor experiência.
            </p> <br>
            <p style="color: #fff; font-size: 1.2rem;">Desenvolvedor:</p>
            <span>
            <a href="https://github.com/LucasMarcelo85" target="_blank"> @DevMarcelo</a>
        </span>
            </div>
        `;

       
    }
});
