/**
 * BootScene - Generates all game assets and shows loading progress.
 */
(function () {
  'use strict';

  class BootScene extends Phaser.Scene {
    constructor() {
      super({ key: 'BootScene' });
    }

    preload() {
      // Nothing to preload from disk - all assets are generated
    }

    create() {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;

      // Loading text
      const loadingText = this.add.text(w / 2, h / 2 - 30, 'STAR CORSAIR', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#42A5F5',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const statusText = this.add.text(w / 2, h / 2 + 10, 'Generating assets...', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#90CAF9'
      }).setOrigin(0.5);

      // Progress bar
      const barW = 200, barH = 8;
      const barBg = this.add.rectangle(w / 2, h / 2 + 50, barW, barH, 0x1a1a4a);
      const barFill = this.add.rectangle(w / 2 - barW / 2, h / 2 + 50, 0, barH, 0x42A5F5).setOrigin(0, 0.5);

      // Generate assets with visual progress
      this.time.delayedCall(100, () => {
        StarCorsair.Utils.SpriteGenerator.generateAll(this);
        barFill.width = barW * 0.7;
        statusText.setText('Generating sounds...');

        this.time.delayedCall(50, () => {
          StarCorsair.Utils.SoundGenerator.init();
          barFill.width = barW;
          statusText.setText('Ready!');

          // Create explosion animation
          this.anims.create({
            key: 'explode',
            frames: Array.from({ length: 8 }, (_, i) => ({
              key: 'explosion_sheet',
              frame: i
            })),
            frameRate: 16,
            repeat: 0
          });

          this.time.delayedCall(300, () => {
            this.scene.start('MenuScene');
          });
        });
      });
    }
  }

  StarCorsair.Scenes.BootScene = BootScene;
})();
