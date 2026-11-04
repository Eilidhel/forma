/* FORMA — çizimler: yüz portreleri, forma, saha görünümü (hepsi kodla üretilen SVG) */
(function (root) {
  const F = root.F;
  const ART = (F.ART = {});

  // Forma rengi çakışması: rakibin ana rengi bizimkine yakınsa deplasman formasına geç
  const rgb = (h) => { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const cdist = (a, b) => { const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b); return Math.hypot(r1 - r2, g1 - g2, b1 - b2); };
  // Çim rengine yakın formalar sahada kaybolur: yeşil formada ikinci renge ya da beyaza geç
  const GRASS = ['#2a7d47', '#2f8a4f', '#006a4e', '#00843d'];
  const onGrass = (c) => GRASS.some((g) => cdist(c, g) < 95);
  ART.fieldKit = function (k) {
    if (!onGrass(k[0])) return k;
    if (!onGrass(k[1])) return [k[1], k[0]];
    return ['#f5f5f5', k[0]];
  };
  ART.kitFor = function (mineRaw, theirsRaw) {
    const mine = ART.fieldKit(mineRaw);
    const near = (c) => cdist(c, mine[0]) < 140 || cdist(c, mine[1]) < 60;
    const ok = (c) => !near(c) && !onGrass(c);
    if (ok(theirsRaw[0])) return theirsRaw;
    if (ok(theirsRaw[1])) return [theirsRaw[1], theirsRaw[0]];
    const lightMine = (rgb(mine[0]).reduce((a, b) => a + b, 0) / 3) > 150;
    return lightMine ? ['#1b2a4a', '#ffffff'] : ['#f5f5f5', '#1b2a4a'];
  };

  const SKIN = ['#f3cfae', '#e6b48c', '#cf9a6e', '#b07a50', '#8a5a37', '#5e3c24', '#fbe3cf', '#432a19'];
  const HAIR = ['#1a130f', '#2f1d12', '#5a3a20', '#8c5f33', '#c99a5a', '#3b3b3b', '#e6d3a1', '#a8431c', '#cfcfcf', '#2c4f8f', '#1f7a4d', '#c23a6b'];
  const EYES = ['#1b1410', '#5a3a1a', '#3d6b3a', '#3a5f8a', '#7a6a4a'];
  const BAND = ['#c8102e', '#ffffff', '#111111', '#f2c200', '#1d3c8f', '#00843d', '#e35205'];
  // Karakter düzenleyici seçenekleri (Stardew usulü: her parça ayrı)
  ART.OPTS = {
    skin: SKIN, hair: HAIR, eye: EYES, band: BAND,
    style: [['crop', 'Kısa'], ['buzz', 'Kazıtma'], ['undercut', 'Alt kesim'], ['side', 'Yandan ayrık'], ['pomp', 'Yukarı taranmış'], ['curly', 'Kıvırcık'], ['afro', 'Afro'], ['mohawk', 'Mohikan'], ['long', 'Uzun'], ['curlylong', 'Uzun kıvırcık'], ['bun', 'Topuz'], ['bob', 'Küt'], ['bald', 'Kel']],
    beard: [['none', 'Yok'], ['stubble', 'Kirli sakal'], ['mustache', 'Bıyık'], ['goatee', 'Keçi sakalı'], ['mustgoat', 'Bıyık + keçi'], ['full', 'Gür sakal']],
    brow: [[0, 'Düz'], [1, 'Sert'], [2, 'Yumuşak']]
  };
  const STYLES_M = ['crop', 'buzz', 'curly', 'pomp', 'side', 'bald', 'crop', 'pomp'];
  const STYLES_F = ['long', 'bun', 'long', 'bob', 'curlylong'];

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const at = (arr, h, salt) => arr[((h >>> salt) ^ (h * (salt + 3))) % arr.length >>> 0];
  ART.isFemale = (name) => {
    const first = String(name || '').split(' ')[0];
    return F.DATA.names.female.includes(first);
  };

  // Rastgele görünüm (oyuncu için kalıcı)
  ART.randomLook = function (female) {
    return {
      skin: F.ri(0, SKIN.length - 1), hair: F.ri(0, 4), style: female ? F.pick(STYLES_F) : F.pick(STYLES_M),
      beard: female ? 'none' : F.pick(['none', 'none', 'stubble', 'stubble', 'full']), brow: F.ri(0, 2)
    };
  };

  // Yüz: look verilmezse isimden türetilir
  ART.face = function (name, o) {
    o = o || {};
    const h = hash(String(name || '?'));
    const female = o.female != null ? o.female : ART.isFemale(name);
    const look = o.look || {
      skin: h % SKIN.length, hair: (h >>> 3) % 5,
      style: female ? at(STYLES_F, h, 5) : at(STYLES_M, h, 7),
      beard: female ? 'none' : at(['none', 'none', 'stubble', 'full', 'stubble'], h, 11), brow: (h >>> 13) % 3
    };
    const skin = SKIN[look.skin];
    let hair = HAIR[look.hair];
    if ((o.age || 0) > 52) hair = '#9c9a96';
    else if ((o.age || 0) > 44 && (h & 1)) hair = '#6d6a66';
    const kit = o.kit || ['#4a5a52', '#2f3a34'];
    const mood = o.mood || 'calm';
    const dark = '#1b1410';
    let hairBack = '', hairTop = '';
    switch (look.style) {
      case 'crop': hairTop = `<path d="M19 27C18 13 46 12 45 27C43 19 37 17 32 17S21 19 19 27Z" fill="${hair}"/>`; break;
      case 'buzz': hairTop = `<path d="M19 27C18 13 46 12 45 27C43 19 37 17 32 17S21 19 19 27Z" fill="${hair}" opacity=".55"/>`; break;
      case 'curly': hairTop = [20, 25, 30, 35, 40, 44].map((x, i) => `<circle cx="${x}" cy="${17 + (i % 2) * 2 + (x < 22 || x > 42 ? 4 : 0)}" r="5.2" fill="${hair}"/>`).join(''); break;
      case 'pomp': hairTop = `<path d="M18 26C16 8 44 4 46 22C45 17 41 13 34 13C27 13 21 17 18 26Z" fill="${hair}"/><path d="M19 27C19 20 22 17 26 16" stroke="${hair}" stroke-width="3" fill="none"/>`; break;
      case 'side': hairTop = `<path d="M19 28C17 13 46 11 45 27C42 18 30 17 26 18C23 19 20 23 19 28Z" fill="${hair}"/><path d="M27 15L24 20" stroke="${skin}" stroke-width="1.2"/>`; break;
      case 'bald': hairTop = `<path d="M19 29C19 26 20 24 21 23M45 29C45 26 44 24 43 23" stroke="${hair}" stroke-width="2.5" fill="none" opacity=".7"/>`; break;
      case 'long': hairBack = `<path d="M16 30C13 9 51 9 48 30L50 50C45 47 44 38 44 30L20 30C20 38 19 47 14 50Z" fill="${hair}"/>`; hairTop = `<path d="M19 28C19 15 45 14 45 28C40 20 30 19 25 21C22 22 20 25 19 28Z" fill="${hair}"/>`; break;
      case 'bob': hairBack = `<path d="M16 30C14 10 50 10 48 30L48 40C45 41 44 36 44 30L20 30C20 36 19 41 16 40Z" fill="${hair}"/>`; hairTop = `<path d="M19 28C19 14 45 14 45 28C39 21 26 20 19 28Z" fill="${hair}"/>`; break;
      case 'bun': hairTop = `<circle cx="32" cy="10" r="6" fill="${hair}"/><path d="M19 27C18 13 46 12 45 27C40 19 24 19 19 27Z" fill="${hair}"/>`; break;
      case 'undercut': hairTop = `<path d="M21 23C21 10 45 9 44 22C40 15 30 14 21 23Z" fill="${hair}"/><path d="M19.5 27C19 24 20 22 21 21M44.5 27C45 24 44 22 43 21" stroke="${hair}" stroke-width="2" fill="none" opacity=".35"/>`; break;
      case 'afro': hairBack = `<circle cx="32" cy="20" r="19" fill="${hair}"/>`; hairTop = `<path d="M19 26C19 17 25 15 32 15S45 17 45 26C41 20 23 20 19 26Z" fill="${hair}"/>`; break;
      case 'mohawk': hairTop = `<path d="M28 21C27 9 30 4 32 3C34 4 37 9 36 21C34 19 30 19 28 21Z" fill="${hair}"/><path d="M19.5 27C19 23 21 20 23 19M44.5 27C45 23 43 20 41 19" stroke="${hair}" stroke-width="2" fill="none" opacity=".3"/>`; break;
      case 'curlylong': hairBack = [16, 20, 44, 48].map((x) => `<circle cx="${x}" cy="${x < 30 ? 36 : 36}" r="6" fill="${hair}"/>`).join('') + `<path d="M16 30C13 10 51 10 48 30L48 44L16 44Z" fill="${hair}"/>`; hairTop = [21, 27, 33, 39, 44].map((x) => `<circle cx="${x}" cy="17" r="5.5" fill="${hair}"/>`).join(''); break;
    }
    let beard = '';
    if (look.beard === 'stubble') beard = `<path d="M20 31C21 45 43 45 44 31C41 38 37 40 32 40S23 38 20 31Z" fill="${hair}" opacity=".32"/>`;
    if (look.beard === 'full') beard = `<path d="M19 29C19 47 45 47 45 29C43 38 39 41 32 41S21 38 19 29Z" fill="${hair}" opacity=".92"/>`;
    const must = `<path d="M26.5 34.6C29 32.6 31 33.4 32 34.2C33 33.4 35 32.6 37.5 34.6C35 35.2 33 35 32 34.8C31 35 29 35.2 26.5 34.6Z" fill="${hair}"/>`;
    const goat = `<path d="M28.5 39.5C29 43.5 35 43.5 35.5 39.5C34 40.6 30 40.6 28.5 39.5Z" fill="${hair}"/>`;
    if (look.beard === 'mustache') beard = must;
    if (look.beard === 'goatee') beard = goat;
    if (look.beard === 'mustgoat') beard = must + goat;
    const band = look.band != null && BAND[look.band] ? `<path d="M18.6 22.5C24 17.5 40 17.5 45.4 22.5L45.2 26.6C40 22 24 22 18.8 26.6Z" fill="${BAND[look.band]}"/><path d="M45 23.5L51.5 21L49.5 25.5L52 28.5L45.2 26.5Z" fill="${BAND[look.band]}"/>` : '';
    const eye = EYES[look.eye || 0];
    const brows = [`<path d="M24.5 25.5L29.5 25" stroke="${hair}" stroke-width="1.6" stroke-linecap="round"/><path d="M34.5 25L39.5 25.5" stroke="${hair}" stroke-width="1.6" stroke-linecap="round"/>`,
      `<path d="M24.5 26L29.5 24.8" stroke="${hair}" stroke-width="1.8" stroke-linecap="round"/><path d="M34.5 24.8L39.5 26" stroke="${hair}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<path d="M24.5 25Q27 24 29.5 25" stroke="${hair}" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M34.5 25Q37 24 39.5 25" stroke="${hair}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`][look.brow || 0];
    const mouth = { happy: 'M28 35.5Q32 39.5 36 35.5', calm: 'M28.5 36.5Q32 38 35.5 36.5', sad: 'M28.5 38Q32 35.5 35.5 38', angry: 'M28.5 37.5L35.5 37' }[mood] || 'M28.5 36.5Q32 38 35.5 36.5';
    const collarCol = kit[1];
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${hairBack}
      <path d="M7 64C9 51 19 47 32 47S55 51 57 64Z" fill="${kit[0]}"/><path d="M25 47L32 55L39 47" fill="none" stroke="${collarCol}" stroke-width="3"/>
      <rect x="27" y="38" width="10" height="11" rx="3" fill="${skin}"/><rect x="27" y="40" width="10" height="4" fill="#000" opacity=".08"/>
      <circle cx="19.5" cy="30" r="3.2" fill="${skin}"/><circle cx="44.5" cy="30" r="3.2" fill="${skin}"/>
      <ellipse cx="32" cy="28.5" rx="12.8" ry="14.5" fill="${skin}"/>${beard}${hairTop}${band}${brows}
      <ellipse cx="27" cy="29.5" rx="1.6" ry="1.9" fill="${eye === EYES[0] ? dark : eye}"/><ellipse cx="37" cy="29.5" rx="1.6" ry="1.9" fill="${eye === EYES[0] ? dark : eye}"/>
      <circle cx="27.5" cy="28.9" r=".5" fill="#fff" opacity=".8"/><circle cx="37.5" cy="28.9" r=".5" fill="#fff" opacity=".8"/>
      <path d="M32 30.5L31 34H33" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.1" stroke-linecap="round"/>
      <path d="${mouth}" fill="none" stroke="#5a2a20" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  };

  // Forma: gövde c1, kollar/yaka c2, sırtta isim ve numara
  ART.jersey = function (c1, c2, num, name, size) {
    size = size || 110;
    const lum = (hex) => { const n = parseInt(hex.replace('#', '').padEnd(6, '0'), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
    const ink = lum(c1) > 0.6 ? '#141414' : '#ffffff';
    const nm = String(name || '').toLocaleUpperCase('tr').slice(0, 11);
    return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
      <path d="M38 10L20 16L4 42L20 52L28 40V112H92V40L100 52L116 42L100 16L82 10C78 18 70 22 60 22S42 18 38 10Z" fill="${c1}" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M20 16L4 42L20 52L28 40Z M100 16L116 42L100 52L92 40Z" fill="${c2}" opacity=".95"/>
      <path d="M38 10C42 18 50 22 60 22S78 18 82 10" fill="none" stroke="${c2}" stroke-width="5"/>
      <rect x="28" y="40" width="64" height="72" fill="url(#jsh)" opacity=".18"/>
      <defs><linearGradient id="jsh" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000"/></linearGradient></defs>
      <text x="60" y="44" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="800" font-size="${nm.length > 8 ? 10 : 12}" letter-spacing="1" fill="${ink}">${F.esc(nm)}</text>
      <text x="60" y="96" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="48" fill="${ink}">${num}</text></svg>`;
  };

  // Saha: maç anında oyuncunun ve topun yeri; son hamle animasyonla gösterilir
  const SPOT = { FV: [236, 80], OS: [170, 92], DF: [96, 70], KL: [26, 85] };
  ART.pitch = function (m, kind, idx, myCols, oppCols, animate) {
    const P = F.S.P;
    const [px, py0] = SPOT[P.pos] || [170, 85];
    const jit = ((idx * 37) % 30) - 15;
    const py = py0 + jit;
    let bx = px + 8, by = py + 4;
    const end = {
      goal: [313, 85 + (idx % 3 - 1) * 8], assist: [300, 78], miss: [318, 30 + (idx % 2) * 110], chance: [292, 96], keep: [px - 30, py + 18],
      lost: [px + 26, py - 22], save: [P.pos === 'KL' ? 40 : px - 10, P.pos === 'KL' ? 40 : py + 30], block: [px + 40, py - 30], concede: [7, 85], yellow: [px + 6, py - 4],
      red: [px + 6, py - 4], foul: [px + 10, py + 6], pass: [Math.min(300, px + 60), py - 12]
    }[kind];
    const start = P.pos === 'KL' ? [px + 46, py - 8] : [px + 8, py + 4];
    if (end) { bx = end[0]; by = end[1]; }
    const opp = [[px + 22, py - 18], [px + 40, py + 14], [px - 30, py + 34], [270, 60], [298, 85]].map(([x, y]) => [Math.min(312, Math.max(8, x)), Math.min(162, Math.max(8, y))]);
    const mates = [[px - 50, py - 30], [px + 52, py + 40], [P.pos === 'KL' ? 90 : 26, P.pos === 'KL' ? 50 : 85]].map(([x, y]) => [Math.min(312, Math.max(8, x)), Math.min(162, Math.max(8, y))]);
    const stripes = Array.from({ length: 8 }, (_, i) => `<rect x="${i * 40}" y="0" width="40" height="170" fill="${i % 2 ? '#2f8a4f' : '#2a7f48'}"/>`).join('');
    const dx = start[0] - bx, dy = start[1] - by;
    const flash = kind === 'goal' ? `<text x="270" y="40" text-anchor="middle" class="pflash" font-family="Big Shoulders Display, sans-serif" font-weight="900" font-size="34" fill="#fff">GOL!</text>` : kind === 'concede' ? `<text x="60" y="40" text-anchor="middle" class="pflash" font-family="Big Shoulders Display, sans-serif" font-weight="900" font-size="22" fill="#ffd2cc">GOL YEDİK</text>` : kind === 'save' || kind === 'block' ? `<text x="${Math.min(280, px + 40)}" y="30" text-anchor="middle" class="pflash" font-family="Big Shoulders Display, sans-serif" font-weight="900" font-size="20" fill="#fff">KURTARDI!</text>` : kind === 'red' ? `<rect x="${px + 14}" y="${py - 30}" width="12" height="16" rx="2" fill="#e32" class="pflash"/>` : kind === 'yellow' ? `<rect x="${px + 14}" y="${py - 30}" width="12" height="16" rx="2" fill="#f2c200" class="pflash"/>` : '';
    return `<svg viewBox="0 0 320 170" class="pitch" role="img" aria-label="Saha görünümü">${stripes}
      <g fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"><rect x="4" y="4" width="312" height="162" rx="2"/><path d="M160 4V166"/><circle cx="160" cy="85" r="22"/>
      <rect x="4" y="45" width="40" height="80"/><rect x="4" y="66" width="14" height="38"/><rect x="276" y="45" width="40" height="80"/><rect x="302" y="66" width="14" height="38"/></g>
      <rect x="0" y="70" width="4" height="30" fill="#fff" opacity=".8"/><rect x="316" y="70" width="4" height="30" fill="#fff" opacity=".8"/>
      ${opp.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${oppCols[0]}" stroke="${oppCols[1]}" stroke-width="2"/>`).join('')}
      ${mates.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${myCols[0]}" stroke="${myCols[1]}" stroke-width="2" opacity=".85"/>`).join('')}
      <circle cx="${px}" cy="${py}" r="9" fill="${myCols[0]}" stroke="#fff" stroke-width="2.5"/><text x="${px}" y="${py + 3.5}" text-anchor="middle" font-size="9" font-weight="800" fill="${myCols[1]}" font-family="Figtree, sans-serif">${P.number || ''}</text>
      <circle cx="${bx}" cy="${by}" r="4.2" fill="#fff" stroke="#111" stroke-width="1.2" class="${animate && end ? 'kick' : ''}" style="--dx:${dx}px;--dy:${dy}px"/>
      ${animate ? flash : ''}</svg>`;
  };
})(typeof window !== 'undefined' ? window : globalThis);
