class Meteorite extends Plane{
    
    setup() {
        const { w, h } = config.game;
        super.setup('meteorite');
        this.y = random(0, h-this.h);
        this.initBullet('enemyBullet', this.scene.enemyBullets);
        this.rotateState = true;
        this.rotateSpeed = -5;

        if (this.img && this.img.src) {
            const src = this.img.src;
            if (src.includes('meteorites_1.png')) {
                this.life = 2;
            } else if (src.includes('meteorites_2.png')) {
                this.life = 3;
            } else if (src.includes('meteorites_3.png')) {
                this.life = 4;
            } else if (src.includes('meteorites_4.png')) {
                this.life = 5;
            }
        }
    }

    update() {
        if (this.run) {
            this.move();  
            if (this.isEnter()) {
                this.fire();
            }
        }
        super.update();
    }
}