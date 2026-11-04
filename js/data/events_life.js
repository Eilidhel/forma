/* FORMA — hayat olayları: partner, aile, yaşam evreleri, nadir anlar, günün gündemi, nesil */
(function (root) {
  const E = root.F.DATA.events;
  const add = (...evs) => evs.forEach((e) => E.push(e));

  /* ---------- Partner: tanışma ---------- */
  add(
    { id: 'partner_tanis_gece', chain: true, kind: 'chat', who: 'Bir yabancı', nodes: {
      start: { who: 'Bir yabancı', t: 'Kulüpte bar tezgâhının yanında biri sana gülümsüyor: "Seni bir yerden tanıyorum... Futbolcu musun? Ben futboldan hiç anlamam ama dans etmeyi severim."', o: [
        { t: 'O zaman dans edelim.', tone: 'esprili', chk: { s: 'karizma', d: 35 }, ok: { r: 'Bütün gece dans ettiniz. Numaranı aldı.', fx: { do: 'partner:gece', moral: 6 } }, no: { r: 'Ayaklarına bastın. Gülerek uzaklaştı.', fx: { moral: -2 } } },
        { t: 'Futbol dışında neleri seversin?', tone: 'saygili', chk: { s: 'sosyallik', d: 30 }, ok: { r: 'Saatlerce konuştunuz. Ertesi gün mesaj geldi.', fx: { do: 'partner:gece' } }, no: { r: 'Sohbet tıkandı. Arkadaşları onu çağırdı.' } },
        { t: 'Kibarca gülümse, arkadaşlarının yanına dön', fx: {}, r: 'Belki başka zaman.' }] } } },
    { id: 'partner_tanis_arkadas', chain: true, kind: 'chat', who: 'Ortak bir arkadaş', nodes: {
      start: { who: 'Ortak bir arkadaş', t: 'Doğum günü partisinde arkadaşın seni biriyle tanıştırıyor: "Bu arkadaşım çok iyi biri, ikiniz anlaşırsınız bence." Karşındaki kişi biraz utangaç.', o: [
        { t: 'Bir kahve içelim mi bu hafta?', tone: 'saygili', chk: { s: 'sosyallik', d: 30 }, ok: { r: 'Kahve üç saat sürdü.', fx: { do: 'partner:arkadas', moral: 5 } }, no: { r: '"Belki," dedi. Bir daha haber gelmedi.' } },
        { t: 'Esprilerle buzları kır', tone: 'esprili', chk: { s: 'karizma', d: 35 }, ok: { r: 'Kahkahalarla gecenin yıldızı oldunuz.', fx: { do: 'partner:arkadas', moral: 5 } }, no: { r: 'Espriler havada kaldı.' } }] } } },
    { id: 'partner_dm', w: 8, if: { partner: 'none', followers: ['>', 4000], minAge: 18 }, kind: 'dm', who: 'Bir takipçi',
      t: 'DM kutunda bir mesaj: "Merhaba, maçlarını izliyorum ama asıl seni çocuk hastanesi ziyaretindeki videoda gördüm. Çok samimiydin. Belki tanışırız?"',
      o: [
        { t: 'Cevap yaz, sohbet et', fx: {}, chk: { s: 'sosyallik', d: 30 }, ok: { r: 'Günlerce yazıştınız, sonra buluştunuz.', fx: { do: 'partner:dm' } }, no: { r: 'Sohbet birkaç mesajda bitti.' } },
        { t: 'Görmezden gel', fx: {}, r: 'DM kutusu doluyor zaten.' }] },

    /* ---------- Partner: ilişki aşamaları ---------- */
    { id: 'partner_sevgili', w: 40, if: { partner: [1], rel: { partner: ['>', 30] } }, kind: 'chat', who: 'partner', nodes: {
      start: { who: 'partner', t: '{partner} sahilde yürürken duruyor: "Artık ne olduğumuzu bilmek istiyorum. Biz neyiz?"', o: [
        { t: 'Benim sevgilimsin. Herkes bilsin.', tone: 'duygusal', fx: { do: 'pstage:2', 'r.partner': 12, moral: 8 }, r: 'Sana sarıldı. O akşam ilk ortak fotoğrafınızı paylaştınız.' },
        { t: 'Acele etmeyelim, kariyerim çok yoğun.', tone: 'kacamak', fx: { 'r.partner': -10, 't.hirsli': 0.5 }, r: '"Anladım," dedi. Sessizce yürümeye devam ettiniz.' },
        { t: 'Bence arkadaş kalalım.', tone: 'sert', fx: { do: 'breakup', 'r.partner': -20 }, r: 'Gözleri doldu ama başını salladı.' }] } } },
    { id: 'partner_aile_tanisma', w: 25, if: { partner: [2], rel: { partner: ['>', 35] } }, kind: 'chat', who: 'anne', nodes: {
      start: { who: 'anne', t: '{partner} ile ailenin yemeğindesiniz. Annen nazik ama soğuk: "Ne iş yapıyorsun kızım? Ailen ne yapar?"', o: [
        { t: 'Araya gir, partnerini öv', tone: 'duygusal', fx: { 'r.partner': 8, 'r.anne': -3 }, r: 'Partnerin minnetle baktı. Annen bir şey demedi.' },
        { t: 'Bırak kendini anlatsın', fx: {}, chk: { s: 'sosyallik', d: 35 }, ok: { r: 'Partnerin annenle yemek tarifleri konuşmaya başladı. Buz eridi.', fx: { 'r.anne': 6, 'r.partner': 5 } }, no: { r: 'Yemek gergin geçti.', fx: { 'r.partner': -4, 'r.anne': -3 } } },
        { t: 'Konuyu futbola getir', tone: 'esprili', fx: { 'r.baba': 2 }, r: 'Babanla maç konuştunuz, kadınlar birbirine baktı.' }] } } },
    { id: 'partner_kiskanc', w: 14, if: { partner: [1, 2, 3, 4], followers: ['>', 3000] }, kind: 'chat', who: 'partner', nodes: {
      start: { who: 'partner', t: '{partner} telefonunu uzatıyor: "Bu kız fotoğrafının altına neden kalp atmış? Sen de beğenmişsin!"', o: [
        { t: 'Bir hayran sadece. Bana güven.', tone: 'saygili', chk: { s: 'konusma', d: 35 }, ok: { r: 'Biraz sustu, sonra "tamam" dedi.', fx: { 'r.partner': 2 } }, no: { r: '"Hep böyle söylüyorsun" dedi.', fx: { 'r.partner': -8 } } },
        { t: 'Beğeniyi kaldır, kızı engelle', fx: { 'r.partner': 6, 'takipci': -1 }, r: 'Sorun çözüldü. Bu sefer.' },
        { t: 'Bu kıskançlık beni boğuyor.', tone: 'sert', fx: { 'r.partner': -12 }, r: 'Kapıyı çarpıp çıktı.' }] } } },
    { id: 'partner_kavga', w: 25, if: { partner: [1, 2, 3, 4], rel: { partner: ['<', 5] } }, kind: 'chat', who: 'partner', nodes: {
      start: { who: 'partner', t: '{partner}: "Son haftalarda hiç yoksun. Antrenman, maç, telefon... Ben senin hayatında neredeyim?"', o: [
        { t: 'Haklısın. Bu hafta sonu sadece ikimiz.', tone: 'duygusal', fx: { 'r.partner': 12, enerji: -6 }, r: 'Telefonları kapattınız, sahil kasabasına gittiniz.' },
        { t: 'Futbolcuyla birlikte olmak böyle bir şey.', tone: 'sert', fx: { 'r.partner': -10 }, r: '"O zaman belki ben futbolcuya göre değilim," dedi.' },
        { t: 'Sana bir sürprizim var.', tone: 'esprili', req: { money: 'w1' }, fx: { para: '-w1', 'r.partner': 10 }, r: 'Uzun zamandır istediği konser biletleri. Barıştınız.' }] } } },
    { id: 'partner_ayrilik', w: 50, if: { partner: [1, 2, 3, 4], rel: { partner: ['<', -25] } }, kind: 'chat', who: 'partner', nodes: {
      start: { who: 'partner', t: '{partner} valizini hazırlamış: "Artık devam edemem. Bu ilişki sadece senin kariyerin etrafında dönüyor."', o: [
        { t: 'Gitme. Değişeceğim, söz.', tone: 'duygusal', chk: { s: 'konusma', d: 50 }, ok: { r: 'Valizi bıraktı. "Son şans," dedi.', fx: { 'r.partner': 30 } }, no: { r: 'Kapı kapandı.', fx: { do: 'breakup' } } },
        { t: 'Haklısın. İkimiz için de en iyisi bu.', tone: 'saygili', fx: { do: 'breakup', mental: 3 }, r: 'Sessiz bir veda.' }] } } },
    { id: 'partner_nisan', w: 35, if: { partner: [2], rel: { partner: ['>', 55] }, minAge: 22 }, kind: 'chat', who: 'Kendin', nodes: {
      start: { who: 'Kendin', t: 'Cebinde bir yüzük kutusu var. {partner} ile yemekte, mum ışığında oturuyorsunuz. Kalbin çok hızlı atıyor.', o: [
        { t: 'Diz çök ve sor', tone: 'duygusal', req: { money: 'w1' }, fx: { para: '-w1' }, chk: { p: 'r.partner', d: 45 }, ok: { r: '"Evet!" dedi ağlayarak. Restoran alkışladı.', fx: { do: 'pstage:3', 'r.partner': 15, moral: 12, 'r.aile': 4 } }, no: { r: '"Daha erken" dedi. Yüzüğü cebine geri koydun.', fx: { 'r.partner': -4, moral: -10 } } },
        { t: 'Stadyumda, maç sonu dev ekrandan sor', tone: 'iddiali', req: { money: 'w2' }, fx: { para: '-w2', 'takipci%': 6 }, chk: { p: 'r.partner', d: 50 }, ok: { r: 'Tüm stadyum "evet" diye bağırdı, sonra o da!', fx: { do: 'pstage:3', 'r.partner': 18, sohret: 3, 'r.taraftar': 5 } }, no: { r: 'Herkesin önünde "hayır" dedi. Video viral oldu, kötü anlamda.', fx: { 'r.partner': -15, moral: -15 } } },
        { t: 'Bugün değil', fx: {}, r: 'Yüzük bir süre daha cebinde kalacak.' }] } } },
    { id: 'partner_dugun', w: 40, if: { partner: [3], rel: { partner: ['>', 40] } }, kind: 'chat', who: 'partner', nodes: {
      start: { who: 'partner', t: '{partner} düğün planlarını konuşuyor: "Büyük bir düğün mü, yoksa sadece ailelerle küçük bir tören mi?"', o: [
        { t: 'Dev düğün! Herkes gelsin.', req: { money: 'w8' }, fx: { para: '-w8', do: 'pstage:4', sohret: 4, 'takipci%': 8, 'r.partner': 10, 'r.aile': 10, 'r.takim': 6 }, r: 'Düğün tüm magazin sayfalarında. Takım halay çekti.' },
        { t: 'Küçük ve samimi.', req: { money: 'w2' }, fx: { para: '-w2', do: 'pstage:4', 'r.partner': 12, 'r.aile': 8, mental: 5 }, r: 'Ailelerle bir bahçede sade bir tören. Mükemmeldi.' },
        { t: 'Memleketimde, köy düğünü!', fx: { para: '-w3', do: 'pstage:4', 'r.memleket': 25, 'r.aile': 12, 'r.partner': 4 }, r: 'Üç gün üç gece davul zurna. Partnerin biraz şaşırdı ama sonunda halaya girdi.' }] } } },
    { id: 'partner_kariyer', w: 12, if: { partner: [2, 3, 4] }, kind: 'chat', who: 'partner', nodes: {
      start: { who: 'partner', t: '{partner} heyecanlı: "Başka bir şehirden müthiş bir iş teklifi aldım! Ama sen buradasın... Ne yapmalıyım?"', o: [
        { t: 'Git, kariyerini destekliyorum. Uzak mesafe ilişkisi yaparız.', tone: 'duygusal', fx: { 'r.partner': 10, moral: -4, flag: 'uzak_iliski' }, r: 'Hafta sonları yollardasınız.' },
        { t: 'Kal, burada da iş bulursun.', tone: 'sert', fx: { 'r.partner': -10 }, r: 'Teklifi reddetti ama bir süre sana kırgın kaldı.' },
        { t: 'Beraber karar verelim, artılarını eksilerini yazalım.', tone: 'saygili', chk: { s: 'konusma', d: 40 }, ok: { r: 'Uzaktan çalışma şartıyla kabul etti. Herkes kazandı.', fx: { 'r.partner': 12 } }, no: { r: 'Tartışma çıktı.', fx: { 'r.partner': -4 } } }] } } },
    { id: 'partner_yurtdisi', chain: true, kind: 'chat', who: 'partner', nodes: {
      start: { who: 'partner', t: '{partner}: "Yurt dışına mı gidiyoruz? Benim burada işim, ailem, hayatım var. Bunu bana sormadan mı karar verdin?"', o: [
        { t: 'Benimle gel, orada yeni bir hayat kuralım.', tone: 'duygusal', chk: { p: 'r.partner', d: 40 }, ok: { r: 'Kabul etti. Yeni şehirde birlikte kayboluyorsunuz.', fx: { 'r.partner': 10 } }, no: { r: '"Gelemem," dedi. Uzak mesafe başladı.', fx: { 'r.partner': -12, flag: 'uzak_iliski' } } },
        { t: 'Uzak mesafe idare ederiz.', fx: { 'r.partner': -5, flag: 'uzak_iliski' }, r: 'Havalimanında uzun bir sarılma.' }] } } },
    { id: 'partner_cocuk', w: 22, if: { partner: [4], kids: ['<', 3], minAge: 24, maxAge: 40 }, kind: 'chat', who: 'partner', nodes: {
      start: { who: 'partner', t: '{partner} elinde bir test çubuğuyla salona geliyor. Gözleri parlıyor: "Sanırım... bir haberim var."', o: [
        { t: 'Gerçekten mi? Baba oluyorum!', tone: 'duygusal', fx: { do: 'kid', 'r.partner': 10 }, r: 'Dokuz ay sonra hayatın değişti.' }] } } },
    { id: 'partner_magazin', w: 10, if: { partner: [2, 3, 4], stat: { sohret: ['>', 35] } }, kind: 'card', who: 'Magazin',
      t: 'Bir magazin programı, {partner} ile restoranda tartışırken çekilmiş görüntüleri yayınladı: "Futbolcu çiftte kriz!"',
      o: [
        { t: 'Ortak bir açıklama yapın', fx: { 'r.partner': 5, 'r.medya': 2 }, r: '"Her çift tartışır, biz çok iyiyiz" dediniz. Haber söndü.' },
        { t: 'Programa dava aç', fx: { para: '-w1', 'r.medya': -6 }, r: 'Dava sürüyor, magazin sana kin besliyor.' },
        { t: 'Hiç yorum yapma', fx: { 'r.partner': -3 }, r: 'Partnerin senin savunmamana bozuldu.' }] },
    { id: 'eski_sevgili', w: 6, if: { partner: [1, 2, 3, 4], anyflag: ['bosandi'] }, kind: 'dm', who: 'Eski sevgilin',
      t: '"Merhaba... Seni özledim. Belki bir kahve içeriz, sadece konuşmak için?"',
      o: [
        { t: 'Partnerine söyle', fx: { 'r.partner': 6, 't.durust': 1 }, r: 'Partnerin dürüstlüğünü takdir etti.' },
        { t: 'Gizlice buluş', fx: { seed: [{ id: 'eski_sevgili_ifsa', in: [2, 8], p: 0.6 }] }, r: 'Sadece bir kahve... öyle mi?' },
        { t: 'Engelle', fx: {}, r: 'Geçmiş geçmişte kaldı.' }] },
    { id: 'eski_sevgili_ifsa', chain: true, kind: 'card', who: 'partner',
      t: 'Bir magazin hesabı seni eski sevgilinle kafede gösteren fotoğraflar paylaştı. {partner} telefonda.',
      o: [
        { t: 'Gerçeği anlat', fx: { 'r.partner': -15 }, chk: { s: 'konusma', d: 50 }, ok: { r: 'Zor bir gece ama inandı.' }, no: { r: 'İnanmadı.', fx: { 'r.partner': -20 } } },
        { t: 'İnkâr et', fx: { 'r.partner': -25 }, r: 'Fotoğraflar ortadayken inkâr işe yaramadı.' }] },

    /* ---------- Çocuklar ---------- */
    { id: 'cocuk_mac', w: 14, if: { kids: ['>', 0] }, kind: 'card', who: '{cocuk}',
      t: '{cocuk} okul maçında oynuyor ve seni tribünde istiyor. Ama aynı saatte kulübün sponsor etkinliği var.',
      o: [
        { t: 'Çocuğunun maçına git', fx: { flag: 'aile_zaman', moral: 8, 't.aile': 1, 'r.baskan': -4 }, r: '{cocuk} gol attı ve tribüne, sana koştu.' },
        { t: 'Sponsor etkinliğine git', fx: { para: 'w1', 'r.baskan': 4, 'r.partner': -4 }, r: '{cocuk} akşam sana maçı anlattı ama sesi kırgındı.' }] },
    { id: 'cocuk_futbol', w: 10, if: { kids: ['>', 0], season: ['>=', 3] }, kind: 'card', who: '{cocuk}',
      t: '{cocuk} bahçede senin eski kramponlarınla top sektiriyor. "Baba, ben de senin gibi olacağım!" diye bağırıyor.',
      o: [
        { t: 'Her akşam onunla antrenman yap', fx: { flag: 'aile_zaman', enerji: -6, 't.aile': 1, moral: 6 }, r: 'Topu birlikte sektiriyorsunuz. Belki bir gün...' },
        { t: '"Okul önce" de', fx: { mental: 2 }, r: '{cocuk} biraz bozuldu ama kitaplarını açtı.' },
        { t: 'Futbol okuluna yazdır', req: { money: 'w1' }, fx: { para: '-w1', flag: 'aile_zaman' }, r: '{cocuk} ilk antrenmandan çok heyecanlı döndü.' }] },

    /* ---------- Aile ---------- */
    { id: 'baba_hastalik', w: 10, if: { hasRole: 'baba', minAge: 21 }, kind: 'call', who: 'anne',
      decline: { fx: { 'r.aile': -10, mental: -6 }, r: 'Annen mesaj attı: "Baban hastanede. Ara beni." Kalbin sıkıştı.' },
      nodes: { start: { who: 'anne', t: '"Oğlum... babanı hastaneye kaldırdık. Kalp krizi geçirdi. Doktorlar ameliyat diyor, ama özel hastane çok pahalı."', o: [
        { t: 'Hemen geliyorum. Masrafları ben karşılarım.', tone: 'duygusal', req: { money: 'w3' }, fx: { para: '-w3', 'r.baba': 25, 'r.aile': 15, enerji: -15, 'r.hoca': -2, album: 'Babanın ameliyatında hastane koridorunda bekledin.' }, r: 'Ameliyat başarılı geçti. Baban gözlerini açınca ilk seni gördü.' },
        { t: 'Para gönderirim ama maç var, gelemem.', fx: { para: '-w3', 'r.baba': 8, 'r.aile': -4 }, r: 'Ameliyat başarılı. Ama annen "keşke burada olsaydın" dedi.' },
        { t: 'Devlet hastanesi de iyi, doktorlara güvenin.', fx: { 'r.aile': -12, 'r.baba': -8, mental: -5 }, r: 'Baban iyileşti ama aile içinde bir şey kırıldı.' }] } } },
    { id: 'kardes_sorun', w: 10, if: { hasRole: 'kardes', minAge: 19 }, kind: 'chat', who: 'kardes', nodes: {
      start: { who: 'kardes', t: '{kardes} gece arıyor, sesi titriyor: "Kötü arkadaşlarla takıldım, bir kavgaya karıştım. Karakoldayım. Babam bilmesin, lütfen."', o: [
        { t: 'Avukat gönderiyorum, sakin ol.', fx: { para: '-w1', 'r.kardes': 15 }, r: 'Kardeşin sabaha karşı serbest bırakıldı. Sana sarıldı.' },
        { t: 'Babamıza söyleyeceğim.', tone: 'sert', fx: { 'r.kardes': -12, 'r.baba': 4 }, r: 'Baban gitti, kardeşin seni "ispiyoncu" ilan etti.' },
        { t: 'Kendin gidip al, konuş.', fx: { enerji: -10, 'r.kardes': 10 }, chk: { s: 'liderlik', d: 35 }, ok: { r: 'Yolda saatlerce konuştunuz. Kardeşin "abi gibi olmak istiyorum" dedi.', fx: { 'r.kardes': 10, 'r.aile': 5 } }, no: { r: 'Yolda kavga ettiniz.', fx: { 'r.kardes': -8 } } }] } } },
    { id: 'kardes_hayran', w: 8, if: { hasRole: 'kardes' }, kind: 'card', who: 'kardes',
      t: '{kardes} okulda herkesin senin kardeşin olduğunu bildiğini söylüyor. "Abi, okul takımına bir gelsen? Herkes seni görmek istiyor."',
      o: [
        { t: 'Okula sürpriz ziyaret yap', fx: { 'r.kardes': 12, 's.karizma': 1, enerji: -5, 'r.memleket': 3 }, r: 'Okul bahçesi seni görünce yıkıldı. Kardeşin en havalı çocuk oldu.' },
        { t: 'İmzalı forma gönder', fx: { 'r.kardes': 5 }, r: 'Forma okul panosuna asıldı.' }] },
    { id: 'anne_ozlem', w: 10, if: { rel: { anne: ['<', 25] } }, kind: 'call', who: 'anne',
      decline: { fx: { 'r.anne': -6 }, r: 'Annenin cevapsız araması ekranda duruyor.' },
      nodes: { start: { who: 'anne', t: '"Oğlum... Uzun zamandır aramıyorsun. Sesini duymak istedim sadece. Yemek yiyor musun?"', o: [
        { t: 'Özür dilerim anne. Bu hafta sonu geliyorum.', tone: 'duygusal', fx: { 'r.anne': 15, mental: 4, enerji: -8 }, r: 'Annen kapıda bekliyordu. Mutfaktan mis gibi kokular geliyordu.' },
        { t: 'Çok yoğunum anne, sonra arayayım.', tone: 'kacamak', fx: { 'r.anne': -5 }, r: 'Annen "tamam oğlum" dedi. Sesi hüzünlüydü.' }] } } },
    { id: 'askerlik', w: 25, if: { minAge: 21, abroad: false, noflag: ['askerlik_tamam', 'askerlik_tecil'] }, kind: 'card', who: 'Askerlik şubesi',
      t: 'Askerlik şubesinden yazı geldi. Ya bedelli askerlik yaparsın (para ve 1 ay eğitim), ya da tecil ettirip erteleyebilirsin.',
      o: [
        { t: 'Bedelli yap', req: { money: 250000 }, fx: { para: -250000, flag: 'askerlik_tamam', enerji: -10, disiplin: 5, mental: 3 }, r: 'Bir aylık temel eğitim. Kışla arkadaşların maçlarını izleyecek.' },
        { t: 'Tecil ettir', fx: { flag: 'askerlik_tecil', seed: [{ id: 'askerlik_son', in: [60, 120], p: 1 }] }, r: 'Şimdilik erteledin. Ama bu iş bitmedi.' },
        { t: 'Normal askerlik yap (6 ay)', fx: { flag: 'askerlik_tamam', do: 'injure:6', disiplin: 15, mental: 6, 's.liderlik': 3, album: 'Vatani görevini yaptın. Kışlada askeri birliğin takımına kaptanlık ettin.' }, r: 'Altı ay futboldan uzak kaldın. Ama bambaşka bir insan olarak döndün.' }] },
    { id: 'askerlik_son', chain: true, kind: 'card', who: 'Askerlik şubesi',
      t: 'Tecil süren doldu. Artık askerlik görevini yapmak zorundasın.',
      o: [
        { t: 'Bedelli', req: { money: 400000 }, fx: { para: -400000, flag: 'askerlik_tamam', unflag: 'askerlik_tecil' }, r: 'Bedelli askerliğini tamamladın.' },
        { t: 'Normal askerlik', fx: { flag: 'askerlik_tamam', unflag: 'askerlik_tecil', do: 'injure:6', disiplin: 15, mental: 5 }, r: 'Altı aylık ara.' }] },
    { id: 'sinav', w: 30, if: { maxAge: 18, season: 1 }, kind: 'card', who: 'Öğretmenin',
      t: 'Lise son sınıftasın. Yarın önemli bir sınav var ama hoca bu akşam ekstra taktik antrenmanı koydu.',
      o: [
        { t: 'Sınava çalış', fx: { mental: 3, 'r.aile': 5, 'r.hoca': -4, flag: 'diploma' }, r: 'Sınavdan iyi not aldın. Annen gururlu.' },
        { t: 'Antrenmana git', fx: { 'r.hoca': 5, 'r.aile': -5, 't.hirsli': 1 }, r: 'Sınavdan kaldın. Bütünlemeye kaldın.' },
        { t: 'Antrenmandan sonra sabaha kadar çalış', fx: { enerji: -20, 'r.hoca': 3, 'r.aile': 3, flag: 'diploma', 't.calis': 1 }, r: 'Gözlerin kan çanağı ama ikisini de hallettin.' }] },
    { id: 'acik_ogretim', w: 8, if: { minAge: 20, noflag: 'acik_ogretim' }, kind: 'card', who: 'Kendin',
      t: 'Bir gece düşündün: Futbol bir gün bitecek. Açık öğretimde işletme okumaya ne dersin?',
      o: [
        { t: 'Kaydol', fx: { flag: 'acik_ogretim', mental: 4, 's.kurnazlik': 2, 'r.baba': 4 }, r: 'Otobüs yolculuklarında ders kitabı okuyorsun.' },
        { t: 'Şimdilik futbol', fx: {}, r: 'Belki ileride.' }] },

    /* ---------- Genel yaşam ---------- */
    { id: 'hayran_hastane', w: 8, if: { stat: { sohret: ['>', 20] } }, kind: 'card', who: 'Bir anne',
      t: 'Bir anne mesaj atmış: "Oğlum lösemi tedavisi görüyor. Tek hayali sizinle tanışmak. Hastanemiz şehir dışında."',
      o: [
        { t: 'Hemen git, sürpriz yap', fx: { 'r.taraftar': 8, 's.karizma': 2, moral: 8, enerji: -10, 'r.medya': 4, album: 'Hastanedeki küçük hayranını ziyaret ettin. Gülüşünü hiç unutmayacaksın.' }, r: 'Çocuğun gözlerindeki ışığı hiç unutmayacaksın.' },
        { t: 'Görüntülü ara ve forma gönder', fx: { 'r.taraftar': 4, moral: 4 }, r: 'Çocuk görüntülü aramada sevinçten ağladı.' },
        { t: 'Vaktim yok', fx: { mental: -3 }, r: 'Mesaj aklından çıkmıyor.' }] },
    { id: 'kidemli_mentor', w: 10, if: { maxAge: 23, hasRole: 'kaptan' }, kind: 'chat', who: 'kaptan', nodes: {
      start: { who: 'kaptan', t: 'Kaptan {kaptan} antrenman sonrası yanına geliyor: "Seni izliyorum evlat. Yeteneklisin ama savruksun. İstersen her sabah erken gel, sana bir şeyler göstereyim."', o: [
        { t: 'Gelirim abi, teşekkürler.', tone: 'saygili', fx: { 'r.kaptan': 12, 'a.pas': 1, mental: 3, enerji: -5, 't.calis': 1 }, r: 'Her sabah 7\'de sahadasınız. Oyunu farklı görmeye başladın.' },
        { t: 'Ben kendi yolumu bulurum.', tone: 'sert', fx: { 'r.kaptan': -8 }, r: 'Kaptan omuz silkip gitti.' }] } } },
    { id: 'genc_mentorluk', w: 10, if: { minAge: 28 }, kind: 'card', who: 'Genç bir takım arkadaşı',
      t: 'Altyapıdan yeni çıkan 17 yaşında bir çocuk seni idol olarak görüyor ama çok gergin. Antrenmanda sürekli hata yapıyor.',
      o: [
        { t: 'Kanatlarının altına al', fx: { 's.liderlik': 3, 'r.takim': 5, 'r.hoca': 3, enerji: -4, 't.lider': 1 }, r: 'Çocuk açılmaya başladı. Hoca sana göz kırptı.' },
        { t: 'Kendi işine bak', fx: {}, r: 'Herkes kendi yolunu bulur.' }] },
    { id: 'kariyer_sonu_dusunce', w: 12, if: { minAge: 31 }, kind: 'card', who: 'Kendin',
      t: 'Sabah kalktığında dizlerin eskisi gibi değil. Duşta bir düşünce: Futbol bittiğinde ne yapacağım?',
      o: [
        { t: 'Antrenörlük kurslarına kaydol', fx: { flag: 'antrenor_kursu', mental: 3, 's.liderlik': 2 }, r: 'UEFA B lisansı için başvurdun.' },
        { t: 'Yatırımlarına odaklan', fx: { 's.kurnazlik': 2 }, r: 'Muhasebecinle uzun bir toplantı.' },
        { t: 'Düşünme, oyna', fx: { moral: 2 }, r: 'Daha çok gol var.' }] },
    { id: 'kopek', w: 5, if: { stat: { mental: ['<', 50] } }, kind: 'card', who: 'Sokak köpeği',
      t: 'Antrenmandan çıkarken ayağı yaralı bir sokak köpeği peşine takıldı. Seni bırakmıyor.',
      o: [
        { t: 'Sahiplen', fx: { mental: 8, moral: 6, para: -3000, 'takipci%': 2, flag: 'kopek' }, r: 'Adını "Penaltı" koydun. Artık maç sonrası seni kapıda bekleyen biri var.' },
        { t: 'Veterinere götür, barınağa teslim et', fx: { mental: 3, para: -1500 }, r: 'Barınak onu iyi bir aileye verdi.' }] },
    { id: 'trafik', w: 5, if: { lux: ['>=', 2] }, kind: 'card', who: 'Trafik polisi',
      t: 'Gece hız sınırını aştığın için çevirmeye takıldın. Polis seni tanıdı: "Abi sen {ad} değil misin?"',
      o: [
        { t: 'Cezanı kabul et, imza ver', fx: { para: -5000, 'r.medya': 2 }, r: 'Polis cezayı yazdı, sonra imza istedi.' },
        { t: 'Tanınmayı kullan, kurtulmaya çalış', fx: {}, chk: { s: 'karizma', d: 45 }, ok: { r: 'Polis güldü, uyarıyla bıraktı.' }, no: { r: 'Polis sinirlendi, ehliyetine el koydu. Haber oldu.', fx: { 'r.medya': -6, para: -15000 } } }] },
    { id: 'eski_ogretmen', w: 5, if: { season: ['>=', 2] }, kind: 'dm', who: 'İlkokul öğretmenin',
      t: '"Sevgili öğrencim, televizyonda seni gördüm, gözlerim doldu. Teneffüslerde hep top peşindeydin. Şimdi okulumuzun bahçesi çamur, çocuklar yine top peşinde."',
      o: [
        { t: 'Okul bahçesine saha yaptır', fx: { para: '-w2', 'r.memleket': 15, moral: 6 }, r: 'Öğretmenin açılışta "işte benim öğrencim" diye ağladı.' },
        { t: 'Sıcak bir cevap yaz', fx: { moral: 3, 'r.memleket': 2 }, r: 'Öğretmenin mesajını sınıfa okumuş.' }] },

    /* ---------- Nadir anlar ---------- */
    { id: 'nadir_idol', w: 3, if: { stat: { sohret: ['>', 30] } }, kind: 'card', who: 'Efsane bir futbolcu',
      t: 'Bir hayır maçında çocukluk idolün olan efsane futbolcu yanına geldi: "Seni izliyorum evlat. Bende eski bir şey var, sana vermek istiyorum." Elinde 2002 Dünya Kupası\'ndan bir krampon.',
      o: [
        { t: 'Kabul et, sarıl', fx: { moral: 15, mental: 8, album: 'Çocukluk idolün kramponunu sana hediye etti.', 'takipci%': 5 }, r: 'Krampon artık vitrininde duruyor.' },
        { t: '"Bunu ben hak edince alacağım" de', fx: { 't.hirsli': 1, 's.karizma': 2, mental: 4 }, r: 'Efsane gülümsedi: "Sözümüz olsun."' }] },
    { id: 'nadir_piyango', w: 2, if: { season: ['>=', 1] }, kind: 'card', who: 'Bayi',
      t: 'Annenin her yılbaşı senin adına aldığı piyango bileti... büyük ikramiyeye bir numara yakın çıktı! Teselli ikramiyesi de az değil.',
      o: [
        { t: 'Parayı annene bırak', fx: { 'r.anne': 15, 'r.aile': 8 }, r: 'Annen mutfak dolaplarını yeniledi, en çok da buna sevindi.' },
        { t: 'Hepsini harca', fx: { para: 150000, moral: 5 }, r: 'Kısa süreli bir sevinç.' }] },
    { id: 'nadir_forma_degisimi', w: 3, if: { tier: [1], abroad: false }, kind: 'card', who: 'Rakip yıldız',
      t: 'Maç sonu, dünyaca ünlü rakip yıldız forma değişmek için sana geldi. Kameralar sizde.',
      o: [
        { t: 'Formayı değiş, sarıl', fx: { moral: 8, 'takipci%': 4, album: 'Dünya yıldızıyla forma değiştin.' }, r: 'O forma artık duvarında.' },
        { t: 'Formanı taraftara at, ona da bir tane söz ver', fx: { 'r.taraftar': 8, 's.karizma': 2 }, r: 'Tribün yıkıldı. Yıldız da alkışladı.' }] },
    { id: 'nadir_yagmur', w: 3, if: {}, kind: 'card', who: 'Saha görevlisi',
      t: 'Maçtan sonra sağanak yağmur bastırdı. Tribün boşaldı ama küçük bir çocuk ıslanarak senin adını haykırıyor.',
      o: [
        { t: 'Sahaya geri koş, çocukla fotoğraf çek', fx: { 'r.taraftar': 6, moral: 6, 'takipci%': 3 }, r: 'Fotoğraf haftanın en çok paylaşılanı oldu.' },
        { t: 'Soyunma odasına git', fx: {}, r: 'Sıcak bir duş.' }] },
    { id: 'nadir_dede_mektup', w: 2, if: { season: ['>=', 3] }, kind: 'card', who: 'Annen',
      t: 'Annen eski bir sandıkta dedenin yazdığı bir mektup buldu: "Torunum bir gün büyük adam olacak, ama önce iyi adam olsun."',
      o: [{ t: 'Mektubu dolabına as', fx: { mental: 10, 't.durust': 1, album: 'Dedenin mektubunu buldun: "Önce iyi adam olsun."' }, r: 'Her maç öncesi bir kez okuyorsun.' }] },

    /* ---------- Nesil ---------- */
    { id: 'nesil_baslangic', chain: true, kind: 'chat', who: 'baba', nodes: {
      start: { who: 'baba', t: 'Baban {babaTam}, eski kramponlarını sana uzatıyor: "Ben bunlarla yıllarca oynadım. Şimdi sıra sende. Ama benim yaptığım hataları yapma."', o: [
        { t: 'Hangi hataları baba?', tone: 'saygili', fx: { 'r.baba': 6, mental: 3 }, next: 'n2' },
        { t: 'Ben senden daha büyük olacağım.', tone: 'iddiali', fx: { 'r.baba': 2, 't.hirsli': 1 }, r: 'Baban kahkaha attı: "İnşallah oğlum, inşallah."' },
        { t: 'Kendi kramponlarımı alırım.', tone: 'sert', fx: { 'r.baba': -8, flag: 'miras_kendi_yolu' }, r: 'Baban kramponları sessizce dolaba geri koydu.' }] },
      n2: { who: 'baba', t: 'Baban gözlerini kaçırıyor: "Ailemi çok ihmal ettim. Paraya, şöhrete kapıldım. Bazen tek bir telefon her şeyi değiştirir. Unutma."', o: [
        { t: 'Unutmayacağım baba.', tone: 'duygusal', fx: { 'r.baba': 10, 't.aile': 1 }, r: 'Baban seni sıkıca sarıldı.' }] } } },
    { id: 'nesil_sikeci', w: 60, if: { flag: 'baba_sikeci', season: 1 }, kind: 'card', who: 'Rakip taraftar',
      t: 'İlk maçında rakip tribün pankart açtı: "ŞİKECİNİN OĞLU!" Babanın geçmişi peşini bırakmıyor.',
      o: [
        { t: 'Gol at ve babanın adını göster', fx: { 't.hirsli': 1 }, chk: { p: 'a.sut', d: 40 }, ok: { r: 'Golü attın ve formanın arkasındaki soyadını gösterdin.', fx: { 'r.baba': 10, sohret: 2 } }, no: { r: 'Gol gelmedi, pankart hâlâ orada.', fx: { mental: -5 } } },
        { t: '"Ben babam değilim" açıklaması yap', fx: { 'r.baba': -10, 'r.medya': 4 }, r: 'Baban bu açıklamayı okuyunca odasına kapandı.' }] },
    { id: 'nesil_efsane', w: 50, if: { flag: 'efsane_baba', season: 1 }, kind: 'card', who: 'Spor Haber',
      t: 'Manşet: "Efsanenin oğlu sahada! Babası gibi olabilecek mi?" Tribünde babanın eski forması giyen yüzlerce taraftar var.',
      o: [
        { t: 'Baskıyı motivasyona çevir', fx: { 't.hirsli': 1, form: 1, mental: -2 }, r: 'Her pas, her şut kıyaslanıyor.' },
        { t: 'Babandan tavsiye iste', fx: { 'r.baba': 8, mental: 4 }, r: 'Baban "onları duyma, topu duy" dedi.' }] },
    { id: 'nesil_mentor', w: 30, if: { gen: ['>', 1], season: ['<=', 2] }, kind: 'chat', who: 'Babanın eski takım arkadaşı', nodes: {
      start: { who: 'Babanın eski takım arkadaşı', t: 'Kulüp yöneticisi, babanın eski takım arkadaşı çıkıyor: "Babanla aynı soyunma odasını paylaştık. O bana çok iyilik yaptı. Senin için ne yapabilirim?"', o: [
        { t: 'Bana sadece adil davranın.', tone: 'saygili', fx: { 'r.baskan': 10, 't.durust': 1 }, r: '"Babanın oğlusun," dedi gülümseyerek.' },
        { t: 'Sözleşmemi iyileştirebilir misiniz?', tone: 'iddiali', fx: { do: 'wage:1.3', 'r.takim': -4, 't.paragoz': 1 }, r: 'Maaşına zam yapıldı. Takımda "torpilli" fısıltıları.' },
        { t: 'Babamın gençliğini anlatın.', tone: 'duygusal', fx: { 'r.baba': 6, mental: 4 }, r: 'Saatlerce dinledin. Babanı hiç böyle tanımamıştın.' }] } } }
  );

  /* ---------- Günün gündemi (gerçek gün başına bir kez) ---------- */
  const daily = (id, t, o) => add({ id: 'gun_' + id, daily: true, rep: 15, kind: 'card', who: 'Günün Gündemi', t, o });
  daily('selfie', 'Markette bir hayranın selfie istedi. Ama sepetinde sadece cips ve kola var.', [
    { t: 'Sepetle birlikte poz ver', fx: { 'takipci%': 1, moral: 2 }, r: 'Fotoğraf "futbolcu da insan" başlığıyla paylaşıldı.' },
    { t: 'Sepeti sakla, sonra poz ver', fx: { 's.kurnazlik': 0.5 }, r: 'Profesyonel bir kare.' }]);
  daily('kahve', 'Kahve dükkânında barista seni tanıdı ve kahveni bedava vermek istiyor.', [
    { t: 'Kabul et, bahşiş bırak', fx: { 's.sosyallik': 0.5, para: -200 }, r: 'Barista bahşişe bakıp gülümsedi.' },
    { t: 'Parasını öde', fx: { 't.durust': 0.3 }, r: 'Barista "örnek adamsın" dedi.' }]);
  daily('podcast', 'Bir futbol podcast\'i seni 10 dakikalık bir sohbete çağırıyor.', [
    { t: 'Katıl', fx: { 'r.medya': 2, 's.konusma': 0.5, enerji: -3 }, r: 'Rahat bir sohbet oldu.' },
    { t: 'Nazikçe reddet', fx: { enerji: 2 }, r: 'Bugün dinlenme günü.' }]);
  daily('ruya', 'Dün gece rüyanda şampiyonluk golünü attın. Sabah kalkınca kalbin hâlâ hızlı atıyor.', [
    { t: 'Ekstra şut çalış', fx: { 'a.sut': 0.4, enerji: -4 }, r: 'Rüyalar çalışınca gerçek olur.' },
    { t: 'Annene anlat', fx: { 'r.anne': 2, moral: 2 }, r: 'Annen "hayırdır inşallah" dedi.' }]);
  daily('krampon', 'Yeni krampon kutusu kapında. Antrenmanda denemek ister misin, yoksa maç gününe mi saklarsın?', [
    { t: 'Antrenmanda alıştır', fx: { form: 0.5 }, r: 'Ayağına oturdu.' },
    { t: 'Maç gününe sakla', fx: { moral: 1 }, r: 'Yeni krampon, yeni şans.' }]);
  daily('komsu', 'Komşu çocuğu topunu bahçene kaçırdı. Kapıda utangaç utangaç bekliyor.', [
    { t: 'Topu ver ve beş dakika sektir', fx: { moral: 3, 'r.memleket': 1 }, r: 'Çocuk mahallede seni anlatıyor.' },
    { t: 'Topu ver, imzala', fx: { 's.karizma': 0.5 }, r: 'Top artık bir hazine.' }]);
  daily('soru', 'Bir takipçin sordu: "Abi sabah kaçta kalkıyorsun?"', [
    { t: '"6\'da, koşuyla başlıyorum"', fx: { 'takipci%': 0.5, disiplin: 1 }, r: 'Gençler motive oldu.' },
    { t: '"Öğlen, kimse duymasın"', fx: { 'takipci%': 1, 'r.hoca': -1 }, r: 'Esprin güldürdü, hocan görmesin.' }]);
  daily('yagmur', 'Sabah sağanak yağmur. Antrenmana koşarak mı gidersin, taksiyle mi?', [
    { t: 'Koşarak', fx: { 'a.fizik': 0.3, enerji: -3 }, r: 'Islak ama dinç vardın.' },
    { t: 'Taksi', fx: { para: -300 }, r: 'Kuru ve sakin.' }]);
  daily('tarif', 'Annen yeni bir yemek tarifi gönderdi: "Sporcuya uygun, dene!"', [
    { t: 'Dene', fx: { saglik: 1, 'r.anne': 2 }, r: 'Fena değil, biraz tuzsuz.' },
    { t: '"Anne gelince yaparsın"', fx: { 'r.anne': 1 }, r: 'Annen gülen emoji yolladı.' }]);
  daily('kitap', 'Takım arkadaşın bir kitap önerdi: Ünlü bir maratoncunun hayatı.', [
    { t: 'Oku', fx: { mental: 2 }, r: 'Bazı cümlelerin altını çizdin.' },
    { t: 'Dizisini izle', fx: { moral: 1 }, r: 'Kısa yoldan ilham.' }]);
})(typeof window !== 'undefined' ? window : globalThis);
