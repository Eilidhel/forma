/* FORMA — sistemler: maç, basın, paylaşım, menajer, eylemler, sezon, transfer, nesil, mağaza */
(function (root) {
  const F = root.F;
  const D = F.DATA;

  /* =========================================================
     MAÇ
     ========================================================= */
  const NAT_OPP = ['İtalya', 'Hırvatistan', 'Galler', 'Portekiz', 'Gürcistan', 'İzlanda', 'Macaristan', 'Norveç', 'Polonya', 'Sırbistan', 'İspanya', 'Hollanda', 'Belçika', 'Danimarka', 'Avusturya', 'İsviçre'];

  F.matchStart = function () {
    const S = F.S, P = S.P;
    const step = S.queue[0];
    if (step.m) return step.m;
    const me = F.myTeam();
    let m;
    if (step.nat) {
      const oppName = F.pick(NAT_OPP);
      m = { nat: true, oppName, home: F.chance(0.5), myStr: P.natTeam === 'DE' ? 86 : 78, oppStr: F.ri(72, 88), comp: (P.age <= 21 && F.ovr() < 73 ? 'U21' : 'A') + ' Milli Takım' };
    } else {
      const fx = F.myFixture();
      const opp = F.team(fx.opp);
      m = { nat: false, opp: opp.id, oppName: opp.name, home: fx.home, myStr: me.str, oppStr: opp.str, comp: F.leagueName() };
      m.derby = opp.province === me.province || (opp.big && me.big);
      const rf = S.league.round / F.seasonRounds();
      m.big = m.derby || (rf > 0.75 && (F.myPos() <= 3 || F.myPos() >= S.league.teams.length - 3));
      m.scout = !F.isAbroad() && P.age <= 25 && F.chance(0.12);
    }
    // Kadro kararı: maç haftasının başında verilir (hoca taktiği ancak oynayacaksan anlatır)
    let status = !m.nat && S.preStatus && S.preStatus.t === S.t ? S.preStatus.s : F.rollStatus(m);
    if (P.injury) status = 'sakat';
    else if (P.suspended > 0 && !m.nat) status = 'ceza';
    m.status = status;
    const n = status === 'ilk11' ? 3 + (m.big || m.nat ? 1 : 0) : status === 'yedek' && F.chance(0.65) ? 1 : 0;
    m.moments = F.buildMoments(n, m);
    m.i = 0; m.log = []; m.gf = 0; m.ga = 0; m.rating = status === 'ilk11' ? 6.2 : 6.0; m.goals = 0; m.assists = 0; m.yellow = 0; m.red = false;
    m.saves = 0; m.extraGA = 0; m.saved = 0; m.strMod = 0; m.halftime = status === 'ilk11' && S.flags.kaptan && n >= 3;
    m.played = status === 'ilk11' || (status === 'yedek' && n > 0);
    F.buildFeed(m);
    step.m = m;
    step.pre = false;
    return m;
  };

  /* Spiker akışı: maçın senin dışındaki olayları (iki takımın golleri, fırsatlar, kartlar) baştan belirlenir.
     Senin anların bu akışın arasına dakikasıyla girer. */
  F.buildFeed = function (m) {
    const S = F.S, P = S.P;
    const T = D.spiker;
    const myEff = m.myStr + (m.played ? (F.ovr() - m.myStr) * 0.08 : 0);
    const lf = F.clamp(1.25 + (myEff - m.oppStr) / 16 + (m.home ? 0.2 : 0), 0.2, 4);
    const la = F.clamp(1.05 + (m.oppStr - myEff) / 16 + (m.home ? 0 : 0.15), 0.15, 3.6);
    const defRole = P.pos === 'KL' || P.pos === 'DF';
    m.bgGF = F.poisson(lf * (m.played ? 0.75 : 1));
    m.bgGA = F.poisson(la * (m.played ? (defRole ? 0.72 : 0.85) : 1));
    const mates = (S.mates || []).map((x) => x.split(' ')[0]).filter((x) => x && x !== P.name);
    const myTeam = m.nat ? (P.natTeam === 'DE' ? 'Almanya' : 'Türkiye') : F.myTeam().name;
    m.myName = myTeam;
    const opp = () => (F.isAbroad() ? F.foreignName() : F.fullName()).split(' ').slice(-1)[0];
    const fill = (t) => t.replace(/{oyuncu}/g, mates.length ? F.pick(mates) : 'Takım arkadaşın').replace(/{rakipoyuncu}/g, opp()).replace(/{takim}/g, myTeam).replace(/{rakip}/g, m.oppName).replace(/{kaleci}/g, mates[0] || 'kalecimiz');
    const mins = (k) => Array.from({ length: k }, () => F.ri(3, 89));
    const feed = [];
    mins(m.bgGF).forEach((mi) => feed.push({ minute: mi, side: 'me', kind: 'goal', t: fill(F.pick(T.myGoal)) }));
    mins(m.bgGA).forEach((mi) => feed.push({ minute: mi, side: 'op', kind: 'goal', t: fill(F.pick(T.opGoal)) }));
    mins(F.ri(2, 4)).forEach((mi) => feed.push({ minute: mi, side: 'me', kind: 'chance', t: fill(F.pick(T.myChance)) }));
    mins(F.ri(2, 4)).forEach((mi) => feed.push({ minute: mi, side: 'op', kind: 'chance', t: fill(F.pick(T.opChance)) }));
    mins(F.ri(1, 3)).forEach((mi) => feed.push({ minute: mi, side: 'n', kind: 'info', t: fill(F.pick(T.filler.concat(T.card))) }));
    feed.push({ minute: 0, side: 'n', kind: 'whistle', t: fill(F.pick(T.kickoff)).replace('{ev}', m.home ? myTeam : m.oppName).replace('{dep}', m.home ? m.oppName : myTeam) });
    feed.push({ minute: 45, side: 'n', kind: 'half', t: F.pick(T.half), half: true });
    feed.push({ minute: 46, side: 'n', kind: 'whistle', t: F.pick(T.second) });
    feed.push({ minute: 90, side: 'n', kind: 'end', t: F.pick(T.end) });
    feed.sort((a, b) => a.minute - b.minute || (a.kind === 'end' ? 1 : b.kind === 'end' ? -1 : 0));
    m.feed = feed; m.fi = 0;
  };
  // akıştaki ve senin anlarındaki gollerle anlık skor
  F.liveScore = function (m) {
    let gf = 0, ga = 0;
    m.feed.slice(0, m.fi).forEach((f) => { if (f.kind === 'goal') { if (f.side === 'me') gf++; else ga++; } });
    m.log.forEach((l) => { if (l.kind === 'goal' || l.kind === 'assist') gf++; if (l.kind === 'concede') ga++; });
    return { gf, ga };
  };

  F.rollStatus = function (m) {
    const S = F.S, P = S.P;
    let status;
    if (P.injury) status = 'sakat';
    else if (P.suspended > 0 && !m.nat) status = 'ceza';
    else {
      const h = F.npc('hoca');
      const cr = F.curRole();
      const ovr = F.ovrAs(cr);
      let p = m.nat ? 0.7 : 0.5 + (ovr - m.myStr) / 10 - (1 - F.roleFit(cr)) * 0.35 - (!m.nat && !F.inSystem(cr) ? 0.3 : 0) + (h ? h.rel : 0) / 220 + P.life.form / 35;
      if (!m.nat) {
        p += { as: 0.22, rotasyon: 0, yedek: -0.18 }[P.contract.role] || 0;
        if (h && h.type === 'genc' && P.age <= 22) p += 0.12;
        if (h && h.type === 'yildiz') p += (P.life.sohret - 40) / 200;
        if (h && h.type === 'diktator') p += (P.life.disiplin - 55) / 200;
        const rk = F.npc('rakip');
        if (rk && rk.rel < -40) p -= 0.04;
      }
      if (P.life.enerji < 35) p -= 0.2;
      p = F.clamp(p, 0.04, 0.97);
      const r = F.rand();
      status = r < p ? 'ilk11' : r < p + (1 - p) * 0.6 ? 'yedek' : 'kadrodisi';
    }
    return status;
  };

  F.buildMoments = function (n, m) {
    const cr = F.curRole();
    const pos = D.roles[cr].grp;
    const rk = 'r_' + D.roles[cr].tag;
    // penaltı ve serbest vuruş nadir olsun: ağırlıklı seçim, aynı maçta aynı an tekrar etmez
    const pool = D.moments[pos].slice().concat(D.moments[rk] || []);
    const S = F.S;
    const keyOf = (mo) => (D.moments[pos].indexOf(mo) >= 0 ? pos + ':' + D.moments[pos].indexOf(mo) : D.moments[rk] && D.moments[rk].indexOf(mo) >= 0 ? rk + ':' + D.moments[rk].indexOf(mo) : 'derby:' + D.moments.derby.indexOf(mo));
    const wOf = (mo) => {
      if (D.moments[rk] && D.moments[rk].includes(mo)) return 1.6; // mevkine özgü anlar daha sık
      if (/Penaltı/.test(mo.t)) return S.lastPenT != null && S.t - S.lastPenT < 6 ? 0 : 0.18;
      if (/serbest vuruş/i.test(mo.t)) return 0.45;
      return 1;
    };
    const out = [];
    for (let i = 0; i < n; i++) {
      const cands = pool.filter((mo) => !out.includes(mo));
      const mo = F.wpick(cands.length ? cands : pool, wOf) || F.pick(pool);
      if (/Penaltı/.test(mo.t)) S.lastPenT = S.t;
      out.push(mo);
    }
    // Atak kurma: forvet ve orta sahada anların yaklaşık yarısı, defansta dörtte biri zincir olur
    const chainP = { FV: 0.5, OS: 0.55, DF: 0.25, KL: 0 }[pos] || 0;
    const tag = D.roles[cr].tag;
    const startStage = ['stoper', 'bek', 'dos', 'mo'].includes(tag) ? 'build' : tag === 'sf' ? 'mid' : F.chance(0.5) ? 'build' : 'mid';
    for (let i = 0; i < out.length; i++) if (!/Penaltı/.test(out[i].t) && F.chance(chainP)) out[i] = { chain: startStage };
    const derbyPool = D.moments.derby.filter((d) => !d.pos || d.pos.includes(pos));
    if (m.derby && n && derbyPool.length) out[out.length - 1] = F.pick(derbyPool);
    const chainRef = (st) => 'chain:' + st + ':' + F.ri(0, D.attackStages[st].length - 1);
    return out.map((mo, i) => ({ ref: mo.chain ? chainRef(mo.chain) : keyOf(mo), chain: !!mo.chain, rec: 0, minute: m.status === 'yedek' ? F.ri(64, 89) : Math.min(90, Math.round(((i + 1) / (n + 1)) * 90 + F.ri(-6, 6))) }));
  };
  F.momentDef = function (ref) {
    const parts = ref.split(':');
    if (parts[0] === 'chain') return D.attackStages[parts[1]][+parts[2]];
    const [k, i] = parts;
    return D.moments[k][+i];
  };
  F.momentProb = function (opt, m) {
    const P = F.S.P;
    const isAttr = opt.a in P.attrs;
    // birleşik yetenek: ana yetenek %65, ikinci yetenek %35 (ör. uzaktan şut + şut gücü)
    const stat = isAttr ? (opt.a2 && P.attrs[opt.a2] != null ? P.attrs[opt.a] * 0.65 + P.attrs[opt.a2] * 0.35 : P.attrs[opt.a]) : P.soft[opt.a] != null ? P.soft[opt.a] : 50;
    // saha özelliklerinde zorluk ligin seviyesine göre ölçeklenir (BAL'da 45 şut iyi, Süper Lig'de vasat)
    const lvl = (m.myStr + m.oppStr) / 2;
    const effD = isAttr ? lvl + (opt.d - 50) * 0.8 - 4 : opt.d;
    const diff = (m.oppStr - (m.myStr + m.strMod)) * 0.5;
    const S = F.S;
    const tac = (S.tactic && S.tactic.t === S.t ? S.tactic.b[opt.a] || 0 : 0) - (1 - F.roleFit(F.curRole())) * 0.25;
    return F.clamp(0.5 + tac + (stat - effD - diff) / 32 + P.life.form / 40 + (P.life.enerji - 60) / 220 + (P.life.moral - 50) / 400, 0.07, 0.93);
  };

  // forced: beceri oyunundan gelen sonuç (true/false); verilmezse zar atılır
  F.matchChoose = function (i, forced, note) {
    const S = F.S;
    const m = S.queue[0].m;
    const mo = m.moments[m.i];
    const def = F.momentDef(mo.ref);
    const opt = def.o[i];
    const p = F.momentProb(opt, m);
    const ok = forced != null ? !!forced : F.rand() < p;
    const out = ok ? opt.win : opt.lose;
    // atak zinciri: ilerle, aşama atla ya da aynı aşamada yeniden kur. Maç anı bitmez, yeni durum gelir.
    if (['adv', 'adv2', 'recycle'].includes(out)) {
      const cur = mo.ref.split(':')[1];
      const ord = D.attackOrder;
      let ni = ord.indexOf(cur) + (out === 'adv' ? 1 : out === 'adv2' ? 2 : 0);
      if (out === 'recycle') mo.rec = (mo.rec || 0) + 1;
      ni = Math.min(ni, ord.length - 1);
      const txtA = F.tpl(opt.winT);
      m.log.push({ minute: mo.minute, t: txtA, ok: true, kind: 'pass' });
      m.rating += out === 'adv2' ? 0.15 : out === 'adv' ? 0.08 : 0.02;
      if (out === 'recycle' && mo.rec > 2) { // sonsuz paslaşma yok: atak söner
        m.log.push({ minute: mo.minute, t: 'Atak yavaşladı, rakip yerleşti. Top geri döndü.', ok: false, kind: 'keep' });
        m.i++;
        return { minute: mo.minute, t: txtA, ok: true, kind: 'keep' };
      }
      const st = ord[ni];
      let idx = F.ri(0, D.attackStages[st].length - 1);
      if (st === cur && D.attackStages[st].length > 1 && mo.ref === 'chain:' + st + ':' + idx) idx = (idx + 1) % D.attackStages[st].length;
      mo.ref = 'chain:' + st + ':' + idx;
      return { minute: mo.minute, t: txtA, ok: true, kind: 'pass', chain: true };
    }
    // beceri oyunundan gelen anlatım varsa, kazanınca sonucun devamını da ekle (ör. asistin golle bitmesi)
    const txt = note ? (ok && opt.win === 'assist' ? note + ' ' + F.tpl(opt.winT) : note) : F.tpl(ok ? opt.winT : opt.loseT);
    const res = { minute: mo.minute, t: txt, ok, kind: out };
    const R = { goal: 1.25, assist: 0.9, save: 0.85, block: 0.65, chance: 0.35, keep: 0.25, miss: -0.3, lost: -0.25, concede: -0.7, yellow: -0.25, red: -1.6, foul: -0.15 };
    m.rating += R[out] || 0;
    if (out === 'goal') { m.goals++; m.gf++; }
    if (out === 'assist') { m.assists++; m.gf++; }
    if (out === 'save' || out === 'block') m.saved++;
    if (out === 'concede') m.extraGA++;
    if (out === 'yellow') { m.yellow++; if (m.yellow >= 2) { m.red = true; res.t += ' İkinci sarı: kırmızı kart!'; } }
    if (out === 'red') m.red = true;
    if (opt.risk && !m.red && F.chance(opt.risk)) { m.yellow++; res.t += ' Hakem sarı kartını çıkardı.'; m.rating -= 0.2; if (m.yellow >= 2) { m.red = true; res.t += ' İkinci sarı: oyundan atıldın!'; } }
    m.log.push(res);
    m.i++;
    if (m.red) {
      m.i = m.moments.length;
      if (F.chance(0.5) && m.feed) { m.bgGA++; m.feed.splice(m.feed.length - 1, 0, { minute: Math.min(89, mo.minute + F.ri(3, 15)), side: 'op', kind: 'goal', t: 'On kişi kalan takımın savunması dağıldı, rakip golü buldu.' }); const end = m.feed.pop(); m.feed.sort((a, b) => a.minute - b.minute); m.feed.push(end); }
    }
    return res;
  };

  // Canlı an (beceri modu) sonucu: seçenek yerine doğrudan sonuç türü yazılır
  F.matchResult = function (kind, ok, text) {
    const S = F.S;
    const m = S.queue[0].m;
    const mo = m.moments[m.i];
    if (!mo) return null;
    const R = { goal: 1.25, assist: 0.9, save: 0.85, block: 0.65, chance: 0.35, keep: 0.25, miss: -0.3, shotsaved: -0.05, lost: -0.25, concede: -0.7, yellow: -0.25, penfoul: -0.8, red: -1.6, foul: -0.15 };
    m.rating += R[kind] || 0;
    if (kind === 'goal') { m.goals++; m.gf++; }
    if (kind === 'assist') { m.assists++; m.gf++; }
    if (kind === 'save' || kind === 'block') m.saved++;
    if (kind === 'concede') m.extraGA++;
    if (kind === 'penfoul') { m.yellow++; if (F.chance(0.75)) { m.extraGA++; text += ' Penaltı gole döndü.'; } else text += ' Penaltı kaçtı, şanslıyız!'; }
    if (kind === 'yellow' && ++m.yellow >= 2) { m.red = true; text += ' İkinci sarı: kırmızı kart!'; }
    if (kind === 'penfoul' && m.yellow >= 2) { m.red = true; text += ' İkinci sarı: kırmızı kart!'; }
    if (kind === 'red') m.red = true;
    const res = { minute: mo.minute, t: text, ok: !!ok, kind };
    m.log.push(res);
    m.i++;
    if (m.red) m.i = m.moments.length;
    return res;
  };

  F.halftimeSpeech = function (tone) {
    const S = F.S;
    const m = S.queue[0].m;
    m.halftime = false;
    const fx = { sakin: { mental: 1, 'r.takim': 2 }, atesli: { 'r.takim': 1, 's.liderlik': 1 }, sert: { 'r.takim': -3, 's.liderlik': 1 } }[tone];
    m.strMod += { sakin: 1, atesli: F.chance(0.6) ? 3 : -1, sert: F.chance(0.5) ? 4 : -2 }[tone];
    m.speech = tone;
    return F.fx(fx);
  };

  F.matchFinish = function () {
    const S = F.S, P = S.P;
    const step = S.queue[0];
    const m = step.m;
    if (m.done) return m;
    if (!m.feed) F.buildFeed(m);
    m.fi = m.feed.length;
    // kaptan konuşması (strMod) ikinci yarıya etki eder
    if (m.strMod > 0 && F.chance(m.strMod / 10)) { m.bgGF++; m.feed.splice(m.feed.length - 1, 0, { minute: F.ri(70, 88), side: 'me', kind: 'goal', t: 'Devre arası konuşma işe yaradı, takım golü buldu!' }); }
    const gf = m.bgGF + m.gf;
    const ga = m.bgGA + m.extraGA;
    m.gfTotal = gf; m.gaTotal = ga;
    const res = gf > ga ? 'win' : gf < ga ? 'loss' : 'draw';
    m.res = res;
    if (m.played) {
      m.rating += res === 'win' ? 0.3 : res === 'loss' ? -0.3 : 0;
      if ((P.pos === 'KL' || P.pos === 'DF') && ga === 0) m.rating += 0.5;
      if ((P.pos === 'KL' || P.pos === 'DF') && ga >= 3) m.rating -= 0.5;
      m.rating = F.clamp(Math.round((m.rating + F.rf(-0.35, 0.35)) * 10) / 10, 3, 10);
    } else m.rating = null;

    // Lig tablosu
    if (!m.nat) {
      const L = S.league;
      const fx = F.myFixture();
      const rd = L.fixtures[L.round];
      rd.forEach(([h, a]) => {
        if (fx && fx.pair[0] === h && fx.pair[1] === a) {
          const gh = fx.home ? gf : ga, gaa = fx.home ? ga : gf;
          F.addResult(L.table, h, a, gh, gaa);
          L.results.push({ r: L.round, h, a, gh, ga: gaa });
        } else {
          const [x, y] = F.simScore(h, a);
          F.addResult(L.table, h, a, x, y);
        }
      });
      L.round++;
    }

    // İstatistik ve etkiler
    const st = S.st;
    const deltas = [];
    if (m.played) {
      st.apps++; P.career.apps++;
      st.goals += m.goals; st.assists += m.assists; P.career.goals += m.goals; P.career.assists += m.assists;
      st.ratingSum += m.rating;
      // hedefler için ek sezon istatistikleri
      if (res === 'win') st.wins = (st.wins || 0) + 1;
      if (m.rating >= 8) st.motm = (st.motm || 0) + 1;
      if (m.derby && m.goals) st.derbyGoals = (st.derbyGoals || 0) + m.goals;
      if (m.goals >= 2) st.braces = (st.braces || 0) + 1;
      st.yellows = (st.yellows || 0) + (m.yellow || 0);
      if (ga === 0 && (P.pos === 'KL' || P.pos === 'DF')) { st.clean++; P.career.clean++; }
      if (m.red) { st.reds++; P.career.reds++; P.suspended = F.ri(1, 2) + 1; }
      if (m.nat) { P.caps++; P.career.caps++; st.caps++; }
      const formD = (m.rating - 6.6) * 1.6;
      deltas.push(...F.fx({ form: formD, moral: (m.rating - 6.5) * 3 + (res === 'win' ? 3 : res === 'loss' ? -3 : 0), enerji: -18, 'r.taraftar': (m.rating - 6.5) * 2 + m.goals * 2, sohret: m.goals * 0.8 + (m.rating >= 8 ? 1 : 0) + (m.nat ? 1 : 0), 'takipci%': m.goals * 1 + (m.rating >= 8 ? 1 : 0) + (m.nat ? 3 : 0) }));
      F.matchXp(m);
      // sözleşme primleri: maç başı, gol ve asist başı
      const B = P.contract.bonus;
      if (B && !m.nat) {
        const pay = (B.app || 0) + (B.goal || 0) * m.goals + (B.assist || 0) * m.assists;
        if (pay > 0) { P.money += pay; F.bankLog('Sözleşme primi (maç' + (m.goals ? ', gol' : '') + (m.assists ? ', asist' : '') + ')', pay); m.bonusPay = pay; deltas.push({ k: 'para', label: 'Sözleşme primi', v: pay, money: true }); }
      }
      if (!m.nat) {
        const cr = F.curRole();
        P.roleExp = P.roleExp || {};
        const before = F.roleFit(cr);
        P.roleExp[cr] = Math.min(100, (P.roleExp[cr] || 0) + 5);
        if (cr !== P.role && before < 0.9 && F.roleFit(cr) >= 0.9) F.addDM(F.npc('hoca') ? F.npc('hoca').name : 'Hoca', 'Artık ' + D.roles[cr].name.toLowerCase() + ' olarak da rahatsın. Güzel iş çıkardın.');
      }
      if (P.career.goals === m.goals && m.goals > 0) F.addAlbum('Kariyerinin ilk golü: ' + m.oppName + ' karşısında, ' + m.log.find((x) => x.kind === 'goal').minute + '. dakika.', 'goal');
      if (m.goals >= 3) { F.addAlbum('Hat-trick! ' + m.oppName + ' ağlarına üç gol.', 'goal'); S.flags.hattrick = 1; }
      if (m.nat && P.caps === 1) F.addAlbum(m.comp + ' formasıyla ilk maç: ' + m.oppName + '.', 'milli');
      if (m.scout && m.rating >= 7.5) { S.scoutBonus = (S.scoutBonus || 0) + 1; F.addDM('{menajer}', 'Tribündeki scout notunu yüksek vermiş. Yaz dönemi telefonlar çalabilir.'); }
      const injP = (0.018 + Math.max(0, 50 - P.life.enerji) / 900) * F.injMul();
      if (F.chance(injP)) F.injure(F.ri(1, 8), 'maç');
      // rakip
      if (m.rating >= 7.5) F.relAdd('rakip', -2);
    } else {
      deltas.push(...F.fx({ moral: m.status === 'kadrodisi' ? -5 : m.status === 'yedek' ? -2 : 0, form: -0.5, 'r.hoca': m.status === 'kadrodisi' ? -1 : 0 }));
    }
    m.deltas = deltas;
    m.done = true;
    if (S.wk) S.wk.match = { opp: m.oppName, gf, ga, rating: m.rating, goals: m.goals, assists: m.assists, status: m.status, nat: m.nat };
    // maç sonu olayları için son maçın özeti ve o maçın rakip oyuncusu
    S.lastMatch = { res, played: m.played, status: m.status, goals: m.goals, rating: m.rating, gf, ga, opp: m.oppName, oppId: m.opp || null, derby: !!m.derby, big: !!m.big, nat: m.nat, red: m.red };
    S.oppPlayer = (F.isAbroad() || m.nat) && F.chance(0.6) ? F.foreignName() : F.fullName();

    F.matchFeed(m);
    F.checkTasks('match', m);
    F.checkChallenge(m);
    // Basın, maç sonu olayı, paylaşım
    const after = [];
    if (m.played || m.status === 'kadrodisi') {
      const pressP = m.nat || m.big ? 0.75 : P.life.sohret > 30 ? 0.45 : 0.22;
      if (F.chance(pressP)) {
        const ctx = m.status === 'kadrodisi' || m.status === 'yedek' ? 'bench' : m.goals ? 'goal' : res;
        const qs = F.pickPress(ctx, 2);
        if (qs.length) after.push({ type: 'press', qs, i: 0, log: [] });
      }
    }
    // maç sonu olayı: rakip laf atar, tünelde atışma, rakip hoca konuşur…
    if (F.chance(m.derby || m.big ? 0.75 : 0.5)) {
      const pool = D.events.filter((e) => e.post && F.canFire(e, true));
      const ev = F.wpick(pool, (e) => e.w || 10);
      if (ev) after.push(F.makeEventStep(ev.id));
    }
    // paylaşım ekranı her maçta değil: yalnızca öne çıkan maçlarda ve ara sıra
    const notable = m.played && (m.goals > 0 || m.rating >= 7.6 || m.rating <= 5.4 || m.derby || m.nat || m.red);
    if (notable && (S.postAskT == null || S.t - S.postAskT >= 4) && F.chance(0.45)) { after.push({ type: 'post', afterMatch: true }); S.postAskT = S.t; }
    S.queue.splice(1, 0, ...after);
    return m;
  };

  F.matchXp = function (m) {
    const P = F.S.P;
    const w = F.posW(P);
    // maçta oynamak da XP verir: iyi oyun daha çok
    const base = (12 + Math.max(0, (m.rating || 6) - 5.5) * 12) * F.ageXp() * (m.nat ? 1.5 : 1);
    Object.keys(w).forEach((k) => F.addXp(k, Math.round(base * w[k] * 3)));
  };

  F.matchFeed = function (m) {
    const S = F.S;
    const T = D.social;
    if (!m.played) {
      if (m.status === 'kadrodisi' && F.chance(0.5)) F.addFeed({ t: F.tpl(F.pick(T.bench)), kind: 'fan' });
      return;
    }
    const band = m.rating >= 8 ? 'great' : m.rating >= 6.8 ? 'good' : m.rating >= 5.8 ? 'meh' : 'bad';
    const pool = T.afterMatch[band];
    const n = 1 + (S.P.followers > 20000 ? 1 : 0);
    const gm = m.log.find((x) => x.kind === 'goal');
    const fill = (s) => F.tpl(s.replace(/\{opp\}/g, m.oppName).replace(/\{skor\}/g, m.gfTotal + '-' + m.gaTotal).replace(/\{dk\}/g, gm ? gm.minute : ''));
    for (let i = 0; i < n; i++) F.addFeed({ t: fill(F.pick(pool)), kind: band === 'bad' ? 'hate' : 'fan' });
    if (m.goals) F.addFeed({ who: m.nat ? 'Milli Takım' : F.myTeam().name, t: fill(F.pick(T.clubGoal)), kind: 'club' });
    if (m.rating >= 8.5 && F.chance(0.5)) F.addFeed({ who: 'Futbol Sayfası', t: fill(F.pick(T.viral)), kind: 'viral', likes: Math.round(S.P.followers * F.rf(0.2, 0.6) + 5000) });
  };

  /* =========================================================
     BASIN
     ========================================================= */
  F.pickPress = function (ctx, n) {
    const S = F.S;
    const pool = D.press.filter((q) => (q.ctx.includes(ctx) || q.ctx.includes('any')) && F.cond(q.if) && (S.seen['pq_' + q.id] == null || S.t - S.seen['pq_' + q.id] > 12));
    const out = [];
    F.shuffle(pool).sort((a, b) => (b.ctx.includes(ctx) ? 1 : 0) - (a.ctx.includes(ctx) ? 1 : 0)).slice(0, n).forEach((q) => { S.seen['pq_' + q.id] = S.t; out.push(q.id); });
    return out;
  };
  F.pressQ = (id) => D.press.find((q) => q.id === id);
  // i = -1: süre doldu, sessiz kaldın
  F.pressAnswer = function (i) {
    const S = F.S;
    const step = S.queue[0];
    const q = F.pressQ(step.qs[step.i]);
    let fx, t, r;
    if (i < 0) { fx = { 'r.medya': -3, 's.sogukkanlilik': -0.5 }; t = '…'; r = 'Gazeteciler sessizliğini not etti. "Cevap veremedi" manşeti yolda.'; }
    else {
      const o = q.o[i];
      fx = Object.assign({}, o.fx);
      t = o.t; r = o.r;
      if (o.tone === 'sert' || o.tone === 'iddiali') { if (F.chance(0.2)) { F.addFeed({ who: 'Futbol Sayfası', t: '"' + F.tpl(o.t) + '" — ' + F.tpl('{adsoyad}') + ' basın toplantısında ortalığı karıştırdı.', kind: 'viral', likes: Math.round(S.P.followers * 0.3 + 3000) }); fx['takipci%'] = (fx['takipci%'] || 0) + 3; } }
      if (o.chk) { const ok = F.rand() < F.chkProb(o.chk); Object.assign(fx, ok ? o.ok && o.ok.fx : o.no && o.no.fx); r = (ok ? o.ok && o.ok.r : o.no && o.no.r) || r; }
    }
    const deltas = F.fx(fx);
    if (S.wk) S.wk.deltas.push(...deltas);
    step.log.push({ q: F.tpl(q.q), a: F.tpl(t), r: F.tpl(r || ''), deltas });
    step.i++;
    if (step.i >= step.qs.length) step.done = true;
    return { deltas, r: F.tpl(r || '') };
  };

  /* =========================================================
     PAYLAŞIM (oyuncunun kendi gönderisi)
     ========================================================= */
  F.postPhotos = function () {
    const S = F.S, P = S.P;
    const list = [{ id: 'mac', name: 'Maç fotoğrafı' }, { id: 'antrenman', name: 'Antrenmandan' }];
    if (S.npcs[S.roles.anne]) list.push({ id: 'aile', name: 'Ailenle' });
    if (S.partner && S.partner.stage >= 2) list.push({ id: 'partner', name: 'Partnerinle' });
    const car = F.bestCar();
    if (car && car.lux >= 2) list.push({ id: 'araba', name: car.name + ' ile' });
    const h = F.bestHouse();
    if (h && h.house >= 2) list.push({ id: 'ev', name: 'Evinden' });
    list.push({ id: 'memleket', name: 'Memleket özlemi' });
    return list;
  };
  D.postTones = [
    { id: 'mutevazi', name: 'Mütevazı', ex: 'Takımımla gurur duyuyorum. Daha çok çalışacağız.' },
    { id: 'iddiali', name: 'İddialı', ex: 'Bu daha başlangıç. Herkes adımı ezberlesin.' },
    { id: 'duygusal', name: 'Duygusal', ex: 'Bu formayı giymek çocukluk hayalimdi.' },
    { id: 'sponsorlu', name: 'Sponsorlu', ex: 'Yeni kramponlarım ayağımda! #işbirliği' },
    { id: 'provokatif', name: 'Provokatif', ex: 'Konuşan konuşsun, skor tabelası ortada.' },
    { id: 'sessiz', name: 'Paylaşma', ex: 'Telefonu bırak, dinlen.' }
  ];
  F.makePost = function (photo, tone) {
    const S = F.S, P = S.P;
    if (tone === 'sessiz') return { deltas: F.fx({ mental: 1 }), r: 'Bu hafta sessiz kaldın. Bazen en iyisi budur.' };
    const fx = {
      mutevazi: { 'takipci%': 1, 'r.taraftar': 2, 'r.takim': 1, 't.mutevazi': 0.5 },
      iddiali: { 'takipci%': 3, sohret: 1, 'r.rakip': -3, 'r.hoca': -1, 't.hirsli': 0.5 },
      duygusal: { 'takipci%': 2, moral: 2 },
      sponsorlu: { para: Math.round(Math.min(P.followers, 2e6) * F.rf(0.15, 0.35)), 'r.taraftar': -1, 't.paragoz': 0.5 },
      provokatif: { 'takipci%': 6, sohret: 2, 'r.medya': -4, 'r.hoca': -3, 't.sovmen': 0.6, seed: [{ id: 'eski_paylasim', in: [20, 90], p: 0.35 }] }
    }[tone];
    if (tone === 'sponsorlu' && (P.followers < 40000 || P.life.sohret < 35)) return { err: 'Markalar henüz seninle çalışmak istemiyor. Önce tanınman lazım (40 B takipçi ve şöhret 35).' };
    let r = '';
    if (photo === 'aile') { fx['r.aile'] = (fx['r.aile'] || 0) + 3; r = 'Annen paylaşımı kırk kişiye gönderdi.'; }
    if (photo === 'partner') { fx['r.partner'] = (fx['r.partner'] || 0) + 4; fx['takipci%'] = (fx['takipci%'] || 0) + 2; r = 'Magazin sayfaları fotoğrafı hemen kaptı.'; }
    if (photo === 'memleket') { fx['r.memleket'] = 4; r = F.tpl('{memleket} yerel sayfası paylaşımını yeniden paylaştı.'); }
    if ((photo === 'araba' || photo === 'ev') && P.life.form < 0) { fx['r.taraftar'] = (fx['r.taraftar'] || 0) - 5; fx['t.gosteris'] = 0.5; r = 'Takım kötü giderken lüks paylaşımı taraftarı kızdırdı.'; }
    else if (photo === 'araba' || photo === 'ev') { fx['takipci%'] = (fx['takipci%'] || 0) + 3; fx['t.gosteris'] = 0.5; r = 'Yorumlar "kral" ve "şımarık" arasında ikiye bölündü.'; }
    if (tone === 'iddiali' && P.life.form < -2) { fx['r.taraftar'] = (fx['r.taraftar'] || 0) - 4; r = 'Kötü formdayken gelen iddialı paylaşım alay konusu oldu.'; }
    if (tone === 'provokatif') r = r || 'Paylaşım yayıldı. Spor programları akşam bunu konuşacak.';
    if (tone === 'sponsorlu') r = 'Sponsor memnun, bazı taraftarlar değil.';
    const p = S.partner && S.partner.stage > 0 ? F.npc('partner') : null;
    if (p && tone === 'provokatif' && p.kiskanc > 60) fx['r.partner'] = (fx['r.partner'] || 0) - 3;
    const deltas = F.fx(fx);
    if (S.wk) S.wk.deltas.push(...deltas);
    const tn = D.postTones.find((x) => x.id === tone);
    const text = F.tpl(F.pick(D.social.myPost[tone]));
    const comments = [];
    for (let i = 0; i < 2; i++) comments.push({ who: F.handle(), t: F.tpl(F.pick(D.social.comments[tone])) });
    F.addFeed({ who: F.tpl('{adsoyad}'), t: text, me: true, kind: 'me', img: photo, comments, likes: Math.round(P.followers * F.rf(0.04, 0.12) * (tone === 'provokatif' ? 2 : 1)) });
    S.postedWeek = S.t;
    return { deltas, r: r || 'Paylaşımın yayında: ' + tn.name.toLowerCase() + ' bir dille.' };
  };

  /* =========================================================
     HAFTALIK AKIŞ İÇERİĞİ
     ========================================================= */
  F.genWeeklyFeed = function () {
    const S = F.S, P = S.P;
    const T = D.social;
    const n = F.ri(1, 2) + (P.followers > 50000 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const r = F.rand();
      if (r < 0.3) F.addFeed({ t: F.tpl(F.pick(T.fan)), kind: 'fan' });
      else if (r < 0.45 && F.ovr() >= F.myTeam().str) F.addFeed({ who: F.pick(['Transfer Kulisi', 'Tribün Dedikodu', 'Futbol Ajansı']), t: F.tpl(F.pick(T.rumor)), kind: 'rumor' });
      else if (r < 0.6) F.addFeed({ who: F.tpl('{gazeteciTam}'), t: F.tpl(F.pick(T.journalist)), kind: 'news' });
      else if (r < 0.7 && S.partner && S.partner.stage >= 2) F.addFeed({ who: F.tpl('{partnerTam}'), t: F.tpl(F.pick(T.partner)), kind: 'partner' });
      else if (r < 0.78) F.addFeed({ who: F.tpl('{anneTam}'), t: F.tpl(F.pick(T.family)), kind: 'family' });
      else if (r < 0.86 && F.luxLevel() >= 3) F.addFeed({ t: F.tpl(F.pick(T.lux)), kind: F.chance(0.5) ? 'hate' : 'fan' });
      else if (r < 0.93) F.addFeed({ who: F.tpl('{memleket} Haber'), t: F.tpl(F.pick(T.hometown)), kind: 'news' });
      else F.addFeed({ who: F.myTeam().name, t: F.tpl(F.pick(T.club)), kind: 'club' });
    }
  };

  /* =========================================================
     MENAJER
     ========================================================= */
  D.agentTiers = {
    1: { name: 'Akraba / mahalle', bag: [5, 20], paz: [10, 30], kom: 5 },
    2: { name: 'Yerel menajer', bag: [20, 45], paz: [25, 50], kom: 8 },
    3: { name: 'Bölgesel ajans', bag: [45, 70], paz: [40, 65], kom: 10 },
    4: { name: 'Uluslararası ajans', bag: [70, 95], paz: [60, 90], kom: 12 }
  };
  F.hireAgent = function (tier, name, extra) {
    const S = F.S;
    const T = D.agentTiers[tier];
    const old = F.npc('menajer');
    if (old) old.role = 'eski_menajer';
    const n = F.addNpc('menajer', { name: name || F.fullName(), type: 'menajer', rel: 15, age: F.ri(28, 60) });
    S.agent = Object.assign({ tier, name: n.name, baglanti: F.ri(T.bag[0], T.bag[1]), pazarlik: F.ri(T.paz[0], T.paz[1]), durust: F.ri(20, 95), komisyon: T.kom, since: S.t }, extra || {});
    S.tasks = [];
    return S.agent;
  };
  F.fireAgent = function () {
    const S = F.S;
    if (!S.agent) return;
    const n = F.npc('menajer');
    if (n) { n.role = 'eski_menajer'; delete S.roles.menajer; }
    S.agent = null; S.tasks = [];
    delete S.flags.menajer_gizli;
    if (n && n.rel < 0 && F.chance(0.5)) S.seeds.push({ id: 'eski_menajer_intikam', at: S.t + F.ri(3, 10), p: 1 });
  };
  F.setupAgentForOrigin = function (og) {
    const S = F.S;
    const fam = S.P.surname;
    const map = {
      koy: [1, F.maleName() + ' ' + fam, { durust: 80, rel: 40, label: 'Amcan' }],
      akademi: [3, null, { durust: F.ri(25, 50) }],
      gurbetci: [2, F.maleName() + ' ' + F.surname(), {}],
      mahalle: [1, F.maleName() + ' ' + F.surname(), { durust: F.ri(20, 45), label: 'Mahallenin abisi' }],
      miras: [2, F.maleName() + ' ' + F.surname(), { durust: 70, label: 'Babanın eski dostu' }],
      gec: [1, F.maleName() + ' ' + fam, { durust: 85, label: 'Kuzenin' }],
      balikci: [1, F.maleName() + ' ' + fam, { durust: 75, label: 'Dayın' }],
      sakat: [2, F.maleName() + ' ' + F.surname(), {}],
      universite: [1, F.maleName() + ' ' + F.surname(), { durust: 70, label: 'Hocanın tanıdığı' }],
      futsal: [1, F.maleName() + ' ' + F.surname(), { durust: 55, label: 'Futsal takımının menajeri' }],
      avrupa_akademi: [2, F.maleName() + ' ' + F.surname(), { durust: 60, label: 'Akademideki temsilcin' }],
      deneme: [1, F.maleName() + ' ' + F.surname(), { durust: F.ri(25, 60), label: 'Seçmelerde tanıştığın menajer' }],
      kaleci_mahallesi: [1, F.maleName() + ' ' + fam, { durust: 80, label: 'Sanayideki usta' }]
    };
    const [tier, name, extra] = map[og.id] || [1, F.maleName() + ' ' + F.surname(), {}];
    F.hireAgent(tier, name, extra);
    if (extra.rel) F.npc('menajer').rel = extra.rel;
  };

  F.agentWeekly = function () {
    const S = F.S;
    if (!S.agent) {
      if (F.chance(0.06) && F.ovr() >= 45) S.seeds.push({ id: 'menajer_teklif', at: S.t + 1, p: 1 });
      return;
    }
    // Tavsiye
    const tips = D.agentTips.filter((t) => F.cond(t.if));
    const tip = F.wpick(tips, (t) => t.w || 10);
    if (tip) { S.tips.unshift({ t: F.tpl(tip.t), week: S.t }); if (S.tips.length > 10) S.tips.length = 10; }
    // Görev
    if (S.tasks.filter((t) => !t.done).length < 2 && S.t % 3 === 0) {
      const defs = D.agentTasks.filter((t) => F.cond(t.if) && !S.tasks.some((x) => x.id === t.id && !x.done));
      const d = F.pick(defs);
      if (d) {
        const task = { id: d.id, desc: F.tpl(d.desc), until: S.t + d.weeks, start: S.t, prog: 0, need: d.need, done: false, ok: false, base: d.base ? d.base() : 0 };
        S.tasks.unshift(task);
        F.addDM('{menajerTam}', 'Yeni görev: ' + task.desc);
      }
    }
    if (S.tasks.length > 8) S.tasks.length = 8;
    if (S.agent.durust < 35 && !S.flags.menajer_gizli && F.chance(0.03)) { S.flags.menajer_gizli = 1; S.seeds.push({ id: 'menajer_ihanet', at: S.t + F.ri(8, 25), p: 1 }); }
  };

  D.agentTasks = [
    { id: 'not7', desc: 'Sonraki maçta 7.0 ve üstü not al.', weeks: 2, need: 1, kind: 'match', test: (m) => m.played && m.rating >= 7 },
    { id: 'gol2', desc: 'Önümüzdeki 3 haftada 2 gol at.', weeks: 3, need: 2, kind: 'match', if: { pos: ['FV', 'OS'] }, test: (m) => m.goals, count: true },
    { id: 'clean1', desc: 'Önümüzdeki 3 haftada en az 1 maçta gol yeme.', weeks: 3, need: 1, kind: 'match', if: { pos: ['KL', 'DF'] }, test: (m) => m.played && m.gaTotal === 0 },
    { id: 'ilk11', desc: 'Önümüzdeki 4 haftada 3 maça ilk 11 başla.', weeks: 4, need: 3, kind: 'match', test: (m) => m.status === 'ilk11' },
    { id: 'enerji', desc: 'Sonraki maça %70+ enerjiyle çık. (Dinlen!)', weeks: 2, need: 1, kind: 'match', test: (m) => m.played && F.S.P.life.enerji + 18 >= 70 },
    { id: 'sessiz', desc: '3 hafta boyunca gece kulübüne gitme, provokatif paylaşım yapma.', weeks: 3, need: 3, kind: 'week', test: () => !(F.S.wk && F.S.wk.acts.includes('gece')) },
    { id: 'hoca', desc: 'Hocayla ilişkini 30\'un üstüne çıkar.', weeks: 5, need: 1, kind: 'week', if: { rel: { hoca: ['<', 25] } }, test: () => F.relGet('hoca') >= 30 },
    { id: 'takipci', desc: 'Takipçini %15 artır (sponsor bulacağım).', weeks: 6, need: 1, kind: 'week', base: () => F.S.P.followers, testBase: (b) => F.S.P.followers >= b * 1.15 },
    { id: 'medya', desc: 'Medya ilişkini 20\'nin üstüne çıkar.', weeks: 5, need: 1, kind: 'week', if: { rel: { medya: ['<', 15] } }, test: () => F.S.rel.medya >= 20 }
  ];

  F.checkTasks = function (kind, m) {
    const S = F.S;
    S.tasks.forEach((t) => {
      if (t.done) return;
      const d = D.agentTasks.find((x) => x.id === t.id);
      if (!d) { t.done = true; return; }
      if (d.kind === kind) {
        let inc = 0;
        if (d.testBase) inc = d.testBase(t.base) ? 1 : 0;
        else { const v = d.test(m); inc = d.count ? v || 0 : v ? 1 : 0; }
        t.prog += inc;
      }
      if (t.prog >= t.need) {
        t.done = true; t.ok = true;
        const reward = { para: F.scaleMoney(1.5), 'r.menajer': 6, moral: 3 };
        F.fx(reward);
        S.agentScore = (S.agentScore || 0) + 1;
        F.addDM('{menajerTam}', 'Görevi tamamladın: ' + t.desc + ' Ödülün hesabında, bir de iyi haber: kulüplere seni pazarlarken elim güçlendi.');
      } else if (S.t >= t.until && kind === 'week') {
        t.done = true; t.ok = false;
        F.fx({ 'r.menajer': -3 });
      }
    });
  };

  /* =========================================================
     HAFTALIK MEYDAN OKUMA
     ========================================================= */
  D.challenges = [
    { id: 'seri7', name: '3 maç üst üste 7.0+ not', need: 3, streak: true, test: (m) => m && m.played && m.rating >= 7 },
    { id: 'gol3', name: '4 haftada 3 gol', need: 3, count: true, test: (m) => (m && m.goals) || 0, pos: ['FV', 'OS'] },
    { id: 'clean2', name: '4 haftada 2 maçta gol yeme', need: 2, test: (m) => m && m.played && m.gaTotal === 0, pos: ['KL', 'DF'] },
    { id: 'sosyal', name: '4 haftada 3 kez takımla dışarı çık', need: 3, week: true, test: () => F.S.wk && F.S.wk.acts.includes('disari') },
    { id: 'aile', name: '4 haftada 3 kez aileyi ara', need: 3, week: true, test: () => F.S.wk && F.S.wk.acts.includes('aile') }
  ];
  F.newChallenge = function () {
    const S = F.S;
    const list = D.challenges.filter((c) => !c.pos || c.pos.includes(S.P.pos));
    const c = F.pick(list);
    S.challenge = { id: c.id, name: c.name, need: c.need, prog: 0, until: S.t + 4, reward: F.scaleMoney(2) };
  };
  F.checkChallenge = function (m) {
    const S = F.S;
    if (!S.challenge) { F.newChallenge(); return; }
    const ch = S.challenge;
    const d = D.challenges.find((c) => c.id === ch.id);
    if (!d) { S.challenge = null; return; }
    const isMatch = !!m;
    if (d.week && !isMatch) { if (d.test()) ch.prog++; }
    if (!d.week && isMatch) {
      const v = d.test(m);
      if (d.streak) ch.prog = v ? ch.prog + 1 : m.played ? 0 : ch.prog;
      else ch.prog += d.count ? v : v ? 1 : 0;
    }
    if (ch.prog >= ch.need) {
      F.fx({ para: ch.reward, moral: 5 });
      F.addDM('Forma', 'Haftalık meydan okuma tamamlandı: ' + ch.name + '. Ödül: ' + F.money(ch.reward));
      ch.done = true;
      S.challenge = null;
    } else if (!isMatch && S.t >= ch.until) S.challenge = null;
  };

  /* =========================================================
     EYLEMLER (olaylardan "do")
     ========================================================= */
  F.ACT = {
    injure: (w) => { F.injure(+w || 2, 'olay'); },
    // ağrı kesiciyle sahaya dönüş: sakatlık kalkar ama sağlık bedeli ödenir
    heal: () => { const P = F.S.P; if (P.injury) { P.injury = null; P.life.saglik = F.clamp(P.life.saglik - 6, 0, 100); } },
    suspend: (w) => { F.S.P.suspended = Math.max(F.S.P.suspended, +w || 1); },
    agent: (tier) => { F.hireAgent(+tier || 2); F.addDM('{menajerTam}', 'Anlaştık. Artık senin işlerine ben bakıyorum.'); },
    fireAgent: () => F.fireAgent(),
    partner: (src) => F.startPartner(src),
    pstage: (n) => { const S = F.S; if (!S.partner) return; S.partner.stage = +n; S.partner.since = S.t; F.partnerAlbum(); },
    breakup: () => F.breakup(),
    kid: () => F.haveKid(),
    loan: () => F.loanOut(),
    offers: (w) => { F.S.offers = F.genOffers(w || 'ozel'); if (F.S.offers.length) F.S.queue.splice(1, 0, { type: 'offers', window: w || 'ozel' }); },
    coach: () => F.newCoach(),
    captain: () => { F.S.flags.kaptan = 1; F.addAlbum('Kaptanlık bandı artık senin kolunda.', 'kaptan'); },
    nat: (c) => { F.S.P.natTeam = c; },
    wage: (mul) => { const P = F.S.P; P.contract.wage = Math.round(P.contract.wage * parseFloat(mul)); },
    role: (r) => { F.S.P.contract.role = r; },
    sellLux: () => {
      const P = F.S.P;
      const items = P.owned.map(F.item).filter((it) => it && !it.consumable && it.price > 0).sort((a, b) => b.price - a.price);
      if (!items.length) return;
      const it = items[0];
      P.owned.splice(P.owned.indexOf(it.id), 1);
      const v = Math.round(it.price * 0.4);
      P.money += v;
      F.bankLog('Haciz satışı: ' + it.name, v);
      return [{ k: 'sell', label: it.name + ' satıldı', v, money: true }];
    },
    payOwed: () => { const S = F.S; if (S.owed) { S.P.money += S.owed; F.bankLog('Gecikmiş maaşlar ödendi', S.owed); const v = S.owed; S.owed = 0; delete S.flags.maas_gecikiyor; return [{ k: 'para', label: 'Gecikmiş maaş', v, money: true }]; } delete S.flags.maas_gecikiyor; },
    loseOwed: () => { F.S.owed = 0; delete F.S.flags.maas_gecikiyor; },
    quitJob: () => { delete F.S.flags.is_var; },
    exmate: () => {},
    transferTo: (spec) => {
      // spec: 'up' bir üst lig, 'abroad' yurt dışı, 'down' bir alt lig
      const S = F.S;
      const offers = F.genOffers('ozel', spec);
      if (offers.length) { S.offers = offers; S.queue.splice(1, 0, { type: 'offers', window: 'ozel' }); }
    },
    retireNow: () => { F.S.queue.splice(1, 0, { type: 'retire', forced: true }); },
    natPick: () => { F.S.queue.splice(1, 0, F.makeEventStep('gurbet_milli_secim')); },
    pos: (p) => { F.setRole(D.roles[p] ? p : D.defaultRole[p]); F.addAlbum('Mevki değişikliği: artık ' + F.role().name.toLowerCase() + ' oynuyorsun.', 'event'); },
    // gelişim planı: 'guclu' = güçlü yanlarını parlat, 'yeni' = planı yeniden kur
    devplan: (kind) => { const S = F.S, P = S.P; const w = F.posW(P); if (kind === 'guclu') { S.devPlan.focus = Object.keys(w).sort((a, b) => w[b] * P.attrs[b] - w[a] * P.attrs[a]).slice(0, 3); S.devPlan.msg = 'Güçlü yanlarını daha da parlatacağız: ' + S.devPlan.focus.map((k) => D.attrs[k].toLowerCase()).join(', ') + '.'; } else F.makeDevPlan(true); },
    playrole: (i) => { const S = F.S, P = S.P; i = +i; P.playRole = i < 0 ? P.role : (S.roleOffer || [])[i] || P.role; S.roleOffer = null; },
    temprole: () => { const S = F.S; if (S.tempOffer) S.tempRole = { role: S.tempOffer, until: S.t + F.ri(1, 3) }; S.tempOffer = null; },
    // kulüpten kovulma: sözleşme feshedilir, sicili lekeli oyuncuya alt seviyeden düşük maaşlı teklifler gelir
    sacked: () => {
      const S = F.S, P = S.P;
      const old = F.myTeam();
      S.flags.kovuldu = (S.flags.kovuldu || 0) + 1;
      P.contract.years = 0; P.contract.role = 'yedek';
      F.relAdd('baskan', -40);
      let offers = F.genOffers('kis', 'down');
      if (offers.length < 2) {
        const low = Object.values(S.world.teams).filter((t) => t.country === 'TR' && t.id !== old.id && t.str < old.str).sort((a, b) => b.str - a.str).slice(0, 10);
        F.shuffle(low).slice(0, 3 - offers.length).forEach((t) => offers.push(F.makeOffer(t.id)));
      }
      if (offers.length < 2) { // en alttaysa bile en az iki kulüp şans verir
        const any = Object.values(S.world.teams).filter((t) => t.country === 'TR' && t.id !== old.id && !offers.some((o) => o.team === t.id) && F.tierOf(t.id).t >= 4);
        F.shuffle(any).slice(0, 2 - offers.length).forEach((t) => offers.push(F.makeOffer(t.id)));
      }
      offers = offers.slice(0, 3);
      offers.forEach((o) => { o.wage = Math.round(o.wage * 0.6 / 500) * 500; o.role = 'rotasyon'; });
      S.offers = offers;
      S.queue.splice(1, 0, { type: 'offers', window: 'kovuldu' });
      F.addFeed({ who: 'Spor Haber', t: F.tpl(old.name + ', şike soruşturması sonrası {adsoyad} ile yollarını ayırdı.'), kind: 'news' });
      F.addAlbum(old.name + ' seni kadrodan çıkardı. Kariyerinin en zor günü.', 'event');
    },
    campaign: () => { F.S.campaign = { until: F.S.t + 2 }; },
    // hocanın maç planı: bu hafta belli yeteneklere ek şans (ör. 'tactic:hiz=6,sut=4')
    tactic: (spec) => { const b = {}; String(spec).split(',').forEach((x) => { const [k, v] = x.split('='); b[k] = (+v || 0) / 100; }); F.S.tactic = { t: F.S.t, b }; },
    album: () => {}
  };

  /* =========================================================
     PARTNER VE AİLE
     ========================================================= */
  const JOBS = { gece: ['DJ', 'model', 'influencer', 'barmen', 'şarkıcı'], arkadas: ['öğretmen', 'mimar', 'doktor', 'avukat', 'grafik tasarımcı', 'hemşire'], dm: ['influencer', 'üniversite öğrencisi', 'fotoğrafçı', 'diyetisyen'], memleket: ['öğretmen', 'hemşire', 'eczacı', 'çocukluk arkadaşın'], unlu: ['dizi oyuncusu', 'şarkıcı', 'sunucu', 'model'] };
  F.startPartner = function (src) {
    const S = F.S;
    src = JOBS[src] ? src : 'arkadas';
    const old = F.npc('partner');
    if (old) old.role = 'eski_partner';
    const n = F.addNpc('partner', { name: F.fullName(true), type: src, job: F.pick(JOBS[src]), rel: 20, age: S.P.age + F.ri(-3, 2), kiskanc: F.ri(10, 90), sohretsever: src === 'unlu' || src === 'gece' ? F.ri(55, 95) : F.ri(5, 60), kariyer: F.ri(10, 90) });
    S.partner = { stage: 1, since: S.t, met: src };
    if (src === 'unlu') F.fx({ sohret: 4, 'takipci%': 6 });
    return [{ k: 'partner', label: 'Yeni biriyle tanıştın: ' + n.name.split(' ')[0], v: 0, trait: true }];
  };
  F.partnerAlbum = function () {
    const S = F.S;
    const n = F.npc('partner');
    const st = S.partner.stage;
    const t = { 2: 'Artık resmen sevgilisiniz: ' + n.name + '.', 3: n.name + ' ile nişanlandınız.', 4: n.name + ' ile evlendiniz. Düğünde tüm takım halay çekti.' }[st];
    if (t) F.addAlbum(t, 'ask');
  };
  F.breakup = function () {
    const S = F.S;
    const n = F.npc('partner');
    if (!n) return;
    const married = S.partner.stage >= 4;
    n.role = married ? 'eski_es' : 'eski_partner';
    delete S.roles.partner;
    S.partner = null;
    const fx = { moral: -15, mental: -8 };
    if (married) { fx.para = -Math.round(Math.max(0, F.S.P.money) * 0.35); S.flags.bosandi = 1; }
    F.addFeed({ who: 'Magazin Gündemi', t: F.tpl('{adsoyad} ile ' + n.name + ' yollarını ayırdı. ' + (married ? 'Boşanma davası olaylı geçti.' : 'Ayrılık sessiz sedasız oldu.')), kind: 'news' });
    return F.fx(fx);
  };
  F.haveKid = function () {
    const S = F.S, P = S.P;
    const male = F.chance(0.5);
    const kid = { name: male ? F.maleName() : F.femaleName(), male, born: S.year, pot: F.clamp(Math.round(P.pot * 0.55 + F.ri(30, 50)), 50, 95), rel: 50 };
    S.kids.push(kid);
    F.addAlbum((male ? 'Oğlun ' : 'Kızın ') + kid.name + ' dünyaya geldi.', 'aile');
    F.addFeed({ who: F.tpl('{adsoyad}'), t: 'Hoş geldin ' + kid.name + '. Hayatımın en güzel golü.', me: true, kind: 'me', img: 'aile' });
    return F.fx({ moral: 15, 't.aile': 2, 'r.partner': 10 });
  };

  /* =========================================================
     SEZON
     ========================================================= */
  F.startSeason = function (first) {
    const S = F.S, P = S.P;
    F.startLeague();
    S.week = 1;
    S.st = { apps: 0, goals: 0, assists: 0, clean: 0, reds: 0, ratingSum: 0, caps: 0, followersStart: P.followers, moneyStart: P.money, finalPos: null, wins: 0, motm: 0, derbyGoals: 0, braces: 0, yellows: 0, ovrStart: P.attrs ? F.ovr() : null, sohretStart: P.life.sohret };
    S.scoutBonus = 0;
    S.queue.push({ type: 'goals' });
    if (first) {
      const intro = F.EV['intro_' + P.origin];
      if (intro) S.queue.push(F.makeEventStep(intro.id));
    } else {
      F.pickRandomEvents(1).forEach((id) => F.queueEvent(id));
    }
    F.newChallenge();
    // teknik direktör sezonun gelişim planını anlatır
    F.makeDevPlan(true);
    if (!first) F.queueEvent('hoca_gelisim');
  };
  F.chooseGoals = function (ids) {
    F.S.goals = ids.slice(0, 3);
  };
  F.goalOptions = function () {
    const P = F.S.P;
    const S = F.S;
    return D.goals.filter((g) => (!g.pos || g.pos.includes(P.pos)) && (!g.show || g.show(S)));
  };

  F.endSeason = function () {
    const S = F.S, P = S.P;
    const L = S.league;
    const order = F.sortTable(L.table);
    const pos = order.indexOf(P.contract.team) + 1;
    S.st.finalPos = pos;
    const myComp = S.world.comps[L.key];
    const tierDef = F.tierDef(myComp.c, myComp.tier);
    // Diğer liglerin simülasyonu
    const finals = {};
    Object.values(S.world.comps).forEach((c) => {
      if (c.key === L.key) { finals[c.key] = order; return; }
      finals[c.key] = F.simFullSeason(c.teams);
    });
    // Kupa / yükselme
    const avg = S.st.apps ? S.st.ratingSum / S.st.apps : 0;
    const summary = { season: S.season, year: S.year, club: F.myTeam().name, league: F.leagueName(), pos, size: order.length, st: Object.assign({}, S.st), avg, champions: F.team(order[0]).name, awards: [], goals: [] };
    if (pos === 1) { P.career.titles.push({ year: S.year, league: myComp.name }); summary.awards.push(myComp.name + ' şampiyonu'); F.addAlbum(myComp.name + ' şampiyonluğu! Kupayı kaldırdın.', 'kupa'); F.fx({ sohret: 6, moral: 15, 'r.taraftar': 15 }); }
    const ups = myComp.tier > 1 ? D.leagues[myComp.c].tiers[myComp.tier - 1].up / myComp.c.length : 0;
    const promoted = F.promoteRelegate(finals);
    const newTier = F.tierOf(P.contract.team);
    if (newTier.c === myComp.c && newTier.t < myComp.tier) { summary.promoted = true; P.career.promotions++; summary.awards.push('Üst lige yükseldiniz'); F.addAlbum(F.myTeam().name + ' ' + newTier.comp.name + "'e yükseldi.", 'kupa'); F.fx({ moral: 10, 'r.taraftar': 10, sohret: 2 }); }
    if (newTier.c === myComp.c && newTier.t > myComp.tier) { summary.relegated = true; summary.awards.push('Küme düştünüz'); F.fx({ moral: -10, 'r.taraftar': -8 }); }
    // Gol krallığı yaklaşık
    if (S.st.goals >= Math.round(tierDef.size * 1.1)) summary.awards.push('Gol kralı adayı (' + S.st.goals + ' gol)');
    if (avg >= 7.4 && S.st.apps >= 15) { summary.awards.push('Sezonun oyuncusu'); F.fx({ sohret: 4 }); F.addAlbum('Sezonun oyuncusu seçildin.', 'kupa'); }
    // Hedefler
    S.goals.forEach((gid) => {
      const g = D.goals.find((x) => x.id === gid);
      if (!g) return;
      const ok = g.test(S.st, S);
      summary.goals.push({ name: g.name, ok });
      if (ok) F.fx(g.reward); else F.fx({ moral: -3 });
    });
    P.career.seasons.push({ year: S.year, club: F.myTeam().name, league: myComp.name, pos, apps: S.st.apps, goals: S.st.goals, assists: S.st.assists, avg: Math.round(avg * 100) / 100, ovr: F.ovr() });
    // Yaşlanma
    P.age++;
    F.ageAttributes();
    S.kids.forEach((k) => (k.rel = F.clamp(k.rel + (S.flags.aile_zaman ? 3 : -2), 0, 100)));
    Object.values(S.npcs).forEach((n) => n.age++);
    S.year++; S.season++;
    P.contract.years--;
    summary.ovr = F.ovr();
    // Kiralıktan dönüş
    if (P.contract.loanFrom) {
      const parent = P.contract.loanFrom;
      delete P.contract.loanFrom;
      P.contract.team = parent;
      P.contract.years = Math.max(1, P.contract.years);
      P.contract.role = F.ovr() >= F.team(parent).str - 2 ? 'rotasyon' : 'yedek';
      F.clubNpcs();
    F.S.P.playRole = null; F.S.tempRole = null;
    F.checkRoleFit();
      summary.awards.push('Kiralık dönemin bitti, ' + F.team(parent).name + ' kadrosuna döndün');
    } else if (F.chance(0.28) || (F.relGet('hoca') < -40 && F.chance(0.5))) {
      F.newCoach();
      summary.newCoach = F.npc('hoca').name;
    }
    S.queue.push({ type: 'seasonSummary', data: summary });
    S.offers = F.genOffers('yaz');
    S.queue.push({ type: 'offers', window: 'yaz' });
    const forced = P.age >= 39 || (P.age >= 34 && P.life.saglik < 25);
    if (P.age >= 33 || forced) S.queue.push({ type: 'retire', forced });
    S.queue.push({ type: 'newSeasonAuto' });
  };

  F.ageAttributes = function () {
    const P = F.S.P;
    const a = P.age;
    if (a >= 30) {
      P.attrs.hiz -= F.rf(0.8, 2.6) * (a >= 33 ? 1.5 : 1);
      P.attrs.fizik -= F.rf(0.4, 1.8) * (a >= 33 ? 1.5 : 1);
      P.life.saglik = F.clamp(P.life.saglik - F.ri(1, 4), 0, 100);
    }
    if (a >= 33) Object.keys(P.attrs).forEach((k) => (P.attrs[k] -= F.rf(0.2, 1.2)));
    Object.keys(P.attrs).forEach((k) => (P.attrs[k] = F.clamp(P.attrs[k], 1, 99)));
  };

  F.simFullSeason = function (ids) {
    const table = F.emptyTable(ids);
    for (let i = 0; i < ids.length; i++) for (let j = 0; j < ids.length; j++) {
      if (i === j) continue;
      const [a, b] = F.simScore(ids[i], ids[j]);
      F.addResult(table, ids[i], ids[j], a, b);
    }
    return F.sortTable(table);
  };

  F.promoteRelegate = function (finals) {
    const S = F.S;
    Object.keys(D.leagues).forEach((c) => {
      const tiers = D.leagues[c].tiers;
      const byTier = tiers.map((t, ti) => {
        const comps = Object.values(S.world.comps).filter((k) => k.c === c && k.tier === ti + 1);
        // grup sıralamalarını birleştir: sıra, sonra puan
        const ranked = [];
        comps.forEach((k) => (finals[k.key] || k.teams).forEach((id, pos) => ranked.push({ id, pos })));
        return ranked;
      });
      const newTiers = byTier.map((r) => r.map((x) => x.id));
      for (let ti = 0; ti < tiers.length - 1; ti++) {
        const down = tiers[ti].down;
        if (!down) continue;
        const upper = byTier[ti].slice().sort((a, b) => b.pos - a.pos).slice(0, down).map((x) => x.id);
        const lower = byTier[ti + 1].slice().sort((a, b) => a.pos - b.pos).slice(0, down).map((x) => x.id);
        newTiers[ti] = newTiers[ti].filter((id) => !upper.includes(id)).concat(lower);
        newTiers[ti + 1] = newTiers[ti + 1].filter((id) => !lower.includes(id)).concat(upper);
        upper.forEach((id) => (F.team(id).str -= F.ri(1, 3)));
        lower.forEach((id) => (F.team(id).str += F.ri(1, 3)));
      }
      // güç kayması ve lig aralığına çekme
      newTiers.forEach((ids, ti) => {
        const rg = tiers[ti].str;
        ids.forEach((id) => {
          const t = F.team(id);
          t.str += F.ri(-2, 2);
          if (t.str > rg[1] + 2) t.str -= Math.ceil((t.str - rg[1]) * 0.3);
          if (t.str < rg[0] - 2) t.str += Math.ceil((rg[0] - t.str) * 0.3);
          if (t.big) t.str = Math.max(t.str, rg[1] - 4);
        });
      });
      F.buildComps(c, newTiers);
    });
  };

  // Yıllar ilerletme (nesil geçişi)
  F.advanceWorld = function (years) {
    const S = F.S;
    for (let y = 0; y < years; y++) {
      const finals = {};
      Object.values(S.world.comps).forEach((c) => (finals[c.key] = F.simFullSeason(c.teams)));
      F.promoteRelegate(finals);
      S.year++;
      Object.values(S.npcs).forEach((n) => n.age++);
    }
  };

  /* =========================================================
     TRANSFER VE SÖZLEŞME
     ========================================================= */
  F.genOffers = function (window, spec) {
    const S = F.S, P = S.P;
    const ovr = F.ovr();
    const fame = P.life.sohret;
    const bag = S.agent ? S.agent.baglanti : 0;
    const reach = 3 + bag / 25 + (S.scoutBonus || 0) + (S.agentScore || 0) * 0.3;
    const me = P.contract.team;
    let pool = Object.values(S.world.teams).filter((t) => t.id !== me && t.id !== P.contract.loanFrom);
    // gerçekçi sıçrama: Türkiye'de en fazla iki lig yukarıdan teklif gelir (çok üstün oyuncu üç), yurt dışı ancak üst iki ligden
    const myTi = F.tierOf(me);
    const curT = myTi.c === 'TR' ? myTi.t : 1;
    const jump = ovr >= F.myTeam().str + 14 ? 3 : 2;
    pool = pool.filter((t) => {
      const ti = F.tierOf(t.id);
      if (ti.c === 'TR' && ti.t < curT - jump) return false;
      if (ti.c !== 'TR' && myTi.c === 'TR' && curT > 2) return false;
      if (ti.c !== 'TR' && !(ti.c === 'DE' && ti.t === 2 && P.origin === 'gurbetci')) {
        if (ovr < 70) return false;
        if (P.dil < 25 && F.chance(0.6)) return false;
      }
      if (ti.c === 'DE' && ti.t === 2 && P.origin !== 'gurbetci') return false;
      if (spec === 'up') return t.str > F.myTeam().str + 2 && t.str <= ovr + reach + 2;
      if (spec === 'abroad') return ti.c !== 'TR' && t.str <= ovr + reach + 4;
      if (spec === 'down') return t.str < F.myTeam().str - 2;
      return t.str >= ovr - 9 && t.str <= ovr + reach;
    });
    let count = window === 'kis' ? (F.chance(0.45) ? F.ri(1, 2) : 0) : 1 + (S.agent && S.agent.tier >= 3 ? 1 : 0) + Math.min(2, S.scoutBonus || 0) + (S.st && S.st.apps && S.st.ratingSum / S.st.apps >= 7 ? 1 : 0);
    if (spec) count = Math.max(1, count);
    count = Math.min(4, count);
    const offers = [];
    for (let i = 0; i < count && pool.length; i++) {
      // memleket kulübü seni daha çok ister (memleket ilişkin iyiyse daha da çok)
      const hc = F.homeClub();
      const homeW = (x) => (hc && x.id === hc.id ? 4 + Math.max(0, (F.relGet('memleket') || 0) / 20) : 1);
      const t = F.wpick(pool, (x) => Math.pow(x.str / 50, 4) * (F.tierOf(x.id).c === 'TR' ? 1 : 0.8) * homeW(x));
      if (!t) break;
      pool = pool.filter((x) => x.id !== t.id);
      offers.push(F.makeOffer(t.id));
      if (hc && t.id === hc.id) F.addDM(t.name, F.tpl('Memleketin {memleket} seni geri istiyor. Bu formayı giymek senin için farklı olur, biliyoruz. Teklifimiz masada.'));
    }
    // Sözleşmesi biten için kendi kulübünden yenileme
    if (window === 'yaz' && P.contract.years <= 0) {
      const b = F.npc('baskan');
      if (!(b && b.rel < -45) && ovr >= F.myTeam().str - 9) offers.unshift(Object.assign(F.makeOffer(me), { renew: true }));
      if (!offers.length) {
        // serbest kalan oyuncuya alt liglerden teklif
        const low = Object.values(S.world.teams).filter((t) => t.country === 'TR' && t.str < ovr + 2).sort((a, b) => b.str - a.str).slice(0, 12);
        F.shuffle(low).slice(0, 2).forEach((t) => offers.push(F.makeOffer(t.id)));
      }
    }
    return offers;
  };

  F.makeOffer = function (teamId) {
    const S = F.S, P = S.P;
    const t = F.team(teamId);
    const ti = F.tierOf(teamId);
    const ovr = F.ovr();
    const diff = ovr - t.str;
    const role = diff >= 1 ? 'as' : diff >= -3 ? 'rotasyon' : 'yedek';
    let wage = F.wageFor(ti.c, ti.t, t.str, ovr) * (1 + P.life.sohret / 250) * F.rf(0.9, 1.15) * (role === 'as' ? 1.1 : role === 'yedek' ? 0.85 : 1);
    const years = P.age >= 31 ? F.ri(1, 2) : F.ri(2, 4);
    return { team: teamId, wage: Math.round(wage / 500) * 500, years, role, league: F.leagueName(teamId) };
  };

  D.roleNames = { as: 'As oyuncu', rotasyon: 'Rotasyon', yedek: 'Yedek' };

  /* Pazarlık: kulübün gizli bir tavanı var. Tavanın altındaki her istek kabul edilir,
     kulübün kendi karşı teklifi her zaman kabul edilir. Tavanı aştıkça masadaki gerginlik artar;
     gerginlik 100'e ulaşırsa kulüp masadan kalkar. Konuşma yeteneği ve menajer gerginliği yumuşatır. */
  F.negPower = function (o) {
    const S = F.S, P = S.P;
    const t = F.team(o.team);
    return (F.ovr() - t.str) / 10 + (P.soft.konusma - 30) / 150 + (S.agent ? S.agent.pazarlik / 160 : 0) + P.life.sohret / 300 + (S.scoutBonus || 0) * 0.05 + (o.renew ? (F.relGet('baskan') || 0) / 200 : 0);
  };
  F.negLimit = function (o) {
    if (o.limit) return o.limit;
    const P = F.S.P;
    const pw = F.negPower(o);
    o.limit = {
      wageMul: Math.round(F.clamp(1.06 + pw * 0.3 + F.rand() * 0.08, 1.0, 1.9) * 100) / 100,
      signing: Math.round(F.clamp(0.05 + pw * 0.22 + F.rand() * 0.05, 0, 0.8) * 100) / 100,
      maxYears: P.age >= 31 ? 2 : P.age >= 28 ? 3 : 5,
      guarantee: o.role === 'as' || (o.role === 'rotasyon' && pw > 0.3) || (o.role === 'yedek' && pw > 0.8)
    };
    if (o.tension == null) o.tension = Math.round(8 + F.rand() * 12);
    return o.limit;
  };
  // Kulüp garantiyi normalde vermiyorsa: maaştan feragat edersen verir (yedek teklifte %25, rotasyonda %15 daha az)
  F.negGuaranteeWage = function (o) {
    const L = F.negLimit(o);
    if (L.guarantee) return L.wageMul;
    const pw = F.negPower(o);
    if (pw < -1.3) return null; // takımın çok altındaysa hiçbir maaşla garanti yok
    // zayıfsan daha çok feragat etmen gerekir
    const cut = (o.role === 'yedek' ? 0.25 : 0.15) + (pw < -0.6 ? 0.12 : 0);
    const w = Math.round((L.wageMul - cut) * 100) / 100;
    return w >= 0.6 ? w : null;
  };
  // primler maaşın katı olarak: maç başı, gol başı, asist başı
  F.bonusCost = (t) => (t.appB || 0) * 3 + (t.goalB || 0) * 1.5 + (t.assistB || 0) * 1;
  F.bonusFree = (o) => F.clamp(0.3 + F.negPower(o) * 0.5, 0, 1.2);
  F.negGap = function (o, terms) {
    const L = F.negLimit(o);
    const gw = terms.guarantee && !L.guarantee ? F.negGuaranteeWage(o) : null;
    const gOk = !terms.guarantee || L.guarantee || (gw != null && terms.wageMul <= gw + 1e-9 && terms.signing <= L.signing * 0.5 + 1e-9);
    return Math.max(0, terms.wageMul - L.wageMul) / 0.1 + Math.max(0, terms.signing - L.signing) / 0.1 * 0.6 +
      (gOk ? 0 : 1.6) + Math.max(0, terms.years - L.maxYears) * 0.6 + Math.max(0, F.bonusCost(terms) - F.bonusFree(o));
  };
  F.negotiate = function (idx, terms) {
    const S = F.S, P = S.P;
    const o = S.offers[idx];
    if (!o) return null;
    const L = F.negLimit(o);
    const c = o.counter;
    const sameAsCounter = c && terms.wageMul <= c.wageMul + 1e-9 && terms.signing <= c.signing + 1e-9 && terms.years <= c.years && (!terms.guarantee || c.guarantee) && F.bonusCost(terms) <= F.bonusCost(c) + 1e-9;
    let gap = F.negGap(o, terms);
    // gerginlik düşükken küçük farklar için kulüp son bir jest yapabilir
    if (gap > 0 && gap < 0.8 && o.tension < 40 && F.chance(0.35)) gap = 0;
    if (sameAsCounter || gap <= 1e-9) {
      o.agreed = Object.assign({}, terms);
      const tense = o.tension >= 60;
      return { status: 'ok', msg: tense ? 'Kulüp istemeye istemeye kabul etti. İmza masada ama masada buz gibi bir hava var.' : 'Kulüp şartlarını kabul etti. İmza masada.' };
    }
    const soft = F.clamp(1 - (P.soft.konusma - 20) / 220 - (S.agent ? S.agent.pazarlik / 320 : 0), 0.45, 1);
    // tek turda en fazla ~45 artar: ilk açgözlü teklif masayı germekle kalır, ısrar dağıtır
    o.tension = Math.round(o.tension + Math.min(45, 9 + gap * 8) * soft);
    if (o.tension >= 100) {
      S.offers.splice(idx, 1);
      if (o.renew) F.fx({ 'r.baskan': -6 });
      return { status: 'walk', msg: F.team(o.team).name + ' masadan kalktı: "Bu kadarı fazla. Görüşme bitti."' };
    }
    // karşı teklif: istediğinle kulübün tavanı arasında; gerginlik arttıkça tavana yaklaşırlar
    const k = F.clamp(0.55 + o.tension / 200, 0.55, 1);
    const prev = c || { wageMul: 1, signing: 0 };
    const counter = {
      wageMul: Math.round(Math.max(prev.wageMul, Math.min(terms.wageMul, 1 + (L.wageMul - 1) * k)) * 100) / 100,
      years: Math.min(terms.years, L.maxYears),
      guarantee: !!terms.guarantee && L.guarantee,
      signing: Math.round(Math.max(prev.signing, Math.min(terms.signing, L.signing * k)) * 100) / 100
    };
    // primler: kulübün serbest bütçesine sığacak kadar
    const bc = F.bonusCost(terms), bf = F.bonusFree(o) * k;
    const bs = bc > 0 ? Math.min(1, bf / bc) : 0;
    ['appB', 'goalB', 'assistB'].forEach((x) => (counter[x] = Math.floor((terms[x] || 0) * bs * 20) / 20));
    // garanti istendiyse ama kulüp vermiyorsa: maaştan feragat karşılığında garanti teklif eder
    let gNote = '';
    if (terms.guarantee && !L.guarantee) {
      const gw = F.negGuaranteeWage(o);
      if (gw != null) { counter.guarantee = true; counter.wageMul = Math.min(counter.wageMul, gw); counter.signing = Math.min(counter.signing, Math.round(L.signing * 0.5 * 100) / 100); gNote = ' Forma garantisi verebiliriz ama haftalık maaş ' + F.money(Math.round(o.wage * counter.wageMul)) + ' olur.'; }
      else gNote = ' Bu aşamada sana forma garantisi veremeyiz.';
    }
    o.counter = counter;
    const mood = o.tension < 35 ? 'Sportif direktör not aldı ve karşı teklif yaptı.'
      : o.tension < 60 ? 'Başkan kaşlarını çattı. "Bu rakamlar bizi zorlar" dedi ve karşı teklif uzattı.'
      : o.tension < 80 ? 'Masada gerginlik büyüyor. Başkan kalemi masaya bıraktı: "Son teklifimize yakınız."'
      : 'Başkan ayağa kalktı, pencereye yürüdü. "Bir daha zorlarsanız kalkarız." Bu son şansın olabilir.';
    return { status: 'counter', msg: mood + gNote, counter };
  };

  F.acceptOffer = function (idx) {
    const S = F.S, P = S.P;
    const o = S.offers[idx];
    if (!o) return null;
    const terms = o.agreed || { wageMul: 1, years: o.years, guarantee: false, signing: 0 };
    const bonusOf = (w) => ({ app: Math.round(w * (terms.appB || 0) / 100) * 100, goal: Math.round(w * (terms.goalB || 0) / 100) * 100, assist: Math.round(w * (terms.assistB || 0) / 100) * 100 });
    // gergin geçen bir pazarlık ilişkide iz bırakır
    if (o.tension >= 60) F.fx(o.renew ? { 'r.baskan': -4 } : { 'r.hoca': -1 });
    const wage = Math.round(o.wage * terms.wageMul);
    const signing = Math.round(wage * 12 * terms.signing);
    const out = [];
    if (o.renew) {
      P.contract.wage = wage; P.contract.years = terms.years;
      // forma garantisi: kulüp kabul ettiyse ilk 11 oyuncususun
      if (terms.guarantee) { P.contract.role = 'as'; P.contract.guarantee = true; } else delete P.contract.guarantee;
      P.contract.bonus = bonusOf(wage);
      out.push(...F.fx({ 'r.baskan': 5, 'r.taraftar': 3, 't.sadik': 1 }));
      F.addFeed({ who: F.myTeam().name, t: F.tpl('{adsoyad} ile sözleşme yenilendi. Yolumuza birlikte devam ediyoruz!'), kind: 'club' });
    } else {
      const left = P.contract.years > 0;
      const oldWage = P.contract.wage;
      F.transfer(o.team, { wage, years: terms.years, role: terms.guarantee ? 'as' : o.role });
      if (terms.guarantee) P.contract.guarantee = true;
      P.contract.bonus = bonusOf(wage);
      if (left) out.push(...F.fx({ 'r.taraftar': -6 }));
      if (wage > oldWage * 2.5) out.push(...F.fx({ 't.paragoz': 1 }));
    }
    if (signing) { out.push(...F.fx({ para: signing })); }
    S.offers = [];
    return out;
  };

  F.transfer = function (teamId, c) {
    const S = F.S, P = S.P;
    const old = F.myTeam();
    const midseason = S.league && S.league.round > 0 && S.league.round < F.seasonRounds();
    P.contract = { team: teamId, wage: c.wage, years: c.years, role: c.role, loanFrom: c.loanFrom };
    if (!P.career.clubs.includes(teamId)) P.career.clubs.push(teamId);
    const nt = F.team(teamId);
    const ti = F.tierOf(teamId);
    F.clubNpcs();
    F.addFeed({ who: 'Transfer Kulisi', t: F.tpl('RESMİ: {adsoyad}, ' + old.name + ' formasını çıkardı ve ' + nt.name + ' ile ' + c.years + ' yıllık sözleşme imzaladı.'), kind: 'rumor' });
    F.addAlbum(nt.name + ' ile imza: ' + ti.comp.name + (c.loanFrom ? ' (kiralık)' : '') + '.', 'transfer');
    const k = S.exMates.length ? S.npcs[S.exMates[S.exMates.length - 1]] : null;
    if (k && k.role === 'eski_kanka') F.addDM(k.name, 'Kardeşim hayırlı olsun! Seni özleyeceğiz, karşılaşınca bacağına basmam, söz.');
    if (ti.c !== 'TR' && !S.flags.yurtdisi) { S.flags.yurtdisi = 1; S.seeds.push({ id: 'yurtdisi_yalnizlik', at: S.t + F.ri(3, 8), p: 0.8 }); if (S.partner && S.partner.stage >= 2) F.queueEvent('partner_yurtdisi', true); }
    if (ti.c === 'TR' && S.flags.yurtdisi && old.country !== 'TR') F.addFeed({ who: 'Spor Haber', t: F.tpl('{adsoyad} Süper Lig\'e dönüyor! Taraftarlar havalimanında.'), kind: 'news' });
    if (S.league && S.league.key !== nt.comp) {
      if (midseason) F.joinLeagueMidseason();
      else if (S.league.round === 0) F.startLeague();
    }
  };

  F.joinLeagueMidseason = function () {
    const S = F.S;
    const frac = S.league.round / Math.max(1, S.league.fixtures.length);
    F.startLeague();
    const L = S.league;
    const round = Math.min(L.fixtures.length - 1, Math.round(frac * L.fixtures.length));
    for (let r = 0; r < round; r++) L.fixtures[r].forEach(([h, a]) => { const [x, y] = F.simScore(h, a); F.addResult(L.table, h, a, x, y); });
    L.round = round;
  };

  F.loanOut = function () {
    const S = F.S, P = S.P;
    const parent = P.contract.team;
    const cands = Object.values(S.world.teams).filter((t) => t.country === 'TR' && F.tierOf(t.id).t >= 2 && F.tierOf(t.id).t <= 3 && Math.abs(t.str - F.ovr()) <= 6);
    const t = F.pick(cands.length ? cands : Object.values(S.world.teams).filter((x) => x.country === 'TR' && F.tierOf(x.id).t === 3));
    F.transfer(t.id, { wage: P.contract.wage, years: 1, role: 'as', loanFrom: parent });
  };

  /* =========================================================
     EMEKLİLİK VE NESİL
     ========================================================= */
  F.retire = function () {
    const S = F.S, P = S.P;
    const rec = {
      gen: S.gen, name: P.name + ' ' + P.surname, from: P.birthYear + P.age - (P.career.seasons.length), to: S.year, age: P.age, origin: P.originName, pos: P.pos,
      apps: P.career.apps, goals: P.career.goals, assists: P.career.assists, caps: P.career.caps, titles: P.career.titles.length, promotions: P.career.promotions,
      peak: P.peak, clubs: P.career.clubs.map((id) => F.team(id).name), money: P.money, traits: F.activeTraits().map((k) => D.traits[k]),
      sike: !!S.flags.sike_yapti, legend: P.career.caps >= 25 || P.career.titles.length >= 3 || P.peak >= 85
    };
    S.dynasty.push(rec);
    F.addAlbum('Futbolu bıraktın. ' + rec.apps + ' maç, ' + rec.goals + ' gol, ' + rec.titles + ' kupa.', 'veda');
    S.retired = rec;
    return rec;
  };
  F.dynastyScore = () => F.S.dynasty.reduce((a, r) => a + r.apps + r.goals * 3 + r.caps * 5 + r.titles * 40 + r.promotions * 15 + Math.max(0, r.peak - 60) * 4, 0);

  F.heirOptions = function () {
    const S = F.S;
    const list = S.kids.map((k, i) => ({ i, name: k.name, male: k.male, born: k.born, pot: k.pot, rel: k.rel, kid: true, available: k.male }));
    list.push({ i: -1, name: 'Yeğenin / himayendeki genç', nephew: true, available: true });
    return list;
  };

  F.nextGeneration = function (idx) {
    const S = F.S;
    const old = S.P;
    const rec = S.retired || F.retire();
    const kid = idx >= 0 ? S.kids[idx] : null;
    const age = 17;
    const jump = kid ? Math.max(1, kid.born + age - S.year) : 1;
    F.advanceWorld(jump);
    // eski oyuncu baba olur
    const oldPartner = F.npc('partner');
    const keepNpcs = {};
    const fatherId = F.uid('n');
    keepNpcs[fatherId] = { id: fatherId, role: 'baba', name: old.name + ' ' + old.surname, type: 'eskifutbolcu', rel: kid ? kid.rel - 10 : 30, age: old.age + jump, mem: [], legend: rec.legend };
    let motherId = null;
    if (oldPartner && kid) { motherId = oldPartner.id; keepNpcs[motherId] = Object.assign({}, oldPartner, { role: 'anne', rel: 50 }); }
    // eski takım arkadaşları artık hoca/başkan/menajer
    const mates = S.exMates.map((id) => S.npcs[id]).filter((n) => n && /eski_(kanka|kaptan|hoca)/.test(n.role));
    const flagsKeep = {};
    if (rec.sike) flagsKeep.baba_sikeci = 1;
    if (rec.legend) flagsKeep.efsane_baba = 1;
    if (S.flags.okul_yaptirdi) flagsKeep.aile_okulu = 1;
    if (S.flags.futbol_okulu) flagsKeep.futbol_okulu = 1;
    const ownedKeep = old.owned.filter((id) => { const it = F.item(id); return it && !it.consumable && !['gorunum', 'pro', 'hediye'].includes(it.cat); });
    const ownsClub = S.ownedClub;
    const money = Math.round(Math.max(0, old.money) * 0.5);
    const dynasty = S.dynasty, album = S.album, world = S.world, gen = S.gen + 1, year = S.year, edits = S.edits, rng = S.rng, seed = S.seed, ach = S.ach || {};
    const oldLook = old.look, oldNumber = old.number;

    const N = F.newState(seed);
    Object.assign(N, { rng, world, gen, year, dynasty, album, edits, ach, npcs: keepNpcs, roles: { baba: fatherId } });
    if (motherId) N.roles.anne = motherId;
    F.S = N;
    F.dealDeck();
    const og = D.origins.find((o) => o.id === 'miras');
    const name = kid ? kid.name : F.maleName();
    const surname = kid ? old.surname : F.pick([old.surname, F.surname()]);
    const hr = S.heirPos ? (D.roles[S.heirPos] ? S.heirPos : D.defaultRole[S.heirPos]) : null;
    F.createPlayer({ name, surname, role: idx >= 0 && hr ? hr : F.pick(Object.keys(D.roles)), number: oldNumber }, og, { pot: kid ? kid.pot : F.ri(60, 86), look: kid ? oldLook : null });
    keepNpcs[fatherId].look = oldLook;
    N.P.age = age; N.P.birthYear = N.year - age;
    N.P.money = money + og.money;
    N.P.owned = ownedKeep;
    N.P.followers = Math.round(N.P.followers + old.followers * 0.05);
    N.P.home = old.home;
    Object.assign(N.flags, flagsKeep, { nesil: gen });
    if (!motherId) F.addNpc('anne', { name: F.femaleName() + ' ' + surname, type: 'sefkatli', rel: 40, age: 45 });
    // mentorlar
    const roles = ['hoca_eski', 'baskan_eski', 'menajer_eski'];
    F.shuffle(mates).slice(0, 3).forEach((n, i) => { keepNpcs[n.id] = Object.assign({}, n, { role: roles[i], rel: n.rel, oldMate: true }); });
    // kulüp
    let team = null;
    if (ownsClub && world.teams[ownsClub]) { team = world.teams[ownsClub]; N.flags.aile_kulubu = 1; N.ownedClub = ownsClub; }
    if (!team) {
      const pool = Object.values(world.teams).filter((t) => t.country === 'TR' && [3, 4].includes(F.tierOf(t.id).t));
      team = F.pick(pool);
    }
    const ti = F.tierOf(team.id);
    N.P.contract = { team: team.id, wage: Math.round(F.wageFor(ti.c, ti.t, team.str, F.ovr()) * 0.8), years: 2, role: F.ovr() >= team.str - 2 ? 'as' : 'rotasyon' };
    N.P.career.clubs.push(team.id);
    F.clubNpcs(true);
    const mentor = Object.values(keepNpcs).find((n) => n.role === 'baskan_eski');
    if (mentor) mentor.teamId = team.id;
    F.hireAgent(2, null, { durust: 70 });
    N.P.natTeam = 'TR';
    F.startSeason(false);
    N.queue.unshift(F.makeEventStep('nesil_baslangic'));
    F.addAlbum('Yeni nesil: ' + name + ' ' + surname + ' sahaya çıkıyor. ' + jump + ' yıl geçti.', 'nesil');
    return N;
  };

  /* =========================================================
     MAĞAZA
     ========================================================= */
  F.clubPrice = function () {
    const S = F.S;
    const t = F.homeClub();
    if (!t) return null;
    const ti = F.tierOf(t.id);
    return [3e9, 900e6, 300e6, 120e6, 40e6][ti.t - 1];
  };
  F.homeClub = function () {
    const S = F.S, P = S.P;
    const name = P.home && (P.home.roots || P.home.name);
    return Object.values(S.world.teams).find((t) => t.country === 'TR' && (t.name === name || t.province === name)) || null;
  };
  F.itemPrice = (it) => (it.special === 'kulup' ? F.clubPrice() : it.price);
  // Kişisel gelişim aboneliği: 1 ay = 4 hafta; kampanyada 3 ay 2 ay fiyatına
  F.subPrice = function (it, months) {
    const S = F.S;
    const ti = F.myTier();
    const mul = ti.c === 'TR' ? D.costMul.TR[ti.t - 1] : D.costMul.abroad;
    const camp = months === 3 && S.campaign && S.campaign.until >= S.t;
    return Math.round(it.price * Math.max(0.6, mul) * (camp ? 2 : months) / 100) * 100;
  };
  F.buySub = function (id, months) {
    const S = F.S, P = S.P;
    const it = F.item(id);
    if (!it || !it.sub) return { err: 'Bulunamadı.' };
    const price = F.subPrice(it, months);
    if (P.money < price) return { err: 'Bunun için ' + F.money(price - P.money) + ' daha lazım.' };
    P.money -= price;
    F.bankLog('Abonelik: ' + it.name, -price);
    P.subs = P.subs || [];
    const cur = P.subs.find((x) => x.id === id);
    if (cur) cur.left += months * 4; else P.subs.push({ id, left: months * 4 });
    return { ok: true, msg: it.name + ' · ' + months * 4 + ' hafta' };
  };
  F.buy = function (id, target) {
    const S = F.S, P = S.P;
    const it = F.item(id);
    if (!it) return { err: 'Ürün bulunamadı.' };
    const price = F.itemPrice(it);
    if (price == null) return { err: 'Memleketinin kulübü şu an liglerde yok.' };
    if (!it.consumable && P.owned.includes(id)) return { err: 'Bu zaten sende var.' };
    if (P.money < price) return { err: 'Bunun için ' + F.money(price - P.money) + ' daha lazım.' };
    if (it.gift === 'partner' && !(S.partner && S.partner.stage > 0)) return { err: 'Hediye verecek bir partnerin yok.' };
    P.money -= price;
    F.bankLog('Satın alma: ' + it.name, -price);
    if (!it.consumable) P.owned.push(id);
    const fx = Object.assign({}, it.fx || {});
    if (it.flag) fx.flag = it.flag;
    const deltas = F.fx(fx);
    if (it.special === 'kulup') {
      const t = F.homeClub();
      S.ownedClub = t.id;
      S.flags.kulup_sahibi = 1;
      F.addAlbum(t.name + ' artık senin. Çocukluk kulübünü satın aldın.', 'kupa');
      F.addFeed({ who: 'Spor Haber', t: F.tpl('Tarihi an: {adsoyad}, memleketi ' + t.name + ' kulübünü satın aldı!'), kind: 'news', likes: Math.round(P.followers * 0.4 + 10000) });
      deltas.push(...F.fx({ sohret: 10, 'r.memleket': 50, 'r.taraftar': 10 }));
    }
    if (it.feed) F.addFeed({ t: F.tpl(F.pick(D.social.buy[it.feed] || D.social.buy.luks)), kind: it.lux >= 4 ? 'hate' : 'fan' });
    if (it.lux >= 4 && P.life.form < -1) { deltas.push(...F.fx({ 'r.taraftar': -4, 'r.hoca': -2 })); }
    if (it.lux >= 3 && !S.flags.ilk_luks) { S.flags.ilk_luks = 1; F.addAlbum('İlk büyük harcama: ' + it.name + '.', 'luks'); }
    if (it.risk) S.seeds.push({ id: it.risk, at: S.t + F.ri(3, 15), p: 0.5 });
    return { deltas, r: it.name + ' artık senin.' };
  };
  F.sell = function (id) {
    const S = F.S, P = S.P;
    const i = P.owned.indexOf(id);
    if (i < 0) return { err: 'Bu sende yok.' };
    const it = F.item(id);
    if (it.special === 'kulup') return { err: 'Kulübü satmak mı? Memleket seni affetmez.' };
    P.owned.splice(i, 1);
    const v = Math.round(it.price * 0.5);
    P.money += v;
    F.bankLog('Satış: ' + it.name, v);
    return { deltas: [{ k: 'para', label: 'Para', v, money: true }], r: it.name + ' satıldı.' };
  };

  /* =========================================================
     BAŞARIMLAR (nesiller boyu saklanır)
     ========================================================= */
  D.achievements = [
    { id: 'ilkmac', name: 'İlk düdük', desc: 'Profesyonel ilk maçına çık.', test: (S, P) => P.career.apps >= 1 },
    { id: 'ilkgol', name: 'İlk gol', desc: 'Kariyerinin ilk golünü at.', test: (S, P) => P.career.goals >= 1 },
    { id: 'hattrick', name: 'Hat-trick', desc: 'Bir maçta üç gol at.', test: (S) => !!S.flags.hattrick },
    { id: 'gol50', name: 'Golcü', desc: 'Kariyerinde 50 gol.', test: (S, P) => P.career.goals >= 50 },
    { id: 'gol150', name: 'Gol makinesi', desc: 'Kariyerinde 150 gol.', test: (S, P) => P.career.goals >= 150 },
    { id: 'mac100', name: 'Yüzüncü maç', desc: '100 maça çık.', test: (S, P) => P.career.apps >= 100 },
    { id: 'mac300', name: 'Emektar', desc: '300 maça çık.', test: (S, P) => P.career.apps >= 300 },
    { id: 'kaptan', name: 'Bant kolunda', desc: 'Takım kaptanı ol.', test: (S) => !!S.flags.kaptan },
    { id: 'milli', name: 'Ay yıldızlı', desc: 'Milli takım formasını giy.', test: (S, P) => P.career.caps >= 1 },
    { id: 'milli25', name: 'Milli emektar', desc: '25 milli maç.', test: (S, P) => P.career.caps >= 25 },
    { id: 'superlig', name: 'Süper Lig', desc: 'Süper Lig\'de forma giy.', test: (S, P) => P.career.apps >= 1 && F.myTier().c === 'TR' && F.myTier().t === 1 },
    { id: 'bal_sl', name: 'Tarladan zirveye', desc: 'BAL\'da başlayıp Süper Lig\'e ulaş.', test: (S, P) => ['koy', 'balikci', 'gec'].includes(P.origin) && F.myTier().c === 'TR' && F.myTier().t === 1 },
    { id: 'yurtdisi', name: 'Gurbet', desc: 'Yurt dışında bir kulübe transfer ol.', test: (S) => !!S.flags.yurtdisi && S.P.origin !== 'gurbetci' },
    { id: 'sampiyon', name: 'Şampiyon', desc: 'Bir lig şampiyonluğu kazan.', test: (S, P) => P.career.titles.length >= 1 },
    { id: 'yukselis', name: 'Yükseliş', desc: 'Takımınla üst lige çık.', test: (S, P) => P.career.promotions >= 1 },
    { id: 'evli', name: 'Dünya evi', desc: 'Evlen.', test: (S) => !!S.partner && S.partner.stage >= 4 },
    { id: 'baba', name: 'Baba', desc: 'Çocuk sahibi ol.', test: (S) => S.kids.length >= 1 },
    { id: 'luks', name: 'Şatafat', desc: 'Yat, yalı ya da jet sahibi ol.', test: () => F.luxLevel() >= 6 },
    { id: 'kulup', name: 'Patron', desc: 'Memleketinin kulübünü satın al.', test: (S) => !!S.flags.kulup_sahibi },
    { id: 'okul', name: 'Hayırsever', desc: 'Memleketine okul yaptır.', test: (S) => !!S.flags.okul_yaptirdi },
    { id: 'durust', name: 'Temiz futbol', desc: 'Şike teklifini reddet.', test: (S) => !!S.flags.sikeyi_reddetti },
    { id: 'takip100', name: 'Fenomen', desc: '100 bin takipçiye ulaş.', test: (S, P) => P.followers >= 100000 },
    { id: 'takip1m', name: 'Süperstar', desc: '1 milyon takipçiye ulaş.', test: (S, P) => P.followers >= 1e6 },
    { id: 'milyar', name: 'Milyarder', desc: 'Bakiyen 1 milyar ₺\'yi geçsin.', test: (S, P) => P.money >= 1e9 },
    { id: 'gocebe', name: 'Göçebe', desc: '5 farklı kulüpte oyna.', test: (S, P) => P.career.clubs.length >= 5 },
    { id: 'sadik', name: 'Tek forma', desc: 'Aynı kulüpte 5 sezon geçir.', test: (S, P) => { const s = P.career.seasons.slice(-5); return s.length === 5 && s.every((x) => x.club === s[0].club); } },
    { id: 'nesil2', name: 'Soyadı yaşıyor', desc: 'İkinci nesille oyna.', test: (S) => S.gen >= 2 },
    { id: 'nesil3', name: 'Hanedan', desc: 'Üçüncü nesille oyna.', test: (S) => S.gen >= 3 }
  ];
  F.checkAch = function () {
    const S = F.S;
    if (!S.ach) S.ach = {};
    if (!S.newAch) S.newAch = [];
    D.achievements.forEach((a) => {
      if (S.ach[a.id]) return;
      let ok = false;
      try { ok = a.test(S, S.P); } catch (e) { ok = false; }
      if (ok) { S.ach[a.id] = { year: S.year, name: S.P.name + ' ' + S.P.surname }; S.newAch.push(a.name); F.addDM('FORMA', 'Başarım açıldı: ' + a.name + ' — ' + a.desc); }
    });
  };

  /* ---------- Emeklilik kararları (arayüzden) ---------- */
  F.retireDecision = function (yes) {
    const S = F.S;
    S.queue.shift();
    if (!yes) { F.processAuto(); return; }
    F.retire();
    S.queue = [{ type: 'heir' }];
  };
  F.chooseHeir = function (i, pos) {
    const S = F.S;
    if (i === 'end') { S.ended = true; S.queue = [{ type: 'gameover' }]; return; }
    S.heirPos = pos || null;
    F.nextGeneration(i);
  };
  F.setRole = function (r) {
    const P = F.S.P;
    if (!D.roles[r]) return;
    P.role = r; P.pos = D.roles[r].grp; P.playRole = null;
    F.makeDevPlan();
    F.checkRoleFit();
  };

  /* =========================================================
     GÜNÜN GÜNDEMİ (gerçek gün başına bir kez)
     ========================================================= */
  F.dailyCheck = function (dayKey) {
    const S = F.S;
    if (!S || S.ended || S.lastDay === dayKey) return false;
    S.lastDay = dayKey;
    if (S.queue.length) return false;
    const pool = D.events.filter((e) => e.daily && F.canFire(e, true));
    const ev = F.pick(pool);
    if (!ev) return false;
    const step = F.makeEventStep(ev.id);
    step.daily = true;
    S.queue.push(step);
    return true;
  };
})(typeof window !== 'undefined' ? window : globalThis);
