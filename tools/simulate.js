/* FORMA — kariyer simülatörü (geliştirici aracı)
   Kullanım: node tools/simulate.js [kariyer sayısı] [sezon sınırı]
   Botlar rastgele seçim yapar; çeşitlilik, ekonomi ve hata raporu üretir. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const FILES = ['js/core.js', 'js/data/world.js', 'js/data/life.js', 'js/data/social.js', 'js/data/roles.js', 'js/data/positions.js', 'js/data/attack.js', 'js/data/life2.js', 'js/data/events_origin.js', 'js/data/events_club.js', 'js/data/events_life.js', 'js/data/events_match.js', 'js/data/events_extra.js', 'js/data/events_story.js', 'js/data/events_news.js', 'js/data/events_gen.js', 'js/data/events_dost.js', 'js/art.js', 'js/engine.js', 'js/systems.js', 'js/social2.js', 'js/stats.js', 'js/squad.js', 'js/progress.js', 'js/msgqueue.js', 'js/tournaments.js', 'js/social3.js', 'js/life3.js'];
FILES.forEach((f) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const F = globalThis.F;
F.DEBUG = true;
F.indexEvents();

// NaN izleyici: her fonksiyon çağrısından sonra kritik değerleri kontrol eder
if (process.env.NANCHECK) {
  ['fx', 'endWeek', 'buy', 'acceptOffer', 'matchFinish', 'makePost', 'pressAnswer', 'choose', 'beginWeek', 'endSeason', 'reqAnswer'].forEach((name) => {
    const orig = F[name];
    F[name] = function (...a) {
      const r = orig.apply(this, a);
      const P = F.S && F.S.P;
      if (P) {
        const bad = Object.entries(P.life).concat([['money', P.money], ['followers', P.followers], ['wage', P.contract.wage]]).find(([, v]) => Number.isNaN(v));
        if (bad) { console.log('NaN', bad, 'after', name, JSON.stringify(a).slice(0, 300), JSON.stringify(F.S.queue[0] || {}).slice(0, 200)); process.exit(1); }
      }
      return r;
    };
  });
}
const N = +process.argv[2] || 200;
const MAXS = +process.argv[3] || 12;

// Çözülmemiş şablon yakalayıcı
const unresolved = {};
const origTpl = F.tpl;
F.tpl = function (s) {
  const r = origTpl(s);
  if (typeof r === 'string') { const m = r.match(/\{[a-zA-Z_|]+\}/g); if (m) m.forEach((x) => (unresolved[x] = (unresolved[x] || 0) + 1)); }
  return r;
};
const warns = {};
const ow = console.warn;
console.warn = (...a) => { const k = a.join(' '); warns[k] = (warns[k] || 0) + 1; };

const D = F.DATA;
const rnd = Math.random;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const results = [];
const errors = [];
const eventCount = {};
const traj = [];
const goalStats = {};
// her hedef kaç kez seçildi ve kaç kez tutturuldu
F.DATA.goals.forEach((g) => { const t = g.test; g.test = (st, S) => { const ok = t(st, S); if (ok && goalStats[g.id]) goalStats[g.id][1]++; return ok; }; });

function botPlan() {
  const S = F.S, P = S.P;
  const w = D.positions.find((p) => p.id === P.pos).w;
  const keys = Object.keys(w);
  if (process.env.BEST) { // en verimli oyuncu: mevkinin en düşük özelliğini, mümkünse ağır çalışır
    const low = keys.slice().sort((a, b) => P.attrs[a] - P.attrs[b])[0];
    S.plan.train = P.life.enerji < 35 ? 'dinlenme' : low;
    S.plan.load = P.life.enerji > 60 ? 'agir' : 'normal';
  } else {
  S.plan.train = P.life.enerji < 40 ? 'dinlenme' : rnd() < 0.15 ? 'taktik' : pick(keys);
  S.plan.load = P.life.enerji > 70 ? pick(['normal', 'agir']) : pick(['hafif', 'normal']);
  }
  if (rnd() < 0.12) {
    const items = D.shop.filter((it) => { const pr = F.itemPrice(it); return pr != null && pr > 0 && pr < P.money * 0.4 && !P.owned.includes(it.id); });
    if (items.length) F.buy(pick(items).id);
  }
  const acts = F.availableActivities().map((a) => a.id);
  S.plan.acts = [];
  for (let i = 0; i < F.slots(); i++) { const a = pick(acts); if (!S.plan.acts.includes(a)) S.plan.acts.push(a); }
}

function runCareer(i) {
  const og = pick(D.origins);
  const role = pick(Object.keys(F.DATA.roles)); const pos = F.DATA.roles[role].grp;
  F.newGame({ origin: og.id, pos, role, name: 'Test', surname: 'Oyuncu', seed: 1000 + i * 7919 });
  const seen = new Set();
  let guard = 0;
  const startGen = 1;
  let seasons = 0;
  let lastSeason = F.S.season;
  (traj[0] = traj[0] || []).push(F.ovr());
  while (guard++ < 6000) {
    const S = F.S;
    if (S.ended) break;
    if (S.season !== lastSeason) { seasons++; lastSeason = S.season; if (S.gen === 1) (traj[seasons] = traj[seasons] || []).push(F.ovr()); }
    if (seasons >= MAXS && !S.queue.length) break;
    if (!S.queue.length) { botPlan(); F.beginWeek(); continue; }
    const st = S.queue[0];
    switch (st.type) {
      case 'goals': { const opts = F.shuffle(F.goalOptions()).slice(0, 3).map((g) => g.id); F.chooseGoals(opts); opts.forEach((g) => { goalStats[g] = goalStats[g] || [0, 0]; goalStats[g][0]++; }); F.advance(); break; }
      case 'ev': {
        seen.add(st.id); eventCount[st.id] = (eventCount[st.id] || 0) + 1;
        if (st.ringing) F.answerCall(rnd() < 0.8);
        let g2 = 0;
        while (!st.done && g2++ < 10) {
          const ev = F.EV[st.id];
          const node = ev.nodes[st.node];
          const opts = F.visibleOptions(node).map((o, idx) => ({ o, idx })).filter((x) => !x.o.locked);
          if (!opts.length) { st.done = true; break; }
          F.choose(pick(opts).idx);
        }
        F.advance();
        break;
      }
      case 'match': {
        const m = F.matchStart();
        while (m.i < m.moments.length) {
          if (m.halftime && m.i === Math.floor(m.moments.length / 2)) F.halftimeSpeech(pick(['sakin', 'atesli', 'sert']));
          const def = F.momentDef(m.moments[m.i].ref);
          F.matchChoose(Math.floor(rnd() * def.o.length));
        }
        F.matchFinish();
        F.advance();
        break;
      }
      case 'press': { while (!st.done) { const q = F.pressQ(st.qs[st.i]); F.pressAnswer(rnd() < 0.1 ? -1 : Math.floor(rnd() * q.o.length)); } F.advance(); break; }
      case 'post': { const ph = pick(F.postPhotos()).id; const tn = pick(D.postTones).id; F.makePost(ph, tn); F.advance(); break; }
      case 'summary': case 'seasonSummary': case 'natInfo': F.advance(); break;
      case 'offers': {
        const P = S.P;
        if (S.offers.length && (P.contract.years <= 0 || rnd() < 0.35)) {
          const idx = Math.floor(rnd() * S.offers.length);
          if (rnd() < 0.5) F.negotiate(idx, { wageMul: 1 + rnd() * 0.5, years: 3, guarantee: rnd() < 0.3, signing: rnd() * 0.3 });
          if (S.offers.length) F.acceptOffer(Math.min(idx, S.offers.length - 1));
        } else if (P.contract.years <= 0) { P.contract.years = 1; }
        F.advance();
        break;
      }
      case 'retire': F.retireDecision(st.forced || rnd() < 0.4); break;
      case 'heir': {
        const opts = F.heirOptions().filter((h) => h.available);
        if (F.S.gen < 3 && opts.length) F.chooseHeir(pick(opts).i, pick(['FV', 'OS', 'DF', 'KL'])); else F.chooseHeir('end');
        break;
      }
      case 'gameover': S.ended = true; break;
      default: throw new Error('Bilinmeyen adım ' + st.type);
    }
  }
  const S = F.S, P = S.P;
  return {
    origin: og.id, pos, seen, seenSize: seen.size, seasons, gen: S.gen, peak: P.peak, ovr: F.ovr(), money: P.money, age: P.age,
    apps: P.career.apps, goals: P.career.goals, titles: P.career.titles.length, clubs: P.career.clubs.length,
    tier: F.myTier().c + F.myTier().t, followers: P.followers, partner: S.partner ? S.partner.stage : 0, kids: S.kids.length,
    dyn: S.dynasty.length, lux: F.luxLevel(), guard
  };
}

const t0 = Date.now();
for (let i = 0; i < N; i++) {
  try { results.push(runCareer(i)); }
  catch (e) { errors.push({ i, msg: e.message, stack: e.stack.split('\n').slice(0, 5).join('\n'), step: F.S && F.S.queue[0] && JSON.stringify(F.S.queue[0]).slice(0, 200) }); }
}
const ms = Date.now() - t0;

// Rapor
const avg = (k) => (results.reduce((a, r) => a + r[k], 0) / results.length).toFixed(1);
const med = (k) => { const a = results.map((r) => r[k]).sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
let sim = 0, pairs = 0;
for (let i = 0; i < Math.min(results.length, 80); i++) for (let j = i + 1; j < Math.min(results.length, 80); j++) {
  const A = results[i].seen, B = results[j].seen;
  const inter = [...A].filter((x) => B.has(x)).length;
  const uni = new Set([...A, ...B]).size;
  if (uni) { sim += inter / uni; pairs++; }
}
const allIds = F.DATA.events.map((e) => e.id);
const never = allIds.filter((id) => !eventCount[id] && !id.startsWith('gun_'));
const top = Object.entries(eventCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log('=== FORMA simülasyon raporu ===');
console.log('Kariyer:', results.length, '| Hata:', errors.length, '| Süre:', ms + 'ms');
console.log('Olay sayısı:', allIds.length, '| Ortalama benzerlik (Jaccard):', (sim / Math.max(1, pairs) * 100).toFixed(1) + '%');
console.log('Kariyer başına görülen olay:', avg('seenSize'));
console.log('Güç gelişimi (sezon başı ort.):', traj.map((a, i) => i + ':' + Math.round(a.reduce((x, y) => x + y, 0) / a.length)).join(' '));
console.log('Hedef başarı (seçilme/başarı):', Object.keys(goalStats).sort().map((k) => k + ' ' + goalStats[k][1] + '/' + goalStats[k][0]).join(', '));
console.log('Sezon ort:', avg('seasons'), '| Zirve güç ort:', avg('peak'), 'medyan:', med('peak'), '| Son güç:', avg('ovr'));
console.log('Maç ort:', avg('apps'), '| Gol ort:', avg('goals'), '| Kupa ort:', avg('titles'), '| Kulüp ort:', avg('clubs'));
console.log('Para medyan:', F.money(med('money')), '| Takipçi medyan:', med('followers'), '| Lüks seviye ort:', avg('lux'));
console.log('Partner aşaması ort:', avg('partner'), '| Çocuk ort:', avg('kids'), '| Nesil ort:', avg('gen'));
const tiers = {}; results.forEach((r) => (tiers[r.tier] = (tiers[r.tier] || 0) + 1));
console.log('Son lig dağılımı:', JSON.stringify(tiers));
const byOrigin = {}; results.forEach((r) => { (byOrigin[r.origin] = byOrigin[r.origin] || []).push(r.peak); });
console.log('Köken başına zirve güç:', Object.entries(byOrigin).map(([k, v]) => k + ':' + (v.reduce((a, b) => a + b, 0) / v.length).toFixed(0)).join(' '));
console.log('Yeni olaylar:', Object.keys(eventCount).filter((k) => /^(tac_|abs_|yedek_|kadrodisi)/.test(k)).map((k) => k + ':' + eventCount[k]).join(' '));
console.log('En sık olaylar:', top.map(([k, v]) => k + '(' + v + ')').join(', '));
console.log('Hiç çıkmayan olaylar (' + never.length + '):', never.join(', '));
console.log('Çözülmemiş şablonlar:', JSON.stringify(unresolved));
console.log('Uyarılar:', JSON.stringify(Object.entries(warns).slice(0, 20)));
errors.slice(0, 5).forEach((e) => console.log('\nHATA #' + e.i + ': ' + e.msg + '\n' + e.stack + '\nAdım: ' + e.step));

// CI: hata varsa başarısız çık
if (errors.length) process.exit(1);
