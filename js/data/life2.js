/* FORMA — özel hayat ve ekonomi genişlemesi
   Rutinler (gerçek, görünür haftalık etkiler), yeni etkinlikler, büyüyen mağaza, aylık kişisel gelişim
   abonelikleri ve kampanyaları, yeni kökenler (kulübünü kendin seçtiğin başlangıçlar), mesaj sohbetleri. */
(function (root) {
  const D = root.F.DATA;

  /* ---------- Rutinler: her hafta işler, etkisi hafta özetinde ve Özel Hayat ekranında görünür ---------- */
  D.routines = {
    uyku: { name: 'Uyku düzeni', opts: {
      erken: { name: 'Erken yat', fx: { enerji: 8, form: 0.3, 's.sosyallik': -0.3 }, desc: 'Dinç kalkarsın, sosyal hayat biraz azalır.' },
      normal: { name: 'Normal', fx: {}, desc: 'Ne iyi ne kötü.' },
      gec: { name: 'Geç yat', fx: { enerji: -8, moral: 1.5, disiplin: -0.5 }, desc: 'Gece eğlenceli, sabah antrenman zor.' } } },
    beslenme: { name: 'Beslenme', opts: {
      siki: { name: 'Sıkı diyet', fx: { saglik: 1.5, moral: -1 }, cost: 1500, injMul: 0.9, desc: 'Sakatlık riski azalır, canın tatlı çeker.' },
      normal: { name: 'Normal', fx: {}, desc: 'Annenin yemekleri ve arada bir döner.' },
      serbest: { name: 'Serbest', fx: { moral: 2, saglik: -1.5 }, injMul: 1.1, desc: 'Mutlusun ama vücut hesabını sorar.' } } },
    kosu: { name: 'Sabah koşusu', opts: {
      evet: { name: 'Her sabah', fx: { 'a.dayaniklilik': 0.5, enerji: -4 }, desc: 'Dayanıklılığa her hafta ek XP.' },
      hayir: { name: 'Yok', fx: {}, desc: 'Biraz daha uyku.' } } },
    sosyal: { name: 'Sosyal hayat', opts: {
      ev: { name: 'Evde', fx: { mental: 1, enerji: 2, 's.sosyallik': -0.3 }, desc: 'Sakin ve dinlendirici, biraz yalnız.' },
      dengeli: { name: 'Dengeli', fx: {}, desc: 'Arada bir dışarı çıkarsın.' },
      gece: { name: 'Gece hayatı', fx: { moral: 2.5, disiplin: -1.5, enerji: -8, 's.sosyallik': 0.6, sohret: 0.2 }, desc: 'Eğlenceli, ama hoca duyar.' } } },
    telefon: { name: 'Telefon ve sosyal medya', opts: {
      sinirli: { name: 'Sınırlı', fx: { mental: 1.5, 'takipci%': -0.3 }, desc: 'Kafan rahat, takipçilerin biraz unutur.' },
      normal: { name: 'Normal', fx: {}, desc: 'Gün içinde bakarsın.' },
      sinirsiz: { name: 'Sürekli açık', fx: { 'takipci%': 0.8, mental: -1.5, enerji: -2 }, desc: 'Takipçi gelir, yorumlar kafanı yer.' } } },
    toparlanma: { name: 'Toparlanma', opts: {
      yok: { name: 'Yok', fx: {}, desc: 'Antrenmandan sonra eve.' },
      buz: { name: 'Buz banyosu', fx: { enerji: 4 }, cost: 800, injMul: 0.85, desc: 'Soğuk ama kaslar teşekkür eder.' },
      masaj: { name: 'Masaj ve fizyoterapi', fx: { enerji: 6, saglik: 0.5 }, cost: 2500, injMul: 0.85, desc: 'Pahalı ama en iyisi.' } } }
  };
  D.routineDefault = { uyku: 'normal', beslenme: 'normal', kosu: 'hayir', sosyal: 'dengeli', telefon: 'normal', toparlanma: 'yok' };

  /* ---------- Haftalık etkinlikler: kurs gibi süreklilik isteyenler mağazaya (abonelik) taşındı ---------- */
  // dil kursu, psikolog, yoga artık aylık abonelik; uyku, gece hayatı, spa ise Özel Hayat rutininde
  D.activities = D.activities.filter((a) => !['dil', 'psikolog', 'yoga', 'uyku', 'gece'].includes(a.id));
  D.activities.push(
    { id: 'halisaha', name: 'Eski arkadaşlarla halı saha', desc: 'Profesyonel değil, sadece eğlence.', cost: 300, fx: { moral: 5, 'r.memleket': 2, 's.sosyallik': 1, enerji: -10 }, injury: 0.02 },
    { id: 'balik', name: 'Balık tutmaya git', desc: 'Sessizlik, deniz ve bir termos çay.', cost: 200, fx: { mental: 4, enerji: 3, moral: 2 } },
    { id: 'sinema', name: 'Sinemaya git', desc: 'İki saat telefonsuz.', cost: 350, fx: { moral: 3, mental: 1 } },
    { id: 'konser', name: 'Konsere git', desc: 'Kalabalıkta biri seni tanıyabilir.', cost: 1200, fx: { moral: 5, enerji: -6, 's.sosyallik': 1 }, risk: [{ ev: 'act_paparazzi', p: 0.05, if: { stat: { sohret: ['>', 30] } } }] },
    { id: 'rakip_izle', name: 'Rakibin maçlarını izle', desc: 'Bir sonraki rakibin videoları.', cost: 0, fx: { 'r.hoca': 2, form: 0.6, mental: -1 }, hoca: { diktator: 2, _: 1 } },
    { id: 'aile_yemegi', name: 'Aileye yemek ısmarla', desc: 'Annen yine de "evde yerdik" der.', cost: 2000, fx: { 'r.aile': 5, 'r.anne': 3, moral: 3 } },
    { id: 'gonullu', name: 'Gönüllü çalış', desc: 'Bir derneğin çocuk etkinliğine katıl.', cost: 0, fx: { 'r.taraftar': 3, mental: 3, 's.karizma': 1, enerji: -4 } },
    { id: 'satranc', name: 'Satranç kulübü', desc: 'Kafa antrenmanı.', cost: 300, fx: { 's.kurnazlik': 1.2, 's.sogukkanlilik': 1, mental: 1 } },
    { id: 'kuafor', name: 'Berber ve bakım günü', desc: 'Sakal, saç, cilt bakımı.', cost: 800, fx: { moral: 2, 's.karizma': 0.8 } },
    { id: 'oyun_gecesi', name: 'Takımla oyun gecesi', desc: 'Konsolda turnuva, pizza.', cost: 600, fx: { 'r.takim': 5, moral: 3, enerji: -6 } },
    { id: 'kopek_gezme', name: 'Köpeğini gezdir', desc: 'Sabah parkta uzun yürüyüş.', cost: 0, if: { flag: 'kopek' }, fx: { mental: 3, moral: 2, enerji: -2 } },
    { id: 'golf', name: 'Golf oyna', desc: 'Kulüp yöneticileriyle tanışabilirsin.', cost: 6000, if: { tier: [1, 2], orAbroad: true }, fx: { 'r.baskan': 3, mental: 2, enerji: -3 } },
    { id: 'memleket_kahve', name: 'Memleket derneğine uğra', desc: 'Hemşehrilerle çay, tavla, sohbet.', cost: 0, fx: { 'r.memleket': 4, moral: 2, enerji: -3 } }
  );

  /* ---------- Mağaza: kişisel gelişim abonelikleri + daha çok ürün ---------- */
  D.shopCats.unshift({ id: 'gelisim', name: 'Kişisel gelişim' });
  // sub: abonelik (aylık = 4 hafta). weekly: her hafta işleyen etki. Fiyat ligine göre ölçeklenir.
  D.shop.push(
    { id: 'sub_ingilizce', cat: 'gelisim', name: 'İngilizce kursu', price: 5000, sub: true, weekly: { dil: 2.5, 's.konusma': 0.4 }, desc: 'Haftada üç ders. Yurt dışı transferlerinde dil çok önemli.' },
    { id: 'sub_almanca', cat: 'gelisim', name: 'Almanca / İspanyolca kursu', price: 6000, sub: true, weekly: { dil: 2.2, mental: 0.3 }, desc: 'Avrupa’nın büyük liglerine hazırlık.' },
    { id: 'sub_psikolog', cat: 'gelisim', name: 'Spor psikoloğu', price: 12000, sub: true, weekly: { mental: 2.5, 's.sogukkanlilik': 0.5, moral: 1 }, desc: 'Baskı altında sakin kalmayı öğrenirsin.' },
    { id: 'sub_yoga', cat: 'gelisim', name: 'Yoga ve pilates üyeliği', price: 4000, sub: true, weekly: { saglik: 1, enerji: 3, 'a.denge': 0.4 }, injMul: 0.92, desc: 'Esneklik, denge ve daha az sakatlık.' },
    { id: 'sub_diksiyon', cat: 'gelisim', name: 'Diksiyon ve konuşma kursu', price: 5000, sub: true, weekly: { 's.konusma': 1.2, 'r.medya': 0.5 }, desc: 'Röportajlarda ve pazarlıkta daha iyi konuşursun.' },
    { id: 'sub_medya', cat: 'gelisim', name: 'Medya eğitimi', price: 9000, sub: true, weekly: { 's.karizma': 0.8, 'r.medya': 1 }, desc: 'Kameranın karşısında ne diyeceğini bilirsin.' },
    { id: 'sub_liderlik', cat: 'gelisim', name: 'Liderlik koçu', price: 10000, sub: true, weekly: { 's.liderlik': 1, 'r.takim': 0.5 }, desc: 'Soyunma odasında sözü dinlenen biri olursun.' },
    { id: 'sub_kisisel', cat: 'gelisim', name: 'Kişisel antrenör', price: 20000, sub: true, trainSub: 0.18, weekly: { enerji: -2 }, desc: 'Mevkine özel çalışmalar: antrenman XP’si +%18.' },
    { id: 'sub_beslenme', cat: 'gelisim', name: 'Beslenme koçu', price: 7000, sub: true, weekly: { saglik: 1.2 }, injMul: 0.93, desc: 'Haftalık menü ve kilo takibi.' },
    { id: 'sub_finans', cat: 'gelisim', name: 'Finans danışmanı', price: 8000, sub: true, weekly: { 's.kurnazlik': 0.4 }, livingMul: 0.85, desc: 'Gereksiz harcamaları keser, yaşam giderin %15 düşer.', if: { money: ['>', 100000] } },
    { id: 'sub_meditasyon', cat: 'gelisim', name: 'Meditasyon uygulaması', price: 600, sub: true, weekly: { mental: 0.8 }, desc: 'Günde on dakika. Ucuz ama işe yarar.' },
    { id: 'sub_universite', cat: 'gelisim', name: 'Açık öğretim üniversitesi', price: 2500, sub: true, weekly: { 's.konusma': 0.5, mental: 0.5, 'r.anne': 0.3 }, desc: 'Futbol bir gün biter, diploma kalır.' },
    { id: 'sub_analiz', cat: 'gelisim', name: 'Kişisel video analisti', price: 15000, sub: true, weekly: { form: 0.4, 'r.hoca': 0.5 }, desc: 'Her maçının analizi telefonunda.', if: { tier: [1, 2, 3], orAbroad: true } },

    // Ulaşım
    { id: 'scooter', cat: 'ulasim', name: 'Elektrikli scooter', price: 18000, upkeep: 100, lux: 0, fx: { moral: 2 }, desc: 'Antrenmana rüzgâr gibi. Hoca kask takmanı istiyor.' },
    { id: 'klasik', cat: 'ulasim', name: 'Klasik araba (1970)', price: 1.8e6, upkeep: 6000, lux: 2, fx: { moral: 6, 'r.baba': 5 }, desc: 'Babanın gençliğindeki model. Sık sık yolda kalır.' },
    { id: 'helikopter', cat: 'ulasim', name: 'Özel helikopter kiralama', price: 2.5e7, upkeep: 80000, lux: 5, fx: { sohret: 3, 'r.taraftar': -4 }, desc: 'Deplasmana helikopterle. Taraftar pek hoş karşılamaz.' },
    // Konut
    { id: 'yazlik', cat: 'konut', name: 'Ege’de yazlık', price: 4.5e6, upkeep: 6000, lux: 2, fx: { mental: 4, 'r.aile': 4 }, weekly: { mental: 0.3 }, desc: 'Sezon arası ailenle denize.' },
    { id: 'koy_evi', cat: 'konut', name: 'Memlekette taş ev', price: 1.2e6, upkeep: 1500, lux: 1, fx: { 'r.memleket': 8, mental: 2 }, desc: 'Dedenin evini yeniledin.' },
    { id: 'akilli_ev', cat: 'konut', name: 'Akıllı ev sistemi', price: 350000, upkeep: 800, lux: 1, fx: { moral: 2 }, weekly: { enerji: 1 }, desc: 'Işıklar kendiliğinden kapanır, uyku kalitesi artar.' },
    // Görünüm
    { id: 'parfum', cat: 'gorunum', name: 'İmza parfüm', price: 12000, consumable: true, fx: { 's.karizma': 1, moral: 1 }, desc: 'Kokuyu menajerin seçti.' },
    { id: 'tasarim_takim', cat: 'gorunum', name: 'Tasarım takım elbise', price: 90000, lux: 1, fx: { 's.karizma': 2, sohret: 0.5 }, desc: 'Ödül törenleri için.' },
    { id: 'dovme_sanat', cat: 'gorunum', name: 'Ünlü dövme sanatçısı', price: 40000, lux: 0, fx: { 's.karizma': 1, 'takipci%': 1 }, desc: 'Kolunda bir eser.' },
    // Profesyonel
    { id: 'oksijen', cat: 'pro', name: 'Oksijen odası', price: 900000, upkeep: 3000, lux: 1, injMul: 0.85, weekly: { enerji: 3 }, desc: 'Evde toparlanma kapsülü.' },
    { id: 'gps_yelek', cat: 'pro', name: 'GPS takip yeleği', price: 60000, trainMul: 1.04, desc: 'Her koşunun verisi telefonunda.' },
    { id: 'ev_spor', cat: 'pro', name: 'Ev spor salonu', price: 450000, upkeep: 1000, trainMul: 1.06, weekly: { 'a.fizik': 0.2 }, desc: 'Gece de çalışabilirsin.' },
    { id: 'krampon_ozel', cat: 'pro', name: 'Ayağına özel krampon', price: 75000, trainMul: 1.03, fx: { moral: 2 }, desc: 'Ayak kalıbından üretildi.' },
    // Aile
    { id: 'anne_umre', cat: 'aile', name: 'Annene kutsal topraklara yolculuk', price: 250000, consumable: true, fx: { 'r.anne': 15, 'r.aile': 6 }, desc: 'Annenin hayaliydi.' },
    { id: 'baba_dukkan', cat: 'aile', name: 'Babana dükkân aç', price: 1.5e6, fx: { 'r.baba': 15, 'r.aile': 5 }, income: [500, 3000], desc: 'Babanın emeklilik işi.' },
    { id: 'kardes_burs', cat: 'aile', name: 'Kardeşine eğitim fonu', price: 600000, fx: { 'r.kardes': 15 }, desc: 'Okul masrafları senden.' },
    { id: 'aile_tatil', cat: 'aile', name: 'Ailecek yurt dışı tatili', price: 400000, consumable: true, fx: { 'r.aile': 10, mental: 4, moral: 4 }, desc: 'Herkes ilk kez uçağa bindi.' },
    // Hediye
    { id: 'h_cicek', cat: 'hediye', name: 'Çiçek ve not', price: 1500, consumable: true, gift: 'partner', fx: { 'r.partner': 3 }, desc: 'Küçük ama anlamlı.' },
    { id: 'h_konser', cat: 'hediye', name: 'Konser bileti (iki kişilik)', price: 9000, consumable: true, gift: 'partner', fx: { 'r.partner': 6, moral: 3 }, desc: 'Sevdiği sanatçının konseri.' },
    { id: 'h_takim_forma', cat: 'hediye', name: 'Takıma özel tişört', price: 30000, consumable: true, fx: { 'r.takim': 6 }, desc: 'Herkesin adı arkasında.' },
    { id: 'h_hoca', cat: 'hediye', name: 'Hocaya taktik kitabı seti', price: 8000, consumable: true, fx: { 'r.hoca': 4 }, desc: 'Biraz yağcılık, biraz saygı.' },
    // Yatırım
    { id: 'kafe', cat: 'yatirim', name: 'Mahalle kafesi', price: 2.2e6, upkeep: 4000, income: [2000, 9000], fx: { 'r.memleket': 3 }, desc: 'Arkadaşın işletiyor, sen ortaksın.' },
    { id: 'futbol_okulu', cat: 'yatirim', name: 'Çocuk futbol okulu', price: 3.5e6, upkeep: 7000, income: [3000, 11000], fx: { 'r.memleket': 10, 's.liderlik': 2 }, desc: 'Memleketteki çocuklar için.' },
    { id: 'halisaha_isletme', cat: 'yatirim', name: 'Halı saha işletmesi', price: 1.6e6, upkeep: 3000, income: [1500, 6500], desc: 'Akşamları hep dolu.' },
    // Efsane
    { id: 'yat', cat: 'efsane', name: 'Mega yat', price: 2.2e8, upkeep: 400000, lux: 6, fx: { sohret: 5, 'takipci%': 4, 'r.taraftar': -6 }, desc: 'Akdeniz’de magazinin yeni durağı.' }
  );

  /* ---------- Yeni kökenler: kulübünü kendin seçtiğin başlangıçlar ---------- */
  D.origins.push(
    {
      id: 'universite', name: 'Üniversite takımından gelen', regions: ['ICA', 'MAR', 'EGE'], start: { c: 'TR', t: 4 }, age: 19, pickClub: [4, 5],
      desc: 'Üniversitede beden eğitimi okurken üniversiteler liginde gol kralı oldun. Birkaç alt lig kulübü deneme teklifi gönderdi. Hangisine gideceğine sen karar vereceksin.',
      strong: 'Oyun zekâsı, konuşma, disiplin', burden: 'Geç başlayan profesyonellik, sınavlar, "okumuş futbolcu" alayı',
      attr: { base: 38, bonus: { pas: 7, vizyon: 6, sakinlik: 4 } },
      soft: { sosyallik: 30, konusma: 40, karizma: 28, liderlik: 26, sogukkanlilik: 30, kurnazlik: 26 },
      life: { mental: 62, disiplin: 66, sohret: 1, saglik: 80, moral: 58 },
      money: 25000, pot: [62, 86], followers: [300, 1500], wealth: 2, father: 'calisan', flags: ['universite']
    },
    {
      id: 'futsal', name: 'Futsaldan büyük sahaya', regions: ['MAR', 'ICA', 'KAR', 'AKD'], start: { c: 'TR', t: 5 }, age: 18, pickClub: [5],
      desc: 'Salon futbolunda milli takıma kadar çıktın. Dar alanda herkesi geçiyorsun ama büyük saha bambaşka. Seni isteyen BAL takımlarından birini seçeceksin.',
      strong: 'Top kontrolü, çeviklik, dribling', burden: 'Büyük sahada dayanıklılık, fiziksel temas, "salon oyuncusu" etiketi',
      attr: { base: 36, bonus: { dribling: 10, topKontrol: 10, ceviklik: 8, dayaniklilik: -6, fizik: -5 } },
      soft: { sosyallik: 32, konusma: 22, karizma: 30, liderlik: 16, sogukkanlilik: 26, kurnazlik: 32 },
      life: { mental: 54, disiplin: 52, sohret: 3, saglik: 80, moral: 60 },
      money: 9000, pot: [62, 90], followers: [1500, 5000], wealth: 1, father: 'calisan', flags: ['futsal']
    },
    {
      id: 'avrupa_akademi', name: 'Avrupa akademisinden dönen', regions: ['MAR', 'EGE'], start: { c: 'TR', t: 2 }, age: 18, pickClub: [2, 3],
      desc: 'Hollanda’da bir akademide altı yıl geçirdin. 18 yaşında profesyonel sözleşme verilmeyince Türkiye’ye döndün. Seni isteyen kulüplerden birini seçeceksin.',
      strong: 'Taktik disiplin, pas, oyun görüşü', burden: 'Türkçe aksanı, "Avrupa’da tutunamadı" yorumları, ailen Avrupa’da',
      attr: { base: 41, bonus: { pas: 7, vizyon: 7, pozisyon: 6, topKontrol: 4 } },
      soft: { sosyallik: 24, konusma: 26, karizma: 26, liderlik: 20, sogukkanlilik: 34, kurnazlik: 22 },
      life: { mental: 44, disiplin: 70, sohret: 5, saglik: 82, moral: 46 },
      money: 40000, pot: [66, 90], followers: [3000, 9000], wealth: 2, father: 'destekci', flags: ['avrupa_akademi']
    },
    {
      id: 'deneme', name: 'Deneme maçlarından keşfedilen', regions: ['ICA', 'AKD', 'DOG', 'GDA', 'KAR', 'EGE'], start: { c: 'TR', t: 5 }, age: 20, pickClub: [3, 4, 5],
      desc: 'Hiçbir altyapıda oynamadın. Bir yıl boyunca şehir şehir gezip açık seçmelere katıldın. Sonunda birkaç kulüp seni istedi.',
      strong: 'Hırs, fiziksel güç, mücadele', burden: 'Taktik eksikliği, para sıkıntısı, kimse tanımıyor',
      attr: { base: 36, bonus: { fizik: 8, agresiflik: 8, dayaniklilik: 6, hiz: 4 } },
      soft: { sosyallik: 26, konusma: 20, karizma: 24, liderlik: 22, sogukkanlilik: 28, kurnazlik: 30 },
      life: { mental: 58, disiplin: 58, sohret: 0, saglik: 84, moral: 64 },
      money: 3000, pot: [60, 89], followers: [50, 400], wealth: 1, father: 'calisan', flags: ['deneme']
    },
    {
      id: 'kaleci_mahallesi', name: 'Çay ocağının çocuğu', regions: ['KAR', 'DOG', 'GDA', 'ICA'], start: { c: 'TR', t: 5 }, age: 17,
      desc: 'Babanın sanayideki çay ocağında tepsi taşıyarak büyüdün. Ustalar öğle arasında maç yapar, sen de hep kaleye geçerdin. Sonra bir gün biri seni izledi.',
      strong: 'Çalışkanlık, alçakgönüllülük, refleks', burden: 'Babanın ocağı, para sıkıntısı, eğitimsiz başlangıç',
      attr: { base: 35, bonus: { refleks: 8, reaksiyon: 7, dayaniklilik: 5, fizik: 3 } },
      soft: { sosyallik: 34, konusma: 24, karizma: 22, liderlik: 18, sogukkanlilik: 26, kurnazlik: 28 },
      life: { mental: 56, disiplin: 62, sohret: 0, saglik: 80, moral: 60 },
      money: 2000, pot: [60, 88], followers: [30, 200], wealth: 1, father: 'calisan', flags: ['cay_ocagi']
    }
  );
  Object.assign(D.originMods, {
    universite: { train: { vizyon: 1.25, pas: 1.15, _: 1.05 }, desc: 'Taktik ve görüş antrenmanlarında daha hızlı gelişir.' },
    futsal: { train: { dribling: 1.3, topKontrol: 1.3, ceviklik: 1.25, dayaniklilik: 0.9 }, desc: 'Top tekniği çok hızlı, dayanıklılık yavaş gelişir.' },
    avrupa_akademi: { train: { pozisyon: 1.25, pas: 1.2, vizyon: 1.15, _: 1.05 }, fame: 1.1, desc: 'Akademi disiplini: taktik yetenekler hızlı gelişir.' },
    deneme: { train: { fizik: 1.3, agresiflik: 1.25, _: 1.1 }, desc: 'Geç başladı ama çok hırslı: her şey biraz hızlı gelişir.' },
    kaleci_mahallesi: { train: { refleks: 1.3, reaksiyon: 1.25, _: 1.08 }, desc: 'Çalışkan: her yetenek biraz hızlı gelişir.' }
  });

  /* ---------- Yeni kökenlerin hikâyeleri ---------- */
  const E = D.events;
  const O = (t, tone, fx, r, extra) => { const o = Object.assign({ t, tone, fx, r }, extra || {}); if (extra && extra.fx) o.fx = Object.assign({}, fx, extra.fx); return o; };
  E.push(
    { id: 'intro_universite', chain: true, kind: 'chat', who: 'Hocan', nodes: { start: { who: 'Üniversite hocan', t: 'Üniversitedeki beden eğitimi hocan arıyor: "Duydum, profesyonel oluyormuşsun. Okulu dondurma, uzaktan devam et. Diploma bir gün lazım olur."', o: [
      O('Haklısınız hocam, devam edeceğim.', 'saygili', { mental: 3, flag: 'okul_devam', 's.konusma': 1 }, 'Hocan çok sevindi. Sınavları sezon arasına koyacaksın.'),
      O('Artık tek işim futbol.', 'iddiali', { form: 1, 'r.anne': -3 }, 'Annen biraz üzüldü ama seni destekliyor.')] } } },
    { id: 'universite_sinav', origin: true, w: 50, if: { origin: 'universite', flag: 'okul_devam', week: [14, 22] }, kind: 'card', who: 'Fakülte', t: 'Final sınavın ile deplasman maçı aynı gün. Dekan "sınavı erteleyemeyiz" diyor.', o: [
      O('Sınava gir, maçı kaçır', 'saygili', { mental: 3, 'r.hoca': -4, 'r.anne': 4 }, 'Sınavı geçtin. Hoca seni bir hafta görmezden geldi.'),
      O('Maça git', 'hirsli', { 'r.hoca': 3, mental: -2 }, 'Sınavı bütünlemeye bıraktın.')] },
    { id: 'universite_alay', origin: true, w: 40, if: { origin: 'universite', season: 1, week: [3, 10] }, kind: 'card', who: 'Soyunma odası', t: 'Takım arkadaşların sana "Profesör" lakabı taktı. Maç öncesi taktik tahtasını sana uzatıp dalga geçiyorlar.', o: [
      O('Gerçekten bir taktik anlat', 'iddiali', { 'r.takim': 4, 's.liderlik': 1 }, 'Anlattığın şey işe yaradı. Lakap kaldı ama artık saygıyla.'),
      O('Gül geç', 'esprili', { 'r.takim': 2 }, 'Profesör lakabı tutundu.')] },
    { id: 'intro_futsal', chain: true, kind: 'chat', who: 'Futsal hocan', nodes: { start: { who: 'Futsal hocan', t: 'Futsal takımındaki hocan son bir mesaj attı: "Büyük sahada kaybolma. Topu ayağında tutma, iki dokunuşta oyna. Ve koş, çok koş."', o: [
      O('Dayanıklılığıma çalışacağım', 'saygili', { 'a.dayaniklilik': 1, enerji: -4 }, 'İlk hafta antrenmandan sonra parkta koştun.'),
      O('Ben yine çalımımı atarım', 'iddiali', { 'a.dribling': 0.8, 'r.hoca': -1 }, 'Hocan "inatçı" diye bir emoji gönderdi.')] } } },
    { id: 'futsal_nefes', origin: true, w: 50, if: { origin: 'futsal', season: 1, week: [2, 8] }, kind: 'card', who: 'Antrenman', t: 'İlk tam saha antrenman maçında 60. dakikada nefesin kesildi. Hoca seni izliyor.', o: [
      O('Dişini sık, devam et', 'hirsli', { 'r.hoca': 3, saglik: -2, 'a.dayaniklilik': 0.8 }, 'Antrenmanın sonunda kustun ama hoca not aldı.'),
      O('Değişiklik iste', 'kacamak', { 'r.hoca': -2 }, 'Hoca "salonda kırk dakika yeterdi, değil mi?" dedi.')] },
    { id: 'intro_avrupa_akademi', chain: true, kind: 'chat', who: 'Annen', nodes: { start: { who: 'Annen (Rotterdam’dan)', t: 'Annen Rotterdam’dan aradı: "Oğlum orada tek başına ne yapacaksın? Baban da ben de buradayız. İstersen geri gel."', o: [
      O('Burada kendimi kanıtlayacağım anne', 'iddiali', { moral: 3, 'r.anne': 2, flag: 'avrupa_aile_uzak' }, 'Annen ağladı ama dua etti.'),
      O('Bir yıl deneyeceğim, olmazsa dönerim', 'kacamak', { mental: -1, 'r.anne': 4 }, 'Annen biraz rahatladı.')] } } },
    { id: 'avrupa_aksan', origin: true, w: 45, if: { origin: 'avrupa_akademi', season: 1, week: [3, 12] }, kind: 'card', who: 'Sosyal medya', t: 'İlk röportajında Türkçen aksanlı çıktı. "Hollandalı Türk" diye alay eden videolar yayıldı.', o: [
      O('Kendinle dalga geçen bir video çek', 'esprili', { 'takipci%': 4, moral: 2 }, 'Video çok sevildi. Alaycılar sustu.'),
      O('Türkçe dersi almaya başla', 'mutevazi', { 's.konusma': 2, para: '-w0.2' }, 'Altı ay sonra aksanın çok azaldı.')] },
    { id: 'intro_deneme', chain: true, kind: 'chat', who: 'Baban', nodes: { start: { who: 'Baban', t: 'Baban telefonda: "Oğlum bir yıldır şehir şehir geziyorsun. Sonunda biri seni seçti. Ne olursa olsun bu fırsatı kaçırma."', o: [
      O('Kaçırmayacağım baba', 'duygusal', { moral: 5, 'r.baba': 5 }, 'Babanın sesi titriyordu.'),
      O('İlk maaşımla borçlarını kapatacağım', 'duygusal', { 'r.baba': 8, flag: 'baba_borc' }, 'Baban bir şey diyemedi.')] } } },
    { id: 'deneme_taktik', origin: true, w: 50, if: { origin: 'deneme', season: 1, week: [2, 10] }, kind: 'card', who: 'Hoca', t: 'Hoca taktik tahtasında ofsayt tuzağını anlatıyor. Hiçbir şey anlamadın, herkes kafa sallıyor.', o: [
      O('Antrenmandan sonra hocaya tekrar sor', 'saygili', { 'r.hoca': 4, 'a.pozisyon': 0.8 }, 'Hoca yarım saat sana özel anlattı.'),
      O('Kafa salla', 'kacamak', { 'r.hoca': -1 }, 'Maçta ofsayt çizgisini bozdun.')] },
    { id: 'intro_kaleci_mahallesi', chain: true, kind: 'chat', who: 'Baban', nodes: { start: { who: 'Baban', t: 'Baban çay ocağında son kez tepsiyi eline verdi: "Ustaların hepsi seni konuşuyor. Git oğlum. Ocak bekler, fırsat beklemez."', o: [
      O('Ocağa haftada bir uğrayacağım', 'duygusal', { 'r.baba': 6, 'r.memleket': 3 }, 'Ustalar sana bir eldiven hediye etti.'),
      O('Bir gün sana daha büyük bir ocak açacağım', 'iddiali', { 'r.baba': 4, moral: 3 }, 'Baban güldü: "Önce bir maaş al."')] } } },
    { id: 'cay_ustalar', origin: true, w: 45, if: { origin: 'kaleci_mahallesi', season: 1, week: [6, 20] }, kind: 'card', who: 'Sanayi ustaları', t: 'Sanayideki ustalar maçına otobüs tutup gelmiş. Tribünde "Bizim çaycı" pankartı var.', o: [
      O('Maç sonu yanlarına git', 'duygusal', { moral: 6, 'r.memleket': 5, 'takipci%': 2 }, 'Hepsiyle tek tek sarıldın.'),
      O('Uzaktan el salla', 'mutevazi', { moral: 3 }, 'Ustalar "artık bizi tanımaz" diye şakalaştı.')] }
  );

  /* ---------- Mesaj sohbetleri: Mesajlar ekranına gelir, cevap verirsin ---------- */
  // who: ilişki rolü (kanka, anne, baba, kardes, partner, kaptan, menajer, hoca) ya da sabit bir isim
  const C = (id, who, cond, lines, o) => ({ id, who, if: cond, lines, o });
  D.convos = [
    C('c_kanka_mac', 'kanka', {}, ['Kanka akşam maç var, izliyor musun?', 'Gel bizde izleyelim, annem börek yaptı'], [O('Geliyorum, börek benden kaçmaz', 'sosyal', { 'r.kanka': 3, moral: 2, enerji: -2 }, 'Börek efsaneydi.'), O('Yorgunum kanka, başka sefer', 'sessiz', { 'r.kanka': -1, enerji: 2 }, '"Peki kanka 😔"')]),
    C('c_kanka_kiz', 'kanka', { partner: 'none' }, ['Kanka bir arkadaşım seni çok beğeniyormuş', 'Tanıştırayım mı? 😏'], [O('Olur, bir kahve içelim', 'sosyal', { 's.sosyallik': 1, moral: 2 }, '"Ayarlıyorum kanka!"', { fx: { seed: [{ id: 'partner_tanis_arkadas', in: [1, 3], p: 0.4 }] } }), O('Şu an kafam futbolda', 'kacamak', {}, '"Profesör olmuşsun 😂"')]),
    C('c_kanka_borc', 'kanka', { money: ['>', 30000] }, ['Kanka utanarak yazıyorum', 'Kira için biraz eksiğim var, ay sonu veririm'], [O('Gönderiyorum, dert etme', 'duygusal', { 'r.kanka': 6, para: '-w0.3' }, '"Sen adamsın kanka."'), O('Bu ay ben de sıkışığım', 'kacamak', { 'r.kanka': -2 }, '"Tamam kanka, anlarım."')]),
    C('c_kanka_meme', 'kanka', {}, ['😂😂😂', 'Geçen maçtaki düşüşünü kedi videosuyla birleştirmişler bak'], [O('😂 Bana da at', 'esprili', { 'r.kanka': 2, moral: 2 }, 'Video bütün gece grupta döndü.'), O('Hiç komik değil', 'sert', { 'r.kanka': -1 }, '"Tamam ya, alınma"')]),
    C('c_anne_yemek', 'anne', {}, ['Oğlum yemek yiyor musun düzgün?', 'Sana kurabiye gönderdim kargoya verdim'], [O('Yiyorum anne, teşekkürler ❤️', 'duygusal', { 'r.anne': 3, moral: 1 }, 'Annen kalpli on emoji gönderdi.'), O('Anne diyetteyim ya', 'kacamak', { 'r.anne': -1 }, '"Kurabiye diyete dahil oğlum."')]),
    C('c_anne_hasta', 'anne', { minAge: 20 }, ['Oğlum biraz grip oldum', 'Merak etme ama, sen maçına bak'], [O('Hemen doktora git anne, masrafı benden', 'duygusal', { 'r.anne': 5, para: '-w0.1' }, 'Annen iki gün sonra iyileşti.'), O('Geçmiş olsun anne, dinlen', 'mutevazi', { 'r.anne': 2 }, '"Sağ ol oğlum."')]),
    C('c_anne_evlilik', 'anne', { minAge: 24, partner: 'none' }, ['Oğlum komşunun kızı doktor olmuş', 'Ne güzel kız... Ben bir şey demiyorum ama'], [O('Anneee 😅', 'esprili', { 'r.anne': 1 }, '"Ben bir şey demedim zaten."'), O('Numarasını ver bakalım', 'sosyal', { 'r.anne': 4 }, 'Annen çok mutlu oldu.')]),
    C('c_anne_mac', 'anne', { lm: { played: true } }, ['Oğlum maçını izledim', 'O sana vuran çocuk kimdi? Annesi var mı onun!'], [O('Anne futbol bu 😄', 'esprili', { 'r.anne': 2 }, 'Annen rakip oyuncuyu engellemiş sosyal medyadan.'), O('Ben iyiyim anne, merak etme', 'duygusal', { 'r.anne': 3 }, '"Dua ediyorum oğlum."')]),
    C('c_baba_tavsiye', 'baba', { lm: { played: true } }, ['Maçı izledim', 'Sol tarafa hiç kaymadın. Bizim zamanımızda...'], [O('Haklısın baba, dikkat ederim', 'saygili', { 'r.baba': 4 }, 'Baban "aferin" yazdı. Nadirdir.'), O('Baba hocam var benim', 'sert', { 'r.baba': -3 }, 'Baban bir gün yazmadı.')]),
    C('c_baba_araba', 'baba', {}, ['Araba yine bozuldu', 'Neyse, tamirciye götürdüm, sen dert etme'], [O('Masrafı ben karşılıyorum', 'duygusal', { 'r.baba': 4, para: '-w0.1' }, '"Gerek yoktu oğlum." Ama sesi mutluydu.'), O('Geçmiş olsun baba', 'mutevazi', { 'r.baba': 1 }, '"Sağ ol."')]),
    C('c_kardes_odev', 'kardes', {}, ['Abi matematik ödevim var', 'Sen hiç anlamazsın ama yine de sordum 😂'], [O('Görüntülü ara, birlikte çözelim', 'duygusal', { 'r.kardes': 5, enerji: -2 }, 'Birlikte çözdünüz. İkisi yanlıştı.'), O('Gerçekten anlamam 😅', 'esprili', { 'r.kardes': 1 }, '"Biliyordum."')]),
    C('c_kardes_forma', 'kardes', {}, ['Abi okulda herkes senin formanı istiyor', '10 tane getirebilir misin?'], [O('Getiririm', 'duygusal', { 'r.kardes': 5, para: '-w0.1' }, 'Kardeşin okulda kral oldu.'), O('İki tane getiririm, gerisi satın alsın', 'kacamak', { 'r.kardes': 1 }, '"Cimri abi 😤"')]),
    C('c_partner_ozlem', 'partner', { partner: [2, 3, 4, 5] }, ['Seni özledim', 'Bu hafta biraz vakit ayırabilir misin bize?'], [O('Pazar günü tamamen seninim', 'duygusal', { 'r.partner': 5, enerji: -2 }, 'Pazar günü telefonları kapattınız.'), O('Bu hafta çok yoğunum', 'kacamak', { 'r.partner': -3 }, '"Hep yoğunsun zaten."')]),
    C('c_partner_kiskanc', 'partner', { partner: [2, 3, 4], stat: { sohret: ['>', 20] } }, ['Fotoğrafının altına yorum yapan o kız kim?', 'Neden beğendin?'], [O('Tanımıyorum bile, yanlışlıkla bastım', 'durust', { 'r.partner': 1 }, 'Biraz sonra ikna oldu.'), O('Bu kıskançlık yorucu', 'sert', { 'r.partner': -5 }, 'Bir gün konuşmadınız.')]),
    C('c_partner_film', 'partner', { partner: [2, 3, 4, 5] }, ['Akşam ne izleyelim?', 'Romantik komedi mi korku mu?'], [O('Romantik komedi', 'duygusal', { 'r.partner': 3 }, 'Film bitmeden uyudun.'), O('Korku!', 'esprili', { 'r.partner': 2, moral: 1 }, 'O sana sarıldı, sen ondan çok korktun.')]),
    C('c_kaptan_disiplin', 'kaptan', {}, ['Akşam takım yemeği var', 'Herkes gelecek, sen de gel. Hoca da orada'], [O('Oradayım kaptan', 'saygili', { 'r.kaptan': 3, 'r.takim': 2 }, 'Yemekte hoca seni yanına oturttu.'), O('Bu akşam olmaz', 'kacamak', { 'r.kaptan': -2 }, 'Kaptan "not ettim" dedi.')]),
    C('c_kaptan_genc', 'kaptan', { maxAge: 22 }, ['Antrenmanda biraz fazla bağırıyorsun', 'Abi tavsiyesi: sahada konuş, odada sus'], [O('Haklısın kaptan', 'mutevazi', { 'r.kaptan': 4, disiplin: 2 }, 'Kaptan seni korumaya başladı.'), O('Ben kendim gibiyim', 'sert', { 'r.kaptan': -4 }, 'Kaptan seninle bir süre konuşmadı.')]),
    C('c_menajer_haber', 'menajer', { agent: true }, ['Bugün iki kulüp seni sordu', 'Henüz bir şey yok ama formunu koru'], [O('Sezona odaklıyım', 'saygili', { 'r.menajer': 2, form: 0.5 }, '"Doğrusu bu."'), O('Hangi kulüpler?', 'iddiali', { 'r.menajer': 1 }, '"Söylersem heyecanlanırsın. Sonra."')]),
    C('c_menajer_reklam', 'menajer', { agent: true, stat: { sohret: ['>', 25] } }, ['Bir enerji içeceği firması seni istiyor', 'Küçük bir çekim, iyi para'], [O('Yapalım', 'iddiali', { para: 'w0.6', enerji: -3, 'takipci%': 1 }, 'Çekim altı saat sürdü.'), O('Sezon ortasında olmaz', 'saygili', { 'r.hoca': 1, 'r.menajer': -1 }, '"Sen bilirsin."')]),
    C('c_hoca_gece', 'hoca', { lm: { played: true, maxRating: 6 } }, ['Bugünkü maçı konuşalım mı?', 'Yarın sabah ofisime uğra'], [O('Geleceğim hocam', 'saygili', { 'r.hoca': 3, mental: -1, 'a.pozisyon': 0.4 }, 'Hoca videoyu durdurup hatalarını gösterdi.'), O('Hocam yorgunum, başka gün', 'kacamak', { 'r.hoca': -4 }, 'Hoca okundu bıraktı.')]),
    C('c_hoca_ovgu', 'hoca', { lm: { played: true, minRating: 7.6 } }, ['Bugün çok iyiydin', 'Böyle devam'], [O('Teşekkürler hocam!', 'saygili', { 'r.hoca': 2, moral: 3 }, 'Hoca bir başparmak gönderdi.')]),
    C('c_eski_hoca', 'Çocukluk hocan', { season: ['>=', 1] }, ['Seni televizyonda/maçlarda takip ediyorum evlat', 'Gurur duyuyorum. Ayaklarını yere bas'], [O('Her şeyi size borçluyum hocam', 'duygusal', { mental: 2, 'r.memleket': 2 }, 'Hocan bu mesajı herkese göstermiş.'), O('Sağ olun hocam', 'mutevazi', { mental: 1 }, '"Allah yolunu açık etsin."')]),
    C('c_fan_genc', 'Genç bir taraftar', { stat: { sohret: ['>', 10] } }, ['Abi ben de futbolcu olmak istiyorum', 'Ne yapmalıyım?'], [O('Okulu bırakma, her gün çalış', 'mutevazi', { 'r.taraftar': 2, 's.liderlik': 0.5 }, 'Çocuk mesajını çerçeveletmiş.'), O('Bol bol top oyna', 'esprili', { 'r.taraftar': 1 }, '"Tamam abi! 😍"')]),
    C('c_takim_grup', 'takimarkadasi', {}, ['Beyler yarın antrenman 9’da değil 8’de', 'Hoca söyledi, kimse geç kalmasın'], [O('Tamam 👍', 'saygili', { disiplin: 1 }, 'Ertesi gün 7.50’de tesisteydin.'), O('Ciddi misin 😩', 'esprili', { 'r.takim': 1 }, 'Sabah alarmı üç kez erteledin.')]),
    C('c_eski_sevgili', 'Eski sevgilin', { partner: 'none', minAge: 20 }, ['Merhaba... Uzun zaman oldu', 'Maçını izledim, iyi oynamışsın'], [O('Teşekkür ederim, umarım iyisindir', 'saygili', { mental: -1 }, 'Kısa ve kibar bir sohbet oldu.'), O('Görüldü bırak', 'sessiz', {}, 'Bir daha yazmadı.')]),
    C('c_memleket_dernek', 'Memleket derneği', { stat: { sohret: ['>', 10] } }, ['Hemşehrimiz, derneğimizin gecesi var', 'Sizi onur konuğu olarak bekliyoruz'], [O('Geleceğim', 'duygusal', { 'r.memleket': 5, enerji: -4 }, 'Gecede yöresel oyunlarda sahneye çağrıldın.'), O('Video mesaj göndereyim', 'mutevazi', { 'r.memleket': 2 }, 'Videon gecede gösterildi.')]),
    C('c_kurs_kampanya', 'Kurs merkezi', {}, ['Bu haftaya özel kampanya!', 'Kişisel gelişim kurslarında 3 ay 2 ay fiyatına. Mağaza > Kişisel gelişim'], [O('Bakacağım', 'saygili', { do: 'campaign' }, 'Kampanya bu hafta ve gelecek hafta geçerli.'), O('İlgilenmiyorum', 'sessiz', {}, 'Mesajı sildin.')])
  ];
})(typeof window !== 'undefined' ? window : globalThis);
