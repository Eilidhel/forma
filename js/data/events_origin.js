/* FORMA — köken hikâyeleri: her kökenin giriş olayı ve kendine özel zinciri */
(function (root) {
  const E = root.F.DATA.events;
  const add = (...evs) => evs.forEach((e) => E.push(e));

  /* =========================================================
     1. DAĞ KÖYÜNÜN ÇOCUĞU
     ========================================================= */
  add(
    { id: 'intro_koy', chain: true, kind: 'chat', who: 'baba', nodes: {
      start: { who: 'baba', t: 'Gece yarısı. Sobanın başındasın. Baban çayını karıştırırken sana bakmadan konuşuyor: "{kulup} seni istemiş diyorlar. Top peşinde koşmak iş mi oğlum? Kim bakacak bu hayvanlara?"', o: [
        { t: 'Baba, bu benim tek şansım. Gitmem lazım.', tone: 'duygusal', fx: { 'r.baba': -6, moral: 5, 't.hirsli': 1 }, next: 'b2' },
        { t: 'Hafta sonları gelir, hayvanlara yine bakarım.', tone: 'saygili', fx: { 'r.baba': 6, enerji: -5, flag: 'koy_hafta_sonu' }, next: 'b2' },
        { t: '(Sessiz kal, çayını iç)', tone: 'sessiz', fx: { mental: 2 }, next: 'b2' }] },
      b2: { who: 'baba', t: 'Uzun bir sessizlik. Sonra cebinden buruşuk bir zarf çıkarıyor. "Annen biriktirmiş. Krampon al kendine. Rezil olma."', o: [
        { t: 'Zarfı al, babana sarıl.', tone: 'duygusal', fx: { para: 2500, 'r.baba': 10, 'r.anne': 8, moral: 6 }, r: 'Baban seni ilk kez bu kadar uzun tuttu.' },
        { t: 'Zarfı geri ver: "Siz ihtiyacınız var."', tone: 'saygili', fx: { 'r.baba': 14, 'r.anne': 4, 't.durust': 1, mental: 3 }, r: 'Baban başını salladı. "Adam olmuşsun," dedi.' }] } } },
    { id: 'koy_otobus', origin: true, w: 60, if: { origin: 'koy', season: 1, week: [2, 8] }, kind: 'card', who: 'Yorgun bir yolcu',
      t: 'Köyden antrenmana her gün iki saat yol. Minibüs bugün yine bozuldu. Antrenmana yetişmenin tek yolu otostop çekmek ya da yürümek.',
      o: [
        { t: 'Otostop çek', fx: { enerji: -5 }, chk: { s: 'sosyallik', d: 30 }, ok: { r: 'Bir kamyoncu seni bıraktı. Yolda futbol konuştunuz, hatta {kulup} taraftarıymış.', fx: { 'r.taraftar': 2 } }, no: { r: 'Kimse durmadı. Antrenmana yarım saat geç kaldın.', fx: { 'r.hoca': -5 } } },
        { t: 'Koşarak git', fx: { enerji: -15, 'a.fizik': 1, 'r.hoca': 2 }, r: 'Ter içinde ama zamanında vardın. Hoca kronometreye bakıp güldü.' },
        { t: 'Bugün gitme, hayvanlara yardım et', fx: { 'r.baba': 6, 'r.hoca': -8, disiplin: -2 }, r: 'Baban memnun. Hoca değil.' }] },
    { id: 'koy_kar', origin: true, w: 50, if: { origin: 'koy', week: [12, 22] }, kind: 'call', who: 'anne',
      decline: { fx: { 'r.anne': -5 }, r: 'Annen üç kez aradı. Sonra mesaj attı: "Yollar kapandı, iyiyiz merak etme."' },
      nodes: { start: { who: 'anne', t: '"Oğlum, kar yolları kapattı. Babanın ilacı bitti, kasabaya inemiyoruz. Ne yapacağız?"', o: [
        { t: 'Hemen geliyorum, ilacı ben getiririm.', tone: 'duygusal', fx: { 'r.anne': 12, 'r.baba': 12, enerji: -20, 'r.hoca': -6, flag: 'karda_ilac' }, r: 'Karda üç saat yürüdün. İlaç zamanında yetişti. Antrenmanı kaçırdın.' },
        { t: 'Kasabadaki eczacıya para gönderip ilacı yollatırım.', fx: { para: -1500, 'r.anne': 6 }, chk: { s: 'kurnazlik', d: 35 }, ok: { r: 'Eczacı ilacı bir köylüyle traktörle gönderdi. Sorun çözüldü.', fx: { 'r.baba': 5 } }, no: { r: 'Eczacı geç kaldı, baban iki gün ilaçsız kaldı.', fx: { 'r.baba': -6, mental: -4 } } },
        { t: 'Muhtarı ara, yolu açtırsınlar.', fx: {}, chk: { s: 'karizma', d: 40 }, ok: { r: 'Muhtar seni tanıdı: "Futbolcu oğlan!" Kepçe yola çıktı.', fx: { 'r.memleket': 8, 'r.baba': 6 } }, no: { r: 'Muhtar "elimden bir şey gelmez" dedi.', fx: { 'r.anne': -4, mental: -3 } } }] } } },
    { id: 'koy_scout', origin: true, w: 45, if: { origin: 'koy', season: ['>=', 1], tier: [5], ovr: ['>', 44] }, kind: 'card', who: 'Scout',
      t: 'Maçtan sonra deri ceketli bir adam yaklaşıyor. "Ben {ustkulup} adına çalışıyorum. Ama kimse bilmesin. Sana bir deneme antrenmanı ayarlayabilirim. Yalnız... yol masrafı ve aracılık için önden biraz para lazım."',
      o: [
        { t: 'Parayı ver, fırsatı kaçırma', fx: { para: -6000 }, chk: { s: 'kurnazlik', d: 55 }, ok: { r: 'Adam gerçek çıktı! Deneme antrenmanı ayarlandı.', fx: { seed: [{ id: 'koy_deneme', in: [1, 3] }] } }, no: { r: 'Adamın telefonu bir daha açılmadı. Dolandırıldın.', fx: { mental: -6, moral: -8, flag: 'dolandirildi' } } },
        { t: 'Kulübe sor, araştır', fx: { 'r.hoca': 4, 's.kurnazlik': 1 }, r: 'Kulüp böyle birini tanımıyor. Dolandırıcıydı. Ama hocan bu temkinini çok beğendi.' },
        { t: '"Para yok, beni sahada izlesinler."', tone: 'sert', fx: { 's.sogukkanlilik': 2, 't.durust': 1 }, r: 'Adam omuz silkip gitti.' }] },
    { id: 'koy_deneme', chain: true, kind: 'card', who: 'Scout',
      t: 'Deneme antrenmanı günü. {ustkulup} tesisleri bambaşka bir dünya: çim halı gibi, soyunma odasında ısıtmalı zemin. Hoca seni izliyor.',
      o: [
        { t: 'Herkesi geçmeye çalış, göz doldur', fx: { enerji: -15 }, chk: { p: 'a.dribling', d: 45 }, ok: { r: 'Hoca not defterine bir şey yazdı. Yaz döneminde arayacaklar.', fx: { flag: 'scout_iz', 's.karizma': 1 } }, no: { r: 'Bencil oynadığını söylediler. Kapı kapandı.', fx: { moral: -6 } } },
        { t: 'Takım oyunu oyna, hata yapma', fx: { enerji: -10, 'r.hoca': 2 }, r: '"Disiplinli çocuk" dediler. Belki ileride.', }] },
    { id: 'koy_dugun', origin: true, w: 35, if: { origin: 'koy', minAge: 18, season: ['>=', 2] }, kind: 'chat', who: 'anne', nodes: {
      start: { who: 'anne', t: 'Annen telefonda: "Oğlum, köyde herkes evleniyor. Muhtarın kızı Zehra seni soruyormuş. Bir görüşseniz?"', o: [
        { t: 'Anne, önce kariyer. Sonra bakarız.', fx: { 'r.anne': -3, 't.hirsli': 1 }, r: 'Annen iç çekti: "Peki oğlum."' },
        { t: 'Tamam, bayramda gelince tanışırız.', fx: { 'r.anne': 8, 'r.memleket': 4, seed: [{ id: 'koy_zehra', in: [4, 10] }] }, r: 'Annen hemen muhtara haber verdi.' },
        { t: 'Benim zaten biri var.', if: { partner: 'any' }, fx: { 'r.anne': 2, 'r.partner': 3 }, r: 'Annen "Getir de görelim," dedi.' }] } } },
    { id: 'koy_zehra', chain: true, kind: 'card', who: 'Zehra',
      t: 'Bayramda Zehra ile tanıştın. Öğretmenlik okuyor, futboldan anlamıyor ama gülüşü çok sıcak. "Ben şehirde yaşamak istemem," diyor, "ama seni beklerim."',
      o: [
        { t: 'Ciddi düşünelim, yazışalım', fx: { do: 'partner:memleket', 'r.anne': 10, 'r.memleket': 6 }, r: 'Telefon numaralarını değiştiniz.' },
        { t: 'Kibarca vazgeç', fx: { 'r.anne': -5 }, r: 'Zehra anlayışla karşıladı. Annen biraz kırıldı.' }] },
    { id: 'koy_okul_hayali', origin: true, w: 30, if: { origin: 'koy', stat: { sohret: ['>', 40] }, noflag: 'okul_yaptirdi' }, kind: 'card', who: 'Muhtar',
      t: 'Köy muhtarı arıyor: "Köy okulumuz kapanıyor evladım. Öğrenci az, bina harabe. Senin gibi bir evladımız var, belki bir el atarsın?"',
      o: [
        { t: 'Okulu ben yaptıracağım', req: { money: 25e6 }, fx: { para: -25e6, flag: 'okul_yaptirdi', 'r.memleket': 40, 'r.taraftar': 10, sohret: 5, album: 'Köyündeki okul senin adınla yeniden açıldı.' }, r: 'Okulun açılışında çocuklar seni formalarla karşıladı.' },
        { t: 'Bina tamiri için bağış yaparım', fx: { para: '-w4', 'r.memleket': 12, 'r.medya': 3 }, r: 'Çatı yenilendi, okul bir yıl daha açık.' },
        { t: 'Şu an imkânım yok', fx: { 'r.memleket': -6 }, r: 'Muhtar "anlıyorum" dedi. Ama köyde konuşuldu.' }] },

    /* =========================================================
       2. BÜYÜK ŞEHİR AKADEMİSİ
       ========================================================= */
    { id: 'intro_akademi', chain: true, kind: 'chat', who: 'menajer', nodes: {
      start: { who: 'menajer', t: 'A takıma çıktığın ilk gün, şık takım elbiseli bir adam otoparkta seni bekliyor: "Ben {menajerTam}. Seni 12 yaşından beri izliyorum. Kontratın küçük, gücün büyük. Benimle çalışırsan iki yılda Avrupa."', o: [
        { t: 'Babamla konuşmadan imza atmam.', tone: 'saygili', fx: { 'r.baba': 6, 'r.menajer': -3, 's.kurnazlik': 1 }, next: 'm2' },
        { t: 'Avrupa mı? Nereye imza atıyorum?', tone: 'iddiali', fx: { 'r.menajer': 6, 't.hirsli': 1, flag: 'aceleci' }, next: 'm2' },
        { t: 'Komisyonunuz ne kadar?', tone: 'sert', fx: { 's.kurnazlik': 2 }, chk: { s: 'kurnazlik', d: 30 }, ok: { r: 'Adam bir an duraksadı. "Senin için yüzde sekiz," dedi.', fx: { do: 'wage:1' } }, no: { r: '"Detaylar önemli değil," dedi gülümseyerek.' }, next: 'm2' }] },
      m2: { who: 'menajer', t: '"Bak, A takımda yedeksin. Ya burada kalıp maç başına beş dakika oynarsın, ya da seni 2. Lig\'e kiralık gönderirim, her hafta 90 dakika. Karar senin."', o: [
        { t: 'Kalıyorum. Formayı burada kazanacağım.', tone: 'iddiali', fx: { 't.hirsli': 1, 'r.hoca': 2, flag: 'akademi_kaldi' }, r: '"Cesur," dedi menajer. "Umarım hoca da öyle düşünür."' },
        { t: 'Kiralık git, oyna.', fx: { do: 'loan', flag: 'akademi_kiralik', moral: 3 }, r: 'Valizini topladın. Yeni şehir, yeni takım, her hafta 90 dakika.' }] } } },
    { id: 'akademi_ego', origin: true, w: 50, if: { origin: 'akademi', season: 1, week: [3, 12] }, kind: 'chat', who: 'rakip', nodes: {
      start: { who: 'rakip', t: 'Soyunma odasında {rakipTam} yanına geliyor: "Altyapı yıldızı gelmiş. Bak çocuk, bu takımda {mevki} benim. Sen burada su taşırsın."', o: [
        { t: 'Sahada görüşürüz.', tone: 'sert', fx: { 'r.rakip': -8, 't.hirsli': 1, form: 1 }, r: 'Antrenmanda ona bir çalım attın, herkes güldü. Artık açık rakipsiniz.' },
        { t: 'Senden öğreneceğim çok şey var abi.', tone: 'saygili', fx: { 'r.rakip': 8, 'r.takim': 3 }, r: 'Şaşırdı. "Akıllı çocuk," dedi.' },
        { t: '(Görmezden gel, kulaklığını tak)', tone: 'sessiz', fx: { 's.sogukkanlilik': 2 }, r: 'Laf atmaya devam etti ama sen duymadın.' }] } } },
    { id: 'akademi_baba', origin: true, w: 40, if: { origin: 'akademi', hasRole: 'baba' }, kind: 'chat', who: 'baba', nodes: {
      start: { who: 'baba', t: 'Baban maçtan sonra arabada: "Bugün yine 70. dakikada girdin. Ben senin için işimi bıraktım, servisle her gün antrenmana götürdüm. Bu mu sonuç?"', o: [
        { t: 'Baba, elimden geleni yapıyorum!', tone: 'duygusal', fx: { 'r.baba': -2, mental: -3 }, next: 'b2' },
        { t: 'Senin hayalin mi benim hayalim mi, karar ver.', tone: 'sert', fx: { 'r.baba': -15, mental: 4, 't.asabi': 1, flag: 'babaya_kafa' }, r: 'Baban arabayı durdurdu, sessizce yürüyerek gitti.' },
        { t: '(Camdan dışarı bak, cevap verme)', tone: 'sessiz', fx: { mental: -2 }, next: 'b2' }] },
      b2: { who: 'baba', t: 'Baban derin bir nefes alıyor. "Haklısın... Sadece senin için korkuyorum. Futbol acımasız."', o: [
        { t: 'Biliyorum baba. Yanımda olman yeter.', tone: 'duygusal', fx: { 'r.baba': 12, mental: 5 }, r: 'Eve kadar konuşmadınız ama baban radyoyu senin sevdiğin kanala açtı.' },
        { t: 'O zaman artık maçlarıma gelme.', tone: 'sert', fx: { 'r.baba': -10, 's.sogukkanlilik': 1 }, r: 'Bir sonraki maçta tribünde babanın yeri boştu.' }] } } },
    { id: 'akademi_ajans', origin: true, w: 35, if: { origin: 'akademi', season: ['>=', 2], stat: { sohret: ['>', 20] } }, kind: 'card', who: 'Ajans',
      t: 'Uluslararası bir ajans seni yemeğe davet ediyor. "Menajerin seni Türkiye\'de tutuyor çünkü buradaki kulüplerden gizli komisyon alıyor. Biz seni Avrupa\'ya götürürüz."',
      o: [
        { t: 'Menajerimi kov, ajansla anlaş', fx: { do: ['fireAgent', 'agent:4'], 'r.medya': 2 }, r: 'Yeni ajansın ilk işi sosyal medya ekibini yenilemek oldu.' },
        { t: 'Menajerime sor, yüzleş', fx: {}, chk: { s: 'konusma', d: 45 }, ok: { r: 'Menajerin itiraf etti, komisyonunu düşürdü.', fx: { 'r.menajer': -5, unflag: 'menajer_gizli' } }, no: { r: 'Menajerin her şeyi inkâr etti ve sana küstü.', fx: { 'r.menajer': -15 } } },
        { t: 'Sadakat önemli, teklifi reddet', fx: { 'r.menajer': 8, 't.sadik': 1 }, r: 'Ajans kartını bırakıp gitti.' }] },
    { id: 'akademi_altyapi_kardes', origin: true, w: 30, if: { origin: 'akademi', minAge: 19 }, kind: 'dm', who: 'Altyapıdan bir çocuk',
      t: 'Instagram DM\'i: "Abi ben U14\'te oynuyorum. Senin gibi olmak istiyorum ama babam futbolu bırak diyor. Ne yapayım?"',
      o: [
        { t: 'Uzun bir cevap yaz, cesaret ver', fx: { 's.karizma': 1, moral: 3, 'r.taraftar': 2, seed: [{ id: 'akademi_cocuk_doner', in: [40, 80], p: 0.6 }] }, r: 'Çocuk "abi bu mesajı ölene kadar saklayacağım" yazdı.' },
        { t: '"Okulunu bırakma" de', fx: { mental: 1, 'r.medya': 1 }, r: 'Çocuk "tamam abi" yazdı.' },
        { t: 'Görmezden gel', fx: {}, r: 'Mesaj okunmadı olarak kaldı.' }] },
    { id: 'akademi_cocuk_doner', chain: true, kind: 'dm', who: 'Eski bir hayranın',
      t: '"Abi beni hatırlar mısın? Yıllar önce sana yazmıştım, futbolu bırakma demiştin. Bugün profesyonel sözleşme imzaladım. Teşekkürler."',
      o: [{ t: 'Gözlerin dolarak cevap yaz', fx: { moral: 10, mental: 5, album: 'Yıllar önce cesaret verdiğin çocuk profesyonel oldu.' }, r: 'Bazı goller skor tabelasına yazılmaz.' }] },

    /* =========================================================
       3. GURBETÇİ
       ========================================================= */
    { id: 'intro_gurbetci', chain: true, kind: 'chat', who: 'baba', nodes: {
      start: { who: 'baba', t: 'Duisburg\'daki evde, baban fabrika vardiyasından yeni gelmiş: "Oğlum, Almanlar seni istiyor, iyi. Ama unutma, dedenin köyü {koken}. Bir gün o formayı giymeni isterim."', o: [
        { t: 'Baba, ben burada doğdum. Ama kalbim orada.', tone: 'duygusal', fx: { 'r.baba': 10, 'r.memleket': 8, flag: 'gurbet_tr_kalp' }, r: 'Baban gözlerini kaçırdı ama gülümsüyordu.' },
        { t: 'Hangi forma beni isterse onu giyerim.', tone: 'sert', fx: { 'r.baba': -6, 's.kurnazlik': 1, flag: 'gurbet_acik' }, r: '"Sen bilirsin," dedi baban. Sofrada sessizlik oldu.' },
        { t: 'Önce futbolcu olayım, sonra konuşuruz.', tone: 'kacamak', fx: { mental: 2 }, r: 'Baban "tamam" dedi, ama konu kapanmadı.' }] } } },
    { id: 'gurbet_irkcilik', origin: true, w: 45, if: { origin: 'gurbetci', abroad: true, week: [4, 20] }, kind: 'card', who: 'Rakip taraftar',
      t: 'Deplasmanda rakip tribünden senin için ırkçı tezahüratlar yükseliyor. Hakem duymazdan geliyor. Takım arkadaşların sana bakıyor.',
      o: [
        { t: 'Oyunu durdur, hakeme git', tone: 'sert', fx: { 'r.medya': 6, 'r.takim': 4, sohret: 3, 's.liderlik': 2 }, r: 'Maç 10 dakika durdu. Ertesi gün tüm Almanya seni konuşuyordu. Federasyon soruşturma açtı.' },
        { t: 'Gol at ve tribüne sus işareti yap', fx: {}, chk: { p: 'a.sut', d: 42 }, ok: { r: 'Golü attın, sus işareti yaptın. Video viral oldu.', fx: { sohret: 4, 'takipci%': 8, 'r.taraftar': 8 } }, no: { r: 'Golü atamadın, tribün daha da coştu.', fx: { moral: -8, mental: -5 } } },
        { t: 'Sessizce oynamaya devam et', fx: { mental: -6, 's.sogukkanlilik': 2 }, r: 'Maçı bitirdin. Soyunma odasında uzun süre tek başına oturdun.' }] },
    { id: 'gurbet_milli_secim', chain: true, kind: 'chat', who: 'Federasyon temsilcisi', nodes: {
      start: { who: 'Federasyon temsilcisi', t: 'Hem Türkiye hem Almanya federasyonu seni istiyor. Alman temsilcisi: "Bizde dünya kupası kazanma şansın var." Türk temsilcisi: "Senin yerin burası, ailen burada."', o: [
        { t: 'Türkiye. Ay yıldızlı formayı giyeceğim.', tone: 'duygusal', fx: { do: 'nat:TR', 'r.baba': 15, 'r.memleket': 15, 'r.taraftar': 5, album: 'Milli takım tercihini yaptın: Türkiye.' }, r: 'Türkiye\'de manşetler: "{ad} bizim!"' },
        { t: 'Almanya. Kariyerim için en doğrusu.', tone: 'sert', fx: { do: 'nat:DE', 'r.baba': -12, 'r.memleket': -15, sohret: 3, album: 'Milli takım tercihini yaptın: Almanya.' }, r: 'Türkiye\'de bazı taraftarlar sana "hain" dedi. Almanya\'da alkışlandın.' },
        { t: 'Biraz daha düşüneceğim.', tone: 'kacamak', fx: { seed: [{ id: 'gurbet_milli_secim2', in: [10, 25] }] }, r: 'İki federasyon da sabırsızlanıyor.' }] } } },
    { id: 'gurbet_milli_secim2', chain: true, kind: 'card', who: 'Federasyon',
      t: 'Federasyonlar son tarihi verdi: bu hafta karar vermezsen ikisi de vazgeçecek.',
      o: [
        { t: 'Türkiye', fx: { do: 'nat:TR', 'r.baba': 12, 'r.memleket': 12 }, r: 'Kararın verildi: Türkiye.' },
        { t: 'Almanya', fx: { do: 'nat:DE', 'r.baba': -10, 'r.memleket': -12, sohret: 2 }, r: 'Kararın verildi: Almanya.' }] },
    { id: 'gurbet_cagri', origin: true, w: 80, if: { origin: 'gurbetci', nat: null, ovr: ['>', 60] }, kind: 'card', who: 'Menajer',
      t: '{menajer} heyecanla arıyor: "Federasyonlar senin için masada! İkisi de seni istiyor. Bu kararı vermen lazım."',
      o: [{ t: 'Görüşmeye git', fx: { do: 'natPick' }, r: 'Toplantı odasına giriyorsun.' }] },
    { id: 'gurbet_bayram', origin: true, w: 30, if: { origin: 'gurbetci' }, kind: 'card', who: 'Dede',
      t: 'Yaz tatilinde dedenin köyü {koken}\'e gittin. Köy meydanındaki çocuklar seni görünce "Almancı geldi!" diye bağırıyor. Bir de maç yapmak istiyorlar.',
      o: [
        { t: 'Çocuklarla maç yap', fx: { 'r.memleket': 10, moral: 6, enerji: -6, 's.sosyallik': 2 }, r: 'Toz toprak içinde iki saat oynadın. En güzel maçındı belki.' },
        { t: 'Kahvede dedenin arkadaşlarıyla çay iç', fx: { 'r.memleket': 6, mental: 4 }, r: 'Yaşlılar dedenin gençliğini anlattı. Hiç bilmediğin hikâyeler.' }] },

    /* =========================================================
       4. MAHALLE FUTBOLCUSU
       ========================================================= */
    { id: 'intro_mahalle', chain: true, kind: 'chat', who: 'Mahalleden Kemal', nodes: {
      start: { who: 'Mahalleden Kemal', t: 'Deneme antrenmanından önceki gece, mahallenin köşesinde eski arkadaşın Kemal: "Kanka, yarın sınav varmış diye duydum. Gel bu gece son bir tur atalım, sonra yıldız olursun, bizi unutursun."', o: [
        { t: 'Bu gece olmaz Kemal. Yarın her şeyim.', tone: 'saygili', fx: { disiplin: 5, enerji: 10, 'r.memleket': -3 }, next: 'k2' },
        { t: 'Bir saat takılırız, sonra eve.', fx: { enerji: -10, 's.sosyallik': 2, moral: 4 }, chk: { s: 'sogukkanlilik', d: 30 }, ok: { r: 'Söz verdiğin gibi bir saatte döndün.', next: 'k2' }, no: { r: 'Bir saat dört saate döndü. Sabah zor kalktın.', fx: { enerji: -15 }, next: 'k2' } }] },
      k2: { who: 'Mahalleden Kemal', t: 'Kemal sırıtıyor: "Bak, kolay para işleri var. Sen ünlü olunca biraz yardım edersin, değil mi? Mahalle seni unutmaz."', o: [
        { t: 'Ben futbol oynayacağım, o işlere bulaşmam.', tone: 'sert', fx: { 't.durust': 1, 'r.memleket': -2 }, r: 'Kemal omuz silkti. "Sen bilirsin kanka."' },
        { t: 'Göreceğiz bakalım.', tone: 'kacamak', fx: { flag: 'kemal_bagli', seed: [{ id: 'mahalle_kemal_bela', in: [20, 50], p: 0.7 }] }, r: 'Kemal elini sıktı. Bu söz bir gün geri gelecek.' }] } } },
    { id: 'mahalle_deneme', origin: true, w: 70, if: { origin: 'mahalle', season: 1, week: [1, 4] }, kind: 'card', who: '{hoca}',
      t: 'Deneme antrenmanının son dakikaları. Hoca seni ve bir başka genci aynı anda izliyor. Sadece biriniz sözleşme alacak. Top ayağında.',
      o: [
        { t: 'Rabona ile orta yap, şov yap', fx: {}, chk: { p: 'a.dribling', d: 42 }, ok: { r: 'Hoca bağırdı: "Bu çocuğu kaydedin!" Herkes seni konuşuyor.', fx: { 'r.hoca': 6, 'r.takim': 2, sohret: 1 } }, no: { r: 'Top auta gitti. Hoca kafasını salladı ama yine de sözleşme verdi.', fx: { 'r.hoca': -4 } } },
        { t: 'Basit oyna, pası yerine ver', fx: { 'r.hoca': 3, 'r.takim': 3 }, r: 'Hoca "akıllı oyuncu" dedi. Sözleşme senin.' }] },
    { id: 'mahalle_kemal_bela', chain: true, kind: 'call', who: 'Mahalleden Kemal',
      decline: { fx: { flag: 'kemal_kizgin', seed: [{ id: 'mahalle_kemal_tehdit', in: [3, 8], p: 0.6 }] }, r: 'Kemal arka arkaya aradı. Sonra bir mesaj: "Unutma kanka, sözün vardı."' },
      nodes: { start: { who: 'Mahalleden Kemal', t: '"Kanka başım dertte. Bazı adamlara borcum var. {para_orta} lazım, yoksa beni bulurlar. Sen artık futbolcusun, sana ne ki?"', o: [
        { t: 'Parayı gönder', fx: { para: '-w5', 'r.memleket': 8, flag: 'kemal_borc' }, r: 'Kemal "hayatımı kurtardın" dedi. Ama bu son olacak mı?' },
        { t: '"Polise git Kemal."', tone: 'sert', fx: { 'r.memleket': -6, 't.durust': 1 }, r: 'Kemal küfrederek telefonu kapattı.' },
        { t: 'Avukat tutup yardım et', fx: { para: '-w1', 'r.memleket': 4 }, chk: { s: 'kurnazlik', d: 45 }, ok: { r: 'Avukat borcu yasal yoldan çözdü. Kemal temize çıktı.', fx: { mental: 4 } }, no: { r: 'Avukat da çözemedi. Kemal ortadan kayboldu.', fx: { mental: -4 } } }] } } },
    { id: 'mahalle_kemal_tehdit', chain: true, kind: 'card', who: 'Bilinmeyen numara',
      t: 'Gece yarısı mesaj: "Kemal\'in borcunu sen ödeyeceksin. Yoksa magazincilere bazı fotoğraflar gider." Ekte, yıllar önce mahallede çekilmiş bulanık bir fotoğraf var.',
      o: [
        { t: 'Kulübün avukatına git', fx: { 'r.baskan': -3, mental: 3 }, r: 'Avukat polise başvurdu. Tehditler kesildi ama yönetim olaydan haberdar.' },
        { t: 'Parayı öde, kapansın', fx: { para: '-w3', mental: -6 }, r: 'Ödedin. Ama her gece telefona bakıyorsun.' },
        { t: 'Fotoğrafı kendin paylaş, önünü kes', fx: { 'takipci%': 4, 'r.medya': 2, 's.karizma': 2 }, chk: { s: 'karizma', d: 40 }, ok: { r: '"Mahallemden çıktım, saklayacak bir şeyim yok" yazdın. Takdir topladın.', fx: { 'r.taraftar': 6 } }, no: { r: 'Paylaşım ters tepti, magazin olayı büyüttü.', fx: { 'r.medya': -6 } } }] },
    { id: 'mahalle_hali_saha', origin: true, w: 30, if: { origin: 'mahalle', season: ['>=', 2] }, kind: 'card', who: 'Mahallenin çocukları',
      t: 'Eski mahallene uğradın. Halı sahanın tel örgüleri kopmuş, zemini delik deşik. Çocuklar seni görünce koşuyor: "Abi bizimle maç yap!"',
      o: [
        { t: 'Maç yap, sonra sahayı yeniletmeyi teklif et', fx: { para: '-w2', 'r.memleket': 15, moral: 8, enerji: -6 }, r: 'Bir ay sonra yeni çim serildi. Kapıya adın yazıldı.' },
        { t: 'Maç yap, fotoğraf çektir', fx: { 'r.memleket': 6, 'takipci%': 2, moral: 5, enerji: -5 }, r: 'Fotoğraf yerel sayfalarda paylaşıldı.' },
        { t: 'Vaktim yok çocuklar', fx: { 'r.memleket': -6 }, r: 'Çocuklar bozuldu. "Ünlü oldu, bizi unuttu."' }] },

    /* =========================================================
       5. ESKİ FUTBOLCUNUN ÇOCUĞU
       ========================================================= */
    { id: 'intro_miras', chain: true, kind: 'chat', who: 'baba', nodes: {
      start: { who: 'baba', t: 'Baban duvardaki eski milli takım formasının önünde: "{kulup} başkanı benim eski dostum. Seni almasının sebebi soyadın değil, yeteneğin. Ama herkes öyle düşünmeyecek, hazır ol."', o: [
        { t: 'Kimse beni senin oğlun diye anmayacak, göreceksin.', tone: 'iddiali', fx: { 'r.baba': 4, 't.hirsli': 1, flag: 'miras_kendi_yolu' }, r: 'Baban gülümsedi: "Ben de senin yaşında aynısını demiştim."' },
        { t: 'Senin gibi olmak istiyorum baba.', tone: 'duygusal', fx: { 'r.baba': 10, mental: -2, flag: 'miras_golge' }, r: 'Baban seni kucakladı. Ama gölgesi büyük.' },
        { t: 'Belki başka bir soyadla oynasam?', tone: 'esprili', fx: { 'r.baba': -4, 's.sosyallik': 1 }, r: 'Baban önce kızdı, sonra kahkaha attı.' }] } } },
    { id: 'miras_kiyas', origin: true, w: 45, if: { anyflag: ['miras', 'nesil'], season: 1, week: [5, 18] }, kind: 'card', who: 'Köşe yazarı',
      t: 'Bir spor yazarı köşesinde yazmış: "{soyad} soyadı ağır bir yük. Babası bu yaşta milli takımdaydı. Oğlu ise hâlâ {lig} seviyesinde. Torpil mi, yetenek mi?"',
      o: [
        { t: 'Yazara sosyal medyadan cevap ver', tone: 'sert', fx: { 'takipci%': 3, 'r.medya': -5, 't.asabi': 1 }, r: 'Polemik büyüdü, babanın eski rakipleri de katıldı.' },
        { t: 'Babanı ara, ne yapmalı diye sor', fx: { 'r.baba': 6, mental: 3 }, r: 'Baban "Cevabı sahada ver" dedi. O hafta ekstra antrenmana kaldın.' },
        { t: 'Yazıyı çerçevele, motivasyon yap', fx: { 't.hirsli': 1, form: 1, mental: 2 }, r: 'Yazıyı dolabına astın. Her antrenmanda gözünün önünde.' }] },
    { id: 'miras_babanin_dusmani', origin: true, w: 35, if: { anyflag: ['miras', 'nesil'], season: ['>=', 1] }, kind: 'chat', who: 'hoca', nodes: {
      start: { who: 'hoca', t: 'Hoca seni odasına çağırıyor: "Senin babanla 1998\'de aynı takımdaydık. Bir derbide beni yedek kulübesine gömmesine sebep oldu. Bunu bilmeni istedim. Burada ayrıcalık yok."', o: [
        { t: 'Ben babam değilim hocam. Beni kendi performansımla değerlendirin.', tone: 'saygili', fx: { 'r.hoca': 8, 's.konusma': 1 }, r: 'Hoca uzun uzun baktı. "İyi cevap," dedi.' },
        { t: 'Geçmişi benim üzerimden mi çıkaracaksınız?', tone: 'sert', fx: { 'r.hoca': -12, 't.asabi': 1 }, r: 'Hoca kapıyı gösterdi. Bu sezon zor geçecek.' },
        { t: 'Babamla barışmanızı ister misiniz? Bir yemek ayarlayayım.', tone: 'duygusal', chk: { s: 'sosyallik', d: 40 }, ok: { r: 'Yemek harika geçti. İki eski dost sarıldı. Hoca artık seni farklı görüyor.', fx: { 'r.hoca': 15, 'r.baba': 8 } }, no: { r: 'Yemek kavgayla bitti. Herkes daha kötü.', fx: { 'r.hoca': -6, 'r.baba': -4 } } }] } } },

    /* =========================================================
       6. GEÇ BAŞLAYAN
       ========================================================= */
    { id: 'intro_gec', chain: true, kind: 'chat', who: 'Büro müdürü', nodes: {
      start: { who: 'Büro müdürü', t: 'Muhasebe bürosunda müdür seni odasına çağırıyor: "Hafta sonları top oynadığını duydum. Kadroya geçmen için çok iyi bir fırsat var, ama tam zamanlı olman gerek. Futbolu bırakacak mısın?"', o: [
        { t: 'İşi bırakıyorum. Hayatımda bir kez risk alacağım.', tone: 'duygusal', fx: { do: 'quitJob', moral: 8, 'r.aile': -6, flag: 'gec_risk' }, r: 'Müdür şaşırdı. Annen telefonda ağladı. Ama içinde bir kuş kanat çırpıyor.' },
        { t: 'İkisini birden yürütürüm.', fx: { enerji: -10, mental: -2, flag: 'gec_iki_is' }, r: 'Müdür "bakalım" dedi. Sabah 8\'de büro, akşam 6\'da antrenman.' }] } } },
    { id: 'gec_yorgunluk', origin: true, w: 55, if: { origin: 'gec', flag: 'is_var', week: [4, 20] }, kind: 'card', who: 'Kendin',
      t: 'Sabah büro, akşam antrenman, gece hafta sonu maçının taktiği. Aynada kendine bakıyorsun: gözaltların mor. Bir şeyi bırakmak zorundasın.',
      o: [
        { t: 'İşi bırak', fx: { do: 'quitJob', enerji: 20, moral: 5, 'r.aile': -4 }, r: 'Artık tam zamanlı futbolcusun. Maaşın az ama zamanın senin.' },
        { t: 'Devam, ikisi de önemli', fx: { enerji: -15, mental: -5, 't.calis': 1 }, r: 'Kahve fincanların sayısı artıyor.' }] },
    { id: 'gec_yas', origin: true, w: 40, if: { origin: 'gec', minAge: 23 }, kind: 'card', who: 'Scout',
      t: 'Bir üst lig kulübünün scoutu seni izlemeye geldi. Maç sonu konuşuyorsunuz: "Çok iyisin ama 23 yaşındasın. Yönetim gençlere yatırım yapmak istiyor."',
      o: [
        { t: '"Bana bir antrenman verin, yaşımı unutturacağım."', tone: 'iddiali', chk: { s: 'konusma', d: 45 }, ok: { r: 'Scout notunu yükseltti. Yazın aranacaksın.', fx: { flag: 'scout_iz', 'r.menajer': 3 } }, no: { r: 'Scout gülümsedi, kartını bıraktı ve gitti.', fx: { moral: -4 } } },
        { t: 'Olgunluğunu ve zihnini anlat', tone: 'saygili', fx: { 's.konusma': 2 }, chk: { s: 'konusma', d: 35 }, ok: { r: '"Liderlik vasfın var," dedi. Rapor olumlu.', fx: { flag: 'scout_iz' } }, no: { r: 'İlgi gösterdi ama söz vermedi.' } }] },
    { id: 'gec_universite', origin: true, w: 25, if: { origin: 'gec' }, kind: 'dm', who: 'Üniversite arkadaşın',
      t: '"Dostum, mezunlar buluşması var. Herkes plaza işlerinde, maaşlarını konuşuyorlar. Sen hâlâ BAL\'da top mu koşturuyorsun? Gel, anlat bize!"',
      o: [
        { t: 'Git, gururla anlat', fx: { 's.sosyallik': 2, moral: 3, enerji: -6 }, chk: { s: 'karizma', d: 35 }, ok: { r: 'Herkes seni dinledi. "Cesaretine hayranım," dedi biri.', fx: { mental: 4 } }, no: { r: 'Biri "hâlâ mı?" dedi. Eve moralin bozuk döndün.', fx: { mental: -4 } } },
        { t: 'Gitme, antrenmana odaklan', fx: { disiplin: 2, 't.calis': 1 }, r: 'O akşam serbest vuruş çalıştın.' }] },

    /* =========================================================
       7. KARADENİZ BALIKÇI KASABASI
       ========================================================= */
    { id: 'intro_balikci', chain: true, kind: 'chat', who: 'baba', nodes: {
      start: { who: 'baba', t: 'Limanda, baban ağları onarırken: "Hamsi sezonu başlıyor. Seninle çıkarsak bu kış rahatız. Ama o top meselesi... Kulüp seni istiyormuş. Deniz mi, saha mı?"', o: [
        { t: 'Saha, baba. Ama sezon boyu hafta sonları teknedeyim.', fx: { 'r.baba': 4, enerji: -5, flag: 'balikci_hafta_sonu' }, r: 'Baban başını salladı. "Deniz seni bekler."' },
        { t: 'Saha. Artık balıkçı değil, futbolcuyum.', tone: 'iddiali', fx: { 'r.baba': -8, 't.hirsli': 1 }, r: 'Baban ağı yere attı. Uzun süre denize baktı.' },
        { t: 'Bu sezon denize çıkayım, aileye para lazım.', tone: 'saygili', fx: { para: 8000, 'r.baba': 12, 'r.hoca': -6, 'a.fizik': 1 }, r: 'Ellerin nasır tuttu ama cebin doldu. Hoca antrenmanları kaçırmana bozuldu.' }] } } },
    { id: 'balikci_firtina', origin: true, w: 50, if: { origin: 'balikci', week: [10, 22] }, kind: 'call', who: 'anne',
      decline: { fx: { 'r.anne': -8, mental: -6 }, r: 'Telefonu açmadın. Sabah öğrendin: baban fırtınada mahsur kalmış, sahil güvenlik kurtarmış.' },
      nodes: { start: { who: 'anne', t: '"Oğlum! Baban fırtınada denizde kaldı, telsizi cevap vermiyor! Sahil güvenlik yolda ama..." Yarın önemli bir maçın var.', o: [
        { t: 'Hemen eve gidiyorum.', tone: 'duygusal', fx: { 'r.anne': 12, 'r.baba': 15, enerji: -25, 'r.hoca': -4, flag: 'firtina_eve' }, r: 'Gece yolculuk yaptın. Sabaha karşı baban limana döndü. Sana öyle bir sarıldı ki...' },
        { t: 'Kasabadaki balıkçıları ara, teknelerle çıksınlar.', chk: { s: 'liderlik', d: 35 }, ok: { r: 'Üç tekne denize açıldı. Babanı onlar buldu. Kasaba seni konuşuyor.', fx: { 'r.memleket': 12, 'r.baba': 10 } }, no: { r: 'Kimse fırtınada çıkmak istemedi. Sahil güvenlik sabaha karşı buldu.', fx: { mental: -4 } } },
        { t: 'Bekle, haber gelince ara.', fx: { mental: -8, enerji: -10 }, r: 'Bütün gece uyumadın. Baban sabah kurtuldu ama sen maçta yoktun.' }] } } },
    { id: 'balikci_hamsi', origin: true, w: 30, if: { origin: 'balikci', season: ['>=', 2] }, kind: 'card', who: 'Takım arkadaşı',
      t: 'Soyunma odasında takım arkadaşların Karadenizli olduğunu öğrenince sürekli hamsi şakası yapıyor. Bugün dolabına plastik bir hamsi asmışlar.',
      o: [
        { t: 'Ertesi gün herkese hamsili pilav getir', fx: { 'r.takim': 10, 's.sosyallik': 3, para: -800 }, r: 'Pilav yarım saatte bitti. Artık "Kaptan Hamsi" lakabın var, sevgiyle.' },
        { t: 'Sinirlen, şakayı yapana bağır', tone: 'sert', fx: { 'r.takim': -6, 't.asabi': 1 }, r: 'Ortam gerildi. Kimse bir daha şaka yapmadı ama kimse de konuşmuyor.' },
        { t: 'Gülüp geç, hamsiyi dolabında sakla', fx: { 'r.takim': 5, mental: 2 }, r: 'Uğurlu hamsin oldu. O hafta gol attın derler.' }] },

    /* =========================================================
       8. SAKATLIKTAN DÖNEN
       ========================================================= */
    { id: 'intro_sakat', chain: true, kind: 'chat', who: 'Fizyoterapist', nodes: {
      start: { who: 'Fizyoterapist', t: 'İki yıllık tedavinin son seansı. Fizyoterapistin: "Dizin sağlam ama kafandaki yara iyileşmedi. Topa kayarak girmekten korkuyorsun, fark ediyorum. Ne yapacaksın?"', o: [
        { t: 'Korkumla yüzleşeceğim. Her antrenmanda kayacağım.', tone: 'iddiali', fx: { mental: 6, saglik: -4, 's.sogukkanlilik': 2 }, r: 'İlk kaydığında dizinde bir sızı. Ama geçti. Gözlerin doldu.' },
        { t: 'Bir spor psikoloğuyla çalışacağım.', fx: { mental: 10, para: -8000 }, r: 'Psikolog sana bir defter verdi: "Her korkunu yaz, sonra üstünü çiz."' },
        { t: 'Oyunumu değiştireceğim, temassız oynayacağım.', fx: { 'a.pas': 2, 'a.fizik': -2, mental: 3 }, r: 'Daha akıllı oynamaya başladın.' }] } } },
    { id: 'sakat_eski_takim', origin: true, w: 45, if: { origin: 'sakat', season: 1, week: [6, 20] }, kind: 'card', who: 'Eski takım',
      t: 'Sakatlandığın Süper Lig takımının maçını televizyonda izliyorsun. Senin mevkinde oynayan genç oyuncu gol attı ve spiker "yeni bir yıldız doğuyor" dedi.',
      o: [
        { t: 'Televizyonu kapat, koşuya çık', fx: { 'a.fizik': 1, enerji: -10, mental: 2, 't.hirsli': 1 }, r: 'Yağmurda 10 kilometre koştun. Döndüğünde kafan berraktı.' },
        { t: 'Genç oyuncuya tebrik mesajı at', fx: { 's.karizma': 2, mental: 4, 't.mutevazi': 1 }, r: 'Cevap yazdı: "Abi sen benim idolümdün." Bu cümle bütün gün aklından çıkmadı.' },
        { t: 'Eski menajerini ara, geri dönüş planı yap', fx: { 'r.menajer': 4 }, r: 'Menajerin "bir sezon iyi oyna, kapılar açılır" dedi.' }] },
    { id: 'sakat_ilac', origin: true, w: 40, if: { origin: 'sakat', week: [8, 30] }, kind: 'chat', who: 'Kulüp doktoru', nodes: {
      start: { who: 'Kulüp doktoru', t: 'Dizinde yine şişlik var. Kulüp doktoru: "Bir iğne yaparsam bu hafta oynarsın. Ama sık yaparsak uzun vadede kıkırdak gider. Kararı sen ver."', o: [
        { t: 'İğneyi yap, oynamam lazım.', fx: { saglik: -8, form: 1, flag: 'igne', seed: [{ id: 'sakat_kronik', in: [20, 60], p: 0.5 }] }, r: 'İğne ve buz. Maçta hiçbir şey hissetmedin.' },
        { t: 'Dinleneceğim, bir hafta kaçsın.', fx: { saglik: 5, 'r.hoca': -3, enerji: 15 }, r: 'Hoca biraz bozuldu ama dizin rahatladı.' }] } } },
    { id: 'sakat_kronik', chain: true, kind: 'card', who: 'Doktor',
      t: 'MR sonuçları geldi. Doktor ekrana bakıp susuyor: "Kıkırdakta ciddi aşınma var. İğneler... Uyarmıştım. Ya ameliyat olacaksın ya da oyun süreni azaltacaksın."',
      o: [
        { t: 'Ameliyat ol', fx: { do: 'injure:8', saglik: 10, mental: -6 }, r: 'Ameliyat başarılı geçti. Uzun bir yol seni bekliyor.' },
        { t: 'Oyun süremi azaltırım', fx: { saglik: 3, 'r.hoca': -4, do: 'role:rotasyon' }, r: 'Artık her maç 60 dakika. Belki bu da bir başlangıç.' }] }
  );
})(typeof window !== 'undefined' ? window : globalThis);
