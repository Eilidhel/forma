/* FORMA — hikâye listesi üretici: node tools/storylist.js > HIKAYELER.md */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]).filter((f) => /events_|data\/(life|social|roles)/.test(f) || f === 'js/core.js' || f === 'js/data/world.js');
const groups = {};
const ctxF = {};
files.forEach((f) => {
  const before = (globalThis.F && globalThis.F.DATA && globalThis.F.DATA.events) ? globalThis.F.DATA.events.length : 0;
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
  const E = globalThis.F.DATA.events || [];
  E.slice(before).forEach((e) => (ctxF[e.id] = f));
});
const E = globalThis.F.DATA.events;
const NAMES = {
  'js/data/events_origin.js': 'Köken hikâyeleri', 'js/data/events_club.js': 'Kulüp ve kariyer', 'js/data/events_life.js': 'Hayat, aile ve gündelik',
  'js/data/events_match.js': 'Maç öncesi ve sonrası', 'js/data/events_extra.js': 'Taktik, rakip ve absürt (1. paket)', 'js/data/events_story.js': 'Hikâye paketi (2. paket)', 'js/data/events_news.js': 'Haberlerden esinlenen (3. paket)'
};
const prefix = { tac_: 'Hoca taktikleri', abs_: 'Absürt ve seyrek', alt_: 'Alt lig gerçekleri', ust_: 'Üst lig', yd_: 'Yurt dışı', genc_: 'Gençlik yılları', olgun_: 'Olgunluk yılları', vet_: 'Veteranlık', aile_: 'Aile', takim_: 'Takım içi', saglik_: 'Sağlık', para_: 'Para', medya_: 'Medya', memleket_: 'Memleket', tr_: 'Transfer ve sözleşme', dis_: 'Disiplin ve hoca', tk_: 'Soyunma odası', fan_: 'Taraftar', md_: 'Medya ve sosyal medya', mac_: 'Sahadaki tuhaflıklar', hy_: 'Hayat', pr_: 'Para ve yatırım', ml_: 'Milli takım', pt_: 'Aşk', ai_: 'Aile', mk_: 'Memleket', pre_: 'Maç öncesi', post_: 'Maç sonrası', gun_: 'Günün gündemi', partner_: 'Aşk ve partner', nesil_: 'Nesil', intro_: 'Kariyer başlangıcı', act_: 'Etkinlik sonrası', nadir_: 'Nadir anlar' };
E.forEach((e) => {
  const f = ctxF[e.id] || '?';
  const p = Object.keys(prefix).find((k) => e.id.startsWith(k));
  const g = (NAMES[f] || f) + (p ? ' · ' + prefix[p] : '');
  (groups[g] = groups[g] || []).push(e);
});
const text = (e) => (e.t || (e.nodes && e.nodes.start && e.nodes.start.t) || '').replace(/\s+/g, ' ');
let out = `# FORMA hikâye listesi\n\nToplam **${E.length}** olay. Bu liste oyunun veri dosyalarından otomatik üretildi (\`node tools/storylist.js\`).\n\n`;
Object.keys(groups).forEach((g) => {
  out += `## ${g} (${groups[g].length})\n\n`;
  groups[g].forEach((e) => { const t = text(e); out += `- **${e.id}**: ${t.length > 150 ? t.slice(0, 147) + '…' : t}\n`; });
  out += '\n';
});
process.stdout.write(out);
