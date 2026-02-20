/**
 * Star Corsair - Game initialization
 */
(function () {
  'use strict';

  const CFG = StarCorsair.CONFIG;

  const config = {
    type: Phaser.AUTO,
    width: CFG.WIDTH,
    height: CFG.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#050520',
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
      activePointers: 2
    },
    scene: [
      StarCorsair.Scenes.BootScene,
      StarCorsair.Scenes.MenuScene,
      StarCorsair.Scenes.GameScene,
      StarCorsair.Scenes.GameOverScene
    ]
  };

  window.addEventListener('load', function () {
    new Phaser.Game(config);
  });
})();
