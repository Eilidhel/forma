/* FORMA — Tribün metinleri, maç anları, basın soruları, menajer tavsiyeleri, aile istekleri */
(function (root) {
  const D = root.F.DATA;

  /* ---------- Tribün (sosyal medya) ---------- */
  D.social = {
    afterMatch: {
      great: [
        '{ad} bugün başka bir gezegendeydi. {opp} maçını izleyen herkes şahit!',
        'Bu çocuk bu ligde fazla. {kulup} yönetimi sözleşmeyi hemen uzatsın.',
        '{adsoyad} sahada, ben tribünde ağlıyorum. Ne oyun be!',
        'Maçın adamı tartışmasız {ad}. Puanım 9.',
        'Yıllardır böyle bir {mevki} görmedik. {memleket} gurur duyuyor.'
      ],
      good: [
        'İyi maçtı {ad}, devam!', '{ad} her hafta biraz daha iyi. Sabır meyvesini veriyor.',
        'Bugün {ad} sahadaydı, fark edildi.', 'Skor {skor}. {ad} yine işini yaptı.', 'Bu adamı kadroda gördükçe içim rahat.'
      ],
      meh: [
        '{ad} bugün yoktu, olur böyle günler.', 'Ne iyi ne kötü. {ad} biraz daha cesur olmalı.',
        'Vasat bir {opp} maçı. Kimse parlamadı.', '{ad} ısınamadı bugün. Bir dahakine.'
      ],
      bad: [
        '{ad} bu formayı hak etmiyor. Yedeğe!', 'Bugün {adsoyad} yüzünden puan kaybettik, net.',
        'Instagram\'da poz verirken iyi, sahada sıfır.', 'Hocam lütfen {ad} yerine gençlere şans ver.',
        'Bu performansla {ustkulup} seni değil, seni izleyen tribünü alır.'
      ]
    },
    bench: [
        '{ad} neden oynamıyor? Hoca açıklasın!', '{adsoyad} kadroda bile yok. Bir şey mi oldu?',
        'Yedek kulübesinde {ad} çürüyor. Yazık.', '{hoca} hocanın {ad} ile sorunu mu var?'
    ],
    clubGoal: [
      'GOOOL! {dk}. dakikada {adsoyad} ağları sarstı!', '{dk}\' {adsoyad} ve top filelerde! ⚽', '{adsoyad} {dk}. dakikada sahneye çıktı. Gol!'
    ],
    viral: [
      '{adsoyad} {opp} maçında öyle bir hareket yaptı ki rakip hâlâ topu arıyor. Video 2 milyon izlendi.',
      'Haftanın en çok konuşulan ismi: {adsoyad}. Sosyal medya yıkıldı.',
      '"Bu kim?" sorusu trendlerde. Cevap: {memleket} çocuğu {adsoyad}.'
    ],
    fan: [
      '{ad} formasını aldım, kardeşim de istiyor şimdi.', '{kulup} taraftarı olarak {ad} için tezahürat bestelesek mi?',
      '{ad} ile dün otogarda karşılaştım, çok mütevazı adam.', 'Abi {ad} bir gün milli takımda oynar, buraya yazıyorum.',
      '{ad} antrenmanda serbest vuruş çalışıyormuş, kaleci ağlamış diyorlar.', 'Bu hafta {rakipkulup} maçı var, {ad} gol atar mı?',
      'Çocuğumun ilk forması {ad} forması olsun istiyorum.', '{memleket} çocuğu {ad}, hepimizin gururu.'
    ],
    rumor: [
      'KULİS: {ustkulup} scout ekibi {adsoyad} için raporunu hazırladı.', 'İddia: {buyukkulup} yönetimi {adsoyad} transferi için menajeriyle görüştü.',
      '{yabancikulup} {adsoyad} ile ilgileniyor mu? Kaynaklarımız evet diyor.', 'Transfer bombası iddiası: {ustkulup}, {adsoyad} için teklif hazırlıyor.',
      'Duyduğumuza göre {adsoyad} sezon sonunda {kulup} ile yollarını ayırabilir.'
    ],
    journalist: [
      '{kulup} cephesinde işler karışık: yönetim ile {hoca} arasında gerginlik var.', 'Köşe yazım yayında: "{adsoyad} gerçekten bu kadar iyi mi?"',
      '{lig} bu sezon hiç olmadığı kadar çekişmeli.', '{adsoyad} hakkında söylenenler abartı mı? Bir sonraki maç cevap verecek.',
      'Yerel basın olarak {kulup} maçlarını takipteyiz. {ad} ilgiyi hak ediyor.', '{hoca} hocanın sistemi {ad} gibi oyunculara uymuyor olabilir.'
    ],
    partner: [
      'Hafta sonu kaçamağı 🌊', 'Maç günü tribünde, sesim kısıldı!', 'Gurur duyuyorum ❤️', 'Bu akşam ev yemeği, menüde mantı var.',
      'Bazıları anlamaz, futbolcu sevgilisi olmak sabır işi.', 'Yeni bir projeye başladım, heyecanlıyım!'
    ],
    family: [
      'Oğlumun maçını komşularla izledik, mahalle ayağa kalktı!', 'Bayramda oğlum gelemedi ama gönlü burada.',
      'Yemekte oğlumun sevdiği dolmayı yaptım, keşke burada olsaydı.', 'Allah\'ım sakatlıktan korusun yavrumu.',
      'Gazetede oğlumun fotoğrafını kesip duvara astım.'
    ],
    lux: [
      '{ad} yine yeni bir arabayla antrenmana gelmiş. Önce sahada göster!', 'Sahada değil, sosyal medyada yıldız {ad}.',
      '{ad} çok para kazanıyor diye kıskanmıyorum ama biraz alçakgönüllülük iyi olurdu.', '{ad} abinin saati benim evimden pahalı 😅',
      'Lüks hayatın hakkını veriyorsun {ad}, ama formanın da hakkını ver.'
    ],
    hometown: [
      '{memleket} gençleri {adsoyad} gibi olmak istiyor. Halı sahalar dolup taşıyor.', '{memleket} kahvelerinde konu tek: {ad} bu hafta oynayacak mı?',
      'Hemşehrimiz {adsoyad} başarılarıyla gururlandırıyor.', '{memleket} Belediyesi, {ad} için tebrik pankartı astı.'
    ],
    club: [
      'Antrenman programımız yarın 10.00\'da. Taraftarlarımızı bekliyoruz!', 'Yeni sezon formalarımız mağazalarda!',
      '{rakipkulup} maçının biletleri satışta.', 'Kulübümüzün altyapı seçmeleri bu hafta sonu yapılacak.'
    ],
    myPost: {
      mutevazi: ['Takımımla gurur duyuyorum. Daha çok çalışacağız. 🙏', 'Bireysel değil, takım kazanır. Devam!', 'Sizin desteğiniz her şey. Teşekkürler {kulup} ailesi.'],
      iddiali: ['Bu daha başlangıç. Adımı ezberleyin.', 'Benim seviyem bu lig değil. Görecekler.', 'Hedef büyük. Sınır yok. 🔥'],
      duygusal: ['Bu formayı giymek çocukluk hayalimdi. {memleket}\'deki sahadan buraya…', 'Anneciğim, bu senin için. ❤️', 'Bazen düşüyorsun, ama kalkmak senin elinde.'],
      sponsorlu: ['Yeni kramponlarım ayağımda! Hızımın sırrı. #işbirliği', 'Enerjimin kaynağı bu içecek. #reklam', 'Antrenman sonrası favori saatim. #sponsor'],
      provokatif: ['Konuşan konuşsun, skor tabelası ortada.', 'Bazıları beni çok konuşuyor. Kıskançlık kötü bir hastalık.', 'Herkes yerini bilecek. 😎']
    },
    comments: {
      mutevazi: ['Böyle futbolcu kalmadı!', 'Saygılar kral 👏', 'Mütevazı adam, helal olsun.', 'Seni seviyoruz!'],
      iddiali: ['Önce sahada göster!', 'İşte böyle, korkmayacağız!', 'Biraz yavaş kardeşim 😅', 'Kral geri döndü 🔥'],
      duygusal: ['Ağlattın abi 😢', 'Annene selam olsun!', 'Bu formayı hak ediyorsun.', 'Gözlerim doldu.'],
      sponsorlu: ['Reklam zamanı 😂', 'Link nerede?', 'Para her şey mi kardeşim?', 'Bende de var, süper ürün!'],
      provokatif: ['Ortalık yanacak 🔥🔥', 'Kime laf soktun anlamadım', 'Bu cesaret nereden?', 'Hocan bunu görürse…']
    },
    buy: {
      luks: ['{ad} yine yeni bir şey almış, keşke biraz da antrenmana yatırım yapsa.', 'Yeni lüks oyuncak, {ad} tarzında!', 'Para var huzur var, {ad} hayatı yaşıyor.'],
      sac: ['{ad} yeni saçıyla bambaşka olmuş!', 'Bu saç modeli ne kardeşim 😂', 'Saçı değiştirdi, formu da değişsin.'],
      dovme: ['{ad} kolunu boydan boya dövmeyle kaplamış!', 'Dövme şık olmuş, ama annesi ne diyor?', 'Yeni dövme, yeni {ad}.'],
      heykel: ['{memleket} meydanına {ad} heykeli! Fazla değil mi?', 'Daha 30 yaşında değil, heykeli var 😂', 'Efsaneyi bronza döktüler.']
    },
    groupChat: [
      { t: 'Yarın antrenman 9\'da, geç kalan çay ısmarlar.', who: 'kaptan' },
      { t: 'Hoca bugün çok sinirliydi, kimse bir şey demesin.', who: 'any' },
      { t: 'Akşam halı saha? Kaybeden takım lahmacun ısmarlar.', who: 'kanka', if: { tier: [3, 4, 5] } },
      { t: '{ad} dünkü golü izledin mi tekrar? Kaleci hâlâ arıyor topu 😂', who: 'kanka' },
      { t: 'Maaşlar ne zaman yatacak, bilen var mı?', who: 'any', if: { flag: 'maas_gecikiyor' } },
      { t: 'Deplasman otobüsü 5\'te kalkıyor, uyuyakalmayın.', who: 'kaptan' },
      { t: 'Biri bana yeni kramponu nereden aldığını söylesin.', who: 'any' },
      { t: 'Hocanın yeni taktiğini anlayan var mı? Ben anlamadım 😅', who: 'any' },
      { t: '{ad} yeni araban güzelmiş, bizi de gezdir!', who: 'kanka', if: { lux: ['>=', 2] } },
      { t: 'Bu hafta derbi var, kafalar sahada olsun beyler.', who: 'kaptan' },
      { t: 'Kim bu hafta sonu doğum günü kutlamasına geliyor?', who: 'any' },
      { t: 'Saha yine çamur, kramponları değiştirin.', who: 'any', if: { tier: [4, 5] } },
      { t: 'Taraftar grubu yarın antrenmanı izlemeye geliyormuş.', who: 'kaptan' },
      { t: 'Kardeşim {ad}, telefonu kapalıydı, merak ettik.', who: 'kanka' }
    ]
  };

  /* ---------- Maç anları ---------- */
  // a: kullanılan özellik (saha ya da kişisel yetenek), d: zorluk, win/lose: sonuç türü
  const pen = { t: 'Penaltı! Topu sen aldın, stadyum nefesini tuttu.', o: [
    { t: 'Sağ alt köşe', a: 'sogukkanlilik', d: 32, win: 'goal', lose: 'miss', winT: 'Kaleci yanlış köşede. Gol!', loseT: 'Kaleci köşeyi okudu, kurtardı.' },
    { t: 'Ortaya sert', a: 'sogukkanlilik', d: 42, win: 'goal', lose: 'miss', winT: 'Kaleci atladı, top ortadan ağlara!', loseT: 'Kaleci yerinden kıpırdamadı, top kucağında.' },
    { t: 'Panenka dene', a: 'sogukkanlilik', d: 60, win: 'goal', lose: 'miss', winT: 'Yavaşça aşırttın. Tribünler çıldırdı!', loseT: 'Kaleci bekledi, topu tuttu. Yarın her yerde alay konusu olacaksın.' }
  ] };
  const freeKick = { t: 'Ceza sahası dışında serbest vuruş. Top senin.', o: [
    { t: 'Direkt kaleye', a: 'sut', d: 64, win: 'goal', lose: 'miss', winT: 'Barajın üstünden, doksana! Muhteşem gol!', loseT: 'Top barajdan döndü.' },
    { t: 'Kafa için ortala', a: 'pas', d: 48, win: 'assist', lose: 'lost', winT: 'Ortana takım arkadaşın kafayı vurdu. Gol!', loseT: 'Kaleci çıktı, topu aldı.' }
  ] };
  D.moments = {
    FV: [
      { t: 'Ceza sahası dışında topla buluştun, önün açık.', o: [
        { t: 'Şut çek', a: 'sut', d: 58, win: 'goal', lose: 'miss', winT: 'Füze gibi! Top ağlarda.', loseT: 'Top üst direğin üstünden auta.' },
        { t: 'Kanada pas', a: 'pas', d: 45, win: 'assist', lose: 'lost', winT: 'Kanattaki arkadaşın tek vuruşta gönderdi. Asist!', loseT: 'Pasın araya girdi.' },
        { t: 'Çalımla içeri gir', a: 'dribling', d: 55, win: 'chance', lose: 'lost', winT: 'İki kişiyi geçtin, tribün ayakta ama şut kaleciye.', loseT: 'Stoper topu ayağından aldı.' }] },
      { t: 'Kaleciyle karşı karşıyasın!', o: [
        { t: 'Köşeye plase', a: 'sut', d: 48, win: 'goal', lose: 'miss', winT: 'Soğukkanlı bir plase. Gol!', loseT: 'Kaleci ayağıyla çıkardı.' },
        { t: 'Kaleciyi çalımla', a: 'dribling', d: 57, win: 'goal', lose: 'lost', winT: 'Kaleciyi yere oturttun, boş kaleye gol!', loseT: 'Kaleci topu ayağından söktü.' },
        { t: 'Yandakine çıkar', a: 'pas', d: 40, win: 'assist', lose: 'lost', winT: 'Bencil olmadın, arkadaşın boş kaleye attı.', loseT: 'Pas arkada kaldı, fırsat gitti.' }] },
      { t: 'Korner! Kafa topu için yükseliyorsun.', o: [
        { t: 'Kafa vuruşu', a: 'kafa', d: 55, win: 'goal', lose: 'miss', winT: 'Kafayı vurdun, top köşede!', loseT: 'Kafan auta gitti.' },
        { t: 'Arkaya indir', a: 'kafa', d: 44, win: 'assist', lose: 'miss', winT: 'İndirdiğin topu arkadaşın gole çevirdi.', loseT: 'Top savunmaya çarptı.' },
        { t: 'Stopere yüklen', a: 'fizik', d: 48, win: 'chance', lose: 'foul', winT: 'Stoperi taşıdın, karambol ama gol değil.', loseT: 'Hakem faul çaldı.', risk: 0.15 }] },
      pen,
      { t: 'Kontra atak! Savunmanın arkasına koşuyorsun.', o: [
        { t: 'Hızla geç ve vur', a: 'hiz', d: 58, win: 'goal', lose: 'lost', winT: 'Kimse yetişemedi. Gol!', loseT: 'Stoper son anda yetişti.' },
        { t: 'Yavaşla, pas ver', a: 'pas', d: 45, win: 'assist', lose: 'lost', winT: 'Arkadan gelen arkadaşına bıraktın. Gol!', loseT: 'Atak dağıldı.' },
        { t: 'Kendini yere at', a: 'kurnazlik', d: 62, win: 'chance', lose: 'yellow', winT: 'Hakem serbest vuruş verdi.', loseT: 'Hakem yemedi: sarı kart, simülasyon.' }] },
      { t: 'Rakip stoper sana sert girdi, ortalık gerildi.', o: [
        { t: 'Sakin kal, kalk', a: 'sogukkanlilik', d: 35, win: 'keep', lose: 'yellow', winT: 'Kalktın, stoper sarı gördü.', loseT: 'Kendini tutamadın, itiştin. Sarı kart.' },
        { t: 'Göğüs göğüse gel', a: 'fizik', d: 70, win: 'keep', lose: 'red', winT: 'Geri adım atmadın, stoper sindi.', loseT: 'Kafa attın. Direkt kırmızı!' }] },
      freeKick
    ],
    OS: [
      { t: 'Orta sahada topu aldın, forvet derinlemesine koşuyor.', o: [
        { t: 'Ara pası', a: 'pas', d: 52, win: 'assist', lose: 'lost', winT: 'Milimetrik pas! Forvet gole çevirdi.', loseT: 'Pas biraz uzun kaldı.' },
        { t: 'Kendin sür', a: 'dribling', d: 55, win: 'chance', lose: 'lost', winT: 'İlerledin ama şutun kaleciye.', loseT: 'Topu kaptırdın, kontra yediniz.' },
        { t: 'Güvenli pas', a: 'pas', d: 32, win: 'keep', lose: 'lost', winT: 'Oyunu sakinleştirdin.', loseT: 'Basit pası bile kaptırdın.' }] },
      { t: 'Ceza yayının önünde boş kaldın.', o: [
        { t: 'Uzaktan vur', a: 'sut', d: 60, win: 'goal', lose: 'miss', winT: 'Plase vuruş, köşeye. Gol!', loseT: 'Top direği yalayıp çıktı.' },
        { t: 'Duvar pas', a: 'pas', d: 48, win: 'assist', lose: 'lost', winT: 'Ver-kaç, arkadaşın gol attı.', loseT: 'Duvar pası savunmaya takıldı.' }] },
      { t: 'Rakip kontra başlattı, önünde tek sen varsın.', o: [
        { t: 'Taktik faul', a: 'savunma', d: 35, win: 'block', lose: 'yellow', winT: 'Atağı kestin, kartsız kurtuldun.', loseT: 'Atağı kestin ama sarı kart gördün.' },
        { t: 'Kayarak müdahale', a: 'savunma', d: 55, win: 'block', lose: 'concede', winT: 'Temiz müdahale! Tribün alkışlıyor.', loseT: 'Rakip seni geçti, gol oldu.' },
        { t: 'Geri koş', a: 'hiz', d: 52, win: 'block', lose: 'concede', winT: 'Yetiştin, topu çeldin.', loseT: 'Yetişemedin, rakip golü buldu.' }] },
      freeKick,
      { t: 'Pres altındasın, iki rakip üstüne geliyor.', o: [
        { t: 'Çalımla çık', a: 'dribling', d: 58, win: 'chance', lose: 'concede', winT: 'İkisini de geçtin, atak sizde!', loseT: 'Topu kaptırdın, rakip gol buldu.' },
        { t: 'Geri pas', a: 'pas', d: 30, win: 'keep', lose: 'lost', winT: 'Sakince geri verdin.', loseT: 'Geri pas kısa kaldı.' }] },
      { t: 'Kanattan içeri kat ediyorsun.', o: [
        { t: 'Ortala', a: 'pas', d: 50, win: 'assist', lose: 'lost', winT: 'Orta, kafa, gol!', loseT: 'Ortan arka direkten auta.' },
        { t: 'Ters köşe şut', a: 'sut', d: 62, win: 'goal', lose: 'miss', winT: 'Ters köşe! Kaleci bakakaldı.', loseT: 'Şutun yan ağlarda.' }] },
      pen
    ],
    DF: [
      { t: 'Rakip forvet hızla üstüne geliyor.', o: [
        { t: 'Kayarak müdahale', a: 'savunma', d: 55, win: 'block', lose: 'concede', winT: 'Temiz top! Forvet yerde, top sende.', loseT: 'Kaydın ama forvet üstünden atladı. Gol.', risk: 0.2 },
        { t: 'Pozisyon al, beklet', a: 'savunma', d: 45, win: 'block', lose: 'concede', winT: 'Sabırla bekledin, topu aldın.', loseT: 'Forvet çabuk davrandı, şut ve gol.' },
        { t: 'Faul yap', a: 'fizik', d: 25, win: 'block', lose: 'yellow', winT: 'Faulü yaptın, hakem görmedi.', loseT: 'Hakem sarı kartı çıkardı.', risk: 0.5 }] },
      { t: 'Köşe vuruşu: rakip kafaya yükseliyor.', o: [
        { t: 'Kafayla uzaklaştır', a: 'kafa', d: 50, win: 'block', lose: 'concede', winT: 'Herkesten yükseğe çıktın.', loseT: 'Rakip senden önce davrandı. Gol.' },
        { t: 'Adamını tut', a: 'fizik', d: 50, win: 'block', lose: 'concede', winT: 'Rakibi kıpırdatmadın.', loseT: 'Adamın sıyrıldı ve kafayı vurdu.' }] },
      { t: 'Korner sizde, sen de ceza sahasındasın.', o: [
        { t: 'Kafa vur', a: 'kafa', d: 58, win: 'goal', lose: 'miss', winT: 'Stoper golü! Kafayı köşeye gömdün.', loseT: 'Kafan üstten auta.' },
        { t: 'Arkadaşına indir', a: 'kafa', d: 48, win: 'assist', lose: 'miss', winT: 'İndirdin, arkadaşın gol yaptı.', loseT: 'Top kalecide.' }] },
      { t: 'Geride topla buluştun, rakip pres yapıyor.', o: [
        { t: 'Uzun top', a: 'pas', d: 45, win: 'chance', lose: 'lost', winT: 'Uzun top forvetin ayağında, tehlike!', loseT: 'Top boşluğa gitti.' },
        { t: 'Kısa pas', a: 'pas', d: 36, win: 'keep', lose: 'concede', winT: 'Oyunu geriden kurdun.', loseT: 'Pasın araya girdi, rakip affetmedi.' },
        { t: 'Topu sürerek çık', a: 'dribling', d: 60, win: 'chance', lose: 'concede', winT: 'Orta sahaya kadar sürdün, tribün ayakta.', loseT: 'Topu kaptırdın, gol yediniz.' }] },
      { t: 'Son dakikalar, rakip ceza sahasında şut çekiyor.', o: [
        { t: 'Kendini at', a: 'fizik', d: 48, win: 'block', lose: 'concede', winT: 'Şutu vücudunla bloke ettin!', loseT: 'Top bacağından sekip ağlara.' },
        { t: 'Ayağını uzat', a: 'savunma', d: 54, win: 'block', lose: 'concede', winT: 'Son anda kornere çeldin.', loseT: 'Yetişemedin.' }] },
      { t: 'Rakip forvet kulağına bir şeyler fısıldıyor, provoke ediyor.', o: [
        { t: 'Duymazdan gel', a: 'sogukkanlilik', d: 38, win: 'keep', lose: 'yellow', winT: 'Oyununu oynadın, forvet sinirlendi.', loseT: 'Sonunda dayanamadın, sarı kart.' },
        { t: 'Sert omuz at', a: 'fizik', d: 66, win: 'keep', lose: 'red', winT: 'Forveti yere serdin, hakem görmedi.', loseT: 'Hakem gördü: kırmızı kart!' }] },
      { t: 'Kanattan bindirme fırsatı.', o: [
        { t: 'Bindir ve ortala', a: 'pas', d: 52, win: 'assist', lose: 'lost', winT: 'Ortan gol oldu. Asist!', loseT: 'Ortan kaleciye gitti, arkanda boşluk kaldı.' },
        { t: 'Geride kal', a: 'savunma', d: 30, win: 'keep', lose: 'lost', winT: 'Disiplinli kaldın.', loseT: 'Atak boşa gitti.' }] }
    ],
    KL: [
      { t: 'Rakip forvet altı pasın içinden vurdu!', o: [
        { t: 'Refleksle uzan', a: 'kalecilik', d: 55, win: 'save', lose: 'concede', winT: 'İnanılmaz refleks! Kurtardın.', loseT: 'Top yanından geçti.' },
        { t: 'Açıyı daralt', a: 'kalecilik', d: 58, win: 'save', lose: 'concede', winT: 'Üstüne çıktın, top sana çarptı.', loseT: 'Forvet üstünden aşırttı.', risk: 0.1 }] },
      { t: 'Penaltı! Rakip topun başında.', o: [
        { t: 'Sağa at', a: 'kalecilik', d: 68, win: 'save', lose: 'concede', winT: 'Doğru köşe! PENALTI KURTARDIN!', loseT: 'Top öbür köşede.' },
        { t: 'Sola at', a: 'kalecilik', d: 68, win: 'save', lose: 'concede', winT: 'Sola uçtun ve çıkardın!', loseT: 'Yanlış köşe.' },
        { t: 'Ortada bekle', a: 'sogukkanlilik', d: 62, win: 'save', lose: 'concede', winT: 'Rakip ortaya vurdu, top kucağında!', loseT: 'Top köşeye gitti, kıpırdamadın bile.' }] },
      { t: 'Yüksek bir orta geliyor, ceza sahası kalabalık.', o: [
        { t: 'Yumrukla', a: 'kalecilik', d: 44, win: 'save', lose: 'concede', winT: 'Topu uzaklaştırdın.', loseT: 'Yumruk kısa kaldı, rakip gol yaptı.' },
        { t: 'Kucakla', a: 'kalecilik', d: 55, win: 'save', lose: 'concede', winT: 'Topu kucakladın, tribün alkışlıyor.', loseT: 'Topu düşürdün. Gol!' },
        { t: 'Çizgide kal', a: 'kalecilik', d: 50, win: 'save', lose: 'concede', winT: 'Kafa vuruşunu çizgide çıkardın.', loseT: 'Kafa vuruşu köşeye.' }] },
      { t: 'Birebir! Forvet savunmayı geçti.', o: [
        { t: 'Üstüne çık', a: 'kalecilik', d: 57, win: 'save', lose: 'concede', winT: 'Yüreklice çıktın, topu kaptın.', loseT: 'Forvet seni geçti.', risk: 0.12 },
        { t: 'Bekle, hamleyi gör', a: 'sogukkanlilik', d: 52, win: 'save', lose: 'concede', winT: 'Sabrettin, şutu kurtardın.', loseT: 'Forvet sakince köşeye bıraktı.' }] },
      { t: 'Top elinde, takım kontra arıyor.', o: [
        { t: 'Uzun degaj', a: 'pas', d: 50, win: 'assist', lose: 'lost', winT: 'Degajın forvete ulaştı, gol! Kaleciden asist!', loseT: 'Degaj taca gitti.' },
        { t: 'Kısa oyun kur', a: 'pas', d: 36, win: 'keep', lose: 'concede', winT: 'Geriden oyun kurdun.', loseT: 'Pas araya girdi, boş kaleye gol.' },
        { t: 'Zaman geçir', a: 'kurnazlik', d: 40, win: 'keep', lose: 'yellow', winT: 'Saniyeleri erittin.', loseT: 'Hakem sarı kart gösterdi.' }] },
      { t: '25 metreden sert bir şut geliyor.', o: [
        { t: 'Uzan', a: 'kalecilik', d: 52, win: 'save', lose: 'concede', winT: 'Parmak uçlarınla kornere!', loseT: 'Top köşeye girdi.' },
        { t: 'Çeldir', a: 'kalecilik', d: 46, win: 'save', lose: 'concede', winT: 'Topu yana çeldin.', loseT: 'Çeldiğin top rakibin önüne düştü. Gol.' }] },
      { t: 'Rakibe serbest vuruş, baraj kuruyorsun.', o: [
        { t: 'Dört kişilik baraj', a: 'kalecilik', d: 54, win: 'save', lose: 'concede', winT: 'Şut barajı aştı ama sen oradaydın.', loseT: 'Top barajın üstünden köşeye.' },
        { t: 'İki kişilik baraj, görüşü aç', a: 'kalecilik', d: 58, win: 'save', lose: 'concede', winT: 'Topu net gördün, kurtardın.', loseT: 'Baraj az kaldı, gol.' }] }
    ],
    derby: [
      { t: 'Derbi ateşi: tribünler yanıyor, rakip oyuncular seni hedef aldı.', o: [
        { t: 'Sakin kal', a: 'sogukkanlilik', d: 44, win: 'keep', lose: 'yellow', winT: 'Provokasyona gelmedin, takımın rahatladı.', loseT: 'Dayanamadın, sarı kart.' },
        { t: 'Tribünü coştur', a: 'karizma', d: 50, win: 'chance', lose: 'yellow', winT: 'Tribünler ayağa kalktı, takım yükseldi.', loseT: 'Hakem kışkırtma saydı: sarı kart.' },
        { t: 'Karşılık ver', a: 'fizik', d: 55, win: 'keep', lose: 'red', winT: 'Geri adım atmadın, rakipler sindi.', loseT: 'Kavga çıktı, kırmızı kart gördün!' }] },
      { pos: ['FV', 'OS', 'DF'], t: 'Derbinin son dakikası, top önüne düştü!', o: [
        { t: 'Vur!', a: 'sut', d: 52, win: 'goal', lose: 'miss', winT: 'DERBİ GOLÜ! Stadyum yıkılıyor!', loseT: 'Top auta gitti, tribün eller başında.' },
        { t: 'Boştaki arkadaşa ver', a: 'pas', d: 45, win: 'assist', lose: 'lost', winT: 'Pasın gol oldu! Derbinin son dakikasında stadyum yıkılıyor!', loseT: 'Pas kesildi.' }] },
      { pos: ['KL'], t: 'Derbinin son dakikası, rakip forvet kale önünde!', o: [
        { t: 'Kendini at', a: 'kalecilik', d: 56, win: 'save', lose: 'concede', winT: 'Son dakikada inanılmaz bir kurtarış!', loseT: 'Son dakikada top ağlarda.' },
        { t: 'Bağır, savunmayı yönet', a: 'liderlik', d: 50, win: 'save', lose: 'concede', winT: 'Savunma son anda topu uzaklaştırdı.', loseT: 'Kimse seni duymadı.' }] }
    ]
  };

  /* ---------- Basın soruları ---------- */
  const T = (t, tone, fx, r) => ({ t, tone, fx, r });
  D.press = [
    { id: 'win1', ctx: ['win', 'goal'], q: 'Bugünkü galibiyeti neye bağlıyorsunuz?', o: [
      T('Takım olarak savaştık, herkesin emeği var.', 'mutevazi', { 'r.medya': 2, 'r.takim': 3, 't.mutevazi': 0.5 }, 'Soyunma odasında sözlerin beğenildi.'),
      T('Ben sahadayken kaybetmeyiz.', 'iddiali', { sohret: 1, 'takipci%': 2, 'r.takim': -2, 't.hirsli': 0.5 }, 'Manşet hazır: "Ben varken kaybetmeyiz!"'),
      T('Hocamızın taktiği tuttu, ona teşekkür ederim.', 'saygili', { 'r.hoca': 4, 'r.medya': 1 }, 'Hoca açıklamanı duyunca gülümsedi.')] },
    { id: 'goal1', ctx: ['goal'], q: 'Golü kime armağan ediyorsunuz?', o: [
      T('Anneme. Her şeyimi ona borçluyum.', 'duygusal', { 'r.anne': 6, 'r.aile': 3, 'r.taraftar': 2 }, 'Annen röportajı izlerken ağladı.'),
      T('{memleket} halkına.', 'duygusal', { 'r.memleket': 8, 'r.taraftar': 1 }, '{memleket} yerel basını sözlerini manşete taşıdı.'),
      T('Beni eleştirenlere.', 'sert', { 'takipci%': 3, 'r.medya': -3, 't.sovmen': 0.5 }, 'Spor programları bu cümleyi saatlerce tartıştı.'),
      T('Takım arkadaşlarıma, onlarsız olmazdı.', 'mutevazi', { 'r.takim': 4, 'r.medya': 1 }, 'Kaptan omzuna vurdu.')] },
    { id: 'goal2', ctx: ['goal'], q: 'Gol sevinciniz çok konuşuldu. Bir mesajı mı vardı?', o: [
      T('Sadece mutluluktu.', 'kacamak', { 'r.medya': 1 }, 'Gazeteciler pek tatmin olmadı.'),
      T('Evet, rakip taraftarlara. Maç öncesi çok konuştular.', 'sert', { 'takipci%': 4, 'r.medya': -2, 'r.taraftar': 3, seed: [{ id: 'federasyon_ceza', in: [1, 2], p: 0.4 }] }, 'Federasyon görüntüleri incelemeye aldı.'),
      T('Yakında doğacak yeğenim için.', 'duygusal', { 'r.aile': 4, moral: 2 }, 'Sosyal medya "ne tatlı" dedi.')] },
    { id: 'loss1', ctx: ['loss'], q: 'Bugünkü yenilginin sorumlusu kim?', o: [
      T('Hepimiz. Ben de kendi payıma düşeni almalıyım.', 'mutevazi', { 'r.takim': 3, 'r.medya': 2, 'r.hoca': 2 }, 'Olgun bir duruş. Taraftar takdir etti.'),
      T('Hakem maçı katletti.', 'sert', { 'r.medya': -1, 'r.taraftar': 3, seed: [{ id: 'federasyon_ceza', in: [1, 2], p: 0.35 }] }, 'Hakem açıklaması federasyonun gündeminde.'),
      T('Bazı arkadaşlar sahada yoktu.', 'sert', { 'r.takim': -8, 'r.kaptan': -6, 'r.medya': 1, 't.asabi': 0.5 }, 'Soyunma odası buz kesti.'),
      T('Hocanın tercihleri tartışılır.', 'sert', { 'r.hoca': -10, 'r.medya': 2, 'takipci%': 2 }, 'Hoca sözlerini duydu. Yarın antrenman gergin geçecek.')] },
    { id: 'loss2', ctx: ['loss', 'draw'], q: 'Taraftarlar maç sonu protesto etti. Ne diyorsunuz?', o: [
      T('Haklılar. Bu formayı hak etmek zorundayız.', 'mutevazi', { 'r.taraftar': 5, 'r.medya': 1 }, 'Taraftar grubu açıklamanı paylaştı.'),
      T('Protesto edenler iyi günde neredeydi?', 'sert', { 'r.taraftar': -8, 'takipci%': 1, 't.asabi': 0.5 }, 'Tribün liderleri seni hedef gösterdi.'),
      T('Bir sonraki maça bakıyoruz.', 'kacamak', { 'r.medya': -1 }, 'Klasik bir cevap. Kimse hatırlamayacak.')] },
    { id: 'draw1', ctx: ['draw'], q: 'Bir puan sizin için kazanç mı kayıp mı?', o: [
      T('Deplasmanda bir puan her zaman değerli.', 'mutevazi', { 'r.medya': 1, 'r.hoca': 2 }, 'Sakin bir cevap.'),
      T('Kayıp. Biz şampiyonluk için oynuyoruz.', 'iddiali', { 'r.taraftar': 3, sohret: 1, 'r.takim': 1 }, 'Taraftarlar hırsını sevdi.'),
      T('Puan bir, eksik iki. Matematik bu.', 'esprili', { 'r.medya': 3, 'takipci%': 1 }, 'Gazeteciler güldü.')] },
    { id: 'bench1', ctx: ['bench'], q: 'Son haftalarda forma şansı bulamıyorsunuz. Hocayla sorun mu var?', o: [
      T('Hiçbir sorun yok. Çalışıp formayı geri alacağım.', 'mutevazi', { 'r.hoca': 4, 'r.medya': 1, 't.calis': 0.5 }, 'Hoca sözlerini beğendi.'),
      T('Bunu hocaya sormanız lazım.', 'kacamak', { 'r.hoca': -3, 'r.medya': 2, 'takipci%': 1 }, 'Manşet: "Hocaya sorun!"'),
      T('Neden oynamadığımı ben de bilmiyorum. Herkes görüyor.', 'sert', { 'r.hoca': -10, 'r.taraftar': 2, 'r.medya': 2, seed: [{ id: 'hoca_kriz', in: [1, 3], p: 0.6 }] }, 'Bu sözler bomba etkisi yaptı.')] },
    { id: 'bench2', ctx: ['bench'], q: 'Devre arasında ayrılmayı düşünür müsünüz?', o: [
      T('Sözleşmem var, buradayım.', 'saygili', { 'r.baskan': 4, 'r.taraftar': 2, 't.sadik': 0.5 }, 'Yönetim sadakatini not etti.'),
      T('Oynayamayacaksam evet, düşünürüm.', 'sert', { 'r.baskan': -4, 'r.hoca': -2, seed: [{ id: 'transfer_kulisi', in: [1, 4], p: 0.6 }] }, 'Menajerinin telefonu çalmaya başladı.'),
      T('Kafamda sadece takım var.', 'kacamak', { 'r.medya': -1 }, 'Pek ikna edici olmadı.')] },
    { id: 'rumor1', ctx: ['any'], if: { stat: { sohret: ['>', 20] } }, q: '{ustkulup} ile adınız anılıyor. Bu ilgi sizi mutlu ediyor mu?', o: [
      T('Elbette gurur verici ama aklım burada.', 'kacamak', { 'r.taraftar': 2, 'r.medya': 1 }, 'Diplomatik bir cevap.'),
      T('Büyük kulüp her oyuncunun hayalidir.', 'iddiali', { 'r.taraftar': -4, 'r.baskan': -3, sohret: 1 }, 'Taraftarlar "gitmek istiyor" yorumu yaptı.'),
      T('Menajerim ilgilensin, ben futbol oynuyorum.', 'esprili', { 'r.medya': 3, 'r.menajer': 2 }, 'Cevabın sosyal medyada beğenildi.')] },
    { id: 'derby1', ctx: ['any'], if: { stat: { sohret: ['>', 10] } }, q: 'Bu hafta rakibiniz {rakipkulup}. Neler söylersiniz?', o: [
      T('Saygı duyuyoruz ama üç puan bizim.', 'iddiali', { 'r.taraftar': 3, 'r.medya': 1 }, 'Taraftar maça hazır.'),
      T('Onları sahada göreceğiz, konuşmaya gerek yok.', 'sert', { 'takipci%': 2, 'r.rakip': -1 }, 'Rakip taraf sözlerini panoya astı.'),
      T('Güçlü bir takım, zor bir maç olacak.', 'mutevazi', { 'r.medya': 2 }, 'Sakin ve klasik.')] },
    { id: 'hoca1', ctx: ['any'], if: { rel: { hoca: ['<', -25] } }, q: 'Hocanızla aranızın bozuk olduğu konuşuluyor. Doğru mu?', o: [
      T('Hocamla aram çok iyi. Uydurma haberler.', 'kacamak', { 'r.hoca': 3, 'r.medya': -2 }, 'Kimse inanmadı ama hoca memnun.'),
      T('Her şeyi zamanı gelince anlatacağım.', 'sert', { 'r.hoca': -6, 'r.medya': 3, 'takipci%': 2 }, 'Manşet: "Zamanı gelince anlatacağım!"'),
      T('Farklı fikirlerimiz var, profesyonelce çözeriz.', 'saygili', { 'r.hoca': 2, 'r.medya': 2 }, 'Olgun bir cevap.', { chk: { s: 'konusma', d: 40 } })] },
    { id: 'lux1', ctx: ['any'], if: { lux: ['>=', 4] }, q: 'Lüks yaşantınız eleştiriliyor. Futbolunuzu etkiliyor mu?', o: [
      T('Kazandığımı harcıyorum, kimseye hesap vermem.', 'sert', { 'r.taraftar': -6, 'takipci%': 3, 't.gosteris': 0.5 }, 'Taraftarlar tepkili.'),
      T('Haklı eleştiri. Sahada daha çok konuşmalıyım.', 'mutevazi', { 'r.taraftar': 4, 'r.medya': 2 }, 'Taraftar biraz yumuşadı.'),
      T('Arabam hızlı, ben daha hızlıyım.', 'esprili', { 'r.medya': 2, 'takipci%': 3 }, 'Esprin viral oldu.')] },
    { id: 'partner1', ctx: ['any'], if: { partner: [2, 3, 4] }, q: '{partner} Hanım ile ilgili magazin haberlerini nasıl değerlendiriyorsunuz?', o: [
      T('Özel hayatımı konuşmam.', 'kacamak', { 'r.medya': -1, 'r.partner': 3 }, 'Partnerin bu duruşu sevdi.'),
      T('Hayatımın kadını, herkes bilsin.', 'duygusal', { 'r.partner': 8, 'takipci%': 3, 'r.medya': 2 }, 'Magazin sayfaları bayram etti.'),
      T('Magazinciler işini yapsın, ben benimkini.', 'sert', { 'r.medya': -4 }, 'Magazin basını sana küstü.')] },
    { id: 'milli1', ctx: ['any'], if: { stat: { ovr: ['>', 68] }, nat: 'TR', caps: ['<', 1] }, q: 'Milli takım hocası sizi izliyor. Hayaliniz mi?', o: [
      T('Ay yıldızlı formayı giymek en büyük hayalim.', 'duygusal', { 'r.taraftar': 4, 'r.medya': 2 }, 'Milli takım hocası açıklamayı not aldı.'),
      T('Hak ettiğimi düşünüyorum, çağrılmamam ayıp olur.', 'iddiali', { 'r.medya': -2, sohret: 1 }, 'Bazıları kibirli buldu.')] },
    { id: 'abroad1', ctx: ['any'], if: { abroad: true }, q: 'Yeni ülkenize uyum sağlayabildiniz mi?', o: [
      T('Dil kursuna gidiyorum, her gün daha iyi.', 'mutevazi', { 'r.medya': 3, dil: 2 }, 'Yerel basın çabanı beğendi.'),
      T('Türk yemeklerini özlüyorum ama burası güzel.', 'esprili', { 'r.medya': 2, 'r.memleket': 3 }, 'Türk taraftarlar sözlerini paylaştı.'),
      T('Zor. Ailemi çok özlüyorum.', 'duygusal', { 'r.aile': 3, 'r.medya': 1, moral: -1 }, 'Samimiyetin sempati topladı.')] },
    { id: 'injury1', ctx: ['any'], if: { injured: true }, q: 'Sakatlığınız ne durumda? Ne zaman döneceksiniz?', o: [
      T('Her gün tedavi görüyorum, en kısa sürede döneceğim.', 'mutevazi', { 'r.medya': 2, 'r.taraftar': 2 }, 'Taraftarlar geçmiş olsun mesajları yağdırdı.'),
      T('Doktorlar ne derse o. Acele etmeyeceğim.', 'saygili', { saglik: 1, 'r.medya': 1 }, 'Akıllıca bir yaklaşım.')] },
    { id: 'gen1', ctx: ['any'], if: { gen: ['>', 1] }, q: 'Babanızla sürekli kıyaslanıyorsunuz. Bu yük ağır mı?', o: [
      T('Babam benim için örnek. Kendi yolumu çizeceğim.', 'saygili', { 'r.baba': 6, 'r.medya': 2 }, 'Baban sözlerini duyunca gururlandı.'),
      T('Ben babam değilim. Beni kendi adımla anın.', 'sert', { 'r.baba': -6, 'takipci%': 2, sohret: 1 }, 'Baba-oğul gerginliği manşetlerde.'),
      T('Babamın golleri benimkilerin yanında az kalacak.', 'iddiali', { 'r.baba': 2, sohret: 2 }, 'Baban güldü, "görelim" dedi.')] },
    { id: 'any1', ctx: ['any'], q: 'Sezon sonunda kendinizi nerede görüyorsunuz?', o: [
      T('Her hafta gelişmeye odaklıyım.', 'mutevazi', { 'r.hoca': 2, 'r.medya': 1 }, 'Hoca bu cevaptan hoşlandı.'),
      T('Gol krallığı ve şampiyonluk. Başka hedefim yok.', 'iddiali', { sohret: 1, 'r.taraftar': 2, 'r.takim': -1 }, 'Büyük konuştun. Şimdi sıra sahada.'),
      T('Tatilde, Bodrum\'da!', 'esprili', { 'r.medya': 2, 'r.hoca': -2, 'takipci%': 1 }, 'Gazeteciler güldü, hoca gülmedi.')] },
    { id: 'any2', ctx: ['any'], q: 'Takımın kaptanıyla ilişkiniz nasıl?', o: [
      T('{kaptan} ağabeyimiz, ondan çok şey öğreniyorum.', 'saygili', { 'r.kaptan': 6, 'r.takim': 2 }, 'Kaptan seni antrenmanda yanına çağırdı.'),
      T('Saha içinde liderliği ben yapıyorum zaten.', 'iddiali', { 'r.kaptan': -8, 's.liderlik': 1 }, 'Kaptanın yüzü düştü.')] },
    { id: 'any3', ctx: ['any'], q: 'Gençlere ne tavsiye edersiniz?', o: [
      T('Okulu bırakmasınlar. Futbol bir gün biter.', 'saygili', { 'r.medya': 3, 'r.aile': 2, mental: 1 }, 'Sözlerin eğitim sayfalarında paylaşıldı.'),
      T('Hayal kursunlar ve vazgeçmesinler. {koy} sahasından buraya geldim.', 'duygusal', { 'r.memleket': 5, 'r.taraftar': 2 }, 'Memleketinde çocuklar sözlerini ezberledi.'),
      T('Sosyal medyadan uzak dursunlar.', 'esprili', { 'r.medya': 2, 'takipci%': -1 }, 'Kendi takipçin sayısını düşününce ironik oldu.')] },
    { id: 'any4', ctx: ['any'], if: { tier: [4, 5] }, q: 'Alt liglerde oynamanın zorlukları neler?', o: [
      T('Maaşlar gecikiyor, sahalar kötü ama tutku büyük.', 'duygusal', { 'r.medya': 3, 'r.takim': 3, 'r.baskan': -2 }, 'Sözlerin kulüp yönetimini biraz rahatsız etti.'),
      T('Zorluk yok, ben buradan çıkacağım.', 'iddiali', { sohret: 1, 'r.takim': -2 }, 'Takım arkadaşların "biz ne olacağız" diye baktı.')] },
    // Röportaj (boş zaman etkinliği)
    { id: 'ro1', ctx: ['roportaj'], q: 'Futbol dışında en çok neyi seversiniz?', o: [
      T('Ailemle vakit geçirmeyi.', 'duygusal', { 'r.aile': 3, 'r.medya': 2 }, 'Samimi bir röportaj oldu.'),
      T('Arabaları ve saatleri.', 'iddiali', { 'takipci%': 2, 't.gosteris': 0.5 }, 'Lüks markalar seni takibe aldı.'),
      T('Kitap okumayı. Şu an tarih okuyorum.', 'saygili', { 'r.medya': 3, 's.karizma': 1 }, '"Entelektüel futbolcu" etiketi geldi.')] },
    { id: 'ro2', ctx: ['roportaj'], q: 'Kariyerinizdeki en zor an neydi?', o: [
      T('{memleket}\'den ayrılıp yalnız kaldığım ilk gece.', 'duygusal', { 'r.memleket': 4, 'r.medya': 3, 'takipci%': 2 }, 'Röportaj çok paylaşıldı.'),
      T('Zor an olmadı, her şey planladığım gibi gidiyor.', 'iddiali', { 'r.medya': -1, sohret: 1 }, 'Okurlar pek samimi bulmadı.'),
      T('Hocanın beni kesmesi. Ama bana iyi geldi.', 'saygili', { 'r.hoca': 2, 'r.medya': 2 }, 'Olgun bir bakış.')] },
    { id: 'ro3', ctx: ['roportaj'], q: 'Rüya kulübünüz hangisi?', o: [
      T('Şu an oynadığım kulüp.', 'kacamak', { 'r.taraftar': 4, 'r.baskan': 2 }, 'Taraftarın kalbini kazandın.'),
      T('{yabancikulup}. Avrupa hayalim var.', 'iddiali', { sohret: 1, 'r.taraftar': -2, dil: 1 }, 'Yurt dışı basını haberini yaptı.'),
      T('Çocukken tuttuğum takım, ama söylemem!', 'esprili', { 'r.medya': 2, 'takipci%': 1 }, 'Herkes tahmin yürütüyor.')] }
  ];
  // Kontrol (chk) içeren basın cevaplarını düzelt: T() dördüncü parametreyi ek alan olarak kabul et
  D.press.forEach((q) => q.o.forEach((o) => { if (o.r && typeof o.r === 'object') { Object.assign(o, o.r); o.r = 'Profesyonelce bir cevap verdin.'; } }));

  /* ---------- Menajer tavsiyeleri ---------- */
  D.agentTips = [
    { if: { stat: { enerji: ['<', 45] } }, t: 'Enerjin düşük. Bu hafta antrenmanı hafif tut, akşamları dinlen. Yorgun oyuncuya hoca forma vermez.', w: 30 },
    { if: { rel: { hoca: ['<', -10] } }, t: 'Hocayla aran bozuk. Talimatına uyduğun antrenmanlar ve video analiz ilişkini düzeltir.', w: 25 },
    { if: { money: ['<', 5000] }, t: 'Kasada para kalmadı. Gece hayatını ve harcamaları kıs, gerekirse sponsor çekimi ayarlarım.', w: 25 },
    { if: { contractYears: ['<=', 1] }, t: 'Sözleşmenin son yılı. Bu sezon iyi oynarsan masaya güçlü otururuz.', w: 15 },
    { if: { followers: ['>', 15000] }, t: 'Takipçin arttı. Sponsor çekimleri artık para eder. Haftada bir yeter, hocayı kızdırma.', w: 10 },
    { if: { partner: [1, 2, 3], rel: { partner: ['<', 10] } }, t: 'Partnerin ihmal edildiğini hissediyor. Haftada bir akşam ona ayır, yoksa magazine düşersin.', w: 20 },
    { if: { rel: { aile: ['<', 10] } }, t: 'Ailen seni özlüyor. Bir telefon aç, bir ziyaret et. Mental olarak iyi gelir.', w: 15 },
    { if: { role: 'yedek' }, t: 'Yedeksin. Ekstra antrenman ve taktik çalışma hocanın gözüne girmenin yolu.', w: 15 },
    { if: { stat: { disiplin: ['<', 40] } }, t: 'Disiplinin düşük. Hocalar ve kulüpler bunu görüyor. Gece hayatını azalt.', w: 18 },
    { if: { stat: { mental: ['<', 35] } }, t: 'Kafan dolu gibi. Bir psikologla görüşmek ayıp değil, en iyiler bile yapıyor.', w: 18 },
    { if: { formAbove: 3 }, t: 'Formdasın! Scoutlar izliyor. Bu ritmi bozma, yaz döneminde masada elimiz güçlü.', w: 12 },
    { if: { formBelow: -3 }, t: 'Form düşük. Sosyal medyada lüks paylaşım yapma, taraftar sabırsız.', w: 15 },
    { if: { dil: ['<', 30], ovr: ['>', 65] }, t: 'Yurt dışından ilgi var ama dil bilmiyorsun. Dil kursu kapıları açar.', w: 12 },
    { if: { tier: [4, 5] }, t: 'Bu ligden çıkmanın yolu istikrar. Her maç 7 not alırsan üst ligler arar.', w: 8 },
    { t: 'Haftalık planını dengeli yap: bir sosyal etkinlik, bir dinlenme, bir gelişim. Hepsini birden yapamazsın.', w: 6 },
    { t: 'Basında az konuş, çok çalış. Sert cevaplar takipçi getirir ama hocayı kaybettirir.', w: 6 },
    { t: 'Mağazadaki kişisel antrenör ve fizyoterapist lüks değil, yatırım. Parayı ilk onlara harca.', w: 6 },
    { if: { lux: ['>=', 4], formBelow: 0 }, t: 'Takım kötü giderken lüks arabayla antrenmana gelme. Taraftar her şeyi görüyor.', w: 20 }
  ];

  /* ---------- Aile ve çevre istekleri ---------- */
  D.requests = [
    { id: 'anne_ziyaret', who: 'anne', t: 'Oğlum, bayram geliyor. Bir gelsen, sofrayı birlikte kursak?', short: 'Annenin bayram daveti', cost: 4000, fx: { 'r.anne': 10, 'r.aile': 6, mental: 4, enerji: -10 }, nofx: { 'r.anne': -8, 'r.aile': -4 }, yes: 'Annen kapıda seni sıkıca sarıldı.', no: 'Annen telefonu kapatırken sesi titriyordu.', expire: 3 },
    { id: 'kardes_okul', who: 'kardes', if: { hasRole: 'kardes' }, t: 'Abi, üniversite kayıt parası lazım. Babam bilmiyor, sana yazdım.', short: 'Kardeşinin okul parası', cost: 'w3', fx: { 'r.kardes': 15, 'r.aile': 5 }, nofx: { 'r.kardes': -10 }, yes: 'Kardeşin sana sarıldığı videoyu attı.', no: 'Kardeşin "tamam abi" yazdı ve çevrimdışı oldu.', expire: 4 },
    { id: 'baba_borc', who: 'baba', if: { hasRole: 'baba' }, t: 'Bankaya borcum var, ödeme günü geçti. Sana söylemek istemezdim.', short: 'Babanın borcu', cost: 'w4', fx: { 'r.baba': 18, 'r.aile': 8, mental: 2 }, nofx: { 'r.baba': -12, 'r.aile': -6, mental: -3 }, yes: 'Baban hiçbir şey demedi, sadece başını salladı. Gözleri her şeyi anlattı.', no: 'Baban "anladım" dedi. Bir daha bu konuyu açmadı.', expire: 3 },
    { id: 'anne_doktor', who: 'anne', t: 'Bir süredir dizim ağrıyor, özel doktora gitmem lazım ama pahalı.', short: 'Annenin doktor parası', cost: 'w1', fx: { 'r.anne': 12, 'r.aile': 6 }, nofx: { 'r.anne': -6, 'r.aile': -5, mental: -3 }, yes: 'Annen ameliyat sonrası ilk adımlarını attı.', no: 'Annen devlet hastanesinde sıra bekliyor.', expire: 4 },
    { id: 'memleket_forma', who: '{memleket} Gençlik Kulübü', t: 'Abi, köyün/mahallenin takımına forma ve top alabilir misin? Çocuklar seni örnek alıyor.', short: 'Memleket takımına forma', cost: 'w1', fx: { 'r.memleket': 12, 'r.taraftar': 2, 's.karizma': 1 }, nofx: { 'r.memleket': -6 }, yes: 'Çocuklar formalarla fotoğraf çekip gönderdi.', no: 'Çocuklar eski formalarla oynamaya devam ediyor.', expire: 5 },
    { id: 'kanka_borc', who: 'kanka', if: { hasRole: 'kanka' }, t: 'Kardeşim, ev sahibi kirayı artırdı, ay sonuna kadar biraz borç verebilir misin?', short: 'Kankanın borcu', cost: 'w0.5', fx: { 'r.kanka': 15, 'r.takim': 2 }, nofx: { 'r.kanka': -10 }, yes: 'Kankan "bunu unutmam" dedi.', no: 'Kankan antrenmanda sana pek bakmadı.', expire: 3 },
    { id: 'akraba_dugun', who: 'anne', t: 'Kuzeninin düğünü var. Herkes seni soruyor, gelmezsen ayıp olur.', short: 'Kuzenin düğünü', cost: 6000, fx: { 'r.aile': 10, 'r.memleket': 5, enerji: -15, 's.sosyallik': 1 }, nofx: { 'r.aile': -8, 'r.memleket': -3 }, yes: 'Düğünde halaya sen başladın, video her yere yayıldı.', no: 'Akrabalar "ünlü olunca bizi unuttu" diye konuşuyor.', expire: 3 },
    { id: 'partner_ev', who: 'partner', if: { partner: [2, 3] }, t: 'Artık birlikte yaşasak mı? Bir ev bakmaya başladım, kaporayı birlikte verelim mi?', short: 'Partnerinle ev', cost: 'w2', fx: { 'r.partner': 15, moral: 4 }, nofx: { 'r.partner': -12 }, yes: 'Yeni evinizin anahtarını aldınız.', no: '"Demek ki hazır değilsin" dedi.', expire: 4 },
    { id: 'baba_tekne', who: 'baba', if: { origin: 'balikci', hasRole: 'baba' }, t: 'Teknenin motoru gitti oğlum. Sezon kapanmadan yaptırmam lazım.', short: 'Babanın teknesi', cost: 'w2', fx: { 'r.baba': 18, 'r.memleket': 4 }, nofx: { 'r.baba': -10, mental: -2 }, yes: 'Baban yeni motorla ilk seferinde sana hamsi yolladı.', no: 'Baban sezonu tekne olmadan kapattı.', expire: 3 },
    { id: 'koy_hayvan', who: 'baba', if: { origin: 'koy', hasRole: 'baba' }, t: 'Kış sert geçti, iki inek telef oldu. Yenisini almadan bahar zor.', short: 'Köyde hayvan kaybı', cost: 'w2', fx: { 'r.baba': 16, 'r.aile': 8, 'r.memleket': 4 }, nofx: { 'r.baba': -8, 'r.aile': -6 }, yes: 'Baban köy kahvesinde "oğlum aldı" diye anlatıyor.', no: 'Baban komşudan borç aldı.', expire: 3 },
    { id: 'hayir_dernek', who: 'Lösemili Çocuklar Derneği', if: { stat: { sohret: ['>', 25] } }, t: 'Tedavi gören çocuklarımız için bir bağış kampanyası başlattık. Yüzü olur musunuz?', short: 'Hayır kampanyası', cost: 'w1', fx: { 'r.taraftar': 6, 'r.medya': 5, sohret: 2, 's.karizma': 2, moral: 4 }, nofx: { 'r.medya': -2 }, yes: 'Kampanya hedefini üç günde aştı.', no: 'Dernek başka bir futbolcuya ulaştı.', expire: 4 },
    { id: 'cocuk_okul', who: 'partner', if: { kids: ['>', 0], partner: [4] }, t: '{cocuk} için özel okul kaydı açıldı. Kaydı yaptıralım mı?', short: 'Çocuğun okulu', cost: 'w3', fx: { 'r.partner': 8, flag: 'aile_zaman', 't.aile': 1 }, nofx: { 'r.partner': -6 }, yes: '{cocuk} ilk gün okula senin formanla gitti.', no: 'Partnerin bu konuyu bir daha açmayacağını söyledi.', expire: 4 }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
