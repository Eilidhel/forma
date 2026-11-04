# FORMA

Sahadan hayata bir futbol kariyeri oyunu. Bir köy sahasından ya da büyük bir akademiden başlarsın; her seçimin kariyerinde ve hayatında iz bırakır.

- 13 farklı başlangıç hikâyesi, bazılarında kulübünü kendin seçersin
- Türkiye'nin 5 ligi (BAL'a kadar) ve Avrupa ligleri
- 12 mevkili saha haritası, her takımın kendi dizilişi, hocanın mevki istekleri
- 34 alt yetenek, XP ile gelişim, hocanın gelişim planı
- Spikerli maç akışı ve atak kurma (kısa pas, dribling, uzun pas)
- 420'den fazla olay, mesaj sohbetleri, basın toplantıları
- Özel hayat rutinleri, aylık kurslar, mağaza, banka kredisi, sözleşme pazarlığı
- Sosyal medya: kendi yazdığın paylaşım analiz edilir
- Nesil sistemi: emekli olunca çocuğunla devam edersin

## Nasıl oynanır

1. [Node.js](https://nodejs.org) ve [Git](https://git-scm.com) kurulu olsun.
2. Depoyu indir:
   ```
   git clone https://github.com/Eilidhel/forma.git
   ```
3. Windows'ta `FORMA'yı başlat.bat` dosyasına çift tıkla. Ya da terminalde:
   ```
   node tools/serve.js
   ```
4. Tarayıcıda http://localhost:5173 açılır.

Kariyerin tarayıcıya kaydedilir. Ayarlar'dan kayıt kodu alıp başka cihaza taşıyabilirsin.

## Güncelleme

Ayarlar > **Güncellemeyi denetle**. Yeni sürüm varsa notlarıyla gösterilir; **Şimdi güncelle** ile oyun GitHub'dan en yeni sürümü indirir ve kendini yeniler. Kariyerin kaybolmaz. Oyun açılınca günde bir kez kendiliğinden de kontrol eder.

## Geliştirici araçları

| Komut | Ne yapar |
|---|---|
| `node tools/simulate.js 100 8` | 100 kariyeri 8 sezon oynatır, hata ve denge raporu verir |
| `node tools/acttest.js` | Ekranda yazan etki ile gerçekte gelen aynı mı |
| `node tools/negotest.js` | Pazarlık sistemi |
| `node tools/nattest.js` | Milli ara |
| `node tools/featuretest.js` | Kulüp seçimi, sohbet, abonelik, atak zinciri |
| `node tools/postest.js` | Paylaşım analizi, kredi, mevki istekleri |
| `node tools/storylist.js > HIKAYELER.md` | Tüm olayların listesi |
| `node tools/bump.js 1.17.0 "not"` | Yeni sürüm numarası ve notları |

Yeni sürüm yayınlamak için: `bump.js` ile sürümü artır, commit at, push et. Oyuncular bir sonraki kontrolde güncellemeyi görür.
