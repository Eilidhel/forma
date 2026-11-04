/* FORMA — mevkiler, formasyonlar, yeni yetenekler, mevkiye özel maç anları, spiker metinleri
   Her oyuncunun bir "rolü" var (ör. Sol bek, On numara). Rol, ana grubu (KL/DF/OS/FV) ve
   hangi yeteneklerin gücü belirlediğini seçer. Kariyer başında formasyon ekranından seçilir. */
(function (root) {
  const D = root.F.DATA;

  /* ---------- Yetenekler ---------- */
  // 7 ana grup, 34 alt yetenek (FIFA kartlarındaki gibi). Grup puanı alt yeteneklerin ortalamasıdır.
  D.attrGroups = [
    { id: 'hiz', name: 'Hız', short: 'HIZ', keys: ['hizlanma', 'hiz'] },
    { id: 'sut', name: 'Şut', short: 'ŞUT', keys: ['hucumPoz', 'bitiricilik', 'sut', 'uzakSut', 'vole', 'penalti'] },
    { id: 'pas', name: 'Pas', short: 'PAS', keys: ['vizyon', 'orta', 'duranTop', 'pas', 'uzunPas', 'falso'] },
    { id: 'dri', name: 'Dribling', short: 'DRİ', keys: ['ceviklik', 'denge', 'reaksiyon', 'topKontrol', 'dribling', 'sakinlik'] },
    { id: 'sav', name: 'Savunma', short: 'SAV', keys: ['topKesme', 'kafa', 'pozisyon', 'savunma', 'kayarak'] },
    { id: 'fiz', name: 'Fizik', short: 'FİZ', keys: ['ziplama', 'dayaniklilik', 'fizik', 'agresiflik'] },
    { id: 'kl', name: 'Kalecilik', short: 'KAL', keys: ['kalecilik', 'refleks', 'elKullanimi', 'degaj', 'kaleciPoz'] }
  ];
  D.attrs = {
    hizlanma: 'Hızlanma', hiz: 'Sprint hızı',
    hucumPoz: 'Hücum pozisyonu', bitiricilik: 'Bitiricilik', sut: 'Şut gücü', uzakSut: 'Uzaktan şut', vole: 'Vole', penalti: 'Penaltı',
    vizyon: 'Oyun görüşü', orta: 'Orta', duranTop: 'Frikik', pas: 'Kısa pas', uzunPas: 'Uzun pas', falso: 'Falso',
    ceviklik: 'Çeviklik', denge: 'Denge', reaksiyon: 'Reaksiyon', topKontrol: 'Top kontrolü', dribling: 'Dribling', sakinlik: 'Sakinlik',
    topKesme: 'Araya girme', kafa: 'Kafa isabeti', pozisyon: 'Savunma bilinci', savunma: 'Ayakta müdahale', kayarak: 'Kayarak müdahale',
    ziplama: 'Zıplama', dayaniklilik: 'Dayanıklılık', fizik: 'Güç', agresiflik: 'Agresiflik',
    kalecilik: 'Uzanma', refleks: 'Refleks', elKullanimi: 'El kullanımı', degaj: 'Degaj', kaleciPoz: 'Yer tutma'
  };
  D.attrGroupOf = {};
  D.attrGroups.forEach((g) => g.keys.forEach((k) => (D.attrGroupOf[k] = g.id)));
  // eski 8 temel yetenekle akrabalık: köken bonusları, eski kayıtlar ve antrenman çarpanları bunu kullanır
  D.attrAlias = {
    hizlanma: 'hiz', hucumPoz: 'sut', bitiricilik: 'sut', uzakSut: 'sut', vole: 'sut', penalti: 'sut',
    vizyon: 'pas', orta: 'pas', duranTop: 'sut', uzunPas: 'pas', falso: 'pas',
    ceviklik: 'dribling', denge: 'fizik', reaksiyon: 'pas', topKontrol: 'dribling', sakinlik: 'pas',
    topKesme: 'savunma', pozisyon: 'savunma', kayarak: 'savunma', ziplama: 'kafa', dayaniklilik: 'fizik', agresiflik: 'fizik',
    refleks: 'kalecilik', elKullanimi: 'kalecilik', degaj: 'kalecilik', kaleciPoz: 'kalecilik'
  };
  // sadece kalecilerin çalışabildiği yetenekler
  D.keeperAttrs = D.attrGroups.find((g) => g.id === 'kl').keys;
  D.training = Object.keys(D.attrs).map((id) => ({ id, name: D.attrs[id], grp: D.attrGroupOf[id] })).concat([
    { id: 'taktik', name: 'Taktik', desc: 'Hocanın sistemi: mental ve hoca ilişkisi' }, { id: 'dinlenme', name: 'Dinlenme', desc: 'Enerji toplar, gelişim yok' }
  ]);

  /* ---------- Roller ---------- */
  // Her mevkinin gücünü belirleyen alt yetenekler ve ağırlıkları (toplam 1'e normalize edilir)
  const W = (o) => { const t = Object.values(o).reduce((x, y) => x + y, 0); Object.keys(o).forEach((k) => (o[k] = Math.round(o[k] / t * 1000) / 1000)); return o; };
  const BEK = () => W({ savunma: 14, kayarak: 10, topKesme: 12, pozisyon: 10, hiz: 12, hizlanma: 10, orta: 12, dayaniklilik: 12, pas: 8 });
  const KBEK = () => W({ orta: 18, hiz: 12, hizlanma: 10, dayaniklilik: 16, savunma: 10, topKesme: 8, dribling: 10, pas: 8, topKontrol: 8 });
  const ACIK = () => W({ orta: 18, hiz: 12, hizlanma: 10, dribling: 14, dayaniklilik: 12, pas: 10, topKontrol: 10, falso: 6, uzakSut: 8 });
  const KANAT = () => W({ dribling: 18, hizlanma: 14, hiz: 12, ceviklik: 10, topKontrol: 10, bitiricilik: 12, uzakSut: 6, falso: 8, orta: 10 });
  D.roles = {
    KL: { name: 'Kaleci', short: 'KL', grp: 'KL', tag: 'kl', w: W({ kalecilik: 22, refleks: 22, elKullanimi: 16, kaleciPoz: 18, degaj: 12, reaksiyon: 10 }), desc: 'Son adam. Refleks ve yer tutma her şey.' },
    STP: { name: 'Stoper', short: 'STP', grp: 'DF', tag: 'stoper', w: W({ savunma: 18, kayarak: 12, pozisyon: 16, topKesme: 14, kafa: 14, fizik: 12, ziplama: 8, agresiflik: 6 }), desc: 'Ceza sahasının bekçisi. Hava topları ve ikili mücadele.' },
    SLB: { name: 'Sol bek', short: 'SLB', grp: 'DF', tag: 'bek', w: BEK(), desc: 'Kanadı kapatır, fırsat bulunca bindirir.' },
    SGB: { name: 'Sağ bek', short: 'SĞB', grp: 'DF', tag: 'bek', w: BEK(), desc: 'Kanadı kapatır, fırsat bulunca bindirir.' },
    SLKB: { name: 'Sol kanat bek', short: 'SLKB', grp: 'DF', tag: 'bek', w: KBEK(), desc: 'Bütün kanat senin. 90 dakika koşu.' },
    SGKB: { name: 'Sağ kanat bek', short: 'SĞKB', grp: 'DF', tag: 'bek', w: KBEK(), desc: 'Bütün kanat senin. 90 dakika koşu.' },
    DOS: { name: 'Ön libero', short: 'DOS', grp: 'OS', tag: 'dos', w: W({ topKesme: 18, pozisyon: 14, savunma: 14, pas: 14, uzunPas: 10, fizik: 10, dayaniklilik: 10, agresiflik: 10 }), desc: 'Savunmanın önündeki duvar. Top kapar, sade oynar.' },
    MO: { name: 'Merkez orta saha', short: 'MO', grp: 'OS', tag: 'mo', w: W({ pas: 20, uzunPas: 12, vizyon: 14, topKontrol: 12, dayaniklilik: 12, uzakSut: 10, reaksiyon: 10, topKesme: 10 }), desc: 'Oyunun motoru. Her yerdesin.' },
    OOS: { name: 'On numara', short: 'OOS', grp: 'OS', tag: 'oos', w: W({ vizyon: 20, pas: 14, topKontrol: 14, dribling: 12, ceviklik: 8, uzakSut: 10, duranTop: 10, falso: 6, sakinlik: 6 }), desc: 'Son pası atan sanatçı. Frikikler de senden sorulur.' },
    SLO: { name: 'Sol açık', short: 'SLO', grp: 'OS', tag: 'acik', w: ACIK(), desc: 'Çizgiye inip ortalar, geri döner.' },
    SGO: { name: 'Sağ açık', short: 'SĞO', grp: 'OS', tag: 'acik', w: ACIK(), desc: 'Çizgiye inip ortalar, geri döner.' },
    SLK: { name: 'Sol kanat', short: 'SLK', grp: 'FV', tag: 'kanat', w: KANAT(), desc: 'Birebirde adam eksilt, içeri kat et, vur.' },
    SGK: { name: 'Sağ kanat', short: 'SĞK', grp: 'FV', tag: 'kanat', w: KANAT(), desc: 'Birebirde adam eksilt, içeri kat et, vur.' },
    SF: { name: 'Santrfor', short: 'SF', grp: 'FV', tag: 'sf', w: W({ bitiricilik: 22, hucumPoz: 16, sut: 10, kafa: 12, fizik: 10, topKontrol: 10, vole: 6, reaksiyon: 8, sakinlik: 6 }), desc: 'Ceza sahasının adamı. Golden başka işin yok.' },
    IF: { name: 'İkinci forvet', short: 'İF', grp: 'FV', tag: 'if', w: W({ bitiricilik: 16, hucumPoz: 12, sut: 10, uzakSut: 10, dribling: 12, hizlanma: 10, vizyon: 10, topKontrol: 10, sakinlik: 10 }), desc: 'Santrforun etrafında dolaşır, hem atar hem attırır.' }
  };
  // eski kayıtlar ve nesil sistemi için grup → varsayılan rol
  D.defaultRole = { KL: 'KL', DF: 'STP', OS: 'MO', FV: 'SF' };
  // ana gruplar (olay koşulları, maç anları bunları kullanır)
  D.positions = [
    { id: 'KL', name: 'Kaleci', w: D.roles.KL.w },
    { id: 'DF', name: 'Defans', w: D.roles.STP.w },
    { id: 'OS', name: 'Orta Saha', w: D.roles.MO.w },
    { id: 'FV', name: 'Forvet', w: D.roles.SF.w }
  ];

  /* ---------- Formasyonlar (x: soldan sağa 0-100, y: hücum yönü yukarı, 0 = rakip kale) ---------- */
  const GK = [50, 92, 'KL'];
  const B4 = [[14, 71, 'SLB'], [37, 76, 'STP'], [63, 76, 'STP'], [86, 71, 'SGB']];
  const B3 = [[26, 75, 'STP'], [50, 77, 'STP'], [74, 75, 'STP']];
  const B5 = [[10, 67, 'SLKB'], [30, 76, 'STP'], [50, 78, 'STP'], [70, 76, 'STP'], [90, 67, 'SGKB']];
  const B2 = [[35, 76, 'STP'], [65, 76, 'STP']];
  D.formations = [
    { id: '4-4-2', spots: [GK, ...B4, [14, 48, 'SLO'], [38, 51, 'MO'], [62, 51, 'MO'], [86, 48, 'SGO'], [38, 19, 'SF'], [62, 21, 'IF']] },
    { id: '4-3-3', spots: [GK, ...B4, [28, 50, 'MO'], [50, 57, 'DOS'], [72, 50, 'MO'], [16, 24, 'SLK'], [50, 16, 'SF'], [84, 24, 'SGK']] },
    { id: '4-5-1', spots: [GK, ...B4, [11, 46, 'SLO'], [31, 50, 'MO'], [50, 57, 'DOS'], [69, 50, 'MO'], [89, 46, 'SGO'], [50, 18, 'SF']] },
    { id: '3-4-3', spots: [GK, ...B3, [13, 50, 'SLO'], [38, 53, 'MO'], [62, 53, 'MO'], [87, 50, 'SGO'], [18, 24, 'SLK'], [50, 16, 'SF'], [82, 24, 'SGK']] },
    { id: '3-5-2', spots: [GK, ...B3, [9, 50, 'SLKB'], [31, 52, 'MO'], [50, 59, 'DOS'], [69, 52, 'MO'], [91, 50, 'SGKB'], [38, 19, 'SF'], [62, 21, 'IF']] },
    { id: '3-1-5-1', spots: [GK, ...B3, [50, 61, 'DOS'], [9, 42, 'SLO'], [29, 44, 'MO'], [50, 37, 'OOS'], [71, 44, 'MO'], [91, 42, 'SGO'], [50, 16, 'SF']] },
    { id: '5-3-2', spots: [GK, ...B5, [29, 50, 'MO'], [50, 55, 'DOS'], [71, 50, 'MO'], [38, 19, 'SF'], [62, 21, 'IF']] },
    { id: '5-4-1', spots: [GK, ...B5, [14, 47, 'SLO'], [38, 50, 'MO'], [62, 50, 'MO'], [86, 47, 'SGO'], [50, 18, 'SF']] },
    { id: '4-2-2-2', spots: [GK, ...B4, [38, 58, 'DOS'], [62, 58, 'DOS'], [22, 36, 'OOS'], [78, 36, 'OOS'], [38, 18, 'SF'], [62, 18, 'IF']] },
    { id: '4-2-3-1', spots: [GK, ...B4, [38, 59, 'DOS'], [62, 59, 'DOS'], [16, 37, 'SLK'], [50, 37, 'OOS'], [84, 37, 'SGK'], [50, 16, 'SF']] },
    { id: '2-4-4', spots: [GK, ...B2, [12, 52, 'SLO'], [38, 54, 'MO'], [62, 54, 'MO'], [88, 52, 'SGO'], [12, 24, 'SLK'], [38, 18, 'SF'], [62, 18, 'IF'], [88, 24, 'SGK']] },
    { id: '2-5-3', spots: [GK, ...B2, [9, 49, 'SLO'], [30, 51, 'MO'], [50, 58, 'DOS'], [70, 51, 'MO'], [91, 49, 'SGO'], [18, 22, 'SLK'], [50, 16, 'SF'], [82, 22, 'SGK']] }
  ];

  /* ---------- Mevkiye özel maç anları ----------
     Her anda en az bir "kolay" seçenek var: düşük risk, düşük getiri. */
  D.moments.r_kl = [
    { t: 'Rakip kanattan sert bir orta yaptı, ön direkte forvet var.', o: [
      { t: 'Çık ve topu yumrukla', a: 'kalecilik', d: 52, win: 'save', lose: 'concede', winT: 'Yumruğun topu ceza sahasının dışına yolladı.', loseT: 'Topa yetişemedin, forvet kafayı vurdu.' },
      { t: 'Çizgide kal, refleksine güven', a: 'refleks', d: 50, win: 'save', lose: 'concede', winT: 'Kafa vuruşunu çizgide çıkardın!', loseT: 'Kafa köşeye gitti.' },
      { t: 'Savunmaya bağır, adamı aldırt', a: 'liderlik', d: 30, win: 'keep', lose: 'concede', winT: 'Stoperin sesini duydu, topu uzaklaştırdı.', loseT: 'Kimse duymadı, gol.' }] },
    { t: 'Geri pas geldi, rakip forvet pres için koşuyor.', o: [
      { t: 'Ayağınla çalımla, oyunu kur', a: 'pas', d: 62, win: 'chance', lose: 'concede', winT: 'Forveti ters köşeye yatırdın, tribün çıldırdı.', loseT: 'Forvet topu kaptı, boş kaleye gol.' },
      { t: 'Uzun vur, riske girme', a: 'pas', d: 22, win: 'keep', lose: 'lost', winT: 'Top orta sahaya gitti. Sade ve doğru.', loseT: 'Top taca çıktı.' }] }
  ];
  D.moments.r_stoper = [
    { t: 'Rakip santrfor sırtı dönük topu aldı, sana yaslanıyor.', o: [
      { t: 'Arkadan topa uzan', a: 'savunma', d: 55, win: 'block', lose: 'foul', winT: 'Topu bacaklarının arasından söktün.', loseT: 'Hakem faul çaldı, tehlikeli bölge.' },
      { t: 'Döndürme, bekle', a: 'pozisyon', d: 30, win: 'keep', lose: 'lost', winT: 'Forvet geri pas vermek zorunda kaldı.', loseT: 'Forvet döndü ama şutu auta gitti.' }] },
    { t: 'Uzun top savunmanın arkasına atıldı, forvetle yarışıyorsun.', o: [
      { t: 'Omuz omuza koş', a: 'hiz', d: 55, win: 'block', lose: 'concede', winT: 'Forveti geçtin, topu kaleciye bıraktın.', loseT: 'Forvet senden hızlıydı. Gol.' },
      { t: 'Kafayla önden uzaklaştır', a: 'kafa', d: 48, win: 'block', lose: 'lost', winT: 'Herkesten önce yükseldin.', loseT: 'Kafan kısa kaldı, top rakipte.' },
      { t: 'Kaleciye bırak', a: 'pozisyon', d: 28, win: 'keep', lose: 'concede', winT: 'Kaleci çıktı, topu aldı. Sakin.', loseT: 'Kaleciyle birbirinize baktınız. Gol.' }] }
  ];
  D.moments.r_bek = [
    { t: 'Kanatta önün boş, rakip kanat geri dönmedi.', o: [
      { t: 'Bindir ve ortala', a: 'orta', d: 50, win: 'assist', lose: 'lost', winT: 'Ortan santrforun kafasına! Gol!', loseT: 'Ortan kaleciye gitti.' },
      { t: 'İçeri kat edip şut', a: 'sut', d: 64, win: 'goal', lose: 'miss', winT: 'Bek golü! Kimse beklemiyordu.', loseT: 'Şutun tribüne gitti.' },
      { t: 'Kanat oyuncusuna ver', a: 'pas', d: 24, win: 'keep', lose: 'lost', winT: 'Topu kanat oyuncusuna verdin, pozisyonuna döndün.', loseT: 'Pasın kısa kaldı.' }] },
    { t: 'Rakip kanat oyuncusu sana doğru hızla geliyor.', o: [
      { t: 'Kayarak müdahale', a: 'savunma', d: 56, win: 'block', lose: 'concede', winT: 'Topu taca attın. Tertemiz!', loseT: 'Seni geçti, ortası gol oldu.', risk: 0.15 },
      { t: 'Geri çekil, içeri sokma', a: 'pozisyon', d: 30, win: 'keep', lose: 'lost', winT: 'Onu kenara itin, ortası savunmaya çarptı.', loseT: 'Korner verdin.' }] }
  ];
  D.moments.r_dos = [
    { t: 'Rakip orta saha araya pas arıyor, sen tam yoldasın.', o: [
      { t: 'Araya gir ve hızlı çık', a: 'savunma', d: 52, win: 'chance', lose: 'lost', winT: 'Pası kestin, kontrayı başlattın!', loseT: 'Topa yetiştin ama sektirip kaçırdın.' },
      { t: 'Faulle kes', a: 'fizik', d: 30, win: 'block', lose: 'yellow', winT: 'Taktik faul. Atak bitti.', loseT: 'Hakem sarı kartını çıkardı.' },
      { t: 'Pozisyonunu koru', a: 'pozisyon', d: 22, win: 'keep', lose: 'lost', winT: 'Pas yolunu kapattın, rakip geri döndü.', loseT: 'Pas yine de geçti.' }] }
  ];
  D.moments.r_mo = [
    { t: 'Orta sahada boşta topu aldın, önünde iki seçenek var.', o: [
      { t: 'Kanat değiştir, uzun pas', a: 'vizyon', d: 54, win: 'chance', lose: 'lost', winT: 'Kırk metrelik pas, kanatta bire bir!', loseT: 'Uzun pas taca gitti.' },
      { t: '25 metreden şut', a: 'sut', d: 66, win: 'goal', lose: 'miss', winT: 'Füze! Top doksanda!', loseT: 'Top tribünün ikinci katına.' },
      { t: 'Yakındaki arkadaşa ver', a: 'pas', d: 20, win: 'keep', lose: 'lost', winT: 'Sade bir pas. Top takımda.', loseT: 'Kısa pas bile araya girdi.' }] }
  ];
  D.moments.r_oos = [
    { t: 'Ceza yayının önünde topu aldın, forvet çaprazda koşuyor.', o: [
      { t: 'Ara pası (rabona dene)', a: 'vizyon', d: 64, win: 'assist', lose: 'lost', winT: 'Rabonayla ara pası! Forvet gole çevirdi, stat ayakta.', loseT: 'Rabona tutmadı. Sosyal medya bunu konuşacak.' },
      { t: 'Normal ara pası', a: 'vizyon', d: 50, win: 'assist', lose: 'lost', winT: 'Milimetrik pas, gol!', loseT: 'Stoper pası okudu.' },
      { t: 'Topu sakla, takımı bekle', a: 'dribling', d: 24, win: 'keep', lose: 'lost', winT: 'Topu sakladın, takım öne çıktı.', loseT: 'Sıkıştırıldın, top gitti.' }] },
    { t: 'Ceza sahası köşesinde serbest vuruş. Top senin.', o: [
      { t: 'Kaleye frikik', a: 'duranTop', d: 62, win: 'goal', lose: 'miss', winT: 'Barajın üstünden, kalecinin uzanamadığı köşeye!', loseT: 'Top barajdan döndü.' },
      { t: 'Kafa için ortala', a: 'duranTop', d: 46, win: 'assist', lose: 'lost', winT: 'Ortan stoperin kafasında, gol!', loseT: 'Kaleci çıkıp topu aldı.' },
      { t: 'Kısa kullan', a: 'pas', d: 22, win: 'keep', lose: 'lost', winT: 'Kısa kullandınız, top takımda.', loseT: 'Kısa kullanım bozuldu.' }] }
  ];
  D.moments.r_acik = [
    { t: 'Çizgiye kadar indin, ceza sahası kalabalık.', o: [
      { t: 'Arka direğe orta', a: 'orta', d: 50, win: 'assist', lose: 'lost', winT: 'Arka direkte forvet tek vuruşta gönderdi!', loseT: 'Ortan auta gitti.' },
      { t: 'Yerden geri çevir', a: 'pas', d: 44, win: 'assist', lose: 'lost', winT: 'Geri çevirdin, orta saha boş kaleye attı.', loseT: 'Stoper araya girdi.' },
      { t: 'Topu geri ver', a: 'pas', d: 20, win: 'keep', lose: 'lost', winT: 'Oyunu yeniden kurdunuz.', loseT: 'Geri pas bile kesildi.' }] }
  ];
  D.moments.r_kanat = [
    { t: 'Bire birdesin, bek seni bekliyor.', o: [
      { t: 'Çalımla geç, içeri kat et', a: 'dribling', d: 55, win: 'chance', lose: 'lost', winT: 'Beki yere oturttun, şutun direği sıyırdı.', loseT: 'Bek topu ayağından aldı.' },
      { t: 'Hızla dışarıdan geç ve ortala', a: 'hiz', d: 52, win: 'assist', lose: 'lost', winT: 'Kimse yetişemedi, ortan gol oldu!', loseT: 'Top auta çıktı.' },
      { t: 'Geri dön, bindiren beke ver', a: 'pas', d: 22, win: 'keep', lose: 'lost', winT: 'Sabırlı oyun, top takımda.', loseT: 'Pas araya girdi.' }] },
    { t: 'Ters kanattan içeri kat ettin, uzak köşe açık.', o: [
      { t: 'Uzak köşeye plase', a: 'bitiricilik', d: 56, win: 'goal', lose: 'miss', winT: 'Klasik kanat golü! Uzak köşe!', loseT: 'Top uzak direğin dibinden auta.' },
      { t: 'Santrfora ver', a: 'pas', d: 40, win: 'assist', lose: 'lost', winT: 'Santrfor boş kaleye attı.', loseT: 'Pasın uzun kaldı.' }] }
  ];
  D.moments.r_sf = [
    { t: 'Altı pasın içinde sekip önüne düşen top!', o: [
      { t: 'Tek dokunuşla it', a: 'bitiricilik', d: 44, win: 'goal', lose: 'miss', winT: 'Fırsatçı gol! Santrforun işi bu.', loseT: 'Top kalecinin bacağına çarptı.' },
      { t: 'Sert vur', a: 'sut', d: 54, win: 'goal', lose: 'miss', winT: 'Top fileyi deldi!', loseT: 'Top üst direğin üstünden.' }] },
    { t: 'Sırtın kaleye dönük, stoper ensende.', o: [
      { t: 'Dön ve vur', a: 'bitiricilik', d: 62, win: 'goal', lose: 'miss', winT: 'Ani dönüş, köşeye! Gol!', loseT: 'Dönüşün yavaştı, şut bloklandı.' },
      { t: 'Topu koru, arkadaşa duvar ol', a: 'fizik', d: 32, win: 'chance', lose: 'lost', winT: 'Topu korudun, arkadaşın şut çekti.', loseT: 'Stoper topu kaptı.' },
      { t: 'Faul al', a: 'kurnazlik', d: 36, win: 'keep', lose: 'lost', winT: 'Hakem faul verdi, serbest vuruş.', loseT: 'Hakem oyunu devam ettirdi.' }] }
  ];
  D.moments.r_if = [
    { t: 'Santrfor topu indirdi, ceza yayında koşuyla geliyorsun.', o: [
      { t: 'Gelişine vur', a: 'sut', d: 56, win: 'goal', lose: 'miss', winT: 'Gelişine! Kaleci kıpırdayamadı.', loseT: 'Şutun kalecinin kucağına.' },
      { t: 'Kontrol et, plase', a: 'bitiricilik', d: 50, win: 'goal', lose: 'miss', winT: 'Sakin bir plase. Gol!', loseT: 'Kontrol uzun kaldı.' },
      { t: 'Kanada aç', a: 'pas', d: 22, win: 'keep', lose: 'lost', winT: 'Kanada açtın, atak sürüyor.', loseT: 'Pas kesildi.' }] }
  ];

  /* ---------- Eski anlarda yeni yetenekler ---------- */
  const reA = (grp, text, optText, a) => { const mo = (D.moments[grp] || []).find((x) => x.t.includes(text)); const o = mo && mo.o.find((x) => x.t.includes(optText)); if (o) o.a = a; };
  reA('FV', 'Kaleciyle karşı', 'Köşeye plase', 'bitiricilik');
  reA('FV', 'Ceza sahası dışında topla', 'Kanada pas', 'vizyon');
  reA('OS', 'forvet derinlemesine', 'Ara pası', 'vizyon');
  reA('OS', 'Kanattan içeri', 'Ortala', 'orta');
  reA('DF', 'Kanattan bindirme', 'Bindir ve ortala', 'orta');
  reA('DF', 'Rakip forvet hızla', 'Pozisyon al', 'pozisyon');
  reA('KL', 'altı pasın içinden', 'Refleksle uzan', 'refleks');
  reA('KL', '25 metreden', 'Uzan', 'refleks');
  reA('KL', 'Birebir', 'Bekle', 'pozisyon');
  ['FV', 'OS'].forEach((g) => (D.moments[g] || []).forEach((mo) => mo.o.forEach((o) => { if (o.t === 'Direkt kaleye') o.a = 'duranTop'; })));
  // seçenek metnine göre en uygun alt yetenek
  const BY_TEXT = [
    [/Uzaktan vur|25 metreden şut/, 'uzakSut'], [/Gelişine vur/, 'vole'], [/Ters köşe şut/, 'falso'], [/Kayarak müdahale/, 'kayarak'],
    [/Uzun top|Kanat değiştir/, 'uzunPas'], [/Uzun degaj/, 'degaj'], [/Kısa oyun kur|Ayağınla çalımla/, 'degaj'], [/Yumrukla|Kucakla|Çık ve topu yumrukla/, 'elKullanimi'],
    [/Açıyı daralt|Üstüne çık/, 'kaleciPoz'], [/Hızla geç|Hızla dışarıdan/, 'hizlanma'], [/Araya gir/, 'topKesme'], [/Göğüs göğüse|Sert omuz|Karşılık ver/, 'agresiflik'],
    [/Dön ve vur/, 'reaksiyon'], [/Topu koru/, 'denge'], [/Topu sakla/, 'topKontrol'], [/Kafayla uzaklaştır|Herkesten/, 'ziplama'], [/Geri koş/, 'hiz']
  ];
  Object.keys(D.moments).forEach((k) => (D.moments[k] || []).forEach((mo) => mo.o.forEach((o) => {
    if (o.easy) return;
    const hit = BY_TEXT.find(([re]) => re.test(o.t));
    if (hit && (D.attrs[o.a] || o.a === 'fizik')) o.a = hit[1];
  })));
  // penaltı: köşeye vuruş penaltı yeteneği, ortaya sert şut gücü, Panenka sakinlik
  (D.moments.FV || []).concat(D.moments.OS || []).forEach((mo) => { if (!/Penaltı! Topu sen/.test(mo.t)) return; mo.o.forEach((o) => { o.a = /köşe/.test(o.t) ? 'penalti' : /Ortaya/.test(o.t) ? 'sut' : /Panenka/.test(o.t) ? 'sakinlik' : o.a; }); });
  (D.moments.KL || []).forEach((mo) => mo.o.forEach((o) => { if (o.a === 'pozisyon') o.a = 'kaleciPoz'; }));
  (D.moments.r_kl || []).forEach((mo) => mo.o.forEach((o) => { if (o.a === 'pas') o.a = 'degaj'; }));

  /* ---------- Her ana kolay bir seçenek ----------
     Seçeneklerin hepsi riskliyse, düşük riskli sade bir seçenek eklenir. */
  const easy = {
    atk: { t: 'Sade oyna, topu takımda tut', a: 'pas', d: 20, win: 'keep', lose: 'lost', winT: 'Topu kaybetmedin. Sade ama doğru.', loseT: 'Basit pası bile kaptırdın.', easy: true },
    def: { t: 'Faul yapmadan geri çekil, zaman kazan', a: 'pozisyon', d: 22, win: 'keep', lose: 'concede', winT: 'Rakibi yavaşlattın, savunma yerleşti.', loseT: 'Geri çekildin ama rakip boşluğu buldu.', easy: true },
    kl: { t: 'Güvenli oyna, topu kornere çeldir', a: 'kaleciPoz', d: 24, win: 'keep', lose: 'concede', winT: 'Topu kornere çeldin. Tehlike geçti.', loseT: 'Çeldiğin top rakibin önüne düştü.', easy: true }
  };
  Object.keys(D.moments).forEach((k) => (D.moments[k] || []).forEach((mo) => {
    if (mo.o.some((o) => o.d <= 32 && !['red', 'concede'].includes(o.lose))) return;
    const defensive = mo.o.some((o) => o.lose === 'concede');
    const kl = k === 'KL' || k === 'r_kl';
    if (/Penaltı/.test(mo.t) && !kl) return; // penaltıda kaçış yok
    mo.o.push(Object.assign({}, kl && defensive ? easy.kl : defensive ? easy.def : easy.atk));
  }));

  /* ---------- Spiker ---------- */
  D.spiker = {
    kickoff: ['Hakemin düdüğüyle {ev} - {dep} maçı başladı!', 'Ve top yuvarlanıyor! {ev} ile {dep} karşı karşıya.', 'Stadyum dolu, tribünler coşkulu. Maç başladı!'],
    half: ['İlk yarı sona erdi. Skor: {skor}.', 'Hakem ilk yarıyı bitirdi. Takımlar soyunma odasına. {skor}.'],
    second: ['İkinci yarı başladı!', 'Takımlar sahada, ikinci 45 dakika başlıyor.'],
    end: ['Ve son düdük! Maç {skor} bitti.', 'Hakem maçı bitirdi. Tabelada {skor}.'],
    myGoal: ['GOOOL! {oyuncu} ağları sarstı! {takim} öne geçiyor mu, yoksa fark mı açılıyor?', 'GOL! {oyuncu} kafayla gönderdi, top ağlarda!', 'GOOOL! {oyuncu} ceza sahasında affetmedi!', 'GOL! {oyuncu} uzaktan bir füze çaktı!', 'GOOOL! Kornerden gelen topu {oyuncu} tamamladı!'],
    opGoal: ['Gol... {rakipoyuncu} kaleyi buldu. {rakip} sevinçli.', '{rakip} golü buluyor. {rakipoyuncu} boş kaldı, affetmedi.', 'Gol! {rakipoyuncu} kontra atakta kaleyle buluştu.', 'Bir hata ve gol! {rakip} adına {rakipoyuncu}.'],
    myChance: ['{oyuncu} vurdu, top direğin dibinden auta!', '{oyuncu} kafayı vurdu, kaleci son anda çeldi.', '{takim} baskılı. {oyuncu} denedi ama savunma kesti.', 'Korner {takim} lehine. Top uzaklaştırıldı.', '{oyuncu} çalımladı, şutu kalecide.'],
    opChance: ['{rakip} tehlikeli geliyor... {rakipoyuncu} vurdu, top üstten auta.', '{rakipoyuncu} sert vurdu, kalecimiz son anda çeldi!', '{rakip} korner kazandı. Savunma topu uzaklaştırdı.', '{rakipoyuncu} ceza sahasında yere düştü, hakem devam dedi!'],
    card: ['{rakipoyuncu} sert faul yaptı, sarı kart.', '{oyuncu} itiraz edince sarı kartı gördü.', 'Hakem oyunu durdurdu, iki takım oyuncuları birbirine girdi.'],
    filler: ['Orta sahada top dolaşıyor, iki takım da temkinli.', 'Tribünlerden büyük bir uğultu yükseliyor.', 'Hakem oyunu durdurdu, sakatlanan bir oyuncu var.', 'Oyun biraz sertleşti, hakem uyarıyor.', '{takim} topu ayağında tutuyor, boşluk arıyor.', 'Yağmur başladı, zemin kayganlaşıyor.']
  };
})(typeof window !== 'undefined' ? window : globalThis);
