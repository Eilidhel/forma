/* FORMA — paylaşım analizi, kredi ve mevki istekleri testi */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
[...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]).filter((f) => f !== 'js/ui.js').forEach((f) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const F = globalThis.F, D = F.DATA; F.indexEvents();
let fail = 0; const ok = (c, m) => { console.log((c ? 'TAMAM ' : 'HATA  ') + m); if (!c) fail++; };
F.newGame({ origin: 'mahalle', role: 'SLB', name: 'T', surname: 'O', seed: 3 });
const S = F.S;
[['Bugün takım olarak çok çalıştık, emeği geçen herkese teşekkürler 💪 #birlikte', 'mutevazi'],
 ['Ligin en iyisi benim, kimse durduramaz. Kral geri döndü!', 'iddiali'],
 ['Annem ve babam tribündeydi, bu gol sizin için ❤️', 'duygusal'],
 ['Hakem bugün maçı çaldı, soygun var!', null],
 ['Rakipler ağlasınlar, ezdik geçtik aptallar', 'sert'],
 ['ok', null]].forEach(([t, want]) => { const a = F.analyzePost(t); console.log('   "' + t + '" → ' + a.label + ' ' + a.eng + '/100 · ' + a.notes.map((n) => n[1]).slice(0, 2).join(' | ')); if (want) ok(a.tone === want, 'ton ' + want); });
const r = F.makeCustomPost('mac', 'Takıma teşekkürler, hep beraber daha iyisini yapacağız 💪');
ok(S.feed[0].me && S.feed[0].t.includes('teşekkürler'), 'Kendi yazdığın paylaşım akışta: ' + r.r);
// beğeni
// beğeni bazen hiç takipçi getirmez; birkaç beğenide toplam artmalı
const f0 = S.P.followers; let tot = 0;
for (let i = 0; i < 6; i++) { F.addFeed({ who: 'Taraftar', t: 'Harika maçtı ' + i, kind: 'news' }); tot += F.likePost(S.feed[0].id).gain; }
ok(tot > 0 && S.P.followers === f0 + tot, 'Altı beğeni toplam takipçi kazandırdı: +' + tot);
// kredi
const lim = F.loanLimit(); const m0 = S.P.money;
const tk = F.takeLoan(lim, 0);
ok(tk.ok && S.P.money === m0 + lim, 'Kredi çekildi: ' + lim + ', haftalık taksit ' + tk.q.weekly + ', toplam ' + tk.q.total);
S.P.money = 1e7; let paid = 0; for (let i = 0; i < 12; i++) paid += F.loanWeekly({ notes: [] });
ok(!S.loan, '12 haftada kredi kapandı, ödenen ' + paid);
// mevki istekleri: 3-4-3 oynayan takımda sol bek
const t = F.myTeam(); t.formation = '3-4-3'; S.P.playRole = null; S.queue = [];
F.checkRoleFit();
ok(S.roleOffer && S.queue.some((q) => q.id === 'hoca_mevki_istegi'), '3-4-3 takımda sol beke hoca isteği: ' + (S.roleOffer || []).map((r) => D.roles[r].name).join(' / '));
F.ACT.playrole(0);
ok(F.curRole() === 'SLO' || F.curRole() === 'STP', 'Yeni mevki: ' + D.roles[F.curRole()].name + ', uyum %' + Math.round(F.roleFit(F.curRole()) * 100));
// 5-3-2: sol bek otomatik sol kanat beke
t.formation = '5-3-2'; S.P.playRole = null; S.queue = []; F.checkRoleFit();
ok(F.curRole() === 'SLKB' && !S.queue.length, '5-3-2 takımda sol bek sormadan sol kanat beke geçti');
// geçici mevki
S.tempOffer = 'STP'; F.ACT.temprole(); ok(F.curRole() === 'STP', 'Sakatlık yüzünden geçici stoper');
process.exit(fail ? 1 : 0);
