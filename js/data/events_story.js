/* FORMA — hikâye olayları (büyük paket)
   Her olay, yaşanması mantıklı olduğu duruma bağlıdır: lig seviyesi, yaş, şöhret, para, yurt dışı, aile…
   Böylece BAL’daki 17 yaşındaki bir çocuk dergi kapağı teklifi almaz, Süper Lig yıldızı da maaş gecikmesi yaşamaz. */
(function (root) {
  const D = root.F.DATA;
  const E = D.events;
  const add = (...evs) => evs.forEach((e) => E.push(e));
  const O = (t, tone, fx, r, extra) => Object.assign({ t, tone, fx, r }, extra || {});
  const card = (id, cond, who, t, o, extra) => Object.assign({ id, w: 10, rep: 80, if: cond, kind: 'card', who, t, o }, extra || {});
  const dm = (id, cond, who, t, o, extra) => Object.assign({ id, w: 10, rep: 80, if: cond, kind: 'dm', who, t, o }, extra || {});
  const chat = (id, cond, who, t, o, extra) => Object.assign({ id, w: 10, rep: 80, if: cond, kind: 'chat', who, nodes: { start: { who, t, o } } }, extra || {});
  const LOW = [3, 4, 5], MID = [2, 3], TOP = [1, 2];

  /* ---------- Teknik direktörün gelişim planı (sezon başı) ---------- */
  add(chat('hoca_gelisim', {}, 'hoca', 'Hoca sezonun ilk antrenmanından sonra seni odasına çağırdı: "Bu sezon senin için bir planım var. {mevki} olarak en çok şunlarda gelişmen lazım: {gelisim}. Bunları çalışırsan hem sen kazanırsın hem takım."', [
    O('Anladım hocam, planınıza uyarım.', 'saygili', { 'r.hoca': 4, disiplin: 1 }, 'Hoca sırtını sıvazladı. Antrenman ekranında planı göreceksin.'),
    O('Ben güçlü yanlarımı daha da parlatmak istiyorum.', 'iddiali', { do: 'devplan:guclu' }, 'Hoca bir süre düşündü.', { chk: { s: 'konusma', d: 42 }, ok: { r: 'Hoca: "Peki. Güçlü yanlarına yükleneceğiz."', fx: { 'r.hoca': 1 } }, no: { r: 'Hoca: "Yine de eksiklerini kapatacaksın." Plan senin istediğin gibi değişti ama hoca ikna olmadı.', fx: { 'r.hoca': -3 } } }),
    O('Plan güzel ama ekstra antrenmanla daha hızlı giderim.', 'hirsli', { 'r.hoca': 2, enerji: -4, 't.calis': 0.5 }, 'Hoca güldü: "Sakatlanma da."')], { chain: true, rep: 30 }));

  /* ---------- Alt lig gerçekleri (3. Lig, 2. Lig, BAL) ---------- */
  add(
    card('alt_maas_gecikme', { tier: LOW, season: ['>=', 1] }, 'Kulüp', 'İki aydır maaşlar yatmadı. Soyunma odasında oyuncular "Antrenmana çıkmayalım" diye konuşuyor. Kaptan senin fikrini soruyor.', [
      O('Boykota katıl', 'sert', { 'r.takim': 5, 'r.baskan': -8, 'r.hoca': -3 }, 'Ertesi gün başkan bir maaşı yatırdı. Ama seni not etti.'),
      O('Antrenmana çık, başkanla konuşmayı teklif et', 'saygili', { 'r.baskan': 5, 'r.takim': -2, 's.liderlik': 1 }, 'Başkan "bir hafta sabır" dedi. Takımın bir kısmı seni ispiyoncu sandı.'),
      O('Sessiz kal, ne olursa', 'sessiz', { mental: -2 }, 'Maaşlar bir ay sonra yarım yattı.')], { w: 14 }),
    card('alt_otobus_bozuldu', { tier: LOW }, 'Takım otobüsü', 'Deplasman yolunda otobüs dağ başında bozuldu. Maça altı saat var, şoför "parça gelmeden kıpırdamaz" diyor.', [
      O('Otostop çekip takımı köydeki minibüsle taşı', 'esprili', { 'r.takim': 6, enerji: -6, 'takipci%': 2 }, 'Kırk kişilik minibüse yirmi iki oyuncu sığdınız. Maça yetiştiniz.'),
      O('Kulübü ara, yeni otobüs iste', 'saygili', { enerji: -10 }, 'Yeni otobüs dört saat sonra geldi. Isınmadan maça çıktınız.')]),
    card('alt_camur_saha', { tier: LOW }, 'Hakem', 'Gece boyu yağmur yağdı. Saha çamur havuzuna dönmüş, top sekmiyor. Hakem "Oynanır" dedi.', [
      O('Uzun toplarla oyna, çamura göre', 'saygili', { form: 1, 'r.hoca': 2 }, 'Maçtan sonra krampon yerine çizme istedin.'),
      O('Hakeme itiraz et', 'sert', { 'r.hoca': -1, disiplin: -2 }, 'Hakem "Avrupa’da mı oynuyoruz?" dedi.')]),
    card('alt_part_time', { tier: [4, 5], maxAge: 24, stat: { para: ['<', 60000] } }, 'Kuzenin', 'Maaş yetmiyor. Kuzenin hafta sonları düğün salonunda garsonluk teklif ediyor. Gecesi 1.500 lira.', [
      O('Kabul et', 'mutevazi', { para: 'w0.6', enerji: -8, disiplin: 2 }, 'Bir düğünde damadın babası seni tanıdı ve sahneye çağırdı.'),
      O('Hayır, tüm enerjim futbola', 'hirsli', { 'r.hoca': 2, moral: -1 }, 'Bu ay sıkı kemer bağlayacaksın.')]),
    card('alt_baskan_esnaf', { tier: LOW }, 'Başkan', 'Kulüp başkanı aynı zamanda şehrin en büyük kasabı. Antrenmandan sonra herkese "Kaslarınız için" diye kuzu pirzola dağıtıyor.', [
      O('Teşekkür et, al', 'saygili', { 'r.baskan': 4, saglik: 1 }, 'Başkan seni "evlat" diye çağırmaya başladı.'),
      O('"Ben vejetaryenim başkanım" diye şaka yap', 'esprili', { 'r.takim': 3, 'r.baskan': -1 }, 'Başkan yarım saat ne demek istediğini anlamaya çalıştı.')]),
    card('alt_sicak_su', { tier: LOW }, 'Soyunma odası', 'Antrenmandan sonra sıcak su yok, kazan bozuk. Kış ortası.', [
      O('Soğuk duşa gir, takıma örnek ol', 'iddiali', { 'r.takim': 4, saglik: -2, mental: 1 }, 'Herkes çığlık atarak duşa girdi. Takım ruhu bu.'),
      O('Eve gidip yıkan', 'sessiz', { enerji: -2 }, 'Yolda terli terli üşüdün.'),
      O('Malzemeciyle kazanı tamir et', 'mutevazi', { 'r.takim': 3, 's.kurnazlik': 1 }, 'YouTube videosu izleyerek tamir ettiniz.')]),
    card('alt_yerel_gazete', { tier: LOW, stat: { sohret: ['<', 25] } }, '{sehir} Haber', 'Şehrin yerel gazetesi senden "Haftanın Futbolcusu" röportajı istiyor. Muhabir aynı zamanda gazetenin sahibi, fotoğrafçısı ve dağıtıcısı.', [
      O('Röportajı ver', 'mutevazi', { 'r.medya': 3, sohret: 1, 'r.memleket': 1 }, 'Gazete bakkalda tükendi. Hepsi otuz tane basılmıştı.'),
      O('Kibarca reddet', 'kacamak', {}, 'Muhabir "Bir dahaki sefere" dedi.')]),
    card('alt_amator_hakem', { tier: [5] }, 'Hakem', 'Maçın yan hakemi bayrağı unutmuş, eline poşet bağlamış sopayla çizgide koşuyor.', [
      O('Gülme, maça odaklan', 'sessiz', { 's.sogukkanlilik': 1 }, 'Zor oldu ama tuttun kendini.'),
      O('Fotoğrafını çek', 'esprili', { 'takipci%': 4, 'r.medya': -1 }, 'Fotoğraf Türkiye’nin her yerinde paylaşıldı.')]),
    card('alt_kendi_forma', { tier: [4, 5] }, 'Malzemeci', 'Malzemeci izinde. Kulüp formaları evde kendiniz yıkayacaksınız. Annen senin formayı ağartıcıyla yıkamış, rengi atmış.', [
      O('Soluk formayla oyna', 'esprili', { 'takipci%': 2, 'r.takim': 2 }, 'Takım arkadaşların "Hayalet" demeye başladı.'),
      O('Yeni forma için kulübe para öde', 'mutevazi', { para: '-w0.2' }, 'Kulüp senden forma parası aldı. Alt lig işte.')]),
    card('alt_deplasman_uzun', { tier: LOW }, 'Takım otobüsü', 'Bu hafta deplasman 14 saat. Otobüste uyumak imkânsız, kaptan sabaha kadar türkü söylüyor.', [
      O('Sen de katıl', 'esprili', { 'r.takim': 5, enerji: -8, moral: 3 }, 'Sabaha karşı otobüs koro olmuştu.'),
      O('Kulaklık tak, uyumaya çalış', 'sessiz', { enerji: -4 }, 'İki saat uyuyabildin.')]),
    card('alt_esnaf_indirim', { tier: LOW, stat: { sohret: ['>', 3] } }, 'Mahalle esnafı', 'Şehirdeki berber, kebapçı ve kırtasiye kulüp oyuncularına indirim yapıyor. Karşılığında dükkânlarına fotoğrafını asmak istiyorlar.', [
      O('Kabul et, fotoğraf çektir', 'mutevazi', { 'r.memleket': 3, para: 'w0.1', 'r.taraftar': 2 }, 'Artık kebapçının duvarındasın. Yanında 1987 şampiyonluk kadrosu var.'),
      O('Teşekkür et, gerek yok', 'kacamak', {}, 'Esnaf biraz bozuldu.')]),
    card('alt_dugun_davet', { tier: LOW }, 'Taraftar', 'Kulübün en eski taraftarı Hüseyin amca oğlunu evlendiriyor. Bütün takımı davet etmiş, "Gelmezseniz küserim" diyor.', [
      O('Takımla düğüne git, halaya kalk', 'duygusal', { 'r.taraftar': 6, 'r.takim': 4, enerji: -8, moral: 4 }, 'Halay başını sen çektin. Video şehirde yayıldı.'),
      O('Hediye gönder, gidemezsin', 'saygili', { para: '-w0.1', 'r.taraftar': 2 }, 'Hüseyin amca telefonla teşekkür etti.')]),
    card('alt_kulup_kapanma', { tier: [4, 5], season: ['>=', 2], clubFin: ['<', 35] }, 'Spor Haber', 'Kulübün borçları yüzünden lisanslar donduruldu söylentisi çıktı. Gazeteler "küme düşmeden kapanabilir" diye yazıyor.', [
      O('Menajerine başka kulüp aramasını söyle', 'kacamak', { 'r.menajer': 3, 'r.taraftar': -3 }, 'Menajerin üç kulüple konuşmaya başladı.'),
      O('"Son güne kadar buradayım"', 'sadik', { 'r.taraftar': 6, 'r.baskan': 4, 't.sadik': 1 }, 'Taraftarlar sözünü tribüne yazdı.')]),
    card('alt_belediye_baskani', { tier: LOW, stat: { sohret: ['>', 5] } }, 'Belediye', 'Belediye başkanı seçim öncesi takımı ziyaret etti ve seninle fotoğraf çektirmek istiyor.', [
      O('Fotoğraf çektir', 'saygili', { 'r.baskan': 3, 'r.taraftar': -1 }, 'Fotoğraf seçim afişlerine girdi. Haberin yoktu.'),
      O('Siyasete karışmak istemiyorum', 'kacamak', { 'r.baskan': -3 }, 'Başkan yüzünü buruşturdu.')])
  );

  /* ---------- Üst lig (Süper Lig ve 1. Lig) ---------- */
  add(
    card('ust_var_karari', { tier: TOP, season: ['>=', 1] }, 'Spor Haber', 'Geçen maçtaki golün VAR tarafından "milimetrik ofsayt" ile iptal edildi. Çizgiler sosyal medyada tartışılıyor.', [
      O('"Kurallar kurallar."', 'saygili', { 'r.medya': 2, 's.sogukkanlilik': 1 }, 'Olgun tavrın takdir topladı.'),
      O('"Omzum mu ofsayttaydı? Gülerim."', 'esprili', { 'takipci%': 3, 'r.medya': 1 }, 'Cümlen capse dönüştü.'),
      O('Hakemleri sert eleştir', 'sert', { 'r.taraftar': 3, seed: [{ id: 'federasyon_ceza', in: [1, 2], p: 0.4 }] }, 'Federasyon açıklamanı inceliyor.')]),
    card('ust_yabanci_rakip', { tier: [1], season: ['>=', 1] }, 'Spor Haber', 'Kulüp senin mevkine Avrupa’dan tanınmış bir yıldız transfer etti. Gazeteler "{ad} artık kulübede" diye yazıyor.', [
      O('"Rekabet beni geliştirir."', 'mutevazi', { 'r.hoca': 4, mental: 1 }, 'Antrenmanda ondan çok şey öğrendin.'),
      O('Menajerine "başka kulüp ara" de', 'sert', { 'r.menajer': 2, 'r.baskan': -4 }, 'Menajerin telefonu açtı.'),
      O('Antrenmanda onu ezmeye çalış', 'hirsli', { 'a.fizik': 0.5, 'r.takim': -2, 't.hirsli': 1 }, 'İlk antrenmanda ona sert girdin. Hoca seni uyardı.')]),
    card('ust_kisisel_antrenor', { tier: TOP, money: ['>', 400000] }, 'Kişisel antrenör', 'Ünlü bir kişisel antrenör seninle çalışmak istiyor. Aylık ücreti maaşının neredeyse yarısı.', [
      O('Bir ay dene', 'hirsli', { para: '-w2', 'a.dayaniklilik': 1.5, 'a.hizlanma': 1, enerji: -4 }, 'Kasların seni şaşırttı.'),
      O('Kulübün antrenörü yeterli', 'kacamak', {}, 'Paranı cebinde tuttun.')]),
    card('ust_baskan_secimi', { tier: [1], season: ['>=', 2] }, 'Kulüp', 'Kulüpte başkanlık seçimi var. İki aday da seninle "gelecek projesinin yüzü" olarak fotoğraf çektirmek istiyor.', [
      O('Mevcut başkanı destekle', 'sadik', { 'r.baskan': 6, 'r.taraftar': -2 }, 'Başkan seçimi kazandı. Sana yeni sözleşme sözü verdi.'),
      O('Tarafsız kal', 'kacamak', { 'r.medya': 2 }, 'İki aday da sana bozuldu ama kimse kızmadı.'),
      O('Muhalif adayla görüş', 'sert', { 'r.baskan': -8, 'r.taraftar': 3 }, 'Mevcut başkan kazandı. Bunu unutmayacak.')]),
    card('ust_sosyal_ajans', { tier: TOP, followers: ['>', 80000] }, '{menajer}', 'Menajerin bir sosyal medya ajansı önerdi: hesaplarını profesyoneller yönetecek, paylaşımlar planlanacak.', [
      O('Ajansla çalış', 'kacamak', { para: '-w0.5', 'takipci%': 5, 'r.medya': 2 }, 'Hesabın artık bir reklam panosu gibi. Takipçiler arttı ama samimiyet azaldı.'),
      O('Hesabımı kendim yönetirim', 'durust', { 't.durust': 1 }, 'Yazım hataların artık "imza" sayılıyor.')]),
    card('ust_derbi_guvenlik', { tier: [1], stat: { sohret: ['>', 30] } }, 'Kulüp güvenliği', 'Derbi haftası. Kulüp güvenliği evinin önüne iki koruma koydu. Komşular pencereden bakıyor.', [
      O('Korumalara çay yap', 'mutevazi', { 'r.memleket': 1, moral: 2 }, 'Korumalar haftanın sonunda seni arkadaşları gibi gördü.'),
      O('Normal hayatına devam et', 'iddiali', { mental: -1 }, 'Markette bir rakip taraftar sana bağırdı. Korumalar haklıymış.')]),
    card('ust_ozel_sef', { tier: TOP, money: ['>', 600000] }, 'Beslenme uzmanı', 'Kulübün beslenme uzmanı sana özel şef tutmanı öneriyor. Annen "Benim yemeğim neyine yetmiyor?" diye alındı.', [
      O('Şef tut', 'iddiali', { para: '-w1', saglik: 4, 'r.anne': -3 }, 'Kilon ideal seviyeye indi. Annen hâlâ küs.'),
      O('Annenin yemekleri devam', 'duygusal', { 'r.anne': 5, saglik: -1 }, 'Annen haftada iki tencere gönderiyor.')]),
    card('ust_yayin_ekibi', { tier: [1], stat: { sohret: ['>', 25] } }, 'Yayıncı kuruluş', 'Maç yayınını yapan kanal, maç öncesi "oyuncunun gözünden" kamerası takmak istiyor. Isınmayı göğsündeki kamerayla yapacaksın.', [
      O('Kabul et', 'esprili', { 'takipci%': 3, sohret: 1, form: -1 }, 'Isınma görüntüleri çok izlendi. Ama dikkatin dağıldı.'),
      O('Reddet', 'kacamak', { form: 1 }, 'Yayıncı kuruluş başka bir oyuncuya gitti.')])
  );

  /* ---------- Yurt dışı ---------- */
  add(
    card('yd_yalnizlik', { abroad: true }, 'Ev', 'Yabancı bir şehirde üçüncü ayın. Akşamları dört duvar arasındasın. Annenin sesini duymak istiyorsun ama orada saat gece üç.', [
      O('Sabah annenle uzun görüntülü konuş', 'duygusal', { mental: 3, 'r.anne': 4 }, 'Annen mutfağı gösterdi. Dolmanın kokusunu neredeyse aldın.'),
      O('Takım arkadaşlarıyla dışarı çık', 'sosyal', { 'r.takim': 4, mental: 2, enerji: -4 }, 'Bir arkadaş edindin.'),
      O('Kendini antrenmana ver', 'hirsli', { 'a.dayaniklilik': 0.6, mental: -2 }, 'Kafanı dağıtamadın.')], { w: 14 }),
    card('yd_turk_yemegi', { abroad: true }, 'Gurbetçi esnaf', 'Şehrin öbür ucunda bir Türk lokantası buldun. Sahibi seni görünce ağladı, hesap almak istemiyor.', [
      O('Israrla öde, bahşiş bırak', 'durust', { 'r.memleket': 3, para: '-w0.05', mental: 2 }, 'Lokantanın duvarına forman asıldı.'),
      O('Teşekkür et, kabul et', 'duygusal', { mental: 3, 'r.memleket': 2 }, 'Her hafta gelmeye söz verdin.')]),
    card('yd_dil_hatasi', { abroad: true, stat: { dil: ['<', 45] } }, 'Soyunma odası', 'Hocanın taktik konuşmasında "sola kay" yerine "sola bak" anladın. Maçta sol tarafa bakıp durdun.', [
      O('Dil dersini artır', 'mutevazi', { dil: 3, 'r.hoca': 2, para: '-w0.2' }, 'Artık "sol", "sağ" ve "dur" kelimelerinden eminsin.'),
      O('Takım arkadaşından tercüman iste', 'esprili', { 'r.takim': 3 }, 'Brezilyalı stoper İngilizceni Portekizceye çevirip hocaya anlatıyor.')]),
    card('yd_gurbetci_taraftar', { abroad: true, stat: { sohret: ['>', 10] } }, 'Gurbetçi taraftarlar', 'Deplasman tribününde dev bir Türk bayrağı var. Yüzlerce gurbetçi seni izlemeye gelmiş.', [
      O('Maç sonu yanlarına git', 'duygusal', { 'r.memleket': 6, moral: 6, 'takipci%': 3 }, 'Bir amca sana sarılıp "Bizi gururlandırdın oğlum" dedi.'),
      O('Uzaktan el salla', 'mutevazi', { 'r.memleket': 2 }, 'Tezahüratları otobüsten de duydun.')]),
    card('yd_hava', { abroad: true, country: ['EN', 'DE'] }, 'Hava', 'Altı haftadır güneş görmedin. Kulüp doktoru D vitamini verdi ama moralin dipte.', [
      O('Bir hafta sonu güneyli bir şehre kaç', 'iddiali', { moral: 5, para: '-w0.3', enerji: 4 }, 'İki gün güneş, bir hafta enerji.'),
      O('Işık terapisi lambası al', 'saygili', { moral: 2, para: '-w0.1' }, 'Odan artık bir solaryum gibi.')]),
    card('yd_irkci_tezahurat', { abroad: true }, 'Maç', 'Deplasmanda bir grup rakip taraftar sana hakaret içeren tezahüratlar yaptı. Hakem oyunu durdurmadı.', [
      O('Hakeme bildir, oyunu durdurmasını iste', 'sert', { 'r.medya': 4, 'r.takim': 4, mental: -2 }, 'Hakem anonsu yaptırdı. Kulüp ve lig olayı soruşturmaya aldı.'),
      O('Oyuna devam et, sonra açıklama yap', 'saygili', { 'r.medya': 3, mental: -3 }, 'Açıklaman binlerce destek mesajı aldı.'),
      O('Takım arkadaşlarınla sahayı terk etmeyi teklif et', 'lider', { 'r.takim': 6, 's.liderlik': 2, 'r.hoca': -1 }, 'Kaptan seni destekledi. Maç beş dakika durdu.')], { w: 4, rep: 300 }),
    card('yd_turk_gazeteci', { abroad: true, stat: { sohret: ['>', 20] } }, 'Türk basını', 'Türkiye’den üç gazeteci antrenman tesisinin kapısında. "Milli takım hocası seni izliyor mu?" diye soruyorlar.', [
      O('Kısa bir röportaj ver', 'saygili', { 'r.medya': 4, sohret: 1 }, 'Akşam ana haberlerde sendin.'),
      O('Kulüp izin vermiyor de', 'kacamak', { 'r.medya': -1 }, 'Gazeteciler kapıda iki saat bekledi.')]),
    card('yd_ev_bulma', { abroad: true, season: ['>=', 1] }, 'Emlakçı', 'Kiraladığın evin sahibi "yabancıya ev vermem" deyip sözleşmeyi uzatmadı. Kulüp sana otel ayarladı.', [
      O('Kulübün tanıdık emlakçısına güven', 'saygili', { para: '-w0.5', mental: 1 }, 'Yeni ev stadyuma yürüme mesafesinde.'),
      O('Otelde kal, sorun etme', 'sessiz', { mental: -2 }, 'Otel kahvaltısından bıktın.')]),
    dm('yd_yabanci_dost', { abroad: true }, 'Takım arkadaşın', 'Senin gibi bu ülkeye yeni gelen Afrikalı bir takım arkadaşın yazdı: "Bu akşam bizde yemek var, ülkemin yemeğini yapıyorum, gel."', [
      O('Git, tatlı götür', 'sosyal', { 'r.takim': 5, mental: 3, moral: 2 }, 'Sahada da birbirinizi kollamaya başladınız.'),
      O('Yorgunum, başka sefer', 'sessiz', { 'r.takim': -1 }, 'Sonraki daveti yapmadı.')])
  );

  /* ---------- Yaşa göre: genç ---------- */
  add(
    card('genc_ehliyet', { minAge: 18, maxAge: 20, noflag: 'ehliyet' }, 'Sürücü kursu', 'Ehliyet sınavın bu hafta. Direksiyon hocası "Maçta stoperi geçiyorsun, park etmeyi de öğren" dedi.', [
      O('Sınava gir', 'iddiali', { moral: 2, para: '-w0.1' }, 'Sınav salonuna girdin.', { chk: { s: 'sogukkanlilik', d: 30 }, ok: { r: 'İlk denemede geçtin! Ehliyet cebinde.', fx: { flag: 'ehliyet', moral: 3 } }, no: { r: 'Kaldın. Bir ay sonra tekrar.', fx: { moral: -2 } } }),
      O('Sınavı ertele, sezon yoğun', 'kacamak', {}, 'Takım arkadaşın seni bir sezon daha taşıyacak.')]),
    card('genc_ilk_maas', { maxAge: 20, season: 1, week: [4, 12] }, 'Banka', 'İlk profesyonel maaşın hesabına yattı. Ekrana bakıp bir süre bekledin.', [
      O('Annene hediye al', 'duygusal', { 'r.anne': 8, 'r.aile': 4, para: '-w0.4' }, 'Annen hediyeyi yıllarca vitrinde sakladı.'),
      O('Kenara koy', 'mutevazi', { mental: 2 }, 'Babana "maaşın yarısını biriktiriyorum" dedin. Gururlandı.'),
      O('Kendine yeni krampon ve telefon al', 'gosteris', { moral: 5, para: '-w0.6', 't.gosteris': 0.5 }, 'Telefonun kamerası harika. Kramponların da.')], { w: 40, rep: 999 }),
    card('genc_okul_mezuniyet', { maxAge: 19, season: 1 }, 'Okul', 'Lise diploma töreni maç günü. Arkadaşların sahnede kep atacak.', [
      O('Hocadan izin iste', 'saygili', { 'r.hoca': -2, moral: 5, 'r.aile': 4 }, 'Hoca izin verdi ama kadro dışı kaldın. Annen o fotoğrafı çerçeveletti.'),
      O('Maça çık, diploma postayla gelir', 'hirsli', { 'r.hoca': 3, moral: -2 }, 'Arkadaşların sana video attı.')], { w: 20, rep: 999 }),
    card('genc_akran_baskisi', { maxAge: 20 }, 'Eski arkadaşların', 'Mahalleden arkadaşların Cumartesi gecesi bir partiye çağırıyor. Pazar sabahı antrenman var.', [
      O('Git ama erken dön', 'sosyal', { 'r.kanka': 2, enerji: -6, moral: 3 }, 'Saat birde evdeydin. Kimse inanmadı.'),
      O('Gitme', 'hirsli', { disiplin: 3, 'r.kanka': -2 }, '"Profesör oldu bizimki" dediler.'),
      O('Git ve sabaha kadar kal', 'parti', { moral: 6, enerji: -18, disiplin: -4, 't.parti': 1 }, 'Antrenmanda hocanın gözlerine bakamadın.')]),
    card('genc_askerlik', { minAge: 21, maxAge: 27, noflag: 'askerlik' }, 'Askerlik şubesi', 'Askerlik tecil süren dolmak üzere. Kulüp avukatı bedelli askerlik ya da sezon sonu kısa dönem seçeneklerini anlattı.', [
      O('Bedelli askerlik', 'kacamak', { para: '-w4', flag: 'askerlik' }, 'Bir ay sonra döndün. Takım "komutanım" diye karşıladı.'),
      O('Sezon arası kısa dönem', 'mutevazi', { flag: 'askerlik', 'r.taraftar': 4, enerji: -5 }, 'Askerde de bölük takımının kaptanıydın.'),
      O('Tecil süresini uzat', 'kacamak', {}, 'Bir yıl daha erteledin.')], { w: 8, rep: 999 })
  );

  /* ---------- Yaşa göre: olgun ve veteran ---------- */
  add(
    card('olgun_ev_kredisi', { minAge: 24, money: ['>', 800000], noown: ['villa', 'kosk'] }, 'Banka', 'Bankacın aradı: "Sporculara özel ev kredisi kampanyası var. Kira ödemek yerine kendi evin olsun."', [
      O('Kredi çek, ev al', 'kacamak', { para: '-w3', mental: 3 }, 'Artık bir evin var. Bankaya da yirmi yıllık borcun.'),
      O('Peşin alana kadar bekle', 'mutevazi', {}, 'Kiraya devam.')]),
    card('olgun_kardes_universite', { minAge: 22, hasRole: 'kardes' }, '{kardesi}', '{kardesi} üniversiteyi kazandı ama özel üniversite. Harç maaşının birkaç katı.', [
      O('Harcı sen öde', 'duygusal', { para: '-w3', 'r.kardes': 12, 'r.aile': 6 }, 'Kardeşin seni mezuniyet töreninde sahneye çağıracak.'),
      O('Yarısını öde, burs araştırsın', 'saygili', { para: '-w1.5', 'r.kardes': 5 }, 'Kardeşin burs da buldu.'),
      O('Devlet üniversitesine yönlendir', 'sert', { 'r.kardes': -6, 'r.aile': -2 }, 'Kardeşin bir hafta seninle konuşmadı.')]),
    card('olgun_kuzen_borc', { minAge: 22, money: ['>', 150000] }, 'Kuzenin', 'Uzak bir kuzenin aradı: "Abi bir dükkân açacağım, biraz destek olsan? Söz, iki ayda öderim."', [
      O('Ver', 'duygusal', { para: '-w2', 'r.aile': 3 }, 'İki ay geçti. Kuzen telefonu açmıyor.', { seed: [{ id: 'kuzen_iade', in: [8, 14], p: 0.35 }] }),
      O('Kibarca reddet', 'kacamak', { 'r.aile': -2 }, 'Aile grubunda biraz soğuk rüzgârlar esti.')]),
    card('kuzen_iade', {}, 'Kuzenin', 'Kuzenin sana borcunu faiziyle geri getirdi: "Dükkân tuttu abi! Bu da sana bir forma." Formada senin numaran var.', [
      O('Sarıl', 'duygusal', { para: 'w2.2', 'r.aile': 5, moral: 4 }, 'İnanmamıştın ama oldu.')], { chain: true }),
    card('vet_genc_rakip', { minAge: 29 }, 'Antrenman', 'Altyapıdan gelen 18 yaşındaki bir çocuk senin mevkinde çok iyi oynuyor. Hoca onu sık sık izliyor.', [
      O('Ona yol göster', 'mutevazi', { 's.liderlik': 2, 'r.hoca': 4, 'r.takim': 3 }, 'Çocuk sana "abi" diyor, sen de onu koruyorsun.'),
      O('Antrenmanda yerini belli et', 'hirsli', { 'a.dayaniklilik': 0.6, 'r.takim': -1 }, 'İkiniz de birbirinizi zorluyorsunuz.')]),
    card('vet_antrenorluk_kursu', { minAge: 30 }, 'Federasyon', 'Federasyon aktif futbolculara yaz döneminde UEFA C antrenörlük kursu açıyor.', [
      O('Kursa yazıl', 'saygili', { 's.liderlik': 3, 'r.hoca': 3, enerji: -4, flag: 'antrenor_kursu' }, 'İlk derste kendi oyununu analiz ettin. Gözlerin açıldı.'),
      O('Şimdi değil', 'kacamak', {}, 'Önce futbol.')]),
    card('vet_vucut', { minAge: 31 }, 'Kulüp doktoru', 'Sabahları kalkmak artık daha zor. Doktor "Toparlanma süren uzuyor, haftada bir maç fazla olabilir" dedi.', [
      O('Rotasyonu kabul et', 'mutevazi', { saglik: 4, 'r.hoca': 3, moral: -2 }, 'Daha az oynuyorsun ama sakatlanmıyorsun.'),
      O('Her maçı oynamak istiyorum', 'hirsli', { saglik: -4, moral: 2 }, 'Vücudunun sınırlarını zorluyorsun.')]),
    card('vet_veda_teklif', { minAge: 33, season: ['>=', 3] }, 'Memleket kulübü', '{memleket} kulübü kariyerinin son yılını orada geçirmeni istiyor. "Bizim çocuğumuz evine dönsün" diyorlar.', [
      O('Düşüneceğini söyle', 'duygusal', { 'r.memleket': 6, moral: 3 }, 'Memlekette haberin manşet oldu.'),
      O('"Daha bitmedi."', 'iddiali', { 'r.memleket': -2, form: 1 }, 'Memleket biraz kırıldı ama anladı.')])
  );

  /* ---------- Aile ---------- */
  add(
    card('aile_baba_sosyal', { hasRole: 'baba', stat: { sohret: ['>', 15] } }, 'Baban', 'Baban senin hakkında kötü yorum yapan birine sosyal medyada cevap verirken kavgaya girmiş. Ekran görüntüleri yayıldı.', [
      O('Babanı ara, sakinleştir', 'saygili', { 'r.baba': 3, 'r.medya': 1 }, 'Baban "Ama haksızlık yapıyorlardı" dedi. Haklıydı.'),
      O('Gülerek paylaş: "Babam benden sert savunma yapıyor"', 'esprili', { 'takipci%': 3, 'r.baba': 4 }, 'Baban bir anda ünlü oldu.')]),
    card('aile_anne_saglik', { hasRole: 'anne', minAge: 23 }, 'Annen', 'Annen tahlil sonuçlarını sakladığını itiraf etti. Doktor "Ameliyat gerekebilir" demiş.', [
      O('Hocadan izin al, yanına git', 'duygusal', { 'r.anne': 10, 'r.hoca': -2, moral: -3, enerji: -6 }, 'Ameliyat iyi geçti. Annen uyanınca ilk seni sordu.'),
      O('En iyi doktoru ayarla, maçtan sonra git', 'saygili', { 'r.anne': 6, para: '-w1.5' }, 'Annen "Benim oğlum doktor tuttu" diye herkese anlattı.')], { w: 5, rep: 400 }),
    card('aile_whatsapp', { hasRole: 'anne' }, 'Aile grubu', 'Aile WhatsApp grubunda teyzen senin maçından bir ekran fotoğrafı atmış: "Bu bizim çocuk mu? Saçı ne olmuş?"', [
      O('Saç fotoğrafı at', 'esprili', { 'r.aile': 3, moral: 2 }, 'Grupta yirmi dakika saç modeli tartışıldı.'),
      O('Sessize al', 'sessiz', { 'r.aile': -1 }, 'Kırk mesajı sonra okudun.')]),
    card('aile_bayram', { week: [14, 30] }, 'Bayram', 'Bayram. Maç yüzünden memlekete gidemiyorsun. Annen sofrayı görüntülü aramada gösteriyor.', [
      O('Takım arkadaşlarını evde bayram yemeğine çağır', 'sosyal', { 'r.takim': 5, moral: 4, para: '-w0.1' }, 'Yabancı takım arkadaşın ilk kez baklava yedi ve ağladı.'),
      O('Annenle uzun konuş', 'duygusal', { 'r.anne': 4, mental: 2 }, 'Telefonda bütün akrabalar sırayla bayramlaştı.')], { rep: 40 }),
    card('aile_kardes_futbol', { hasRole: 'kardes', minAge: 22 }, '{kardesi}', '{kardesi} de futbolcu olmak istiyor. Bir kulübün deneme antrenmanına çağrıldı ama babanız karşı.', [
      O('Kardeşini destekle, babanla konuş', 'duygusal', { 'r.kardes': 8, 'r.baba': -3 }, 'Kardeşin denemeye gitti. Baban sonunda tribüne geldi.'),
      O('Babana hak ver: "Önce okul"', 'saygili', { 'r.baba': 4, 'r.kardes': -6 }, 'Kardeşin kapıyı çarptı.')]),
    card('aile_dede_vefat', { minAge: 20 }, 'Ailen', 'Deden vefat etti. Cenaze yarın {memleket}\'te. Maç ise yarın akşam.', [
      O('Cenazeye git', 'duygusal', { 'r.aile': 8, 'r.memleket': 4, mental: -4, do: 'suspend:1' }, 'Köydeki herkes seni tanıdı. Deden seni hep anlatırmış.'),
      O('Maça çık, golü dedene adayacağını söyle', 'duygusal', { mental: -3, 'r.aile': -2, form: 1 }, 'Formanın altına dedenin fotoğrafını koydun.')], { w: 3, rep: 999 }),
    dm('aile_anne_roportaj', { hasRole: 'anne', stat: { sohret: ['>', 30] } }, 'Annen', 'Annen bir televizyon programına çıkıp çocukluk fotoğraflarını göstermiş. "Altına yapınca bile top isterdi" demiş.', [
      O('"Anne neden!"', 'esprili', { 'takipci%': 3, 'r.anne': 2 }, 'Fotoğraf her yerde. Biraz utandın ama sevimli.'),
      O('Anneni ara, teşekkür et', 'duygusal', { 'r.anne': 5 }, 'Annen "Bir daha çağırsınlar çıkarım" dedi.')])
  );

  /* ---------- Takım içi ---------- */
  add(
    card('takim_muzik', {}, 'Soyunma odası', 'Soyunma odasında maç öncesi müzik kavgası: biri arabesk istiyor, biri rap, kaptan marş çalıyor.', [
      O('Karma liste yap', 'sosyal', { 'r.takim': 4, 's.sosyallik': 1 }, 'Arabeskten rapa geçiş efsane oldu.'),
      O('Kulaklığını tak, karışma', 'sessiz', {}, 'Kendi dünyandaydın.')]),
    card('takim_yeni_yabanci', { season: ['>=', 1] }, 'Yeni transfer', 'Takıma Türkçe bilmeyen yeni bir yabancı oyuncu geldi. Soyunma odasında yalnız oturuyor.', [
      O('Yanına otur, şehri gezdir', 'sosyal', { 'r.takim': 4, dil: 2, 's.sosyallik': 1 }, 'Ona "yavaş yavaş" ve "abi" kelimelerini öğrettin.'),
      O('Kimse benimle ilgilenmemişti', 'sert', { 'r.takim': -2 }, 'Adam üç hafta yalnız yemek yedi.')]),
    card('takim_prim', { tier: [1, 2, 3] }, 'Kaptan', 'Galibiyet primi geldi. Kaptan primin herkese eşit dağıtılmasını öneriyor; oynayanlar daha fazla istiyor.', [
      O('Eşit dağıtılsın', 'mutevazi', { 'r.takim': 5, 'r.kaptan': 4, para: '-w0.2' }, 'Yedekler seni çok sevdi.'),
      O('Oynayanlar daha fazla almalı', 'paragoz', { para: 'w0.2', 'r.takim': -4, 't.paragoz': 0.5 }, 'Hesap doğru ama soyunma odası soğudu.')]),
    card('takim_bahis_skandali', { season: ['>=', 2] }, 'Spor Haber', 'Takım arkadaşlarından birinin yasa dışı bahis sitesine üye olduğu ortaya çıktı. Federasyon soruşturma açtı, gazeteciler senin de adını soruyor.', [
      O('"Benim hiçbir ilgim yok."', 'durust', { 'r.medya': 2 }, 'Hesapların temiz çıktı.'),
      O('Arkadaşını savun', 'sadik', { 'r.takim': 3, 'r.medya': -3 }, 'Takım arkadaşın ceza aldı ama sana teşekkür etti.')], { w: 4, rep: 400 }),
    card('takim_dogum_gunu', {}, 'Takım arkadaşların', 'Doğum günün! Takım antrenman sonunda seni pastaya yatırdı, kafandan yumurta kırdılar.', [
      O('Pastayı kaptana sür', 'esprili', { 'r.takim': 5, 'r.kaptan': 2, moral: 4 }, 'Pasta savaşı malzemeciyi bile içine aldı.'),
      O('Gülerek kaç', 'mutevazi', { 'r.takim': 2, moral: 3 }, 'Yine de üç yumurta yedin.')], { rep: 52 }),
    card('takim_malzemeci', { season: ['>=', 2] }, 'Malzemeci', 'Kulübün 30 yıllık malzemecisi emekli oluyor. Takım veda hediyesi için para topluyor.', [
      O('Cömert katkı yap, konuşma yap', 'duygusal', { 'r.takim': 5, para: '-w0.3', 's.liderlik': 1 }, 'Malzemeci senin konuşmanda ağladı.'),
      O('Herkes kadar katıl', 'mutevazi', { para: '-w0.05' }, 'Güzel bir veda oldu.')], { rep: 999 }),
    card('takim_depresyon', { season: ['>=', 1] }, 'Takım arkadaşın', 'Takım arkadaşın {takimarkadasi} son haftalarda çok sessiz. Antrenmandan sonra arabasında yalnız ağlarken gördün.', [
      O('Yanına git, konuş', 'duygusal', { 'r.takim': 5, 's.liderlik': 1, mental: -1 }, 'Psikologla görüşmeye başladı. Sana "o gün gelmesen..." dedi.'),
      O('Kulüp psikoloğuna haber ver', 'saygili', { 'r.takim': 3 }, 'Profesyonel destek aldı.'),
      O('Karışmamak en iyisi', 'sessiz', { 'r.takim': -1 }, 'Bir ay sonra kulüpten ayrıldı.')], { w: 5, rep: 300 }),
    card('takim_gruplasma', { season: ['>=', 1] }, 'Soyunma odası', 'Takımda yerliler ve yabancılar arasında gruplaşma başladı. Yemekte ayrı masalara oturuluyor.', [
      O('İki masayı birleştir', 'lider', { 'r.takim': 6, 's.liderlik': 2 }, 'Hoca bunu fark etti ve seni kaptanlık adayı olarak not aldı.'),
      O('Kendi grubunda kal', 'sessiz', { 'r.takim': -2 }, 'Maçlarda da paslar gruplara göre gidiyor.')]),
    card('takim_borc', { money: ['>', 80000] }, 'Takım arkadaşın', '{takimarkadasi} borç istedi: "Annemin ameliyatı var, maaşlar gecikti."', [
      O('Ver', 'duygusal', { para: '-w1', 'r.takim': 4 }, 'İki ay sonra geri ödedi, yanında bir ev yemeğiyle.', { seed: [{ id: 'borc_iade', in: [6, 10], p: 0.8 }] }),
      O('Kulübe avans için başvurmasına yardım et', 'saygili', { 'r.takim': 2, 's.konusma': 1 }, 'Kulüp avans verdi.')]),
    card('borc_iade', {}, 'Takım arkadaşın', '{takimarkadasi} borcunu geri getirdi. Yanında annesinin yaptığı bir tepsi börek var.', [
      O('Teşekkür et', 'duygusal', { para: 'w1', 'r.takim': 3, moral: 3 }, 'Börek iki günde bitti.')], { chain: true })
  );

  /* ---------- Sağlık ve beden ---------- */
  add(
    card('saglik_dis', {}, 'Diş', 'Gece yarısı yirmi yaş dişin zonklamaya başladı. Yarın antrenman var.', [
      O('Acil dişçiye git', 'saygili', { saglik: 2, para: '-w0.05', enerji: -4 }, 'Diş çekildi, yanağın şiş.'),
      O('Ağrı kesiciyle idare et', 'kacamak', { saglik: -2, enerji: -6 }, 'Antrenmanda yüzünü buruşturdun.')]),
    card('saglik_grip', {}, 'Kulüp doktoru', 'Ateşin 38,5. Doktor "dinlen" diyor ama hafta sonu kritik maç var.', [
      O('Dinlen', 'saygili', { saglik: 4, form: -1, 'r.hoca': -1 }, 'İki gün yorganın altında geçti.'),
      O('İlaçla oyna', 'hirsli', { saglik: -5, 'r.hoca': 2 }, 'Sahada zorlandın ama dayandın.', { seed: [{ id: 'saglik_doping_ilac', in: [1, 3], p: 0.15 }] })]),
    card('saglik_doping_ilac', {}, 'Doping kontrolü', 'Rastgele doping kontrolü! Geçen hafta içtiğin grip şurubunun içinde yasaklı bir madde olabilirmiş.', [
      O('Kulüp doktorunu ara, reçeteyi göster', 'durust', { mental: -2 }, 'Doktor ilacın serbest olduğunu belgeledi. Rahat bir nefes.'),
      O('Panikleyip menajerini ara', 'kacamak', { mental: -4, 'r.menajer': 1 }, 'Test temiz çıktı ama iki gün uyuyamadın.')], { chain: true }),
    card('saglik_kilo', { tier: TOP }, 'Beslenme uzmanı', 'Yağ ölçümünde yüzde iki fazla çıktın. Beslenme uzmanı "baklava yasak" dedi. Annen Bayram\'da tepsi gönderecek.', [
      O('Diyete uy', 'saygili', { saglik: 3, moral: -2, disiplin: 2 }, 'İki haftada ideal kiloya döndün.'),
      O('Gizlice bir dilim', 'esprili', { moral: 3, saglik: -1 }, 'Malzemeci gördü ama kimseye söylemedi.')]),
    card('saglik_uyku', { stat: { mental: ['<', 45] } }, 'Gece', 'Üç gecedir uyuyamıyorsun. Kafanda maçlar, sözleşmeler, telefon bildirimleri.', [
      O('Telefonu yatak odasından çıkar', 'saygili', { mental: 3, enerji: 6 }, 'Dördüncü gece sekiz saat uyudun.'),
      O('Kulüp psikoloğuna git', 'duygusal', { mental: 5 }, 'Konuşmak iyi geldi.'),
      O('Uyku ilacı al', 'kacamak', { enerji: 4, saglik: -2 }, 'Uyudun ama sabah kafan bulanıktı.')])
  );

  /* ---------- Para ---------- */
  add(
    card('para_vergi', { money: ['>', 300000] }, 'Muhasebeci', 'Muhasebecin aradı: "Geçen yılın beyannamesinde eksik var. Ya şimdi öderiz ya da faiz büyür."', [
      O('Hemen öde', 'durust', { para: '-w1', 't.durust': 0.5 }, 'Vergi dairesinde selfie isteyen memur oldu.'),
      O('Avukatla itiraz et', 'kacamak', { para: '-w0.4' }, 'İtirazın kısmen kabul edildi.')]),
    card('para_restoran', { minAge: 23, money: ['>', 1000000] }, '{kanka}', '{kanka} birlikte restoran açmayı teklif ediyor: "Adı senin olsun, işini ben yaparım."', [
      O('Ortak ol', 'iddiali', { para: '-w5', 'r.kanka': 6 }, 'Restoranın adı "{soyad} Ocakbaşı" oldu.', { seed: [{ id: 'para_restoran_sonuc', in: [10, 20], p: 1 }] }),
      O('Arkadaşlık bozulmasın, olmaz', 'kacamak', { 'r.kanka': -2 }, 'Kanka anladı ama biraz bozuldu.')]),
    card('para_restoran_sonuc', {}, '{kanka}', '{kanka} restoranın ilk aylarının hesaplarını getirdi.', [
      O('Hesapları incele', 'saygili', { mental: 1 }, 'Defterleri açtınız.', { chk: { s: 'kurnazlik', d: 35 }, ok: { r: 'Restoran kârda! Hafta sonları rezervasyon dolu.', fx: { para: 'w3', 'r.kanka': 4 } }, no: { r: 'Restoran zarar ediyor. Kapatmaya karar verdiniz.', fx: { 'r.kanka': -3, moral: -3 } } })], { chain: true }),
    card('para_bagis', { stat: { sohret: ['>', 20] }, money: ['>', 200000] }, 'Bir dernek', 'Memleketindeki köy okulunun spor salonu yok. Okul müdürü yardım istiyor.', [
      O('Salonun masrafını karşıla', 'duygusal', { para: '-w4', 'r.memleket': 12, sohret: 1, 'r.medya': 3 }, 'Salonun adını senin koymak istiyorlar.'),
      O('Malzeme gönder', 'mutevazi', { para: '-w0.5', 'r.memleket': 4 }, 'Çocuklar yeni toplarla fotoğraf gönderdi.'),
      O('Şimdi değil', 'kacamak', { 'r.memleket': -2 }, 'Müdür yine de teşekkür etti.')]),
    card('para_baba_araba', { hasRole: 'baba', minAge: 22, money: ['>', 600000] }, 'Baban', 'Babanın 20 yıllık arabası yine yolda kaldı. "Daha çok gider" diyor ama sesi yorgun.', [
      O('Babana yeni araba al', 'duygusal', { para: '-w4', 'r.baba': 12, 'r.aile': 5 }, 'Baban arabayı mahallede üç tur gezdirdi.'),
      O('Tamir masrafını öde', 'mutevazi', { para: '-w0.3', 'r.baba': 3 }, 'Araba bir yıl daha gidecek.')], { rep: 999 }),
    card('para_saat_sahte', { money: ['>', 400000], minAge: 21 }, 'Arkadaşın', 'Bir tanıdık "yarı fiyatına" lüks saat getirdi. Kutusu biraz garip.', [
      O('Al', 'gosteris', { para: '-w1', 't.gosteris': 0.5 }, 'Saat iki hafta sonra durdu. Sahteymiş.'),
      O('Almam', 'durust', { 's.kurnazlik': 1 }, 'Akıllıca.')])
  );

  /* ---------- Medya ve sosyal medya ---------- */
  add(
    card('medya_eski_paylasim', { followers: ['>', 20000], minAge: 20 }, 'Sosyal medya', 'Birileri 14 yaşındayken yazdığın bir paylaşımı buldu: "Büyüyünce rakip takımda oynayacağım!" Şimdi o takımın ezeli rakibindesin.', [
      O('"Çocuktum ama sözümü tutmadım" de', 'esprili', { 'takipci%': 2, 'r.taraftar': 1 }, 'Taraftarlar güldü.'),
      O('Paylaşımı sil', 'kacamak', { 'r.taraftar': -2 }, 'Silmek daha çok dikkat çekti.')]),
    card('medya_yanlis_alinti', { stat: { sohret: ['>', 25] } }, 'Spor Haber', 'Bir site senin "Bu kulüp beni hak etmiyor" dediğini yazdı. Böyle bir şey söylemedin.', [
      O('Yalanla, kaynağı iste', 'sert', { 'r.medya': -1, 'r.taraftar': 3 }, 'Site haberi kaldırdı.'),
      O('Kulübe açıklama yaptır', 'saygili', { 'r.baskan': 2 }, 'Kulübün açıklaması konuyu kapattı.')]),
    card('medya_dans_trendi', { followers: ['>', 10000], maxAge: 27 }, 'Takım arkadaşların', 'Takım arkadaşların yeni dans trendini çekmek istiyor. Hoca dans etmeyi hiç sevmez.', [
      O('Dans et', 'esprili', { 'takipci%': 4, 'r.takim': 3, 'r.hoca': -2 }, 'Video bir gecede bir milyon izlendi.'),
      O('Kameraman ol', 'mutevazi', { 'r.takim': 2 }, 'Sen çektin, onlar ünlü oldu.')]),
    card('medya_dizi_teklif', { stat: { sohret: ['>', 50] }, tier: TOP }, '{menajer}', 'Bir dizi yapımcısı seni bir bölümde konuk oyuncu olarak istiyor. Repliğin tek cümle: "Topu ver abi."', [
      O('Kabul et', 'esprili', { 'takipci%': 5, para: 'w1', 'r.hoca': -2 }, 'Tek cümleyi on yedi kez çektiniz.'),
      O('Reddet', 'kacamak', {}, 'Rolü bir şarkıcı aldı.')]),
    card('medya_youtube', { followers: ['>', 30000] }, 'Kanka', '{kanka} bir YouTube kanalı açmayı öneriyor: "Günlük vlog, maç sonrası, ev turu. Para da gelir."', [
      O('Kanalı aç', 'iddiali', { 'takipci%': 3, enerji: -4, para: 'w0.3' }, 'İlk video: "Futbolcunun bir günü". Yorumlarda annen var.'),
      O('Futbola odaklan', 'hirsli', { 'r.hoca': 1 }, 'Kanka kendi kanalını açtı, seni konuk ediyor.')]),
    card('medya_troll', { followers: ['>', 50000] }, 'Sosyal medya', 'Bir troll hesap her paylaşımına aynı yorumu yapıyor: "Bu çocuk 3. Lig\'de bile oynayamaz." Hesabın adı rakip takımın taraftarı.', [
      O('Görmezden gel', 'sessiz', { mental: 1 }, 'Sonunda sıkılıp gitti.'),
      O('Esprili cevap ver', 'esprili', { 'takipci%': 2 }, 'Troll seni takip etmeye başladı.')])
  );

  /* ---------- Memleket ---------- */
  add(
    card('memleket_okul', { stat: { sohret: ['>', 15] } }, '{memleket}', 'Memleketindeki ilkokulun müdürü aradı: "Çocuklar seni çok merak ediyor. Bir gün gelip ders anlatır mısın?"', [
      O('Git, çocuklarla maç yap', 'duygusal', { 'r.memleket': 8, moral: 5, enerji: -6 }, 'Çocuklar seni kaleye geçirdi. Üç gol yedin.'),
      O('Video mesaj gönder', 'mutevazi', { 'r.memleket': 2 }, 'Video sınıfta on kez izlendi.')]),
    card('memleket_stad_adi', { stat: { sohret: ['>', 55] }, minAge: 25 }, 'Belediye', '{memleket} belediyesi ilçe stadına senin adını vermek istiyor.', [
      O('Onur duyarım', 'duygusal', { 'r.memleket': 15, sohret: 1, moral: 6 }, 'Açılışta baban kurdeleyi kesti.'),
      O('Hayattayken olmaz, nazar değer', 'esprili', { 'r.memleket': 4 }, 'Belediye başkanı güldü. "Sonra konuşuruz" dedi.')], { w: 4, rep: 999 }),
    card('memleket_dugun', { stat: { sohret: ['>', 10] } }, '{memleket}', 'Memleketten çocukluk arkadaşın evleniyor. Davetiyede "Futbolcu {ad} de gelecek" yazdırmış.', [
      O('Git, sürpriz yap', 'duygusal', { 'r.memleket': 6, enerji: -8, moral: 4 }, 'Halayda herkes seninle fotoğraf çektirdi.'),
      O('Gidemezsin, hediye gönder', 'saygili', { para: '-w0.2', 'r.memleket': 1 }, 'Arkadaşın biraz kırıldı ama anladı.')])
  );

  /* ---------- Absürt ama mümkün (seyrek) ---------- */
  const rare = (e) => Object.assign(e, { w: 1.5, rep: 999 });
  add(
    rare(card('abs_martı', { tier: LOW }, 'Maç', 'Maçın ortasında bir martı sahaya indi ve topun üstüne kondu. Hakem oyunu durdurdu, martı gitmiyor.', [
      O('Martıyı kovala', 'esprili', { 'takipci%': 4, 'r.taraftar': 3 }, 'Martı seni kovaladı. Video viral.'),
      O('Simit at', 'kurnaz', { 'takipci%': 3, 's.kurnazlik': 1 }, 'Martı simidi alıp gitti. Tribün alkışladı.')])),
    rare(card('abs_yanlis_numara', { stat: { sohret: ['>', 8] } }, 'Malzemeci', 'Maçtan on dakika önce formanın arkasında soyadın yanlış basılmış: "{soyad}" yerine harfleri karışmış.', [
      O('Yanlış formayla oyna', 'esprili', { 'takipci%': 3, moral: 1 }, 'Spiker de adını yanlış okudu.'),
      O('Bantla düzelt', 'mutevazi', {}, 'Bant ilk yarıda düştü.')])),
    rare(card('abs_kopek_saha', {}, 'Maç', 'Maç sırasında bir sokak köpeği sahaya girdi ve senin peşine takıldı. Hakem bekliyor, köpek ayağının dibinde oturuyor.', [
      O('Köpeği kucaklayıp saha dışına götür', 'duygusal', { 'r.taraftar': 4, 'takipci%': 3 }, 'Barınak köpeğe senin adını verdi.', { seed: [{ id: 'kopek', in: [2, 4], p: 0.5 }] }),
      O('Malzemeciye seslen', 'sessiz', {}, 'Köpek malzemeciyle gitmeyi reddetti.')])),
    rare(card('abs_elektrik', { tier: LOW }, 'Stadyum', 'İkinci yarının ortasında stadyumun elektriği kesildi. Taraftarlar telefon ışıklarını yaktı.', [
      O('Tribüne el salla', 'esprili', { 'r.taraftar': 4, moral: 2 }, 'Kırk dakika sonra jeneratör çalıştı. Gece unutulmazdı.')])),
    rare(card('abs_ters_forma', {}, 'Soyunma odası', 'Isınmaya formanı ters giyip çıktın. Kimse söylemedi, kameraman zoomladı.', [
      O('Gülerek düzelt', 'esprili', { 'takipci%': 2, 'r.takim': 2 }, 'Takım arkadaşların ilk dakikadan biliyormuş.')])),
    rare(card('abs_teyze_hakem', { tier: LOW }, 'Tribün', 'Tribündeki bir teyze maç boyunca hakeme terlik fırlattı. Polis onu çıkarırken teyze senin halan çıktı.', [
      O('Halanı savun', 'duygusal', { 'r.aile': 5, 'takipci%': 3, 'r.medya': -1 }, 'Halan yerel kahraman oldu.'),
      O('Tanımıyormuş gibi yap', 'kacamak', { 'r.aile': -6 }, 'Bayram sofrasında bunun hesabı sorulacak.')])),
    rare(card('abs_yapay_zeka_tahmin', { stat: { sohret: ['>', 30] } }, 'Bir uygulama', 'Bir yapay zekâ uygulaması "{ad} gelecek sezon emekli olacak" diye tahmin yaptı. Haber sitesi bunu manşete taşıdı.', [
      O('"Yapay zekâ da yanılır"', 'esprili', { 'takipci%': 2 }, 'Uygulama tahminini güncelledi: "belki de değil".'),
      O('Görmezden gel', 'sessiz', {}, 'Annen "Doğru mu oğlum?" diye aradı.')])),
    rare(card('abs_patron_kedi', { tier: LOW }, 'Kulüp', 'Kulüp tesisinde yaşayan kedi senin kramponlarının içinde doğum yaptı. Beş yavru.', [
      O('Yavruları sahiplen', 'duygusal', { mental: 4, 'takipci%': 2, flag: 'kopek' }, 'Yavruların adları: Penaltı, Korner, Ofsayt, VAR ve Uzatma.'),
      O('Yeni krampon al', 'mutevazi', { para: '-w0.1' }, 'Eski kramponlar artık kedi evi.')]))
  );

  // seçenek düzeyinde yazılan 'seed' etkiye taşınır (zincir olaylar tetiklensin)
  E.forEach((e) => [].concat(e.o || [], ...Object.values(e.nodes || {}).map((n) => n.o || [])).forEach((o) => { if (o && o.seed) { o.fx = Object.assign({}, o.fx, { seed: o.seed }); delete o.seed; } }));

  /* ---------- Eski olaylarda saçmalık temizliği ---------- */
  const byId = (id) => E.find((e) => e.id === id);
  const gate = (id, extra) => { const e = byId(id); if (e) e.if = Object.assign({}, e.if, extra); };
  gate('eski_ogretmen', { stat: { sohret: ['>', 15] } });
  // memlekete gidilmesi gereken olaylar yurt dışındayken çıkmaz
  ['memleket_okul', 'memleket_dugun', 'alt_dugun_davet'].forEach((id) => gate(id, { abroad: false }));
  gate('nadir_yagmur', { stat: { sohret: ['>', 8] } });
  gate('gun_podcast', { stat: { sohret: ['>', 12] } });
  gate('abs_maskot_kavgasi', { tier: [1, 2], orAbroad: true });
  gate('abs_hakem_sorusturma', { stat: { sohret: ['>', 25] }, season: ['>=', 2] });
  gate('abs_babaanne_surpriz', { stat: { sohret: ['>', 10] } });
  gate('abs_playstation_sakatlik', { stat: { sohret: ['>', 10] } });
  const kt = byId('kadrodisi_tribun');
  if (kt) kt.t = 'Bu hafta kadroda yoksun. Maçı tribünden izleyeceksin.';
})(typeof window !== 'undefined' ? window : globalThis);
