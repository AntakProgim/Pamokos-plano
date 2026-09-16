// Išsamus pedagoginis generatorius su gausiomis galimybėmis ir praktinėmis alternatyvomis
// Pagal Lietuvos Bendrąsias programas (BP)

export interface GenerateTemplateParams {
  subject: string;
  grade: string;
  topic: string;
  lessonType: string;
  goal?: string;
  activities?: string;
  selectedResources?: string[];
  selectedEvaluations?: string[];
  evaluationCriteria?: string;
  isIntegratedInput?: boolean;
  integrationDetails?: string;
  isOutsideInput?: boolean;
  outsideLocation?: string;
  outsideGoal?: string;
  stageDurations?: Record<string, number>;
  selectedStudentLevels?: string[];
}

export function buildPedagogicalPlan(params: GenerateTemplateParams) {
  const {
    subject,
    grade,
    topic,
    lessonType,
    goal,
    activities,
    selectedResources = [],
    selectedEvaluations = [],
    evaluationCriteria,
    isIntegratedInput,
    integrationDetails,
    isOutsideInput,
    outsideLocation,
    outsideGoal,
    stageDurations = { introduction: 5, theory: 10, practice: 20, consolidation: 5, summary: 5 },
    selectedStudentLevels = ['pažengę', 'vidutiniai', 'turintys sunkumų']
  } = params;

  const currentTopic = topic.trim();
  const currentSubject = subject.trim();
  const currentGrade = grade.trim();

  // 1. Išsamus SMART pamokos uždavinys su kriterijais
  const smartGoal = goal && goal.trim().length > 0 
    ? goal.trim()
    : `Išnagrinėję temą „${currentTopic}“, mokiniai gebės:
1. Teisingai paaiškinti ir vartoti pagrindines sąvokas bei taisykles kontekste.
2. Savarankiškai bei porose išspręsti/išanalizuoti bent 3 praktines užduotis.
3. Įsivertinti savo pasiekimus pagal pateiktus sėkmės kriterijus (bent 70% tikslumu).`;

  // 2. Kompetencijos su konkrečiomis raiškos galimybėmis
  const competencies = `• Pažinimo kompetencija: kritinis mąstymas, priežasties-pasekmės ryšių paieška, duomenų lyginimas ir problemų sprendimas.
• Komunikavimo kompetencija: argumentuotas savo sprendimo paaiškinimas poroje (Peer Review), terminų taisyklingumas.
• Skaitmeninė kompetencija: interaktyvių įrankių (Quizizz/Kahoot/Canva/Padlet) naudojimas žinių pasitikrinimui ar idėjų vizualizavimui.
• Pilietiškumo ir socialinė-emocinė: pagarbus bendradarbiavimas, atsakomybės pasidalijimas komandoje.`;

  // 3. Sąsajos su atnaujintomis BP (Lietuvos Bendrosiomis programomis)
  const bpConnections = `Pamoka orientuota į atnaujintos ${currentSubject} ${currentGrade} bendrosios programos pasiekimų sritį:
- Žinios ir supratimas: esminių temos „${currentTopic}“ dėsningumų bei struktūros įsisavinimas.
- Praktinis taikymas: gebėjimas panaudoti teorines žinias sprendžiant standartines ir kontekstines užduotis.
- Aukštesnieji mąstymo gebėjimai: analizė, vertinimas ir kūrybinis žinių pritaikymas (Bloom taksonomija).
- Mokėjimas mokytis: refleksija „3-2-1“ ir savo mokymosi spragų identifikavimas.`;

  // 4. Vertinimo kriterijai ir galimybės
  const criteriaText = evaluationCriteria && evaluationCriteria.trim().length > 0
    ? evaluationCriteria.trim()
    : `Sėkmės kriterijai mokiniui („Aš gebėsiu“):
✔ Slenkstinis lygis: žinau esminę taisyklę/apibrėžimą ir atlieku bazinį pavyzdį su pagalba.
✔ Pagrindinis lygis: savarankiškai atlieku užduotis, randu dėsningumus, paaiškinu atsakymą bendraklasiui.
✔ Aukštesnysis lygis: gebu išspręsti nestandartinę probleminę situaciją, pagrįsti argumentais ir pakonsultuoti kitus.`;

  const evaluationMethods = selectedEvaluations.length > 0 
    ? selectedEvaluations 
    : ["Formuojamasis vertinimas pamokos eigoje", "Tarpusavio vertinimas (Peer Review) porose", "Greitasis įsivertinimas (šviesoforo / mini testuko metodas)"];

  // 5. Išsamūs pamokos eigos etapai su didelėmis pasirinkimo galimybėmis
  const introduction = `1. Temos „${currentTopic}“ ir laukiamo rezultato pristatymas („Ko išmoksime šiandien?“).
2. Dėmesio sužadinimas / intriga (galimybės mokytojui pasirinkti):
   • A variantas: Probleminis klausimas iš kasdienio gyvenimo ar netikėtas faktas.
   • B variantas: Trumpas vaizdo intarpas (1–2 min.) arba provokuojantis teiginys „Tiesa ar mitas?“.
   • C variantas: „Mintžių lietus“ (Brainstorming) ant lentos arba Mentimeter/Padlet lentoje.
3. Ankstesnių žinių aktyvinimas: greita 3 klausimų blitz-apklausa.`;

  const theory = `Naujos medžiagos tyrinėjimas ir modeliavimas:
1. Pagrindinės sąvokos, taisyklės ir schemos demonstravimas ekrane/lentoje.
2. Mokytojo atliekamas pavyzdžio demonstravimas balsu mąstant (Think-Aloud metodas) – parodomas sėkmingas žingsnis po žingsnio algoritmas.
3. Įtraukiantis tikrinimas: mokiniai pirštais arba signalinėmis kortelėmis parodo savo pritarimą/atsakymą, kad visi būtų įtraukti.`;

  const practice = activities && activities.trim().length > 0 
    ? `${activities.trim()}\n\nPraktinės eigos galimybės:\n• Darbas stotelėmis (Station Rotation) arba diferencijuoti užduočių paketai.\n• Mokiniai renkasi užduoties atlikimo formatą: skaitmeniniu būdu, sąsiuvinyje arba ant mini lentelių.\n• Mokytojas atlieka konsultanto vaidmenį, teikia greitą grįžtamąjį ryšį (Micro-feedback).`
    : `Diferencijuotas praktinis žinių taikymas (3 etapais):
1. Treniravimasis su pagalba: 1–2 užduotys atliekamos kartu su suolo draugu arba pagal paruoštą pavyzdį.
2. Savarankiška praktika: mokiniai atlieka bazinius pratimus pagal savo tempą.
3. Gilinamoji / kūrybinė veikla: mokiniai, atlikę greičiau, sprendžia probleminį iššūkį arba kuria savo užduotį draugui.`;

  const consolidation = `Žinių įtvirtinimas ir operatyvus patikrinimas:
• Galimybė A: 5 min. interaktyvi viktorina (Kahoot / Quizizz / Wordwall) su momentiniais rezultatais.
• Galimybė B: „Vieno sakinio apibendrinimas“ – mokinys parašo pagrindinę pamokos mintį ant lipnaus lapelio.
• Galimybė C: Tipinių klaidų analizė – mokytojas lentoje parodo sąmoningai padarytą klaidą, mokiniai ją suranda ir pataiso.`;

  const summary = `Refleksija ir asmeninis įsivertinimas:
• Metodas „3-2-1“: 3 svarbiausi dalykai, kuriuos sužinojau apie „${currentTopic}“, 2 klausimai, kurie dar kilo, 1 idėja, kaip tai panaudosiu.
• Įsivertinimas šviesoforo principu (žalia – viską supratau, geltona – dar reikia pasikartoti, raudona – buvo sunku).
• Kitų žingsnių ir namų darbų gairių aptarimas.`;

  // 6. Veiklos klasėje su gausiomis galimybėmis
  const classActivities = {
    individual: `• Savarankiškas užduočių atlikimas pasirinktu tempu (galimybė rinktis iš A lygio - bazinio arba B lygio - pažangesnio).
• Savikontrolės lapo pildymas (atsakymų pasitikrinimas pagal kontrolinį etaloną).
• Konspekto ar vaizdinės schemos (Mind Map) pildymas.`,
    pairs: `• Metodas „Pagalvok – Pasitark su porininku – Pasidalink su klase“ (Think-Pair-Share).
• Tarpusavio vertinimas (Peer Review): mokiniai apsikeičia darbais ir pagal 2 kriterijus parašo vieną pagyrimą ir vieną patarimą.
• Bendras problemos sprendimas diskutuojant apie skirtingus požiūrio taškus.`,
    group: `• 3–4 mokinių komandinis projektas: sukurti mini plakatą (popieriuje arba Canva), suklasifikuoti pavyzdžius ar išspręsti situacinį uždavinį.
• Rolinis darbas: kiekvienas narys turi atsakomybę (tyrėjas, raštininkas, laiko prižiūrėtojas, pranešėjas).
• „Idėjų mugė“: grupių atstovai pereina prie kitų komandų susipažinti su jų sprendimais.`,
    toolsResources: selectedResources.length > 0 
      ? selectedResources.join(', ') + ' | Vadovėliai, pratybų lapai, interaktyvi lenta, skaitmeniniai įrenginiai.'
      : "Vadovėliai, užduočių lapai, interaktyvus ekranas, moksleivių išmanieji telefonai arba planšetės (Kahoot / Quizizz / Canva)."
  };

  const individualWork = `1. Bazinis lygis: 3 esminės užduotys taisyklei ar algoritmui įtvirtinti (su užuominomis).
2. Standartinis lygis: 4–5 pratimai, reikalaujantys savarankiško kontekstinio sprendimo.
3. Kūrybinis / Tyrimo lygis: alternatyvi užduotis – sukurti savo pavyzdį, situacinį klausimą arba trumpą vizualią instrukciją kitiems.`;

  // 7. Diferencijavimas trims lygiams su praktiniais patarimais
  const differentiation = {
    gifted: `• Galimybė atlikti „Eksperto / Asistento“ vaidmenį: padėti bendraklasiams arba atsakyti į probleminius klausimus.
• Kūrybinės užduotys (Bloom taksonomijos viršūnė): kurti analogijas, ieškoti klaidų sudėtinguose pavyzdžiuose, atlikti mini tyrimą.
• Alternatyva: nestandartinis uždavinys, olimpiadinis klausimas arba tarpdalykinis ryšys.`,
    general: `• Pilnas BP reikalavimų pasiekimas: standartinės užduotys su palaipsniui didėjančiu sudėtingumu.
• Porinis darbas sprendžiant kilusius neaiškumus.
• Praktiniai pavyzdžiai, siejantys teoriją su realiu gyvenimu ir praktine nauda.`,
    struggling: `• Užduočių skaidymas mažais žingsneliais (Step-by-step).
• Pagalbinės priemonės: atraminių žodžių / taisyklių kortelės, sąvokų žodynėlis, išspręstas pavyzdinis algoritmas.
• Mokytojo palaikymas: periodinis priėjimas, padrąsinimas ir nukreipiamieji klausimai (scaffolding).`
  };

  // 7a. Konkrečios diferencijuotos užduotys trims grupėms (pagal BP ir Bloom taksonomiją)
  const differentiatedTasks = {
    advanced: `• Gilinamasis iššūkis (Bloom: Kūrimas ir sintezė): Išanalizuoti nestandartinę probleminę temos „${currentTopic}“ situaciją, rasti priežastinius ryšius bei galimas išimtis iš taisyklių.
• Kūrybinė veikla: Parengti originalų praktinį uždavinį, situacinį testą ar vaizdinį algoritmą bendraklasiams.
• Bendradarbiavimo vaidmuo: Atlikti „Eksperto / Asistento“ funkciją – teikti konstruktyvų grįžtamąjį ryšį (Peer Review) ir argumentuotai paaiškinti sprendimą.`,
    average: `• Standartinis pritaikymas (Bloom: Supratimas ir taikymas): Atlikti 4–5 pagrindinio lygio pratimus temai „${currentTopic}“ įtvirtinti pagal pamokoje nagrinėtą algoritmą.
• Darbas poroje: Išnagrinėti kontekstinę situaciją kartu su suolo draugu metodu „Pagalvok – Pasitark – Pasidalink“.
• Savikontrolė: Pasitikrinti atsakymus pagal pateiktą etaloną ir savarankiškai ištaisyti pastebėtas klaidas.`,
    struggling: `• Struktūruota bazinė užduotis (Bloom: Žinojimas ir atpažinimas): Atlikti 2–3 bazines užduotis, suskaidytas į mažus žingsnelius su dalinai užpildytu pavyzdžiu (šablonu).
• Atraminės priemonės: Naudotis sąvokų/taisyklių kortele, atraminiais žodžiais ir vizualia eigos schema.
• Mokytojo / asistento parama: Užduotį atlikti su periodiniu palaikymu ir nukreipiamaisiais klausimais (scaffolding).`
  };

  // 7b. Diferencijuoti vertinimo ir įsivertinimo būdai kiekvienai grupei
  const differentiatedAssessment = {
    advanced: `• Vertinimo metodas: Kriterinis vertinimas pagal aukštesniojo lygio pasiekimų deskriptorius (argumentacijos aiškumas, savarankiškumas, kūrybinis sprendimas).
• Įsivertinimas: Refleksijos klausimas „Kokius dėsningumus atradau temoje „${currentTopic}“ ir kaip juos pritaikysiu kitose disciplinose?“.
• Grįžtamasis ryšys: Mokytojo skatinantis komentaras gilesniam tyrinėjimui ir alternatyvių sprendimų paieškai.`,
    average: `• Vertinimo metodas: Formuojamasis vertinimas pagal aiškius sėkmės kriterijus („Aš gebu...“ – atlikta bent 70–80% užduočių be esminių klaidų).
• Įsivertinimas: Šviesoforo metodas (žalia / geltona / raudona) ir trumpas 3 klausimų žinių pasitikrinimas (Quizizz arba ant lentelių).
• Grįžtamasis ryšys: Tarpusavio vertinimas porose ir mokytojo korekciniai patarimai.`,
    struggling: `• Vertinimo metodas: Padrąsinamasis formuojamasis vertinimas, fiksuojant asmeninę pažangą ir pastangas (be neigiamo streso dėl klaidų).
• Įsivertinimas: Žingsninis kontrolinis sąrašas (Checklist): 3 trumpi teiginiai apie tai, ką pavyko atlikti sėkmingai.
• Grįžtamasis ryšys: Momentinis žodinis mokytojo palaikymas realiu laiku už kiekvieną atliktą žingsnį.`
  };

  // 8. Namų darbai su pasirinkimo galimybe
  const homework = {
    purpose: `Įtvirtinti pamokoje „${currentTopic}“ įgytus gebėjimus, ugdant savarankiškumą ir asmeninę atsakomybę.`,
    gifted: `Pasirinktinai: parengti 3 probleminius klausimus kitos pamokos viktorinai arba rasti realų pavyzdį žiniasklaidoje / aplinkoje.`,
    general: `Atlikti 2–3 pratimus iš vadovėlio ar darbo lapo, pakartoti pagrindines sąvokas.`,
    struggling: `Užbaigti klasėje pradėtą bazinę užduotį naudojantis pamokoje pateiktu pavyzdžiu ar atmintine.`
  };

  // 9. Skaitmeniniai resursai su konkrečiomis nuorodomis
  const digitalResources = selectedResources.length > 0
    ? `Parinkti įrankiai: ${selectedResources.join(', ')}.\nPapildomi šaltiniai: eMokykla.lt skaitmeninė saugykla, Eduka klasė, EMA pratybos, vaizdinė medžiaga YouTube, interaktyvūs testai (Wordwall, Quizizz, Kahoot).`
    : `• eMokykla.lt atnaujintų Bendrųjų programų metodinė medžiaga ir skaitmeniniai ištekliai.
• Interaktyvūs įrankiai greitam patikrinimui: Quizizz, Kahoot, Wordwall.
• Bendradarbiavimo ir vizualizavimo priemonės: Canva plakatams, Miro / Padlet lentos.
• Edukaciniai vaizdo įrašai: LRT mediateka, Youtube edukaciniai kanalai.`;

  // 10. El. dienyno įrašas (optimizuota „Mano dienynas“, TAMO ir Eduka sistemoms)
  const eDiaryEntry = {
    topicClassworkExpectations: `${currentTopic}. Sąvokų ir taisyklių nagrinėjimas, diferencijuotos praktinės užduotys, darbas porose ir pasiekimų įsivertinimas.`,
    homework: `Pakartoti temą „${currentTopic}“ ir atlikti nurodytus pratimus (arba pasirinktą diferencijuotą užduotį).`,
    individualHomework: `Individualios pagalbinės arba gilinamosios užduotys pagal mokinio poreikius.`,
    notes: isIntegratedInput ? `Integruota pamoka (${integrationDetails || 'su kitu dalyku'}).` : 'Mokiniai aktyviai įsitraukė į praktines veiklas, atliko refleksiją.',
    isIntegrated: !!isIntegratedInput,
    isOutside: !!isOutsideInput,
    eDiaryLessonType: lessonType || 'Dalykinė pamoka'
  };

  return {
    generalNotes: `Išsamus pamokos planas su pedagoginėmis alternatyvomis (${currentSubject}, ${currentGrade}).`,
    lessonType: lessonType || 'Įtvirtinimo',
    bpConnections,
    lessonOverview: {
      topic: currentTopic,
      goal: smartGoal,
      competencies,
      evaluation: {
        methods: evaluationMethods,
        criteria: criteriaText
      }
    },
    tasks: {
      general: `Pagrindinės diferencijuotos užduotys temai „${currentTopic}“ įsisavinti.`,
      highLevel: `Probleminiai ir analitiniai iššūkiai aukštesniajam lygiui.`,
      mainLevel: `Bazinės praktinės užduotys pagal atnaujintų BP pasiekimų lygius.`
    },
    classActivities,
    individualWork,
    lessonStages: {
      introduction,
      theory,
      practice,
      consolidation,
      summary
    },
    differentiation,
    differentiatedTasks,
    differentiatedAssessment,
    targetLevels: selectedStudentLevels,
    digitalResources,
    homework,
    eDiaryEntry,
    specialAdvice: "Pasiūlykite mokiniams rinktis užduoties atlikimo lygį ar būdą (poroje ar savarankiškai) – tai didina motyvaciją ir atsakomybę.",
    consultationAdvice: "Mokiniams, kuriems kilo klausimų praktikos metu, organizuoti 3 min. mini konsultaciją prie atskiros lentos.",
    motivation: `„Kiekvienas šiandien žengtas žingsnis temoje „${currentTopic}“ ugdo pasitikėjimą savo gebėjimais!“`,
    stageDurations
  };
}
