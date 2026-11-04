/* FORMA — milli ara testi: aynı hafta hem lig hem milli maç olmamalı, lig yine eksiksiz bitmeli */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
[...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]).filter((f) => f !== 'js/ui.js').forEach((f) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const F = globalThis.F; F.indexEvents();
let both = 0, natWeeks = 0, breaks = 0, seasonsOk = 0, seasons = 0;
for (let i = 0; i < 20; i++) {
  F.newGame({ origin: 'akademi', role: 'SF', name: 'T', surname: 'O', seed: 50 + i });
  const S = F.S;
  S.P.attrs = Object.fromEntries(Object.keys(S.P.attrs).map((k) => [k, 85])); // milli takıma çağrılsın
  let guard = 0, lastSeason = S.season, played = 0;
  while (guard++ < 3000 && S.season < 3) {
    if (!S.queue.length) {
      const wasBreak = F.isNatBreak();
      F.beginWeek();
      const types = S.queue.filter((x) => x.type === 'match');
      if (types.some((x) => x.nat) && types.some((x) => !x.nat)) both++;
      if (types.some((x) => x.nat)) natWeeks++;
      if (wasBreak) breaks++;
      continue;
    }
    const st = S.queue[0];
    if (st.type === 'match') { const m = F.matchStart(); while (m.i < m.moments.length) F.matchChoose(m.moments.length ? def(m) : 0); if (!m.nat && m.played !== undefined) played++; F.matchFinish(); F.advance(); }
    else if (st.type === 'ev') { while (!st.done) { const ev = F.EV[st.id]; const node = ev.nodes[st.node]; const o = F.visibleOptions(node).findIndex((x) => !x.locked); if (o < 0) { st.done = true; break; } F.choose(o); } F.advance(); }
    else if (st.type === 'press') { while (!st.done) F.pressAnswer(0); F.advance(); }
    else if (st.type === 'post') { F.makePost(F.postPhotos()[0].id, 'sessiz'); F.advance(); }
    else if (st.type === 'goals') { F.chooseGoals(F.goalOptions().slice(0, 3).map((g) => g.id)); F.advance(); }
    else if (st.type === 'offers') { S.offers = []; F.advance(); }
    else if (st.type === 'retire') F.retireDecision(false);
    else F.advance();
    if (S.season !== lastSeason) { seasons++; if (played >= S.league.fixtures.length - 0) seasonsOk++; played = 0; lastSeason = S.season; }
  }
}
function def(m) { return 0; }
console.log(`Milli maçlı hafta: ${natWeeks} · milli ara: ${breaks} · aynı hafta lig + milli: ${both} · eksiksiz biten sezon: ${seasonsOk}/${seasons}`);
process.exit(both ? 1 : 0);
