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
