/**
 * GameScene - Core gameplay: player, enemies, waves, power-ups, scoring.
 */
(function () {
  'use strict';

  var CFG = StarCorsair.CONFIG;
  var SFX = function () { return StarCorsair.Utils.SoundGenerator; };

  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameScene' });
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;

      // State
      this.score = 0;
      this.combo = 0;
      this.comboTimer = 0;
      this.wave = 0;
      this.lives = CFG.MAX_LIVES;
      this.bombs = 1;
      this.isInvincible = false;
      this.weaponLevel = 0;
      this.hasShield = false;
      this.shieldHP = 0;
      this.isPaused = false;
      this.isGameOver = false;
      this.enemiesInWave = 0;
      this.enemiesKilled = 0;
      this.waveActive = false;

      // Background
      this.bg = this.add.tileSprite(0, 0, w, h, 'background').setOrigin(0, 0);
      this.starLayers = [];
      for (var layer = 0; layer < 3; layer++) {
        var stars = [];
        for (var i = 0; i < 15 + layer * 10; i++) {
          var star = this.add.circle(
            Math.random() * w, Math.random() * h,
            0.5 + (2 - layer) * 0.5, 0xffffff, 0.2 + (2 - layer) * 0.25
          );
          star.speed = 30 + layer * 40 + Math.random() * 20;
          stars.push(star);
        }
        this.starLayers.push(stars);
      }

      // Player
      this.player = this.physics.add.image(w / 2, h - 80, 'player');
      this.player.setCollideWorldBounds(true).setDepth(10);
      this.player.body.setSize(30, 40);

      this.shieldSprite = this.add.image(0, 0, 'shield').setDepth(11).setVisible(false);
      this.tweens.add({ targets: this.shieldSprite, angle: 360, duration: 3000, repeat: -1 });

      this.engineEmitter = this.add.particles(0, 0, 'particle_fire', {
        follow: this.player, followOffset: { x: 0, y: 24 },
        speed: { min: 20, max: 60 }, angle: { min: 80, max: 100 },
        scale: { start: 0.8, end: 0 }, lifespan: 300,
        frequency: 40, quantity: 1, blendMode: 'ADD'
      }).setDepth(9);

      // Groups
      this.playerBullets = this.physics.add.group({ maxSize: 60 });
      this.enemyBullets = this.physics.add.group({ maxSize: 80 });
      this.enemies = this.physics.add.group();
      this.asteroids = this.physics.add.group();
      this.powerups = this.physics.add.group();

      // Collisions
      this.physics.add.overlap(this.playerBullets, this.enemies, this.bulletHitEnemy, null, this);
      this.physics.add.overlap(this.playerBullets, this.asteroids, this.bulletHitAsteroid, null, this);
      this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
      this.physics.add.overlap(this.player, this.asteroids, this.playerHit, null, this);
      this.physics.add.overlap(this.player, this.enemyBullets, this.playerHitBullet, null, this);
      this.physics.add.overlap(this.player, this.powerups, this.collectPowerUp, null, this);

      // Input
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
      this.shootKey = this.input.keyboard.addKey('SPACE');
      this.bombKey = this.input.keyboard.addKey('B');
      this.input.keyboard.addKey('P').on('down', this.togglePause, this);

      // Touch
      this.touchTarget = null;
      this.touchShooting = false;
      this.input.on('pointerdown', function (p) {
        SFX().resume();
        if (this.isPaused) { this.togglePause(); return; }
        this.touchTarget = { x: p.x, y: p.y };
        this.touchShooting = true;
      }, this);
      this.input.on('pointermove', function (p) {
        if (p.isDown) this.touchTarget = { x: p.x, y: p.y };
      }, this);
      this.input.on('pointerup', function () {
        this.touchTarget = null;
        this.touchShooting = false;
      }, this);

      this.fireTimer = 0;
      this.fireRate = 180;

      // UI
      this.createUI(w, h);

      // Start
      this.cameras.main.fadeIn(500);
      this.time.delayedCall(1000, this.startWave, [], this);
    }

    /* ---- UI ---- */
    createUI(w, h) {
      this.scoreText = this.add.text(10, 10, 'SCORE: 0', {
        fontFamily: 'monospace', fontSize: '14px', color: '#FFF'
      }).setDepth(100);
      this.comboText = this.add.text(10, 28, '', {
        fontFamily: 'monospace', fontSize: '12px', color: '#FFD54F'
      }).setDepth(100);
      this.waveText = this.add.text(w / 2, 10, '', {
        fontFamily: 'monospace', fontSize: '14px', color: '#90CAF9'
      }).setOrigin(0.5, 0).setDepth(100);

      this.livesIcons = [];
      for (var i = 0; i < CFG.MAX_LIVES; i++) {
        this.livesIcons.push(
          this.add.image(w - 25 - i * 24, 16, 'heart').setDepth(100)
        );
      }
      this.bombIcons = [];
      for (var i = 0; i < 3; i++) {
        var ic = this.add.image(w - 25 - i * 24, 38, 'bomb_icon').setScale(0.9).setDepth(100);
        ic.setVisible(i < this.bombs);
        this.bombIcons.push(ic);
      }
      this.weaponText = this.add.text(10, h - 24, 'WPN: I', {
        fontFamily: 'monospace', fontSize: '11px', color: '#64B5F6'
      }).setDepth(100);

      this.waveAnnounce = this.add.text(w / 2, h / 2 - 40, '', {
        fontFamily: 'monospace', fontSize: '28px', color: '#42A5F5',
        fontStyle: 'bold', stroke: '#0D47A1', strokeThickness: 4
      }).setOrigin(0.5).setAlpha(0).setDepth(100);

      this.pauseOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6)
        .setVisible(false).setDepth(200);
      this.pauseLabel = this.add.text(w / 2, h / 2, 'PAUSED', {
        fontFamily: 'monospace', fontSize: '32px', color: '#FFF', fontStyle: 'bold'
      }).setOrigin(0.5).setVisible(false).setDepth(201);
    }

    refreshUI() {
      this.scoreText.setText('SCORE: ' + this.score);
      this.comboText.setText(this.combo > 1 ? 'COMBO x' + this.combo : '');
      this.waveText.setText('WAVE ' + this.wave);
      for (var i = 0; i < this.livesIcons.length; i++)
        this.livesIcons[i].setTexture(i < this.lives ? 'heart' : 'heart_empty');
      for (var i = 0; i < this.bombIcons.length; i++)
        this.bombIcons[i].setVisible(i < this.bombs);
      var names = ['I', 'II', 'III'];
      this.weaponText.setText('WPN: ' + (names[this.weaponLevel] || 'III'));
    }

    /* ---- WAVES ---- */
    startWave() {
      if (this.isGameOver) return;
      this.wave++;
      this.waveActive = true;
      this.enemiesKilled = 0;
      var isBoss = this.wave % CFG.BOSS_EVERY === 0;

      this.waveAnnounce.setText(isBoss ? 'BOSS WAVE ' + this.wave : 'WAVE ' + this.wave);
      this.waveAnnounce.setColor(isBoss ? '#F44336' : '#42A5F5').setAlpha(1);
      this.tweens.add({ targets: this.waveAnnounce, alpha: 0, duration: 2000, delay: 1000 });

      if (isBoss) {
        SFX().play('boss_warning');
        this.enemiesInWave = 1;
        this.time.delayedCall(2000, this.spawnBoss, [], this);
      } else {
        var count = 4 + Math.floor(this.wave * 1.5);
        this.enemiesInWave = count;
        for (var i = 0; i < count; i++) {
          this.time.delayedCall(800 + i * 600, this.spawnEnemy, [], this);
        }
        var astCount = 2 + Math.floor(this.wave * 0.5);
        for (var i = 0; i < astCount; i++) {
          this.time.delayedCall(500 + i * 1200, this.spawnAsteroid, [], this);
        }
      }
      this.refreshUI();
    }

    spawnEnemy() {
      if (this.isGameOver) return;
      var w = this.cameras.main.width;
      var x = 40 + Math.random() * (w - 80);
      var roll = Math.random();
      var type, hp, speed, score, tex;

      if (roll < 0.5) { type = 1; hp = 1; speed = 60 + this.wave * 5; score = 100; tex = 'enemy1'; }
      else if (roll < 0.82) { type = 2; hp = 2; speed = 45 + this.wave * 4; score = 200; tex = 'enemy2'; }
      else { type = 3; hp = 3; speed = 55 + this.wave * 6; score = 300; tex = 'enemy3'; }

      var e = this.physics.add.image(x, -40, tex);
      e.setData('type', type).setData('hp', hp).setData('maxHp', hp)
        .setData('score', score).setData('isBoss', false);
      e.setVelocityY(speed);

      // Movement
      var tweenX = (Math.random() - 0.5) * (type === 1 ? 80 : 120);
      this.tweens.add({
        targets: e, x: e.x + tweenX,
        duration: 1200 + Math.random() * 800,
        ease: 'Sine.easeInOut', yoyo: true, repeat: -1
      });

      // Shooting
      if (type >= 2) {
        e.setData('shootTimer', this.time.addEvent({
          delay: (type === 3 ? 800 : 1200) + Math.random() * 500,
          callback: function () { this.enemyShoot(e); }, callbackScope: this, loop: true
        }));
      }
      this.enemies.add(e);
    }

    spawnBoss() {
      if (this.isGameOver) return;
      var w = this.cameras.main.width;
      var boss = this.physics.add.image(w / 2, -60, 'boss');
      var bossHP = 20 + this.wave * 5;
      boss.setData('type', 99).setData('hp', bossHP).setData('maxHp', bossHP)
        .setData('score', 2000 + this.wave * 500).setData('isBoss', true);
      boss.body.setSize(80, 60);

      var self = this;
      this.tweens.add({
        targets: boss, y: 80, duration: 2000, ease: 'Power2',
        onComplete: function () {
          self.tweens.add({
            targets: boss, x: { from: 60, to: w - 60 },
            duration: 3000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
          });
          boss.setData('shootTimer', self.time.addEvent({
            delay: 500, callback: function () { self.bossShoot(boss); }, loop: true
          }));
        }
      });
      this.enemies.add(boss);
    }

    spawnAsteroid() {
      if (this.isGameOver) return;
      var w = this.cameras.main.width;
      var x = 30 + Math.random() * (w - 60);
      var roll = Math.random();
      var tex, hp, sz;
      if (roll < 0.5) { tex = 'asteroid_small'; hp = 1; sz = 'small'; }
      else if (roll < 0.85) { tex = 'asteroid_medium'; hp = 2; sz = 'medium'; }
      else { tex = 'asteroid_large'; hp = 4; sz = 'large'; }

      var a = this.physics.add.image(x, -30, tex);
      a.setData('hp', hp).setData('size', sz);
      a.setVelocityY(40 + Math.random() * 60);
      a.setVelocityX((Math.random() - 0.5) * 40);
      a.setAngularVelocity(-30 + Math.random() * 60);
      this.asteroids.add(a);
    }

    /* ---- SHOOTING ---- */
    playerShoot() {
      if (this.isGameOver || this.isPaused) return;
      var x = this.player.x, y = this.player.y - 20;
      var sp = CFG.PLAYER_BULLET_SPEED;

      if (this.weaponLevel === 0) {
        this.fireBullet(x, y, 0, sp, 'bullet_player');
      } else if (this.weaponLevel === 1) {
        this.fireBullet(x - 8, y, 0, sp, 'bullet_player');
        this.fireBullet(x + 8, y, 0, sp, 'bullet_player');
      } else {
        this.fireBullet(x, y, 0, sp, 'bullet_player');
        this.fireBullet(x - 10, y, -60, sp, 'bullet_spread');
        this.fireBullet(x + 10, y, 60, sp, 'bullet_spread');
      }
      SFX().play(this.weaponLevel >= 2 ? 'shoot_spread' : 'shoot', 0.5);
    }

    fireBullet(x, y, vx, vy, tex) {
      var b = this.playerBullets.create(x, y, tex);
      if (b) b.setVelocity(vx, vy);
    }

    enemyShoot(enemy) {
      if (!enemy.active || this.isGameOver || this.isPaused) return;
      var b = this.enemyBullets.create(enemy.x, enemy.y + 15, 'bullet_enemy');
      if (!b) return;
      var angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      var spread = (Math.random() - 0.5) * 0.3;
      var speed = CFG.ENEMY_BULLET_SPEED + this.wave * 5;
      b.setVelocity(Math.cos(angle + spread) * speed, Math.sin(angle + spread) * speed);
      SFX().play('enemy_shoot', 0.2);
    }

    bossShoot(boss) {
      if (!boss.active || this.isGameOver || this.isPaused) return;
      var hpRatio = boss.getData('hp') / boss.getData('maxHp');
      var self = this;

      if (hpRatio > 0.6) {
        var b = this.enemyBullets.create(boss.x, boss.y + 35, 'bullet_boss');
        if (b) {
          var a = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
          b.setVelocity(Math.cos(a) * 200, Math.sin(a) * 200);
        }
      } else if (hpRatio > 0.3) {
        for (var i = -2; i <= 2; i++) {
          var b = this.enemyBullets.create(boss.x, boss.y + 35, 'bullet_boss');
          if (b) b.setVelocity(Math.cos(Math.PI / 2 + i * 0.25) * 220, Math.sin(Math.PI / 2 + i * 0.25) * 220);
        }
      } else {
        for (var i = 0; i < 8; i++) {
          var b = this.enemyBullets.create(boss.x, boss.y + 20, 'bullet_boss');
          if (b) {
            var a = (i / 8) * Math.PI * 2 + this.time.now * 0.001;
            b.setVelocity(Math.cos(a) * 180, Math.sin(a) * 180);
          }
        }
      }
      SFX().play('enemy_shoot', 0.3);
    }

    /* ---- COLLISIONS ---- */
    bulletHitEnemy(bullet, enemy) {
      bullet.destroy();
      this.spawnSparks(bullet.x, bullet.y, 3);
      var hp = enemy.getData('hp') - 1;
      enemy.setData('hp', hp);
      if (hp <= 0) { this.killEnemy(enemy); }
      else {
        enemy.setTint(0xffffff);
        this.time.delayedCall(60, function () { if (enemy.active) enemy.clearTint(); });
        SFX().play('hit', 0.4);
      }
    }

    bulletHitAsteroid(bullet, asteroid) {
      bullet.destroy();
      this.spawnSparks(bullet.x, bullet.y, 2);
      var hp = asteroid.getData('hp') - 1;
      asteroid.setData('hp', hp);
      if (hp <= 0) { this.destroyAsteroid(asteroid); }
      else {
        asteroid.setTint(0xffffff);
        this.time.delayedCall(60, function () { if (asteroid.active) asteroid.clearTint(); });
        SFX().play('hit', 0.3);
      }
    }

    playerHit(player, obj) {
      if (this.isInvincible) return;
      if (obj.getData('isBoss') !== undefined) this.killEnemy(obj);
      else this.destroyAsteroid(obj);
      this.takeDamage();
    }

    playerHitBullet(player, bullet) {
      if (this.isInvincible) return;
      bullet.destroy();
      this.takeDamage();
    }

    /* ---- DAMAGE ---- */
    takeDamage() {
      if (this.hasShield && this.shieldHP > 0) {
        this.shieldHP--;
        SFX().play('shield_hit');
        this.spawnSparks(this.player.x, this.player.y, 6);
        if (this.shieldHP <= 0) { this.hasShield = false; this.shieldSprite.setVisible(false); }
        return;
      }
      this.lives--;
      this.combo = 0;
      SFX().play('damage');
      this.cameras.main.shake(200, 0.01);
      this.isInvincible = true;
      var self = this;
      this.tweens.add({
        targets: this.player, alpha: 0.3, duration: 100, yoyo: true,
        repeat: Math.floor(CFG.INVINCIBILITY_TIME / 200),
        onComplete: function () { if (self.player.active) self.player.setAlpha(1); self.isInvincible = false; }
      });
      this.refreshUI();
      if (this.lives <= 0) this.gameOver();
    }

    killEnemy(enemy) {
      var isBoss = enemy.getData('isBoss');
      var score = enemy.getData('score');
      var t = enemy.getData('shootTimer');
      if (t) t.remove();

      this.spawnExplosion(enemy.x, enemy.y, isBoss ? 2 : 1);
      SFX().play(isBoss ? 'bomb' : 'explosion', isBoss ? 0.8 : 0.5);
      this.cameras.main.shake(isBoss ? 400 : 100, isBoss ? 0.015 : 0.005);

      this.combo++;
      this.comboTimer = CFG.COMBO_TIMEOUT;
      var mult = Math.min(this.combo, 10);
      this.score += score * mult;

      var popup = this.add.text(enemy.x, enemy.y, '+' + score * mult, {
        fontFamily: 'monospace', fontSize: '14px', color: '#FFD54F', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(50);
      this.tweens.add({ targets: popup, y: enemy.y - 40, alpha: 0, duration: 800, onComplete: function () { popup.destroy(); } });

      if (Math.random() < (isBoss ? 1.0 : 0.15)) this.spawnPowerUp(enemy.x, enemy.y);

      enemy.destroy();
      this.enemiesKilled++;
      this.refreshUI();
      if (this.enemiesKilled >= this.enemiesInWave && this.waveActive) this.waveComplete();
    }

    destroyAsteroid(asteroid) {
      var sz = asteroid.getData('size');
      this.spawnExplosion(asteroid.x, asteroid.y, sz === 'large' ? 1.2 : 0.7);
      SFX().play('hit', 0.4);
      this.score += 50;

      var childTex = sz === 'large' ? 'asteroid_medium' : (sz === 'medium' ? 'asteroid_small' : null);
      var childHP = sz === 'large' ? 2 : 1;
      var childSz = sz === 'large' ? 'medium' : 'small';
      if (childTex) {
        for (var i = 0; i < 2; i++) {
          var c = this.physics.add.image(asteroid.x + (i ? 15 : -15), asteroid.y, childTex);
          c.setData('hp', childHP).setData('size', childSz);
          c.setVelocityY(50 + Math.random() * 40);
          c.setVelocityX((i ? 1 : -1) * (30 + Math.random() * 30));
          c.setAngularVelocity(-40 + Math.random() * 80);
          this.asteroids.add(c);
        }
      }
      asteroid.destroy();
      this.refreshUI();
    }

    /* ---- POWER-UPS ---- */
    spawnPowerUp(x, y) {
      var types = ['powerup_shield', 'powerup_weapon', 'powerup_health', 'powerup_bomb'];
      var tex = types[Math.floor(Math.random() * types.length)];
      var pu = this.physics.add.image(x, y, tex);
      pu.setData('type', tex).setVelocityY(60);
      this.tweens.add({ targets: pu, scaleX: 1.2, scaleY: 1.2, duration: 500, yoyo: true, repeat: -1 });
      this.powerups.add(pu);
    }

    collectPowerUp(player, pu) {
      var type = pu.getData('type');
      SFX().play('powerup');
      switch (type) {
        case 'powerup_shield':
          this.hasShield = true; this.shieldHP = 3; this.shieldSprite.setVisible(true); break;
        case 'powerup_weapon':
          this.weaponLevel = Math.min(this.weaponLevel + 1, 2);
          var self = this;
          this.time.delayedCall(CFG.POWERUP_DURATION, function () {
            self.weaponLevel = Math.max(self.weaponLevel - 1, 0); self.refreshUI();
          });
          break;
        case 'powerup_health':
          this.lives = Math.min(this.lives + 1, CFG.MAX_LIVES); break;
        case 'powerup_bomb':
          this.bombs = Math.min(this.bombs + 1, 3); break;
      }
      var label = type.replace('powerup_', '').toUpperCase() + '!';
      var flash = this.add.text(player.x, player.y - 30, label, {
        fontFamily: 'monospace', fontSize: '13px', color: '#4FC3F7', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(50);
      this.tweens.add({ targets: flash, y: flash.y - 30, alpha: 0, duration: 600, onComplete: function () { flash.destroy(); } });
      pu.destroy();
      this.refreshUI();
    }

    /* ---- BOMB ---- */
    useBomb() {
      if (this.bombs <= 0 || this.isGameOver || this.isPaused) return;
      this.bombs--;
      SFX().play('bomb');
      this.cameras.main.shake(400, 0.02);
      this.cameras.main.flash(300, 255, 255, 255);

      var self = this;
      this.enemies.getChildren().slice().forEach(function (e) {
        if (!e.active) return;
        if (!e.getData('isBoss')) { self.killEnemy(e); }
        else {
          var hp = e.getData('hp') - 10;
          e.setData('hp', hp);
          if (hp <= 0) self.killEnemy(e);
        }
      });
      this.enemyBullets.getChildren().slice().forEach(function (b) {
        if (b.active) b.destroy();
      });
      this.asteroids.getChildren().slice().forEach(function (a) {
        if (a.active) self.destroyAsteroid(a);
      });
      this.refreshUI();
    }

    /* ---- EFFECTS ---- */
    spawnExplosion(x, y, scale) {
      var exp = this.add.sprite(x, y, 'explosion_sheet', 0).setScale(scale || 1).setDepth(20);
      exp.play('explode');
      exp.on('animationcomplete', function () { exp.destroy(); });
      this.spawnSparks(x, y, 8);
    }

    spawnSparks(x, y, count) {
      for (var i = 0; i < count; i++) {
        var p = this.add.image(x, y, 'particle_spark').setDepth(15).setBlendMode('ADD');
        var angle = Math.random() * Math.PI * 2;
        var dist = 20 + Math.random() * 40;
        this.tweens.add({
          targets: p, x: x + Math.cos(angle) * dist, y: y + Math.sin(angle) * dist,
          alpha: 0, scale: 0, duration: 200 + Math.random() * 300,
          onComplete: function () { p.destroy(); }
        });
      }
    }

    /* ---- WAVE FLOW ---- */
    waveComplete() {
      this.waveActive = false;
      SFX().play('wave_complete');
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var txt = this.add.text(w / 2, h / 2, 'WAVE COMPLETE!', {
        fontFamily: 'monospace', fontSize: '24px', color: '#4CAF50',
        fontStyle: 'bold', stroke: '#1B5E20', strokeThickness: 3
      }).setOrigin(0.5).setDepth(50);
      var self = this;
      this.tweens.add({
        targets: txt, alpha: 0, y: txt.y - 30, duration: 1500, delay: 1000,
        onComplete: function () { txt.destroy(); self.time.delayedCall(CFG.WAVE_DELAY, self.startWave, [], self); }
      });
    }

    /* ---- GAME OVER ---- */
    gameOver() {
      if (this.isGameOver) return;
      this.isGameOver = true;
      SFX().play('game_over');
      this.spawnExplosion(this.player.x, this.player.y, 1.5);
      this.player.setVisible(false);
      this.player.body.enable = false;
      this.engineEmitter.stop();

      var hs = parseInt(localStorage.getItem('starCorsairHighScore') || '0');
      if (this.score > hs) localStorage.setItem('starCorsairHighScore', this.score.toString());

      this.cameras.main.shake(500, 0.02);
      var self = this;
      this.time.delayedCall(2000, function () {
        self.cameras.main.fade(1000, 0, 0, 0);
        self.time.delayedCall(1000, function () {
          self.enemies.getChildren().forEach(function (e) {
            var t = e.getData('shootTimer'); if (t) t.remove();
          });
          self.scene.start('GameOverScene', {
            score: self.score, wave: self.wave,
            highScore: Math.max(self.score, hs)
          });
        });
      });
    }

    togglePause() {
      this.isPaused = !this.isPaused;
      this.pauseOverlay.setVisible(this.isPaused);
      this.pauseLabel.setVisible(this.isPaused);
      if (this.isPaused) this.physics.pause(); else this.physics.resume();
    }

    /* ---- UPDATE ---- */
    update(time, delta) {
      if (this.isPaused || this.isGameOver) return;
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;

      // Background
      this.bg.tilePositionY -= 0.3;
      for (var l = 0; l < this.starLayers.length; l++) {
        for (var s = 0; s < this.starLayers[l].length; s++) {
          var st = this.starLayers[l][s];
          st.y += st.speed * delta / 1000;
          if (st.y > h + 5) { st.y = -5; st.x = Math.random() * w; }
        }
      }

      // Player movement
      var vx = 0, vy = 0, speed = CFG.PLAYER_SPEED;
      if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
      if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;
      if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
      if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

      if (this.touchTarget) {
        var dx = this.touchTarget.x - this.player.x;
        var dy = this.touchTarget.y - this.player.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) { vx = dx / dist * speed; vy = dy / dist * speed; }
      }
      if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
      this.player.setVelocity(vx, vy);

      if (this.hasShield) this.shieldSprite.setPosition(this.player.x, this.player.y);

      // Shooting
      this.fireTimer += delta;
      if ((this.shootKey.isDown || this.touchShooting) && this.fireTimer >= this.fireRate) {
        this.playerShoot();
        this.fireTimer = 0;
      }
      if (Phaser.Input.Keyboard.JustDown(this.bombKey)) this.useBomb();

      // Combo decay
      if (this.combo > 0) {
        this.comboTimer -= delta;
        if (this.comboTimer <= 0) { this.combo = 0; this.refreshUI(); }
      }

      // Cleanup off-screen
      var self = this;
      this.playerBullets.getChildren().forEach(function (b) {
        if (b.active && (b.y < -20 || b.y > h + 20)) b.destroy();
      });
      this.enemyBullets.getChildren().forEach(function (b) {
        if (b.active && (b.y < -20 || b.y > h + 20 || b.x < -20 || b.x > w + 20)) b.destroy();
      });
      this.enemies.getChildren().forEach(function (e) {
        if (e.active && e.y > h + 60) {
          var t = e.getData('shootTimer'); if (t) t.remove();
          e.destroy();
          if (!e.getData('isBoss')) {
            self.enemiesKilled++;
            if (self.enemiesKilled >= self.enemiesInWave && self.waveActive) self.waveComplete();
          }
        }
      });
      this.asteroids.getChildren().forEach(function (a) {
        if (a.active && a.y > h + 60) a.destroy();
      });
      this.powerups.getChildren().forEach(function (p) {
        if (p.active && p.y > h + 30) p.destroy();
      });
    }
  }

  StarCorsair.Scenes.GameScene = GameScene;
})();
