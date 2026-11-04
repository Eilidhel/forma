/* FORMA — yerel sunucu: node tools/serve.js (http://localhost:5173)
   Oyunu bilgisayarında çalıştırır. "Güncellemeyi denetle" düğmesi buradaki /__update ucunu kullanır:
   GitHub'dan en yeni sürümü (git pull) indirir, oyun sayfası kendini yeniler. Kayıtların tarayıcıda kalır. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };
const PORT = +process.env.PORT || 5173;
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  // yerel sunucu mu? (oyun güncelleme düğmesini buna göre gösterir)
  if (url === '/__ping') return json(res, 200, { local: true, git: fs.existsSync(path.join(ROOT, '.git')) });
  // GitHub'dan güncelle: sadece bu bilgisayardan gelen POST isteği
  if (url === '/__update') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, err: 'POST gerekli' });
    if (!fs.existsSync(path.join(ROOT, '.git'))) return json(res, 400, { ok: false, err: 'Bu klasör GitHub deposundan indirilmemiş (git yok).' });
    return execFile('git', ['pull', '--ff-only'], { cwd: ROOT, timeout: 60000 }, (err, stdout, stderr) => {
      if (err) return json(res, 500, { ok: false, err: (stderr || err.message).trim() });
      json(res, 200, { ok: true, out: stdout.trim(), serverChanged: /tools\/serve\.js/.test(stdout) });
    });
  }
  const file = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!file.startsWith(ROOT) || file.includes(path.sep + '.git')) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Bulunamadı'); }
    let body = data;
    // index.html yayında iskeletle sarılır; yerelde de aynı başlığı ekle
    if (file.endsWith('index.html')) body = '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>FORMA</title></head><body>' + data + '</body></html>';
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  });
}).listen(PORT, '127.0.0.1', () => console.log('FORMA çalışıyor: http://localhost:' + PORT + '  (kapatmak için bu pencereyi kapat)'));
