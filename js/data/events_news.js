/* FORMA — haberlerden esinlenen olaylar (kurgu, gerçek kişi adı yok)
   Transfer krizleri, disiplin cezaları, soyunma odası, taraftar, medya, sahadaki tuhaflıklar, hayat, para,
   milli takım, aile ve memleket. Her olay mantıklı olduğu duruma bağlıdır. */
(function (root) {
  const D = root.F.DATA;
  const E = D.events;
  const add = (...evs) => evs.forEach((e) => E.push(e));
  // ek alanlar seçeneğe eklenir; ek bir fx verilirse ana etkiyle birleşir
  const O = (t, tone, fx, r, extra) => { const o = Object.assign({ t, tone, fx, r }, extra || {}); if (extra && extra.fx) o.fx = Object.assign({}, fx, extra.fx); return o; };
  const card = (id, cond, who, t, o, extra) => Object.assign({ id, w: 9, rep: 120, if: cond, kind: 'card', who, t, o }, extra || {});
  const dm = (id, cond, who, t, o, extra) => Object.assign({ id, w: 9, rep: 120, if: cond, kind: 'dm', who, t, o }, extra || {});
  const chat = (id, cond, who, t, o, extra) => Object.assign({ id, w: 9, rep: 120, if: cond, kind: 'chat', who, nodes: { start: { who, t, o } } }, extra || {});
  const LOW = [3, 4, 5], TOP = [1, 2];
  const once = { rep: 999 };

  /* ---------- Transfer ve sözleşme dramları ---------- */
  add(
    card('tr_korfez_teklif', { tier: TOP, stat: { sohret: ['>', 35] }, minAge: 23 }, '{menajer}', 'Bir Körfez kulübü maaşının dört katını teklif etti. Kulübün başkanı "satılık değil" diyor. Menajerin: "Antrenmana çıkmazsan bırakırlar."', [
      O('Antrenmana çıkma', 'sert', { 'r.baskan': -12, 'r.taraftar': -10, 'r.hoca': -8, 'r.menajer': 5, 't.paragoz': 1 }, 'Gazeteler "{ad} grevde" diye yazdı. Taraftar tesisin önünde protesto yaptı.'),
      O('Antrenmana çık, başkanla konuş', 'saygili', { 'r.baskan': 4, 'r.menajer': -4 }, 'Başkan "sezon sonunda konuşuruz" dedi.'),
      O('Teklifi reddet: "Param değil kariyerim önemli"', 'iddiali', { 'r.taraftar': 8, 'r.menajer': -6, sohret: 1 }, 'Taraftarlar adını tezahürat yaptı.')], once),
    card('tr_son_gun', { agent: true, season: ['>=', 1] }, '{menajer}', 'Transfer döneminin son günü, saat 23.40. Menajerin arıyor: "Bir kulüp şimdi faks çekmek istiyor, yirmi dakikada karar ver!"', [
      O('"Kalıyorum."', 'sadik', { 'r.baskan': 3, 'r.menajer': -3 }, 'Telefonu kapattın. Kalbin hâlâ hızlı atıyor.'),
      O('"Şartları söyle."', 'kacamak', { 'r.menajer': 2, mental: -1 }, 'Faks 00.03\'te geldi. Geç kaldı. Belki de iyi oldu.')]),
    card('tr_ses_kaydi', { season: ['>=', 1], stat: { sohret: ['>', 20] } }, 'Spor Haber', 'Başkanın bir ses kaydı sızdı: "O çocuğu yaz sonunda satarız, para lazım." Kaydın senden bahsettiği konuşuluyor.', [
      O('Başkandan açıklama iste', 'sert', { 'r.baskan': -5, 'r.taraftar': 3 }, 'Başkan "kayıt kurgu" dedi. Kimse inanmadı.'),
      O('"Kulübüm için ne gerekiyorsa"', 'sadik', { 'r.baskan': 4, 'r.taraftar': 4 }, 'Taraftarlar "satılmaz" pankartı açtı.')]),
    card('tr_yetistirme_bedeli', { season: ['>=', 2] }, 'Eski kulübün', 'Seni yetiştiren eski kulübün yetiştirme bedeli için federasyona başvurdu. "Biz yetiştirdik, payımızı isteriz" diyorlar.', [
      O('Eski kulübünü destekle', 'duygusal', { 'r.memleket': 5, 'r.baskan': -2 }, 'Eski hocan seni arayıp teşekkür etti.'),
      O('Avukatlara bırak', 'kacamak', {}, 'Dava iki yıl sürecek gibi.')]),
    card('tr_gizli_madde', { season: ['>=', 1] }, 'Kulüp avukatı', 'Sözleşmende fark etmediğin bir madde varmış: "Oyuncu sezon boyunca 78 kilonun üstüne çıkamaz." Tartı 78,4 gösteriyor.', [
      O('İki gün salata', 'saygili', { saglik: 1, moral: -2 }, 'Pazartesi 77,6. Kurtuldun.'),
      O('Maddeye itiraz et', 'sert', { 'r.baskan': -3, para: '-w0.3' }, 'İtirazın reddedildi, ceza kesildi.')]),
    card('tr_kiralik', { role: 'yedek', season: ['>=', 1] }, '{menajer}', 'Bir alt lig kulübü seni sezonun kalanı için kiralamak istiyor. "Orada her hafta oynarsın" diyor menajerin.', [
      O('Hocayla konuş', 'saygili', { 'r.hoca': 2 }, 'Hoca: "Burada kalıp sabredersen fırsat gelecek." Karar yine sende.'),
      O('Kalıp savaşmaya karar ver', 'hirsli', { 'r.hoca': 4, moral: -2, 't.hirsli': 0.5 }, 'Antrenmanda herkesten fazla koştun.')]),
    card('tr_genc_liste', { maxAge: 21, ovr: ['>', 64] }, 'Spor Haber', 'Avrupa’nın en çok konuşulan gençleri listesinde adın 37. sırada. Büyük kulüplerin scoutları maçlarına geliyor.', [
      O('Listeyi paylaş', 'iddiali', { 'takipci%': 4, sohret: 2 }, 'Takipçilerin seni ilk 10’a koydu.'),
      O('"Liste değil saha önemli"', 'mutevazi', { 'r.hoca': 3, mental: 1 }, 'Hoca bu sözü antrenmanda herkese okudu.')], once),
    card('tr_sizan_foto', { stat: { sohret: ['>', 25] }, agent: true }, 'Sosyal medya', 'Bir kulübün tesisinde çekildiğin fotoğraf sızdı. Henüz imza yok ama herkes transfer oldu sanıyor. Mevcut kulübün çok kızgın.', [
      O('"Sadece arkadaş ziyaretiydi"', 'yalan', { 'r.baskan': -4, 'r.medya': -2 }, 'Kimse inanmadı.'),
      O('Kulübünle açık konuş', 'durust', { 'r.baskan': 2, 't.durust': 0.5 }, 'Başkan kızgın ama dürüstlüğünü takdir etti.')]),
    card('tr_ayni_menajer', { agent: true }, 'Spor Haber', 'Hafta sonu karşılaşacağın rakip takımın yıldızı da senin menajerinle çalışıyor. Gazeteler "menajer kimi tutacak" diye dalga geçiyor.', [
      O('Menajerine takıl: "Kimi tutuyorsun?"', 'esprili', { 'r.menajer': 3 }, '"Komisyonu kim alırsa" dedi gülerek.'),
      O('Rakiple fotoğraf çektir', 'sosyal', { 'takipci%': 2 }, 'Fotoğrafın altı yorum yağmuru.')])
  );

  /* ---------- Disiplin ve hoca ---------- */
  add(
    card('dis_toplantida_uyku', {}, 'Hoca', 'Maç öncesi taktik toplantısında gözlerin kapandı. Hoca konuşmayı kesti: "{ad}, rüyanda kazanıyor muyuz?"', [
      O('"Özür dilerim hocam, gece uyuyamadım."', 'saygili', { 'r.hoca': -2, disiplin: 2 }, 'Hoca bir şey demedi ama kenara not aldı.'),
      O('"Evet hocam, 3-0!"', 'esprili', { 'r.takim': 5, 'r.hoca': -4 }, 'Takım gülmekten yerlere yattı. Hoca gülmedi.')]),
    card('dis_terlemedin', { tier: TOP }, 'Kulüp', 'Kulüp sana para cezası kesti. Gerekçe: "Antrenmanda yeterince terlemedi." Menajerin "Böyle bir saçmalık görmedim" diyor.', [
      O('Cezayı öde, sus', 'sessiz', { para: '-w0.5', disiplin: 2 }, 'Ertesi gün antrenmanda iki kat terledin.'),
      O('Federasyona itiraz et', 'sert', { 'r.baskan': -6, 'takipci%': 2 }, 'Haber her yerde. Ceza geri alındı ama başkan seni unutmayacak.')], once),
    card('dis_trafik_gecikme', {}, 'Antrenman', 'Köprüde kaza vardı, antrenmana yirmi dakika geç kaldın. Kulübün kuralı: dakika başı ceza.', [
      O('Cezayı kabul et', 'saygili', { para: '-w0.2', 'r.hoca': 1 }, 'Bir dahaki sefere bir saat erken çıkacaksın.'),
      O('Trafik kamerası görüntüsünü göster', 'kurnaz', { 'r.hoca': 2 }, 'Hoca güldü, cezayı sildi.')]),
    card('dis_telefon_toplama', { season: ['>=', 1] }, 'Hoca', 'Yeni kural: kamp otelinde telefonlar hocaya teslim. Takım arkadaşların isyan etmek üzere.', [
      O('Kurala ilk sen uy', 'lider', { 'r.hoca': 5, 's.liderlik': 1, 'r.takim': -2 }, 'Telefonunu teslim edince diğerleri de verdi.'),
      O('İkinci telefonu sakla', 'kurnaz', { 'r.takim': 3, disiplin: -3 }, 'Gece yarısı ışığı yandı. Malzemeci gördü.')]),
    card('dis_baskan_baskin', { tier: LOW }, 'Başkan', 'Kötü bir yenilginin ardından başkan soyunma odasına daldı, bağırıp çağırdı, masadaki suyu yere attı.', [
      O('Takımı savun', 'lider', { 'r.takim': 6, 'r.baskan': -6, 's.liderlik': 1 }, 'Başkan kapıyı çarparak çıktı. Takım arkasında seni gördü.'),
      O('Sessiz kal', 'sessiz', { mental: -1 }, 'Kaptan konuştu. Sen yere baktın.')]),
    card('dis_top_toplayici', {}, 'Saha kenarı', 'Hoca maçta sinirlenip top toplayıcı çocuğa bağırdı. Çocuk ağlıyor.', [
      O('Maç sonu çocuğa formanı ver', 'duygusal', { 'r.taraftar': 4, 'takipci%': 2, 'r.hoca': -1 }, 'Çocuğun gülümsemesi haftanın fotoğrafı oldu.'),
      O('Karışma', 'sessiz', {}, 'Çocuk akşam haberlerindeydi.')]),
    card('dis_ayakkabi_firlatma', {}, 'Hoca', 'Hoca kenarda sinirlenip ayakkabısını fırlattı. Ayakkabı tam ensene geldi.', [
      O('Ayakkabıyı geri götür', 'esprili', { 'r.hoca': 3, 'takipci%': 3 }, 'Hoca tek ayakkabıyla teşekkür etti.'),
      O('Hakeme göster', 'sert', { 'r.hoca': -5 }, 'Hoca tribüne gönderildi. Sana bir hafta küs.')]),
    card('dis_krampon_rengi', { tier: TOP }, 'Malzemeci', 'Kulübün sponsoru farklı bir marka. Sen kendi pembe kramponlarınla çıktın, kulüp seni kadro dışı bırakmakla tehdit ediyor.', [
      O('Sponsorun kramponunu giy', 'saygili', { 'r.baskan': 2 }, 'Kramponlar biraz sıktı.'),
      O('Kramponunu siyaha boya', 'kurnaz', { 'takipci%': 2, 'r.baskan': 1 }, 'Logoyu kimse göremedi. Malzemeci seni alkışladı.')]),
    card('dis_hoca_kovuldu', { season: ['>=', 1], formBelow: 0 }, 'Kulüp', 'Kötü sonuçların ardından hoca kovuldu. Tesisten çıkarken arabasının yanında seni bekliyor.', [
      O('Teşekkür et, sarıl', 'duygusal', { 'r.hoca': 6, moral: -2 }, 'Hoca: "Sen büyük oyuncu olacaksın, unutma."'),
      O('Uzaktan el salla', 'sessiz', {}, 'Hoca anladı.')], once),
    card('dis_hakem_yorumu_ceza', { stat: { sohret: ['>', 20] } }, 'Federasyon', 'Maç sonu hakemle ilgili söylediğin sözler yüzünden federasyon para cezası verdi. Kulüp cezayı ödemeyi teklif ediyor.', [
      O('Cezayı kendin öde', 'durust', { para: '-w1', 'r.baskan': 3 }, 'Başkan "adam gibi adam" dedi.'),
      O('Kulüp ödesin', 'kacamak', { 'r.baskan': -2 }, 'Muhasebe biraz söylendi.')])
  );

  /* ---------- Soyunma odası ---------- */
  add(
    card('tk_kavga_hastane', { season: ['>=', 1] }, 'Soyunma odası', 'Antrenmanda iki takım arkadaşın kavga etti, biri kafasını dolaba çarpıp hastanelik oldu. Basın olayı soruyor.', [
      O('"Soyunma odasında kalır"', 'sadik', { 'r.takim': 5, 'r.medya': -2 }, 'Takım sana güveniyor.'),
      O('Hastaneye arkadaşını ziyarete git', 'duygusal', { 'r.takim': 4, moral: -1 }, 'İkisini barıştıran sen oldun.')]),
    card('tk_sarki_videosu', { followers: ['>', 5000] }, 'Soyunma odası', 'Galibiyet sonrası soyunma odasında hep birlikte söylediğiniz şarkının videosu yayıldı. Sesin en kötü ses seçildi.', [
      O('Gururla sahiplen', 'esprili', { 'takipci%': 3, 'r.takim': 3 }, 'Bir şarkıcı seni düete çağırdı. Şaka sanıyorsun.'),
      O('Videoyu kaldırttırmaya çalış', 'kacamak', { 'takipci%': 1 }, 'Kaldırılmaya çalışılan video daha çok izlendi.')]),
    card('tk_genc_foto', { season: ['>=', 1] }, 'Sosyal medya', 'Altyapıdan gelen genç oyuncu soyunma odasında çektiği bir videoyu paylaştı. Arkada sen havlu ile dans ediyorsun.', [
      O('Gence nazikçe kuralları anlat', 'lider', { 's.liderlik': 2, 'r.takim': 2 }, 'Genç özür diledi, sana abi gibi bağlandı.'),
      O('Gülerek videoyu sen de paylaş', 'esprili', { 'takipci%': 3, 'r.hoca': -3 }, 'Hoca toplantıda adını anmadan konuştu.')]),
    card('tk_penalti_kavgasi', { pos: ['FV', 'OS'], season: ['>=', 1] }, 'Maç', 'Geçen maçta penaltı kazandık. Sen ve takımın yıldızı topu bırakmadınız. Hakem bekledi, tribün ıslıkladı.', [
      O('Bir dahaki sefere topu bırakacağını söyle', 'mutevazi', { 'r.takim': 4, 'r.hoca': 2 }, 'Kaptan omzuna vurdu.'),
      O('"Penaltıcı benim" de', 'iddiali', { 'r.takim': -4, 't.hirsli': 1 }, 'Hoca penaltı listesini panoya astı. Senin adın ikinci sırada.')]),
    card('tk_lakap', {}, 'Takım arkadaşların', 'Takım arkadaşların sana bir lakap taktı. Sorun şu: lakap "Teyze".', [
      O('Sahiplen', 'esprili', { 'r.takim': 5 }, 'Tribün bile "Teyze" diye bağırmaya başladı.'),
      O('Yeni lakap öner', 'kurnaz', { 'r.takim': 2 }, 'Önerdiğin "Kartal" tutmadı. "Teyze Kartal" oldu.')]),
    card('tk_araba_saka', { lux: ['>=', 1] }, 'Otopark', 'Arabanı tamamen streç filmle sarmışlar. Kaptan masum masum ıslık çalıyor.', [
      O('İntikam planla', 'kurnaz', { 'r.takim': 5, 'r.kaptan': 2, enerji: -3 }, 'Kaptanın kramponlarını jöleye gömdün.'),
      O('Gül ve aç', 'mutevazi', { 'r.takim': 3 }, 'Yarım saat sürdü.')]),
    card('tk_dil_hocasi', { abroad: true }, 'Takım arkadaşın', 'Yerel takım arkadaşın sana her gün antrenmanda üç kelime öğretmeye söz verdi. Bugünkü kelimeler: "acele etme", "sola", "golcü".', [
      O('Defter tut', 'mutevazi', { dil: 4, 'r.takim': 3 }, 'Bir ayda dil gelişti, takım ilişkisi de.'),
      O('Sen de Türkçe öğret', 'esprili', { dil: 2, 'r.takim': 4 }, 'Artık soyunma odasında "maşallah" diyen bir İskoç var.')]),
    card('tk_baba_oldu', {}, 'Takım arkadaşın', '{takimarkadasi} baba oldu! Maçtan sonra gol sevincinde beşik sallama yapmanızı istiyor.', [
      O('Beşik sevinci yap', 'duygusal', { 'r.takim': 4, 'takipci%': 1 }, 'Fotoğraf bebeğin odasına asıldı.'),
      O('Hediye al', 'mutevazi', { 'r.takim': 2, para: '-w0.1' }, 'Bebeğe minik bir forma aldın.')]),
    card('tk_veteran_veda', { season: ['>=', 1] }, 'Kaptan', 'Takımın 36 yaşındaki duayeni son maçına çıktı. Soyunma odasında sana döndü: "Sana bir şey söyleyeceğim."', [
      O('Dinle', 'saygili', { mental: 3, 's.liderlik': 1, 'a.sakinlik': 0.6 }, '"Her maçı son maçın gibi oyna, ama son maçın değilmiş gibi dinlen."'),
      O('Fotoğraf çektir', 'duygusal', { moral: 3 }, 'Fotoğrafı yıllarca telefonunun ekranında taşıdın.')], once),
    card('tk_kart_oyunu', { season: ['>=', 1] }, 'Kamp oteli', 'Kamp gecelerinde oynanan kart oyununda takım arkadaşın büyük paralar kaybediyor. Sana borç sormaya başladı.', [
      O('Kampta kart oyununa son verin', 'lider', { 'r.takim': 2, 's.liderlik': 2, 'r.hoca': 3 }, 'Hoca kuralı onayladı.'),
      O('Borç ver', 'duygusal', { para: '-w0.5' }, 'Bir hafta sonra yine kaybetti.')])
  );

  /* ---------- Taraftar ---------- */
  add(
    card('fan_kuzu', { tier: LOW }, 'Stadyum', 'Bir taraftar uğur getirsin diye kuzusuyla maça geldi. Güvenlik içeri almadı. Taraftar senin adını bağırıyor.', [
      O('Güvenliği ikna et, kuzu saha kenarında izlesin', 'esprili', { 'r.taraftar': 5, 'takipci%': 3 }, 'Kuzu maçı kale arkasından izledi. 2-0 kazandınız. Uğur gerçek.'),
      O('Maç sonu kuzuyla fotoğraf çektir', 'mutevazi', { 'r.taraftar': 3 }, 'Kuzunun adı artık senin adın.')]),
    card('fan_durum', { stat: { sohret: ['>', 15] } }, 'Deplasman', 'Korner kullanırken rakip tribünden üstüne bir dürüm atıldı. Hakem oyunu durdurdu.', [
      O('Dürümü ye', 'esprili', { 'takipci%': 5, 'r.taraftar': 3, 'r.hoca': -1 }, 'Videon haftanın en çok izleneni. Dürümcü sana sponsor olmak istiyor.'),
      O('Hakeme ver, devam et', 'saygili', { 's.sogukkanlilik': 1 }, 'Ortanı yaptın. Dürüm saha kenarında kaldı.')]),
    dm('fan_kupon', { lm: { played: true, res: ['loss', 'draw'] } }, 'Bir taraftar', '"Kardeşim senin yüzünden kuponum yattı! 12 maçın 11’i tutmuştu!" Mesajın sonunda kupon fotoğrafı var.', [
      O('"Bahis oynama kardeşim"', 'sert', { 'r.medya': 2 }, 'Cevabın ekran görüntüsüyle viral oldu.'),
      O('Cevap verme', 'sessiz', {}, 'Mesaj okunmamış kaldı.')]),
    card('fan_evlilik_teklifi', { stat: { sohret: ['>', 20] } }, 'Tribün', 'Maç sonu bir taraftar seni yanına çağırdı: "Sevgilime evlilik teklif edeceğim, yüzüğü sen uzatır mısın?"', [
      O('Uzat', 'duygusal', { 'r.taraftar': 5, 'takipci%': 3 }, '"Evet" dedi! Düğün davetiyesi yolda.'),
      O('"Bu anı sen yaşa"', 'mutevazi', { 'r.taraftar': 2 }, 'Uzaktan alkışladın.')]),
    card('fan_sahaya_giren', { stat: { sohret: ['>', 25] } }, 'Maç', 'Bir taraftar sahaya atladı, sana sarılıp selfie çekmeye çalıştı. Güvenlik koşarak geliyor.', [
      O('Selfie çek, güvenliğe yavaş götürmelerini söyle', 'duygusal', { 'r.taraftar': 4, 'takipci%': 2, 'r.hoca': -1 }, 'Taraftar ceza aldı ama selfie çerçeveli.'),
      O('Kenara çekil', 'sessiz', {}, 'Güvenlik onu yakaladı.')]),
    dm('fan_bebek_adi', { stat: { sohret: ['>', 30] } }, 'Bir taraftar', '"Abi oğluma senin adını koyduk. Bir gün onunla tanışır mısın?" Mesajda yenidoğan bir bebek fotoğrafı.', [
      O('Bebeğe imzalı forma gönder', 'duygusal', { 'r.taraftar': 5, moral: 4 }, 'Aile her yıl doğum gününde formayla fotoğraf atıyor.'),
      O('Kalp gönder', 'mutevazi', { moral: 2 }, 'Bebeğin adı senin adın. İlginç bir his.')]),
    card('fan_beste', { stat: { sohret: ['>', 20] } }, 'Tribün', 'Tribünler senin için yeni bir tezahürat besteledi. Melodi tanıdık geliyor ama sözleri biraz uygunsuz.', [
      O('Tribüne alkışla teşekkür et', 'duygusal', { 'r.taraftar': 6, moral: 4 }, 'Tezahürat bütün ligde söylenmeye başladı.'),
      O('Sözleri değiştirmelerini rica et', 'saygili', { 'r.taraftar': 1, 'r.medya': 2 }, 'Yeni sözler daha masum. Ama daha az kafiyeli.')]),
    card('fan_kapi_onu', { tier: TOP, lm: { played: true, res: 'loss' } }, 'Ev', 'Ağır yenilgiden sonra gece yarısı bir grup öfkeli taraftar evinin önüne geldi. Komşular pencerede.', [
      O('Aşağı in, konuş', 'iddiali', { 'r.taraftar': 3, mental: -3 }, 'Konuştunuz. Bir kısmı sana hak verdi, bir kısmı bağırmaya devam etti.'),
      O('Kulüp güvenliğini ara', 'saygili', { mental: -2 }, 'Güvenlik geldi, kalabalık dağıldı.')], { rep: 200 }),
    card('fan_kartal', { tier: TOP }, 'Stadyum', 'Kulübün maç öncesi stadın üstünde uçan kartal maskotu bugün uçmayı reddetti, senin omzuna kondu.', [
      O('Sakince yürü', 'sessiz', { 'takipci%': 4, 'r.taraftar': 4 }, 'Kartal seni kale çizgisine kadar taşıttı. Taraftar bunu uğur saydı.'),
      O('Paniğe kapıl', 'esprili', { 'takipci%': 5 }, 'Koşarken kartal kanat çırptı. Video dünya çapında izlendi.')], once),
    card('fan_eski_bayrak', { season: ['>=', 2] }, 'Taraftar', 'Yaşlı bir taraftar 1980’lerden kalma yırtık bir kulüp bayrağını imzalamanı istiyor. "Bunu oğluma bırakacağım."', [
      O('İmzala, sohbet et', 'duygusal', { 'r.taraftar': 5, mental: 2 }, 'Sana kulübün eski hikâyelerini anlattı.'),
      O('İmzala ve geç', 'mutevazi', { 'r.taraftar': 2 }, 'Teşekkür ederken eli titriyordu.')]),
    card('fan_otobus_tas', { tier: TOP, stat: { sohret: ['>', 15] } }, 'Deplasman', 'Deplasman yolunda takım otobüsüne taş atıldı, cam kırıldı. Kimse yaralanmadı ama herkes korktu.', [
      O('Takım arkadaşlarını sakinleştir', 'lider', { 'r.takim': 4, 's.liderlik': 1, mental: -1 }, 'Maçta takım birbirine kenetlendi.'),
      O('Kınama mesajı paylaş', 'sert', { 'r.medya': 2 }, 'Federasyon soruşturma başlattı.')], { rep: 200 })
  );

  /* ---------- Medya ve sosyal medya ---------- */
  add(
    card('md_eski_tweet_hoca', { followers: ['>', 15000], minAge: 20 }, 'Sosyal medya', 'Yıllar önce şimdiki hocan hakkında yazdığın bir tweet bulundu: "Bu adam futboldan hiç anlamıyor." Hoca da gördü.', [
      O('Hocadan şahsen özür dile', 'saygili', { 'r.hoca': 4 }, 'Hoca güldü: "Haklıydın belki de."'),
      O('"Hesabım çalınmıştı" de', 'yalan', { 'r.hoca': -3, 'r.medya': -3 }, 'Hesabın 2014’te çalınmış. İnandırıcı değil.')]),
    card('md_mavi_tik', { followers: ['>', 50000] }, 'Sosyal medya', 'Hesabının taklitleri çoğaldı. Takım arkadaşın "Sosyal medya patronundan herkesin önünde mavi tik iste" diye kışkırtıyor.', [
      O('Herkesin önünde iste', 'esprili', { 'takipci%': 4 }, 'Cevap gelmedi ama paylaşımın milyonlarca kez görüldü.'),
      O('Normal başvuru yap', 'kacamak', {}, 'Üç hafta sonra tik geldi.')]),
    card('md_taklitci', { stat: { sohret: ['>', 30] } }, 'Emniyet', 'Senin kılığına girip gece kulüplerinde masa hesabı açtıran bir adam yakalandı. Polis ifadeni istiyor.', [
      O('İfade ver, olayı paylaş', 'esprili', { 'takipci%': 3, 'r.medya': 1 }, 'Taklitçinin seni hiç benzemediği ortaya çıktı.'),
      O('Avukatla ilgilen', 'kacamak', { para: '-w0.2' }, 'Konu sessizce kapandı.')]),
    card('md_heykel', { stat: { sohret: ['>', 40] } }, '{memleket}', 'Memleketinde senin heykelini diktiler. Sorun şu: heykel sana hiç benzemiyor, daha çok bir şarkıcıya benziyor.', [
      O('Heykelle poz ver', 'esprili', { 'takipci%': 5, 'r.memleket': 4 }, 'Heykelin yanında poz verdiğin fotoğraf yılın capsi oldu.'),
      O('Belediyeye kibarca düzeltme iste', 'saygili', { 'r.memleket': 2 }, 'Yeni heykel yapılıyor. Biraz daha benziyor.')], once),
    card('md_yemek_yorum', { followers: ['>', 10000] }, 'Sosyal medya', 'Paylaştığın akşam yemeği fotoğrafının altına "bu ne biçim yemek" yorumları yağdı. Fotoğrafta sadece bamya var.', [
      O('Bamya tarifiyle cevap ver', 'esprili', { 'takipci%': 3 }, 'Tarifini yüz bin kişi kaydetti.'),
      O('Fotoğrafı sil', 'kacamak', {}, 'Ekran görüntüleri kaldı.')]),
    card('md_bandaj_logo', { tier: TOP }, 'Federasyon', 'Federasyon saç bandındaki küçük logo yüzünden "gizli reklam" incelemesi başlattı. Bandı kuzenin hediye etmişti.', [
      O('Bandı çıkar', 'saygili', {}, 'Saçın gözüne giriyor ama sorun çözüldü.'),
      O('Kuzeninin mağazasını tanıt', 'esprili', { 'takipci%': 2, para: '-w0.2' }, 'Para cezası geldi. Kuzeninin mağazası patladı.')]),
    card('md_mikrofon', { stat: { sohret: ['>', 15] } }, 'Yayıncı kuruluş', 'Maç sırasında söylediğin bir küfür açık mikrofona yakalandı ve canlı yayında duyuldu.', [
      O('Özür dile', 'saygili', { 'r.medya': 2 }, 'Özür kabul edildi. Annen de aradı.'),
      O('"Futbolda olur"', 'sert', { 'r.medya': -3, 'takipci%': 1 }, 'RTÜK benzeri bir kurul kulübe uyarı verdi.')]),
    card('md_belgesel', { tier: TOP, season: ['>=', 1] }, 'Kulüp', 'Bir dijital platform kulübün sezonunu belgesel olarak çekiyor. Kameralar soyunma odasında bile.', [
      O('Kameraya doğal davran', 'sosyal', { 'takipci%': 4, sohret: 1 }, 'Belgeselin en sevilen karakteri sen oldun.'),
      O('Kameradan kaç', 'sessiz', {}, 'Belgeselde sadece sırtın göründü.')], once),
    card('md_oyun_puani', { followers: ['>', 10000] }, 'Oyun şirketi', 'Popüler futbol video oyununun yeni sürümünde puanın beklediğinden çok düşük. Takipçilerin şirketi etiketliyor.', [
      O('"Sahada göstereceğim" de', 'iddiali', { form: 1, 'takipci%': 2 }, 'Sezon ortası güncellemesinde puanın arttı.'),
      O('Oyun şirketini sert eleştir', 'sert', { 'takipci%': 3, 'r.medya': -1 }, 'Şirket "hızına bakın" diye cevap verdi.')]),
    card('md_yapay_sarki', { stat: { sohret: ['>', 25] } }, 'Sosyal medya', 'Birisi yapay zekâyla senin sesinle bir arabesk şarkı yaptı. Şarkı listelerde 40. sırada.', [
      O('Şarkıyı paylaş', 'esprili', { 'takipci%': 4 }, 'Takım otobüsünde her deplasmanda çalınıyor.'),
      O('Kaldırılmasını iste', 'sert', { 'r.medya': 1 }, 'Kaldırıldı. Ama herkes indirmişti.')]),
    card('md_unlu_sef', { stat: { sohret: ['>', 35] }, money: ['>', 300000] }, 'Ünlü restoran', 'Ünlü bir şef seni altın varaklı et yemeğine davet etti. Videoyu çekmek istiyor. Taraftarlar kötü giden sezonda bunu hoş karşılamayabilir.', [
      O('Git, video çekilsin', 'gosteris', { 'takipci%': 3, 'r.taraftar': -5, 't.gosteris': 0.5 }, 'Video çok izlendi. Taraftar kızgın.'),
      O('Kibarca reddet', 'mutevazi', { 'r.taraftar': 1 }, 'Şef başka birini davet etti. O da eleştirildi.')]),
    card('md_spiker_isim', {}, 'Yayıncı kuruluş', 'Maçların spikeri adını sürekli yanlış söylüyor. Bu hafta üç farklı şekilde telaffuz etti.', [
      O('Spikere video mesaj at', 'esprili', { 'takipci%': 2, 'r.medya': 2 }, 'Spiker canlı yayında özür diledi ve yine yanlış söyledi.'),
      O('Önemseme', 'sessiz', {}, 'Annen önemsedi ama.')]),
    card('md_yanlis_foto', { stat: { sohret: ['>', 10] } }, 'Televizyon', 'Akşam haberlerinde senin yerine başka bir oyuncunun fotoğrafı gösterildi. Üstelik rakip takımdan biri.', [
      O('Esprili bir paylaşım yap', 'esprili', { 'takipci%': 2 }, 'İkiniz de güldünüz. Rakip oyuncu seni takip etti.'),
      O('Kanaldan düzeltme iste', 'saygili', { 'r.medya': 1 }, 'Ertesi gün düzeltme yaptılar. Yine yanlış fotoğrafla.')])
  );

  /* ---------- Sahadaki tuhaflıklar ---------- */
  add(
    card('mac_buyu', { tier: LOW }, 'Maç', 'Rakip takımın oyuncuları maç öncesi orta yuvarlakta tuhaf bir ritüel yaptı: tuz serptiler, dua okudular.', [
      O('Tuzu süpür', 'esprili', { 'takipci%': 3, 'r.taraftar': 3 }, 'Hakem ikinize de sarı kart gösterdi. Olay viral.'),
      O('Umursama', 'sessiz', { 's.sogukkanlilik': 1 }, 'Maçı kazandınız. Tuz işe yaramadı.')]),
    card('mac_ari', {}, 'Maç', 'Maç ortasında bir arı sürüsü sahaya indi. Oyuncular yere yattı, hakem oyunu durdurdu.', [
      O('Yere yat', 'saygili', {}, 'Arılar on dakika sonra gitti. Kimse sokulmadı.'),
      O('Koşarak kaç', 'esprili', { 'takipci%': 3, saglik: -1 }, 'İki yerinden sokuldun. Video uzun süre konuşulacak.')]),
    card('mac_hayalet_gol', { tier: LOW, pos: ['FV', 'OS'] }, 'Maç', 'Kafa vuruşun çizgiyi yarım metre geçti ama hakem görmedi. Bu ligde gol çizgisi teknolojisi yok.', [
      O('Hakeme sakince itiraz et', 'saygili', { 's.sogukkanlilik': 1 }, 'Hakem "Görmedim, üzgünüm" dedi. Dürüst ama faydasız.'),
      O('Çılgınca itiraz et', 'sert', { 'r.hoca': 1, disiplin: -2 }, 'Sarı kart gördün. Video federasyonun gündeminde.')]),
    card('mac_sort_yirtik', {}, 'Maç', 'Kayarak müdahalede şortun yırtıldı. Malzemeci yedek şort bulamıyor, maç devam ediyor.', [
      O('Takım arkadaşının yedeğini giy', 'esprili', { 'takipci%': 2 }, 'Şort iki beden büyüktü. Tribün güldü.'),
      O('Yırtık şortla devam et', 'iddiali', { 'takipci%': 3, 'r.hoca': -1 }, 'İlk yarı böyle bitti. Fotoğraflar kötü.')]),
    card('mac_kulak_pamuk', {}, 'Kulüp doktoru', 'Kulağına tıkadığın pamuk içeri kaçtı. Doktor çıkarmaya çalışırken soyunma odası kahkahaya boğuldu.', [
      O('Kahkahaya katıl', 'esprili', { 'r.takim': 3, saglik: -1 }, 'Pamuk çıktı. Hikâye bütün sezon anlatıldı.'),
      O('Hastaneye git', 'saygili', { saglik: 1 }, 'Hemşire de güldü.')]),
    card('mac_sis', { tier: LOW }, 'Maç', 'Maç sırasında yoğun sis çöktü. Kaleden kaleyi görmek imkânsız. Hakem devam diyor.', [
      O('Kısa paslarla oyna', 'saygili', { form: 1 }, 'Sis içinde iki pas, bir gol. Kimse görmedi ama oldu.'),
      O('Hakeme maçı durdurmasını söyle', 'sert', { 'r.hoca': -1 }, 'Maç yirmi dakika sonra tatil edildi.')]),
    card('mac_kar', { week: [16, 28] }, 'Maç', 'Kar yağıyor, top turuncu. Saha beyaz örtüyle kaplı.', [
      O('Uzun çorap ve eldivenle oyna', 'saygili', { saglik: 1 }, 'Soğuktan elini hissetmedin ama oynadın.'),
      O('Kısa kollu çık', 'iddiali', { 'takipci%': 2, saglik: -3 }, 'Tribünler seni alkışladı. Ertesi gün burnun aktı.')]),
    card('mac_lazer', { tier: TOP, stat: { sohret: ['>', 20] } }, 'Maç', 'Rakip tribünden yüzüne lazer tutuluyor. Gözlerin yanıyor.', [
      O('Hakeme göster', 'saygili', { 'r.medya': 2 }, 'Spiker anons yaptırdı. Lazer bitti.'),
      O('Elini gözüne siper et, devam et', 'sessiz', { 's.sogukkanlilik': 1 }, 'Lazer bitmedi ama sen de durmadın.')]),
    card('mac_top_patladi', {}, 'Maç', 'Şut çektin ve top havada patladı. Kaleci patlak topu tuttu.', [
      O('Hakemden tekrar iste', 'esprili', { 'takipci%': 2 }, 'Hakem hakem topuyla yeniden başlattı.'),
      O('Gül', 'mutevazi', {}, 'Topun parçası hâlâ fileye takılı.')]),
    card('mac_hakem_sakat', {}, 'Maç', 'Hakem koşarken kas sakatlığı yaşadı. Dördüncü hakem çıktı ama ilk maçı.', [
      O('Hakemin kalkmasına yardım et', 'duygusal', { 'r.medya': 2 }, 'Sportmen tavrın konuşuldu.'),
      O('Takım arkadaşlarına "sakin olun" de', 'lider', { 's.liderlik': 1 }, 'Yeni hakem maçı sakin bitirdi.')]),
    card('mac_cizgi_kurtaris', { pos: ['DF', 'OS'] }, 'Maç', 'Boş kaleye giden topu çizgi üzerinden yüzünle çıkardın. Burnun kanıyor ama skor 0-0.', [
      O('Kalk ve devam et', 'iddiali', { 'r.taraftar': 6, saglik: -3, 'r.takim': 3 }, 'Tribün adını bağırdı. Burnun yamuk ama kahramansın.'),
      O('Kenara çık, tedavi ol', 'saygili', { saglik: 1 }, 'Pamukla burnunla geri döndün.')])
  );

  /* ---------- Hayat ---------- */
  add(
    card('hy_lux_kaza', { lux: ['>=', 2] }, 'Polis', 'Tatil sabahı yeni aldığın spor araba buzlu yolda kaydı, bir bahçe duvarına çarptın. Kimse yaralanmadı. Maç akşam.', [
      O('Duvar sahibine yeni duvar sözü ver, maça çık', 'durust', { para: '-w1', 'r.medya': 2 }, 'Doksan dakika oynadın. Duvar sahibi seni tribünden izledi.'),
      O('Arabayı kulübe çektir, kimse duymasın', 'kacamak', { para: '-w1.5', 'r.medya': -2 }, 'Komşunun kamerası her şeyi çekmişti.')]),
    card('hy_komsu', {}, 'Komşu', 'Komşu kapıya dayandı: "Gece ikide oyun oynarken bağırıyorsun, bebeğimiz uyanıyor!"', [
      O('Özür dile, kulaklık al', 'saygili', { disiplin: 2, enerji: 2 }, 'Komşu artık maçlarda seni destekliyor.'),
      O('Bebeğe forma hediye et', 'duygusal', { 'r.memleket': 1 }, 'Komşu güldü ama yine de sessiz ol dedi.')]),
    card('hy_tasinma', { money: ['>', 100000] }, 'Nakliyeci', 'Taşınma günü. Nakliyeciler seni tanıyınca koliyi bırakıp fotoğraf çektirmeye başladı.', [
      O('Fotoğraf çek, sonra yardım et', 'sosyal', { enerji: -6, 'r.memleket': 1 }, 'Koliler akşama kadar taşındı. Bir tabak kırıldı.'),
      O('Profesyonel firma kuralı: önce iş', 'saygili', {}, 'Her şey sorunsuz bitti.')]),
    card('hy_tatil_paparazzi', { stat: { sohret: ['>', 40] } }, 'Magazin', 'Tatilde göbeğinin göründüğü bir fotoğraf "Formsuz {ad}" başlığıyla yayınlandı.', [
      O('Karın kası fotoğrafı paylaş', 'iddiali', { 'takipci%': 3 }, 'İki hafta önce çekilmişti. Kimse fark etmedi.'),
      O('"Tatildeyim, dinleniyorum"', 'esprili', { 'r.medya': 1 }, 'Herkes güldü.')]),
    card('hy_jetski', { week: [1, 3] }, 'Tatil', 'Sezon öncesi tatilin son günü arkadaşların jet-ski yarışı teklif ediyor. Sözleşmende tehlikeli spor yasağı var.', [
      O('Yarış', 'iddiali', { moral: 4 }, 'Dalga çok büyüktü.', { chk: { s: 'sogukkanlilik', d: 40 }, ok: { r: 'Kazandın ve kimse görmedi.' }, no: { r: 'Düştün, omzun burkuldu.', fx: { do: 'injure:1', 'r.hoca': -4 } } }),
      O('Kenardan izle', 'saygili', { disiplin: 2 }, 'Arkadaşın düştü. İyi ki binmemişsin.')]),
    card('hy_dovme', { minAge: 19 }, 'Dövmeci', 'Kolunda ilk dövme için randevun var. Takım arkadaşları "maç haftası dövme uğursuzluktur" diyor.', [
      O('Annenin adını yaptır', 'duygusal', { 'r.anne': 5, moral: 2 }, 'Annen ağladı, sonra kızdı, sonra yine ağladı.'),
      O('Formanın numarasını yaptır', 'iddiali', { moral: 3 }, 'Numaranı değiştirmemelisin artık.'),
      O('Vazgeç', 'kacamak', {}, 'Randevuyu iptal ettin.')]),
    card('hy_sac_ekimi', { minAge: 27 }, 'Sosyal medya', 'Saç çizgin biraz geriledi ve sosyal medya fark etti. Bir klinik "ücretsiz saç ekimi, karşılığında reklam" teklif ediyor.', [
      O('Kabul et', 'gosteris', { 'takipci%': 2, moral: 2, para: 'w0.5' }, 'Bir ay bere taktın. Sonuç gayet iyi.'),
      O('Kel olmaya hazırım', 'esprili', { 's.karizma': 1 }, 'Bir sonraki sezon kafanı kazıttın. Yakıştı.')]),
    card('hy_dis', { money: ['>', 200000], stat: { sohret: ['>', 15] } }, 'Diş kliniği', 'Bir klinik "Hollywood gülüşü" yapmak istiyor. Fotoğraflarda dişlerin çok beyaz görünecek.', [
      O('Yaptır', 'gosteris', { para: '-w0.5', 's.karizma': 1 }, 'Gülüşün flaşları yansıtıyor.'),
      O('Kendi dişlerim güzel', 'mutevazi', {}, 'Annen de öyle diyor.')]),
    card('hy_yemek_programi', { stat: { sohret: ['>', 35] } }, 'Televizyon', 'Bir yemek yarışması seni ünlüler bölümüne çağırıyor. Yemek yapmayı bilmiyorsun.', [
      O('Katıl', 'esprili', { 'takipci%': 4, para: 'w0.5', 'r.hoca': -1 }, 'Mantını jüri "çiğ" buldu. Ama en çok oyu sen aldın.'),
      O('Reddet', 'kacamak', {}, 'Takım arkadaşın gitti, kazandı.')]),
    card('hy_okul', { maxAge: 22 }, 'Annen', 'Annen açık liseyi bitirmen için kayıt yaptırdı. "Futbol bir gün biter oğlum."', [
      O('Derslere çalış', 'mutevazi', { mental: 2, 's.konusma': 1, enerji: -3, 'r.anne': 5 }, 'Matematik sınavından 70 aldın. Annen gururlu.'),
      O('"Şimdi değil anne"', 'kacamak', { 'r.anne': -3 }, 'Annen kayıt parasını boşa ödedi.')]),
    card('hy_kitap', { stat: { sohret: ['>', 50] }, minAge: 24 }, 'Yayınevi', 'Bir yayınevi otobiyografini yazmak istiyor. Yazarı onlar bulacak, sen anlatacaksın.', [
      O('Kabul et, her şeyi anlat', 'durust', { para: 'w2', 'r.medya': 3, 'r.hoca': -2 }, 'Kitap çok sattı. Birkaç eski hocan biraz kırıldı.'),
      O('Kabul et, güzel şeyleri anlat', 'saygili', { para: 'w1', 'r.medya': 1 }, 'Kitap fena değil. Biraz sıkıcı.'),
      O('Daha erken', 'mutevazi', {}, 'Önce kariyer, sonra kitap.')], once)
  );

  /* ---------- Para ---------- */
  add(
    card('pr_dijital_kart', { followers: ['>', 50000] }, '{menajer}', 'Bir şirket senin dijital koleksiyon kartlarını satmak istiyor. "Taraftarların seni dijital olarak sahiplenebilir."', [
      O('Kabul et', 'paragoz', { para: 'w1', 'r.taraftar': -2 }, 'Kartların ilk hafta tükendi, ikinci hafta değeri yarıya düştü.'),
      O('Reddet', 'kacamak', {}, 'Takım arkadaşın kabul etti, pişman oldu.')]),
    card('pr_doner', { stat: { sohret: ['>', 30] }, money: ['>', 500000] }, 'Yatırımcı', 'Bir döner zinciri adını kullanmak istiyor: "{soyad} Döner". Ortaklık teklif ediyorlar.', [
      O('Ortak ol', 'iddiali', { para: '-w3', 'r.memleket': 3 }, 'İlk şube açıldı. Kuyruk vardı.', { fx: { seed: [{ id: 'pr_doner_sonuc', in: [8, 16], p: 1 }] } }),
      O('Sadece adını kirala', 'kacamak', { para: 'w0.5' }, 'Dönerin tadı kötüyse senin adın kötü.')]),
    card('pr_doner_sonuc', {}, 'Yatırımcı', '"{soyad} Döner" altı aylık rapor geldi.', [
      O('Raporu aç', 'saygili', {}, 'Rakamlara baktın.', { chk: { s: 'kurnazlik', d: 30 }, ok: { r: 'Üç şube daha açılıyor. Paran üçe katlandı.', fx: { para: 'w8' } }, no: { r: 'Zincir battı. Adın hâlâ tabelada.', fx: { moral: -3 } } })], { chain: true }),
    card('pr_espor', { money: ['>', 2000000], maxAge: 30 }, 'Arkadaşın', 'Bir arkadaşın e-spor takımı kuruyor, ortak olmanı istiyor. Takımın adı senin numaranı taşıyacak.', [
      O('Yatırım yap', 'iddiali', { para: '-w4', 'takipci%': 3 }, 'Takımın ilk turnuvada ikinci oldu.'),
      O('Hayır', 'kacamak', {}, 'Takım bir yıl sonra dağıldı.')]),
    card('pr_kacak_bahis', { stat: { sohret: ['>', 20] } }, 'Bilinmeyen numara', 'Yasa dışı bir bahis sitesi reklamda oynaman için yüklü bir para teklif ediyor. "Kimse bilmez" diyorlar.', [
      O('Reddet ve şikâyet et', 'durust', { 'r.medya': 3, 't.durust': 1 }, 'Site kapatıldı.'),
      O('Reddet', 'kacamak', {}, 'Numara bir daha aramadı.')]),
    card('pr_dubai_ev', { money: ['>', 3000000] }, 'Emlakçı', 'Bir emlakçı "Dubai’de havuzlu villa, iki yılda yüzde 40 kazanç" diye yazdı. Broşür çok parlak.', [
      O('Yatırım yap', 'iddiali', { para: '-w8' }, 'Tapu geldi.', { fx: { seed: [{ id: 'pr_dubai_sonuc', in: [20, 40], p: 1 }] } }),
      O('Muhasebecine sor', 'saygili', {}, 'Muhasebecin "acele etme" dedi.')]),
    card('pr_dubai_sonuc', {}, 'Emlakçı', 'Dubai’deki villanın değerlemesi geldi.', [
      O('Bak', 'saygili', {}, 'Rakamlara baktın.', { chk: { s: 'kurnazlik', d: 40 }, ok: { r: 'Villa yüzde 35 değerlendi. Satıp kâr ettin.', fx: { para: 'w11' } }, no: { r: 'İnşaat bitmemiş. Paranın yarısı gitti.', fx: { para: 'w4', moral: -4 } } })], { chain: true }),
    card('pr_menajer_komisyon', { agent: true, season: ['>=', 2] }, 'Muhasebeci', 'Muhasebecin fark etti: menajerin son transferde sözleşmede yazandan fazla komisyon almış.', [
      O('Menajerle yüzleş', 'sert', { 'r.menajer': -10 }, 'Menajer farkı iade etti ama arkadaşlığınız bitti.', { fx: { para: 'w1' } }),
      O('Menajeri kov', 'sert', { do: 'fireAgent', para: 'w1' }, 'Yeni bir menajer bulacaksın.'),
      O('Görmezden gel', 'sessiz', { 'r.menajer': 2 }, 'Menajer bir şey olmamış gibi davrandı.')], once),
    card('pr_afet_bagis', { minAge: 20, money: ['>', 300000] }, 'Kulüp', 'Ülkede büyük bir afet yaşandı. Kulüp oyuncuları yardım kampanyası başlatıyor.', [
      O('Bir aylık maaşını bağışla', 'duygusal', { para: '-w4', 'r.taraftar': 6, mental: 2 }, 'Kampanya bir gecede büyüdü. Bağışın binlerce kişiye ulaştı.'),
      O('Yardım tırına gönüllü git', 'mutevazi', { enerji: -10, 'r.memleket': 4, mental: 3 }, 'İki gün koli taşıdın. Kimse futbolcu olduğunu sormadı.')], once)
  );

  /* ---------- Milli takım ---------- */
  add(
    dm('ml_sahte_cagri', { caps: ['<', 1], maxAge: 23 }, 'Bilinmeyen numara', '"Milli takım aday kadrosuna çağrıldınız, lütfen pasaport bilgilerinizi gönderin." Mesaj biraz garip.', [
      O('Kulübe sor', 'saygili', { 's.kurnazlik': 1 }, 'Dolandırıcılıkmış. Kulüp herkesi uyardı.'),
      O('Takım arkadaşına sor', 'sosyal', {}, 'Kanka gülmekten yerlere yattı: "Ben attım kanka!"')]),
    card('ml_horlama', { caps: ['>', 0] }, 'Milli takım kampı', 'Kamptaki oda arkadaşın deli gibi horluyor. Üç gecedir uyuyamıyorsun.', [
      O('Oda değiştir', 'kacamak', { enerji: 4 }, 'Yeni oda arkadaşın da horluyor.'),
      O('Kulak tıkacı al', 'saygili', { enerji: 3 }, 'Pamuk değil, kulak tıkacı. Ders alındı.')]),
    card('ml_mars', { caps: ['>', 0] }, 'Stadyum', 'İstiklal Marşı çalarken tribünde annenle babanı gördün. Gözlerin doldu.', [
      O('Bırak aksın', 'duygusal', { moral: 5, 'r.aile': 4 }, 'O kare gazetelerin ilk sayfasındaydı.')], once),
    card('ml_forma_talebi', { caps: ['>', 0] }, 'Akrabalar', 'Bütün akrabalar milli takım forması istiyor. Liste 34 kişiye ulaştı.', [
      O('Hepsine al', 'duygusal', { para: '-w0.5', 'r.aile': 4 }, 'Bayram fotoğrafında herkes kırmızı-beyaz.'),
      O('Sadece anne ve babana', 'kacamak', { 'r.aile': -1 }, 'Teyzen gruptan çıktı.')]),
    card('ml_ucus', { caps: ['>', 0], abroad: true }, 'Havalimanı', 'Milli maç için on iki saatlik uçuş. Dönüşte kulübünde hemen maç var.', [
      O('Uçakta uyu', 'saygili', { enerji: -6 }, 'Sekiz saat uyudun. Boynun tutuldu.'),
      O('Uçakta film izle', 'kacamak', { enerji: -12 }, 'Dönüşte maçta yorgundun.')])
  );

  /* ---------- Aşk ve aile ---------- */
  add(
    card('pt_ilk_bulusma_foto', { partner: 'any', stat: { sohret: ['>', 30] } }, 'Magazin', 'Partnerinle bir kafede çekilmiş fotoğrafın magazin sayfalarında. "Gizli aşk" başlığı atılmış.', [
      O('İlişkiyi açıkla', 'durust', { 'r.partner': 6, 'takipci%': 2 }, 'Partnerin mutlu. Takipçilerin daha da mutlu.'),
      O('Yorum yapma', 'sessiz', { 'r.partner': -3 }, 'Partnerin "neden saklıyoruz" diye sordu.')]),
    card('pt_ayrilik_soylenti', { partner: [2, 3, 4], stat: { sohret: ['>', 30] } }, 'Magazin', 'Partnerin seni sosyal medyada takipten çıkardı mı? Sayfalar "ayrıldılar" diye yazıyor. Aslında telefonu bozulmuş.', [
      O('Birlikte fotoğraf paylaşın', 'esprili', { 'r.partner': 4, 'takipci%': 2 }, 'Söylenti bir saatte bitti.'),
      O('Umursamayın', 'sessiz', { 'r.partner': 1 }, 'Söylenti bir hafta sürdü.')]),
    card('pt_yildonumu', { partner: [2, 3, 4, 5] }, '{partner}', 'Yıldönümünüz ama aynı gün deplasman var. {partner} sessiz.', [
      O('Sürpriz video hazırla', 'duygusal', { 'r.partner': 6, para: '-w0.1' }, 'Videoyu izlerken ağladı.'),
      O('Maçtan sonra kutlarız', 'kacamak', { 'r.partner': -3 }, 'Kutlama iki hafta sonra oldu.')]),
    card('pt_rakip_aile', { partner: [2, 3, 4] }, '{partner}', '{partner}’in ailesiyle ilk akşam yemeği. Babası ezeli rakip kulübün koyu taraftarı ve kapıyı rakip formayla açtı.', [
      O('Gülerek el sık', 'esprili', { 'r.partner': 5 }, 'Yemeğin sonunda baba seni maça davet etti. Rakip tribüne.'),
      O('Futbol konuşmamaya çalış', 'saygili', { 'r.partner': 3 }, 'Baba her lafı futbola getirdi.')], once),
    card('ai_baba_kulup', { hasRole: 'baba', season: ['>=', 1] }, 'Baban', 'Baban hayatı boyunca tuttuğu kulübe imza atmanı istiyor: "Ölmeden seni o formayla göreyim."', [
      O('"Söz baba, bir gün"', 'duygusal', { 'r.baba': 8 }, 'Baban kulüp atkısını odana astı.'),
      O('"Kariyerimi duygularla yönetemem"', 'sert', { 'r.baba': -5 }, 'Baban bir süre maçlarını izlemedi.')]),
    card('ai_kardes_tiktok', { hasRole: 'kardes', followers: ['>', 5000] }, '{kardesi}', '{kardesi} seninle ilgili gizli videolar paylaşmaya başladı: uyurken, yemek yerken, annene azar yerken. Takipçisi seninkini geçti.', [
      O('Videolara katıl', 'esprili', { 'r.kardes': 6, 'takipci%': 3 }, 'İkiniz birlikte ünlü oldunuz.'),
      O('Kardeşine kızıp sildirt', 'sert', { 'r.kardes': -5 }, 'Kardeşin bir hafta konuşmadı.')]),
    card('ai_anne_tribun', { hasRole: 'anne', stat: { sohret: ['>', 15] } }, 'Tribün', 'Annen tribünde sana küfreden bir taraftarla tartışmaya girmiş. Görüntüler televizyonda.', [
      O('Annenle gurur duy', 'duygusal', { 'r.anne': 6, 'takipci%': 3 }, 'Annen "kimse oğluma laf edemez" diye manşet oldu.'),
      O('Annene ev rahatında izlemesini söyle', 'saygili', { 'r.anne': -2 }, 'Annen biraz kırıldı ama haklısın dedi.')]),
    card('ai_dede_tavsiye', { minAge: 18 }, 'Deden', 'Deden telefonda eski usul tavsiyeler veriyor: "Maçtan önce bir kaşık bal ye, rakibin gözüne bakma, sağ ayakla sahaya gir."', [
      O('Hepsini uygula', 'duygusal', { moral: 3, 'r.aile': 2 }, 'Kazandınız. Deden "Ben söylemiştim" dedi.'),
      O('Teşekkür et', 'mutevazi', { 'r.aile': 1 }, 'Deden yine de aradı.')])
  );

  /* ---------- Memleket ---------- */
  add(
    card('mk_yerel_tv', { stat: { sohret: ['>', 10] } }, '{memleket} TV', 'Memleketin yerel kanalı canlı yayında seni bağladı. Spiker memleket ağzıyla konuşuyor, sen de ağzın kaydı.', [
      O('Memleket ağzıyla devam et', 'duygusal', { 'r.memleket': 6, 'takipci%': 2 }, 'Memlekette bu yayın yıllarca konuşulacak.'),
      O('Standart Türkçeyle konuş', 'kacamak', { 'r.memleket': -1 }, 'Bir amca "unuttu bizi" dedi.')]),
    card('mk_dua', { stat: { sohret: ['>', 20] } }, '{memleket}', 'Kritik maç öncesi memleketindeki herkes kahvede toplanmış, maçını izlemek için dev ekran kurmuşlar.', [
      O('Görüntülü bağlan', 'duygusal', { 'r.memleket': 6, moral: 5 }, 'Kahvede alkış koptu.'),
      O('Maçtan sonra kahveye video gönder', 'mutevazi', { 'r.memleket': 3 }, 'Video kahvenin duvarına yansıtıldı.')]),
    card('mk_eski_hoca', { minAge: 20 }, 'Çocukluk hocan', 'Mahalle takımındaki ilk hocan hastanede. Seni görmek istiyor.', [
      O('Ziyaret et', 'duygusal', { mental: 3, 'r.memleket': 4, enerji: -6 }, 'Seni görünce doğruldu: "Ben demiştim bu çocuk olacak."'),
      O('Hastane masraflarını karşıla', 'saygili', { para: '-w1', 'r.memleket': 3 }, 'Ailesi teşekkür mektubu yazdı.')], once),
    card('mk_sokak_adi', { stat: { sohret: ['>', 60] } }, 'Belediye', 'Doğduğun sokağa senin adın verildi. Tabelada adın yanlış yazılmış.', [
      O('Yanlış tabelayla fotoğraf çektir', 'esprili', { 'takipci%': 3, 'r.memleket': 5 }, 'Belediye tabelayı ertesi gün değiştirdi.'),
      O('Açılışa git', 'duygusal', { 'r.memleket': 8, moral: 4 }, 'Çocukluk arkadaşların açılıştaydı.')], once)
  );

  // seçenek düzeyinde yazılan fx eklerini birleştir (ör. { fx: { seed } })
  E.forEach((e) => [].concat(e.o || [], ...Object.values(e.nodes || {}).map((n) => n.o || [])).forEach((o) => {
    if (o && o.seed) { o.fx = Object.assign({}, o.fx, { seed: o.seed }); delete o.seed; }
  }));
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  // Tekrar azaltma: maç öncesi ve sonrası olaylar en az ~iki ayda bir, en sık görülenler sezonda bir kez
  const E = root.F.DATA.events;
  E.filter((e) => e.pre || e.post).forEach((e) => { e.rep = Math.max(e.rep || 0, 24); });
  ['pre_taraftar_otel', 'post_yedek_sinir', 'post_rakip_ozur', 'post_takim_toplanti', 'post_rakip_aglama', 'post_tunel_kavga', 'post_hakem', 'pre_rakip_dm', 'pre_tunel_bakisma'].forEach((id) => { const e = E.find((x) => x.id === id); if (e) e.rep = 34; });
  ['kadrodisi_tribun', 'yedek_hazir_ol', 'yedek_kanka_teselli'].forEach((id) => { const e = E.find((x) => x.id === id); if (e) e.rep = 20; });
})(typeof window !== 'undefined' ? window : globalThis);
