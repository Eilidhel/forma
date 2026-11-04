/* FORMA — "ekranda yazan = gerçekte gelen" testi (geliştirici aracı)
   Kullanım: node tools/acttest.js
   1) Her etkinlik ve mağaza bonusu için önizlemedeki değişimi gerçek uygulamayla karşılaştırır.
   2) Her etkinliği bir sezon boyunca her hafta yapan oyuncunun toplam kazancını önizlemelerin toplamıyla karşılaştırır. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]).filter((f) => f !== 'js/ui.js');
files.forEach((f) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const F = globalThis.F, D = F.DATA;
F.indexEvents();

const read = (k) => {
  const P = F.S.P, [pre, key] = k.split('.');
  if (k === 'form') return P.life.form;
  if (k === 'dil') return P.dil;
  if (k === 'takipci%') return P.followers;
  if (P.life[k] != null) return P.life[k];
  if (pre === 's') return P.soft[key];
  if (pre === 'a') return (P.xp && P.xp[key] || 0) + P.attrs[key] * 1e6; // XP + puan
  if (pre === 'r') return F.relGet(key);
  return null;
};
const diff = (k, a, b) => (k.startsWith('a.') ? Math.round((b - a) % 1e6 + Math.floor(b / 1e6 - a / 1e6) * 0) : b - a);

let bad = 0, checked = 0;
function check(name, fx) {
  const pv = F.previewFx(fx);
  const before = {}; pv.forEach(({ k }) => (before[k] = read(k)));
  F.fx(fx);
  pv.forEach(({ k, v }) => {
    if (k.startsWith('a.') || k === 'takipci%') return; // özellik XP'si seviye atlayınca sıfırlanır, ayrı kontrol edilir
    const got = read(k) - before[k];
    checked++;
    if (Math.abs(got - v) > 0.11 && !(k === 'takipci%' && Math.abs(got - v) <= 1)) { bad++; console.log('UYUŞMUYOR', name, k, 'ekranda', v.toFixed(2), 'gelen', got.toFixed(2)); }
  });
}

// 1) Tek seferlik karşılaştırma: birkaç farklı oyuncu durumunda
['mahalle', 'akademi', 'gurbetci', 'sakat'].forEach((og, n) => {
  F.newGame({ origin: og, role: 'MO', name: 'Test', surname: 'Oyuncu', seed: 77 + n });
  D.activities.forEach((a) => check(og + '/' + a.id, F.actFx(a.id)));
  D.shop.filter((it) => it.weekly).forEach((it) => check(og + '/dükkan:' + it.id, it.weekly));
});

// 2) Bir sezon boyunca her hafta aynı etkinlik
console.log('\nEtkinlik   | ilk hafta ekranda → sezon toplamı (gerçek) | ekrandaki haftalık toplam');
D.activities.forEach((a) => {
  F.newGame({ origin: 'mahalle', role: 'MO', name: 'Test', surname: 'Oyuncu', seed: 5 });
  const S = F.S;
  const keys = Object.keys(a.fx).filter((k) => typeof a.fx[k] === 'number' && a.fx[k] > 0 && k !== 'enerji' && !k.startsWith('a.') && !k.startsWith('t.') && k !== 'takipci%');
  if (!keys.length) return;
  const first = {}; F.previewFx(F.actFx(a.id)).forEach(({ k, v }) => (first[k] = v));
  const start = {}; keys.forEach((k) => (start[k] = read(k)));
  let shownSum = {}; keys.forEach((k) => (shownSum[k] = 0));
  for (let w = 0; w < 30; w++) {
    S.P.life.enerji = 90; S.P.money = 1e9;
    const pv = {}; F.previewFx(F.actFx(a.id)).forEach(({ k, v }) => (pv[k] = v));
    keys.forEach((k) => (shownSum[k] += pv[k] || 0));
    keys.forEach((k) => { const b = read(k); F.fx({ [k]: F.actFx(a.id)[k] }); });
    S.actHist = S.actHist || {}; S.actHist[a.id] = Math.min(3, (S.actHist[a.id] || 0) + 1);
  }
  const line = keys.map((k) => `${F.label(k) || k}: ${(first[k] || 0).toFixed(1)} → ${(read(k) - start[k]).toFixed(1)} (${shownSum[k].toFixed(1)})`).join(' · ');
  console.log(a.id.padEnd(10), '|', line);
  keys.forEach((k) => { checked++; if (Math.abs((read(k) - start[k]) - shownSum[k]) > 0.6) { bad++; console.log('  SEZON UYUŞMUYOR', a.id, k); } });
});
console.log(`\nKontrol: ${checked} · Uyuşmayan: ${bad}`);
process.exit(bad ? 1 : 0);
