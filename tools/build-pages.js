/* FORMA — builds the installable web app (PWA) for GitHub Pages: node tools/build-pages.js
   Output: dist/ with a full index.html (manifest, icons, service worker), the game scripts and assets.
   The GitHub Actions workflow runs this on every push to main and deploys dist/ to Pages. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const copyDir = (src, dst, list) => {
  fs.mkdirSync(dst, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach((d) => {
    const s = path.join(src, d.name), t = path.join(dst, d.name);
    if (d.isDirectory()) copyDir(s, t, list);
    else { fs.copyFileSync(s, t); list.push(path.relative(DIST, t).split(path.sep).join('/')); }
  });
};
const files = [];
copyDir(path.join(ROOT, 'js'), path.join(DIST, 'js'), files);
copyDir(path.join(ROOT, 'icons'), path.join(DIST, 'icons'), files);
fs.copyFileSync(path.join(ROOT, 'version.json'), path.join(DIST, 'version.json')); files.push('version.json');

const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).version;

// Web app manifest
const manifest = {
  name: 'FORMA — Sahadan Hayata', short_name: 'FORMA', description: 'Futbol kariyeri ve hayat simülasyonu',
  lang: 'tr', start_url: './', scope: './', display: 'standalone', orientation: 'portrait',
  background_color: '#0c1410', theme_color: '#0d6b43',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
};
fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
files.push('manifest.webmanifest');

// Full HTML document around the game page (the repo's index.html is a body fragment)
const body = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const head = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>FORMA — Sahadan Hayata</title>
<meta name="description" content="Futbol kariyeri ve hayat simülasyonu. 13 başlangıç hikâyesi, 236 kulüp, 420+ olay.">
<meta name="theme-color" content="#0d6b43">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="FORMA">
<script>window.FORMA_WEB = true;</script>
</head>
<body>
`;
const tail = `
<script>
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(DIST, 'index.html'), head + body + tail);
files.push('index.html');

// Service worker: network first (always the newest version when online), cache fallback offline
const sw = `/* FORMA service worker ${version} */
const CACHE = 'forma-${version}';
const SHELL = ${JSON.stringify(['./', ...files])};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req, { cache: 'no-cache' }).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))));
});
`;
fs.writeFileSync(path.join(DIST, 'sw.js'), sw);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log('Built dist/ for version', version, '—', files.length + 2, 'files');
