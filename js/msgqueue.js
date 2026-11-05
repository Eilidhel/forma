/* FORMA — mesaj sırası
   - Aynı kişiden aynı mesaj bir yıl içinde ikinci kez gelmez.
   - Bir haftada en fazla 3 düz mesaj gelir; fazlası sıraya girer, sonraki haftalarda teslim edilir.
   - Aynı kişiden cevap bekleyen bir sohbet varken yenisi gelmez; haftada en fazla 2 yeni sohbet açılır. */
(function (root) {
  const F = root.F;
  const PER_WEEK = 3;
  const origDM = F.addDM;
  const deliver = (from, t) => {
    const S = F.S;
    S.dmSeen = S.dmSeen || {};
    S.dmSeen[from + '|' + t] = S.t;
    S.dmWeek = S.dmWeek && S.dmWeek.t === S.t ? S.dmWeek : { t: S.t, n: 0 };
    S.dmWeek.n++;
    origDM(from, t);
  };
  F.addDM = function (from, t) {
    const S = F.S;
    if (!S) return;
    S.dmSeen = S.dmSeen || {};
    S.dmQueue = S.dmQueue || [];
    const key = from + '|' + t;
    if (S.dmSeen[key] != null && S.t - S.dmSeen[key] < 52) return; // aynı mesaj tekrar gelmez
    if (S.dmQueue.some((q) => q.from === from && q.t === t)) return; // zaten sırada
    const wk = S.dmWeek && S.dmWeek.t === S.t ? S.dmWeek.n : 0;
    if (wk >= PER_WEEK) { S.dmQueue.push({ from, t }); return; }
    deliver(from, t);
  };
  // her hafta başında sıradaki mesajlardan birkaçı gelir
  const origBegin = F.beginWeek;
  F.beginWeek = function () {
    const S = F.S;
    try {
      S.dmQueue = S.dmQueue || [];
      let n = 0;
      while (S.dmQueue.length && n < 2) { const q = S.dmQueue.shift(); if (!(S.dmSeen && S.dmSeen[q.from + '|' + q.t] != null && S.t - S.dmSeen[q.from + '|' + q.t] < 52)) { deliver(q.from, q.t); n++; } }
    } catch (e) { /* yoksay */ }
    return origBegin.apply(this, arguments);
  };
  // sohbetler: aynı kişiden cevaplanmamış sohbet varken yenisi açılmaz, haftada en fazla 2 yeni sohbet
  const origConvo = F.queueConvo;
  F.queueConvo = function (id) {
    const S = F.S;
    const c = F.DATA.convos.find((x) => x.id === id);
    if (!c) return false;
    const who = F.convoWho(c);
    if (!who) return false;
    if ((S.convos || []).some((x) => x.who === who && !x.ans)) return false;
    if ((S.convos || []).some((x) => x.id === id && !x.ans)) return false;
    const thisWeek = (S.convos || []).filter((x) => x.at === S.t).length;
    if (thisWeek >= 2) return false;
    return origConvo.apply(this, arguments);
  };
})(typeof window !== 'undefined' ? window : globalThis);
