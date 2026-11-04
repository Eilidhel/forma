/* FORMA — lig istatistikleri: gol krallığı, asist krallığı, kartlar
   Mevcut maç kaydına (F.addResult) eklenir; yapıyı değiştirmez. Her takımın birkaç golcü ve oyuncusu
   isimleriyle oluşturulur; goller ağırlıklı olarak bu oyunculara yazılır. Senin gollerin, asistlerin ve
   kartların maçtaki gerçek sonuçlarından gelir. Sezon başında sıfırlanır. */
(function (root) {
  const F = root.F;
  const D = F.DATA;

  // takımın isimli oyuncuları (golcüler daha ağırlıklı)
  F.teamStars = function (teamId) {
    const S = F.S;
    const t = S.world.teams[teamId];
    if (!t) return [];
    const mine = teamId === S.P.contract.team;
    if (mine) {
      const names = (S.mates || []).filter((n) => n && n !== S.P.name + ' ' + S.P.surname);
      return names.slice(0, 7).map((n, i) => ({ n, w: [5, 4, 3, 2, 2, 1, 1][i] || 1 }));
    }
    if (!t.stars) {
      const abroad = F.tierOf(teamId).c !== 'TR';
      t.stars = Array.from({ length: 7 }, (_, i) => ({ n: abroad ? F.foreignName() : F.fullName(), w: [6, 4, 3, 2, 2, 1, 1][i] }));
    }
    return t.stars;
  };
  const book = () => { const L = F.S.league; L.ps = L.ps || {}; return L.ps; };
  const rec = (teamId, name, k, v, me) => {
    const ps = book();
    const key = teamId + ':' + name;
    const r = (ps[key] = ps[key] || { n: name, t: teamId, g: 0, a: 0, y: 0, r: 0, me: !!me });
    r[k] += v;
  };
  // bir takımın gollerini ve kartlarını oyunculara dağıt
  function credit(teamId, goals, myMatch) {
    const S = F.S, P = S.P;
    const stars = F.teamStars(teamId);
    if (!stars.length) return;
    const meName = P.name + ' ' + P.surname;
    const mine = teamId === P.contract.team;
    let myG = mine && myMatch ? myMatch.goals : 0, myA = mine && myMatch ? myMatch.assists : 0;
    for (let i = 0; i < goals; i++) {
      let scorer;
      if (myG > 0) { scorer = meName; myG--; rec(teamId, meName, 'g', 1, true); }
      else { scorer = F.wpick(stars, (x) => x.w).n; rec(teamId, scorer, 'g', 1); }
      if (myA > 0 && scorer !== meName) { myA--; rec(teamId, meName, 'a', 1, true); }
      else if (F.chance(0.7)) { const as = F.wpick(stars.filter((x) => x.n !== scorer), (x) => x.w); if (as) rec(teamId, as.n, 'a', 1); }
    }
    // kartlar: takım başına ortalama 1,6 sarı, ara sıra kırmızı
    const yellows = F.poisson(1.6);
    for (let i = 0; i < yellows; i++) rec(teamId, F.pick(stars).n, 'y', 1);
    if (F.chance(0.06)) rec(teamId, F.pick(stars).n, 'r', 1);
    if (mine && myMatch && myMatch.played) {
      if (myMatch.yellow) rec(teamId, meName, 'y', Math.min(2, myMatch.yellow), true);
      if (myMatch.red) rec(teamId, meName, 'r', 1, true);
    }
  }
  const origAdd = F.addResult;
  F.addResult = function (table, h, a, gh, ga) {
    origAdd(table, h, a, gh, ga);
    const S = F.S;
    if (!S || !S.league || table !== S.league.table) return; // sadece senin ligin
    try {
      const st = S.queue && S.queue[0];
      const m = st && st.type === 'match' && st.m && !st.m.nat ? st.m : null;
      const myId = S.P.contract.team;
      credit(h, gh, h === myId ? m : null);
      credit(a, ga, a === myId ? m : null);
    } catch (e) { /* istatistik hatası oyunu durdurmasın */ }
  };
  // sıralama listeleri
  F.leagueLeaders = function (k, n) {
    const ps = Object.values(book());
    return ps.filter((x) => (k === 'kart' ? x.y + x.r : x[k]) > 0)
      .sort((x, y) => (k === 'kart' ? (y.r * 3 + y.y) - (x.r * 3 + x.y) : y[k] - x[k] || (k === 'g' ? y.a - x.a : y.g - x.g)))
      .slice(0, n || 15);
  };
  // sezon sonu: gol ya da asist kralıysan albüme ve şöhrete yansır
  const origEnd = F.endSeason;
  F.endSeason = function () {
    try {
      const S = F.S;
      const g = F.leagueLeaders('g', 1)[0], a = F.leagueLeaders('a', 1)[0];
      if (g && g.me) { F.addAlbum(F.leagueName() + ' gol kralı oldun: ' + g.g + ' gol!', 'kupa'); F.fx({ sohret: 5, moral: 10, 'takipci%': 5 }); S.flags.golkrali = (S.flags.golkrali || 0) + 1; }
      if (a && a.me) { F.addAlbum(F.leagueName() + ' asist kralı oldun: ' + a.a + ' asist!', 'kupa'); F.fx({ sohret: 3, moral: 8, 'r.takim': 5 }); }
    } catch (e) { /* yoksay */ }
    return origEnd.apply(this, arguments);
  };
})(typeof window !== 'undefined' ? window : globalThis);
