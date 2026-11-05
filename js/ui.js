/* FORMA — arayüz: telefon ekranları, olay kartları, maç, uygulamalar */
(function () {
  const F = window.F;
  const D = F.DATA;
  F.indexEvents();
  const esc = F.esc;
  const KEY = 'forma.save.v1';
  const app = document.getElementById('app');

  const U = {
    view: 'start', app: null, tab: null, create: { origin: null, pos: null, name: '', surname: '' }, toast: null,
    nego: null, post: { photo: null, tone: null }, confirm: null, renameQ: '', leagueKey: null, shopCat: 'gelisim',
    heirPos: 'FV', goalSel: [], code: '', importMsg: '', howto: false,
    keyUi: { stage: 'enter', input: '', msg: '', busy: false, remote: null }, devTab: 'oyuncu', devQ: '', devLog: [], devCmd: '', devScope: 'P', devJson: null
  };
  const devOn = () => store.get('forma.dev') === '1';
  let pressTimer = null, toastTimer = null;

  /* ---------- Kayıt ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* depolama kapalı */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* yok */ } }
  };
  let lastLocal = null;
  function save() {
    if (!(F.S && F.S.P)) return;
    const s = F.serialize();
    if (s === lastLocal) return;
    lastLocal = s;
    store.set(KEY, s);
    store.set('forma.savedAt', String(Date.now()));
    cloudSchedule();
  }
  function hasSave() { return !!store.get(KEY); }
  function applyEdits() { F.S.edits && Object.keys(F.S.edits).forEach((id) => { if (F.S.world.teams[id]) F.S.world.teams[id].name = F.S.edits[id]; }); }
  function loadSave() { const s = store.get(KEY); if (!s) return false; try { F.load(s); applyEdits(); lastLocal = s; return true; } catch (e) { return false; } }

  /* ---------- Bulut kaydı: anahtar ile cihazlar arası devam ----------
     claude.ai'da açıldığında kayıt, oturum açan kişinin özel alanında (data/users/<id>/) anahtara bağlı bir belgede tutulur.
     Yerel sunucuda ya da oturum yokken bulut kullanılamaz; o zaman kayıt kodu ile taşınır. */
  const cloud = { db: null, uid: null, ready: false, checked: false, key: store.get('forma.key') || null, status: '', pushing: false, again: false, lastPushed: null, timer: null };
  async function keyId(k) {
    k = String(k).trim();
    try {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('forma:' + k));
      return 'k_' + Array.from(new Uint8Array(b)).slice(0, 20).map((x) => x.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let h = 5381;
      for (const c of k) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
      return 'k_' + h.toString(16) + '_' + k.length;
    }
  }
  async function pack(s) {
    if (typeof CompressionStream === 'undefined') return { z: 'raw', data: s };
    const st = new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'));
    const buf = new Uint8Array(await new Response(st).arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return { z: 'gzip', data: btoa(bin) };
  }
  async function unpack(d) {
    if (d.z !== 'gzip') return d.data;
    const bin = atob(d.data);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const st = new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(st).text();
  }
  async function cloudRef(key) { return cloud.db.collection('data/users/' + cloud.uid).doc(await keyId(key)); }
  function cloudStatus(t) { cloud.status = t; const el = document.getElementById('cloudst'); if (el) el.textContent = t; }
  async function cloudInit() {
    try {
      let tries = 0;
      while (!(window.claude && typeof window.claude.use === 'function') && tries++ < 15) await new Promise((r) => setTimeout(r, 200));
      if (!(window.claude && typeof window.claude.use === 'function')) return;
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const uid = user ? await user.id() : null;
      if (db && uid) {
        // linkle gelen dış ziyaretçiler veri yazamaz (kendi özel alanları dahil): bulutu baştan kapat
        let canWrite = null;
        try { canWrite = await user.can('data.write'); } catch (e) { canWrite = null; }
        if (canWrite === false) cloud.denied = true;
        else { cloud.db = db; cloud.uid = uid; cloud.ready = true; }
      }
    } catch (e) { /* bulut yok */ } finally { cloud.checked = true; }
  }
  // anahtardaki kaydı okur: { exists, at, name, season, json }
  async function cloudFetch(key) {
    const snap = await (await cloudRef(key)).get();
    if (!snap.exists) return { exists: false };
    const d = snap.data();
    return { exists: true, at: d.at || 0, name: d.name || '', season: d.season || 0, club: d.club || '', ver: d.ver || '', json: await unpack(d) };
  }
  function cloudSchedule() {
    if (!cloud.ready || !cloud.key) return;
    clearTimeout(cloud.timer);
    cloud.timer = setTimeout(cloudPush, 3000);
  }
  async function cloudPush() {
    clearTimeout(cloud.timer);
    if (!cloud.ready || !cloud.key || !(F.S && F.S.P)) return;
    if (cloud.pushing) { cloud.again = true; return; }
    const s = F.serialize();
    if (s === cloud.lastPushed) return;
    cloud.pushing = true;
    cloudStatus('Buluta kaydediliyor…');
    try {
      const p = await pack(s);
      if (p.data.length > 250000) throw { code: 'too_big' };
      const P = F.S.P;
      await (await cloudRef(cloud.key)).set({ v: 1, z: p.z, data: p.data, at: Date.now(), ver: F.VERSION, name: P.name + ' ' + P.surname, season: F.S.season, club: F.myTeam().name });
      cloud.lastPushed = s;
      cloudStatus('Bulutta kayıtlı · ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      cloudStatus(e && e.code === 'too_big' ? 'Kayıt buluta sığmayacak kadar büyük.' : e && e.code === 'quota_exceeded' ? 'Bulut depolama dolu.' : 'Buluta kaydedilemedi, tekrar denenecek.');
      if (e && (e.code === 'invalid_argument' || e.code === 'not_granted' || e.code === 'revoked')) {
        // bu hesap bu sayfada veri yazamıyor: bulutu kapat ve açıkça söyle
        cloud.ready = false; cloud.denied = true;
        cloudStatus('Bu hesapla buluta kayıt yapılamıyor. Kayıt bu cihazda duruyor.');
        toast('Buluta kaydedilemedi: bu hesabın bu sayfada yazma izni yok. Kayıt bu cihazda duruyor; taşımak için Ayarlar > Kayıt kodu.');
      } else if (!(e && (e.code === 'too_big' || e.code === 'quota_exceeded'))) cloud.timer = setTimeout(cloudPush, 15000);
    } finally {
      cloud.pushing = false;
      if (cloud.again) { cloud.again = false; cloudSchedule(); }
    }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') cloudPush(); });

  /* ---------- Tema ---------- */
  function applyTheme() {
    const t = store.get('forma.theme') || 'system';
    if (t === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
  }

  /* ---------- İkonlar ---------- */
  const I = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICON = {
    plan: I('<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18M8 14h3"/>'),
    tribun: I('<path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>'),
    mesaj: I('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
    kisiler: I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.2A5 5 0 0 1 21.5 19"/>'),
    menajer: I('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>'),
    banka: I('<rect x="2.5" y="6" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M7 15h3"/>'),
    magaza: I('<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
    profil: I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    lig: I('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>'),
    album: I('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
    kadro: I('<circle cx="12" cy="5" r="2"/><circle cx="6" cy="11" r="2"/><circle cx="18" cy="11" r="2"/><circle cx="9" cy="18" r="2"/><circle cx="15" cy="18" r="2"/>'),
    ozel: I('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
    muze: I('<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-6 10 6z"/>'),
    ayarlar: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    back: I('<path d="m15 18-6-6 6-6"/>'),
    phone: I('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
    heart: I('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>'),
    key: I('<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M15 8l2 2"/>'),
    dev: I('<path d="m8 9-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12"/>')
  };

  /* ---------- Küçük yardımcılar ---------- */
  function hashColor(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    const hues = [152, 200, 28, 340, 260, 12, 180, 45, 290, 110];
    return `hsl(${hues[Math.abs(h) % hues.length]} 45% 42%)`;
  }
  function initials(name) { return String(name || '?').replace(/[@_]/g, ' ').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase(); }
  function av(name, lg, o) { return `<div class="av${lg === true ? ' lg' : lg ? ' ' + lg : ''}" style="background:${hashColor(name || '?')}">${F.ART.face(name, o)}</div>`; }
  const CLUB_ROLES = ['hoca', 'baskan', 'kaptan', 'kanka', 'rakip'];
  function npcOpts(n, role) {
    return {
      look: n.look, age: n.age, female: n.female != null ? n.female : ['anne', 'partner'].includes(role) ? true : ['baba', 'hoca'].includes(role) ? false : undefined,
      kit: CLUB_ROLES.includes(role) ? F.myTeam().colors : undefined, mood: n.rel > 30 ? 'happy' : n.rel < -30 ? 'angry' : 'calm'
    };
  }
  function meFace(size) {
    const P = F.S.P;
    return av(P.name + ' ' + P.surname, size, { look: P.look, kit: F.myTeam().colors, female: false, mood: P.life.moral > 60 ? 'happy' : P.life.moral < 30 ? 'sad' : 'calm' });
  }
  const ROLE_TINT = { hoca: '#1f7a4d', baskan: '#7a5a22', kaptan: '#245f80', kanka: '#2b7a9a', rakip: '#9a3030', anne: '#b0603a', baba: '#86532e', kardes: '#9a7a2a', partner: '#b33a78', menajer: '#9a7a1f', gazeteci: '#34589a', magazinci: '#84349a' };
  function badge(team, size) {
    size = size || 28;
    const [a, b] = team.colors || ['#333', '#ccc'];
    const id = 'b' + team.id + size;
    return `<svg width="${size}" height="${Math.round(size * 1.15)}" viewBox="0 0 40 46" aria-hidden="true"><defs><clipPath id="${id}"><path d="M20 1 38 6v15c0 12-8 20-18 24C10 41 2 33 2 21V6z"/></clipPath></defs><g clip-path="url(#${id})"><rect width="40" height="46" fill="${a}"/><rect x="20" width="20" height="46" fill="${b}"/><rect y="30" width="40" height="16" fill="${a}" opacity=".0"/></g><path d="M20 1 38 6v15c0 12-8 20-18 24C10 41 2 33 2 21V6z" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/><text x="20" y="27" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="15" fill="#fff" stroke="rgba(0,0,0,.55)" stroke-width="2.4" paint-order="stroke">${esc(initials(team.name).slice(0, 2))}</text></svg>`;
  }
  const lum = (hex) => { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
  function deltaChips(list) {
    if (!list || !list.length) return '';
    return `<div class="delta-list">${F.mergeDeltas(list).map((d) => {
      if (d.trait) return `<span class="chip acc">${esc(d.label)}</span>`;
      const v = Math.round(d.v * 10) / 10;
      const good = d.v > 0;
      const val = d.money ? F.money(d.v) : d.abs ? (d.v > 0 ? '+' : '') + F.num(d.v) : (v > 0 ? '+' : '') + (Math.abs(v) < 1 ? v.toFixed(1).replace('.', ',') : Math.round(v));
      return `<span class="chip ${good ? 'good' : 'bad'}">${esc(d.label)} ${d.money && d.v > 0 ? '+' : ''}${esc(val)}</span>`;
    }).join('')}</div>`;
  }
  // Gösterilen sayı, motorun gerçekte uygulayacağı miktardır (azalan getiri ve tavanlar dahil)
  function fxPreview(fx, cost) {
    const out = [];
    const fmt = (v) => { const r = Math.round(v * 10) / 10; return Math.abs(r) >= 10 ? Math.round(r) : String(r).replace('.', ','); };
    F.previewFx(fx).forEach(({ k, v, unit }) => {
      const label = F.label(k);
      if (!label) return;
      if (Math.abs(v) < 0.05) { if ((fx[k] || 0) > 0) out.push(`<span class="chip">${esc(label)} tavanda</span>`); return; }
      const txt = unit === '%' ? '%' + fmt(v) : fmt(v) + (unit || '');
      out.push(`<span class="chip ${v > 0 ? 'good' : 'bad'}">${esc(label)} ${v > 0 ? '+' : ''}${txt}</span>`);
    });
    if (cost) out.push(`<span class="chip bad">${F.money(-cost)}</span>`);
    return out.join('');
  }
  function meter(label, v, max) {
    max = max || 100;
    const pct = F.clamp(v / max * 100, 0, 100);
    const cls = pct < 30 ? 'low' : pct < 55 ? 'mid' : '';
    return `<div class="meter"><span class="muted">${esc(label)}</span><div class="track"><div class="fill ${cls}" style="width:${pct}%"></div></div><span class="v">${Math.round(v)}</span></div>`;
  }
  function relBar(v) {
    const w = Math.abs(v) / 2;
    const left = v >= 0 ? 50 : 50 - w;
    return `<div class="relbar"><i style="left:${left}%;width:${w}%;background:${v >= 0 ? 'var(--good)' : 'var(--bad)'}"></i></div>`;
  }
  function probTag(p) {
    const pc = Math.round(p * 100);
    const [t, c] = p >= 0.7 ? ['Güvenli', 'good'] : p >= 0.5 ? ['Mantıklı', 'acc'] : p >= 0.3 ? ['Riskli', 'warn'] : ['Çok riskli', 'bad'];
    return `<span class="chip ${c}">${t} · %${pc}</span>`;
  }
  const TONES = { saygili: 'Saygılı', mutevazi: 'Mütevazı', iddiali: 'İddialı', sert: 'Sert', duygusal: 'Duygusal', esprili: 'Esprili', kacamak: 'Kaçamak', sessiz: 'Sessiz', yalan: 'Yalan', sosyal: 'Sosyal', lider: 'Lider', hirsli: 'Hırslı', sadik: 'Sadık', paragoz: 'Paragöz', parti: 'Parti', gosteris: 'Gösteriş', durust: 'Dürüst', kurnaz: 'Kurnaz' };
  function whoInfo(who) {
    const S = F.S;
    if (!who) return { name: 'Bilinmeyen', label: '' };
    if (S.roles[who] && S.npcs[S.roles[who]]) {
      const n = S.npcs[S.roles[who]];
      let label = D.relLabels[who] || who;
      if (who === 'hoca' && D.coachTypes[n.type]) label += ' · ' + D.coachTypes[n.type].name;
      if (who === 'dost' && D.dostTypes && D.dostTypes[n.type]) label += ' · ' + D.dostTypes[n.type] + (n.from ? ' · ' + n.from : '');
      if (who === 'partner' && n.job) label += ' · ' + n.job;
      if (who === 'menajer' && S.agent) label += ' · ' + D.agentTiers[S.agent.tier].name;
      return { name: n.name, label, rel: n.rel, opts: npcOpts(n, who), tint: ROLE_TINT[who] };
    }
    const nm = F.tpl(who);
    return { name: nm, label: '', opts: { mood: 'calm' }, tint: hashColor(nm) };
  }
  function toast(msg) {
    U.toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { U.toast = null; const t = app.querySelector('.toast'); if (t) t.remove(); }, 2600);
  }
  const opp = () => { const fx = F.S.league && F.myFixture(); return fx ? F.team(fx.opp) : null; };

  /* =========================================================
     ÇİZİM
     ========================================================= */
  function render(keepScroll) {
    clearInterval(pressTimer);
    if (U.mgCleanup) { U.mgCleanup(); U.mgCleanup = null; }
    const mainEl = document.getElementById('main');
    const prev = mainEl ? mainEl.scrollTop : 0;
    let out;
    if (U.view === 'start') out = viewStart();
    else if (U.view === 'key') out = viewKey();
    else if (U.view === 'create') out = viewCreate();
    else out = viewGame();
    // Giriş animasyonu yalnızca ekran değişince oynar
    const st = F.S && F.S.queue && F.S.queue[0];
    const key = U.view + '|' + (U.app || '') + '|' + (U.tab || '') + '|' + (st ? st.type + (st.id || '') + (st.node || '') + (st.i || '') : '');
    const sameScreen = key === U.lastKey;
    if (sameScreen) out.main = out.main.replace('stack fade', 'stack');
    U.lastKey = key;
    app.innerHTML = (out.bar || '') + `<main id="main">${out.main}</main>` + (out.dock ? `<div class="dock">${out.dock}</div>` : '') + (U.toast ? `<div class="toast" role="status">${esc(U.toast)}</div>` : '');
    const m = document.getElementById('main');
    // aynı ekranda kalındıysa kaydırma yeri korunur (sayfa başa atlamaz)
    if (keepScroll || sameScreen) m.scrollTop = prev;
    // seçili diziliş kartı görünür kalsın
    document.querySelectorAll('.fmrow').forEach((row) => { const on = row.querySelector('.fmcard.on'); if (on) row.scrollLeft = on.offsetLeft - row.offsetLeft - row.clientWidth / 2 + on.clientWidth / 2; });
    if (out.after) out.after();
    save();
  }

  function statusBar() {
    const S = F.S, P = S.P;
    const t = F.myTeam();
    const off = S.league.round >= F.seasonRounds() || (S.queue[0] && ['seasonSummary', 'offers', 'retire', 'heir', 'gameover'].includes(S.queue[0].type) && S.queue[0].window !== 'kis');
    return `<div class="bar"><span class="num">${off ? 'Sezon arası' : `S${S.season} · H${S.week} · ${esc(F.monthName())}`}</span><span class="club">${badge(t, 16)}<span><b>${esc(t.name)}</b></span></span><span class="row" style="gap:6px"><span class="num"><b>${F.money(P.money)}</b></span>${devOn() ? `<button class="devbtn" data-a="open" data-v="dev" aria-label="Geliştirici konsolu">${ICON.dev}</button>` : ''}</span></div>`;
  }

  /* ---------- Başlangıç ---------- */
  function viewStart() {
    const sv = hasSave();
    return {
      main: `<div class="stack fade" style="padding-top:18px">
        <div class="pitchlines">
          <div class="label" style="color:inherit;opacity:.8">Sahadan hayata</div>
          <div class="title-xl" style="margin:10px 0 8px">FORMA</div>
          <p style="max-width:30ch">Bir köy sahasından ya da büyük bir akademiden başla. Her seçimin kariyerinde ve hayatında iz bırakır. Hiçbir hayat bir diğerine benzemez.</p>
        </div>
        <div class="grid2 small">
          <div class="flat"><div class="display" style="font-size:26px">8</div><span class="muted">farklı başlangıç</span></div>
          <div class="flat"><div class="display" style="font-size:26px">5</div><span class="muted">Türkiye ligi, BAL'a kadar</span></div>
          <div class="flat"><div class="display" style="font-size:26px">150+</div><span class="muted">olay ve diyalog</span></div>
          <div class="flat"><div class="display" style="font-size:26px">∞</div><span class="muted">nesil: çocuğunla devam et</span></div>
        </div>
        ${U.howto ? howtoHtml() : ''}
        <button class="keycard" data-a="key-open">
          <span class="keyic">${ICON.key}</span>
          <span class="grow" style="text-align:left"><b>${cloud.key ? 'Anahtarın: ' + esc(maskKey(cloud.key)) : 'Anahtarla giriş'}</b><span class="tiny muted" style="display:block">${cloud.key ? (cloud.ready ? 'İlerlemen bu anahtarla buluta kaydediliyor' : cloud.denied ? 'Bu hesapla bulut kaydı yok, kayıt bu cihazda' : 'Bulut bu ortamda kapalı, kayıt bu cihazda') : 'Başka bir cihazda kaldığın yerden devam et'}</span></span>
          <span class="muted">›</span>
        </button>
      </div>`,
      dock: `<div class="stack" style="width:100%;gap:8px">${sv ? `<button class="btn" data-a="continue">Kariyerine devam et</button>` : ''}<button class="btn ${sv ? 'alt' : ''}" data-a="start-new">Yeni kariyer</button><button class="btn ghost" data-a="howto">${U.howto ? 'Kapat' : 'Nasıl oynanır?'}</button></div>`
    };
  }
  function maskKey(k) { k = String(k); return k.length <= 4 ? k : k.slice(0, 2) + '•'.repeat(Math.min(6, k.length - 4)) + k.slice(-2); }
  function fmtAt(t) { if (!t) return ''; const d = new Date(t); return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); }

  /* ---------- Anahtar ekranı ---------- */
  function viewKey() {
    const K = U.keyUi;
    const local = hasSave() ? (() => { try { const s = JSON.parse(store.get(KEY)); return { name: s.P.name + ' ' + s.P.surname, season: s.season, club: s.world.teams[s.P.contract.team].name, at: +store.get('forma.savedAt') || 0 }; } catch (e) { return null; } })() : null;
    const saveCard = (t, s, extra) => `<div class="flat stack" style="gap:4px"><span class="label">${t}</span><b>${esc(s.name)}</b><span class="small muted">${esc(s.club || '')}${s.season ? ' · ' + s.season + '. sezon' : ''}${s.at ? ' · ' + esc(fmtAt(s.at)) : ''}</span>${extra || ''}</div>`;
    let body = '', dock = '';
    if (!cloud.checked) {
      body = '<div class="card small muted">Bulut bağlantısı kontrol ediliyor…</div>';
    } else if (!cloud.ready) {
      body = `<div class="card stack small"><b>${cloud.denied ? 'Bu hesapla bulut kaydı yapılamıyor' : 'Bulut kaydı bu ortamda kullanılamıyor'}</b><p class="muted">${cloud.denied ? 'Bu oyunu paylaşılan bir linkle açtın; bu hesap sayfaya veri yazamıyor. Merak etme: oyun her adımda <b>bu cihaza</b> otomatik kaydediliyor, aynı tarayıcıda açınca kaldığın yerden devam edersin. Başka cihaza geçmek için <b>kayıt kodunu</b> kullan.' : 'Anahtarla kayıt, oyunu claude.ai linkinden ve hesabına giriş yapmış olarak açınca çalışır. Bilgisayardaki yerel sürümde ya da oturum kapalıyken ilerlemeni <b>kayıt kodu</b> ile taşıyabilirsin.'}</p>${F.S && F.S.P ? '<p class="small">Kodu almak için: Ayarlar > Kayıt kodu > Kodu oluştur > Kopyala. Kodu kendine mesaj olarak gönder, diğer cihazda buraya yapıştır.</p>' : ''}</div>
        <div class="card stack"><div class="label">Kayıt kodu</div><p class="small muted">Diğer cihazda Ayarlar > Kayıt kodu > Kodu oluştur ile aldığın kodu buraya yapıştır.</p><textarea id="code" aria-label="Kayıt kodu" placeholder="Kayıt kodunu yapıştır">${esc(U.code)}</textarea><button class="btn sm" data-a="import">Koddan yükle</button>${U.importMsg ? `<p class="small">${esc(U.importMsg)}</p>` : ''}</div>`;
    } else if (K.stage === 'found') {
      const r = K.remote;
      body = `<div class="card stack"><p>Bu anahtarda bir kariyer var.</p>${saveCard('Buluttaki kayıt', r)}${local ? saveCard('Bu cihazdaki kayıt', local, local.name === r.name && local.at > r.at ? '<span class="chip warn" style="align-self:flex-start;margin-top:4px">Bu cihazdaki daha yeni</span>' : '') : ''}</div>
        <p class="tiny muted">Buluttaki kaydı yüklersen bu cihazdaki kayıt onunla değişir.</p>`;
      dock = `<div class="stack" style="width:100%;gap:8px"><button class="btn" data-a="key-load">Buluttaki kaydı yükle</button>${local ? `<button class="btn alt" data-a="key-bind">Bu cihazdakini bu anahtara yaz</button>` : ''}<button class="btn ghost" data-a="key-reset">Başka anahtar</button></div>`;
    } else if (K.stage === 'empty') {
      body = `<div class="card stack"><p><b>Bu anahtarda henüz kayıt yok.</b> Anahtarı kullanmaya başladığında ilerlemen her adımda buluta kaydedilir; başka bir cihazda aynı anahtarı girip devam edersin.</p>${local ? saveCard('Bu cihazdaki kayıt', local) : ''}</div>
        <p class="tiny muted">Anahtarını unutma: büyük-küçük harf fark eder. Kayıtlar Claude hesabına özel tutulur, diğer cihazda da aynı hesapla giriş yap.</p>`;
      dock = `<div class="stack" style="width:100%;gap:8px">${local ? `<button class="btn" data-a="key-bind">Mevcut kariyerimi bu anahtara bağla</button>` : ''}<button class="btn ${local ? 'alt' : ''}" data-a="key-new">Bu anahtarla yeni kariyer</button><button class="btn ghost" data-a="key-reset">Başka anahtar</button></div>`;
    } else {
      body = `<div class="card stack"><label class="stack" style="gap:6px" for="key-in"><span class="label">Anahtar</span><input type="text" id="key-in" placeholder="ör. batu-kariyer-7" value="${esc(K.input || '')}" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="64"></label>
        <p class="small muted">Kendine bir anahtar seç (en az 4 karakter). Aynı anahtarı telefonda, tablette ya da bilgisayarda girersen kaldığın yerden devam edersin.</p>${K.msg ? `<p class="small" style="color:var(--bad)">${esc(K.msg)}</p>` : ''}</div>
        ${cloud.key ? `<div class="flat row small"><span class="grow">Şu anki anahtar: <b>${esc(maskKey(cloud.key))}</b><span id="cloudst" class="tiny muted" style="display:block">${esc(cloud.status || '')}</span></span><button class="btn alt sm" data-a="key-logout">Anahtardan çık</button></div>` : ''}`;
      dock = `<button class="btn" data-a="key-login" ${K.busy ? 'disabled' : ''}>${K.busy ? 'Bakılıyor…' : 'Giriş yap'}</button>`;
    }
    return {
      main: `<div class="stack fade"><div class="topbar"><button class="back" data-a="key-back" aria-label="Geri">${ICON.back}</button><h2 class="display" style="font-size:28px">Anahtarla giriş</h2></div>${body}</div>`,
      dock
    };
  }
  function howtoHtml() {
    return `<div class="card stack small">
      <h3 class="display" style="font-size:22px">Nasıl oynanır</h3>
      <p><b>Her tur bir hafta.</b> Haftayı planla: bir antrenman odağı ve yükü seç, boş zamanına etkinlikler koy. Her etkinliğin getirisi ve bedeli var.</p>
      <p><b>Olaylar ve diyaloglar</b> hafta içinde gelir. Ne diyeceğini sen seçersin. Bazı seçenekler kişisel yeteneklerine bağlıdır ve başarı şansı gösterilir.</p>
      <p><b>Maçta</b> spiker maçı anlatır; top sana geldiğinde 2–4 kritik an yaşarsın. Her anda kolay bir seçenek de vardır. Sonucu yeteneklerin, formun ve zar belirler. Mevkine göre farklı anlar yaşarsın.</p>
      <p><b>Telefonun</b> hayatının merkezi: Sosyal Medya'da paylaşım yap, Mesajlar'da yakınlarınla konuş, Özel Hayat'ta rutinini ayarla, mağazada kurslara yazıl ve maaşını harca.</p>
      <p><b>Emekli olunca</b> çocuğunla devam edebilirsin. Soyadın, itibarın ve mirasın ona geçer.</p>
      <p class="muted">Oyun her adımda bu cihaza kaydedilir. Ayarlar'dan kayıt kodu alıp başka cihaza taşıyabilirsin.</p>
    </div>`;
  }

  /* ---------- Antrenman seçici: hocanın gelişim planı, yetenek grupları, alt yetenekler ---------- */
  function trainPicker(plan, ordered, rw) {
    const S = F.S, P = S.P;
    const groups = D.attrGroups.filter((g) => g.id !== 'kl' || P.pos === 'KL');
    const dp = (S.devPlan && S.devPlan.focus) || [];
    // mevki değişince (ör. kaleciden forvete) eski antrenman bu mevkide olmayabilir: geçerli birine çek
    const allowed = (id) => ['taktik', 'dinlenme'].includes(id) || groups.some((x) => x.keys.includes(id));
    if (!allowed(plan.train)) plan.train = dp.find(allowed) || groups[0].keys[0];
    const cur = D.attrGroupOf[plan.train];
    const tab = [U.trainCat, cur, D.attrGroupOf[dp[0]]].find((x) => x && groups.some((g) => g.id === x)) || groups[0].id;
    const g = groups.find((x) => x.id === tab);
    const chip = (k) => `<button class="pick ${plan.train === k ? 'on' : ''}" data-a="plan-train" data-v="${k}" ${P.injury ? 'disabled' : ''}>${dp.includes(k) ? '<b style="color:var(--warn)">▲</b> ' : rw[k] ? '<b style="color:var(--accent)">•</b> ' : ''}${esc(D.attrs[k])}${ordered === k ? ' ★' : ''} <span class="num" style="opacity:.6">${Math.round(P.attrs[k])}</span></button>`;
    return `${dp.length ? `<div class="flat stack" style="gap:6px"><div class="row small"><b class="grow">Hocanın gelişim planı</b><span class="tiny muted">+%25 XP</span></div><div class="row wrap">${dp.map(chip).join('')}</div>${S.devPlan.msg ? `<p class="tiny muted">"${esc(S.devPlan.msg)}"</p>` : ''}</div>` : ''}
      <div class="seg scroll-x">${groups.map((x) => `<button class="${x.id === tab ? 'on' : ''}" data-a="train-cat" data-v="${x.id}">${esc(x.name)} <span class="tiny num">${F.groupScore(x.id)}</span></button>`).join('')}</div>
      <div class="row wrap">${g.keys.map(chip).join('')}</div>
      <div class="row wrap">${['taktik', 'dinlenme'].map((id) => { const t = D.training.find((x) => x.id === id); return `<button class="pick ${plan.train === id ? 'on' : ''}" data-a="plan-train" data-v="${id}" ${P.injury && id !== 'dinlenme' ? 'disabled' : ''}>${esc(t.name)}${ordered === id ? ' ★' : ''}</button>`; }).join('')}</div>
      <p class="tiny muted"><b style="color:var(--warn)">▲</b> hocanın planı · <b style="color:var(--accent)">•</b> ${esc(F.role(P).name)} için önemli${ordered ? ' · ★ bu haftaki talimat' : ''}. Bir yeteneği çalışınca aynı gruptaki diğerleri de biraz gelişir.</p>`;
  }

  /* ---------- Mevki haritası: ana mevkini tek sahadan seçersin ----------
     st: { role }  ctx: create | profil | heir */
  function positionMap(st, ctx) {
    const P = F.S && F.S.P;
    const W = 360, H = 230;
    const dots = D.posMap.map((m) => {
      const on = st.role === m.role;
      const cx = 12 + m.x / 100 * (W - 24), cy = 14 + m.y / 100 * (H - 28);
      const r = D.roles[m.role];
      return `<g class="fmspot" data-a="pm-pick" data-v="${m.role}" data-w="${ctx}" role="button" aria-label="${esc(r.name)}">
        <circle cx="${cx}" cy="${cy}" r="${on ? 19 : 16}" fill="${on ? 'var(--accent)' : '#fff'}" stroke="${on ? '#fff' : 'rgba(0,0,0,.25)'}" stroke-width="${on ? 3 : 1.5}"/>
        <text x="${cx}" y="${cy + 1}" text-anchor="middle" font-size="${r.short.length > 3 ? 8.5 : 10}" font-weight="800" fill="${on ? '#fff' : '#1d3b26'}" font-family="Figtree, sans-serif" style="pointer-events:none">${r.short}</text>
        <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="7" font-weight="700" fill="${on ? '#fff' : '#3d6b4b'}" font-family="Figtree, sans-serif" style="pointer-events:none">${m.en}</text></g>`;
    }).join('');
    const role = st.role ? D.roles[st.role] : null;
    const keys = role ? Object.keys(role.w).sort((a, b) => role.w[b] - role.w[a]) : [];
    return `<svg class="fmbig" viewBox="0 0 ${W} ${H}" role="group" aria-label="Mevki haritası" style="max-width:420px">
        <rect width="${W}" height="${H}" rx="12" fill="#2e8b3c"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${8 + i * 40}" y="8" width="20" height="${H - 16}" fill="#349a43" opacity=".55"/>`).join('')}
        <g fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="4"/><path d="M${W / 2} 8V${H - 8}"/><circle cx="${W / 2}" cy="${H / 2}" r="28"/><rect x="8" y="${H / 2 - 52}" width="48" height="104"/><rect x="${W - 56}" y="${H / 2 - 52}" width="48" height="104"/></g>
        <text x="${W - 14}" y="22" text-anchor="end" font-size="9" fill="#fff" opacity=".8" font-family="Figtree, sans-serif">hücum yönü →</text>
        ${dots}</svg>
      ${role ? `<div class="card stack" style="gap:6px"><div class="row"><b class="grow">${esc(role.name)}</b><span class="chip">${D.positions.find((g) => g.id === role.grp).name}</span></div><p class="small">${esc(role.desc)}</p><div class="row wrap">${keys.slice(0, 6).map((k, i) => `<span class="chip ${i < 2 ? 'on' : ''}">${esc(D.attrs[k])}</span>`).join('')}</div><p class="tiny muted">Bu senin ana mevkin. Takımının dizilişinde bu mevki yoksa hoca seni başka bir yerde oynatmak isteyebilir.</p></div>` : '<p class="small muted">Sahada oynamak istediğin yere dokun.</p>'}`;
  }

  /* ---------- Formasyon ve mevki seçici ----------
     st: { formation, spot, role }  ctx: create | profil | heir */
  function formationPicker(st, ctx) {
    const fm = D.formations.find((f) => f.id === st.formation) || D.formations[0];
    const mini = (f) => `<button class="fmcard ${f.id === fm.id ? 'on' : ''}" data-a="fm-pick" data-v="${f.id}" data-w="${ctx}" aria-label="${f.id}">
      <svg viewBox="0 0 60 78" width="54" height="70" aria-hidden="true"><rect width="60" height="78" rx="4" fill="#2e8b3c"/><g fill="none" stroke="#fff" stroke-width=".8" opacity=".75"><rect x="2" y="2" width="56" height="74" rx="2"/><path d="M2 39H58"/><circle cx="30" cy="39" r="7"/><rect x="18" y="2" width="24" height="10"/><rect x="18" y="66" width="24" height="10"/></g>
      ${f.spots.map(([x, y]) => `<circle cx="${(2 + x * 0.56).toFixed(1)}" cy="${(2 + y * 0.74).toFixed(1)}" r="2.6" fill="#fff"/>`).join('')}</svg><b>${f.id}</b></button>`;
    const big = fm.spots.map(([x, y, r], i) => {
      const on = st.spot === i;
      const cx = 14 + x * 2.72, cy = 14 + y * 3.42;
      return `<g class="fmspot" data-a="fm-spot" data-v="${i}" data-w="${ctx}" role="button" aria-label="${esc(D.roles[r].name)}">
        <circle cx="${cx}" cy="${cy}" r="${on ? 17 : 14}" fill="${on ? 'var(--accent)' : '#fff'}" stroke="${on ? '#fff' : 'rgba(0,0,0,.25)'}" stroke-width="${on ? 3 : 1.5}"/>
        <text x="${cx}" y="${cy + 3.6}" text-anchor="middle" font-size="${D.roles[r].short.length > 3 ? 8.5 : 10}" font-weight="800" fill="${on ? '#fff' : '#1d3b26'}" font-family="Figtree, sans-serif" style="pointer-events:none">${D.roles[r].short}</text></g>`;
    }).join('');
    const role = st.role ? D.roles[st.role] : null;
    const keys = role ? Object.keys(role.w).sort((a, b) => role.w[b] - role.w[a]) : [];
    return `<div class="fmrow">${D.formations.map(mini).join('')}</div>
      <svg class="fmbig" viewBox="0 0 300 370" role="group" aria-label="${fm.id} dizilişi">
        <rect width="300" height="370" rx="12" fill="#2e8b3c"/>${Array.from({ length: 8 }, (_, i) => `<rect y="${8 + i * 44}" width="300" height="22" fill="#349a43" opacity=".55"/>`).join('')}
        <g fill="none" stroke="#fff" stroke-width="1.6" opacity=".75"><rect x="8" y="8" width="284" height="354" rx="4"/><path d="M8 185H292"/><circle cx="150" cy="185" r="34"/><rect x="80" y="8" width="140" height="52"/><rect x="118" y="8" width="64" height="18"/><rect x="80" y="310" width="140" height="52"/><rect x="118" y="344" width="64" height="18"/></g>
        ${big}</svg>
      ${role ? `<div class="card stack" style="gap:6px"><div class="row"><b class="grow">${esc(role.name)}</b><span class="chip">${D.positions.find((g) => g.id === role.grp).name}</span></div><p class="small">${esc(role.desc)}</p><div class="row wrap">${keys.map((k, i) => `<span class="chip ${i < 2 ? 'on' : ''}">${esc(D.attrs[k])}</span>`).join('')}</div><p class="tiny muted">Gücün bu yeteneklerden hesaplanır. Maçta bu mevkiye özel anlar yaşarsın.</p></div>` : '<p class="small muted">Sahada oynamak istediğin yere dokun.</p>'}`;
  }

  // Bu kökenlerde başlangıç kulübünü sen seçersin. Dünya aynı tohumla önceden kurulup adaylar gösterilir.
  function clubPicker(c, og) {
    if (!c.seed) c.seed = Math.floor(Math.random() * 2147483647);
    if (!c.clubOpts || c.clubOpts.origin !== og.id) { c.clubOpts = { origin: og.id, list: F.startClubOptions(og.id, c.seed) }; c.club = null; }
    return `<div class="label">Hangi kulüpte başlıyorsun?</div><div class="stack" style="gap:8px">${c.clubOpts.list.map((t) => `<button class="opt" data-a="c-club" data-v="${t.id}" style="${c.club === t.id ? 'box-shadow:inset 0 0 0 2.5px var(--accent)' : ''}"><div class="row">${badge(t, 30)}<div class="grow"><b>${esc(t.name)}</b><div class="tiny muted">${esc(t.tierName)} · ${esc(t.province)} · kadro gücü ${t.str}</div></div>${c.club === t.id ? '<span class="chip on">Seçildi</span>' : ''}</div></button>`).join('')}</div>
      <p class="tiny muted">Güçlü kulüpte forma kapmak zor, zayıf kulüpte her hafta oynarsın.</p>`;
  }

  /* ---------- Yetenek puanı dağıtımı: kökenin puan verir, mevkine göre harcarsın ---------- */
  function allocBox(c, og) {
    if (!c.seed) c.seed = Math.floor(Math.random() * 2147483647);
    const key = og.id + '|' + c.role + '|' + c.seed;
    if (!c.base || c.baseKey !== key) { c.base = F.previewAttrs({ origin: og.id, role: c.role, pos: D.roles[c.role].grp, seed: c.seed, name: 'x', surname: 'y' }); c.baseKey = key; }
    c.alloc = c.alloc || {};
    const pool = D.originPoints[og.id] || 20;
    const used = Object.values(c.alloc).reduce((a, b) => a + b, 0);
    const left = pool - used;
    const w = D.roles[c.role].w;
    const isKL = c.role === 'KL';
    const keys = Object.keys(D.attrs).filter((k) => isKL || !D.keeperAttrs.includes(k));
    const main = keys.filter((k) => w[k]).sort((a, b) => w[b] - w[a]);
    const rest = keys.filter((k) => !w[k]);
    const row = (k) => { const a = c.alloc[k] || 0, b = c.base[k]; return `<div class="row small" style="gap:8px"><span class="grow">${esc(D.attrs[k])}${w[k] ? ' <b style="color:var(--accent)">★</b>' : ''}</span><span class="num muted">${b}</span><b class="num" style="min-width:52px;text-align:right;color:${a ? 'var(--good)' : 'var(--ink)'}">${a ? '→ ' + (b + a) : ''}</b>
      <button class="arrow" data-a="al-sub" data-v="${k}" ${a ? '' : 'disabled'} aria-label="${esc(D.attrs[k])} azalt">−</button><button class="arrow" data-a="al-add" data-v="${k}" ${left > 0 && a < D.allocMax ? '' : 'disabled'} aria-label="${esc(D.attrs[k])} artır">+</button></div>`; };
    return `<div class="label">3 · Yetenek puanların</div>
      <div class="card stack" style="gap:8px"><div class="row"><span class="grow small">${esc(og.name)} sana <b>${pool}</b> puan veriyor. Mevkine göre dağıt.</span><span class="chip ${left ? 'warn' : 'good'} num">Kalan ${left}</span></div>
        <div class="row" style="gap:8px"><button class="btn alt sm" data-a="al-auto">Mevkime göre dağıt</button><button class="btn ghost sm" data-a="al-reset" ${used ? '' : 'disabled'}>Sıfırla</button></div>
        <div class="tiny muted">★ ${esc(D.roles[c.role].name)} için önemli yetenekler. Bir yeteneğe en fazla +${D.allocMax}.</div>
        ${main.map(row).join('')}
        <button class="btn ghost sm" data-a="al-more" style="align-self:flex-start">${c.allMore ? 'Diğer yetenekleri gizle' : 'Diğer yetenekler (' + rest.length + ')'}</button>
        ${c.allMore ? rest.map(row).join('') : ''}
        ${left ? `<p class="tiny" style="color:var(--warn)">${left} puan harcanmadı. Kariyere başlarken harcanmamış puanlar kaybolur.</p>` : ''}</div>`;
  }

  /* ---------- Karakter oluşturma ---------- */
  function viewCreate() {
    const c = U.create;
    const og = D.origins.find((o) => o.id === c.origin);
    return {
      main: `<div class="stack fade">
        <div class="topbar"><button class="back" data-a="to-start" aria-label="Geri">${ICON.back}</button><h2 class="display" style="font-size:28px">Yeni kariyer</h2></div>
        <div class="label">1 · Nereden başlıyorsun?</div>
        <div class="stack" style="gap:8px">${D.origins.map((o) => `<button class="origin ${c.origin === o.id ? 'on' : ''}" data-a="c-origin" data-v="${o.id}">
          <div class="row" style="justify-content:space-between;width:100%"><h3>${esc(o.name)}</h3><span class="chip">${o.start.c === 'TR' ? (o.start.big ? 'Süper Lig U19' : D.leagues.TR.tiers[o.start.t - 1].short || D.leagues.TR.tiers[o.start.t - 1].name) : 'Almanya Bölge Ligi'} · ${o.age} yaş${o.pickClub ? ' · kulübünü seç' : ''}</span></div>
          <span class="small">${esc(o.desc)}</span>
          ${c.origin === o.id ? `<span class="small"><b>Güçlü yanın:</b> ${esc(o.strong)}</span><span class="small"><b>Yükün:</b> ${esc(o.burden)}</span>` : ''}
        </button>`).join('')}</div>
        ${og && og.pickClub ? clubPicker(c, og) : ''}
        <div class="label">2 · Mevkin</div>
        ${positionMap(c, 'create')}
        ${og && c.role ? allocBox(c, og) : ''}
        <div class="label">Memleketin</div>
        <select id="c-home" aria-label="Memleket">${(() => { const RN = { MAR: 'Marmara', EGE: 'Ege', AKD: 'Akdeniz', ICA: 'İç Anadolu', KAR: 'Karadeniz', DOG: 'Doğu Anadolu', GDA: 'Güneydoğu Anadolu' }; return '<option value="">Rastgele</option>' + Object.keys(RN).map((r) => '<optgroup label="' + RN[r] + '">' + D.homePlaces.filter((pl) => pl.region === r).sort((x, y) => x.name.localeCompare(y.name, 'tr')).map((pl) => '<option value="' + esc(pl.name) + '"' + (c.home === pl.name ? ' selected' : '') + '>' + esc(pl.name) + (pl.province !== pl.name ? ' (' + esc(pl.province) + ')' : '') + '</option>').join('') + '</optgroup>').join(''); })()}</select>
        <p class="tiny muted">Memleketinin kulübü seni daha çok takip eder ve teklif yapar. Başlangıç kulübün de bu bölgeden seçilir.</p>
        <div class="label">${og && c.role ? '4' : '3'} · Adın</div>
        <div class="row"><input type="text" id="c-name" placeholder="Ad" value="${esc(c.name)}" maxlength="16" aria-label="Ad"><input type="text" id="c-sur" placeholder="Soyad" value="${esc(c.surname)}" maxlength="18" aria-label="Soyad"></div>
        <button class="btn alt sm" data-a="c-rand" style="align-self:flex-start">Rastgele isim</button>
        <div class="label">${og && c.role ? '5' : '4'} · Görünüm ve forma numarası</div>
        ${lookEditor(c.look, ['#2f6e4c', '#183a28'], c.number, 'c-numin', c.surname || 'SOYAD')}
        ${og ? `<p class="small muted">Memleketin ve ailen rastgele belirlenir. Kulübün ${og.start.big ? 'İstanbul\'un dev kulüplerinden biri' : 'kökeninin bölgesinden'} olacak.</p>` : ''}
      </div>`,
      dock: `<button class="btn" data-a="c-go" ${c.origin && c.role && (!og || !og.pickClub || c.club) ? '' : 'disabled'}>Kariyere başla</button>`
    };
  }

  /* ---------- Oyun ---------- */
  function viewGame() {
    const S = F.S;
    if (U.app) return Object.assign({ bar: statusBar() }, appView(U.app));
    if (S.queue.length) return Object.assign({ bar: statusBar() }, stepView(S.queue[0]));
    return Object.assign({ bar: statusBar() }, homeView());
  }

  // ana ekran: yaklaşan milli ara ve Avrupa kupası maçı
  function upcomingCards() {
    const S = F.S, P = S.P, Cd = F.DATA.cups;
    let out = '';
    try {
      const nb = F.nextNatBreak && F.nextNatBreak();
      const up = nb && F.natUpcoming();
      if (up) {
        const when = nb.in <= 0 ? 'bu hafta' : nb.in === 1 ? 'gelecek hafta' : nb.in + ' hafta sonra';
        const need = P.natTeam === 'DE' ? 80 : 73;
        const st = !P.natTeam ? 'Milli takım seçimini henüz yapmadın.' : F.wcSquad() ? 'Kadroya çağrılman bekleniyor.' : F.calledUp() ? 'U21 çağrısı bekleniyor; A takım için güç ' + need + ' gerekli.' : 'Kadroya girmek için güç ' + need + ' civarı gerekli (şu an ' + F.ovr() + ').';
        out += `<div class="card stack" style="gap:6px"><div class="row"><div class="label grow">Milli ara · ${esc(when)}</div><span class="chip ${F.wcSquad() ? 'good' : ''}">${esc(up.nation)}</span></div><b class="small">${esc(up.comp)}</b>${up.opps.length ? `<div class="small">${up.opps.map((o) => esc(o.home ? up.nation + ' – ' + o.opp : o.opp + ' – ' + up.nation)).join('<br>')}</div>` : ''}<span class="tiny muted">${esc(st)}</span></div>`;
      }
      const C = F.myClubCup && F.myClubCup();
      if (C && C.md < C.cal.length && S.league) {
        const r = C.cal[C.md] - S.league.round;
        const st = F.cupStages(C);
        if (F.cupAlive(C, P.contract.team) && r >= 0) out += `<div class="card row"><div class="grow"><div class="label">${esc(Cd[C.id].name)}</div><span class="small">${C.md < C.gr ? (C.md + 1) + '. grup maçı' : esc(F.STAGE_NAME[st[C.md - C.gr]])} · ${r === 0 ? 'bu hafta ortası' : r + ' hafta sonra'}</span></div><button class="btn ghost" data-a="open" data-v="lig" style="width:auto">Tablo</button></div>`;
      }
    } catch (e) { /* kart hatası ana ekranı bozmasın */ }
    return out;
  }
  // gönderi başka birini hedef alıyorsa küçük bir etiket: beğenmeden önce kimin hakkında olduğunu gör
  function postAboutChip(p) {
    if (p.me || !F.postMeta) return '';
    const m = F.postMeta(p);
    if (!m.about || m.about === 'me' || m.tone === 'notr') return '';
    return `<span class="chip ${m.tone === 'neg' ? 'bad' : 'good'}" style="margin-left:6px;padding:1px 8px">${esc(F.aboutLabel(m.about))} hakkında</span>`;
  }
  function homeView() {
    const S = F.S, P = S.P;
    const t = F.myTeam();
    const ovr = F.ovr();
    const posName = F.role(P).name;
    const o = opp();
    const fx = F.myFixture();
    const pos = F.myPos();
    const light = lum(t.colors[0]) > 0.62;
    const h = F.npc('hoca');
    const order = S.order && !P.injury ? `<div class="order"><span class="yc"></span><span>Hoca ${esc(h ? h.name.split(' ')[0] : '')} bu hafta <b>${esc((D.training.find((x) => x.id === S.order.focus) || {}).name || '')}</b> çalışmanı istiyor.</span></div>` : '';
    const ch = S.challenge ? `<div class="flat small row"><span class="grow"><span class="label">Meydan okuma</span><br>${esc(S.challenge.name)}</span><span class="chip acc num">${S.challenge.prog}/${S.challenge.need}</span></div>` : '';
    const apps = [['tribun', 'Sosyal Medya', S.unread.feed], ['mesaj', 'Mesajlar', S.dms.filter((m) => !m.read).length + S.requests.length + (S.convos || []).filter((c) => !c.ans).length], ['ozel', 'Özel Hayat'], ['kadro', 'Kadro'], ['kisiler', 'Kişiler'], ['menajer', 'Menajer', S.tasks.filter((x) => !x.done).length ? 0 : 0], ['banka', 'Banka'], ['magaza', 'Mağaza'], ['profil', 'Profil'], ['lig', 'Lig'], ['album', 'Albüm'], ['muze', 'Aile Müzesi'], ['ayarlar', 'Ayarlar']];
    return {
      main: `<div class="stack fade">
        <div class="hero ${light ? 'light' : ''}" style="--c1:${t.colors[0]};--c2:${t.colors[1]}">
          <div class="row" style="justify-content:space-between;align-items:flex-start">
            <div class="stack" style="gap:6px;min-width:0">
              <div class="row" style="gap:10px">${meFace('md')}<div class="nm">${esc(P.name)}<br>${esc(P.surname)}</div></div>
              <div class="small" style="opacity:.85">${P.age} yaş · ${esc(posName)} · ${esc(P.originName)}</div>
              <div class="row wrap" style="gap:6px">${P.injury ? `<span class="chip bad">Sakat · ${P.injury.weeks} hafta</span>` : ''}${P.suspended ? `<span class="chip bad">Cezalı · ${P.suspended} maç</span>` : ''}${S.flags.kaptan ? '<span class="chip acc">Kaptan</span>' : ''}<span class="chip">${esc(D.roleNames[P.contract.role])}${P.contract.guarantee ? " · forma garantili" : ""}</span>${P.contract.loanFrom ? '<span class="chip warn">Kiralık</span>' : ''}</div>
            </div>
            <div class="kit">${F.ART.jersey(t.colors[0], t.colors[1], P.number || 10, P.surname, 92)}<div class="ovrbadge num">${ovr}<span>GÜÇ</span></div></div>
          </div>
          <div class="sep" style="background:currentColor;opacity:.18;margin:12px 0 10px"></div>
          <div class="row small" style="justify-content:space-between"><span>${esc(F.leagueName())}</span><b class="num">${pos}. sıra</b></div>
        </div>
        ${o ? `<div class="card"><div class="label" style="margin-bottom:8px">Sonraki maç · ${fx.home ? 'İç saha' : 'Deplasman'}</div><div class="next"><div class="tm">${badge(fx.home ? t : o, 36)}<span>${esc(fx.home ? t.name : o.name)}</span></div><span class="vs">VS</span><div class="tm">${badge(fx.home ? o : t, 36)}<span>${esc(fx.home ? o.name : t.name)}</span></div></div></div>` : `<div class="card small muted">Bu sezonun maçları bitti.</div>`}
        ${upcomingCards()}
        ${order}${S.agent ? S.tasks.filter((t) => !t.done).slice(0, 2).map((t) => `<div class="order agent"><span class="yc"></span><span>Menajer ${esc(F.npc('menajer') ? F.npc('menajer').name.split(' ')[0] : '')}: <b>${esc(t.desc)}</b> <span class="tiny">· ${Math.max(0, t.until - S.t)} hafta</span></span></div>`).join('') : ''}
        <div class="card stack" style="gap:8px">${meter('Enerji', P.life.enerji)}${meter('Moral', P.life.moral)}${meter('Sağlık', P.life.saglik)}${meter('Form', P.life.form + 10, 20).replace(/<span class="v">\d+<\/span>/, `<span class="v">${P.life.form > 0 ? '+' : ''}${Math.round(P.life.form)}</span>`)}</div>
        ${ch}
        <div class="apps">${apps.map(([id, nm, b]) => `<button class="app" data-a="open" data-v="${id}"><span class="ic">${ICON[id]}</span>${esc(nm)}${b ? `<span class="badge">${b > 9 ? '9+' : b}</span>` : ''}</button>`).join('')}</div>
      </div>`,
      dock: `<button class="btn" data-a="open" data-v="plan">Haftayı planla</button>`
    };
  }

  /* ---------- Hafta planı ---------- */
  function planView() {
    const S = F.S, P = S.P;
    const plan = S.plan;
    const acts = F.availableActivities();
    plan.acts = plan.acts.filter((id) => acts.some((a) => a.id === id)).slice(0, F.slots());
    const load = D.loads[plan.load];
    let e = P.life.enerji + (plan.train === 'dinlenme' ? 22 : -load.e);
    let cost = 0;
    plan.acts.forEach((id) => { const a = acts.find((x) => x.id === id); e += (a.fx.enerji || 0); cost += F.planCost(id); });
    e = F.clamp(e, 0, 100);
    const ordered = S.order ? S.order.focus : null;
    const rw = F.posW(P);
    const trainOpts = D.training.filter((t) => !D.keeperAttrs.includes(t.id) || P.pos === 'KL').sort((a, b) => (rw[b.id] || 0) - (rw[a.id] || 0));
    return {
      main: `<div class="stack fade">
        <div class="topbar"><button class="back" data-a="back" aria-label="Geri">${ICON.back}</button><h2 class="display" style="font-size:28px">Hafta ${S.week} planı</h2></div>
        <div class="card stack">
          <div class="label">Antrenman odağı</div>
          ${P.injury ? `<p class="small" style="color:var(--bad)">Sakatsın, bu hafta sadece dinlenme ve tedavi.</p>` : ''}
          ${trainPicker(plan, ordered, rw)}
          <div class="label">Yük</div>
          <div class="seg">${Object.keys(D.loads).map((k) => `<button class="${plan.load === k ? 'on' : ''}" data-a="plan-load" data-v="${k}">${D.loads[k].name} <span class="tiny">−${D.loads[k].e}</span></button>`).join('')}</div>
        </div>
        <div class="card stack">
          <div class="row"><div class="label grow">Boş zaman · ${plan.acts.length}/${F.slots()} slot</div><span class="tiny muted">${S.league && S.league.round === Math.floor(F.seasonRounds() / 2) && (!S.wb || S.wb.season !== S.season || S.wb.left > 0) ? 'Devre arası' : F.isNatBreak() ? 'Milli ara' : F.myFixture() ? 'Maç haftası' : 'Maçsız hafta'}</span></div>
          <div class="stack" style="gap:8px">${acts.map((a) => {
            const on = plan.acts.includes(a.id);
            const c = F.planCost(a.id);
            const full = !on && plan.acts.length >= F.slots();
            return `<button class="opt" data-a="plan-act" data-v="${a.id}" ${full ? 'disabled' : ''} style="${on ? 'box-shadow:inset 0 0 0 2.5px var(--accent)' : ''}"><div class="row"><b class="grow">${esc(a.name)}</b>${on ? '<span class="chip on">Seçildi</span>' : ''}</div><div class="small muted">${esc(a.desc)}</div><div class="meta">${fxPreview(F.actFx(a.id), c)}${(S.actHist || {})[a.id] >= 2 ? '<span class="chip warn">Alıştın: getiri düştü</span>' : ''}${a.risk ? '<span class="chip warn">Sürpriz olabilir</span>' : ''}</div></button>`;
          }).join('')}</div>
        </div>
      </div>`,
      dock: `<div class="stack" style="width:100%;gap:6px"><div class="row small"><span class="grow muted">Maç günü tahmini enerji</span><b class="num" style="color:${e < 40 ? 'var(--bad)' : 'var(--ink)'}">${Math.round(e)}</b><span class="muted">·</span><b class="num">${F.money(-cost)}</b></div><button class="btn" data-a="week-start">Haftayı başlat</button></div>`
    };
  }

  /* =========================================================
     ADIMLAR
     ========================================================= */
  function stepView(st) {
    switch (st.type) {
      case 'ev': return eventView(st);
      case 'match': return matchView(st);
      case 'press': return pressView(st);
      case 'post': return postView(st);
      case 'summary': return summaryView(st);
      case 'seasonSummary': return seasonView(st);
      case 'natInfo': return natInfoView(st);
      case 'tactic': return tacticView(st);
      case 'goals': return goalsView(st);
      case 'offers': return offersView(st);
      case 'retire': return retireView(st);
      case 'heir': return heirView(st);
      case 'gameover': return gameoverView();
      default: return { main: `<p>Bilinmeyen adım: ${esc(st.type)}</p>`, dock: `<button class="btn" data-a="ev-next">Devam</button>` };
    }
  }

  function eventView(st) {
    const ev = F.EV[st.id];
    const node = ev.nodes[st.node];
    const who = whoInfo(node.who || ev.who);
    const kindLabel = { card: st.daily ? 'Günün gündemi' : 'Olay', chat: 'Konuşma', call: 'Telefon', dm: 'Mesaj' }[ev.kind] || 'Olay';
    if (st.ringing) {
      return {
        main: `<div class="call fade">${`<div class="ring" style="border-radius:50%">${av(who.name, true, who.opts)}</div>`}<div><div class="display" style="font-size:30px">${esc(who.name)}</div><div class="muted">${esc(who.label || 'arıyor…')}</div></div><div class="label">Gelen arama</div>
          <div class="callbtns"><button style="background:var(--bad)" data-a="call" data-v="0">Reddet</button><button style="background:var(--good)" data-a="call" data-v="1">Aç</button></div></div>`
      };
    }
    const opts = st.done ? [] : F.visibleOptions(node);
    const optHtml = opts.map((o, i) => `<button class="opt" data-a="ev-opt" data-v="${i}" ${o.locked ? 'disabled' : ''}>
        ${o.tone ? `<div class="tone">${esc(TONES[o.tone] || o.tone)}</div>` : ''}<div>${esc(F.tpl(o.t))}</div>
        ${o.locked || o.prob != null ? `<div class="meta">${o.locked ? `<span class="chip bad">${esc(o.lockText)}</span>` : ''}${o.prob != null ? `<span class="chip acc">${esc(F.chkLabel(o.chk))}</span>${probTag(o.prob)}` : ''}</div>` : ''}
      </button>`).join('');
    const header = `<div class="scene" style="--tint:${who.tint || 'var(--accent)'}"><div class="who">${av(who.name, 'md', who.opts)}<div class="grow"><b>${esc(who.name)}</b>${who.label ? `<div class="tiny" style="opacity:.8">${esc(who.label)}</div>` : ''}</div>${kindLabel.toLocaleLowerCase('tr') === who.name.toLocaleLowerCase('tr') ? '' : `<span class="chip scene-chip">${kindLabel}</span>`}</div></div>`;
    const res = st.result;
    if (ev.kind === 'chat' || ev.kind === 'call' || ev.kind === 'dm') {
      const log = st.log.map((l) => l.me ? `<div class="bub me">${l.tone ? `<div class="tone">${esc(TONES[l.tone] || '')}</div>` : ''}${esc(l.t)}</div>` : `<div class="bub them">${esc(l.t)}</div>`).join('');
      const cur = st.done ? '' : `<div class="bub them">${esc(F.tpl(node.t))}</div>`;
      return {
        main: `<div class="stack fade">${header}<div class="chat">${log}${cur}${res && res.r ? `<div class="bub them">${esc(res.r)}</div>` : ''}${res && res.success != null ? `<div class="bub sys">${res.success ? 'Başarılı' : 'Başarısız'}</div>` : ''}</div>
          ${st.lastDeltas && !st.done ? deltaChips(st.lastDeltas) : ''}${res ? deltaChips(res.deltas) : ''}</div>`,
        dock: st.done ? `<button class="btn" data-a="ev-next">Devam</button>` : `<div class="stack" style="width:100%;gap:8px;max-height:52vh;overflow:auto">${optHtml}</div>`
      };
    }
    return {
      main: `<div class="stack fade">${header}<div class="card"><p class="ev-text">${esc(F.tpl(node.t))}</p></div>
        ${res ? `<div class="result stack" style="gap:8px">${res.success != null ? `<span class="chip ${res.success ? 'good' : 'bad'}" style="align-self:flex-start">${res.success ? 'Başarılı' : 'Başarısız'}</span>` : ''}${res.r ? `<p>${esc(res.r)}</p>` : ''}${deltaChips(res.deltas)}</div>` : `<div class="stack" style="gap:8px">${optHtml}</div>`}</div>`,
      dock: res ? `<button class="btn" data-a="ev-next">Devam</button>` : ''
    };
  }

  /* ---------- Maç ---------- */
  // maç anı animasyonu: gol/asistte top ağlara, kurtarışta eldiven, müdahalede duvar, pasta küçük yazı, kaçan kritik anda top auta
  const FX_BALL = (cls) => `<g class="${cls}"><circle cx="66" cy="66" r="26" fill="#fff" stroke="#111" stroke-width="3"/><path d="M66 52l12 9-4.6 14h-14.8L54 61z" fill="#111"/><path d="M66 40v12M78 61l12-4M73.4 75l7 10M58.6 75l-7 10M54 61l-12-4" stroke="#111" stroke-width="2.4"/></g>`;
  const FX_NET = '<g stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none"><rect x="8" y="18" width="116" height="96" rx="4" stroke-width="5"/>' + [30, 52, 74, 96].map((x) => `<path d="M${x} 18V114"/>`).join('') + [40, 62, 84].map((y) => `<path d="M8 ${y}H124"/>`).join('') + '</g>';
  const FX_GLOVE = '<g class="grab"><path d="M40 112V62c0-6 9-6 9 0v-22c0-7 10-7 10 0v-6c0-7 10-7 10 0v8c0-7 10-7 10 0v28c4-8 13-6 11 2l-8 22c-3 10-10 18-22 18H52c-7 0-12-5-12-12z" fill="#f2c200" stroke="#111" stroke-width="3"/><path d="M46 96h40" stroke="#111" stroke-width="3"/></g>';
  const FX_WALL = '<g stroke="#5a2e1a" stroke-width="2">' + [0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${18 + c * 32 + (r % 2 ? 16 : 0) - (r % 2 && c === 2 ? 0 : 0)}" y="${30 + r * 20}" width="30" height="18" rx="2" fill="#b5532c"/>`).join('')).join('') + '</g>';
  const fxCard = (col) => `<rect x="44" y="26" width="44" height="64" rx="6" fill="${col}" stroke="#111" stroke-width="3" transform="rotate(-10 66 58)"/>`;
  function momentFx(l) {
    let svg = '', lbl = '', cls = 'mfx-good', wrap = '';
    if (l.kind === 'goal' || l.kind === 'assist') { svg = FX_NET + FX_BALL('ballin'); lbl = l.kind === 'goal' ? 'GOL!' : 'ASİST!'; }
    else if (l.kind === 'save') { svg = FX_BALL('grab') + FX_GLOVE; lbl = 'KURTARIŞ!'; }
    else if (l.kind === 'block') { svg = FX_WALL + FX_BALL('bounce'); lbl = 'MÜDAHALE!'; }
    else if (l.kind === 'pass' && l.setPiece) { lbl = l.setPiece === 'pk' ? 'PENALTI!' : 'SERBEST VURUŞ!'; cls = ''; svg = FX_BALL(''); }
    else if (l.kind === 'pass') { lbl = 'PAS'; cls = ''; wrap = 'mfx-pass'; }
    else if (l.kind === 'concede') { svg = FX_NET + FX_BALL('ballin'); lbl = 'GOL YEDİK'; cls = 'mfx-bad'; }
    else if ((l.kind === 'miss' || l.kind === 'lost' || l.kind === 'chance') && l.key) { svg = FX_BALL('ballout'); lbl = l.kind === 'chance' ? 'KALECİDE!' : 'KAÇTI!'; cls = 'mfx-bad'; }
    else if (l.kind === 'yellow' || l.kind === 'red') { svg = fxCard(l.kind === 'red' ? '#e32' : '#f2c200'); lbl = l.kind === 'red' ? 'KIRMIZI KART' : 'SARI KART'; cls = 'mfx-bad'; }
    if (!lbl) return '';
    return `<div class="mfx ${wrap}" aria-hidden="true"><div class="mfx-card ${cls}">${svg ? `<svg viewBox="0 0 132 132">${svg}</svg>` : ''}<div class="mfx-lbl">${esc(lbl)}</div></div></div>`;
  }
  const momentSnd = (l) => (l.kind === 'pass' && l.setPiece ? 'setpiece' : l.kind === 'yellow' || l.kind === 'red' ? 'card' : l.kind === 'lost' && !l.key ? 'lost' : l.kind === 'lost' ? 'miss' : l.kind);
  function matchView(st) {
    const S = F.S, P = S.P;
    const m = F.matchStart();
    const meRaw = m.nat ? { name: P.natTeam === 'DE' ? 'Almanya' : 'Türkiye', colors: P.natTeam === 'DE' ? ['#111111', '#DD0000'] : ['#E30A17', '#FFFFFF'], id: 'nat' } : F.myTeam();
    const opRaw = m.nat ? { name: m.oppName, colors: m.oppColors || ['#334455', '#99aabb'], id: 'natop' } : F.team(m.opp);
    // sahada görünür formalar: yeşil forma çimde kaybolmasın, renkler çakışırsa rakip deplasman formasını giysin
    const me = Object.assign({}, meRaw, { colors: F.ART.fieldKit(meRaw.colors) });
    const op = Object.assign({}, opRaw, { colors: F.ART.kitFor(meRaw.colors, opRaw.colors) });
    const [L, R] = m.home ? [me, op] : [op, me];
    const statusTxt = { ilk11: 'İlk 11\'desin', yedek: 'Yedek kulübesindesin', kadrodisi: 'Kadroda yoksun', sakat: 'Sakatsın, tribündesin', ceza: 'Cezalısın, tribündesin' }[m.status];
    if (!m.feed) F.buildFeed(m);
    const ls = m.done ? { gf: m.gfTotal, ga: m.gaTotal } : F.liveScore(m);
    const score = m.home ? `${ls.gf} – ${ls.ga}` : `${ls.ga} – ${ls.gf}`;
    const board = `<div class="board"><div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="meta">${esc(m.comp)}</span>${m.derby ? '<span class="chip warn">Derbi</span>' : m.big ? '<span class="chip warn">Kritik maç</span>' : ''}${m.scout ? '<span class="chip acc">Scout tribünde</span>' : ''}</div>
      <div class="row" style="justify-content:space-between;gap:10px"><div class="stack" style="gap:6px;align-items:center;flex:1;min-width:0;text-align:center">${badge(L, 38)}<span class="tn">${esc(L.name)}</span></div><div class="sc num">${score}</div><div class="stack" style="gap:6px;align-items:center;flex:1;min-width:0;text-align:center">${badge(R, 38)}<span class="tn">${esc(R.name)}</span></div></div></div>`;
    const last = m.log[m.log.length - 1];
    const anim = U.animN !== m.log.length + '|' + S.t;
    U.animN = m.log.length + '|' + S.t;
    // senin anının animasyonu ve sesi (yalnızca yeni hamlede bir kez)
    // spikerin yeni satırı mı açıldı? (gol, fırsat, düdük: saha, ses ve animasyon buna göre değişir)
    const fk = S.t + '|' + (m.done ? m.feed.length : m.fi);
    const feedNew = !!(U.sndFeed && U.sndFeed.t === S.t && U.sndFeed.k !== fk);
    U.sndFeed = { t: S.t, k: fk };
    const lf = !m.done && m.fi > 0 ? m.feed[m.fi - 1] : null;
    // sıradaki an senin anınsa saha seni gösterir; değilse maçın akışını (top spikerin anlattığı yerde)
    const pend = m.played && m.i < m.moments.length && (!m.feed[m.fi] || m.moments[m.i].minute <= m.feed[m.fi].minute);
    const useFlow = !!lf && !pend && !(anim && last) && (!last || lf.minute >= last.minute);
    const flow = useFlow ? { cur: lf, prev: m.fi > 1 ? m.feed[m.fi - 2] : null, n: m.fi } : null;
    // animasyon: senin hamlen ya da akıştaki gol (senin dışındaki goller de ekranda belirir)
    let mfx = anim && last ? momentFx(last) : '';
    if (!mfx && feedNew && lf && lf.kind === 'goal') mfx = momentFx({ kind: lf.side === 'me' ? 'goal' : 'concede' });
    if (F.SND) {
      if (anim && last) F.SND.play(momentSnd(last));
      else if (feedNew && lf) F.SND.play(lf.kind === 'goal' ? (lf.side === 'me' ? 'goal' : 'concede') : lf.kind === 'chance' ? (lf.side === 'me' ? 'chance' : 'lost') : lf.kind === 'half' ? 'half' : lf.kind === 'end' ? 'end' : lf.kind === 'whistle' ? 'whistle' : '');
    }
    const pitch = (m.played || m.status === 'yedek') && !m.done ? `<div class="pitchwrap">${F.ART.pitch(m, last ? last.kind : null, m.log.length, me.colors, op.colors, flow ? feedNew : anim && !!last, flow)}</div>` : '';
    // Spiker: açılan akış satırları ve senin anların; en yenisi üstte
    const shown = m.done ? m.feed.length : m.fi;
    // devre ve maç sonu satırında o ana kadarki skor
    const scoreAt = (idx, min) => { let gf = 0, ga = 0; m.feed.slice(0, idx).forEach((x) => { if (x.kind === 'goal') { if (x.side === 'me') gf++; else ga++; } }); m.log.forEach((l) => { if (l.minute <= min) { if (l.kind === 'goal' || l.kind === 'assist') gf++; if (l.kind === 'concede') ga++; } }); return m.home ? gf + '-' + ga : ga + '-' + gf; };
    const lines = m.feed.slice(0, shown).map((f, idx) => ({ minute: f.minute, t: f.t.replace('{skor}', scoreAt(idx, f.minute)), cls: f.kind === 'goal' ? (f.side === 'me' ? 'gl-me' : 'gl-op') : f.kind === 'half' || f.kind === 'whistle' || f.kind === 'end' ? 'wh' : f.side === 'op' ? 'op' : '', icon: f.kind === 'goal' ? '⚽' : f.kind === 'half' || f.kind === 'whistle' || f.kind === 'end' ? '⏱' : '' }))
      .concat(m.log.map((l) => ({ minute: l.minute, t: l.t, cls: 'mine ' + (l.ok ? 'ok' : 'no'), icon: l.ok ? '✓' : '✗', mine: true })))
      .sort((x, y) => y.minute - x.minute || (y.mine ? 1 : 0) - (x.mine ? 1 : 0));
    const cmt = lines.length ? `<div class="card cmt" aria-live="polite"><div class="label" style="margin-bottom:6px">Spiker</div>${lines.map((l) => `<div class="cl ${l.cls}"><b class="num">${l.minute}'</b><span>${l.icon ? `<i>${l.icon}</i> ` : ''}${esc(l.t)}</span></div>`).join('')}</div>` : '';
    if (m.done) {
      const res = m.res === 'win' ? ['Galibiyet', 'good'] : m.res === 'loss' ? ['Mağlubiyet', 'bad'] : ['Beraberlik', 'warn'];
      return {
        main: `<div class="stack fade">${board}<div class="card row" style="justify-content:space-between"><div><span class="chip ${res[1]}">${res[0]}</span><div class="small muted" style="margin-top:6px">${esc(statusTxt)}${m.goals ? ` · ${m.goals} gol` : ''}${m.assists ? ` · ${m.assists} asist` : ''}${m.red ? ' · kırmızı kart' : ''}</div></div>${m.rating != null ? `<div style="text-align:right"><div class="rating num" style="color:${m.rating >= 7 ? 'var(--good)' : m.rating < 6 ? 'var(--bad)' : 'var(--ink)'}">${m.rating.toFixed(1).replace('.', ',')}</div><div class="tiny muted">MAÇ NOTU</div></div>` : ''}</div>${deltaChips(m.deltas)}${cmt}</div>`,
        dock: `<button class="btn" data-a="ev-next">Devam</button>`
      };
    }
    // Akış: sıradaki an senin anınsa durur ve seçenekleri gösterir; değilse spiker kendiliğinden ilerler
    const nextF = m.feed[m.fi];
    const mo = m.played && m.i < m.moments.length ? m.moments[m.i] : null;
    const clock = m.fi ? m.feed[m.fi - 1].minute : 0;
    const head = `<div class="row small muted" style="justify-content:space-between"><span>${esc(statusTxt)}</span><span class="num"><b>${clock}'</b></span></div>`;
    const speechDue = m.halftime && m.fi > 0 && m.feed[m.fi - 1].kind === 'half';
    if (speechDue) {
      return { main: `<div class="stack fade">${board}${head}<div class="card stack"><div class="label">Devre arası · Kaptan konuşması</div><p class="ev-text">Soyunma odası sessiz. Herkes kaptanına bakıyor. Ne söyleyeceksin?</p></div>${cmt}</div>`,
        dock: `<div class="stack" style="width:100%;gap:8px"><button class="opt" data-a="m-speech" data-v="sakin"><div class="tone">Sakin</div>Taktik konuşalım, planımıza sadık kalalım.</button><button class="opt" data-a="m-speech" data-v="atesli"><div class="tone">Ateşli</div>Bu formanın hakkını verin! Sahaya çıkıp yıkın onları!</button><button class="opt" data-a="m-speech" data-v="sert"><div class="tone">Sert</div>Bazılarınız sahada yok. İkinci yarıda göreceğim.</button></div>` };
    }
    if (mo && (!nextF || mo.minute <= nextF.minute)) {
      U.flowSkip = false;
      const def = F.momentDef(mo.ref);
      return {
        main: `${mfx}<div class="stack fade">${board}${pitch}<div class="card stack moment" style="gap:6px"><div class="row"><div class="minute num grow">${mo.minute}'</div><span class="chip acc">Top sende</span></div>${mo.ref.startsWith('chain:') ? (() => { const st = mo.ref.split(':')[1]; if (!D.attackOrder.includes(st)) return `<div class="row" style="gap:6px"><span class="chip warn">${esc(D.attackStageNames[st] || st)}</span></div>`; return `<div class="row" style="gap:6px">${D.attackOrder.map((x) => `<span class="chip ${x === st ? 'on' : D.attackOrder.indexOf(x) < D.attackOrder.indexOf(st) ? 'good' : ''}">${D.attackStageNames[x]}</span>`).join('<span class="tiny muted">→</span>')}</div>`; })() : ''}<p class="ev-text">${esc(F.tpl(def.t))}</p></div>${cmt}</div>`,
        dock: `<div class="stack" style="width:100%;gap:8px">${def.o.map((o, i) => `<button class="opt" data-a="m-opt" data-v="${i}"><div class="row"><b class="grow">${esc(o.t)}</b>${probTag(F.momentProb(o, m))}</div><div class="tiny muted" style="margin-top:3px">${esc(D.attrs[o.a] || D.softs[o.a] || o.a)}${o.a2 && D.attrs[o.a2] ? ' + ' + esc(D.attrs[o.a2]) : ''}${o.easy ? ' · kolay seçenek' : ''}</div></button>`).join('')}</div>`
      };
    }
    if (nextF) {
      return {
        main: `${mfx}<div class="stack fade">${board}${head}${pitch}${cmt}</div>`,
        dock: `<button class="btn alt" data-a="m-skip">${mo ? 'Sıradaki anına geç' : 'Maçı hızlı geç'}</button>`,
        after: () => {
          // spiker bir sonraki satırı okur; hızlı geçişte bekleme yok
          // senin anının sonucu ekranda biraz kalsın
          const fresh = U.seenLog !== m.log.length + '|' + S.t;
          U.seenLog = m.log.length + '|' + S.t;
          const delay = U.flowSkip ? 0 : fresh && m.log.length ? 2200 : nextF.kind === 'goal' ? 1700 : nextF.kind === 'half' ? 1400 : 950;
          const tm = setTimeout(() => {
            const cur = F.S.queue[0] && F.S.queue[0].m;
            if (cur !== m) return;
            m.fi++;
            render(true);
          }, delay);
          U.mgCleanup = () => clearTimeout(tm);
        }
      };
    }
    U.flowSkip = false;
    return { main: `${mfx}<div class="stack fade">${board}${head}${pitch}${cmt}</div>`, dock: `<button class="btn" data-a="m-finish">Son düdük</button>` };
  }

  /* ---------- Basın ---------- */
  function pressView(st) {
    const qid = st.qs[st.i];
    const q = qid ? F.pressQ(qid) : null;
    const g0 = whoInfo('gazeteci');
    // her soruyu farklı bir gazeteci sorabilir
    const jl = D.journalists || [];
    const g = jl.length && !st.interview ? Object.assign({}, g0, { name: jl[(st.i + (st.qs[0] || '').length) % jl.length].name }) : g0;
    const log = st.log.map((l) => `<div class="bub them">${esc(l.q)}</div><div class="bub me">${esc(l.a)}</div>${l.r ? `<div class="bub sys">${esc(l.r)}</div>` : ''}${deltaChips(l.deltas)}`).join('');
    const title = st.interview ? 'Röportaj' : 'Basın toplantısı';
    if (st.done || !q) return { main: `<div class="stack fade"><div class="row"><div class="label grow">${title}</div><span class="chip">Bitti</span></div><div class="chat">${log}</div></div>`, dock: `<button class="btn" data-a="ev-next">Devam</button>` };
    const timed = !st.interview;
    return {
      main: `<div class="stack fade"><div class="row"><div class="who grow">${av(g.name, false, g.opts)}<div><b>${esc(g.name)}</b><div class="tiny muted">Gazeteci · Soru ${st.i + 1}/${st.qs.length}</div></div></div><span class="chip warn">${title}</span></div>
        <div class="chat">${log}<div class="bub them">${esc(F.tpl(q.q))}</div></div>
        ${timed ? `<div class="stack" style="gap:4px"><div class="timer"><i id="ptimer" style="width:100%"></i></div><span class="tiny muted">Cevap vermezsen "sessiz kaldı" sayılır.</span></div>` : ''}</div>`,
      dock: `<div class="stack" style="width:100%;gap:8px">${q.o.map((o, i) => `<button class="opt" data-a="press-opt" data-v="${i}"><div class="tone">${esc(TONES[o.tone] || o.tone || '')}</div>${esc(F.tpl(o.t))}</button>`).join('')}</div>`,
      after: timed ? () => {
        const total = 8000;
        const start = Date.now();
        pressTimer = setInterval(() => {
          const left = total - (Date.now() - start);
          const el = document.getElementById('ptimer');
          if (el) el.style.width = Math.max(0, left / total * 100) + '%';
          if (left <= 0) { clearInterval(pressTimer); F.pressAnswer(-1); render(); }
        }, 100);
      } : null
    };
  }

  /* ---------- Paylaşım ---------- */
  function postAnalysis(text) {
    if (!text || text.trim().length < 3) return '<p class="tiny muted">Yazdığın metin analiz edilir: ton, etkileşim puanı ve riskler burada görünür.</p>';
    const a = F.analyzePost(text);
    const col = a.eng >= 65 ? 'var(--good)' : a.eng >= 40 ? 'var(--warn)' : 'var(--bad)';
    return `<div class="flat stack" style="gap:6px"><div class="row small"><span class="grow">Ton: <b>${esc(a.label)}</b></span><span>Etkileşim <b style="color:${col}">${a.eng}/100</b></span></div>
      <div class="stack" style="gap:3px">${a.notes.slice(0, 5).map(([k, n]) => `<div class="tiny" style="color:${k === 'good' ? 'var(--good)' : k === 'bad' ? 'var(--bad)' : 'var(--warn)'}">${k === 'good' ? '✓' : k === 'bad' ? '✗' : '!'} ${esc(n)}</div>`).join('')}</div>
      <div class="meta row wrap">${fxPreview(Object.fromEntries(Object.entries(a.fx).filter(([k]) => k !== 'seed')))}</div></div>`;
  }
  function postView(st) {
    const S = F.S;
    const photos = F.postPhotos();
    const p = U.post;
    if (st.result) return { main: `<div class="stack fade"><div class="label">Sosyal Medya</div><div class="card stack"><p>${esc(st.result.r)}</p>${deltaChips(st.result.deltas)}</div></div>`, dock: `<button class="btn" data-a="ev-next">Devam</button>` };
    return {
      main: `<div class="stack fade"><div class="row"><span class="ic" style="color:var(--accent)">${ICON.tribun}</span><h2 class="display grow" style="font-size:26px">Bir şey paylaş</h2></div>
        <div class="label">Fotoğraf</div><div class="row wrap">${photos.map((ph) => `<button class="pick ${p.photo === ph.id ? 'on' : ''}" data-a="post-photo" data-v="${ph.id}">${esc(ph.name)}</button>`).join('')}</div>
        <div class="label">Kendin yaz</div>
        <textarea id="post-text" rows="3" maxlength="400" placeholder="Takipçilerine ne söylemek istersin? (Yazarsan ton otomatik belirlenir)" style="width:100%;border-radius:12px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);padding:10px;font:inherit;resize:vertical">${esc(p.text || '')}</textarea>
        <div id="post-ana" class="stack" style="gap:6px">${postAnalysis(p.text)}</div>
        <div class="label">Ya da hazır bir ton seç</div><div class="stack" style="gap:8px">${D.postTones.map((tn) => `<button class="opt" data-a="post-tone" data-v="${tn.id}" style="${p.tone === tn.id ? 'box-shadow:inset 0 0 0 2.5px var(--accent)' : ''}"><b>${esc(tn.name)}</b><div class="small muted">"${esc(tn.ex)}"</div></button>`).join('')}</div></div>`,
      dock: `<button class="btn" id="post-send-btn" data-a="post-send" ${(p.text && p.text.trim().length >= 3) || (p.tone && (p.photo || p.tone === 'sessiz')) ? '' : 'disabled'}>${p.text && p.text.trim().length >= 3 ? 'Yazdığımı paylaş' : p.tone === 'sessiz' ? 'Bu hafta paylaşma' : 'Paylaş'}</button>`,
      after: () => { const ta = document.getElementById('post-text'); if (!ta) return; ta.addEventListener('input', () => { U.post.text = ta.value; const box = document.getElementById('post-ana'); if (box) box.innerHTML = postAnalysis(ta.value); const b = document.getElementById('post-send-btn'); if (b) { const ok = ta.value.trim().length >= 3; b.disabled = !(ok || (U.post.tone && (U.post.photo || U.post.tone === 'sessiz'))); b.textContent = ok ? 'Yazdığımı paylaş' : U.post.tone === 'sessiz' ? 'Bu hafta paylaşma' : 'Paylaş'; } }); }
    };
  }

  /* ---------- Özetler ---------- */
  function summaryView(st) {
    const d = st.data;
    const m = d.match;
    const fin = d.fin;
    const ovrD = d.ovr - d.ovrStart;
    const tr = d.train;
    const trainLine = tr && tr.xp != null ? `${D.attrs[tr.attr]} +${tr.xp} XP` : 'Dinlenme haftası';
    const trainBar = tr && tr.xp != null ? `<div class="stack" style="gap:4px"><div class="row small"><span class="grow">${esc(D.attrs[tr.attr])} <b class="num">${tr.val}</b>${tr.ups ? ` <span class="chip good">+${tr.ups} puan yükseldi!</span>` : ''}</span><span class="num muted">${tr.prog}/${tr.need} XP</span></div><div class="meter" style="grid-template-columns:1fr"><div class="track"><div class="fill" style="width:${Math.min(100, tr.prog / tr.need * 100)}%"></div></div></div></div>` : '';
    return {
      main: `<div class="stack fade"><h2 class="display" style="font-size:30px">Hafta ${d.week} bitti</h2>
        ${m ? `<div class="card row"><div class="grow"><div class="label">${m.nat ? 'Milli maç' : 'Maç'}</div><b>${esc(m.opp)}</b><div class="small muted">${m.status === 'ilk11' ? 'İlk 11' : m.status === 'yedek' ? 'Yedek' : 'Oynamadın'}${m.goals ? ` · ${m.goals} gol` : ''}${m.assists ? ` · ${m.assists} asist` : ''}</div></div><div style="text-align:right"><div class="display num" style="font-size:30px">${m.gf}–${m.ga}</div>${m.rating != null ? `<span class="chip ${m.rating >= 7 ? 'good' : m.rating < 6 ? 'bad' : ''}">Not ${m.rating.toFixed(1).replace('.', ',')}</span>` : ''}</div></div>` : ''}
        <div class="card stack" style="gap:8px"><div class="row"><span class="grow muted">Antrenman</span><b>${esc(trainLine)}</b></div>${trainBar}<div class="row"><span class="grow muted">Güç</span><b class="num">${d.ovr}${ovrD ? ` <span style="color:var(--good)">(+${ovrD})</span>` : ''}</b></div></div>
        ${d.deltas.length ? `<div class="card stack" style="gap:8px"><div class="label">Bu haftanın getirileri ve bedelleri</div>${deltaChips(d.deltas)}</div>` : ''}
        <div class="card stack" style="gap:6px"><div class="label">Para</div>
          ${fin.wage ? `<div class="row small"><span class="grow">Maaş</span><b class="num" style="color:var(--good)">${F.money(fin.wage)}</b></div>` : ''}
          ${fin.comm ? `<div class="row small"><span class="grow">Menajer komisyonu</span><b class="num">${F.money(-fin.comm)}</b></div>` : ''}
          <div class="row small"><span class="grow">Yaşam masrafı</span><b class="num">${F.money(-fin.living)}</b></div>
          ${fin.upkeep ? `<div class="row small"><span class="grow">Bakım (araba, ev…)</span><b class="num">${F.money(-fin.upkeep)}</b></div>` : ''}
          ${fin.income ? `<div class="row small"><span class="grow">Yatırım ve diğer gelir</span><b class="num">${F.money(fin.income)}</b></div>` : ''}
          ${fin.other ? `<div class="row small"><span class="grow">Aile desteği</span><b class="num">${F.money(fin.other)}</b></div>` : ''}
          <div class="sep"></div><div class="row"><span class="grow">Toplam bakiye</span><b class="num">${F.money(d.money)}</b></div></div>
        ${d.notes.length ? `<div class="card stack small" style="gap:6px">${d.notes.map((n) => `<p>• ${esc(n)}</p>`).join('')}</div>` : ''}</div>`,
      dock: `<button class="btn" data-a="ev-next">Sonraki hafta</button>`
    };
  }

  function seasonView(st) {
    const d = st.data;
    const avg = d.st.apps ? (d.st.ratingSum / d.st.apps).toFixed(2).replace('.', ',') : '–';
    return {
      main: `<div class="stack fade"><div class="pitchlines"><div class="label" style="color:inherit;opacity:.8">${d.year}–${String(d.year + 1).slice(2)} sezonu bitti</div><div class="display" style="font-size:44px;margin-top:6px">${d.pos}. sıra</div><div class="small">${esc(d.club)} · ${esc(d.league)}</div></div>
        <div class="grid2">
          <div class="flat"><div class="display num" style="font-size:30px">${d.st.apps}</div><span class="small muted">maç</span></div>
          <div class="flat"><div class="display num" style="font-size:30px">${d.st.goals}</div><span class="small muted">gol</span></div>
          <div class="flat"><div class="display num" style="font-size:30px">${d.st.assists}</div><span class="small muted">asist</span></div>
          <div class="flat"><div class="display num" style="font-size:30px">${avg}</div><span class="small muted">ortalama not</span></div>
        </div>
        <div class="card stack small" style="gap:6px"><div class="label">Sezonun öne çıkanları</div><p>Şampiyon: <b>${esc(d.champions)}</b></p>${d.awards.map((a) => `<p>★ ${esc(a)}</p>`).join('')}${d.newCoach ? `<p>Yeni hocan: <b>${esc(d.newCoach)}</b></p>` : ''}<p>Güç: <b class="num">${d.ovr}</b></p></div>
        ${d.goals.length ? `<div class="card stack small" style="gap:6px"><div class="label">Sezon hedeflerin</div>${d.goals.map((g) => `<div class="row"><span class="grow">${esc(g.name)}</span><span class="chip ${g.ok ? 'good' : 'bad'}">${g.ok ? 'Başarıldı' : 'Olmadı'}</span></div>`).join('')}</div>` : ''}</div>`,
      dock: `<button class="btn" data-a="ev-next">Devam</button>`
    };
  }

  function goalsView() {
    const opts = F.goalOptions();
    const sel = U.goalSel;
    return {
      main: `<div class="stack fade"><h2 class="display" style="font-size:30px">${F.seasonLabel()} sezonu</h2><p class="muted">Bu sezon için kendine 3 hedef koy. Tutturursan moral ve şöhret kazanırsın, tutturamazsan biraz moral kaybedersin.</p>
        <div class="stack" style="gap:8px">${opts.map((g) => `<button class="opt" data-a="goal-toggle" data-v="${g.id}" style="${sel.includes(g.id) ? 'box-shadow:inset 0 0 0 2.5px var(--accent)' : ''}" ${!sel.includes(g.id) && sel.length >= 3 ? 'disabled' : ''}><div class="row"><b class="grow">${esc(g.name)}</b>${sel.includes(g.id) ? '<span class="chip on">Hedef</span>' : ''}</div><div class="meta">${fxPreview(g.reward)}</div></button>`).join('')}</div></div>`,
      dock: `<button class="btn" data-a="goals-ok" ${sel.length === 3 ? '' : 'disabled'}>Hedefleri kaydet (${sel.length}/3)</button>`
    };
  }

  /* ---------- Teklifler ve pazarlık ---------- */
  function innerVoice() {
    const S = F.S;
    const b = F.npc('baba'), a = F.npc('anne');
    if (b && b.rel > 30) return [`"Paranın değil, oynayacağın yerin peşinden git."`, 'Babanın sesi kulaklarında'];
    if (a && a.rel > 40) return [`"Neresi olursa olsun, mutlu ol yeter oğlum."`, 'Annen'];
    const eh = F.tplVal('eskihoca');
    if (eh) return [`"Yedek kulübesinde gelişen futbolcu görmedim."`, 'Eski hocan ' + eh];
    return [`"Bu karar senin. Kimse senin yerine oynamayacak."`, 'İç sesin'];
  }
  function offersView() {
    const S = F.S, P = S.P;
    const t = F.myTeam();
    const expired = P.contract.years <= 0;
    if (U.nego) return negoView();
    const iv = innerVoice();
    return {
      main: `<div class="stack fade"><h2 class="display" style="font-size:30px">Transfer masası</h2>
        <p class="small muted">${S.queue[0] && S.queue[0].window === 'kovuldu' ? 'Kulübün seninle yollarını ayırdı. Sicilin lekeli ama bazı kulüpler sana şans vermek istiyor. Cezan yeni kulübünde de sürecek. Bir teklifi kabul etmen gerekiyor.' : expired ? 'Sözleşmen bitti. Bir teklifi kabul etmen gerekiyor.' : `Şu anki sözleşmen: ${esc(t.name)}, ${P.contract.years} yıl kaldı, haftalık ${F.money(P.contract.wage)}.`}</p>
        ${S.offers.length ? S.offers.map((o, i) => {
          const tm = F.team(o.team);
          return `<div class="card stack" style="gap:10px"><div class="row">${badge(tm, 34)}<div class="grow"><b>${esc(tm.name)}${o.renew ? ' <span class="chip acc">Mevcut kulüp</span>' : ''}</b><div class="tiny muted">${esc(o.league)} · güç ${tm.str}</div></div></div>
            <div class="row wrap small"><span class="chip">${esc(D.roleNames[o.role])}</span><span class="chip good">${F.money(Math.round(o.wage * (o.agreed ? o.agreed.wageMul : 1)))}/hafta</span><span class="chip">${o.agreed ? o.agreed.years : o.years} yıl</span>${o.agreed ? '<span class="chip on">Anlaşıldı</span>' : ''}</div>
            <div class="row"><button class="btn alt sm grow" data-a="off-nego" data-v="${i}" ${o.agreed ? 'disabled' : ''}>Pazarlık et</button><button class="btn sm grow" data-a="off-accept" data-v="${i}">İmzala</button></div></div>`;
        }).join('') : `<div class="card small muted">Şu an masada teklif yok.</div>`}
        <div class="flat small"><i>${esc(iv[0])}</i><div class="tiny muted" style="margin-top:4px">— ${esc(iv[1])}</div></div></div>`,
      dock: expired ? (S.offers.length ? '' : `<button class="btn" data-a="off-free">Kulübünle düşük maaşla 1 yıl uzat</button>`) : `<button class="btn alt" data-a="off-stay">Kalıyorum</button>`
    };
  }
  function negoView() {
    const S = F.S;
    const n = U.nego;
    const o = S.offers[n.i];
    if (!o) { U.nego = null; return offersView(); }
    const tm = F.team(o.team);
    const wage = Math.round(o.wage * n.wageMul);
    return {
      main: `<div class="stack fade"><div class="topbar"><button class="back" data-a="nego-close" aria-label="Geri">${ICON.back}</button><div class="row grow">${badge(tm, 30)}<h2 class="display" style="font-size:24px">${esc(tm.name)}</h2></div></div>
        <div class="card stack">
          ${(() => { F.negLimit(o); const tn = o.tension; const [lbl, col] = tn < 35 ? ['Sakin', 'var(--good)'] : tn < 60 ? ['Gergin', 'var(--warn)'] : tn < 80 ? ['Çok gergin', 'var(--bad)'] : ['Masadan kalkmak üzere', 'var(--bad)']; return `<div class="stack" style="gap:4px"><div class="row small"><span class="grow label">Masadaki gerginlik</span><b style="color:${col}">${lbl}</b></div><div class="bar-meter" style="height:8px;border-radius:4px;background:var(--surface-2);overflow:hidden"><i style="display:block;height:100%;width:${tn}%;background:${col};transition:width .3s"></i></div></div>`; })()}
          ${o.counter ? `<p class="small">Kulübün son teklifi: <b>${F.money(Math.round(o.wage * o.counter.wageMul))}/hafta</b> · ${o.counter.years} yıl · imza ${F.money(Math.round(o.wage * o.counter.wageMul * 12 * o.counter.signing))}${o.counter.guarantee ? ' · forma garantisi' : ''}${F.bonusCost(o.counter) > 0 ? ' · primli' : ''}. Bunu gönderirsen kabul ederler.</p>` : ''}
          <label class="stack" style="gap:4px" for="n-wage"><span class="row small"><span class="grow">Haftalık maaş</span><b class="num" id="n-wage-v">${F.money(wage)}</b></span><input type="range" id="n-wage" min="0.6" max="2" step="0.05" value="${n.wageMul}"></label>
          <label class="stack" style="gap:4px" for="n-years"><span class="row small"><span class="grow">Süre</span><b class="num" id="n-years-v">${n.years} yıl</b></span><input type="range" id="n-years" min="1" max="5" step="1" value="${n.years}"></label>
          <label class="stack" style="gap:4px" for="n-sign"><span class="row small"><span class="grow">İmza parası</span><b class="num" id="n-sign-v">${F.money(Math.round(wage * 12 * n.signing))}</b></span><input type="range" id="n-sign" min="0" max="1" step="0.05" value="${n.signing}"></label>
          <div class="label" style="margin-top:4px">Primler (sözleşme maddeleri)</div>
          ${[['appB', 'Maç başı prim', 'n-pb-app'], ['goalB', 'Gol başı prim', 'n-pb-goal'], ['assistB', 'Asist başı prim', 'n-pb-ast']].map(([k, l, id]) => `<label class="stack" style="gap:4px" for="${id}"><span class="row small"><span class="grow">${l}</span><b class="num" id="${id}-v">${F.money(Math.round(wage * (n[k] || 0)))}</b></span><input type="range" id="${id}" min="0" max="0.5" step="0.05" value="${n[k] || 0}"></label>`).join('')}
          <label class="row small" for="n-g"><input type="checkbox" id="n-g" ${n.guarantee ? 'checked' : ''}> <span class="grow">Forma garantisi iste</span><span class="chip">${esc(D.roleNames[o.role])}</span></label>
          ${(() => { const L = F.negLimit(o); if (L.guarantee) return '<p class="tiny muted">Kulüp bu rol için forma garantisi vermeye açık.</p>'; const gw = F.negGuaranteeWage(o); return gw != null ? `<p class="tiny muted">Kulüp garantiyi kolay vermez. Haftalık maaşı <b>${F.money(Math.round(o.wage * gw))}</b> ya da altına çekersen ve imza parasından feragat edersen garantiyi kabul ederler.</p>` : '<p class="tiny muted">Şu an hiçbir maaşla forma garantisi vermiyorlar. Önce gücünü artırman lazım.</p>'; })()}
          <p class="tiny muted">Kulübün bir tavanı var; aştıkça gerginlik artar. Masa gerildikçe kulüp yumuşar: tavanını yükseltir, imza parası ve primlerde esner, garantiye açılır. Ama gerginlik dolarsa masadan kalkar. Konuşma yeteneğin ve menajerin gerginliği yumuşatır.</p>
        </div>
        ${n.msg ? `<div class="result small">${esc(n.msg)}</div>` : ''}</div>`,
      dock: `<div class="row" style="width:100%">${o.agreed ? `<button class="btn" data-a="off-accept" data-v="${n.i}">İmzala</button>` : `<button class="btn" data-a="nego-send">Teklifi gönder</button>`}</div>`,
      after: () => {
        const upd = () => {
          n.wageMul = +document.getElementById('n-wage').value;
          n.years = +document.getElementById('n-years').value;
          n.signing = +document.getElementById('n-sign').value;
          n.guarantee = document.getElementById('n-g').checked;
          n.appB = +document.getElementById('n-pb-app').value; n.goalB = +document.getElementById('n-pb-goal').value; n.assistB = +document.getElementById('n-pb-ast').value;
          const w = Math.round(o.wage * n.wageMul);
          [['n-pb-app', n.appB], ['n-pb-goal', n.goalB], ['n-pb-ast', n.assistB]].forEach(([id, v]) => { const e = document.getElementById(id + '-v'); if (e) e.textContent = F.money(Math.round(w * v)); });
          document.getElementById('n-wage-v').textContent = F.money(w);
          document.getElementById('n-years-v').textContent = n.years + ' yıl';
          document.getElementById('n-sign-v').textContent = F.money(Math.round(w * 12 * n.signing));
        };
        ['n-wage', 'n-years', 'n-sign', 'n-g', 'n-pb-app', 'n-pb-goal', 'n-pb-ast'].forEach((id) => { const e = document.getElementById(id); if (e) e.addEventListener('input', upd); });
      }
    };
  }

  /* ---------- Emeklilik ve nesil ---------- */
  function retireView(st) {
    const P = F.S.P;
    return {
      main: `<div class="stack fade"><h2 class="display" style="font-size:32px">${P.age} yaşındasın</h2><div class="card stack"><p class="ev-text">${st.forced ? 'Vücudun artık "yeter" diyor. Doktorlar kariyerine nokta koymanı söylüyor.' : 'Sabahları dizlerin eskisi gibi değil. Kariyerin boyunca ' + P.career.apps + ' maçta ' + P.career.goals + ' gol attın. Bir sezon daha mı, yoksa veda mı?'}</p></div>
        <div class="flat small">Emekli olursan Aile Müzesi'ne geçersin. Çocuğunla ya da himayendeki bir gençle hikâye devam edebilir.</div></div>`,
      dock: `<div class="stack" style="width:100%;gap:8px">${st.forced ? '' : `<button class="btn" data-a="retire" data-v="0">Bir sezon daha</button>`}<button class="btn ${st.forced ? '' : 'alt'}" data-a="retire" data-v="1">Futbolu bırak</button></div>`
    };
  }
  function heirView() {
    const S = F.S;
    const r = S.retired;
    const heirs = F.heirOptions();
    return {
      main: `<div class="stack fade"><div class="pitchlines"><div class="label" style="color:inherit;opacity:.8">Veda</div><div class="display" style="font-size:36px;margin-top:6px">${esc(r.name)}</div><div class="small">${r.apps} maç · ${r.goals} gol · ${r.titles} kupa · ${r.caps} milli maç · zirve güç ${r.peak}</div></div>
        <p class="muted">Hikâye burada bitmek zorunda değil. Soyadın, itibarın ve mirasın bir sonraki nesle geçer. Aradaki yıllarda yardımcı antrenörlük dönemi ileride eklenecek.</p>
        <div class="label">Yeni neslin mevkisi</div>${positionMap(fmState('heir'), 'heir')}
        <div class="stack" style="gap:8px">${heirs.map((h) => `<button class="opt" data-a="heir" data-v="${h.i}" ${h.available ? '' : 'disabled'}><b>${esc(h.name)}</b><div class="small muted">${h.kid ? `${h.male ? 'Oğlun' : 'Kızın'} · ${h.born} doğumlu · seninle bağı ${Math.round(h.rel)}` : 'Ailenden ya da futbol okulundan yetenekli bir genç'}</div>${h.kid && !h.available ? '<div class="meta"><span class="chip">Kadın futbolu yakında</span></div>' : ''}</button>`).join('')}</div></div>`,
      dock: `<button class="btn ghost" data-a="end-game">Hikâyeyi burada bitir</button>`
    };
  }
  function gameoverView() {
    const S = F.S;
    return {
      main: `<div class="stack fade"><h2 class="display" style="font-size:34px">Aile Müzesi</h2><div class="card"><div class="label">Hanedanlık skoru</div><div class="display num" style="font-size:54px">${F.num(F.dynastyScore())}</div></div>${dynastyList()}</div>`,
      dock: `<button class="btn" data-a="new-career-now">Yeni kariyer</button>`
    };
  }
  function achList() {
    const S = F.S;
    const ach = S.ach || {};
    const got = D.achievements.filter((a) => ach[a.id]).length;
    return `<div class="card stack" style="gap:10px"><div class="row"><div class="label grow">Başarımlar</div><span class="chip acc num">${got}/${D.achievements.length}</span></div>
      <div class="achs">${D.achievements.map((a) => { const g = ach[a.id]; return `<div class="ach ${g ? 'got' : ''}"><div class="medal">${g ? '★' : '·'}</div><div class="grow"><b class="small">${esc(a.name)}</b><div class="tiny muted">${esc(a.desc)}${g ? ` · ${g.year}, ${esc(g.name)}` : ''}</div></div></div>`; }).join('')}</div></div>`;
  }
  function dynastyList() {
    const S = F.S;
    if (!S.dynasty.length) return `<div class="card small muted">Henüz emekli olan bir nesil yok. Kariyerin bittiğinde burada yerini alacaksın.</div>`;
    return S.dynasty.map((r) => `<div class="card stack" style="gap:6px"><div class="row"><span class="chip acc">${r.gen}. nesil</span><b class="grow">${esc(r.name)}</b><span class="tiny muted num">${r.to - (r.age - 17)}–${r.to}</span></div>
      <div class="small">${esc(r.origin)} · ${esc(D.positions.find((p) => p.id === r.pos).name)} · zirve güç ${r.peak}</div>
      <div class="row wrap"><span class="chip">${r.apps} maç</span><span class="chip">${r.goals} gol</span><span class="chip">${r.titles} kupa</span><span class="chip">${r.caps} milli</span>${r.legend ? '<span class="chip good">Efsane</span>' : ''}${r.sike ? '<span class="chip bad">Şike lekesi</span>' : ''}</div>
      <div class="tiny muted">${esc(r.clubs.join(' → '))}</div>${r.traits.length ? `<div class="tiny">${esc(r.traits.join(', '))}</div>` : ''}</div>`).join('');
  }

  /* =========================================================
     UYGULAMALAR
     ========================================================= */
  function appShell(title, body, dock) {
    return { main: `<div class="stack fade"><div class="topbar"><button class="back" data-a="back" aria-label="Geri">${ICON.back}</button><h2 class="display" style="font-size:28px">${esc(title)}</h2></div>${body}</div>`, dock };
  }
  function appView(id) {
    switch (id) {
      case 'plan': return planView();
      case 'tribun': return tribunView();
      case 'ozel': return ozelView();
      case 'kadro': return kadroView();
      case 'mesaj': return mesajView();
      case 'kisiler': return kisilerView();
      case 'menajer': return menajerView();
      case 'banka': return bankaView();
      case 'magaza': return magazaView();
      case 'profil': return profilView();
      case 'lig': return ligView();
      case 'album': return albumView();
      case 'muze': return appShell('Aile Müzesi', `<div class="card"><div class="label">Hanedanlık skoru</div><div class="display num" style="font-size:44px">${F.num(F.dynastyScore())}</div><div class="small muted">${F.S.gen}. nesil oynanıyor</div></div>${dynastyList()}`);
      case 'ayarlar': return ayarlarView();
      case 'dev': return devOn() ? devView() : (U.app = null, homeView());
      default: U.app = null; return homeView();
    }
  }

  /* ---------- Kadro: FC tarzı ilk 11, forma rakibi, yedekler ve ilk 11 şansı ---------- */
  function kadroView() {
    const S = F.S, P = S.P;
    const sq = F.squad();
    const t = F.myTeam();
    const fx = F.myFixture && S.league && S.league.round < F.seasonRounds() ? F.myFixture() : null;
    const myStr = t.str;
    const ch = F.startChance({ nat: false, myStr });
    const pct = Math.round(ch.p * 100);
    const me = P.name + ' ' + P.surname;
    const ps = S.preStatus && S.preStatus.t === S.t ? S.preStatus.s : null;
    const iStart = ps ? ps === 'ilk11' : ch.p >= 0.5;
    const cr = F.curRole();
    const ovrMe = F.ovrAs(cr);
    const sur = (n) => n.split(' ').slice(-1)[0];
    const col = (v) => (v >= 80 ? 'var(--good)' : v >= 65 ? 'var(--warn)' : 'var(--bad)');
    const dots = sq.xi.map((x) => {
      const isMe = x.i === sq.mySpot;
      const name = isMe ? (iStart ? me : sq.rival.n) : x.n;
      const ovr = isMe ? (iStart ? ovrMe : sq.rival.ovr) : x.ovr;
      const cx = 14 + x.x * 2.72, cy = 14 + x.y * 3.42;
      const hl = isMe && iStart;
      return `<g><circle cx="${cx}" cy="${cy}" r="${hl ? 16 : 13}" fill="${hl ? 'var(--accent)' : isMe ? '#ffd76a' : '#fff'}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" font-weight="800" fill="${hl ? '#fff' : '#1d3b26'}" font-family="Figtree, sans-serif">${ovr}</text>
        <text x="${cx}" y="${cy + 26}" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" stroke="rgba(0,0,0,.55)" stroke-width="2.5" paint-order="stroke" font-family="Figtree, sans-serif">${esc(sur(name))}</text></g>`;
    }).join('');
    const pitch = `<svg class="fmbig" viewBox="0 0 300 370" role="img" aria-label="İlk 11">
      <rect width="300" height="370" rx="12" fill="#2e8b3c"/>${Array.from({ length: 8 }, (_, i) => `<rect y="${8 + i * 44}" width="300" height="22" fill="#349a43" opacity=".55"/>`).join('')}
      <g fill="none" stroke="#fff" stroke-width="1.6" opacity=".6"><rect x="8" y="8" width="284" height="354" rx="4"/><path d="M8 185H292"/><circle cx="150" cy="185" r="34"/><rect x="80" y="8" width="140" height="52"/><rect x="80" y="310" width="140" height="52"/></g>${dots}</svg>`;
    const reasons = ch.parts.slice().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).map(([l, v]) => `<div class="row small"><span class="grow">${esc(l)}</span><b class="num" style="color:${v >= 0 ? 'var(--good)' : 'var(--bad)'}">${v >= 0 ? '+' : '−'}%${Math.round(Math.abs(v) * 100)}</b></div>`).join('');
    const r = sq.rival;
    const bench = sq.bench.concat(iStart ? [{ n: r.n, role: r.role, ovr: r.ovr, form: r.form }] : [{ n: me, role: cr, ovr: ovrMe, form: P.life.form, me: true }])
      .sort((a, b) => b.ovr - a.ovr).map((b) => `<div class="li small"><span class="chip">${esc((D.roles[b.role] || {}).short || b.role)}</span><span class="grow">${b.me ? '<b>' + esc(b.n) + '</b> (sen)' : esc(b.n)}</span><b class="num" style="color:${col(b.ovr)}">${b.ovr}</b></div>`).join('');
    return appShell('Kadro', `<div class="row small"><span class="grow muted">${esc(t.name)} · <b>${esc(sq.fm)}</b></span>${fx ? `<span class="muted">Sıradaki: ${esc(F.team(fx.opp).name)}</span>` : ''}</div>
      ${pitch}
      <p class="tiny muted" style="text-align:center">${iStart ? 'Yeşil daire sensin.' : 'Sarı dairedeki oyuncu şu an senin yerinde oynuyor.'} Dairelerde güç yazıyor.</p>
      <div class="card stack" style="gap:8px"><div class="row"><div class="grow"><div class="label">İlk 11 şansın</div><span class="small muted">${esc(D.roles[cr].name)} · güç ${ovrMe}${ps ? ' · bu hafta: ' + ({ ilk11: 'ilk 11', yedek: 'yedek', kadrodisi: 'kadro dışı' }[ps] || ps) : ''}</span></div><div class="display num" style="font-size:40px;color:${pct >= 60 ? 'var(--good)' : pct >= 35 ? 'var(--warn)' : 'var(--bad)'}">%${pct}</div></div>
        <div style="height:8px;border-radius:4px;background:var(--surface-2);overflow:hidden"><i style="display:block;height:100%;width:${pct}%;background:var(--accent)"></i></div>
        <div class="stack" style="gap:4px">${reasons}</div></div>
      <div class="card stack" style="gap:6px"><div class="label">Forma rakibin</div><div class="row"><b class="grow">${esc(r.n)}</b><span class="small muted">${esc(D.roles[r.role].name)}</span></div>
        <div class="row small"><span class="grow">Güç</span><b class="num">${r.ovr}</b> <span class="muted">· sen ${ovrMe}</span></div><div class="row small"><span class="grow">Form</span><b class="num">${r.form > 0 ? '+' : ''}${r.form}</b> <span class="muted">· sen ${P.life.form > 0 ? '+' : ''}${Math.round(P.life.form)}</span></div>
        <p class="tiny muted">Hoca ilk 11'i güce, forma, mevki uyumuna ve sana olan güvenine göre seçer. Antrenmanla gücünü, iyi maçlarla formunu artırırsan forma senin olur.</p></div>
      <div class="label">Yedek kulübesi</div><div class="card list">${bench}</div>`);
  }

  /* ---------- Özel Hayat: rutin (her hafta işler) ve aktif kurslar ---------- */
  function ozelView() {
    const S = F.S, P = S.P;
    P.routine = Object.assign({}, D.routineDefault, P.routine);
    const ti = F.myTier();
    const rows = Object.keys(D.routines).map((k) => {
      const r = D.routines[k];
      const op = r.opts[P.routine[k]];
      return `<div class="card stack" style="gap:8px"><b>${esc(r.name)}</b><div class="seg">${Object.keys(r.opts).map((o) => `<button class="${P.routine[k] === o ? 'on' : ''}" data-a="routine" data-v="${k}" data-w="${o}">${esc(r.opts[o].name)}</button>`).join('')}</div>
        <p class="small muted">${esc(op.desc || '')}</p><div class="meta row wrap">${Object.keys(op.fx).length ? fxPreview(op.fx) : '<span class="chip">Etkisi yok</span>'}${op.cost ? `<span class="chip bad">${F.money(-op.cost)}/hafta</span>` : ''}${op.injMul ? `<span class="chip ${op.injMul < 1 ? 'good' : 'bad'}">Sakatlık riski ${op.injMul < 1 ? '−' : '+'}%${Math.round(Math.abs(1 - op.injMul) * 100)}</span>` : ''}</div></div>`;
    }).join('');
    const subs = (P.subs || []).map((x) => { const it = F.item(x.id); return it ? `<div class="li"><div class="grow"><b class="small">${esc(it.name)}</b><div class="tiny muted">${x.left} hafta kaldı</div></div><div class="meta row wrap">${fxPreview(it.weekly || {})}</div></div>` : ''; }).join('');
    return appShell('Özel Hayat', `<p class="small muted">Buradaki seçimler her hafta otomatik işler. Etkileri hafta özetinde görürsün.</p>
      <div class="label">Rutin</div>${rows}
      <div class="label">Aktif kurslar ve üyelikler</div><div class="card list">${subs || '<p class="small muted">Aktif bir kursun yok. Mağaza > Kişisel gelişim bölümünden aylık kurslara yazılabilirsin.</p>'}</div>
      ${S.campaign && S.campaign.until >= S.t ? '<div class="flat small"><b>Kampanya:</b> Kişisel gelişim kurslarında 3 ay 2 ay fiyatına. Bu hafta ve gelecek hafta geçerli.</div>' : ''}`);
  }

  function tribunView() {
    const S = F.S;
    const tab = U.tab || 'akis';
    if (tab === 'akis') S.unread.feed = 0;
    if (tab === 'oda') S.unread.chat = 0;
    const tabs = `<div class="tabs">${[['akis', 'Akış'], ['paylas', 'Paylaş']].map(([k, n]) => `<button class="pick ${tab === k ? 'on' : ''}" data-a="tab" data-v="${k}">${n}</button>`).join('')}</div>`;
    let body = '';
    const imgBg = { mac: 'var(--accent)', antrenman: '#4b6b5a', aile: '#a0522d', partner: '#b03a6a', araba: '#2f3e66', ev: '#6b5a2f', memleket: '#3a6b8a' };
    if (tab === 'akis') {
      body = `<div class="stack" style="gap:10px"><div class="row small"><span class="grow muted">Takipçi</span><b class="num">${F.num(S.P.followers)}</b></div>${S.feed.length ? S.feed.map((p) => `<div class="post ${p.me ? 'mine' : ''}"><div class="row">${av(p.who)}<div class="grow"><b class="small">${esc(p.who)}</b><div class="tiny muted">${p.kind === 'news' ? 'Haber' : p.kind === 'rumor' ? 'Kulis' : p.kind === 'club' ? 'Resmi hesap' : p.kind === 'viral' ? 'Viral' : p.kind === 'hate' ? 'Eleştiri' : p.me ? 'Sen' : 'Taraftar'}</div></div></div>
        ${p.img ? `<div class="img" style="background:${imgBg[p.img] || 'var(--accent)'}">${esc((F.postPhotos().find((x) => x.id === p.img) || { name: p.img }).name)}</div>` : ''}<p>${esc(p.t)}</p><div class="row tiny muted">${p.me ? `<span style="width:14px;height:14px;display:inline-block">${ICON.heart}</span>` : `<button class="likebtn ${p.liked ? 'on' : ''}" data-a="like" data-v="${p.id}" aria-label="Beğen" ${p.liked ? 'disabled' : ''}>${ICON.heart}</button>`}<span class="num">${F.num(p.likes)}</span>${postAboutChip(p)}<span class="grow"></span>${!p.me && !p.commented && U.cmt !== p.id ? `<button class="pick" style="padding:4px 10px" data-a="cmt-open" data-v="${p.id}">Yorum yap</button>` : ''}</div>
        ${p.comments ? p.comments.map((c) => `<div class="small" style="padding-left:8px;border-left:2px solid ${c.me ? 'var(--accent)' : 'var(--line)'}"><b>${esc(c.who)}</b> ${esc(c.t)}</div>`).join('') : ''}${U.cmt === p.id ? `<div class="stack" style="gap:6px"><textarea id="cmt-text" rows="2" maxlength="280" placeholder="Yorumunu yaz. Savunmak, teşekkür etmek, espri yapmak ya da katılmak farklı tepki getirir." style="width:100%;border-radius:12px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);padding:8px;font:inherit;resize:vertical">${esc(U.cmtText || '')}</textarea><div class="row" style="gap:6px"><button class="btn sm" data-a="cmt-send" style="width:auto">Gönder</button><button class="pick" data-a="cmt-cancel">Vazgeç</button></div></div>` : ''}</div>`).join('') : '<div class="card small muted">Akış boş. Maça çık, birileri bir şey yazar.</div>'}</div>`;
    } else if (tab === 'oda') {
      body = `<div class="card"><div class="label" style="margin-bottom:8px">${esc(F.myTeam().name)} · Soyunma Odası</div><div class="chat">${S.chat.length ? S.chat.slice(-30).map((c) => `<div class="bub them"><b class="tiny" style="color:${hashColor(c.who)}">${esc(c.who)}</b><br>${esc(c.t)}</div>`).join('') : '<p class="small muted">Grup sessiz.</p>'}</div></div>
        <div class="row wrap">${['Hayırlı haftalar beyler 💪', 'Akşam halı saha var mı?', 'Hoca bugün sert, dikkat 😅'].map((t, i) => `<button class="pick" data-a="chat-say" data-v="${i}">${esc(t)}</button>`).join('')}</div><p class="tiny muted">Gruba yazmak takım ilişkini biraz güçlendirir (haftada bir).</p>`;
    } else {
      const posted = S.postedWeek === S.t;
      body = posted ? `<div class="card small muted">Bu hafta zaten paylaşım yaptın. Takipçilerini yorma.</div>` : `<div class="card small">Maç sonrası dışında da haftada bir kez paylaşım yapabilirsin.</div><button class="btn" data-a="post-open">Paylaşım hazırla</button>`;
    }
    return appShell('Sosyal Medya', tabs + body);
  }

  function mesajView() {
    const S = F.S;
    S.unread.dm = 0;
    S.dms.forEach((m) => (m.read = true));
    const reqs = S.requests.map((rq, i) => {
      const def = D.requests.find((r) => r.id === rq.id);
      const who = D.relLabels[def.who] ? whoInfo(def.who).name : rq.who || F.tpl(def.who);
      return `<div class="card stack" style="gap:8px"><div class="row">${av(who)}<div class="grow"><b>${esc(who)}</b><div class="tiny muted">İstek · ${Math.max(0, rq.until - S.t)} hafta içinde cevap bekliyor</div></div></div><p>${esc(F.tpl(def.t).replace(/{sehir}/g, F.myTeam().province))}</p>
        <div class="meta row wrap">${rq.cost ? `<span class="chip bad">${F.money(-rq.cost)}</span>` : ''}${fxPreview(def.fx)}</div>
        <div class="row"><button class="btn alt sm grow" data-a="req" data-v="${i}" data-w="0">Reddet</button><button class="btn sm grow" data-a="req" data-v="${i}" data-w="1">Kabul et</button></div></div>`;
    }).join('');
    // Kişi kişi sohbetler: düz mesajlar ve cevap bekleyen sohbetler aynı kişinin altında toplanır
    const threads = {};
    S.dms.forEach((m) => { (threads[m.from] = threads[m.from] || { name: m.from, items: [] }).items.push({ kind: 'dm', at: m.week || 0, m }); });
    (S.convos || []).forEach((c, i) => { (threads[c.who] = threads[c.who] || { name: c.who, items: [] }).items.push({ kind: 'cv', at: c.at, c, i }); });
    const list = Object.values(threads).map((th) => { th.last = Math.max(...th.items.map((x) => x.at)); th.pending = th.items.filter((x) => x.kind === 'cv' && !x.c.ans).length; return th; })
      .sort((a, b) => b.pending - a.pending || b.last - a.last);
    const cvCard = (c, i) => {
      const def = D.convos.find((x) => x.id === c.id);
      if (!def) return '';
      const left = c.until != null ? c.until - S.t : null;
      return `<div class="stack" style="gap:6px"><div class="chat">${c.lines.map((l) => `<div class="bub them">${esc(l)}</div>`).join('')}${c.ans ? `<div class="bub me">${esc(c.ans.t)}</div>${c.ans.r ? `<div class="bub sys">${esc(c.ans.r)}</div>` : ''}${deltaChips(c.ans.deltas)}` : ''}</div>
        ${c.ans ? '' : `<span class="chip ${left != null && left <= 0 ? 'bad' : 'warn'}" style="align-self:flex-start">${left == null ? 'Cevap bekliyor' : left <= 0 ? 'Bu hafta cevap ver' : left + ' hafta içinde cevap ver'}</span><div class="stack" style="gap:6px">${def.o.map((o, j) => `<button class="opt" data-a="convo" data-v="${i}" data-w="${j}">${esc(F.tpl(o.t))}</button>`).join('')}</div>`}</div>`;
    };
    if (U.thread && threads[U.thread]) {
      const th = threads[U.thread];
      const items = th.items.slice().sort((a, b) => a.at - b.at);
      const body = items.map((x) => `<div class="tiny muted" style="text-align:center;margin-top:6px">${S.t - x.at === 0 ? 'Bu hafta' : S.t - x.at + ' hafta önce'}</div>${x.kind === 'dm' ? `<div class="chat"><div class="bub them">${esc(x.m.t)}</div></div>` : cvCard(x.c, x.i)}`).join('');
      const tv = appShell('Mesajlar', `<div class="row" style="gap:10px"><button class="btn ghost sm" data-a="thread-close">← Tüm sohbetler</button></div><div class="card stack" style="gap:8px"><div class="row" style="gap:10px">${av(th.name)}<b class="grow">${esc(th.name)}</b></div>${body}</div>`);
      // sohbete girince en son mesaja kaydır (bir kez)
      tv.after = () => { if (U.threadScrolled !== U.thread) { const mm = document.getElementById('main'); if (mm) mm.scrollTop = mm.scrollHeight; U.threadScrolled = U.thread; } };
      return tv;
    }
    const dms = list.map((th) => { const lastItem = th.items.slice().sort((a, b) => b.at - a.at)[0]; const prev = lastItem.kind === 'dm' ? lastItem.m.t : lastItem.c.lines[lastItem.c.lines.length - 1];
      return `<button class="li thread" data-a="thread" data-v="${esc(th.name)}">${av(th.name)}<div class="grow" style="text-align:left;min-width:0"><div class="row"><b class="small grow">${esc(th.name)}</b><span class="tiny muted">${S.t - th.last === 0 ? 'bu hafta' : S.t - th.last + ' hf'}</span></div><p class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(prev)}</p></div>${th.pending ? `<span class="badge" style="position:static">${th.pending}</span>` : ''}</button>`; }).join('');
    return appShell('Mesajlar', `${reqs ? `<div class="label">Bekleyen istekler</div>${reqs}` : ''}<div class="label">Sohbetler</div><div class="card list">${dms || '<p class="small muted">Mesaj yok.</p>'}</div>`);
  }

  function kisilerView() {
    const S = F.S;
    const person = (role) => {
      const n = F.npc(role);
      if (!n) return '';
      const w = whoInfo(role);
      return `<div class="li">${av(n.name, false, npcOpts(n, role))}<div class="grow"><div class="row"><b class="small grow">${esc(n.name)}</b><span class="num small" style="color:${n.rel >= 0 ? 'var(--good)' : 'var(--bad)'}">${n.rel > 0 ? '+' : ''}${Math.round(n.rel)}</span></div><div class="tiny muted" style="margin-bottom:5px">${esc(w.label)}${role === 'hoca' && D.coachTypes[n.type] ? ' — ' + esc(D.coachTypes[n.type].desc) : ''}</div>${relBar(n.rel)}</div></div>`;
    };
    const agg = ['takim', 'medya', 'taraftar', 'aile', 'memleket'].map((k) => `<div class="stack" style="gap:4px"><div class="row small"><span class="grow">${esc(D.relLabels[k])}</span><b class="num">${Math.round(S.rel[k])}</b></div>${relBar(S.rel[k])}</div>`).join('');
    const partner = S.partner && S.partner.stage > 0 ? `<div class="label">Partner · ${['', 'Flört', 'Sevgili', 'Nişanlı', 'Evli'][S.partner.stage]}</div><div class="card list">${person('partner')}</div>` : `<div class="label">Partner</div><div class="card small muted">Şu an kimse yok. Arkadaş ortamları, gece hayatı ve sosyal medya yeni insanlarla tanıştırır.</div>`;
    const kids = S.kids.length ? `<div class="label">Çocuklar</div><div class="card list">${S.kids.map((k) => `<div class="li">${av(k.name)}<div class="grow"><b class="small">${esc(k.name)}</b><div class="tiny muted">${k.male ? 'Oğlun' : 'Kızın'} · ${S.year - k.born} yaş</div>${relBar(k.rel)}</div></div>`).join('')}</div>` : '';
    return appShell('Kişiler', `<div class="card stack" style="gap:10px"><div class="label">Genel ilişkiler</div>${agg}</div>
      <div class="label">Kulüp</div><div class="card list">${['hoca', 'baskan', 'kaptan', 'kanka', 'rakip'].map(person).join('')}</div>
      <div class="label">Aile</div><div class="card list">${['anne', 'baba', 'kardes'].map(person).join('') || '<p class="small muted">—</p>'}</div>
      <div class="label">Yakın arkadaş</div><div class="card list">${person('dost') || '<p class="small muted">—</p>'}</div><p class="tiny muted">Çocukluk arkadaşın kulüp değiştirsen de hep yanında. Bazen başını belaya sokar, bazen seni kurtarır. Boş zamanında onunla buluşmayı unutma.</p>
      ${partner}${kids}
      <div class="label">Medya</div><div class="card list">${['gazeteci', 'magazinci'].map(person).join('')}</div>`);
  }

  function menajerView() {
    const S = F.S;
    const a = S.agent;
    if (!a) return appShell('Menajer', `<div class="card stack"><p>Şu an menajerin yok. Sözleşme pazarlıklarını kendin yapıyorsun.</p><p class="small muted">İyi oynadıkça menajerler seninle iletişime geçecek. Bazen de kendileri gelir.</p></div>`);
    const n = F.npc('menajer');
    const confirm = U.confirm === 'fire';
    return appShell('Menajer', `<div class="card stack"><div class="row">${av(a.name, false, n ? npcOpts(n, 'menajer') : null)}<div class="grow"><b>${esc(a.name)}</b><div class="tiny muted">${esc(D.agentTiers[a.tier].name)}${a.label ? ' · ' + esc(a.label) : ''}</div></div><span class="chip">%${a.komisyon} komisyon</span></div>
        ${meter('Bağlantı', a.baglanti)}${meter('Pazarlık', a.pazarlik)}<div class="stack" style="gap:4px"><div class="row small"><span class="grow muted">Aranız</span><b class="num">${Math.round(n ? n.rel : 0)}</b></div>${relBar(n ? n.rel : 0)}</div></div>
      <div class="label">Görevler</div><div class="card list">${S.tasks.length ? S.tasks.map((t) => `<div class="li"><div class="grow small">${esc(t.desc)}<div class="tiny muted">${t.done ? (t.ok ? 'Tamamlandı' : 'Süre doldu') : `${Math.max(0, t.until - S.t)} hafta kaldı`}</div></div><span class="chip ${t.done ? (t.ok ? 'good' : 'bad') : 'acc'} num">${t.done ? (t.ok ? '✓' : '✗') : `${t.prog}/${t.need}`}</span></div>`).join('') : '<p class="small muted">Şu an görev yok. Her birkaç haftada bir yenisi gelir.</p>'}</div>
      <div class="label">Tavsiyeler</div><div class="card list">${S.tips.length ? S.tips.slice(0, 5).map((t) => `<div class="li small">${esc(t.t)}</div>`).join('') : '<p class="small muted">Henüz tavsiye yok.</p>'}</div>
      ${confirm ? `<div class="card stack"><p>Menajerini kovarsan seni kötüleyebilir ve pazarlıkları kendin yaparsın. Emin misin?</p><div class="row"><button class="btn alt sm grow" data-a="confirm-no">Vazgeç</button><button class="btn danger sm grow" data-a="fire-agent">Kov</button></div></div>` : `<button class="btn ghost" data-a="confirm" data-v="fire">Menajeri kov</button>`}`);
  }

  function loanCard() {
    const S = F.S, P = S.P;
    const credit = P.credit == null ? 60 : P.credit;
    const cl = credit >= 75 ? ['İyi', 'good'] : credit >= 45 ? ['Orta', 'warn'] : ['Zayıf', 'bad'];
    if (S.loan) {
      const L = S.loan;
      return `<div class="card stack" style="gap:8px"><div class="row"><div class="label grow">Kredi</div><span class="chip ${cl[1]}">Kredi notu: ${cl[0]}</span></div>
        <div class="row small"><span class="grow">Haftalık taksit</span><b class="num">${F.money(L.weekly)}</b></div><div class="row small"><span class="grow">Kalan</span><b class="num">${L.left} hafta · ${F.money(L.weekly * L.left)}</b></div>
        ${L.missed ? `<p class="tiny" style="color:var(--bad)">${L.missed} taksit gecikti. Gecikme faizi işliyor.</p>` : ''}
        <button class="btn alt sm" data-a="loan-pay">Erken kapat (%5 indirimle ${F.money(Math.round(L.weekly * L.left * 0.95))})</button></div>`;
    }
    const lim = F.loanLimit();
    if (!lim) return `<div class="card small muted">Kredi: sözleşmen olmadan banka kredi vermiyor.</div>`;
    const amts = [0.25, 0.5, 1].map((x) => Math.round(lim * x / 1000) * 1000);
    const ai = U.loanAmt == null ? 1 : U.loanAmt, ti = U.loanTerm == null ? 1 : U.loanTerm;
    const q = F.loanQuote(amts[ai], ti);
    return `<div class="card stack" style="gap:8px"><div class="row"><div class="label grow">Kredi</div><span class="chip ${cl[1]}">Kredi notu: ${cl[0]}</span></div>
      <p class="tiny muted">Limitin sözleşmene ve maaşına bağlı. Taksitler her hafta otomatik düşer; ödeyemezsen kredi notun düşer.</p>
      <div class="seg">${amts.map((a, i) => `<button class="${ai === i ? 'on' : ''}" data-a="loan-amt" data-v="${i}">${F.money(a)}</button>`).join('')}</div>
      <div class="seg">${D.loanTerms.map((t, i) => `<button class="${ti === i ? 'on' : ''}" data-a="loan-term" data-v="${i}">${t.name}</button>`).join('')}</div>
      <div class="row small"><span class="grow">Haftalık taksit</span><b class="num">${F.money(q.weekly)}</b></div><div class="row small"><span class="grow">Toplam geri ödeme</span><b class="num">${F.money(q.total)} <span class="tiny muted">(faiz %${Math.round(q.rate * 100)})</span></b></div>
      <button class="btn sm" data-a="loan-take">Krediyi çek</button></div>`;
  }
  function bankaView() {
    const S = F.S, P = S.P;
    const ls = S.lastSummary;
    const upkeep = P.owned.reduce((a, id) => a + ((F.item(id) || {}).upkeep || 0), 0);
    return appShell('Banka', `<div class="card"><div class="label">Bakiye</div><div class="display num" style="font-size:44px;color:${P.money < 0 ? 'var(--bad)' : 'var(--ink)'}">${F.money(P.money)}</div>${S.owed ? `<div class="small" style="color:var(--bad)">Kulüpten alacağın: ${F.money(S.owed)}</div>` : ''}</div>
      <div class="card stack" style="gap:6px"><div class="label">Haftalık</div>${P.contract.bonus && (P.contract.bonus.app || P.contract.bonus.goal || P.contract.bonus.assist) ? `<div class="row small"><span class="grow">Sözleşme primleri</span><b class="num">maç ${F.money(P.contract.bonus.app)} · gol ${F.money(P.contract.bonus.goal)} · asist ${F.money(P.contract.bonus.assist)}</b></div>` : ""}<div class="row small"><span class="grow">Maaş</span><b class="num">${F.money(P.contract.wage)}</b></div>${S.agent ? `<div class="row small"><span class="grow">Menajer komisyonu</span><b class="num">%${S.agent.komisyon}</b></div>` : ''}<div class="row small"><span class="grow">Sahip olduklarının bakımı</span><b class="num">${F.money(-upkeep)}</b></div>${ls ? `<div class="row small"><span class="grow">Geçen hafta net</span><b class="num">${F.money(ls.net)}</b></div>` : ''}</div>
      ${loanCard()}
      <div class="label">Hesap hareketleri</div><div class="card list">${S.bank.length ? S.bank.slice(0, 25).map((b) => `<div class="li small"><span class="grow">${esc(b.t)}<div class="tiny muted">${esc(b.label)}</div></span><b class="num" style="color:${b.v >= 0 ? 'var(--good)' : 'var(--bad)'}">${b.v > 0 ? '+' : ''}${F.money(b.v)}</b></div>`).join('') : '<p class="small muted">Hareket yok.</p>'}</div>`);
  }

  function magazaView() {
    const S = F.S, P = S.P;
    const cat = U.shopCat || D.shopCats[0].id;
    const items = D.shop.filter((it) => it.cat === cat);
    const tabs = `<div class="tabs">${D.shopCats.map((c) => `<button class="pick ${cat === c.id ? 'on' : ''}" data-a="shopcat" data-v="${c.id}">${c.name}</button>`).join('')}</div>`;
    const camp = S.campaign && S.campaign.until >= S.t;
    const subCard = (it) => {
      const cur = (P.subs || []).find((x) => x.id === it.id);
      const p1 = F.subPrice(it, 1), p3 = F.subPrice(it, 3);
      const ok = F.cond(it.if);
      return `<div class="card stack" style="gap:8px"><div class="row"><b class="grow">${esc(it.name)}</b>${cur ? `<span class="chip on">${cur.left} hafta kaldı</span>` : ''}</div><p class="small muted">${esc(it.desc)}</p>
        <div class="meta row wrap"><span class="tiny muted">Her hafta:</span>${fxPreview(it.weekly || {})}${it.trainSub ? `<span class="chip good">Antrenman XP +%${Math.round(it.trainSub * 100)}</span>` : ''}${it.injMul ? `<span class="chip good">Sakatlık riski −%${Math.round((1 - it.injMul) * 100)}</span>` : ''}${it.livingMul ? `<span class="chip good">Yaşam gideri −%${Math.round((1 - it.livingMul) * 100)}</span>` : ''}</div>
        ${ok ? `<div class="row" style="gap:8px"><button class="btn alt sm grow" data-a="sub-buy" data-v="${it.id}" data-w="1" ${P.money >= p1 ? '' : 'disabled'}>1 ay · ${F.money(p1)}</button><button class="btn sm grow" data-a="sub-buy" data-v="${it.id}" data-w="3" ${P.money >= p3 ? '' : 'disabled'}>3 ay · ${F.money(p3)}${camp ? ' 🔥' : ''}</button></div>${camp ? '<p class="tiny" style="color:var(--warn)">Kampanya: 3 ay, 2 ay fiyatına!</p>' : ''}` : '<p class="tiny muted">Şu an uygun değil.</p>'}</div>`;
    };
    const body = cat === 'gelisim' ? items.map(subCard).join('') : items.map((it) => {
      const price = F.itemPrice(it);
      const owned = !it.consumable && P.owned.includes(it.id);
      const can = price != null && P.money >= price;
      const fx = Object.assign({}, it.fx || {});
      return `<div class="card stack" style="gap:8px"><div class="row"><b class="grow">${esc(it.name)}</b>${owned ? '<span class="chip on">Sende</span>' : ''}</div><p class="small muted">${esc(it.desc)}${it.special === 'kulup' && F.homeClub() ? ' (' + esc(F.homeClub().name) + ', ' + esc(F.leagueName(F.homeClub().id)) + ')' : ''}</p>
        <div class="meta row wrap">${fxPreview(fx)}${it.weekly ? `<span class="tiny muted" style="align-self:center">Her hafta:</span>${fxPreview(it.weekly)}` : ''}${it.house ? `<span class="chip good">Ev: haftalık toparlanma +${it.house} enerji</span>` : ''}${it.trainMul ? `<span class="chip good">Gelişim +%${Math.round((it.trainMul - 1) * 100)}</span>` : ''}${it.injMul ? `<span class="chip good">Sakatlık riski −%${Math.round((1 - it.injMul) * 100)}</span>` : ''}${it.income ? `<span class="chip ${it.income[0] < 0 ? 'warn' : 'good'}">Gelir ${F.money(it.income[0])}…${F.money(it.income[1])}/hafta</span>` : ''}${it.upkeep ? `<span class="chip bad">Bakım ${F.money(-it.upkeep)}/hafta</span>` : ''}${it.lux >= 4 ? '<span class="chip warn">Taraftar tepkisi</span>' : ''}</div>
        <div class="row"><b class="num grow">${price == null ? '—' : F.money(price)}</b>${owned ? (it.special === 'kulup' ? '' : `<button class="btn alt sm" data-a="sell" data-v="${it.id}">Sat (${F.money(Math.round(it.price * 0.5))})</button>`) : `<button class="btn sm" data-a="buy" data-v="${it.id}" ${can ? '' : 'disabled'}>${can ? 'Satın al' : 'Para yetmiyor'}</button>`}</div></div>`;
    }).join('');
    return appShell('Mağaza', `<div class="row small"><span class="grow muted">Bakiye</span><b class="num">${F.money(P.money)}</b></div>${tabs}<div class="stack" style="gap:10px">${body}</div>`);
  }

  const statCol = (v) => (v >= 80 ? 'var(--good)' : v >= 70 ? 'color-mix(in srgb, var(--good) 70%, var(--warn))' : v >= 60 ? 'var(--warn)' : v >= 50 ? 'color-mix(in srgb, var(--warn) 55%, var(--bad))' : 'var(--bad)');
  function attrCards(P, w) {
    const dp = (F.S.devPlan && F.S.devPlan.focus) || [];
    const groups = D.attrGroups.filter((g) => g.id !== 'kl' || P.pos === 'KL');
    return `<div class="attrgrid">${groups.map((g) => { const sc = F.groupScore(g.id, P); return `<div class="agrp"><div class="row" style="gap:8px"><b class="ag-n num" style="color:${statCol(sc)}">${sc}</b><span class="ag-t">${esc(g.name)}</span></div>${g.keys.map((k) => { const v = Math.round(P.attrs[k]); return `<div class="ar"><span>${esc(D.attrs[k])}${w[k] ? ' <b style="color:var(--accent)">★</b>' : ''}${dp.includes(k) ? ' <b style="color:var(--warn)">▲</b>' : ''}</span><b class="num" style="color:${statCol(v)}">${v}</b></div>`; }).join('')}</div>`; }).join('')}</div>`;
  }
  function profilView() {
    const S = F.S, P = S.P;
    const w = F.posW(P);
    const attrs = Object.keys(D.attrs).filter((k) => !D.keeperAttrs.includes(k) || P.pos === 'KL').sort((a, b) => (w[b] || 0) - (w[a] || 0));
    const canChange = S.roleChange !== S.season;
    const cr = F.curRole(), fit = Math.round(F.roleFit(cr) * 100), fm = F.teamFormation();
    const posBox = `<div class="card stack" style="gap:8px"><div class="row"><div class="grow"><div class="label">Mevki</div><b>${esc(F.role(P).name)}</b> <span class="small muted">· ana mevki</span>
      <div class="small" style="margin-top:4px">Takımın dizilişi: <b>${esc(fm.id)}</b> · Sahada: <b>${esc(D.roles[cr].name)}</b>${cr !== P.role ? ` <span class="chip ${fit >= 85 ? 'good' : fit >= 60 ? 'warn' : 'bad'}">uyum %${fit}</span>` : ''}${S.tempRole && S.tempRole.until >= S.t ? ' <span class="chip warn">geçici</span>' : ''}${!F.inSystem(cr) ? ' <span class="chip bad">sistemde yerin yok</span>' : ''}</div></div><button class="btn alt sm" data-a="pos-edit" ${canChange ? '' : 'disabled'}>${U.posEdit ? 'Kapat' : 'Mevki değiştir'}</button></div>
      ${canChange ? '' : '<p class="tiny muted">Bu sezon mevkini zaten değiştirdin.</p>'}
      ${U.posEdit && canChange ? positionMap(U.prof, 'profil') + `<button class="btn sm" data-a="role-apply" ${U.prof && U.prof.role ? '' : 'disabled'}>Bu mevkiye geç</button><p class="tiny muted">Ana mevkini sezonda bir kez değiştirebilirsin. Takımın dizilişinde yoksa hoca seni başka bir yerde oynatmak ister. Yeni mevkide oynadıkça uyumun artar.</p>` : ''}</div>`;
    const traits = F.activeTraits();
    const forming = Object.keys(P.traits).filter((k) => !F.trait(k) && P.traits[k] >= 1);
    const seasons = P.career.seasons.slice().reverse().map((s) => `<tr><td class="num">${s.year}</td><td>${esc(s.club)}</td><td class="num">${s.pos}.</td><td class="num">${s.apps}</td><td class="num">${s.goals}</td><td class="num">${String(s.avg).replace('.', ',')}</td></tr>`).join('');
    const t = F.myTeam();
    const editor = U.editLook ? lookEditor(P.look, t.colors, P.number, 'p-numin', P.surname) : '';
    return appShell('Profil', `<div class="card row" style="gap:12px">${meFace('md')}<div class="grow"><b>${esc(P.name + ' ' + P.surname)}</b><div class="small muted">${P.age} yaş · ${esc(F.role(P).name)} · ${esc(P.home.name)}</div></div><div style="text-align:right"><div class="display num" style="font-size:44px">${F.ovr()}</div><div class="tiny muted">GÜÇ</div></div></div>
      <button class="btn alt sm" data-a="edit-look" style="align-self:flex-start">${U.editLook ? 'Düzenlemeyi kapat' : 'Görünüm ve numara (berber)'}</button>${editor}
      ${posBox}
      <div class="card stack" style="gap:10px"><div class="label">Saha özellikleri</div>${attrCards(P, w)}<p class="tiny muted">★ mevkinin gücünü belirler · ▲ hocanın gelişim planı</p></div>
      <div class="card stack" style="gap:8px"><div class="label">Kişisel yetenekler</div>${Object.keys(D.softs).map((k) => meter(D.softs[k], P.soft[k], 99)).join('')}<p class="tiny muted">Diyaloglarda yeni seçenekler açar ve başarı şansını artırır.</p></div>
      <div class="card stack" style="gap:8px"><div class="label">Hayat</div>${['mental', 'disiplin', 'sohret', 'saglik', 'moral'].map((k) => meter(D.lifeLabels[k], P.life[k])).join('')}${meter('Yabancı dil', P.dil)}<div class="row small"><span class="grow muted">Takipçi</span><b class="num">${F.num(P.followers)}</b></div></div>
      <div class="card stack" style="gap:8px"><div class="label">Kişilik</div><div class="row wrap">${traits.length ? traits.map((k) => `<span class="chip on">${esc(D.traits[k])}</span>`).join('') : '<span class="small muted">Henüz belirgin bir kişilik oluşmadı.</span>'}${forming.map((k) => `<span class="chip">${esc(D.traits[k])} ${'•'.repeat(Math.min(2, Math.floor(P.traits[k])))}</span>`).join('')}</div><p class="tiny muted">Seçimlerin kişiliğini şekillendirir. Kişilikler bazı seçenekleri açar ya da kapatır.</p></div>
      ${S.goals.length ? `<div class="card stack small" style="gap:6px"><div class="label">Sezon hedefleri</div>${S.goals.map((g) => `<p>• ${esc((D.goals.find((x) => x.id === g) || {}).name || g)}</p>`).join('')}</div>` : ''}
      <div class="card stack" style="gap:6px"><div class="label">Kariyer</div><div class="row wrap"><span class="chip">${P.career.apps} maç</span><span class="chip">${P.career.goals} gol</span><span class="chip">${P.career.assists} asist</span><span class="chip">${P.career.caps} milli</span><span class="chip">${P.career.titles.length} kupa</span><span class="chip">zirve ${P.peak}</span></div>
        ${seasons ? `<div class="scroll-x"><table><thead><tr><th>Sezon</th><th>Kulüp</th><th>Sıra</th><th>Maç</th><th>Gol</th><th>Not</th></tr></thead><tbody>${seasons}</tbody></table></div>` : ''}</div>`);
  }

  /* ---------- Turnuvalar: üç kulüp kupası, milli takım elemeleri ve turnuvaları ---------- */
  // takım adı + arma (kulüp id'si ya da milli takım adı)
  function cupName(id, isNat, short) {
    if (isNat) return `<span class="row" style="gap:6px">${badge({ name: id, colors: F.natColors(id), id: 'n' + F.DATA.nations.findIndex((y) => y[0] === id) }, 14)}<span>${esc(id)}</span></span>`;
    const t = F.team(id);
    return `<span class="row" style="gap:6px">${badge(t, 14)}<span>${esc(t.name)}</span>${short ? '' : `<span class="tiny muted">${esc(t.country)}</span>`}</span>`;
  }
  function cupTable(title, table, up, mine, isNat) {
    const order = F.sortTable(table);
    const rows = order.map((id, i) => { const r = table[id]; return `<tr class="${id === mine ? 'me' : ''} ${i < up ? 'up' : ''}"><td class="num">${i + 1}</td><td>${cupName(id, isNat)}</td><td class="num">${r.p}</td><td class="num">${r.gf - r.ga > 0 ? '+' : ''}${r.gf - r.ga}</td><td class="num"><b>${r.pts}</b></td></tr>`; }).join('');
    return `<div class="card scroll-x"><div class="label">${esc(title)}</div><table><thead><tr><th>#</th><th>Takım</th><th>O</th><th>Av</th><th>P</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function cupKo(C, mine, isNat) {
    return F.cupStages(C).slice().reverse().filter((st) => C.ko[st]).map((st) => {
      const rows = C.ko[st].map((p) => {
        const r = C.kores.find((x) => x.ko === st && x.h === p[0] && x.a === p[1]);
        return `<div class="li small ${p.includes(mine) ? 'me' : ''}" style="display:grid;grid-template-columns:1fr auto;gap:2px 10px;align-items:center"><span style="${r && r.w === p[0] ? 'font-weight:700' : ''}">${cupName(p[0], isNat, true)}</span><b class="num">${r ? r.gh : '–'}</b><span style="${r && r.w === p[1] ? 'font-weight:700' : ''}">${cupName(p[1], isNat, true)}</span><b class="num">${r ? r.ga : '–'}${r && r.pen ? ' <span class="tiny muted">(pen.)</span>' : ''}</b></div>`;
      }).join('');
      return `<div class="label">${esc(F.STAGE_NAME[st])}</div><div class="card list">${rows}</div>`;
    }).join('');
  }
  const natqResult = (Q) => ({ direkt: 'doğrudan katılıyor', 'baraj-kazandı': 'barajı geçip katılıyor', 'baraj-kaybetti': 'barajda elendi', elendi: 'elendi' }[Q.result]);
  function cupOptions(key) {
    const S = F.S, Cd = F.DATA.cups;
    const o = [];
    const cc = F.clubCups();
    const mineC = F.myClubCup();
    if (cc) F.DATA.clubCups.forEach((k) => { if (cc[k]) o.push(['C:' + k, Cd[k].name + (mineC && mineC.id === k ? ' (kulübün var)' : '')]); });
    if (S.natq) o.push(['N:q', Cd[S.natq.kind].qual + ' · ' + S.natq.nation]);
    Object.keys(S.ncups || {}).sort((a, b) => S.ncups[b].year - S.ncups[a].year).forEach((k) => o.push(['N:' + k, Cd[k].name + ' ' + S.ncups[k].year]));
    return o.map(([k, n]) => `<option value="${k}" ${k === key ? 'selected' : ''}>🏆 ${esc(n)}</option>`).join('');
  }
  const cupExists = (key) => {
    const S = F.S;
    if (!key || !/^[CN]:/.test(key)) return false;
    const k = key.slice(2);
    if (key[0] === 'C') { const cc = F.clubCups(); return !!(cc && cc[k]); }
    return k === 'q' ? !!S.natq : !!(S.ncups && S.ncups[k]);
  };
  function cupView(key, sel) {
    const S = F.S, Cd = F.DATA.cups;
    const k = key.slice(2);
    if (key === 'N:q') {
      const Q = S.natq;
      const T = Cd[Q.kind];
      const direct = Q.kind === 'euro' ? 2 : 1;
      const res = Q.result ? Q.nation + ' grubu ' + Q.pos + '. bitirdi: ' + natqResult(Q) + '.' : `Elemeler iki sezon sürer ve milli aralarda oynanır (${Q.r}/${Q.fx.length} maç günü). İlk ${direct} doğrudan, ${direct + 1}. baraj maçıyla ${F.dat(T.name)} gider. Turnuva ${Q.target} yazında oynanır.`;
      const last = Q.results.filter((x) => x.h === Q.nation || x.a === Q.nation).slice(-6).reverse().map((x) => `<div class="li small"><span class="grow">${esc(x.h)} – ${esc(x.a)}</span><b class="num">${x.gh}–${x.ga}</b></div>`).join('');
      return appShell('Lig', `${sel}${cupTable(T.qual + ' · ' + Q.nation + ' grubu', Q.table, direct, Q.nation, true)}${last ? `<div class="label">${esc(Q.nation)} maçları</div><div class="card list">${last}</div>` : ''}<p class="tiny muted">${esc(res)}</p>`);
    }
    const isNat = key[0] === 'N';
    const C = isNat ? S.ncups[k] : F.clubCups()[k];
    const mine = isNat ? C.nation : S.P.contract.team;
    const groups = C.groups.map((g, gi) => cupTable('ABCDEFGH'[gi] + ' Grubu', C.tables[gi], 2, mine, isNat)).join('');
    const champ = C.winner ? `<div class="card row"><span class="chip good">Şampiyon</span><b class="grow">${isNat ? esc(C.winner) : esc(F.team(C.winner).name)}</b></div>` : '';
    const myR = C.teams.includes(mine) ? F.cupReached(C, mine) : null;
    const note = isNat
      ? `${C.qual ? esc(C.nation) + (C.squad ? ' kadrosundasın.' : ' kadrosunda değilsin.') : esc(C.nation) + ' bu turnuvaya katılamadı.'}${myR ? ' Sonuç: ' + myR + '.' : ''}`
      : `Her ülkenin üst liginin önceki sezon sıralamasına göre: ilk sıralar Yıldızlar Ligi'ne, sonraki iki kulüp Kıta Kupası'na, onlardan sonraki iki kulüp Gelecek Ligi'ne gider. Grupta ilk 2 tur atlar; eleme maçları tek maçtır.${myR ? ' Kulübün: ' + myR + '.' : ''}`;
    return appShell('Lig', `${sel}${champ}${cupKo(C, mine, isNat)}${groups ? '<div class="label">Gruplar</div>' + groups : ''}<p class="tiny muted">${note}</p>`);
  }

  /* ---------- Maç öncesi taktik toplantısı ---------- */
  function tacticView() {
    const S = F.S, P = S.P;
    const tp = F.tacticPlan();
    const plan = D.tacticPlans[tp.key];
    const h = F.npc('hoca');
    const opp = tp.opp ? F.team(tp.opp) : null;
    const me = F.myTeam();
    const fm = F.teamFormation();
    const status = S.preStatus && S.preStatus.t === S.t ? S.preStatus.s : null;
    const res = tp.done != null ? tp.result : null;
    const bonus = Object.keys(plan.b).map((k) => (typeof D.attrs[k] === 'string' ? D.attrs[k] : (D.attrs[k] && D.attrs[k].name) || k)).join(', ');
    const opts = [['Planı dinle ve uygula', 'Planın istediği hareketler maçta daha kolay tutar.'], ['Soru sor, planı netleştir', 'Konuşma becerine bağlı: tutarsa bonus büyür, hoca sevinir.'], ['Kendi bildiğini oyna', 'Bireysel hareketlerin biraz rahatlar ama hoca bozulur.']];
    return {
      main: `<div class="stack fade"><div class="pitchlines"><div class="label" style="color:inherit;opacity:.8">Taktik toplantısı</div><div class="display" style="font-size:34px;margin-top:6px">${esc(plan.name)}</div><div class="small">${esc(me.name)} – ${opp ? esc(opp.name) : ''} · ${tp.home ? 'iç saha' : 'deplasman'} · ${esc(fm.name || fm.id || '')}</div></div>
        <div class="card stack" style="gap:8px"><div class="row">${h ? av(h.name) : ''}<div class="grow"><b class="small">${h ? esc(h.name) : 'Hoca'}</b><div class="tiny muted">${h && D.coachTypes[h.type] ? esc(D.coachTypes[h.type].name) + ' hoca' : ''}</div></div>${status ? `<span class="chip ${status === 'ilk11' ? 'good' : ''}">${status === 'ilk11' ? 'İlk 11' : 'Yedek'}</span>` : ''}</div>
          <p>"${esc(plan.t)}"</p><p class="small"><b>Senden beklediğim:</b> ${esc(plan.you[P.pos] || plan.you.OS)}</p>${opp ? `<p class="tiny muted">Rakip gücü ${opp.str} · bizim gücümüz ${me.str}</p>` : ''}</div>
        ${res ? `<div class="result stack" style="gap:8px"><p>${esc(res.r)}</p>${deltaChips(res.deltas)}<p class="tiny muted">Bu maçta kolaylaşan hareketler: ${esc(bonus)}</p></div>` : `<div class="stack" style="gap:8px">${opts.map(([t, d], i) => `<button class="opt" data-a="tac-choose" data-v="${i}"><b>${esc(t)}</b><span class="tiny muted" style="display:block">${esc(d)}</span></button>`).join('')}</div>`}</div>`,
      dock: res ? `<button class="btn" data-a="ev-next">Maça çık</button>` : ''
    };
  }

  /* ---------- Milli ara ve milli turnuva ekranları ---------- */
  function natInfoView(st) {
    const S = F.S, Cd = F.DATA.cups;
    const T = Cd[st.kind];
    const chip = (ok, t) => `<span class="chip ${ok ? 'good' : ''}" style="align-self:flex-start">${esc(t)}</span>`;
    if (st.mode === 'break') {
      const Q = S.natq;
      const [r0, r1] = st.rounds;
      const mineRows = [], otherRows = [];
      for (let r = r0; r < r1; r++) (Q.fx[r] || []).forEach(([h, a]) => {
        const res = Q.results.find((x) => x.r === r && x.h === h && x.a === a);
        const me = h === Q.nation || a === Q.nation;
        const row = `<div class="li small ${me ? 'me' : ''}"><span class="grow">${cupName(h, true, true)}</span><b class="num" style="padding:0 8px">${res ? res.gh + '–' + res.ga : me && st.called === 'A' ? 'oynayacaksın' : 'vs'}</b><span class="grow" style="display:flex;justify-content:flex-end">${cupName(a, true, true)}</span></div>`;
        (me ? mineRows : otherRows).push(row);
      });
      const status = st.called === 'A' ? chip(true, Q.nation + ' A Milli Takımı kadrosundasın') : st.called === 'U21' ? chip(true, 'U21 Milli Takımı\'na çağrıldın') : chip(false, 'Bu kez kadroda yoksun');
      const why = st.called === 'A' ? 'Lig bu hafta duruyor. Kampa katılıyorsun; maçlarda sahaya çıkma şansın var.' : st.called === 'U21' ? 'A takım elemelerde oynarken sen U21 ile hazırlık maçına çıkacaksın.' : 'Lig bu hafta duruyor. Kulüpte çalışmaya devam ediyorsun; milli takımın maçlarını tribünden izledin.';
      return {
        main: `<div class="stack fade"><div class="pitchlines"><div class="label" style="color:inherit;opacity:.8">Milli ara</div><div class="display" style="font-size:34px;margin-top:6px">${esc(T.qual)}</div><div class="small">${r1 - r0 > 1 ? (r0 + 1) + '. ve ' + r1 + '. maç günü' : r1 + '. maç günü'} · ${esc(Q.target + '')} yazındaki ${esc(T.name)} için</div></div>
          ${status}<p class="small muted">${why}</p>
          ${mineRows.length ? `<div class="label">${esc(Q.nation)} maçları</div><div class="card list">${mineRows.join('')}</div>` : ''}
          ${cupTable(Q.nation + ' grubu', Q.table, Q.kind === 'euro' ? 2 : 1, Q.nation, true)}
          ${otherRows.length ? `<div class="label">Gruptaki diğer maçlar</div><div class="card list">${otherRows.join('')}</div>` : ''}</div>`,
        dock: `<button class="btn" data-a="ev-next">${st.called ? 'Kampa katıl' : 'Devam'}</button>`
      };
    }
    const W = (S.ncups || {})[st.kind];
    if (!W) return { main: '', dock: `<button class="btn" data-a="ev-next">Devam</button>` };
    if (st.mode === 'cupStart') {
      const gi = W.groups.findIndex((g) => g.includes(W.nation));
      return {
        main: `<div class="stack fade"><div class="pitchlines"><div class="label" style="color:inherit;opacity:.8">Yaz turnuvası</div><div class="display" style="font-size:34px;margin-top:6px">${esc(T.name)} ${W.year}</div><div class="small">${W.teams.length} milli takım · ${W.groups.length} grup</div></div>
          ${W.squad ? chip(true, W.nation + ' kadrosundasın') : chip(false, W.nation + ' kadrosuna seçilmedin')}
          <p class="small muted">${W.squad ? 'Turnuvayı maç maç oynayacaksın. Gruptan ilk iki çıkar, sonra tek maç eleme.' : 'Hoca seni turnuva kadrosuna almadı. Turnuvayı uzaktan takip edeceksin.'}</p>
          ${gi >= 0 ? cupTable('ABCDEFGH'[gi] + ' Grubu', W.tables[gi], 2, W.nation, true) : ''}</div>`,
        dock: `<button class="btn" data-a="ev-next">${W.squad ? 'Turnuvaya başla' : 'Devam'}</button>`
      };
    }
    const fin = W.kores.find((x) => x.ko === 'final');
    const myR = W.qual ? F.cupReached(W, W.nation) : null;
    return {
      main: `<div class="stack fade"><div class="pitchlines"><div class="label" style="color:inherit;opacity:.8">${esc(T.name)} ${W.year} bitti</div><div class="display" style="font-size:38px;margin-top:6px">${esc(W.winner)}</div><div class="small">şampiyon${fin ? ' · finalde ' + esc(fin.h) + ' ' + fin.gh + '–' + fin.ga + ' ' + esc(fin.a) + (fin.pen ? ' (pen.)' : '') : ''}</div></div>
        <div class="card small">${W.qual ? `<b>${esc(W.nation)}</b>: ${esc(myR === 'şampiyon' ? 'şampiyon oldu!' : myR === 'finalist' ? 'finalde kaybetti' : myR === 'Grup aşaması' ? 'grupta elendi' : myR + ' turunda elendi')}${W.squad ? '' : ' (kadroda değildin)'}` : `${esc(W.nation)} bu turnuvaya katılamadı.`}</div>
        ${cupKo(W, W.nation, true)}</div>`,
      dock: `<button class="btn" data-a="ev-next">Devam</button>`
    };
  }

  function ligView() {
    const S = F.S;
    const myKey = S.league.key;
    let key = U.leagueKey || myKey;
    if (!cupExists(key) && !S.world.comps[key]) key = myKey;
    if (cupExists(key)) {
      const compsAll = Object.values(S.world.comps).sort((a, b) => (a.c === 'TR' ? 0 : 1) - (b.c === 'TR' ? 0 : 1) || a.c.localeCompare(b.c) || a.tier - b.tier || a.g - b.g);
      const sel = `<select id="lg-sel" aria-label="Lig seç">${cupOptions(key)}${compsAll.map((c) => `<option value="${c.key}">${esc(c.name + (c.gname ? ' · ' + c.gname : ''))}${c.key === myKey ? ' (senin ligin)' : ''}</option>`).join('')}</select>`;
      return cupView(key, sel);
    }
    const comp = S.world.comps[key];
    let order, table;
    if (key === myKey) { table = S.league.table; order = F.sortTable(table); }
    else { order = comp.teams.slice().sort((a, b) => F.team(b).str - F.team(a).str); table = null; }
    const td = F.tierDef(comp.c, comp.tier);
    const up = comp.tier > 1 ? td.up / td.groups : 0;
    const down = td.down ? Math.ceil(td.down / td.groups) : 0;
    const comps = Object.values(S.world.comps).sort((a, b) => (a.c === 'TR' ? 0 : 1) - (b.c === 'TR' ? 0 : 1) || a.c.localeCompare(b.c) || a.tier - b.tier || a.g - b.g);
    const rows = order.map((id, i) => {
      const t = F.team(id);
      const r = table ? table[id] : null;
      const cls = [id === S.P.contract.team ? 'me' : '', i < up ? 'up' : '', i >= order.length - down ? 'down' : ''].join(' ');
      return `<tr class="${cls}"><td class="num">${i + 1}</td><td><span class="row" style="gap:6px">${badge(t, 14)}<span>${esc(t.name)}</span></span></td>${r ? `<td class="num">${r.p}</td><td class="num">${r.gf - r.ga > 0 ? '+' : ''}${r.gf - r.ga}</td><td class="num"><b>${r.pts}</b></td>` : `<td class="num">${t.str}</td>`}</tr>`;
    }).join('');
    const results = key === myKey ? S.league.results.slice(-6).reverse().map((r) => `<div class="li small"><span class="grow">${esc(F.team(r.h).name)} – ${esc(F.team(r.a).name)}</span><b class="num">${r.gh}–${r.ga}</b></div>`).join('') : '';
    // istatistik sekmeleri (sadece kendi liginde)
    const ltab = key === myKey ? (U.lgTab || 'tablo') : 'tablo';
    const ltabs = key === myKey ? `<div class="tabs">${[['tablo', 'Puan durumu'], ['g', 'Gol krallığı'], ['a', 'Asist'], ['kart', 'Kartlar']].map(([k, n]) => `<button class="pick ${ltab === k ? 'on' : ''}" data-a="lg-tab" data-v="${k}">${n}</button>`).join('')}</div>` : '';
    if (ltab !== 'tablo') {
      const rowsS = F.leagueLeaders(ltab, 20).map((x, i) => { const t = F.team(x.t); const val = ltab === 'kart' ? `<b class="num" style="color:var(--warn)">${x.y}</b> <span class="tiny">sarı</span>${x.r ? ` <b class="num" style="color:var(--bad)">${x.r}</b> <span class="tiny">kırmızı</span>` : ''}` : `<b class="num">${x[ltab]}</b>`; return `<tr class="${x.me ? 'me' : ''}"><td class="num">${i + 1}</td><td><b>${esc(x.n)}</b>${x.me ? ' <span class="chip on">Sen</span>' : ''}<div class="tiny muted row" style="gap:4px">${badge(t, 12)}${esc(t.name)}</div></td><td style="text-align:right">${val}</td></tr>`; }).join('');
      return appShell('Lig', `${ltabs}<div class="card scroll-x">${rowsS ? `<table><thead><tr><th>#</th><th>Oyuncu</th><th style="text-align:right">${{ g: 'Gol', a: 'Asist', kart: 'Kart' }[ltab]}</th></tr></thead><tbody>${rowsS}</tbody></table>` : '<p class="small muted">Sezon yeni başladı, henüz istatistik yok.</p>'}</div><p class="tiny muted">Sezon sonunda gol ya da asist kralı olursan albümüne girer ve şöhretin artar.</p>`);
    }
    return appShell('Lig', `${ltabs}<select id="lg-sel" aria-label="Lig seç">${cupOptions(key)}${comps.map((c) => `<option value="${c.key}" ${c.key === key ? 'selected' : ''}>${esc(c.name + (c.gname ? ' · ' + c.gname : ''))}${c.key === myKey ? ' (senin ligin)' : ''}</option>`).join('')}</select>
      <div class="card scroll-x"><table><thead><tr><th>#</th><th>Takım</th>${table ? '<th>O</th><th>Av</th><th>P</th>' : '<th>Güç</th>'}</tr></thead><tbody>${rows}</tbody></table>${!table ? '<p class="tiny muted" style="margin-top:6px">Bu lig sezon sonunda simüle edilir. Takımlar güce göre sıralı.</p>' : ''}</div>
      ${results ? `<div class="label">Son maçların</div><div class="card list">${results}</div>` : ''}`);
  }

  function albumView() {
    const S = F.S;
    return appShell('Albüm', S.album.length ? `<div class="grid2">${S.album.map((a) => `<div class="polaroid"><div class="ph" style="background:linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})"><span style="text-shadow:0 1px 3px rgba(0,0,0,.6)">${a.year}</span></div><p class="small" style="margin-top:8px">${esc(a.t)}</p><p class="tiny muted">${a.age} yaş · ${esc(a.club)}</p></div>`).join('')}</div>` : '<div class="card small muted">Albüm boş.</div>');
  }

  /* ---------- Güncelleme: GitHub'daki sürümle karşılaştır, yerel sunucuda tek tıkla güncelle ---------- */
  const verNum = (v) => String(v || '0').split('.').map((x) => +x || 0);
  const newer = (a, b) => { const x = verNum(a), y = verNum(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
  async function checkUpdate(silent) {
    U.upd = { status: 'checking' };
    if (!silent) render(true);
    try {
      const r = await fetch(F.UPDATE_URL + '?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('GitHub cevap vermedi (' + r.status + ')');
      const remote = await r.json();
      let local = false;
      try { const pr = await fetch('/__ping', { cache: 'no-store' }); local = pr.ok && (await pr.json()).git; } catch (e) { local = false; }
      U.upd = { status: newer(remote.version, F.VERSION) ? 'new' : 'latest', remote, local, web: !!window.FORMA_WEB };
      store.set('forma.updCheck', new Date().toDateString());
      if (silent && U.upd.status === 'new') toast('Yeni sürüm var: ' + remote.version + '. Ayarlar > Güncellemeyi denetle');
    } catch (e) {
      U.upd = { status: 'error', err: e.message };
    }
    if (!silent || U.upd.status === 'new') render(true);
  }
  async function runUpdate() {
    U.upd = Object.assign({}, U.upd, { status: 'updating' });
    render(true);
    try {
      save();
      // web uygulaması (GitHub Pages): önbelleği temizle, yeni sürümle yeniden aç
      if (window.FORMA_WEB) {
        if (navigator.serviceWorker) { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map((r) => r.update().catch(() => {}))); }
        if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); }
        U.upd = { status: 'done' };
        render(true);
        setTimeout(() => location.reload(), 700);
        return;
      }
      const r = await fetch('/__update', { method: 'POST' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.err || 'Güncelleme başarısız');
      U.upd = { status: 'done', serverChanged: j.serverChanged };
      render(true);
      setTimeout(() => location.reload(), j.serverChanged ? 4000 : 900);
    } catch (e) {
      U.upd = Object.assign({}, U.upd, { status: 'error', err: e.message });
      render(true);
    }
  }
  function updateCard() {
    const u = U.upd || {};
    const remote = u.remote;
    let body = '';
    if (u.status === 'checking') body = '<p class="small muted">GitHub kontrol ediliyor…</p>';
    else if (u.status === 'latest') body = `<p class="small" style="color:var(--good)">En güncel sürümü kullanıyorsun.</p>`;
    else if (u.status === 'new') body = `<div class="flat stack" style="gap:6px"><b>Yeni sürüm: ${esc(remote.version)}</b><span class="tiny muted">${esc(remote.date || '')}</span>${(remote.notes || []).map((n) => `<div class="small">• ${esc(n)}</div>`).join('')}</div>
      ${u.local || u.web ? '<button class="btn sm" data-a="upd-run">Şimdi güncelle</button><p class="tiny muted">Oyun yeni sürümü indirip kendini yeniler. Kariyerin kaybolmaz.</p>' : `<p class="small">Bu kopya otomatik güncellenemiyor. Bilgisayarında <b>FORMA'yı başlat</b> dosyasıyla açarsan tek tıkla güncellenir. Ya da yeni sürümü <a href="${F.REPO_URL}" target="_blank" rel="noopener">GitHub sayfasından</a> indir.</p>`}`;
    else if (u.status === 'updating') body = '<p class="small muted">Yeni sürüm indiriliyor…</p>';
    else if (u.status === 'done') body = `<p class="small" style="color:var(--good)">Güncellendi! Oyun yeniden yükleniyor…</p>${u.serverChanged ? '<p class="tiny muted">Sunucu dosyası da güncellendi. Yüklenmezse FORMA penceresini kapatıp yeniden aç.</p>' : ''}`;
    else if (u.status === 'error') body = `<p class="small" style="color:var(--bad)">Kontrol edilemedi: ${esc(u.err || '')}</p>`;
    return `<div class="card stack" style="gap:8px"><div class="row"><div class="grow"><div class="label">Güncelleme</div><span class="small muted">Sürüm ${esc(F.VERSION)}</span></div><button class="btn alt sm" data-a="upd-check" ${u.status === 'checking' || u.status === 'updating' ? 'disabled' : ''}>Güncellemeyi denetle</button></div>${body}</div>`;
  }

  function ayarlarView() {
    const S = F.S;
    const theme = store.get('forma.theme') || 'system';
    const q = U.renameQ.toLocaleLowerCase('tr');
    const teams = q.length >= 2 ? Object.values(S.world.teams).filter((t) => t.name.toLocaleLowerCase('tr').includes(q)).slice(0, 12) : [];
    const keyCard = `<div class="card stack" style="gap:8px"><div class="row"><div class="grow"><div class="label">Anahtar ve bulut kaydı</div><span class="small">${cloud.key ? 'Anahtar: <b>' + esc(maskKey(cloud.key)) + '</b>' : 'Anahtar bağlı değil'}</span><span id="cloudst" class="tiny muted" style="display:block">${esc(cloud.key ? (cloud.ready ? cloud.status || 'Bulut hazır' : 'Bulut bu ortamda kapalı') : 'Cihazlar arası devam için bir anahtar bağla')}</span></div><button class="btn alt sm" data-a="key-open">${cloud.key ? 'Yönet' : 'Anahtar bağla'}</button></div>${cloud.key && cloud.ready ? '<button class="btn alt sm" data-a="cloud-now" style="align-self:flex-start">Şimdi buluta kaydet</button>' : ''}</div>`;
    const devCard = `<div class="card stack" style="gap:8px"><div class="row"><div class="grow"><div class="label">Geliştirici modu</div><span class="small muted">Para, mevki, yetenekler, ilişkiler ve oyunun tüm durumu için konsol.</span></div><button class="btn ${devOn() ? '' : 'alt'} sm" data-a="dev-toggle">${devOn() ? 'Açık' : 'Kapalı'}</button></div>${devOn() ? '<button class="btn sm" data-a="open" data-v="dev" style="align-self:flex-start">Konsolu aç</button><p class="tiny muted">Konsola üst çubuktaki &lt;/&gt; düğmesinden de ulaşırsın.</p>' : ''}</div>`;
    const snd = F.SND ? F.SND.get() : { on: false, vol: 0 };
    const soundCard = `<div class="card stack" style="gap:8px"><div class="row"><div class="grow"><div class="label">Ses</div><span class="small muted">Gol, düdük, kurtarış ve tribün sesleri.</span></div><button class="btn ${snd.on ? '' : 'alt'} sm" data-a="snd-toggle" style="width:auto">${snd.on ? 'Açık' : 'Kapalı'}</button></div>
      <div class="row" style="gap:10px"><span class="tiny muted">Seviye</span><input type="range" id="snd-vol" min="0" max="100" step="5" value="${snd.vol}" aria-label="Ses seviyesi" class="grow" ${snd.on ? '' : 'disabled'}><b class="num small" id="snd-vol-v">${snd.vol}</b></div>
      <button class="btn alt sm" data-a="snd-test" ${snd.on ? '' : 'disabled'}>Gol sesini dene</button></div>`;
    return appShell('Ayarlar', `${soundCard}${keyCard}${devCard}${updateCard()}<div class="card stack"><div class="label">Tema</div><div class="seg">${[['system', 'Sistem'], ['light', 'Açık'], ['dark', 'Koyu']].map(([k, n]) => `<button class="${theme === k ? 'on' : ''}" data-a="theme" data-v="${k}">${n}</button>`).join('')}</div></div>
      <div class="card stack"><div class="label">Takım isimlerini düzenle (PES usulü)</div><input type="text" id="rn-q" placeholder="Takım ara (en az 2 harf)" value="${esc(U.renameQ)}" aria-label="Takım ara">
        ${teams.map((t) => `<div class="row">${badge(t, 18)}<input type="text" data-team="${t.id}" value="${esc(t.name)}" maxlength="32" aria-label="${esc(t.name)} yeni adı"></div>`).join('')}<p class="tiny muted">Değişiklik yazmayı bitirince kaydedilir ve kayıt koduyla birlikte taşınır.</p></div>
      <div class="card stack"><div class="label">Kayıt kodu</div><p class="small muted">Oyun bu cihazda otomatik kaydedilir. Başka cihaza taşımak için kodu kopyala, orada yapıştır.</p>
        <div class="row"><button class="btn alt sm grow" data-a="export">Kodu oluştur</button><button class="btn alt sm grow" data-a="copy" ${U.code ? '' : 'disabled'}>Kopyala</button></div>
        <textarea id="code" aria-label="Kayıt kodu" placeholder="Kayıt kodunu buraya yapıştır">${esc(U.code)}</textarea><button class="btn sm" data-a="import">Koddan yükle</button>${U.importMsg ? `<p class="small">${esc(U.importMsg)}</p>` : ''}</div>
      ${U.confirm === 'new' ? `<div class="card stack"><p>Mevcut kariyer silinecek. Emin misin?</p><div class="row"><button class="btn alt sm grow" data-a="confirm-no">Vazgeç</button><button class="btn danger sm grow" data-a="new-career-now">Sil ve yeniden başla</button></div></div>` : `<button class="btn ghost" data-a="confirm" data-v="new">Yeni kariyere başla</button>`}
      <div class="card small muted">FORMA prototip · Kulüp ve kişi isimleri kurgusaldır.</div>`);
  }

  /* =========================================================
     GELİŞTİRİCİ KONSOLU
     data-dev="<yol>" olan alanlar F.S içindeki o yolu doğrudan yazar (ör. P.money, P.attrs.hiz, rel.takim).
     ========================================================= */
  function getPath(o, p) { return p.split('.').reduce((x, k) => (x == null ? x : x[k]), o); }
  function setPath(o, p, v) { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((x, k) => (x[k] == null ? (x[k] = {}) : x[k]), o); t[last] = v; }
  const r2 = (v) => Math.round((+v || 0) * 100) / 100;
  function devNum(label, path, opt) {
    opt = opt || {};
    let v = getPath(F.S, path);
    if (v == null && opt.def != null) v = opt.def;
    return `<label class="devf"><span>${esc(label)}</span><input type="number" inputmode="decimal" data-dev="${path}" value="${r2(v)}"${opt.min != null ? ` min="${opt.min}"` : ''}${opt.max != null ? ` max="${opt.max}"` : ''} step="${opt.step || 1}"></label>`;
  }
  function devText(label, path) { return `<label class="devf"><span>${esc(label)}</span><input type="text" data-devt="${path}" value="${esc(getPath(F.S, path) || '')}"></label>`; }
  function devSel(id, opts, cur, extra) { return `<select id="${id}" ${extra || ''}>${opts.map(([v, n]) => `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`; }
  function devView() {
    const S = F.S, P = S.P;
    const tab = U.devTab;
    const tabs = [['oyuncu', 'Oyuncu'], ['yetenek', 'Yetenekler'], ['kariyer', 'Kariyer'], ['iliski', 'İlişkiler'], ['olay', 'Olaylar'], ['konsol', 'Konsol']];
    let body = '';
    if (tab === 'oyuncu') {
      const fm = F.teamFormation();
      body = `<div class="card stack" style="gap:8px"><div class="label">Para · ${F.money(P.money)}</div>${devNum('Bakiye (₺)', 'P.money', { step: 1000 })}
          <div class="row wrap">${[[1e4, '+10 B'], [1e6, '+1 Mn'], [1e8, '+100 Mn'], [1e9, '+1 Mr'], [-1e6, '−1 Mn']].map(([v, n]) => `<button class="pick" data-a="dev-money" data-v="${v}">${n}</button>`).join('')}<button class="pick" data-a="dev-money" data-v="zero">Sıfırla</button></div></div>
        <div class="card stack" style="gap:8px"><div class="label">Mevki</div>
          <label class="devf"><span>Ana mevki</span>${devSel('dev-role', Object.keys(D.roles).map((k) => [k, D.roles[k].name + ' (' + D.roles[k].short + ')']), P.role)}</label>
          <label class="devf"><span>Sahadaki mevki</span>${devSel('dev-playrole', [['', 'Ana mevkiyle aynı']].concat(Object.keys(D.roles).map((k) => [k, D.roles[k].name])), P.playRole || '')}</label>
          <label class="devf"><span>Takım dizilişi</span>${devSel('dev-formation', D.formations.map((f) => [f.id, f.id]), fm.id)}</label>
          <p class="tiny muted">Sahada: ${esc(D.roles[F.curRole()].name)} · uyum %${Math.round(F.roleFit(F.curRole()) * 100)} · güç ${F.ovr()}</p></div>
        <div class="card stack" style="gap:8px"><div class="label">Kimlik</div>${devText('Ad', 'P.name')}${devText('Soyad', 'P.surname')}${devNum('Yaş', 'P.age', { min: 14, max: 45 })}${devNum('Forma no', 'P.number', { min: 1, max: 99 })}${devNum('Potansiyel', 'P.pot', { min: 30, max: 99 })}${devNum('Takipçi', 'P.followers', { min: 0, step: 100 })}${devNum('Yabancı dil', 'P.dil', { min: 0, max: 100 })}${devNum('Kredi notu', 'P.credit', { min: 0, max: 100, def: 60 })}</div>
        <div class="card stack" style="gap:8px"><div class="label">Hayat</div>${['enerji', 'moral', 'mental', 'disiplin', 'sohret', 'saglik'].map((k) => devNum(D.lifeLabels[k], 'P.life.' + k, { min: 0, max: 100 })).join('')}${devNum('Form (−10…10)', 'P.life.form', { min: -10, max: 10, step: 0.5 })}
          <div class="row wrap"><button class="pick" data-a="dev-fill">Hepsini 100 yap</button><button class="pick" data-a="dev-heal" ${P.injury ? '' : 'disabled'}>Sakatlığı iyileştir${P.injury ? ' (' + P.injury.weeks + ' hf)' : ''}</button><button class="pick" data-a="dev-unsuspend" ${P.suspended ? '' : 'disabled'}>Cezayı kaldır${P.suspended ? ' (' + P.suspended + ')' : ''}</button></div></div>`;
    } else if (tab === 'yetenek') {
      body = `<div class="card stack" style="gap:8px"><div class="label">Toplu</div><div class="row wrap">${[['99', 'Hepsi 99'], ['+5', 'Hepsi +5'], ['+10', 'Hepsi +10'], ['-5', 'Hepsi −5'], ['50', 'Hepsi 50']].map(([v, n]) => `<button class="pick" data-a="dev-attrs" data-v="${v}">${n}</button>`).join('')}</div><p class="tiny muted">Güç: <b>${F.ovr()}</b> · ${esc(F.role().name)}</p></div>
        ${D.attrGroups.map((g) => `<div class="card stack" style="gap:6px"><div class="label">${esc(g.name)} · ${F.groupScore(g.id)}</div>${g.keys.map((k) => devNum(D.attrs[k], 'P.attrs.' + k, { min: 1, max: 99 })).join('')}</div>`).join('')}
        <div class="card stack" style="gap:6px"><div class="label">Kişisel yetenekler</div>${Object.keys(D.softs).map((k) => devNum(D.softs[k], 'P.soft.' + k, { min: 0, max: 99 })).join('')}</div>
        <div class="card stack" style="gap:6px"><div class="label">Kişilik puanları (3 ve üstü aktif)</div>${Object.keys(D.traits).map((k) => devNum(D.traits[k], 'P.traits.' + k, { min: 0, max: 10, step: 0.5 })).join('')}</div>`;
    } else if (tab === 'kariyer') {
      const comps = Object.values(S.world.comps).sort((a, b) => (a.c === 'TR' ? 0 : 1) - (b.c === 'TR' ? 0 : 1) || a.c.localeCompare(b.c) || a.tier - b.tier || a.g - b.g);
      const teamSel = `<select id="dev-team">${comps.map((c) => `<optgroup label="${esc(c.name + (c.gname ? ' · ' + c.gname : ''))}">${c.teams.map((id) => `<option value="${id}" ${id === P.contract.team ? 'selected' : ''}>${esc(F.team(id).name)} (${F.team(id).str})</option>`).join('')}</optgroup>`).join('')}</select>`;
      const flags = Object.keys(S.flags);
      body = `<div class="card stack" style="gap:8px"><div class="label">Sözleşme · ${esc(F.myTeam().name)}</div>${devNum('Haftalık maaş', 'P.contract.wage', { min: 0, step: 500 })}${devNum('Kalan yıl', 'P.contract.years', { min: 0, max: 10 })}
          <label class="devf"><span>Rol</span>${devSel('dev-crole', Object.keys(D.roleNames).map((k) => [k, D.roleNames[k]]), P.contract.role)}</label>
          <label class="devf"><span>Takım gücü</span><input type="number" data-dev="world.teams.${P.contract.team}.str" value="${F.myTeam().str}" min="1" max="99"></label></div>
        <div class="card stack" style="gap:8px"><div class="label">Transfer</div>${teamSel}<div class="row"><button class="btn sm grow" data-a="dev-transfer">Bu kulübe geç</button></div>
          <div class="row wrap"><span class="tiny muted grow">Teklif getir:</span><button class="pick" data-a="dev-offers" data-v="">Rastgele</button><button class="pick" data-a="dev-offers" data-v="up">Üst lig</button><button class="pick" data-a="dev-offers" data-v="abroad">Yurt dışı</button></div></div>
        <div class="card stack" style="gap:8px"><div class="label">Zaman · Sezon ${S.season}, hafta ${S.week}, tur ${S.league.round}/${F.seasonRounds()}</div>${devNum('Yıl', 'year', { min: 1950, max: 2200 })}
          <div class="row wrap"><button class="pick" data-a="dev-endseason">Sezonu bitir (kalan maçlar simüle)</button><button class="pick" data-a="dev-clearq" ${S.queue.length ? '' : 'disabled'}>Bekleyen adımları temizle (${S.queue.length})</button></div>
          <div class="row wrap"><button class="pick" data-a="dev-flagtog" data-v="kaptan">${S.flags.kaptan ? 'Kaptanlığı al' : 'Kaptan yap'}</button><button class="pick" data-a="dev-retire">Emekliliğe geç</button></div></div>
        <div class="card stack" style="gap:8px"><div class="label">Bayraklar (hikâye durumu)</div><div class="row wrap">${flags.length ? flags.map((f) => `<button class="pick" data-a="dev-flagtog" data-v="${esc(f)}" title="Kaldır">${esc(f)} ✕</button>`).join('') : '<span class="tiny muted">Bayrak yok</span>'}</div>
          <div class="row"><input type="text" id="dev-flag" placeholder="bayrak adı"><button class="btn alt sm" data-a="dev-flagadd">Ekle</button></div></div>`;
    } else if (tab === 'iliski') {
      const people = Object.keys(S.roles).filter((r) => S.npcs[S.roles[r]]);
      body = `<div class="card stack" style="gap:6px"><div class="label">Genel ilişkiler (−100…100)</div>${['takim', 'medya', 'aile', 'taraftar', 'memleket'].map((k) => devNum(D.relLabels[k], 'rel.' + k, { min: -100, max: 100 })).join('')}</div>
        <div class="card stack" style="gap:6px"><div class="label">Kişiler</div>${people.map((r) => { const n = S.npcs[S.roles[r]]; return devNum((D.relLabels[r] || r) + ' · ' + n.name, 'npcs.' + n.id + '.rel', { min: -100, max: 100 }); }).join('')}</div>
        <div class="card stack" style="gap:8px"><div class="label">Partner ve aile</div><label class="devf"><span>Partner</span>${devSel('dev-pstage', [[0, 'Yok'], [1, 'Flört'], [2, 'Sevgili'], [3, 'Nişanlı'], [4, 'Evli']], S.partner ? S.partner.stage : 0)}</label>
          <div class="row wrap"><button class="pick" data-a="dev-kid">Çocuk ekle (${S.kids.length})</button>${S.agent ? '' : '<button class="pick" data-a="dev-agent">Menajer tut</button>'}</div></div>`;
    } else if (tab === 'olay') {
      const q = U.devQ.toLocaleLowerCase('tr');
      const list = D.events.filter((e) => !q || e.id.toLowerCase().includes(q) || String(e.t || (e.nodes && e.nodes.start && e.nodes.start.t) || '').toLocaleLowerCase('tr').includes(q)).slice(0, 40);
      body = `<div class="card stack" style="gap:8px"><input type="text" id="dev-evq" placeholder="Olay ara (id ya da metin)" value="${esc(U.devQ)}"><p class="tiny muted">${D.events.length} olay. Tetiklediğin olay koşullarına bakılmadan hemen açılır.</p></div>
        <div class="card list">${list.map((e) => { const t = e.t || (e.nodes && e.nodes.start && e.nodes.start.t) || ''; return `<div class="li"><div class="grow"><b class="small">${esc(e.id)}</b><div class="tiny muted">${esc(F.tpl(t).slice(0, 110))}</div></div><button class="btn alt sm" data-a="dev-event" data-v="${esc(e.id)}">Tetikle</button></div>`; }).join('') || '<p class="small muted">Eşleşen olay yok.</p>'}</div>`;
    } else {
      if (U.devJson == null) U.devJson = JSON.stringify(U.devScope === 'S' ? S : P, null, 1);
      body = `<div class="card stack" style="gap:8px"><div class="label">Komut</div><p class="tiny muted"><code>F</code> motor, <code>S</code> durum, <code>P</code> oyuncu, <code>D</code> veri. Ör: <code>P.money = 5e8</code> · <code>F.setRole('SF')</code> · <code>F.injure(3)</code></p>
          <div class="row"><input type="text" id="dev-cmd" class="mono" placeholder="P.attrs.hiz = 99" value="${esc(U.devCmd)}" autocapitalize="off" spellcheck="false"><button class="btn sm" data-a="dev-eval">Çalıştır</button></div>
          ${U.devLog.length ? `<pre class="devlog">${U.devLog.slice(-8).map((l) => `<span class="${l.err ? 'err' : ''}">› ${esc(l.c)}\n${esc(l.r)}</span>`).join('\n')}</pre>` : ''}</div>
        <div class="card stack" style="gap:8px"><div class="row"><div class="label grow">Ham durum (JSON)</div><div class="seg" style="min-width:170px">${[['P', 'Oyuncu'], ['S', 'Tüm oyun']].map(([k, n]) => `<button class="${U.devScope === k ? 'on' : ''}" data-a="dev-scope" data-v="${k}">${n}</button>`).join('')}</div></div>
          <textarea id="dev-json" class="mono" spellcheck="false" style="min-height:300px;font-size:11px">${esc(U.devJson)}</textarea>
          <div class="row"><button class="btn alt sm grow" data-a="dev-jsonreload">Yeniden oku</button><button class="btn sm grow" data-a="dev-jsonapply">Uygula</button></div>
          <p class="tiny muted">Uygula, ${U.devScope === 'S' ? 'oyunun tüm durumunu' : 'oyuncu nesnesini'} bu JSON ile değiştirir. Bozuk JSON uygulanmaz.</p></div>`;
    }
    return appShell('Geliştirici', `<div class="tabs">${tabs.map(([k, n]) => `<button class="pick ${tab === k ? 'on' : ''}" data-a="dev-tab" data-v="${k}">${n}</button>`).join('')}</div>${body}`);
  }
  function devAfter() { const P = F.S.P; P.peak = Math.max(P.peak || 0, F.ovr()); }

  /* =========================================================
     EYLEMLER
     ========================================================= */
  function afterStep() {
    F.processAuto();
    U.post = { photo: null, tone: null };
  }
  const A = {
    'to-start': () => { U.view = 'start'; },
    howto: () => { U.howto = !U.howto; },
    'start-new': () => { U.view = 'create'; U.create = { origin: null, pos: null, role: null, spot: null, name: '', surname: '', look: newLook(), number: 10 }; },
    'c-look': () => { readNames(); U.create.look = newLook(); },
    lk: (v, w) => { readNames(); editLook(v, w); },
    'edit-look': () => { U.editLook = !U.editLook; },
    'c-num': (v) => { readNames(); U.create.number = +v; },
    continue: () => { if (loadSave()) { U.view = 'game'; U.app = null; F.dailyCheck(new Date().toDateString()); F.processAuto(); } },
    'c-origin': (v) => { readNames(); if (U.create.origin !== v) U.create.alloc = {}; U.create.origin = v; },
    'c-pos': (v) => { readNames(); U.create.pos = v; },
    'al-add': (v) => { readNames(); const c = U.create; const pool = D.originPoints[c.origin] || 20; const used = Object.values(c.alloc || {}).reduce((a, b) => a + b, 0); c.alloc = c.alloc || {}; if (used < pool && (c.alloc[v] || 0) < D.allocMax) c.alloc[v] = (c.alloc[v] || 0) + 1; },
    'al-sub': (v) => { readNames(); const c = U.create; if (c.alloc && c.alloc[v]) { c.alloc[v]--; if (!c.alloc[v]) delete c.alloc[v]; } },
    'al-reset': () => { readNames(); U.create.alloc = {}; },
    'al-more': () => { readNames(); U.create.allMore = !U.create.allMore; },
    // önerilen dağıtım: mevkinin ağırlıklarına göre, en önemli yeteneklere daha çok
    'al-auto': () => {
      readNames();
      const c = U.create; const pool = D.originPoints[c.origin] || 20; const w = D.roles[c.role].w;
      const keys = Object.keys(w).sort((a, b) => w[b] - w[a]);
      const tot = keys.reduce((a, k) => a + w[k], 0);
      const al = {}; let left = pool;
      keys.forEach((k) => { const n = Math.min(D.allocMax, Math.floor(pool * w[k] / tot)); al[k] = n; left -= n; });
      for (let i = 0; left > 0 && i < 200; i++) { const k = keys[i % keys.length]; if (al[k] < D.allocMax) { al[k]++; left--; } }
      Object.keys(al).forEach((k) => { if (!al[k]) delete al[k]; });
      c.alloc = al;
    },
    'pm-pick': (v, w) => {
      if (w === 'create') readNames();
      const st = fmState(w);
      st.role = v;
      if (w === 'create' && v !== 'KL' && st.alloc) D.keeperAttrs.forEach((k) => delete st.alloc[k]);
      if (w === 'create' && v === 'KL' && st.alloc) Object.keys(st.alloc).forEach((k) => { if (!D.keeperAttrs.includes(k) && !D.roles.KL.w[k]) delete st.alloc[k]; });
      if (w === 'create') { st.pos = D.roles[v].grp; const nums = { KL: 1, STP: 4, SLB: 3, SGB: 2, DOS: 6, MO: 8, OOS: 10, SLO: 11, SGO: 7, SLK: 11, SGK: 7, SF: 9 }; st.number = nums[v] || st.number; }
      if (w === 'heir') U.heirPos = v;
    },
    'fm-pick': (v, w) => { if (w === 'create') readNames(); const st = fmState(w); st.formation = v; st.spot = null; st.role = null; },
    'fm-spot': (v, w) => {
      if (w === 'create') readNames();
      const st = fmState(w);
      const fm = D.formations.find((f) => f.id === st.formation) || D.formations[0];
      st.spot = +v; st.role = fm.spots[+v][2];
      if (w === 'create') { st.pos = D.roles[st.role].grp; const nums = { KL: 1, STP: 4, SLB: 3, SGB: 2, SLKB: 3, SGKB: 2, DOS: 6, MO: 8, OOS: 10, SLO: 11, SGO: 7, SLK: 11, SGK: 7, SF: 9, IF: 10 }; st.number = nums[st.role] || st.number; }
      if (w === 'heir') U.heirPos = st.role;
    },
    'pos-edit': () => { U.posEdit = !U.posEdit; U.prof = { formation: F.S.P.formation || '4-4-2', spot: null, role: null }; },
    'role-apply': () => {
      const S = F.S, st = U.prof;
      if (!st || !st.role || S.roleChange === S.season) return;
      const oldGrp = S.P.pos;
      F.setRole(st.role); S.roleChange = S.season; S.order = F.makeOrder();
      F.fx({ form: -1, 'r.hoca': oldGrp === S.P.pos ? 1 : -3 });
      F.addAlbum('Mevki değişikliği: artık ' + F.role().name.toLowerCase() + ' oynuyorsun.', 'event');
      U.posEdit = false; toast('Yeni mevkin: ' + F.role().name);
    },
    'm-skip': () => { U.flowSkip = true; },
    'c-rand': () => {
      const S0 = F.S;
      F.S = { rng: Math.floor(Math.random() * 1e9) };
      U.create.name = F.maleName(); U.create.surname = F.surname();
      F.S = S0;
    },
    'c-go': () => {
      readNames();
      const c = U.create;
      if (!c.origin || !c.role) return;
      const ogx = D.origins.find((x) => x.id === c.origin);
      if (ogx && ogx.pickClub && !c.club) return;
      const S0 = { rng: Math.floor(Math.random() * 1e9) };
      F.S = S0;
      F.newGame({ origin: c.origin, pos: D.roles[c.role].grp, role: c.role, seed: c.seed, club: c.club, alloc: c.alloc, home: D.homePlaces.some((pl) => pl.name === c.home) ? c.home : null, name: c.name.trim() || F.maleName(), surname: c.surname.trim() || F.surname(), look: c.look, number: c.number });
      U.view = 'game'; U.app = null; U.goalSel = [];
      F.processAuto();
    },
    open: (v) => { U.app = v; U.tab = null; U.confirm = null; U.thread = null; },
    back: () => { U.app = null; U.confirm = null; },
    tab: (v) => { U.tab = v; },
    'plan-train': (v) => { F.S.plan.train = v; },
    'upd-check': () => { checkUpdate(false); },
    'upd-run': () => { runUpdate(); },
    'loan-amt': (v) => { U.loanAmt = +v; },
    'loan-term': (v) => { U.loanTerm = +v; },
    'loan-take': () => { const lim = F.loanLimit(); const amts = [0.25, 0.5, 1].map((x) => Math.round(lim * x / 1000) * 1000); const r = F.takeLoan(amts[U.loanAmt == null ? 1 : U.loanAmt], U.loanTerm == null ? 1 : U.loanTerm); toast(r.err || 'Kredi hesabına yattı: ' + F.money(r.q.amount)); },
    'loan-pay': () => { const r = F.payoffLoan(); toast(r.err || 'Kredi kapandı. Kredi notun yükseldi.'); },
    thread: (v) => { U.thread = v; },
    'lg-tab': (v) => { U.lgTab = v; },
    'thread-close': () => { U.thread = null; U.threadScrolled = null; },
    'sub-buy': (v, w) => { const r = F.buySub(v, +w); toast(r.err || 'Kayıt oldun: ' + r.msg); },
    convo: (v, w) => { F.convoReply(+v, +w); },
    'c-club': (v) => { readNames(); U.create.club = v; },
    'train-cat': (v) => { U.trainCat = v; },
    'plan-load': (v) => { F.S.plan.load = v; },
    'plan-act': (v) => { const a = F.S.plan.acts; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else if (a.length < F.slots()) a.push(v); },
    'week-start': () => { U.app = null; F.beginWeek(); },
    'goal-toggle': (v) => { const i = U.goalSel.indexOf(v); if (i >= 0) U.goalSel.splice(i, 1); else if (U.goalSel.length < 3) U.goalSel.push(v); },
    'goals-ok': () => { F.chooseGoals(U.goalSel); U.goalSel = []; F.advance(); afterStep(); },
    'ev-opt': (v) => { F.choose(+v); },
    'ev-next': () => { F.advance(); afterStep(); },
    call: (v) => { F.answerCall(v === '1'); },
    'm-opt': (v) => {
      F.matchChoose(+v);
    },
    'm-speech': (v) => { const d = F.halftimeSpeech(v); toast(v === 'sakin' ? 'Takım sakinleşti.' : v === 'atesli' ? 'Soyunma odası alev aldı!' : 'Sert sözler herkesi sarstı.'); },
    'm-finish': () => { F.matchFinish(); },
    'press-opt': (v) => { F.pressAnswer(+v); },
    'post-photo': (v) => { U.post.photo = v; },
    like: (v) => {
      const r = F.likePost(v);
      if (!r) return;
      const parts = [r.gain ? '+' + F.num(r.gain) + ' takipçi' : r.capped ? 'bu hafta beğenilerden yeterince takipçi kazandın' : ''];
      (r.effects || []).forEach((e) => parts.push(e.who + ' ' + (e.v > 0 ? '+' : '') + e.v + (e.t ? ' (' + e.t + ')' : '')));
      if (r.noticed) parts.push('gördü ve sana yazdı');
      toast('Beğendin' + (parts.filter(Boolean).length ? ' · ' + parts.filter(Boolean).join(' · ') : ''));
    },
    'cmt-open': (v) => { U.cmt = v; U.cmtText = ''; setTimeout(() => { const ta = document.getElementById('cmt-text'); if (ta) ta.focus(); }, 30); },
    'cmt-cancel': () => { U.cmt = null; },
    'snd-toggle': () => { const c = F.SND.get(); F.SND.set({ on: !c.on }); if (!c.on) { F.SND.unlock(); F.SND.play('whistle'); } },
    'snd-test': () => { F.SND.unlock(); F.SND.play('goal'); },
    'tac-choose': (v) => { F.tacticChoose(+v); },
    'cmt-send': () => {
      const ta = document.getElementById('cmt-text');
      const r = F.commentPost(U.cmt, ta ? ta.value : U.cmtText || '');
      if (r.err) { toast(r.err); return; }
      U.cmt = null; U.cmtText = '';
      const eff = F.mergeDeltas(r.deltas || []).filter((d) => !d.trait && d.k && d.k.indexOf('r.') === 0).map((d) => d.label + ' ' + (d.v > 0 ? '+' : '') + Math.round(d.v));
      toast(r.r + (eff.length ? ' ' + eff.join(' · ') : ''));
    },
    'post-tone': (v) => { U.post.tone = v; },
    'post-send': () => {
      const st = F.S.queue[0];
      const txt = (U.post.text || '').trim();
      const r = txt.length >= 3 ? F.makeCustomPost(U.post.photo || 'mac', txt) : F.makePost(U.post.photo || 'mac', U.post.tone);
      if (r.err) { toast(r.err); return; }
      if (st && st.type === 'post') st.result = r;
      else { toast(r.r); U.app = 'tribun'; U.tab = 'akis'; }
      U.post = { photo: null, tone: null, text: '' };
    },
    'post-open': () => { F.S.queue.unshift({ type: 'post' }); U.app = null; },
    'chat-say': (v) => {
      const S = F.S;
      if (S.chatSaid === S.t) { toast('Bu hafta gruba zaten yazdın.'); return; }
      const t = ['Hayırlı haftalar beyler 💪', 'Akşam halı saha var mı?', 'Hoca bugün sert, dikkat 😅'][+v];
      F.addChat(S.P.name + ' ' + S.P.surname, t); S.unread.chat = 0; S.chatSaid = S.t; F.fx({ 'r.takim': 1, 's.sosyallik': 0.3 });
      if (F.chance(0.6)) F.addChat(F.npc('kanka').name, F.pick(['😂😂', 'Varım kanka!', 'Aynen', 'Kaptan izliyor haberiniz olsun']));
    },
    'off-nego': (v) => { const o = F.S.offers[+v]; U.nego = { i: +v, wageMul: 1.15, years: o.years, signing: 0.1, guarantee: false, appB: 0, goalB: 0, assistB: 0, msg: null }; },
    'nego-close': () => { U.nego = null; },
    'nego-send': () => {
      const n = U.nego;
      const r = F.negotiate(n.i, { wageMul: n.wageMul, years: n.years, guarantee: n.guarantee, signing: n.signing, appB: n.appB || 0, goalB: n.goalB || 0, assistB: n.assistB || 0 });
      if (!r) return;
      if (r.status === 'walk') { U.nego = null; toast(r.msg); return; }
      if (r.status === 'counter') { Object.assign(n, r.counter); }
      n.msg = r.msg;
    },
    'off-accept': (v) => {
      const S = F.S;
      const o = S.offers[+v];
      const name = F.team(o.team).name;
      const d = F.acceptOffer(+v);
      U.nego = null;
      toast(o.renew ? 'Sözleşme yenilendi.' : 'İmza atıldı: ' + name);
      F.advance(); afterStep();
    },
    'off-stay': () => { F.S.offers = []; U.nego = null; F.advance(); afterStep(); },
    'off-free': () => { const P = F.S.P; P.contract.years = 1; P.contract.wage = Math.round(P.contract.wage * 0.6); P.contract.role = 'yedek'; F.advance(); afterStep(); },
    retire: (v) => { F.retireDecision(v === '1'); },
    'heir-pos': (v) => { U.heirPos = v; },
    heir: (v) => { F.chooseHeir(+v, U.heirPos); U.app = null; F.processAuto(); toast('Yeni nesil başlıyor.'); },
    'end-game': () => { F.chooseHeir('end'); },
    'new-career-now': () => { store.del(KEY); F.S = null; U.view = 'create'; U.app = null; U.confirm = null; U.create = { origin: null, pos: null, name: '', surname: '' }; },
    shopcat: (v) => { U.shopCat = v; },
    buy: (v) => { const r = F.buy(v); toast(r.err || r.r); },
    sell: (v) => { const r = F.sell(v); toast(r.err || r.r); },
    req: (v, w) => { const r = F.reqAnswer(+v, w === '1'); if (r) toast(r.err || r.r); },
    routine: (v, w) => { F.S.P.routine[v] = w; },
    confirm: (v) => { U.confirm = v; },
    'confirm-no': () => { U.confirm = null; },
    'fire-agent': () => { F.fireAgent(); U.confirm = null; toast('Menajerinle yollarını ayırdın.'); },
    theme: (v) => { store.set('forma.theme', v); applyTheme(); },
    export: () => { U.code = F.exportCode(); },
    copy: () => {
      const ta = document.getElementById('code');
      const done = () => toast('Kod kopyalandı.');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(U.code).then(done, () => { ta.select(); toast('Kodu seçtim, elle kopyala.'); });
      else { ta.select(); toast('Kodu seçtim, elle kopyala.'); }
    },
    import: () => {
      const v = document.getElementById('code').value;
      try { F.importCode(v); applyEdits(); U.importMsg = 'Kayıt yüklendi.'; U.app = null; U.view = 'game'; F.processAuto(); }
      catch (e) { U.importMsg = 'Kod okunamadı. Kodun tamamını yapıştırdığından emin ol.'; }
    },

    /* ---------- Anahtar ---------- */
    'key-open': () => { U.keyFrom = U.view === 'game' ? 'game' : 'start'; U.view = 'key'; U.keyUi = { stage: 'enter', input: '', msg: '', busy: false, remote: null }; U.importMsg = ''; },
    'key-back': () => { U.view = U.keyFrom === 'game' && F.S && F.S.P ? 'game' : 'start'; },
    'key-reset': () => { U.keyUi = { stage: 'enter', input: U.keyUi.input, msg: '', busy: false, remote: null }; },
    'key-login': () => {
      const K = U.keyUi;
      const el = document.getElementById('key-in');
      const k = (el ? el.value : K.input).trim();
      K.input = k;
      if (k.length < 4) { K.msg = 'Anahtar en az 4 karakter olmalı.'; return; }
      K.busy = true; K.msg = '';
      cloudFetch(k).then((r) => { K.remote = r; K.stage = r.exists ? 'found' : 'empty'; })
        .catch(() => { K.msg = 'Buluta ulaşılamadı. Bağlantını kontrol edip tekrar dene.'; })
        .finally(() => { K.busy = false; if (U.view === 'key') render(); });
    },
    'key-load': () => {
      const K = U.keyUi;
      try {
        F.load(K.remote.json); applyEdits();
        cloud.key = K.input; store.set('forma.key', K.input); cloud.lastPushed = K.remote.json;
        lastLocal = null;
        U.view = 'game'; U.app = null; F.processAuto();
        toast('Kariyer yüklendi: ' + K.remote.name);
      } catch (e) { K.msg = 'Buluttaki kayıt okunamadı.'; K.stage = 'enter'; }
    },
    'key-bind': () => {
      const K = U.keyUi;
      cloud.key = K.input; store.set('forma.key', K.input); cloud.lastPushed = null;
      if (!(F.S && F.S.P)) loadSave();
      if (F.S && F.S.P) { cloudPush(); U.view = 'game'; U.app = null; F.processAuto(); toast('Kariyerin bu anahtara bağlandı.'); }
      else U.view = 'start';
    },
    'key-new': () => {
      const K = U.keyUi;
      cloud.key = K.input; store.set('forma.key', K.input); cloud.lastPushed = null;
      store.del(KEY); lastLocal = null; F.S = null;
      U.view = 'create'; U.app = null; U.create = { origin: null, pos: null, role: null, spot: null, name: '', surname: '', look: newLook(), number: 10 };
    },
    'key-logout': () => { cloudPush(); cloud.key = null; store.del('forma.key'); cloud.status = ''; toast('Anahtardan çıktın. Kayıt bu cihazda kalmaya devam ediyor.'); },
    'cloud-now': () => { cloud.lastPushed = null; cloudPush(); },

    /* ---------- Geliştirici ---------- */
    'dev-toggle': () => { store.set('forma.dev', devOn() ? '0' : '1'); toast(devOn() ? 'Geliştirici modu açıldı.' : 'Geliştirici modu kapandı.'); },
    'dev-tab': (v) => { U.devTab = v; if (v === 'konsol') U.devJson = null; },
    'dev-money': (v) => { const P = F.S.P; if (v === 'zero') P.money = 0; else { P.money += +v; F.bankLog('Geliştirici', +v); } },
    'dev-fill': () => { const L = F.S.P.life; ['enerji', 'moral', 'mental', 'disiplin', 'saglik'].forEach((k) => (L[k] = 100)); L.form = 10; },
    'dev-heal': () => { F.S.P.injury = null; },
    'dev-unsuspend': () => { F.S.P.suspended = 0; },
    'dev-attrs': (v) => { const a = F.S.P.attrs; Object.keys(a).forEach((k) => { a[k] = F.clamp(v[0] === '+' || v[0] === '-' ? a[k] + +v : +v, 1, 99); }); devAfter(); },
    'dev-transfer': () => {
      const id = document.getElementById('dev-team').value;
      const S = F.S, P = S.P;
      if (!id || id === P.contract.team) return;
      const ti = F.tierOf(id);
      F.transfer(id, { wage: F.wageFor(ti.c, ti.t, F.team(id).str, F.ovr()), years: 3, role: F.ovr() >= F.team(id).str - 2 ? 'as' : 'rotasyon' });
      P.playRole = null; S.tempRole = null; F.checkRoleFit(true);
      toast('Yeni kulüp: ' + F.myTeam().name);
    },
    'dev-offers': (v) => { const S = F.S; S.offers = F.genOffers('ozel', v || undefined); if (!S.offers.length) { toast('Uygun teklif çıkmadı.'); return; } S.queue.unshift({ type: 'offers', window: 'ozel' }); U.app = null; },
    'dev-endseason': () => {
      const S = F.S, L = S.league;
      while (L.round < F.seasonRounds()) { L.fixtures[L.round].forEach(([h, a]) => { const [x, y] = F.simScore(h, a); F.addResult(L.table, h, a, x, y); }); L.round++; }
      S.queue = [{ type: 'seasonEndAuto' }]; S.wk = null; F.processAuto(); U.app = null;
    },
    'dev-clearq': () => { F.S.queue = []; F.S.wk = null; },
    'dev-retire': () => { F.S.queue.unshift({ type: 'retire', forced: false }); U.app = null; },
    'dev-flagtog': (v) => { const f = F.S.flags; if (f[v]) delete f[v]; else f[v] = 1; },
    'dev-flagadd': () => { const el = document.getElementById('dev-flag'); const v = el && el.value.trim(); if (v) F.S.flags[v] = 1; },
    'dev-kid': () => { F.haveKid(); },
    'dev-agent': () => { F.hireAgent(3); },
    'dev-event': (v) => { const st = F.makeEventStep(v); st.forced = true; F.S.queue.unshift(st); U.app = null; },
    'dev-scope': (v) => { U.devScope = v; U.devJson = null; },
    'dev-jsonreload': () => { U.devJson = null; },
    'dev-jsonapply': () => {
      const txt = document.getElementById('dev-json').value;
      let o;
      try { o = JSON.parse(txt); } catch (e) { toast('JSON bozuk: ' + e.message); U.devJson = txt; return; }
      try {
        if (U.devScope === 'S') F.load(o); else { const keep = F.S.P; F.S.P = o; try { F.ovr(); } catch (e2) { F.S.P = keep; throw e2; } }
        devAfter(); U.devJson = null; toast('Uygulandı.');
      } catch (e) { toast('Uygulanamadı: ' + e.message); U.devJson = txt; }
    },
    'dev-eval': () => {
      const el = document.getElementById('dev-cmd');
      const code = (el ? el.value : U.devCmd).trim();
      U.devCmd = code;
      if (!code) return;
      const S = F.S;
      let res, err = false;
      try {
        let fn;
        try { fn = new Function('F', 'S', 'P', 'D', 'return (' + code + '\n)'); } catch (e) { fn = new Function('F', 'S', 'P', 'D', code); }
        res = fn(F, S, S && S.P, D);
        try { res = res === undefined ? 'undefined' : typeof res === 'string' ? res : JSON.stringify(res, null, 1); } catch (e) { res = String(res); }
        if (res && res.length > 1500) res = res.slice(0, 1500) + '…';
        if (F.S && F.S.P) devAfter();
      } catch (e) { res = e.message; err = true; }
      U.devLog.push({ c: code, r: res, err });
      if (U.devLog.length > 30) U.devLog.shift();
      if (!err) U.devCmd = '';
    }
  };
  /* ---------- Karakter düzenleyici (Stardew usulü) ---------- */
  function lookEditor(look, kit, number, numId, surname) {
    const O = F.ART.OPTS;
    look = look || {};
    const sw = (field, colors, cur, withNone) => `<div class="swatches">${withNone ? `<button class="sw none ${cur == null ? 'on' : ''}" data-a="lk" data-v="${field}" data-w="none" aria-label="Yok">✕</button>` : ''}${colors.map((col, i) => `<button class="sw ${cur === i ? 'on' : ''}" style="background:${col}" data-a="lk" data-v="${field}" data-w="${i}" aria-label="${field} ${i + 1}"></button>`).join('')}</div>`;
    const step = (field, list, cur, label) => {
      const idx = Math.max(0, list.findIndex((x) => x[0] === cur));
      return `<div class="stepper"><span class="small muted">${label}</span><div class="row" style="gap:6px"><button class="arrow" data-a="lk" data-v="${field}" data-w="prev" aria-label="${label} önceki">‹</button><b class="small stepval">${esc(list[idx][1])}</b><button class="arrow" data-a="lk" data-v="${field}" data-w="next" aria-label="${label} sonraki">›</button></div></div>`;
    };
    return `<div class="card stack editor" style="gap:12px">
      <div class="row" style="gap:12px;align-items:center;justify-content:center">
        <div class="av xl" style="background:linear-gradient(160deg, #cfe7d8, #7fb59a)">${F.ART.face('onizleme', { look, kit, female: false, mood: 'happy' })}</div>
        <div class="stack" style="align-items:center;gap:6px">${F.ART.jersey(kit[0], kit[1], number || '', surname, 92)}
          <label class="row small" for="${numId}" style="gap:6px"><span class="muted">No</span><input type="number" id="${numId}" class="numin" min="1" max="99" inputmode="numeric" value="${number || ''}" aria-label="Forma numarası"></label></div>
      </div>
      <div class="stack" style="gap:6px"><span class="small muted">Ten rengi</span>${sw('skin', O.skin, look.skin)}</div>
      ${step('style', O.style, look.style, 'Saç modeli')}
      <div class="stack" style="gap:6px"><span class="small muted">Saç ve sakal rengi</span>${sw('hair', O.hair, look.hair)}</div>
      ${step('beard', O.beard, look.beard || 'none', 'Sakal')}
      ${step('brow', O.brow, look.brow || 0, 'Kaşlar')}
      <div class="stack" style="gap:6px"><span class="small muted">Göz rengi</span>${sw('eye', O.eye, look.eye || 0)}</div>
      <div class="stack" style="gap:6px"><span class="small muted">Bandana</span>${sw('band', O.band, look.band, true)}</div>
      <button class="btn alt sm" data-a="lk" data-v="random" style="align-self:center">Rastgele görünüm</button>
    </div>`;
  }
  function editLook(field, val) {
    const look = U.view === 'create' ? U.create.look : F.S.P.look || (F.S.P.look = {});
    if (field === 'random') { const l = newLook(); Object.assign(look, l, { band: look.band, eye: look.eye }); return; }
    const O = F.ART.OPTS;
    if (field === 'style' || field === 'beard' || field === 'brow') {
      const list = O[field];
      const cur = look[field] == null ? list[0][0] : look[field];
      let i = list.findIndex((x) => x[0] === cur);
      i = (i + (val === 'prev' ? -1 : 1) + list.length) % list.length;
      look[field] = list[i][0];
      return;
    }
    look[field] = val === 'none' ? null : +val;
  }
  function fmState(w) { if (w === 'create') return U.create; if (w === 'heir') return (U.heirFm = U.heirFm || { formation: '4-4-2', spot: null, role: null }); return (U.prof = U.prof || { formation: '4-4-2', spot: null, role: null }); }
  function newLook() {
    const S0 = F.S;
    F.S = { rng: Math.floor(Math.random() * 1e9) };
    const l = F.ART.randomLook(false);
    F.S = S0;
    return l;
  }
  const KEEP = new Set(['lg-tab', 'al-add', 'al-sub', 'al-reset', 'al-more', 'al-auto', 'upd-check', 'upd-run', 'pm-pick', 'like', 'loan-amt', 'loan-term', 'sub-buy', 'convo', 'c-club', 'train-cat', 'fm-pick', 'fm-spot', 'pos-edit', 'lk', 'edit-look', 'c-look', 'c-num', 'plan-train', 'plan-load', 'plan-act', 'goal-toggle', 'post-photo', 'post-tone', 'buy', 'sell', 'req', 'routine', 'tab', 'shopcat', 'chat-say', 'c-origin', 'c-pos', 'confirm', 'confirm-no', 'theme', 'export', 'heir-pos', 'cloud-now', 'dev-toggle', 'dev-money', 'dev-fill', 'dev-heal', 'dev-unsuspend', 'dev-attrs', 'dev-transfer', 'dev-clearq', 'dev-flagtog', 'dev-flagadd', 'dev-kid', 'dev-agent', 'dev-scope', 'dev-jsonreload', 'dev-jsonapply', 'dev-eval']);
  function readNames() {
    const n = document.getElementById('c-name'), s = document.getElementById('c-sur');
    if (n) U.create.name = n.value;
    if (s) U.create.surname = s.value;
    const h = document.getElementById('c-home');
    if (h) U.create.home = h.value.trim();
  }

  // fare tekerleği yatay şeritleri de kaydırsın (formasyon kartları, antrenman grupları, tablolar)
  document.addEventListener('wheel', (e) => {
    const el = e.target.closest && e.target.closest('.fmrow, .scroll-x');
    if (!el || el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    el.scrollLeft += e.deltaY;
    e.preventDefault();
  }, { passive: false });
  // oyun açılınca günde bir kez sessizce yeni sürüm var mı bakılır
  setTimeout(() => { try { if (store.get('forma.updCheck') !== new Date().toDateString()) checkUpdate(true); } catch (e) { /* çevrimdışı */ } }, 2500);
  app.addEventListener('click', (e) => {
    if (F.SND) F.SND.unlock(); // tarayıcılar sesi ancak bir dokunuştan sonra açar
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const a = b.dataset.a;
    if (!A[a]) return;
    try { A[a](b.dataset.v, b.dataset.w); }
    catch (err) { console.error(err); toast('Bir hata oldu: ' + err.message); }
    render(KEEP.has(a));
  });
  app.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.team) { F.renameTeam(t.dataset.team, t.value); save(); toast('Takım adı kaydedildi.'); }
    if (t.id === 'lg-sel') { U.leagueKey = t.value; render(); }
    // geliştirici konsolu alanları
    if (!(F.S && F.S.P)) return;
    let devChanged = true;
    try {
      if (t.dataset && t.dataset.dev) { if (t.value === '' || isNaN(+t.value)) { render(true); return; } setPath(F.S, t.dataset.dev, +t.value); }
      else if (t.dataset && t.dataset.devt) setPath(F.S, t.dataset.devt, t.value);
      else if (t.id === 'dev-role') { F.setRole(t.value); F.S.order = F.makeOrder(); }
      else if (t.id === 'dev-playrole') { F.S.P.playRole = t.value || null; F.S.tempRole = null; }
      else if (t.id === 'dev-formation') { F.myTeam().formation = t.value; F.S.P.playRole = null; F.checkRoleFit(true); }
      else if (t.id === 'dev-crole') F.S.P.contract.role = t.value;
      else if (t.id === 'dev-pstage') {
        const st = +t.value, S = F.S;
        if (!st) { if (S.partner) F.breakup(); }
        else { if (!S.partner) F.startPartner('arkadas'); S.partner.stage = st; S.partner.since = S.t; }
      } else devChanged = false;
    } catch (err) { toast('Değiştirilemedi: ' + err.message); }
    if (devChanged) { devAfter(); render(true); }
  });
  app.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'dev-cmd') { e.preventDefault(); A['dev-eval'](); render(true); }
    else if (e.target.id === 'key-in') { e.preventDefault(); A['key-login'](); render(true); }
  });
  app.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'cmt-text') { U.cmtText = t.value; return; }
    if (t.id === 'snd-vol') { F.SND.set({ vol: +t.value }); const v = document.getElementById('snd-vol-v'); if (v) v.textContent = t.value; return; }
    if (t.id === 'c-numin' || t.id === 'p-numin') {
      const n = Math.max(1, Math.min(99, parseInt(t.value, 10) || 0));
      if (!t.value) return;
      if (String(n) !== t.value) t.value = n;
      if (t.id === 'c-numin') U.create.number = n; else { F.S.P.number = n; save(); }
      const txt = app.querySelector('.editor svg text:last-of-type');
      if (txt) txt.textContent = n;
      return;
    }
    if (t.id === 'key-in') { U.keyUi.input = t.value; return; }
    if (t.id === 'dev-cmd') { U.devCmd = t.value; return; }
    if (t.id === 'dev-evq') {
      U.devQ = t.value;
      const pos = t.selectionStart;
      render(true);
      const n = document.getElementById('dev-evq');
      if (n) { n.focus(); n.setSelectionRange(pos, pos); }
      return;
    }
    if (t.id === 'rn-q') {
      U.renameQ = t.value;
      const pos = t.selectionStart;
      render(true);
      const n = document.getElementById('rn-q');
      if (n) { n.focus(); n.setSelectionRange(pos, pos); }
    }
  });

  /* ---------- Açılış ---------- */
  function boot(data) {
    applyTheme();
    if (data && data.save) { try { F.load(data.save); U.view = 'game'; } catch (e) { /* yoksay */ } }
    else if (hasSave() && loadSave()) { U.view = 'start'; }
    render();
    // bulut: anahtar bağlıysa ve buluttaki kayıt bu cihazdakinden yeniyse onu al
    cloudInit().then(async () => {
      if (cloud.ready && cloud.key) {
        try {
          const r = await cloudFetch(cloud.key);
          const localAt = +store.get('forma.savedAt') || 0;
          if (r.exists && r.at > localAt + 2000 && (U.view === 'start' || U.view === 'key')) {
            F.load(r.json); applyEdits(); lastLocal = null; cloud.lastPushed = r.json;
            store.set(KEY, r.json); store.set('forma.savedAt', String(r.at));
            toast('Buluttaki daha yeni kayıt alındı: ' + r.name);
          } else if (!r.exists || r.at < localAt) cloudSchedule();
          cloudStatus(r.exists ? 'Bulutta kayıtlı · ' + fmtAt(Math.max(r.at, 0)) : 'Bulut hazır');
        } catch (e) { cloudStatus('Buluta ulaşılamadı'); }
      }
      if (['start', 'key'].includes(U.view) || (U.view === 'game' && U.app === 'ayarlar')) render(true);
    });
  }
  if (window.claude && window.claude.hot) {
    try { window.claude.hot.snapshot(() => ({ save: F.S && F.S.P ? F.serialize() : null })); } catch (e) { /* yok */ }
  }
  const hot = window.claude && window.claude.hot;
  if (hot && hot.ready) hot.ready(boot); else boot(hot && hot.data ? hot.data : {});
})();
