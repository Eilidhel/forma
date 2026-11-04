/* FORMA — tarayıcıda otomatik oynatıcı (test aracı). Konsolda: autoplay(200) */
(function () {
  const q = (s) => document.querySelector(s);
  const qa = (s) => [...document.querySelectorAll(s)];
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  window.__errs = [];
  window.addEventListener('error', (e) => window.__errs.push(e.message));
  window.stepOnce = function () {
    const t = q('.toast');
    if (t && /hata/i.test(t.textContent)) window.__errs.push(t.textContent);
    if (q('[data-a="continue"]')) { q('[data-a="continue"]').click(); return 'continue'; }
    if (q('[data-a="goals-ok"]')) {
      for (let n = 0; n < 3 && q('[data-a="goals-ok"]').disabled; n++) qa('[data-a="goal-toggle"]:not([disabled])').filter((b) => !b.querySelector('.chip.on'))[0].click();
      q('[data-a="goals-ok"]').click();
      return 'goals';
    }
    if (q('[data-a="post-tone"]')) { const ph = qa('[data-a="post-photo"]'); if (ph.length) rnd(ph).click(); rnd(qa('[data-a="post-tone"]')).click(); q('[data-a="post-send"]').click(); return 'post'; }
    const pri = ['[data-a="call"][data-v="1"]', '[data-a="ev-opt"]:not([disabled])', '[data-a="m-speech"]', '[data-a="m-opt"]', '[data-a="m-skip"]', '[data-a="m-finish"]', '[data-a="press-opt"]', '[data-a="ev-next"]', '[data-a="off-stay"]', '[data-a="off-accept"]', '[data-a="off-free"]', '[data-a="retire"][data-v="0"]', '[data-a="week-start"]', '[data-a="open"][data-v="plan"]'];
    for (const s of pri) { const els = qa(s); if (els.length) { rnd(els).click(); return s; } }
    return 'none';
  };
  window.autoplay = function (n, untilHome) {
    for (let i = 0; i < n; i++) {
      if (untilHome && window.F.S && !window.F.S.queue.length && !q('[data-a="week-start"]')) return 'home';
      if (window.stepOnce() === 'none') return 'stuck';
    }
    return 'done';
  };
})();
