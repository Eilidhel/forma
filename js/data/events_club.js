/* FORMA — kulüp, saha, hoca, takım, medya, transfer, sakatlık ve para olayları */
(function (root) {
  const E = root.F.DATA.events;
  const add = (...evs) => evs.forEach((e) => E.push(e));

  /* ---------- Alt lig gerçekleri ---------- */
  add(
    { id: 'maas_gecikme', w: 18, if: { tier: [3, 4, 5], clubFin: ['<=', 2], noflag: 'maas_gecikiyor', week: [4, 28] }, kind: 'card', who: 'kaptan',
      t: '{kulup} yönetimi iki aydır maaş yatırmıyor. Kaptan {kaptan} soyunma odasında antrenman boykotu öneriyor. Herkes sana bakıyor.',
      o: [
        { t: 'Boykota katıl', fx: { 'r.takim': 10, 'r.baskan': -15, flag: ['maas_gecikiyor', 'boykotcu'], seed: [{ id: 'baskan_intikam', in: [4, 12], p: 0.5 }, { id: 'maas_odeme', in: [3, 6] }] }, r: 'Antrenman yapılmadı. Yerel basın "isyan" manşeti attı.' },
        { t: 'Antrenmana çık, yönetimle sen konuş', fx: { 'r.baskan': 8, 'r.takim': -8, 't.lider': 1, flag: 'maas_gecikiyor', seed: [{ id: 'maas_odeme', in: [2, 5] }] }, chk: { s: 'konusma', d: 40 }, ok: { r: 'Başkan ilk ödemeyi gelecek hafta yapacağına söz verdi.', fx: { 'r.takim': 6 } }, no: { r: 'Başkan "elimizde para yok" deyip seni odadan çıkardı.' } },
        { t: 'Menajerini ara, ayrılık yollarını sor', fx: { 'r.menajer': 4, flag: 'maas_gecikiyor', seed: [{ id: 'maas_odeme', in: [3, 6] }, { id: 'transfer_kulisi', in: [1, 4], p: 0.7 }] }, r: 'Menajerin "devre arasında kurtarırım seni" dedi.' }] },
    { id: 'maas_odeme', chain: true, kind: 'card', who: 'baskan',
      t: 'Başkan {baskanTam} oyuncuları topladı: "Bir sponsor bulduk. Ama alacakların ancak yarısını ödeyebiliriz. Kalanından feragat edene prim var."',
      o: [
        { t: 'Yarısını al, kalanından vazgeç', fx: { do: 'payOwed', 'r.baskan': 10, 't.sadik': 1 }, r: 'Yarım maaş da maaştır. Başkan sırtını sıvazladı.' },
        { t: 'Hepsini isterim, hakkım', tone: 'sert', fx: { 'r.baskan': -10 }, chk: { s: 'konusma', d: 45 }, ok: { r: 'Avukatla gidince tamamını ödediler.', fx: { do: 'payOwed' } }, no: { r: 'Dava yıllar sürecek. Şimdilik hiçbir şey alamadın.', fx: { do: 'loseOwed', mental: -5 } } }] },
    { id: 'baskan_intikam', chain: true, kind: 'card', who: 'baskan',
      t: 'Boykotun bedelini ödüyorsun: başkan hocaya baskı yaptı, adın kadroda yok. Yerel gazetede "disiplinsiz oyuncular" listesi yayınlandı.',
      o: [
        { t: 'Özür dile', fx: { 'r.baskan': 10, 'r.takim': -4, mental: -3 }, r: 'Başkan özrünü kabul etti, kadroya döndün.' },
        { t: 'Basına konuş', tone: 'sert', fx: { 'r.medya': 5, 'r.baskan': -15, 'r.taraftar': 4 }, r: 'Taraftar senden yana. Yönetim değil.' }] },
    { id: 'sike_teklif', w: 8, if: { tier: [3, 4, 5], season: ['>=', 1], week: [10, 30] }, kind: 'dm', who: 'Bilinmeyen numara',
      t: '"Hafta sonu {rakipkulup} maçında bir penaltıya sebep olursan {para_buyuk} senin. Kimse bilmez. Bu ligde herkes yapıyor." Mesaj 30 saniye sonra kendini siliyor.',
      o: [
        { t: 'Kabul et', fx: { para: 'w25', flag: ['sike_yapti'], disiplin: -15, mental: -10, seed: [{ id: 'sike_ortaya', in: [6, 40], p: 0.45 }] }, r: 'Para çantası arabanın bagajındaydı. O gece hiç uyuyamadın.' },
        { t: 'Federasyona ihbar et', fx: { flag: 'sikeyi_reddetti', 'r.medya': 10, sohret: 4, 't.durust': 2, seed: [{ id: 'sike_tehdit', in: [2, 8], p: 0.5 }] }, r: 'Soruşturma başladı. Adın kahraman olarak geçiyor, ama bazıları seni "ispiyoncu" ilan etti.' },
        { t: 'Mesajı sil, görmezden gel', fx: { flag: 'sikeyi_reddetti', mental: -3 }, r: 'Mesajı sildin. Ama o hafta sonu takım arkadaşlarının her hareketine şüpheyle baktın.' }] },
    { id: 'sike_ortaya', chain: true, kind: 'card', who: 'Savcılık',
      t: 'Şike soruşturması genişledi. Telefon kayıtlarında senin numaran da var. Gazeteciler kapının önünde.',
      o: [
        { t: 'İtiraf et, işbirliği yap', fx: { do: 'suspend:8', 'r.medya': -10, sohret: -10, mental: 5, 't.durust': 1, para: '-w10', album: 'Şike soruşturmasında ifade verdin. Hayatının en karanlık günü.' }, r: '8 maç ceza aldın. Ama vicdanın biraz hafifledi.' },
        { t: 'Her şeyi inkâr et', fx: {}, chk: { s: 'kurnazlik', d: 55 }, ok: { r: 'Delil yetersiz bulundu. Ama şüphe hep üstünde kalacak.', fx: { 'r.medya': -8, flag: 'sike_supheli' } }, no: { r: 'Kayıtlar netti. 15 maç ceza ve kulüpten kovulma.', fx: { do: ['suspend:15', 'sacked'], 'r.taraftar': -30, sohret: -15, mental: -15 } } }] },
    { id: 'sike_tehdit', chain: true, kind: 'card', who: 'Karanlık bir araba',
      t: 'Antrenman çıkışı siyah bir araba yanında yavaşladı. Cam indi: "İhbar etmek iyi değil. Dikkatli ol." Araba hızla uzaklaştı.',
      o: [
        { t: 'Polise git', fx: { mental: -3, 'r.baskan': 2 }, r: 'Polis koruma verdi. Bir süre evden çıkarken arkana bakacaksın.' },
        { t: 'Kimseye söyleme', fx: { mental: -8 }, r: 'Gece yatmadan önce kapıyı iki kez kilitliyorsun.' }] },
    { id: 'deplasman_otobus', w: 14, if: { tier: [4, 5] }, kind: 'card', who: 'kaptan',
      t: 'Deplasman yolculuğu 11 saat. Otobüs gece yarısı bir dağ yolunda bozuldu. Şoför "sabaha tamirci gelir" diyor. Maç yarın öğlen.',
      o: [
        { t: 'Takımı motive et, şarkılar söyle', fx: { 'r.takim': 8, 's.liderlik': 2, enerji: -8 }, r: 'Gece yarısı otobüste halay çekildi. Bu takım birbirine kenetlendi.' },
        { t: 'Otobüste uyumaya çalış', fx: { enerji: -4 }, r: 'Boynun tutuldu ama biraz uyudun.' },
        { t: 'Otostop çekip kendin git', fx: { 'r.takim': -6, 'r.hoca': -3, enerji: -10, 't.hirsli': 1 }, r: 'Sahaya ilk sen vardın. Takım arkadaşların sana pek iyi bakmadı.' }] },
    { id: 'kotu_saha', w: 12, if: { tier: [4, 5] }, kind: 'card', who: 'hoca',
      t: 'Deplasmandaki saha tarla gibi: çamur, taş, yarısı çimsiz. Hoca: "Bu sahada top oynanmaz, uzun topla gideceğiz."',
      o: [
        { t: 'Hocayı dinle, basit oyna', fx: { 'r.hoca': 4 }, r: 'Çirkin ama etkili bir futbol.' },
        { t: 'Yine de kısa pas oyna', fx: { 'r.hoca': -3, 'a.dribling': 0.5 }, chk: { p: 'a.dribling', d: 45 }, ok: { r: 'Çamurda bile topu ayağında tuttun. Tribün alkışladı.', fx: { 'r.taraftar': 4 } }, no: { r: 'Top çukura takıldı, rakip kontra attı.', fx: { form: -1 } } },
        { t: 'Hakeme sahanın oynanmaz olduğunu söyle', fx: {}, chk: { s: 'konusma', d: 50 }, ok: { r: 'Hakem maçı erteledi. Bir hafta dinlendin.', fx: { enerji: 15 } }, no: { r: 'Hakem güldü: "Burası Anadolu evlat."' } }] },
    { id: 'yan_is', w: 12, if: { tier: [5], money: ['<', 15000] }, kind: 'card', who: 'Bir esnaf',
      t: 'Kasabadaki kafe sahibi akşamları garsonluk teklif ediyor: "Futbolcu garson müşteri çeker, haftada bin lira veririm."',
      o: [
        { t: 'Kabul et', fx: { para: 4000, enerji: -12, 's.sosyallik': 2, flag: 'garson', 'r.memleket': 3 }, r: 'Akşamları çay taşıyorsun. Müşteriler maçları konuşmaya geliyor.' },
        { t: 'Reddet, futbola odaklan', fx: { disiplin: 2, 't.calis': 1 }, r: 'Cüzdan boş ama kafa net.' }] },
    { id: 'taraftar_grubu', w: 10, if: { stat: { sohret: ['>', 10] } }, kind: 'chat', who: 'Tribün lideri', nodes: {
      start: { who: 'Tribün lideri', t: 'Taraftar grubunun lideri antrenman çıkışı seni bekliyor: "Kardeşim, Pazar günü derbi. Gol atarsan bizim tribüne koşacaksın. Bir de pankart için forma lazım, imzalı."', o: [
        { t: 'Söz, gol atarsam size koşacağım. Forması da benden.', tone: 'duygusal', fx: { 'r.taraftar': 8, para: -1500 }, r: 'Tribün liderinin gözleri parladı.' },
        { t: 'Ben bütün taraftara aitim, bir gruba değil.', tone: 'saygili', fx: { 'r.taraftar': -3, 'r.medya': 2 }, next: 't2' },
        { t: 'Kulüp mağazasından alırsınız.', tone: 'sert', fx: { 'r.taraftar': -10, 't.asabi': 0.5 }, r: 'Lider arkasını döndü. Bir sonraki maçta tribün senin adını yuhaladı.' }] },
      t2: { who: 'Tribün lideri', t: '"Anladım. Burada bize saygı duymayan uzun kalmaz kardeşim, onu da bil."', o: [
        { t: 'Saygı duyuyorum, ama kimsenin adamı değilim.', tone: 'sert', fx: { 's.sogukkanlilik': 1 }, r: 'Gerginlik havada kaldı.' },
        { t: 'Tamam abi, bir forma da size getiririm.', tone: 'saygili', fx: { 'r.taraftar': 6 }, r: 'Lider sırıttı. "Bak işte böyle."' }] } } },
    { id: 'kaptanlik', w: 30, if: { season: ['>=', 2], noflag: 'kaptan', rel: { takim: ['>', 25], hoca: ['>', 10] }, minAge: 22 }, kind: 'chat', who: 'hoca', nodes: {
      start: { who: 'hoca', t: 'Hoca seni odasına çağırdı: "{kaptan} sezon sonunda ayrılıyor. Kaptanlık bandını sana vermek istiyorum. Ama bu şu demek: soyunma odasındaki her sorun artık senin sorunun."', o: [
        { t: 'Bu bir onur hocam. Kabul ediyorum.', tone: 'duygusal', fx: { do: 'captain', 's.liderlik': 4, 'r.hoca': 6, 'r.takim': 4 }, r: 'Bandı koluna taktığın an tüylerin diken diken oldu.' },
        { t: 'Bence {kanka} daha uygun.', tone: 'mutevazi', fx: { 'r.kanka': 12, 'r.hoca': 2, 't.mutevazi': 1 }, r: 'Kankan kaptan oldu. Sana sarıldı: "Asıl kaptan sensin."' },
        { t: 'Kaptanlık ekstra maaş demek mi?', tone: 'esprili', fx: { 'r.hoca': -4 }, chk: { s: 'karizma', d: 45 }, ok: { r: 'Hoca kahkaha attı. "Hayır ama bandı al," dedi.', fx: { do: 'captain', 's.liderlik': 2 } }, no: { r: 'Hoca esprini anlamadı. Kaptanlık başkasına gitti.' } }] } } },
    { id: 'mevki_degisikligi', w: 10, if: { season: ['>=', 1], pos: ['OS', 'FV', 'DF'], rel: { hoca: ['>', -20] } }, kind: 'chat', who: 'hoca', nodes: {
      start: { who: 'hoca', t: 'Hoca taktik tahtasının önünde: "Seni izliyorum. Bence asıl yerin başka bir mevki. Denemek ister misin? Daha çok oynarsın."', o: [
        { t: 'Orta sahayı deneyelim.', if: { pos: ['FV', 'DF'] }, fx: { do: 'pos:OS', 'r.hoca': 8, form: -1 }, r: 'Artık orta sahadasın. İlk haftalar zor ama hoca mutlu.' },
        { t: 'Forvet hattına geçeyim.', if: { pos: ['OS'] }, fx: { do: 'pos:FV', 'r.hoca': 8, form: -1 }, r: 'Artık forvetsin. Gol baskısı sende.' },
        { t: 'Savunmaya çekileyim.', if: { pos: ['OS'] }, fx: { do: 'pos:DF', 'r.hoca': 8, form: -1 }, r: 'Artık defanstasın. Sağlamlık senin işin.' },
        { t: 'Hayır hocam, ben buyum.', tone: 'sert', fx: { 'r.hoca': -6, 't.hirsli': 0.5 }, r: 'Hoca omuz silkti: "Sen bilirsin, kulübede düşünürsün."' }] } } },
    { id: 'disiplin_cezasi', w: 18, if: { stat: { disiplin: ['<', 38] } }, kind: 'chat', who: 'hoca', nodes: {
      start: { who: 'hoca', t: 'Hoca: "Üç antrenmana geç geldin, gece seni kulüpte görmüşler. Bu takımda kurallar var. Ya cezanı kabul edersin ya da kapı orada."', o: [
        { t: 'Haklısınız hocam, cezamı kabul ediyorum.', tone: 'saygili', fx: { para: '-w1', 'r.hoca': 6, disiplin: 8 }, r: 'Bir haftalık maaşın kesildi. Ama hoca sana bir şans daha verdi.' },
        { t: 'Benim özel hayatım beni ilgilendirir.', tone: 'sert', fx: { 'r.hoca': -15, do: 'role:yedek', 't.asabi': 1 }, r: 'Hoca seni yedeklere indirdi.' },
        { t: 'Bir daha olmayacak, söz. Ailevi sorunlarım vardı.', tone: 'duygusal', chk: { s: 'konusma', d: 45 }, ok: { r: 'Hoca yumuşadı. "Bir dahakine bana gel," dedi.', fx: { 'r.hoca': 4, disiplin: 4 } }, no: { r: 'Hoca yalanını yüzünden okudu.', fx: { 'r.hoca': -10, para: '-w1' } } }] } } },
    { id: 'hoca_elestiri', w: 14, if: { formBelow: -2 }, kind: 'card', who: 'hoca',
      t: 'Antrenmanda hoca tüm takımın önünde sana bağırıyor: "Bu tempoyla {lig} bile fazla sana! Uyan artık!"',
      o: [
        { t: 'Başını eğ, daha çok çalış', fx: { 'r.hoca': 3, 't.calis': 1, enerji: -6, form: 1 }, r: 'O gün antrenmandan en son sen çıktın.' },
        { t: 'Sen de bağır', tone: 'sert', fx: { 'r.hoca': -12, 'r.takim': 2, 't.asabi': 1 }, r: 'Takım arkadaşların seni ayırdı. Kulüpte herkes bunu konuşuyor.' },
        { t: 'Antrenmandan sonra özel konuş', fx: {}, chk: { s: 'konusma', d: 40 }, ok: { r: 'Hoca "bende potansiyel görüyorum, o yüzden bağırıyorum" dedi.', fx: { 'r.hoca': 8 } }, no: { r: 'Hoca "konuşacak bir şey yok" dedi.', fx: { 'r.hoca': -2 } } }] },
    { id: 'hoca_kriz', chain: true, kind: 'card', who: 'hoca',
      t: 'Basına söylediklerin hocanın masasında. Seni kadro dışı bıraktı ve antrenmanlara ayrı çalışmanı istedi.',
      o: [
        { t: 'Gidip özür dile', fx: { 'r.hoca': 12, mental: -2 }, r: 'Hoca özrünü kabul etti ama "son kez" dedi.' },
        { t: 'Başkana şikâyet et', fx: { 'r.hoca': -10, 'r.baskan': 4 }, chk: { s: 'kurnazlik', d: 50 }, ok: { r: 'Başkan hocayı uyardı, kadroya döndün. Hoca ise düşman.', fx: { 'r.hoca': -10 } }, no: { r: 'Başkan hocadan yana çıktı.', fx: { 'r.baskan': -8, do: 'role:yedek' } } },
        { t: 'Transfer iste', fx: { do: 'transferTo:down', 'r.taraftar': -4 }, r: 'Menajerin hemen kulüp bakmaya başladı.' }] },
    { id: 'rakip_sakat', w: 12, if: { hasRole: 'rakip' }, kind: 'card', who: 'rakip',
      t: 'Aynı mevkide forma savaşı verdiğin {rakip} antrenmanda sakatlandı. Hastaneye kaldırıldı. Formanın yolu açık görünüyor.',
      o: [
        { t: 'Hastaneye ziyaretine git', fx: { 'r.rakip': 20, 'r.takim': 4, 't.mutevazi': 1 }, r: 'Şaşırdı, sonra gözleri doldu. "Bunu unutmam," dedi.' },
        { t: 'Fırsat bu, antrenmanda ekstra çalış', fx: { 'r.hoca': 4, enerji: -8, 't.hirsli': 1, form: 1 }, r: 'Hoca seni ilk 11\'e yazdı.' },
        { t: 'Sosyal medyada geçmiş olsun yaz', fx: { 'r.rakip': 4, 'r.medya': 2 }, r: 'Klasik bir jest.' }] },
    { id: 'rakip_kavga', w: 14, if: { rel: { rakip: ['<', -25] } }, kind: 'card', who: 'rakip',
      t: 'Antrenmanda {rakip} arkadan sert bir faul yaptı. Ayağa kalktığında sana sırıtıyor: "Yavaş ol çocuk."',
      o: [
        { t: 'Üstüne yürü', tone: 'sert', fx: { 'r.rakip': -10, 'r.hoca': -6, 't.asabi': 1 }, chk: { s: 'sogukkanlilik', d: 50 }, ok: { r: 'Son anda durdun, göz göze geldiniz. Herkes gördü, kimse ceza almadı.' }, no: { r: 'Yumruk yumruğa kavga. İkiniz de para cezası aldınız.', fx: { para: '-w1', 'r.takim': -4 } } },
        { t: 'Bir sonraki pozisyonda topu bacak arasından geçir', fx: {}, chk: { p: 'a.dribling', d: 50 }, ok: { r: 'Bacak arası! Tüm takım "ooooo" dedi.', fx: { 'r.takim': 5, 'r.rakip': -5, moral: 5 } }, no: { r: 'Top ayağına takıldı, rakip güldü.', fx: { moral: -4 } } },
        { t: 'Hocaya söyle', fx: { 'r.takim': -4, 'r.hoca': 2 }, r: 'Hoca rakibini uyardı. Takımda "ispiyoncu" diye fısıldıyorlar.' }] },
    { id: 'kanka_sir', w: 10, if: { rel: { kanka: ['>', 25] } }, kind: 'chat', who: 'kanka', nodes: {
      start: { who: 'kanka', t: 'Kankan {kanka} gece yarısı mesaj atıyor: "Uyanık mısın? Kimseye söyleme ama bahis yüzünden borca girdim. Kulüp öğrenirse biterim."', o: [
        { t: 'Hemen geliyorum, konuşalım.', tone: 'duygusal', fx: { 'r.kanka': 10, enerji: -8 }, next: 'k2' },
        { t: 'Bahis mi? Futbolcuya yasak, delirdin mi?', tone: 'sert', fx: { 'r.kanka': -6, 't.durust': 0.5 }, next: 'k2' }] },
      k2: { who: 'kanka', t: '"Ne yapacağımı bilmiyorum. {para_orta} borcum var. Ailem bilse yıkılır."', o: [
        { t: 'Borcunu ben öderim, ama bir daha oynamayacaksın.', fx: { para: '-w5', 'r.kanka': 25, flag: 'kanka_kurtardi' }, r: 'Kankan ağladı. Bir daha bahis uygulamasını açmadı, en azından öyle söylüyor.' },
        { t: 'Kulüp psikoloğuna gidelim, birlikte.', fx: { 'r.kanka': 12, mental: 2 }, chk: { s: 'sosyallik', d: 40 }, ok: { r: 'Kankan kabul etti. Tedavi süreci başladı.', fx: { 'r.takim': 3 } }, no: { r: 'Kankan "beni ihbar edeceksin" diye kızdı.', fx: { 'r.kanka': -15 } } },
        { t: 'Kendi sorununu kendin çöz.', tone: 'sert', fx: { 'r.kanka': -20, seed: [{ id: 'kanka_bahis_skandal', in: [4, 12], p: 0.6 }] }, r: 'Kankan bir daha sana yazmadı.' }] } } },
    { id: 'kanka_bahis_skandal', chain: true, kind: 'card', who: 'Spor Haber',
      t: '{kulup} oyuncusu {kankaTam} yasa dışı bahis soruşturmasında gözaltına alındı. Gazeteciler sana da soruyor: "Biliyor muydunuz?"',
      o: [
        { t: 'Biliyordum, yardım etmeye çalıştım', fx: { 'r.medya': -2, 'r.kanka': 6 }, r: 'Federasyon seni de ifadeye çağırdı.' },
        { t: 'Hiçbir şey bilmiyordum', fx: { 'r.kanka': -10, mental: -4 }, r: 'Yalan mı, gerçek mi, sen bilirsin.' }] },
    { id: 'dogum_gunu', w: 10, if: { hasRole: 'kanka' }, kind: 'card', who: 'kanka',
      t: 'Bugün {kanka} doğum günü. Takım grubunda kimse hatırlamamış gibi.',
      o: [
        { t: 'Sürpriz pasta ayarla', fx: { para: -1500, 'r.kanka': 12, 'r.takim': 5, 's.sosyallik': 2 }, r: 'Soyunma odasında pastayla karşılaştı, yüzüne krema bulaştırdınız.' },
        { t: 'Mesajla kutla', fx: { 'r.kanka': 3 }, r: '"Sağ ol kanka" yazdı.' },
        { t: 'Sen de unut', fx: { 'r.kanka': -3 }, r: 'Ertesi gün fark ettin. Biraz geç.' }] },
    { id: 'yabanci_uyum', w: 8, if: { tier: [1, 2, 3] }, kind: 'card', who: 'Yeni transfer',
      t: 'Takıma Afrikalı genç bir oyuncu katıldı. Türkçe bilmiyor, yemekhanede tek başına oturuyor.',
      o: [
        { t: 'Yanına otur, İngilizce sohbet et', fx: { 's.sosyallik': 2, dil: 3, 'r.takim': 4 }, r: 'Adı Kwame. Annesine para göndermek için burada. Artık her gün beraber oturuyorsunuz.' },
        { t: 'Takım arkadaşlarını da çağır, masa kurun', fx: { 's.liderlik': 2, 'r.takim': 6 }, r: 'Masa genişledi. Kwame ilk kez güldü.' },
        { t: 'Kendi masana devam et', fx: {}, r: 'Herkesin kendi derdi var.' }] },
    { id: 'klik', w: 10, if: { season: ['>=', 1] }, kind: 'card', who: 'Soyunma odası',
      t: 'Soyunma odası ikiye bölündü: kıdemliler ve gençler. Kıdemliler primlerin eşit dağıtılmasını istemiyor. İki taraf da seni yanında istiyor.',
      o: [
        { t: 'Kıdemlilerin yanında dur', fx: { 'r.kaptan': 8, 'r.takim': -2, 'r.kanka': -4 }, r: 'Kıdemliler seni artık "bizden" sayıyor.' },
        { t: 'Gençlerin yanında dur', fx: { 'r.kanka': 8, 'r.kaptan': -8 }, r: 'Gençler sana sarıldı. Kaptan soğuk.' },
        { t: 'İki tarafı bir araya getir', fx: {}, chk: { s: 'liderlik', d: 50 }, ok: { r: 'Herkesi bir masaya oturttun. Prim krizi çözüldü.', fx: { 'r.takim': 12, 's.liderlik': 2, 't.lider': 1 } }, no: { r: 'Arabuluculuk iki tarafı da kızdırdı.', fx: { 'r.takim': -6 } } }] },
    { id: 'yildiz_transfer', w: 8, if: { tier: [1, 2] }, kind: 'card', who: 'Spor Haber',
      t: '{kulup} senin mevkine Avrupa\'dan tecrübeli bir yıldız transfer etti. Basın "ilk 11 netleşti" yazıyor.',
      o: [
        { t: 'Ondan öğren, yanında çalış', fx: { 'r.takim': 4, 'a.pas': 0.5, 'a.sut': 0.5, mental: 2, 't.mutevazi': 1 }, r: 'Yıldız sana serbest vuruş sırlarını gösterdi.' },
        { t: 'Rekabete gir, antrenmanda ezmeye çalış', fx: { enerji: -10, 't.hirsli': 1, form: 1 }, r: 'Hoca bu hırsı görüyor.' },
        { t: 'Menajerini ara: "Bana kulüp bul."', fx: { do: 'transferTo:down', 'r.taraftar': -3 }, r: 'Menajerin listesi hazır.' }] },
    { id: 'sponsor_bahis', w: 8, if: { followers: ['>', 25000] }, kind: 'card', who: 'menajer',
      t: '{menajer} heyecanlı: "Yurt dışı merkezli bir bahis sitesi seninle reklam anlaşması istiyor. {para_buyuk}! Türkiye\'de yasak ama yurt dışı hesaplarından yayınlanacak."',
      o: [
        { t: 'Kabul et', fx: { para: 'w20', 't.paragoz': 1, 'r.medya': -8, seed: [{ id: 'federasyon_ceza', in: [3, 8], p: 0.7 }] }, r: 'Para hesabına yattı. Federasyon reklamı izlemeye başladı.' },
        { t: 'Reddet', fx: { 't.durust': 1, 'r.medya': 3 }, r: 'Menajerin iç çekti: "Peki, temiz bir marka bulurum."' }] },
    { id: 'reklam_filmi', w: 10, if: { followers: ['>', 40000] }, kind: 'card', who: 'menajer',
      t: 'Ulusal bir dondurma markası seni reklam yüzü yapmak istiyor. Çekim iki gün sürecek, biri antrenman günü.',
      o: [
        { t: 'Kabul et, antrenmanı kaçır', fx: { para: 'w6', sohret: 4, 'takipci%': 6, 'r.hoca': -6, enerji: -10 }, r: 'Reklam her yerde. Hoca da gördü.' },
        { t: 'Sadece antrenman dışı gün çek', fx: { para: 'w3', sohret: 2, 'takipci%': 3 }, chk: { s: 'konusma', d: 40 }, ok: { r: 'Marka kabul etti. Herkes memnun.' }, no: { r: 'Marka başka bir oyuncuyla anlaştı.', fx: { para: '-w3', sohret: -2 } } },
        { t: 'Reddet', fx: { 'r.hoca': 2 }, r: 'Futbol önce.' }] },
    { id: 'milli_ilk', w: 60, if: { nat: 'TR', caps: ['<', 1], ovr: ['>', 70], noflag: 'milli_haber' }, kind: 'call', who: 'Milli Takım Teknik Direktörü',
      decline: { fx: { 'r.medya': -5 }, r: 'Bilinmeyen numarayı açmadın. Sonradan öğrendin: milli takım hocasıymış! Neyse ki tekrar aradı.' },
      nodes: { start: { who: 'Milli Takım Teknik Direktörü', t: '"{ad}, seni izliyorum. Önümüzdeki milli arada aday kadroya çağırıyorum. Ay yıldızlı formayı giymeye hazır mısın?"', o: [
        { t: 'Hocam... Hazırım. Bu hayatımın en güzel günü.', tone: 'duygusal', fx: { flag: 'milli_haber', moral: 15, 'r.aile': 8, sohret: 3, album: 'Milli takım hocası seni aradı. Annen telefonda çığlık attı.' }, r: 'Telefonu kapattıktan sonra beş dakika boyunca hiçbir şey yapamadın.' },
        { t: 'Teşekkürler hocam, sizi mahcup etmem.', tone: 'saygili', fx: { flag: 'milli_haber', moral: 10, sohret: 3 }, r: 'Profesyonelce. Ama içinde bir çocuk zıplıyor.' }] } } },
    { id: 'dergi_kapak', w: 8, if: { stat: { sohret: ['>', 50] } }, kind: 'card', who: 'Moda dergisi',
      t: 'Ünlü bir moda dergisi seni kapağa çıkarmak istiyor. Çekimde eteğe benzer tasarım bir pantolon giymen gerekiyor.',
      o: [
        { t: 'Kabul et, cesur ol', fx: { sohret: 5, 'takipci%': 8, 'r.taraftar': -3, 's.karizma': 3 }, r: 'Kapak olay oldu. Kimi "ikon" dedi, kimi alay etti.' },
        { t: 'Klasik takım elbiseyle çek', fx: { sohret: 3, 'takipci%': 3 }, r: 'Şık ve güvenli.' },
        { t: 'Reddet', fx: {}, r: 'Dergi başka bir sporcuyla anlaştı.' }] },
    { id: 'tv_program', w: 8, if: { stat: { sohret: ['>', 40] } }, kind: 'card', who: 'Yapımcı',
      t: 'Popüler bir akşam programı seni konuk etmek istiyor. Canlı yayında şarkı söyleyip dans etmen bekleniyor.',
      o: [
        { t: 'Git ve şov yap', fx: { 'takipci%': 7, sohret: 3, 'r.hoca': -3, enerji: -8, 't.sovmen': 1 }, chk: { s: 'karizma', d: 50 }, ok: { r: 'Herkes sana bayıldı. Ertesi gün sokakta tanınıyorsun.', fx: { 'r.taraftar': 3 } }, no: { r: 'Şarkı felaketti. Caps\'ler hazır.', fx: { 'r.medya': -2 } } },
        { t: 'Sadece futbol konuşurum', fx: { 'r.medya': 3, 'takipci%': 2 }, r: 'Sıkıcı ama saygın bir röportaj.' },
        { t: 'Reddet', fx: { 'r.hoca': 2 }, r: 'Erken yattın.' }] },
    { id: 'unlu_tanisma', w: 8, if: { stat: { sohret: ['>', 55] }, partner: 'none' }, kind: 'dm', who: 'Ünlü bir oyuncu',
      t: 'Ünlü bir dizi oyuncusundan DM: "Maçlarını izliyorum, bir kahve içelim mi?" Altında kalp emojisi.',
      o: [
        { t: 'Kahve için buluş', fx: { do: 'partner:unlu', 'takipci%': 5 }, r: 'Ertesi gün magazin sayfalarında: "Aşk mı başlıyor?"' },
        { t: 'Kibarca reddet', fx: {}, r: 'Ekran görüntüsü magazine sızmadı, şanslısın.' }] },
    { id: 'doping', w: 5, if: { season: ['>=', 2], formBelow: 0 }, kind: 'card', who: 'Spor salonundan biri',
      t: 'Spor salonunda biri yanaştı: "Bu takviye seni uçurur. Testlerde çıkmaz, garanti. Herkes kullanıyor."',
      o: [
        { t: 'Al ve kullan', fx: { 'a.fizik': 3, 'a.hiz': 2, flag: 'doping', seed: [{ id: 'doping_test', in: [3, 15], p: 0.55 }] }, r: 'İlk hafta kendini makine gibi hissettin.' },
        { t: 'Reddet ve kulüp doktoruna söyle', fx: { 't.durust': 1, 'r.hoca': 3 }, r: 'Doktor salonu uyardı.' },
        { t: 'Reddet, geç', fx: {}, r: 'Kısayol yok.' }] },
    { id: 'doping_test', chain: true, kind: 'card', who: 'Antidoping komisyonu',
      t: 'Rutin doping testi pozitif çıktı. Kariyerin pamuk ipliğinde.',
      o: [
        { t: 'Kabul et ve özür dile', fx: { do: 'suspend:12', sohret: -12, 'r.medya': -10, 'r.taraftar': -15, mental: -10, unflag: 'doping', album: 'Doping cezası aldın. Karanlık bir dönem.' }, r: '12 maç men cezası.' },
        { t: '"Takviyeyi bilmeden aldım" savunması', fx: { para: '-w6', unflag: 'doping' }, chk: { s: 'konusma', d: 55 }, ok: { r: 'Ceza 4 maça indi.', fx: { do: 'suspend:4', sohret: -4 } }, no: { r: 'Kimse inanmadı. 16 maç men.', fx: { do: 'suspend:16', sohret: -15, 'r.medya': -15 } } }] },
    { id: 'federasyon_ceza', chain: true, kind: 'card', who: 'Federasyon',
      t: 'Federasyon disiplin kurulu açıklamaların ve davranışların nedeniyle seni sevk etti.',
      o: [
        { t: 'Savunma yaz', fx: {}, chk: { s: 'konusma', d: 45 }, ok: { r: 'Kurul uyarı ile yetindi.' }, no: { r: '1 maç men ve para cezası.', fx: { do: 'suspend:1', para: '-w1' } } },
        { t: 'Cezayı kabul et', fx: { do: 'suspend:1', para: '-w1', 'r.hoca': -2 }, r: '1 maç cezalısın.' }] },

    /* ---------- Transfer ---------- */
    { id: 'transfer_kulisi', chain: true, kind: 'chat', who: 'menajer', nodes: {
      start: { who: 'menajer', t: '{menajer}: "Telefonlar çalıyor. Bir üst ligden bir kulüp ciddi. Ama şu anki kulübün seni bırakmak istemeyebilir. Masaya oturalım mı?"', o: [
        { t: 'Otur, teklifleri dinleyelim.', fx: { do: 'transferTo:up' }, r: 'Menajerin teklifleri masaya koydu.' },
        { t: 'Şimdi değil, sezonu bitireyim.', fx: { 'r.baskan': 3, 't.sadik': 0.5 }, r: 'Menajerin "fırsatlar beklemez" dedi.' }] } } },
    { id: 'buyuk_ilgi', w: 14, if: { abroad: false, tier: [2, 3, 4, 5], formAbove: 2, week: [6, 30] }, kind: 'card', who: 'menajer',
      t: '{menajer} sabah erkenden arıyor: "{ustkulup} seni izlemiş. Bu hafta teklif yapmak istiyorlar. Ne diyorsun?"',
      o: [
        { t: 'Teklifleri görelim', fx: { do: 'transferTo:up' }, r: 'Teklifler masada.' },
        { t: 'Burada mutluyum', fx: { 'r.baskan': 5, 'r.taraftar': 5, 't.sadik': 1 }, r: 'Taraftarlar sadakatini duydu ve tezahürat besteledi.' }] },
    { id: 'avrupa_teklif', w: 16, if: { tier: [1], ovr: ['>', 72] }, kind: 'chat', who: 'menajer', nodes: {
      start: { who: 'menajer', t: '{menajer}: "Avrupa\'dan ciddi ilgi var! {yabancikulup} temsilcileri İstanbul\'da. Ama dil, yalnızlık, yedek kalma riski... Hazır mısın?"', o: [
        { t: 'Hazırım. Hayalim bu.', fx: { do: 'transferTo:abroad', 't.hirsli': 1 }, r: 'Temsilcilerle akşam yemeği ayarlandı.' },
        { t: 'Bir sezon daha Türkiye.', fx: { 'r.taraftar': 6, 'r.baskan': 4 }, r: 'Taraftarlar "bizi bırakmadı" dedi.' }] } } },
    { id: 'yurtdisi_yalnizlik', chain: true, kind: 'chat', who: 'anne', nodes: {
      start: { who: 'anne', t: 'Gece görüntülü konuşmada annen: "Oğlum yemek yiyor musun? Zayıflamışsın. Orada kimse yok mu yanında?"', o: [
        { t: 'Çok yalnızım anne. Bazen her şeyi bırakıp dönmek istiyorum.', tone: 'duygusal', fx: { 'r.anne': 8, mental: 3, moral: -3 }, r: 'Annen ertesi hafta kolilerle yemek yolladı.' },
        { t: 'Her şey yolunda, merak etme.', tone: 'kacamak', fx: { mental: -4 }, r: 'Telefonu kapattıktan sonra boş daireye baktın.' },
        { t: 'Takımda Türk bir arkadaş buldum, iyiyim.', fx: { mental: 2, 's.sosyallik': 1 }, r: 'Annen rahatladı.' }] } } },
    { id: 'yurtdisi_donus', w: 10, if: { abroad: true, stat: { moral: ['<', 40] } }, kind: 'card', who: 'menajer',
      t: 'Yurt dışında işler istediğin gibi gitmiyor. Süper Lig\'den bir kulüp seni geri getirmek istiyor, maaşın neredeyse aynı kalacak.',
      o: [
        { t: 'Dön', fx: { do: 'transferTo:down', moral: 6 }, r: 'Eve dönüş vakti.' },
        { t: 'Direnmeye devam', fx: { mental: 3, 't.hirsli': 1 }, r: 'Burada kazanacağım, dedin aynaya bakarak.' }] },

    /* ---------- Sakatlık ---------- */
    { id: 'sakatlik_tedavi', chain: true, kind: 'chat', who: 'Kulüp doktoru', nodes: {
      start: { who: 'Kulüp doktoru', t: 'Doktor MR\'a bakıyor: "Ciddi bir sakatlık. Üç yol var: ameliyat olursun, uzun ama kesin. Fizik tedavi, daha kısa ama tekrarlayabilir. Bir de... bazı oyuncular yurt dışında kök hücre tedavisine gidiyor. Pahalı ve tartışmalı."', o: [
        { t: 'Ameliyat olacağım.', fx: { saglik: 6, mental: -3 }, r: 'Ameliyat başarılı. Uzun bir rehabilitasyon seni bekliyor.' },
        { t: 'Fizik tedavi.', fx: { do: 'injure:1', saglik: -3, seed: [{ id: 'sakatlik_tekrar', in: [6, 20], p: 0.35 }] }, r: 'Daha erken dönebilirsin ama risk var.' },
        { t: 'Yurt dışında kök hücre tedavisi.', req: { money: 'w6' }, fx: { para: '-w6', saglik: 4 }, chk: { p: 'saglik', d: 45 }, ok: { r: 'Tedavi mucize gibi geldi, iki hafta erken dönüyorsun.', fx: { mental: 5 } }, no: { r: 'Tedavi işe yaramadı, para gitti.', fx: { mental: -6 } } }] } } },
    { id: 'sakatlik_orta', chain: true, kind: 'card', who: 'Kulüp doktoru',
      t: 'Doktor: "Birkaç hafta yoksun. Ama hafta sonu önemli maç var, hoca iğneyle oynatmamı istiyor. Senin kararın."',
      o: [
        { t: 'İğneyle oyna', fx: { saglik: -6, 'r.hoca': 6, seed: [{ id: 'sakatlik_tekrar', in: [3, 10], p: 0.4 }] }, r: 'Ağrı kesiciyle sahadasın. Bedelini sonra ödeyebilirsin.' },
        { t: 'Tamamen iyileşmeyi bekle', fx: { saglik: 4, 'r.hoca': -2 }, r: 'Sabırlı olmak zor ama doğru.' }] },
    { id: 'sakatlik_tekrar', chain: true, kind: 'card', who: 'Kulüp doktoru',
      t: 'Eski sakatlığın nüksetti. Doktor başını iki yana sallıyor: "Uyarmıştım."',
      o: [{ t: 'Tedaviye başla', fx: { do: 'injure:5', mental: -6 }, r: 'Yine sedyedesin.' }] },

    /* ---------- Para ve lüks sonuçları ---------- */
    { id: 'haciz', chain: true, kind: 'card', who: 'İcra memuru',
      t: 'Kapıda icra memurları var. Borçların ödenmediği için en değerli eşyana el konulacak. Magazinciler de sokakta.',
      o: [
        { t: 'Teslim et', fx: { do: 'sellLux', 'r.medya': -6, mental: -8, sohret: -2, unflag: 'haciz_yakin' }, r: 'Haber akşam programlarındaydı.' },
        { t: 'Menajerinden avans iste', if: { agent: true }, fx: { 'r.menajer': -10 }, chk: { s: 'konusma', d: 45 }, ok: { r: 'Menajerin borcu kapattı ama artık sana karşı eli güçlü.', fx: { para: 'w6', unflag: 'haciz_yakin' } }, no: { r: 'Menajerin reddetti. İcra eşyanı aldı.', fx: { do: 'sellLux', mental: -8 } } }] },
    { id: 'motor_kaza', chain: true, kind: 'card', who: 'Hastane',
      t: 'Motosikletle antrenmana giderken kaza yaptın. Yara bere var, kulüp çok kızgın: "Sözleşmende motor yasağı vardı!"',
      o: [
        { t: 'Motoru sat, özür dile', fx: { do: 'injure:2', 'r.hoca': -4, 'r.baskan': -4 }, r: 'Ucuz atlattın.' },
        { t: 'Sözleşmede öyle bir madde yok', tone: 'sert', fx: { do: 'injure:3', 'r.baskan': -12, para: '-w2' }, r: 'Kulüp para cezası kesti.' }] },
    { id: 'kafe_sorun', chain: true, kind: 'card', who: 'Kafe müdürü',
      t: 'Kafenin müdürü kasadan para çalmış ve kaybolmuş. Vergi borçları da var.',
      o: [
        { t: 'Kafeyi kapat', fx: { para: '-w2', mental: -3 }, r: 'Bir hayal daha bitti.' },
        { t: 'Kendin yönet', fx: { enerji: -10, 's.kurnazlik': 2, 'r.hoca': -2 }, r: 'Antrenmandan sonra kasada oturuyorsun.' }] },
    { id: 'restoran_ortak', chain: true, kind: 'card', who: 'Ortağın',
      t: 'Restoran ortağın gizlice senin adını kullanarak kredi çekmiş. Avukatın "dava açabiliriz ama uzun sürer" diyor.',
      o: [
        { t: 'Dava aç', fx: { para: '-w3', mental: -3 }, chk: { s: 'kurnazlik', d: 45 }, ok: { r: 'Davayı kazandın, ortaklık senin oldu.', fx: { para: 'w8' } }, no: { r: 'Dava sürüncemede.', fx: { mental: -3 } } },
        { t: 'Ortaklığı bitir, zararı kabul et', fx: { para: '-w5' }, r: 'Ders aldın, pahalı bir ders.' }] },
    { id: 'hirsiz', w: 6, if: { lux: ['>=', 3] }, kind: 'card', who: 'Polis',
      t: 'Deplasmandayken eve hırsız girmiş. Saatler, ayakkabılar, imzalı formalar gitmiş. Sosyal medyada paylaşmalı mısın?',
      o: [
        { t: 'Paylaş, yardım iste', fx: { 'takipci%': 2, 'r.taraftar': 3 }, r: 'Taraftarlar araştırmaya başladı. Bir forma geri geldi bile.' },
        { t: 'Sessizce polise bırak', fx: { mental: -3 }, r: 'Güvenlik sistemi kurdurdun.' }] },
    { id: 'vergi', w: 6, if: { money: ['>', 5e6] }, kind: 'card', who: 'Muhasebeci',
      t: 'Muhasebecin: "Vergi denetimi geliyor. Bazı sponsor gelirleri beyan edilmemiş. Ya şimdi öderiz ya da şansımızı deneriz."',
      o: [
        { t: 'Öde', fx: { para: '-w4', 't.durust': 1 }, r: 'Temiz sayfa.' },
        { t: 'Şansımızı deneyelim', fx: {}, chk: { s: 'kurnazlik', d: 55 }, ok: { r: 'Denetim bir şey bulamadı.' }, no: { r: 'Cezalı ödeme ve kötü manşetler.', fx: { para: '-w10', 'r.medya': -8 } } }] },
    { id: 'yatirim_teklif', w: 8, if: { money: ['>', 2e6] }, kind: 'card', who: 'Eski bir tanıdık',
      t: 'Eski bir tanıdığın arıyor: "Ege\'de bir arsa var, iki yılda değeri üçe katlanacak. Ama acele et, başka alıcı var."',
      o: [
        { t: 'Yatır', fx: { para: '-w8' }, chk: { s: 'kurnazlik', d: 50 }, ok: { r: 'Arsa gerçekten değer kazandı! Satıp kâr ettin.', fx: { para: 'w20' } }, no: { r: 'Arsa imara kapalıymış. Para battı.', fx: { mental: -6 } } },
        { t: 'Araştır, acele etme', fx: { 's.kurnazlik': 1 }, r: 'Araştırdıkça şüpheli detaylar çıktı. Uzak durdun.' }] },

    /* ---------- Menajer ---------- */
    { id: 'menajer_teklif', chain: true, kind: 'chat', who: 'Menajer adayı', nodes: {
      start: { who: 'Menajer adayı', t: 'Antrenman çıkışı biri kartvizitini uzatıyor: "Senin gibi bir oyuncunun işlerine profesyonel biri bakmalı. Bağlantılarım var, komisyonum makul."', o: [
        { t: 'Anlaşalım (yerel menajer).', fx: { do: 'agent:2' }, r: 'Artık menajerin var.' },
        { t: 'Daha büyük bir ajans bekliyorum.', if: { ovr: ['>', 62] }, fx: { do: 'agent:3' }, r: 'Bir ajans seni duydu ve hemen aradı.' },
        { t: 'Kendi işlerime kendim bakarım.', tone: 'sert', fx: { 's.konusma': 1 }, r: 'Kartviziti cebine koydun.' }] } } },
    { id: 'menajer_buyuk', w: 10, if: { ovr: ['>', 68], agentTier: ['<', 4] }, kind: 'card', who: 'Uluslararası ajans',
      t: 'Uluslararası bir ajansın Türkiye temsilcisi seni yemeğe davet etti. "Mevcut menajerin seni küçük tutuyor. Biz kapıları açarız. Komisyonumuz yüzde 12."',
      o: [
        { t: 'Geç, ajansla anlaş', fx: { do: ['fireAgent', 'agent:4'] }, r: 'Yeni ajansın ilk işi sana kişisel marka danışmanı tutmak oldu.' },
        { t: 'Mevcut menajerime sadık kal', fx: { 'r.menajer': 10, 't.sadik': 1 }, r: 'Menajerin bunu duyunca duygulandı.' }] },
    { id: 'menajer_ihanet', chain: true, kind: 'card', who: 'Bir gazeteci',
      t: 'Bir gazeteci sana dosya getirdi: menajerin, son sözleşmende kulüpten gizli komisyon almış. Maaşın aslında daha yüksek olabilirmiş.',
      o: [
        { t: 'Menajeri kov', fx: { do: 'fireAgent', mental: -3, 's.kurnazlik': 2 }, r: 'Telefonu yüzüne kapattın.' },
        { t: 'Yüzleş, komisyonu geri iste', fx: {}, chk: { s: 'konusma', d: 50 }, ok: { r: 'Parayı iade etti, komisyonunu düşürdü.', fx: { para: 'w4', unflag: 'menajer_gizli', 'r.menajer': -10 } }, no: { r: 'İnkâr etti, seni tehdit etti.', fx: { 'r.menajer': -25 } } },
        { t: 'Görmezden gel', fx: { mental: -4 }, r: 'Belki gazeteci yalan söylüyordur.' }] },
    { id: 'eski_menajer_intikam', chain: true, kind: 'card', who: 'Spor Haber',
      t: 'Eski menajerin bir programda seni kötüledi: "Disiplinsiz, nankör. Ona her şeyi ben yaptım."',
      o: [
        { t: 'Cevap ver', tone: 'sert', fx: { 'r.medya': -3, 'takipci%': 2 }, r: 'Polemik bir hafta sürdü.' },
        { t: 'Sus, sahada konuş', fx: { 's.sogukkanlilik': 2, 'r.medya': 2 }, r: 'Basın olgunluğunu övdü.' }] },

    /* ---------- Aktivite riskleri ---------- */
    { id: 'act_paparazzi', chain: true, kind: 'card', who: 'Magazin muhabiri',
      t: 'Takım arkadaşlarınla yemekteyken bir magazin muhabiri kamerayla masaya yaklaştı: "Sezonun kötü gitmesi sizi üzmüyor mu, eğleniyorsunuz?"',
      o: [
        { t: 'Gülümse, kısa bir cevap ver', fx: { 'r.medya': 3, 'takipci%': 1 }, r: '"Biz de insanız" dedin. Haber olumlu çıktı.' },
        { t: 'Kamerayı kapat', tone: 'sert', fx: { 'r.medya': -6, 't.asabi': 0.5 }, r: 'Görüntüler "futbolcudan muhabire saldırı" başlığıyla yayınlandı.' }] },
    { id: 'act_kavga_disari', chain: true, kind: 'card', who: 'Garson',
      t: 'Restoranda başka bir masadaki rakip takım taraftarları sizi tanıdı ve laf atmaya başladı.',
      o: [
        { t: 'Hesabı öde, çık', fx: { 's.sogukkanlilik': 1, 'r.takim': 2 }, r: 'Sorun büyümeden çıktınız.' },
        { t: 'Gidip konuş', chk: { s: 'karizma', d: 40 }, ok: { r: 'Masaya gidip fotoğraf çektirdin. Laf atanlar hayranın oldu.', fx: { 'r.taraftar': 4, 'takipci%': 2 } }, no: { r: 'Konuşma tartışmaya döndü. Video internete düştü.', fx: { 'r.medya': -5, 'r.hoca': -3 } } }] },
    { id: 'act_gece_paparazzi', chain: true, kind: 'card', who: 'Magazin muhabiri',
      t: 'Gece kulübünden çıkarken flaşlar patladı. Sabah 4. Ertesi gün antrenman var.',
      o: [
        { t: 'Yüzünü kapat, arabaya bin', fx: { 'r.medya': -2, 'r.hoca': -4 }, r: 'Fotoğraflar yine de yayınlandı: "Gece kuşu {ad}."' },
        { t: 'Poz ver, el salla', fx: { 'takipci%': 3, sohret: 1, 'r.hoca': -6, 't.parti': 1 }, r: 'Magazin seni sevdi, hoca sevmedi.' }] },
    { id: 'act_gece_kavga', chain: true, kind: 'card', who: 'Güvenlik',
      t: 'Gece kulübünde biri üstüne içki döktü ve bilerek yaptığını söyleyip güldü.',
      o: [
        { t: 'Sakin kal, mekânı terk et', fx: { 's.sogukkanlilik': 2 }, r: 'Kendine hâkim oldun.' },
        { t: 'Hesap sor', tone: 'sert', fx: {}, chk: { s: 'sogukkanlilik', d: 45 }, ok: { r: 'Adam özür diledi. Olay kapandı.' }, no: { r: 'Kavga çıktı. Karakolda sabahladın.', fx: { 'r.hoca': -12, 'r.medya': -8, 'r.baskan': -8, disiplin: -6, para: '-w1' } } }] },
    { id: 'act_gece_kiskanc', chain: true, kind: 'chat', who: 'partner', nodes: {
      start: { who: 'partner', t: '{partner} gece 3\'te mesaj attı: "Neredesin? Instagram\'da bir hikâyede gördüm seni, yanındaki kim?"', o: [
        { t: 'Takım arkadaşlarımla çıktım, kimse yok merak etme.', tone: 'saygili', fx: { 'r.partner': -3 }, chk: { s: 'konusma', d: 35 }, ok: { r: '"Tamam, dikkatli ol" yazdı.' }, no: { r: '"Bana yalan söyleme" yazdı ve çevrimdışı oldu.', fx: { 'r.partner': -8 } } },
        { t: 'Hemen geliyorum.', tone: 'duygusal', fx: { 'r.partner': 4, enerji: -4 }, r: 'Eve gittin. Sarılıp uyudunuz.' },
        { t: 'Beni kontrol etme.', tone: 'sert', fx: { 'r.partner': -14 }, r: 'Telefonun sabaha kadar sessiz kaldı.' }] } } },
    { id: 'aile_sofra_baski', chain: true, kind: 'chat', who: 'baba', nodes: {
      start: { who: 'baba', t: 'Akşam yemeğinde baban: "Komşunun oğlu banka müdürü olmuş. Sen hâlâ top peşinde. Bir yedek planın var mı?"', o: [
        { t: 'Baba, bana güvenmen lazım.', tone: 'duygusal', fx: { 'r.baba': 3, mental: -1 }, r: 'Baban sustu. Annen masanın altından elini tuttu.' },
        { t: 'Futbol benim planım.', tone: 'sert', fx: { 'r.baba': -6, 't.hirsli': 0.5 }, r: 'Sofrada kimse konuşmadı.' },
        { t: 'Açık öğretimde işletme okuyorum.', tone: 'saygili', if: { flag: 'acik_ogretim' }, fx: { 'r.baba': 10 }, r: 'Babanın yüzü aydınlandı.' }] } } },
    { id: 'act_sponsor_tepki', chain: true, kind: 'card', who: 'Taraftar',
      t: 'Sponsor çekiminden bir fotoğraf sızdı. Taraftar hesapları: "Maçta yürüyor, reklamda koşuyor!"',
      o: [
        { t: 'Esprili bir cevap ver', fx: { 'r.taraftar': 2, 'takipci%': 2 }, chk: { s: 'karizma', d: 40 }, ok: { r: 'Taraftar güldü.' }, no: { r: 'Espri yanlış anlaşıldı.', fx: { 'r.taraftar': -5 } } },
        { t: 'Özür dile, maça odaklandığını söyle', fx: { 'r.taraftar': 3 }, r: 'Tepkiler yatıştı.' }] },
    { id: 'act_imza_protesto', chain: true, kind: 'card', who: 'Taraftar',
      t: 'İmza gününde bir grup taraftar pankart açtı: "İmza değil, gol istiyoruz!"',
      o: [
        { t: 'Mikrofonu al, onlarla konuş', chk: { s: 'karizma', d: 45 }, ok: { r: 'Söz verdin. Pankartı sen imzaladın, alkış aldın.', fx: { 'r.taraftar': 8 } }, no: { r: 'Yuhalandın.', fx: { 'r.taraftar': -4, moral: -5 } } },
        { t: 'Etkinliği bitir', fx: { moral: -4 }, r: 'Erken ayrıldın.' }] },
    { id: 'act_yayin_gaf', chain: true, kind: 'card', who: 'Sohbet',
      t: 'Canlı yayında oyun oynarken sinirlenip hocan hakkında "taktikten anlamıyor" dedin. Kesit her yerde.',
      o: [
        { t: 'Hemen özür videosu çek', fx: { 'r.hoca': -4, 'r.medya': 1 }, r: 'Hoca özrünü kabul etti ama unutmadı.' },
        { t: 'Arkasında dur', tone: 'sert', fx: { 'r.hoca': -14, 'takipci%': 4 }, r: 'Takipçin arttı, forma şansın azaldı.' }] },
    { id: 'act_psikolog_dedikodu', chain: true, kind: 'card', who: 'Takım arkadaşı',
      t: 'Soyunma odasında biri psikoloğa gittiğini öğrenmiş: "Deli doktoruna mı gidiyorsun kardeşim?" Herkes gülüyor.',
      o: [
        { t: '"Evet, gidiyorum. Siz de gitmelisiniz."', tone: 'sert', fx: { 's.sogukkanlilik': 2, 'r.takim': 2, mental: 3 }, r: 'Gülüşmeler kesildi. Akşam iki takım arkadaşın gizlice psikoloğun numarasını istedi.' },
        { t: 'Gül, geçiştir', fx: { mental: -3 }, r: 'Bir sonraki seansı iptal ettin.' }] },
    { id: 'memleket_borc', chain: true, kind: 'card', who: 'Akraban',
      t: 'Memlekette uzak bir akraban kenara çekti: "Sen artık zenginsin. Benim dükkân batıyor, biraz destek olsan?"',
      o: [
        { t: 'Yardım et', fx: { para: '-w2', 'r.memleket': 6, 'r.aile': 3 }, r: 'Akraban dua etti. Ertesi hafta başka bir akraba aradı.' },
        { t: 'Kibarca reddet', fx: { 'r.memleket': -4 }, chk: { s: 'konusma', d: 40 }, ok: { r: 'Akraban anlayışla karşıladı.' }, no: { r: '"Ünlü olunca bizi unuttu" dedikodusu yayıldı.', fx: { 'r.memleket': -4, 'r.aile': -3 } } }] },
    { id: 'eski_paylasim', chain: true, kind: 'card', who: 'Spor Haber',
      t: 'Yıllar önce attığın provokatif bir paylaşım yeniden gün yüzüne çıktı. Rakip taraftarlar ekran görüntülerini her yere yayıyor.',
      o: [
        { t: 'Özür dile', fx: { 'r.medya': 3, 'r.taraftar': 2, 't.mutevazi': 0.5 }, r: '"Gençtim, hataydı" dedin. Çoğu kişi kabul etti.' },
        { t: '"Hâlâ arkasındayım"', tone: 'sert', fx: { 'takipci%': 4, 'r.medya': -8, 'r.baskan': -4 }, r: 'Tartışma iki hafta sürdü.' },
        { t: 'Hesabı geçici olarak kapat', fx: { 'takipci%': -3, mental: 3 }, r: 'Bir haftalık sessizlik iyi geldi.' }] }
  );
})(typeof window !== 'undefined' ? window : globalThis);
