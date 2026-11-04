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
    heirPos: 'FV', goalSel: [], code: '', importMsg: '', howto: false
  };
  let pressTimer = null, toastTimer = null;

  /* ---------- Kayıt ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* depolama kapalı */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* yok */ } }
  };
  function save() { if (F.S && F.S.P) store.set(KEY, F.serialize()); }
  function hasSave() { return !!store.get(KEY); }
  function loadSave() { const s = store.get(KEY); if (!s) return false; try { F.load(s); F.S.edits && Object.keys(F.S.edits).forEach((id) => { if (F.S.world.teams[id]) F.S.world.teams[id].name = F.S.edits[id]; }); return true; } catch (e) { return false; } }

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
    ozel: I('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
    muze: I('<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-6 10 6z"/>'),
    ayarlar: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    back: I('<path d="m15 18-6-6 6-6"/>'),
    phone: I('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
    heart: I('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>')
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
    else if (U.view === 'create') out = viewCreate();
    else out = viewGame();
    // Giriş animasyonu yalnızca ekran değişince oynar
    const st = F.S && F.S.queue && F.S.queue[0];
    const key = U.view + '|' + (U.app || '') + '|' + (U.tab || '') + '|' + (st ? st.type + (st.id || '') + (st.node || '') + (st.i || '') : '');
    if (key === U.lastKey) out.main = out.main.replace('stack fade', 'stack');
    U.lastKey = key;
    app.innerHTML = (out.bar || '') + `<main id="main">${out.main}</main>` + (out.dock ? `<div class="dock">${out.dock}</div>` : '') + (U.toast ? `<div class="toast" role="status">${esc(U.toast)}</div>` : '');
    const m = document.getElementById('main');
    if (keepScroll) m.scrollTop = prev;
    // seçili diziliş kartı görünür kalsın
    document.querySelectorAll('.fmrow').forEach((row) => { const on = row.querySelector('.fmcard.on'); if (on) row.scrollLeft = on.offsetLeft - row.offsetLeft - row.clientWidth / 2 + on.clientWidth / 2; });
    if (out.after) out.after();
    save();
  }

  function statusBar() {
    const S = F.S, P = S.P;
    const t = F.myTeam();
    const off = S.league.round >= F.seasonRounds() || (S.queue[0] && ['seasonSummary', 'offers', 'retire', 'heir', 'gameover'].includes(S.queue[0].type) && S.queue[0].window !== 'kis');
    return `<div class="bar"><span class="num">${off ? 'Sezon arası' : `S${S.season} · H${S.week} · ${esc(F.monthName())}`}</span><span class="club">${badge(t, 16)}<span><b>${esc(t.name)}</b></span></span><span class="num"><b>${F.money(P.money)}</b></span></div>`;
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
      </div>`,
      dock: `<div class="stack" style="width:100%;gap:8px">${sv ? `<button class="btn" data-a="continue">Kariyerine devam et</button>` : ''}<button class="btn ${sv ? 'alt' : ''}" data-a="start-new">Yeni kariyer</button><button class="btn ghost" data-a="howto">${U.howto ? 'Kapat' : 'Nasıl oynanır?'}</button></div>`
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
    const cur = D.attrGroupOf[plan.train];
    const tab = U.trainCat && groups.some((g) => g.id === U.trainCat) ? U.trainCat : cur || D.attrGroupOf[dp[0]] || groups[0].id;
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
        <div class="label">3 · Adın</div>
        <div class="row"><input type="text" id="c-name" placeholder="Ad" value="${esc(c.name)}" maxlength="16" aria-label="Ad"><input type="text" id="c-sur" placeholder="Soyad" value="${esc(c.surname)}" maxlength="18" aria-label="Soyad"></div>
        <button class="btn alt sm" data-a="c-rand" style="align-self:flex-start">Rastgele isim</button>
        <div class="label">4 · Görünüm ve forma numarası</div>
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
    const apps = [['tribun', 'Sosyal Medya', S.unread.feed], ['mesaj', 'Mesajlar', S.unread.dm + S.requests.length + (S.convos || []).filter((c) => !c.ans).length], ['ozel', 'Özel Hayat'], ['kisiler', 'Kişiler'], ['menajer', 'Menajer', S.tasks.filter((x) => !x.done).length ? 0 : 0], ['banka', 'Banka'], ['magaza', 'Mağaza'], ['profil', 'Profil'], ['lig', 'Lig'], ['album', 'Albüm'], ['muze', 'Aile Müzesi'], ['ayarlar', 'Ayarlar']];
    return {
      main: `<div class="stack fade">
        <div class="hero ${light ? 'light' : ''}" style="--c1:${t.colors[0]};--c2:${t.colors[1]}">
          <div class="row" style="justify-content:space-between;align-items:flex-start">
            <div class="stack" style="gap:6px;min-width:0">
              <div class="row" style="gap:10px">${meFace('md')}<div class="nm">${esc(P.name)}<br>${esc(P.surname)}</div></div>
              <div class="small" style="opacity:.85">${P.age} yaş · ${esc(posName)} · ${esc(P.originName)}</div>
              <div class="row wrap" style="gap:6px">${P.injury ? `<span class="chip bad">Sakat · ${P.injury.weeks} hafta</span>` : ''}${P.suspended ? `<span class="chip bad">Cezalı · ${P.suspended} maç</span>` : ''}${S.flags.kaptan ? '<span class="chip acc">Kaptan</span>' : ''}<span class="chip">${esc(D.roleNames[P.contract.role])}</span>${P.contract.loanFrom ? '<span class="chip warn">Kiralık</span>' : ''}</div>
            </div>
            <div class="kit">${F.ART.jersey(t.colors[0], t.colors[1], P.number || 10, P.surname, 92)}<div class="ovrbadge num">${ovr}<span>GÜÇ</span></div></div>
          </div>
          <div class="sep" style="background:currentColor;opacity:.18;margin:12px 0 10px"></div>
          <div class="row small" style="justify-content:space-between"><span>${esc(F.leagueName())}</span><b class="num">${pos}. sıra</b></div>
        </div>
        ${o ? `<div class="card"><div class="label" style="margin-bottom:8px">Sonraki maç · ${fx.home ? 'İç saha' : 'Deplasman'}</div><div class="next"><div class="tm">${badge(fx.home ? t : o, 36)}<span>${esc(fx.home ? t.name : o.name)}</span></div><span class="vs">VS</span><div class="tm">${badge(fx.home ? o : t, 36)}<span>${esc(fx.home ? o.name : t.name)}</span></div></div></div>` : `<div class="card small muted">Bu sezonun maçları bitti.</div>`}
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
          <div class="row"><div class="label grow">Boş zaman · ${plan.acts.length}/${F.slots()} slot</div><span class="tiny muted">${F.isNatBreak() ? 'Milli ara' : F.myFixture() ? 'Maç haftası' : 'Maçsız hafta'}</span></div>
          <div class="stack" style="gap:8px">${acts.map((a) => {
            const on = plan.acts.includes(a.id);
            const c = F.planCost(a.id);
            const full = !on && plan.acts.length >= F.slots();
            return `<button class="opt" data-a="plan-act" data-v="${a.id}" ${full ? 'disabled' : ''} style="${on ? 'box-shadow:inset 0 0 0 2.5px var(--accent)' : ''}"><div class="row"><b class="grow">${esc(a.name)}</b>${on ? '<span class="chip on">Seçildi</span>' : ''}</div><div class="small muted">${esc(a.desc)}</div><div class="meta">${fxPreview(F.actFx(a.id), c)}${(S.actHist || {})[a.id] >= 1 ? '<span class="chip warn">Alıştın: getiri düştü</span>' : ''}${a.risk ? '<span class="chip warn">Sürpriz olabilir</span>' : ''}</div></button>`;
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
  function matchView(st) {
    const S = F.S, P = S.P;
    const m = F.matchStart();
    const meRaw = m.nat ? { name: P.natTeam === 'DE' ? 'Almanya' : 'Türkiye', colors: P.natTeam === 'DE' ? ['#111111', '#DD0000'] : ['#E30A17', '#FFFFFF'], id: 'nat' } : F.myTeam();
    const opRaw = m.nat ? { name: m.oppName, colors: ['#334455', '#99aabb'], id: 'natop' } : F.team(m.opp);
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
    const pitch = m.played && !m.done ? `<div class="pitchwrap">${F.ART.pitch(m, last ? last.kind : null, m.log.length, me.colors, op.colors, anim && !!last)}</div>` : '';
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
        main: `<div class="stack fade">${board}${pitch}<div class="card stack moment" style="gap:6px"><div class="row"><div class="minute num grow">${mo.minute}'</div><span class="chip acc">Top sende</span></div>${mo.ref.startsWith('chain:') ? (() => { const st = mo.ref.split(':')[1]; return `<div class="row" style="gap:6px">${D.attackOrder.map((x) => `<span class="chip ${x === st ? 'on' : D.attackOrder.indexOf(x) < D.attackOrder.indexOf(st) ? 'good' : ''}">${D.attackStageNames[x]}</span>`).join('<span class="tiny muted">→</span>')}</div>`; })() : ''}<p class="ev-text">${esc(F.tpl(def.t))}</p></div>${cmt}</div>`,
        dock: `<div class="stack" style="width:100%;gap:8px">${def.o.map((o, i) => `<button class="opt" data-a="m-opt" data-v="${i}"><div class="row"><b class="grow">${esc(o.t)}</b>${probTag(F.momentProb(o, m))}</div><div class="tiny muted" style="margin-top:3px">${esc(D.attrs[o.a] || D.softs[o.a] || o.a)}${o.easy ? ' · kolay seçenek' : ''}</div></button>`).join('')}</div>`
      };
    }
    if (nextF) {
      return {
        main: `<div class="stack fade">${board}${head}${pitch}${cmt}</div>`,
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
    return { main: `<div class="stack fade">${board}${head}${pitch}${cmt}</div>`, dock: `<button class="btn" data-a="m-finish">Son düdük</button>` };
  }

  /* ---------- Basın ---------- */
  function pressView(st) {
    const qid = st.qs[st.i];
    const q = qid ? F.pressQ(qid) : null;
    const g = whoInfo('gazeteci');
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
        <p class="small muted">${expired ? 'Sözleşmen bitti. Bir teklifi kabul etmen gerekiyor.' : `Şu anki sözleşmen: ${esc(t.name)}, ${P.contract.years} yıl kaldı, haftalık ${F.money(P.contract.wage)}.`}</p>
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
          ${o.counter ? `<p class="small">Kulübün son teklifi: <b>${F.money(Math.round(o.wage * o.counter.wageMul))}/hafta</b> · ${o.counter.years} yıl · imza ${F.money(Math.round(o.wage * o.counter.wageMul * 12 * o.counter.signing))}${o.counter.guarantee ? ' · forma garantisi' : ''}. Bunu gönderirsen kabul ederler.</p>` : ''}
          <label class="stack" style="gap:4px" for="n-wage"><span class="row small"><span class="grow">Haftalık maaş</span><b class="num" id="n-wage-v">${F.money(wage)}</b></span><input type="range" id="n-wage" min="0.9" max="2" step="0.05" value="${n.wageMul}"></label>
          <label class="stack" style="gap:4px" for="n-years"><span class="row small"><span class="grow">Süre</span><b class="num" id="n-years-v">${n.years} yıl</b></span><input type="range" id="n-years" min="1" max="5" step="1" value="${n.years}"></label>
          <label class="stack" style="gap:4px" for="n-sign"><span class="row small"><span class="grow">İmza parası</span><b class="num" id="n-sign-v">${F.money(Math.round(wage * 12 * n.signing))}</b></span><input type="range" id="n-sign" min="0" max="1" step="0.05" value="${n.signing}"></label>
          <label class="row small" for="n-g"><input type="checkbox" id="n-g" ${n.guarantee ? 'checked' : ''}> <span class="grow">Forma garantisi iste</span><span class="chip">${esc(D.roleNames[o.role])}</span></label>
          <p class="tiny muted">Kulübün bir tavanı var; aştıkça gerginlik artar. Konuşma yeteneğin ve menajerin gerginliği yumuşatır, güç farkın ve şöhretin tavanı yükseltir.</p>
        </div>
        ${n.msg ? `<div class="result small">${esc(n.msg)}</div>` : ''}</div>`,
      dock: `<div class="row" style="width:100%">${o.agreed ? `<button class="btn" data-a="off-accept" data-v="${n.i}">İmzala</button>` : `<button class="btn" data-a="nego-send">Teklifi gönder</button>`}</div>`,
      after: () => {
        const upd = () => {
          n.wageMul = +document.getElementById('n-wage').value;
          n.years = +document.getElementById('n-years').value;
          n.signing = +document.getElementById('n-sign').value;
          n.guarantee = document.getElementById('n-g').checked;
          const w = Math.round(o.wage * n.wageMul);
          document.getElementById('n-wage-v').textContent = F.money(w);
          document.getElementById('n-years-v').textContent = n.years + ' yıl';
          document.getElementById('n-sign-v').textContent = F.money(Math.round(w * 12 * n.signing));
        };
        ['n-wage', 'n-years', 'n-sign', 'n-g'].forEach((id) => document.getElementById(id).addEventListener('input', upd));
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
      default: U.app = null; return homeView();
    }
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
        ${p.img ? `<div class="img" style="background:${imgBg[p.img] || 'var(--accent)'}">${esc((F.postPhotos().find((x) => x.id === p.img) || { name: p.img }).name)}</div>` : ''}<p>${esc(p.t)}</p><div class="row tiny muted">${p.me ? `<span style="width:14px;height:14px;display:inline-block">${ICON.heart}</span>` : `<button class="likebtn ${p.liked ? 'on' : ''}" data-a="like" data-v="${p.id}" aria-label="Beğen" ${p.liked ? 'disabled' : ''}>${ICON.heart}</button>`}<span class="num">${F.num(p.likes)}</span></div>
        ${p.comments ? p.comments.map((c) => `<div class="small" style="padding-left:8px;border-left:2px solid var(--line)"><b>${esc(c.who)}</b> ${esc(c.t)}</div>`).join('') : ''}</div>`).join('') : '<div class="card small muted">Akış boş. Maça çık, birileri bir şey yazar.</div>'}</div>`;
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
      const who = D.relLabels[def.who] ? whoInfo(def.who).name : F.tpl(def.who);
      return `<div class="card stack" style="gap:8px"><div class="row">${av(who)}<div class="grow"><b>${esc(who)}</b><div class="tiny muted">İstek · ${Math.max(0, rq.until - S.t)} hafta içinde cevap bekliyor</div></div></div><p>${esc(F.tpl(def.t))}</p>
        <div class="meta row wrap">${rq.cost ? `<span class="chip bad">${F.money(-rq.cost)}</span>` : ''}${fxPreview(def.fx)}</div>
        <div class="row"><button class="btn alt sm grow" data-a="req" data-v="${i}" data-w="0">Reddet</button><button class="btn sm grow" data-a="req" data-v="${i}" data-w="1">Kabul et</button></div></div>`;
    }).join('');
    const dms = S.dms.map((m) => `<div class="li">${av(m.from)}<div class="grow"><b class="small">${esc(m.from)}</b><p class="small">${esc(m.t)}</p></div></div>`).join('');
    const convos = (S.convos || []).slice(0, 12).map((c, i) => {
      const def = D.convos.find((x) => x.id === c.id);
      if (!def) return '';
      return `<div class="card stack" style="gap:8px"><div class="row">${av(c.who)}<div class="grow"><b>${esc(c.who)}</b><div class="tiny muted">${S.t - c.at === 0 ? 'Bu hafta' : S.t - c.at + ' hafta önce'}</div></div>${c.ans ? '' : '<span class="chip warn">Cevap bekliyor</span>'}</div>
        <div class="chat">${c.lines.map((l) => `<div class="bub them">${esc(l)}</div>`).join('')}${c.ans ? `<div class="bub me">${esc(c.ans.t)}</div>${c.ans.r ? `<div class="bub sys">${esc(c.ans.r)}</div>` : ''}${deltaChips(c.ans.deltas)}` : ''}</div>
        ${c.ans ? '' : `<div class="stack" style="gap:6px">${def.o.map((o, j) => `<button class="opt" data-a="convo" data-v="${i}" data-w="${j}">${esc(F.tpl(o.t))}</button>`).join('')}</div>`}</div>`;
    }).join('');
    return appShell('Mesajlar', `${convos ? `<div class="label">Sohbetler</div>${convos}` : ''}${reqs ? `<div class="label">Bekleyen istekler</div>${reqs}` : ''}<div class="label">Gelen kutusu</div><div class="card list">${dms || '<p class="small muted">Mesaj yok.</p>'}</div>`);
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
      <div class="card stack" style="gap:6px"><div class="label">Haftalık</div><div class="row small"><span class="grow">Maaş</span><b class="num">${F.money(P.contract.wage)}</b></div>${S.agent ? `<div class="row small"><span class="grow">Menajer komisyonu</span><b class="num">%${S.agent.komisyon}</b></div>` : ''}<div class="row small"><span class="grow">Sahip olduklarının bakımı</span><b class="num">${F.money(-upkeep)}</b></div>${ls ? `<div class="row small"><span class="grow">Geçen hafta net</span><b class="num">${F.money(ls.net)}</b></div>` : ''}</div>
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
        <div class="meta row wrap">${fxPreview(fx)}${it.weekly ? `<span class="chip good">Haftalık bonus</span>` : ''}${it.trainMul ? `<span class="chip good">Gelişim +%${Math.round((it.trainMul - 1) * 100)}</span>` : ''}${it.injMul ? `<span class="chip good">Sakatlık riski −%${Math.round((1 - it.injMul) * 100)}</span>` : ''}${it.income ? `<span class="chip ${it.income[0] < 0 ? 'warn' : 'good'}">Gelir ${F.money(it.income[0])}…${F.money(it.income[1])}/hafta</span>` : ''}${it.upkeep ? `<span class="chip bad">Bakım ${F.money(-it.upkeep)}/hafta</span>` : ''}${it.lux >= 4 ? '<span class="chip warn">Taraftar tepkisi</span>' : ''}</div>
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

  function ligView() {
    const S = F.S;
    const myKey = S.league.key;
    const key = U.leagueKey || myKey;
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
    return appShell('Lig', `<select id="lg-sel" aria-label="Lig seç">${comps.map((c) => `<option value="${c.key}" ${c.key === key ? 'selected' : ''}>${esc(c.name + (c.gname ? ' · ' + c.gname : ''))}${c.key === myKey ? ' (senin ligin)' : ''}</option>`).join('')}</select>
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
      U.upd = { status: newer(remote.version, F.VERSION) ? 'new' : 'latest', remote, local };
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
      ${u.local ? '<button class="btn sm" data-a="upd-run">Şimdi güncelle</button><p class="tiny muted">Oyun yeni sürümü indirip kendini yeniler. Kariyerin kaybolmaz.</p>' : `<p class="small">Bu kopya otomatik güncellenemiyor. Bilgisayarında <b>FORMA'yı başlat</b> dosyasıyla açarsan tek tıkla güncellenir. Ya da yeni sürümü <a href="${F.REPO_URL}" target="_blank" rel="noopener">GitHub sayfasından</a> indir.</p>`}`;
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
    return appShell('Ayarlar', `${updateCard()}<div class="card stack"><div class="label">Tema</div><div class="seg">${[['system', 'Sistem'], ['light', 'Açık'], ['dark', 'Koyu']].map(([k, n]) => `<button class="${theme === k ? 'on' : ''}" data-a="theme" data-v="${k}">${n}</button>`).join('')}</div></div>
      <div class="card stack"><div class="label">Takım isimlerini düzenle (PES usulü)</div><input type="text" id="rn-q" placeholder="Takım ara (en az 2 harf)" value="${esc(U.renameQ)}" aria-label="Takım ara">
        ${teams.map((t) => `<div class="row">${badge(t, 18)}<input type="text" data-team="${t.id}" value="${esc(t.name)}" maxlength="32" aria-label="${esc(t.name)} yeni adı"></div>`).join('')}<p class="tiny muted">Değişiklik yazmayı bitirince kaydedilir ve kayıt koduyla birlikte taşınır.</p></div>
      <div class="card stack"><div class="label">Kayıt kodu</div><p class="small muted">Oyun bu cihazda otomatik kaydedilir. Başka cihaza taşımak için kodu kopyala, orada yapıştır.</p>
        <div class="row"><button class="btn alt sm grow" data-a="export">Kodu oluştur</button><button class="btn alt sm grow" data-a="copy" ${U.code ? '' : 'disabled'}>Kopyala</button></div>
        <textarea id="code" aria-label="Kayıt kodu" placeholder="Kayıt kodunu buraya yapıştır">${esc(U.code)}</textarea><button class="btn sm" data-a="import">Koddan yükle</button>${U.importMsg ? `<p class="small">${esc(U.importMsg)}</p>` : ''}</div>
      ${U.confirm === 'new' ? `<div class="card stack"><p>Mevcut kariyer silinecek. Emin misin?</p><div class="row"><button class="btn alt sm grow" data-a="confirm-no">Vazgeç</button><button class="btn danger sm grow" data-a="new-career-now">Sil ve yeniden başla</button></div></div>` : `<button class="btn ghost" data-a="confirm" data-v="new">Yeni kariyere başla</button>`}
      <div class="card small muted">FORMA prototip · Kulüp ve kişi isimleri kurgusaldır.</div>`);
  }

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
    'c-origin': (v) => { readNames(); U.create.origin = v; },
    'c-pos': (v) => { readNames(); U.create.pos = v; },
    'pm-pick': (v, w) => {
      if (w === 'create') readNames();
      const st = fmState(w);
      st.role = v;
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
      F.setRole(st.role); S.roleChange = S.season;
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
      F.newGame({ origin: c.origin, pos: D.roles[c.role].grp, role: c.role, seed: ogx && ogx.pickClub ? c.seed : undefined, club: c.club, name: c.name.trim() || F.maleName(), surname: c.surname.trim() || F.surname(), look: c.look, number: c.number });
      U.view = 'game'; U.app = null; U.goalSel = [];
      F.processAuto();
    },
    open: (v) => { U.app = v; U.tab = null; U.confirm = null; },
    back: () => { U.app = null; U.confirm = null; },
    tab: (v) => { U.tab = v; },
    'plan-train': (v) => { F.S.plan.train = v; },
    'upd-check': () => { checkUpdate(false); },
    'upd-run': () => { runUpdate(); },
    'loan-amt': (v) => { U.loanAmt = +v; },
    'loan-term': (v) => { U.loanTerm = +v; },
    'loan-take': () => { const lim = F.loanLimit(); const amts = [0.25, 0.5, 1].map((x) => Math.round(lim * x / 1000) * 1000); const r = F.takeLoan(amts[U.loanAmt == null ? 1 : U.loanAmt], U.loanTerm == null ? 1 : U.loanTerm); toast(r.err || 'Kredi hesabına yattı: ' + F.money(r.q.amount)); },
    'loan-pay': () => { const r = F.payoffLoan(); toast(r.err || 'Kredi kapandı. Kredi notun yükseldi.'); },
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
    like: (v) => { const r = F.likePost(v); if (r && r.gain) toast('Beğendin · +' + r.gain + ' takipçi'); else if (r && r.capped) toast('Beğendin. Bu hafta beğenilerden yeterince takipçi kazandın.'); },
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
    'off-nego': (v) => { const o = F.S.offers[+v]; U.nego = { i: +v, wageMul: 1.15, years: o.years, signing: 0.1, guarantee: false, msg: null }; },
    'nego-close': () => { U.nego = null; },
    'nego-send': () => {
      const n = U.nego;
      const r = F.negotiate(n.i, { wageMul: n.wageMul, years: n.years, guarantee: n.guarantee, signing: n.signing });
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
      try { F.importCode(v); U.importMsg = 'Kayıt yüklendi.'; U.app = null; U.view = 'game'; F.processAuto(); }
      catch (e) { U.importMsg = 'Kod okunamadı. Kodun tamamını yapıştırdığından emin ol.'; }
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
  const KEEP = new Set(['upd-check', 'upd-run', 'pm-pick', 'like', 'loan-amt', 'loan-term', 'sub-buy', 'convo', 'c-club', 'train-cat', 'fm-pick', 'fm-spot', 'pos-edit', 'lk', 'edit-look', 'c-look', 'c-num', 'plan-train', 'plan-load', 'plan-act', 'goal-toggle', 'post-photo', 'post-tone', 'buy', 'sell', 'req', 'routine', 'tab', 'shopcat', 'chat-say', 'c-origin', 'c-pos', 'confirm', 'confirm-no', 'theme', 'export', 'heir-pos']);
  function readNames() {
    const n = document.getElementById('c-name'), s = document.getElementById('c-sur');
    if (n) U.create.name = n.value;
    if (s) U.create.surname = s.value;
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
  });
  app.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'c-numin' || t.id === 'p-numin') {
      const n = Math.max(1, Math.min(99, parseInt(t.value, 10) || 0));
      if (!t.value) return;
      if (String(n) !== t.value) t.value = n;
      if (t.id === 'c-numin') U.create.number = n; else { F.S.P.number = n; save(); }
      const txt = app.querySelector('.editor svg text:last-of-type');
      if (txt) txt.textContent = n;
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
  }
  if (window.claude && window.claude.hot) {
    try { window.claude.hot.snapshot(() => ({ save: F.S && F.S.P ? F.serialize() : null })); } catch (e) { /* yok */ }
  }
  const hot = window.claude && window.claude.hot;
  if (hot && hot.ready) hot.ready(boot); else boot(hot && hot.data ? hot.data : {});
})();
