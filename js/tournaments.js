/* FORMA — turnuvalar (isimler kurgusal)
   Kulüp kupaları (üç kademe, her sezon):
     Avrupa Yıldızlar Ligi (32 kulüp, 8 grup → Son 16), Avrupa Kıta Kupası (16, 4 grup → çeyrek final), Avrupa Gelecek Ligi (16).
     Ülkenin üst ligindeki önceki sezon sıralamasıyla dağıtılır (ilk sezon güce göre). Grup maçları çift devre, eleme tek maç,
     berabere biterse penaltılar. Maçlar lig haftalarının arasına hafta ortası maçı olarak girer.
   Milli takımlar (4 yıllık döngü):
     2026-27 ve 2027-28 sezonları Milletler Kupası elemeleri → 2028 yazı Avrupa Milletler Kupası (16 takım),
     2028-29 ve 2029-30 sezonları Küresel Kupa elemeleri → 2030 yazı Küresel Kupa (32 takım). Sonra döngü tekrar eder.
     Eleme grubu 6 takım, 10 maç; her sezon 3 milli ara, her arada 1-2 maç. Her milli aranın başında bir ekran
     kadroya çağrılıp çağrılmadığını, rakipleri ve grup durumunu gösterir. */
(function (root) {
  const F = root.F;
  const D = F.DATA;
  const GL = 'ABCDEFGH';
  const ALL_STAGES = ['r16', 'qf', 'sf', 'final'];
  F.STAGE_NAME = { g: 'Grup aşaması', r16: 'Son 16', qf: 'Çeyrek final', sf: 'Yarı final', final: 'Final' };
  // kupa maç günlerinin geldiği lig turları (milli aralar 8/16/25 ve devre arası 17 boş)
  const CAL32 = [2, 4, 6, 10, 12, 14, 20, 23, 28, 32];
  const CAL16 = [2, 4, 6, 10, 12, 14, 23, 28, 32];
  const BREAK_ROUNDS = [8, 16, 25];
  // eleme: 6 milli arada (iki sezon) 10 maç günü; her aranın sonunda oynanmış olan maç günü sayısı
  const NAT_CUT = [2, 4, 5, 7, 9, 10];

  // Türkçe yönelme eki: Kupası'na, Ligi'ne, Kupa'ya
  F.dat = (n) => n + ({ ı: "'na", i: "'ne", u: "'na", ü: "'ne", a: "'ya", e: "'ye" }[n.slice(-1)] || "'a");
  F.natName = () => (F.S.P && F.S.P.natTeam === 'DE' ? 'Almanya' : 'Türkiye');
  const nation = (name) => D.nations.find((x) => x[0] === name);
  F.natStr = (name) => { const n = nation(name); return n ? n[1] : 70; };
  F.natColors = (name) => { const n = nation(name); return n ? [n[2], n[3]] : ['#334455', '#99aabb']; };
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
  const stagesOf = (C) => C.stages || ALL_STAGES;
  F.cupStages = stagesOf;
  function makeCup(o, ids, groupRounds, strOf, countryOf) {
    const groups = draw(ids, strOf, countryOf);
    return Object.assign(o, {
      groups, tables: groups.map((g) => F.emptyTable(g)), gfx: groups.map((g) => F.roundRobin(g).slice(0, groupRounds)), gr: groupRounds,
      stages: groups.length >= 8 ? ALL_STAGES.slice() : ALL_STAGES.slice(1), md: 0, ko: {}, kow: {}, kores: [], winner: null, pending: null
    });
  }
  function ensureKo(C, st, strOf) {
    if (C.ko[st]) return C.ko[st];
    const stages = stagesOf(C);
    let teams;
    if (st === stages[0]) {
      const o = C.tables.map((t) => F.sortTable(t));
      teams = [];
      for (let g = 0; g + 1 < o.length; g += 2) teams.push(o[g][0], o[g + 1][1], o[g + 1][0], o[g][1]);
    } else {
      const prev = stages[stages.indexOf(st) - 1];
      const pairs = ensureKo(C, prev, strOf);
      pairs.forEach((p, j) => { if (!C.kow[prev][j]) record(C, { h: p[0], a: p[1], ko: prev, j }, ...simStr(strOf(p[0]), strOf(p[1]), false), null, strOf); });
      teams = C.kow[prev].slice();
    }
    C.ko[st] = chunk2(teams);
    C.kow[st] = C.ko[st].map(() => null);
    return C.ko[st];
  }
  function fixtures(C, i, strOf) {
    if (i < C.gr) return [].concat(...C.groups.map((g, gi) => (C.gfx[gi][i] || []).map((p) => ({ h: p[0], a: p[1], gi, i }))));
    const st = stagesOf(C)[i - C.gr];
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
  function reached(C, id) {
    if (C.winner === id) return 'şampiyon';
    const st = stagesOf(C);
    for (let s = st.length - 1; s >= 0; s--) if (C.ko[st[s]] && C.ko[st[s]].some((p) => p.includes(id))) return st[s] === 'final' ? 'finalist' : F.STAGE_NAME[st[s]];
    return C.teams.includes(id) ? 'Grup aşaması' : null;
  }
  F.cupReached = reached;
  // takım sıradaki maç gününde hâlâ turnuvada mı
  F.cupAlive = function (C, id) {
    if (C.md < C.gr) return C.teams.includes(id);
    const k = C.md - C.gr, st = stagesOf(C);
    if (k >= st.length) return false;
    if (C.ko[st[k]]) return C.ko[st[k]].some((p) => p.includes(id)) && !C.kow[st[k]].some((w, j) => w && C.ko[st[k]][j].includes(id) && w !== id);
    if (k === 0) { const gi = C.groups.findIndex((g) => g.includes(id)); return gi >= 0 && F.sortTable(C.tables[gi]).slice(0, 2).includes(id); }
    return !!(C.kow[st[k - 1]] && C.kow[st[k - 1]].includes(id));
  };
  const totalMd = (C) => C.gr + stagesOf(C).length;
  // turnuva adımı sezon sonu adımlarından (teklifler, emeklilik, yeni sezon) önce girer
  const insertBeforeEnd = (step) => {
    const Q = F.S.queue;
    const i = Q.findIndex((s, k) => k > 0 && ['offers', 'retire', 'newSeasonAuto', 'heir', 'gameover'].includes(s.type));
    if (i < 0) Q.push(step); else Q.splice(i, 0, step);
  };

  /* =========================================================
     KULÜP KUPALARI
     ========================================================= */
  const tStr = (id) => (F.team(id) ? F.team(id).str : 60);
  const tCountry = (id) => (F.team(id) ? F.team(id).country : '');
  F.clubCups = () => { const S = F.S; return S.ccups && S.ccups.season === S.season ? S.ccups : null; };
  F.myClubCup = () => {
    const cc = F.clubCups();
    if (!cc) return null;
    const me = F.S.P.contract.team;
    return D.clubCups.map((k) => cc[k]).find((C) => C && C.teams.includes(me)) || null;
  };
  F.clubCupsStart = function () {
    const S = F.S;
    const cc = { season: S.season };
    const lists = {}, off = {};
    Object.keys(D.cups.cl.slots).forEach((c) => {
      const top = Object.values(S.world.comps).find((k) => k.c === c && k.tier === 1);
      if (!top) return;
      const prev = ((S.prevTop && S.prevTop[c]) || []).filter((id) => top.teams.includes(id));
      lists[c] = prev.concat(top.teams.filter((id) => !prev.includes(id)).sort((a, b) => tStr(b) - tStr(a)));
    });
    D.clubCups.forEach((k) => {
      const def = D.cups[k];
      const ids = [];
      Object.keys(def.slots).forEach((c) => { const o = off[c] || 0; ids.push(...(lists[c] || []).slice(o, o + def.slots[c])); off[c] = o + def.slots[c]; });
      if (ids.length < def.size) return;
      const teams = ids.slice(0, def.size);
      cc[k] = makeCup({ id: k, season: S.season, teams, cal: def.size >= 32 ? CAL32 : CAL16 }, teams, 6, tStr, tCountry);
    });
    S.ccups = cc;
  };
  const clubLabel = (C, f) => D.cups[C.id].short + ' · ' + (f.gi != null ? GL[f.gi] + ' Grubu, ' + (f.i + 1) + '. maç' : F.STAGE_NAME[f.ko]);
  function clubMatchday(C, i, allowPlay) {
    const S = F.S;
    if (C.pending) { const p = C.pending; C.pending = null; record(C, p, ...simStr(tStr(p.h), tStr(p.a), p.ko !== 'final'), null, tStr); }
    const me = S.P.contract.team;
    let step = null;
    fixtures(C, i, tStr).forEach((f) => {
      if (allowPlay && !step && (f.h === me || f.a === me)) {
        C.pending = f;
        step = { type: 'match', cup: true, pre: true, fix: { kind: C.id, f, opp: f.h === me ? f.a : f.h, home: f.h === me && f.ko !== 'final', ko: !!f.ko, comp: clubLabel(C, f) } };
        return;
      }
      record(C, f, ...simStr(tStr(f.h), tStr(f.a), f.ko !== 'final'), null, tStr);
    });
    C.md = i + 1;
    return step;
  }
  F.weekCupSteps = function () {
    const S = F.S;
    const out = [];
    const cc = F.clubCups();
    if (cc && S.league) {
      const r = S.league.round;
      D.clubCups.forEach((k) => {
        const C = cc[k];
        if (!C) return;
        while (C.md < C.cal.length && C.cal[C.md] <= r) {
          const st = clubMatchday(C, C.md, C.cal[C.md] === r);
          if (st) { out.push(st); if (S.wk) S.wk.notes.push('Bu hafta ' + D.cups[k].name + ' maçı da var (' + st.fix.comp.split(' · ')[1] + ').'); }
        }
      });
    }
    // milli ara yaklaşıyor: bir hafta önceden haber
    const nb = F.nextNatBreak();
    if (nb && nb.in === 1 && S.wk) {
      const up = F.natUpcoming();
      S.wk.notes.push('Gelecek hafta milli ara' + (up ? ': ' + up.comp + (up.opps.length ? ' (' + up.opps.map((o) => o.opp).join(', ') + ')' : '') : '') + '.');
    }
    return out;
  };
  function clubCupsFinish() {
    const cc = F.clubCups();
    if (!cc) return;
    D.clubCups.forEach((k) => {
      const C = cc[k];
      if (!C) return;
      while (C.md < C.cal.length) clubMatchday(C, C.md, false);
      if (C.pending) { const p = C.pending; C.pending = null; record(C, p, ...simStr(tStr(p.h), tStr(p.a), false), null, tStr); }
    });
  }

  /* =========================================================
     MİLLİ TAKIM TAKVİMİ
     ========================================================= */
  // kampanyanın başladığı sezon: 2026 → Milletler Kupası (2028 yazı), 2028 → Küresel Kupa (2030 yazı)
  F.natCampaignKind = (year) => (year % 4 === 2 ? 'euro' : year % 4 === 0 ? 'wc' : null);
  F.natqStart = function (startYear) {
    const S = F.S;
    const kind = F.natCampaignKind(startYear);
    const my = F.natName();
    const others = D.europe.filter((n) => n !== my && nation(n)).sort((a, b) => F.natStr(b) - F.natStr(a));
    const size = Math.ceil(others.length / 5);
    const group = [my];
    for (let p = 0; p < 5; p++) group.push(F.pick(others.slice(p * size, (p + 1) * size)));
    S.natq = { kind, startYear, target: startYear + 2, nation: my, group, table: F.emptyTable(group), fx: F.roundRobin(group), r: 0, breaks: 0, results: [], pending: [], result: null };
    // kampanyanın ortasına (eski kayıt) denk geldiyse ilk sezonun maçları oynanmış sayılır
    if (S.year > startYear) { simTo(S.natq, NAT_CUT[2]); S.natq.breaks = 3; }
  };
  const qName = (Q) => D.cups[Q.kind].qual;
  function simRec(Q, h, a, r) { const [x, y] = simStr(F.natStr(h), F.natStr(a), true); F.addResult(Q.table, h, a, x, y); Q.results.push({ r, h, a, gh: x, ga: y }); }
  function simTo(Q, cut) {
    (Q.pending || []).forEach((p) => simRec(Q, p.h, p.a, p.r));
    Q.pending = [];
    for (; Q.r < cut && Q.r < Q.fx.length; Q.r++) { const r = Q.r; Q.fx[r].forEach(([h, a]) => simRec(Q, h, a, r)); }
  }
  F.natq = () => { const S = F.S; return S.natq && !S.natq.result ? S.natq : null; };
  F.nextNatBreak = function () {
    const S = F.S;
    if (!S.league) return null;
    const r = S.league.round;
    const nb = BREAK_ROUNDS.find((b) => b > r || (b === r && S.natBreakDone !== S.season + ':' + b));
    if (nb == null || nb >= F.seasonRounds()) return null;
    return { in: nb - r, round: nb };
  };
  // bir sonraki milli arada milli takımının rakipleri
  F.natUpcoming = function () {
    const Q = F.natq();
    if (!Q) return null;
    const cut = NAT_CUT[Math.min(5, Q.breaks)];
    const opps = [];
    for (let r = Q.r; r < cut && r < Q.fx.length; r++) Q.fx[r].forEach(([h, a]) => { if (h === Q.nation || a === Q.nation) opps.push({ opp: h === Q.nation ? a : h, home: h === Q.nation }); });
    return { comp: qName(Q), nation: Q.nation, opps };
  };
  // milli ara: önce bilgi ekranı, sonra (A takıma çağrıldıysan) milli takımının maçları
  F.natBreakSteps = function () {
    const S = F.S;
    const Q = F.natq();
    if (!Q) return null;
    const called = F.calledUp();
    const senior = called && F.wcSquad();
    simTo(Q, Q.r); // önceki aradan kalan oynanmamış maç varsa
    Q.breaks++;
    const cut = NAT_CUT[Math.min(5, Q.breaks - 1)];
    const r0 = Q.r;
    const mine = [];
    for (; Q.r < cut && Q.r < Q.fx.length; Q.r++) {
      const r = Q.r;
      Q.fx[r].forEach(([h, a]) => {
        if (senior && (h === Q.nation || a === Q.nation)) { mine.push({ h, a, r }); return; }
        simRec(Q, h, a, r);
      });
    }
    Q.pending = mine;
    const steps = [{ type: 'natInfo', mode: 'break', kind: Q.kind, called: senior ? 'A' : called ? 'U21' : null, rounds: [r0, Q.r] }];
    if (senior) {
      mine.forEach((x) => {
        const opp = x.h === Q.nation ? x.a : x.h;
        steps.push({ type: 'match', nat: true, pre: true, fix: { kind: 'q', h: x.h, a: x.a, r: x.r, oppName: opp, oppColors: F.natColors(opp), home: x.h === Q.nation, myStr: F.natStr(Q.nation), oppStr: F.natStr(opp), comp: qName(Q) + ' · ' + (x.r + 1) + '. maç' } });
      });
      F.addDM('Milli Takım', Q.nation + ' A Milli Takımı kadrosuna çağrıldın. ' + qName(Q) + ': ' + mine.map((x) => (x.h === Q.nation ? x.h + ' – ' + x.a : x.h + ' – ' + x.a)).join(', ') + '.');
    } else if (called) steps.push({ type: 'match', nat: true, pre: true });
    return steps;
  };
  function natqSeasonEnd() {
    const S = F.S, Q = F.natq();
    if (!Q) return null;
    if (S.year < Q.startYear + 1) { simTo(Q, NAT_CUT[2]); Q.breaks = Math.max(Q.breaks, 3); return null; }
    simTo(Q, Q.fx.length);
    const order = F.sortTable(Q.table);
    Q.pos = order.indexOf(Q.nation) + 1;
    const direct = Q.kind === 'euro' ? 2 : 1;
    if (Q.pos <= direct) Q.result = 'direkt';
    else if (Q.pos === direct + 1) Q.result = F.chance(F.clamp(0.5 + (F.natStr(Q.nation) - 72) / 40, 0.3, 0.8)) ? 'baraj-kazandı' : 'baraj-kaybetti';
    else Q.result = 'elendi';
    const T = D.cups[Q.kind].name;
    return qName(Q) + ': ' + Q.nation + ' grubu ' + Q.pos + '. bitirdi' + (Q.result === 'direkt' ? ', ' + F.dat(T) + ' katılıyor!' : Q.result === 'baraj-kazandı' ? ', barajı geçip ' + F.dat(T) + ' katılıyor!' : Q.result === 'baraj-kaybetti' ? ', barajda elendi.' : ', elendi.');
  }
  const natQualified = (Q) => Q && (Q.result === 'direkt' || Q.result === 'baraj-kazandı');
  // turnuva kadrosu: A takım seviyesinde olmak gerekir (U21 yolu sayılmaz)
  F.wcSquad = function () {
    const P = F.S.P;
    if (P.injury || !P.natTeam) return false;
    const need = P.natTeam === 'DE' ? 80 : 73;
    const ovr = F.ovr();
    return ovr >= need || (ovr >= need - 3 && P.life.sohret > 60);
  };
  F.natCupStart = function (kind) {
    const S = F.S, Q = S.natq;
    const def = D.cups[kind];
    const my = Q ? Q.nation : F.natName();
    const qual = natQualified(Q);
    const pool = (kind === 'euro' ? D.europe : D.nations.map((n) => n[0])).filter((n) => n !== my && nation(n));
    const others = pool.map((n) => ({ n, k: F.natStr(n) + F.rf(-5, 5) })).sort((a, b) => b.k - a.k).slice(0, def.size - (qual ? 1 : 0)).map((x) => x.n);
    const teams = qual ? others.concat(my) : others;
    S.ncups = S.ncups || {};
    S.ncups[kind] = makeCup({ id: kind, year: S.year, nation: my, qual, teams, squad: qual && F.wcSquad() }, teams, 3, F.natStr, null);
  };
  const natLabel = (C, f) => D.cups[C.id].short + ' · ' + (f.gi != null ? GL[f.gi] + ' Grubu, ' + (f.i + 1) + '. maç' : F.STAGE_NAME[f.ko]);
  // turnuvayı senin bir sonraki maçına kadar ilerletir; maçın yoksa turnuva biter
  F.natCupRun = function (kind) {
    const S = F.S, W = S.ncups[kind];
    while (W.md < totalMd(W)) {
      let step = null;
      fixtures(W, W.md, F.natStr).forEach((f) => {
        if (W.squad && !step && (f.h === W.nation || f.a === W.nation)) {
          const opp = f.h === W.nation ? f.a : f.h;
          W.pending = f;
          step = { type: 'match', nat: true, pre: true, fix: { kind, f, oppName: opp, oppColors: F.natColors(opp), home: false, ko: !!f.ko, myStr: F.natStr(W.nation), oppStr: F.natStr(opp), comp: natLabel(W, f) } };
          return;
        }
        record(W, f, ...simStr(F.natStr(f.h), F.natStr(f.a), false), null, F.natStr);
      });
      W.md++;
      if (step) return step;
    }
    natCupDone(kind);
    return null;
  };
  function natCupDone(kind) {
    const S = F.S, W = S.ncups[kind];
    if (W.done) return;
    W.done = true;
    const T = D.cups[kind].name;
    const r = reached(W, W.nation);
    W.myResult = r;
    F.addFeed({ who: 'Futbol Gündemi', t: T + ' ' + W.year + ': ' + W.winner + ' şampiyon oldu!' + (W.qual ? ' ' + W.nation + ': ' + r + '.' : ' ' + W.nation + ' turnuvaya katılamamıştı.'), kind: 'news' });
    insertBeforeEnd({ type: 'natInfo', mode: 'cupEnd', kind });
    if (!W.squad) return;
    const P = S.P;
    if (W.winner === W.nation) {
      P.career.titles.push({ year: W.year, league: T });
      F.addAlbum(T + ' şampiyonu! ' + W.nation + ' formasıyla zirvedesin.', 'kupa');
      F.fx({ sohret: kind === 'wc' ? 15 : 11, moral: 25, 'r.taraftar': 20, 'takipci%': kind === 'wc' ? 40 : 25 });
    } else {
      F.addAlbum(T + ' ' + W.year + ': ' + W.nation + ' ile ' + (r === 'finalist' ? 'finale kadar yürüdün' : r === 'Grup aşaması' ? 'grupta veda ettin' : r.toLowerCase() + ' turunda elendin') + '.', 'milli');
      F.fx({ sohret: r === 'finalist' ? 8 : 4, moral: r === 'finalist' ? 5 : -3 });
    }
  }

  /* =========================================================
     KANCALAR
     ========================================================= */
  const origPR = F.promoteRelegate;
  F.promoteRelegate = function (finals) {
    try {
      const S = F.S;
      S.prevTop = {};
      Object.values(S.world.comps).forEach((k) => { if (k.tier === 1 && finals[k.key]) S.prevTop[k.c] = finals[k.key].slice(0, 10); });
    } catch (e) { /* yoksay */ }
    return origPR.apply(this, arguments);
  };

  const origStart = F.startSeason;
  F.startSeason = function () {
    const r = origStart.apply(this, arguments);
    try {
      const S = F.S;
      F.clubCupsStart();
      if (!F.natq()) {
        const y = F.natCampaignKind(S.year) ? S.year : S.year - 1;
        if (!S.natq || S.natq.startYear !== y) F.natqStart(y);
      }
    } catch (e) { if (F.DEBUG) throw e; }
    return r;
  };

  const summaryOf = () => { const st = F.S.queue.find((s) => s.type === 'seasonSummary'); return st ? st.data : null; };
  const origEnd = F.endSeason;
  F.endSeason = function () {
    const S = F.S;
    const lines = [];
    try {
      const cc = F.clubCups();
      if (cc) {
        clubCupsFinish();
        const me = S.P.contract.team;
        const mine = F.myClubCup();
        if (mine) {
          const def = D.cups[mine.id];
          const myR = reached(mine, me);
          lines.push(def.short + ': ' + (myR === 'şampiyon' ? 'şampiyon oldunuz!' : (myR === 'finalist' ? 'kulübün finalde kaybetti' : myR === 'Grup aşaması' ? 'kulübün grupta elendi' : 'kulübün ' + myR.toLowerCase() + ' turunda elendi')));
          if (myR === 'şampiyon') {
            S.P.career.titles.push({ year: S.year, league: def.name });
            F.addAlbum(def.name + ' şampiyonu! Kupayı ' + F.myTeam().name + ' kaldırdı.', 'kupa');
            F.fx({ sohret: def.fame, moral: 20, 'r.taraftar': 20, 'takipci%': def.fame * 2 });
          }
        }
        const champs = D.clubCups.filter((k) => cc[k] && cc[k].winner).map((k) => D.cups[k].short + ' ' + F.team(cc[k].winner).name);
        if (champs.length) { lines.push('Avrupa şampiyonları: ' + champs.join(' · ')); F.addFeed({ who: 'Futbol Gündemi', t: 'Avrupa kupalarında sezon bitti. ' + champs.join(', ') + '.', kind: 'news' }); }
      }
      const ql = natqSeasonEnd();
      if (ql) lines.push(ql);
    } catch (e) { if (F.DEBUG) throw e; }
    const r = origEnd.apply(this, arguments);
    try {
      const sum = summaryOf();
      if (sum) sum.awards.push(...lines);
      // yaz turnuvası: eleme kampanyasının hedef yılı geldiyse
      const Q = S.natq;
      if (Q && Q.result && Q.target === S.year && !(S.ncups && S.ncups[Q.kind] && S.ncups[Q.kind].year === S.year)) {
        F.natCupStart(Q.kind);
        const W = S.ncups[Q.kind];
        if (W.qual) insertBeforeEnd({ type: 'natInfo', mode: 'cupStart', kind: Q.kind });
        const step = F.natCupRun(Q.kind);
        if (step) insertBeforeEnd(step);
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
      if (fix.kind === 'q') {
        const Q = S.natq;
        const i = Q ? Q.pending.findIndex((p) => p.h === fix.h && p.a === fix.a && p.r === fix.r) : -1;
        if (i >= 0) {
          const gh = fix.home ? m.gfTotal : m.gaTotal, ga = fix.home ? m.gaTotal : m.gfTotal;
          F.addResult(Q.table, fix.h, fix.a, gh, ga);
          Q.results.push({ r: fix.r, h: fix.h, a: fix.a, gh, ga, me: true });
          Q.pending.splice(i, 1);
        }
        F.fx({ enerji: 8 }); // iki maç arası toparlanma
        return r;
      }
      const club = D.clubCups.includes(fix.kind);
      const C = club ? (F.clubCups() || {})[fix.kind] : (S.ncups || {})[fix.kind];
      if (!C || !sameFix(C.pending, fix.f)) return r;
      const f = fix.f;
      C.pending = null;
      const strOf = club ? tStr : F.natStr;
      const mine = club ? (f.h === fix.opp ? f.a : f.h) : C.nation;
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
      const st = stagesOf(C);
      if (f.ko && C.kow[f.ko][f.j] === mine && f.ko !== 'final') m.feed.push({ minute: 121, side: 'me', kind: 'whistle', t: F.STAGE_NAME[st[st.indexOf(f.ko) + 1]] + ' biletini aldık!' });
      if (!club) {
        F.fx({ enerji: 14 }); // turnuvada maç arası toparlanma
        const next = F.natCupRun(fix.kind);
        if (next) insertBeforeEnd(next);
      }
    } catch (e) { if (F.DEBUG) throw e; }
    return r;
  };

  // 1.21 kayıtları: tek kulüp kupası (S.cl) ve tek eleme (S.wcq) vardı
  const origMig = F.migrate;
  F.migrate = function (S) {
    const out = origMig.apply(this, arguments);
    try {
      if (S.cl && !S.ccups) { S.ccups = { season: S.cl.season, cl: Object.assign(S.cl, { id: 'cl', cal: CAL32 }) }; }
      delete S.cl;
      if (S.wc && !S.ncups) S.ncups = { wc: Object.assign(S.wc, { id: 'wc' }) };
      delete S.wc; delete S.wcq;
    } catch (e) { /* yoksay */ }
    return out;
  };
})(typeof window !== 'undefined' ? window : globalThis);
