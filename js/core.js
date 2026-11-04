/* FORMA — çekirdek: isim alanı, rastgelelik, yardımcılar, isim havuzları */
(function (root) {
  const F = (root.F = root.F || {});
  F.DATA = F.DATA || {};
  const D = F.DATA;
  D.events = D.events || [];
  D.press = D.press || [];
  D.requests = D.requests || [];

  /* ---------- Tohumlu rastgelelik (mulberry32) ---------- */
  // Durum F.S.rng içinde tutulur, böylece kayıtla birlikte saklanır.
  F.rand = function () {
    const S = F.S;
    let t = (S.rng = (S.rng + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  F.ri = (a, b) => a + Math.floor(F.rand() * (b - a + 1));
  F.rf = (a, b) => a + F.rand() * (b - a);
  F.chance = (p) => F.rand() < p;
  F.pick = (arr) => arr[Math.floor(F.rand() * arr.length)];
  F.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(F.rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  F.wpick = (items, wf) => {
    let total = 0;
    const ws = items.map((it) => {
      const w = Math.max(0, wf(it));
      total += w;
      return w;
    });
    if (total <= 0) return null;
    let r = F.rand() * total;
    for (let i = 0; i < items.length; i++) {
      r -= ws[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };
  F.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  F.poisson = (lambda) => {
    const L = Math.exp(-Math.max(0.05, lambda));
    let k = 0, p = 1;
    do { k++; p *= F.rand(); } while (p > L && k < 10);
    return k - 1;
  };
  F.uid = (p) => p + Math.floor(F.rand() * 1e9).toString(36);

  /* ---------- Biçimlendirme ---------- */
  F.money = function (v) {
    const neg = v < 0;
    let a = Math.abs(Math.round(v));
    let s;
    if (a >= 1e9) s = (a / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace('.', ',') + ' Mr';
    else if (a >= 1e6) s = (a / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace('.', ',') + ' Mn';
    else if (a >= 1e3) s = Math.round(a / 1e3) + ' B';
    else s = String(a);
    return (neg ? '−' : '') + s + ' ₺';
  };
  F.num = function (v) {
    v = Math.round(v);
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' Mn';
    if (v >= 1e4) return Math.round(v / 1e3) + ' B';
    return v.toLocaleString('tr-TR');
  };
  F.esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- İsim havuzları ---------- */
  D.names = {
    male: ('Ahmet Mehmet Mustafa Ali Hüseyin Hasan İbrahim Murat Emre Burak Serkan Volkan Onur Kerem Barış Berk Arda Kaan Eren Yusuf Ömer Furkan Enes Oğuz Tolga Selim Cem Cenk Uğur Umut Okan Sinan Taner Erkan Gökhan Ozan Hakan Kemal Halil Yasin Bilal Emir Efe Deniz Mert Alp Batuhan Taha Cihan Ferhat Rıza Recep İsmail Şahin Orhan Levent Tarık Yavuz Erdem Doruk Çağlar Koray Kadir Ramazan Abdullah Muhammet Metehan Halit Necati Tuncay Vedat Zafer Ertuğrul Atakan Ege Çınar Poyraz Aras Miraç Sarp').split(' '),
    female: ('Ayşe Fatma Zeynep Elif Merve Esra Büşra Selin Ece Defne Ceren İrem Gizem Derya Seda Pınar Aslı Buse Damla Melis Nazlı Hande Gamze Tuğba Sevgi Hatice Emine Hülya Sibel Nur Yağmur Ebru Cansu Dilara Eylül Sude Nehir Azra İpek Beril Lale Gül Şeyma Burcu Meltem Özge Duygu Aylin Serap Nilay').split(' '),
    surname: ('Yılmaz Kaya Demir Şahin Çelik Yıldız Yıldırım Öztürk Aydın Özdemir Arslan Doğan Kılıç Aslan Çetin Kara Koç Kurt Özkan Şimşek Polat Korkmaz Erdoğan Güneş Aksoy Tekin Ünal Yalçın Bulut Kaplan Turan Bozkurt Güler Avcı Sarı Akın Taş Uçar Ateş Keskin Özer Bayram Altun Karaca Tunç Duman Ergin Sezer Uysal Erdem Tuna Bilgin Önal Akbulut Coşkun Gündoğdu Karakaya Soylu Eren Başaran Toprak Ekinci Çakır Kalkan Akdağ Durmaz Oral Kocabaş Sevim Ilgaz Varol Gürsoy Karataş Akçay Sönmez Ay Yazıcı Albayrak Cengiz Önder Dağlı Erol Karadeniz Kalender Akyüz Uzun Vural Bektaş Ekmen Sağlam Topçu Yaman').split(' '),
    foreign: ('Lucas Mateo Jonas Kevin Luka Pedro Diego Marco Andrea Florian Niklas Thomas Jordan Marcus Kwame Moussa Ibrahima Yaw Viktor Nikola Filip Mikkel Lars Sergio Rafael Joao Bruno Hugo Theo Emil').split(' '),
    foreignSur: ('Müller Silva Santos Rossi Bianchi García López Martin Dubois Kowalski Novak Petrov Jensen Hansen Diallo Traoré Mensah Okafor Smith Walker Fischer Schneider Costa Ferreira Moreau Ricci Romero Horvat Ivanov').split(' '),
    handlesA: 'tribun aslan kartal gol forma kale tezahurat taraftar futbol mac yesilsaha kirmizi sari lacivert bordo dev saha kupa'.split(' '),
    handlesB: 'sesi kafasi delisi asigi_1905 bey_61 kral 34 06 35 16 07 42 01 _x _ultra baba _tr _official _gs _mahalle'.split(' ')
  };
  F.maleName = () => F.pick(D.names.male);
  F.femaleName = () => F.pick(D.names.female);
  F.surname = () => F.pick(D.names.surname);
  F.fullName = (female) => (female ? F.femaleName() : F.maleName()) + ' ' + F.surname();
  F.foreignName = () => F.pick(D.names.foreign) + ' ' + F.pick(D.names.foreignSur);
  F.handle = () => '@' + F.pick(D.names.handlesA) + F.pick(D.names.handlesB).replace(/^_?/, '_');

  /* ---------- Türkçe yardımcıları ---------- */
  // Basit ünlü uyumu: "{kulup}'ın" yerine şablonlarda {kulup:in} gibi ekler kullanmak yerine
  // metinler eksiz yazılır; yalnızca -e/-a ve -de/-da ekleri için yardımcı var.
  const VOWELS = 'aıoueiöüAIOUEİÖÜ';
  function lastVowel(w) {
    for (let i = w.length - 1; i >= 0; i--) if (VOWELS.includes(w[i])) return w[i].toLowerCase();
    return 'e';
  }
  F.ekA = (w) => w + "'" + ('aıou'.includes(lastVowel(w)) ? 'a' : 'e');
  F.ekDa = (w) => w + "'" + ('aıou'.includes(lastVowel(w)) ? 'da' : 'de');
  F.ekIn = (w) => {
    const v = lastVowel(w);
    const map = { a: 'ın', ı: 'ın', o: 'un', u: 'un', e: 'in', i: 'in', ö: 'ün', ü: 'ün' };
    const endsV = VOWELS.includes(w[w.length - 1]);
    return w + "'" + (endsV ? 'n' : '') + map[v];
  };
})(typeof window !== 'undefined' ? window : globalThis);
