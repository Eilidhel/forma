/* FORMA — dünya verisi: şehirler, ligler, yabancı kulüpler, renkler */
(function (root) {
  const D = root.F.DATA;

  D.regions = {
    MAR: 'Marmara', EGE: 'Ege', AKD: 'Akdeniz', ICA: 'İç Anadolu',
    KAR: 'Karadeniz', DOG: 'Doğu Anadolu', GDA: 'Güneydoğu'
  };

  // "Ad|bölge|büyüklük(1=metropol … 5=küçük ilçe)|il"
  const PLACES = `
Bursa|MAR|1|Bursa;Kocaeli|MAR|2|Kocaeli;Sakarya|MAR|2|Sakarya;Tekirdağ|MAR|2|Tekirdağ;Balıkesir|MAR|2|Balıkesir;Çanakkale|MAR|3|Çanakkale;Edirne|MAR|3|Edirne;Kırklareli|MAR|4|Kırklareli;Yalova|MAR|4|Yalova;Bilecik|MAR|4|Bilecik
İzmir|EGE|1|İzmir;Manisa|EGE|2|Manisa;Aydın|EGE|2|Aydın;Denizli|EGE|2|Denizli;Muğla|EGE|3|Muğla;Afyon|EGE|3|Afyon;Kütahya|EGE|3|Kütahya;Uşak|EGE|3|Uşak
Antalya|AKD|1|Antalya;Adana|AKD|1|Adana;Mersin|AKD|2|Mersin;Hatay|AKD|2|Hatay;Kahramanmaraş|AKD|2|Kahramanmaraş;Osmaniye|AKD|3|Osmaniye;Isparta|AKD|3|Isparta;Burdur|AKD|4|Burdur
Ankara|ICA|1|Ankara;Konya|ICA|1|Konya;Kayseri|ICA|2|Kayseri;Eskişehir|ICA|2|Eskişehir;Sivas|ICA|2|Sivas;Yozgat|ICA|3|Yozgat;Aksaray|ICA|3|Aksaray;Niğde|ICA|3|Niğde;Nevşehir|ICA|3|Nevşehir;Kırşehir|ICA|4|Kırşehir;Kırıkkale|ICA|3|Kırıkkale;Karaman|ICA|3|Karaman;Çankırı|ICA|4|Çankırı
Samsun|KAR|1|Samsun;Ordu|KAR|2|Ordu;Giresun|KAR|2|Giresun;Rize|KAR|2|Rize;Zonguldak|KAR|2|Zonguldak;Tokat|KAR|3|Tokat;Amasya|KAR|3|Amasya;Çorum|KAR|3|Çorum;Kastamonu|KAR|3|Kastamonu;Artvin|KAR|4|Artvin;Gümüşhane|KAR|4|Gümüşhane;Bayburt|KAR|4|Bayburt;Sinop|KAR|4|Sinop;Bartın|KAR|4|Bartın;Karabük|KAR|3|Karabük;Düzce|KAR|3|Düzce;Bolu|KAR|3|Bolu
Erzurum|DOG|2|Erzurum;Malatya|DOG|2|Malatya;Elazığ|DOG|2|Elazığ;Van|DOG|2|Van;Ağrı|DOG|3|Ağrı;Kars|DOG|3|Kars;Erzincan|DOG|3|Erzincan;Muş|DOG|4|Muş;Bitlis|DOG|4|Bitlis;Bingöl|DOG|4|Bingöl;Tunceli|DOG|4|Tunceli;Iğdır|DOG|4|Iğdır;Ardahan|DOG|4|Ardahan;Hakkari|DOG|4|Hakkari
Gaziantep|GDA|1|Gaziantep;Diyarbakır|GDA|1|Diyarbakır;Şanlıurfa|GDA|2|Şanlıurfa;Mardin|GDA|3|Mardin;Batman|GDA|3|Batman;Adıyaman|GDA|3|Adıyaman;Siirt|GDA|4|Siirt;Şırnak|GDA|4|Şırnak;Kilis|GDA|4|Kilis
Üsküdar|MAR|3|İstanbul;Bakırköy|MAR|3|İstanbul;Kartal|MAR|3|İstanbul;Pendik|MAR|3|İstanbul;Maltepe|MAR|3|İstanbul;Sarıyer|MAR|3|İstanbul;Beykoz|MAR|4|İstanbul;Ümraniye|MAR|3|İstanbul;Bağcılar|MAR|4|İstanbul;Zeytinburnu|MAR|4|İstanbul;Tuzla|MAR|4|İstanbul;Silivri|MAR|4|İstanbul;Avcılar|MAR|4|İstanbul;Esenyurt|MAR|4|İstanbul;Ataşehir|MAR|4|İstanbul;Bayrampaşa|MAR|4|İstanbul;Küçükçekmece|MAR|4|İstanbul;Büyükçekmece|MAR|4|İstanbul;Sultanbeyli|MAR|5|İstanbul;Şile|MAR|5|İstanbul
Çankaya|ICA|3|Ankara;Keçiören|ICA|3|Ankara;Yenimahalle|ICA|4|Ankara;Etimesgut|ICA|4|Ankara;Sincan|ICA|4|Ankara;Polatlı|ICA|4|Ankara;Mamak|ICA|5|Ankara;Gölbaşı|ICA|5|Ankara
Bornova|EGE|3|İzmir;Buca|EGE|3|İzmir;Konak|EGE|4|İzmir;Menemen|EGE|4|İzmir;Torbalı|EGE|4|İzmir;Ödemiş|EGE|4|İzmir;Bergama|EGE|4|İzmir;Çeşme|EGE|5|İzmir;Tire|EGE|5|İzmir;Urla|EGE|5|İzmir;Çiğli|EGE|4|İzmir;Bayraklı|EGE|4|İzmir
Nilüfer|MAR|3|Bursa;İnegöl|MAR|4|Bursa;Gemlik|MAR|4|Bursa;Mudanya|MAR|5|Bursa;Mustafakemalpaşa|MAR|5|Bursa
Alanya|AKD|3|Antalya;Manavgat|AKD|4|Antalya;Serik|AKD|4|Antalya;Kemer|AKD|5|Antalya;Kepez|AKD|4|Antalya;Kumluca|AKD|5|Antalya
Gebze|MAR|3|Kocaeli;Gölcük|MAR|4|Kocaeli;Körfez|MAR|4|Kocaeli;Darıca|MAR|5|Kocaeli
Ceyhan|AKD|4|Adana;Kozan|AKD|4|Adana;Seyhan|AKD|4|Adana
Ereğli|ICA|4|Konya;Akşehir|ICA|5|Konya;Beyşehir|ICA|5|Konya;Selçuklu|ICA|4|Konya
Nizip|GDA|4|Gaziantep;İslahiye|GDA|5|Gaziantep;Siverek|GDA|4|Şanlıurfa;Viranşehir|GDA|5|Şanlıurfa;Ergani|GDA|5|Diyarbakır;Bismil|GDA|5|Diyarbakır;Kızıltepe|GDA|4|Mardin;Midyat|GDA|5|Mardin
Tarsus|AKD|3|Mersin;Erdemli|AKD|5|Mersin;Silifke|AKD|5|Mersin;Anamur|AKD|5|Mersin;İskenderun|AKD|3|Hatay;Dörtyol|AKD|5|Hatay
Bafra|KAR|4|Samsun;Çarşamba|KAR|4|Samsun;Atakum|KAR|4|Samsun;Terme|KAR|5|Samsun;Akçaabat|KAR|4|Trabzon;Of|KAR|5|Trabzon;Araklı|KAR|5|Trabzon;Ünye|KAR|4|Ordu;Fatsa|KAR|4|Ordu;Çayeli|KAR|5|Rize;Ardeşen|KAR|5|Rize;Hopa|KAR|5|Artvin;Karadeniz Ereğli|KAR|4|Zonguldak
Erciş|DOG|4|Van;Doğubayazıt|DOG|5|Ağrı;Patnos|DOG|5|Ağrı;Sarıkamış|DOG|5|Kars;Horasan|DOG|5|Erzurum;Oltu|DOG|5|Erzurum;Tatvan|DOG|5|Bitlis;Battalgazi|DOG|4|Malatya;Kovancılar|DOG|5|Elazığ
Bandırma|MAR|3|Balıkesir;Edremit|MAR|4|Balıkesir;Ayvalık|MAR|5|Balıkesir;Gönen|MAR|5|Balıkesir;Fethiye|EGE|4|Muğla;Bodrum|EGE|4|Muğla;Marmaris|EGE|5|Muğla;Milas|EGE|4|Muğla;Kuşadası|EGE|4|Aydın;Söke|EGE|4|Aydın;Nazilli|EGE|4|Aydın;Didim|EGE|5|Aydın;Turgutlu|EGE|4|Manisa;Akhisar|EGE|4|Manisa;Salihli|EGE|4|Manisa;Soma|EGE|5|Manisa;Çivril|EGE|5|Denizli;Çorlu|MAR|3|Tekirdağ;Çerkezköy|MAR|4|Tekirdağ;Lüleburgaz|MAR|4|Kırklareli;Keşan|MAR|5|Edirne;Biga|MAR|5|Çanakkale
Talas|ICA|4|Kayseri;Develi|ICA|5|Kayseri;Elbistan|AKD|4|Kahramanmaraş;Şarkışla|ICA|5|Sivas;Erbaa|KAR|5|Tokat;Niksar|KAR|5|Tokat`;

  D.places = PLACES.trim().split(/[\n;]+/).map((row) => {
    const [name, region, size, province] = row.trim().split('|');
    return { name, region, size: +size, province };
  });

  // Bilinen renk eşleşmeleri (renkler serbest; isimler kurgusal)
  D.palette = [
    ['#C8102E', '#FFFFFF', 'Kırmızı-Beyaz'], ['#006A4E', '#FFFFFF', 'Yeşil-Beyaz'], ['#1D3C8F', '#FFFFFF', 'Lacivert-Beyaz'],
    ['#5B2C83', '#FFFFFF', 'Mor-Beyaz'], ['#F2C200', '#111111', 'Sarı-Siyah'], ['#7A1F2B', '#4FA3D9', 'Bordo-Mavi'],
    ['#111111', '#FFFFFF', 'Siyah-Beyaz'], ['#E35205', '#1A1A1A', 'Turuncu-Siyah'], ['#00843D', '#C8102E', 'Yeşil-Kırmızı'],
    ['#0A6CB3', '#F2C200', 'Mavi-Sarı'], ['#8A1538', '#F2C200', 'Bordo-Sarı'], ['#C8102E', '#111111', 'Kırmızı-Siyah'],
    ['#4FA3D9', '#FFFFFF', 'Gök Mavi-Beyaz'], ['#C8102E', '#1D3C8F', 'Kırmızı-Lacivert'], ['#006A4E', '#111111', 'Yeşil-Siyah'],
    ['#F2C200', '#1D3C8F', 'Sarı-Lacivert'], ['#F2C200', '#C8102E', 'Sarı-Kırmızı'], ['#006A4E', '#0A6CB3', 'Yeşil-Mavi']
  ];
  D.colorOverride = {
    Bursa: 'Yeşil-Beyaz', Kocaeli: 'Yeşil-Siyah', Konya: 'Yeşil-Beyaz', Antalya: 'Kırmızı-Beyaz', Eskişehir: 'Kırmızı-Siyah',
    Samsun: 'Kırmızı-Beyaz', Ankara: 'Sarı-Lacivert', Gaziantep: 'Kırmızı-Siyah', Kayseri: 'Sarı-Kırmızı', Rize: 'Yeşil-Mavi',
    Sivas: 'Kırmızı-Beyaz', İzmir: 'Siyah-Beyaz', Sakarya: 'Yeşil-Siyah', Malatya: 'Sarı-Kırmızı', Denizli: 'Yeşil-Siyah',
    Adana: 'Mavi-Sarı', Diyarbakır: 'Yeşil-Kırmızı', Erzurum: 'Mavi-Sarı', Giresun: 'Yeşil-Beyaz', Manisa: 'Mor-Beyaz',
    Bornova: 'Sarı-Kırmızı', Çorum: 'Kırmızı-Siyah', Elazığ: 'Bordo-Sarı', Kars: 'Sarı-Siyah', Hatay: 'Bordo-Sarı'
  };

  // Büyük kulüpler: PES tarzı isim, gerçek renkler
  D.specials = [
    { name: 'İstanbul Sarı-Kırmızı', region: 'MAR', province: 'İstanbul', str: 83, colors: ['#A90432', '#FDB912'], colorName: 'Sarı-Kırmızı', stadium: 'Florya Arena', fans: 5, fin: 4, academy: 5 },
    { name: 'İstanbul Sarı-Lacivert', region: 'MAR', province: 'İstanbul', str: 82, colors: ['#F7D917', '#163A70'], colorName: 'Sarı-Lacivert', stadium: 'Kadıköy Arena', fans: 5, fin: 4, academy: 5 },
    { name: 'İstanbul Siyah-Beyaz', region: 'MAR', province: 'İstanbul', str: 80, colors: ['#111111', '#FFFFFF'], colorName: 'Siyah-Beyaz', stadium: 'Dolmabahçe Arena', fans: 5, fin: 3, academy: 4 },
    { name: 'Trabzon', region: 'KAR', province: 'Trabzon', str: 77, colors: ['#6E1423', '#5BA4DA'], colorName: 'Bordo-Mavi', stadium: 'Karadeniz Arena', fans: 5, fin: 3, academy: 4 }
  ];

  /* ---------- Lig yapısı ---------- */
  D.leagues = {
    TR: {
      name: 'Türkiye', flag: 'TR',
      tiers: [
        { name: 'Süper Lig', groups: 1, size: 18, up: 0, down: 3, str: [69, 84], wage: [450e3, 3.2e6] },
        { name: '1. Lig', groups: 1, size: 18, up: 3, down: 4, str: [60, 71], wage: [110e3, 450e3] },
        { name: '2. Lig', groups: 2, size: 18, up: 4, down: 6, str: [52, 62], wage: [35e3, 120e3], groupNames: ['Beyaz Grup', 'Kırmızı Grup'] },
        { name: '3. Lig', groups: 3, size: 16, up: 6, down: 4, str: [44, 54], wage: [12e3, 40e3], groupNames: ['1. Grup', '2. Grup', '3. Grup'] },
        { name: 'Bölgesel Amatör Lig', short: 'BAL', groups: 4, size: 14, up: 4, down: 0, str: [33, 46], wage: [4e3, 13e3], groupNames: ['1. Grup', '2. Grup', '3. Grup', '4. Grup'], regional: true }
      ]
    },
    EN: { name: 'İngiltere', flag: 'EN', tiers: [{ name: 'İngiltere Premier', groups: 1, size: 12, up: 0, down: 0, str: [76, 91], wage: [1.6e6, 11e6] }] },
    ES: { name: 'İspanya', flag: 'ES', tiers: [{ name: 'İspanya Birinci Lig', groups: 1, size: 12, up: 0, down: 0, str: [74, 91], wage: [1.3e6, 10e6] }] },
    DE: {
      name: 'Almanya', flag: 'DE',
      tiers: [
        { name: 'Almanya Birinci Lig', groups: 1, size: 12, up: 0, down: 2, str: [73, 89], wage: [1.2e6, 8e6] },
        { name: 'Almanya Bölge Ligi', groups: 1, size: 12, up: 2, down: 0, str: [44, 58], wage: [10e3, 40e3] }
      ]
    },
    IT: { name: 'İtalya', flag: 'IT', tiers: [{ name: 'İtalya Birinci Lig', groups: 1, size: 12, up: 0, down: 0, str: [73, 89], wage: [1.1e6, 8e6] }] }
  };

  // Yabancı kulüpler — PES tarzı isimler, gerçeğe yakın renkler
  D.foreign = {
    EN: [
      ['Merseyside Kırmızı', '#C8102E', '#F6EB61'], ['Manchester Mavi', '#6CABDD', '#FFFFFF'], ['Manchester Kırmızı', '#DA291C', '#111111'],
      ['Kuzey Londra Kırmızı', '#EF0107', '#FFFFFF'], ['Londra Mavi', '#034694', '#FFFFFF'], ['Kuzey Londra Beyaz', '#FFFFFF', '#132257'],
      ['Tyneside Siyah-Beyaz', '#111111', '#FFFFFF'], ['Midlands Bordo-Mavi', '#670E36', '#95BFE5'], ['Merseyside Mavi', '#003399', '#FFFFFF'],
      ['Doğu Londra Bordo', '#7A263A', '#1BB1E7'], ['Güney Sahili Mavi-Beyaz', '#0057B8', '#FFFFFF'], ['Nottingham Kırmızı', '#DD0000', '#FFFFFF']
    ],
    ES: [
      ['Madrid Beyaz', '#FFFFFF', '#FEBE10'], ['Katalonya Bordo-Mavi', '#A50044', '#004D98'], ['Madrid Kırmızı-Beyaz', '#CB3524', '#FFFFFF'],
      ['Endülüs Beyaz-Kırmızı', '#FFFFFF', '#D71920'], ['Endülüs Yeşil', '#00954C', '#FFFFFF'], ['Bask Kırmızı-Beyaz', '#EE2523', '#FFFFFF'],
      ['Bask Mavi-Beyaz', '#0067B1', '#FFFFFF'], ['Valencia Beyaz-Siyah', '#FFFFFF', '#111111'], ['Castellón Sarı', '#FFE667', '#005187'],
      ['Vigo Gök Mavi', '#8AC3EE', '#FFFFFF'], ['Mayorka Kırmızı-Siyah', '#E20613', '#111111'], ['Kanarya Sarı-Mavi', '#FFE400', '#0059A0']
    ],
    DE: [
      ['Bavyera Kırmızı', '#DC052D', '#FFFFFF'], ['Ruhr Sarı-Siyah', '#FDE100', '#111111'], ['Ren Kırmızı-Siyah', '#E32221', '#111111'],
      ['Saksonya Kırmızı-Beyaz', '#DD0741', '#FFFFFF'], ['Main Siyah-Kırmızı', '#111111', '#E1000F'], ['Swabya Beyaz-Kırmızı', '#FFFFFF', '#E32219'],
      ['Ren Yeşil-Beyaz', '#00A54F', '#FFFFFF'], ['Aşağı Saksonya Yeşil', '#65B32E', '#FFFFFF'], ['Kuzey Limanı Yeşil', '#1D9053', '#FFFFFF'],
      ['Köln Kırmızı-Beyaz', '#ED1C24', '#FFFFFF'], ['Berlin Mavi-Beyaz', '#005CA9', '#FFFFFF'], ['Ruhr Mavi-Beyaz', '#004D9D', '#FFFFFF']
    ],
    DE2: [
      ['Duisburg Liman', '#0A6CB3', '#FFFFFF'], ['Essen Kuzey', '#C8102E', '#FFFFFF'], ['Gelsenkirchen Gençlik', '#1D3C8F', '#FFFFFF'],
      ['Dortmund Hörde', '#F2C200', '#111111'], ['Köln Mülheim', '#C8102E', '#111111'], ['Mannheim Doğu', '#006A4E', '#FFFFFF'],
      ['Offenbach Yıldız', '#C8102E', '#FFFFFF'], ['Wuppertal Vadi', '#5B2C83', '#FFFFFF'], ['Aachen Sınır', '#F2C200', '#111111'],
      ['Bochum Kuzey', '#0A6CB3', '#FFFFFF'], ['Duisburg Marxloh', '#006A4E', '#C8102E'], ['Hamburg Wilhelmsburg', '#111111', '#FFFFFF']
    ],
    IT: [
      ['Torino Siyah-Beyaz', '#111111', '#FFFFFF'], ['Milano Kırmızı-Siyah', '#FB090B', '#111111'], ['Milano Mavi-Siyah', '#010E80', '#111111'],
      ['Roma Sarı-Kırmızı', '#8E1F2F', '#F0BC42'], ['Roma Gök Mavi', '#87D8F7', '#FFFFFF'], ['Campania Mavi', '#12A0D7', '#FFFFFF'],
      ['Floransa Mor', '#482E92', '#FFFFFF'], ['Bergamo Siyah-Mavi', '#1E71B8', '#111111'], ['Bologna Kırmızı-Mavi', '#A21C26', '#1A2F48'],
      ['Torino Bordo', '#8A1E03', '#FFFFFF'], ['Cenova Kırmızı-Mavi', '#AD0B26', '#1C2D5A'], ['Udine Siyah-Beyaz', '#FFFFFF', '#111111']
    ]
  };

  D.stadiumPatterns = {
    big: ['{n} Arena', '{n} Şehir Stadı', '{n} Yeni Stadı'],
    mid: ['{n} Atatürk Stadı', '{n} 19 Mayıs Stadı', '{n} Şehir Stadı', '{n} Gençlik Stadı'],
    small: ['{n} İlçe Stadı', '{n} Belediye Sahası', '{n} Gençlik Parkı Sahası', '{n} Sentetik Saha', '{n} Köy Yolu Sahası']
  };

  // Sezon takvimi için ay adları (1. hafta Ağustos)
  D.months = ['Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz'];
})(typeof window !== 'undefined' ? window : globalThis);
