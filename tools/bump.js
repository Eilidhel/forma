/* FORMA — yeni sürüm numarası: node tools/bump.js 1.17.0 "Değişiklik notu" "Başka bir not"
   js/version.js ve version.json birlikte güncellenir. Sonra commit + push yeterli: oyuncular
   "Güncellemeyi denetle" ile yeni sürümü görür. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const [ver, ...notes] = process.argv.slice(2);
if (!/^\d+\.\d+\.\d+$/.test(ver || '')) { console.error('Kullanım: node tools/bump.js 1.17.0 "not"'); process.exit(1); }
const vf = path.join(ROOT, 'js', 'version.js');
fs.writeFileSync(vf, fs.readFileSync(vf, 'utf8').replace(/F\.VERSION = '[^']+'/, `F.VERSION = '${ver}'`));
const date = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(ROOT, 'version.json'), JSON.stringify({ version: ver, date, notes }, null, 2) + '\n');
console.log('Sürüm', ver, 'hazır.');
