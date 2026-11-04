/* FORMA — kadro ve ilk 11 (FC tarzı)
   Takımının dizilişindeki her mevkide isimli bir oyuncu, kulübede yedekler ve senin mevkinde bir forma rakibin var.
   İlk 11 şansın, mevcut kadro kararına rakibinle aranızdaki farkın eklenmesiyle hesaplanır ve nedenleriyle gösterilir. */
(function (root) {
  const F = root.F;
  const D = F.DATA;

  // takımın kadrosu: diziliş değişince ya da transferde yeniden kurulur
  F.squad = function () {
    const S = F.S, P = S.P;
    const team = F.myTeam();
    const fm = F.teamFormation();
    const cr = F.curRole();
    if (S.squad && S.squad.team === team.id && S.squad.fm === fm.id && S.squad.role === cr) return S.squad;
    const used = new Set([P.name + ' ' + P.surname]);
    const pool = (S.mates || []).filter((n) => !used.has(n));
    const nextName = () => { let n = pool.shift(); while (!n || used.has(n)) n = F.isAbroad() ? F.foreignName() : F.fullName(); used.add(n); return n; };
    const rk = F.npc('rakip');
    const base = team.str;
    const mySpot = fm.spots.findIndex((sp) => sp[2] === cr);
    const xi = fm.spots.map((sp, i) => ({ i, role: sp[2], x: sp[0], y: sp[1], n: i === mySpot ? null : nextName(), ovr: F.clamp(base + F.ri(-5, 5), 30, 95), form: F.ri(-2, 2) }));
    // senin mevkindeki rakip (varsa hikâyedeki forma rakibin)
    const rivalName = rk && !used.has(rk.name) ? rk.name : nextName();
    used.add(rivalName);
    const rival = { n: rivalName, role: cr, ovr: F.clamp(base + F.ri(-3, 4), 30, 95), form: F.ri(-2, 2) };
    const bench = Array.from({ length: 7 }, () => { const sp = F.pick(fm.spots); return { n: nextName(), role: sp[2], ovr: F.clamp(base - 4 + F.ri(-4, 3), 25, 92), form: F.ri(-2, 2) }; });
    S.squad = { team: team.id, fm: fm.id, role: cr, mySpot, xi, rival, bench };
    return S.squad;
  };

  // İlk 11 şansı: orijinal kadro kararı + forma rakibiyle fark. parts: ekranda gösterilen nedenler
  F.startChance = function (m) {
    const S = F.S, P = S.P;
    const parts = [];
    const add = (label, v) => { if (Math.abs(v) >= 0.005) parts.push([label, v]); return v; };
    const h = F.npc('hoca');
    const cr = F.curRole();
    const ovr = F.ovrAs(cr);
    let p = m.nat ? 0.7 : 0.5;
    if (!m.nat) {
      p += add('Takım gücüne göre gücün', (ovr - m.myStr) / 10);
      p += add('Mevki uyumu', -(1 - F.roleFit(cr)) * 0.35);
      if (!F.inSystem(cr)) p += add('Sistemde yerin yok', -0.3);
    }
    p += add('Hocayla ilişkin', (h ? h.rel : 0) / 220);
    p += add('Form', P.life.form / 35);
    if (!m.nat) {
      p += add('Sözleşmedeki rolün', { as: 0.22, rotasyon: 0, yedek: -0.18 }[P.contract.role] || 0);
      if (h && h.type === 'genc' && P.age <= 22) p += add('Hoca gençlere şans veriyor', 0.12);
      if (h && h.type === 'yildiz') p += add('Hoca yıldızları seviyor', (P.life.sohret - 40) / 200);
      if (h && h.type === 'diktator') p += add('Hoca disipline bakıyor', (P.life.disiplin - 55) / 200);
      const rk = F.npc('rakip');
      if (rk && rk.rel < -40) p += add('Rakiple gerginlik', -0.04);
      // forma rakibi
      const sq = F.squad();
      const r = sq.rival;
      const mine = ovr * (0.85 + 0.15 * F.roleFit(cr)) + P.life.form * 1.2;
      const theirs = r.ovr + r.form * 1.2;
      p += add('Forma rakibin ' + r.n.split(' ')[0] + ' ile fark', F.clamp((mine - theirs) / 20, -0.2, 0.2));
    }
    if (P.life.enerji < 35) p += add('Yorgunluk', -0.2);
    return { p: F.clamp(p, 0.04, 0.97), parts };
  };
  F.rollStatus = function (m) {
    const P = F.S.P;
    if (P.injury) return 'sakat';
    if (P.suspended > 0 && !m.nat) return 'ceza';
    const p = F.startChance(m).p;
    const r = F.rand();
    return r < p ? 'ilk11' : r < p + (1 - p) * 0.6 ? 'yedek' : 'kadrodisi';
  };

  // her hafta rakibin formu değişir, gençse biraz gelişir
  const origBegin = F.beginWeek;
  F.beginWeek = function () {
    try {
      const sq = F.squad();
      sq.rival.form = F.clamp(sq.rival.form + F.ri(-1, 1), -5, 5);
      if (F.chance(0.06)) sq.rival.ovr = Math.min(95, sq.rival.ovr + 1);
      sq.xi.forEach((x) => { if (x.n) x.form = F.clamp(x.form + F.ri(-1, 1), -4, 4); });
    } catch (e) { /* kadro hatası oyunu durdurmasın */ }
    return origBegin.apply(this, arguments);
  };
})(typeof window !== 'undefined' ? window : globalThis);
