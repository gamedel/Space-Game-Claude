/**
 * MenuScene - Title screen with animated background and start button.
 */
(function () {
  'use strict';

  class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: 'MenuScene' });
    }

    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;

      // Background
      this.add.image(w / 2, h / 2, 'background');

      // Scrolling stars
      this.stars = [];
      for (let i = 0; i < 50; i++) {
        const star = this.add.circle(
          Math.random() * w,
          Math.random() * h,
          0.5 + Math.random() * 1.5,
          0xffffff,
          0.3 + Math.random() * 0.7
        );
        star.speed = 20 + Math.random() * 60;
        this.stars.push(star);
      }

      // Title
      this.add.text(w / 2, 140, 'STAR', {
        fontFamily: 'monospace',
        fontSize: '52px',
        color: '#42A5F5',
        fontStyle: 'bold',
        stroke: '#0D47A1',
        strokeThickness: 4
      }).setOrigin(0.5);

      this.add.text(w / 2, 195, 'CORSAIR', {
        fontFamily: 'monospace',
        fontSize: '44px',
        color: '#BBDEFB',
        fontStyle: 'bold',
        stroke: '#1565C0',
        strokeThickness: 3
      }).setOrigin(0.5);

      // Floating player ship preview
      this.playerPreview = this.add.image(w / 2, 300, 'player').setScale(2);
      this.tweens.add({
        targets: this.playerPreview,
        y: 310,
        duration: 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });

      // High score
      const highScore = localStorage.getItem('starCorsairHighScore') || 0;
      if (highScore > 0) {
        this.add.text(w / 2, 370, `BEST: ${highScore}`, {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#FFD54F'
        }).setOrigin(0.5);
      }

      // Start button
      const btnY = 450;
      const btn = this.add.rectangle(w / 2, btnY, 180, 50, 0x1565C0, 0.9)
        .setStrokeStyle(2, 0x42A5F5)
        .setInteractive({ useHandCursor: true });

      const btnText = this.add.text(w / 2, btnY, 'START', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      btn.on('pointerover', () => {
        btn.setFillStyle(0x1976D2);
        btnText.setColor('#BBDEFB');
      });
      btn.on('pointerout', () => {
        btn.setFillStyle(0x1565C0);
        btnText.setColor('#FFFFFF');
      });
      btn.on('pointerdown', () => {
        StarCorsair.Utils.SoundGenerator.resume();
        StarCorsair.Utils.SoundGenerator.play('select');
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('GameScene');
        });
      });

      // Also start with Enter / Space
      this.input.keyboard.on('keydown-SPACE', () => {
        StarCorsair.Utils.SoundGenerator.resume();
        StarCorsair.Utils.SoundGenerator.play('select');
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('GameScene');
        });
      });
      this.input.keyboard.on('keydown-ENTER', () => {
        StarCorsair.Utils.SoundGenerator.resume();
        StarCorsair.Utils.SoundGenerator.play('select');
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('GameScene');
        });
      });

      // Controls info
      this.add.text(w / 2, 540, 'WASD / Arrows - Move', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#78909C'
      }).setOrigin(0.5);
      this.add.text(w / 2, 558, 'SPACE - Shoot  |  B - Bomb', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#78909C'
      }).setOrigin(0.5);
      this.add.text(w / 2, 580, 'Touch: Drag to move, Tap right to shoot', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#546E7A'
      }).setOrigin(0.5);

      // Version
      this.add.text(w / 2, h - 20, 'v1.0.0', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#37474F'
      }).setOrigin(0.5);

      this.cameras.main.fadeIn(500);
    }

    update(time, delta) {
      const h = this.cameras.main.height;
      const w = this.cameras.main.width;
      for (const star of this.stars) {
        star.y += star.speed * delta / 1000;
        if (star.y > h + 5) {
          star.y = -5;
          star.x = Math.random() * w;
        }
      }
    }
  }

  StarCorsair.Scenes.MenuScene = MenuScene;
})();
