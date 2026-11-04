/* FORMA — app icons without dependencies: node tools/make-icons.js
   Draws a green rounded tile with a white "F" and a yellow stripe, writes PNGs into icons/. */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const OUT = path.join(__dirname, '..', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
function png(size, px) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; for (let x = 0; x < size; x++) { const [r, g, b, a] = px(x, y); const o = y * (size * 4 + 1) + 1 + x * 4; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a; } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const GREEN = [13, 107, 67, 255], DARK = [8, 74, 46, 255], WHITE = [255, 255, 255, 255], GOLD = [242, 184, 75, 255], CLEAR = [0, 0, 0, 0];
// unit coordinates 0..1; `safe` shrinks the mark for maskable icons
function draw(size, { rounded, safe }) {
  const s = safe ? 0.62 : 0.78, off = (1 - s) / 2;
  const inRect = (u, v, x0, y0, x1, y1) => u >= x0 && u <= x1 && v >= y0 && v <= y1;
  return png(size, (x, y) => {
    const u = (x + 0.5) / size, v = (y + 0.5) / size;
    if (rounded) { const r = 0.2, cx = Math.min(Math.max(u, r), 1 - r), cy = Math.min(Math.max(v, r), 1 - r); if ((u - cx) ** 2 + (v - cy) ** 2 > r * r) return CLEAR; }
    // mark space
    const mu = (u - off) / s, mv = (v - off) / s;
    if (mu >= 0 && mu <= 1 && mv >= 0 && mv <= 1) {
      // blocky "F": stem + top bar + middle bar
      if (inRect(mu, mv, 0.22, 0.12, 0.42, 0.88) || inRect(mu, mv, 0.22, 0.12, 0.8, 0.3) || inRect(mu, mv, 0.22, 0.45, 0.68, 0.61)) return WHITE;
      // gold stripe under the F like a kit band
      if (inRect(mu, mv, 0.5, 0.74, 0.8, 0.84)) return GOLD;
    }
    // subtle diagonal mowing stripes
    return Math.floor((u + v) * 6) % 2 ? GREEN : DARK;
  });
}
const files = [
  ['icon-192.png', 192, { rounded: true }], ['icon-512.png', 512, { rounded: true }],
  ['maskable-512.png', 512, { rounded: false, safe: true }], ['apple-touch-icon.png', 180, { rounded: false }], ['favicon-32.png', 32, { rounded: true }]
];
files.forEach(([name, size, opt]) => fs.writeFileSync(path.join(OUT, name), draw(size, opt)));
console.log('Icons written:', files.map((f) => f[0]).join(', '));
