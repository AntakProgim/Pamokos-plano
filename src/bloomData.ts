export interface BloomLevel {
  id: string;
  name: string;
  englishName: string;
  order: number;
  levelTier: 'Slenkstinis' | 'Pagrindinis' | 'Aukštesnysis';
  badgeColor: string;
  bgLight: string;
  description: string;
  bpRelevance: string;
  verbs: string[];
  exampleObjectives: string[];
  evaluationQuestion: string;
  tip: string;
}

export const BLOOM_LEVELS: BloomLevel[] = [
  {
    id: 'remembering',
    name: '1. Žinojimas ir atsiminimas',
    englishName: 'Remembering',
    order: 1,
    levelTier: 'Slenkstinis',
    badgeColor: '#38bdf8',
    bgLight: 'rgba(56, 189, 248, 0.1)',
    description: 'Faktų, terminų, sąvokų, taisyklių ir datų atgaminimas iš atminties arba atpažinimas pateiktoje medžiagoje.',
    bpRelevance: 'Būtinas pradinis žingsnis prieš pereinant prie gilesnio supratimo ir taikymo.',
    verbs: [
      'įvardyti',
      'atpažinti',
      'išvardyti',
      'apibrėžti',
      'pakartoti',
      'surasti',
      'nurodyti',
      'pažymėti',
      'atkurti',
      'perskaityti',
      'sugrupuoti pagal pavyzdį',
      'išrinkti'
    ],
    exampleObjectives: [
      'Mokiniai gebės įvardyti 3 pagrindinius pasakojimo elementus.',
      'Mokiniai gebės atpažinti taisyklingas linksnių galūnes pateiktame tekste.',
      'Mokiniai gebės išvardyti pagrindines Lietuvos saugomas teritorijas žemėlapyje.'
    ],
    evaluationQuestion: 'Ar mokinys atsimena, atpažįsta ir atgamina faktinę informaciją?',
    tip: 'Venkite apsiriboti tik šiuo lygiu. Jis yra atspirties taškas aukštesniems gebėjimams.'
  },
  {
    id: 'understanding',
    name: '2. Supratimas',
    englishName: 'Understanding',
    order: 2,
    levelTier: 'Pagrindinis',
    badgeColor: '#34d399',
    bgLight: 'rgba(52, 211, 153, 0.1)',
    description: 'Prasmės suvokimas, paaiškinimas savais žodžiais, interpretavimas, pavyzdžių radimas ir apibendrinimas.',
    bpRelevance: 'Užtikrina, kad žinios nėra mechaniškai iškaltos, o mokinys suvokia esmę ir ryšius.',
    verbs: [
      'paaiškinti',
      'apibūdinti',
      'perfrazuoti',
      'iliustruoti pavyzdžiais',
      'apibendrinti',
      'interpretuoti',
      'sugrupuoti savais žodžiais',
      'išversti',
      'numatyti pasekmes',
      'atskirti esminius dalykus',
      'palyginti paprastas sąvokas'
    ],
    exampleObjectives: [
      'Mokiniai gebės savais žodžiais paaiškinti fotosintezės reikšmę gyvajai gamtai.',
      'Mokiniai gebės iliustruoti pavyzdžiais tiesioginę ir perkeltinę žodžio reikšmę.',
      'Mokiniai gebės apibūdinti pagrindinio veikėjo poelgių motyvus.'
    ],
    evaluationQuestion: 'Ar mokinys geba paaiškinti idėjas, sąvokas ar dėsningumus savais žodžiais?',
    tip: 'Paprašykite pateikti savo pavyzdį, o ne kartoti vadovėlio apibrėžimą.'
  },
  {
    id: 'applying',
    name: '3. Taikymas',
    englishName: 'Applying',
    order: 3,
    levelTier: 'Pagrindinis',
    badgeColor: '#fbbf24',
    bgLight: 'rgba(251, 191, 36, 0.1)',
    description: 'Žinių, taisyklių, formulių ir metodų panaudojimas sprendžiant praktines arba naujas užduotis.',
    bpRelevance: 'Formuoja praktinius gebėjimus ir pasitikėjimą sprendžiant standartines bei gyvenimiškas problemas.',
    verbs: [
      'pritaikyti',
      'apskaičiuoti',
      'pademonstruoti',
      'išspręsti',
      'panaudoti',
      'įgyvendinti',
      'sudaryti',
      'atlikti eksperimentą',
      'patobulinti pagal taisyklę',
      'parengti pagal pavyzdį',
      'nubraižyti',
      'surinkti duomenis'
    ],
    exampleObjectives: [
      'Mokiniai gebės pritaikyti Pitagoro teoremą apskaičiuojant stačiojo trikampio kraštinę.',
      'Mokiniai gebės pademonstruoti saugaus elgesio laboratorijoje taisykles atliekant bandymą.',
      'Mokiniai gebės parašyti taisyklingą oficialų prašymą pagal pateiktus reikalavimus.'
    ],
    evaluationQuestion: 'Ar mokinys geba panaudoti informaciją, procedūrą ar taisyklę praktinėje situacijoje?',
    tip: 'Pateikite kontekstą iš realaus gyvenimo, kad mokiniai matytų prasmę.'
  },
  {
    id: 'analyzing',
    name: '4. Analizė',
    englishName: 'Analyzing',
    order: 4,
    levelTier: 'Aukštesnysis',
    badgeColor: '#fb923c',
    bgLight: 'rgba(251, 146, 60, 0.1)',
    description: 'Informacijos skaidymas į sudėtines dalis, priežasčių ir pasekmių nustatymas, dėsningumų bei klaidų paieška.',
    bpRelevance: 'Užtikrina giluminį kritinį mąstymą, faktų atskyrimą nuo nuomonių ir manipuliacijų atpažinimą.',
    verbs: [
      'išanalizuoti',
      'palyginti ir sugretinti',
      'diferencijuoti',
      'ištirti',
      'išskirti esminius požymius',
      'nustatyti priežastis',
      'suklasifikuoti',
      'patikrinti prielaidas',
      'surasti dėsningumus',
      'dekonstruoti',
      'atskirti faktus nuo nuomonių'
    ],
    exampleObjectives: [
      'Mokiniai gebės palyginti dviejų istorinių šaltinių patikimumą ir autoriaus požiūrį.',
      'Mokiniai gebės išanalizuoti reklamos teksto kalbinius manipuliavimo būdus.',
      'Mokiniai gebės nustatyti priežastinius ryšius tarp klimato kaitos ir vietos ekosistemos pokyčių.'
    ],
    evaluationQuestion: 'Ar mokinys geba išskirti dalis ir suprasti, kaip jos sudaro bendrą struktūrą?',
    tip: 'Naudokite lyginimo diagramas (pvz. Venno diagramą) arba priežasčių-pasekmių schemas.'
  },
  {
    id: 'evaluating',
    name: '5. Vertinimas',
    englishName: 'Evaluating',
    order: 5,
    levelTier: 'Aukštesnysis',
    badgeColor: '#c084fc',
    bgLight: 'rgba(192, 132, 252, 0.1)',
    description: 'Sprendimų, teorijų, darbo kokybės ar šaltinių vertinimas remiantis aiškiais kriterijais ir standartais.',
    bpRelevance: 'Užtikrina argumentavimo gebėjimus, savirefleksiją, pagrįstą nuomonės gynimą ir etinį vertinimą.',
    verbs: [
      'įvertinti',
      'pagrįsti',
      'argumentuoti',
      'kritiškai įvertinti',
      'atrinkti tinkamiausią',
      'apginti nuomonę',
      'nustatyti trūkumus',
      'rekomenduoti',
      'reflektuoti',
      'įsivertinti pagal kriterijus',
      'patvirtinti arba paneigti'
    ],
    exampleObjectives: [
      'Mokiniai gebės argumentuotai įvertinti pateikto sprendimo etiškumą ir pasekmes.',
      'Mokiniai gebės atrinkti optimaliausią energijos taupymo būdą ir pagrįsti pasirinkimą trimis kriterijais.',
      'Mokiniai gebės atlikti bendraklasio teksto recenziją (Peer Review) pagal pateiktą vertinimo rubriką.'
    ],
    evaluationQuestion: 'Ar mokinys geba pagrįsti sprendimą, hipotezę ar vertinimą remdamasis kriterijais?',
    tip: 'Visada mokykite remtis aiškiais kriterijais, o ne asmenine simpatija ar emocija.'
  },
  {
    id: 'creating',
    name: '6. Kūrimas ir sintezė',
    englishName: 'Creating',
    order: 6,
    levelTier: 'Aukštesnysis',
    badgeColor: '#f43f5e',
    bgLight: 'rgba(244, 63, 94, 0.1)',
    description: 'Elementų sujungimas į naują visumą, originalaus produkto, plano, modelio ar alternatyvaus sprendimo sukūrimas.',
    bpRelevance: 'Bloom taksonomijos viršūnė. Ugdo kūrybiškumą, inovatyvumą ir praktinį žinių įkūnijimą.',
    verbs: [
      'sukurti',
      'suprojektuoti',
      'suformuluoti',
      'suplanuoti',
      'sukomponuoti',
      'sugeneruoti alternatyvas',
      'parašyti originalų tekstą',
      'sumodeliuoti',
      'išrasti',
      'reorganizuoti',
      'parengti projektą'
    ],
    exampleObjectives: [
      'Mokiniai gebės sukurti originalų skaitmeninį plakatą ekologijos tema.',
      'Mokiniai gebės suprojektuoti eksperimento eigą pateiktai hipotezei patikrinti.',
      'Mokiniai gebės suformuluoti 3 originalias idėjas mokyklos bendruomenės problemai spręsti.'
    ],
    evaluationQuestion: 'Ar mokinys geba sukurti naują produktą, planą ar originalų požiūrio tašką?',
    tip: 'Suteikite mokiniams laisvę pasirinkti raiškos formą (tekstas, vaizdo įrašas, modelis, plakatas).'
  }
];

export const OBJECTIVE_FORMULA_GUIDE = {
  title: 'SMART ir BP pamokos tikslo formulė',
  formula: 'Mokiniai gebės + [Bloom veiksmažodis] + [Mokymosi turinys / sąvoka] + [Kontekstas / Sąlyga / Kriterijus]',
  goodVerbsNotice: 'Rekomenduojama naudoti stebimus ir išmatuojamus veiksmažodžius (išvardyti, paaiškinti, pritaikyti, palyginti, įvertinti, sukurti).',
  avoidVerbsNotice: 'Venkite neapibrėžtų žodžių (žinos, supras, susipažins, išmoks), nes jų pasiekimo lygio neįmanoma tiesiogiai pamatuoti pamokoje.',
  contrastExamples: [
    {
      bad: 'Mokiniai supras trupmenas.',
      good: 'Mokiniai gebės sudėti vienodų vardiklių trupmenas ir pritaikyti tai spręsdami 4 praktinius uždavinius.',
      reason: 'Žodis „supras“ yra neaiškus. Pakeitus į „sudėti ir pritaikyti“ tikslas tampa pamatuojamas.'
    },
    {
      bad: 'Mokiniai susipažins su Baroko architektūra.',
      good: 'Mokiniai gebės atpažinti ir įvardyti bent 3 Baroko bruožus Vilniaus Šv. Petro ir Povilo bažnyčios nuotraukose.',
      reason: '„Susipažins“ rodo pasyvų procesą, o „atpažinti ir įvardyti“ reikalauja aktyvaus mokinių veiksmo.'
    },
    {
      bad: 'Mokyti taisyklingos skyrybos.',
      good: 'Mokiniai gebės taisyklingai išskirti šalutinius sakinius kableliais ir paaiškinti savo pasirinkimą.',
      reason: 'Tikslas formuluojamas mokinių pasiekimų, o ne mokytojo veiklos kalba.'
    }
  ]
};
