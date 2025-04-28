document.addEventListener("DOMContentLoaded", function () {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log("User Agent:", navigator.userAgent); // Para depuração
    console.log("É dispositivo móvel?", isMobile); // Para verificar o teste

    if (isMobile) {
        document.body.innerHTML = `
            <div style="text-align: center; margin-top: 20%; font-family: Arial, sans-serif; color: #333;">
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
                color: #D9534F;
                font-size: 1.2rem;
                font-weight: bold;
            ">
                Atenção: Galácticos ainda não está disponível para dispositivos móveis.
            </p>
            </div>
        `;
    }
});
