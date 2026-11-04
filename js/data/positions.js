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
  // Başlangıçta mevkine göre dağıtacağın yetenek puanları (köken ne kadar zor başlıyorsa o kadar çok)
  D.originPoints = { koy: 22, akademi: 16, gurbetci: 20, mahalle: 24, miras: 18, gec: 26, balikci: 22, sakat: 16, universite: 24, futsal: 22, avrupa_akademi: 18, deneme: 26, kaleci_mahallesi: 24 };
  D.allocMax = 8; // bir yeteneğe en fazla
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
(function (root) {
  /* ---------- Sezon hedefleri: 12'den 30'a ----------
     test(st, S): sezon sonunda kontrol edilir. show(S): o sezon seçilebilir mi (ör. mevki değiştirmiş olmak). */
  const F = root.F, D = F.DATA;
  const G = (id, name, test, reward, extra) => Object.assign({ id, name, test, reward }, extra || {});
  D.goals.push(
    G('gol3df', '3 gol at', (st) => st.goals >= 3, { moral: 10, 'r.taraftar': 5 }, { pos: ['DF'] }),
    G('asist12', '12 asist yap', (st) => st.assists >= 12, { moral: 12, 'r.takim': 8 }, { pos: ['OS', 'FV'] }),
    G('asistdf', '5 asist yap', (st) => st.assists >= 5, { moral: 10, 'r.hoca': 5 }, { pos: ['DF'] }),
    G('clean15', '12 maçta gol yeme', (st) => st.clean >= 12, { moral: 12, sohret: 4 }, { pos: ['KL'] }),
    G('mac35', '30 maçta forma giy', (st) => st.apps >= 30, { moral: 10, 'r.hoca': 6 }),
    G('not75', 'Sezon ortalaması 7.5+', (st) => st.apps >= 15 && st.ratingSum / st.apps >= 7.5, { moral: 12, sohret: 6 }),
    G('motm5', '5 maçta 8+ not al', (st) => (st.motm || 0) >= 5, { moral: 10, sohret: 4 }),
    G('wins20', 'Oynadığın 15 maçı kazan', (st) => (st.wins || 0) >= 15, { moral: 10, 'r.takim': 6 }),
    G('derbigol', 'Derbide gol at', (st) => (st.derbyGoals || 0) >= 1, { 'r.taraftar': 10, sohret: 3 }, { pos: ['FV', 'OS'] }),
    G('brace3', '3 maçta en az 2 gol at', (st) => (st.braces || 0) >= 3, { moral: 10, sohret: 5 }, { pos: ['FV'] }),
    G('ovr5', 'Gücünü 5 puan artır', (st) => st.ovrStart != null && F.ovr() - st.ovrStart >= 5, { mental: 6, moral: 6 }),
    G('sohret15', 'Şöhretini 15 artır', (st, S) => st.sohretStart != null && S.P.life.sohret - st.sohretStart >= 15, { 'takipci%': 5, moral: 6 }),
    G('hoca60', 'Hocayla ilişkini 50’nin üstüne çıkar', (st, S) => (F.relGet('hoca') || 0) >= 50, { moral: 8, disiplin: 4 }),
    G('taraftar60', 'Taraftarın sevgilisi ol (60+)', (st, S) => (F.relGet('taraftar') || 0) >= 60, { sohret: 4, moral: 8 }),
    G('sari5', 'Sezonu 5’ten az sarı kartla bitir', (st) => st.apps >= 15 && (st.yellows || 0) < 5, { disiplin: 6, 'r.hoca': 4 }),
    G('dil60', 'Yabancı dilini 60’a çıkar', (st, S) => S.P.dil >= 60, { 's.konusma': 3, mental: 4 }, { show: (S) => S.P.dil < 55 }),
    G('mevkiuyum', 'Yeni mevkine tam alış (%90 uyum)', (st, S) => F.roleFit(F.curRole()) >= 0.9, { 'r.hoca': 8, moral: 6 }, { show: (S) => F.curRole() !== S.P.role && F.roleFit(F.curRole()) < 0.9 }),
    G('kaptan', 'Kaptanlık bandını tak', (st, S) => !!S.flags.kaptan, { 's.liderlik': 4, moral: 8 }, { show: (S) => !S.flags.kaptan && S.P.age >= 22 })
  );
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) {
  // Memleket seçiminde, yer listesinde olmayan büyük şehirler (kulüpleri özel tanımlı)
  const D = root.F.DATA;
  D.homePlaces = D.places.concat([{ name: 'İstanbul', region: 'MAR', size: 1, province: 'İstanbul' }, { name: 'Trabzon', region: 'KAR', size: 1, province: 'Trabzon' }].filter((x) => !D.places.some((p) => p.name === x.name)));
})(typeof window !== 'undefined' ? window : globalThis);
