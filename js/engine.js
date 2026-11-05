/* FORMA — oyun motoru: durum, dünya, etkiler, koşullar, olaylar, haftalık akış */
(function (root) {
  const F = root.F;
  const D = F.DATA;
  const AGG = ['takim', 'medya', 'aile', 'taraftar', 'memleket'];
  const LIFE = ['enerji', 'moral', 'mental', 'disiplin', 'sohret', 'saglik'];

  /* =========================================================
     DÜNYA
     ========================================================= */
  F.genWorld = function () {
    const S = F.S;
    const teams = {};
    let n = 0;
    const mk = (o) => { const id = 't' + n++; teams[id] = Object.assign({ id }, o); return teams[id]; };

    // Türkiye
    const sizeBase = { 1: 70, 2: 61, 3: 53, 4: 46, 5: 41 };
    const pool = D.places.map((p) => ({ p, raw: sizeBase[p.size] + F.rf(-9, 9) }));
    const special = D.specials.map((s) => ({ s, raw: s.str + 20 }));
    const all = special.concat(pool).sort((a, b) => b.raw - a.raw);
    const trTiers = D.leagues.TR.tiers;
    const need = trTiers.reduce((a, t) => a + t.groups * t.size, 0);
    const chosen = all.slice(0, need);
    let idx = 0;
    const trByTier = [];
    trTiers.forEach((tier, ti) => {
      const cnt = tier.groups * tier.size;
      const slice = chosen.slice(idx, idx + cnt);
      idx += cnt;
      const list = slice.map((it, rank) => {
        const frac = 1 - rank / Math.max(1, cnt - 1);
        const str = Math.round(tier.str[0] + frac * (tier.str[1] - tier.str[0]) + F.rf(-2, 2));
        if (it.s) return mk({ name: it.s.name, province: it.s.province, region: it.s.region, country: 'TR', str: it.s.str, colors: it.s.colors, colorName: it.s.colorName, stadium: it.s.stadium, fans: it.s.fans, fin: it.s.fin, academy: it.s.academy, big: true });
        const p = it.p;
        const pal = D.colorOverride[p.name] ? D.palette.find((x) => x[2] === D.colorOverride[p.name]) : F.pick(D.palette);
        const sz = p.size <= 2 ? 'big' : p.size <= 3 ? 'mid' : 'small';
        return mk({
          name: p.name, province: p.province, region: p.region, country: 'TR', str,
          colors: [pal[0], pal[1]], colorName: pal[2],
          stadium: F.pick(D.stadiumPatterns[sz]).replace('{n}', p.name),
          fans: F.clamp(6 - p.size + F.ri(-1, 1), 1, 5), fin: F.ri(1, 5), academy: F.clamp(6 - p.size + F.ri(-1, 0), 1, 5)
        });
      });
      trByTier.push(list.map((t) => t.id));
    });

    // Yabancı: her ülkenin tüm lig seviyeleri (Türkiye'deki sistemle)
    S.world = { teams, comps: {} };
    const fByTier = {};
    F.foreignCountries().forEach((c) => {
      const used = new Set();
      fByTier[c] = D.leagues[c].tiers.map((tier, ti) => F.foreignTierTeams(c, ti, tier.groups * tier.size, used, mk));
    });
    F.buildComps('TR', trByTier);
    Object.keys(fByTier).forEach((c) => F.buildComps(c, fByTier[c]));
  };

  F.foreignCountries = () => Object.keys(D.leagues).filter((c) => c !== 'TR');
  // Yabancı bir lig seviyesi için kulüp üretir: üst ligde PES tarzı kulüpler, Almanya Bölge Ligi'nde gurbetçi kulüpleri,
  // geri kalan yerler Türkiye'deki gibi şehir listesinden büyüklüğe (ve biraz şansa) göre dolar.
  const PLACE_BASE = { 1: 70, 2: 61, 3: 53 };
  F.foreignTierTeams = function (c, ti, count, used, mk) {
    const tier = D.leagues[c].tiers[ti];
    const rows = [];
    const take = (list) => list.forEach((r) => { if (rows.length < count && !used.has(r.name)) { used.add(r.name); rows.push(r); } });
    const named = (list) => (list || []).map((r) => ({ name: r[0], colors: [r[1], r[2]], named: true }));
    if (ti === 0) take(named(D.foreign[c]));
    if (tier.diaspora) take(named(D.foreign[c + '2']));
    if (rows.length < count) {
      const places = String((D.foreignPlaces || {})[c] || '').split(';').filter(Boolean).map((s) => {
        const [name, size] = s.split('|');
        return { name, raw: (PLACE_BASE[size] || 53) + F.rf(-9, 9) };
      }).sort((a, b) => b.raw - a.raw);
      take(places);
    }
    for (let k = 1; rows.length < count && k < 99; k++) take([{ name: D.leagues[c].name + ' Gençlik ' + k }]);
    const lvl = ti === 0 ? 5 : ti === 1 ? 3 : 2;
    return rows.map((r, rank) => {
      const frac = 1 - rank / Math.max(1, rows.length - 1);
      const str = Math.round(tier.str[0] + frac * (tier.str[1] - tier.str[0]) + F.rf(-2, 2));
      const pal = r.colors ? null : F.pick(D.palette);
      const city = r.named ? r.name.split(' ')[0] : r.name;
      return mk({
        name: r.name, province: city, region: c, country: c, str, colors: r.colors || [pal[0], pal[1]], colorName: pal ? pal[2] : '',
        stadium: city + (r.named || ti === 0 ? ' Arena' : ' ' + F.pick(['Stadı', 'Park', 'Arena', 'Şehir Stadı'])),
        fans: lvl, fin: lvl, academy: lvl, big: ti === 0 && rank < 4
      }).id;
    });
  };

  // Eski kayıtlar: yabancı ülkelerde tek lig vardı (12 takım). Eksik ligleri ve kulüpleri ekler, mevcut kulüpleri korur.
  F.migrateWorld = function (S) {
    const W = S.world;
    if (!W || !W.teams || !W.comps) return false;
    let changed = false;
    let n = Object.keys(W.teams).reduce((m, k) => Math.max(m, +String(k).slice(1) || 0), -1) + 1;
    const mk = (o) => { const id = 't' + n++; W.teams[id] = Object.assign({ id }, o); return W.teams[id]; };
    const keep = F.S;
    F.S = S;
    try {
      F.foreignCountries().forEach((c) => {
        const tiers = D.leagues[c].tiers;
        const comps = Object.values(W.comps).filter((k) => k.c === c);
        const need = tiers.map((t) => t.groups * t.size);
        const have = tiers.map(() => []);
        comps.forEach((k) => {
          let ti = tiers.findIndex((t) => t.name === k.name);
          if (ti < 0) ti = Math.min(tiers.length - 1, Math.max(0, k.tier - 1));
          have[ti].push(...k.teams);
        });
        const ok = comps.length === tiers.reduce((a, t) => a + t.groups, 0) && have.every((ids, ti) => ids.length === need[ti]) && comps.every((k) => tiers[k.tier - 1] && tiers[k.tier - 1].name === k.name);
        if (ok) return;
        changed = true;
        // fazlası bir alt lige kayar, son ligde kalır
        for (let ti = 0; ti < tiers.length - 1; ti++) if (have[ti].length > need[ti]) have[ti + 1].unshift(...have[ti].splice(need[ti]));
        const used = new Set(Object.values(W.teams).filter((t) => t.country === c).map((t) => t.name));
        tiers.forEach((tier, ti) => {
          const miss = need[ti] - have[ti].length;
          if (miss > 0) have[ti].push(...F.foreignTierTeams(c, ti, miss, used, mk));
        });
        F.buildComps(c, have);
      });
      if (changed && S.league && S.P && W.teams[S.P.contract.team]) S.league.key = W.teams[S.P.contract.team].comp;
    } finally { F.S = keep; }
    return changed;
  };

  const REGION_ORDER = ['MAR', 'EGE', 'AKD', 'ICA', 'KAR', 'DOG', 'GDA'];
  // Seviye listelerinden grup/komp yapısını kurar (bölgesel gruplama)
  F.buildComps = function (c, byTier) {
    const S = F.S;
    Object.keys(S.world.comps).forEach((k) => { if (S.world.comps[k].c === c) delete S.world.comps[k]; });
    byTier.forEach((ids, ti) => {
      const tier = D.leagues[c].tiers[ti];
      let list = ids.slice();
      if (tier.groups > 1) {
        list.sort((a, b) => {
          const A = S.world.teams[a], B = S.world.teams[b];
          return REGION_ORDER.indexOf(A.region) - REGION_ORDER.indexOf(B.region) || A.province.localeCompare(B.province, 'tr');
        });
      }
      for (let g = 0; g < tier.groups; g++) {
        const key = c + '-' + (ti + 1) + '-' + g;
        const gt = list.slice(g * tier.size, (g + 1) * tier.size);
        let gname = tier.groupNames ? tier.groupNames[g] : '';
        if (tier.regional && gt.length) {
          const counts = {};
          gt.forEach((id) => { const r = S.world.teams[id].region; counts[r] = (counts[r] || 0) + 1; });
          const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 2).map((r) => D.regions[r]);
          gname = top.join('-');
        }
        S.world.comps[key] = { key, c, tier: ti + 1, g, name: tier.name, gname, teams: gt };
        gt.forEach((id) => { S.world.teams[id].comp = key; });
      }
    });
  };

  F.team = (id) => F.S.world.teams[id];
  F.myTeam = () => F.team(F.S.P.contract.team);
  F.tierOf = (teamId) => { const k = F.team(teamId).comp; const c = F.S.world.comps[k]; return { c: c.c, t: c.tier, comp: c }; };
  F.tierDef = (c, t) => D.leagues[c].tiers[t - 1];
  F.myTier = () => F.tierOf(F.S.P.contract.team);
  F.isAbroad = () => F.myTier().c !== 'TR';
  F.leagueName = (teamId) => {
    const ti = F.tierOf(teamId || F.S.P.contract.team);
    return ti.comp.name + (ti.comp.gname ? ' · ' + ti.comp.gname : '');
  };

  /* ---------- Fikstür ---------- */
  F.roundRobin = function (ids) {
    const list = F.shuffle(ids);
    if (list.length % 2) list.push(null);
    const n = list.length;
    const rounds = [];
    let arr = list.slice();
    for (let r = 0; r < n - 1; r++) {
      const pairs = [];
      for (let i = 0; i < n / 2; i++) {
        const a = arr[i], b = arr[n - 1 - i];
        if (a && b) pairs.push(r % 2 ? [b, a] : [a, b]);
      }
      rounds.push(pairs);
      arr = [arr[0]].concat([arr[n - 1]], arr.slice(1, n - 1));
    }
    return rounds.concat(rounds.map((rd) => rd.map(([a, b]) => [b, a])));
  };
  F.emptyTable = (ids) => { const t = {}; ids.forEach((id) => (t[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 })); return t; };
  F.simScore = function (hId, aId) {
    const H = F.team(hId), A = F.team(aId);
    const lh = F.clamp(1.4 + (H.str - A.str) / 16 + 0.2, 0.2, 4);
    const la = F.clamp(1.1 + (A.str - H.str) / 16, 0.15, 3.6);
    return [F.poisson(lh), F.poisson(la)];
  };
  F.addResult = function (table, h, a, gh, ga) {
    const H = table[h], A = table[a];
    if (!H || !A) return;
    H.p++; A.p++; H.gf += gh; H.ga += ga; A.gf += ga; A.ga += gh;
    if (gh > ga) { H.w++; A.l++; H.pts += 3; } else if (gh < ga) { A.w++; H.l++; A.pts += 3; } else { H.d++; A.d++; H.pts++; A.pts++; }
  };
  F.sortTable = (table) => Object.keys(table).sort((a, b) => {
    const A = table[a], B = table[b];
    return B.pts - A.pts || (B.gf - B.ga) - (A.gf - A.ga) || B.gf - A.gf || a.localeCompare(b);
  });
  F.myPos = () => F.sortTable(F.S.league.table).indexOf(F.S.P.contract.team) + 1;

  F.startLeague = function () {
    const S = F.S;
    const key = F.myTeam().comp;
    const comp = S.world.comps[key];
    S.league = { key, teams: comp.teams.slice(), fixtures: F.roundRobin(comp.teams), round: 0, table: F.emptyTable(comp.teams), results: [] };
  };
  F.myFixture = function (round) {
    const S = F.S;
    const r = S.league.fixtures[round == null ? S.league.round : round];
    if (!r) return null;
    const me = S.P.contract.team;
    const pair = r.find((p) => p[0] === me || p[1] === me);
    if (!pair) return null;
    return { home: pair[0] === me, opp: pair[0] === me ? pair[1] : pair[0], pair };
  };
  F.seasonRounds = () => F.S.league.fixtures.length;

  /* =========================================================
     YENİ OYUN
     ========================================================= */
  F.newState = function (seed) {
    return {
      v: 1, seed, rng: seed | 0, t: 0, year: 2026, week: 1, season: 1, gen: 1,
      P: null, rel: { takim: 0, medya: 0, aile: 30, taraftar: 0, memleket: 20 },
      npcs: {}, roles: {}, partner: null, kids: [], world: null, league: null,
      flags: {}, seeds: [], seen: {}, queue: [], plan: { train: 'fizik', load: 'normal', acts: [] },
      feed: [], dms: [], chat: [], requests: [], agent: null, tips: [], tasks: [], album: [], dynasty: [], bank: [],
      st: null, goals: [], offers: [], exMates: [], news: [], challenge: null, lastSummary: null, unread: { feed: 0, dm: 0, chat: 0 },
      order: null, ended: false, edits: {}, ach: {}, newAch: []
    };
  };

  // Karakter ekranı için: aynı tohumla oyunun kuracağı temel yetenekleri önceden hesaplar (dağıtım hariç)
  F.previewAttrs = function (o) {
    const keep = F.S;
    try {
      F.S = F.newState(o.seed);
      F.genWorld();
      F.dealDeck();
      const og = D.origins.find((x) => x.id === o.origin);
      F.createPlayer(Object.assign({}, o, { alloc: null }), og);
      return Object.assign({}, F.S.P.attrs);
    } finally { F.S = keep; }
  };
  F.newGame = function (o) {
    const seed = o.seed || Math.floor(Math.random() * 2147483647);
    const S = (F.S = F.newState(seed));
    F.genWorld();
    F.dealDeck();
    const og = D.origins.find((x) => x.id === o.origin);
    F.createPlayer(o, og);
    F.createFamily(og);
    // aile yüzleri oyuncuya benzesin (aynı ten rengi)
    ['anne', 'baba', 'kardes'].forEach((r) => { const n = F.npc(r); if (n && F.ART) n.look = Object.assign(F.ART.randomLook(r === 'anne' || n.female), { skin: S.P.look.skin }); });
    F.assignStartClub(og, o);
    F.setupAgentForOrigin(og);
    F.startSeason(true);
    F.checkRoleFit();
    F.addAlbum('Kariyerin başladı: ' + F.myTeam().name + ' formasıyla ilk gün.', 'start');
    return S;
  };

  // Her kariyere özel "hikâye destesi": genel olayların bir kısmı bu hayatta hiç yaşanmaz
  F.dealDeck = function () {
    const S = F.S;
    S.off = {};
    D.events.forEach((ev) => {
      if (ev.chain || ev.daily || ev.origin || /^intro_|^nesil_|^milli_|^partner_(sevgili|nisan|dugun|ayrilik|cocuk)|^kaptanlik$/.test(ev.id)) return;
      if (F.chance(0.38)) S.off[ev.id] = 1;
    });
  };

  F.createPlayer = function (o, og, inherit) {
    const S = F.S;
    const attrs = {};
    const role = D.roles[o.role] || D.roles[D.defaultRole[o.pos] || 'MO'];
    o.role = o.role && D.roles[o.role] ? o.role : D.defaultRole[o.pos] || 'MO';
    o.pos = role.grp;
    // rolün en önemli iki yeteneği biraz önde başlar
    const top = Object.keys(role.w).sort((a, b) => role.w[b] - role.w[a]);
    const alias = D.attrAlias;
    Object.keys(D.attrs).forEach((k) => {
      let v = og.attr.base + F.ri(-4, 4) + (og.attr.bonus[k] || og.attr.bonus[alias[k]] || 0) * (og.attr.bonus[k] ? 1 : 0.6);
      if (k === top[0]) v += 7; else if (k === top[1]) v += 5; else if (k === top[2]) v += 3;
      if (D.keeperAttrs.includes(k) && o.pos !== 'KL') v = F.ri(10, 20);
      if (o.pos === 'KL' && D.keeperAttrs.includes(k)) v = og.attr.base + 10 + F.ri(-3, 3);
      if (o.pos === 'KL' && ['sut', 'dribling', 'bitiricilik', 'hucumPoz', 'vole', 'uzakSut'].includes(k)) v -= 8;
      if (o.pos === 'DF' && D.attrGroupOf[k] === 'sav') v += 6;
      if (o.pos === 'FV' && D.attrGroupOf[k] === 'sut') v += 5;
      if (o.pos === 'OS' && D.attrGroupOf[k] === 'pas') v += 5;
      attrs[k] = F.clamp(Math.round(v), 5, 99);
    });
    // oyuncunun başlangıçta dağıttığı yetenek puanları
    if (o.alloc) Object.keys(o.alloc).forEach((k) => { if (attrs[k] != null) attrs[k] = F.clamp(attrs[k] + Math.min(D.allocMax || 8, Math.max(0, o.alloc[k] | 0)), 5, 99); });
    const soft = {};
    Object.keys(D.softs).forEach((k) => (soft[k] = F.clamp(og.soft[k] + F.ri(-5, 5), 1, 99)));
    const life = Object.assign({ enerji: 85, form: 0 }, og.life);
    Object.keys(life).forEach((k) => { if (k !== 'form') life[k] = F.clamp(life[k] + F.ri(-4, 4), 0, 100); });
    let pot = F.ri(og.pot[0], og.pot[1]);
    if (inherit && inherit.pot) pot = inherit.pot;
    S.P = {
      name: o.name || F.maleName(), surname: o.surname || F.surname(), origin: og.id, originName: og.name, pos: o.pos, role: o.role, formation: o.formation || '4-4-2',
      age: og.age, birthYear: S.year - og.age, home: null,
      attrs, soft, life, pot, money: og.money, followers: F.ri(og.followers[0], og.followers[1]), dil: og.id === 'gurbetci' ? 70 : F.ri(5, 25),
      traits: {}, injury: null, suspended: 0, natTeam: og.id === 'gurbetci' ? null : 'TR', caps: 0, u21: 0, contract: null,
      routine: Object.assign({}, D.routineDefault), owned: [], subs: [], playRole: null, roleExp: {},
      look: o.look || Object.assign(F.ART ? F.ART.randomLook(false) : {}, inherit && inherit.look ? { skin: inherit.look.skin } : {}),
      number: o.number || { KL: 1, STP: 4, SLB: 3, SGB: 2, SLKB: 3, SGKB: 2, DOS: 6, MO: 8, OOS: 10, SLO: 11, SGO: 7, SLK: 11, SGK: 7, SF: 9, IF: 10 }[o.role] || 10,
      career: { apps: 0, goals: 0, assists: 0, clean: 0, reds: 0, titles: [], promotions: 0, seasons: [], clubs: [], caps: 0 },
      peak: 0
    };
    og.flags.forEach((f) => (S.flags[f] = 1));
    S.P.peak = F.ovr();
  };

  F.createFamily = function (og) {
    const S = F.S;
    const sur = S.P.surname;
    const fatherType = og.father;
    if (fatherType !== 'yok') F.addNpc('baba', { name: F.maleName() + ' ' + sur, type: fatherType, rel: fatherType === 'sert' ? 5 : 25, age: S.P.age + F.ri(24, 32) });
    F.addNpc('anne', { name: F.femaleName() + ' ' + sur, type: 'sefkatli', rel: 45, age: S.P.age + F.ri(21, 28) });
    if (og.id !== 'akademi' || F.chance(0.5)) {
      const female = F.chance(0.5);
      F.addNpc('kardes', { name: (female ? F.femaleName() : F.maleName()) + ' ' + sur, female, type: F.pick(['okuyan', 'sorunlu', 'hayran']), rel: 30, age: S.P.age + F.ri(-6, 4) });
    }
    if (fatherType === 'yok') S.flags.babasiz = 1;
  };

  F.addNpc = function (role, o) {
    const S = F.S;
    const id = F.uid('n');
    if (role && S.roles[role] && S.npcs[S.roles[role]] && S.npcs[S.roles[role]].role === role) S.npcs[S.roles[role]].role = 'eski_' + role;
    S.npcs[id] = Object.assign({ id, role, rel: 0, mem: [], age: 30 }, o);
    if (role) S.roles[role] = id;
    return S.npcs[id];
  };
  F.npc = (role) => (F.S.roles[role] ? F.S.npcs[F.S.roles[role]] : null);

  F.assignStartClub = function (og, o) {
    const S = F.S;
    let candidates;
    if (og.start.big) {
      candidates = Object.values(S.world.teams).filter((t) => t.big && t.country === 'TR');
    } else {
      const c = og.start.c, tier = og.start.t;
      const comps = Object.values(S.world.comps).filter((k) => k.c === c && k.tier === tier);
      candidates = [].concat(...comps.map((k) => k.teams)).map(F.team);
      const regional = candidates.filter((t) => og.regions.includes(t.region));
      if (regional.length) candidates = regional;
    }
    // oyuncunun seçtiği memleket: yakın kulüpler öne çıkar, memleket kulübü o ligdeyse büyük ihtimalle orada başlar
    const hp = o && o.home ? (D.homePlaces || D.places).find((x) => x.name === o.home) : null;
    if (hp && !og.start.big) {
      const all = Object.values(S.world.comps).filter((k) => k.c === og.start.c && k.tier === og.start.t).reduce((a, k) => a.concat(k.teams.map(F.team)), []);
      const near = all.filter((t) => t.region === hp.region);
      if (near.length) candidates = near;
      const own = all.find((t) => t.name === hp.name || t.province === hp.name);
      if (own && F.chance(0.55)) candidates = [own];
    }
    const chosen = o && o.club && S.world.teams[o.club] ? F.team(o.club) : null;
    const team = chosen || F.pick(candidates);
    // memleket: köken bölgesinden bir yer (Almanya için Duisburg)
    if (og.id === 'gurbetci') S.P.home = { name: 'Duisburg', province: 'Duisburg', region: 'DE', roots: F.pick(D.places.filter((p) => p.size <= 3)).name };
    else if (og.start.big) { const pl = F.pick(D.places.filter((p) => p.province === 'İstanbul')); S.P.home = { name: pl.name, province: 'İstanbul', region: 'MAR' }; }
    else S.P.home = { name: team.name, province: team.province, region: team.region };
    if (hp) { if (og.id === 'gurbetci') S.P.home.roots = hp.name; else S.P.home = { name: hp.name, province: hp.province, region: hp.region }; }
    if (og.id === 'koy') { S.P.home.village = F.pick(['Yukarıkonak', 'Taşlıçay', 'Karapınar', 'Dereboyu', 'Ortaköy', 'Kaleiçi', 'Yayladüzü']) + ' köyü'; }
    const tier = F.tierOf(team.id);
    const wage = F.wageFor(tier.c, tier.t, team.str, F.ovr()) * (og.start.big ? 0.25 : 0.8);
    const role = og.start.big ? 'yedek' : F.ovr() >= team.str - 2 ? 'as' : 'rotasyon';
    S.P.contract = { team: team.id, wage: Math.round(wage), years: og.start.big ? 3 : 2, role };
    S.P.career.clubs.push(team.id);
    F.clubNpcs(true);
  };

  // Kulübünü seçtiğin kökenler için aday kulüpler (aynı tohumla dünya önceden kurulur)
  F.startClubOptions = function (originId, seed) {
    const og = D.origins.find((x) => x.id === originId);
    if (!og || !og.pickClub) return [];
    const keep = F.S;
    F.S = F.newState(seed);
    F.genWorld();
    const comps = Object.values(F.S.world.comps).filter((k) => k.c === 'TR' && og.pickClub.includes(k.tier));
    let teams = [].concat(...comps.map((k) => k.teams.map((id) => Object.assign({ tier: k.tier, league: F.leagueName ? null : null }, F.S.world.teams[id]))));
    const regional = teams.filter((t) => og.regions.includes(t.region));
    const pick = [];
    const pool = F.shuffle(regional.length >= 4 ? regional : teams);
    og.pickClub.forEach((tr) => { pool.filter((t) => t.tier === tr).slice(0, og.pickClub.length > 1 ? 2 : 4).forEach((t) => pick.push(t)); });
    const out = pick.slice(0, 6).map((t) => ({ id: t.id, name: t.name, colors: t.colors, str: t.str, tier: t.tier, province: t.province, tierName: D.leagues.TR.tiers[t.tier - 1].name }));
    F.S = keep;
    return out;
  };
  F.wageFor = function (c, t, teamStr, ovr) {
    const tier = F.tierDef(c, t);
    const frac = F.clamp((ovr - tier.str[0]) / (tier.str[1] - tier.str[0] + 6), 0, 1.3);
    return Math.round(tier.wage[0] + frac * (tier.wage[1] - tier.wage[0]));
  };

  // Kulüp değişince hoca, başkan, kaptan, kanka, rakip yeniden oluşur
  F.clubNpcs = function (first) {
    const S = F.S;
    const abroad = F.isAbroad();
    const nm = () => (abroad && F.chance(0.6) ? F.foreignName() : F.fullName());
    ['kaptan', 'kanka', 'rakip'].forEach((r) => {
      const old = F.npc(r);
      if (old && !first) { old.role = 'eski_' + r; old.formerTeam = old.teamId; S.exMates.push(old.id); delete S.roles[r]; }
    });
    const tm = S.P.contract.team;
    F.newCoach(true);
    F.addNpc('baskan', { name: F.fullName(), type: F.pick(['babacan', 'populist', 'cimri', 'hirsli']), rel: 5, age: F.ri(45, 70), teamId: tm });
    F.addNpc('kaptan', { name: nm(), type: F.pick(['sert', 'babacan', 'sessiz']), rel: 0, age: F.ri(29, 35), teamId: tm });
    F.addNpc('kanka', { name: nm(), type: F.pick(['sakaci', 'sadik', 'partici']), rel: 15, age: S.P.age + F.ri(-2, 3), teamId: tm });
    F.addNpc('rakip', { name: nm(), type: F.pick(['kibirli', 'centilmen', 'kiskanc']), rel: -5, age: S.P.age + F.ri(-3, 5), teamId: tm, pos: S.P.pos });
    S.mates = [F.npc('kaptan').name, F.npc('kanka').name, F.npc('rakip').name, nm(), nm(), nm(), nm()];
    if (!F.npc('gazeteci') || abroad !== !!S.flags.medya_yurtdisi) {
      F.addNpc('gazeteci', { name: !abroad && D.journalists ? F.pickJournalist().name : F.fullName(), type: 'yerel', rel: 0, age: F.ri(28, 60) });
      F.addNpc('magazinci', { name: F.fullName(F.chance(0.5)), type: 'magazin', rel: 0, age: F.ri(25, 45) });
      if (abroad) S.flags.medya_yurtdisi = 1; else delete S.flags.medya_yurtdisi;
    }
    S.rel.takim = first ? 5 : Math.round(S.rel.takim * 0.3);
    S.rel.taraftar = Math.round(S.rel.taraftar * 0.2);
  };

  F.newCoach = function (silent) {
    const S = F.S;
    const types = ['babacan', 'diktator', 'taktik', 'genc', 'yildiz'];
    const old = F.npc('hoca');
    if (old) { old.role = 'eski_hoca'; S.exMates.push(old.id); }
    const name = F.isAbroad() && F.chance(0.7) ? F.foreignName() : F.fullName();
    F.addNpc('hoca', { name, type: F.pick(types), rel: 0, age: F.ri(38, 66), teamId: S.P.contract.team });
    if (!silent) F.addFeed({ who: 'Spor Haber', t: F.myTeam().name + ' yeni teknik direktörü ' + name + ' ile anlaştı.', kind: 'news' });
  };
  D.coachTypes = {
    babacan: { name: 'Babacan', desc: 'Oyuncularını evladı gibi görür. Sert çıkışları affeder.' },
    diktator: { name: 'Diktatör', desc: 'Disiplin her şeydir. Gece hayatını asla affetmez.' },
    taktik: { name: 'Taktik Delisi', desc: 'Video analizi ve taktik antrenmanı sever.' },
    genc: { name: 'Gençlere Güvenen', desc: '22 yaş altındakilere şans verir.' },
    yildiz: { name: 'Yıldız Seven', desc: 'Şöhreti ve gücü yüksek olanı oynatır.' }
  };

  /* =========================================================
     OYUNCU HESAPLARI
     ========================================================= */
  F.role = (P) => { P = P || F.S.P; return D.roles[P.role] || D.roles[D.defaultRole[P.pos] || 'MO']; };
  F.posW = (P) => F.role(P).w;
  /* ---------- Mevki sistemi: ana mevki, takımın dizilişi, sahadaki mevki ve uyum ---------- */
  F.teamFormation = function (teamId) {
    const t = F.team(teamId || F.S.P.contract.team);
    if (!t) return D.formations[0];
    if (!t.formation) {
      // takım kimliğinden kararlı bir diziliş: her takımın kendi sistemi var
      let h = 0; String(t.id).split('').forEach((c) => (h = (h * 31 + c.charCodeAt(0)) >>> 0));
      const ids = Object.keys(D.formationWeights);
      const tot = ids.reduce((x, k) => x + D.formationWeights[k], 0);
      let r = h % tot;
      t.formation = ids.find((k) => (r -= D.formationWeights[k]) < 0) || '4-4-2';
    }
    return D.formations.find((f) => f.id === t.formation) || D.formations[0];
  };
  F.formRoles = (fm) => [...new Set((fm || F.teamFormation()).spots.map((x) => x[2]))];
  // sahada şu an oynadığın mevki: geçici (sakatlık), hocanın verdiği, ya da ana mevkin
  F.curRole = function () {
    const S = F.S, P = S.P;
    if (S.tempRole && S.tempRole.until >= S.t) return S.tempRole.role;
    return P.playRole || P.role;
  };
  F.roleFit = function (role, P) {
    P = P || F.S.P;
    const base = role === P.role ? 1 : ((D.roleFit[P.role] || {})[role] || 0.35);
    const exp = ((P.roleExp || {})[role] || 0) / 100;
    return Math.max(base, Math.min(1, exp));
  };
  // dizilişte yoksa (ana mevkinde ısrar) forma şansı düşer
  F.inSystem = (role) => F.formRoles().includes(role);
  F.ovrAs = function (role, P) {
    P = P || F.S.P;
    const w = (D.roles[role] || F.role(P)).w;
    let s = 0;
    Object.keys(w).forEach((k) => (s += (P.attrs[k] || 0) * w[k]));
    return Math.round(s);
  };
  // takım dizilişine göre mevki kontrolü: gerekiyorsa hoca konuşur
  F.checkRoleFit = function (silent) {
    const S = F.S, P = S.P;
    const fm = F.teamFormation();
    const roles = F.formRoles(fm);
    if (roles.includes(P.role)) { if (P.playRole && P.playRole !== P.role && !roles.includes(P.playRole)) P.playRole = null; if (P.playRole && P.playRole !== P.role && !silent) return; P.playRole = P.playRole && roles.includes(P.playRole) ? P.playRole : null; return; }
    if (P.playRole && roles.includes(P.playRole)) return; // zaten sistemde bir yeri var
    const fit = D.roleFit[P.role] || {};
    const opts = roles.filter((r) => r !== 'KL' || P.role === 'KL').sort((a, b) => (fit[b] || 0.35) - (fit[a] || 0.35));
    if (!opts.length) return;
    // çok yakın bir mevki varsa (ör. sol bek → sol kanat bek) hoca sormadan oraya koyar
    if ((fit[opts[0]] || 0) >= 0.85) {
      P.playRole = opts[0];
      if (!silent) F.addDM(F.npc('hoca') ? F.npc('hoca').name : 'Hoca', 'Sistemimiz ' + fm.id + '. Seni ' + D.roles[opts[0]].name.toLowerCase() + ' olarak oynatacağım, senin için çok farklı değil.');
      return;
    }
    S.roleOffer = opts.slice(0, 2);
    if (!silent) F.queueEvent('hoca_mevki_istegi', true);
    else P.playRole = opts[0];
  };

  F.ovr = function (P) {
    P = P || F.S.P;
    const w = F.posW(P);
    let s = 0;
    Object.keys(w).forEach((k) => (s += P.attrs[k] * w[k]));
    return Math.round(s);
  };
  F.trait = (k) => (F.S.P.traits[k] || 0) >= 3;
  F.activeTraits = () => Object.keys(F.S.P.traits).filter((k) => F.trait(k));

  /* =========================================================
     DEĞER OKUMA / YAZMA
     ========================================================= */
  F.get = function (path) {
    const S = F.S, P = S.P;
    if (LIFE.includes(path)) return P.life[path];
    if (path === 'form') return P.life.form;
    if (path === 'para') return P.money;
    if (path === 'takipci') return P.followers;
    if (path === 'dil') return P.dil;
    if (path === 'ovr') return F.ovr();
    if (path === 'yas') return P.age;
    const [pre, key] = path.split('.');
    if (pre === 'a') return P.attrs[key];
    if (pre === 's') return P.soft[key];
    if (pre === 'r') return F.relGet(key);
    if (pre === 't') return P.traits[key] || 0;
    return 0;
  };

  F.relGet = function (k) {
    const S = F.S;
    if (AGG.includes(k)) return S.rel[k];
    const n = F.npc(k);
    return n ? n.rel : null;
  };
  F.relAdd = function (k, v) {
    const S = F.S;
    if (k === 'hoca') {
      const h = F.npc('hoca');
      if (h && h.type === 'babacan' && v < 0) v *= 0.7;
    }
    if (AGG.includes(k)) { S.rel[k] = F.clamp(S.rel[k] + v, -100, 100); return true; }
    const n = F.npc(k);
    if (!n) return false;
    n.rel = F.clamp(n.rel + v, -100, 100);
    if (['anne', 'baba', 'kardes'].includes(k)) S.rel.aile = F.clamp(S.rel.aile + v * 0.4, -100, 100);
    if (['kaptan', 'kanka', 'rakip'].includes(k)) S.rel.takim = F.clamp(S.rel.takim + v * 0.3, -100, 100);
    if (k === 'gazeteci' || k === 'magazinci') S.rel.medya = F.clamp(S.rel.medya + v * 0.4, -100, 100);
    return true;
  };

  F.label = function (k) {
    if (D.lifeLabels[k]) return D.lifeLabels[k];
    if (k === 'para') return 'Para';
    if (k === 'takipci' || k === 'takipci%') return 'Takipçi';
    if (k === 'dil') return 'Yabancı dil';
    const [pre, key] = k.split('.');
    if (pre === 'a') return D.attrs[key];
    if (pre === 's') return D.softs[key];
    if (pre === 'r') {
      const n = F.npc(key);
      return D.relLabels[key] + (n && ['hoca', 'kaptan', 'kanka', 'rakip', 'partner', 'menajer', 'baskan'].includes(key) ? '' : '');
    }
    if (pre === 't') return D.traits[key];
    return k;
  };

  /* =========================================================
     ETKİLER
     ========================================================= */
  // fx uygular, arayüz için okunabilir değişim listesi döner
  F.fx = function (fx, mult) {
    const S = F.S, P = S.P;
    const out = [];
    if (!fx) return out;
    mult = mult == null ? 1 : mult;
    Object.keys(fx).forEach((k) => {
      let v = fx[k];
      switch (k) {
        case 'flag': [].concat(v).forEach((f) => (S.flags[f] = (S.flags[f] || 0) + 1)); return;
        case 'unflag': [].concat(v).forEach((f) => delete S.flags[f]); return;
        case 'seed': [].concat(v).forEach((sd) => S.seeds.push({ id: sd.id, at: S.t + F.ri(sd.in[0], sd.in[1]), p: sd.p == null ? 1 : sd.p })); return;
        case 'goto': F.queueEvent(v, true); return;
        case 'feed': [].concat(v).forEach((f) => F.addFeed(typeof f === 'string' ? { who: 'Spor Haber', t: F.tpl(f), kind: 'news' } : Object.assign({}, f, { t: F.tpl(f.t), who: F.tpl(f.who || 'Spor Haber') }))); return;
        case 'dm': [].concat(v).forEach((m) => F.addDM(F.tpl(m.from), F.tpl(m.t))); return;
        case 'album': F.addAlbum(F.tpl(v), 'event'); return;
        case 'req': F.addRequest(v); return;
        case 'do': [].concat(v).forEach((a) => { const [name, arg] = String(a).split(':'); if (F.ACT[name]) { const r = F.ACT[name](arg); if (r) out.push(...r); } else if (F.DEBUG) console.warn('Bilinmeyen eylem', a); }); return;
      }
      // para metinle de verilebilir: 'w2' = iki haftalık maaş, '-w0.3' = maaşın %30'u kadar harcama
      if (k === 'para' && typeof v === 'string') v = v.startsWith('-w') ? -F.scaleMoney(parseFloat(v.slice(2))) : v.startsWith('w') ? F.scaleMoney(parseFloat(v.slice(1))) : +v || 0;
      if (typeof v !== 'number') return;
      v *= mult;
      if (k === 'para') {
        if (v === 0) return;
        P.money += v;
        F.bankLog(v > 0 ? 'Gelir' : 'Harcama', v);
        out.push({ k, label: 'Para', v, money: true });
        return;
      }
      if (k === 'takipci') { P.followers = Math.max(0, P.followers + v); out.push({ k, label: 'Takipçi', v, abs: true }); return; }
      if (k === 'takipci%') { const d = Math.round(Math.max(200, Math.min(P.followers, F.followerTarget() * 1.2)) * v / 100); P.followers = Math.max(0, P.followers + d); out.push({ k, label: 'Takipçi', v: d, abs: true }); return; }
      if (k === 'dil') { P.dil = F.clamp(P.dil + v, 0, 100); out.push({ k, label: 'Yabancı dil', v }); return; }
      if (k === 'pot') { P.pot = F.clamp(P.pot + v, 30, 99); return; }
      if (k === 'form') { P.life.form = F.clamp(P.life.form + v, -10, 10); out.push({ k, label: 'Form', v }); return; }
      v = F.fxScale(k, v);
      if (LIFE.includes(k)) {
        const before = P.life[k];
        P.life[k] = F.clamp(before + v, 0, 100);
        const d = P.life[k] - before;
        if (Math.abs(d) >= 0.5) out.push({ k, label: D.lifeLabels[k], v: d });
        return;
      }
      const [pre, key] = k.split('.');
      if (pre === 'a') { const b = P.attrs[key]; P.attrs[key] = F.clamp(b + v, 1, 99); if (Math.abs(v) >= 0.5) out.push({ k, label: D.attrs[key], v: P.attrs[key] - b }); return; }
      // olaylardan gelen özellik artışları da XP olarak işlenir (1 puan ≈ 60 XP)
      if (pre === 'a' && v > 0) { const ups = F.addXp(key, Math.round(v * 60)); if (v >= 0.5) out.push({ k, label: D.attrs[key] + (ups ? '' : ' XP'), v: ups || Math.round(v * 60) }); return; }
      if (pre === 's') { const b = P.soft[key]; P.soft[key] = F.clamp(b + v, 0, 99); if (Math.abs(v) >= 0.5) out.push({ k, label: D.softs[key], v: P.soft[key] - b }); return; }
      if (pre === 'r') { if (F.relAdd(key, v)) out.push({ k, label: D.relLabels[key] || key, v, rel: true }); return; }
      if (pre === 't') { P.traits[key] = (P.traits[key] || 0) + v; if (P.traits[key] >= 3 && P.traits[key] - v < 3) out.push({ k, label: 'Yeni kişilik: ' + D.traits[key], v: 0, trait: true }); return; }
    });
    return out;
  };

  // Bir etkinin gerçekte ne kadar işleyeceği (şöhret tavanı, azalan getiri). Ekrandaki önizleme de bunu kullanır.
  F.fxScale = function (k, v) {
    const P = F.S.P;
    if (typeof v !== 'number' || v <= 0) return v;
    if (k === 'sohret') {
      // şöhret alt liglerde yavaş gelir ve ligin tavanına yaklaştıkça zorlaşır
      const ti = F.myTier();
      const cap = ti.c === 'TR' ? [100, 72, 55, 40, 28][ti.t - 1] : 100;
      const mul = ti.c === 'TR' ? [1, 0.8, 0.6, 0.45, 0.35][ti.t - 1] : 1.15;
      return v * mul * F.clamp((cap - P.life.sohret) / cap, 0, 1) * ((D.originMods[P.origin] || {}).fame || 1);
    }
    const [pre, key] = k.split('.');
    // kişisel yetenek ve ilişki artışları yükseldikçe azalır (azalan getiri)
    if (pre === 's' && key) return v * F.clamp((105 - P.soft[key]) / 80, 0.15, 1);
    if (pre === 'r' && key) { const cur = F.relGet(key); if (cur != null && cur > 0) return v * F.clamp((120 - cur) / 120, 0.2, 1); }
    return v;
  };
  // Önizleme: etkiyi uygulamadan, gerçekte değişecek miktarları döndürür
  F.previewFx = function (fx) {
    const P = F.S.P;
    const out = [];
    const spill = {};
    Object.keys(fx || {}).forEach((k) => {
      let v = fx[k];
      if (typeof v !== 'number' || ['pot'].includes(k)) return;
      v = F.fxScale(k, v);
      const [pre, key] = k.split('.');
      let d = v, unit = '';
      if (LIFE.includes(k)) d = F.clamp(P.life[k] + v, 0, 100) - P.life[k];
      else if (k === 'form') d = F.clamp(P.life.form + v, -10, 10) - P.life.form;
      else if (k === 'dil') d = F.clamp(P.dil + v, 0, 100) - P.dil;
      else if (pre === 's' && key) d = F.clamp(P.soft[key] + v, 0, 99) - P.soft[key];
      else if (pre === 'a' && key) { if (v > 0) { d = Math.round(v * 60); unit = ' XP'; } }
      else if (k === 'takipci%') { d = v; unit = '%'; }
      else if (pre === 'r' && key) {
        const cur = F.relGet(key);
        if (cur == null) return; // böyle biri hayatında yoksa gösterilmez
        if (key === 'hoca' && v < 0) { const h = F.npc('hoca'); if (h && h.type === 'babacan') v *= 0.7; }
        d = F.clamp(cur + v, -100, 100) - cur;
        // kankaya, kaptana ve aileye iyi gelen şey takımla ve aileyle ilişkini de biraz etkiler
        const agg = ['anne', 'baba', 'kardes'].includes(key) ? ['aile', 0.4] : ['kaptan', 'kanka', 'rakip'].includes(key) ? ['takim', 0.3] : key === 'gazeteci' ? ['medya', 0.4] : null;
        if (agg) spill[agg[0]] = (spill[agg[0]] || 0) + v * agg[1];
      }
      else if (pre === 't' || k === 'para') return;
      out.push({ k, v: d, unit });
    });
    Object.keys(spill).forEach((key) => { const e = out.find((o) => o.k === 'r.' + key); const cur = F.relGet(key); const add = F.clamp(cur + (e ? e.v : 0) + spill[key], -100, 100) - cur - (e ? e.v : 0); if (e) e.v += add; else if (Math.abs(add) >= 0.5) out.push({ k: 'r.' + key, v: add, unit: '' }); });
    return out;
  };
  // Etkinliğin bu hafta uygulayacağı etki: tekrar ettikçe getiri azalır ama sıfırlanmaz
  F.actGainMul = function (id) {
    // ilk tekrar haftası cezasız; üst üste ikinci haftadan sonra getiri düşmeye başlar
    const habit = Math.min(3, (F.S.actHist || {})[id] || 0);
    return 0.8 / (1 + 0.3 * Math.max(0, habit - 1));
  };
  F.actFx = function (id) {
    const a = D.activities.find((x) => x.id === id);
    const gainMul = F.actGainMul(id);
    const fx = {};
    Object.keys(a.fx).forEach((k) => { const v = a.fx[k]; fx[k] = typeof v === 'number' && v > 0 && k !== 'enerji' ? Math.round(v * gainMul * 10) / 10 : v; });
    if (a.hoca) { const h = F.npc('hoca'); fx['r.hoca'] = (fx['r.hoca'] || 0) + (h && a.hoca[h.type] != null ? a.hoca[h.type] : a.hoca._ || 0); }
    return fx;
  };

  /* =========================================================
     KOŞULLAR
     ========================================================= */
  const cmp = (val, spec) => {
    if (!Array.isArray(spec)) return val === spec;
    const [op, n] = spec;
    if (op === '>') return val > n;
    if (op === '<') return val < n;
    if (op === '>=') return val >= n;
    if (op === '<=') return val <= n;
    if (op === 'in') return val >= n[0] && val <= n[1];
    return false;
  };
  F.cond = function (c) {
    if (!c) return true;
    const S = F.S, P = S.P;
    for (const k of Object.keys(c)) {
      const v = c[k];
      let ok = true;
      switch (k) {
        case 'tier': { const ti = F.myTier(); ok = ti.c === 'TR' && v.includes(ti.t); if (!ok && c.orAbroad && ti.c !== 'TR') ok = true; break; }
        case 'orAbroad': break;
        case 'abroad': ok = F.isAbroad() === v; break;
        case 'country': ok = [].concat(v).includes(F.myTier().c); break;
        case 'minAge': ok = P.age >= v; break;
        case 'maxAge': ok = P.age <= v; break;
        case 'origin': ok = [].concat(v).includes(P.origin); break;
        case 'pos': ok = [].concat(v).includes(P.pos); break;
        case 'flag': ok = [].concat(v).every((f) => S.flags[f]); break;
        case 'noflag': ok = [].concat(v).every((f) => !S.flags[f]); break;
        case 'anyflag': ok = [].concat(v).some((f) => S.flags[f]); break;
        case 'stat': ok = Object.keys(v).every((p) => cmp(F.get(p), v[p])); break;
        case 'rel': ok = Object.keys(v).every((r) => { const x = F.relGet(r); return x != null && cmp(x, v[r]); }); break;
        case 'money': ok = cmp(P.money, v); break;
        case 'followers': ok = cmp(P.followers, v); break;
        case 'ovr': ok = cmp(F.ovr(), v); break;
        case 'partner': {
          const st = S.partner ? S.partner.stage : 0;
          if (v === 'none') ok = st === 0; else if (v === 'any') ok = st > 0; else ok = [].concat(v).includes(st);
          break;
        }
        case 'agent': ok = v ? !!S.agent : !S.agent; break;
        case 'agentTier': ok = !!S.agent && cmp(S.agent.tier, v); break;
        case 'week': ok = S.week >= v[0] && S.week <= v[1]; break;
        case 'season': ok = cmp(S.season, v); break;
        case 'injured': ok = !!P.injury === v; break;
        case 'owns': ok = [].concat(v).some((id) => P.owned.includes(id)); break;
        case 'noown': ok = ![].concat(v).some((id) => P.owned.includes(id)); break;
        case 'lux': ok = cmp(F.luxLevel(), v); break;
        case 'kids': ok = cmp(S.kids.length, v); break;
        case 'hocaType': { const h = F.npc('hoca'); ok = !!h && [].concat(v).includes(h.type); break; }
        case 'baskanType': { const b = F.npc('baskan'); ok = !!b && [].concat(v).includes(b.type); break; }
        case 'hasRole': ok = [].concat(v).every((r) => !!F.npc(r)); break;
        case 'clubFin': ok = cmp(F.myTeam().fin, v); break;
        case 'bigClub': ok = !!F.myTeam().big === v; break;
        case 'gen': ok = cmp(S.gen, v); break;
        case 'trait': ok = [].concat(v).every((t) => F.trait(t)); break;
        case 'notrait': ok = [].concat(v).every((t) => !F.trait(t)); break;
        case 'role': ok = P.contract.role === v; break;
        case 'pos_table': ok = cmp(F.myPos(), v); break;
        case 'formBelow': ok = P.life.form < v; break;
        case 'formAbove': ok = P.life.form > v; break;
        case 'nat': ok = v === null ? !P.natTeam : P.natTeam === v; break;
        case 'caps': ok = cmp(P.caps, v); break;
        case 'roundFrac': { const f = S.league.round / F.seasonRounds(); ok = f >= v[0] && f <= v[1]; break; }
        case 'contractYears': ok = cmp(P.contract.years, v); break;
        case 'loan': ok = !!P.contract.loanFrom === v; break;
        case 'chance': ok = F.rand() < v; break;
        case 'roleOffer': ok = !!S.roleOffer && S.roleOffer.length >= v; break;
        case 'squad': ok = !!S.preStatus && S.preStatus.t === S.t && [].concat(v).includes(S.preStatus.s); break;
        case 'nextOppFormer': { const fx = S.league && F.myFixture(); ok = !!fx && P.career.clubs.includes(fx.opp) === v; break; }
        case 'lm': {
          // son maçın koşulları: res, played, minGoals, minRating, maxRating, derby, nat, red, status
          const L = S.lastMatch;
          if (!L) { ok = false; break; }
          if (v.res && ![].concat(v.res).includes(L.res)) ok = false;
          if (v.played != null && L.played !== v.played) ok = false;
          if (v.status && ![].concat(v.status).includes(L.status)) ok = false;
          if (v.minGoals != null && L.goals < v.minGoals) ok = false;
          if (v.minRating != null && !(L.rating >= v.minRating)) ok = false;
          if (v.maxRating != null && !(L.rating != null && L.rating <= v.maxRating)) ok = false;
          if (v.derby != null && L.derby !== v.derby) ok = false;
          if (v.nat != null && !!L.nat !== v.nat) ok = false;
          if (v.red != null && !!L.red !== v.red) ok = false;
          if (v.vsFormer != null && (!!L.oppId && P.career.clubs.includes(L.oppId) && L.oppId !== P.contract.team) !== v.vsFormer) ok = false;
          break;
        }
        default:
          if (Array.isArray(v)) ok = cmp(F.get(k), v);
          else if (F.DEBUG) console.warn('Bilinmeyen koşul', k);
      }
      if (!ok) return false;
    }
    return true;
  };

  /* =========================================================
     ŞABLONLAR
     ========================================================= */
  F.tpl = function (s) {
    if (!s || typeof s !== 'string' || s.indexOf('{') < 0) return s;
    const S = F.S, P = S.P;
    return s.replace(/\{(\w+)(?:\|(\w+))?\}/g, (m, key, ek) => {
      let v = F.tplVal(key);
      if (v == null) return m;
      if (ek === 'a') v = F.ekA(v);
      else if (ek === 'da') v = F.ekDa(v);
      else if (ek === 'in') v = F.ekIn(v);
      return v;
    });
  };
  F.tplVal = function (key) {
    const S = F.S, P = S.P;
    const first = (n) => (n ? n.name.split(' ')[0] : null);
    switch (key) {
      case 'ad': return P.name;
      case 'soyad': return P.surname;
      case 'adsoyad': return P.name + ' ' + P.surname;
      case 'yas': return String(P.age);
      case 'kulup': return F.myTeam().name;
      case 'sehir': return F.myTeam().province;
      case 'stad': return F.myTeam().stadium;
      case 'memleket': return P.home ? P.home.name : '';
      case 'koy': return P.home && P.home.village ? P.home.village : (P.home ? P.home.name : '');
      case 'koken': return P.home && P.home.roots ? P.home.roots : P.home.name;
      case 'lig': return F.myTier().comp.name;
      case 'mevki': return F.role(P).name.toLowerCase();
      case 'rakipkulup': { const fx = S.league && F.myFixture(); return fx ? F.team(fx.opp).name : F.team(F.pick(S.league.teams.filter((t) => t !== P.contract.team))).name; }
      case 'buyukkulup': return F.pick(Object.values(S.world.teams).filter((t) => t.big && t.country === 'TR' && t.id !== P.contract.team)).name;
      case 'yabancikulup': return F.pick(Object.values(S.world.teams).filter((t) => t.country !== 'TR' && F.tierOf(t.id).t === 1)).name;
      case 'ustkulup': { const c = F.myTier(); const up = Object.values(S.world.comps).filter((k) => k.c === 'TR' && k.tier === Math.max(1, (c.c === 'TR' ? c.t : 2) - 1)); return F.team(F.pick(F.pick(up).teams)).name; }
      case 'takimarkadasi': return F.pick(S.mates || ['Murat']);
      case 'para_kucuk': return F.money(F.scaleMoney(1));
      case 'para_orta': return F.money(F.scaleMoney(5));
      case 'para_buyuk': return F.money(F.scaleMoney(25));
      case 'hocatip': { const h = F.npc('hoca'); return h ? D.coachTypes[h.type].name : ''; }
      case 'kardesi': { const k = F.npc('kardes'); return k ? (k.female ? 'kız kardeşin' : 'erkek kardeşin') : 'kuzenin'; }
      case 'partner': return first(F.npc('partner'));
      case 'partnerin': { const n = F.npc('partner'); return n ? n.job : ''; }
      case 'cocuk': return S.kids.length ? S.kids[S.kids.length - 1].name : '';
      case 'eskikanka': { const ids = S.exMates.filter((id) => S.npcs[id] && S.npcs[id].role === 'eski_kanka'); return ids.length ? S.npcs[F.pick(ids)].name : null; }
      case 'eskihoca': { const ids = S.exMates.filter((id) => S.npcs[id] && S.npcs[id].role === 'eski_hoca'); return ids.length ? S.npcs[F.pick(ids)].name : null; }
      case 'menajer': return S.agent ? first(F.npc('menajer')) : 'menajerin';
      case 'rakipoyuncu': return S.oppPlayer || 'Rakip oyuncu';
      case 'rakipad': return S.oppPlayer ? S.oppPlayer.split(' ')[0] : 'Rakip';
      case 'rakiptakim': return S.lastMatch ? S.lastMatch.opp : F.tplVal('rakipkulup');
      case 'skor': return S.lastMatch ? S.lastMatch.gf + '-' + S.lastMatch.ga : '';
      case 'dizilis': return F.teamFormation().id;
      case 'anamevki': return F.role(P).name.toLowerCase();
      case 'oneri1': return S.roleOffer && S.roleOffer[0] ? D.roles[S.roleOffer[0]].name.toLowerCase() : 'başka bir mevki';
      case 'oneri2': return S.roleOffer && S.roleOffer[1] ? D.roles[S.roleOffer[1]].name.toLowerCase() : 'başka bir mevki';
      case 'acilmevki': return S.tempOffer ? D.roles[S.tempOffer].name.toLowerCase() : 'başka bir mevki';
      case 'gelisim': return S.devPlan ? S.devPlan.focus.map((k) => D.attrs[k].toLowerCase()).join(', ') : 'temel yetenekler';
      case 'sonrakirakip': { const fx = S.league && F.myFixture(); return fx ? F.team(fx.opp).name : 'rakip'; }
      default: {
        if (S.roles[key]) return first(S.npcs[S.roles[key]]);
        if (key.endsWith('Tam') && S.roles[key.slice(0, -3)]) return S.npcs[S.roles[key.slice(0, -3)]].name;
        return null;
      }
    }
  };
  // Para miktarını lig seviyesine göre ölçekle (1 = bir haftalık maaş civarı)
  F.scaleMoney = (mul) => Math.round(Math.max(3000, F.S.P.contract.wage) * mul / 1000) * 1000;
  // senden istenen paralar (hediye, forma, borç, bağış…): maaşla büyür ama makul bir tavanı aşmaz.
  // "w0.1" en fazla ~32 bin, "w1" ~200 bin, "w3" ~480 bin TL. Yıldız olsan da kardeşin 10 forma için milyon istemez.
  F.costMoney = (mul) => {
    const raw = Math.max(3000, F.S.P.contract.wage) * mul;
    const cap = 200000 * Math.pow(Math.max(0.01, mul), 0.8);
    return Math.max(500, Math.round(Math.min(raw, cap) / 500) * 500);
  };

  /* =========================================================
     OLAYLAR
     ========================================================= */
  F.EV = {};
  F.indexEvents = function () {
    F.EV = {};
    D.events.forEach((ev) => {
      if (!ev.nodes) ev.nodes = { start: { t: ev.t, o: ev.o, who: ev.who } };
      ev.kind = ev.kind || 'card';
      if (F.EV[ev.id] && F.DEBUG) console.warn('Tekrarlanan olay', ev.id);
      F.EV[ev.id] = ev;
    });
  };

  F.canFire = function (ev, force) {
    const S = F.S;
    if (!ev) return false;
    if (S.seen[ev.id] != null) {
      if (!ev.rep) return false;
      if (S.t - S.seen[ev.id] < ev.rep) return false;
    }
    if (!force && (ev.chain || ev.daily || ev.post || ev.pre)) return false;
    if (!force && S.off && S.off[ev.id]) return false;
    return F.cond(ev.if);
  };

  F.makeEventStep = function (id) {
    const ev = F.EV[id];
    F.S.seen[id] = F.S.t;
    const step = { type: 'ev', id, node: 'start', log: [], kind: ev.kind };
    if (ev.kind === 'call') step.ringing = true;
    return step;
  };

  // Olayı kuyruğa ekler (front: hemen şu anki adımdan sonra)
  F.queueEvent = function (id, front) {
    const S = F.S;
    const ev = F.EV[id];
    if (!ev) { if (F.DEBUG) console.warn('Olay yok', id); return false; }
    if (!F.canFire(ev, true)) return false;
    const step = F.makeEventStep(id);
    if (front) S.queue.splice(S.queue.length ? 1 : 0, 0, step);
    else {
      // maç/hafta sonu adımlarından önce ekle
      let i = S.queue.findIndex((s) => s.type === 'match' || s.type === 'weekEnd');
      if (i < 0) i = S.queue.length;
      S.queue.splice(i, 0, step);
    }
    return true;
  };

  F.pickRandomEvents = function (n, exclude) {
    const S = F.S;
    const picked = [];
    for (let i = 0; i < n; i++) {
      const cands = D.events.filter((ev) => !picked.includes(ev.id) && !(exclude || []).includes(ev.id) && F.canFire(ev));
      const ev = F.wpick(cands, (e) => (e.w != null ? e.w : e.origin ? 40 : 10));
      if (!ev) break;
      picked.push(ev.id);
    }
    return picked;
  };

  F.visibleOptions = function (node) {
    return (node.o || []).filter((o) => F.cond(o.if)).map((o) => {
      const r = Object.assign({}, o);
      r.locked = false;
      if (o.req) {
        if (o.req.s && F.S.P.soft[o.req.s] < o.req.min) { r.locked = true; r.lockText = D.softs[o.req.s] + ' ' + o.req.min + ' gerekli'; }
        if (o.req.money && F.S.P.money < F.evalMoney(o.req.money)) { r.locked = true; r.lockText = F.money(F.evalMoney(o.req.money)) + ' gerekli'; }
        if (o.req.trait && !F.trait(o.req.trait)) { r.locked = true; r.lockText = D.traits[o.req.trait] + ' kişiliği gerekli'; }
        if (o.req.ovr && F.ovr() < o.req.ovr) { r.locked = true; r.lockText = 'Güç ' + o.req.ovr + ' gerekli'; }
      }
      if (o.chk) r.prob = F.chkProb(o.chk);
      return r;
    });
  };
  F.evalMoney = (m) => (typeof m === 'string' && m.startsWith('w') ? F.costMoney(parseFloat(m.slice(1))) : m);
  F.chkProb = function (chk) {
    const val = chk.s ? (F.S.P.soft[chk.s] != null ? F.S.P.soft[chk.s] : F.get(chk.s)) : F.get(chk.p);
    return F.clamp(0.5 + (val - chk.d) / 60, 0.08, 0.92);
  };
  F.chkLabel = (chk) => (chk.s && D.softs[chk.s]) || F.label(chk.s || chk.p);

  // Para miktarlarını şablondan çöz: "w3" = 3 haftalık maaş
  F.resolveFx = function (fx) {
    if (!fx) return fx;
    const out = {};
    Object.keys(fx).forEach((k) => {
      const v = fx[k];
      out[k] = k === 'para' && typeof v === 'string' ? (v.startsWith('-w') ? -F.costMoney(parseFloat(v.slice(2))) : F.scaleMoney(parseFloat(v.slice(1)))) : v;
    });
    return out;
  };

  F.choose = function (i) {
    const S = F.S;
    const step = S.queue[0];
    const ev = F.EV[step.id];
    const node = ev.nodes[step.node];
    const opts = F.visibleOptions(node);
    const opt = opts[i];
    if (!opt || opt.locked) return null;
    step.log.push({ who: F.tpl(node.who || ev.who || ''), t: F.tpl(node.t), npc: true });
    step.log.push({ me: true, t: F.tpl(opt.t), tone: opt.tone });
    let fx = Object.assign({}, F.resolveFx(opt.fx));
    let r = opt.r, next = opt.next, success = null;
    if (opt.chk) {
      success = F.rand() < F.chkProb(opt.chk);
      const br = success ? opt.ok || {} : opt.no || {};
      Object.assign(fx, F.resolveFx(br.fx) || {});
      if (br.r) r = br.r;
      if (br.next) next = br.next;
      if (success) F.fx({ ['s.' + (opt.chk.s || 'konusma')]: 0.6 });
    }
    // hoca tipine göre ton tepkisi
    if (opt.tone && ev.who === 'hoca') {
      const h = F.npc('hoca');
      if (h && h.type === 'diktator' && opt.tone === 'sert') fx['r.hoca'] = (fx['r.hoca'] || 0) - 5;
      if (h && h.type === 'babacan' && opt.tone === 'duygusal') fx['r.hoca'] = (fx['r.hoca'] || 0) + 3;
    }
    const deltas = F.fx(fx);
    if (S.wk) S.wk.deltas.push(...deltas);
    if (next && ev.nodes[next]) {
      if (r) step.log.push({ who: F.tpl(node.who || ev.who || ''), t: F.tpl(r), npc: true, result: true });
      step.node = next;
      step.lastDeltas = deltas;
      step.lastSuccess = success;
      return { cont: true, deltas, success };
    }
    step.done = true;
    step.result = { r: F.tpl(r || ''), deltas, success };
    return step.result;
  };

  F.answerCall = function (accept) {
    const S = F.S;
    const step = S.queue[0];
    const ev = F.EV[step.id];
    step.ringing = false;
    if (!accept) {
      const dec = ev.decline || { fx: { 'r.aile': -3 }, r: 'Telefon sustu. Sonra geri ararsın, belki.' };
      const deltas = F.fx(F.resolveFx(dec.fx));
      step.done = true;
      step.result = { r: F.tpl(dec.r || ''), deltas };
    }
  };

  F.advance = function () {
    const S = F.S;
    S.queue.shift();
    F.processAuto();
  };
  // Otomatik adımları işler (hafta sonu hesapları gibi)
  F.processAuto = function () {
    const S = F.S;
    let guard = 0;
    while (S.queue.length && guard++ < 20) {
      const s = S.queue[0];
      if (s.type === 'weekEnd') { S.queue.shift(); F.endWeek(); continue; }
      if (s.type === 'seasonEndAuto') { S.queue.shift(); F.endSeason(); continue; }
      if (s.type === 'newSeasonAuto') { S.queue.shift(); F.startSeason(false); continue; }
      if (s.type === 'offers' && (!S.offers || !S.offers.length) && S.P.contract.years > 0) { S.queue.shift(); continue; }
      if (s.type === 'match' && !s.nat && !s.cup && !s.m && (S.league.round >= F.seasonRounds() || !F.myFixture())) { S.queue.shift(); continue; }
      if (s.type === 'ev') {
        const ev = F.EV[s.id];
        if (!ev || (s.node === 'start' && !s.log.length && !F.cond(ev.if) && !s.forced)) { S.queue.shift(); continue; }
      }
      break;
    }
  };

  /* =========================================================
     SOSYAL MEDYA, MESAJ, ALBÜM, BANKA
     ========================================================= */
  F.addFeed = function (o) {
    const S = F.S;
    if (!o.me && (!o.kind || o.kind === 'fan' || o.kind === 'hate')) {
      S.feedCap = S.feedCap && S.feedCap.t === S.t ? S.feedCap : { t: S.t, n: 0 };
      if (S.feedCap.n >= 2) return;
      S.feedCap.n++;
    }
    const likes = o.likes != null ? o.likes : Math.round(F.rf(0.002, 0.03) * Math.max(500, S.P.followers) + F.ri(2, 60));
    S.feed.unshift({ id: F.uid('f'), who: o.who || F.handle(), handle: o.handle || '', t: o.t, kind: o.kind || 'fan', likes, week: S.t, me: !!o.me, img: o.img || null, comments: o.comments || null });
    if (S.feed.length > 80) S.feed.length = 80;
    if (!o.me) S.unread.feed++;
  };
  F.addDM = function (from, t) {
    const S = F.S;
    S.dms.unshift({ from, t, week: S.t, read: false });
    if (S.dms.length > 60) S.dms.length = 60;
    S.unread.dm++;
  };
  F.addChat = function (who, t) {
    const S = F.S;
    S.chat.push({ who, t, week: S.t });
    if (S.chat.length > 60) S.chat.shift();
    S.unread.chat++;
  };
  F.addAlbum = function (t, kind) {
    const S = F.S;
    S.album.unshift({ t, kind: kind || 'event', year: S.year, week: S.week, age: S.P.age, club: S.P.contract ? F.myTeam().name : '', colors: S.P.contract ? F.myTeam().colors : ['#333', '#999'] });
  };
  F.bankLog = function (t, v) {
    const S = F.S;
    S.bank.unshift({ t, v, week: S.t, label: 'S' + S.season + ' H' + S.week });
    if (S.bank.length > 50) S.bank.length = 50;
  };
  F.addNews = function (t) {
    F.S.news.unshift({ t: F.tpl(t), week: F.S.t });
    if (F.S.news.length > 30) F.S.news.length = 30;
  };

  /* =========================================================
     İSTEKLER (aile vb.)
     ========================================================= */
  F.addRequest = function (id) {
    const S = F.S;
    const def = D.requests.find((r) => r.id === id);
    if (!def || S.requests.some((r) => r.id === id)) return;
    // fiyat aralığı: istek ne olursa olsun bu aralığın dışına çıkmaz
    let cost = def.cost ? F.evalMoney(def.cost) : 0;
    if (def.price) cost = Math.round(F.clamp((cost || F.rf(def.price[0], def.price[1])) * F.rf(0.85, 1.15), def.price[0], def.price[1]) / 500) * 500;
    const city = F.myTeam() ? F.myTeam().province : '';
    const fill = (s) => F.tpl(String(s).replace(/{sehir}/g, city));
    S.requests.push({ id, at: S.t, until: S.t + (def.expire || 4), cost, who: fill(D.relLabels[def.who] ? '{' + def.who + 'Tam}' : def.who) });
    F.addDM(fill(D.relLabels[def.who] ? '{' + def.who + 'Tam}' : def.who), fill(def.t));
  };
  F.reqAnswer = function (i, accept) {
    const S = F.S;
    const rq = S.requests[i];
    if (!rq) return null;
    const def = D.requests.find((r) => r.id === rq.id);
    if (accept && rq.cost && S.P.money < rq.cost) return { err: 'Yeterli paran yok.' };
    S.requests.splice(i, 1);
    const fx = Object.assign({}, accept ? def.fx : def.nofx);
    if (accept && rq.cost) fx.para = -rq.cost;
    const deltas = F.fx(fx);
    return { deltas, r: F.tpl(accept ? def.yes : def.no) };
  };

  /* =========================================================
     LÜKS
     ========================================================= */
  F.item = (id) => D.shop.find((x) => x.id === id);
  F.luxLevel = function () {
    let m = 0;
    F.S.P.owned.forEach((id) => { const it = F.item(id); if (it && it.lux) m = Math.max(m, it.lux); });
    return m;
  };
  F.bestHouse = function () {
    let best = null;
    F.S.P.owned.forEach((id) => { const it = F.item(id); if (it && it.house && (!best || it.house > best.house)) best = it; });
    return best;
  };
  F.bestCar = function () {
    let best = null;
    F.S.P.owned.forEach((id) => { const it = F.item(id); if (it && it.cat === 'ulasim' && (!best || it.price > best.price)) best = it; });
    return best;
  };

  /* =========================================================
     HAFTA AKIŞI
     ========================================================= */
  F.planCost = function (actId) {
    const a = D.activities.find((x) => x.id === actId);
    if (!a) return 0;
    const ti = F.myTier();
    const mul = ti.c === 'TR' ? D.costMul.TR[ti.t - 1] : D.costMul.abroad;
    return Math.round(a.cost * mul);
  };
  F.slots = function () {
    const S = F.S;
    const fx = S.league ? F.myFixture() : null;
    return fx ? 3 : 4;
  };
  F.availableActivities = function () {
    return D.activities.filter((a) => F.cond(a.if));
  };

  F.beginWeek = function () {
    const S = F.S, P = S.P;
    S.wk = { deltas: [], moneyStart: P.money, notes: [], ovrStart: F.ovr(), train: null, acts: [] };
    const plan = S.plan;
    if (P.injury && plan.train !== 'dinlenme') plan.train = 'dinlenme';

    // Antrenman
    const load = D.loads[plan.load] || D.loads.normal;
    if (plan.train === 'dinlenme') {
      S.wk.deltas.push(...F.fx({ enerji: 22, saglik: 2 }));
    } else {
      S.wk.deltas.push(...F.fx({ enerji: -load.e }));
      const g = F.trainGain(plan.train, load.g);
      S.wk.train = g;
      if (load.inj && F.chance(load.inj * F.injMul())) F.injure(F.ri(1, 3), 'antrenman');
      // hoca talimatı
      if (S.order) {
        const followed = S.order.focus === plan.train;
        const h = F.npc('hoca');
        S.wk.deltas.push(...F.fx({ 'r.hoca': followed ? 3 : h && h.type === 'diktator' ? -4 : -1 }));
        if (!followed && h && h.type === 'diktator') S.wk.notes.push('Hoca talimatına uymadığını fark etti.');
      }
      const h = F.npc('hoca');
      if (plan.train === 'taktik') S.wk.deltas.push(...F.fx({ mental: 2, 'r.hoca': h && h.type === 'taktik' ? 4 : 2 }));
    }

    // Etkinlikler
    const triggered = [];
    plan.acts.slice(0, F.slots()).forEach((id) => {
      const a = D.activities.find((x) => x.id === id);
      if (!a || !F.cond(a.if)) return;
      const cost = F.planCost(id);
      if (cost > 0 && P.money < cost) { S.wk.notes.push(a.name + ' için paran yetmedi.'); return; }
      // Aynı etkinliği üst üste yapmak giderek daha az getirir; getiriler genel olarak ölçülü
      if (!S.actHist) S.actHist = {};
      const gainMul = F.actGainMul(id);
      const fx = F.actFx(id);
      S.actHist[id] = Math.min(3, (S.actHist[id] || 0) + 1);
      if (cost) fx.para = -cost;
      if (a.income === 'sponsor') fx.para = (fx.para || 0) + Math.round(Math.min(P.followers, 2e6) * F.rf(0.4, 0.9) * gainMul);
      S.wk.deltas.push(...F.fx(fx));
      S.wk.acts.push(id);
      if (a.train) F.trainGain(plan.train === 'dinlenme' || plan.train === 'taktik' ? 'fizik' : plan.train, a.train);
      if (a.injury && F.chance(a.injury * F.injMul())) F.injure(F.ri(1, 2), 'ekstra antrenman');
      if (a.partnerDate) S.wk.dated = true;
      if (a.interview) F.queueInterview();
      (a.risk || []).forEach((rk) => { if (F.chance(rk.p) && F.cond(rk.if)) triggered.push(rk.ev); });
    });

    // Kuyruk
    S.queue = [];
    const due = S.seeds.filter((s) => s.at <= S.t);
    S.seeds = S.seeds.filter((s) => s.at > S.t);
    due.forEach((s) => { if (F.chance(s.p)) F.queueEvent(s.id); });
    triggered.slice(0, 2).forEach((id) => F.queueEvent(id));
    const already = S.queue.length;
    // haftada genelde 1-2, bazen 3 olay
    const want = (F.chance(0.92) ? 1 : 0) + (F.chance(0.5) ? 1 : 0) + (F.chance(0.15) ? 1 : 0);
    const n = Math.max(0, want - already);
    F.pickRandomEvents(n).forEach((id) => F.queueEvent(id));

    F.agentWeekly();
    F.maybeSpawnRequest();
    F.maybeConvo();

    // Kış transfer dönemi (devre arası)
    if (S.league.round === Math.floor(F.seasonRounds() / 2) && !S.winterDone) {
      S.winterDone = S.season;
      const offers = F.genOffers('kis');
      if (offers.length) { S.offers = offers; S.queue.push({ type: 'offers', window: 'kis' }); }
    }
    // Takımda sakatlık: hoca ara sıra başka bir yerde oynamanı ister
    if (S.tempRole && S.tempRole.until < S.t) { S.tempRole = null; F.queueEvent('hoca_mevki_donus'); }
    if (!S.tempRole && !P.injury && P.role !== 'KL' && F.chance(0.045) && S.league && S.league.round > 2) {
      const cur = F.curRole();
      const fit = D.roleFit[P.role] || {};
      const cands = F.formRoles().filter((r) => r !== cur && r !== 'KL' && (fit[r] || 0) >= 0.5);
      if (cands.length) { S.tempOffer = F.pick(cands); F.queueEvent('hoca_acil_mevki', true); }
    }
    // Devre arası: sezonun yarısında iki hafta lig oynanmaz, oyuncular dinlenir
    const winterBreak = F.isWinterBreak();
    if (winterBreak) {
      S.wb.left--;
      S.wk.notes.push('Devre arası: lig tatilde. Dinlendin ve toparlandın.');
      S.wk.deltas.push(...F.fx({ enerji: 15, moral: 3, saglik: 2 }));
    }
    // Milli ara: o hafta lig oynanmaz, çağrıldıysan sadece milli maç vardır
    const natBreak = !winterBreak && F.isNatBreak();
    if (natBreak) {
      S.natBreakDone = S.season + ':' + S.league.round;
      // milli takım takvimi: bu aranın eleme maçları oynanır; önce milli ara ekranı, sonra (çağrıldıysan) maçların
      const natSteps = F.natBreakSteps ? F.natBreakSteps() : null;
      if (natSteps) natSteps.forEach((st) => S.queue.push(st));
      else if (F.calledUp()) S.queue.push({ type: 'match', nat: true, pre: true });
      if (!F.calledUp()) S.wk.notes.push('Milli ara: lig bu hafta oynanmıyor. Kulüpte antrenmana devam ettin.');
    }
    const fxt = !natBreak && !winterBreak && S.league.round < F.seasonRounds() ? F.myFixture() : null;
    if (fxt) {
      S.preStatus = { t: S.t, s: F.rollStatus({ nat: false, myStr: F.myTeam().str }) };
      // maç öncesi gerginlik: rakipten mesaj, tünelde bakışma, hocanın taktik notu…
      if (F.chance(0.4)) {
        S.oppPlayer = F.isAbroad() && F.chance(0.6) ? F.foreignName() : F.fullName();
        const pool = D.events.filter((e) => e.pre && F.canFire(e, true));
        const ev = F.wpick(pool, (e) => e.w || 10);
        if (ev) S.queue.push(F.makeEventStep(ev.id));
      }
      S.queue.push({ type: 'match', pre: true });
    }
    // kupa haftası: Avrupa Yıldızlar Ligi maçı (hafta ortası)
    if (F.weekCupSteps) F.weekCupSteps(!!fxt).forEach((st) => S.queue.push(st));
    S.queue.push({ type: 'weekEnd' });
    F.processAuto();
  };

  F.injMul = function () {
    const S = F.S;
    let m = 1;
    if (S.flags.kirilgan) m *= 1.5;
    S.P.owned.forEach((id) => { const it = F.item(id); if (it && it.injMul) m *= it.injMul; });
    (S.P.subs || []).forEach((x) => { const it = F.item(x.id); if (it && it.injMul) m *= it.injMul; });
    const R = Object.assign({}, D.routineDefault, S.P.routine);
    Object.keys(D.routines).forEach((k) => { const op = D.routines[k].opts[R[k]]; if (op && op.injMul) m *= op.injMul; });
    m *= 1 + (60 - S.P.life.saglik) / 100;
    return Math.max(0.2, m);
  };

  /* ---------- Deneyim puanı (XP) ile gelişim ----------
     Her özellik XP biriktirir; dolunca 1 puan artar. Özellik yükseldikçe ve potansiyele yaklaştıkça
     bir sonraki puan için gereken XP büyür: geliştikçe gelişmek zorlaşır. */
  F.xpNeed = function (attr) {
    const P = F.S.P;
    const v = Math.floor(P.attrs[attr]);
    // başta hızlı; 65 üstünde gereken XP karesel artar, 80 sonrası çok zorlaşır
    let need = 40 + Math.max(0, v - 40) * 1.5 + Math.pow(Math.max(0, v - 65), 2) * 0.6 + Math.pow(Math.max(0, v - 74), 2.4) * 0.9;
    if (v >= P.pot - 2) need *= 1 + (v - P.pot + 3) * 0.35;
    return Math.round(need);
  };
  F.addXp = function (attr, xp) {
    const P = F.S.P;
    if (!P.xp) P.xp = {};
    P.attrs[attr] = Math.floor(P.attrs[attr]);
    P.xp[attr] = (P.xp[attr] || 0) + xp;
    let ups = 0;
    while (P.xp[attr] >= F.xpNeed(attr) && P.attrs[attr] < 99) { P.xp[attr] -= F.xpNeed(attr); P.attrs[attr]++; ups++; }
    return ups;
  };
  F.ageXp = function () {
    const a = F.S.P.age;
    const late = F.S.P.origin === 'gec' ? 0.2 : 0;
    return a <= 19 ? 1.75 : a <= 21 ? 1.35 : a <= 23 ? 1.05 : a <= 27 ? 0.8 + late : a <= 30 ? 0.5 + late : 0.28;
  };
  F.trainGain = function (attr, mul) {
    const S = F.S, P = S.P;
    if (!D.attrs[attr]) return null;
    let tm = 1;
    P.owned.forEach((id) => { const it = F.item(id); if (it && it.trainMul) tm *= it.trainMul; });
    (P.subs || []).forEach((x) => { const it = F.item(x.id); if (it && it.trainSub) tm *= 1 + it.trainSub; });
    const disc = 0.85 + P.life.disiplin / 300;
    const om = ((D.originMods[P.origin] || {}).train || {});
    const orig = om[attr] || om[D.attrAlias[attr]] || om._ || 1;
    const dp = S.devPlan && S.devPlan.focus.includes(attr) ? 1.25 : 1;
    const offPos = D.keeperAttrs.includes(attr) && P.pos !== 'KL' ? 0.25 : 1;
    const xp = Math.round(60 * mul * F.ageXp() * disc * tm * orig * offPos * dp * (0.85 + F.rand() * 0.3));
    if (dp > 1) F.relAdd('hoca', 0.6);
    const ups = F.addXp(attr, xp);
    // mevkinin diğer özelliklerine küçük taşma
    const pw = F.posW(P);
    Object.keys(pw).forEach((k) => { if (k !== attr) F.addXp(k, Math.round(xp * 0.12)); });
    // aynı gruptaki kardeş yetenekler de biraz gelişir (ör. Kısa pas çalışınca Uzun pas)
    const g = D.attrGroups.find((x) => x.id === D.attrGroupOf[attr]);
    if (g) g.keys.forEach((k) => { if (k !== attr && !pw[k]) F.addXp(k, Math.round(xp * 0.08)); });
    return { attr, xp, ups, val: P.attrs[attr], prog: Math.round(P.xp[attr]), need: F.xpNeed(attr), plan: dp > 1 };
  };

  // Grup puanı (FIFA kartındaki büyük sayı): alt yeteneklerin ortalaması
  F.groupScore = function (gid, P) {
    P = P || F.S.P;
    const g = D.attrGroups.find((x) => x.id === gid);
    return Math.round(g.keys.reduce((t, k) => t + (P.attrs[k] || 0), 0) / g.keys.length);
  };
  // Teknik direktörün gelişim planı: mevkinde önemli olup en çok geride kaldığın üç yetenek
  F.makeDevPlan = function (silent) {
    const S = F.S, P = S.P;
    const w = F.posW(P);
    const ovr = F.ovr();
    const keys = Object.keys(w).sort((a, b) => w[b] * (ovr + 6 - P.attrs[b]) - w[a] * (ovr + 6 - P.attrs[a]));
    const focus = keys.slice(0, 3);
    const strong = Object.keys(w).sort((a, b) => P.attrs[b] - P.attrs[a])[0];
    const h = F.npc('hoca');
    const tone = h ? h.type : 'babacan';
    const names = focus.map((k) => D.attrs[k].toLowerCase());
    const role = F.role(P).name.toLowerCase();
    const msg = {
      diktator: `Bu sezon ${names[0]}, ${names[1]} ve ${names[2]} çalışacaksın. Tartışma yok.`,
      genc: `Seni iyi bir ${role} yapacak üç şey var: ${names.join(', ')}. Bunları çalışırsan sıçrarsın.`,
      yildiz: `${D.attrs[strong]} zaten iyi. Ama gerçek bir ${role} olmak için ${names.join(', ')} lazım.`
    }[tone] || `Bir ${role} olarak en çok ${names.join(', ')} konusunda gelişmen lazım. Antrenmanda bunlara odaklan.`;
    S.devPlan = { focus, msg, role: P.role, season: S.season, week: S.week };
    if (!silent && h) F.addDM(h.name, msg);
    return S.devPlan;
  };

  F.injure = function (weeks, src) {
    const S = F.S, P = S.P;
    if (P.injury) { P.injury.weeks = Math.max(P.injury.weeks, weeks); return; }
    const names = weeks <= 2 ? ['Kas zorlanması', 'Ayak bileği burkulması', 'Darbe'] : weeks <= 6 ? ['Arka adale yırtığı', 'Kasık sakatlığı', 'Diz bağı zorlanması'] : ['Menisküs yırtığı', 'Çapraz bağ zedelenmesi', 'Kırık'];
    P.injury = { weeks, name: F.pick(names), total: weeks };
    if (S.wk) S.wk.notes.push('Sakatlandın: ' + P.injury.name + ' (' + weeks + ' hafta)');
    F.addFeed({ who: 'Spor Haber', t: F.tpl('{kulup} cephesinde kötü haber: {adsoyad} ' + P.injury.name.toLowerCase() + ' nedeniyle ' + weeks + ' hafta yok.'), kind: 'news' });
    if (weeks >= 6) F.queueEvent('sakatlik_tedavi', true);
    else if (weeks >= 3) F.queueEvent('sakatlik_orta', true);
  };

  F.queueInterview = function () {
    const S = F.S;
    const qs = F.pickPress('roportaj', 2);
    if (qs.length) S.queue.push({ type: 'press', qs, i: 0, log: [], interview: true });
  };

  /* ---------- Hafta sonu ---------- */
  F.endWeek = function () {
    const S = F.S, P = S.P;
    const wk = S.wk || { deltas: [], moneyStart: P.money, notes: [] };
    const fin = { wage: 0, comm: 0, living: 0, upkeep: 0, income: 0, other: 0 };

    // Maaş
    if (S.flags.maas_gecikiyor) { S.owed = (S.owed || 0) + P.contract.wage; wk.notes.push('Maaş bu hafta da yatmadı. Alacağın: ' + F.money(S.owed)); }
    else fin.wage = P.contract.wage;
    if (S.agent && fin.wage) fin.comm = Math.round(fin.wage * S.agent.komisyon / 100 * (S.flags.menajer_gizli ? 1.6 : 1));
    // Yaşam
    const ti = F.myTier();
    const base = ti.c === 'TR' ? [9000, 4500, 2600, 1600, 1100][ti.t - 1] : 14000;
    fin.living = Math.round(base * (1 + F.luxLevel() * 0.15));
    P.routine = Object.assign({}, D.routineDefault, P.routine);
    let rcost = 0;
    Object.keys(D.routines).forEach((k) => { const op = D.routines[k].opts[P.routine[k]]; if (op && op.cost) rcost += op.cost; });
    const lm = (P.subs || []).reduce((m, x) => { const it = F.item(x.id); return it && it.livingMul ? m * it.livingMul : m; }, 1);
    fin.living = Math.round(fin.living * lm) + rcost;
    // Bakım ve yatırım gelirleri
    P.owned.forEach((id) => {
      const it = F.item(id);
      if (!it) return;
      if (it.upkeep) fin.upkeep += it.upkeep;
      if (it.income) fin.income += Math.round(F.rf(it.income[0], it.income[1]));
      if (it.incomeFollowers) fin.income += Math.round(P.followers * it.incomeFollowers);
      if (it.weekly) wk.deltas.push(...F.fx(it.weekly)); // haftalık bonus özette görünür
    });
    if (S.flags.aile_destek) fin.other -= F.scaleMoney(0.15);
    if (S.flags.is_var) fin.income += 2500;
    fin.loan = F.loanWeekly ? 0 : 0;
    const net = fin.wage - fin.comm - fin.living - fin.upkeep + fin.income + fin.other;
    P.money += net;
    F.bankLog('Haftalık net (maaş, gider, gelir)', net);
    if (S.loan && F.loanWeekly) fin.loan = F.loanWeekly(wk);
    wk.fin = fin;

    // Rutin: her hafta işler ve hafta özetinde görünür
    Object.keys(D.routines).forEach((k) => { const op = D.routines[k].opts[P.routine[k]]; if (op && op.fx && Object.keys(op.fx).length) wk.deltas.push(...F.fx(op.fx)); });
    // Kişisel gelişim abonelikleri
    P.subs = (P.subs || []).filter((x) => {
      const it = F.item(x.id);
      if (!it) return false;
      if (it.weekly) wk.deltas.push(...F.fx(it.weekly));
      x.left--;
      if (x.left === 1) F.addDM(it.name, 'Aboneliğinin bitmesine bir hafta kaldı. Mağaza > Kişisel gelişim bölümünden uzatabilirsin.');
      if (x.left <= 0) { F.addDM(it.name, 'Aboneliğin sona erdi. Kaldığın yerden devam etmek istersen bekliyoruz.'); return false; }
      return true;
    });
    // ara sıra kampanya mesajı
    if (F.chance(0.06) && !(S.campaign && S.campaign.until >= S.t)) F.queueConvo('c_kurs_kampanya');

    // Toparlanma
    const house = F.bestHouse();
    F.fx({ enerji: 30 + (house ? house.house : 0) });
    if (P.injury) {
      P.injury.weeks--;
      if (P.injury.weeks <= 0) { wk.notes.push('Sakatlığın geçti, sahalara dönüyorsun.'); P.injury = null; F.fx({ moral: 6 }); }
    }
    if (P.suspended > 0) P.suspended--;

    // Alışkanlık sayaçları zamanla azalır (ara verince etkinlik yine tam getirir)
    if (S.week % 12 === 0) F.makeDevPlan();
    if (S.actHist) Object.keys(S.actHist).forEach((k) => { if (!wk.acts || !wk.acts.includes(k)) S.actHist[k] *= 0.5; });
    // Şöhret ligin tavanının üstündeyse yavaşça iner (alt ligde süperstar olunmaz)
    { const ti = F.myTier(); const cap = ti.c === 'TR' ? [100, 72, 55, 40, 28][ti.t - 1] : 100; if (P.life.sohret > cap) P.life.sohret -= (P.life.sohret - cap) * 0.08; }
    // İlişkilerin doğal seyri
    if (S.partner && S.partner.stage > 0 && !wk.dated) F.relAdd('partner', S.partner.stage >= 4 ? -1 : -2.5);
    if (!wk.acts || !wk.acts.includes('aile')) S.rel.aile = F.clamp(S.rel.aile - 0.6, -100, 100);
    S.rel.medya *= 0.97;
    S.rel.takim = S.rel.takim + (5 - S.rel.takim) * 0.02;
    // moral zamanla dengeye döner: kötü günler de iyi günler de geçer
    P.life.moral += (55 - P.life.moral) * 0.06;
    P.life.mental += (50 - P.life.mental) * 0.01;
    P.life.form *= 0.85;
    // Şöhret ve takipçi: takipçi, şöhretin belirlediği hedefe doğru yavaşça kayar
    const target = F.followerTarget();
    P.followers = Math.max(0, Math.round(P.followers + (target - P.followers) * (P.followers > target ? 0.05 : 0.03)));

    // Para krizi
    if (P.money < -F.scaleMoney(6) && !S.flags.haciz_yakin) { S.flags.haciz_yakin = 1; S.seeds.push({ id: 'haciz', at: S.t + 2, p: 1 }); }
    if (P.money >= 0 && S.flags.haciz_yakin) delete S.flags.haciz_yakin;

    // İstek süreleri
    S.requests = S.requests.filter((rq) => {
      if (rq.until > S.t) return true;
      const def = D.requests.find((r) => r.id === rq.id);
      if (def) { F.fx(def.nofx); wk.notes.push('Cevapsız kalan istek: ' + F.tpl(def.short || def.t)); }
      return false;
    });

    F.genWeeklyFeed();

    F.checkTasks('week');
    F.checkChallenge();

    // Yaşlanma: doğum günü sezon sonunda
    P.peak = Math.max(P.peak, F.ovr());
    const summary = {
      week: S.week, season: S.season, notes: wk.notes, deltas: F.mergeDeltas(wk.deltas), fin, net,
      moneyStart: wk.moneyStart, money: P.money, ovrStart: wk.ovrStart, ovr: F.ovr(), match: wk.match || null, train: wk.train
    };
    S.lastSummary = summary;
    S.t++;
    S.week++;
    S.order = F.makeOrder();
    S.wk = null;
    S.queue.unshift({ type: 'summary', data: summary });
    if (S.league.round >= F.seasonRounds()) S.queue.push({ type: 'seasonEndAuto' });
  };

  F.followerTarget = function () {
    const P = F.S.P;
    return (300 + Math.pow(P.life.sohret, 2.2) * 40) * (F.isAbroad() ? 3 : 1) * (1 + F.luxLevel() * 0.05);
  };

  F.mergeDeltas = function (list) {
    const m = {};
    list.forEach((d) => {
      if (d.trait) { m[d.label] = d; return; }
      if (!m[d.k]) m[d.k] = Object.assign({}, d);
      else m[d.k].v += d.v;
    });
    return Object.values(m).filter((d) => d.trait || Math.abs(d.v) >= 0.5);
  };

  F.makeOrder = function () {
    const S = F.S, P = S.P;
    const w = F.posW(P);
    const keys = Object.keys(w).sort((a, b) => P.attrs[a] - P.attrs[b]);
    const plan = S.devPlan && S.devPlan.focus;
    const focus = F.chance(0.25) ? 'taktik' : plan && plan.length ? F.pick(plan) : F.pick(keys.slice(0, 3));
    return { focus };
  };

  // milli ara 8., 16. ve 25. haftalardan önce bir kez gelir
  F.isNatBreak = () => { const S = F.S; return !!S.league && [8, 16, 25].includes(S.league.round) && S.league.round < F.seasonRounds() && S.natBreakDone !== S.season + ':' + S.league.round; };
  F.isNatWeek = F.isNatBreak;
  // devre arası: sezonun ortasında iki hafta
  F.isWinterBreak = () => {
    const S = F.S;
    if (!S.league) return false;
    const half = Math.floor(F.seasonRounds() / 2);
    if (S.league.round !== half) return false;
    if (!S.wb || S.wb.season !== S.season) S.wb = { season: S.season, left: 2 };
    return S.wb.left > 0;
  };
  F.calledUp = function () {
    const S = F.S, P = S.P;
    if (P.injury || !P.natTeam) return false;
    const ovr = F.ovr();
    if (P.natTeam === 'TR' || P.natTeam === 'DE') {
      const need = P.natTeam === 'DE' ? 80 : 73;
      if (P.age <= 21 && ovr >= need - 10) return true;
      return ovr >= need || (ovr >= need - 3 && P.life.sohret > 60);
    }
    return false;
  };

  /* ---------- Grup sohbeti, istek, menajer ---------- */
  /* Mesaj sohbetleri: ailen, kankan, partnerin, kaptan, menajer ara sıra yazar; cevabını Mesajlar'dan verirsin */
  F.convoWho = function (c) {
    const S = F.S;
    if (c.who === 'takimarkadasi') return F.pick(S.mates || ['Takım arkadaşın']);
    if (D.relLabels[c.who]) { const n = F.npc(c.who); return n ? n.name : null; }
    return c.who;
  };
  F.queueConvo = function (id) {
    const S = F.S;
    const c = D.convos.find((x) => x.id === id);
    if (!c) return false;
    const who = F.convoWho(c);
    if (!who) return false;
    S.convos = S.convos || [];
    S.convos.unshift({ id, who, role: D.relLabels[c.who] ? c.who : null, lines: c.lines.map((l) => F.tpl(l)), at: S.t, until: S.t + (c.wait || 3), ans: null });
    if (S.convos.length > 30) S.convos.length = 30;
    S.seen['cv_' + id] = S.t;
    return true;
  };
  F.maybeConvo = function () {
    const S = F.S;
    S.convos = S.convos || [];
    // cevaplanmamış sohbetler 4 hafta sonra düşer
    S.convos.forEach((c) => {
      const until = c.until != null ? c.until : c.at + 4;
      if (!c.ans && S.t > until) {
        const deltas = c.role && F.relGet(c.role) != null ? F.fx({ ['r.' + c.role]: -2 }) : [];
        c.ans = { t: '(Cevap vermedin)', r: c.role ? 'Mesajına geç kaldın, biraz kırıldı.' : '', deltas, missed: true };
      }
    });
    const n = (F.chance(0.6) ? 1 : 0) + (F.chance(0.2) ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const pool = D.convos.filter((c) => c.id !== 'c_kurs_kampanya' && (S.seen['cv_' + c.id] == null || S.t - S.seen['cv_' + c.id] > (c.rep || 40)) && F.cond(c.if) && F.convoWho(c));
      const c = F.pick(pool);
      if (c) F.queueConvo(c.id);
    }
  };
  F.convoReply = function (i, j) {
    const S = F.S;
    const c = S.convos[i];
    if (!c || c.ans) return null;
    const def = D.convos.find((x) => x.id === c.id);
    const opt = def && def.o[j];
    if (!opt) return null;
    const deltas = F.fx(opt.fx || {});
    c.ans = { t: F.tpl(opt.t), r: F.tpl(opt.r || ''), deltas };
    return c.ans;
  };
  F.maybeGroupChat = function () {
    const S = F.S;
    if (!F.chance(0.45)) return;
    const lines = D.social.groupChat.filter((g) => F.cond(g.if));
    const g = F.pick(lines);
    if (!g) return;
    const who = g.who === 'kaptan' ? F.npc('kaptan').name : g.who === 'kanka' ? F.npc('kanka').name : F.pick(S.mates);
    F.addChat(who, F.tpl(g.t));
  };
  F.maybeSpawnRequest = function () {
    const S = F.S;
    if (S.requests.length >= 2 || !F.chance(0.14)) return;
    const c = D.requests.filter((r) => F.cond(r.if) && !S.requests.some((x) => x.id === r.id) && (S.seen['rq_' + r.id] == null || S.t - S.seen['rq_' + r.id] > 30));
    const r = F.pick(c);
    if (r) { S.seen['rq_' + r.id] = S.t; F.addRequest(r.id); }
  };

  /* =========================================================
     KAYIT
     ========================================================= */
  F.serialize = () => JSON.stringify(F.S);
  F.load = function (json) {
    const S = typeof json === 'string' ? JSON.parse(json) : json;
    if (!S || !S.P || !S.world) throw new Error('Kayıt okunamadı');
    F.S = S;
    F.migrate(S);
    return S;
  };
  // eski kayıtlar: rol ve yeni yetenekler eklenir
  F.migrate = function (S) {
    const P = S.P;
    if (!P.role || !D.roles[P.role]) P.role = D.defaultRole[P.pos] || 'MO';
    if (!P.formation) P.formation = '4-4-2';
    P.routine = Object.assign({}, D.routineDefault, P.routine);
    P.subs = P.subs || [];
    S.convos = S.convos || [];
    P.roleExp = P.roleExp || {};
    // eski kayıt: Avrupa'da tek lig vardı, alt ligler ve yeni ülkeler eklenir
    F.migrateWorld(S);
    // eski kayıt: deden vefat ettiyse bunu hatırla (tavsiye olayı bir daha gelmesin)
    if (S.seen && S.seen.aile_dede_vefat != null) S.flags.dede_vefat = 1;
    // eski sürüm hatası: şike cezasında kulüpten kovulma uygulanmamıştı. 15 maçlık cezası sürüp hâlâ kulüpteyse şimdi uygula
    if (S.seen && S.seen.sike_ortaya != null && P.suspended > 8 && !S.flags.kovuldu && S.queue && !S.queue.some((q) => q.type === 'offers')) { S.queue = S.queue || []; S.queue.unshift({ type: 'noop' }); F.ACT && F.ACT.sacked && F.ACT.sacked(); S.queue.shift(); }
    if (P.playRole === undefined) { P.playRole = null; F.checkRoleFit(true); }
    const a = P.attrs;
    Object.keys(D.attrs).forEach((k) => { if (a[k] == null) { const base = a[D.attrAlias[k]] != null ? a[D.attrAlias[k]] : 40; a[k] = F.clamp(Math.round(base + (k.length % 5) - 2), 5, 99); } });
    if (!S.devPlan || S.devPlan.role !== P.role) F.makeDevPlan(true);
  };
  F.exportCode = function () {
    const s = F.serialize();
    try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return s; }
  };
  F.importCode = function (code) {
    code = code.trim();
    let json = code;
    if (code[0] !== '{') json = decodeURIComponent(escape(atob(code)));
    return F.load(json);
  };

  F.renameTeam = function (id, name) {
    const S = F.S;
    name = String(name || '').trim().slice(0, 32);
    if (!name || !S.world.teams[id]) return;
    S.world.teams[id].name = name;
    S.edits[id] = name;
  };

  F.monthName = function () {
    const S = F.S;
    const frac = S.league ? S.league.round / Math.max(1, F.seasonRounds()) : 0;
    return D.months[Math.min(9, Math.floor(frac * 10))];
  };
  F.seasonLabel = () => F.S.year + '–' + String(F.S.year + 1).slice(2);
})(typeof window !== 'undefined' ? window : globalThis);
