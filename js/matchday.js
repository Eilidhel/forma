/* FORMA — maç günü: hocanın taktik toplantısı
   Oynayacağın (ilk 11 ya da yedek) her lig maçından önce hoca planını anlatır. Plan rakibin gücüne ve hocanın tipine göre seçilir
   (kontra, topa sahip olma, yüksek pres, kanat oyunu, uzun top, sıkı savunma). Planı uygularsan o planın istediği hareketler
   maçta daha kolay tutar; soru sorarsan (konuşma becerisi) bonus büyür; kendi bildiğini oynarsan hoca bozulur. */
(function (root) {
  const F = root.F;
  const D = F.DATA;
  D.tacticPlans = {
    kontra: { name: 'Kontra atak', t: 'Rakip bizden güçlü. Geride kompakt duracağız, topu kazanınca hızla arkalarına koşacağız.', b: { hizlanma: 0.06, hiz: 0.05, uzunPas: 0.05, vizyon: 0.03 }, you: { FV: 'Savunma arkasına koşularını erken yap.', OS: 'Topu kazanınca ilk pas ileri, forvetin koşusuna.', DF: 'Hattı derin tut, arkaya top atma.', KL: 'Topu tutunca hemen uzun oyna.' } },
    sahip: { name: 'Topa sahip olma', t: 'Topu bizde tutacağız. Sabırlı, kısa paslarla rakibi yoracağız; boşluğu bulmadan şut yok.', b: { pas: 0.06, topKontrol: 0.05, vizyon: 0.04 }, you: { FV: 'Topa gel, duvar ol, sonra koş.', OS: 'Topu iste, oyunu sen yönet.', DF: 'Kısa çık, uzun topa kaçma.', KL: 'Ayakla oyuna katıl, stoperlere kısa ver.' } },
    pres: { name: 'Yüksek pres', t: 'Önde basacağız. Rakip kalecisine bile rahat pas vermesin; topu yukarıda kazanıp hemen bitireceğiz.', b: { agresiflik: 0.05, topKesme: 0.05, dayaniklilik: 0.05, bitiricilik: 0.03 }, you: { FV: 'Stoperlere bas, hatayı bekle.', OS: 'İkinci topları sen topla.', DF: 'Hattı yukarı çek, boşluk bırakma.', KL: 'Savunmanın arkasını süpür.' } },
    kanat: { name: 'Kanat oyunu', t: 'Rakip içeride kalabalık. Oyunu kanatlara açıp ortalarla vuracağız.', b: { orta: 0.06, falso: 0.04, dribling: 0.04, kafa: 0.05 }, you: { FV: 'Ceza sahasında ilk direğe koş.', OS: 'Topu kanada aç, sonra ceza sahasına gir.', DF: 'Bekler bindirecek, arkalarını kolla.', KL: 'Ortalara karşı dikkat, çık ve yumrukla.' } },
    uzun: { name: 'Direkt oyun', t: 'Saha ağır, rakip önde. Uzun toplarla ikinci topları kazanacağız.', b: { uzunPas: 0.06, kafa: 0.05, ziplama: 0.04, fizik: 0.04 }, you: { FV: 'Uzun topa yüksel, indir.', OS: 'İkinci topun düştüğü yerde ol.', DF: 'Riske girme, uzun oyna.', KL: 'Degajı forvetin kafasına.' } },
    savunma: { name: 'Sıkı savunma', t: 'Bugün önce gol yememek var. Herkes savunmaya yardım edecek, duran toplarda şansımızı arayacağız.', b: { savunma: 0.06, pozisyon: 0.05, duranTop: 0.05, kalecilik: 0.04, refleks: 0.04 }, you: { FV: 'Savunmaya ilk sen başla.', OS: 'Önlibero gibi oyna.', DF: 'Kimseyi arkana kaçırma.', KL: 'Konuş, savunmayı yönet.' } }
  };
  F.tacticPlan = function () {
    const S = F.S;
    if (S.tacPlan && S.tacPlan.t === S.t) return S.tacPlan;
    const fx = F.myFixture && F.myFixture();
    const me = F.myTeam(), opp = fx ? F.team(fx.opp) : null;
    const diff = opp ? opp.str - me.str : 0;
    const h = F.npc('hoca');
    const w = { kontra: diff > 3 ? 4 : 1, sahip: diff < -3 ? 4 : 1.5, pres: diff < 0 ? 2.5 : 1, kanat: 2, uzun: me.str < 60 ? 2.5 : 0.8, savunma: diff > 6 ? 3 : 0.6 };
    if (h && h.type === 'taktik') { w.sahip += 1; w.pres += 1; }
    if (h && h.type === 'diktator') w.savunma += 1;
    if (fx && !fx.home) w.kontra += 1;
    const key = F.wpick(Object.keys(w), (k) => w[k]);
    S.tacPlan = { t: S.t, key, opp: opp ? opp.id : null, home: fx ? fx.home : true, done: null };
    return S.tacPlan;
  };
  // 0: planı uygula · 1: soru sor · 2: kendi bildiğini oyna
  F.tacticChoose = function (i) {
    const S = F.S, P = S.P;
    const tp = F.tacticPlan();
    if (tp.done != null) return tp.result;
    const plan = D.tacticPlans[tp.key];
    const b = Object.assign({}, S.tactic && S.tactic.t === S.t ? S.tactic.b : {});
    const addB = (mul) => Object.keys(plan.b).forEach((k) => (b[k] = (b[k] || 0) + plan.b[k] * mul));
    let fx = {}, r;
    if (i === 0) { addB(1); fx = { 'r.hoca': 1, 'a.taktik': 0 }; r = 'Planı dinledin. Sahada ' + plan.name.toLowerCase() + ' için istenen hareketler daha kolay tutacak.'; }
    else if (i === 1) {
      const ok = F.chance(F.clamp(0.45 + ((P.soft.konusma || 30) - 40) / 80, 0.2, 0.85));
      if (ok) { addB(1.5); fx = { 'r.hoca': 3, 's.konusma': 0.3 }; r = 'Doğru soruyu sordun. Hoca planı sana özel anlattı; senin hareketlerin daha da kolay tutacak.'; }
      else { addB(0.7); fx = { 'r.hoca': -1 }; r = 'Hoca soruna sabırsızlandı: "Dinlesen anlarsın." Yine de planı aklına yazdın.'; }
    } else {
      ['dribling', 'sut', 'uzakSut'].forEach((k) => (b[k] = (b[k] || 0) + 0.03));
      fx = { 'r.hoca': -3, 't.hirsli': 0.3 }; r = 'Kafanda başka bir oyun var. Hoca bunu fark etti; kendi bireysel hareketlerin biraz daha rahat, ama hoca bozuldu.';
    }
    delete fx['a.taktik'];
    S.tactic = { t: S.t, b };
    const deltas = F.fx(fx);
    if (S.wk) S.wk.deltas.push(...deltas);
    tp.done = i;
    tp.result = { r, deltas };
    return tp.result;
  };
})(typeof window !== 'undefined' ? window : globalThis);
