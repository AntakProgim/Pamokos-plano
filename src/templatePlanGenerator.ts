// Pedagoginių šablonų generatorius pagal Lietuvos Bendrąsias programas (BP)
// Veikia 100% nepriklausomai nuo DI ir be jokių API raktų

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
    stageDurations = { introduction: 5, theory: 15, practice: 15, consolidation: 5, summary: 5 }
  } = params;

  // Formuojame SMART tikslą
  const smartGoal = goal && goal.trim().length > 0 
    ? goal.trim()
    : `Mokiniai, išnagrinėję temą „${topic}“, gebės paaiškinti esmines sąvokas, savarankiškai bei bendradarbiaudami atlikti praktines užduotis ir įsivertinti pasiekimus bent 70% tikslumu.`;

  // Kompetencijos
  const competencies = "Pažinimo kompetencija (kritinis mąstymas, problemų sprendimas), komunikavimo kompetencija (aiškus minčių reiškimas), skaitmeninė ir pilietinė kompetencijos.";

  // Oficialios BP sąsajos
  const bpConnections = `Planuojamas ugdymas atitinka atnaujintų Bendrųjų programų (BP) ${subject} ${grade} pasiekimų sritį. Ugdomi gebėjimai tyrinėti, analizuoti, taikyti žinias kontekstinėse situacijose bei reflektuoti mokymosi procesą.`;

  // Vertinimo kriterijai
  const criteriaText = evaluationCriteria && evaluationCriteria.trim().length > 0
    ? evaluationCriteria.trim()
    : `Mokinys teisingai atlieka bent 70% pamokos užduočių, aktyviai dalyvauja diskusijoje ir geba paaiškinti savo sprendimo eigą.`;

  const evaluationMethods = selectedEvaluations.length > 0 
    ? selectedEvaluations 
    : ["Formuojamasis vertinimas", "Savarankiškas darbas", "Refleksija"];

  // Pamokos eigos etapai
  let introduction = `Pamokos pradžia, temos ir SMART tikslo paskelbimas. Mokinių sudominimas (trumpas probleminis klausimas arba vaizdo intarpas). Ankstesnių žinių apie „${topic}“ aktyvinimas (pvz., mintžių lietus).`;
  let theory = `Naujos medžiagos nagrinėjimas: pagrindinės sąvokos, taisyklės ir praktiniai pavyzdžiai. Interaktyvi demonstracija, mokytojo vedamas modeliavimas ir mokinių įtraukimas per tikslinius klausimus.`;
  let practice = activities && activities.trim().length > 0 
    ? activities.trim() 
    : `Praktinis žinių taikymas: mokiniai sprendžia užduotis, atlieka tekstų arba duomenų analizę, dirba diferencijuotose grupėse ar porose pagal pasirengimo lygį.`;
  let consolidation = `Žinių įtvirtinimas ir greitasis patikrinimas: trumpa viktorina (Kahoot / Quizizz) arba užduotys ant mini lentelių. Tipinių klaidų aptarimas.`;
  let summary = `Pamokos refleksija ir apibendrinimas: „3-2-1“ metodas (3 dalykai, kuriuos išmokau, 2 klausimai, 1 idėja). Įsivertinimas ir grįžtamasis ryšys.`;

  if (isOutsideInput) {
    introduction = `Saugaus elgesio instruktažas ir atvykimas į vietą (${outsideLocation || 'edukacinę erdvę'}). Tikslo (${outsideGoal || 'patirtinis mokymasis'}) pristatymas.`;
    practice = `Tiesioginis aplinkos tyrinėjimas, duomenų rinkimas, stebėjimas ir užduočių lapų pildymas edukacinėje erdvėje.`;
    summary = `Surinktų duomenų pirminis aptarimas, patirtinė refleksija ir grįžimas į mokyklą.`;
  }

  // Veiklos klasėje
  const classActivities = {
    individual: `Savarankiškas temos „${topic}“ pagrindinių užduočių atlikimas pratybose ar darbo lape. Kiekvienas mokinys dirba pagal savo tempą, naudodamasis pateiktomis gairėmis.`,
    pairs: `Darbas porose: tarpusavio tikrinimas (Peer Review) ir diskusija apie pasirinktą sprendimo būdą. Mokiniai vienas kitam paaiškina sudėtingesnius temos aspektus.`,
    group: `Grupelėse po 3–4 mokinius kuriamas mini pristatymas, plakatas arba problemos sprendimo schema, kuri pristatoma visai klasei.`,
    toolsResources: selectedResources.length > 0 
      ? selectedResources.join(', ') 
      : "Vadovėlis, darbo lapai, lenta, interaktyvus ekranas"
  };

  const individualWork = `Diferencijuotos užduotys iš temos „${topic}“: 1–3 lygio pratimai su atsakymų pasitikrinimo galimybe.`;

  // Diferencijavimas (Gabūs, Vidutiniai, Sunkumų turintys)
  const differentiation = {
    gifted: `Atviro tipo probleminės ir kūrybinės užduotys (Bloom taksonomijos analizės bei sintezės lygis). Skatinama kurti savo uždavinius, ieškoti alternatyvių sprendimų ar padėti bendraklasiams kaip konsultantams.`,
    general: `Standartinės BP užduotys žinioms įtvirtinti ir supratimui patikrinti (pritaikymas praktikoje, schemų pildymas, sąvokų taikymas).`,
    struggling: `Užduotys su pagalbinėmis priemonėmis: atraminės lentelės, pavyzdžiai žingsnis po žingsnio, sąvokų žodynėlis, mažesnės apimties užduotys ir individuali mokytojo pagalba.`
  };

  // Namų darbai
  const homework = {
    purpose: `Užtvirtinti pamokoje įgytas žinias apie temą „${topic}“ ir pasiruošti kitai pamokai.`,
    gifted: `Kūrybinis ar mini tyrimo darbas: rasti papildomą pavyzdį kasdieniame gyvenime arba parengti 3 klausimus klasei.`,
    general: `Vadovėlio / pratybų baziniai pratimai (pvz., 1–3 uždaviniai ar teksto pastraipos analizė).`,
    struggling: `Trumpa pagrindinių sąvokų pakartojimo užduotis su paruoštu pavyzdžiu.`
  };

  // Skaitmeniniai resursai
  const digitalResources = selectedResources.length > 0
    ? `Rekomenduojami skaitmeniniai įrankiai: ${selectedResources.join(', ')}.`
    : `Skaitmeniniai šaltiniai: eMokykla.lt skaitmeninė biblioteka, interaktyvios užduotys (Kahoot, Wordwall, Quizizz), vaizdo medžiaga YouTube.`;

  // Įrašas el. dienynui (TAMO / Eduka / Mano Dienynas)
  const eDiaryEntry = {
    topicClassworkExpectations: `${topic}. Temos nagrinėjimas, sąvokų įtvirtinimas ir praktinės užduotys.`,
    homework: `Pakartoti pamokos medžiagą apie „${topic}“ ir atlikti nurodytus pratimus.`,
    individualHomework: `Papildomos užduotys pagal mokinio individualų mokymosi planą.`,
    notes: isIntegratedInput ? `Integruota pamoka (${integrationDetails || 'su kitu dalyku'}).` : '',
    isIntegrated: !!isIntegratedInput,
    isOutside: !!isOutsideInput,
    eDiaryLessonType: lessonType || 'Dalykinė pamoka'
  };

  return {
    generalNotes: `Pamoka suformuota pagal Lietuvos Bendrąsias programas (${subject}, ${grade}).`,
    lessonType: lessonType || 'Įtvirtinimo',
    bpConnections,
    lessonOverview: {
      topic,
      goal: smartGoal,
      competencies,
      evaluation: {
        methods: evaluationMethods,
        criteria: criteriaText
      }
    },
    tasks: {
      general: `Pagrindinės užduotys temai „${topic}“ įsisavinti.`,
      highLevel: `Analitinės ir probleminės užduotys gilesniam temos supratimui.`,
      mainLevel: `Bazinės praktinės užduotys pagal BP pasiekimų lygius.`
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
    digitalResources,
    homework,
    eDiaryEntry,
    specialAdvice: "Stebėti mokinių įsitraukimą praktinėje dalyje ir prireikus koreguoti užduočių tempą.",
    consultationAdvice: "Mokiniams, kuriems kilo klausimų, skirti 5 min. konsultaciją po pamokos arba individualaus darbo metu.",
    motivation: `„Kiekvienas žingsnis į priekį mokantis temos „${topic}“ atveria naujų gebėjimų!“`,
    stageDurations
  };
}
