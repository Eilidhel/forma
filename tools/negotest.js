/* FORMA — pazarlık testi: karşı teklif her zaman kabul edilir, gerginlik birikir, aşırı istek masayı dağıtır */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
[...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]).filter((f) => f !== 'js/ui.js').forEach((f) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const F = globalThis.F; F.indexEvents();
let fail = 0, walks = 0, counterOk = 0, rounds = 0, n = 0;
for (let i = 0; i < 300; i++) {
  F.newGame({ origin: F.DATA.origins[i % F.DATA.origins.length].id, role: 'MO', name: 'T', surname: 'O', seed: 100 + i });
  const S = F.S;
  S.offers = [F.makeOffer ? F.makeOffer(F.myTeam().id, 'as') : null].filter(Boolean);
  if (!S.offers.length) { const o = { team: F.myTeam().id, wage: S.P.contract.wage, years: 2, role: 'as', league: 'x', renew: true }; S.offers = [o]; }
  n++;
  let terms = { wageMul: 1.6, years: 3, guarantee: true, signing: 0.5 };
  for (let r = 0; r < 12; r++) {
    rounds++;
    const res = F.negotiate(0, terms);
    if (res.status === 'walk') { walks++; break; }
    if (res.status === 'ok') break;
    // kulübün karşı teklifini aynen gönder: kabul edilmeli
    const res2 = F.negotiate(0, Object.assign({}, res.counter));
    if (res2.status !== 'ok') { fail++; console.log('KARŞI TEKLİF REDDEDİLDİ', JSON.stringify(res.counter)); }
    else counterOk++;
    break;
  }
}
// gerginlik: aynı aşırı isteği tekrar eden oyuncu sonunda masadan kalkılır
F.newGame({ origin: 'mahalle', role: 'MO', name: 'T', surname: 'O', seed: 9 });
F.S.offers = [{ team: F.myTeam().id, wage: 10000, years: 2, role: 'yedek', league: 'x' }];
let k = 0, last;
while (k++ < 20) { last = F.negotiate(0, { wageMul: 2, years: 5, guarantee: true, signing: 1 }); if (last.status !== 'counter') break; }
console.log(`Karşı teklif kabulü: ${counterOk}/${n} · reddedilen: ${fail} · ilk turda masadan kalkan: ${walks}`);
console.log(`Aşırı istekte ısrar: ${k}. turda "${last.status}" — ${last.msg}`);
process.exit(fail || last.status !== 'walk' ? 1 : 0);
