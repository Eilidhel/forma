/* FORMA — maç sesleri (dosya yok, Web Audio ile üretilir)
   Gol: vuruş + tribün coşkusu. Gol yemek: tribün iç çekişi. Kurtarış ve müdahale: tok bir vuruş + "ooo".
   Kaçan pozisyon: hayal kırıklığı. Pas: hafif vuruş. Düdük: başlama, devre, maç sonu, faul, kart.
   Ayarlar'dan kapatılabilir ve ses seviyesi değiştirilebilir (bu cihazda saklanır). */
(function (root) {
  const F = root.F;
  const KEY = 'forma.sound';
  let ctx = null, noiseBuf = null;
  const load = () => { try { return Object.assign({ on: true, vol: 70 }, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return { on: true, vol: 70 }; } };
  let cfg = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* depolama kapalı */ } };
  const ac = () => {
    if (!ctx) { const C = root.AudioContext || root.webkitAudioContext; if (!C) return null; try { ctx = new C(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };
  const noise = (c) => {
    if (noiseBuf) return noiseBuf;
    noiseBuf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  };
  const out = (c) => { const g = c.createGain(); g.gain.value = (cfg.vol / 100) * 0.9; g.connect(c.destination); return g; };
  // tribün: filtrelenmiş gürültü, zarf ile
  function crowd(c, dst, t0, dur, peak, f0, f1) {
    const src = c.createBufferSource(); src.buffer = noise(c); src.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.7;
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.linearRampToValueAtTime(f1, t0 + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.35, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp); bp.connect(g); g.connect(dst);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }
  function whistle(c, dst, t0, len) {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 2900;
    const lfo = c.createOscillator(); lfo.frequency.value = 38; const lg = c.createGain(); lg.gain.value = 90;
    lfo.connect(lg); lg.connect(o.frequency);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
    g.gain.setValueAtTime(0.22, t0 + len - 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    o.connect(g); g.connect(dst); o.start(t0); lfo.start(t0); o.stop(t0 + len + 0.02); lfo.stop(t0 + len + 0.02);
  }
  function kick(c, dst, t0, vol) {
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(170, t0); o.frequency.exponentialRampToValueAtTime(45, t0 + 0.14);
    const g = c.createGain(); g.gain.setValueAtTime(vol || 0.7, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
    o.connect(g); g.connect(dst); o.start(t0); o.stop(t0 + 0.2);
  }
  function thud(c, dst, t0) {
    const src = c.createBufferSource(); src.buffer = noise(c);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
    const g = c.createGain(); g.gain.setValueAtTime(0.9, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    src.connect(lp); lp.connect(g); g.connect(dst); src.start(t0); src.stop(t0 + 0.2);
  }
  const SOUNDS = {
    goal: (c, d, t) => { kick(c, d, t, 0.8); crowd(c, d, t + 0.08, 3.2, 0.75, 700, 1300); crowd(c, d, t + 0.3, 2.6, 0.35, 300, 500); },
    assist: (c, d, t) => SOUNDS.goal(c, d, t),
    oppgoal: (c, d, t) => { crowd(c, d, t, 1.6, 0.22, 500, 700); },
    concede: (c, d, t) => { crowd(c, d, t, 1.8, 0.4, 900, 250); },
    save: (c, d, t) => { thud(c, d, t); crowd(c, d, t + 0.05, 1.3, 0.35, 450, 700); },
    block: (c, d, t) => { thud(c, d, t); kick(c, d, t + 0.02, 0.4); },
    miss: (c, d, t) => { kick(c, d, t, 0.6); crowd(c, d, t + 0.25, 1.4, 0.4, 900, 300); },
    chance: (c, d, t) => { kick(c, d, t, 0.6); crowd(c, d, t + 0.1, 1.2, 0.3, 500, 800); },
    pass: (c, d, t) => { kick(c, d, t, 0.35); },
    lost: (c, d, t) => { crowd(c, d, t, 0.8, 0.15, 600, 400); },
    whistle: (c, d, t) => whistle(c, d, t, 0.45),
    half: (c, d, t) => { whistle(c, d, t, 0.35); whistle(c, d, t + 0.45, 0.6); },
    end: (c, d, t) => { whistle(c, d, t, 0.3); whistle(c, d, t + 0.4, 0.3); whistle(c, d, t + 0.8, 0.8); crowd(c, d, t + 0.8, 2, 0.3, 500, 700); },
    foul: (c, d, t) => whistle(c, d, t, 0.3),
    card: (c, d, t) => { whistle(c, d, t, 0.25); whistle(c, d, t + 0.3, 0.25); },
    setpiece: (c, d, t) => { whistle(c, d, t, 0.35); crowd(c, d, t + 0.3, 1.5, 0.2, 400, 600); }
  };
  F.SND = {
    get: () => Object.assign({}, cfg),
    set: (o) => { cfg = Object.assign(cfg, o || {}); cfg.vol = Math.max(0, Math.min(100, +cfg.vol || 0)); save(); },
    play: function (kind) {
      if (!cfg.on || !cfg.vol || !SOUNDS[kind]) return;
      try { const c = ac(); if (!c) return; SOUNDS[kind](c, out(c), c.currentTime + 0.02); } catch (e) { /* ses hatası oyunu durdurmasın */ }
    },
    unlock: () => { if (cfg.on) ac(); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
