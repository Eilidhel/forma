/* FORMA — yakın arkadaş, belediye istekleri, gece hayatı krizleri, istek fiyat aralıkları
   Yakın arkadaş (dost): çocukluktan beri tanıdığın, kulüp değişse de değişmeyen tek kişi. Bazen başını belaya sokar,
   bazen de seni beladan kurtarır. İlişkiniz birlikte vakit geçirdikçe ve onun yanında durdukça güçlenir. */
(function (root) {
  const D = root.F.DATA;
  const E = D.events;
  const add = (...evs) => evs.forEach((e) => E.push(e));
  const O = (t, tone, fx, r, extra) => Object.assign({ t, tone, fx, r }, extra || {});
  const card = (id, cond, who, t, o, extra) => Object.assign({ id, w: 10, rep: 40, if: cond, kind: 'card', who, t, o }, extra || {});

  D.relLabels.dost = 'Yakın arkadaş';

  /* ---------- İstekler: her birinin fiyat aralığı sabit (TL) ---------- */
  const PRICE = {
    anne_ziyaret: [2000, 15000], kardes_okul: [40000, 250000], baba_borc: [50000, 600000], anne_doktor: [15000, 150000],
    memleket_forma: [8000, 60000], kanka_borc: [10000, 120000], akraba_dugun: [3000, 30000], partner_ev: [100000, 1500000],
    baba_tekne: [80000, 600000], koy_hayvan: [60000, 250000], hayir_dernek: [20000, 500000], cocuk_okul: [150000, 900000]
  };
  D.requests.forEach((r) => { if (PRICE[r.id]) r.price = PRICE[r.id]; });
  D.requests.push(
    { id: 'bel_senlik', who: '{sehir} Belediye Başkanı', if: { abroad: false, stat: { sohret: ['>', 8] } }, t: 'Merhaba, belediye olarak çocuklar için spor şenliği düzenliyoruz. Açılışa gelip çocuklara top ve forma desteği verir misin? Şehrin seni çok seviyor.', short: 'Belediyenin spor şenliği', cost: 'w0.4', price: [15000, 90000], fx: { 'r.taraftar': 5, 'r.medya': 2, sohret: 1, enerji: -6, 's.karizma': 1 }, nofx: { 'r.taraftar': -2 }, yes: 'Şenlikte çocuklarla penaltı attın. Yerel gazete manşet yaptı.', no: 'Belediye şenliği senin yerine bir şarkıcıyla açtı.', expire: 4 },
    { id: 'bel_sozcu', who: '{sehir} Belediyesi Basın Sözcüsü', if: { abroad: false, stat: { sohret: ['>', 15] } }, t: 'Belediyemizin "Temiz Şehir" kampanya videosunda birkaç saniye yer alır mısınız? Ücret ödeyemiyoruz ama şehrimiz için çok değerli olur.', short: 'Belediye kampanya videosu', fx: { 'r.medya': 3, 'r.taraftar': 2, sohret: 1, enerji: -4 }, nofx: { 'r.medya': -1 }, yes: 'Video şehir ekranlarında dönüyor. Sokakta "çöpünü at kaptan" diye takılıyorlar.', no: 'Sözcü "anlıyoruz, yoğunsunuz" dedi.', expire: 3 },
    { id: 'bel_yardimci', who: '{sehir} Belediye Başkan Yardımcısı', if: { abroad: false, stat: { sohret: ['>', 20] } }, t: 'Şehrimizdeki çocuk esirgeme kurumu için bağış kampanyası başlattık. İlk bağışı sen yaparsan herkes arkandan gelir.', short: 'Çocuk esirgeme bağışı', cost: 'w0.8', price: [25000, 200000], fx: { 'r.taraftar': 6, 'r.medya': 4, moral: 4, 's.karizma': 2 }, nofx: { 'r.medya': -2, 'r.taraftar': -1 }, yes: 'Kampanya bir haftada hedefini aştı. Çocuklar sana resim çizdi.', no: 'Kampanyayı başka bir iş insanı başlattı.', expire: 4 },
    { id: 'bel_stad', who: '{sehir} Belediye Başkanı', if: { abroad: false, stat: { sohret: ['>', 35] } }, t: 'Mahalle sahalarını yeniliyoruz. Bir tanesine senin adını verelim, sen de çim ve kale için katkı yap. Ne dersin?', short: 'Adını taşıyacak saha', cost: 'w1.5', price: [60000, 400000], fx: { 'r.taraftar': 8, 'r.medya': 3, sohret: 2 }, nofx: { 'r.taraftar': -2 }, yes: 'Sahanın açılışında kurdeleyi sen kestin. Tabelada adın yazıyor.', no: 'Saha belediyenin kendi bütçesiyle yapıldı, tabelada senin adın yok.', expire: 5 },
    { id: 'mem_baskan', who: '{memleket} Belediye Başkanı', if: { stat: { sohret: ['>', 12] } }, t: 'Hemşehrim, memleketin seninle gurur duyuyor. Gençlik merkezine spor malzemesi ve bir halı saha için destek olur musun?', short: 'Memleket gençlik merkezi', cost: 'w1', price: [30000, 300000], fx: { 'r.memleket': 12, 'r.aile': 3, sohret: 1 }, nofx: { 'r.memleket': -6 }, yes: 'Memleketinde halı sahanın kapısına fotoğrafını astılar.', no: 'Memlekette "ünlü olunca unuttu" lafı dolaşıyor.', expire: 5 },
    { id: 'mem_yardimci', who: '{memleket} Belediye Başkan Yardımcısı', if: { stat: { sohret: ['>', 6] } }, t: 'Okulun spor salonunun çatısı akıtıyor. Çocuklar kovalarla antrenman yapıyor. Küçük bir katkı bile çok şey değiştirir.', short: 'Memleketteki okulun salonu', cost: 'w0.5', price: [10000, 120000], fx: { 'r.memleket': 9, moral: 3 }, nofx: { 'r.memleket': -4 }, yes: 'Salonun yeni çatısının altında çocuklar senin adını haykırdı.', no: 'Salon bir kış daha kovalarla geçecek.', expire: 4 },
    { id: 'kardes_forma_top', who: 'kardes', if: { hasRole: 'kardes' }, t: 'Abi mahalle takımı kurduk! Bize top ve birkaç forma yollar mısın? Çocuklar senin adını sırtına yazdıracak.', short: 'Kardeşinin mahalle takımı', price: [3000, 25000], fx: { 'r.kardes': 8, 'r.memleket': 2 }, nofx: { 'r.kardes': -5 }, yes: 'Kardeşin takımın fotoğrafını attı: hepsinin sırtında senin numaran.', no: 'Kardeşin "tamam, boş ver" yazdı.', expire: 3 },
    { id: 'dost_borc', who: 'dost', if: { hasRole: 'dost' }, t: 'Kanka işler kötü gidiyor, iki aylık kirayı ödeyemedim. Ay sonuna kadar biraz verebilir misin? Söz, ilk fırsatta geri öderim.', short: 'Yakın arkadaşının kirası', cost: 'w0.3', price: [8000, 80000], fx: { 'r.dost': 12 }, nofx: { 'r.dost': -8 }, yes: 'Arkadaşın "bunu hayatım boyunca unutmam" dedi.', no: 'Arkadaşın "anladım" yazdı, birkaç gün ses çıkarmadı.', expire: 3 }
  );

  /* ---------- Yakın arkadaşla vakit geçir (etkinlik) ---------- */
  D.activities.push({ id: 'dost', name: 'Yakın arkadaşınla buluş', desc: 'Çocukluk arkadaşınla çay, sohbet, eski günler.', cost: 500, if: { hasRole: 'dost' },
    fx: { enerji: -6, moral: 5, mental: 4, 'r.dost': 6 } });

  /* ---------- Yakın arkadaş: başını belaya sokar ---------- */
  add(
    card('dost_bahis', { hasRole: 'dost' }, 'Yakın arkadaşın', '{dostTam} gece yarısı aradı. Bahiste batmış, tefeciye borçlu. "Kanka sizin maçın kadrosunu bir gün önceden söylesen yeter, kimse bilmez" diyor.', [
      O('Asla. Bu işlere beni karıştırma', 'durust', { 'r.dost': -6, disiplin: 2 }, 'Arkadaşın sustu. "Haklısın" dedi sonra, utanarak.'),
      O('Kadroyu söylemem ama borcunun bir kısmını öderim', 'duygusal', { para: '-w0.4', 'r.dost': 8 }, 'Tefeciyle arasını kapattın. Bir daha bahse girmeyeceğine söz verdi.'),
      O('Tamam, bir kerelik', 'kacamak', { 'r.dost': 6, disiplin: -8, mental: -4, 'r.hoca': -3 }, 'İçin rahat değil. Bu tür şeyler bir gün ortaya çıkar.')], { rep: 120 }),
    card('dost_kavga', { hasRole: 'dost' }, 'Yakın arkadaşın', 'Gece 3. {dostTam} bir mekânda kavgaya karışmış, karakoldan arıyor: "Kanka bir gel, senin adın geçince bırakırlar."', [
      O('Karakola git', 'duygusal', { 'r.dost': 10, enerji: -12, 'r.medya': -3 }, 'Arkadaşını çıkardın ama karakol önünde birisi fotoğrafını çekti. Sabah magazin sayfalarındaydın.'),
      O('Avukat gönder, kendin gitme', 'saygili', { para: '-w0.3', 'r.dost': 5 }, 'Avukat sabaha karşı arkadaşını çıkardı. "Sen gelmedin ama sağ ol" dedi.'),
      O('Telefonu kapat', 'sessiz', { 'r.dost': -12, mental: -2 }, 'Arkadaşın iki gün nezarette kaldı. Seni aramayı bıraktı.')]),
    card('dost_dogumgunu', { hasRole: 'dost' }, 'Yakın arkadaşın', '{dostTam} doğum günü partisi veriyor. Yarın maçın var. "İki saat gel, ben de bir kere otuz yaşıma giriyorum" diyor.', [
      O('Git, erken dön', 'duygusal', { 'r.dost': 6, enerji: -10, moral: 4, 'r.hoca': -2 }, 'Pastayı birlikte kestiniz. Saat birde evdeydin, ama hoca bir yerden duydu.'),
      O('Git, sabaha kadar kal', 'kacamak', { 'r.dost': 10, enerji: -25, moral: 8, 'r.hoca': -6, form: -1 }, 'Gecenin yıldızı sendin. Maçta bacakların kurşun gibiydi.'),
      O('Hediyeni gönder, gidemem', 'saygili', { para: -3000, 'r.dost': -3, disiplin: 1 }, 'Arkadaşın hediyeyi beğendi ama sesi biraz kırgındı.')]),
    card('dost_video', { hasRole: 'dost' }, 'Yakın arkadaşın', '{dostTam} eski bir düğünde göbek attığın videoyu "şaka olsun" diye paylaşmış. Video viral oldu, rakip taraftarlar dalga geçiyor.', [
      O('Gül geç, sen de paylaş', 'esprili', { 'takipci%': 3, 'r.dost': 4, 'r.medya': 1 }, 'Kendinle dalga geçebilmen herkesin hoşuna gitti.'),
      O('Arkadaşına çok kız', 'sert', { 'r.dost': -10, moral: -2 }, 'Arkadaşın videoyu sildi ama aranız soğudu.'),
      O('Sakin bir şekilde sildirmesini iste', 'saygili', { 'r.dost': -2, 'r.medya': 1 }, 'Video silindi, konu kapandı.')]),
    card('dost_ortaklik', { hasRole: 'dost', stat: { para: ['>', 100000] } }, 'Yakın arkadaşın', '{dostTam} bir kafe açmak istiyor. "Sen sermayeyi koy, ben işletirim, kâr yarı yarıya" diyor. Gözleri parlıyor.', [
      O('Ortak ol', 'kacamak', { para: '-w1.5', 'r.dost': 10 }, 'Kafeye "Forma Cafe" adını verdiniz.', { chk: { s: 'kurnazlik', d: 45 }, ok: { r: 'Kafe tuttu! Arkadaşın işi iyi yönetiyor, üç ayda paranın yarısını geri aldın.', fx: { para: 'w0.8', 'r.dost': 4 } }, no: { r: 'Kafe altı ay sonra kapandı. Paran gitti ama arkadaşın elinden geleni yaptı.', fx: { mental: -3 } } }),
      O('Ortak olmam ama ilk ay kirasını öderim', 'saygili', { para: '-w0.3', 'r.dost': 5 }, 'Arkadaşın kafeyi küçük başladı. Masada senin fotoğrafın var.'),
      O('Kibarca reddet', 'sessiz', { 'r.dost': -4 }, 'Arkadaşın "anlarım" dedi ama hevesi kaçtı.')])
  );

  /* ---------- Yakın arkadaş: seni beladan kurtarır ---------- */
  add(
    card('dost_sakatlik', { hasRole: 'dost', injured: true }, 'Yakın arkadaşın', 'Sakatlığını duyan {dostTam} işinden izin alıp yanına geldi. Her sabah seni fizik tedaviye götürüyor, akşamları da moral veriyor.', [
      O('Sarıl, teşekkür et', 'duygusal', { 'r.dost': 6, mental: 6, moral: 5 }, '"Sen benim kardeşimsin" dedi. Tedavinde hiç yalnız kalmadın.'),
      O('"Gerek yoktu" de ama içten içe sevin', 'sessiz', { 'r.dost': 2, mental: 3 }, 'Yine de her sabah kapıdaydı.')]),
    card('dost_para', { hasRole: 'dost', stat: { para: ['<', 15000] } }, 'Yakın arkadaşın', 'Paranın bittiğini fark eden {dostTam} bir zarf uzattı: "Biriktirdiğim bu. Toparlanınca verirsin, acelesi yok."', [
      O('Kabul et', 'duygusal', { para: 20000, 'r.dost': 6 }, 'Zarfın içinde bir de not vardı: "Sen bizim gururumuzsun."'),
      O('Gururun izin vermez, reddet', 'iddiali', { 'r.dost': 2, mental: -1 }, 'Arkadaşın zarfı cebine koydu: "Lazım olursa burada."')]),
    card('dost_medya', { hasRole: 'dost', rel: { medya: ['<', -15] } }, 'Yakın arkadaşın', 'Medya üstüne gelirken {dostTam} yerel bir kanala çıktı: "Onu çocukluğundan beri tanırım. Yazılanların hiçbiri doğru değil."', [
      O('Videoyu paylaş, teşekkür et', 'duygusal', { 'r.medya': 4, 'r.taraftar': 3, 'r.dost': 5 }, 'Arkadaşının samimiyeti rüzgârı tersine çevirdi.'),
      O('Teşekkür et ama bir daha karışmamasını iste', 'saygili', { 'r.medya': 2, 'r.dost': -1 }, 'Arkadaşın biraz bozuldu ama anladı.')]),
    card('dost_kurtardi', { hasRole: 'dost' }, 'Yakın arkadaşın', 'Bir mekânda biri sana sataştı, yumruklar havaya kalkmak üzereydi. {dostTam} araya girip seni dışarı çıkardı: "Değmez kanka, yarın manşet olursun."', [
      O('Haklıydı, teşekkür et', 'saygili', { 'r.dost': 7, disiplin: 3 }, 'Ertesi gün o adamın başka bir futbolcuyla kavga ettiği haber oldu. Kurtulmuştun.'),
      O('"Bırak, hallederdim" de', 'iddiali', { 'r.dost': -2, disiplin: -1 }, 'Arkadaşın omuz silkti: "Tabii, tabii."')]),
    card('dost_yalniz', { hasRole: 'dost', partner: 'none', rel: { dost: ['>', 20] } }, 'Yakın arkadaşın', 'Kafan doluyken {dostTam} kapıya dayandı: "Kalk, sahile gidiyoruz. Telefonu da evde bırak."', [
      O('Git', 'duygusal', { mental: 7, moral: 6, enerji: -4, 'r.dost': 5 }, 'Saatlerce eski günleri konuştunuz. Kafan uzun zamandır bu kadar boş olmamıştı.'),
      O('Bugün olmaz', 'sessiz', { 'r.dost': -2 }, 'Arkadaşın "başka zaman" dedi.')]),
    card('dost_form', { hasRole: 'dost', formBelow: -3 }, 'Yakın arkadaşın', 'Kötü gidişatı gören {dostTam} sana çocukken çektiği bir video yolladı: mahallede tek başına beş kişiyi geçiyorsun. Altına "Sen busun" yazmış.', [
      O('Videoyu izle, motive ol', 'duygusal', { form: 1, moral: 5, 'r.dost': 4 }, 'O akşam antrenmanda kalıp yarım saat şut çalıştın.'),
      O('Cevap verme', 'sessiz', { 'r.dost': -1 }, 'Video telefonunda duruyor.')])
  );

  /* ---------- Gece hayatı: sevgilinle büyük kriz ---------- */
  add(
    card('gece_partner_kriz', { partner: 'any' }, 'Partnerin', '{partner} sabah telefonunda gece kulübünde çekilmiş bir fotoğrafını gördü. Yanında tanımadığı biri var. "Bana söylediğin yer burası mıydı?" diye soruyor, sesi titriyor.', [
      O('Dürüstçe anlat, özür dile', 'durust', { 'r.partner': -4, mental: -2 }, 'Uzun bir konuşma oldu. Kırgın ama sana inanıyor.'),
      O('Yalan söyle: "Takım yemeğiydi"', 'kacamak', { 'r.partner': 2 }, 'Şimdilik geçti.', { chk: { s: 'kurnazlik', d: 55 }, ok: { r: 'İnandı. Ama bu yalanı hatırlaman gerekecek.', fx: { mental: -1 } }, no: { r: 'Takım arkadaşının hikâyesinde o gece başka bir yerde olduğun görülüyordu. Yalanın patladı.', fx: { 'r.partner': -16, moral: -6, mental: -4 } } }),
      O('"Beni kontrol etme" diye çık', 'sert', { 'r.partner': -14, moral: -4 }, 'Kapıyı çarpıp çıktı. Birkaç gün eşyalarını toplamaktan söz etti.'),
      O('Hediyeyle gönlünü al', 'duygusal', { para: '-w0.5', 'r.partner': 2 }, 'Hediyeyi aldı ama "bir daha olmasın" dedi.')], { rep: 8, w: 12 })
  );
})(typeof window !== 'undefined' ? window : globalThis);
