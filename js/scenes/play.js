class Play extends Scene {
    constructor(el,game){
        super(el,game);
        this.created();
    }
    created(){
        this.raf_id = 'play_update';
        this.initCanvas();
    }
    setup() {
        this.muteFlag = false;
        if (typeof ResponsiveGame !== 'undefined') {
            ResponsiveGame.startGameplay();
        }
        this.initData();
        this.initPlayer();
        this.damageEffects = [];
        this.updateTime();
        this.updateFuel();
        this.updateScore();
        this.updateFontSize();
        $("#logo").classList.add('play-status');
        this.event();
        this.initMobileControls();
        this.start();
    }

    start() {
        this.pauseFlag = false;
        raf.reg(this.raf_id, this.update.bind(this));
        res.play('bg');
        $('#game-pause-btn').classList.add('active');
    }
    pause() {
        this.pauseFlag = true;
        raf.remove(this.raf_id);
        res.pause('bg');
        $('#game-pause-btn').classList.remove('active');
    }

    mute(){
        this.muteFlag = true;
        res.mute();
        $('#game-mute-btn').classList.add('active');
    }

    speak(){
        this.muteFlag = false;
        res.speak();
        $('#game-mute-btn').classList.remove('active');
    }

    uninstall() {
        raf.remove(this.raf_id);
        res.end('bg');
        $("#logo").classList.remove('play-status');
        hotkey.clearAll();
        if (this.player && this.player.destroy) {
            this.player.destroy();
        }
        if (this.mobileControls) {
            this.mobileControls.destroy();
        }
    }

    initData() {

        this.pauseFlag = false;

        this.timeCooldown = new Cooldown(fps, true);


        this.playerBullets = [];
        this.enemyBullets = [];
        this.allEnemys = [];
        this.enemys = {
            arr: this.allEnemys,
            elem: Enemy,
            cooldown: new Cooldown(config.game.appendEnemyCooldown),
        };
        this.meteorites = {
            arr: this.allEnemys,
            elem: Meteorite,
            cooldown: new Cooldown(config.game.appendEnemyCooldown),
        };
        this.friends = {
            arr: [],
            elem: Friend,
            cooldown: new Cooldown(config.game.appendFriendCooldown),
        };
        this.fuels = {
            arr: [],
            elem: Fuel,
            cooldown: new Cooldown(config.game.appendFriendCooldown),
        };
    }

    collision(a, b, callback) {
        if (!a.run || !b.run) {
            return;
        }
        const aHitbox = a.hitbox;
        const bHitbox = b.hitbox;
        const aLeft = a.x + (aHitbox ? a.w * aHitbox.x : 0);
        const aTop = a.y + (aHitbox ? a.h * aHitbox.y : 0);
        const aRight = a.x + a.w * (aHitbox ? aHitbox.x + aHitbox.w : 1);
        const aBottom = a.y + a.h * (aHitbox ? aHitbox.y + aHitbox.h : 1);
        const bLeft = b.x + (bHitbox ? b.w * bHitbox.x : 0);
        const bTop = b.y + (bHitbox ? b.h * bHitbox.y : 0);
        const bRight = b.x + b.w * (bHitbox ? bHitbox.x + bHitbox.w : 1);
        const bBottom = b.y + b.h * (bHitbox ? bHitbox.y + bHitbox.h : 1);
        if (aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop) {
            callback(a, b);
        }
    }

    damagePlayer() {
        const now = performance.now();
        if (!this.player.receiveDamage(now)) return false;
        this.damageEffects.push({
            x: this.player.x + this.player.w / 2,
            y: this.player.y + this.player.h / 2,
            age: 0,
            startedAt: now,
        });
        this.updateFuel(config.fuelConfig.beingHit);
        return true;
    }

    drawDamageEffects(timestamp) {
        const ctx = this.ctx;
        const now = Number.isFinite(timestamp) ? timestamp : performance.now();
        for (let i = this.damageEffects.length - 1; i >= 0; i--) {
            const effect = this.damageEffects[i];
            effect.age = Math.max(effect.age, now - effect.startedAt);
            const progress = effect.age / 260;
            if (progress >= 1) {
                this.damageEffects.splice(i, 1);
                continue;
            }

            const radius = 6 + progress * 23;
            ctx.save();
            ctx.globalAlpha = 1 - progress;
            const glow = ctx.createRadialGradient(effect.x, effect.y, 1, effect.x, effect.y, radius);
            glow.addColorStop(0, '#fff8c7');
            glow.addColorStop(0.35, '#ffb52e');
            glow.addColorStop(1, 'rgba(255, 68, 30, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffe59a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 5 + progress * 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    bulletCollision(bullet, arr, callback) {
        arr.forEach(el => {
            this.collision(bullet, el, (a, b) => {
                a.reduceLife();
                b.reduceLife();
                if (!b.run) {
                    callback(b);
                }
            });
        });
    }

    playerCollision(el, callback) {
        this.collision(this.player, el, () => {
            el.death();
            callback(el);
        });
    }

    factory(elem) {
        const o = new elem(this);
        o.setup();
        return o;
    }

    append(obj) {
        obj.cooldown.update().active(() => {
            obj.arr.push(
                this.factory(obj.elem)
            )
        });
    }

    appendElement() {
        this.append(this.enemys);
        this.append(this.meteorites);
        this.append(this.friends);
        this.append(this.fuels);
    }

    updateing(arr, callback) {
        const len = arr.length;
        for (let i = len - 1; i >= 0; i--) {
            const el = arr[i];
            if (el.isDeath) {
                arr.splice(i, 1);
                continue;
            }
            el.update();
            callback && callback(el);
        }
    }

    updateBullets() {
        const {
            shootEnemy,
            shootMeteorite,
            shootFriend
        } = config.scoreConfig;
        this.updateing(this.playerBullets, bullet => {
            this.bulletCollision(bullet, this.enemyBullets, (el) => {
                el.death();
            });
            this.bulletCollision(bullet, this.enemys.arr, (el) => {
                this.updateScore(
                    el instanceof Meteorite ?
                    shootMeteorite : shootEnemy
                );
                this.game.data.aliensKilled++;
                this.updateshoot();
                this.shoot();
            });
            this.bulletCollision(bullet, this.friends.arr, (el) => {
                this.updateScore(shootFriend);
                this.game.data.alliesKilled++;
                this.shoot();
            });
        });
        this.updateing(this.enemyBullets, bullet => {
            this.playerCollision(bullet, () => this.damagePlayer());
        });
    }

    updateEmenys() {
        const {
            shootEnemy,
            shootMeteorite,
        } = config.scoreConfig;
        this.updateing(this.enemys.arr, enemy => {
            this.playerCollision(enemy, () => {
                this.updateScore(
                    enemy instanceof Meteorite ?
                    shootMeteorite : shootEnemy
                );
                this.damagePlayer();
                this.updateshoot();
                this.shoot();
            })
        });
    }

    updateFriends() {
        const {
            shootFriend
        } = config.scoreConfig;
        this.updateing(this.friends.arr, friend => {
            this.playerCollision(friend, () => {
                this.updateScore(shootFriend);
                this.shoot();
            })
        });
    }

    updateFuels() {
        const {
            fuelRaiseSpeed
        } = config.fuelConfig;
        this.updateing(this.fuels.arr, fuel => {
            this.playerCollision(fuel, () => {
                this.updateFuel(fuelRaiseSpeed);
            })
        });
    }

    updateElements() {
        this.player.update();
        this.updateEmenys();
        this.updateFriends();
        this.updateFuels();
        this.updateBullets();

    }

    update(timestamp) {
        if (ResponsiveGame.isMobile() && ResponsiveGame.isPortrait()) return;

        if (this.mobileControls) this.mobileControls.update(timestamp);

        this.timeCooldown.update().active(() => {
            this.game.data.time++;
            this.updateTime();
            this.updateFuel(config.fuelConfig.fuelLoseSpeed);
        });

        this.ctx.clearRect(0, 0, config.game.w, config.game.h);

        this.appendElement();

        this.updateElements();
        this.drawDamageEffects(timestamp);
    }

    updateTime() {
        const game = this.game;
        $('#time').innerHTML = numberFormat(game.data.time);
    }

    updateFuel(num = 0) {
        const game = this.game;
        const {
            fuelMax,
            fuelLoseSpeed
        } = config.fuelConfig;
        const call = () => {
            $('#fuel').innerHTML = numberFormat(game.data.fuel);
            if (game.data.fuel <= 0) {
                this.game.over();
            }
        }
        if (num === 0) {
            return call();
        }
        if (num !== fuelLoseSpeed) {
            const start = game.data.fuel;
            const end = start + num;
            incrementAnimation(start, end, current => {
                if (current > fuelMax) {
                    current = fuelMax;
                }
                game.data.fuel = current;
                call();
            })
            return;
        }
        game.data.fuel += num;
        call();
    }

    updateScore(num = 0) {
        const game = this.game;
        const call = () => {
            $('#score').innerHTML = numberFormat(game.data.score);
        }
        if (num === 0) {
            return call();
        }
        const start = game.data.score;
        const end = start + num;
        incrementAnimation(start, end, current => {
            game.data.score = current;
            call();
        })
    }

    updateshoot() {
        const game = this.game;
        game.data.shoot++;
        $('#shoot').innerHTML = numberFormat(game.data.shoot);
    }

    updateFontSize(){
        $('.content .header .info').style.fontSize = config.game.fontSize.val + 'px';
    }

    initCanvas() {
        this.canvas = $('#canvas');
        this.canvas.width = config.game.w;
        this.canvas.height = config.game.h;

        this.ctx = this.canvas.getContext('2d');
    }

    initPlayer() {
        this.player = this.factory(Player);
    }

    initMobileControls() {
        if (typeof MobileControls !== 'undefined' && MobileControls.isTouchDevice()) {
            this.mobileControls = new MobileControls(this.player, this);
        }
    }

    draw(data) {
        this.ctx.drawImage.apply(this.ctx, data);
    }

    rotateDraw(conf) {
        this.ctx.save();
        this.ctx.translate(conf.x, conf.y);
        this.ctx.rotate(conf.deg * Math.PI / 180);
        this.draw(conf.data);
        this.ctx.restore();
    }

    setFontStyle(font = "20px Arial", yellow = "yellow") {
        this.ctx.font = font;
        this.ctx.fillStyle = yellow;
    }

    drawText(data) {
        this.ctx.fillText(data.text, data.x, data.y);
    }

    event() {
        if (this.eventsBound) return;
        this.eventsBound = true;

        const togglePause = ()=>{
            this.pauseFlag ? this.start() : this.pause();
        }
        const toggleMute = ()=>{
            this.muteFlag ? this.speak() : this.mute();
        }
        const fontSize = (status)=>{
            let {
                max,
                min,
                val
            } = config.game.fontSize;
            val += (status ? 1 : -1);
            if (val <= min || val >= max) return;
            config.game.fontSize.val = val;
            this.updateFontSize();
        }
        hotkey.reg('p', () => {
            togglePause();
        }, true);
        hotkey.reg('m', () => {
            toggleMute();
        }, true);
        on(
            $('#game-font-size-add'),
            'click',
            ()=>{
                fontSize(true);
            }
        )
        on(
            $('#game-font-size-reduce'),
            'click',
            ()=>{
                fontSize(false);
            }
        )
        on(
            $('#game-pause-btn'),
            'click',
            ()=>{
                togglePause()
            }
        )
        on(
            $('#game-mute-btn'),
            'click',
            ()=>{
                toggleMute()
            }
        )
    }

    shoot() {
        res.replay('destroyed');
    }
}