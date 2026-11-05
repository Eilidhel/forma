/* FORMA — kökenler, boş zaman etkinlikleri, mağaza, rutinler, hedefler */
(function (root) {
  const D = root.F.DATA;

  /* ---------- Kökenler ---------- */
  // tier: başlangıç ligi {c: ülke, t: seviye(1..)} ; attr: temel saha özellikleri
  D.origins = [
    {
      id: 'koy', name: 'Dağ köyünün çocuğu', regions: ['DOG'], start: { c: 'TR', t: 5 }, age: 17,
      desc: 'Doğu Anadolu\'da bir dağ köyünde büyüdün. Sabahları hayvanlara bakıp akşamları taşlı sahada top koşturdun.',
      strong: 'Fizik ve dayanıklılık', burden: 'Aileyi geçindirme baskısı, "futbol iş mi?" diyen bir baba',
      attr: { base: 33, bonus: { fizik: 11, hiz: 4, savunma: 3 } },
      soft: { sosyallik: 18, konusma: 12, karizma: 16, liderlik: 24, sogukkanlilik: 32, kurnazlik: 14 },
      life: { mental: 58, disiplin: 64, sohret: 1, saglik: 84, moral: 55 },
      money: 3500, pot: [64, 90], followers: [30, 180], wealth: 1, father: 'sert', flags: ['koy']
    },
    {
      id: 'akademi', name: 'Büyük şehir akademisi', regions: ['MAR'], start: { c: 'TR', t: 1, big: true }, age: 17,
      desc: 'Dokuz yaşından beri İstanbul\'un dev kulüplerinden birinin altyapısındasın. Herkes senden çok şey bekliyor.',
      strong: 'Teknik ve taktik', burden: 'Yüksek beklenti, ego, erken menajer kıskacı, forma bulamama',
      attr: { base: 44, bonus: { pas: 6, dribling: 6, sut: 4 } },
      soft: { sosyallik: 34, konusma: 30, karizma: 30, liderlik: 16, sogukkanlilik: 20, kurnazlik: 24 },
      life: { mental: 46, disiplin: 52, sohret: 8, saglik: 80, moral: 60 },
      money: 25000, pot: [66, 92], followers: [2500, 9000], wealth: 3, father: 'hirsli', flags: ['akademi']
    },
    {
      id: 'gurbetci', name: 'Gurbetçi', regions: ['DE'], start: { c: 'DE', t: 3 }, age: 18,
      desc: 'Duisburg\'da doğdun, dedenin geldiği Anadolu kasabasını yazdan yaza gördün. Almanya\'nın bölge liginde sözleşme imzaladın.',
      strong: 'Disiplin ve oyun düzeni', burden: 'Kimlik sorusu: hangi milli takım? "Orada Türk, burada Almancı"',
      attr: { base: 40, bonus: { pas: 5, savunma: 4, fizik: 3 } },
      soft: { sosyallik: 28, konusma: 26, karizma: 22, liderlik: 20, sogukkanlilik: 30, kurnazlik: 22 },
      life: { mental: 55, disiplin: 74, sohret: 3, saglik: 82, moral: 55 },
      money: 40000, pot: [64, 90], followers: [400, 1800], wealth: 2, father: 'calisan', flags: ['gurbetci']
    },
    {
      id: 'mahalle', name: 'Mahalle futbolcusu', regions: ['EGE', 'ICA', 'AKD'], start: { c: 'TR', t: 4 }, age: 18,
      desc: 'Arka sokaklarda, halı sahalarda, okul bahçesinde büyüdün. Bir 3. Lig kulübü seni deneme antrenmanına çağırdı.',
      strong: 'Dribling ve yaratıcılık', burden: 'Düşük disiplin, eski arkadaş çevresi, kolay para tuzakları',
      attr: { base: 37, bonus: { dribling: 11, hiz: 5, sut: 3 } },
      soft: { sosyallik: 36, konusma: 22, karizma: 30, liderlik: 14, sogukkanlilik: 18, kurnazlik: 36 },
      life: { mental: 48, disiplin: 34, sohret: 2, saglik: 78, moral: 62 },
      money: 6000, pot: [62, 91], followers: [600, 2500], wealth: 1, father: 'yok', flags: ['mahalle']
    },
    {
      id: 'miras', name: 'Eski futbolcunun çocuğu', regions: ['MAR', 'EGE', 'ICA', 'KAR'], start: { c: 'TR', t: 3 }, age: 17,
      desc: 'Baban 90\'larda milli forma giymiş bir futbolcuydu. Soyadın kapıları açıyor ama herkes seni onunla kıyaslıyor.',
      strong: 'Bağlantılar ve oyun zekâsı', burden: 'Soyadı yükü, "babasının oğlu" lafları, gölgede kalmak',
      attr: { base: 40, bonus: { pas: 4, kafa: 4, sut: 3 } },
      soft: { sosyallik: 30, konusma: 32, karizma: 28, liderlik: 22, sogukkanlilik: 22, kurnazlik: 26 },
      life: { mental: 48, disiplin: 55, sohret: 10, saglik: 80, moral: 55 },
      money: 60000, pot: [62, 89], followers: [3000, 8000], wealth: 3, father: 'eskifutbolcu', flags: ['miras']
    },
    {
      id: 'gec', name: 'Geç başlayan', regions: ['MAR', 'EGE', 'ICA', 'AKD', 'KAR'], start: { c: 'TR', t: 5 }, age: 22,
      desc: 'Üniversiteyi bitirdin, bir muhasebe bürosunda stajdasın. Hafta sonları oynadığın amatör maçlarda bir BAL takımının hocası seni gördü.',
      strong: 'Mental ve olgunluk', burden: 'Zaman baskısı, yaşa takılan scoutlar, güvenli işi bırakma kararı',
      attr: { base: 38, bonus: { pas: 5, savunma: 3, kafa: 3 } },
      soft: { sosyallik: 32, konusma: 38, karizma: 26, liderlik: 30, sogukkanlilik: 36, kurnazlik: 32 },
      life: { mental: 70, disiplin: 66, sohret: 1, saglik: 82, moral: 58 },
      money: 45000, pot: [58, 82], followers: [200, 900], wealth: 2, father: 'calisan', flags: ['gec', 'is_var']
    },
    {
      id: 'balikci', name: 'Karadeniz balıkçı kasabası', regions: ['KAR'], start: { c: 'TR', t: 5 }, age: 17,
      desc: 'Babanın teknesinde hamsi sezonunu bekleyerek büyüdün. Sahil yolundaki çamurlu sahada herkesi geçen çocuk sendin.',
      strong: 'Hız ve mücadele', burden: 'Mevsimlik balık işi, babanın teknesi, denizle saha arasında kalmak',
      attr: { base: 35, bonus: { hiz: 11, fizik: 5, dribling: 2 } },
      soft: { sosyallik: 30, konusma: 18, karizma: 24, liderlik: 18, sogukkanlilik: 26, kurnazlik: 18 },
      life: { mental: 54, disiplin: 56, sohret: 1, saglik: 84, moral: 60 },
      money: 5000, pot: [63, 90], followers: [50, 300], wealth: 1, father: 'balikci', flags: ['balikci']
    },
    {
      id: 'sakat', name: 'Sakatlıktan dönen yetenek', regions: ['MAR', 'EGE', 'ICA', 'AKD'], start: { c: 'TR', t: 4 }, age: 21,
      desc: '18 yaşında Süper Lig\'de forma giydin, sonra çapraz bağların koptu. İki yıl sonra bir 3. Lig takımı sana ikinci bir şans veriyor.',
      strong: 'Deneyim ve oyun zekâsı', burden: 'Kırılgan vücut, travma, "bitti o" diyen basın',
      attr: { base: 51, bonus: { pas: 7, sut: 7, dribling: 6, kafa: 3 } },
      soft: { sosyallik: 26, konusma: 28, karizma: 30, liderlik: 22, sogukkanlilik: 34, kurnazlik: 30 },
      life: { mental: 36, disiplin: 60, sohret: 12, saglik: 58, moral: 40 },
      money: 120000, pot: [70, 88], followers: [8000, 20000], wealth: 2, father: 'destekci', flags: ['sakat', 'kirilgan']
    }
  ];

  D.positions = [
    { id: 'KL', name: 'Kaleci', w: { kalecilik: 0.62, fizik: 0.12, pas: 0.1, kafa: 0.06, hiz: 0.1 } },
    { id: 'DF', name: 'Defans', w: { savunma: 0.36, kafa: 0.18, fizik: 0.2, hiz: 0.12, pas: 0.14 } },
    { id: 'OS', name: 'Orta Saha', w: { pas: 0.34, dribling: 0.2, sut: 0.1, savunma: 0.1, fizik: 0.1, hiz: 0.16 } },
    { id: 'FV', name: 'Forvet', w: { sut: 0.36, hiz: 0.2, dribling: 0.2, kafa: 0.12, fizik: 0.08, pas: 0.04 } }
  ];
  D.attrs = { sut: 'Şut', pas: 'Pas', dribling: 'Dribling', hiz: 'Hız', fizik: 'Fizik', savunma: 'Savunma', kafa: 'Kafa', kalecilik: 'Kalecilik' };
  D.softs = { sosyallik: 'Sosyallik', konusma: 'Konuşma', karizma: 'Karizma', liderlik: 'Liderlik', sogukkanlilik: 'Soğukkanlılık', kurnazlik: 'Kurnazlık' };
  D.lifeLabels = { enerji: 'Enerji', moral: 'Moral', mental: 'Mental', disiplin: 'Disiplin', sohret: 'Şöhret', saglik: 'Sağlık', form: 'Form' };
  D.traits = {
    hirsli: 'Hırslı', sadik: 'Sadık', paragoz: 'Paragöz', lider: 'Lider', asabi: 'Asabi', mutevazi: 'Mütevazı',
    sovmen: 'Şovmen', aile: 'Aile Babası', parti: 'Parti Adamı', gosteris: 'Gösterişçi', durust: 'Dürüst', calis: 'Çalışkan'
  };
  D.relLabels = {
    hoca: 'Hoca', takim: 'Takım', medya: 'Medya', aile: 'Aile', partner: 'Partner', menajer: 'Menajer', baskan: 'Başkan',
    taraftar: 'Taraftar', anne: 'Anne', baba: 'Baba', kardes: 'Kardeş', kaptan: 'Kaptan', kanka: 'Kanka', rakip: 'Rakip',
    gazeteci: 'Gazeteci', memleket: 'Memleket'
  };

  /* ---------- Antrenman ---------- */
  D.training = [
    { id: 'sut', name: 'Şut' }, { id: 'pas', name: 'Pas' }, { id: 'dribling', name: 'Dribling' }, { id: 'hiz', name: 'Hız' },
    { id: 'fizik', name: 'Fizik' }, { id: 'savunma', name: 'Savunma' }, { id: 'kafa', name: 'Kafa' }, { id: 'kalecilik', name: 'Kalecilik' },
    { id: 'taktik', name: 'Taktik', desc: 'Hocanın sistemi: mental ve hoca ilişkisi' }, { id: 'dinlenme', name: 'Dinlenme', desc: 'Enerji toplar, gelişim yok' }
  ];
  D.loads = { hafif: { name: 'Hafif', e: 8, g: 0.6, inj: 0 }, normal: { name: 'Normal', e: 15, g: 1, inj: 0.004 }, agir: { name: 'Ağır', e: 24, g: 1.45, inj: 0.02 } };

  /* ---------- Boş zaman etkinlikleri ---------- */
  // cost: temel fiyat, lig seviyesine göre çarpılır. risk: tetiklenebilecek olaylar
  D.activities = [
    { id: 'disari', name: 'Takımla dışarı çık', desc: 'Yemek, çay, biraz gırgır.', cost: 900,
      fx: { enerji: -12, 'r.takim': 6, 's.sosyallik': 2, moral: 4, 'r.kanka': 3 },
      risk: [{ ev: 'act_paparazzi', p: 0.07, if: { stat: { sohret: ['>', 30] } } }, { ev: 'act_kavga_disari', p: 0.04 }] },
    { id: 'gece', name: 'Gece kulübü', desc: 'Müzik, ışıklar, yeni insanlar.', cost: 2500,
      fx: { enerji: -24, moral: 8, disiplin: -3, sohret: 1, 's.sosyallik': 1, 's.karizma': 1, 't.parti': 1 },
      hoca: { diktator: -6, babacan: -2, _: -3 },
      risk: [{ ev: 'act_gece_paparazzi', p: 0.15, if: { stat: { sohret: ['>', 15] } } }, { ev: 'partner_tanis_gece', p: 0.22, if: { partner: 'none' } }, { ev: 'act_gece_kavga', p: 0.05 }, { ev: 'act_gece_kiskanc', p: 0.25, if: { partner: 'any' } }] },
    { id: 'ekstra', name: 'Ekstra bireysel antrenman', desc: 'Herkes gidince sahada kalırsın.', cost: 0,
      fx: { enerji: -14, 'r.hoca': 2, 't.calis': 1 }, train: 0.7, injury: 0.015 },
    { id: 'aile', name: 'Aileyi ziyaret et / ara', desc: 'Uzaktaysan görüntülü arama, yakındaysan sofraya otur.', cost: 600,
      fx: { 'r.aile': 6, mental: 3, moral: 3, enerji: -4, 'r.anne': 3 }, risk: [{ ev: 'aile_sofra_baski', p: 0.2 }] },
    { id: 'partner', name: 'Partnerle buluş', desc: 'Akşam yemeği, sahil yürüyüşü, belki sinema.', cost: 1800, if: { partner: 'any' },
      fx: { 'r.partner': 8, moral: 6, enerji: -6 }, partnerDate: true },
    { id: 'tanis', name: 'Arkadaş ortamına katıl', desc: 'Ortak arkadaşların doğum günü. Kim bilir kimle tanışırsın.', cost: 1200, if: { partner: 'none' },
      fx: { 's.sosyallik': 2, moral: 3, enerji: -8 }, risk: [{ ev: 'partner_tanis_arkadas', p: 0.35 }] },
    { id: 'uyku', name: 'Erken yat, dinlen', desc: 'Telefon kapalı, perdeler kapalı.', cost: 0,
      fx: { enerji: 18, saglik: 2 } },
    { id: 'kitap', name: 'Kitap oku / kursa git', desc: 'Kafanı futboldan biraz uzaklaştırırsın.', cost: 400,
      fx: { mental: 3, 's.konusma': 2, 's.kurnazlik': 1, enerji: -3 } },
    { id: 'dil', name: 'Dil kursu (İngilizce)', desc: 'Yurt dışı hayali olanlar için.', cost: 1500,
      fx: { 's.konusma': 1, 'dil': 6, enerji: -4, mental: 1 } },
    { id: 'analiz', name: 'Video analiz', desc: 'Rakibin ve kendi maçlarını izlersin.', cost: 0,
      fx: { 'r.hoca': 3, mental: 2, enerji: -3, form: 1 } },
    { id: 'yoga', name: 'Esneme ve yoga', desc: 'Vücudun sana teşekkür eder.', cost: 500,
      fx: { saglik: 4, enerji: 4, mental: 1, 'r.takim': -1 } },
    { id: 'sponsor', name: 'Sponsor çekimi', desc: 'Kamera karşısında gülümse, para kazan.', cost: 0, if: { followers: ['>', 40000], stat: { sohret: ['>', 35] }, tier: [1, 2], orAbroad: true },
      fx: { enerji: -10, sohret: 2, 't.paragoz': 1 }, income: 'sponsor', hoca: { diktator: -3, _: -1 }, risk: [{ ev: 'act_sponsor_tepki', p: 0.15 }] },
    { id: 'roportaj', name: 'Röportaj ver', desc: 'Bir spor sitesi seninle konuşmak istiyor.', cost: 0,
      fx: { 'r.medya': 4, sohret: 2, enerji: -5 }, interview: true },
    { id: 'hayir', name: 'Hayır işi / okul ziyareti', desc: 'Çocuklara forma dağıtır, top oynarsın.', cost: 3000,
      fx: { 'r.taraftar': 5, 's.karizma': 2, moral: 4, sohret: 1, enerji: -6, 'r.medya': 2 } },
    { id: 'imza', name: 'Taraftarla imza günü', desc: 'Selfie, imza, sarılmalar.', cost: 0,
      fx: { 'r.taraftar': 6, 'takipci%': 2, enerji: -9, 's.karizma': 1 }, risk: [{ ev: 'act_imza_protesto', p: 0.25, if: { formBelow: -3 } }] },
    { id: 'yayin', name: 'Oyun yayını aç', desc: 'Konsol başında takipçilerinle sohbet.', cost: 0,
      fx: { 'takipci%': 3, moral: 4, enerji: -6, 's.sosyallik': 1 }, hoca: { diktator: -2, _: 0 }, risk: [{ ev: 'act_yayin_gaf', p: 0.1 }] },
    { id: 'psikolog', name: 'Psikologla görüş', desc: 'Kafandakileri birine anlatmak iyi gelir.', cost: 4000,
      fx: { mental: 8, moral: 3, 's.sogukkanlilik': 2 }, risk: [{ ev: 'act_psikolog_dedikodu', p: 0.15, if: { tier: [4, 5] } }] },
    { id: 'memleket', name: 'Memlekete git', desc: 'Kahvede çay, çocukluk sahası, akrabalar.', cost: 3500,
      fx: { 'r.memleket': 8, 'r.aile': 5, mental: 4, enerji: -14, moral: 4 }, risk: [{ ev: 'memleket_borc', p: 0.2, if: { stat: { sohret: ['>', 25] } } }] },
    { id: 'kahve', name: 'Kahvede okey', desc: 'Takımın yarısı orada. Çay bedava, laf bol.', cost: 100, if: { tier: [4, 5] },
      fx: { 'r.takim': 4, 's.sosyallik': 2, moral: 3, enerji: -4 } },
    { id: 'brunch', name: 'Sahilde brunch', desc: 'Görmek ve görülmek.', cost: 6000, if: { tier: [1, 2], orAbroad: true },
      fx: { sohret: 2, 'takipci%': 2, moral: 3, enerji: -4, 't.gosteris': 1 }, risk: [{ ev: 'act_paparazzi', p: 0.2 }] }
  ];
  // Etkinlik fiyat çarpanı (lig seviyesine göre yaşam pahalılığı)
  D.costMul = { TR: [12, 5, 2.5, 1.4, 1], abroad: 20 };

  /* ---------- Kökenin kalıcı etkileri ----------
     train: özelliğe göre antrenman XP çarpanı (_ = hepsi), fame: şöhret kazanma çarpanı */
  D.originMods = {
    koy: { train: { fizik: 1.3, hiz: 1.1, savunma: 1.1 }, desc: 'Fizik antrenmanlarından %30 fazla XP' },
    akademi: { train: { pas: 1.2, dribling: 1.2, sut: 1.1 }, fame: 1.2, desc: 'Teknik antrenmanlardan %20 fazla XP, şöhret daha hızlı' },
    gurbetci: { train: { savunma: 1.2, pas: 1.15, _: 1.05 }, desc: 'Disiplinli: tüm antrenmanlar %5, savunma %20 fazla XP' },
    mahalle: { train: { dribling: 1.35, sut: 1.15, hiz: 1.1 }, desc: 'Dribling antrenmanlarından %35 fazla XP' },
    miras: { train: { _: 1.05, kafa: 1.15 }, fame: 1.35, desc: 'Soyadı sayesinde şöhret %35 daha hızlı' },
    gec: { train: { _: 1.15 }, desc: 'Geç gelişen: tüm antrenmanlarda %15 fazla XP, 24–30 yaşta düşüş daha yavaş' },
    balikci: { train: { hiz: 1.35, fizik: 1.15 }, desc: 'Hız antrenmanlarından %35 fazla XP' },
    sakat: { train: { pas: 1.2, sut: 1.15, _: 1.05 }, desc: 'Oyun zekâsı: pas ve şuttan fazla XP, ama sakatlık riski yüksek' }
  };

  /* ---------- Mağaza ---------- */
  // weekly: her hafta uygulanan etkiler; income: [min,max] haftalık gelir; house/car: en iyisi sayılır
  D.shopCats = [
    { id: 'ulasim', name: 'Ulaşım' }, { id: 'konut', name: 'Konut' }, { id: 'gorunum', name: 'Görünüm' }, { id: 'pro', name: 'Profesyonel' },
    { id: 'aile', name: 'Aile' }, { id: 'hediye', name: 'Hediye' }, { id: 'yatirim', name: 'Yatırım' }, { id: 'efsane', name: 'Efsane' }
  ];
  D.shop = [
    // Ulaşım
    { id: 'otobus', cat: 'ulasim', name: 'Otobüs kartı', price: 1500, upkeep: 0, lux: 0, desc: 'Antrenmana otobüsle gidersin. Kimse seni tanımaz.' },
    { id: 'bisiklet', cat: 'ulasim', name: 'Bisiklet', price: 9000, upkeep: 0, lux: 0, fx: { saglik: 2 }, desc: 'Hem ulaşım hem kondisyon.' },
    { id: 'motor', cat: 'ulasim', name: 'Motosiklet', price: 85000, upkeep: 600, lux: 1, fx: { moral: 4 }, risk: 'motor_kaza', desc: 'Özgürlük hissi. Hoca pek sevmez.' },
    { id: 'araba1', cat: 'ulasim', name: 'İkinci el araba', price: 650000, upkeep: 2500, lux: 1, fx: { moral: 5, 'r.aile': 2 }, desc: 'Kaportası biraz çizik ama senin.' },
    { id: 'sedan', cat: 'ulasim', name: 'Sıfır sedan', price: 2.4e6, upkeep: 7000, lux: 2, fx: { moral: 6, sohret: 1 }, desc: 'Ailene yakışır, bagajı geniş.' },
    { id: 'suv', cat: 'ulasim', name: 'Lüks SUV', price: 6.5e6, upkeep: 18000, lux: 3, fx: { sohret: 2, moral: 6 }, desc: 'Antrenman otoparkının en büyüğü.' },
    { id: 'spor', cat: 'ulasim', name: 'Spor araba', price: 14e6, upkeep: 45000, lux: 4, fx: { sohret: 4, 'takipci%': 3, moral: 8 }, desc: 'Sıfırdan yüze 3 saniye. Taraftar her şeyi görür.' },
    { id: 'super', cat: 'ulasim', name: 'İtalyan süper araba', price: 48e6, upkeep: 140000, lux: 5, fx: { sohret: 6, 'takipci%': 5, moral: 8 }, desc: 'Kapısı yukarı açılır. Hocan yukarı bakmaz.' },
    { id: 'altin', cat: 'ulasim', name: 'Altın kaplama süper araba', price: 140e6, upkeep: 420000, lux: 6, fx: { sohret: 8, 'takipci%': 9 }, desc: 'Görgüsüzlüğün zirvesi. Sosyal medya bayılacak, ya da bayılacak.' },
    { id: 'heli', cat: 'ulasim', name: 'Helikopter', price: 320e6, upkeep: 1.6e6, lux: 6, fx: { sohret: 8, enerji: 6 }, weekly: { enerji: 3 }, desc: 'Deplasmanlara trafiksiz gidersin.' },
    { id: 'jet', cat: 'ulasim', name: 'Özel jet', price: 1.4e9, upkeep: 4e6, lux: 7, fx: { sohret: 12, 'takipci%': 10 }, weekly: { enerji: 4 }, desc: 'Milli maç arasında Dubai\'de kahvaltı.' },
    // Konut
    { id: 'kiralik', cat: 'konut', name: 'Kiralık 1+1 daire', price: 15000, upkeep: 4000, house: 1, desc: 'Kendi kapın, kendi anahtarın.', weekly: { moral: 1 } },
    { id: 'kiralik2', cat: 'konut', name: 'Kiralık 3+1 daire', price: 45000, upkeep: 9000, house: 1, desc: 'Ailen ziyarete gelince yatacak yer var.', weekly: { moral: 1, enerji: 1 } },
    { id: 'ilkev', cat: 'konut', name: 'İlk evin (ilçede 2+1)', price: 2.8e6, upkeep: 3000, house: 2, desc: 'Tapusu senin. Kira derdi bitti.', weekly: { moral: 1, enerji: 1, mental: 0.5 } },
    { id: 'merkez', cat: 'konut', name: 'Şehir merkezinde 3+1', price: 5.2e6, upkeep: 6000, house: 2, lux: 1, desc: 'Antrenmana yakın, kafelere yakın.', weekly: { moral: 1, enerji: 2 } },
    { id: 'site', cat: 'konut', name: 'Site dairesi', price: 9e6, upkeep: 22000, house: 2, lux: 2, weekly: { moral: 1, enerji: 2 }, desc: 'Havuz, güvenlik, otopark.' },
    { id: 'rezidans', cat: 'konut', name: 'Rezidans katı', price: 28e6, upkeep: 70000, house: 3, lux: 3, weekly: { moral: 2, enerji: 3 }, desc: 'Şehir ayaklarının altında.' },
    { id: 'villa', cat: 'konut', name: 'Bahçeli villa', price: 95e6, upkeep: 220000, house: 4, lux: 4, weekly: { moral: 2, enerji: 4, mental: 1 }, desc: 'Bahçede mangal, salonda sinema.' },
    { id: 'yali', cat: 'konut', name: 'Boğaz manzaralı yalı', price: 900e6, upkeep: 2e6, house: 5, lux: 6, fx: { sohret: 8 }, weekly: { moral: 3, enerji: 5, mental: 1 }, desc: 'Önünden vapurlar geçer.' },
    { id: 'ada', cat: 'konut', name: 'Özel ada', price: 3.5e9, upkeep: 6e6, house: 6, lux: 7, fx: { sohret: 15, 'takipci%': 12 }, weekly: { moral: 4, enerji: 6, mental: 2 }, desc: 'Ege\'de, adı senin soyadın.' },
    // Görünüm
    { id: 'sac', cat: 'gorunum', name: 'Yeni saç modeli', price: 2500, consumable: true, fx: { 'takipci%': 2, moral: 2 }, feed: 'sac', desc: 'Berberin "bu sezon bu moda" dedi.' },
    { id: 'dovme', cat: 'gorunum', name: 'Kol dövmesi', price: 18000, fx: { 'takipci%': 2, 't.sovmen': 1, 'r.aile': -3 }, feed: 'dovme', desc: 'Annen görmesin.' },
    { id: 'takim', cat: 'gorunum', name: 'Terzi takım elbise', price: 180000, fx: { 's.karizma': 3 }, desc: 'Basın toplantısına yakışır.' },
    { id: 'marka', cat: 'gorunum', name: 'Marka kıyafet dolabı', price: 650000, lux: 2, fx: { 's.karizma': 2, sohret: 1, 't.gosteris': 1 }, desc: 'Her antrenmana başka bir ceket.' },
    { id: 'zincir', cat: 'gorunum', name: 'Altın zincir', price: 450000, lux: 2, fx: { 'takipci%': 2, 't.gosteris': 1 }, feed: 'luks', desc: 'Göğsünde parlar.' },
    { id: 'saat', cat: 'gorunum', name: 'İsviçre saati', price: 1.2e6, lux: 3, fx: { sohret: 2, 't.gosteris': 1 }, feed: 'luks', desc: 'Kolundaki ev.' },
    // Profesyonel
    { id: 'antrenor', cat: 'pro', name: 'Kişisel antrenör', price: 20000, upkeep: 30000, trainMul: 1.25, desc: 'Antrenman gelişimi %25 artar.' },
    { id: 'diyet', cat: 'pro', name: 'Diyetisyen', price: 5000, upkeep: 12000, weekly: { saglik: 1, enerji: 3 }, desc: 'Lahmacun yok, kinoa var.' },
    { id: 'fizyo', cat: 'pro', name: 'Özel fizyoterapist', price: 15000, upkeep: 40000, injMul: 0.65, desc: 'Sakatlık riski belirgin azalır.' },
    { id: 'sef', cat: 'pro', name: 'Özel şef', price: 30000, upkeep: 75000, weekly: { enerji: 5, saglik: 1, moral: 1 }, desc: 'Her öğün ölçülü ve lezzetli.' },
    { id: 'salon', cat: 'pro', name: 'Ev spor salonu', price: 1.8e6, weekly: { 'a.fizik': 0.15 }, desc: 'Gece yarısı ağırlık kaldırırsın.' },
    { id: 'oksijen', cat: 'pro', name: 'Oksijen odası', price: 12e6, upkeep: 20000, weekly: { enerji: 5, saglik: 2 }, injMul: 0.85, desc: 'Yıldızların toparlanma sırrı.' },
    // Aile
    { id: 'bilezik', cat: 'aile', name: 'Anneye bilezik', price: 90000, consumable: true, fx: { 'r.anne': 10, 'r.aile': 6, moral: 3 }, desc: 'Gözleri dolar.' },
    { id: 'okulparasi', cat: 'aile', name: 'Kardeşin okul parası', price: 600000, consumable: true, fx: { 'r.kardes': 15, 'r.aile': 10, mental: 3 }, desc: 'Bir yıl boyunca dert yok.' },
    { id: 'traktor', cat: 'aile', name: 'Babaya traktör', price: 1.8e6, fx: { 'r.baba': 18, 'r.aile': 10, 'r.memleket': 5 }, desc: 'Köyde herkes konuşur.' },
    { id: 'dukkan', cat: 'aile', name: 'Babaya dükkan', price: 4e6, income: [2000, 9000], fx: { 'r.baba': 20, 'r.aile': 12 }, desc: 'Esnaf olur, emekliliği güvencede.' },
    { id: 'anneev', cat: 'aile', name: 'Ailene ev', price: 8e6, fx: { 'r.anne': 25, 'r.baba': 15, 'r.aile': 20, mental: 6 }, desc: 'Kira derdi bitti.' },
    { id: 'cesme', cat: 'aile', name: 'Memlekete çeşme', price: 3e6, fx: { 'r.memleket': 20, 'r.taraftar': 4, sohret: 2 }, desc: 'Üstünde adın yazar.' },
    { id: 'okul', cat: 'aile', name: 'Memlekete okul', price: 25e6, fx: { 'r.memleket': 40, 'r.taraftar': 10, sohret: 5, 'r.medya': 6, mental: 5 }, flag: 'okul_yaptirdi', desc: 'Çocuklar senin adını taşıyan okulda okur.' },
    // Hediye (tek kullanımlık)
    { id: 'cicek', cat: 'hediye', name: 'Çiçek', price: 1500, consumable: true, gift: 'partner', fx: { 'r.partner': 3 }, desc: 'Küçük ama etkili.' },
    { id: 'parfum', cat: 'hediye', name: 'Parfüm', price: 9000, consumable: true, gift: 'partner', fx: { 'r.partner': 6 }, desc: 'Kokusunu seçmek için yarım saat düşündün.' },
    { id: 'kolye', cat: 'hediye', name: 'Pırlanta kolye', price: 180000, consumable: true, gift: 'partner', fx: { 'r.partner': 14 }, desc: 'Kutuyu açınca sessizlik.' },
    { id: 'tatil', cat: 'hediye', name: 'Sürpriz tatil', price: 900000, consumable: true, gift: 'partner', fx: { 'r.partner': 20, enerji: 10, moral: 8 }, desc: 'Maçsız bir haftayı Maldivler\'de geçirirsin.' },
    { id: 'arabahediye', cat: 'hediye', name: 'Partnere araba', price: 3e6, consumable: true, gift: 'partner', fx: { 'r.partner': 30, sohret: 2 }, feed: 'luks', desc: 'Kurdeleli, kapının önünde.' },
    // Yatırım
    { id: 'kafe', cat: 'yatirim', name: 'Kafe', price: 4e6, income: [-5000, 40000], risk: 'kafe_sorun', desc: 'Adını sen koyarsın.' },
    { id: 'halisaha', cat: 'yatirim', name: 'Halı saha tesisi', price: 9e6, income: [10000, 60000], fx: { 'r.memleket': 5 }, desc: 'Akşamları dolu, kışın biraz boş.' },
    { id: 'restoran', cat: 'yatirim', name: 'Restoran ortaklığı', price: 15e6, income: [-30000, 120000], risk: 'restoran_ortak', desc: 'Bir arkadaşınla ortak. Ne kadar güvenirsin?' },
    { id: 'gayrimenkul', cat: 'yatirim', name: 'Gayrimenkul portföyü', price: 120e6, income: [250000, 650000], desc: 'Kira gelirleri düzenli akar.' },
    { id: 'futbolokulu', cat: 'yatirim', name: 'Kendi futbol okulun', price: 25e6, income: [20000, 80000], fx: { 'r.taraftar': 6, 'r.medya': 4 }, flag: 'futbol_okulu', desc: 'Belki bir gün çocuğun da burada başlar.' },
    // Efsane
    { id: 'yat', cat: 'efsane', name: 'Yat', price: 650e6, upkeep: 1.5e6, lux: 7, fx: { sohret: 10, 'takipci%': 8, moral: 10 }, weekly: { moral: 2 }, feed: 'luks', desc: 'Yaz tatillerinin yeni adresi.' },
    { id: 'heykel', cat: 'efsane', name: 'Kendi heykelin', price: 35e6, lux: 6, fx: { sohret: 6, 'r.taraftar': -4, 'r.takim': -4, 't.gosteris': 2 }, feed: 'heykel', desc: 'Memleketin meydanında, bronzdan.' },
    { id: 'markam', cat: 'efsane', name: 'Kendi giyim markan', price: 60e6, incomeFollowers: 0.5, fx: { sohret: 4 }, desc: 'Gelir takipçi sayınla büyür.' },
    { id: 'kulup', cat: 'efsane', name: 'Memleketinin kulübünü satın al', price: 0, special: 'kulup', desc: 'Çocukken tribününe girmek için duvardan atladığın kulüp artık senin.' }
  ];

  /* ---------- Rutinler ---------- */
  D.routines = {
    uyku: { name: 'Uyku düzeni', opts: { erken: { name: 'Erken yat', fx: { enerji: 6, 's.sosyallik': -0.3 } }, normal: { name: 'Normal', fx: {} }, gec: { name: 'Geç yat', fx: { enerji: -6, moral: 1, 's.sosyallik': 0.3 } } } },
    beslenme: { name: 'Beslenme', opts: { siki: { name: 'Sıkı diyet', fx: { saglik: 1, moral: -1 }, cost: 1500 }, normal: { name: 'Normal', fx: {} }, serbest: { name: 'Serbest', fx: { moral: 1, saglik: -1 } } } },
    kosu: { name: 'Sabah koşusu', opts: { evet: { name: 'Her sabah', fx: { 'a.fizik': 0.08, enerji: -3 } }, hayir: { name: 'Yok', fx: {} } } }
  };

  /* ---------- Sezon hedefleri ---------- */
  D.goals = [
    { id: 'gol10', name: '10 gol at', pos: ['FV', 'OS'], test: (st) => st.goals >= 10, reward: { moral: 10, sohret: 3 } },
    { id: 'gol20', name: '20 gol at', pos: ['FV'], test: (st) => st.goals >= 20, reward: { moral: 12, sohret: 6 } },
    { id: 'asist8', name: '8 asist yap', pos: ['OS', 'FV'], test: (st) => st.assists >= 8, reward: { moral: 10, 'r.takim': 6 } },
    { id: 'clean', name: '10 maçta gol yeme', pos: ['KL', 'DF'], test: (st) => st.clean >= 10, reward: { moral: 10, 'r.hoca': 8 } },
    { id: 'mac25', name: '25 maçta forma giy', test: (st) => st.apps >= 25, reward: { moral: 8, 'r.hoca': 5 } },
    { id: 'not7', name: 'Sezon ortalaması 7.0+', test: (st) => st.apps >= 10 && st.ratingSum / st.apps >= 7, reward: { moral: 10, sohret: 4 } },
    { id: 'takip', name: 'Takipçini ikiye katla', test: (st, S) => S.P.followers >= st.followersStart * 2, reward: { 's.karizma': 3, moral: 6 } },
    { id: 'para', name: 'Sezonu artı bakiyeyle bitir', test: (st, S) => S.P.money > st.moneyStart, reward: { mental: 5 } },
    { id: 'ailemutlu', name: 'Aile ilişkisini 50\'nin üstünde tut', test: (st, S) => S.rel.aile >= 50, reward: { mental: 8 } },
    { id: 'kirmizi0', name: 'Hiç kırmızı kart görme', test: (st) => st.reds === 0 && st.apps >= 10, reward: { disiplin: 6, 'r.hoca': 4 } },
    { id: 'sampiyon', name: 'Ligde ilk 3\'e gir', test: (st, S) => st.finalPos && st.finalPos <= 3, reward: { moral: 12, sohret: 5 } },
    { id: 'milli', name: 'Milli takıma çağrıl', test: (st) => st.caps > 0, reward: { sohret: 6, moral: 10 } }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
