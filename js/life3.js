/* FORMA — yakın arkadaş ve gece hayatının sonuçları
   Yakın arkadaş: oyun başında memleketinden biri olarak oluşur, kulüp değişince değişmez. Tipine göre (sadık, belalı, akıllı)
   başını belaya sokan ya da seni beladan kurtaran olaylar gelir. Görüşmezsen ilişkiniz yavaş yavaş soğur.
   Gece hayatı: gece kulübüne gittiğin haftalar ailen, hocan ve partnerin duyabilir. Hocanın tepkisi tipine (diktatör çok kızar,
   babacan az), sana olan güvenine ve takımın son sonuçlarına göre değişir. Sık gidersen tepkiler büyür; partnerinle kriz çıkabilir. */
(function (root) {
  const F = root.F;
  const D = F.DATA;
  const TYPES = { sadik: 'Sadık', belali: 'Belalı', akilli: 'Akıllı' };
  D.dostTypes = TYPES;

  F.makeDost = function () {
    const S = F.S, P = S.P;
    if (F.npc('dost')) return F.npc('dost');
    const home = (P.home && (P.home.roots || P.home.name)) || '';
    return F.addNpc('dost', { name: F.fullName(), type: F.pick(Object.keys(TYPES)), rel: 35, age: P.age + F.ri(-1, 1), from: home });
  };
  const origFamily = F.createFamily;
  F.createFamily = function () {
    const r = origFamily.apply(this, arguments);
    try { F.makeDost(); } catch (e) { if (F.DEBUG) throw e; }
    return r;
  };
  const origMig = F.migrate;
  F.migrate = function (S) {
    const out = origMig.apply(this, arguments);
    try { if (S && S.P && !F.npc('dost')) F.makeDost(); } catch (e) { /* yoksay */ }
    return out;
  };

  const TROUBLE = ['dost_bahis', 'dost_kavga', 'dost_dogumgunu', 'dost_video', 'dost_ortaklik'];
  const RESCUE = ['dost_sakatlik', 'dost_para', 'dost_medya', 'dost_kurtardi', 'dost_yalniz', 'dost_form'];
  const NIGHT_ACTS = ['gece'];

  const coachMood = (h) => {
    // tip çarpanı × güven × son sonuç
    const typeMul = { diktator: 2, taktik: 1.2, genc: 1, yildiz: 0.8, babacan: 0.5 }[h.type] || 1;
    const trust = h.rel < -20 ? 1.4 : h.rel > 30 ? 0.75 : 1;
    const lm = F.S.lastMatch;
    const result = lm && lm.res === 'loss' ? 1.35 : lm && lm.res === 'win' ? 0.85 : 1;
    return typeMul * trust * result;
  };
  const COACH_DM = {
    diktator: ['Gece kulübünde olduğunu duydum. Benim takımımda bu iş yok. Bir daha olursa kadroda kendini arama.', 'Antrenmana uykusuz geldin. Bu son uyarım.'],
    taktik: ['Dün gece neredeydin? Analiz toplantısında gözlerin kapanıyordu.'],
    genc: ['Gençsin, eğlenmek istersin, anlıyorum. Ama kariyerin bunu kaldırmaz.'],
    yildiz: ['Yıldız olmak geceleri parlamakla olmuyor. Sahada parla.'],
    babacan: ['Evladım, duydum. Kızmıyorum ama kendine dikkat et, olur mu?']
  };
  const FAMILY_DM = ['Oğlum gece yarısı kulüpte fotoğrafların dolaşıyor. Konu komşu bize soruyor, utandık.', 'Biz seni bunun için mi büyüttük? Kendine gel.', 'Annen bütün gece uyumadı, telefonunu açmadın.'];

  function nightLife() {
    const S = F.S, P = S.P;
    const wk = S.wk;
    if (!wk) return;
    // gece hayatı Özel Hayat rutininde seçilir ("Gece hayatı" her hafta, "Dengeli" arada bir); eski kayıtlarda etkinlik de olabilir
    const sos = (P.routine || {}).sosyal;
    const out = sos === 'gece' || (sos === 'dengeli' && F.chance(0.12)) || (wk.acts || []).some((a) => NIGHT_ACTS.includes(a));
    if (!out) return;
    S.nightLog = (S.nightLog || []).filter((t) => S.t - t < 8);
    S.nightLog.push(S.t);
    const n = S.nightLog.length; // son 8 haftadaki gece sayısı (1-8)
    const matchWeek = S.queue.some((s) => s.type === 'match');
    // ailen
    if (F.chance(0.12 + n * 0.04)) {
      F.relAdd('aile', -(1.5 + n * 0.4));
      const who = F.npc(F.chance(0.5) ? 'anne' : 'baba') || F.npc('anne');
      if (who) { F.relAdd(who.role, -(2 + n * 0.6)); F.addDM(who.name, F.pick(FAMILY_DM)); }
      wk.notes.push('Ailen gece hayatını duydu ve kızdı.');
    }
    // hocan
    const h = F.npc('hoca');
    if (h && F.chance(Math.min(0.8, 0.15 + n * 0.05 + (matchWeek ? 0.12 : 0)))) {
      const mood = coachMood(h);
      const hit = -Math.min(12, Math.round((2 + n * 0.4) * mood));
      F.relAdd('hoca', hit);
      F.addDM(h.name, F.pick(COACH_DM[h.type] || COACH_DM.genc));
      wk.notes.push('Hocan gece hayatını öğrendi (' + D.coachTypes[h.type].name.toLowerCase() + ' hoca, ilişki ' + hit + ').');
      // sık gidiyorsan ve hoca sertse ceza
      if (mood >= 1.6 && n >= 3 && F.chance(0.4)) {
        const fine = F.costMoney(0.5);
        F.fx({ para: -fine, disiplin: -3, form: -1 });
        F.bankLog && F.bankLog('Gece hayatı para cezası', -fine);
        F.addDM(h.name, 'Kulüp seni ' + F.money(fine) + ' para cezasına çarptırdı. Bu hafta yedek kulübesinde düşüneceksin.');
        S.coachBench = S.t + 1;
      }
    }
    // partnerin: daha büyük kriz
    const pt = F.npc('partner');
    if (S.partner && S.partner.stage > 0 && pt) {
      F.relAdd('partner', -(1 + n * 0.5));
      if (F.chance(0.06 + n * 0.04)) F.queueEvent('gece_partner_kriz');
      else if (F.chance(0.2)) F.addDM(pt.name, F.pick(['Yine mi gece kulübü? Bana haber bile vermedin.', 'Arkadaşlarım seni dün gece görmüş. Konuşmamız lazım.']));
    }
  }

  function dostWeekly() {
    const S = F.S;
    const d = F.npc('dost');
    if (!d) return;
    // görüşmezsen soğur, görüştükçe ısınır
    const met = S.wk && S.wk.acts && S.wk.acts.includes('dost');
    if (!met) d.rel = F.clamp(d.rel - 0.4, -100, 100);
    if (!d.from && S.P.home) d.from = S.P.home.roots || S.P.home.name;
    const pT = { belali: 0.12, sadik: 0.05, akilli: 0.05 }[d.type] || 0.06;
    const pR = ({ belali: 0.04, sadik: 0.09, akilli: 0.08 }[d.type] || 0.06) * (d.rel > 40 ? 1.4 : d.rel < 0 ? 0.4 : 1);
    const pick = (ids) => { const ok = ids.filter((id) => F.EV[id] && F.canFire(F.EV[id], true)); return ok.length ? F.pick(ok) : null; };
    let id = null;
    if (F.chance(pT)) id = pick(TROUBLE);
    else if (F.chance(pR)) id = pick(RESCUE);
    if (id) F.queueEvent(id);
  }

  const origBegin = F.beginWeek;
  F.beginWeek = function () {
    const r = origBegin.apply(this, arguments);
    try { nightLife(); dostWeekly(); } catch (e) { if (F.DEBUG) throw e; }
    return r;
  };
  // sert hoca cezası: bir maç yedek
  const origRoll = F.rollStatus;
  F.rollStatus = function (m) {
    const s = origRoll.apply(this, arguments);
    const S = F.S;
    if (!m.nat && S.coachBench && S.t <= S.coachBench && s === 'ilk11') return 'yedek';
    return s;
  };
})(typeof window !== 'undefined' ? window : globalThis);
