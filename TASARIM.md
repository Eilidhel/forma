# FORMA — Tasarım ve Proje Belgesi

Bu belge oyunun şu anki hâlini, nasıl çalıştırılacağını, dosya yapısını ve sonraki adımları anlatır.
Kaynak prompt: `../futbol-oyunu-prompt.md`

---

## 1. Şu an neler var?

| Sistem | Durum | Not |
|---|---|---|
| 8 köken | ✅ | Her birinin giriş diyaloğu ve 3–6 olaylık kendi zinciri var |
| 4 mevki | ✅ | Maç anları mevkiye göre değişir (kalecinin kendine ait anları var) |
| Türkiye 5 lig | ✅ | Süper Lig 18, 1. Lig 18, 2. Lig 2×18, 3. Lig 3×16, BAL 4×14 (bölgesel gruplar) |
| Yurt dışı | ✅ | 7 ülke, 18 lig (EN/ES/DE/IT 3 kademe, FR/NL/PT 2 kademe), her lig 18 takım; üst lig PES tarzı isim + gerçek renk, alt ligler şehir listesinden |
| Turnuvalar | ✅ | Avrupa Yıldızlar Ligi (32 kulüp, 8 grup + eleme), Küresel Kupa (4 yılda bir, eleme grubu + 32 milli takım). İsimler kurgusal. `js/tournaments.js` |
| Yükselme / düşme | ✅ | Her sezon sonu tüm ligler simüle edilir, takım güçleri kayar |
| Haftalık plan | ✅ | Antrenman odağı + yük, 3–4 boş zaman slotu, 20 etkinlik (getiri + bedel) |
| Hoca talimatı | ✅ | Uyarsan ilişki artar, diktatör hoca uymayanı cezalandırır |
| Maç | ✅ | 2–4 kritik an, olasılıklar özellik + form + enerji + lig seviyesine göre; derbi anları; kaptan devre arası konuşması |
| Olay / diyalog | ✅ | ~154 olay: kart, sohbet, telefon araması, DM; ton seçimi; yetenek kontrolleri; kilitli seçenekler |
| Gecikmeli sonuçlar | ✅ | Bayrak + tohum sistemi (ör. provokatif paylaşım yıllar sonra geri döner) |
| Hikâye destesi | ✅ | Her kariyerde genel olayların ~%38'i hiç çıkmaz → iki kariyer aynı olmaz |
| Basın toplantısı | ✅ | 8 saniyelik süre, sessiz kalma sonucu, viral olma şansı |
| Tribün (sosyal medya) | ✅ | Akış, kendi paylaşımın (fotoğraf + ton), yorumlar, takipçi, Soyunma Odası grup sohbeti |
| İlişkiler | ✅ | Hoca (5 tip), başkan, kaptan, kanka, rakip, anne, baba, kardeş, partner, gazeteci, magazinci + genel (takım, medya, taraftar, aile, memleket) |
| Partner | ✅ | Tanışma (gece, arkadaş, DM, memleket, ünlü) → flört → sevgili → nişan → düğün → çocuk; kıskançlık, ayrılık, boşanma |
| Aile istekleri | ✅ | Mesajlar'da bekleyen istekler, süre dolarsa ilişki düşer |
| Menajer | ✅ | 4 seviye, haftalık tavsiye, ödüllü görevler, gizli komisyon / ihanet, kovma |
| Sözleşme pazarlığı | ✅ | Maaş, süre, imza parası kaydırıcıları, forma garantisi, kulübün sabrı, karşı teklif |
| Transfer | ✅ | Yaz + kış dönemi, kiralık, yurt dışı, sözleşme yenileme, serbest kalma |
| Para + Mağaza | ✅ | 50 ürün, 8 kategori; bakım masrafı, yatırım geliri, haciz; en tepede "memleketinin kulübünü satın al" |
| Milli takım | ✅ | U21 / A çağrısı, gurbetçi için Türkiye–Almanya seçimi |
| Sakatlık | ✅ | Tedavi seçimi (ameliyat, fizik tedavi, kök hücre), iğneyle oynama, tekrar riski |
| Sezon hedefleri | ✅ | Her sezon 3 hedef seç |
| Haftalık meydan okuma | ✅ | 4 haftalık mini görevler |
| Günün gündemi | ✅ | Gerçek gün başına bir küçük olay (cezasız) |
| Rutinler | ✅ | Uyku, beslenme, sabah koşusu: haftalık pasif etkiler |
| Kişilik | ✅ | 12 özellik, seçimlerle oluşur, seçenek açar/kapar |
| Emeklilik + nesil | ✅ | Çocuk ya da himayendeki genç; zaman atlaması; miras (para, mülk, itibar, şike lekesi, efsane baba); eski takım arkadaşları yönetici olur |
| Aile Müzesi | ✅ | Nesil kayıtları + hanedanlık skoru |
| Albüm | ✅ | Önemli anlar otomatik eklenir |
| PES usulü isim düzenleme | ✅ | Ayarlar → Takım isimlerini düzenle |
| Kayıt | ✅ | Otomatik (cihazda) + taşınabilir kayıt kodu |
| Portreler | ✅ | Her karakterin koddan üretilen yüzü (ten, saç, sakal, yaş, ruh hâli); aile oyuncuya benzer |
| Forma ve numara | ✅ | Ana ekranda kulüp renklerinde forma; numara karakter oluştururken seçilir, nesle geçer |
| Saha görünümü | ✅ | Maç anlarında mini saha, top hareketi animasyonlu (gol, kurtarış, kart) |
| Başarımlar | ✅ | 28 başarım, nesiller boyu saklanır (Aile Müzesi) |
| Karakter düzenleyici | ✅ | Stardew usulü: ten, saç modeli (13), saç rengi (12), sakal (6), kaş, göz rengi, bandana; Profil → berber ile sonradan da değişir |
| Forma numarası | ✅ | 1–99 elle girilir |
| Beceri modu (New Star Soccer usulü) | ✅ | Şut/pas: topu sürükle-bırak (yön + güç, kaleci hareketli, savunma blok/araya girer). Diğer hamleler: ibreyi yeşil bölgede durdur. Kapatılabilir ("Zar atsın") |
| Kariyer sonrası (yardımcı antrenör) | ⏳ | Mimari hazır, içerik sonraki faz |
| Kadın futbolu kökeni | ⏳ | Kız çocukla devam şimdilik kapalı ("yakında") |
| Para kazanma modeli | ⏳ | Konuşulacak |

---

## 2. Çalıştırma

**Tarayıcıda (en kolay):** Yayınlanan Artifact linkini telefonda aç.

**Yerelde:**
```bash
node tools/serve.js
```
Sonra `http://localhost:5173` adresini aç.

**Simülatör (denge ve hata testi):**
```bash
node tools/simulate.js 150 8
```
İlk sayı kariyer adedi, ikincisi her kariyerin sezon sınırı. `NANCHECK=1` ile bozuk sayıları yakalar.

---

## 3. Dosya yapısı

```
forma/
├── index.html              Sayfa: stil (tema tokenları) + script sırası
├── js/
│   ├── core.js             İsim alanı, tohumlu rastgelelik, para biçimi, isim havuzları, Türkçe ekler
│   ├── engine.js           Durum, dünya üretimi, etkiler, koşullar, şablonlar, olay seçimi, haftalık akış
│   ├── systems.js          Maç, basın, paylaşım, menajer, eylemler, sezon sonu, transfer, nesil, mağaza
│   ├── art.js              Yüz portreleri, forma, saha (SVG, kodla üretilir)
│   ├── ui.js               Tüm ekranlar ve etkileşimler
│   └── data/
│       ├── world.js        Şehirler/ilçeler, lig yapısı, yabancı kulüpler, renkler
│       ├── life.js         Kökenler, mevkiler, antrenman, etkinlikler, mağaza, rutinler, hedefler
│       ├── social.js       Tribün metinleri, maç anları, basın soruları, menajer tavsiyeleri, aile istekleri
│       ├── events_origin.js  Köken hikâyeleri
│       ├── events_club.js    Kulüp, hoca, takım, medya, transfer, sakatlık, para, aktivite riskleri
│       └── events_life.js    Partner, aile, yaşam evreleri, nadir anlar, nesil, günün gündemi
└── tools/
    ├── simulate.js         Kariyer simülatörü
    ├── serve.js            Yerel sunucu
    └── autoplay.js         Tarayıcıda otomatik oynatıcı (test)
```

**Teknoloji kararı:** Prompt React Native + Expo önermişti. Bu gece için tarayıcıda telefonda hemen oynanan bir web prototip yaptık. Motor (`engine.js`, `systems.js`, `data/`) arayüzden tamamen bağımsız. Expo'ya taşırken yalnızca `ui.js` yeniden yazılacak.

---

## 4. İçerik nasıl eklenir?

### Olay (kart)
```js
{ id: 'benzersiz_id', w: 10, if: { tier: [4, 5], minAge: 20 }, kind: 'card', who: 'hoca',
  t: 'Metin. {kulup}, {hoca}, {memleket} gibi değişkenler kullanılabilir.',
  o: [
    { t: 'Seçenek', tone: 'saygili', fx: { 'r.hoca': 5, enerji: -5, para: '-w1' }, r: 'Sonuç metni' },
    { t: 'Riskli seçenek', chk: { s: 'konusma', d: 45 }, ok: { r: 'Başardın', fx: { ... } }, no: { r: 'Olmadı', fx: { ... } } },
    { t: 'Kilitli seçenek', req: { s: 'liderlik', min: 50 }, fx: { ... } }
  ] }
```

### Sohbet (çok adımlı)
`kind: 'chat'` ve `nodes: { start: {...}, b2: {...} }`. Seçenek `next: 'b2'` ile ilerler.

### Telefon araması
`kind: 'call'` + `decline: { fx, r }` (açmazsan ne olur).

### Önemli alanlar
- `if`: koşullar. `tier`, `origin`, `pos`, `flag`, `noflag`, `stat`, `rel`, `partner`, `money`, `followers`, `ovr`, `hocaType`, `kids`, `lux`, `abroad`, `season`, `week`…
- `fx`: etkiler. `enerji`, `moral`, `mental`, `disiplin`, `sohret`, `saglik`, `form`, `para` (`'w2'` = 2 haftalık maaş), `takipci%`, `a.sut`, `s.konusma`, `r.hoca`, `t.lider`, `flag`, `seed` (gecikmeli olay), `do` (özel eylem), `album`, `feed`, `dm`.
- `chain: true`: sadece başka bir olaydan ya da tohumdan tetiklenir.
- `origin: true`: köken olayı (yüksek ağırlık).
- `rep: 20`: 20 hafta sonra tekrar çıkabilir.
- `daily: true`: günün gündemi havuzu.

---

## 5. Simülatör sonuçları (son çalıştırma)

- 150 kariyer × 8 sezon: **0 hata**
- İki kariyerin ilk 2 sezonundaki olay benzerliği: **%29** (hedef: %30'un altı)
- 8 sezonluk kariyerlerde benzerlik: **%42**
- Zirve güç ortalaması 73 (akademi 82, geç başlayan 65): kökenler gerçekten farklı yollar çiziyor
- Nesil sistemi: uzun kariyerlerde ortalama 2,4 nesil oynanıyor

---

## 6. Sonraki adımlar (önerilen sıra)

1. **Oynayıp geri bildirim:** Hangi olaylar sıkıcı, hangi seçimler çok kolay, ekonomi hızlı mı yavaş mı?
2. **İçerik genişletme:** 154 → 300 olay. En çok ihtiyaç olan alanlar: yurt dışı hayatı, Süper Lig medya krizleri, nesil 2+ olayları, kaleciye özel olaylar.
3. **Kariyer sonrası:** Yardımcı antrenör dönemi (oyuncuların hayat sorunları, diyalog sistemiyle).
4. **Görseller:** Karakter portreleri ve kulüp armaları (piksel ya da illüstrasyon).
5. **Expo'ya taşıma:** Gerçek mobil uygulama, bildirimler ("Menajerin sana yazdı").
6. **Para kazanma modeli** ve mağaza yayını öncesi isim/marka hukuki kontrolü.
