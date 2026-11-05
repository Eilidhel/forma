/* FORMA — hikâye aileleri (üretilen olaylar)
   Her aile gerçek futbol haberlerinden bir tema alır. Ailede 8 farklı başlangıç ve 7 farklı gelişme var;
   her başlangıç her gelişmeyle birleşip ayrı bir olay olur (8 × 7 = 56 olay). Gelişmeler sonucu da değiştirir.
   Üretilen her olay bir kariyerde en fazla bir kez çıkar. Koşullar saçma durumları engeller. */
(function (root) {
  const D = root.F.DATA;
  const E = D.events;
  const O = (t, tone, fx, r) => ({ t, tone, fx, r });
  const TW = (t, fx) => [t, fx || {}];
  const FAM = [];
  const fam = (id, cond, who, setups, twists, opts) => FAM.push({ id, cond, who, setups, twists, opts });

  /* 1. Transfer söylentisi */
  fam('g_soylenti', { stat: { sohret: ['>', 20] } }, 'Spor Haber', [
    'Bir haber sitesi {buyukkulup} kulübünün seni listesine aldığını yazdı.',
    'Gazeteciler {buyukkulup} scoutunun son maçında tribünde olduğunu iddia ediyor.',
    'Sosyal medyada "{ad} sezon sonunda ayrılıyor" etiketi gündemde.',
    'Bir transfer kulisi hesabı menajerinin {buyukkulup} yöneticileriyle yemekte görüldüğünü paylaştı.',
    'Sabah programında yorumcular senin için "bu oyuncu bu ligde fazla kaldı" dedi.',
    'Yabancı bir spor gazetesi seni "izlenmesi gereken oyuncular" listesine koydu.',
    'Kulübünün başkanı bir televizyon programında senin için gelen teklifleri reddettiğini söyledi.',
    'Rakip kulübün taraftar sayfası seni transfer etmeleri için kampanya başlattı.'
  ], [
    TW('Taraftarlar şimdiden tesisin önünde "Gitme" pankartı açtı.', { 'r.taraftar': 1 }),
    TW('Menajerin telefonu sabahtan beri susmuyor.', { 'r.menajer': 1 }),
    TW('Takım arkadaşların soyunma odasında seninle dalga geçiyor.', { 'r.takim': 1 }),
    TW('Haber bir saatte yüz binlerce kez görüntülendi.', { 'takipci%': 1 }),
    TW('Hoca antrenmandan önce "kafan burada olsun" dedi.', { 'r.hoca': -1 }),
    TW('Annen haberi görüp hemen aradı.', { 'r.anne': 1 }),
    TW('Kulüp resmi bir açıklama yapmadı, sessizliği daha çok konuşuluyor.', {})
  ], [
    O('"Sadece takımıma odaklanıyorum."', 'saygili', { 'r.taraftar': 2, 'r.hoca': 2 }, 'Kısa ve net bir cevap. Konu biraz soğudu.'),
    O('"Futbolda her şey olabilir."', 'kacamak', { 'r.menajer': 2, 'r.taraftar': -2, sohret: 0.5 }, 'Cümlen kapıyı açık bıraktı. Kulüp yönetimi bunu duydu.'),
    O('Hiç yorum yapma', 'sessiz', { mental: 1 }, 'Sessiz kalmayı seçtin. Haber kendi kendine eridi.')
  ]);

  /* 2. Taraftar isteği */
  fam('g_taraftar', { stat: { sohret: ['>', 8] } }, 'Bir taraftar', [
    'Antrenman çıkışında bir taraftar seni bekliyor.',
    'Bir taraftar sosyal medyadan uzun bir mesaj yazmış.',
    'Stadyum kapısında yaşlı bir taraftar elinde eski bir fotoğrafla duruyor.',
    'Küçük bir çocuk babasının omzunda adını bağırıyor.',
    'Taraftar grubunun genç bir üyesi seni yolda durdurdu.',
    'Hastanedeki bir taraftarın ailesi kulübe mektup göndermiş.',
    'Bir taraftar düğününe seni davet eden bir video çekmiş.',
    'Deplasman dönüşü havalimanında bir grup taraftar seni karşıladı.'
  ], [
    TW('Senden imzalı bir forma istiyor.', { 'r.taraftar': 1 }),
    TW('Sadece bir fotoğraf ve iki çift laf istiyor.', {}),
    TW('Kameralar da orada, her şey kayıtta.', { 'takipci%': 1 }),
    TW('Gözleri dolu dolu, sana teşekkür etmek istiyor.', { moral: 1 }),
    TW('Biraz ısrarcı, hocanın seni beklediği saat yaklaşıyor.', { enerji: -1 }),
    TW('Yanında senin numaranı taşıyan formalı bir grup çocuk var.', { 'r.taraftar': 1 }),
    TW('Kulüp basın sorumlusu da durumu izliyor.', { 'r.medya': 1 })
  ], [
    O('Durup zaman ayır', 'mutevazi', { 'r.taraftar': 4, moral: 2, enerji: -2 }, 'Birkaç dakikan birinin gününü güzelleştirdi.'),
    O('Hızlıca selam ver, yoluna devam et', 'kacamak', { 'r.taraftar': 1 }, 'Kibar ama kısa. Taraftar anladı.'),
    O('Kulüp aracılığıyla sürpriz yap', 'duygusal', { 'r.taraftar': 6, 'r.medya': 2, para: '-w0.1' }, 'Kulüp sürprizi paylaştı. Çok sevildi.')
  ]);

  /* 3. Takım arkadaşı */
  fam('g_takim', {}, '{takimarkadasi}', [
    '{takimarkadasi} antrenmandan sonra yanına geldi.',
    'Soyunma odasında {takimarkadasi} kimseyle konuşmuyor.',
    'Kamp otelinde {takimarkadasi} kapını çaldı.',
    '{takimarkadasi} takım otobüsünde yanına oturdu.',
    'Yemekte {takimarkadasi} herkesin önünde sana bir şey sordu.',
    'Isınma sırasında {takimarkadasi} sana garip garip bakıyor.',
    '{takimarkadasi} grup sohbetinde sana özel bir mesaj attı.',
    'Maçtan sonra {takimarkadasi} duşta seni bekledi.'
  ], [
    TW('Sözleşmesinin uzatılmayacağından korkuyor.', { 'r.takim': 1 }),
    TW('Sana kızgın: geçen maçta pas vermediğini düşünüyor.', { 'r.takim': -1 }),
    TW('Ailesiyle ilgili kötü bir haber almış.', { mental: -1 }),
    TW('Senden ekstra antrenman için eşlik etmeni istiyor.', { enerji: -1 }),
    TW('Hocanın kendisini sevmediğini düşünüyor.', {}),
    TW('Yeni bir iş fikri var, ortak arıyor.', {}),
    TW('Sadece biriyle konuşmaya ihtiyacı var.', { 's.sosyallik': 0.5 })
  ], [
    O('Dinle ve destek ol', 'duygusal', { 'r.takim': 4, 's.liderlik': 0.8, enerji: -1 }, 'Konuştunuz. Ayrılırken omzunu sıktı.'),
    O('Kaptana yönlendir', 'saygili', { 'r.takim': 1, 'r.kaptan': 2 }, 'Kaptan meseleyle ilgilendi.'),
    O('Kendi işine bak', 'sessiz', { 'r.takim': -2 }, 'Uzaklaştı. Bir süre seninle konuşmayacak.')
  ]);

  /* 4. Hoca */
  fam('g_hoca', {}, 'hoca', [
    'Hoca seni ofisine çağırdı.',
    'Antrenmandan sonra hoca seni kenara aldı.',
    'Hoca takım toplantısında adını andı.',
    'Hoca sabah kahvaltısında yanına oturdu.',
    'Hoca video analizinde senin bir pozisyonunu durdurdu.',
    'Hoca otobüste arkadan seslendi: "Bir gel."',
    'Hoca antrenman sırasında oyunu durdurdu ve sana döndü.',
    'Hoca bir gazeteciye senin hakkında konuştu, sözleri sana iletildi.'
  ], [
    TW('Savunmaya yardım etmediğini düşünüyor.', { 'a.savunma': 0.3 }),
    TW('Liderlik etmeni, gençlere örnek olmanı istiyor.', { 's.liderlik': 0.5 }),
    TW('Son haftalardaki formundan memnun.', { moral: 1 }),
    TW('Disiplin konusunda uyarıyor.', { disiplin: 1 }),
    TW('Yeni bir taktik rol deneyecek.', {}),
    TW('Sosyal medyadaki bir paylaşımından rahatsız.', { 'r.medya': -1 }),
    TW('Senin için bir kulübün aradığını söylüyor.', { 'r.menajer': 1 })
  ], [
    O('Dikkatle dinle, teşekkür et', 'saygili', { 'r.hoca': 4, disiplin: 1 }, 'Hoca konuşmanın iyi geçtiğini düşünüyor.'),
    O('Kendi görüşünü söyle', 'iddiali', { 'r.hoca': -1, 's.konusma': 0.8 }, 'Hoca dinledi ama tam ikna olmadı.'),
    O('Esprili bir cevap ver', 'esprili', { 'r.hoca': 1, 'r.takim': 1 }, 'Hoca gülümsedi, ortam yumuşadı.')
  ]);

  /* 5. Menajer */
  fam('g_menajer', { agent: true }, '{menajer}', [
    'Menajerin arayıp "Bir dakikan var mı?" dedi.',
    'Menajerin seni bir otel lobisinde buluşmaya çağırdı.',
    'Menajerin sesli mesaj bıraktı.',
    'Menajerin maçtan hemen sonra soyunma odasının kapısında belirdi.',
    'Menajerin akşam yemeğinde ciddi bir yüzle konuşmaya başladı.',
    'Menajerin sana bir dosya gönderdi.',
    'Menajerin "Konuşmamız lazım" diye yazdı.',
    'Menajerin seni ofisine davet etti.'
  ], [
    TW('Bir sponsorun seninle çalışmak istediğini söylüyor.', { 'takipci%': 1 }),
    TW('Kulübün yeni sözleşme teklifini hazırladığını duymuş.', {}),
    TW('Komisyon oranını artırmak istiyor.', { 'r.menajer': -1 }),
    TW('Bir yatırım fırsatından bahsediyor.', {}),
    TW('Senin için bir röportaj ayarladı.', { 'r.medya': 1 }),
    TW('Rakip bir menajerin seni ayartmaya çalıştığını duymuş.', { 'r.menajer': 1 }),
    TW('Dil kursuna başlamanı öneriyor.', { dil: 1 })
  ], [
    O('Ayrıntıları dinle', 'saygili', { 'r.menajer': 3 }, 'Not aldın. Karar vermek için zamanın var.'),
    O('"Önce futbol" de', 'hirsli', { 'r.menajer': -1, 'r.hoca': 1, form: 0.3 }, 'Menajerin biraz bozuldu ama saygı duydu.'),
    O('Pazarlık et', 'kurnaz', { 'r.menajer': 1, 's.kurnazlik': 0.8 }, 'Menajerin "senden de bir şey öğreniyorum" dedi.')
  ]);

  /* 6. Aile */
  fam('g_aile', {}, 'Ailen', [
    'Annen akşam telefonda uzun uzun konuştu.',
    'Baban mesaj attı, kısa ama anlamlı.',
    'Kardeşin habersiz kapına geldi.',
    'Aile WhatsApp grubunda bir tartışma çıktı.',
    'Teyzen seni aile yemeğine çağırdı.',
    'Kuzenin evleniyor, düğün hazırlıkları başladı.',
    'Annenle baban maçını birlikte izlemeye geliyor.',
    'Ailenden biri seni televizyonda görüp aradı.'
  ], [
    TW('Biraz para desteği gerekiyor.', { 'r.aile': 1 }),
    TW('Seni çok özlediklerini söylüyorlar.', { 'r.aile': 1 }),
    TW('Sağlıkla ilgili küçük bir endişe var.', { mental: -1 }),
    TW('Komşuların seninle övündüğünü anlatıyorlar.', { moral: 1 }),
    TW('Memlekette senin adına bir etkinlik düzenlemek istiyorlar.', { 'r.memleket': 1 }),
    TW('Sana eski fotoğraflarını gönderdiler.', { moral: 1 }),
    TW('Kardeşinin okul masrafları konuşuluyor.', {})
  ], [
    O('Vakit ayır, yanlarında ol', 'duygusal', { 'r.aile': 5, mental: 2, enerji: -3 }, 'Aileyle geçen zaman iyi geldi.'),
    O('Maddi destek gönder', 'mutevazi', { 'r.aile': 3, para: '-w0.3' }, 'Annen "gerek yoktu" dedi ama sesi mutluydu.'),
    O('Sonra konuşuruz de', 'kacamak', { 'r.aile': -2 }, 'Annen biraz kırıldı.')
  ]);

  /* 7. Sosyal medya krizi */
  fam('g_sosyal', { followers: ['>', 3000] }, 'Sosyal medya', [
    'Eski bir paylaşımın yeniden gündeme geldi.',
    'Bir videoda yaptığın bir hareket yanlış anlaşıldı.',
    'Hesabına binlerce yorum yağmaya başladı.',
    'Bir fenomen seni bir videosunda taklit etti.',
    'Bir story\'nde arka planda görünen şey konuşuldu.',
    'Hayran hesaplarından biri seninle ilgili bir iddia paylaştı.',
    'Bir beğenin ekran görüntüsüyle yayıldı.',
    'Yanlışlıkla gönderdiğin bir emoji tartışma çıkardı.'
  ], [
    TW('Rakip taraftarlar konuyu büyütüyor.', { 'r.taraftar': -1 }),
    TW('Kendi taraftarların seni savunuyor.', { 'r.taraftar': 1 }),
    TW('Bir spor programı konuyu canlı yayında konuştu.', { 'r.medya': -1 }),
    TW('Gazeteci Sabun Yağız konuyu haber yaptı.', { 'r.medya': -1 }),
    TW('Takım arkadaşların espri yapıyor.', { 'r.takim': 1 }),
    TW('Kulübün sosyal medya ekibi seni aradı.', {}),
    TW('Etkileşim rekor kırdı.', { 'takipci%': 2 })
  ], [
    O('Açıklama yap, özür dile', 'mutevazi', { 'r.medya': 3, 'r.taraftar': 1 }, 'Açıklaman olgun bulundu.'),
    O('Esprili bir cevap ver', 'esprili', { 'takipci%': 2, 'r.medya': 1 }, 'Esprin tartışmayı söndürdü.'),
    O('Hiç cevap verme', 'sessiz', { mental: -1 }, 'Konu birkaç gün sonra unutuldu.')
  ]);

  /* 8. Para teklifi */
  fam('g_para', { money: ['>', 100000] }, 'Bir tanıdık', [
    'Eski bir okul arkadaşın seni aradı.',
    'Bir iş insanı tesise kadar gelip seni görmek istedi.',
    'Bir akrabanın tanıdığı yatırım teklifiyle geldi.',
    'Bankacın seni şubeye davet etti.',
    'Bir takım arkadaşın ortak olduğu işten bahsetti.',
    'Bir emlakçı sürekli mesaj atıyor.',
    'Bir startup kurucusu sosyal medyadan yazdı.',
    'Memleketten bir esnaf bir iş fırsatı anlattı.'
  ], [
    TW('Kâr vaadi çok yüksek, belki fazla yüksek.', {}),
    TW('Belgeler sağlam görünüyor.', {}),
    TW('Acele etmeni istiyor, "yarın geç olur" diyor.', { mental: -1 }),
    TW('Muhasebecin temkinli olmanı söyledi.', { 's.kurnazlik': 0.5 }),
    TW('Ailen bu işe çok sıcak bakıyor.', { 'r.aile': 1 }),
    TW('İş memleketinde, oraya da faydası olacak.', { 'r.memleket': 1 }),
    TW('Daha önce başka futbolcular da yatırım yapmış.', {})
  ], [
    O('Küçük bir miktarla gir', 'kacamak', { para: '-w0.5' }, 'Küçük bir risk aldın. Sonucu zaman gösterecek.'),
    O('Ayrıntılı araştır, sonra karar ver', 'saygili', { 's.kurnazlik': 1, mental: 1 }, 'Araştırdın ve acele etmedin.'),
    O('Kibarca reddet', 'mutevazi', {}, 'Paranı korudun.')
  ]);

  /* 9. Sağlık */
  fam('g_saglik', {}, 'Kulüp doktoru', [
    'Sabah kalktığında dizinde bir ağrı vardı.',
    'Antrenmanda ayak bileğini biraz burktun.',
    'Kulüp doktoru kan tahlillerine baktı.',
    'Gece boyunca öksürdün, sabah halsizsin.',
    'Fizyoterapist kaslarında yorgunluk tespit etti.',
    'Bir maçtan sonra sırt ağrın geçmedi.',
    'Uyku düzenin bozuldu, gözlerin kızarık.',
    'Diş hekimi bir dolgu gerektiğini söyledi.'
  ], [
    TW('Doktor bir hafta dikkatli olmanı istiyor.', { saglik: 1 }),
    TW('Büyük bir maç yaklaşıyor.', {}),
    TW('Hoca durumundan haberdar değil.', {}),
    TW('Kulüp yeni bir tedavi yöntemi öneriyor.', {}),
    TW('Takım arkadaşın da aynı şeyi yaşamış.', { 'r.takim': 1 }),
    TW('Annen hemen bir doğal tarif gönderdi.', { 'r.anne': 1 }),
    TW('Bu sezon zaten yoğun geçiyor.', { enerji: -1 })
  ], [
    O('Doktorun dediğini yap, dinlen', 'saygili', { saglik: 4, enerji: 4, form: -0.3 }, 'Vücudun teşekkür etti.'),
    O('Ağrıyla devam et', 'hirsli', { saglik: -3, 'r.hoca': 2 }, 'Antrenmana çıktın ama yüzün buruşuk.'),
    O('Ekstra fizyoterapi al', 'mutevazi', { saglik: 3, para: '-w0.1' }, 'Masaj ve tedavi iyi geldi.')
  ]);

  /* 10. Memleket */
  fam('g_memleket', { stat: { sohret: ['>', 5] }, abroad: false }, '{memleket}', [
    'Memleketindeki belediye başkanı aradı.',
    'Memleketten çocukluk arkadaşın yazdı.',
    'Memleketin yerel gazetesi seninle röportaj istiyor.',
    'Memleketteki eski okulunun müdürü bir davet gönderdi.',
    'Memleketin amatör takımı yardım istiyor.',
    'Memleketteki kahvede maçlarını dev ekranda izliyorlarmış.',
    'Memleketinde bir sokağa adını verme fikri konuşuluyor.',
    'Memleketten bir ihtiyar senin için türkü yazmış.'
  ], [
    TW('Bayram yaklaşıyor, herkes seni bekliyor.', { 'r.memleket': 1 }),
    TW('Gençler seni örnek alıyor.', { 's.liderlik': 0.5 }),
    TW('Küçük bir maddi destek bekleniyor.', {}),
    TW('Yerel televizyon da işin içinde.', { 'takipci%': 1 }),
    TW('Ailen bu daveti çok önemsiyor.', { 'r.aile': 1 }),
    TW('Sezonun en yoğun haftası.', { enerji: -1 }),
    TW('Memleketin kulübü de seni izliyor.', {})
  ], [
    O('Git, memleketinle buluş', 'duygusal', { 'r.memleket': 6, moral: 3, enerji: -5 }, 'Memlekette bayram havası esti.'),
    O('Video mesaj gönder', 'mutevazi', { 'r.memleket': 3 }, 'Videon herkese ulaştı.'),
    O('Bağış yap', 'duygusal', { 'r.memleket': 5, para: '-w0.4' }, 'Bağışın memlekette konuşuldu.')
  ]);

  /* 11. Hakem ve federasyon */
  fam('g_hakem', {}, 'Federasyon', [
    'Geçen maçta hakemle tartışman görüntülere yansıdı.',
    'Federasyon disiplin kurulu bir maç olayını inceliyor.',
    'VAR kayıtları yayınlandı, senin pozisyonun da var.',
    'Bir hakem gazeteye senin hakkında konuştu.',
    'Takımın bir hakem kararına itiraz etti.',
    'Bir maç gözlemcisi raporuna adını yazmış.',
    'Hakemler birliği oyuncuların itirazlarından şikâyetçi.',
    'Bir televizyon yorumcusu senin hareketini "simülasyon" olarak yorumladı.'
  ], [
    TW('Para cezası ihtimali konuşuluyor.', {}),
    TW('Taraftarlar seni destekliyor.', { 'r.taraftar': 1 }),
    TW('Kulüp avukatı seninle görüşmek istiyor.', {}),
    TW('Rakip kulüp de açıklama yaptı.', { 'r.rakip': -1 }),
    TW('Hoca konuyu kapatmanı istiyor.', { 'r.hoca': 1 }),
    TW('Gazeteci Caprizio konuyu didikliyor.', { 'r.medya': -1 }),
    TW('Konu sosyal medyada trend oldu.', { 'takipci%': 1 })
  ], [
    O('Saygılı bir açıklama yap', 'saygili', { 'r.medya': 2, disiplin: 2 }, 'Kurul açıklamanı olumlu karşıladı.'),
    O('Sert konuş', 'sert', { 'r.taraftar': 2, 'r.medya': -3, seed: [{ id: 'federasyon_ceza', in: [1, 2], p: 0.3 }] }, 'Sözlerin manşet oldu. Kurul not aldı.'),
    O('Kulübe bırak', 'kacamak', {}, 'Kulüp avukatları konuyla ilgilendi.')
  ]);

  /* 12. Rakip oyuncu */
  fam('g_rakip', {}, 'Rakip oyuncu', [
    'Bir sonraki rakibin yıldızı seninle ilgili konuştu.',
    'Eski takım arkadaşın şimdi rakip takımda ve sana mesaj attı.',
    'Rakip takımın stoperi seni "abartılmış" olarak niteledi.',
    'Bir rakip oyuncu sosyal medyada seni etiketleyip bir video paylaştı.',
    'Milli takım kampında rakip kulübün oyuncusuyla aynı odadasın.',
    'Rakip takımın kalecisi penaltı atışı için meydan okudu.',
    'Bir rakip oyuncu maçtan sonra formanı istedi.',
    'Rakip kulübün genç yeteneği seni idolü ilan etti.'
  ], [
    TW('Maç bu hafta sonu.', { form: 0.3 }),
    TW('Taraftarlar sözleri pankarta yazmaya hazırlanıyor.', {}),
    TW('Gazeteciler cevabını bekliyor.', { 'r.medya': 1 }),
    TW('Takım arkadaşların seni kışkırtıyor.', {}),
    TW('Hoca "cevabı sahada ver" dedi.', { 'r.hoca': 1 }),
    TW('Eski bir rekabetiniz var.', {}),
    TW('Konu milli takım çevresinde de konuşuluyor.', {})
  ], [
    O('Sahada cevap vereceğini söyle', 'iddiali', { form: 0.5, 'takipci%': 1 }, 'Sözlerin maçın havasını ısıttı.'),
    O('Centilmence karşılık ver', 'saygili', { 'r.medya': 2, 'r.rakip': 2 }, 'Olgun tavrın takdir topladı.'),
    O('Esprili bir paylaşım yap', 'esprili', { 'takipci%': 2 }, 'Espri herkesi güldürdü.')
  ]);

  /* 13. Antrenman */
  fam('g_antrenman', {}, 'Antrenman', [
    'Antrenmanda hoca yeni bir çalışma başlattı.',
    'Sabah antrenmanı yağmur altında yapıldı.',
    'Kaleci antrenörü seninle özel çalışmak istiyor.',
    'Takımın yeni kondisyonerinin programı çok sert.',
    'Antrenmanda altyapıdan gençler de var.',
    'Antrenman maçında takımlar ikiye ayrıldı.',
    'Video analist yeni bir istatistik raporu getirdi.',
    'Hoca antrenmanı seyircilere açtı.'
  ], [
    TW('Herkes seni izliyor.', { moral: 0.5 }),
    TW('Yorgunsun ama hoca yoğunluğu artırdı.', { enerji: -1 }),
    TW('Bir genç sana bir soru sormak istiyor.', { 's.liderlik': 0.4 }),
    TW('Rakibinle aynı grupta çalışıyorsun.', {}),
    TW('Kamera ekipleri antrenmanı çekiyor.', { 'takipci%': 0.5 }),
    TW('Sakatlıktan yeni dönen bir arkadaşın da var.', {}),
    TW('Hoca sonunda en iyi oyuncuyu seçecek.', {})
  ], [
    O('Var gücünle çalış', 'hirsli', { 'a.dayaniklilik': 0.5, enerji: -4, 'r.hoca': 2 }, 'Antrenmanın en çok koşanı sendin.'),
    O('Akıllı çalış, enerjini sakla', 'saygili', { enerji: 1, 'r.hoca': 1 }, 'Dengeli bir antrenman.'),
    O('Gençlere yardım et', 'lider', { 's.liderlik': 1, 'r.takim': 2 }, 'Gençler senden çok şey öğrendi.')
  ]);

  /* 14. Deplasman yolculuğu */
  fam('g_deplasman', {}, 'Deplasman', [
    'Deplasman uçağı rötar yaptı.',
    'Takım otobüsü saatlerce yolda kaldı.',
    'Deplasmandaki otel beklenenden çok kötü.',
    'Deplasman şehrinde yerel bir lokantaya gittiniz.',
    'Rakip şehrin taraftarları otelin önünde toplandı.',
    'Deplasmanda oda arkadaşın sabaha kadar konuştu.',
    'Uçakta yanına tanınmış bir sanatçı oturdu.',
    'Deplasman dönüşü havalimanında bekleme uzadı.'
  ], [
    TW('Herkesin morali biraz düşük.', { moral: -1 }),
    TW('Takımın en eğlenceli ismi ortamı canlandırıyor.', { 'r.takim': 1 }),
    TW('Hoca herkesin erken yatmasını istiyor.', { disiplin: 1 }),
    TW('Bir taraftar grubu sizi takip ediyor.', { 'r.taraftar': 1 }),
    TW('Telefonunun şarjı bitmek üzere.', {}),
    TW('Ertesi gün kritik bir maç var.', {}),
    TW('Kaptan küçük bir oyun önerdi.', { 'r.kaptan': 1 })
  ], [
    O('Ortamı neşelendir', 'esprili', { 'r.takim': 3, enerji: -1 }, 'Gülüşmeler yorgunluğu unutturdu.'),
    O('Dinlen, kulaklığını tak', 'sessiz', { enerji: 3 }, 'Biraz uyuyabildin.'),
    O('Takımla sohbet et', 'sosyal', { 'r.takim': 2, 's.sosyallik': 0.5 }, 'Yeni şeyler öğrendin.')
  ]);

  /* 15. Sponsor ve marka (şöhret gerekli) */
  fam('g_marka', { stat: { sohret: ['>', 35] } }, 'Bir marka', [
    'Bir spor markası seninle özel bir koleksiyon yapmak istiyor.',
    'Bir içecek firması reklam çekimi teklif etti.',
    'Bir otomobil markası seni etkinliğe davet etti.',
    'Bir teknoloji şirketi telefon reklamı için seni istiyor.',
    'Bir moda markası defilede yürümeni istiyor.',
    'Bir yemek uygulaması "maç günü menüsü" kampanyası öneriyor.',
    'Bir video oyunu şirketi kapak yüzü olmanı teklif etti.',
    'Bir banka genç futbolcular için kampanya yapıyor.'
  ], [
    TW('Para iyi ama takvim yoğun.', { enerji: -1 }),
    TW('Kulübün sponsoruyla çakışma riski var.', { 'r.baskan': -1 }),
    TW('Menajerin çok heyecanlı.', { 'r.menajer': 1 }),
    TW('Taraftarlar markayı pek sevmiyor.', { 'r.taraftar': -1 }),
    TW('Kampanyanın bir kısmı hayır işine gidecek.', { 'r.taraftar': 1 }),
    TW('Çekim sezonun ortasına denk geliyor.', {}),
    TW('Rakip bir futbolcu da aynı teklifi almış.', {})
  ], [
    O('Kabul et', 'iddiali', { para: 'w1', 'takipci%': 2, enerji: -3 }, 'Anlaşma imzalandı. Yüzün her yerde.'),
    O('Sezon sonuna ertele', 'saygili', { 'r.hoca': 1 }, 'Marka bekleyeceğini söyledi.'),
    O('Reddet', 'mutevazi', {}, 'Odağını futbolda tuttun.')
  ]);

  /* 16. Alt lig hayatı */
  fam('g_altlig', { tier: [3, 4, 5] }, 'Kulüp', [
    'Kulübün kasasında para kalmadı.',
    'Tesisteki duşlar yine bozuk.',
    'Başkan oyuncuları kendi dükkânında toplantıya çağırdı.',
    'Deplasmana minibüsle gidilecek.',
    'Sahanın çimi kurumuş, top sekmiyor.',
    'Kulübün tek fizyoterapisti istifa etti.',
    'Kulüp formalarını taraftarlar diktirdi.',
    'Maç günü stat görevlileri gelmedi.'
  ], [
    TW('Oyuncular arasında homurtu başladı.', { 'r.takim': -1 }),
    TW('Taraftarlar yardım kampanyası başlattı.', { 'r.taraftar': 1 }),
    TW('Kaptan senden destek bekliyor.', { 'r.kaptan': 1 }),
    TW('Yerel gazete durumu haber yaptı.', { 'r.medya': 1 }),
    TW('Belediye yardım sözü verdi.', {}),
    TW('Hoca da çaresiz görünüyor.', {}),
    TW('Bir iş insanı kulübe sponsor olmayı düşünüyor.', {})
  ], [
    O('Takımı topla, moral ver', 'lider', { 'r.takim': 4, 's.liderlik': 1 }, 'Takım bir kez daha kenetlendi.'),
    O('Cebinden katkı yap', 'duygusal', { 'r.takim': 3, 'r.taraftar': 3, para: '-w0.3' }, 'Katkın kulüpte konuşuldu.'),
    O('Sessizce işine bak', 'sessiz', {}, 'Bu da geçer dedin.')
  ]);

  /* 17. Üst lig baskısı */
  fam('g_ustlig', { tier: [1, 2] }, 'Spor Haber', [
    'Büyük maç haftası başladı, şehir alev alev.',
    'Kulüp yönetimi bu hafta sonu için prim açıkladı.',
    'Basın toplantısında hoca senin adını özellikle verdi.',
    'Bir yayıncı kuruluş maç öncesi özel röportaj istiyor.',
    'Kulüp seni tanıtım filminde oynatmak istiyor.',
    'Şehrin dört bir yanında senin posterin asılmış.',
    'Avrupa kupası hesapları yapılıyor.',
    'Taraftar grubu kampa ziyarete geldi.'
  ], [
    TW('Herkes senden fark yaratmanı bekliyor.', { mental: -1 }),
    TW('Gazeteci Roman kulisleri yazıyor.', { 'r.medya': 1 }),
    TW('Hoca baskıyı üstünden almak istiyor.', { 'r.hoca': 1 }),
    TW('Ailen tribünde olacak.', { 'r.aile': 1 }),
    TW('Rakip takımın taraftarı sosyal medyada laf atıyor.', {}),
    TW('Takım arkadaşların sana güveniyor.', { 'r.takim': 1 }),
    TW('Kulüp başkanı soyunma odasına uğrayacak.', { 'r.baskan': 1 })
  ], [
    O('Baskıyı motivasyona çevir', 'iddiali', { form: 0.5, moral: 2 }, 'Baskı seni ateşledi.'),
    O('Sakin kal, rutinine sadık kal', 'saygili', { mental: 2, 's.sogukkanlilik': 0.5 }, 'Sakinliğin takıma da yansıdı.'),
    O('Takımı öne çıkar', 'mutevazi', { 'r.takim': 3 }, 'Bu tavır soyunma odasında sevildi.')
  ]);

  /* 18. Yurt dışı hayatı */
  fam('g_yurtdisi', { abroad: true }, 'Yurt dışı', [
    'Yaşadığın şehirde ilk kez kar yağdı.',
    'Komşun seni yemeğe davet etti.',
    'Takım arkadaşın sana yerel bir festivali anlattı.',
    'Bir Türk derneği seni ziyarete çağırdı.',
    'Yerel bir gazete senin hikâyeni yazdı.',
    'Dil kursunda öğretmenin sana yeni bir kelime öğretti.',
    'Bir restoranda garson seni tanıdı.',
    'Vize işlemleri için konsolosluğa gitmen gerekiyor.'
  ], [
    TW('Biraz yalnız hissediyorsun.', { mental: -1 }),
    TW('Yeni bir arkadaş edinebilirsin.', { 's.sosyallik': 0.5 }),
    TW('Ailen seni çok özlediğini söyledi.', { 'r.aile': 1 }),
    TW('Bu senin için dili geliştirme fırsatı.', { dil: 1 }),
    TW('Kulüp kültürel uyum programı öneriyor.', {}),
    TW('Gurbetçi taraftarlar seni sahiplendi.', { 'r.memleket': 1 }),
    TW('Takvim çok yoğun.', { enerji: -1 })
  ], [
    O('Yeni kültüre açıl', 'sosyal', { dil: 2, mental: 2, 's.sosyallik': 1 }, 'Bu şehir artık biraz daha evin gibi.'),
    O('Türk dostlarınla buluş', 'duygusal', { mental: 3, 'r.memleket': 2 }, 'Çay, sohbet, memleket havası.'),
    O('Evde kal, dinlen', 'sessiz', { enerji: 3 }, 'Kendine zaman ayırdın.')
  ]);

  /* 19. Aşk (partner varsa) */
  fam('g_ask', { partner: [2, 3, 4, 5] }, '{partner}', [
    '{partner} sana bir sürpriz hazırladığını söyledi.',
    '{partner} işinden yorgun döndü.',
    '{partner} ailesiyle tanışma yemeğini planlıyor.',
    '{partner} seninle tatil planı yapmak istiyor.',
    '{partner} yeni bir iş teklifi aldı.',
    '{partner} maçını tribünden izleyecek.',
    '{partner} sosyal medyada bir yorumdan rahatsız oldu.',
    '{partner} hafta sonu için bir etkinlik ayarladı.'
  ], [
    TW('Aynı gün antrenmanın var.', { enerji: -1 }),
    TW('Magazin muhabirleri peşinizde.', { 'takipci%': 1 }),
    TW('Senden destek bekliyor.', { 'r.partner': 1 }),
    TW('Çok heyecanlı görünüyor.', { moral: 1 }),
    TW('Biraz alıngan bir dönemde.', {}),
    TW('Arkadaşları da orada olacak.', { 's.sosyallik': 0.5 }),
    TW('İkiniz için önemli bir gün.', {})
  ], [
    O('Ona zaman ayır', 'duygusal', { 'r.partner': 5, moral: 2, enerji: -2 }, 'Birlikte güzel bir zaman geçirdiniz.'),
    O('Küçük bir hediye al', 'mutevazi', { 'r.partner': 3, para: '-w0.05' }, 'Hediyeye çok sevindi.'),
    O('Futbolu öne koy', 'hirsli', { 'r.partner': -3, form: 0.3 }, 'Anlayış gösterdi ama biraz kırıldı.')
  ]);

  /* 20. Hayır işi */
  fam('g_hayir', { stat: { sohret: ['>', 15] } }, 'Bir dernek', [
    'Bir çocuk hastanesi ziyaret için seni bekliyor.',
    'Bir köy okulu spor malzemesi istiyor.',
    'Engelli sporcular derneği bir etkinliğe davet etti.',
    'Bir hayvan barınağı yardım kampanyası başlattı.',
    'Deprem bölgesindeki bir okul için kampanya var.',
    'Huzurevi sakinleri maçlarını izliyormuş, bir ziyaret istiyorlar.',
    'Bir kan bağışı kampanyası seni yüz olarak istiyor.',
    'Kadın futbolu için bir turnuva destek arıyor.'
  ], [
    TW('Kulüp de destek vermek istiyor.', { 'r.baskan': 1 }),
    TW('Kameralar orada olacak.', { 'takipci%': 1 }),
    TW('Sadece birkaç saatini istiyorlar.', { enerji: -1 }),
    TW('Takım arkadaşların da katılmak istiyor.', { 'r.takim': 1 }),
    TW('Ailen bu işe çok önem veriyor.', { 'r.aile': 1 }),
    TW('Memleketinden insanlar da var.', { 'r.memleket': 1 }),
    TW('Kimse bilmeden yapmayı tercih edebilirsin.', {})
  ], [
    O('Katıl ve zaman ayır', 'duygusal', { 'r.taraftar': 4, mental: 3, enerji: -3 }, 'Günün en güzel anı buydu.'),
    O('Bağış yap', 'mutevazi', { 'r.taraftar': 2, para: '-w0.5', mental: 2 }, 'Bağışın ihtiyaç sahiplerine ulaştı.'),
    O('Şimdilik geç', 'kacamak', {}, 'Belki bir dahaki sefere.')
  ]);

  /* 21. Şehir hayatı */
  fam('g_sehir', {}, '{sehir}', [
    'Şehrin en kalabalık caddesinde yürüyordun.',
    'Yeni taşındığın semtte market alışverişindesin.',
    'Bir kafede kitap okuyordun.',
    'Trafikte uzun süre bekliyorsun.',
    'Akşam yürüyüşünde parka gittin.',
    'Sinemaya gitmeye karar verdin.',
    'Bir mahalle maçına rastladın.',
    'Bir esnaf dükkânının önünden geçiyordun.'
  ], [
    TW('İnsanlar seni tanıdı.', { 'takipci%': 0.5 }),
    TW('Kimse seni tanımadı, ilginç bir duygu.', { mental: 1 }),
    TW('Bir çocuk topunu sana attı.', { moral: 1 }),
    TW('Biri seni gizlice videoya çekiyor.', {}),
    TW('Bir yaşlı amca maçları anlatmaya başladı.', {}),
    TW('Yağmur başladı.', {}),
    TW('Telefonun çaldı, hoca arıyor.', { 'r.hoca': 0.5 })
  ], [
    O('Anı yaşa, insanlarla sohbet et', 'sosyal', { moral: 2, 's.sosyallik': 0.6 }, 'Şehir sana biraz daha ısındı.'),
    O('Sessizce yoluna devam et', 'sessiz', { mental: 1 }, 'Kendi dünyanda kaldın.'),
    O('Küçük bir iyilik yap', 'duygusal', { moral: 2, 'r.taraftar': 1 }, 'Gününü güzelleştirdin.')
  ]);

  /* 22. Milli takım (milli oyuncu) */
  fam('g_milli', { caps: ['>', 0] }, 'Milli takım', [
    'Milli takım kampı başladı.',
    'Milli takım hocası seni aradı.',
    'Milli takımda yeni bir kaptan seçimi konuşuluyor.',
    'Milli maç öncesi basın toplantısına çıkacaksın.',
    'Milli takımda oda arkadaşın değişti.',
    'Milli takım formasının yeni tasarımı tanıtılıyor.',
    'Milli takımın deplasman yolculuğu başladı.',
    'Milli takım taraftar grubu otelin önünde.'
  ], [
    TW('Ülkenin gözü üstünde.', { mental: -1 }),
    TW('Kulüp hocan seni korumasını istiyor.', { 'r.hoca': 1 }),
    TW('Gazeteci Analizci Ozan senin rolünü sorguluyor.', { 'r.medya': -1 }),
    TW('Ailen çok gururlu.', { 'r.aile': 1 }),
    TW('Bir genç oyuncu ilk kez kadroda.', { 's.liderlik': 0.4 }),
    TW('Rakip ülkenin yıldızı seninle ilgili konuştu.', {}),
    TW('Kamp kuralları sıkı.', { disiplin: 1 })
  ], [
    O('Formayı onurla taşı', 'duygusal', { moral: 3, 'r.taraftar': 2 }, 'Milli takım ruhu seni sardı.'),
    O('İşine odaklan', 'saygili', { form: 0.3, mental: 1 }, 'Sakin ve odaklı.'),
    O('Gençlere abilik yap', 'lider', { 's.liderlik': 1, 'r.takim': 2 }, 'Gençler seni örnek aldı.')
  ]);

  /* 23. Veteran (30+) */
  fam('g_veteran', { minAge: 30 }, 'Kariyer', [
    'Sabah aynaya baktığında ilk beyaz saçını gördün.',
    'Genç bir takım arkadaşın seni çocukluğundaki posterden tanıdığını söyledi.',
    'Kulüp sana antrenörlük kursu teklif etti.',
    'Eski bir takım arkadaşın futbolu bıraktığını açıkladı.',
    'Bir gazeteci "son sezonun mu?" diye sordu.',
    'Fizyoterapist toparlanma sürenin uzadığını söyledi.',
    'Hoca seni gençlere mentor olarak düşünüyor.',
    'Bir belgesel ekibi kariyer hikâyeni çekmek istiyor.'
  ], [
    TW('İçinde bir burukluk var.', { mental: -1 }),
    TW('Hâlâ sahada fark yaratabileceğini hissediyorsun.', { moral: 1 }),
    TW('Ailen artık daha çok vakit geçirmek istiyor.', { 'r.aile': 1 }),
    TW('Taraftarlar seni seviyor.', { 'r.taraftar': 1 }),
    TW('Gelecek planı yapmanın zamanı geldi.', { mental: 1 }),
    TW('Vücudun yorgun ama ruhun genç.', {}),
    TW('Kulüp yönetimi seninle konuşmak istiyor.', { 'r.baskan': 1 })
  ], [
    O('Deneyimini paylaş', 'lider', { 's.liderlik': 1.5, 'r.takim': 3 }, 'Gençler sana bir abi gibi bakıyor.'),
    O('Daha çok çalış, yaşı unut', 'hirsli', { 'a.dayaniklilik': 0.5, saglik: -1 }, 'Antrenmanda herkesten fazla koştun.'),
    O('Geleceği düşün, plan yap', 'saygili', { mental: 2 }, 'Kafan biraz rahatladı.')
  ]);

  /* 24. Genç (17-21) */
  fam('g_genc', { maxAge: 21 }, 'Hayat', [
    'Okuldan arkadaşların seni bir doğum günü partisine çağırdı.',
    'Ehliyet kursundan arama geldi.',
    'Annen ders çalışmanı hatırlattı.',
    'İlk maaşının bir kısmıyla ne yapacağını düşünüyorsun.',
    'Takımın tecrübeli oyuncusu sana bir tavsiye verdi.',
    'Sosyal medyada takipçin hızla artıyor.',
    'Bir alt yaş milli takımı seni izliyor.',
    'Mahalleden eski arkadaşın seni bir maça çağırdı.'
  ], [
    TW('Hoca erken yatmanı istiyor.', { disiplin: 1 }),
    TW('Arkadaşların seni özlemiş.', { 's.sosyallik': 0.5 }),
    TW('Ailen senin adına çok heyecanlı.', { 'r.aile': 1 }),
    TW('Bir menajer seninle tanışmak istiyor.', {}),
    TW('Gelecek hafta önemli bir maç var.', {}),
    TW('Yaşıtların seni kıskanıyor.', {}),
    TW('Kafan biraz karışık.', { mental: -1 })
  ], [
    O('Disiplini koru', 'saygili', { disiplin: 2, 'r.hoca': 2 }, 'Hoca bunu fark etti.'),
    O('Biraz eğlen', 'sosyal', { moral: 3, 's.sosyallik': 0.8, enerji: -3 }, 'Gençsin, bunu da yaşamalısın.'),
    O('Bir büyüğüne danış', 'mutevazi', { mental: 2, 'r.aile': 1 }, 'Aldığın tavsiye işine yaradı.')
  ]);

  /* 25. Basın */
  fam('g_basin', { stat: { sohret: ['>', 12] } }, 'Gazeteci', [
    'Bir gazeteci telefonla röportaj istedi.',
    'Bir podcast programı konuk olmanı istiyor.',
    'Bir spor dergisi seninle kapak röportajı yapmak istiyor.',
    'Bir YouTube kanalı "bir günün" videosunu çekmek istiyor.',
    'Bir radyo programı canlı bağlanmak istiyor.',
    'Bir gazete "en iyi 11" listesine seni koydu ve yorum istiyor.',
    'Bir belgesel ekibi takımı takip ediyor.',
    'Yerel televizyon maç sonu seninle konuşmak istiyor.'
  ], [
    TW('Soruların bir kısmı özel hayatınla ilgili.', {}),
    TW('Gazeteci Kulisçi Ferda soruları hazırlamış.', {}),
    TW('Kulüp basın sorumlusu yanında olacak.', { 'r.medya': 1 }),
    TW('Program çok izleniyor.', { 'takipci%': 1 }),
    TW('Hoca röportajlardan pek hoşlanmıyor.', { 'r.hoca': -1 }),
    TW('Bir önceki konuğun sözleri olay olmuştu.', {}),
    TW('Röportaj kısa sürecek.', {})
  ], [
    O('Kabul et, samimi konuş', 'sosyal', { 'r.medya': 4, 'takipci%': 1, enerji: -1 }, 'Röportaj çok beğenildi.'),
    O('Kabul et ama kısa tut', 'saygili', { 'r.medya': 2 }, 'Profesyonel ve kısa.'),
    O('Nazikçe reddet', 'kacamak', { 'r.medya': -1 }, 'Başka zaman dedin.')
  ]);

  /* 26. Batıl inanç ve uğur */
  fam('g_ugur', {}, 'Soyunma odası', [
    'Uğurlu kramponunun bağcığı koptu.',
    'Maç öncesi her zaman yediğin makarna bu sefer yoktu.',
    'Formanı ters giydiğini fark ettin.',
    'Sahaya sol ayağınla girdin.',
    'Uğurlu bilekliğini evde unuttun.',
    'Isınmaya her zamankinden geç çıktın.',
    'Otobüste her zamanki koltuğun dolu.',
    'Maç öncesi şarkı listen silinmiş.'
  ], [
    TW('İçinde garip bir his var.', { mental: -1 }),
    TW('Takım arkadaşların gülüyor.', { 'r.takim': 1 }),
    TW('Malzemeci bir çözüm bulmaya çalışıyor.', {}),
    TW('Maç büyük bir maç.', {}),
    TW('Annen telefonda dua ediyor.', { 'r.anne': 1 }),
    TW('Kimse fark etmedi.', {}),
    TW('Kaleci de aynı şeyi yaşamış.', {})
  ], [
    O('Uğurları unut, kendine güven', 'iddiali', { 's.sogukkanlilik': 1, mental: 1 }, 'Uğur sensin.'),
    O('Yeni bir uğur bul', 'esprili', { moral: 2 }, 'Artık yeni bir ritüelin var.'),
    O('Moralini bozma, takıma odaklan', 'saygili', { 'r.takim': 1 }, 'Takım seni neşeli gördü.')
  ]);

  /* 27. Kariyer dönemeci */
  fam('g_kariyer', { season: ['>=', 2] }, 'Kariyer', [
    'Bu sezon kariyerinin en çok maç oynadığı sezon olabilir.',
    'Bir istatistik sitesi seni ligin en çok gelişen oyuncuları arasında gösterdi.',
    'Eski hocan seni bir röportajda övdü.',
    'Kariyerinin ilk kulübü seni bir etkinliğe davet etti.',
    'Bir futbol akademisi seni rol model olarak afişine koydu.',
    'Kulübün seni sözleşme uzatma listesine aldığı konuşuluyor.',
    'Bir futbol oyunu seni yeni sürümünde güçlendirdi.',
    'Taraftar dergisi senin kariyerini anlatan bir yazı yayınladı.'
  ], [
    TW('Bunu duymak sana iyi geldi.', { moral: 1 }),
    TW('Ama önünde daha uzun bir yol var.', { mental: 1 }),
    TW('Ailen haberi herkese gönderdi.', { 'r.aile': 1 }),
    TW('Takım arkadaşların seni tebrik etti.', { 'r.takim': 1 }),
    TW('Menajerin bunu pazarlıkta kullanacak.', { 'r.menajer': 1 }),
    TW('Hoca "rehavete kapılma" dedi.', { 'r.hoca': 1 }),
    TW('Sosyal medyada bolca paylaşıldı.', { 'takipci%': 1 })
  ], [
    O('Teşekkür et, çalışmaya devam', 'mutevazi', { 'r.taraftar': 2, mental: 1 }, 'Ayakların yere basıyor.'),
    O('Gururla paylaş', 'iddiali', { 'takipci%': 2, moral: 2 }, 'Bu anın tadını çıkardın.'),
    O('Sessizce kenara not et', 'sessiz', { mental: 1 }, 'Kendi kendine gülümsedin.')
  ]);

  /* 28. Ev hayatı */
  fam('g_ev', {}, 'Ev', [
    'Evin su tesisatı arızalandı.',
    'Yeni bir mobilya almaya karar verdin.',
    'Komşular seni apartman toplantısına çağırdı.',
    'Evde kendi yemeğini yapmaya çalıştın.',
    'Çamaşır makinesi formalarını boyadı.',
    'Evde bir oyun gecesi düzenlemeyi düşünüyorsun.',
    'Kapıcı seninle maç sohbeti yapmak istiyor.',
    'Ev arkadaşın taşınıyor.'
  ], [
    TW('Akşam maç var.', { enerji: -1 }),
    TW('Annen telefonda talimat veriyor.', { 'r.anne': 1 }),
    TW('Kanka yardıma geldi.', { 'r.kanka': 1 }),
    TW('Biraz para harcaman gerekecek.', {}),
    TW('Sosyal medyada paylaşmak istiyorsun.', { 'takipci%': 0.5 }),
    TW('Komşunun çocuğu senin hayranın.', { moral: 1 }),
    TW('Sinirlerin biraz gergin.', { mental: -1 })
  ], [
    O('Kendin hallet', 'iddiali', { mental: 1, 's.kurnazlik': 0.5 }, 'Biraz uğraştın ama oldu.'),
    O('Usta çağır', 'kacamak', { para: '-w0.05' }, 'İş çabucak çözüldü.'),
    O('Gülerek geç, sonra bakarsın', 'esprili', { moral: 1 }, 'Hayat bazen böyle.')
  ]);

  /* 29. Kulüp yönetimi */
  fam('g_yonetim', {}, 'baskan', [
    'Başkan kulüp tesisinde seninle karşılaştı.',
    'Yönetim kurulu oyuncularla toplantı yapacak.',
    'Başkan bir gala yemeğine davet etti.',
    'Kulübün yeni stadyum projesi tanıtılıyor.',
    'Başkan yerel televizyonda kulübün hedeflerini anlattı.',
    'Kulüp bir yardım maçı organize ediyor.',
    'Kulüp yönetiminde seçim tartışmaları var.',
    'Başkan oyunculara bir mektup yazdı.'
  ], [
    TW('Senden de görüş istiyorlar.', { 's.konusma': 0.5 }),
    TW('Kameralar orada olacak.', { 'takipci%': 0.5 }),
    TW('Taraftarlar yönetime öfkeli.', { 'r.taraftar': -1 }),
    TW('Kaptan oyuncuların adına konuşacak.', { 'r.kaptan': 1 }),
    TW('Prim konusu da açılabilir.', {}),
    TW('Hoca toplantıdan rahatsız.', { 'r.hoca': -1 }),
    TW('Bu senin için iyi bir fırsat olabilir.', {})
  ], [
    O('Katıl ve yapıcı konuş', 'saygili', { 'r.baskan': 4, 's.liderlik': 0.5 }, 'Başkan seni not etti.'),
    O('Oyuncuların haklarını savun', 'sert', { 'r.takim': 3, 'r.baskan': -3 }, 'Takım arkadaşların sana minnettar.'),
    O('Uzak dur', 'sessiz', {}, 'Futbola odaklandın.')
  ]);

  /* 30. Sezon sonu ve tatil */
  fam('g_tatil', { week: [1, 4] }, 'Tatil', [
    'Sezon arası tatil planı yapıyorsun.',
    'Tatil için memlekete gitmeyi düşünüyorsun.',
    'Arkadaşların seni yurt dışına bir geziye çağırdı.',
    'Kulüp kişisel bir yaz programı gönderdi.',
    'Ailen seninle bir yazlıkta buluşmak istiyor.',
    'Bir futbol kampı seni konuk olarak çağırdı.',
    'Partnerin romantik bir tatil öneriyor.',
    'Yaz okulu seni çocuklara ders vermeye davet etti.'
  ], [
    TW('Kulüp kilonun artmamasını istiyor.', { disiplin: 1 }),
    TW('Gazeteciler tatil fotoğraflarını bekliyor.', {}),
    TW('Bütçe biraz yüksek.', {}),
    TW('Dinlenmeye gerçekten ihtiyacın var.', { enerji: 2 }),
    TW('Yeni sezon için hazırlık önemli.', {}),
    TW('Annen bu yaz seni görmek istiyor.', { 'r.anne': 1 }),
    TW('Menajerin transfer görüşmeleri yapıyor.', { 'r.menajer': 1 })
  ], [
    O('Tam dinlen', 'sessiz', { enerji: 8, mental: 3 }, 'Pillerin doldu.'),
    O('Tatilde de antrenman yap', 'hirsli', { 'a.dayaniklilik': 0.6, enerji: -2 }, 'Sezona herkesten önce hazırsın.'),
    O('Ailenle vakit geçir', 'duygusal', { 'r.aile': 5, moral: 3 }, 'Ailenle geçen yaz sana iyi geldi.')
  ]);

  /* Üretim: her başlangıç × her gelişme = ayrı olay */
  const merge = (a, b) => { const o = Object.assign({}, a); Object.keys(b).forEach((k) => { if (typeof b[k] === 'number' && typeof o[k] === 'number') o[k] = Math.round((o[k] + b[k]) * 10) / 10; else if (o[k] == null) o[k] = b[k]; }); return o; };
  let n = 0;
  FAM.forEach((f) => {
    f.setups.forEach((su, i) => f.twists.forEach(([tw, tfx], j) => {
      E.push({
        id: f.id + '_' + i + '_' + j, gen: f.id, w: 1.4, rep: 999, if: f.cond, kind: 'card', who: f.who,
        t: su + ' ' + tw,
        o: f.opts.map((op) => Object.assign({}, op, { fx: merge(op.fx, tfx) }))
      });
      n++;
    }));
  });
  D.genEventCount = n;
})(typeof window !== 'undefined' ? window : globalThis);
