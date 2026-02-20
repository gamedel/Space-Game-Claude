/**
 * SpriteGenerator - Creates all game sprites programmatically using Canvas API.
 * Sprites are designed to match the style of the provided space atlas:
 * detailed ships, rocky asteroids, glowing effects, colorful power-ups.
 */
(function () {
  'use strict';

  const SpriteGenerator = {
    /**
     * Generate all game textures and register them with Phaser
     */
    generateAll: function (scene) {
      this.scene = scene;
      this.createPlayerShip();
      this.createEnemyShips();
      this.createBossShip();
      this.createAsteroids();
      this.createBullets();
      this.createExplosion();
      this.createPowerUps();
      this.createShieldEffect();
      this.createParticles();
      this.createUIElements();
      this.createBackground();
    },

    /* ---------- HELPER ---------- */
    _ctx: function (w, h) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return c.getContext('2d');
    },

    _addTexture: function (key, canvas) {
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }
      this.scene.textures.addCanvas(key, canvas);
    },

    /* ---------- PLAYER SHIP ---------- */
    createPlayerShip: function () {
      const w = 48, h = 56;
      const ctx = this._ctx(w, h);

      // Main body
      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.moveTo(24, 2);
      ctx.lineTo(40, 28);
      ctx.lineTo(46, 48);
      ctx.lineTo(36, 44);
      ctx.lineTo(30, 54);
      ctx.lineTo(24, 48);
      ctx.lineTo(18, 54);
      ctx.lineTo(12, 44);
      ctx.lineTo(2, 48);
      ctx.lineTo(8, 28);
      ctx.closePath();
      ctx.fill();

      // Lighter center
      ctx.fillStyle = '#64B5F6';
      ctx.beginPath();
      ctx.moveTo(24, 8);
      ctx.lineTo(32, 28);
      ctx.lineTo(30, 42);
      ctx.lineTo(24, 46);
      ctx.lineTo(18, 42);
      ctx.lineTo(16, 28);
      ctx.closePath();
      ctx.fill();

      // Cockpit glow
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.ellipse(24, 22, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Engine glow
      ctx.fillStyle = '#FF6D00';
      ctx.beginPath();
      ctx.ellipse(18, 52, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(30, 52, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing details
      ctx.strokeStyle = '#90CAF9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, 30);
      ctx.lineTo(16, 24);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(40, 30);
      ctx.lineTo(32, 24);
      ctx.stroke();

      this._addTexture('player', ctx.canvas);
    },

    /* ---------- ENEMY SHIPS ---------- */
    createEnemyShips: function () {
      // Enemy Type 1 - Small red fighter
      this._createEnemyType1();
      // Enemy Type 2 - Medium green cruiser
      this._createEnemyType2();
      // Enemy Type 3 - Purple interceptor
      this._createEnemyType3();
    },

    _createEnemyType1: function () {
      const w = 36, h = 36;
      const ctx = this._ctx(w, h);

      ctx.fillStyle = '#F44336';
      ctx.beginPath();
      ctx.moveTo(18, 34);
      ctx.lineTo(34, 8);
      ctx.lineTo(28, 2);
      ctx.lineTo(18, 6);
      ctx.lineTo(8, 2);
      ctx.lineTo(2, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#EF9A9A';
      ctx.beginPath();
      ctx.moveTo(18, 28);
      ctx.lineTo(26, 10);
      ctx.lineTo(18, 8);
      ctx.lineTo(10, 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.ellipse(18, 14, 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      this._addTexture('enemy1', ctx.canvas);
    },

    _createEnemyType2: function () {
      const w = 44, h = 44;
      const ctx = this._ctx(w, h);

      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.moveTo(22, 42);
      ctx.lineTo(42, 18);
      ctx.lineTo(38, 6);
      ctx.lineTo(28, 2);
      ctx.lineTo(22, 8);
      ctx.lineTo(16, 2);
      ctx.lineTo(6, 6);
      ctx.lineTo(2, 18);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#81C784';
      ctx.beginPath();
      ctx.moveTo(22, 36);
      ctx.lineTo(34, 16);
      ctx.lineTo(22, 10);
      ctx.lineTo(10, 16);
      ctx.closePath();
      ctx.fill();

      // Side cannons
      ctx.fillStyle = '#388E3C';
      ctx.fillRect(0, 14, 6, 12);
      ctx.fillRect(38, 14, 6, 12);

      ctx.fillStyle = '#FF5722';
      ctx.beginPath();
      ctx.ellipse(22, 18, 4, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      this._addTexture('enemy2', ctx.canvas);
    },

    _createEnemyType3: function () {
      const w = 40, h = 40;
      const ctx = this._ctx(w, h);

      ctx.fillStyle = '#9C27B0';
      ctx.beginPath();
      ctx.moveTo(20, 38);
      ctx.lineTo(38, 20);
      ctx.lineTo(34, 4);
      ctx.lineTo(20, 2);
      ctx.lineTo(6, 4);
      ctx.lineTo(2, 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#CE93D8';
      ctx.beginPath();
      ctx.moveTo(20, 32);
      ctx.lineTo(30, 18);
      ctx.lineTo(20, 8);
      ctx.lineTo(10, 18);
      ctx.closePath();
      ctx.fill();

      // Wing tips
      ctx.fillStyle = '#E040FB';
      ctx.beginPath();
      ctx.ellipse(6, 12, 4, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(34, 12, 4, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.ellipse(20, 18, 4, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      this._addTexture('enemy3', ctx.canvas);
    },

    /* ---------- BOSS SHIP ---------- */
    createBossShip: function () {
      const w = 96, h = 80;
      const ctx = this._ctx(w, h);

      // Main hull
      ctx.fillStyle = '#B71C1C';
      ctx.beginPath();
      ctx.moveTo(48, 78);
      ctx.lineTo(92, 40);
      ctx.lineTo(88, 16);
      ctx.lineTo(72, 4);
      ctx.lineTo(48, 2);
      ctx.lineTo(24, 4);
      ctx.lineTo(8, 16);
      ctx.lineTo(4, 40);
      ctx.closePath();
      ctx.fill();

      // Armor plates
      ctx.fillStyle = '#D32F2F';
      ctx.beginPath();
      ctx.moveTo(48, 68);
      ctx.lineTo(78, 36);
      ctx.lineTo(72, 12);
      ctx.lineTo(48, 8);
      ctx.lineTo(24, 12);
      ctx.lineTo(18, 36);
      ctx.closePath();
      ctx.fill();

      // Inner detail
      ctx.fillStyle = '#E57373';
      ctx.beginPath();
      ctx.moveTo(48, 54);
      ctx.lineTo(66, 30);
      ctx.lineTo(48, 16);
      ctx.lineTo(30, 30);
      ctx.closePath();
      ctx.fill();

      // Central eye
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.ellipse(48, 32, 8, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F44336';
      ctx.beginPath();
      ctx.ellipse(48, 32, 4, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Side turrets
      ctx.fillStyle = '#880E4F';
      ctx.fillRect(2, 28, 10, 20);
      ctx.fillRect(84, 28, 10, 20);

      // Turret barrels
      ctx.fillStyle = '#AD1457';
      ctx.fillRect(4, 46, 6, 10);
      ctx.fillRect(86, 46, 6, 10);

      // Top cannons
      ctx.fillStyle = '#C62828';
      ctx.fillRect(30, 2, 6, 14);
      ctx.fillRect(60, 2, 6, 14);

      this._addTexture('boss', ctx.canvas);
    },

    /* ---------- ASTEROIDS ---------- */
    createAsteroids: function () {
      this._createAsteroid('asteroid_large', 52, '#795548', '#8D6E63', '#6D4C41');
      this._createAsteroid('asteroid_medium', 34, '#607D8B', '#78909C', '#546E7A');
      this._createAsteroid('asteroid_small', 20, '#9E9E9E', '#BDBDBD', '#757575');
    },

    _createAsteroid: function (key, size, color1, color2, color3) {
      const ctx = this._ctx(size, size);
      const cx = size / 2, cy = size / 2, r = size / 2 - 2;

      // Irregular shape
      ctx.fillStyle = color1;
      ctx.beginPath();
      const points = 10;
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const variation = 0.7 + Math.sin(i * 3.7) * 0.25 + Math.cos(i * 2.3) * 0.1;
        const px = cx + Math.cos(angle) * r * variation;
        const py = cy + Math.sin(angle) * r * variation;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Craters
      ctx.fillStyle = color3;
      const craters = Math.floor(size / 12);
      for (let i = 0; i < craters; i++) {
        const a = (i / craters) * Math.PI * 2 + 0.5;
        const d = r * 0.4;
        ctx.beginPath();
        ctx.ellipse(
          cx + Math.cos(a) * d,
          cy + Math.sin(a) * d,
          size / 10, size / 10,
          0, 0, Math.PI * 2
        );
        ctx.fill();
      }

      // Highlight
      ctx.fillStyle = color2;
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.2, cy - r * 0.2, r * 0.25, r * 0.2, -0.5, 0, Math.PI * 2);
      ctx.fill();

      this._addTexture(key, ctx.canvas);
    },

    /* ---------- BULLETS ---------- */
    createBullets: function () {
      // Player bullet - blue laser
      let ctx = this._ctx(6, 18);
      let grad = ctx.createLinearGradient(0, 0, 6, 0);
      grad.addColorStop(0, '#0D47A1');
      grad.addColorStop(0.5, '#42A5F5');
      grad.addColorStop(1, '#0D47A1');
      ctx.fillStyle = grad;
      ctx.fillRect(1, 0, 4, 18);
      ctx.fillStyle = '#BBDEFB';
      ctx.fillRect(2, 0, 2, 18);
      this._addTexture('bullet_player', ctx.canvas);

      // Player spread bullet
      ctx = this._ctx(4, 14);
      grad = ctx.createLinearGradient(0, 0, 4, 0);
      grad.addColorStop(0, '#1565C0');
      grad.addColorStop(0.5, '#64B5F6');
      grad.addColorStop(1, '#1565C0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 4, 14);
      ctx.fillStyle = '#E3F2FD';
      ctx.fillRect(1, 0, 2, 14);
      this._addTexture('bullet_spread', ctx.canvas);

      // Enemy bullet - red/orange
      ctx = this._ctx(8, 8);
      grad = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
      grad.addColorStop(0, '#FFEB3B');
      grad.addColorStop(0.4, '#FF9800');
      grad.addColorStop(1, '#F44336');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(4, 4, 4, 0, Math.PI * 2);
      ctx.fill();
      this._addTexture('bullet_enemy', ctx.canvas);

      // Boss bullet - large purple
      ctx = this._ctx(12, 12);
      grad = ctx.createRadialGradient(6, 6, 0, 6, 6, 6);
      grad.addColorStop(0, '#E040FB');
      grad.addColorStop(0.5, '#9C27B0');
      grad.addColorStop(1, '#4A148C');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(6, 6, 6, 0, Math.PI * 2);
      ctx.fill();
      this._addTexture('bullet_boss', ctx.canvas);
    },

    /* ---------- EXPLOSION ---------- */
    createExplosion: function () {
      const frames = 8;
      const size = 64;
      const totalW = size * frames;
      const ctx = this._ctx(totalW, size);

      for (let f = 0; f < frames; f++) {
        const cx = f * size + size / 2;
        const cy = size / 2;
        const progress = f / (frames - 1);
        const maxR = size / 2 - 4;

        // Outer glow
        const outerR = maxR * (0.3 + progress * 0.7);
        const alpha = 1 - progress * 0.8;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
        grad.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
        grad.addColorStop(0.2, `rgba(255, 200, 50, ${alpha * 0.9})`);
        grad.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`);
        grad.addColorStop(0.8, `rgba(200, 30, 0, ${alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(100, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.fill();

        // Debris particles
        const numParticles = 6 + f * 2;
        for (let p = 0; p < numParticles; p++) {
          const angle = (p / numParticles) * Math.PI * 2 + f * 0.3;
          const dist = outerR * (0.3 + progress * 0.6) * (0.5 + Math.sin(p * 2.7) * 0.5);
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          const pr = (2 + Math.sin(p) * 1.5) * (1 - progress * 0.6);

          ctx.fillStyle = `rgba(255, ${150 + Math.floor(Math.random() * 100)}, 0, ${alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      this._addTexture('explosion_sheet', ctx.canvas);

      // Also create spritesheet frame data
      const tex = this.scene.textures.get('explosion_sheet');
      for (let f = 0; f < frames; f++) {
        tex.add(f, 0, f * size, 0, size, size);
      }
    },

    /* ---------- POWER-UPS ---------- */
    createPowerUps: function () {
      this._createPowerUp('powerup_shield', '#2196F3', '#BBDEFB', 'S');
      this._createPowerUp('powerup_weapon', '#F44336', '#FFCDD2', 'W');
      this._createPowerUp('powerup_health', '#4CAF50', '#C8E6C9', '+');
      this._createPowerUp('powerup_bomb', '#FF9800', '#FFE0B2', 'B');
    },

    _createPowerUp: function (key, color, lightColor, letter) {
      const size = 28;
      const ctx = this._ctx(size, size);
      const cx = size / 2, cy = size / 2;

      // Outer glow
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, cx);
      grad.addColorStop(0, lightColor);
      grad.addColorStop(0.5, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, cx - 1, 0, Math.PI * 2);
      ctx.fill();

      // Inner orb
      ctx.fillStyle = lightColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      // Letter
      ctx.fillStyle = color;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, cx, cy + 1);

      this._addTexture(key, ctx.canvas);
    },

    /* ---------- SHIELD EFFECT ---------- */
    createShieldEffect: function () {
      const size = 64;
      const ctx = this._ctx(size, size);
      const cx = size / 2, cy = size / 2;

      ctx.strokeStyle = 'rgba(33, 150, 243, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(100, 181, 246, 0.3)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.stroke();

      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 30);
      grad.addColorStop(0, 'rgba(33, 150, 243, 0)');
      grad.addColorStop(0.7, 'rgba(33, 150, 243, 0.1)');
      grad.addColorStop(1, 'rgba(33, 150, 243, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fill();

      this._addTexture('shield', ctx.canvas);
    },

    /* ---------- PARTICLES ---------- */
    createParticles: function () {
      // Thruster particle
      let ctx = this._ctx(8, 8);
      let grad = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
      grad.addColorStop(0, 'rgba(255, 200, 50, 1)');
      grad.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
      grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(4, 4, 4, 0, Math.PI * 2);
      ctx.fill();
      this._addTexture('particle_fire', ctx.canvas);

      // Star particle
      ctx = this._ctx(4, 4);
      grad = ctx.createRadialGradient(2, 2, 0, 2, 2, 2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(2, 2, 2, 0, Math.PI * 2);
      ctx.fill();
      this._addTexture('particle_star', ctx.canvas);

      // Hit spark
      ctx = this._ctx(6, 6);
      grad = ctx.createRadialGradient(3, 3, 0, 3, 3, 3);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 100, 0.8)');
      grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(3, 3, 3, 0, Math.PI * 2);
      ctx.fill();
      this._addTexture('particle_spark', ctx.canvas);

      // Blue particle (for shield)
      ctx = this._ctx(6, 6);
      grad = ctx.createRadialGradient(3, 3, 0, 3, 3, 3);
      grad.addColorStop(0, 'rgba(100, 181, 246, 1)');
      grad.addColorStop(1, 'rgba(33, 150, 243, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(3, 3, 3, 0, Math.PI * 2);
      ctx.fill();
      this._addTexture('particle_blue', ctx.canvas);
    },

    /* ---------- UI ELEMENTS ---------- */
    createUIElements: function () {
      // Heart icon for lives
      let ctx = this._ctx(20, 18);
      ctx.fillStyle = '#F44336';
      ctx.beginPath();
      ctx.moveTo(10, 16);
      ctx.bezierCurveTo(0, 10, 0, 2, 5, 2);
      ctx.bezierCurveTo(8, 2, 10, 5, 10, 5);
      ctx.bezierCurveTo(10, 5, 12, 2, 15, 2);
      ctx.bezierCurveTo(20, 2, 20, 10, 10, 16);
      ctx.fill();
      this._addTexture('heart', ctx.canvas);

      // Empty heart
      ctx = this._ctx(20, 18);
      ctx.strokeStyle = '#F44336';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, 16);
      ctx.bezierCurveTo(0, 10, 0, 2, 5, 2);
      ctx.bezierCurveTo(8, 2, 10, 5, 10, 5);
      ctx.bezierCurveTo(10, 5, 12, 2, 15, 2);
      ctx.bezierCurveTo(20, 2, 20, 10, 10, 16);
      ctx.stroke();
      this._addTexture('heart_empty', ctx.canvas);

      // Bomb icon
      ctx = this._ctx(20, 22);
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(10, 13, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFB74D';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, 5);
      ctx.lineTo(10, 2);
      ctx.lineTo(14, 0);
      ctx.stroke();
      ctx.fillStyle = '#FFF176';
      ctx.beginPath();
      ctx.ellipse(15, 1, 2, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();
      this._addTexture('bomb_icon', ctx.canvas);
    },

    /* ---------- BACKGROUND ---------- */
    createBackground: function () {
      const w = 480, h = 800;
      const ctx = this._ctx(w, h);

      // Deep space gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0a0a2e');
      grad.addColorStop(0.3, '#0d1137');
      grad.addColorStop(0.6, '#0a0a2e');
      grad.addColorStop(1, '#050520');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Nebula blobs
      for (let i = 0; i < 3; i++) {
        const nx = 100 + Math.sin(i * 2.5) * 150;
        const ny = 150 + i * 250;
        const nr = 80 + i * 30;
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        const colors = [
          ['rgba(30, 0, 60, 0.3)', 'rgba(60, 0, 120, 0.1)', 'rgba(0,0,0,0)'],
          ['rgba(0, 30, 60, 0.3)', 'rgba(0, 60, 120, 0.1)', 'rgba(0,0,0,0)'],
          ['rgba(60, 0, 30, 0.2)', 'rgba(120, 0, 60, 0.08)', 'rgba(0,0,0,0)']
        ][i];
        ng.addColorStop(0, colors[0]);
        ng.addColorStop(0.5, colors[1]);
        ng.addColorStop(1, colors[2]);
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stars
      for (let i = 0; i < 150; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        const sr = 0.3 + Math.random() * 1.2;
        const brightness = 0.3 + Math.random() * 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      this._addTexture('background', ctx.canvas);
    }
  };

  StarCorsair.Utils.SpriteGenerator = SpriteGenerator;
})();
