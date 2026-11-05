/* FORMA — sahadaki hareketler ve çalışkanlık
   - Maçta yaptığın her hareket o hareketin yeteneğine XP verir (başarılı olursa daha çok). Maç sonunda gösterilir.
   - Hocayla aran iyiyse ve çalışkansan (antrenman etkinlikleri, disiplin, sağlıklı rutin) ilk 11 şansın artar. */
(function (root) {
  const F = root.F, D = F.DATA;

  /* ---------- Maç hareketlerinden XP ---------- */
  const addMx = (m, attr, xp) => {
    if (!attr || !D.attrs[attr] || F.S.P.attrs[attr] == null) return;
    m.actXp = m.actXp || {};
    m.actXp[attr] = (m.actXp[attr] || 0) + xp;
  };
  const origChoose = F.matchChoose;
  F.matchChoose = function (i) {
    const S = F.S;
    const m = S.queue && S.queue[0] && S.queue[0].m;
    let opt = null;
    try { const mo = m.moments[m.i]; opt = F.momentDef(mo.ref).o[i]; } catch (e) { opt = null; }
    const res = origChoose.apply(this, arguments);
    try {
      if (m && opt && res) {
        const d = opt.d || 30;
        const big = ['goal', 'assist', 'save', 'block'].includes(res.kind) ? 1.5 : 1;
        const xp = res.ok ? (6 + d / 6) * big : 2;
        addMx(m, opt.a, xp);
        addMx(m, opt.a2, xp * 0.4);
      }
    } catch (e) { /* yoksay */ }
    return res;
  };
  // beceri modunda seçenek yok: sonucun türüne göre ilgili yetenekler
  const KIND_ATTR = { goal: ['bitiricilik', 'sut'], assist: ['pas', 'vizyon'], save: ['refleks', 'kalecilik'], block: ['savunma', 'pozisyon'], chance: ['hucumPoz'], keep: ['topKontrol'], pass: ['pas'], miss: ['bitiricilik'], lost: ['topKontrol'], shotsaved: ['sut'] };
  const origResult = F.matchResult;
  if (origResult) F.matchResult = function (kind, ok) {
    const S = F.S;
    const m = S.queue && S.queue[0] && S.queue[0].m;
    const res = origResult.apply(this, arguments);
    try { if (m && res) (KIND_ATTR[kind] || []).forEach((a, j) => addMx(m, a, (ok ? 14 : 2) * (j ? 0.4 : 1))); } catch (e) { /* yoksay */ }
    return res;
  };
  const origFinish = F.matchFinish;
  F.matchFinish = function () {
    const S = F.S;
    const m = S.queue && S.queue[0] && S.queue[0].m;
    const was = m && m.done;
    const r = origFinish.apply(this, arguments);
    try {
      if (m && !was && m.done && m.actXp && m.played !== false) {
        const mul = F.ageXp();
        const list = Object.keys(m.actXp).map((a) => [a, Math.round(m.actXp[a] * mul)]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]);
        const shown = [];
        list.forEach(([a, xp]) => {
          const ups = F.addXp(a, xp);
          shown.push({ k: 'a.' + a, label: D.attrs[a] + (ups ? '' : ' XP'), v: ups || xp, actXp: true });
        });
        m.actXpShown = shown;
        m.deltas = (m.deltas || []).concat(shown.slice(0, 4));
      }
    } catch (e) { /* yoksay */ }
    return r;
  };

  /* ---------- Hoca güveni ve çalışkanlık ---------- */
  const trainIds = () => (D.activities || []).filter((a) => a.train || ['analiz', 'rakip_izle'].includes(a.id) || (a.fx && Object.keys(a.fx).some((k) => k.startsWith('a.')))).map((a) => a.id);
  F.workEthic = function () {
    const S = F.S, P = S.P;
    const R = Object.assign({}, D.routineDefault, P.routine);
    let w = (P.life.disiplin - 50) / 250;
    if (R.kosu === 'evet') w += 0.04;
    if (R.uyku === 'erken') w += 0.03;
    if (R.uyku === 'gec') w -= 0.04;
    if (R.sosyal === 'gece') w -= 0.06;
    if (R.beslenme === 'siki') w += 0.02;
    const h = S.actHist || {};
    const tr = trainIds().reduce((s, id) => s + (h[id] || 0), 0);
    w += Math.min(0.12, tr * 0.04);
    w += Math.min(0.08, (P.traits.calis || 0) * 0.02); // çalışkan kişiliği
    return F.clamp(w, -0.15, 0.25);
  };
  const origStart = F.startChance;
  F.startChance = function (m) {
    const out = origStart.apply(this, arguments);
    if (m && m.nat) return out;
    const S = F.S;
    const h = F.npc('hoca');
    let add = 0;
    if (h && h.rel > 0) { const v = h.rel / 300; out.parts.push(['Hocanın sana güveni', v]); add += v; }
    const we = F.workEthic();
    if (Math.abs(we) >= 0.005) { out.parts.push([we >= 0 ? 'Çalışkanlığın' : 'Çalışma düzenin', we]); add += we; }
    const before = out.p;
    const lo = S.P.contract.guarantee ? Math.min(before, 0.85) : 0.04;
    out.p = F.clamp(out.p + add, lo, 0.97);
    return out;
  };
})(typeof window !== 'undefined' ? window : globalThis);
