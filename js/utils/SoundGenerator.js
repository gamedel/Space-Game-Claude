/**
 * SoundGenerator - Creates all game sounds using Web Audio API.
 * No external audio files needed.
 */
(function () {
  'use strict';

  let audioCtx = null;

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function createBuffer(duration, fn) {
    const ctx = getCtx();
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = fn(i / sampleRate, duration);
    }
    return buffer;
  }

  const SoundGenerator = {
    buffers: {},
    enabled: true,

    init: function () {
      getCtx();
      this._generate();
    },

    resume: function () {
      const ctx = getCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    },

    _generate: function () {
      // Player shoot - short high pitch
      this.buffers.shoot = createBuffer(0.1, function (t, d) {
        const env = 1 - t / d;
        return Math.sin(t * 1800 * Math.PI * 2) * env * 0.3 +
               Math.sin(t * 2400 * Math.PI * 2) * env * env * 0.15;
      });

      // Spread shot
      this.buffers.shoot_spread = createBuffer(0.12, function (t, d) {
        const env = 1 - t / d;
        return Math.sin(t * 1600 * Math.PI * 2) * env * 0.2 +
               Math.sin(t * 2200 * Math.PI * 2) * env * env * 0.1 +
               Math.sin(t * 800 * Math.PI * 2) * env * 0.1;
      });

      // Enemy shoot - lower pitch
      this.buffers.enemy_shoot = createBuffer(0.08, function (t, d) {
        const env = 1 - t / d;
        return Math.sin(t * 600 * Math.PI * 2) * env * 0.2;
      });

      // Explosion - noise burst
      this.buffers.explosion = createBuffer(0.4, function (t, d) {
        const env = Math.pow(1 - t / d, 2);
        const noise = Math.random() * 2 - 1;
        const tone = Math.sin(t * 200 * Math.PI * 2 * (1 - t / d));
        return (noise * 0.4 + tone * 0.3) * env;
      });

      // Small explosion
      this.buffers.hit = createBuffer(0.15, function (t, d) {
        const env = Math.pow(1 - t / d, 3);
        const noise = Math.random() * 2 - 1;
        return noise * 0.25 * env + Math.sin(t * 400 * Math.PI * 2) * env * 0.15;
      });

      // Power-up pickup
      this.buffers.powerup = createBuffer(0.3, function (t, d) {
        const env = t < d * 0.1 ? t / (d * 0.1) : 1 - (t - d * 0.1) / (d * 0.9);
        const freq = 600 + t / d * 800;
        return Math.sin(t * freq * Math.PI * 2) * env * 0.25;
      });

      // Shield hit
      this.buffers.shield_hit = createBuffer(0.2, function (t, d) {
        const env = 1 - t / d;
        return Math.sin(t * 1200 * Math.PI * 2) * env * 0.2 +
               Math.sin(t * 1800 * Math.PI * 2) * env * env * 0.1;
      });

      // Player damage
      this.buffers.damage = createBuffer(0.3, function (t, d) {
        const env = Math.pow(1 - t / d, 1.5);
        return Math.sin(t * 300 * Math.PI * 2 * (1 + Math.sin(t * 30))) * env * 0.3;
      });

      // Bomb
      this.buffers.bomb = createBuffer(0.8, function (t, d) {
        const env = t < 0.05 ? t / 0.05 : Math.pow(1 - (t - 0.05) / (d - 0.05), 1.5);
        const noise = Math.random() * 2 - 1;
        const freq = 150 * (1 - t / d * 0.5);
        return (noise * 0.3 + Math.sin(t * freq * Math.PI * 2) * 0.4) * env;
      });

      // Boss warning
      this.buffers.boss_warning = createBuffer(0.6, function (t, d) {
        const env = Math.sin(t / d * Math.PI);
        const freq = 200 + Math.sin(t * 8) * 100;
        return Math.sin(t * freq * Math.PI * 2) * env * 0.25;
      });

      // Menu select
      this.buffers.select = createBuffer(0.1, function (t, d) {
        const env = 1 - t / d;
        return Math.sin(t * 1000 * Math.PI * 2) * env * 0.2;
      });

      // Wave complete
      this.buffers.wave_complete = createBuffer(0.5, function (t, d) {
        const env = 1 - t / d;
        const freq = 400 + (t / d) * 400;
        return Math.sin(t * freq * Math.PI * 2) * env * 0.2 +
               Math.sin(t * freq * 1.5 * Math.PI * 2) * env * 0.1;
      });

      // Game over
      this.buffers.game_over = createBuffer(1.0, function (t, d) {
        const env = 1 - t / d;
        const freq = 400 * (1 - t / d * 0.5);
        return Math.sin(t * freq * Math.PI * 2) * env * 0.2 +
               Math.sin(t * freq * 0.5 * Math.PI * 2) * env * 0.15;
      });
    },

    play: function (name, volume) {
      if (!this.enabled || !this.buffers[name]) return;
      try {
        const ctx = getCtx();
        if (ctx.state === 'suspended') return;
        const source = ctx.createBufferSource();
        source.buffer = this.buffers[name];
        const gain = ctx.createGain();
        gain.gain.value = volume !== undefined ? volume : 1.0;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
      } catch (e) {
        // Silently ignore audio errors on restricted platforms
      }
    }
  };

  StarCorsair.Utils.SoundGenerator = SoundGenerator;
})();
