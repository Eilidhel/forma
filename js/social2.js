/* FORMA — kendi yazdığın paylaşımın analizi, beğeniyle takipçi, banka kredisi
   Paylaşım analizi Türkçe anahtar kelimelere, emojiye, uzunluğa, büyük harfe ve son maçın sonucuna bakar.
   Ton (mütevazı, iddialı, duygusal, esprili, motive, sert) ve riskler (hakaret, hakem, rakip, hoca, siyaset) çıkar;
   bunlara göre beğeni, takipçi ve ilişki etkileri hesaplanır. */
(function (root) {
  const F = root.F;
  const D = F.DATA;

  const norm = (t) => String(t || '').toLocaleLowerCase('tr').replace(/[.,!?;:()"'’]/g, ' ');
  const has = (txt, list) => list.filter((w) => txt.includes(w));
  const LEX = {
    mutevazi: ['teşekkür', 'tesekkur', 'sağ ol', 'sağolun', 'takım', 'takim', 'birlikte', 'beraber', 'hepimiz', 'arkadaşlarım', 'emeği', 'emek', 'çalışmaya devam', 'daha iyisi', 'şükür', 'elhamdülillah', 'hep beraber', 'herkese'],
    iddiali: ['en iyi', 'kral', 'kimse', 'durduramaz', 'benim', 'ben varken', 'efsane', 'rakip yok', 'tarih yazacağız', 'şampiyon olacağız', 'gol kralı', 'yenilmez', 'bir numara', 'goat'],
    duygusal: ['anne', 'baba', 'aile', 'dede', 'nene', 'babaanne', 'memleket', 'gurur', 'rüya', 'hayal', 'ağladım', 'minnettar', 'özledim', 'kalbim', '❤', '🙏', '🥹'],
    esprili: ['😂', '🤣', '😅', 'haha', 'ahah', 'şaka', 'kanka', 'lol', 'xd'],
    taraftar: ['taraftar', 'tribün', 'sizinle', 'sizin için', 'renkler', 'arma', 'formamız', 'ailemiz', 'camia'],
    motive: ['hadi', 'devam', 'pes etmek yok', 'savaş', 'mücadele', '💪', 'odak', 'daha çok çalış', 'asla vazgeçme', 'kalkacağız'],
    hakem: ['hakem', 'var odası', 'soygun', 'haksızlık', 'penaltı vermedi', 'çaldılar', 'federasyon'],
    hoca: ['hoca anlamıyor', 'hocam yanlış', 'neden oynatmıyor', 'kulübede çürüyorum', 'teknik direktör hata'],
    hakaret: ['aptal', 'salak', 'gerizekalı', 'şerefsiz', 'lan', 'amk', 'mal ', 'ezik', 'korkak', 'rezil', 'ağlasınlar', 'ezdik', 'yerle bir'],
    siyaset: ['seçim', 'parti', 'siyaset', 'hükümet', 'muhalefet', 'oy verin'],
    sponsor: ['#reklam', 'sponsor', 'indirim kodu', 'linke tıkla', 'iş birliği', 'işbirliği'],
    // genel olumlu / olumsuz ifadeler ve maç kelimeleri ("çok iyi bir maçtı", "harika galibiyet")
    olumlu: ['iyi', 'harika', 'güzel', 'muhteşem', 'süper', 'mükemmel', 'efsane maç', 'keyifli', 'mutluyum', 'gururluyum', 'kazandık', 'galibiyet', 'üç puan', '3 puan', 'zafer', 'bravo', 'helal', '👏', '🔥', '⚽'],
    olumsuz: ['kötü', 'berbat', 'üzgün', 'üzücü', 'kaybettik', 'yenildik', 'mağlubiyet', 'olmadı', 'hayal kırıklığı', 'moralim bozuk', '😔', '😞', '💔'],
    mac: ['maç', 'mac', 'oyun', 'galibiyet', 'deplasman', 'derbi', 'gol', 'puan', 'saha']
  };
  const EMOJI = /[\u{1F300}-\u{1FAFF}☀-➿]/gu;

  F.analyzePost = function (text) {
    const S = F.S, P = S.P;
    const raw = String(text || '').trim();
    const t = ' ' + norm(raw) + ' ';
    const hits = {};
    Object.keys(LEX).forEach((k) => (hits[k] = has(t, LEX[k])));
    // rakip takım adları: sıradaki rakip ve şehrin diğer takımları
    const fx0 = S.league && F.myFixture && F.myFixture();
    const rivals = [];
    if (fx0) rivals.push(F.team(fx0.opp).name);
    const me = F.myTeam();
    Object.values(S.world.teams).forEach((tm) => { if (tm.id !== me.id && tm.province === me.province) rivals.push(tm.name); });
    const rivalHit = rivals.filter((n) => t.includes(n.toLocaleLowerCase('tr')));
    const emojis = (raw.match(EMOJI) || []).length;
    const tags = (raw.match(/#[\wçğıöşüÇĞİÖŞÜ]+/g) || []).length;
    const letters = raw.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '');
    const caps = letters.length > 8 && letters.replace(/[^A-ZÇĞİÖŞÜ]/g, '').length / letters.length > 0.6;
    const len = raw.length;
    const lm = S.lastMatch;
    const lost = lm && lm.res === 'loss';
    const won = lm && lm.res === 'win';

    // ton: en çok eşleşen
    const tones = ['mutevazi', 'iddiali', 'duygusal', 'esprili', 'motive'];
    let tone = tones.slice().sort((a, b) => hits[b].length - hits[a].length)[0];
    if (!hits[tone].length) tone = hits.olumlu.length > hits.olumsuz.length ? 'olumlu' : hits.olumsuz.length ? 'olumsuz' : 'notr';
    if (hits.hakaret.length || hits.hakem.length || hits.hoca.length || (rivalHit.length && hits.iddiali.length)) tone = 'sert';

    let eng = 40; // etkileşim puanı 0-100
    const notes = [];
    const fx = {};
    const add = (k, v) => (fx[k] = Math.round(((fx[k] || 0) + v) * 10) / 10);
    // uzunluk
    if (len < 8) { eng -= 20; notes.push(['bad', 'Çok kısa, kimse ne demek istediğini anlamadı.']); }
    else if (len <= 180) { eng += 8; notes.push(['good', 'Uzunluk ideal.']); }
    else if (len > 280) { eng -= 10; notes.push(['bad', 'Çok uzun, insanlar okumadan geçti.']); }
    // emoji ve etiket
    if (emojis >= 1 && emojis <= 4) { eng += 6; notes.push(['good', 'Emojiler paylaşımı canlandırdı.']); }
    else if (emojis > 8) { eng -= 8; notes.push(['bad', 'Emoji yağmuru biraz fazla.']); }
    if (tags >= 1 && tags <= 3) { eng += 5; notes.push(['good', 'Etiketler paylaşımı keşfete taşıdı.']); }
    else if (tags > 5) { eng -= 8; notes.push(['bad', 'Fazla etiket spam gibi göründü.']); }
    if (caps) { eng += 4; add('r.medya', -1); notes.push(['warn', 'BÜYÜK HARFLE bağırmak dikkat çekti ama ciddiyet kaybettirdi.']); }
    // tonlar
    if (hits.mutevazi.length) { add('r.takim', 1 + Math.min(2, hits.mutevazi.length) * 0.5); add('r.taraftar', 1.5); add('t.mutevazi', 0.4); eng += 4; notes.push(['good', 'Mütevazı dil: takım ve taraftar sevdi.']); }
    if (hits.iddiali.length) {
      add('takipci%', 1.5); add('sohret', 0.6); add('t.hirsli', 0.4); eng += 10;
      if (lost || P.life.form < -2) { add('r.taraftar', -4); eng -= 6; notes.push(['bad', 'Kötü sonuçtan sonra iddialı sözler alay konusu oldu.']); }
      else notes.push(['warn', 'İddialı sözler çok konuşuldu. Tutmazsa geri döner.']);
    }
    if (hits.duygusal.length) { add('moral', 2); add('r.aile', 1.5); eng += 8; notes.push(['good', 'Duygusal paylaşım samimi bulundu.']); }
    if (hits.esprili.length) {
      eng += 9; add('takipci%', 1);
      if (lost) { add('r.taraftar', -3); notes.push(['bad', 'Yenilgiden sonra şaka yapman taraftarı kızdırdı.']); }
      else notes.push(['good', 'Esprili dil etkileşimi artırdı.']);
    }
    if (hits.taraftar.length) { add('r.taraftar', 3); eng += 6; notes.push(['good', 'Taraftara seslenmen karşılık buldu.']); }
    if (hits.motive.length) { add('moral', 1); eng += 3; if (lost) { add('r.taraftar', 2); notes.push(['good', 'Yenilgi sonrası motive mesajın takdir topladı.']); } else notes.push(['good', 'Motivasyon mesajı.']); }
    if (won && (hits.mutevazi.length || hits.taraftar.length)) { eng += 6; notes.push(['good', 'Galibiyet sonrası doğru zamanda doğru mesaj.']); }
    // riskler
    if (hits.hakem.length) { add('r.medya', -2); add('r.taraftar', 2); eng += 8; add('seed', 0); fx.seed = [{ id: 'federasyon_ceza', in: [1, 2], p: 0.35 }]; notes.push(['bad', 'Hakem eleştirisi federasyonun dikkatini çekti.']); }
    if (hits.hoca.length) { add('r.hoca', -8); eng += 10; notes.push(['bad', 'Hocanı herkesin önünde eleştirdin. Soyunma odasında sorun çıkacak.']); }
    if (hits.hakaret.length) { add('r.medya', -5); add('t.asabi', 0.6); eng += 14; fx.seed = [{ id: 'federasyon_ceza', in: [1, 2], p: 0.55 }]; notes.push(['bad', 'Hakaret içeren ifade: disiplin kurulu ve medya üstüne geldi.']); }
    if (rivalHit.length) { add('r.taraftar', 3); add('r.rakip', -4); eng += 10; notes.push(['warn', rivalHit[0] + ' adını anman rakip taraftarı ayağa kaldırdı.']); }
    if (hits.siyaset.length) { add('r.medya', -3); add('r.baskan', -3); eng += 6; notes.push(['bad', 'Siyasi ifadeler kulüp yönetimini rahatsız etti.']); }
    if (hits.sponsor.length) {
      if (P.followers < 40000 || P.life.sohret < 35) notes.push(['warn', 'Reklam gibi duruyor ama seninle çalışan bir marka yok.']);
      else { add('para', Math.round(Math.min(P.followers, 2e6) * F.rf(0.1, 0.25))); add('r.taraftar', -1); notes.push(['warn', 'Sponsorlu paylaşım para getirdi, bazı taraftarlar sevmedi.']); }
    }
    // olumlu / olumsuz genel ifadeler ve maç bağlamı
    if (hits.olumlu.length) {
      eng += 7; add('moral', 1);
      if (hits.mac.length && won) { add('r.taraftar', 2); eng += 4; notes.push(['good', 'Galibiyetten sonra maçı övmen taraftarı sevindirdi.']); }
      else if (hits.mac.length && lost) { add('r.taraftar', -2); notes.push(['warn', 'Kaybedilen maçı "iyi" diye anlatman bazı taraftarları şaşırttı.']); }
      else notes.push(['good', 'Olumlu bir paylaşım, takipçilerin beğendi.']);
    }
    if (hits.olumsuz.length) {
      eng += 4;
      if (lost) { add('r.taraftar', 2); notes.push(['good', 'Yenilgiden sonra üzüntünü paylaşman samimi bulundu.']); }
      else { add('moral', -1); notes.push(['warn', 'Olumsuz bir dil: takipçilerin seni moralsiz sanabilir.']); }
    }
    if (hits.mac.length && !hits.olumlu.length && !hits.olumsuz.length && tone === 'notr') { eng += 3; notes.push(['good', 'Maç hakkında bir paylaşım, takipçilerin ilgiyle okudu.']); }
    if (tone === 'notr' && len >= 8 && !hits.mac.length) notes.push(['warn', 'Belirgin bir duygu yok, sıradan bir paylaşım.']);
    eng = F.clamp(Math.round(eng), 0, 100);
    add('takipci%', Math.round((eng - 40) / 15 * 10) / 10);
    const label = { mutevazi: 'Mütevazı', iddiali: 'İddialı', duygusal: 'Duygusal', esprili: 'Esprili', motive: 'Motive', sert: 'Sert', olumlu: 'Olumlu', olumsuz: 'Üzgün', notr: 'Nötr' }[tone];
    const commentTone = { mutevazi: 'mutevazi', iddiali: 'iddiali', duygusal: 'duygusal', esprili: 'mutevazi', motive: 'mutevazi', sert: 'provokatif', olumlu: 'mutevazi', olumsuz: 'duygusal', notr: 'mutevazi' }[tone];
    return { tone, label, eng, fx, notes, commentTone };
  };

  /* ---------- Gazeteciler: basın toplantısı, Kişiler'deki gazeteci, transfer kulisi ve haber paylaşımları ---------- */
  D.journalists = [
    { name: 'Sabun Yağız', handle: '@sabunyagiz', beat: 'transfer' },
    { name: 'Caprizio', handle: '@caprizio', beat: 'transfer' },
    { name: 'Roman', handle: '@roman', beat: 'kulis' },
    { name: 'Kulisçi Ferda', handle: '@kulisferda', beat: 'kulis' },
    { name: 'Analizci Ozan', handle: '@ozananaliz', beat: 'analiz' }
  ];
  F.pickJournalist = (beat) => { const list = D.journalists.filter((j) => !beat || j.beat === beat); return F.pick(list.length ? list : D.journalists); };
  // haber ve kulis paylaşımlarının bir kısmı gazetecilerden gelir
  const origFeed = F.addFeed;
  F.addFeed = function (o) {
    if (o && !o.me && (o.who === 'Spor Haber' || o.who === 'Transfer Kulisi' || o.who === 'Tribün Dedikodu' || o.who === 'Futbol Ajansı') && F.chance(o.who === 'Spor Haber' ? 0.45 : 0.8)) {
      const j = F.pickJournalist(o.who === 'Spor Haber' ? null : 'transfer');
      o = Object.assign({}, o, { who: j.name, handle: j.handle });
    }
    return origFeed.call(this, o);
  };

  // kendi yazdığın paylaşımı yayınla
  F.makeCustomPost = function (photo, text) {
    const S = F.S, P = S.P;
    const a = F.analyzePost(text);
    const fx = Object.assign({}, a.fx);
    if (photo === 'aile') fx['r.aile'] = (fx['r.aile'] || 0) + 2;
    if (photo === 'partner') fx['r.partner'] = (fx['r.partner'] || 0) + 3;
    if (photo === 'memleket') fx['r.memleket'] = (fx['r.memleket'] || 0) + 3;
    const deltas = F.fx(fx);
    if (S.wk) S.wk.deltas.push(...deltas);
    const comments = [];
    for (let i = 0; i < 2; i++) comments.push({ who: F.handle(), t: F.tpl(F.pick(D.social.comments[a.commentTone])) });
    F.addFeed({ who: F.tpl('{adsoyad}'), t: String(text).trim().slice(0, 400), me: true, kind: 'me', img: photo, comments, likes: Math.round(P.followers * F.rf(0.03, 0.08) * (0.4 + a.eng / 60)) });
    S.postedWeek = S.t;
    return { deltas, r: 'Paylaşım analizi: ' + a.label + ' ton, etkileşim puanı ' + a.eng + '/100. ' + (a.notes[0] ? a.notes[0][1] : ''), analysis: a };
  };

  // başkasının paylaşımını beğen: haftada en fazla 6 beğeni takipçi kazandırır
  F.likePost = function (id) {
    const S = F.S, P = S.P;
    const p = S.feed.find((x) => x.id === id);
    if (!p || p.me || p.liked) return null;
    p.liked = true; p.likes++;
    S.likeCap = S.likeCap && S.likeCap.t === S.t ? S.likeCap : { t: S.t, n: 0 };
    if (S.likeCap.n >= 6) return { gain: 0, capped: true };
    S.likeCap.n++;
    // her beğeni farklı: bazen hiç, bazen bir avuç takipçi. Hesabın büyüdükçe biraz artar, aynı hafta beğendikçe azalır
    const base = Math.sqrt(Math.max(100, P.followers)) / 60;
    const decay = 1 - (S.likeCap.n - 1) * 0.15;
    const gain = F.chance(0.25) ? 0 : Math.max(0, Math.round((F.rf(0.5, 2.2) + base * F.rf(0.2, 1.6)) * decay));
    P.followers += gain;
    if (p.kind === 'club') F.relAdd('baskan', 0.3);
    if (p.kind === 'hate') F.relAdd('medya', -0.5);
    return { gain };
  };

  /* ---------- Banka kredisi ----------
     Limit sözleşmene ve maaşına bağlı; faiz lige ve kredi notuna göre değişir. Taksitler her hafta düşer.
     Ödeyemezsen kredi notun düşer, gecikme faizi işler. Aynı anda tek kredi. */
  D.loanTerms = [{ weeks: 12, rate: 0.05, name: '3 ay' }, { weeks: 26, rate: 0.11, name: '6 ay' }, { weeks: 52, rate: 0.24, name: '1 yıl' }];
  F.loanLimit = function () {
    const S = F.S, P = S.P;
    if (!P.contract || P.contract.years <= 0 || S.loan) return 0;
    const credit = P.credit == null ? 60 : P.credit;
    const weeks = Math.min(40, 8 + P.contract.years * 12);
    return Math.max(0, Math.round(P.contract.wage * weeks * (0.5 + credit / 100) / 1000) * 1000);
  };
  F.loanQuote = function (amount, termIdx) {
    const P = F.S.P;
    const term = D.loanTerms[termIdx];
    const credit = P.credit == null ? 60 : P.credit;
    const rate = term.rate * (1 + (60 - credit) / 100);
    const total = Math.round(amount * (1 + rate));
    return { amount, total, weekly: Math.ceil(total / term.weeks), weeks: term.weeks, rate };
  };
  F.takeLoan = function (amount, termIdx) {
    const S = F.S, P = S.P;
    const lim = F.loanLimit();
    if (!lim) return { err: S.loan ? 'Zaten açık bir kredin var.' : 'Sözleşmen olmadan banka kredi vermiyor.' };
    amount = Math.min(amount, lim);
    const q = F.loanQuote(amount, termIdx);
    S.loan = { amount, total: q.total, weekly: q.weekly, left: q.weeks, paid: 0, missed: 0 };
    P.money += amount;
    F.bankLog('Kredi kullanımı', amount);
    return { ok: true, q };
  };
  F.payoffLoan = function () {
    const S = F.S, P = S.P;
    if (!S.loan) return { err: 'Açık kredi yok.' };
    const due = Math.round(S.loan.weekly * S.loan.left * 0.95);
    if (P.money < due) return { err: 'Kapatmak için ' + F.money(due) + ' lazım.' };
    P.money -= due;
    F.bankLog('Kredi erken kapama', -due);
    P.credit = Math.min(100, (P.credit == null ? 60 : P.credit) + 6);
    S.loan = null;
    return { ok: true, due };
  };
  // haftalık taksit (hafta sonu finansında çağrılır)
  F.loanWeekly = function (wk) {
    const S = F.S, P = S.P;
    if (!S.loan) return 0;
    const L = S.loan;
    P.money -= L.weekly; L.paid += L.weekly; L.left--;
    F.bankLog('Kredi taksiti', -L.weekly);
    if (P.money < 0) {
      L.missed++;
      P.credit = Math.max(0, (P.credit == null ? 60 : P.credit) - 8);
      L.left++; L.total = Math.round(L.total * 1.02); // gecikme faizi
      F.addDM('Banka', 'Taksitin hesabında karşılık bulmadı. Gecikme faizi işledi, kredi notun düştü.');
      if (wk) wk.notes.push('Kredi taksiti ödenemedi: gecikme faizi işledi.');
      F.fx({ mental: -2 });
    }
    if (L.left <= 0) { S.loan = null; P.credit = Math.min(100, (P.credit == null ? 60 : P.credit) + 4); F.addDM('Banka', 'Kredini tamamen ödedin. Tebrikler, kredi notun yükseldi.'); }
    return L.weekly;
  };
})(typeof window !== 'undefined' ? window : globalThis);
