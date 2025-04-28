document.addEventListener("DOMContentLoaded", function () {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log("User Agent:", navigator.userAgent); // Para depuração
    console.log("É dispositivo móvel?", isMobile); // Para verificar o teste

    if (isMobile) {
        document.body.innerHTML = `
            <div style="text-align: center; margin-top: 20%; font-family: Arial, sans-serif;">
                <h1>Galácticos</h1>
                <p>Galácticos ainda não está disponível para dispositivos móveis.</p>
            </div>
        `;
    }
});
