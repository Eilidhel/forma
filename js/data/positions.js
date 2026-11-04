/* FORMA — mevki sistemi
   - Ana mevki: oyuncunun doğal yeri, tek bir saha haritasından seçilir (KL, STP, SLB, SĞB, DOS, MO, OOS, SLO, SĞO, SLK, SĞK, SF).
   - Her takımın bir dizilişi var. Dizilişte ana mevkin yoksa hoca başka bir mevki ister (ör. 3-4-3'te sol bek → sol açık ya da stoper).
   - Takım arkadaşı sakatlanınca hoca birkaç haftalığına başka bir yerde oynamanı isteyebilir.
   - Doğal olmayan mevkide "uyum" düşük başlar, oynadıkça artar. Uyum düşükse maçta başarı ve forma şansı azalır. */
(function (root) {
  const D = root.F.DATA;

  // Saha haritası (soldan sağa hücum): x 0-100, y 0-100. en: İngilizce kısaltma
  D.posMap = [
    { role: 'KL', x: 7, y: 50, en: 'GK' },
    { role: 'SLB', x: 25, y: 14, en: 'LB' }, { role: 'STP', x: 25, y: 50, en: 'CB' }, { role: 'SGB', x: 25, y: 86, en: 'RB' },
    { role: 'DOS', x: 42, y: 50, en: 'CDM' },
    { role: 'SLO', x: 55, y: 14, en: 'LM' }, { role: 'MO', x: 58, y: 50, en: 'CM' }, { role: 'SGO', x: 55, y: 86, en: 'RM' },
    { role: 'OOS', x: 73, y: 50, en: 'CAM' },
    { role: 'SLK', x: 80, y: 14, en: 'LW' }, { role: 'SGK', x: 80, y: 86, en: 'RW' },
    { role: 'SF', x: 92, y: 50, en: 'ST' }
  ];

  // Ana mevkiden diğer mevkilere doğal uyum (0-1). Listede olmayanlar 0.35.
  const mirror = (o) => { const m = {}; Object.keys(o).forEach((k) => (m[k.replace(/^SL/, 'X').replace(/^SG/, 'SL').replace(/^X/, 'SG')] = o[k])); return m; };
  const SLB = { SLB: 1, SLKB: 0.9, SGB: 0.75, STP: 0.7, SLO: 0.7, SGKB: 0.65, DOS: 0.5 };
  const SLO = { SLO: 1, SLK: 0.85, SLKB: 0.75, SGO: 0.75, SLB: 0.6, MO: 0.6, SGK: 0.65 };
  const SLK = { SLK: 1, SLO: 0.85, SGK: 0.8, IF: 0.7, SF: 0.6, OOS: 0.6 };
  D.roleFit = {
    KL: { KL: 1 },
    STP: { STP: 1, DOS: 0.7, SLB: 0.6, SGB: 0.6, SLKB: 0.5, SGKB: 0.5 },
    SLB, SGB: mirror(SLB), SLKB: Object.assign({}, SLB, { SLKB: 1, SLB: 0.9, SLO: 0.8 }), SGKB: mirror(Object.assign({}, SLB, { SLKB: 1, SLB: 0.9, SLO: 0.8 })),
    DOS: { DOS: 1, MO: 0.85, STP: 0.75, OOS: 0.55 },
    MO: { MO: 1, DOS: 0.85, OOS: 0.8, SLO: 0.6, SGO: 0.6, IF: 0.5 },
    OOS: { OOS: 1, MO: 0.8, IF: 0.8, SLK: 0.65, SGK: 0.65, SF: 0.55 },
    SLO, SGO: mirror(SLO),
    SLK, SGK: mirror(SLK),
    SF: { SF: 1, IF: 0.9, SLK: 0.6, SGK: 0.6, OOS: 0.5 },
    IF: { IF: 1, SF: 0.9, OOS: 0.8, SLK: 0.7, SGK: 0.7 }
  };
  // Takımlar en çok bu dizilişleri oynar (ağırlık)
  D.formationWeights = { '4-4-2': 14, '4-3-3': 14, '4-2-3-1': 16, '4-5-1': 6, '3-4-3': 7, '3-5-2': 8, '5-3-2': 6, '5-4-1': 5, '4-2-2-2': 5, '3-1-5-1': 2, '2-4-4': 1, '2-5-3': 1 };

  /* ---------- Hoca istekleri ---------- */
  const E = D.events;
  const O = (t, tone, fx, r, extra) => Object.assign({ t, tone, fx, r }, extra || {});
  E.push(
    { id: 'hoca_mevki_istegi', chain: true, rep: 1, kind: 'chat', who: 'hoca', nodes: { start: { who: 'hoca', t: 'Hoca seni odasına çağırdı ve taktik tahtasını gösterdi: "Biz {dizilis} oynuyoruz. Bu sistemde {anamevki} yok. Seni {oneri1} olarak düşünüyorum. Yeni bir yer ama bence yaparsın."', o: [
      O('{oneri1} olarak oynarım hocam.', 'saygili', { do: 'playrole:0', 'r.hoca': 5 }, 'Hoca rahatladı: "Antrenmanda bu mevkiyi çalışacağız." Uyumun oynadıkça artacak.'),
      O('Peki {oneri2} olsa?', 'iddiali', { do: 'playrole:1', 'r.hoca': 1 }, 'Hoca bir süre düşündü: "Olur, orada da deneriz."', { if: { roleOffer: 2 } }),
      O('Ben {anamevki} oyuncusuyum, mevkimden çıkmam.', 'sert', { do: 'playrole:-1', 'r.hoca': -8 }, 'Hoca omuz silkti: "O zaman kulübede beklersin." Sistemde yerin yok, forma şansın düşük.')] } } },
    { id: 'hoca_acil_mevki', chain: true, rep: 1, kind: 'chat', who: 'hoca', nodes: { start: { who: 'hoca', t: 'Antrenmandan önce hoca yanına geldi: "{takimarkadasi} sakatlandı, birkaç hafta yok. Onun yerine {acilmevki} oynayacak kimse kalmadı. Sen geçer misin?"', o: [
      O('Takım için oynarım hocam.', 'saygili', { do: 'temprole', 'r.hoca': 5, 'r.takim': 3 }, 'Hoca sırtını sıvazladı: "Bunu unutmayacağım."'),
      O('Kendi mevkimde daha faydalıyım.', 'kacamak', { 'r.hoca': -3 }, 'Hoca altyapıdan bir genci çağırdı.')] } } },
    { id: 'hoca_mevki_donus', chain: true, rep: 1, kind: 'card', who: 'hoca', t: 'Hoca: "Sakatlar döndü. Sen de kendi yerine dönüyorsun. Zor zamanda takıma yardım ettin."', o: [
      O('Ne zaman isterseniz hocam', 'saygili', { 'r.hoca': 2, moral: 2 }, 'Kendi mevkine döndün.')] }
  );
})(typeof window !== 'undefined' ? window : globalThis);
