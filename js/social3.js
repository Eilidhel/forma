/* FORMA — sosyal medyada beğeni ve yorumların sonuçları
   - Her gönderinin kimi hedef aldığı (hocan, başkan, kaptan, kankan, partnerin, takım, ailen, sen) ve tonu (olumlu/olumsuz) çıkarılır.
   - Birini kötüleyen bir gönderiyi beğenirsen o kişiyle ilişkin düşer; övgüyü beğenirsen biraz artar. Çoğu zaman kişi bunu görür ve yazar.
   - Beğeniden gelen takipçi, gönderinin kendi beğeni sayısıyla büyür: viral bir gönderiyi beğenmek daha çok göz önüne çıkarır.
   - Gönderilere yorum yazabilirsin. Yorumun tonu (savunma, katılma, hakaret, teşekkür, espri) okunur; gönderi sahibi cevap verir,
     ilişkilerin, taraftar ve medya algın buna göre değişir. İyi yorum iyi tepki, kötü yorum kötü tepki getirir. */
(function (root) {
  const F = root.F;
  const D = F.DATA;
  const AGG = ['takim', 'medya', 'aile', 'taraftar', 'memleket'];
  const norm = (t) => ' ' + String(t || '').toLocaleLowerCase('tr').replace(/[.,!?;:()"'’]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const count = (t, list) => list.filter((w) => t.includes(w)).length;
  const NEG = ['rezil', 'rezalet', 'berbat', 'beceriksiz', 'yetersiz', 'kovulsun', 'istifa', 'gitsin', 'defol', 'utanç', 'yazık', 'çöp', 'sahtekar', 'satılmış', 'hain', 'nankör', 'vasat', 'kötü', 'bitik', 'bitti', 'kibirli', 'şımarık', 'korkak', 'ezik', 'skandal', 'beceremiyor', 'yürüyor', 'ayıp', 'harcıyor', 'fazla geldi', 'yakışmıyor', 'pr ', 'saçma', 'boş ', 'tembel', 'bırakmalı', 'kulübesine', 'küme düşer', '👎', '🤡'];
  const POS = ['helal', 'harika', 'efsane', 'muhteşem', 'gurur', 'bravo', 'aslan', 'kral', 'teşekkür', 'destek', 'sevgi', 'tebrik', 'başarı', 'iyi ki', 'süper', 'mükemmel', 'saygı', 'lider', 'dehası', 'güzel', 'mutlu', 'seviyoruz', 'seviyorum', '🔥', '👏', '❤', '🙏', '💪'];
  const DEFEND = ['haksızlık', 'arkasındayız', 'arkasındayım', 'güveniyorum', 'güveniyoruz', 'rahat bırakın', 'yakışmadı', 'ayıp', 'öyle değil', 'katılmıyorum', 'hak etmiyor', 'çok çalışıyor', 'emeği', 'saygı duy', 'hepimiz', 'birlikte', 'yanındayız', 'yanındayım', 'kardeşim', 'değerli', 'haksız'];
  const AGREE = ['katılıyorum', 'aynen', 'haklısın', 'kesinlikle', 'çok doğru', 'doğru söylüyor', 'evet', '+1', 'tam olarak'];
  const INSULT = ['aptal', 'salak', 'gerizekalı', 'şerefsiz', ' lan ', 'amk', ' mal ', 'ezik', 'korkak', 'defol', 'haddini', 'cahil', 'kes sesini', ' sus ', 'git başımdan', 'beyinsiz', 'zavallı'];
  const HUMOR = ['😂', '🤣', '😅', 'haha', 'ahah', 'şaka', 'xd', 'lol'];
  const THANKS = ['teşekkür', 'sağ ol', 'sağol', 'eyvallah', 'çok sağ', 'minnettar', '🙏', '❤'];
  const HUMBLE = ['haklısın', 'daha çok çalış', 'çalışacağım', 'çalışmaya devam', 'söz', 'düzelteceğim', 'kendimi geliştir', 'anlıyorum', 'eleştiriye açığım'];
  const PERSON = ['hoca', 'baskan', 'kaptan', 'kanka', 'partner', 'rakip', 'menajer', 'anne', 'baba', 'kardes'];
  const ROLE_WORDS = [['hoca', ['hoca', 'teknik direktör']], ['baskan', ['başkan', 'yönetim']], ['kaptan', ['kaptan']], ['partner', ['sevgilin', 'sevgilisi', 'eşi ', 'nişanlı']], ['aile', ['annen', 'baban', 'ailen', 'ailesi']], ['taraftar', ['taraftar', 'tribün']]];

  const isPerson = (r) => PERSON.includes(r);
  F.aboutLabel = function (about) {
    if (!about || about === 'me') return 'Sen';
    const n = isPerson(about) ? F.npc(about) : null;
    const lbl = { hoca: 'Hocan', baskan: 'Başkan', kaptan: 'Kaptan', kanka: 'Kankan', partner: 'Partnerin', rakip: 'Rakibin', menajer: 'Menajerin', anne: 'Annen', baba: 'Baban', kardes: 'Kardeşin', takim: 'Takım', aile: 'Ailen', taraftar: 'Taraftar', medya: 'Medya', memleket: 'Memleket' }[about] || about;
    return n ? lbl + ' ' + n.name.split(' ')[0] : lbl;
  };
  // gönderi kimi hedef alıyor, tonu ne
  F.postMeta = function (p) {
    if (p.meta) return p.meta;
    const S = F.S, P = S.P;
    const t = norm(p.t);
    let about = null;
    for (const role of PERSON) {
      const n = F.npc(role);
      if (!n || !n.name) continue;
      const full = n.name.toLocaleLowerCase('tr'), first = full.split(' ')[0];
      if (t.includes(full) || (first.length > 3 && t.includes(' ' + first + ' '))) { about = role; break; }
    }
    if (!about) for (const [r, ws] of ROLE_WORDS) if (ws.some((w) => t.includes(w))) { about = r; break; }
    if (!about && (S.mates || []).some((m) => m && m.length > 4 && !m.includes(P.surname) && t.includes(m.toLocaleLowerCase('tr')))) about = 'takim';
    const meHit = t.includes((P.name + ' ' + P.surname).toLocaleLowerCase('tr')) || t.includes(' ' + P.surname.toLocaleLowerCase('tr') + ' ') || t.includes(' ' + P.name.toLocaleLowerCase('tr') + ' ');
    if (!about && (meHit || p.kind === 'hate' || p.kind === 'fan' || p.kind === 'viral')) about = 'me';
    if (!about && F.myTeam && t.includes(F.myTeam().name.toLocaleLowerCase('tr'))) about = 'takim';
    const neg = count(t, NEG) + (p.kind === 'hate' ? 2 : 0), pos = count(t, POS);
    const tone = neg > pos ? 'neg' : pos > neg ? 'pos' : 'notr';
    p.meta = { about, tone };
    return p.meta;
  };

  const NOTICE_NEG = {
    hoca: ['Beğendiğin gönderiyi gördüm. Benim hakkımda bunları düşünüyorsan yüzüme söyle.', 'Soyunma odasında konuşulanlar sosyal medyaya taşınmaz. O beğeni yakışmadı.'],
    baskan: ['Kulübün başkanı hakkındaki o paylaşımı beğenmen hoş olmadı. Yönetim bunu not etti.'],
    kaptan: ['Kanka o beğeniyi gördüm. Bana bir şey diyeceksen önce bana de.', 'Hakkımda yazılanları beğenmişsin. Bunu senden beklemezdim.'],
    kanka: ['O tweeti beğenmişsin... Ciddi misin? 😐', 'Beni kötüleyen gönderiyi beğenmen koydu açıkçası.'],
    partner: ['O gönderiyi neden beğendin? Akşam konuşacağız.', 'Herkes benim hakkımda saçmalarken sen bir de beğeniyorsun öyle mi?'],
    rakip: ['Gördüm beğenini. Sahada görüşürüz.'],
    menajer: ['Beni kötüleyen paylaşımı beğenmişsin. İş ilişkimizi düşünmem lazım.'],
    anne: ['Oğlum o gönderiyi niye beğendin, insanlar ne der?'], baba: ['Aileni kötüleyenle bir mi oldun? Yakışmadı.'], kardes: ['Abi o beğeni neydi ya? 😕']
  };
  const NOTICE_POS = ['Hakkımdaki güzel gönderiyi beğenmişsin, sağ ol 🙏', 'Gördüm desteğini, eksik olma.'];

  // başkasının gönderisini beğen
  F.likePost = function (id) {
    const S = F.S, P = S.P;
    const p = S.feed.find((x) => x.id === id);
    if (!p || p.me || p.liked) return null;
    const meta = F.postMeta(p);
    p.liked = true; p.likes++;
    const out = { gain: 0, effects: [], noticed: false };
    S.likeCap = S.likeCap && S.likeCap.t === S.t ? S.likeCap : { t: S.t, n: 0 };
    if (S.likeCap.n >= 6) out.capped = true;
    else {
      S.likeCap.n++;
      // takipçi: gönderi ne kadar beğenildiyse beğenin o kadar çok kişiye görünür
      const decay = 1 - (S.likeCap.n - 1) * 0.12;
      const reach = Math.sqrt(Math.max(1, p.likes)) * F.rf(0.25, 0.9) + Math.sqrt(Math.max(100, P.followers)) / 90;
      out.gain = F.chance(0.15) ? 0 : Math.max(0, Math.round((F.rf(0.5, 2) + reach) * decay));
      P.followers += out.gain;
    }
    const who = meta.about;
    if (who && who !== 'me') {
      const person = isPerson(who);
      if (meta.tone === 'neg') {
        const v = person ? -F.ri(3, 5) : -2;
        F.relAdd(who, v);
        out.effects.push({ who: F.aboutLabel(who), v });
        const n = person ? F.npc(who) : null;
        if (n && F.chance(0.6)) { out.noticed = true; F.addDM(n.name, F.pick(NOTICE_NEG[who] || NOTICE_NEG.kanka)); }
        if (who === 'takim') F.relAdd('kaptan', -1);
      } else if (meta.tone === 'pos') {
        const v = person ? 1.5 : 1;
        F.relAdd(who, v);
        out.effects.push({ who: F.aboutLabel(who), v });
        const n = person ? F.npc(who) : null;
        if (n && F.chance(0.25)) F.addDM(n.name, F.pick(NOTICE_POS));
      }
    } else if (who === 'me' && meta.tone === 'neg') {
      // kendi hakkındaki eleştiriyi beğenmek: kimi olgunluk sayar, kimi dalga geçer
      if (F.chance(0.5)) { F.relAdd('taraftar', 1); out.effects.push({ who: 'Taraftar', v: 1, t: 'eleştiriyi kaldırabildiğini gördü' }); }
      else { F.fx({ moral: -1 }); F.relAdd('medya', -1); out.effects.push({ who: 'Medya', v: -1, t: 'kendine yazılan eleştiriyi beğenmeni haber yaptı' }); }
    }
    if (p.kind === 'club') F.relAdd('baskan', 0.3);
    // tanıdığın birinin gönderisini beğenmek o kişiyi sevindirir
    const au = F.postAuthor(p);
    if (au && au !== 'club' && PERSONAL.includes(au) && F.npc(au)) {
      F.relAdd(au, 1.5);
      out.effects.push({ who: F.authorLabel(p), v: 1.5, t: 'beğenini gördü' });
      if (FAMILY.includes(au) && F.chance(0.3)) F.addDM(F.npc(au).name, F.pick(['Beğenmişsin 🥹 Kurbanın olayım.', 'Gördüm beğenini, gözlerim doldu.', 'Beğendin mi? Sana yine yazarım o zaman ❤']));
    }
    return out;
  };

  /* ---------- Yorumlar ---------- */
  const REPLY = {
    fanLove: ['CEVAP VERDİİİ 😍 Bu ekran görüntüsü duvarıma!', 'Abi cevap verdin ya, günümü güzelleştirdin ❤', 'İşte bu yüzden seviyoruz seni, mütevazı adam 👏'],
    fanCold: ['Bu cevabı beklemiyordum açıkçası…', 'Tamam abi, sakin. Sadece destek veriyorduk.'],
    hateWon: ['Tamam bu iyiydi 😂 Bir dahaki maçta bakacağız.', 'Peki, haklısın. Sahada göster o zaman.', 'Bu cevaptan sonra susuyorum, saygı.'],
    hateFight: ['Bir de laf mı yetiştiriyorsun? Önce sahada iş yap!', 'Ekran görüntüsünü aldım, herkes görsün bu üslubu.', 'Ünlü olunca kafa da büyüdü demek.'],
    defendOk: ['Tamam, belki fazla sert yazdım.', 'Böyle savunman güzel, kabul.', 'Peki, bir şans daha verelim.'],
    agreeDrama: ['Oyuncusu bile katılıyorsa durum ciddi demek 👀', 'İçeriden biri sonunda konuştu!'],
    neutral: ['👍', 'Eyvallah.', 'Bakalım.'],
    news: ['Açıklamanız için teşekkürler, haberimize ekledik.', 'Kaynaklarımız farklı söylüyor ama not ettik.']
  };
  const DM_THANKS = ['Gördüm yazdığını. Arkamda durduğun için sağ ol, unutmam.', 'Beni savunduğun yorumu okudum. Eksik olma.'];
  const DM_ANGRY = ['O yoruma katılman çok ayıp oldu. Arkamdan değil, yüzüme konuş.', 'Hakkımdaki gönderiye yazdığın yorumu gördüm. Bunu konuşacağız.'];

  /* ---------- Gönderiyi kim yazdı? Annen, baban, kardeşin, partnerin, yakın arkadaşın, kaptan, hoca, kulüp, gazeteci… ---------- */
  const AUTHOR_ROLES = ['anne', 'baba', 'kardes', 'partner', 'dost', 'kanka', 'kaptan', 'hoca', 'baskan', 'menajer', 'rakip', 'gazeteci', 'magazinci'];
  const PERSONAL = ['anne', 'baba', 'kardes', 'partner', 'dost', 'kanka', 'kaptan', 'hoca', 'baskan', 'club'];
  const FAMILY = ['anne', 'baba', 'kardes'];
  F.postAuthor = function (p) {
    if (!p || p.me) return null;
    if (p.authorRole !== undefined) return p.authorRole;
    let r = null;
    for (const role of AUTHOR_ROLES) { const n = F.npc(role); if (n && n.name === p.who) { r = role; break; } }
    if (!r && p.kind === 'family') r = 'anne';
    if (!r && p.kind === 'partner') r = 'partner';
    if (!r && p.kind === 'club') r = 'club';
    if (!r && (D.journalists || []).some((j) => j.name === p.who)) r = 'gazeteci';
    p.authorRole = r;
    return r;
  };
  F.authorLabel = function (p) {
    const r = F.postAuthor(p);
    if (!r) return null;
    const female = r === 'kardes' && F.npc('kardes') && F.npc('kardes').female;
    return { anne: 'Annen', baba: 'Baban', kardes: female ? 'Kız kardeşin' : 'Kardeşin', partner: 'Partnerin', dost: 'Yakın arkadaşın', kanka: 'Takım arkadaşın', kaptan: 'Kaptanın', hoca: 'Hocan', baskan: 'Kulüp başkanı', menajer: 'Menajerin', rakip: 'Mevki rakibin', gazeteci: 'Gazeteci', magazinci: 'Magazin muhabiri', club: 'Resmi hesap' }[r] || null;
  };
  // yorumuna verilen cevap: yazan kişiye ve yorumunun tonuna göre (sevgi, soğukluk, hakaret, espri, sıradan)
  const AUTHOR_REPLY = {
    anne: {
      love: ['Kuzum benim 🥹 Yorumunu okuyunca gözlerim doldu.', 'Ben de seni çok seviyorum yavrum. Kendine iyi bak, yemeğini düzgün ye olur mu?', 'Ah oğlum… Bayramda gelemedin ama bu yazdığın bana yetti. Dualarım hep seninle ❤', 'Komşulara gösterdim yorumunu, hepsi "ne güzel evlat" dedi. Gururum sensin.', 'Canım oğlum, sesini duymak gibi oldu. Akşam bir ara, hasret kaldım.'],
      cold: ['Oğlum neden böyle yazdın? Annenim ben…', 'Herkesin önünde annene bu şekilde mi cevap veriyorsun? Kalbimi kırdın.', 'Peki oğlum. Sen bilirsin.'],
      insult: ['Bu ağız nereden çıktı? Ben seni böyle mi büyüttüm?', 'Yazıklar olsun. Bu yorumu hemen sil, babanın görmesini istemem.'],
      wit: ['Hâlâ aynı yaramazsın 😄 Gel de bir kulağını çekeyim.', 'Seni gidi seni 😄 Bu espriyi kimden öğrendin?'],
      neutral: ['Tamam oğlum. Yemek yedin mi, uyuyor musun düzgün?', 'Gördüm yavrum. Kendine dikkat et.']
    },
    baba: {
      love: ['Eyvallah aslanım. Gururlandırıyorsun beni.', 'Sağ ol oğlum. Sen sahada alnının akıyla oyna, gerisini dert etme.', 'Kahvede herkese okudum yorumunu. Bizim oğlan, dedim.'],
      cold: ['Babana böyle mi cevap verilir? Akşam konuşacağız.', 'Bu tavrı beğenmedim.'],
      insult: ['Bir daha bu dili kullanırsan karşında beni bulursun.', 'Ünlü olunca terbiyeni de mi unuttun?'],
      wit: ['Hah, espri anlayışı da bende çekmiş 😄', 'Güldürdün beni oğlum, eyvallah.'],
      neutral: ['Tamam.', 'Hı hı. Sen maçına odaklan.']
    },
    kardes: {
      love: ['Abiii 😍 Yorumunu herkese gösterdim!', 'Abi okulda havam bir başka şimdi 😎 Seni seviyorum.', 'Sen dünyanın en iyi abisisin, biliyorsun değil mi? 🥹'],
      cold: ['Ya abi niye böyle yazıyorsun, herkes gördü 😑', 'Tamam abi, anladım. Bir daha yazmam.'],
      insult: ['Abi bu ne ya? Silsene şunu, rezil oldum!'],
      wit: ['😂😂 Abi tamam pes ettim.', 'Abi sen futbolu bırak komedyen ol 😂'],
      neutral: ['👍', 'Tmm abi.']
    },
    partner: {
      love: ['❤ Seni seviyorum. Akşam erken gel, yemek yaptım.', 'Herkesin önünde böyle yazman çok tatlı 🥰', 'İşte bu yüzden seninleyim ❤'],
      cold: ['Bunu herkesin önünde yazmak zorunda mıydın?', 'Akşam konuşacağız.'],
      insult: ['Bu yorumu sil. Hemen.', 'Bu ne cüret? Eve gelince görüşürüz.'],
      wit: ['Çok komiksin 😂 Seni seviyorum ama.', 'Deli misin sen 😂❤'],
      neutral: ['😘', 'Tamam aşkım.']
    },
    dost: {
      love: ['Kardeşim benim 🤝 Ne olursa olsun yanındayım.', 'Eyvallah kanka, bu yorum çerçevelik. Çocukluğumuzu hatırladım.'],
      cold: ['Kanka ne bu soğukluk? Bir şey mi oldu aramızda?', 'Tamam kanka, anladım.'],
      insult: ['Oha kanka 😳 İyi misin sen? Ara beni.'],
      wit: ['Hahaha kanka sen hep böyleydin 😂', 'Mahallede de aynı laflarla güldürürdün 😂'],
      neutral: ['🤝', 'Eyv kanka.']
    },
    kanka: {
      love: ['Eyvallah reis 🤝 Sahada da böyle olalım.', 'Sağ ol kanka, bu sezon bizim!'],
      cold: ['Kanka antrenmanda konuşalım, burada değil.'],
      insult: ['Kanka bu yazdığın soyunma odasında konuşulur, burada değil.'],
      wit: ['😂 Antrenmanda göreceğiz bu espriyi.'],
      neutral: ['🤝']
    },
    kaptan: {
      love: ['Takım için yazman güzel. Sahada da göster.', 'Böyle devam. Soyunma odasında seninle gurur duyuyoruz.'],
      cold: ['Bu ton bana uymaz. Yüz yüze konuşalım.'],
      insult: ['Soyunma odasında görüşeceğiz.'],
      wit: ['Ha ha. Antrenmanda da bu kadar hızlı ol.'],
      neutral: ['👍']
    },
    hoca: {
      love: ['Güzel. Şimdi bunu antrenmanda da göster.', 'Teşekkür ederim. Takım bu ruhla kazanır.'],
      cold: ['Bunu sosyal medyada değil, odamda konuşalım.'],
      insult: ['Yarın sabah ofisime gel.'],
      wit: ['Espriyi sahada görelim.'],
      neutral: ['Not ettim.']
    },
    baskan: {
      love: ['Kulübümüzün değerli oyuncusuna teşekkürler. Kapımız sana hep açık.'],
      cold: ['Yönetim bu üslubu not etti.'],
      insult: ['Bu yorum yönetim kurulunda konuşulacak.'],
      wit: ['😄 Esprinize güldük, sahada da güldürün.'],
      neutral: ['Teşekkürler.']
    },
    club: {
      love: ['Formamızı terleten oyuncumuza teşekkürler! 💪', 'Birlikte daha güçlüyüz ❤', 'İşte bu ruh! Hep birlikte! 🔥'],
      cold: ['Yorumunuzu yönetimle paylaştık.'],
      insult: ['Resmi hesabımızdaki bu yorum disiplin kuruluna iletildi.'],
      wit: ['😄 Takımımızın şakacısı yine iş başında!'],
      neutral: ['👍']
    }
  };
  const AUTHOR_NOTE = {
    love: (l) => l + ' yorumunu görünce çok sevindi.', cold: (l) => l + ' bu soğuk cevaba bozuldu.', insult: (l) => l + ' bu üsluba çok kızdı. Yorumun ekran görüntüsü dolaşıyor.',
    wit: (l) => l + ' esprine güldü.', neutral: (l) => l + ' kısa bir cevap verdi.'
  };
  const LOVE = ['seviyorum', 'özledim', 'canım', 'annecim', 'babacım', 'kardeşim', 'yanındayım', 'öptüm', 'kucak', 'gurur', 'iyi ki', ' hep ', 'dua'];
  F.commentPost = function (id, text) {
    const S = F.S, P = S.P;
    const p = S.feed.find((x) => x.id === id);
    if (!p || p.me) return { err: 'Bu gönderiye yorum yapılamaz.' };
    if (p.commented) return { err: 'Bu gönderiye zaten yorum yaptın.' };
    const raw = String(text || '').trim().slice(0, 280);
    if (raw.length < 2) return { err: 'Bir şey yaz.' };
    const meta = F.postMeta(p);
    const t = norm(raw);
    const n = { ins: count(t, INSULT), pos: count(t, POS), neg: count(t, NEG), def: count(t, DEFEND), agr: count(t, AGREE), fun: count(t, HUMOR), thx: count(t, THANKS), hum: count(t, HUMBLE) };
    const fx = {};
    const add = (k, v) => (fx[k] = (fx[k] || 0) + v);
    const who = meta.about;
    const person = isPerson(who);
    const target = F.aboutLabel(who);
    let cat, reply, note, good = 0;
    const author = F.postAuthor(p);
    if (PERSONAL.includes(author)) {
      // tanıdığın biri yazmış: cevabı da etkisi de o kişiye göre
      const love = n.pos + n.thx + n.hum + n.def + count(t, LOVE);
      const bucket = n.ins ? 'insult' : n.fun ? 'wit' : n.neg > love ? 'cold' : love > 0 ? 'love' : 'neutral';
      const pool = AUTHOR_REPLY[author] || AUTHOR_REPLY.club;
      reply = F.pick(pool[bucket] || pool.neutral);
      cat = 'author-' + bucket;
      good = { love: 2, wit: 1, neutral: 0, cold: -1, insult: -2 }[bucket];
      const rel = author === 'club' ? 'baskan' : author;
      add('r.' + rel, { love: 5, wit: 2, neutral: 1, cold: -5, insult: -10 }[bucket]);
      if (FAMILY.includes(author)) add('r.aile', { love: 2, wit: 1, neutral: 0, cold: -2, insult: -5 }[bucket]);
      if (bucket === 'love') { add('moral', 2); if (FAMILY.includes(author) || author === 'partner') add('r.taraftar', 1); }
      if (bucket === 'insult') { add('r.medya', -3); add('t.asabi', 0.3); }
      note = AUTHOR_NOTE[bucket](F.authorLabel(p) + (author !== 'club' && F.npc(rel) ? ' ' + F.npc(rel).name.split(' ')[0] : ''));
    } else if (n.ins) {
      // hakaret her durumda geri teper
      cat = 'insult'; good = -2; reply = F.pick(REPLY.hateFight);
      add('r.medya', -4); add('r.taraftar', -2); add('t.asabi', 0.4);
      fx.seed = [{ id: 'federasyon_ceza', in: [1, 2], p: 0.3 }];
      if (who && who !== 'me' && meta.tone === 'neg' && (n.agr || n.neg)) { add('r.' + who, person ? -8 : -3); note = 'Hakaret dolu yorumun ' + target + ' hakkındaki eleştiriyi alevlendirdi. Ekran görüntüleri dolaşıyor.'; }
      else note = 'Hakaret içeren yorumun ekran görüntüsü her yere yayıldı. Medya ve taraftar tepkili.';
    } else if (who && who !== 'me' && meta.tone === 'neg') {
      if (n.def || (n.pos > n.neg && !n.agr)) {
        cat = 'defend'; good = 2; reply = F.pick(REPLY.defendOk);
        add('r.' + who, person ? 6 : 3); add('r.taraftar', 1); add('r.takim', 1);
        if (person && F.npc(who) && F.chance(0.7)) F.addDM(F.npc(who).name, F.pick(DM_THANKS));
        note = target + ' için ayağa kalktın. ' + (person ? 'Bunu duydu ve çok memnun.' : 'Camia bunu takdir etti.');
      } else if (n.agr || n.neg > n.pos) {
        cat = 'agree'; good = -2; reply = F.pick(REPLY.agreeDrama);
        add('r.' + who, person ? -8 : -4); add('r.medya', -1);
        if (who === 'hoca' || who === 'baskan' || who === 'kaptan') add('r.takim', -2);
        if (person && F.npc(who)) F.addDM(F.npc(who).name, F.pick(DM_ANGRY));
        F.addFeed({ who: 'Spor Haber', t: F.tpl('{adsoyad}, ') + F.aboutLabel(who).toLocaleLowerCase('tr') + ' hakkındaki eleştiriye sosyal medyada destek verdi. Soyunma odasında gerginlik iddiası.', kind: 'news' });
        note = target + ' hakkındaki eleştiriye katıldın. Haber oldu, ilişkiniz ciddi zarar gördü.';
      } else { cat = 'neutral'; reply = F.pick(REPLY.neutral); note = 'Yorumun pek dikkat çekmedi.'; }
    } else if (who === 'me' && meta.tone === 'neg') {
      if (n.fun) { cat = 'wit'; good = 2; reply = F.pick(REPLY.hateWon); add('r.taraftar', 2); add('sohret', 0.5); add('takipci%', 1.5); note = 'Esprili cevabın eleştiriyi silip süpürdü. Herkes paylaşıyor.'; }
      else if (n.hum || n.thx || n.pos > n.neg) { cat = 'classy'; good = 2; reply = F.pick(REPLY.hateWon); add('r.taraftar', 2); add('r.medya', 1); add('t.mutevazi', 0.3); note = 'Eleştiriye olgun cevap verdin. Taraftar ve medya takdir etti.'; }
      else if (n.neg) { cat = 'argue'; good = -1; reply = F.pick(REPLY.hateFight); add('r.taraftar', -1); add('r.medya', -2); add('moral', -1); note = 'Laf yetiştirmen tartışmayı büyüttü.'; }
    } else if (p.kind === 'news' || p.kind === 'rumor') {
      if (n.neg > n.pos) { cat = 'pressNeg'; good = -1; reply = F.pick(REPLY.news); add('r.medya', -2); note = 'Habere sert çıkman medyada "gergin" diye yorumlandı.'; }
      else { cat = 'press'; good = 1; reply = F.pick(REPLY.news); add('r.medya', 1); note = 'Habere sakin bir açıklama yaptın. Medya ilişkin iyileşti.'; }
    } else {
      // destek ve övgü gönderileri
      if (n.thx || n.pos > n.neg || n.hum) {
        cat = 'love'; good = 2; reply = F.pick(REPLY.fanLove); add('r.taraftar', 2);
        if (p.kind === 'club') add('r.baskan', 1);
        if (who && who !== 'me' && meta.tone === 'pos') add('r.' + who, person ? 2 : 1);
        note = 'Taraftara cevap vermen çok sevildi.';
      } else if (n.neg > n.pos) { cat = 'cold'; good = -1; reply = F.pick(REPLY.fanCold); add('r.taraftar', -2); note = 'Destek veren taraftara soğuk cevabın tepki çekti.'; }
      else { cat = 'neutral'; reply = F.pick(REPLY.neutral); add('r.taraftar', 0.5); note = 'Kısa bir cevap verdin.'; }
    }
    if (!cat) { cat = 'neutral'; reply = F.pick(REPLY.neutral); note = 'Yorumun pek dikkat çekmedi.'; }
    // takipçi: gönderinin beğeni sayısı ve yorumun kalitesi
    S.cmtCap = S.cmtCap && S.cmtCap.t === S.t ? S.cmtCap : { t: S.t, n: 0 };
    let gain = 0;
    if (S.cmtCap.n < 3) {
      S.cmtCap.n++;
      const mul = good >= 2 ? 1.8 : good > 0 ? 1.2 : good === 0 ? 0.6 : good === -1 ? 0.4 : 1.1; // hakaret de dikkat çeker ama bedeli ağır
      gain = Math.round((F.rf(1, 4) + Math.sqrt(Math.max(1, p.likes)) * F.rf(0.4, 1.2)) * mul);
      S.P.followers += gain;
    }
    p.commented = true;
    p.comments = (p.comments || []).concat([{ who: F.tpl('{adsoyad}'), t: raw, me: true }, { who: p.who, t: reply }]);
    if (good >= 2) p.likes += Math.round(Math.sqrt(p.likes + 10) * 3);
    const deltas = F.fx(fx);
    if (S.wk) S.wk.deltas.push(...deltas);
    return { r: note + (gain ? ' +' + F.num(gain) + ' takipçi.' : ''), deltas, good, gain, cat };
  };

  /* ---------- Başkalarını eleştiren / öven gönderiler ---------- */
  D.aboutPosts = {
    hoca: { neg: ['{x} bu takımı nereye götürüyor? Taktik yok, plan yok. İstifa!', '{x} hâlâ aynı hatada ısrar ediyor. Kovulsun artık.', 'Hoca {x} oyuncuları harcıyor, utanç verici.'], pos: ['{x} taktik dehası, bu takımı ayağa kaldırdı 👏', 'Hoca {x} iyi ki var. Helal olsun.'] },
    baskan: { neg: ['Başkan {x} transfer yapmıyor, yönetim istifa!', 'Yönetim rezil, başkan {x} sözlerini tutmadı.'], pos: ['Başkan {x} kulübü ayakta tutuyor, teşekkürler 🙏'] },
    kaptan: { neg: ['Kaptan {x} artık bitti, bandı başkasına verin.', '{x} sahada yürüyor, kaptanlık ona fazla geldi.'], pos: ['Kaptan {x} soyunma odasının lideri, saygı.'] },
    kanka: { neg: ['{x} berbat oynuyor, kulübesine çekilmeli.', '{x} kadroda ne arıyor? Vasat.'], pos: ['{x} sahada aslan gibi, helal olsun 🔥'] },
    partner: { neg: ['{x} ile {adsoyad} ilişkisi tamamen PR, herkes biliyor. Yazık.', '{x} yüzünden {ad} sahada değil magazinde. Ayıp.'], pos: ['{x} ve {ad} ne güzel çift ❤'] },
    takim: { neg: ['{kulup} bu sezon rezalet. Oyuncular forma terletmiyor.', 'Bu kadroyla {kulup} küme düşer, utanç.'], pos: ['{kulup} bu sezon harika, gurur duyuyoruz ❤'] },
    aile: { neg: ['{adsoyad} ve ailesi tribünde her maç olay çıkarıyor, ayıp.'], pos: ['Ailesi yine tribünde, {ad} için ne güzel bir tablo ❤'] }
  };
  F.spawnAboutPost = function () {
    const S = F.S;
    const roles = Object.keys(D.aboutPosts).filter((r) => (isPerson(r) ? !!F.npc(r) : true));
    if (!roles.length) return;
    const role = F.pick(roles);
    const neg = F.chance(0.65);
    const x = isPerson(role) ? F.npc(role).name : '';
    const recent = S.feed.slice(0, 15).map((p) => p.t);
    const pool = D.aboutPosts[role][neg ? 'neg' : 'pos'].map((s) => F.tpl(s.replace(/\{x\}/g, x))).filter((s) => !recent.includes(s));
    if (!pool.length) return;
    const t = F.pick(pool);
    F.addFeed({ who: F.handle(), t, kind: 'talk', likes: Math.round(F.rf(0.004, 0.06) * Math.max(800, S.P.followers) + F.ri(5, 200)) });
    if (S.feed[0] && S.feed[0].t === t) S.feed[0].meta = { about: role, tone: neg ? 'neg' : 'pos' };
  };
  const origBegin = F.beginWeek;
  F.beginWeek = function () {
    const r = origBegin.apply(this, arguments);
    try { if (F.chance(0.5)) F.spawnAboutPost(); } catch (e) { if (F.DEBUG) throw e; }
    return r;
  };
})(typeof window !== 'undefined' ? window : globalThis);
