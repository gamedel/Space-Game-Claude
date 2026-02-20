/**
 * GameOverScene - Score display, high score, restart.
 */
(function () {
  'use strict';

  class GameOverScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameOverScene' });
    }

    create(data) {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      const score = data.score || 0;
      const wave = data.wave || 1;
      const highScore = data.highScore || 0;
      const isNew = score >= highScore && score > 0;

      this.add.rectangle(w / 2, h / 2, w, h, 0x050520);

      // Stars
      for (let i = 0; i < 80; i++) {
        this.add.circle(
          Math.random() * w, Math.random() * h,
          0.5 + Math.random(), 0xffffff, 0.2 + Math.random() * 0.5
        );
      }

      this.add.text(w / 2, 140, 'GAME OVER', {
        fontFamily: 'monospace', fontSize: '36px', color: '#F44336',
        fontStyle: 'bold', stroke: '#B71C1C', strokeThickness: 4
      }).setOrigin(0.5);

      this.add.text(w / 2, 220, `SCORE`, {
        fontFamily: 'monospace', fontSize: '14px', color: '#78909C'
      }).setOrigin(0.5);

      this.add.text(w / 2, 250, `${score}`, {
        fontFamily: 'monospace', fontSize: '32px', color: '#FFFFFF', fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(w / 2, 300, `Wave reached: ${wave}`, {
        fontFamily: 'monospace', fontSize: '14px', color: '#90CAF9'
      }).setOrigin(0.5);

      if (isNew) {
        const newRec = this.add.text(w / 2, 340, 'NEW HIGH SCORE!', {
          fontFamily: 'monospace', fontSize: '18px', color: '#FFD54F', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({
          targets: newRec, alpha: 0.3, duration: 500,
          yoyo: true, repeat: -1
        });
      } else {
        this.add.text(w / 2, 340, `Best: ${highScore}`, {
          fontFamily: 'monospace', fontSize: '14px', color: '#FFD54F'
        }).setOrigin(0.5);
      }

      // Retry button
      const btnY = 440;
      const btn = this.add.rectangle(w / 2, btnY, 180, 50, 0x1565C0, 0.9)
        .setStrokeStyle(2, 0x42A5F5).setInteractive({ useHandCursor: true });
      const btnText = this.add.text(w / 2, btnY, 'PLAY AGAIN', {
        fontFamily: 'monospace', fontSize: '20px', color: '#FFFFFF', fontStyle: 'bold'
      }).setOrigin(0.5);

      btn.on('pointerover', () => { btn.setFillStyle(0x1976D2); });
      btn.on('pointerout', () => { btn.setFillStyle(0x1565C0); });
      btn.on('pointerdown', () => this.restart());

      // Menu button
      const menuY = 510;
      const menuBtn = this.add.rectangle(w / 2, menuY, 180, 40, 0x37474F, 0.8)
        .setStrokeStyle(1, 0x546E7A).setInteractive({ useHandCursor: true });
      this.add.text(w / 2, menuY, 'MENU', {
        fontFamily: 'monospace', fontSize: '16px', color: '#B0BEC5'
      }).setOrigin(0.5);

      menuBtn.on('pointerdown', () => {
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => this.scene.start('MenuScene'));
      });

      // Keyboard
      this.input.keyboard.on('keydown-SPACE', () => this.restart());
      this.input.keyboard.on('keydown-ENTER', () => this.restart());

      this.cameras.main.fadeIn(800);
    }

    restart() {
      StarCorsair.Utils.SoundGenerator.play('select');
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => this.scene.start('GameScene'));
    }
  }

  StarCorsair.Scenes.GameOverScene = GameOverScene;
})();
