// Controles touch para mobile/tablet: joystick virtual (esquerda) + botão de tiro (direita)
// Uso (igual ao anterior): this.mobileControls = new MobileControls(player, scene);
// Ao sair da cena: this.mobileControls.destroy();
class MobileControls {
    static isTouchDevice() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent)) || // iPad moderno
            ('ontouchstart' in window && window.matchMedia('(pointer: coarse)').matches);
    }

    constructor(player, scene) {
        this.player = player;
        this.scene = scene;

        // Ajustes
        this.speed = (player && player.speed) || 6;   // px por frame (60fps)
        this.deadZone = 0.12;                          // zona morta do joystick (0..1)
        this.fireInterval = 170;                       // ms entre tiros ao segurar
        this.autoFire = false;

        // Estado
        this.vec = { x: 0, y: 0 };
        this.joyPointer = null;
        this.firePointer = null;
        this.fireTimer = null;
        this.rafId = null;
        this.lastTime = 0;
        this.destroyed = false;

        if (!MobileControls.isTouchDevice()) return;

        this.build();
        this.bindEvents();
        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
        this.rafId = requestAnimationFrame(this.loop);
    }

    // ---------- UI ----------
    build() {
        const old = document.getElementById('mobile-controls');
        if (old) old.remove();

        const root = document.createElement('div');
        root.id = 'mobile-controls';
        root.style.cssText = `
            position: fixed; inset: 0; z-index: 1000;
            pointer-events: none; touch-action: none;
            user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
        `;

        const R = 'min(18vmin, 120px)'; // raio da base do joystick

        // Zona do joystick (metade esquerda da tela, aceita toque em qualquer lugar)
        const joyZone = document.createElement('div');
        joyZone.style.cssText = `position:absolute; left:0; top:0; width:55%; height:100%;
            pointer-events:auto; touch-action:none;`;

        const base = document.createElement('div');
        base.style.cssText = `
            position:absolute; width:calc(${R} * 2); height:calc(${R} * 2);
            border-radius:50%; background:rgba(255,255,255,0.12);
            border:2px solid rgba(255,255,255,0.45);
            box-shadow:0 0 12px rgba(0,0,0,0.35) inset;
            transition:opacity .15s; opacity:.55;
            left:calc(env(safe-area-inset-left, 0px) + 5vmin);
            bottom:calc(env(safe-area-inset-bottom, 0px) + 5vmin);
        `;
        const knob = document.createElement('div');
        knob.style.cssText = `
            position:absolute; width:calc(${R} * 0.85); height:calc(${R} * 0.85);
            left:50%; top:50%; margin:calc(${R} * -0.425) 0 0 calc(${R} * -0.425);
            border-radius:50%; background:rgba(255,255,255,0.55);
            border:2px solid rgba(255,255,255,0.9);
            box-shadow:0 2px 10px rgba(0,0,0,0.4);
        `;
        base.appendChild(knob);
        joyZone.appendChild(base);

        // Botão de tiro
        const fire = document.createElement('div');
        fire.textContent = 'ATIRAR';
        fire.style.cssText = `
            position:absolute; pointer-events:auto; touch-action:none;
            width:min(22vmin,140px); height:min(22vmin,140px); border-radius:50%;
            right:calc(env(safe-area-inset-right, 0px) + 5vmin);
            bottom:calc(env(safe-area-inset-bottom, 0px) + 6vmin);
            display:flex; align-items:center; justify-content:center;
            background:linear-gradient(135deg,#ff6b6b,#ee5a6f); color:#fff;
            border:3px solid #fff; font:bold 14px/1 sans-serif;
            box-shadow:0 4px 15px rgba(0,0,0,0.4); opacity:.85;
            transition:transform .05s;
        `;

        // Botão AUTO (tiro automático)
        const auto = document.createElement('div');
        auto.textContent = 'AUTO';
        auto.style.cssText = `
            position:absolute; pointer-events:auto; touch-action:none;
            width:min(11vmin,64px); height:min(11vmin,64px); border-radius:50%;
            right:calc(env(safe-area-inset-right, 0px) + 5vmin + min(22vmin,140px) + 2vmin);
            bottom:calc(env(safe-area-inset-bottom, 0px) + 5vmin);
            display:flex; align-items:center; justify-content:center;
            background:rgba(0,0,0,0.45); color:#fff; border:2px solid rgba(255,255,255,0.7);
            font:bold 11px/1 sans-serif; opacity:.8;
        `;

        root.append(joyZone, fire, auto);
        document.body.appendChild(root);

        this.root = root;
        this.joyZone = joyZone;
        this.base = base;
        this.knob = knob;
        this.fireBtn = fire;
        this.autoBtn = auto;
        this.radiusPx = base.getBoundingClientRect().width / 2;
        this.defaultBaseStyle = { left: base.style.left, bottom: base.style.bottom };
    }

    bindEvents() {
        const opt = { passive: false };
        this.onJoyDown = (e) => {
            if (this.joyPointer !== null) return;
            e.preventDefault();
            this.joyPointer = e.pointerId;
            this.joyZone.setPointerCapture(e.pointerId);
            // Joystick flutuante: a base aparece onde o dedo tocou
            const r = this.radiusPx = this.base.getBoundingClientRect().width / 2;
            this.origin = { x: e.clientX, y: e.clientY };
            this.base.style.left = (e.clientX - r) + 'px';
            this.base.style.top = (e.clientY - r) + 'px';
            this.base.style.bottom = 'auto';
            this.base.style.opacity = '.95';
            this.updateJoy(e);
        };
        this.onJoyMove = (e) => {
            if (e.pointerId !== this.joyPointer) return;
            e.preventDefault();
            this.updateJoy(e);
        };
        this.onJoyUp = (e) => {
            if (e.pointerId !== this.joyPointer) return;
            this.joyPointer = null;
            this.vec.x = 0; this.vec.y = 0;
            this.knob.style.transform = 'translate(0,0)';
            this.base.style.left = this.defaultBaseStyle.left;
            this.base.style.bottom = this.defaultBaseStyle.bottom;
            this.base.style.top = 'auto';
            this.base.style.opacity = '.55';
        };

        this.onFireDown = (e) => {
            e.preventDefault();
            this.fireBtn.setPointerCapture(e.pointerId);
            this.firePointer = e.pointerId;
            this.fireBtn.style.transform = 'scale(0.92)';
            this.shoot();
            this.startFireLoop();
        };
        this.onFireUp = (e) => {
            if (e.pointerId !== this.firePointer) return;
            this.firePointer = null;
            this.fireBtn.style.transform = 'scale(1)';
            if (!this.autoFire) this.stopFireLoop();
        };

        this.onAutoDown = (e) => {
            e.preventDefault();
            this.autoFire = !this.autoFire;
            this.autoBtn.style.background = this.autoFire ? 'rgba(46,204,113,0.85)' : 'rgba(0,0,0,0.45)';
            if (this.autoFire) this.startFireLoop();
            else if (this.firePointer === null) this.stopFireLoop();
        };

        this.onContext = (e) => e.preventDefault();

        this.joyZone.addEventListener('pointerdown', this.onJoyDown, opt);
        this.joyZone.addEventListener('pointermove', this.onJoyMove, opt);
        this.joyZone.addEventListener('pointerup', this.onJoyUp, opt);
        this.joyZone.addEventListener('pointercancel', this.onJoyUp, opt);
        this.fireBtn.addEventListener('pointerdown', this.onFireDown, opt);
        this.fireBtn.addEventListener('pointerup', this.onFireUp, opt);
        this.fireBtn.addEventListener('pointercancel', this.onFireUp, opt);
        this.autoBtn.addEventListener('pointerdown', this.onAutoDown, opt);
        this.root.addEventListener('contextmenu', this.onContext);

        // Evita rolagem/zoom da página durante o jogo
        this.onDocTouch = (e) => { if (this.root && this.root.isConnected) e.preventDefault(); };
        document.addEventListener('touchmove', this.onDocTouch, opt);
    }

    // ---------- Lógica ----------
    updateJoy(e) {
        const r = this.radiusPx;
        let dx = e.clientX - this.origin.x;
        let dy = e.clientY - this.origin.y;
        const dist = Math.hypot(dx, dy);
        if (dist > r) { dx = dx / dist * r; dy = dy / dist * r; }
        this.knob.style.transform = `translate(${dx}px, ${dy}px)`;

        let nx = dx / r, ny = dy / r;
        const mag = Math.hypot(nx, ny);
        if (mag < this.deadZone) { nx = 0; ny = 0; }
        else {
            // Reescala após a zona morta para movimento suave e progressivo
            const scaled = (mag - this.deadZone) / (1 - this.deadZone);
            nx = nx / mag * scaled;
            ny = ny / mag * scaled;
        }
        this.vec.x = nx;
        this.vec.y = ny;
    }

    canAct() {
        const s = this.scene;
        return this.player && this.player.run && !s.pauseFlag && !(s.game && s.game.data && s.game.data.end);
    }

    shoot() {
        if (!this.canAct()) return;
        try { if (typeof res !== 'undefined') res.replay('shoot'); } catch (_) {}
        this.player.fire();
    }

    startFireLoop() {
        if (this.fireTimer) return;
        this.fireTimer = setInterval(() => this.shoot(), this.fireInterval);
    }

    stopFireLoop() {
        clearInterval(this.fireTimer);
        this.fireTimer = null;
    }

    loop(now) {
        if (this.destroyed) return;
        const dt = Math.min((now - this.lastTime) / 16.667, 3); // normaliza para 60fps
        this.lastTime = now;

        if ((this.vec.x || this.vec.y) && this.canAct()) {
            const p = this.player;
            p.x = Math.min(Math.max(0, p.x + this.vec.x * this.speed * dt), config.game.w - p.w);
            p.y = Math.min(Math.max(0, p.y + this.vec.y * this.speed * dt), config.game.h - p.h);
        }
        this.rafId = requestAnimationFrame(this.loop);
    }

    // Remove tudo ao sair da cena
    destroy() {
        this.destroyed = true;
        cancelAnimationFrame(this.rafId);
        this.stopFireLoop();
        if (this.onDocTouch) document.removeEventListener('touchmove', this.onDocTouch);
        if (this.root) { this.root.remove(); this.root = null; }
    }
}