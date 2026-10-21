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

        this.speed = 480;
        this.deadZone = 0.08;
        this.fireInterval = 170;
        this.autoFire = false;

        // Estado
        this.vec = { x: 0, y: 0 };
        this.joyPointer = null;
        this.firePointer = null;
        this.lastTime = 0;
        this.nextFireAt = 0;
        this.destroyed = false;

        if (!MobileControls.isTouchDevice()) return;

        this.build();
        this.bindEvents();
        this.player.bulletCooldown.initCooldown = Math.round(fps * 0.22);
        this.player.bulletCooldown.reset();
        this.player.canFire = true;
    }

    // ---------- UI ----------
    build() {
        const old = document.getElementById('mobile-controls');
        if (old) old.remove();

        const root = document.createElement('div');
        root.id = 'mobile-controls';
        root.className = 'mobile-controls';

        const joyZone = document.createElement('div');
        joyZone.className = 'mobile-controls__joystick-zone';

        const base = document.createElement('div');
        base.className = 'mobile-controls__joystick';
        const knob = document.createElement('div');
        knob.className = 'mobile-controls__knob';
        base.appendChild(knob);
        joyZone.appendChild(base);

        const fire = document.createElement('div');
        fire.textContent = 'ATIRAR';
        fire.className = 'mobile-controls__fire';
        fire.setAttribute('role', 'button');
        fire.setAttribute('aria-label', 'Atirar');

        const auto = document.createElement('div');
        auto.textContent = 'AUTO';
        auto.className = 'mobile-controls__auto';
        auto.setAttribute('role', 'button');
        auto.setAttribute('aria-label', 'Alternar tiro automático');
        auto.setAttribute('aria-pressed', 'false');

        root.append(joyZone, fire, auto);
        document.body.appendChild(root);

        this.root = root;
        this.joyZone = joyZone;
        this.base = base;
        this.knob = knob;
        this.fireBtn = fire;
        this.autoBtn = auto;
        this.radiusPx = base.getBoundingClientRect().width / 2;
        this.defaultBaseStyle = {
            left: getComputedStyle(base).left,
            bottom: getComputedStyle(base).bottom
        };
    }

    bindEvents() {
        const opt = { passive: false };
        this.onJoyDown = (e) => {
            if (this.joyPointer !== null) return;
            e.preventDefault();
            this.joyPointer = e.pointerId;
            this.joyZone.setPointerCapture(e.pointerId);
            const r = this.radiusPx = this.base.getBoundingClientRect().width / 2;
            this.origin = { x: e.clientX, y: e.clientY };
            this.base.style.left = (e.clientX - r) + 'px';
            this.base.style.top = (e.clientY - r) + 'px';
            this.base.style.bottom = 'auto';
            this.base.classList.add('is-active');
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
            this.base.classList.remove('is-active');
        };

        this.onFireDown = (e) => {
            e.preventDefault();
            this.fireBtn.setPointerCapture(e.pointerId);
            this.firePointer = e.pointerId;
            this.fireBtn.classList.add('is-pressed');
            this.shoot(performance.now());
        };
        this.onFireUp = (e) => {
            if (e.pointerId !== this.firePointer) return;
            this.firePointer = null;
            this.fireBtn.classList.remove('is-pressed');
        };

        this.onAutoDown = (e) => {
            e.preventDefault();
            this.autoFire = !this.autoFire;
            this.autoBtn.classList.toggle('is-active', this.autoFire);
            this.autoBtn.setAttribute('aria-pressed', String(this.autoFire));
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

    shoot(now) {
        if (!this.canAct() || now < this.nextFireAt || !this.player.canFire) return;
        this.nextFireAt = now + this.fireInterval;
        res.replay('shoot');
        this.player.fire();
    }

    update(now) {
        if (this.destroyed) return;
        const timestamp = Number.isFinite(now) ? now : performance.now();
        const dt = this.lastTime ? Math.min((timestamp - this.lastTime) / 1000, 0.05) : 0;
        this.lastTime = timestamp;

        if ((this.vec.x || this.vec.y) && this.canAct()) {
            const p = this.player;
            p.x = Math.min(Math.max(0, p.x + this.vec.x * this.speed * dt), config.game.w - p.w);
            p.y = Math.min(Math.max(0, p.y + this.vec.y * this.speed * dt), config.game.h - p.h);
        }
        if (this.autoFire || this.firePointer !== null) this.shoot(timestamp);
    }

    // Remove tudo ao sair da cena
    destroy() {
        this.destroyed = true;
        if (this.onDocTouch) document.removeEventListener('touchmove', this.onDocTouch);
        if (this.root) { this.root.remove(); this.root = null; }
    }
}