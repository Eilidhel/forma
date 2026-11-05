/* FORMA — maç içi yeni hareketler
   - Topsuz oyun: savunma arkasına koşu, sahte koşu (arkadaşına alan açmak), topu ayağına istemek.
   - Duvar pası (ver-kaç) takım arkadaşınla.
   - Faul kazanmak artık işe yarar: "fkwon" sonucu tehlikeli bölgede serbest vuruşa (fk aşaması) götürür;
     frikiği kendin kullanırsın: direkt kaleye, ceza sahasına orta ya da kısa kombinasyon.
   - Ceza sahasında temasla penaltı kazanırsan ("penwon") penaltıyı sen atarsın (pk aşaması). */
(function (root) {
  const D = root.F.DATA;
  const o = (t, a, d, win, lose, winT, loseT, extra) => Object.assign({ t, a, d, win, lose, winT, loseT }, extra || {});
  const A = D.attackStages;
  // Her durumda ilk seçenek en güvenli olanıdır; diğerleri risklidir ama daha çok getirir.
  A.build.push(
    { t: "{takimarkadasi} topu sürüyor, sen boştasın. Rakip savunma hattı orta sahaya kadar çıkmış.", o: [
      o("Topu ayağına iste", 'pas', 24, 'adv', 'lost', "Top ayağına geldi, oyunu ileri taşıdın.", "Pas araya girdi."),
      o("Savunma arkasına koşu at", 'hizlanma', 42, 'adv2', 'lost', "Doğru anda koştun, pas tam önüne düştü! Ofsayt yok!", "Koşunu erken yaptın, ofsayt bayrağı kalktı."),
      o("Sahte koşu, stoperi peşine tak", 'hucumPoz', 30, 'adv', 'lost', "Sahte koşun stoperi sürükledi, arkadaşının önü açıldı.", "Kimse seni takip etmedi, arkadaşın sıkıştı.")] },
    { t: "Orta sahada {takimarkadasi} yanında, önünde tek bir rakip var.", o: [
      o("Duvar pası: ver ve koş", 'pas', 28, 'adv', 'lost', "Ver-kaç! Rakip arada kaldı, önün açıldı.", "Duvar pası geri gelmedi."),
      o("Rakibe sırtını dön, faul yaptır", 'kurnazlik', 40, 'fkwon', 'lost', "Rakip arkadan çarptı, hakem düdüğü çaldı. Serbest vuruş!", "Hakem devam dedi, top rakipte."),
      o("Topu sür", 'dribling', 48, 'adv', 'lost', "Rakibi geçtin, önün açık.", "Topu kaptırdın.")] },
    { t: "Stoperden top geldi, rakip forvet hızla üstüne geliyor.", o: [
      o("Kaleciye geri ver", 'pas', 14, 'recycle', 'lost', "Kaleci topu aldı, oyun yeniden kuruluyor.", "Geri pas kısa kaldı, forvet araya girdi!"),
      o("Forvete uzun top", 'uzunPas', 44, 'adv2', 'lost', "Uzun top forvetin göğsüne indi! Atak bir anda rakip yarı sahada.", "Uzun top savunmaya gitti."),
      o("Forveti çalımla, sür", 'dribling', 52, 'adv', 'concede', "Forveti boşa düşürdün, orta saha önündesin!", "Topu kaptırdın, rakip boş kaleye gol attı!")] },
    { t: "Orta sahada döndün. Kırk metre önünde forvetin boşta, rakip kaleci de önde.", o: [
      o("Yakındaki arkadaşa kısa pas", 'pas', 24, 'adv', 'lost', "Kısa pas, oyun akıyor.", "Pas araya girdi."),
      o("Forvete kırk metrelik pas", 'uzunPas', 46, 'adv2', 'lost', "Milimetrik uzun pas! Forvet kaleye gidiyor.", "Pas uzun kaldı, kaleci aldı."),
      o("Kaleci önde: orta sahadan şut!", 'uzakSut', 76, 'goal', 'miss', "İNANILMAZ! Orta sahadan aşırtma, top ağlarda!", "Top kalenin çok üstünden auta gitti. Tribünden gülüşmeler.")] }
  );
  A.mid.push(
    { t: "Ceza sahası önündesin, rakip orta saha sert girmeye hazırlanıyor.", o: [
      o("Tek dokunuşla arkadaşına ver", 'pas', 30, 'adv', 'lost', "Tek dokunuş, rakip boşa düştü.", "Pas kısa kaldı."),
      o("Temasa izin ver, faul kazan", 'kurnazlik', 36, 'fkwon', 'lost', "Sert giriş geldi, düdük! Ceza sahasının hemen önünden serbest vuruş.", "Hakem oyunu durdurmadı, top gitti."),
      o("Gücünü koy, devam et", 'denge', 50, 'adv', 'lost', "Girişe rağmen ayakta kaldın, ceza sahasındasın!", "Yere düştün, top rakipte.")] },
    { t: "Forvet {takimarkadasi} topu istiyor, sırtında stoper var.", o: [
      o("Duvar pası, içeri dal", 'pas', 34, 'adv', 'lost', "Ver-kaç tuttu, ceza sahasındasın!", "Forvet topu tutamadı."),
      o("Sahte koşu, forvete alan aç", 'hucumPoz', 34, 'chance', 'lost', "Stoper seninle gitti, forvet boşta şut çekti! Kaleci son anda çeldi.", "Stoper yerini bozmadı."),
      o("Savunma arkasına koş", 'hiz', 46, 'adv', 'lost', "Koşuna pas geldi, kaleye gidiyorsun!", "Stoper seni omuzla dışarı itti.")] },
    { t: "Ceza sahasındasın, stoper arkandan çekiştiriyor.", o: [
      o("Hemen arkadaşına çıkar", 'pas', 30, 'adv', 'lost', "Temastan kurtulup pası verdin, top tehlikeli bölgede.", "Pas stopere çarptı."),
      o("Dengeni bozmadan devam et", 'denge', 52, 'adv', 'lost', "Çekiştirmeye rağmen devam ettin!", "Dengen bozuldu, top auta."),
      o("Temasla yere git, penaltı iste", 'kurnazlik', 46, 'penwon', 'yellow', "Hakem beyaz noktayı gösterdi! PENALTI!", "Hakem simülasyon dedi: sarı kart.")] },
    { t: "Ceza yayının 25 metre önündesin. Önün açık, kaleci biraz önde duruyor.", o: [
      o("Kanattaki arkadaşa aç", 'pas', 26, 'adv', 'lost', "Top kanada açıldı, orta için hazırlanıyor.", "Pas fazla sert oldu."),
      o("Uzaktan sert vur", 'uzakSut', 58, 'goal', 'miss', "Yirmi beş metreden füze! Top üst köşede!", "Şut kalecinin kucağına gitti."),
      o("Kalecinin üstünden aşırt", 'falso', 66, 'goal', 'miss', "Aşırtma! Kaleci geri koştu ama yetişemedi!", "Aşırtma üst direğin üstünden gitti.")] },
    { t: "Kanatta sıkıştın, iki rakip seni kapattı. Arkanda bek boşta.", o: [
      o("Geri dön, beke ver", 'pas', 16, 'recycle', 'lost', "Top beke döndü, atak yeniden kuruluyor.", "Geri pas bile araya girdi."),
      o("Ters kanada uzun pas", 'uzunPas', 46, 'adv', 'lost', "Oyunun yönünü değiştirdin! Ters kanat boşta, top orada.", "Uzun pas taca gitti."),
      o("Çizgiye in, ortala", 'orta', 54, 'assist', 'lost', "İkisinin arasından çizgiye inip ortaladın, kafa, gol!", "Ortan ilk direkteki savunmaya çarptı.")] },
    { t: "Rakip ceza sahasına gömüldü. Ceza sahası dışında top sende, kimse sana basmıyor.", o: [
      o("Sabırla yana pas", 'pas', 22, 'recycle', 'lost', "Top ayaklarda, rakip yer değiştirmek zorunda.", "Sabırsız bir pas."),
      o("Uzaktan şut dene", 'uzakSut', 56, 'goal', 'miss', "Kalabalığın arasından süzüldü, gol!", "Şut savunmaya çarpıp korner oldu."),
      o("Falsolu, uzak köşeye", 'falso', 60, 'goal', 'miss', "Falsolu vuruş uzak köşeden içeri!", "Falso tutmadı, top auta.")] }
  );
  A.final.push(
    { t: "Ceza sahası köşesindesin, {takimarkadasi} içeri koşu yapıyor.", o: [
      o("Duvar pası, kaleye dal", 'pas', 38, 'goal', 'lost', "Ver-kaç, kaleciyle karşı karşıya, gol!", "Duvar pası savunmaya çarptı."),
      o("Arkadaşının koşusuna ara pas", 'vizyon', 42, 'assist', 'lost', "Ara pasın arkadaşının önüne, gol!", "Pasın uzun kaldı."),
      o("Faul yaptır, serbest vuruş al", 'kurnazlik', 36, 'fkwon', 'lost', "Bek arkandan girdi, düdük! Ceza sahası çizgisinde serbest vuruş.", "Hakem avantaj vermedi, top gitti.")] },
    { t: "Kafa topundan seken top ceza sahası dışında sana geldi.", o: [
      o("Kontrol et, kale önüne pas", 'pas', 32, 'assist', 'lost', "Sakin kontrol, kale önündeki arkadaşına pas, gol!", "Kontrol uzun kaldı."),
      o("Gelişine uzaktan vole", 'vole', 62, 'goal', 'miss', "Gelişine vole, top ağları deldi! Yılın golü adayı!", "Vole tribüne gitti."),
      o("Yere indir, plase vur", 'uzakSut', 52, 'goal', 'miss', "Topu indirdin, köşeye yerden plase. Gol!", "Plase direğin yanından auta.")] }
  );
  // Serbest vuruş: kazandığın faulü kullan
  A.fk = [
    { t: "Ceza sahasının hemen dışında serbest vuruş. Baraj kuruldu, kaleci köşesini kapatıyor.", o: [
      o("Kısa oyna, kombinasyon", 'pas', 28, 'adv', 'lost', "Kısa oynadınız, rakip şaşırdı, ceza sahasındasın!", "Kombinasyon rakibe takıldı."),
      o("Barajın üstünden direkt kaleye", 'duranTop', 58, 'goal', 'miss', "Top barajın üstünden doksana! Kaleci kıpırdayamadı!", "Top barajdan döndü."),
      o("Kale önüne ortala", 'orta', 44, 'assist', 'lost', "Ortan kafaya geldi, gol!", "Kaleci ortayı yumrukladı.")] },
    { t: "Kanattan serbest vuruş. Ceza sahasında uzun boylu stoperlerimiz bekliyor.", o: [
      o("Kısa kullan, yeniden kur", 'pas', 20, 'recycle', 'lost', "Top ayağınızda kaldı.", "Kısa pas kesildi."),
      o("Arka direğe falsolu orta", 'falso', 44, 'assist', 'lost', "Arka direkte kafa, gol!", "Orta ilk direkteki savunmaya çarptı."),
      o("Sürpriz: direkt kaleye", 'duranTop', 66, 'goal', 'miss', "Kaleci ortayı bekliyordu, top uzak köşeye!", "Top üstten auta.")] },
    { t: "Otuz metreden serbest vuruş. Kale uzak ama kaleci barajın arkasını göremiyor.", o: [
      o("Ceza sahasına ortala", 'orta', 40, 'assist', 'lost', "Ortan kafaya geldi, gol!", "Orta savunmaya gitti."),
      o("Sert ve yerden vur", 'sut', 62, 'goal', 'miss', "Barajın altından! Kaleci ancak ağlardan aldı!", "Top barajdan sekti."),
      o("Topu kısa çevir, zaman kazan", 'pas', 18, 'recycle', 'lost', "Top takımda kaldı.", "Kısa pas rakibe.")] }
  ];
  // Penaltı: kazandığın penaltıyı kullan
  A.pk = [
    { t: 'Penaltı noktasındasın. Kaleci çizgide zıplıyor, stadyum nefesini tuttu.', o: [
      o('Köşeye plase', 'penalti', 40, 'goal', 'miss', 'Kaleci ters köşe, GOL!', 'Kaleci köşeyi okudu, kurtardı.'),
      o('Ortaya sert vur', 'penalti', 46, 'goal', 'miss', 'Kaleci yattı, top ortadan ağlara!', 'Kaleci yerinde kaldı ve yumrukladı.'),
      o('Panenka', 'penalti', 62, 'goal', 'miss', 'Panenka! Kaleci yerde, top yavaşça ağlara süzüldü!', 'Kaleci yerinde bekledi, topu kucakladı. Stat ıslık çalıyor.')] }
  ];
  D.attackStageNames.fk = 'Serbest vuruş';
  D.attackStageNames.pk = 'Penaltı';
  // eski "faul al" seçenekleri artık serbest vuruşa götürür
  A.final.forEach((mo) => mo.o.forEach((x) => { if (x.win === 'keep' && x.a === 'kurnazlik') { x.win = 'fkwon'; x.winT = 'Hakem faulü verdi, tehlikeli bölgede serbest vuruş!'; } }));
  Object.values(D.moments || {}).forEach((list) => (list || []).forEach((mo) => mo.o.forEach((x) => { if (x.win === 'keep' && x.a === 'kurnazlik' && /faul/i.test(x.t)) x.win = 'fkwon'; })));
  // ikinci yetenekler (attack.js sonunda yapılan eşlemenin yeni seçenekler için tekrarı)
  const PAIR = D.attrPair || {};
  [].concat(...Object.values(A)).forEach((mo) => mo.o.forEach((x) => { if (!x.a2 && PAIR[x.a] && D.attrs[x.a]) x.a2 = PAIR[x.a]; }));
})(typeof window !== 'undefined' ? window : globalThis);
