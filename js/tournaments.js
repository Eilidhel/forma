/* FORMA — turnuvalar (isimler kurgusal)
   Avrupa Yıldızlar Ligi: her sezon 32 kulüp. Ülke kotaları önceki sezonun üst lig sıralamasıyla dolar (ilk sezon güce göre).
     8 grup × 4 takım (çift devre, 6 maç), sonra Son 16, çeyrek final, yarı final ve final; eleme maçları tek maç, berabere biterse penaltılar.
     Maçlar lig haftalarının arasına hafta ortası maçı olarak girer. Kulübün turnuvadaysa sen de oynarsın.
   Küresel Kupa: 4 yılda bir yazın oynanan milli takımlar turnuvası. Öncesindeki sezon milli aralarda eleme grubu oynanır
     (5 takım, 8 maç): grup birincisi doğrudan, ikincisi baraj maçıyla katılır. Milli takım kadrosundaysan turnuvada oynarsın. */
(function (root) {
  const F = root.F;
  const D = F.DATA;
  const CL = D.cups.cl, WC = D.cups.wc;
  const GL = 'ABCDEFGH';
  const STAGES = ['r16', 'qf', 'sf', 'final'];
  F.STAGE_NAME = { g: 'Grup aşaması', r16: 'Son 16', qf: 'Çeyrek final', sf: 'Yarı final', final: 'Final' };
  // Yıldızlar Ligi takvimi: maç günlerinin geldiği lig turları (milli aralar 8/16/25 ve devre arası 17 boş bırakıldı)
  const CL_CAL = [2, 4, 6, 10, 12, 14, 20, 23, 28, 32];

  F.natName = () => (F.S.P && F.S.P.natTeam === 'DE' ? 'Almanya' : 'Türkiye');
  const nation = (name) => D.nations.find((x) => x[0] === name);
  F.natStr = (name) => { const n = nation(name); return n ? n[1] : 70; };
  // güçlere göre skor (ev sahibi avantajı isteğe bağlı)
  const simStr = (sa, sb, homeA) => {
    const lh = F.clamp(1.3 + (sa - sb) / 16 + (homeA ? 0.2 : 0), 0.2, 4);
    const la = F.clamp(1.1 + (sb - sa) / 16, 0.15, 3.6);
    return [F.poisson(lh), F.poisson(la)];
  };
  const pensWin = (sa, sb) => F.chance(F.clamp(0.5 + (sa - sb) / 60, 0.25, 0.75));
  const chunk2 = (arr) => { const out = []; for (let i = 0; i < arr.length; i += 2) out.push([arr[i], arr[i + 1]]); return out; };
  // 4 torbalı kura: güçlüden zayıfa, mümkünse aynı ülkeden iki takım aynı gruba düşmez
  function draw(ids, strOf, countryOf) {
    const n = Math.floor(ids.length / 4);
    const seeded = ids.slice().sort((a, b) => strOf(b) - strOf(a));
    const groups = Array.from({ length: n }, () => []);
    for (let p = 0; p < 4; p++) {
      F.shuffle(seeded.slice(p * n, (p + 1) * n)).forEach((id) => {
        const free = groups.filter((g) => g.length === p);
        const g = (countryOf && free.find((x) => !x.some((y) => countryOf(y) === countryOf(id)))) || free[0];
        g.push(id);
      });
    }
    return groups;
  }
  // Ortak turnuva yapısı (kulüp ya da milli): gruplar, tablolar, eleme ağacı
  function makeCup(o, ids, groupRounds, strOf, countryOf) {
    const groups = draw(ids, strOf, countryOf);
    return Object.assign(o, { groups, tables: groups.map((g) => F.emptyTable(g)), gfx: groups.map((g) => F.roundRobin(g).slice(0, groupRounds)), gr: groupRounds, md: 0, ko: {}, kow: {}, kores: [], winner: null, pending: null });
  }
  function ensureKo(C, st, strOf) {
    if (C.ko[st]) return C.ko[st];
    let teams;
    if (st === 'r16') {
      const o = C.tables.map((t) => F.sortTable(t));
      teams = [];
      for (let g = 0; g + 1 < o.length; g += 2) teams.push(o[g][0], o[g + 1][1], o[g + 1][0], o[g][1]);
    } else {
      const prev = STAGES[STAGES.indexOf(st) - 1];
      const pairs = ensureKo(C, prev, strOf);
      // oynanmamış maç kaldıysa (kayıt yarıda kaldıysa) simüle edilir
      pairs.forEach((p, j) => { if (!C.kow[prev][j]) record(C, { h: p[0], a: p[1], ko: prev, j }, ...simStr(strOf(p[0]), strOf(p[1]), false), null, strOf); });
      teams = C.kow[prev].slice();
    }
    C.ko[st] = chunk2(teams);
    C.kow[st] = C.ko[st].map(() => null);
    return C.ko[st];
  }
  function fixtures(C, i, strOf) {
    if (i < C.gr) return [].concat(...C.groups.map((g, gi) => (C.gfx[gi][i] || []).map((p) => ({ h: p[0], a: p[1], gi, i }))));
    const st = STAGES[i - C.gr];
    return ensureKo(C, st, strOf).map((p, j) => ({ h: p[0], a: p[1], ko: st, j }));
  }
  function record(C, f, gh, ga, penW, strOf) {
    if (f.gi != null) { F.addResult(C.tables[f.gi], f.h, f.a, gh, ga); return; }
    const w = gh > ga ? f.h : ga > gh ? f.a : penW || (pensWin(strOf(f.h), strOf(f.a)) ? f.h : f.a);
    C.kow[f.ko][f.j] = w;
    C.kores.push({ ko: f.ko, h: f.h, a: f.a, gh, ga, w, pen: gh === ga });
    if (f.ko === 'final') C.winner = w;
  }
  const sameFix = (a, b) => a && b && a.h === b.h && a.a === b.a && a.gi === b.gi && a.ko === b.ko && a.j === b.j && a.i === b.i;
  // bir takım turnuvada nereye kadar geldi
  function reached(C, id) {
    if (C.winner === id) return 'şampiyon';
    for (let s = STAGES.length - 1; s >= 0; s--) { const st = STAGES[s]; if (C.ko[st] && C.ko[st].some((p) => p.includes(id))) return st === 'final' ? 'finalist' : F.STAGE_NAME[st]; }
    return C.teams.includes(id) ? 'Grup aşaması' : null;
  }
  F.cupReached = reached;
  // turnuva kuyruğa girecek adımı: sezon sonu adımlarından önce
  const insertBeforeEnd = (step) => {
    const Q = F.S.queue;
    const i = Q.findIndex((s, k) => k > 0 && ['offers', 'retire', 'newSeasonAuto', 'heir', 'gameover'].includes(s.type));
    if (i < 0) Q.push(step); else Q.splice(i, 0, step);
  };

  /* =========================================================
     AVRUPA YILDIZLAR LİGİ
     ========================================================= */
  const tStr = (id) => (F.team(id) ? F.team(id).str : 60);
  const tCountry = (id) => (F.team(id) ? F.team(id).country : '');
  F.clStart = function () {
    const S = F.S;
    const teams = [];
    Object.keys(CL.slots).forEach((c) => {
      const top = Object.values(S.world.comps).find((k) => k.c === c && k.tier === 1);
      if (!top) return;
      const prev = ((S.prevTop && S.prevTop[c]) || []).filter((id) => top.teams.includes(id));
      const rest = top.teams.filter((id) => !prev.includes(id)).sort((a, b) => tStr(b) - tStr(a));
      teams.push(...prev.concat(rest).slice(0, CL.slots[c]));
    });
    if (teams.length < 32) return (S.cl = null);
    S.cl = makeCup({ season: S.season, year: S.year, teams: teams.slice(0, 32) }, teams.slice(0, 32), 6, tStr, tCountry);
  };
  const clLabel = (f) => CL.short + ' · ' + (f.gi != null ? GL[f.gi] + ' Grubu, ' + (f.i + 1) + '. maç' : F.STAGE_NAME[f.ko]);
  // bir maç günü: senin kulübünün maçı adım olarak döner, diğerleri simüle edilir
  F.clMatchday = function (i, allowPlay) {
    const S = F.S, C = S.cl;
    if (C.pending) { const p = C.pending; C.pending = null; record(C, p, ...simStr(tStr(p.h), tStr(p.a), !p.ko || p.ko !== 'final'), null, tStr); }
    const me = S.P.contract.team;
    let step = null;
    fixtures(C, i, tStr).forEach((f) => {
      if (allowPlay && !step && (f.h === me || f.a === me)) {
        C.pending = f;
        step = { type: 'match', cup: true, pre: true, fix: { kind: 'cl', f, opp: f.h === me ? f.a : f.h, home: f.h === me && f.ko !== 'final', ko: !!f.ko, comp: clLabel(f) } };
        return;
      }
      record(C, f, ...simStr(tStr(f.h), tStr(f.a), f.ko !== 'final'), null, tStr);
    });
    C.md = i + 1;
    return step;
  };
  F.weekCupSteps = function () {
    const S = F.S, C = S.cl;
    if (!C || C.season !== S.season || !S.league) return [];
    const out = [];
    const r = S.league.round;
    while (C.md < CL_CAL.length && CL_CAL[C.md] <= r) {
      const st = F.clMatchday(C.md, CL_CAL[C.md] === r);
      if (st) { out.push(st); if (S.wk) S.wk.notes.push('Bu hafta ' + CL.name + ' maçı da var (' + st.fix.comp.split(' · ')[1] + ').'); }
    }
    return out;
  };
  F.clFinishAll = function () {
    const S = F.S, C = S.cl;
    if (!C || C.season !== S.season) return;
    while (C.md < CL_CAL.length) F.clMatchday(C.md, false);
    if (C.pending) { const p = C.pending; C.pending = null; record(C, p, ...simStr(tStr(p.h), tStr(p.a), false), null, tStr); }
  };

  /* =========================================================
     KÜRESEL KUPA
     ========================================================= */
  // eleme sezonu: Küresel Kupa'dan önceki sezon (yaz 2030 → 2029-30 sezonu)
  F.isWcqSeason = (year) => year % 4 === 1;
  F.wcqStart = function () {
    const S = F.S;
    const my = F.natName();
    const others = D.nations.filter((n) => n[0] !== my).sort((a, b) => b[1] - a[1]).map((n) => n[0]);
    const pots = [others.slice(0, 12), others.slice(12, 28), others.slice(28, 48), others.slice(48)];
    const group = [my].concat(pots.map((p) => F.pick(p)));
    S.wcq = { year: S.year, nation: my, group, table: F.emptyTable(group), fx: F.roundRobin(group), r: 0, breaks: 0, pending: null, result: null };
  };
  const wcqRecordSim = (Q, h, a) => { const [x, y] = simStr(F.natStr(h), F.natStr(a), true); F.addResult(Q.table, h, a, x, y); };
  // milli ara: bu aranın eleme haftaları oynanır; çağrıldıysan milli takımının ilk maçı sana kalır
  F.natBreakFixture = function (called) {
    const S = F.S, Q = S.wcq;
    if (!Q || Q.year !== S.year || Q.result) return null;
    if (Q.pending) { wcqRecordSim(Q, Q.pending.h, Q.pending.a); Q.pending = null; }
    Q.breaks++;
    const cutoff = [3, 6, Q.fx.length][Math.min(2, Q.breaks - 1)];
    let fix = null;
    for (; Q.r < cutoff && Q.r < Q.fx.length; Q.r++) {
      Q.fx[Q.r].forEach(([h, a]) => {
        if (called && !fix && (h === Q.nation || a === Q.nation)) {
          const opp = h === Q.nation ? a : h, n = nation(opp);
          fix = { kind: 'wcq', h, a, oppName: opp, oppColors: n ? [n[2], n[3]] : null, home: h === Q.nation, myStr: F.natStr(Q.nation), oppStr: F.natStr(opp), comp: WC.qual + ' · ' + (Q.r + 1) + '. hafta' };
          Q.pending = { h, a };
          return;
        }
        wcqRecordSim(Q, h, a);
      });
    }
    return fix;
  };
  // sezon sonu: kalan eleme maçları oynanır, sonuç belli olur
  F.wcqFinish = function () {
    const S = F.S, Q = S.wcq;
    if (!Q || Q.result) return null;
    if (Q.pending) { wcqRecordSim(Q, Q.pending.h, Q.pending.a); Q.pending = null; }
    for (; Q.r < Q.fx.length; Q.r++) Q.fx[Q.r].forEach(([h, a]) => wcqRecordSim(Q, h, a));
    const order = F.sortTable(Q.table);
    Q.pos = order.indexOf(Q.nation) + 1;
    if (Q.pos === 1) Q.result = 'direkt';
    else if (Q.pos === 2) Q.result = F.chance(F.clamp(0.5 + (F.natStr(Q.nation) - 72) / 40, 0.3, 0.8)) ? 'baraj-kazandı' : 'baraj-kaybetti';
    else Q.result = 'elendi';
    return Q.result;
  };
  const wcQualified = (Q) => Q && (Q.result === 'direkt' || Q.result === 'baraj-kazandı');
  // milli takım turnuva kadrosu: A takım seviyesinde olmak gerekir (U21 yolu sayılmaz)
  F.wcSquad = function () {
    const P = F.S.P;
    if (P.injury || !P.natTeam) return false;
    const need = P.natTeam === 'DE' ? 80 : 73;
    const ovr = F.ovr();
    return ovr >= need || (ovr >= need - 3 && P.life.sohret > 60);
  };
  F.wcStart = function () {
    const S = F.S, Q = S.wcq;
    const my = Q ? Q.nation : F.natName();
    const qual = wcQualified(Q);
    const others = D.nations.filter((n) => n[0] !== my).map((n) => ({ n: n[0], k: n[1] + F.rf(-5, 5) })).sort((a, b) => b.k - a.k).slice(0, qual ? 31 : 32).map((x) => x.n);
    const teams = qual ? others.concat(my) : others;
    S.wc = makeCup({ year: S.year, nation: my, qual, teams, squad: qual && F.wcSquad() }, teams, 3, F.natStr, null);
  };
  const wcLabel = (f) => WC.short + ' · ' + (f.gi != null ? GL[f.gi] + ' Grubu, ' + (f.i + 1) + '. maç' : F.STAGE_NAME[f.ko]);
  // turnuvayı senin bir sonraki maçına kadar ilerletir; maçın varsa adım döner, yoksa turnuva biter
  F.wcRun = function () {
    const S = F.S, W = S.wc;
    while (W.md < W.gr + STAGES.length) {
      let step = null;
      fixtures(W, W.md, F.natStr).forEach((f) => {
        if (W.squad && !step && (f.h === W.nation || f.a === W.nation)) {
          const opp = f.h === W.nation ? f.a : f.h, n = nation(opp);
          W.pending = f;
          step = { type: 'match', nat: true, pre: true, fix: { kind: 'wc', f, oppName: opp, oppColors: n ? [n[2], n[3]] : null, home: false, ko: !!f.ko, myStr: F.natStr(W.nation), oppStr: F.natStr(opp), comp: wcLabel(f) } };
          return;
        }
        record(W, f, ...simStr(F.natStr(f.h), F.natStr(f.a), false), null, F.natStr);
      });
      W.md++;
      if (step) return step;
    }
    F.wcDone();
    return null;
  };
  F.wcDone = function () {
    const S = F.S, W = S.wc;
    if (W.done) return;
    W.done = true;
    const r = reached(W, W.nation);
    W.myResult = r;
    F.addFeed({ who: 'Futbol Gündemi', t: WC.name + ' ' + W.year + ': ' + W.winner + ' şampiyon oldu!' + (W.qual ? ' ' + W.nation + ': ' + r + '.' : ' ' + W.nation + ' turnuvaya katılamamıştı.'), kind: 'news' });
    if (!W.squad) return;
    const P = S.P;
    if (W.winner === W.nation) {
      P.career.titles.push({ year: W.year, league: WC.name });
      F.addAlbum(WC.name + ' şampiyonu! ' + W.nation + ' formasıyla dünyanın zirvesindesin.', 'kupa');
      F.fx({ sohret: 15, moral: 25, 'r.taraftar': 20, 'takipci%': 40 });
    } else {
      F.addAlbum(WC.name + ' ' + W.year + ': ' + W.nation + ' ile ' + (r === 'finalist' ? 'finale kadar yürüdün' : r === 'Grup aşaması' ? 'grupta veda ettin' : r.toLowerCase() + ' turunda elendin') + '.', 'milli');
      F.fx({ sohret: r === 'finalist' ? 8 : 4, moral: r === 'finalist' ? 5 : -3 });
    }
  };

  /* =========================================================
     KANCALAR
     ========================================================= */
  // önceki sezonun üst lig sıralaması (Yıldızlar Ligi kotası için)
  const origPR = F.promoteRelegate;
  F.promoteRelegate = function (finals) {
    try {
      const S = F.S;
      S.prevTop = {};
      Object.values(S.world.comps).forEach((k) => { if (k.tier === 1 && finals[k.key]) S.prevTop[k.c] = finals[k.key].slice(0, 8); });
    } catch (e) { /* yoksay */ }
    return origPR.apply(this, arguments);
  };

  const origStart = F.startSeason;
  F.startSeason = function () {
    const r = origStart.apply(this, arguments);
    try {
      const S = F.S;
      F.clStart();
      if (F.isWcqSeason(S.year)) F.wcqStart(); else if (S.wcq && S.wcq.year !== S.year && S.wcq.result) { /* önceki eleme sonucu turnuvaya kadar saklanır */ }
    } catch (e) { if (F.DEBUG) throw e; }
    return r;
  };

  const summaryOf = () => { const st = F.S.queue.find((s) => s.type === 'seasonSummary'); return st ? st.data : null; };
  const origEnd = F.endSeason;
  F.endSeason = function () {
    const S = F.S;
    let clLine = null, wcqLine = null;
    try {
      // sezon bitmeden önce: kalan kupa maçları
      if (S.cl && S.cl.season === S.season) {
        F.clFinishAll();
        const C = S.cl, me = S.P.contract.team;
        const w = F.team(C.winner);
        const myR = C.teams.includes(me) ? reached(C, me) : null;
        clLine = CL.short + ': ' + (myR === 'şampiyon' ? 'şampiyon oldunuz!' : (w ? w.name + ' şampiyon' : '') + (myR ? ' · kulübün: ' + myR : ''));
        if (myR === 'şampiyon') {
          S.P.career.titles.push({ year: S.year, league: CL.name });
          F.addAlbum(CL.name + ' şampiyonu! Avrupa\'nın en büyüğü ' + F.myTeam().name + '.', 'kupa');
          F.fx({ sohret: 12, moral: 20, 'r.taraftar': 20, 'takipci%': 25 });
        } else if (w) F.addFeed({ who: 'Futbol Gündemi', t: CL.name + ' şampiyonu ' + w.name + '!', kind: 'news' });
      }
      if (S.wcq && S.wcq.year === S.year && !S.wcq.result) {
        const res = F.wcqFinish();
        const Q = S.wcq;
        wcqLine = WC.qual + ': ' + Q.nation + ' grubu ' + Q.pos + '. bitirdi' + (res === 'direkt' ? ', ' + WC.name + '\'ya katılıyor!' : res === 'baraj-kazandı' ? ', barajı geçip ' + WC.name + '\'ya katılıyor!' : res === 'baraj-kaybetti' ? ', barajda elendi.' : ', elendi.');
      }
    } catch (e) { if (F.DEBUG) throw e; }
    const r = origEnd.apply(this, arguments);
    try {
      const sum = summaryOf();
      if (sum) { if (clLine) sum.awards.push(clLine); if (wcqLine) sum.awards.push(wcqLine); }
      // yaz: Küresel Kupa (eleme sezonunun hemen ardından)
      if (S.wcq && S.wcq.year === S.year - 1 && S.wcq.result && (!S.wc || S.wc.year !== S.year)) {
        F.wcStart();
        const step = F.wcRun();
        const W = S.wc;
        if (step) insertBeforeEnd(step);
        else if (sum) sum.awards.push(WC.name + ' ' + W.year + ': ' + W.winner + ' şampiyon' + (W.qual ? ' · ' + W.nation + ': ' + W.myResult : ''));
        if (W.qual && !W.squad && sum) sum.awards.push(W.nation + ' ' + WC.name + ' kadrosuna seçilmedin.');
      }
    } catch (e) { if (F.DEBUG) throw e; }
    return r;
  };

  const origFinish = F.matchFinish;
  F.matchFinish = function () {
    const S = F.S;
    const step = S.queue && S.queue[0];
    const m = step && step.m;
    const was = m && m.done;
    const r = origFinish.apply(this, arguments);
    try {
      if (!m || was || !m.done || !step.fix) return r;
      const fix = step.fix;
      const homeG = fix.home ? m.gfTotal : m.gaTotal, awayG = fix.home ? m.gaTotal : m.gfTotal;
      if (fix.kind === 'wcq') {
        const Q = S.wcq;
        if (Q && Q.pending && Q.pending.h === fix.h && Q.pending.a === fix.a) { F.addResult(Q.table, fix.h, fix.a, homeG, awayG); Q.pending = null; }
        return r;
      }
      const C = fix.kind === 'cl' ? S.cl : fix.kind === 'wc' ? S.wc : null;
      if (!C || !sameFix(C.pending, fix.f)) return r;
      const f = fix.f;
      C.pending = null;
      const strOf = fix.kind === 'cl' ? tStr : F.natStr;
      // benim tarafım: rakip deplasmandaysa ev sahibiyim
      const mine = fix.kind === 'cl' ? (f.h === fix.opp ? f.a : f.h) : C.nation;
      const iAmH = f.h === mine;
      const gh = iAmH ? m.gfTotal : m.gaTotal, ga = iAmH ? m.gaTotal : m.gfTotal;
      let penW = null;
      if (f.ko && gh === ga) {
        const win = pensWin(m.myStr + (m.played ? 2 : 0), m.oppStr);
        penW = win ? mine : iAmH ? f.a : f.h;
        m.pens = win ? 'win' : 'loss';
        m.feed.push({ minute: 120, side: win ? 'me' : 'op', kind: 'whistle', t: win ? 'Penaltılarla kazandık! Tur bizim.' : 'Penaltılarda kaybettik. Yolun sonu.' });
      }
      record(C, f, gh, ga, penW, strOf);
      if (m.played) F.fx({ sohret: fix.kind === 'wc' ? 2 : 1 });
      if (f.ko && C.kow[f.ko][f.j] === mine && f.ko !== 'final') m.feed.push({ minute: 121, side: 'me', kind: 'whistle', t: F.STAGE_NAME[STAGES[STAGES.indexOf(f.ko) + 1]] + ' biletini aldık!' });
      if (fix.kind === 'wc') {
        F.fx({ enerji: 14 }); // turnuvada maç arası toparlanma
        const next = F.wcRun();
        if (next) insertBeforeEnd(next);
      }
    } catch (e) { if (F.DEBUG) throw e; }
    return r;
  };
})(typeof window !== 'undefined' ? window : globalThis);
