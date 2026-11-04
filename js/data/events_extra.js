/* FORMA — ek olaylar: hoca taktikleri (sadece oynayacaksan), yedek/kadro dışı konuşmalar,
   rakip karşılaşmaları, yeni basın soruları ve nadir çıkan absürt magazin olayları.
   Absürt olaylar gerçek haberlerden esinlenir ama kurgudur; gerçek kişi adı geçmez. */
(function (root) {
  const D = root.F.DATA;
  const E = D.events;
  const add = (...evs) => evs.forEach((e) => E.push(e));
  const T = (t, tone, fx, r) => ({ t, tone, fx, r });

  /* ---------- Hoca taktikleri: maç öncesi, sadece ilk 11'deysen ---------- */
  const tac = (id, pos, text, opts, extra) => Object.assign({ id, pre: true, rep: 9, w: 14, if: Object.assign({ squad: 'ilk11' }, pos ? { pos } : {}), kind: 'chat', who: 'hoca', nodes: { start: { who: 'hoca', t: text, o: opts } } }, extra || {});
  add(
    tac('tac_kanat_arkasi', ['FV'], 'Hoca taktik tahtasında {sonrakirakip} savunmasını gösteriyor: "Bekleri çok ileri çıkıyor. Sen arkalarına koş. Topu ayağına değil boşluğa isteyeceksin."', [
      { t: 'Derinlemesine koşarım hocam.', tone: 'saygili', fx: { do: 'tactic:hiz=7,bitiricilik=4', 'r.hoca': 3 }, r: 'Hoca: "İşte bu." Planı ezberledin.' },
      { t: 'Ben topu ayağıma isterim.', tone: 'iddiali', fx: { do: 'tactic:dribling=5', 'r.hoca': -4 }, r: 'Hoca kaşlarını çattı ama itiraz etmedi.' }]),
    tac('tac_pres_yuksek', ['FV', 'OS'], 'Hoca: "Bu hafta yüksek pres yapıyoruz. Stoperleri rahat bırakmayacaksın. Yorulursan söyle, değiştiririm."', [
      { t: 'Doksan dakika basarım.', tone: 'iddiali', fx: { do: 'tactic:dayaniklilik=7,savunma=4', enerji: -6, 'r.hoca': 4 }, r: 'Antrenmanda pres çalışmasında herkesten çok koştun.' },
      { t: 'Akıllı basarım, enerjimi saklarım.', tone: 'saygili', fx: { do: 'tactic:pozisyon=5', 'r.hoca': 2 }, r: 'Hoca: "Akıllı pres de prestir."' }]),
    tac('tac_duran_top', ['OS', 'FV', 'DF'], 'Hoca video analizinde durdurdu: "{sonrakirakip} duran toplarda arka direği boş bırakıyor. Kornerlerde orada olacaksın."', [
      { t: 'Arka direk benim.', tone: 'saygili', fx: { do: 'tactic:kafa=7,duranTop=4', 'r.hoca': 3 }, r: 'Antrenmanda yirmi korner çalıştınız.' },
      { t: 'Ben kornerleri kullanmak istiyorum.', tone: 'iddiali', fx: { do: 'tactic:duranTop=6', 'r.hoca': -1 }, chk: { s: 'konusma', d: 45 }, ok: { r: 'Hoca: "Peki, sağ taraf senin."' }, no: { r: 'Hoca: "Kornerleri kim atacak ben bilirim."', fx: { 'r.hoca': -3 } } }]),
    tac('tac_kontra', null, 'Hoca: "Deplasmanda topu onlara vereceğiz. Kapanacağız, kontraya çıkacağız. Sabır, sabır, sabır."', [
      { t: 'Sabırlı olurum.', tone: 'saygili', fx: { do: 'tactic:pozisyon=6,hiz=4', 'r.hoca': 3 }, r: 'Hoca planı herkese tek tek anlattı.' },
      { t: 'Bu takıma karşı neden kapanıyoruz?', tone: 'sert', fx: { 'r.hoca': -6, 'r.takim': 2 }, r: 'Hoca: "Çünkü ben öyle istiyorum." Soyunma odası sessizleşti.' }]),
    tac('tac_bek_bindir', ['DF'], 'Hoca: "Önündeki kanat oyuncusu geri dönmüyor. Fırsat bulduğun her an bindir, ortaları arka direğe."', [
      { t: 'Bindiririm, geri de dönerim.', tone: 'saygili', fx: { do: 'tactic:orta=7,dayaniklilik=4', 'r.hoca': 3, enerji: -4 }, r: 'Hoca omzuna vurdu: "Ciğerine güveniyorum."' },
      { t: 'Ben önce savunmamı yaparım.', tone: 'kacamak', fx: { do: 'tactic:savunma=5', 'r.hoca': -1 }, r: 'Hoca: "Tamam ama çekingen olma."' }]),
    tac('tac_stoper_hava', ['DF'], 'Hoca: "Santrforları iki metre. Bütün gün havadan oynayacaklar. Her topa sen çıkacaksın."', [
      { t: 'Havada hiçbir top kaybetmem.', tone: 'iddiali', fx: { do: 'tactic:kafa=8,fizik=3', 'r.hoca': 3 }, r: 'Antrenmanda kafa topu makinesiyle yarım saat çalıştın.' },
      { t: 'Önüne geçip topu almayı denerim.', tone: 'saygili', fx: { do: 'tactic:pozisyon=6', 'r.hoca': 2 }, r: 'Hoca: "Akıllıca."' }]),
    tac('tac_orta_saha_ritim', ['OS'], 'Hoca: "Oyunun ritmi sende. Topu çabuk dolaştıracaksın, iki dokunuştan fazla yok."', [
      { t: 'Tek iki pas, anladım.', tone: 'saygili', fx: { do: 'tactic:pas=6,vizyon=4', 'r.hoca': 3 }, r: 'Rondo antrenmanında top yere düşmedi.' },
      { t: 'Bazen sürmem lazım hocam.', tone: 'iddiali', fx: { do: 'tactic:dribling=5', 'r.hoca': -2 }, r: 'Hoca: "Sür ama kaybetme."' }]),
    tac('tac_kaleci_kisa', ['KL'], 'Hoca: "Uzun top yok. Her topu kısa çıkaracağız. Rakip pres yapsa bile."', [
      { t: 'Ayaklarıma güvenirim.', tone: 'iddiali', fx: { do: 'tactic:pas=7', 'r.hoca': 3 }, r: 'Antrenmanda pres altında pas çalıştın.' },
      { t: 'Riskli olursa uzun vururum.', tone: 'kacamak', fx: { do: 'tactic:pozisyon=4', 'r.hoca': -1 }, r: 'Hoca: "Bu risk değil, plan."' }]),
    tac('tac_penalti_analiz', ['KL'], 'Kaleci antrenörü bir tablet uzattı: "{sonrakirakip} penaltıcısı son on penaltının yedisini sağa attı. Ama bunu bildiğimizi biliyor olabilir."', [
      { t: 'İstatistiğe güvenirim.', tone: 'saygili', fx: { do: 'tactic:kalecilik=6,refleks=4' }, r: 'Videoları gece yarısına kadar izledin.' },
      { t: 'Son ana kadar beklerim.', tone: 'sessiz', fx: { do: 'tactic:refleks=6', 's.sogukkanlilik': 1 }, r: 'Kaleci antrenörü gülümsedi.' }]),
    tac('tac_rakip_yildiz', ['DF', 'OS'], 'Hoca: "Rakibin on numarası bütün oyunu kuruyor. Bugün onun gölgesi olacaksın. Topa dokunmasın."', [
      { t: 'Nefes aldırmam.', tone: 'iddiali', fx: { do: 'tactic:savunma=7,dayaniklilik=3', 'r.hoca': 3 }, r: 'Rakibin bütün maçlarını izledin.' },
      { t: 'Adam adama değil, alan savunması yapalım.', tone: 'sert', fx: { 'r.hoca': -4 }, chk: { s: 'konusma', d: 48 }, ok: { r: 'Hoca düşündü: "Haklı olabilirsin."', fx: { 'r.hoca': 6, do: 'tactic:pozisyon=6' } }, no: { r: 'Hoca: "Taktik dersini bana sen mi vereceksin?"' } }]),
    tac('tac_sakin_ol', null, 'Hoca seni kenara çekti: "Son iki maçta çok sinirliydin. Bugün tek bir kart görürsen bir dahaki maçta kulübedesin."', [
      { t: 'Sakin kalacağım.', tone: 'saygili', fx: { do: 'tactic:sogukkanlilik=8', disiplin: 2 }, r: 'Bilekliğine "sakin" yazdın.' },
      { t: 'Ben oyunumu oynarım.', tone: 'sert', fx: { 'r.hoca': -5, 't.asabi': 0.5 }, r: 'Hoca bir şey demedi. Ama not aldı.' }], { if: { squad: 'ilk11', formBelow: 1 } })
  );

  /* ---------- Yedek ve kadro dışı: oynamayacaksan hoca başka şey konuşur ---------- */
  add(
    { id: 'yedek_hazir_ol', pre: true, rep: 10, w: 12, if: { squad: 'yedek' }, kind: 'chat', who: 'hoca', nodes: {
      start: { who: 'hoca', t: 'Hoca kadroyu açıkladı, adın yedekler arasında: "Bugün kulübedesin. Ama 60\'tan sonra seni sokabilirim. Isınırken kafan maçta olsun."', o: [
        { t: 'Hazır olacağım hocam.', tone: 'saygili', fx: { 'r.hoca': 3, moral: -2 }, r: 'Isınma yeleğini giydin.' },
        { t: 'Neden yedekteyim hocam?', tone: 'sert', fx: { 'r.hoca': -3 }, chk: { s: 'konusma', d: 45 }, ok: { r: 'Hoca: "Rotasyon. Sıran gelecek, söz."', fx: { moral: 2 } }, no: { r: 'Hoca: "Çünkü ben öyle seçtim."', fx: { moral: -4 } } }] } } },
    { id: 'yedek_kanka_teselli', pre: true, rep: 14, w: 8, if: { squad: 'yedek' }, kind: 'dm', who: 'kanka',
      t: '{kanka} yazdı: "Kadroyu gördüm. Kafana takma kanka, kulübede bile en yakışıklı sensin."',
      o: [{ t: '"Sağ ol kanka, ilk fırsatta göstereceğim."', tone: 'duygusal', fx: { moral: 3, 'r.kanka': 3 }, r: 'Bir gülen surat gönderdi.' },
        { t: '"Sinirliyim, sonra konuşalım."', tone: 'sessiz', fx: { 'r.kanka': -1 }, r: 'Telefonu kapattın.' }] },
    { id: 'kadrodisi_tribun', pre: true, rep: 12, w: 12, if: { squad: 'kadrodisi' }, kind: 'card', who: 'Kulüp',
      t: 'Bu hafta kadroda yoksun. Maçı tribünden izleyeceksin. Kameralar seni arayacak.',
      o: [{ t: 'Tribünde takımı destekle', tone: 'mutevazi', fx: { 'r.taraftar': 3, 'r.takim': 2, moral: -2 }, r: 'Gol olunca herkesten önce ayağa kalktın. Kameralar bunu yakaladı.' },
        { t: 'Ekstra antrenmana kal', tone: 'saygili', fx: { 'a.fizik': 0.6, 'r.hoca': 3, enerji: -6 }, r: 'Boş tesiste tek başına koştun.' },
        { t: 'Maçı evden izle', tone: 'sessiz', fx: { moral: -4, enerji: 6 }, r: 'Televizyonun karşısında yalnızdın.' }] }
  );

  /* ---------- Rakiple karşılaşmalar: maç öncesi ---------- */
  add(
    { id: 'pre_rakip_eski_kanka', pre: true, rep: 18, w: 8, if: { squad: ['ilk11', 'yedek'] }, kind: 'dm', who: '{rakipoyuncu}',
      t: 'Altyapıdan eski takım arkadaşın {rakipoyuncu} artık {sonrakirakip}\'da: "Kanka maçtan sonra formaları değişelim mi? Annem senin formanı istiyor."',
      o: [T('"Tabii kanka, annene selam."', 'duygusal', { 'r.medya': 1, moral: 3 }, 'Eski günleri yazıştınız.'),
        T('"Önce maçı kazanalım, sonra bakarız."', 'iddiali', { form: 1 }, '"Hayal kur" diye cevap verdi.')] },
    { id: 'pre_rakip_hoca_ovgu', pre: true, rep: 20, w: 6, if: { squad: 'ilk11', stat: { sohret: ['>', 20] } }, kind: 'card', who: 'Spor Haber',
      t: '{sonrakirakip} hocası basın toplantısında senden bahsetti: "Onu durdurursak maçı kazanırız. Özel bir plan yaptık."',
      o: [T('"Bu beni gururlandırır."', 'mutevazi', { moral: 4, 'r.medya': 2 }, 'Sözlerin manşet oldu.'),
        T('"Planları işe yaramayacak."', 'iddiali', { 'takipci%': 2, sohret: 1, form: 1 }, 'Rakip taraftarlar sözlerini panoya astı.')] },
    { id: 'pre_rakip_tiktok', pre: true, rep: 20, w: 7, if: { squad: ['ilk11', 'yedek'] }, kind: 'dm', who: '{rakipoyuncu}',
      t: '{sonrakirakip} oyuncusu {rakipoyuncu} senin geçen haftaki kaçırdığın pozisyonu müzikli bir videoyla paylaşmış: "Pazar bunu tekrar izleyeceğiz."',
      o: [T('Videoyu kendin de paylaş, altına "Pazar görüşürüz" yaz', 'esprili', { 'takipci%': 3, moral: 2 }, 'Takipçilerin espri anlayışını sevdi.'),
        T('Cevap verme, sahada konuş', 'sessiz', { 's.sogukkanlilik': 1, form: 1 }, 'Videoyu kaydettin. Motivasyon.'),
        T('Sert bir cevap yaz', 'sert', { 'r.medya': -2, 'takipci%': 2, 't.asabi': 0.5 }, 'Spor sayfaları kavganızı haber yaptı.')] },
    { id: 'pre_hakem_atamasi', pre: true, rep: 24, w: 5, if: { squad: ['ilk11', 'yedek'] }, kind: 'card', who: 'Spor Haber',
      t: 'Maçın hakemi açıklandı. Geçen sezon sana iki kırmızı kart gösteren hakem. Sosyal medya "Kart garantisi" diye dalga geçiyor.',
      o: [T('"Hakeme saygım sonsuz."', 'saygili', { 'r.medya': 2, disiplin: 2, do: 'tactic:sogukkanlilik=5' }, 'Hakem kulübü açıklamanı paylaştı.'),
        T('"Bu sefer adil olur umarım."', 'sert', { 'r.medya': -1, 'r.taraftar': 2 }, 'Federasyon sözlerini not etti.')] }
  );

  /* ---------- Rakiple karşılaşmalar: maç sonu ---------- */
  add(
    { id: 'post_rakip_ozur', post: true, rep: 18, w: 7, if: { lm: { played: true } }, kind: 'dm', who: '{rakipoyuncu}',
      t: 'Maçta seni sert düşüren {rakipoyuncu} yazdı: "Kardeşim o müdahale için özür dilerim. Kasıtlı değildi. Geçmiş olsun."',
      o: [T('"Sorun yok, futbol bu."', 'mutevazi', { 'r.medya': 1, moral: 2 }, 'Ekran görüntüsü "centilmenlik" başlığıyla yayıldı.'),
        T('"Kasıtlıydı, biliyoruz."', 'sert', { 'takipci%': 1, 't.asabi': 0.5 }, 'İkinci maç şimdiden gergin.')] },
    { id: 'post_rakip_kaptan_tebrik', post: true, rep: 20, w: 6, if: { lm: { played: true, minRating: 7.5 } }, kind: 'card', who: '{rakipoyuncu}',
      t: 'Rakip takımın kaptanı {rakipoyuncu} son düdükten sonra yanına geldi, elini sıktı: "Bugün sen fark yarattın. Böyle devam."',
      o: [T('Teşekkür et, sarıl', 'duygusal', { moral: 4, 's.karizma': 0.5 }, 'Fotoğrafçılar anı yakaladı.'),
        T('Formanı hediye et', 'mutevazi', { 'r.medya': 2, sohret: 0.5 }, 'Kaptan formanı kendi kulübünün müzesine koyacağını söyledi.')] },
    { id: 'post_rakip_simulasyon', post: true, rep: 18, w: 7, if: { lm: { played: true, res: ['loss', 'draw'] } }, kind: 'card', who: 'Spor Haber',
      t: 'Maçtaki penaltı pozisyonunda {rakipoyuncu}\'nun kendini attığı yavaş çekimde görüldü. Taraftarın senden açıklama bekliyor.',
      o: [T('"Futbolda bu olmamalı."', 'sert', { 'r.taraftar': 4, 'r.medya': 1 }, 'Açıklaman çok paylaşıldı.'),
        T('"Hakemin kararı, saygı duyuyoruz."', 'saygili', { 'r.medya': 2, 'r.taraftar': -2 }, 'Taraftar biraz kırıldı.'),
        T('Simülasyonu taklit eden bir video çek', 'esprili', { 'takipci%': 4, 'r.medya': -2 }, 'Video ilk gün iki milyon izlendi.')] },
    { id: 'post_rakip_taraftar_dm', post: true, rep: 16, w: 7, if: { lm: { played: true, res: 'win' } }, kind: 'dm', who: 'Rakip taraftar',
      t: '{rakiptakim} taraftarı olduğunu söyleyen biri DM\'den küfürler yağdırıyor. Mesajlar giderek ağırlaşıyor.',
      o: [T('Engelle ve geç', 'sessiz', { mental: 1 }, 'Telefonunu bir saat elinden bıraktın.'),
        T('Kulübe ve emniyete bildir', 'saygili', { 'r.medya': 2 }, 'Kulüp hukuk birimi süreci başlattı.'),
        T('Ekran görüntüsünü paylaş', 'sert', { 'takipci%': 2, 'r.medya': 1, mental: -2 }, 'Destek mesajları yağdı ama gece uyuyamadın.')] },
    { id: 'post_eski_takim_alkis', post: true, rep: 30, w: 30, if: { lm: { played: true } }, kind: 'card', who: 'Tribün',
      t: 'Eski takımına karşı oynadın. Maç sonunda eski taraftarların bir kısmı seni alkışladı, bir kısmı ıslıkladı.',
      o: [T('Alkışlayan tribüne el salla', 'duygusal', { moral: 4, 'r.taraftar': -1 }, 'Gözlerin doldu.'),
        T('Tüneli hızlıca geç', 'sessiz', { mental: 1 }, 'Duygularını içinde tuttun.')] },
    { id: 'post_hakem_ozel', post: true, rep: 30, w: 4, if: { lm: { played: true, red: true } }, kind: 'card', who: 'Hakem',
      t: 'Hakem soyunma odası koridorunda yanına geldi: "Kartı göstermek zorundaydım. Ama sen iyi bir oyuncusun, kafana takma."',
      o: [T('"Anlıyorum hocam."', 'saygili', { disiplin: 3, 'r.medya': 1 }, 'Hakem raporuna "özür diledi" notu düştü.'),
        T('Cevap vermeden geç', 'sessiz', { mental: -1 }, 'Hakem omuz silkti.')] }
  );

  /* ---------- Nadir absürt magazin olayları (gerçek haberlerden esinlenme, kurgu) ---------- */
  const rare = (e) => Object.assign({ rep: 400, w: 1.5 }, e);
  add(
    rare({ id: 'abs_dublor_teorisi', if: { stat: { sohret: ['>', 35] } }, kind: 'card', who: 'Viral Sayfa',
      t: 'Sosyal medyada bir komplo teorisi yayılıyor: "Sahadaki {ad} gerçek {ad} değil, dublörü!" Kanıt olarak kulağının şekli gösteriliyor.',
      o: [T('Kulağını gösteren bir video çek', 'esprili', { 'takipci%': 5, sohret: 1 }, 'Video teoriyi bitirmedi, büyüttü. Ama herkes güldü.'),
        T('"Ben benim." diye kısa bir açıklama yap', 'kacamak', { 'r.medya': 1 }, 'Kimse inanmadı. Teori ikinci haftasında.'),
        T('Hiç cevap verme', 'sessiz', { mental: -1 }, 'Annen bile kulağına baktı.')] }),
    rare({ id: 'abs_ani_degisim', if: { stat: { sohret: ['>', 25] } }, kind: 'card', who: 'Spor Haber',
      t: 'Tatil dönüşü yaptığın sert diyet ve kas çalışması fotoğraflarına "Bu ne değişim?" başlığı atıldı. Bazı doktorlar televizyonda "fazla hızlı" diyor.',
      o: [T('Antrenman programını paylaş', 'iddiali', { 'takipci%': 4, 'a.fizik': 0.8, saglik: -2 }, 'Programın gençler arasında moda oldu.'),
        T('Kulüp doktoruna kontrol yaptır', 'saygili', { saglik: 3, 'r.hoca': 2 }, 'Doktor: "Biraz yavaşla ama sorun yok."')] }),
    rare({ id: 'abs_eski_sevgili_bilet', if: { stat: { sohret: ['>', 30] } }, kind: 'dm', who: 'Magazin Sayfası',
      t: 'Magazin sayfaları "{ad} eski sevgililerine maç bileti vermeyi reddetti" diye haber yaptı. Üç farklı kişi seninle eskiden görüştüğünü iddia ediyor.',
      o: [T('"İkisini hiç tanımıyorum."', 'sert', { 'takipci%': 3, 'r.medya': -2 }, 'Biri ekran görüntüsü paylaştı. Olay büyüdü.'),
        T('Gülerek geç, bilet sayısını açıkla', 'esprili', { 'takipci%': 2, 'r.medya': 1 }, '"Biletler aileme" dedin. Sayfa sustu.'),
        T('Partnerine açıklama yap', 'duygusal', { 'r.partner': 2, moral: -2 }, 'Partnerin güldü: "Ben biliyorum zaten."')] }),
    rare({ id: 'abs_realite_yildizi', if: { stat: { sohret: ['>', 35] }, partner: 'none' }, kind: 'dm', who: 'Realite şov yıldızı',
      t: 'Bir aşk adası programının yıldızı canlı yayında senin adını verdi: "En beğendiğim futbolcu o. Bana yazsın." Telefonun durmuyor.',
      o: [T('Ona yaz', 'esprili', { 'takipci%': 6, sohret: 2, 'r.hoca': -2 }, 'Ertesi gün bütün magazin sayfalarındaydınız.'),
        T('Görmezden gel', 'sessiz', { 'r.hoca': 1 }, 'Kanka "kardeşim delisin" dedi.')] }),
    rare({ id: 'abs_babaanne_surpriz', kind: 'card', who: 'Kulüp',
      t: 'Isınmadan önce kulüp seni saha kenarına çağırdı: köyden habersiz otobüsle gelen babaannen tribünde! Elinde kendi eliyle yazdığı bir pankart var.',
      o: [T('Koşup sarıl', 'duygusal', { moral: 8, 'r.aile': 6, 'takipci%': 3 }, 'Kameralar anı yakaladı. Ülke ağladı.'),
        T('El salla, maçtan sonra görüşürüz', 'mutevazi', { moral: 4, 'r.aile': 2 }, 'Babaannen pankartı hiç indirmedi.')] }),
    rare({ id: 'abs_playstation_sakatlik', kind: 'card', who: 'Kulüp doktoru',
      t: 'Gece boyu konsol başında futbol oyunu oynadın. Sabah bileğinde ağrı: doktor "oyun kolu tendiniti" dedi. Gazeteler bunu duydu.',
      o: [T('Dürüstçe anlat', 'esprili', { 'takipci%': 3, 'r.hoca': -3, do: 'injure:1' }, 'Hoca güldü ama cezayı da kesti.'),
        T('"Antrenmanda zorlandım" de', 'kacamak', { 'r.hoca': -1, do: 'injure:1' }, 'Kulüp doktoru bir şey demedi. Bakışı yeterliydi.')] }),
    rare({ id: 'abs_tiras_kesigi', kind: 'card', who: 'Soyunma odası',
      t: 'Maç öncesi bacak tıraşı yaparken jileti fazla bastırdın. Doktor üç dikiş attı, takım arkadaşların ağlayarak gülüyor.',
      o: [T('Sen de gül', 'esprili', { 'r.takim': 5, moral: 2, saglik: -2 }, 'Bir hafta lakabın "Jilet" oldu.'),
        T('Kimseye söylemeyin', 'kacamak', { 'r.takim': 2, saglik: -2 }, 'Akşama bütün kulüp biliyordu.')] }),
    rare({ id: 'abs_kopek_krampon', if: { flag: 'kopek' }, kind: 'card', who: 'Ev',
      t: 'Köpeğin maç kramponlarını yedi. Sağ teki tamamen parçalanmış. Maça dört saat var.',
      o: [T('Yedek kramponla oyna', 'saygili', { form: -1 }, 'Ayakkabı biraz sıktı ama idare etti.'),
        T('Kanıt fotoğrafı paylaş', 'esprili', { 'takipci%': 4, moral: 3 }, 'Köpeğin senden ünlü oldu.')] }),
    rare({ id: 'abs_sac_faciasi', if: { stat: { sohret: ['>', 15] } }, kind: 'card', who: 'Kuaför',
      t: 'Yeni kuaförün "çok trend" dediği saç modelini yaptı. Aynaya baktığında bir ananas gördün.',
      o: [T('Gururla taşı', 'iddiali', { 'takipci%': 3, 's.karizma': 1 }, 'Bir hafta sonra yarım ülke aynı modeli yaptırdı.'),
        T('Kafayı kazıt', 'kacamak', { moral: -2 }, 'Takım arkadaşların seni tanımadı.'),
        T('Bere ile maça çık', 'esprili', { 'r.hoca': -2, 'takipci%': 2 }, 'Hakem bereyi çıkarttı. Kameralar zoomladı.')] }),
    rare({ id: 'abs_yanlis_otobus', kind: 'card', who: 'Takım otobüsü',
      t: 'Deplasman sabahı kulaklıkla uyuyakaldın ve yanlış otobüse bindin. Uyandığında amatör bir veteranlar takımının otobüsündesin.',
      o: [T('Taksiyle yetiş', 'saygili', { para: '-w0.3', 'r.hoca': -3 }, 'Isınmaya son dakika yetiştin.'),
        T('Veteranlarla fotoğraf çek, sonra yetiş', 'esprili', { 'takipci%': 4, 'r.hoca': -5, para: '-w0.3' }, 'Fotoğraf viral oldu. Hoca güldü mü kızdı mı anlamadın.')] }),
    rare({ id: 'abs_deepfake_reklam', if: { stat: { sohret: ['>', 30] } }, kind: 'card', who: '{menajer}',
      t: 'Menajerin aradı: "Yapay zekâyla yüzünü kullanıp bir bahis sitesinin reklamını yapmışlar! Sen hiç böyle bir şey çekmedin değil mi?"',
      o: [T('Avukatlara ver', 'sert', { para: '-w1', 'r.medya': 3 }, 'Reklam iki günde kaldırıldı.'),
        T('Hemen açıklama yap', 'saygili', { 'r.medya': 2, 'r.taraftar': 2 }, 'Taraftarlar uyarıyı binlerce kez paylaştı.')] }),
    rare({ id: 'abs_maskot_kavgasi', kind: 'card', who: 'Tribün',
      t: 'Isınma sırasında iki takımın maskotları birbirine girdi. Senin takımının kartal maskotu yerde. Kameralar sana dönmüş.',
      o: [T('Maskotu ayağa kaldır', 'mutevazi', { 'r.taraftar': 4, 'takipci%': 2 }, 'Tribün adını bağırdı.'),
        T('Hakem gibi kart göster', 'esprili', { 'takipci%': 4, 'r.medya': 2 }, 'Kart gösterme anın haftanın en çok izlenen videosu.')] }),
    rare({ id: 'abs_dovme_hata', if: { stat: { sohret: ['>', 25] } }, kind: 'dm', who: 'Bir hayran',
      t: 'Bir hayranın adını koluna dövme yaptırmış. Tek sorun: soyadın yanlış yazılmış.',
      o: [T('İmzalı forma gönder, düzeltmesi için para ver', 'duygusal', { para: '-w0.2', 'r.taraftar': 4 }, 'Hayran "bu yanlış dövme hayatımın en güzel hatası" yazdı.'),
        T('Paylaş ve gül', 'esprili', { 'takipci%': 3 }, 'Dövmeci bile yorum yaptı.')] }),
    rare({ id: 'abs_ugurlu_corap', kind: 'card', who: 'Soyunma odası',
      t: 'Üç maçtır yıkamadığın "uğurlu" çoraplarını malzemeci yıkamış. Çok kötü bir his var içinde.',
      o: [T('Batıl inanç yok, oyna', 'iddiali', { 's.sogukkanlilik': 1 }, 'Hiçbir şey olmadı. Belki de olmuştur.'),
        T('Malzemeciyle tartış', 'sert', { 'r.takim': -2, moral: -2 }, 'Malzemeci bir hafta seninle konuşmadı.'),
        T('Yeni bir uğur bul', 'esprili', { moral: 3 }, 'Artık sol kramponuna önce bakıyorsun.')] }),
    rare({ id: 'abs_kripto_coin', if: { stat: { sohret: ['>', 40] } }, kind: 'card', who: '{menajer}',
      t: 'Birileri senin adınla bir kripto para çıkarmış, fiyatı bir günde on kat artmış. Menajerin: "Bizimle ilgisi yok ama taraftarlar para kaybediyor."',
      o: [T('Dolandırıcılık uyarısı yap', 'saygili', { 'r.taraftar': 4, 'r.medya': 3 }, 'Coin bir gecede çöktü. Taraftarlar teşekkür etti.'),
        T('Sessiz kal', 'sessiz', { 'r.taraftar': -4 }, 'Para kaybedenler seni suçladı.')] }),
    rare({ id: 'abs_astrolog', if: { stat: { sohret: ['>', 20] } }, kind: 'card', who: 'Sabah programı',
      t: 'Ünlü bir astrolog televizyonda "{ad} bu ay sakatlanacak, yıldızları uygun değil" dedi. Annen üç kez aradı.',
      o: [T('Güldüğün bir video at', 'esprili', { 'takipci%': 2, moral: 2 }, 'Astrolog "gülen son güler" dedi.'),
        T('Annene nazar boncuğu sözü ver', 'duygusal', { 'r.anne': 4 }, 'Kramponuna boncuk diktin.')] }),
    rare({ id: 'abs_sevinc_sakatligi', if: { stat: { sohret: ['>', 10] } }, kind: 'card', who: 'Kulüp doktoru',
      t: 'Geçen haftaki golünden sonra reklam panosunun üstüne atlayıp sevindin. Doktor: "Ayak bileğin burkulmuş. Sevinçten sakatlanan ilk kişi değilsin."',
      o: [T('Bir hafta dinlen', 'saygili', { do: 'injure:1', 'r.hoca': -1 }, 'Takım arkadaşların sana yeni sevinç önerileri yolluyor.'),
        T('Ağrı kesiciyle oyna', 'iddiali', { saglik: -5 }, 'Bileğin bandajla sarılı ama sahadasın.')] }),
    rare({ id: 'abs_menajer_ifsa', if: { agent: true }, kind: 'card', who: 'Spor Haber',
      t: 'Menajerin yanlışlıkla senin sözleşme taleplerini herkese açık hesabından paylaştı ve iki dakika sonra sildi. Ekran görüntüleri her yerde.',
      o: [T('Menajeri ara, fırça at', 'sert', { 'r.menajer': -8, 'r.baskan': -2 }, 'Menajer "telefon cebimdeydi" dedi.'),
        T('"Sahte" diye açıklama yap', 'kacamak', { 'r.medya': -2 }, 'Kimse inanmadı ama konu kapandı.'),
        T('Gülerek "Evet, bunlar benim taleplerim" de', 'iddiali', { 'takipci%': 3, 'r.baskan': -4 }, 'Başkan telefonunu açmadı.')] }),
    rare({ id: 'abs_hakem_sorusturma', kind: 'card', who: 'Spor Haber',
      t: 'Federasyon hakem kuruluna soruşturma açtı. Geçen sezon oynadığın bir maçın hakemi de gözaltında. Gazeteciler kapında.',
      o: [T('"Futbolumuz temizlensin."', 'sert', { 'r.medya': 2, 'r.taraftar': 2 }, 'Açıklaman çok konuşuldu.'),
        T('Yorum yapma', 'sessiz', {}, 'Konu bir hafta gündemde kaldı.')] }),
    rare({ id: 'abs_taraftar_saldiri', if: { stat: { sohret: ['>', 20] } }, kind: 'card', who: 'Kulüp',
      t: 'Tesis çıkışında öfkeli bir taraftar takım arkadaşın {takimarkadasi}\'ye yumruk attı. Araya sen girdin, olay kameralara yansıdı.',
      o: [T('Arkadaşını hastaneye götür', 'duygusal', { 'r.takim': 6, 'r.medya': 2 }, 'Takım arkadaşın taburcu olurken sana sarıldı.'),
        T('Kulübe güvenlik iste', 'saygili', { 'r.baskan': 3, 'r.takim': 3 }, 'Kulüp güvenlik önlemlerini artırdı.')] })
  );

  /* ---------- Yeni basın soruları ---------- */
  D.press.push(
    { id: 'pr_mevki', ctx: ['any'], q: 'Hocanız sizi {mevki} olarak oynatıyor. En verimli olduğunuz yer burası mı?', o: [
      T('Evet, bu benim mevkim.', 'iddiali', { moral: 2 }, 'Kendinden emin bir cevap.'),
      T('Takımın neresinde ihtiyaç varsa oynarım.', 'mutevazi', { 'r.hoca': 3, 'r.takim': 2 }, 'Hoca bu cevabı sevdi.'),
      T('Aslında başka bir yerde oynamak isterdim.', 'sert', { 'r.hoca': -5, 'takipci%': 1 }, 'Spor programları "mevki krizi" başlığını attı.')] },
    { id: 'pr_rakip_soz', ctx: ['any'], q: 'Rakip oyuncu {rakipoyuncu} sizin için "abartılıyor" demiş. Ne cevap verirsiniz?', o: [
      T('Herkesin fikri kendine.', 'kacamak', { 'r.medya': 1 }, 'Gazeteciler daha sert bir cevap bekliyordu.'),
      T('Sahada görüşürüz.', 'iddiali', { 'takipci%': 2, form: 1 }, 'Maçın afişi hazır.'),
      T('Onun beni konuşması bile yeterli.', 'esprili', { 'takipci%': 3, sohret: 1 }, 'Cümle bir gecede capse dönüştü.')] },
    { id: 'pr_hakem', ctx: ['loss', 'draw'], q: 'Bugünkü hakem yönetimini nasıl buldunuz?', o: [
      T('Yorum yapmayacağım.', 'sessiz', {}, 'Klasik ama güvenli.'),
      T('Hakem hata yapabilir, biz de yaptık.', 'mutevazi', { 'r.medya': 2 }, 'Olgun bir açıklama.'),
      T('Bugün sahada on iki kişiye karşı oynadık.', 'sert', { 'r.taraftar': 4, seed: [{ id: 'federasyon_ceza', in: [1, 2], p: 0.4 }] }, 'Federasyon açıklamanı inceliyor.')] },
    { id: 'pr_sosyal', ctx: ['any'], if: { followers: ['>', 20000] }, q: 'Sosyal medyada çok aktifsiniz. Bu futbolunuzu etkiliyor mu?', o: [
      T('Hayır, ikisini ayırıyorum.', 'kacamak', { 'r.medya': 1 }, 'Gazeteci not aldı.'),
      T('Haklısınız, biraz azaltacağım.', 'mutevazi', { 'r.hoca': 2, 'takipci%': -1 }, 'Hoca bu sözü duyunca memnun oldu.'),
      T('Takipçilerim benim ailem.', 'duygusal', { 'takipci%': 2 }, 'Takipçilerin bu cümleyi paylaştı.')] },
    { id: 'pr_transfer', ctx: ['any'], if: { stat: { sohret: ['>', 25] } }, q: 'Büyük bir kulübün sizi izlediği söyleniyor. Kapıyı açık mı bırakıyorsunuz?', o: [
      T('Burada mutluyum.', 'saygili', { 'r.taraftar': 3, 'r.baskan': 2 }, 'Taraftarlar sözlerini pankarta yazdı.'),
      T('Futbolda her şey olabilir.', 'kacamak', { 'r.taraftar': -2, 'r.menajer': 3 }, 'Menajerin telefonu çalmaya başladı.'),
      T('Benim hayalim Avrupa.', 'iddiali', { 'r.taraftar': -4, 'takipci%': 2 }, 'Taraftar grubu ıslıklı bir video paylaştı.')] },
    { id: 'pr_genc', ctx: ['any'], if: { maxAge: 21 }, q: 'Bu yaşta bu kadar ilgi baş döndürüyor mu?', o: [
      T('Ayaklarım yere basıyor.', 'mutevazi', { mental: 2, 'r.medya': 2 }, 'Olgunluğun manşet oldu.'),
      T('Daha hiçbir şey görmediniz.', 'iddiali', { 'takipci%': 2, sohret: 1 }, 'Cesur bir cümle. Herkes seni izleyecek.')] },
    { id: 'pr_veteran', ctx: ['any'], if: { minAge: 31 }, q: 'Kariyerinizin sonuna yaklaştığınızı düşünüyor musunuz?', o: [
      T('Bedenim izin verdikçe oynarım.', 'iddiali', { moral: 2 }, 'Taraftar alkışladı.'),
      T('Her maçı son maçım gibi oynuyorum.', 'duygusal', { 'r.taraftar': 3 }, 'Cümlen duygusal bir video oldu.'),
      T('Antrenörlük düşünüyorum.', 'saygili', { 'r.hoca': 3 }, 'Hoca "benim yardımcım olur" diye takıldı.')] },
    { id: 'pr_yedek', ctx: ['bench'], q: 'Bugün yine yedektiniz. Hocayla aranız nasıl?', o: [
      T('Hocama güveniyorum, sıramı bekliyorum.', 'saygili', { 'r.hoca': 4 }, 'Hoca sözlerini takdir etti.'),
      T('Bunu hocaya sormalısınız.', 'sert', { 'r.hoca': -4, 'takipci%': 1 }, '"Kriz" manşetleri hazırlanıyor.'),
      T('Antrenmanda daha çok çalışacağım.', 'mutevazi', { disiplin: 2 }, 'Sakin bir cevap.')] },
    { id: 'pr_galibiyet_serisi', ctx: ['win'], q: 'Üst üste galibiyetler geliyor. Şampiyonluk konuşulabilir mi?', o: [
      T('Maç maç bakıyoruz.', 'kacamak', { 'r.hoca': 2 }, 'Hocanın en sevdiği cevap.'),
      T('Evet, hedefimiz şampiyonluk.', 'iddiali', { 'r.taraftar': 4, 'takipci%': 2 }, 'Tribünler bu cümleyi tezahürat yaptı.')] },
    { id: 'pr_kotu_seri', ctx: ['loss'], q: 'Takım kötü bir seride. Soyunma odasında sorun mu var?', o: [
      T('Soyunma odası birbirine kenetli.', 'saygili', { 'r.takim': 3 }, 'Takım arkadaşların açıklamanı paylaştı.'),
      T('Herkes aynada kendine bakmalı.', 'sert', { 'r.takim': -4, 'r.medya': 2 }, 'Soyunma odasında bazı yüzler asıldı.'),
      T('Biraz şanssızız.', 'kacamak', { 'r.medya': -1 }, 'Gazeteciler pek ikna olmadı.')] },
    { id: 'pr_aile', ctx: ['any'], q: 'Ailenizin kariyerinizdeki yeri nedir?', o: [
      T('Her şeyimi onlara borçluyum.', 'duygusal', { 'r.aile': 4, 'r.anne': 3 }, 'Annen röportajı on kez izledi.'),
      T('Özel hayatımı konuşmayı sevmem.', 'sessiz', {}, 'Gazeteci saygı duydu.')] },
    { id: 'pr_saha', ctx: ['draw', 'loss'], q: 'Zemin çok kötüydü. Bu oyunu etkiledi mi?', o: [
      T('İki takım için de aynı zemin.', 'saygili', { 'r.medya': 2 }, 'Sportmence bir cevap.'),
      T('Bu sahada futbol oynanmaz.', 'sert', { 'r.medya': -1, 'r.baskan': -1 }, 'Ev sahibi kulüp açıklama yaptı.')] },
    { id: 'pr_milli_takim', ctx: ['any'], if: { caps: ['<', 1], stat: { sohret: ['>', 30] } }, q: 'Milli takımdan hâlâ davet gelmedi. Kırgın mısınız?', o: [
      T('Çalışmaya devam, davet gelir.', 'mutevazi', { moral: 1 }, 'Federasyon açıklamanı not etti.'),
      T('Hocanın tercihleri tartışılır.', 'sert', { 'takipci%': 2, 'r.medya': -1 }, 'Milli takım hocası soruya cevap vermedi.')] },
    { id: 'pr_gol_sevinci', ctx: ['goal'], q: 'Yeni bir gol sevinci gördük. Hikâyesi ne?', o: [
      T('Kardeşim için yaptım.', 'duygusal', { 'r.kardes': 4, 'r.aile': 2 }, 'Kardeşin ertesi gün okulda aynı sevinci yaptı.'),
      T('Bir oyun karakterinin hareketi.', 'esprili', { 'takipci%': 3 }, 'Oyun firması seni etiketledi.'),
      T('Söylersem büyüsü bozulur.', 'kacamak', { 'takipci%': 1 }, 'Gizem herkesin ilgisini çekti.')] },
    { id: 'pr_kaleci', ctx: ['any'], if: { pos: 'KL' }, q: 'Kaleciler sadece hata yaptıklarında konuşuluyor. Bu sizi yoruyor mu?', o: [
      T('Kalecilik yalnız bir meslek.', 'duygusal', { mental: 1, 'r.medya': 2 }, 'Kaleciler derneği sözlerini paylaştı.'),
      T('Ben hata yapmam.', 'iddiali', { 'takipci%': 2 }, 'Bu cümle bir gün sana geri dönecek.')] }
  );

  /* ---------- Eski olaylara ayar: tekrar azalsın, hoca planı sadece oynayacaksan ---------- */
  const byId = (id) => E.find((e) => e.id === id);
  const plan = byId('pre_hoca_plan');
  if (plan) { plan.if = Object.assign({}, plan.if, { squad: 'ilk11', pos: ['FV', 'OS'] }); plan.rep = 14; }
  ['pre_rakip_dm', 'pre_tunel_bakisma'].forEach((id) => { const e = byId(id); if (e) { e.if = Object.assign({}, e.if, { squad: ['ilk11', 'yedek'] }); e.rep = 14; } });
  E.filter((e) => e.pre || e.post).forEach((e) => { e.rep = Math.max(e.rep || 0, 12); });
  // eski kanka ile forma takası ve eski takıma karşı alkış: sadece eski takımına karşı
  const alk = byId('post_eski_takim_alkis');
  if (alk) alk.if.lm = Object.assign({}, alk.if.lm, { vsFormer: true });
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  // en sık tekrar edenler biraz daha seyrek
  const E = root.F.DATA.events;
  [['pre_taraftar_otel', 22], ['post_takim_toplanti', 20], ['post_yedek_sinir', 18], ['post_hakem', 18], ['post_tunel_kavga', 18]].forEach(([id, r]) => { const e = E.find((x) => x.id === id); if (e) e.rep = r; });
})(typeof window !== 'undefined' ? window : globalThis);
