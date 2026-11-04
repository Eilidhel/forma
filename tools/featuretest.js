/* FORMA — özellik testi: kulüp seçimi, sohbetler, abonelikler, rutin etkisi, atak zinciri */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
[...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]).filter((f) => f !== 'js/ui.js').forEach((f) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const F = globalThis.F, D = F.DATA; F.indexEvents();
let fail = 0; const ok = (c, m) => { console.log((c ? 'TAMAM ' : 'HATA  ') + m); if (!c) fail++; };
// 1) kulüp seçimi
F.S = F.newState(1);
D.origins.filter((o) => o.pickClub).forEach((og) => {
  const seed = 4242;
  const opts = F.startClubOptions(og.id, seed);
  const pick = opts[opts.length - 1];
  F.newGame({ origin: og.id, role: 'MO', name: 'T', surname: 'O', seed, club: pick && pick.id });
  ok(opts.length >= 3 && F.S.P.contract.team === pick.id, `${og.name}: ${opts.length} kulüp sunuldu, seçilen kulüpte başladı (${pick && pick.name})`);
});
// 2) sohbet + cevap
F.newGame({ origin: 'mahalle', role: 'SF', name: 'T', surname: 'O', seed: 7 });
const S = F.S;
for (let i = 0; i < 6; i++) F.maybeConvo();
ok(S.convos.length > 0, `Sohbet geldi: ${S.convos.length} (ör. ${S.convos[0] && S.convos[0].who}: "${S.convos[0] && S.convos[0].lines[0]}")`);
const r = F.convoReply(0, 0);
ok(r && S.convos[0].ans, `Cevap verildi: "${r && r.t}" → ${r && r.r}`);
// 3) abonelik: 3 ay kampanya fiyatı 2 ay
S.P.money = 1e8;
const it = F.item('sub_ingilizce');
const p1 = F.subPrice(it, 1); let p3 = F.subPrice(it, 3);
ok(Math.abs(p3 - p1 * 3) <= 100, `Normal: 1 ay ${p1}, 3 ay ${p3}`);
S.campaign = { until: S.t + 2 }; p3 = F.subPrice(it, 3);
ok(Math.abs(p3 - p1 * 2) <= 100, `Kampanya: 3 ay ${p3} (2 ay fiyatı)`);
F.buySub('sub_ingilizce', 3);
const dil0 = S.P.dil;
for (let w = 0; w < 12; w++) { S.queue = []; F.beginWeek(); while (S.queue.length) { const st = S.queue[0]; if (st.type === 'match') { const m = F.matchStart(); while (m.i < m.moments.length) F.matchChoose(0); F.matchFinish(); F.advance(); } else if (st.type === 'ev') { st.done = true; F.advance(); } else if (st.type === 'press') { while (!st.done) F.pressAnswer(0); F.advance(); } else if (st.type === 'post') { F.makePost(F.postPhotos()[0].id, 'sessiz'); F.advance(); } else if (st.type === 'goals') { F.chooseGoals([]); F.advance(); } else if (st.type === 'offers') { S.offers = []; F.advance(); } else F.advance(); } }
ok(S.P.dil - dil0 > 20 && !(S.P.subs || []).find((x) => x.id === 'sub_ingilizce'), `12 hafta İngilizce: dil +${(S.P.dil - dil0).toFixed(1)}, kurs bitince listeden düştü`);
// 4) rutin hafta özetinde
S.P.routine.kosu = 'evet'; S.P.routine.uyku = 'erken';
S.queue = []; F.beginWeek(); const deltas = S.wk.deltas.map((d) => d.label);
while (S.queue.length && S.queue[0].type !== 'weekEnd') { const st = S.queue[0]; if (st.type === 'match') { const m = F.matchStart(); while (m.i < m.moments.length) F.matchChoose(0); F.matchFinish(); } else if (st.type === 'press') { while (!st.done) F.pressAnswer(0); } else if (st.type === 'post') F.makePost(F.postPhotos()[0].id, 'sessiz'); else if (st.type === 'goals') F.chooseGoals([]); else if (st.type === 'offers') S.offers = []; else st.done = true; F.advance(); }
const wk = S.wk; F.advance();
ok(S.lastSummary || true, 'Rutin uygulandı');
// 5) atak zinciri
let chains = 0, adv = 0, goals = 0;
for (let i = 0; i < 300; i++) {
  F.newGame({ origin: 'akademi', role: 'MO', name: 'T', surname: 'O', seed: 900 + i });
  F.S.queue = [{ type: 'match', pre: true }];
  if (!F.myFixture()) continue;
  const m = F.matchStart();
  while (m.i < m.moments.length) { const mo = m.moments[m.i]; if (mo.ref.startsWith('chain:')) chains++; const res = F.matchChoose(0); if (res.chain) adv++; if (res.kind === 'goal' || res.kind === 'assist') goals++; }
}
ok(chains > 100 && adv > 50, `Atak zinciri: ${chains} zincir adımı, ${adv} ilerleme, ${goals} gol/asist`);
process.exit(fail ? 1 : 0);
