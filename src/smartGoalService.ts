import { BLOOM_LEVELS, BloomLevel } from './bloomData';

export interface SmartGoalBreakdown {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}

export interface DifferentiatedVariants {
  struggling: string;
  average: string;
  advanced: string;
}

export interface SmartGoalResult {
  mainGoal: string;
  bloomLevelName: string;
  bloomVerb: string;
  smartBreakdown: SmartGoalBreakdown;
  differentiatedVariants: DifferentiatedVariants;
  successCriteria: string[];
}

export interface GenerateSmartGoalParams {
  subject: string;
  topic: string;
  grade?: string;
  bloomLevelId?: string;
  focusMethod?: string;
}

// Pedagoginis atsarginis generatorius (veikia neprisijungus arba be API rakto)
export function generateSmartGoalPedagogical(params: GenerateSmartGoalParams): SmartGoalResult {
  const subject = params.subject.trim() || 'Bendrasis ugdymas';
  const topic = params.topic.trim() || 'Pamokos tema';
  const grade = params.grade?.trim() || '';
  const gradePrefix = grade ? `${grade} klasės mokiniai` : 'Mokiniai';
  const levelId = params.bloomLevelId || 'applying';

  // Nustatome Bloom lygį
  const foundLevel = BLOOM_LEVELS.find(l => l.id === levelId) || BLOOM_LEVELS[2]; // Default: Applying
  const verbs = foundLevel.verbs;
  const primaryVerb = verbs[0] || 'pritaikyti';
  const secondaryVerb = verbs[1] || 'paaiškinti';

  let mainGoal = '';
  let specificDesc = '';
  let measurableDesc = '';
  let achievableDesc = '';
  let relevantDesc = '';
  let timeBoundDesc = 'Iki pamokos pabaigos (45 min. cikle).';
  let strugglingVariant = '';
  let averageVariant = '';
  let advancedVariant = '';
  let criteria: string[] = [];

  switch (foundLevel.id) {
    case 'remembering':
      mainGoal = `${gradePrefix} gebės taisyklingai ${primaryVerb} ir ${secondaryVerb} bent 4 pagrindines temos „${topic}“ sąvokas bei taisykles be klaidų.`;
      specificDesc = `Aiškiai apibrėžtos temos „${topic}“ bazinės sąvokos, terminai bei faktai.`;
      measurableDesc = 'Bent 4 sąvokos arba taisyklės teisingai atgamintos užduočių lape.';
      achievableDesc = 'Užduotis pritaikyta pradžiai ir nereikalauja sudėtingų išankstinių žinių.';
      relevantDesc = `Sudaro pamatą ${subject} Bendrosios programos reikalavimams pasiekti.`;
      strugglingVariant = `Su vaizdine atramine lentele ar žodynėliu įvardyti bent 2 pagrindinius temos elementus.`;
      averageVariant = `Savarankiškai įvardyti ir atpažinti 3–4 pagrindines temos sąvokas pateiktuose pavyzdžiuose.`;
      advancedVariant = `Tiksliai įvardyti visas temos sąvokas ir savarankiškai suformuluoti jų apibrėžimus savais žodžiais.`;
      criteria = [
        `Žinau ir galiu teisingai perskaityti temos „${topic}“ terminus.`,
        'Atpažįstu sąvokas pateiktame tekste ar iliustracijoje.',
        'Galiu be pagalbos išvardyti bent 3 svarbiausius faktus.'
      ];
      break;

    case 'understanding':
      mainGoal = `${gradePrefix} gebės savais žodžiais ${primaryVerb} temos „${topic}“ esmę ir pateikti bent 2 savarankiškus pavyzdžius, iliustruojančius šį dėsningumą.`;
      specificDesc = `Temos „${topic}“ esmės, priežasčių ir reikšmės suvokimas be mechaninio atkartojimo.`;
      measurableDesc = 'Bent 2 originalūs, savarankiškai parinkti pavyzdžiai arba paaiškinimas poroje.';
      achievableDesc = 'Mokiniai jau susipažinę su pagrindinėmis sąvokomis ir gali jas susieti.';
      relevantDesc = `Užtikrina giluminį ${subject} dėsningumų suvokimą pagal atnaujintas BP.`;
      strugglingVariant = `Pagal pagalbinius klausimus paaiškinti vieną pavyzdį ir atskirti esminį požymį.`;
      averageVariant = `Savais žodžiais paaiškinti temą ir iliustruoti 2 praktiniais pavyzdžiais.`;
      advancedVariant = `Apibendrinti temą, rasti analogijų su anksčiau nagrinėtais reiškiniais ir paaiškinti draugui.`;
      criteria = [
        `Galiu savais žodžiais paaiškinti, ką reiškia „${topic}“.`,
        'Gebu pateikti bent 2 teisingus pavyzdžius iš savo patirties ar aplinkos.',
        'Moku atsakyti į klausimą „kodėl taip vyksta?“.'
      ];
      break;

    case 'analyzing':
      mainGoal = `${gradePrefix} gebės ${primaryVerb} pateiktą medžiagą apie „${topic}“, nustatyti bent 3 priežastinius ryšius arba dėsningumus ir argumentuotai palyginti alternatyvas.`;
      specificDesc = `Struktūruota temos „${topic}“ šaltinių, duomenų ar situacijų dekonstrukcija.`;
      measurableDesc = 'Bent 3 pagrįsti priežastiniai ryšiai arba užpildyta lyginamoji schema (Venno diagrama).';
      achievableDesc = 'Analizei pateikiama aiški struktūra, schema arba nukreipiamieji klausimai.';
      relevantDesc = `Formuoja kritinį mąstymą, faktų atskyrimą nuo nuomonių ${subject} pamokose.`;
      strugglingVariant = `Pagal pateiktą schemą palyginti du paprastus objektus ir rasti 2 panašumus bei 1 skirtumą.`;
      averageVariant = `Išanalizuoti situaciją ir nustatyti 3 priežastinius ryšius tarp nagrinėjamų veiksnių.`;
      advancedVariant = `Kritiškai išanalizuoti prieštaringus duomenis, rasti dėsningumus ir pagrįsti savo išvadas.`;
      criteria = [
        `Gebu išskirti nagrinėjamo reiškinio dalis ir nustatyti priežastis bei pasekmes.`,
        'Galiu palyginti du požiūrius ar šaltinius pagal bendrus kriterijus.',
        'Moku atskirti patikrintus faktus nuo subjektyvių nuomonių.'
      ];
      break;

    case 'evaluating':
      mainGoal = `${gradePrefix} gebės ${primaryVerb} temos „${topic}“ sprendimą ar šaltinį pagal 3 nurodytus kriterijus ir apginti savo vertinimą 2 svariomis argumentų eilutėmis.`;
      specificDesc = `Kriterinis vertinimas, sprendimų pagrindimas ir refleksija temoje „${topic}“.`;
      measurableDesc = '3 kriterijai vertinimo rubrikoje ir bent 2 logiškai apginti argumentai.';
      achievableDesc = 'Pateikiami aiškūs vertinimo kriterijai ir diskusijos taisyklės.';
      relevantDesc = `Užtikrina atnaujintų BP pilietiškumo bei kritinio mąstymo kompetencijų ugdymą.`;
      strugglingVariant = `Pagal kontrolinį sąrašą (Checklist) įsivertinti savo atliktą darbą ir nurodyti 1 taisytiną vietą.`;
      averageVariant = `Pagal 3 kriterijus įvertinti bendraklasio darbą (Peer Review) ir pateikti konstruktyvų komentarą.`;
      advancedVariant = `Kritiškai įvertinti pateiktą problemos sprendimą, argumentuoti alternatyvą ir numatyti ilgalaikes pasekmes.`;
      criteria = [
        'Vertindamas remiuosi aiškiais kriterijais, o ne asmeninėmis emocijomis.',
        'Galiu pagrįsti savo vertinimą bent dviem argumentais.',
        'Moku pasiūlyti konkretų patobulinimo būdą.'
      ];
      break;

    case 'creating':
      mainGoal = `${gradePrefix} gebės ${primaryVerb} originalų temos „${topic}“ produktą ar sprendimo modelį, apimantį bent 3 integruotus elementus ir atitinkantį nustatytus reikalavimus.`;
      specificDesc = `Naujo produkto, plano, teksto, modelio ar alternatyvos sukūrimas temoje „${topic}“.`;
      measurableDesc = 'Sukurtas baigtas produktas (schema, projektas, tekstas, plakatas) su 3 privalomais elementais.';
      achievableDesc = 'Laikas ir priemonės subalansuoti pamokos praktinei daliai (20–25 min.).';
      relevantDesc = `Ugdo kūrybiškumo ir pažinimo kompetencijas, praktinį žinių įprasminimą.`;
      strugglingVariant = `Pagal pateiktą šabloną sukurti savo pavyzdį ar iliustruotą kortelę su 2 elementais.`;
      averageVariant = `Savarankiškai arba poroje sukurti originalų mini projektą ar sprendimo planą pagal reikalavimus.`;
      advancedVariant = `Sukurti inovatyvų problemos sprendimo modelį ar originalų produktą ir jį pristatyti klasei.`;
      criteria = [
        'Sukūriau originalų darbą, kuriame panaudojau pamokoje įgytas žinias.',
        'Mano sukurtas darbas atitinka visus 3 nurodytus kriterijus.',
        'Galiu pristatyti savo idėją ir paaiškinti kūrybinį sprendimą.'
      ];
      break;

    case 'applying':
    default:
      mainGoal = `${gradePrefix} gebės ${primaryVerb} nagrinėjamas temos „${topic}“ taisykles ir formules sprendžiant bent 3 praktines situacines užduotis savarankiškai bei porose.`;
      specificDesc = `Temos „${topic}“ žinių ir algoritmo perkėlimas į praktinių užduočių sprendimą.`;
      measurableDesc = 'Bent 3 sėkmingai išspręstos arba atliktos praktinės užduotys.';
      achievableDesc = 'Užduočių sudėtingumas laipsniškas (nuo standartinių iki kūrybiškesnių).';
      relevantDesc = `Tiesiogiai įgyvendina ${subject} BP praktinio taikymo reikalavimus.`;
      strugglingVariant = `Pagal pateiktą algoritmą ar pavyzdį išspręsti 2 bazines užduotis su mokytojo ar suolo draugo pagalba.`;
      averageVariant = `Savarankiškai išspręsti 3–4 standartines praktines užduotis pagal nagrinėtą taisyklę.`;
      advancedVariant = `Išspręsti 4 užduotis, įskaitant 1 nestandartinę probleminę situaciją, ir paaiškinti sprendimo kelią kitiems.`;
      criteria = [
        `Gebu taisyklingai pasirinkti tinkamą taisyklę ar formulę temoje „${topic}“.`,
        'Moku savarankiškai atlikti bent 3 praktinius žingsnius be klaidų.',
        'Galiu patikrinti savo atsakymą ir rasti galimą netikslumą.'
      ];
      break;
  }

  return {
    mainGoal,
    bloomLevelName: foundLevel.name,
    bloomVerb: primaryVerb,
    smartBreakdown: {
      specific: specificDesc,
      measurable: measurableDesc,
      achievable: achievableDesc,
      relevant: relevantDesc,
      timeBound: timeBoundDesc
    },
    differentiatedVariants: {
      struggling: strugglingVariant,
      average: averageVariant,
      advanced: advancedVariant
    },
    successCriteria: criteria
  };
}

// AI generatorius per Gemini su automatiniu atsarginiu režimu
export async function generateSmartGoalWithAI(
  apiKey: string,
  params: GenerateSmartGoalParams,
  geminiCaller: (key: string, req: { contents: string; config?: any }) => Promise<{ text?: string }>
): Promise<SmartGoalResult> {
  // Jei nėra rakto, iškart naudojame pedagoginį šabloną
  if (!apiKey || !apiKey.trim()) {
    return generateSmartGoalPedagogical(params);
  }

  const subject = params.subject.trim() || 'Bendrasis ugdymas';
  const topic = params.topic.trim() || 'Pamokos tema';
  const grade = params.grade?.trim() || '';
  const levelId = params.bloomLevelId || 'all';
  const focus = params.focusMethod?.trim() || '';

  const level = BLOOM_LEVELS.find(l => l.id === levelId);
  const targetLevelPrompt = level 
    ? `Pageidaujamas Bloom lygis. ${level.name} (${level.englishName}), lygio kategorija. ${level.levelTier}. Rekomenduojami veiksmažodžiai. ${level.verbs.join(', ')}.`
    : `Parink optimaliausią Bloom taksonomijos lygį šiai pamokai pagal atnaujintas Bendrąsias programas (dažniausiai Taikymas, Analizė arba Kūrimas).`;

  const prompt = `
Tu esi patyręs Lietuvos bendrojo ugdymo didaktikos ekspertas.
Sukurk profesionalų, pedagogiškai nepriekaištingą SMART pamokos uždavinį / tikslą.

PAMOKOS DUOMENYS.
- Mokomasis dalykas. ${subject}
- Pamokos tema. ${topic}
${grade ? `- Klasė. ${grade} klasė` : ''}
${targetLevelPrompt}
${focus ? `- Papildomas akcentas / metodas. ${focus}` : ''}

METODINIAI REIKALAVIMAI.
1. Formuluok pagal SMART principą.
   - S (Specific / Konkretus). aiškus veiksmas, kas daroma („Mokiniai gebės [Bloom veiksmažodis]...“).
   - M (Measurable / Išmatuojamas). aiškus kriterijus (kiekis, skaičius, procentas, kokybinis požymis, pvz. „bent 3 pavyzdžius“, „pagal 4 kriterijus“).
   - A (Achievable / Pasiekiamas). įveikiama per 45 min. pamoką.
   - R (Relevant / Aktualus). tiesioginis ryšys su Lietuvos atnaujintomis Bendrosiomis programomis (BP).
   - T (Time-bound / Apibrėžtas laike). atliekama iki pamokos pabaigos.
2. GRIEŽTAI VENGTI DVITAŠKIŲ TEKSTUOSE. Vietoj dvitaškių naudok taškus arba brūkšnelius.
3. Formuluok mokinių gebėjimų kalba („Mokiniai gebės...“), o ne mokytojo veiklos kalba.
4. Pateik 3 diferencijuotas pakopas (slenkstinis mokinys, pagrindinis mokinys, aukštesnysis/pažengęs mokinys).
5. Pateik 3 mokiniui suprantamus sėkmės kriterijus („Aš gebu...“).

Atsakymą pateik TIK GRIŽTU JSON formatu pagal šią schemą.
{
  "mainGoal": "Pilnas suformuluotas SMART pamokos tikslas, pradedant 'Mokiniai gebės...'",
  "bloomLevelName": "Panaudoto Bloom lygio pavadinimas (pvz. 3. Taikymas)",
  "bloomVerb": "Pagrindinis panaudotas veiksmažodis (pvz. pritaikyti)",
  "smartBreakdown": {
    "specific": "Konkretumo paaiškinimas (S)",
    "measurable": "Išmatuojamumo kriterijus (M)",
    "achievable": "Pasiekiamumo pagrindimas (A)",
    "relevant": "Aktualumas pagal BP (R)",
    "timeBound": "Laiko rėmai (T)"
  },
  "differentiatedVariants": {
    "struggling": "Slenkstinio lygio tikslas turintiems sunkumų",
    "average": "Pagrindinio lygio tikslas daugumai mokinių",
    "advanced": "Aukštesniojo lygio tikslas pažengusiems / gabiems"
  },
  "successCriteria": [
    "1. Sėkmės kriterijus mokiniui (Aš gebu...)",
    "2. Sėkmės kriterijus mokiniui",
    "3. Sėkmės kriterijus mokiniui"
  ]
}
`;

  try {
    const response = await geminiCaller(apiKey, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Tu esi Lietuvos didaktikos ekspertas. Visi atsakymai lietuvių kalba. Niekada nenaudok dvitaškių tekstuose, pakeisk juos taškais arba brūkšniais."
      }
    });

    const rawText = response.text || '';
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (parsed && parsed.mainGoal) {
      return {
        mainGoal: String(parsed.mainGoal).replace(/:/g, '.'),
        bloomLevelName: String(parsed.bloomLevelName || level?.name || '3. Taikymas').replace(/:/g, '.'),
        bloomVerb: String(parsed.bloomVerb || 'pritaikyti').replace(/:/g, '.'),
        smartBreakdown: {
          specific: String(parsed.smartBreakdown?.specific || '').replace(/:/g, '.'),
          measurable: String(parsed.smartBreakdown?.measurable || '').replace(/:/g, '.'),
          achievable: String(parsed.smartBreakdown?.achievable || '').replace(/:/g, '.'),
          relevant: String(parsed.smartBreakdown?.relevant || '').replace(/:/g, '.'),
          timeBound: String(parsed.smartBreakdown?.timeBound || 'Iki pamokos pabaigos.').replace(/:/g, '.')
        },
        differentiatedVariants: {
          struggling: String(parsed.differentiatedVariants?.struggling || '').replace(/:/g, '.'),
          average: String(parsed.differentiatedVariants?.average || '').replace(/:/g, '.'),
          advanced: String(parsed.differentiatedVariants?.advanced || '').replace(/:/g, '.')
        },
        successCriteria: Array.isArray(parsed.successCriteria)
          ? parsed.successCriteria.map((c: any) => String(c).replace(/:/g, '.'))
          : []
      };
    }
  } catch (err) {
    console.warn('DI SMART tikslo generavimo klaida, perjungiamas pedagoginis šablonas.', err);
  }

  // Jei DI neatsakė ar formatas neteisingas, naudojame patikimą pedagoginį generatorių
  return generateSmartGoalPedagogical(params);
}
