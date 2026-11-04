/* FORMA — atak kurma: top sende, oyunu sen kuruyorsun
   Bir atak üç aşamadan geçer: Kurulum → Son üçte bir → Bitiriş. Her aşamada kısa pas, dribling, uzun pas gibi
   seçenekler var. Şans yeteneklerinle orantılıdır.
   - Kısa pas genelde en güvenli seçenektir, bir aşama ilerletir.
   - Uzun pas genelde daha zordur ama bir aşamayı atlatır (adv2). Bazı durumlarda (rakip önde, arkası boş) uzun pas daha kolaydır.
   - "Geri çevir" topu kaybetmeden aynı aşamada yeni bir durum açar (recycle), en fazla iki kez.
   win/lose: adv (bir aşama ileri), adv2 (iki aşama), recycle (aynı aşama, yeni durum), ya da maç sonuçları (goal, assist, chance, keep, lost, concede, yellow). */
(function (root) {
  const D = root.F.DATA;
  const o = (t, a, d, win, lose, winT, loseT, extra) => Object.assign({ t, a, d, win, lose, winT, loseT }, extra || {});
  D.attackStages = {
    build: [
      { t: 'Kendi yarı sahanda topu aldın. Rakip orta sahası çizgiyi tutmuş.', o: [
        o('Orta sahaya kısa pas', 'pas', 26, 'adv', 'lost', 'Pas ayağa geldi, oyun ileri taşındı.', 'Basit pası rakip kesti.'),
        o('Topu sürerek çizgiyi kır', 'dribling', 52, 'adv', 'lost', 'İlk adamı geçtin, önün açıldı!', 'Topu kaptırdın.'),
        o('Kanada uzun pas', 'uzunPas', 54, 'adv2', 'lost', 'Kırk metrelik pas kanat oyuncusunun önüne düştü!', 'Uzun pas taca gitti.')] },
      { t: 'Rakip savunma hattı çok önde, arkası bomboş.', o: [
        o('Savunma arkasına uzun top', 'uzunPas', 32, 'adv2', 'lost', 'Topu boşluğa bıraktın, forvet koşuyor!', 'Ofsayt bayrağı kalktı.'),
        o('Kısa pasla sabırla çık', 'pas', 34, 'adv', 'lost', 'Sabırla çıktınız.', 'Rakip pres pası kesti.'),
        o('Topu kendin taşı', 'hizlanma', 48, 'adv', 'lost', 'Boş alanı hızla geçtin.', 'Rakip orta saha önünü kesti.')] },
      { t: 'İki rakip oyuncu üstüne pres yapıyor. Arkanda stoper boşta.', o: [
        o('Stopere geri ver', 'pas', 18, 'recycle', 'lost', 'Top stopere döndü, oyun yeniden başlıyor.', 'Geri pas kısa kaldı.'),
        o('Presi dönerek kır', 'ceviklik', 58, 'adv', 'concede', 'İkisinin arasından döndün! Önün bomboş.', 'Topu kaptırdın, rakip kontraya çıktı ve gol!'),
        o('Ön liberoya çabuk pas', 'pas', 38, 'adv', 'lost', 'Tek dokunuş, pres kırıldı.', 'Pas araya girdi.')] },
      { t: 'Kaleci topu sana attı. Saha geniş, rakip geride bekliyor.', o: [
        o('Kısa kısa ilerle', 'pas', 22, 'adv', 'lost', 'Rahatça orta sahaya geldiniz.', 'Dikkatsiz bir pas.'),
        o('Ters kanada uzun top', 'uzunPas', 50, 'adv2', 'lost', 'Ters kanattaki arkadaşın topu göğsüyle aldı!', 'Top auta gitti.')] },
      { t: 'Orta sahada top sende ama arkadaşlarının hepsi markajda.', o: [
        o('Topu sakla, bir koşu bekle', 'topKontrol', 30, 'recycle', 'lost', 'Topu korudun, bir arkadaşın boşa çıktı.', 'Arkandan gelen rakip topu çaldı.'),
        o('Duvar pas iste', 'pas', 42, 'adv', 'lost', 'Ver-kaç, markajdan kurtuldun!', 'Duvar pası geri gelmedi.'),
        o('Çalımla tek başına çık', 'dribling', 60, 'adv2', 'lost', 'İki kişiyi birden geçtin, tribün ayakta!', 'Üçüncü adamda takıldın.')] }
    ],
    mid: [
      { t: 'Son üçte bire geldin. Ceza sahası önünde kalabalık.', o: [
        o('Kanattaki arkadaşa kısa pas', 'pas', 30, 'adv', 'lost', 'Kanat oyuncusu topu aldı, ortaya hazırlanıyor.', 'Pas fazla sert oldu.'),
        o('Araya ara pası', 'vizyon', 54, 'adv', 'lost', 'Milimetrik ara pası! Forvet kaleciyle karşı karşıya.', 'Stoper pası okudu.'),
        o('Uzaktan şut', 'uzakSut', 60, 'goal', 'miss', 'Füze! Top doksanda!', 'Şutun tribüne gitti.')] },
      { t: 'Kanattasın. Bek seni bekliyor, ceza sahasında iki arkadaşın var.', o: [
        o('Ortala', 'orta', 46, 'assist', 'lost', 'Ortan kafaya geldi, top ağlarda!', 'Ortan stopere çarptı.'),
        o('Beki geç, içeri gir', 'dribling', 54, 'adv', 'lost', 'Beki yere oturttun, ceza sahasına girdin!', 'Bek topu ayağından aldı.'),
        o('Geri çevir, yeniden kur', 'pas', 20, 'recycle', 'lost', 'Top orta sahaya döndü.', 'Geri pas bile kesildi.')] },
      { t: 'Ceza yayının hemen önündesin. Önündeki stoper bir adım geride.', o: [
        o('Stoperi çalımla', 'dribling', 52, 'adv', 'lost', 'Stoperi geçtin! Kaleci ile aranda kimse yok.', 'Stoper topa uzandı.'),
        o('Forvete duvar pas', 'pas', 38, 'adv', 'lost', 'Duvar pas tuttu, ceza sahasındasın!', 'Forvet topu kaçırdı.'),
        o('Hemen şut çek', 'sut', 56, 'goal', 'miss', 'Plase bir vuruş, köşeye!', 'Şutun direğin yanından auta.')] },
      { t: 'Rakip geriye çekildi, ceza sahasında beş savunmacı var.', o: [
        o('Sabırla paslaş', 'pas', 24, 'recycle', 'lost', 'Top ayaklarınızda dolaşıyor.', 'Sabırsız bir pas.'),
        o('Ters kanada uzun pas', 'uzunPas', 46, 'adv', 'lost', 'Uzun pas ters kanattaki boş arkadaşına!', 'Pas fazla uzun oldu.'),
        o('Kalabalığın içinden geç', 'dribling', 64, 'adv', 'lost', 'Üç kişinin arasından süzüldün!', 'Kalabalıkta topu kaybettin.')] },
      { t: 'Kontra atak! Rakip savunmada sadece iki kişi var.', o: [
        o('Koşan forvete uzun pas', 'uzunPas', 34, 'adv', 'lost', 'Forvet topu aldı, kaleciyle karşı karşıya!', 'Pas savunmaya çarptı.'),
        o('Topu kendin sür', 'hiz', 44, 'adv', 'lost', 'Kimse yetişemiyor!', 'Stoper son anda yetişti.'),
        o('Yandaki arkadaşa kısa ver', 'pas', 26, 'adv', 'lost', 'Arkadaşın topu aldı, iki kişiye karşı üç kişisiniz.', 'Pas arkada kaldı.')] }
    ],
    final: [
      { t: 'Ceza sahasındasın, kaleciyle aranda sadece bir stoper var.', o: [
        o('Şut çek', 'bitiricilik', 48, 'goal', 'miss', 'Gol! Top kalecinin bacaklarının arasından!', 'Şut stopere çarptı.'),
        o('Boştaki arkadaşa çıkar', 'pas', 34, 'assist', 'lost', 'Bencil olmadın, arkadaşın boş kaleye attı!', 'Pas stoperin ayağına takıldı.'),
        o('Stoperi de geç', 'dribling', 60, 'goal', 'lost', 'Stoperi ve kaleciyi geçtin, boş kaleye gol!', 'Fazla oyalandın, top gitti.')] },
      { t: 'Kaleciyle karşı karşıyasın!', o: [
        o('Köşeye plase', 'bitiricilik', 44, 'goal', 'miss', 'Soğukkanlı bir plase. Gol!', 'Kaleci ayağıyla çıkardı.'),
        o('Sert vur', 'sut', 52, 'goal', 'miss', 'Füze gibi, ağlar delindi!', 'Kaleci yumrukladı.'),
        o('Kaleciyi çalımla', 'dribling', 58, 'goal', 'lost', 'Kaleciyi yere oturttun, boş kaleye!', 'Kaleci topu kucakladı.')] },
      { t: 'Top ceza sahasında sana sekti, gelişine vuracak pozisyondasın.', o: [
        o('Gelişine vole', 'vole', 56, 'goal', 'miss', 'Muhteşem bir vole! Yılın golü adayı!', 'Vole tribüne gitti.'),
        o('Önce kontrol et', 'topKontrol', 40, 'chance', 'lost', 'Kontrol ettin, şutun kaleciye.', 'Kontrol uzun kaldı.'),
        o('Kafa ile içeri', 'kafa', 48, 'goal', 'miss', 'Kafa vuruşu köşeye!', 'Kafan üstten auta.')] },
      { t: 'Ceza sahası çizgisindesin, sağ ayağına açılırsan kale açık.', o: [
        o('İçeri kat et, falsolu vur', 'falso', 54, 'goal', 'miss', 'Falso ile uzak köşeye! Kaleci bakakaldı.', 'Falso tutmadı, top dışarı.'),
        o('Arka direğe ortala', 'orta', 42, 'assist', 'lost', 'Ortan arka direkte gol oldu!', 'Ortan kaleciye gitti.'),
        o('Topu sakla, faul al', 'kurnazlik', 30, 'keep', 'lost', 'Hakem faulü verdi, tehlikeli serbest vuruş.', 'Hakem devam dedi.')] },
      { t: 'Altı pasın önünde boş kaldın ama top arkanda geliyor.', o: [
        o('Topuk vuruşu dene', 'bitiricilik', 64, 'goal', 'miss', 'Topukla gol! Stat çıldırdı!', 'Topuk vuruşu kaleciye.'),
        o('Dön ve vur', 'reaksiyon', 50, 'goal', 'miss', 'Ani dönüş, gol!', 'Dönerken top kaçtı.'),
        o('Arkaya, gelen arkadaşa bırak', 'pas', 30, 'assist', 'lost', 'Arkadaşın gelişine vurdu, gol!', 'Bıraktığın top savunmaya gitti.')] }
    ]
  };
  D.attackStageNames = { build: 'Kurulum', mid: 'Son üçte bir', final: 'Bitiriş' };
  D.attackOrder = ['build', 'mid', 'final'];
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  /* ---------- Birleşik yetenekler ve alternatif senaryolar ----------
     Her seçenek ana yeteneğin yanında ikinci bir yeteneğe de bakar (ana %65, ikinci %35).
     Örnek: uzaktan şut = Uzaktan şut + Şut gücü; ortalama = Orta + Falso; kafa = Kafa isabeti + Zıplama. */
  const D = root.F.DATA;
  const PAIR = {
    uzakSut: 'sut', sut: 'bitiricilik', bitiricilik: 'hucumPoz', vole: 'topKontrol', penalti: 'sakinlik', hucumPoz: 'reaksiyon',
    orta: 'falso', duranTop: 'falso', falso: 'orta', uzunPas: 'vizyon', vizyon: 'pas', pas: 'topKontrol',
    dribling: 'ceviklik', ceviklik: 'denge', topKontrol: 'denge', reaksiyon: 'sakinlik', sakinlik: 'reaksiyon', denge: 'fizik',
    hizlanma: 'hiz', hiz: 'hizlanma', dayaniklilik: 'hiz',
    kafa: 'ziplama', ziplama: 'kafa', savunma: 'pozisyon', kayarak: 'savunma', topKesme: 'pozisyon', pozisyon: 'reaksiyon',
    fizik: 'denge', agresiflik: 'fizik',
    kalecilik: 'refleks', refleks: 'reaksiyon', kaleciPoz: 'reaksiyon', elKullanimi: 'kaleciPoz', degaj: 'uzunPas'
  };
  D.attrPair = PAIR;
  // az kullanılan yetenekler için yeni maç durumları (her birinde kolay bir seçenek var)
  const o = (t, a, d, win, lose, winT, loseT) => ({ t, a, d, win, lose, winT, loseT });
  const add = (grp, mo) => (D.moments[grp] = D.moments[grp] || []).push(mo);
  ['FV', 'OS'].forEach((g) => add(g, { t: 'Son dakikalar, bacakların kopuyor ama savunmanın arkasında boşluk var.', o: [
    o('Son bir depar at', 'dayaniklilik', 56, 'chance', 'lost', 'Ciğerlerin yanıyor ama topa yetiştin, şutun kalecide!', 'Bacakların gitmedi, top auta çıktı.'),
    o('Topu ayağında tut, zaman kazan', 'topKontrol', 28, 'keep', 'lost', 'Topu korudun, saniyeler eridi.', 'Topu kaptırdın.')] }));
  ['FV', 'OS', 'DF'].forEach((g) => add(g, { t: 'Rakip omuz omuza çarpıştı, dengen bozuldu ama top hâlâ sende.', o: [
    o('Dengeni koru, devam et', 'denge', 50, 'chance', 'lost', 'Düşmedin! Hakem avantaj verdi, atak sürüyor.', 'Yere düştün, top gitti.'),
    o('Yere düş, faul iste', 'kurnazlik', 40, 'keep', 'yellow', 'Hakem faulü verdi.', 'Hakem yemedi: simülasyondan sarı kart.'),
    o('Topu hemen arkadaşına ver', 'pas', 24, 'keep', 'lost', 'Sade bir pas, top takımda.', 'Pas kısa kaldı.')] }));
  ['DF'].forEach((g) => add(g, { t: 'Uzun top geliyor, rakip santrforla hava topuna çıkacaksın.', o: [
    o('Zamanlamayla yüksel', 'ziplama', 50, 'block', 'concede', 'Herkesten yükseğe çıktın, top uzaklaştı.', 'Santrfor kafayı vurdu, gol.'),
    o('Santrforu ittir, sıçramasını boz', 'agresiflik', 42, 'block', 'foul', 'Santrfor dengesini kaybetti, top sende.', 'Hakem faul çaldı.'),
    o('Topu sektirip kontrol et', 'pozisyon', 28, 'keep', 'lost', 'Top yere düştü, sakin kontrol.', 'Top rakibe sekti.')] }));
  ['FV', 'OS', 'DF'].forEach((g) => add(g, { t: 'Rakip oyuncu yüzüne bağırıyor, seni kışkırtmaya çalışıyor.', o: [
    o('Sakinliğini koru', 'sakinlik', 34, 'keep', 'yellow', 'Hiç tepki vermedin. Rakip daha çok sinirlendi.', 'Sonunda dayanamadın, sarı kart.'),
    o('Sertliğini sahada göster', 'agresiflik', 52, 'chance', 'red', 'Sonraki ikili mücadelede topu aldın, rakip sindi.', 'Hakem sert girişini kırmızıyla cezalandırdı!')] }));
  add('KL', { t: 'Ceza sahasında karambol, top yerde seken bir hal aldı.', o: [
    o('Kendini topun üstüne at', 'reaksiyon', 50, 'save', 'concede', 'Kalabalığın içinden topu kucakladın!', 'Topa yetişemedin, gol.'),
    o('Yerinde kal, açıyı kapat', 'kaleciPoz', 30, 'keep', 'concede', 'Yerini korudun, savunma topu uzaklaştırdı.', 'Top ağlara süründü.')] });
  // tüm seçeneklere ikinci yetenek
  const all = Object.values(D.moments).concat(Object.values(D.attackStages || {}));
  all.forEach((list) => (list || []).forEach((mo) => mo.o.forEach((x) => { if (!x.a2 && PAIR[x.a] && D.attrs[x.a]) x.a2 = PAIR[x.a]; })));
})(typeof window !== 'undefined' ? window : globalThis);
