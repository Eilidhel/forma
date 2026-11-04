/* FORMA — maç öncesi ve maç sonu olayları: rakip laf atar, tünel atışması, rakip hoca, taraftar, hakem…
   pre: true  → maç haftasında maçtan önce çıkabilir
   post: true → maçtan hemen sonra çıkabilir (lm = son maçın koşulları) */
(function (root) {
  const E = root.F.DATA.events;
  const add = (...evs) => evs.forEach((e) => E.push(e));

  /* ---------- Maç öncesi ---------- */
  add(
    { id: 'pre_rakip_dm', pre: true, rep: 8, kind: 'dm', who: '{rakipoyuncu}',
      t: '{sonrakirakip} formasıyla oynayan {rakipoyuncu} sana yazmış: "Pazar günü seni cebimden çıkarmayacağım. Topa bir kere dokunursan şanslısın."',
      o: [
        { t: '"Pazar görüşürüz. Skor tabelasına bak yeter."', tone: 'iddiali', fx: { moral: 3, form: 1, 'takipci%': 1 }, r: 'Ekran görüntüsü alıp kaydettin. Motivasyon.' },
        { t: 'Ekran görüntüsünü paylaş, takipçilerine göster', tone: 'sert', fx: { 'takipci%': 4, 'r.medya': -2, sohret: 1 }, r: 'Paylaşım yayıldı. Maç artık "kişisel" oldu.', },
        { t: 'Cevap verme, engelle', tone: 'sessiz', fx: { 's.sogukkanlilik': 1.5, mental: 1 }, r: 'Sessizlik en sert cevaptır.' }] },
    { id: 'pre_tunel_bakisma', pre: true, rep: 10, kind: 'card', who: '{rakipoyuncu}',
      t: 'Isınmaya çıkarken tünelde {rakipoyuncu} omzuyla sana çarptı ve kulağına eğildi: "Bugün ayağını kırarım."',
      o: [
        { t: 'Gülümse ve geç', tone: 'sessiz', fx: { 's.sogukkanlilik': 1.5, form: 1 }, r: 'Gülümsemen onu daha çok sinirlendirdi.' },
        { t: '"Önce yakalaman lazım."', tone: 'esprili', fx: { moral: 3, 's.karizma': 1 }, r: 'Takım arkadaşların güldü. Rakip kızardı.' },
        { t: 'Göğüs göğüse gel', tone: 'sert', fx: { 't.asabi': 1, 'r.takim': 2, disiplin: -2 }, chk: { s: 'sogukkanlilik', d: 45 }, ok: { r: 'Hakem görmeden ayrıldınız. Gerginlik maça taşınacak.' }, no: { r: 'Dördüncü hakem gördü, rapora yazıldın.', fx: { 'r.hoca': -4, do: 'suspend:1' } } }] },
    { id: 'pre_hoca_plan', pre: true, rep: 6, kind: 'chat', who: 'hoca', nodes: {
      start: { who: 'hoca', t: 'Hoca maçtan önce seni kenara çekti: "{sonrakirakip} sol beki çok ileri çıkıyor. Arkasına koşarsan gol gelir. Ama savunmaya da yardım edeceksin."', o: [
        { t: 'Anladım hocam, ikisini de yaparım.', tone: 'saygili', fx: { 'r.hoca': 4, enerji: -4 }, r: 'Hoca sırtını sıvazladı.' },
        { t: 'Ben hücumda kalayım, savunmayı başkası yapsın.', tone: 'sert', fx: { 'r.hoca': -6, form: 1 }, r: 'Hoca "sen bilirsin" dedi. Ama aklında tuttu.' },
        { t: 'Bir fikrim var hocam: içeri kat edip şut deneyeyim.', tone: 'iddiali', chk: { s: 'konusma', d: 40 }, ok: { r: 'Hoca düşündü: "Dene bakalım."', fx: { 'r.hoca': 5, 's.liderlik': 1 } }, no: { r: 'Hoca "taktiği ben veririm" dedi.', fx: { 'r.hoca': -3 } } }] } } },
    { id: 'pre_taraftar_otel', pre: true, rep: 12, kind: 'card', who: 'Rakip taraftarlar',
      t: 'Deplasman gecesi otelin önünde rakip taraftarlar sabaha kadar havai fişek patlattı, korna çaldı.',
      o: [
        { t: 'Kulaklık tak, uyumaya çalış', fx: { enerji: -6 }, r: 'Üç saat uyuyabildin.' },
        { t: 'Odadaki arkadaşınla sabaha kadar oyun oyna', fx: { enerji: -12, 'r.takim': 5, moral: 4 }, r: 'Uykusuz ama keyifli bir gece.' },
        { t: 'Balkona çıkıp el salla', tone: 'esprili', fx: { 'takipci%': 3, 'r.taraftar': 2, enerji: -8 }, r: 'Video viral oldu. Rakip taraftarlar bile güldü.' }] },
    { id: 'pre_eski_takim', pre: true, rep: 20, w: 60, if: { nextOppFormer: true }, kind: 'card', who: 'Spor Haber',
      t: 'Bu haftanın rakibi {sonrakirakip}. Gazeteler senin "intikam maçın" olduğunu yazıyor, eski takım arkadaşların da sana göndermeler yapıyor.',
      o: [
        { t: '"Benim için sıradan bir maç."', tone: 'kacamak', fx: { 'r.medya': 1, 's.sogukkanlilik': 1 }, r: 'Kimse inanmadı ama saygı duydular.' },
        { t: '"Onlara kaybettiklerini göstereceğim."', tone: 'iddiali', fx: { form: 1, 'takipci%': 2, 'r.taraftar': 3 }, r: 'Taraftarlar bu sözü pankarta yazdı.' }] }
  );

  /* ---------- Maç sonu: kazandıysan ---------- */
  add(
    { id: 'post_rakip_aglama', post: true, rep: 8, if: { lm: { res: 'win', played: true } }, kind: 'chat', who: '{rakipoyuncu}', nodes: {
      start: { who: '{rakipoyuncu}', t: 'Son düdükten sonra {rakiptakim} oyuncusu {rakipoyuncu} yanına geldi: "Şanslıydınız. Hakem de sizdendi zaten."', o: [
        { t: '"Skor {skor}. Şans da futbolun parçası."', tone: 'esprili', fx: { moral: 3, 's.karizma': 1 }, r: 'Arkasını dönüp gitti. Takım arkadaşların seni alkışladı.' },
        { t: 'Elini uzat: "İyi maçtı."', tone: 'saygili', fx: { 'r.medya': 2, 't.mutevazi': 1, 's.sogukkanlilik': 1 }, next: 'el' },
        { t: '"Ağlamaya soyunma odasında devam et."', tone: 'sert', fx: { 'takipci%': 2, 't.asabi': 0.5, 'r.medya': -1 }, r: 'Kameralar çekti. Akşam programlarında bu görüntü dönecek.', }] },
      el: { who: '{rakipoyuncu}', t: 'Bir an duraksadı, sonra elini sıktı: "Haklısın... İyiydin bugün. Forma değişelim mi?"', o: [
        { t: 'Formanı ver', tone: 'saygili', fx: { 'r.medya': 3, moral: 2 }, r: 'Forma değişimi fotoğrafı iki kulübün taraftarlarınca da beğenildi.' }] } } },
    { id: 'post_gol_sonrasi_tehdit', post: true, rep: 10, if: { lm: { minGoals: 1 } }, kind: 'dm', who: '{rakipoyuncu}',
      t: 'Golünden sonra {rakiptakim} savunmacısı {rakipoyuncu} DM atmış: "Rövanşta görüşeceğiz. Bacaklarına iyi bak."',
      o: [
        { t: 'Kulübe bildir', fx: { 'r.baskan': 2, mental: 1 }, r: 'Kulüp federasyona yazı gönderdi. Rakip oyuncu uyarı aldı.' },
        { t: 'Gol videosunu cevap olarak gönder', tone: 'iddiali', fx: { moral: 4, 'takipci%': 2 }, r: 'Mesaj okundu. Cevap gelmedi.' },
        { t: 'Görmezden gel', tone: 'sessiz', fx: { 's.sogukkanlilik': 1 }, r: 'Rövanş takvimine bir not düştün.' }] },
    { id: 'post_rakip_hoca_ovgu', post: true, rep: 12, if: { lm: { minRating: 7.6 } }, kind: 'card', who: 'Rakip teknik direktör',
      t: '{rakiptakim} teknik direktörü basın toplantısında seni övdü: "O çocuk bugün farkı yarattı. Böyle bir oyuncuyu kim istemez?"',
      o: [
        { t: 'Sosyal medyada teşekkür et', tone: 'saygili', fx: { 'r.medya': 3, sohret: 1 }, r: 'Kendi hocan biraz kıskandı ama belli etmedi.' },
        { t: 'Hiçbir şey söyleme, kulübüne sadık kal', tone: 'sessiz', fx: { 'r.baskan': 2, 'r.taraftar': 2, 't.sadik': 0.5 }, r: 'Taraftarlar sessizliğini sadakat olarak okudu.' },
        { t: 'Menajerine "duydun mu?" diye yaz', tone: 'iddiali', fx: { 'r.menajer': 3, seed: [{ id: 'transfer_kulisi', in: [2, 8], p: 0.4 }] }, r: 'Menajerin: "Duydum, telefonum açık."' }] },
    { id: 'post_soyunma_kutlama', post: true, rep: 6, if: { lm: { res: 'win' } }, kind: 'card', who: 'kaptan',
      t: 'Soyunma odasında müzik sonuna kadar açık. Kaptan {kaptan} masaya çıktı: "Bugünün kahramanı bir şarkı söylesin!" Herkes sana bakıyor.',
      o: [
        { t: 'Masaya çık, memleket türküsü söyle', tone: 'esprili', fx: { 'r.takim': 7, 's.sosyallik': 2, moral: 5 }, r: 'Takım halaya kalktı. Video kulübün hesabında paylaşıldı.' },
        { t: 'Kaptana devret: "Asıl kahraman sizsiniz."', tone: 'mutevazi', fx: { 'r.kaptan': 6, 'r.takim': 3 }, r: 'Kaptan seni kucakladı.' },
        { t: 'Kulaklığını tak, sessizce duşa git', tone: 'sessiz', fx: { 'r.takim': -3, mental: 2 }, r: 'Biri "havalı" dedi, biri "kendini beğenmiş".' }] },
    { id: 'post_rakip_taraftar_tebrik', post: true, rep: 15, if: { lm: { res: 'win', derby: false } }, kind: 'dm', who: 'Rakip taraftar',
      t: '{rakiptakim} taraftarı olduğunu söyleyen biri yazmış: "Takımımı yendin ama oyununa hayran kaldım. Oğlum seni çok seviyor, bir imzalı fotoğraf gönderebilir misin?"',
      o: [
        { t: 'İmzalı forma gönder', fx: { para: -1500, 'r.taraftar': 3, 's.karizma': 1, moral: 3 }, r: 'Çocuğun formayla fotoğrafı geldi. Rakip tribünde bir taraftarın var.' },
        { t: 'Teşekkür mesajı yaz', fx: { moral: 1 }, r: 'Kısa ve nazik.' }] },
    { id: 'post_derbi_zafer', post: true, rep: 10, if: { lm: { res: 'win', derby: true } }, kind: 'card', who: 'Taraftar grubu',
      t: 'Derbi bitti, kazandınız! Taraftarlar stadyumdan çıkmıyor, senin adını haykırıyorlar. Tribün lideri megafonu sana uzattı.',
      o: [
        { t: 'Megafonu al, tribünü coştur', tone: 'duygusal', fx: { 'r.taraftar': 10, sohret: 2, 'takipci%': 4, 'r.hoca': -1 }, r: 'Tezahürat şehrin her yerinden duyuldu.' },
        { t: 'Formanı tribüne at', fx: { 'r.taraftar': 6, moral: 4 }, r: 'Formanı yakalayan çocuk ağlıyordu.' },
        { t: 'Rakip tribüne dönüp sus işareti yap', tone: 'sert', fx: { 'r.taraftar': 8, 'r.medya': -4, seed: [{ id: 'federasyon_ceza', in: [1, 2], p: 0.5 }] }, r: 'Fotoğraf ertesi gün manşette. Federasyon da gördü.' }] }
  );

  /* ---------- Maç sonu: kaybettiysen ---------- */
  add(
    { id: 'post_rakip_dalga', post: true, rep: 8, if: { lm: { res: 'loss' } }, kind: 'dm', who: '{rakipoyuncu}',
      t: '{rakiptakim} oyuncusu {rakipoyuncu} hikâyesinde seni etiketlemiş: skor tabelası {skor} ve altında gülme emojileri.',
      o: [
        { t: '"Rövanş bizim sahamızda."', tone: 'iddiali', fx: { moral: 2, flag: 'rovans', 'takipci%': 1 }, r: 'Rövanşın tarihini telefonuna not ettin.' },
        { t: 'Esprili bir cevap ver', tone: 'esprili', chk: { s: 'karizma', d: 45 }, ok: { r: 'Cevabın onunkinden daha çok beğeni aldı.', fx: { 'takipci%': 3, moral: 3 } }, no: { r: 'Espri yerini bulmadı, alay daha da büyüdü.', fx: { moral: -4 } } },
        { t: 'Hiç takılma', tone: 'sessiz', fx: { 's.sogukkanlilik': 1.5 }, r: 'Yenilgiyi antrenmanda çıkaracaksın.' }] },
    { id: 'post_tunel_kavga', post: true, rep: 12, if: { lm: { res: ['loss', 'draw'], played: true } }, kind: 'chat', who: '{rakipoyuncu}', nodes: {
      start: { who: '{rakipoyuncu}', t: 'Soyunma odasına giderken tünelde {rakipoyuncu} arkandan seslendi: "Ne oldu yıldız? Bugün sahada yoktun!" Etrafta kameralar var.', o: [
        { t: 'Dön ve yürümeye devam et', tone: 'sessiz', fx: { 's.sogukkanlilik': 2, mental: 1 }, r: 'Kameralar arkanı dönüşünü çekti. Olgun bir an.' },
        { t: '"Maç 90 dakika, sezon 34 hafta."', tone: 'kacamak', fx: { 'r.medya': 2, 's.konusma': 1 }, r: 'Bu cümle spor sayfalarında alıntılandı.' },
        { t: 'Üstüne yürü', tone: 'sert', next: 'kavga' }] },
      kavga: { who: 'kaptan', t: 'Kaptan {kaptan} seni kolundan tuttu: "Değmez! Ceza alırsan takımı yakarsın!"', o: [
        { t: 'Kaptanı dinle, geri çekil', tone: 'saygili', fx: { 'r.kaptan': 5, 's.sogukkanlilik': 1 }, r: 'Kaptan omzuna vurdu. "Rövanşta konuşuruz."' },
        { t: 'Kolunu kurtar, ileri atıl', tone: 'sert', fx: { do: 'suspend:2', 'r.hoca': -8, 'r.medya': -6, 'takipci%': 3, 't.asabi': 1 }, r: 'Arbede çıktı. Federasyon 2 maç ceza verdi.' }] } } },
    { id: 'post_takim_toplanti', post: true, rep: 10, if: { lm: { res: 'loss' } }, kind: 'card', who: 'hoca',
      t: 'Yenilginin ardından hoca soyunma odasının kapısını kapattı: "Kimse duşa gitmiyor. Bugün neyin yanlış gittiğini birisi söylesin."',
      o: [
        { t: 'Ayağa kalk, kendi hatanı söyle', tone: 'mutevazi', fx: { 'r.hoca': 5, 'r.takim': 4, 's.liderlik': 2 }, r: 'Ardından üç kişi daha konuştu. Takım kenetlendi.' },
        { t: 'Savunmanın hatalarını say', tone: 'sert', fx: { 'r.takim': -6, 'r.hoca': 1 }, r: 'Stoperler sana kötü kötü baktı.' },
        { t: 'Sessiz kal', tone: 'sessiz', fx: {}, r: 'Hoca konuşmayı kendisi yaptı.' }] },
    { id: 'post_hakem', post: true, rep: 12, if: { lm: { res: ['loss', 'draw'] } }, kind: 'card', who: 'Hakem',
      t: 'Son dakikada verilmeyen penaltı yüzünden takım arkadaşların hakemin etrafını sardı. Sen de oradasın.',
      o: [
        { t: 'Arkadaşlarını uzaklaştır', tone: 'saygili', fx: { 's.liderlik': 2, 'r.hoca': 3 }, r: 'Hakem raporuna olumlu not düştü.' },
        { t: 'Sakin bir dille itiraz et', tone: 'kacamak', chk: { s: 'konusma', d: 45 }, ok: { r: 'Hakem "VAR inceledi" dedi ama saygıyla dinledi.' }, no: { r: 'Sarı kart gördün.', fx: { disiplin: -2 } } },
        { t: 'Sert tepki göster', tone: 'sert', fx: { do: 'suspend:1', 'r.taraftar': 3, 'takipci%': 2 }, r: 'Kırmızı kart. Bir maç cezalısın.' }] },
    { id: 'post_taraftar_otobus', post: true, rep: 15, if: { lm: { res: 'loss', played: true } }, kind: 'card', who: 'Kızgın taraftarlar',
      t: 'Takım otobüsü stadyumdan çıkarken öfkeli taraftarlar yolu kesti. "Biri insin konuşsun!" diye bağırıyorlar.',
      o: [
        { t: 'İn ve konuş', tone: 'duygusal', chk: { s: 'karizma', d: 50 }, ok: { r: 'Söz verdin. Taraftarlar yolu açtı ve alkışladı.', fx: { 'r.taraftar': 8, 's.liderlik': 2 } }, no: { r: 'Konuşma tartışmaya döndü. Polis araya girdi.', fx: { 'r.taraftar': -4, mental: -4 } } },
        { t: 'Otobüste kal', fx: { 'r.taraftar': -2 }, r: 'Bir saat sonra polis eşliğinde yola çıkabildiniz.' }] }
  );

  /* ---------- Maç sonu: genel ---------- */
  add(
    { id: 'post_forma_takas', post: true, rep: 12, if: { lm: { played: true } }, kind: 'card', who: '{rakipoyuncu}',
      t: 'Maç sonu {rakiptakim} formalı genç {rakipoyuncu} çekinerek yaklaştı: "Abi, formanı alabilir miyim? Seni izleyerek büyüdüm."',
      o: [
        { t: 'Formanı ver, sarıl', fx: { 's.karizma': 1, moral: 3, 'r.medya': 2 }, r: 'Genç oyuncu formanı göğsüne bastırdı.' },
        { t: 'Formanı ver ve birkaç tavsiye ekle', fx: { 's.liderlik': 1.5, moral: 3, mental: 1 }, r: 'Belki yıllar sonra bu anı anlatacak.' },
        { t: '"Formam başkasına söz verildi."', fx: {}, r: 'Çocuk başını önüne eğip gitti.' }] },
    { id: 'post_kirmizi_ozur', post: true, rep: 10, if: { lm: { red: true } }, kind: 'chat', who: 'hoca', nodes: {
      start: { who: 'hoca', t: 'Hoca soyunma odasında yanına oturdu: "Kırmızı kart takımı on kişi bıraktı. Ne düşünüyorsun?"', o: [
        { t: 'Takımdan özür dilerim.', tone: 'mutevazi', fx: { 'r.hoca': 6, 'r.takim': 5, disiplin: 3 }, r: 'Özrün soyunma odasında kabul edildi.' },
        { t: 'Hakem abarttı.', tone: 'sert', fx: { 'r.hoca': -5 }, r: 'Hoca kalktı ve gitti.' }] } } },
    { id: 'post_yedek_sinir', post: true, rep: 8, if: { lm: { status: ['yedek', 'kadrodisi'] } }, kind: 'chat', who: 'kanka', nodes: {
      start: { who: 'kanka', t: 'Kankan {kanka} maçtan sonra yazdı: "Kanka sen olsan bugün kazanırdık. Hoca ne yapıyor anlamadım. İstersen beraber konuşalım onunla?"', o: [
        { t: 'Beraber gidelim.', tone: 'saygili', fx: { 'r.kanka': 4 }, chk: { s: 'konusma', d: 40 }, ok: { r: 'Hoca ikinizi de dinledi: "Önümüzdeki hafta şansın var."', fx: { 'r.hoca': 4 } }, no: { r: 'Hoca "kadroyu ben kurarım" deyip kapıyı kapattı.', fx: { 'r.hoca': -4 } } },
        { t: 'Gerek yok, sahada göstereceğim.', tone: 'iddiali', fx: { 't.calis': 1, form: 1 }, r: 'Ertesi gün antrenmana herkesten önce geldin.' }] } } },
    { id: 'post_milli_hoca', post: true, rep: 20, if: { lm: { minRating: 7.8, nat: false }, nat: 'TR', caps: ['<', 1], ovr: ['>', 64] }, kind: 'card', who: 'Milli takım scoutu',
      t: 'Tribündeki milli takım scoutu maç sonrası seninle kısa bir görüşme istedi: "Hoca seni izlemem için gönderdi. Bugün iyiydin. Bu formu sürdür."',
      o: [
        { t: '"Hazırım, beni çağırın."', tone: 'iddiali', fx: { moral: 6, form: 1 }, r: 'Scout gülümsedi: "Görelim."' },
        { t: 'Teşekkür et, takımını öv', tone: 'mutevazi', fx: { moral: 4, 'r.medya': 2 }, r: 'Scout raporuna "takım oyuncusu" yazdı.' }] },
    { id: 'post_viral_an', post: true, rep: 15, if: { lm: { played: true } }, kind: 'card', who: 'Futbol Sayfası',
      t: 'Maçta yaptığın bir hareket yavaşlatılmış videoyla paylaşıldı ve 500 bin kez izlendi. Altına binlerce yorum yağıyor.',
      o: [
        { t: 'Videoyu kendi hesabında paylaş', tone: 'iddiali', fx: { 'takipci%': 5, sohret: 2 }, r: 'Takipçi sayın bir gecede fırladı.' },
        { t: 'Yorum yapma, maça odaklan', tone: 'sessiz', fx: { mental: 2, 's.sogukkanlilik': 1 }, r: 'Video yine de kendi kendine yayıldı.' }] }
  );

  /* ---------- Düzeltmeler ---------- */
  const byId = (id) => E.find((e) => e.id === id);
  // Maçta oynamadıysan seni işaret eden maç sonu olayları çıkmaz
  const benchOk = ['post_yedek_sinir', 'post_takim_toplanti'];
  E.filter((e) => e.post && !benchOk.includes(e.id)).forEach((e) => { e.if = e.if || {}; e.if.lm = Object.assign({ played: true }, e.if.lm); });
  // Kahramanlık gerektiren olaylar ancak iyi oynadıysan
  [['post_soyunma_kutlama', 7.2], ['post_rakip_taraftar_tebrik', 7.3], ['post_viral_an', 7.6], ['post_derbi_zafer', 6.8]].forEach(([id, r]) => { const e = byId(id); if (e) e.if.lm.minRating = r; });
  // Şöhret gerektiren olaylar: bilinmeyen oyuncuya reklam teklif edilmez
  [['reklam_filmi', 40], ['sponsor_bahis', 35], ['tv_program', 45], ['dergi_kapak', 55], ['unlu_tanisma', 60], ['hayran_hastane', 25], ['taraftar_grubu', 15],
    ['post_forma_takas', 38], ['gun_selfie', 14], ['gun_kahve', 22], ['trafik', 18], ['nadir_forma_degisimi', 40], ['post_rakip_taraftar_tebrik', 15]].forEach(([id, s]) => {
    const e = byId(id); if (!e) return; e.if = e.if || {}; e.if.stat = Object.assign({}, e.if.stat, { sohret: ['>', s] });
  });
  // "Seni izleyerek büyüdüm" diyen genç ancak sen gerçekten yıllardır oynuyorsan gelir
  const takas = byId('post_forma_takas');
  if (takas) takas.if.minAge = 26;
  // Doktor "dinlen" diyorsa gerçekten maç kaçırılır; "iğneyle oyna" diyorsan oynarsın
  const ilac = byId('sakat_ilac');
  if (ilac) ilac.nodes.start.o[1].fx = Object.assign({}, ilac.nodes.start.o[1].fx, { do: 'injure:1' });
  const orta = byId('sakatlik_orta');
  if (orta) orta.o[0].fx = Object.assign({}, orta.o[0].fx, { do: 'heal' });
})(typeof window !== 'undefined' ? window : globalThis);
