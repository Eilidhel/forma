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
    // Avrupa: Türkiye'deki gibi kademeli ligler. Üst ligde PES tarzı kulüpler, alt liglerde şehir kulüpleri.
    EN: {
      name: 'İngiltere', flag: 'EN',
      tiers: [
        { name: 'İngiltere Premier', groups: 1, size: 18, up: 0, down: 3, str: [75, 91], wage: [1.6e6, 11e6] },
        { name: 'İngiltere İkinci Lig', groups: 1, size: 18, up: 3, down: 3, str: [64, 77], wage: [300e3, 1.6e6] },
        { name: 'İngiltere Üçüncü Lig', groups: 1, size: 18, up: 3, down: 0, str: [55, 67], wage: [60e3, 300e3] }
      ]
    },
    ES: {
      name: 'İspanya', flag: 'ES',
      tiers: [
        { name: 'İspanya Birinci Lig', groups: 1, size: 18, up: 0, down: 3, str: [72, 91], wage: [1.3e6, 10e6] },
        { name: 'İspanya İkinci Lig', groups: 1, size: 18, up: 3, down: 3, str: [62, 74], wage: [200e3, 1.2e6] },
        { name: 'İspanya Üçüncü Lig', groups: 1, size: 18, up: 3, down: 0, str: [52, 64], wage: [40e3, 200e3] }
      ]
    },
    DE: {
      name: 'Almanya', flag: 'DE',
      tiers: [
        { name: 'Almanya Birinci Lig', groups: 1, size: 18, up: 0, down: 2, str: [72, 89], wage: [1.2e6, 8e6] },
        { name: 'Almanya İkinci Lig', groups: 1, size: 18, up: 2, down: 2, str: [62, 75], wage: [250e3, 1.3e6] },
        { name: 'Almanya Bölge Ligi', groups: 1, size: 18, up: 2, down: 0, str: [44, 58], wage: [10e3, 40e3], diaspora: true }
      ]
    },
    IT: {
      name: 'İtalya', flag: 'IT',
      tiers: [
        { name: 'İtalya Birinci Lig', groups: 1, size: 18, up: 0, down: 3, str: [72, 89], wage: [1.1e6, 8e6] },
        { name: 'İtalya İkinci Lig', groups: 1, size: 18, up: 3, down: 3, str: [61, 74], wage: [180e3, 1e6] },
        { name: 'İtalya Üçüncü Lig', groups: 1, size: 18, up: 3, down: 0, str: [52, 64], wage: [35e3, 180e3] }
      ]
    },
    FR: {
      name: 'Fransa', flag: 'FR',
      tiers: [
        { name: 'Fransa Birinci Lig', groups: 1, size: 18, up: 0, down: 3, str: [70, 88], wage: [900e3, 7e6] },
        { name: 'Fransa İkinci Lig', groups: 1, size: 18, up: 3, down: 0, str: [60, 72], wage: [150e3, 800e3] }
      ]
    },
    NL: {
      name: 'Hollanda', flag: 'NL',
      tiers: [
        { name: 'Hollanda Birinci Lig', groups: 1, size: 18, up: 0, down: 2, str: [65, 84], wage: [400e3, 3e6] },
        { name: 'Hollanda İkinci Lig', groups: 1, size: 18, up: 2, down: 0, str: [56, 68], wage: [60e3, 300e3] }
      ]
    },
    PT: {
      name: 'Portekiz', flag: 'PT',
      tiers: [
        { name: 'Portekiz Birinci Lig', groups: 1, size: 18, up: 0, down: 2, str: [64, 85], wage: [350e3, 3e6] },
        { name: 'Portekiz İkinci Lig', groups: 1, size: 18, up: 2, down: 0, str: [55, 67], wage: [50e3, 250e3] }
      ]
    }
  };

  // Yabancı kulüpler — PES tarzı isimler, gerçeğe yakın renkler
  D.foreign = {
    EN: [
      ['Merseyside Kırmızı', '#C8102E', '#F6EB61'], ['Manchester Mavi', '#6CABDD', '#FFFFFF'], ['Manchester Kırmızı', '#DA291C', '#111111'],
      ['Kuzey Londra Kırmızı', '#EF0107', '#FFFFFF'], ['Londra Mavi', '#034694', '#FFFFFF'], ['Kuzey Londra Beyaz', '#FFFFFF', '#132257'],
      ['Tyneside Siyah-Beyaz', '#111111', '#FFFFFF'], ['Midlands Bordo-Mavi', '#670E36', '#95BFE5'], ['Merseyside Mavi', '#003399', '#FFFFFF'],
      ['Doğu Londra Bordo', '#7A263A', '#1BB1E7'], ['Güney Sahili Mavi-Beyaz', '#0057B8', '#FFFFFF'], ['Nottingham Kırmızı', '#DD0000', '#FFFFFF'],
      ['Leeds Beyaz', '#FFFFFF', '#1D428A'], ['Midlands Turuncu-Siyah', '#FDB913', '#231F20'], ['Leicester Mavi', '#003090', '#FDBE11'],
      ['Batı Londra Beyaz', '#FFFFFF', '#111111'], ['Güney Londra Mavi-Kırmızı', '#1B458F', '#C4122E'], ['Dorset Kırmızı-Siyah', '#DA291C', '#111111']
    ],
    ES: [
      ['Madrid Beyaz', '#FFFFFF', '#FEBE10'], ['Katalonya Bordo-Mavi', '#A50044', '#004D98'], ['Madrid Kırmızı-Beyaz', '#CB3524', '#FFFFFF'],
      ['Endülüs Beyaz-Kırmızı', '#FFFFFF', '#D71920'], ['Endülüs Yeşil', '#00954C', '#FFFFFF'], ['Bask Kırmızı-Beyaz', '#EE2523', '#FFFFFF'],
      ['Bask Mavi-Beyaz', '#0067B1', '#FFFFFF'], ['Valencia Beyaz-Siyah', '#FFFFFF', '#111111'], ['Castellón Sarı', '#FFE667', '#005187'],
      ['Vigo Gök Mavi', '#8AC3EE', '#FFFFFF'], ['Mayorka Kırmızı-Siyah', '#E20613', '#111111'], ['Kanarya Sarı-Mavi', '#FFE400', '#0059A0'],
      ['Pamplona Kırmızı', '#D91A21', '#0A346F'], ['Madrid Güney Mavi', '#005999', '#FFFFFF'], ['Vallecas Beyaz-Kırmızı', '#FFFFFF', '#E53027'],
      ['Girona Kırmızı-Beyaz', '#CD2534', '#FFFFFF'], ['Barselona Mavi-Beyaz', '#007FC8', '#FFFFFF'], ['Vitoria Mavi-Beyaz', '#0B3C8C', '#FFFFFF']
    ],
    DE: [
      ['Bavyera Kırmızı', '#DC052D', '#FFFFFF'], ['Ruhr Sarı-Siyah', '#FDE100', '#111111'], ['Ren Kırmızı-Siyah', '#E32221', '#111111'],
      ['Saksonya Kırmızı-Beyaz', '#DD0741', '#FFFFFF'], ['Main Siyah-Kırmızı', '#111111', '#E1000F'], ['Swabya Beyaz-Kırmızı', '#FFFFFF', '#E32219'],
      ['Ren Yeşil-Beyaz', '#00A54F', '#FFFFFF'], ['Aşağı Saksonya Yeşil', '#65B32E', '#FFFFFF'], ['Kuzey Limanı Yeşil', '#1D9053', '#FFFFFF'],
      ['Köln Kırmızı-Beyaz', '#ED1C24', '#FFFFFF'], ['Berlin Mavi-Beyaz', '#005CA9', '#FFFFFF'], ['Ruhr Mavi-Beyaz', '#004D9D', '#FFFFFF'],
      ['Kara Orman Kırmızı-Siyah', '#E2001A', '#111111'], ['Kraichgau Mavi', '#1961B5', '#FFFFFF'], ['Mainz Kırmızı-Beyaz', '#C3141E', '#FFFFFF'],
      ['Augsburg Kırmızı-Yeşil', '#BA3733', '#46714D'], ['Doğu Berlin Kırmızı', '#EB1923', '#FFFFFF'], ['Hamburg Kahverengi', '#624839', '#FFFFFF']
    ],
    DE2: [
      ['Duisburg Liman', '#0A6CB3', '#FFFFFF'], ['Essen Kuzey', '#C8102E', '#FFFFFF'], ['Gelsenkirchen Gençlik', '#1D3C8F', '#FFFFFF'],
      ['Dortmund Hörde', '#F2C200', '#111111'], ['Köln Mülheim', '#C8102E', '#111111'], ['Mannheim Doğu', '#006A4E', '#FFFFFF'],
      ['Offenbach Yıldız', '#C8102E', '#FFFFFF'], ['Wuppertal Vadi', '#5B2C83', '#FFFFFF'], ['Aachen Sınır', '#F2C200', '#111111'],
      ['Bochum Kuzey', '#0A6CB3', '#FFFFFF'], ['Duisburg Marxloh', '#006A4E', '#C8102E'], ['Hamburg Wilhelmsburg', '#111111', '#FFFFFF'],
      ['Berlin Kreuzberg Gücü', '#C8102E', '#FFFFFF'], ['Frankfurt Gallus', '#111111', '#C8102E'], ['Stuttgart Cannstatt', '#FFFFFF', '#C8102E'],
      ['Hannover Linden', '#006A4E', '#FFFFFF'], ['Nürnberg Gostenhof', '#8A1538', '#FFFFFF'], ['Bremen Gröpelingen', '#0A6CB3', '#FFFFFF']
    ],
    IT: [
      ['Torino Siyah-Beyaz', '#111111', '#FFFFFF'], ['Milano Kırmızı-Siyah', '#FB090B', '#111111'], ['Milano Mavi-Siyah', '#010E80', '#111111'],
      ['Roma Sarı-Kırmızı', '#8E1F2F', '#F0BC42'], ['Roma Gök Mavi', '#87D8F7', '#FFFFFF'], ['Campania Mavi', '#12A0D7', '#FFFFFF'],
      ['Floransa Mor', '#482E92', '#FFFFFF'], ['Bergamo Siyah-Mavi', '#1E71B8', '#111111'], ['Bologna Kırmızı-Mavi', '#A21C26', '#1A2F48'],
      ['Torino Bordo', '#8A1E03', '#FFFFFF'], ['Cenova Kırmızı-Mavi', '#AD0B26', '#1C2D5A'], ['Udine Siyah-Beyaz', '#FFFFFF', '#111111'],
      ['Sardinya Kırmızı-Mavi', '#A6192E', '#002350'], ['Verona Sarı-Mavi', '#FFD200', '#003399'], ['Salento Sarı-Kırmızı', '#FFE600', '#D4021D'],
      ['Emilia Yeşil-Siyah', '#00A752', '#111111'], ['Parma Beyaz-Sarı', '#FFFFFF', '#FFD200'], ['Como Mavi', '#1B3C7F', '#FFFFFF']
    ],
    FR: [
      ['Paris Lacivert-Kırmızı', '#004170', '#DA291C'], ['Marsilya Beyaz-Mavi', '#FFFFFF', '#2FAEE0'], ['Lyon Beyaz-Kırmızı', '#FFFFFF', '#DA001A'],
      ['Monako Kırmızı-Beyaz', '#E51B22', '#FFFFFF'], ['Lille Kırmızı', '#E01E13', '#1B2A47'], ['Rennes Kırmızı-Siyah', '#E13327', '#111111'],
      ['Azur Kırmızı-Siyah', '#C8102E', '#111111'], ['Lens Sarı-Kırmızı', '#FFE500', '#D4001A'], ['Nantes Sarı-Yeşil', '#FCD405', '#00843D'],
      ['Strazburg Mavi', '#009FE3', '#FFFFFF'], ['Reims Kırmızı-Beyaz', '#D6001C', '#FFFFFF'], ['Montpellier Turuncu-Mavi', '#F58220', '#002B5C'],
      ['Toulouse Mor', '#5B2C83', '#FFFFFF'], ['Brest Kırmızı', '#E30613', '#FFFFFF'], ['Akitanya Lacivert', '#1B2A47', '#FFFFFF'],
      ['Saint-Étienne Yeşil', '#00843D', '#FFFFFF'], ['Auxerre Beyaz-Mavi', '#FFFFFF', '#0055A4'], ['Le Havre Gök Mavi', '#5DADE2', '#1B2A47']
    ],
    NL: [
      ['Amsterdam Kırmızı-Beyaz', '#D2122E', '#FFFFFF'], ['Eindhoven Kırmızı', '#ED1C24', '#FFFFFF'], ['Rotterdam Liman Kırmızı', '#E3001B', '#111111'],
      ['Alkmaar Kırmızı', '#DB0021', '#FFFFFF'], ['Enschede Kırmızı-Beyaz', '#E30613', '#FFFFFF'], ['Utrecht Kırmızı', '#E2001A', '#FFFFFF'],
      ['Frizya Mavi-Beyaz', '#0055A4', '#FFFFFF'], ['Groningen Yeşil-Beyaz', '#00A650', '#FFFFFF'], ['Arnhem Sarı-Siyah', '#FFE500', '#111111'],
      ['Rotterdam Kırmızı-Beyaz', '#C8102E', '#FFFFFF'], ['Lahey Yeşil-Sarı', '#00843D', '#FCD405'], ['Nijmegen Kırmızı-Yeşil', '#C8102E', '#00843D'],
      ['Zwolle Mavi-Beyaz', '#0057B8', '#FFFFFF'], ['Tilburg Kırmızı-Lacivert', '#C8102E', '#1D3C8F'], ['Breda Sarı-Siyah', '#FCD405', '#111111'],
      ['Almelo Beyaz-Siyah', '#FFFFFF', '#111111'], ['Limburg Sarı-Yeşil', '#FCD405', '#00843D'], ['Deventer Kırmızı-Sarı', '#C8102E', '#FCD405']
    ],
    PT: [
      ['Lizbon Kırmızı', '#E30613', '#FFFFFF'], ['Lizbon Yeşil-Beyaz', '#00843D', '#FFFFFF'], ['Porto Mavi-Beyaz', '#003893', '#FFFFFF'],
      ['Minho Kırmızı-Beyaz', '#D8001E', '#FFFFFF'], ['Guimarães Beyaz-Siyah', '#FFFFFF', '#111111'], ['Belém Mavi', '#0055A4', '#FFFFFF'],
      ['Porto Damalı', '#111111', '#FFFFFF'], ['Famalicão Lacivert', '#1D3C8F', '#FFFFFF'], ['Madeira Yeşil-Kırmızı', '#00843D', '#C8102E'],
      ['Arouca Sarı-Mavi', '#FCD405', '#1D3C8F'], ['Riviera Sarı-Mavi', '#FCD405', '#0057B8'], ['Moreira Yeşil-Beyaz', '#006A4E', '#FFFFFF'],
      ['Chaves Mavi-Kırmızı', '#1D3C8F', '#C8102E'], ['Vizela Gök Mavi', '#4FA3D9', '#FFFFFF'], ['Lizbon Siyah-Beyaz', '#111111', '#FFFFFF'],
      ['Vila do Conde Yeşil', '#00843D', '#FFFFFF'], ['Barcelos Kırmızı', '#C8102E', '#1D3C8F'], ['Azor Kırmızı-Beyaz', '#E30613', '#FFFFFF']
    ]
  };

  // Alt ligler: Türkiye'deki sistemin aynısı. "Şehir|büyüklük(1=büyük … 3=küçük)" listesinden güce göre dağıtılır.
  D.foreignPlaces = {
    EN: 'Sheffield|1;Sunderland|1;Middlesbrough|1;Derby|1;Stoke|1;Norwich|1;Ipswich|1;Burnley|1;Blackburn|1;Bristol|1;Cardiff|1;Swansea|1;Hull|2;Watford|2;Southampton|1;Portsmouth|2;Coventry|2;Preston|2;Plymouth|2;Luton|2;Reading|2;Wigan|2;Bolton|2;Barnsley|2;Huddersfield|2;Oxford|2;Peterborough|3;Blackpool|3;Wrexham|3;Cambridge|3;Exeter|3;Lincoln|3;Northampton|3;Rotherham|3;Stockport|3;Bradford|3;Doncaster|3;Mansfield|3;Shrewsbury|3;Carlisle|3;Gillingham|3;Wycombe|3',
    ES: 'Zaragoza|1;Oviedo|1;Gijón|1;Santander|1;Málaga|1;Granada|1;Almería|1;Cádiz|1;Valladolid|1;La Coruña|1;Elche|2;Leganés|2;Córdoba|2;Huelva|2;Alicante|2;Murcia|2;Cartagena|2;Albacete|2;Tenerife|2;Burgos|2;Eibar|2;Huesca|2;León|3;Salamanca|3;Logroño|3;Ferrol|3;Lugo|3;Pontevedra|3;Ourense|3;Badajoz|3;Mérida|3;Jaén|3;Marbella|3;Algeciras|3;Tarragona|3;Lleida|3;Sabadell|3;Terrassa|3;Alcorcón|3;Ponferrada|3;Miranda|3',
    DE: 'Hannover|1;Nürnberg|1;Düsseldorf|1;Kaiserslautern|1;Karlsruhe|1;Paderborn|2;Magdeburg|2;Braunschweig|2;Kiel|2;Darmstadt|2;Fürth|2;Münster|2;Regensburg|3;Ulm|3;Bielefeld|2;Rostock|2;Dresden|2;Saarbrücken|3;Osnabrück|3;Heidenheim|2;Elversberg|3;Wiesbaden|3;Ingolstadt|3',
    IT: 'Palermo|1;Bari|1;Brescia|1;Cremona|1;Pisa|1;Venedik|1;Spezia|1;Modena|1;Reggio Emilia|2;Cesena|2;Catanzaro|2;Salerno|1;Frosinone|2;Empoli|2;Monza|2;Ascoli|2;Terni|2;Perugia|2;Pescara|2;Padova|2;Vicenza|2;Triest|2;Avellino|3;Benevento|3;Cosenza|3;Catania|3;Messina|3;Foggia|3;Taranto|3;Livorno|3;Lucca|3;Arezzo|3;Ancona|3;Rimini|3;Novara|3;Alessandria|3;Mantova|3;Piacenza|3;Ferrara|3;Latina|3',
    FR: 'Metz|1;Lorient|1;Angers|1;Caen|1;Guingamp|2;Bastia|2;Ajaccio|2;Amiens|2;Grenoble|2;Dijon|2;Troyes|2;Clermont|2;Pau|3;Rodez|3;Laval|3;Annecy|3;Dunkerque|3;Valenciennes|3;Nancy|3;Sochaux|3;Niort|3',
    NL: 'Volendam|1;Emmen|1;Leeuwarden|1;Den Bosch|2;Dordrecht|2;Helmond|2;Venlo|2;Kerkrade|2;Maastricht|2;Oss|3;Velsen|3;Almere|2;Amersfoort|3;Zaandam|3;Haarlem|3;Leiden|3;Apeldoorn|3;Ede|3;Doetinchem|2;Eindhoven Stad|3;Rotterdam Kralingen|3',
    PT: 'Coimbra|1;Aveiro|1;Leiria|1;Setúbal|1;Viseu|2;Penafiel|2;Feira|2;Tondela|2;Portimão|2;Covilhã|3;Paços de Ferreira|2;Oliveira|3;Mafra|3;Torres Vedras|3;Felgueiras|3;Trofa|3;Matosinhos|2;Póvoa de Varzim|3;Olhão|3;Évora|3;Barreiro|3;Almada|3'
  };

  /* ---------- Turnuvalar (isimler kurgusal) ----------
     Avrupa Yıldızlar Ligi: kulüpler turnuvası. Ülke kotası 32 takım eder; önceki sezonun lig sıralamasıyla girilir.
     Küresel Kupa: 4 yılda bir yazın oynanan milli takımlar turnuvası; öncesindeki sezonda eleme grubu oynanır. */
  D.cups = {
    cl: { name: 'Avrupa Yıldızlar Ligi', short: 'Yıldızlar Ligi', slots: { EN: 5, ES: 5, IT: 5, DE: 4, FR: 4, PT: 3, NL: 3, TR: 3 } },
    wc: { name: 'Küresel Kupa', short: 'Küresel Kupa', qual: 'Küresel Kupa Elemeleri' }
  };
  // Milli takımlar: [ad, güç, forma rengi 1, forma rengi 2]
  D.nations = [
    ['Arjantin', 88, '#75AADB', '#FFFFFF'], ['Fransa', 88, '#002395', '#FFFFFF'], ['Brezilya', 87, '#FEDD00', '#009C3B'], ['İngiltere', 87, '#FFFFFF', '#1D3C8F'],
    ['İspanya', 87, '#C60B1E', '#FFC400'], ['Almanya', 86, '#111111', '#DD0000'], ['Portekiz', 86, '#C8102E', '#006A4E'], ['Hollanda', 85, '#F36C21', '#FFFFFF'],
    ['Belçika', 83, '#C8102E', '#111111'], ['İtalya', 84, '#0066CC', '#FFFFFF'], ['Hırvatistan', 82, '#FFFFFF', '#C8102E'], ['Uruguay', 82, '#7BAFD4', '#111111'],
    ['Kolombiya', 80, '#FCD116', '#003893'], ['Danimarka', 80, '#C8102E', '#FFFFFF'], ['Fas', 80, '#C1272D', '#006233'], ['Türkiye', 78, '#E30A17', '#FFFFFF'],
    ['İsviçre', 79, '#D52B1E', '#FFFFFF'], ['Japonya', 79, '#0B2A87', '#FFFFFF'], ['ABD', 78, '#FFFFFF', '#0A3161'], ['Meksika', 78, '#006847', '#FFFFFF'],
    ['Senegal', 78, '#FFFFFF', '#00853F'], ['Sırbistan', 77, '#C6363C', '#0C4076'], ['Avusturya', 78, '#ED2939', '#FFFFFF'], ['Polonya', 76, '#FFFFFF', '#DC143C'],
    ['Ukrayna', 76, '#FFD500', '#005BBB'], ['Güney Kore', 76, '#C60C30', '#111111'], ['Ekvador', 76, '#FFDD00', '#034EA2'], ['İsveç', 76, '#FECC00', '#006AA7'],
    ['Norveç', 77, '#BA0C2F', '#FFFFFF'], ['Nijerya', 76, '#008751', '#FFFFFF'], ['Mısır', 75, '#CE1126', '#FFFFFF'], ['Avustralya', 74, '#FFCD00', '#00843D'],
    ['Macaristan', 74, '#CE2939', '#FFFFFF'], ['İskoçya', 74, '#1D3C8F', '#FFFFFF'], ['Çekya', 74, '#D7141A', '#FFFFFF'], ['Cezayir', 75, '#FFFFFF', '#006233'],
    ['Fildişi Sahili', 76, '#F77F00', '#FFFFFF'], ['Gana', 74, '#FFFFFF', '#111111'], ['Kamerun', 74, '#007A5E', '#CE1126'], ['İran', 73, '#FFFFFF', '#DA0000'],
    ['Peru', 73, '#FFFFFF', '#D91023'], ['Şili', 73, '#D52B1E', '#0039A6'], ['Paraguay', 73, '#D52B1E', '#FFFFFF'], ['Kanada', 74, '#D80621', '#FFFFFF'],
    ['Galler', 73, '#C8102E', '#FFFFFF'], ['Romanya', 72, '#FCD116', '#002B7F'], ['Yunanistan', 73, '#0D5EAF', '#FFFFFF'], ['Slovakya', 72, '#FFFFFF', '#0B4EA2'],
    ['Gürcistan', 72, '#FFFFFF', '#DA291C'], ['Tunus', 72, '#E70013', '#FFFFFF'], ['Suudi Arabistan', 71, '#FFFFFF', '#006C35'], ['İzlanda', 70, '#02529C', '#FFFFFF'],
    ['Arnavutluk', 70, '#E41E20', '#111111'], ['Slovenya', 72, '#FFFFFF', '#005DA4'], ['İrlanda', 70, '#169B62', '#FFFFFF'], ['Finlandiya', 69, '#FFFFFF', '#002F6C'],
    ['Bosna-Hersek', 70, '#002395', '#FECB00'], ['Karadağ', 68, '#C40308', '#D4AF37'], ['Kazakistan', 66, '#00AFCA', '#FEC50C'], ['Azerbaycan', 66, '#0092BC', '#E00034'],
    ['Litvanya', 63, '#FDB913', '#006A44'], ['Letonya', 63, '#9E3039', '#FFFFFF'], ['Ermenistan', 64, '#D90012', '#0033A0'], ['Lüksemburg', 64, '#EF3340', '#00A3E0'],
    ['Kıbrıs', 63, '#FFFFFF', '#D57800'], ['Malta', 58, '#CF142B', '#FFFFFF'], ['Andorra', 55, '#10069F', '#FEDD00'], ['Moldova', 60, '#003DA5', '#FFD200']
  ];

  D.stadiumPatterns = {
    big: ['{n} Arena', '{n} Şehir Stadı', '{n} Yeni Stadı'],
    mid: ['{n} Atatürk Stadı', '{n} 19 Mayıs Stadı', '{n} Şehir Stadı', '{n} Gençlik Stadı'],
    small: ['{n} İlçe Stadı', '{n} Belediye Sahası', '{n} Gençlik Parkı Sahası', '{n} Sentetik Saha', '{n} Köy Yolu Sahası']
  };

  // Sezon takvimi için ay adları (1. hafta Ağustos)
  D.months = ['Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz'];
})(typeof window !== 'undefined' ? window : globalThis);
