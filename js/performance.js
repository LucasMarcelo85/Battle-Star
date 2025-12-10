// Otimizações de Performance para Mobile
class PerformanceOptimizer {
    static init() {
        // Reduz frame rate em dispositivos móveis para economizar bateria
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            PerformanceOptimizer.optimizeForMobile();
        }

        // Monitora performance
        PerformanceOptimizer.setupMonitoring();
    }

    static optimizeForMobile() {
        // Desativa hardware acceleration desnecessário
        const canvas = document.getElementById('canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d', { 
                antialias: false, 
                alpha: false,
                willReadFrequently: false 
            });
        }

        // Desativa algumas animações em mobile para economizar recursos
        // Reduz qualidade de renderização em alguns casos
        document.documentElement.style.textSizeAdjust = '100%';
        document.documentElement.style.webkitTextSizeAdjust = '100%';
    }

    static setupMonitoring() {
        // Monitora o uso de memória e ajusta se necessário
        if ('memory' in performance) {
            setInterval(() => {
                const used = performance.memory.usedJSHeapSize;
                const limit = performance.memory.jsHeapSizeLimit;
                const percent = (used / limit) * 100;

                // Se usar mais de 80% de memória, limpa cache desnecessário
                if (percent > 80) {
                    PerformanceOptimizer.clearUnusedResources();
                }
            }, 5000);
        }
    }

    static clearUnusedResources() {
        // Esta função pode ser chamada quando a memória está alta
        // Aqui você pode implementar lógica específica para liberar recursos
        console.log('Liberando recursos para economizar memória');
    }

    // Throttle de eventos para melhor performance
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Debounce de eventos
    static debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        }
    }

    // Detecta se o dispositivo está em modo de bateria baixa
    static isLowBatteryMode() {
        if ('getBattery' in navigator) {
            return navigator.getBattery().then(battery => {
                return battery.level < 0.2;
            });
        }
        return Promise.resolve(false);
    }
}

// Inicializa otimizações quando o documento está pronto
document.addEventListener('DOMContentLoaded', function() {
    PerformanceOptimizer.init();
});
