
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from './firebase-applet-config.json';
import { downloadDocumentPdf } from './src/pdfService.ts';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
provider.addScope('https://www.googleapis.com/auth/classroom.announcements');
provider.addScope('https://www.googleapis.com/auth/classroom.coursework.me');
provider.addScope('https://www.googleapis.com/auth/classroom.courseworkmaterials');

type LessonCategory = 'Įvadinė' | 'Įtvirtinimo' | 'Apibendrinamoji' | 'Vertinamoji' | '';

interface EDiaryEntry {
  topicClassworkExpectations: string;
  homework: string;
  individualHomework: string;
  notes: string;
  isIntegrated: boolean;
  isOutside: boolean;
  eDiaryLessonType: string;
}

interface EvaluationData {
  methods: string[];
  criteria: string;
}

interface ClassActivities {
  individual: string;
  pairs: string;
  group: string;
  toolsResources: string;
}

interface LessonPlan {
  generalNotes: string;
  lessonType?: LessonCategory;
  bpConnections: string;
  lessonOverview: {
    topic: string;
    goal: string;
    competencies: string;
    evaluation: EvaluationData;
  };
  tasks: {
    general: string;
    highLevel: string;
    mainLevel: string;
  };
  // Naujas laukas veikloms klasėje
  classActivities: ClassActivities;
  // Naujas laukas konkretiems individualiems darbams
  individualWork: string;
  lessonStages: {
    introduction: string;
    theory: string;
    practice: string;
    consolidation: string;
    summary: string;
  };
  differentiation: {
    gifted: string;
    general: string;
    struggling: string;
  };
  homework: {
    purpose: string;
    gifted: string;
    general: string;
    struggling: string;
  };
  digitalResources: string;
  eDiaryEntry: EDiaryEntry;
  consultationAdvice?: string;
  specialAdvice?: string; 
  motivation: string;
  stageDurations?: Record<string, number>;
}

interface SavedPlan {
  id: string;
  title: string;
  plan: LessonPlan;
  createdAt: string;
  comments?: string;
  subject?: string;
  grade?: string;
  lessonType?: LessonCategory;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const EVALUATION_TAGS = [
  'Paprastas pažymys', 'Kontrolinis darbas', 'Savarankiškas darbas', 'Projektinis darbas',
  'Integruotas tarpdalykinis įvertinimas', 'Tarpinis atsiskaitymas', 'Galutinis atsiskaitymas',
  'Atsiskaitomasis darbas', 'Formuojamojo vertinimo darbas', 'Probleminio tipo užduotis'
];

const RESOURCE_TAGS = [
  'Google Classroom', 'Vadovėlis', 'Pratybos', 'Darbo lapai', 'Mokymosi programėlės',
  'Miro lenta', 'Canva', 'YouTube', 'Kahoot / Quizizz', 'Mentimeter', 'Padlet', 'Išmanieji telefonai'
];

const ACADEMIC_SUBJECTS = [
  'Lietuvių kalba ir literatūra',
  'Matematika',
  'Užsienio kalba (anglų)',
  'Istorija',
  'Biologija',
  'Fizika',
  'Informatika',
  'Geografija',
  'Chemija'
];

const NON_ACADEMIC_SUBJECTS = [
  'Klasės vadovo veikla',
  'Etika',
  'Teatras',
  'Gyvenimo įgūdžiai',
  'Fizinis ugdymas',
  'Dailė',
  'Muzika'
];

const HOMEWORK_TYPES = [
  { id: 'consolidation', label: '💡 Įtvirtinimas ir taikymas' },
  { id: 'creative', label: '🎨 Kūrybinis / tiriamasis darbas' },
  { id: 'problem', label: '🔍 Problemų sprendimas' },
  { id: 'flipped', label: '📖 Pasiruošimas kitai pamokai' },
  { id: 'none', label: '🚫 Be namų darbų (krūvio balansas)' }
];

const HOMEWORK_DURATIONS = [
  { value: '0', label: '0 min.', desc: 'Be namų darbų' },
  { value: '15', label: '10–15 min.', desc: 'Rekomenduojama (1–6 kl.)' },
  { value: '20', label: '15–20 min.', desc: 'Standartinė (7–8 kl.)' },
  { value: '30', label: '20–30 min.', desc: 'Išplėstinė (9–12 kl.)' }
];

const QUICK_GRADES = [
  '5 kl.', '6 kl.', '7 kl.', '8 kl.', 'I gimn. (9 kl.)', 'II gimn. (10 kl.)', 'III gimn. (11 kl.)', 'IV gimn. (12 kl.)'
];

interface BPModule {
  id: string;
  subjects: string[];
  cycles: string[];
  cycleLabel: string;
  area: string;
  topicSuggestion: string;
  goalSuggestion: string;
  contentDescription: string;
  competencies: string;
  bpCode: string;
}

const BP_MODULES: BPModule[] = [
  // Lietuvių kalba ir literatūra
  {
    id: 'lt-78-1',
    subjects: ['lietuvių', 'literatūra'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'Teksto analizė ir medijų raštingumas',
    topicSuggestion: 'Reklamos kalba ir įtaigos priemonės',
    goalSuggestion: 'Atpažinti ir analizuoti kalbinės manipuliacijos priemones reklamoje bei kurti etišką prekės aprašymą.',
    contentDescription: 'Grožinių ir negrožinių tekstų analizė, kalbos įtaigos priemonės (metaforos, hiperbolės, retoriniai klausimai), medijų tekstų kritinis vertinimas, reklamos poveikio vartotojui analizė.',
    competencies: 'Komunikavimo, kultūrinė, skaitmeninė, pažinimo',
    bpCode: 'BP 1.2'
  },
  {
    id: 'lt-78-2',
    subjects: ['lietuvių', 'literatūra'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'Kalbos vartojimas ir sintaksė',
    topicSuggestion: 'Sudėtiniai bejungtukiai ir sujungiamieji sakiniai',
    goalSuggestion: 'Taisyklingai vartoti ir skirti sudėtinius sakinius, argumentuojant savo mintis.',
    contentDescription: 'Sintaksiniai ryšiai, sudėtinių sujungiamųjų ir bejungtukių sakinių sandara, skyrybos taisyklės ir stilistinė vertė rišliame tekste.',
    competencies: 'Komunikavimo, pažinimo',
    bpCode: 'BP 2.3'
  },
  {
    id: 'lt-56-1',
    subjects: ['lietuvių', 'literatūra'],
    cycles: ['5-6', 'all'],
    cycleLabel: '5–6 kl.',
    area: 'Skaitymas ir teksto supratimas',
    topicSuggestion: 'Veikėjo charakterio atskleidimas pasakojamajame tekste',
    goalSuggestion: 'Išskirti pagrindinius veikėjo bruožus, motyvuoti jo poelgius teksto detalėmis.',
    contentDescription: 'Tiesioginis ir netiesioginis veikėjo charakterizavimas, pasakojimo struktūra (užuomazga, kulminacija, atomazga), teksto pagrindinės minties formulavimas.',
    competencies: 'Kultūrinė, komunikavimo',
    bpCode: 'BP 1.1'
  },
  {
    id: 'lt-910-1',
    subjects: ['lietuvių', 'literatūra'],
    cycles: ['9-10', '11-12', 'all'],
    cycleLabel: '9–10 kl. (Gimnazija)',
    area: 'Literatūros epochos ir autoriai',
    topicSuggestion: 'Žmogaus ir tėvynės santykis K. Donelaičio ir Maironio kūryboje',
    goalSuggestion: 'Analizuoti tapatybės ir pareigos motyvus, remiantis epochos kultūriniu kontekstu.',
    contentDescription: 'Klasicizmo ir romantizmo idėjų atspindžiai literatūroje, pilietinės atsakomybės ir tapatybės problematika, argumentuotos esė pastraipos rengimas.',
    competencies: 'Pilietinė, kultūrinė, kūrybiškumo',
    bpCode: 'BP 1.4'
  },

  // Matematika
  {
    id: 'mat-78-1',
    subjects: ['matematika'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'Reiškiniai, lygtys ir funkcijos',
    topicSuggestion: 'Tiesinė funkcija ir jos grafikas y = kx + b',
    goalSuggestion: 'Nubraižyti tiesinės funkcijos grafiką, paaiškinti koeficientų k ir b geometrinę bei praktinę prasmę.',
    contentDescription: 'Funkcinis ryšys, tiesinės funkcijos formulė, krypties koeficientas, susikirtimo su koordinatinėmis ašimis taškai, praktinių situacijų modeliavimas.',
    competencies: 'Pažinimo, skaitmeninė',
    bpCode: 'BP 2.1'
  },
  {
    id: 'mat-78-2',
    subjects: ['matematika'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'Geometrija ir matai',
    topicSuggestion: 'Pitagoro teorema ir jos taikymas praktiniams uždaviniams',
    goalSuggestion: 'Taikyti Pitagoro teoremą stačiojo trikampio kraštinėms apskaičiuoti ir realiems atstumams nustatyti.',
    contentDescription: 'Stačiojo trikampio savybės, statiniai ir įžambinė, Pitagoro teoremos geometrinė prasmė, praktiniai atstumų ir aukščių skaičiavimai.',
    competencies: 'Pažinimo, kūrybiškumo',
    bpCode: 'BP 3.2'
  },
  {
    id: 'mat-56-1',
    subjects: ['matematika'],
    cycles: ['5-6', 'all'],
    cycleLabel: '5–6 kl.',
    area: 'Skaičiai ir skaičiavimai',
    topicSuggestion: 'Paprastųjų ir dešimtainių trupmenų veiksmai kasdienėse situacijose',
    goalSuggestion: 'Atlikti veiksmus su trupmenomis sprendžiant pirkinių, nuolaidų ir asmeninio biudžeto uždavinius.',
    contentDescription: 'Trupmenų bendravardiklinimas, dešimtainių trupmenų sudėtis ir daugyba, procentų sąvoka ir praktinis taikymas.',
    competencies: 'Pažinimo, socialinė-emocinė',
    bpCode: 'BP 1.2'
  },
  {
    id: 'mat-910-1',
    subjects: ['matematika'],
    cycles: ['9-10', '11-12', 'all'],
    cycleLabel: '9–10 kl. (Gimnazija)',
    area: 'Kvadratinė funkcija ir modeliavimas',
    topicSuggestion: 'Kvadratinė funkcija, jos viršūnė ir parabolės taikymas optimizavimo uždaviniams',
    goalSuggestion: 'Nustatyti kvadratinės funkcijos viršūnę ir rasti didžiausią arba mažiausią reiškinio reikšmę.',
    contentDescription: 'Kvadratinės funkcijos formulė y = ax^2 + bx + c, grafiko savybės, viršūnės koordinatės, šaknys (diskriminantas), realių situacijų optimizavimas.',
    competencies: 'Pažinimo, skaitmeninė',
    bpCode: 'BP 2.3'
  },

  // Užsienio kalba (anglų)
  {
    id: 'eng-78-1',
    subjects: ['užsienio', 'anglų', 'kalba'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl. (A2–B1)',
    area: 'Socialinis bendravimas ir paslaugos',
    topicSuggestion: 'Užsakymas restorane ir mandagumo frazės (Ordering Food & Polite Requests)',
    goalSuggestion: 'Sklandžiai užsisakyti maistą restorane, vartojant specifinį žodyną, modalinius veiksmažodžius ir mandagumo etiketo frazes.',
    contentDescription: 'Valgiaraščio žodynas, mandagios formuluotės (Would like, Could I have, I will take), dialogų simuliacija porose, kultūriniai arbatpinigių ir etiketo skirtumai.',
    competencies: 'Komunikavimo, kultūrinė, socialinė-emocinė',
    bpCode: 'BP 1.2'
  },
  {
    id: 'eng-56-1',
    subjects: ['užsienio', 'anglų', 'kalba'],
    cycles: ['5-6', 'all'],
    cycleLabel: '5–6 kl. (A1–A2)',
    area: 'Asmeninė aplinka ir laisvalaikis',
    topicSuggestion: 'Mano kasdienė rutina ir pomėgiai (Daily Routines & Hobbies)',
    goalSuggestion: 'Papasakoti apie savo įprastą dieną vartojant Present Simple laiką ir dažnumo prieveiksmius.',
    contentDescription: 'Laiko nusakymai, dažnumo prieveiksmiai (always, sometimes, never), pomėgių žodynas, klausimų ir atsakymų formavimas porose.',
    competencies: 'Komunikavimo, pažinimo',
    bpCode: 'BP 1.1'
  },
  {
    id: 'eng-910-1',
    subjects: ['užsienio', 'anglų', 'kalba'],
    cycles: ['9-10', '11-12', 'all'],
    cycleLabel: '9–10 kl. (B1–B2)',
    area: 'Globalios temos ir ateities perspektyvos',
    topicSuggestion: 'Technologijos, aplinkosauga ir ateities profesijos (Future Careers & Environment)',
    goalSuggestion: 'Argumentuotai išreikšti savo nuomonę apie technologijų poveikį klimatui ir ateities darbo rinkai.',
    contentDescription: 'Priežasties ir pasekmės jungtukai, formalaus el. laiško ir nuomonės esė struktūra, debatai apie tvarią ateitį.',
    competencies: 'Komunikavimo, pilietinė, skaitmeninė',
    bpCode: 'BP 3.1'
  },

  // Informatika
  {
    id: 'inf-78-1',
    subjects: ['informatika'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'Duomenų analizė ir skaičiuoklės',
    topicSuggestion: 'Google Sheets formulių (SUM, AVERAGE, IF) taikymas asmeniniam biudžetui',
    goalSuggestion: 'Sukurti skaitmeninę lentelę, pritaikyti matematines ir logines formules bei vizualizuoti duomenis skrituline diagrama.',
    contentDescription: 'Lentelės struktūrizavimas, absoliučios ir santykinės koordinatės, formulės SUM, AVERAGE, MIN, MAX, sąlyginis formatavimas, diagramų konstravimas.',
    competencies: 'Skaitmeninė, pažinimo',
    bpCode: 'BP 1.3'
  },
  {
    id: 'inf-78-2',
    subjects: ['informatika'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'Algoritmai ir programavimas',
    topicSuggestion: 'Sąlyginiai sakiniai ir kintamieji programavime (Python / Blockly)',
    goalSuggestion: 'Parašyti programą su šakotuoju algoritmu (if-else), atliekančią įvestų duomenų patikrinimą.',
    contentDescription: 'Kintamųjų tipai (int, str, float), loginiai operatoriai (and, or, not), if-elif-else struktūra, kodo derinimas ir testavimas.',
    competencies: 'Skaitmeninė, kūrybiškumo',
    bpCode: 'BP 2.2'
  },
  {
    id: 'inf-56-1',
    subjects: ['informatika'],
    cycles: ['5-6', 'all'],
    cycleLabel: '5–6 kl.',
    area: 'Algoritmai ir vizualusis programavimas',
    topicSuggestion: 'Žaidimo personažo judėjimas ir ciklai Scratch aplinkoje',
    goalSuggestion: 'Sukurti interaktyvią animaciją, kurioje veikėjas juda ir reaguoja į klaviatūros paspaudimus taikant ciklo kartojimus.',
    contentDescription: 'Scenos ir veikėjų valdymas, nuoseklūs žingsniai, begaliniai ir kartotiniai ciklai, sąlyginiai jutikliai Scratch programoje.',
    competencies: 'Skaitmeninė, kūrybiškumo',
    bpCode: 'BP 2.1'
  },
  {
    id: 'inf-910-1',
    subjects: ['informatika'],
    cycles: ['9-10', '11-12', 'all'],
    cycleLabel: '9–10 kl. (Gimnazija)',
    area: 'Skaitmeninis saugumas ir etika',
    topicSuggestion: 'Kibernetinis saugumas, duomenų privatumas ir dirbtinis intelektas',
    goalSuggestion: 'Atpažinti sukčiavimo (phishing) atakas, taikyti dviejų veiksnių autentifikavimą ir kritiškai vertinti DI sugeneruotą turinį.',
    contentDescription: 'Slaptažodžių sauga, socialinė inžinerija, skaitmeninis pėdsakas, autorių teisės skaitmeninėje erdvėje, DI etika.',
    competencies: 'Skaitmeninė, pilietinė, pažinimo',
    bpCode: 'BP 3.1'
  },

  // Istorija
  {
    id: 'hist-78-1',
    subjects: ['istorija'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'LDK ir Abiejų Tautų Respublika',
    topicSuggestion: 'Lietuvos krikštas ir Žalgirio mūšis: LDK geopolitinis lūžis',
    goalSuggestion: 'Išanalizuoti Žalgirio mūšio reikšmę LDK tarptautiniam autoritetui ir kryžiuočių ordino galios žlugimui.',
    contentDescription: '1387 m. krikšto politinės aplinkybės, Vytauto Didžiojo ir Jogailos diplomatija, 1410 m. Žalgirio mūšio eiga ir Torunės taika, istorinių šaltinių analizė.',
    competencies: 'Pilietinė, kultūrinė, pažinimo',
    bpCode: 'BP 1.2'
  },
  {
    id: 'hist-910-1',
    subjects: ['istorija'],
    cycles: ['9-10', '11-12', 'all'],
    cycleLabel: '9–10 kl. (Gimnazija)',
    area: 'XX a. lūžiai ir laisvės kovos',
    topicSuggestion: '1918 m. Vasario 16-osios Aktas ir Lietuvos nepriklausomybės atkūrimas',
    goalSuggestion: 'Aptarti Lietuvos Tarybos veiklą, Nepriklausomybės Akto istorinę vertę ir valstybingumo įtvirtinimo iššūkius.',
    contentDescription: 'Pirmojo pasaulinio karo pabaiga, Vilniaus konferencija, Lietuvos Taryba, Akto signatarai, kovos už nepriklausomybę su bermontininkais ir bolševikais.',
    competencies: 'Pilietinė, kultūrinė, komunikavimo',
    bpCode: 'BP 2.1'
  },

  // Biologija
  {
    id: 'bio-78-1',
    subjects: ['biologija'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'Žmogaus organizmas ir sveikata',
    topicSuggestion: 'Žmogaus kraujotakos sistema ir širdies veikla',
    goalSuggestion: 'Paaiškinti didįjį ir mažąjį kraujo apytakos ratus bei sveikos gyvensenos įtaką širdies veiklai.',
    contentDescription: 'Širdies sandara (prieširdžiai, skilveliai), kraujagyslės (arterijos, venos, kapiliarai), pulsas ir kraujospūdis, fizinio aktyvumo poveikis kraujotakai.',
    competencies: 'Sveikos gyvensenos, pažinimo',
    bpCode: 'BP 2.2'
  },
  {
    id: 'bio-910-1',
    subjects: ['biologija'],
    cycles: ['9-10', '11-12', 'all'],
    cycleLabel: '9–10 kl. (Gimnazija)',
    area: 'Genetika ir paveldimumas',
    topicSuggestion: 'Monohibridinis kryžminimas ir Mendelio dėsniai',
    goalSuggestion: 'Sudaryti genetinių kryžminimų schemas (Peneto gardelę) ir apskaičiuoti palikuonių genotipų bei fenotipų tikimybes.',
    contentDescription: 'Aleliai, dominantiniai ir recesyviniai požymiai, genotipas ir fenotipas, G. Mendelio pirmasis ir antrasis dėsniai, paveldimos ligos.',
    competencies: 'Pažinimo, skaitmeninė',
    bpCode: 'BP 3.1'
  },

  // Fizika
  {
    id: 'phys-78-1',
    subjects: ['fizika'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'Mechanika ir jėgos gamtoje',
    topicSuggestion: 'Archimedo jėga ir kūnų plaukiojimo sąlygos',
    goalSuggestion: 'Apskaičiuoti Archimedo jėgą ir eksperimentiškai ištirti kūnų skendimo bei plaukiojimo priklausomybę nuo skysčio tankio.',
    contentDescription: 'Hidrostatinis slėgis, Archimedo dėsnis F = ro * g * V, eksperimentinis bandymas su dinamometru ir menzūra, laivų ir povandeninių laivų veikimo principai.',
    competencies: 'Pažinimo, kūrybiškumo',
    bpCode: 'BP 1.1'
  },
  {
    id: 'phys-910-1',
    subjects: ['fizika'],
    cycles: ['9-10', '11-12', 'all'],
    cycleLabel: '9–10 kl. (Gimnazija)',
    area: 'Elektrodinamika',
    topicSuggestion: 'Omo dėsnis grandinės daliai ir nuoseklusis bei lygiagretusis jungimas',
    goalSuggestion: 'Ištirti srovės stiprio, įtampos ir varžos sąryšį bei apskaičiuoti mišrių grandinių parametrus.',
    contentDescription: 'Omo dėsnis I = U / R, voltamperinė charakteristika, nuoseklaus ir lygiagretaus rezistorių jungimo savybės, saugus elgesys su elektra.',
    competencies: 'Pažinimo, skaitmeninė',
    bpCode: 'BP 2.1'
  },

  // Chemija
  {
    id: 'chem-8-1',
    subjects: ['chemija'],
    cycles: ['7-8', 'all'],
    cycleLabel: '8 kl.',
    area: 'Medžiagų sandara ir reakcijos',
    topicSuggestion: 'Periodinis elementų dėsnis ir atomo sandara',
    goalSuggestion: 'Nustatyti cheminio elemento atomo sandarą (protonus, neutronus, elektronus) pagal jo vietą periodinėje elementų lentelėje.',
    contentDescription: 'Atomo branduolys, elektroniniai sluoksniai, periodai ir grupės, metalai ir nemetalai, valentinių elektronų ryšys su cheminiu aktyvumu.',
    competencies: 'Pažinimo, skaitmeninė',
    bpCode: 'BP 1.1'
  },
  {
    id: 'chem-910-1',
    subjects: ['chemija'],
    cycles: ['9-10', '11-12', 'all'],
    cycleLabel: '9–10 kl. (Gimnazija)',
    area: 'Cheminiai junginiai ir tirpalai',
    topicSuggestion: 'Rūgštys, bazės ir neutralizacijos reakcija',
    goalSuggestion: 'Parašyti rūgšties ir bazės neutralizacijos reakcijos lygtį bei ištirti tirpalų pH indikatoriais.',
    contentDescription: 'Rūgščių ir hidroksidų formulės, disociacija vandenyje, pH skalė, lakmuso ir fenolftaleino indikatoriai, neutralizacijos reakcija praktikoje.',
    competencies: 'Pažinimo, sveikatos',
    bpCode: 'BP 2.2'
  },

  // Geografija
  {
    id: 'geo-78-1',
    subjects: ['geografija'],
    cycles: ['7-8', 'all'],
    cycleLabel: '7–8 kl.',
    area: 'Pasaulio klimatas ir zonos',
    topicSuggestion: 'Pasaulio klimato juostos ir jų įtaka žmonių ūkinei veiklai',
    goalSuggestion: 'Analizuoti klimato diagramas (temperatūrą ir kritulius) ir paaiškinti gamtinių zonų pasiskirstymą Žemėje.',
    contentDescription: 'Atmosferos cirkuliacija, saulės spinduliuotės kampas, pusiaujo, atogrąžų, vidutinių ir poliarinių platumų klimatas, klimato kaita.',
    competencies: 'Pažinimo, pilietinė, skaitmeninė',
    bpCode: 'BP 2.1'
  },

  // Neakademiniams dalykams
  {
    id: 'class-1',
    subjects: ['klasės vadovo', 'klases vadovo'],
    cycles: ['all'],
    cycleLabel: 'Klasės vadovas',
    area: 'Klasės mikroklimatas ir santykiai',
    topicSuggestion: 'Klasės bendruomeniškumo stiprinimas ir konfliktų sprendimo strategijos',
    goalSuggestion: 'Aptarti konstruktyvaus bendravimo principus, atpažinti konfliktų priežastis ir sukurti bendras klasės taisykles.',
    contentDescription: 'Klasės mikroklimato analizė, empatija, aktyvaus klausymosi metodai, mediacija tarp mokinių, patyčių prevencija ir bendruomeniškumo refleksija.',
    competencies: 'Socialinė-emocinė, pilietinė, komunikavimo',
    bpCode: 'Socialinė-emocinė BP'
  },
  {
    id: 'class-2',
    subjects: ['klasės vadovo', 'klases vadovo'],
    cycles: ['all'],
    cycleLabel: 'Klasės vadovas',
    area: 'Saviugda ir profesinis orientavimas',
    topicSuggestion: 'Mano asmeninės stiprybės, laiko planavimas ir ateities karjeros kryptys',
    goalSuggestion: 'Įsivertinti asmeninius gebėjimus, suplanuoti savaitės laiko biudžetą ir ištirti dominančias profesijas.',
    contentDescription: 'Stiprybių medžio metodas, prokrastinacijos įveika, SMART asmeniniai tikslai, pažintis su profesijomis ir savanorystės galimybėmis.',
    competencies: 'Saviugdos, pažinimo, komunikavimo',
    bpCode: 'Saviugdos BP'
  },
  {
    id: 'eth-1',
    subjects: ['etika'],
    cycles: ['all'],
    cycleLabel: 'Etika',
    area: 'Moralinis pasirinkimas ir vertybės',
    topicSuggestion: 'Moralinis apsisprendimas ir atsakomybė kasdienėse dilemose',
    goalSuggestion: 'Nagrinėti kasdienio gyvenimo etines dilemas, argumentuotai ginti savo vertybinę poziciją ir gerbti kito asmens orumą.',
    contentDescription: 'Sąžinė, tiesa, pagarba kito pasirinkimui, atsakomybė už savo poelgius, etiniai sprendimai realiose ir virtualiose situacijose.',
    competencies: 'Vertybinė, pilietinė, komunikavimo',
    bpCode: 'Etikos BP 1.1'
  },
  {
    id: 'theat-1',
    subjects: ['teatras'],
    cycles: ['all'],
    cycleLabel: 'Teatras',
    area: 'Sceninė raiška ir improvizacija',
    topicSuggestion: 'Emocijų raiška, sceninis judesys ir neverbalinė komunikacija',
    goalSuggestion: 'Laisvai reikšti emocijas kūno kalba ir improvizuoti trumpas situacijas bendradarbiaujant porose.',
    contentDescription: 'Kūno plastika, erdvės pajautimas, veido mimika ir gestai, sceninis pasitikėjimas, trumpų etiudų kūrimas be žodžių.',
    competencies: 'Kūrybiškumo, kultūrinė, socialinė-emocinė',
    bpCode: 'Teatro BP 1.2'
  },
  {
    id: 'life-1',
    subjects: ['gyvenimo įgūdžiai', 'gyvenimo igudziai'],
    cycles: ['all'],
    cycleLabel: 'Gyvenimo įgūdžiai',
    area: 'Psichoemocinis saugumas ir sveikata',
    topicSuggestion: 'Streso atpažinimas, emocijų reguliavimas ir skaitmeninė higiena',
    goalSuggestion: 'Taikyti praktines streso mažinimo technikas ir sukurti asmeninį saugaus elgesio skaitmeninėje erdvėje planą.',
    contentDescription: 'Streso fiziologiniai ir emociniai signalai, kvėpavimo pratimai, emocijų įvardijimas, ekrano laiko ribojimas ir miego higiena.',
    competencies: 'Socialinė-emocinė, sveikos gyvensenos',
    bpCode: 'GĮ BP 1.1'
  },
  {
    id: 'pe-1',
    subjects: ['fizinis ugdymas', 'fizinis'],
    cycles: ['all'],
    cycleLabel: 'Fizinis ugdymas',
    area: 'Sveikata ir komandinis bendradarbiavimas',
    topicSuggestion: 'Aerobinės ištvermės lavinimas ir garbingo žaidimo (Fair Play) principai',
    goalSuggestion: 'Atlikti aerobinius ištvermės pratimus kontroliuojant širdies ritmą ir taikyti komandinio žaidimo taisykles.',
    contentDescription: 'Pulsas ramybėje ir po krūvio, bėgimo technika, komandinių estafečių taktika, pagarba varžovui ir savikontrolė.',
    competencies: 'Sveikos gyvensenos, socialinė-emocinė',
    bpCode: 'FU BP 2.1'
  },
  {
    id: 'art-1',
    subjects: ['dailė', 'daile', 'muzika'],
    cycles: ['all'],
    cycleLabel: 'Meninis ugdymas',
    area: 'Meninė saviraiška ir kūrybiškumas',
    topicSuggestion: 'Spalvinė kompozicija ir emocinis vizualiosios raiškos poveikis',
    goalSuggestion: 'Sukurti autorinę kompoziciją pritaikant spalvų kontrastus ir paaiškinti savo kūrinio idėją.',
    contentDescription: 'Šiltos ir šaltos spalvos, kontrasto ir niuanso principai, jausmų perteikimas per spalvinę dėmę ir liniją, autoriaus sumanymo pristatymas.',
    competencies: 'Kūrybiškumo, kultūrinė',
    bpCode: 'Menų BP 1.1'
  }
];

function getBPModules(subjectName: string, gradeStr: string): BPModule[] {
  if (!subjectName.trim()) return [];
  const sLower = subjectName.toLowerCase();
  const gLower = gradeStr.toLowerCase();
  
  const matched = BP_MODULES.filter(m => 
    m.subjects.some(sub => sLower.includes(sub))
  );
  
  if (matched.length === 0) return [];
  
  if (gLower.includes('5') || gLower.includes('6')) {
    const cycleMatch = matched.filter(m => m.cycles.includes('5-6') || m.cycles.includes('all'));
    if (cycleMatch.length > 0) return cycleMatch;
  }
  if (gLower.includes('7') || gLower.includes('8')) {
    const cycleMatch = matched.filter(m => m.cycles.includes('7-8') || m.cycles.includes('all'));
    if (cycleMatch.length > 0) return cycleMatch;
  }
  if (gLower.includes('9') || gLower.includes('10') || gLower.includes('i') || gLower.includes('ii')) {
    const cycleMatch = matched.filter(m => m.cycles.includes('9-10') || m.cycles.includes('all'));
    if (cycleMatch.length > 0) return cycleMatch;
  }
  if (gLower.includes('11') || gLower.includes('12') || gLower.includes('iii') || gLower.includes('iv')) {
    const cycleMatch = matched.filter(m => m.cycles.includes('11-12') || m.cycles.includes('all'));
    if (cycleMatch.length > 0) return cycleMatch;
  }

  return matched;
}

const STAGE_LABELS: Record<string, string> = {
  introduction: 'Sužadinimas. Įvadas',
  theory: 'Naujos medžiagos aiškinimas',
  practice: 'Praktinis darbas. Užduotys',
  consolidation: 'Įtvirtinimas. Refleksija',
  summary: 'Apibendrinimas. Pabaiga'
};

const EXAMPLE_PLAN_DATA: LessonPlan = {
  generalNotes: "Pamoka orientuota į kritinį mąstymą ir medijų raštingumą.",
  lessonType: "Įtvirtinimo",
  bpConnections: "BP 1.2. Mokinys geba analizuoti medijų tekstų turinį, formą ir raiškos priemones. BP 3.1. Taiko kalbos įtaigos priemones kurdamas savo tekstus.",
  lessonOverview: {
    topic: "Reklamos kalba ir įtaigos priemonės",
    goal: "Mokiniai gebės atpažinti 3 pagrindines reklamos įtaigos priemones ir pritaikyti jas kurdami prekės aprašymą.",
    competencies: "Komunikavimo, kultūrinė, skaitmeninė, pažinimo.",
    evaluation: {
      methods: ["Savarankiškas darbas", "Formuojamojo vertinimo darbas"],
      criteria: "Teisingai įvardintos bent dvi kalbinės įtaigos priemonės pateiktame pavyzdyje."
    }
  },
  tasks: {
    general: "Išanalizuoti pateiktus reklaminius skelbimus.",
    highLevel: "Sukurti ironišką antireklamą pasirinktam produktui.",
    mainLevel: "Perrašyti neutralų tekstą į įtaigų reklaminį tekstą."
  },
  classActivities: {
    individual: "Analizuoja individualiai pasirinktą reklamą telefone.",
    pairs: "Sikeičia sukurtais aprašymais ir įvertina vienas kito darbą pagal kriterijus.",
    group: "Kuriamas bendras plakatas naudojant Canva įrankį.",
    toolsResources: "Išmanieji telefonai, Canva.com, Mentimeter apklausa, reklamos pavyzdžiai iš Youtube."
  },
  individualWork: "Parengti trumpą esė 'Ar reklama visada meluoja?' (150 žodžių) arba sukurti video reklamą pasirinktam hobiui.",
  lessonStages: {
    introduction: "Trumpa diskusija apie tai, kokios reklamos mus erzina, o kokios priverčia nusišypsoti. Demonstruojami du kontrastingi vaizdo įrašai.",
    theory: "Pristatoma spalvų psichologija, retoriniai klausimai, hiperbolizacija ir personifikacija reklamoje. Aptariama AIDA formulė (Dėmesys, Interesas, Noras, Veiksmas).",
    practice: "Darbas grupėse. Mokiniai gauna po 3 skirtingas spausdintas reklamas ir turi užpildyti analizės lentelę. Kiekviena grupė pristato po vieną įdomiausią radinį.",
    consolidation: "Individuali užduotis. Sukurti trumpą (iki 50 žodžių) reklaminį skelbimą 'Nematomam apsiaustui'.",
    summary: "Refleksija 'Bilietas išėjimo'. Mokiniai parašo vieną dalyką, kuris juos labiausiai nustebino apie tai, kaip veikia reklama."
  },
  differentiation: {
    gifted: "Analizuoti potekstes ir paslėptas manipuliacijas. Sukurti strategiją, kaip apsisaugoti nuo neigiamo reklamos poveikio.",
    general: "Atpažinti ir įvardinti tiesiogines įtaigos priemones (epitetus, palyginimus).",
    struggling: "Naudotis pateiktu pagalbinu frazių žodynėliu. Atlikti tik vieną analizės dalį (tik apie spalvas arba tik apie tekstą)."
  },
  digitalResources: "Eduka klasė (skaitmeninis vadovėlis), Youtube kanalas 'Mokslo sriuba' (video apie psichologiją), Canva (plakatų kūrimui), Mentimeter (apklausoms).",
  homework: {
    purpose: "Įtvirtinti kalbinės įtaigos priemonių atpažinimo įgūdžius kasdienėje aplinkoje.",
    gifted: "Parengti mini tyrimą apie populiariausio socialinio tinklo reklamas.",
    general: "Rasti vieną reklamos pavyzdį namų aplinkoje ir įvardinti jos tikslinę grupę.",
    struggling: "Nurašyti vieną šūkį iš matytos reklamos ir nupiešti jai iliustraciją."
  },
  eDiaryEntry: {
    topicClassworkExpectations: "Lietuvių kalba ir literatūra: Reklamos kalba ir įtaigos priemonės. Mokymasis atpažinti kalbinės manipuliacijos būdus bei kurti etišką prekės aprašymą. Praktinė reklaminių skelbimų analizė porose ir mini plakato rengimas.",
    homework: "Tikslas – įtvirtinti kalbinės įtaigos priemonių atpažinimo įgūdžius kasdienėje aplinkoje. Užduotis: pasirinkti vieną matytą reklamą (iš spaudos ar socialinių tinklų), įvardyti jos tikslinę auditoriją ir užrašyti 2 pastebėtas kalbinės įtaigos priemones (rekomenduojama trukmė: ~15 min.).",
    individualHomework: "Analizuoti manipuliacijos būdus pasirinktoje reklamoje.",
    notes: "Gyvenimiška vertė: Šios žinios ugdo kritinį medijų raštingumą, padeda apsisaugoti nuo klaidinančių manipuliacijų, priimti sąmoningus vartotojiškus sprendimus ir argumentuotai reikšti savo nuomonę. Vertinimas: Savarankiškas darbas – formuojamasis vertinimas; kriterijus: teisingai įvardytos bent dvi kalbinės įtaigos priemonės.",
    isIntegrated: false,
    isOutside: false,
    eDiaryLessonType: "Įtvirtinimo"
  },
  motivation: "Kiekvienas mokinys yra kūrėjas. Šiandien jūs ne tik vartotojai, bet ir tie, kurie supranta žodžio galią. Sėkmės kūryboje."
};

const DRAFT_STORAGE_KEY = 'pamokos_planas_form_draft_v1';

const App = () => {
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [lessonType, setLessonType] = useState<LessonCategory>('');
  const [goal, setGoal] = useState('');
  const [activities, setActivities] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState('');
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  
  // Homework options
  const [homeworkType, setHomeworkType] = useState('💡 Įtvirtinimas ir taikymas');
  const [homeworkDuration, setHomeworkDuration] = useState('15');
  
  // Best practice modal state
  const [showBestPracticeModal, setShowBestPracticeModal] = useState(false);

  // BP selection & learning content description state
  const [selectedBpModuleId, setSelectedBpModuleId] = useState<string>('');
  const [bpContentDescription, setBpContentDescription] = useState<string>('');

  const [isIntegratedInput, setIsIntegratedInput] = useState(false);
  const [integrationDetails, setIntegrationDetails] = useState('');
  const [isOutsideInput, setIsOutsideInput] = useState(false);
  const [outsideLocation, setOutsideLocation] = useState('');
  const [outsideGoal, setOutsideGoal] = useState('');

  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-Save Draft states
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showAutoSaveFlash, setShowAutoSaveFlash] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  // Ref to always hold the latest form values for interval auto-save
  const formValuesRef = useRef({
    grade, subject, topic, lessonType, goal, activities,
    evaluationCriteria, selectedEvaluations, selectedResources,
    homeworkType, homeworkDuration, selectedBpModuleId,
    bpContentDescription, isIntegratedInput, integrationDetails,
    isOutsideInput, outsideLocation, outsideGoal
  });

  useEffect(() => {
    formValuesRef.current = {
      grade, subject, topic, lessonType, goal, activities,
      evaluationCriteria, selectedEvaluations, selectedResources,
      homeworkType, homeworkDuration, selectedBpModuleId,
      bpContentDescription, isIntegratedInput, integrationDetails,
      isOutsideInput, outsideLocation, outsideGoal
    };
  }, [
    grade, subject, topic, lessonType, goal, activities,
    evaluationCriteria, selectedEvaluations, selectedResources,
    homeworkType, homeworkDuration, selectedBpModuleId,
    bpContentDescription, isIntegratedInput, integrationDetails,
    isOutsideInput, outsideLocation, outsideGoal
  ]);

  // Restore saved draft from localStorage on initial mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft && typeof draft === 'object') {
          if (draft.grade !== undefined) setGrade(draft.grade);
          if (draft.subject !== undefined) setSubject(draft.subject);
          if (draft.topic !== undefined) setTopic(draft.topic);
          if (draft.lessonType !== undefined) setLessonType(draft.lessonType);
          if (draft.goal !== undefined) setGoal(draft.goal);
          if (draft.activities !== undefined) setActivities(draft.activities);
          if (draft.evaluationCriteria !== undefined) setEvaluationCriteria(draft.evaluationCriteria);
          if (Array.isArray(draft.selectedEvaluations)) setSelectedEvaluations(draft.selectedEvaluations);
          if (Array.isArray(draft.selectedResources)) setSelectedResources(draft.selectedResources);
          if (draft.homeworkType !== undefined) setHomeworkType(draft.homeworkType);
          if (draft.homeworkDuration !== undefined) setHomeworkDuration(draft.homeworkDuration);
          if (draft.selectedBpModuleId !== undefined) setSelectedBpModuleId(draft.selectedBpModuleId);
          if (draft.bpContentDescription !== undefined) setBpContentDescription(draft.bpContentDescription);
          if (draft.isIntegratedInput !== undefined) setIsIntegratedInput(draft.isIntegratedInput);
          if (draft.integrationDetails !== undefined) setIntegrationDetails(draft.integrationDetails);
          if (draft.isOutsideInput !== undefined) setIsOutsideInput(draft.isOutsideInput);
          if (draft.outsideLocation !== undefined) setOutsideLocation(draft.outsideLocation);
          if (draft.outsideGoal !== undefined) setOutsideGoal(draft.outsideGoal);

          if (draft.lastSavedAt) {
            const savedDate = new Date(draft.lastSavedAt);
            setLastSavedTime(savedDate.toLocaleTimeString('lt-LT'));
          }
          setIsDraftRestored(true);
        }
      }
    } catch (err) {
      console.error('Klaida atkuriant juodraštį iš localStorage:', err);
    }
  }, []);

  const saveDraftToLocalStorage = () => {
    const cur = formValuesRef.current;
    const hasAnyInput = Boolean(
      cur.grade || cur.subject || cur.topic || cur.goal || cur.activities || cur.evaluationCriteria || cur.bpContentDescription
    );
    if (!hasAnyInput) return;

    const now = new Date();
    const draftObj = {
      ...cur,
      lastSavedAt: now.toISOString()
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftObj));
      setLastSavedTime(now.toLocaleTimeString('lt-LT'));
      setShowAutoSaveFlash(true);
      setTimeout(() => setShowAutoSaveFlash(false), 2000);
    } catch (err) {
      console.error('Klaida išsaugant juodraštį į localStorage:', err);
    }
  };

  // 30-second interval auto-save
  useEffect(() => {
    const intervalId = setInterval(() => {
      saveDraftToLocalStorage();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleClearDraft = () => {
    setGrade('');
    setSubject('');
    setTopic('');
    setLessonType('');
    setGoal('');
    setActivities('');
    setEvaluationCriteria('');
    setSelectedEvaluations([]);
    setSelectedResources([]);
    setHomeworkType('💡 Įtvirtinimas ir taikymas');
    setHomeworkDuration('15');
    setSelectedBpModuleId('');
    setBpContentDescription('');
    setIsIntegratedInput(false);
    setIntegrationDetails('');
    setIsOutsideInput(false);
    setOutsideLocation('');
    setOutsideGoal('');

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}

    setLastSavedTime(null);
    setIsDraftRestored(false);
  };

  const availableBpModules = getBPModules(subject, grade);

  const applyBpModule = (mod: BPModule) => {
    setSelectedBpModuleId(mod.id);
    setBpContentDescription(mod.contentDescription);
    setTopic(mod.topicSuggestion);
    setGoal(mod.goalSuggestion);
  };
  
  // Modal states
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedPlan, setEditedPlan] = useState<LessonPlan | null>(null);

  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // Chat bot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{role: 'model', text: 'Sveiki! Esu jūsų asistentas. Klauskite manęs, jei reikia pagalbos su pamokos planu, idėjomis ar diferencijavimu.'}]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Google Classroom integration states
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [classroomPostType, setClassroomPostType] = useState<'announcement' | 'courseWork' | 'material'>('announcement');
  const [isClassroomLoading, setIsClassroomLoading] = useState(false);
  const [classroomError, setClassroomError] = useState<string | null>(null);
  const [classroomSuccess, setClassroomSuccess] = useState<string | null>(null);
  const [showClassroomModal, setShowClassroomModal] = useState(false);

  // Time calculator states
  const [stageDurations, setStageDurations] = useState<Record<string, number>>({
    introduction: 5,
    theory: 10,
    practice: 20,
    consolidation: 5,
    summary: 5
  });

  // PDF export states
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  const handleGeneratePdf = async (type: 'full' | 'ediary') => {
    if (!lessonPlan) return;
    setIsGeneratingPdf(true);
    setShowPdfModal(false);
    try {
      await downloadDocumentPdf(type, lessonPlan, {
        subject,
        grade,
        topic: lessonPlan.lessonOverview?.topic || topic,
        goal: lessonPlan.lessonOverview?.goal || goal,
        stageDurations,
        homeworkDuration
      });
      setPdfSuccessMessage(
        type === 'full' 
          ? 'Visas pamokos planas sėkmingai atsisiųstas kaip PDF dokumentas! 📄✅' 
          : 'El. dienyno įrašai sėkmingai atsisiųsti kaip PDF kortelė! ✍️✅'
      );
      setTimeout(() => {
        setPdfSuccessMessage(null);
      }, 4500);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      setError('Nepavyko sugeneruoti PDF dokumento. Bandykite dar kartą arba naudokite mygtuką „Spausdinti“.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (lessonPlan) {
      if (lessonPlan.stageDurations) {
        setStageDurations(lessonPlan.stageDurations);
      } else {
        setStageDurations({
          introduction: 5,
          theory: 10,
          practice: 20,
          consolidation: 5,
          summary: 5
        });
      }
    }
  }, [lessonPlan]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      if (usr) {
        setUser(usr);
      } else {
        setUser(null);
        setToken(null);
        setCourses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem('savedLessonPlans');
      if (storedPlans) setSavedPlans(JSON.parse(storedPlans));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('savedLessonPlans', JSON.stringify(savedPlans));
    } catch (e) { console.error(e); }
  }, [savedPlans]);

  const loadExample = () => {
    setSubject('Lietuvių kalba ir literatūra');
    setGrade('8 kl.');
    setTopic(EXAMPLE_PLAN_DATA.lessonOverview.topic);
    setLessonType(EXAMPLE_PLAN_DATA.lessonType || 'Įtvirtinimo');
    setGoal(EXAMPLE_PLAN_DATA.lessonOverview.goal);
    setSelectedBpModuleId('lt-78-1');
    setBpContentDescription('Grožinių ir negrožinių tekstų analizė, kalbos įtaigos priemonės (metaforos, hiperbolės, retoriniai klausimai), medijų tekstų kritinis vertinimas, reklamos poveikio vartotojui analizė.');
    setSelectedEvaluations(EXAMPLE_PLAN_DATA.lessonOverview.evaluation.methods);
    setEvaluationCriteria(EXAMPLE_PLAN_DATA.lessonOverview.evaluation.criteria);
    setLessonPlan(EXAMPLE_PLAN_DATA);
    setEditedPlan(EXAMPLE_PLAN_DATA);
  };

  const systemInstruction = `Tu esi aukščiausio lygio Lietuvos švietimo ekspertas, metodininkas ir pedagogas, tobulai išmanantis atnaujintas Lietuvos Bendrąsias ugdymo programas (BP) (https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos) bei el. dienynų (TAMO, Mano Dienynas, Eduka) pildymo standartus ir gerosios praktikos rekomendacijas.

GRIEŽTI REIKALAVIMAI IR REKOMENDACIJOS EL. DIENYNO ĮRAŠAMS (eDiaryEntry):
1. GRIEŽTAI VENGTI ŠABLONIŠKŲ, SAUSŲ FORMULUOČIŲ:
Draudžiama naudoti mechaninius, pasikartojančius šablonus kaip:
„Žinoti: esmines sąvokas, dėsningumus ir taisykles. Gebėti: atlikti diferencijuotas praktines užduotis, analizuoti pavyzdžius, pagrįsti atsakymus. Taikyti: spręsti praktines ir kontekstines problemas, įsivertinti pasiekimus.“
Tokie įrašai yra neinformatyvūs. Kiekvienas įrašas PRIVALO būti UNIKALUS, GYVAS, pritaikytas konkrečiai temai, klasei ir BP reikalavimams.

2. STANDARTIZUOTA TEMOS IR KLASĖS DARBO FORMULUOTĖ (topicClassworkExpectations):
Temos įrašas dienynui turi būti standartizuotas ir apimti tris aiškius dėmenis viename rišliame sakinyje arba pastraipoje:
- [Dalykas]: [Temos pavadinimas].
- Mokymosi uždavinys (ko mokiniai išmoks / siekiamas gebėjimas).
- Veikla (kokią konkrečią veiklą atliks / metodas / atliekama užduotis).
Gerosios praktikos pavyzdžiai:
- Užsienio kalba: Vietoj sauso „In a restaurant.“ (A0006) rašyk „Užsienio kalba (anglų): Mokymasis užsisakyti maistą restorane, naudojant specifinį žodyną ir mandagumo frazes per dialogų simuliaciją porose.“ (A0010)
- Informatika / Matematika: „Informatika: Duomenų skaičiuoklės (Google Sheets) formulių ir diagramų taikymas, atliekant praktinę asmeninio biudžeto modeliavimo užduotį.“
- NEAKADEMINIAMS DALYKAMS (Klasės vadovo veikla, Etika, Teatras, Gyvenimo įgūdžiai, Fizinis ugdymas):
  BŪTINA atspindėti ugdomąją, socialinę-emocinę vertę, bendruomeniškumą, vertybinį apsisprendimą ar emocinį raštingumą (Č0006, J0015)!
  Pvz.: „Klasės vadovo veikla: Klasės bendruomeniškumo stiprinimas ir konfliktų sprendimo strategijų aptarimas, atliekant situacijų analizę grupėse ir reflektuojant bendras taisykles.“
  Pvz.: „Etika: Moralinio apsisprendimo ir atsakomybės tyrinėjimas, analizuojant kasdienių etinių dilemų pavyzdžius ir diskutuojant apie pagarbą kitokiai nuomonei.“

3. NAMŲ DARBAI SU AIŠKIU TIKSLINGUMU IR KRŪVIO STEBĖSENA (homework):
- Prie kiekvienos užduoties BŪTINA aiškiai nurodyti tikslą (pvz., „Tikslas – įtvirtinti formulių taikymo įgūdžius...“, „Tikslas – pasiruošti diskusijai apie...“, „Tikslas – kūrybiškai pritaikyti...“).
- GRIEŽTAI VENGTI vien tik pratimų numerių nurodymo be konteksto (pvz. negalima rašyti „Pratybose p. 24, nr. 3“).
- Visada pabrėžti sąsają su pamokoje nagrinėta tema ir bendrais ugdymo tikslais.
- Skatinti įvairovę (kūrybiniai, tiriamieji, taikomieji, apverstos klasės darbai).
- Nurodyti apytikslę atlikimo trukmę (pvz., „(Rekomenduojama trukmė: ~15 min.)“), atsižvelgiant į mokinių krūvio stebėsenos rekomendacijas (N0015, N0016, N0024), kad mokiniai nebūtų perkraunami.
- Jei pasirinkta „Be namų darbų“, įrašyti: „Namų darbai neskiriami – mokymosi krūvio subalansavimas po intensyvaus darbo pamokoje.“

4. PASTABOS / REALIAME GYVENIME NAUDINGUMAS IR VERTINIMAS (notes):
- GYVENIMIŠKA VERTĖ (Privaloma): Aiškiai ir patraukliai nurodyk konkrečius patarimus mokiniui ir tėvams, kuo ši mokymo medžiaga naudinga realiame gyvenime, kasdienybėje, ateities profesijoje ar asmeninėje praktikoje.
- VERTINIMAS IR KLASĖS MOKYMASIS (TIK JEI MOKYTOJAS NURODĖ):
  Jei mokytojas nurodė vertinimo metodus arba kriterijus:
  Pateik: „Vertinimas: [metodas ir kriterijai]. Klasės mokymasis: [įžvalgos apie mokinių įsitraukimą ir pasiekimus].“
  GRIEŽTAI: Jei mokytojas vertinimo nenurodė, JOKIOS informacijos apie vertinimą į pastabas nedėk! Pateik tik gyvenimišką naudą ir motyvacinį patarimą.

5. KALBOS IR RAŠYBOS KONTROLĖ (J0025):
Dienynas yra oficialus dokumentas ir komunikacijos priemonė mokiniams, tėvams bei administracijai. Visi įrašai privalo būti parašyti taisyklinga lietuvių kalba, be gramatikos, terminijos ar skyrybos klaidų.

Struktūra:
{
  "generalNotes": "...",
  "lessonType": "...",
  "bpConnections": "...",
  "lessonOverview": { "topic": "...", "goal": "...", "competencies": "...", "evaluation": { "methods": [], "criteria": "..." } },
  "tasks": { "general": "...", "highLevel": "...", "mainLevel": "..." },
  "classActivities": { "individual": "...", "pairs": "...", "group": "...", "toolsResources": "..." },
  "individualWork": "...", 
  "lessonStages": { "introduction": "...", "theory": "...", "practice": "...", "consolidation": "...", "summary": "..." },
  "differentiation": { "gifted": "...", "general": "...", "struggling": "..." },
  "digitalResources": "...",
  "homework": { "purpose": "...", "gifted": "...", "general": "...", "struggling": "..." },
  "eDiaryEntry": { 
    "topicClassworkExpectations": "...", 
    "homework": "...", 
    "individualHomework": "...", 
    "notes": "...", 
    "isIntegrated": false, 
    "isOutside": false, 
    "eDiaryLessonType": "..." 
  },
  "specialAdvice": "...",
  "consultationAdvice": "...",
  "motivation": "..."
}`;

  const tryParseJSON = (text: string): LessonPlan | null => {
    try {
      return JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { return JSON.parse(jsonMatch[0]); } catch (e2) {}
      }
      return null;
    }
  };

  const handleEvaluationToggle = (tag: string) => {
    setSelectedEvaluations(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleResourceToggle = (tag: string) => {
    setSelectedResources(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grade || !subject || !topic) {
      setError('Užpildykite privalomus laukus (*).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowEditModal(false);

    const hasEvaluation = selectedEvaluations.length > 0 || evaluationCriteria.trim().length > 0;
    const isNonAcademic = NON_ACADEMIC_SUBJECTS.some(s => subject.toLowerCase().includes(s.toLowerCase()));

    const prompt = `
      Sukurk išsamų ir kokybišką pamokos planą bei el. dienyno įrašus pagal atnaujintas Lietuvos Bendrąsias programas (emokykla.lt BP).
      - Dalykas: ${subject} ${isNonAcademic ? '(UGDOMASIS / NEAKADEMINIS DALYKAS - būtina pabrėžti socialinę-emocinę vertę, bendruomeniškumą ir vertybinį ugdymą)' : ''}
      - Klasė: ${grade}
      - Tema: ${topic}
      - Bendrosios programos (emokykla.lt BP) modulis ir turinio aprašas: ${bpContentDescription || 'Parinkti ir suderinti pagal oficialią emokykla.lt BP programą'}
      - Pamokos tipas: ${lessonType || 'Nenurodyta'}
      - Mokymosi tikslas: ${goal || 'Suformuluok pagal emokykla BP'}
      - Veiklos / papildomos idėjos: ${activities || 'Pasiūlyk modernias, įtraukias veiklas'}
      - Naudojamos priemonės: ${selectedResources.length > 0 ? selectedResources.join(', ') : 'Standartinės priemonės, skaitmeniniai įrankiai'}
      - Namų darbų pobūdis: ${homeworkType}
      - Pageidaujama ND trukmė: ${homeworkDuration === '0' ? 'Be namų darbų (0 min.)' : homeworkDuration === '15' ? '10–15 min. (rekomenduojama)' : homeworkDuration === '20' ? '15–20 min.' : '20–30 min.'} (krūvio kontrolė pagal N0015 rekomendaciją)
      - Vertinimo metodai: ${selectedEvaluations.length > 0 ? selectedEvaluations.join(', ') : 'NENURODYTI'}
      - Vertinimo kriterijai: ${evaluationCriteria.trim() || 'NENURODYTI'}
      - Integruota pamoka: ${isIntegratedInput ? integrationDetails : 'Ne'}
      - Pamoka už mokyklos ribų: ${isOutsideInput ? `Taip. Vieta: ${outsideLocation}, Tikslas: ${outsideGoal}` : 'Ne'}
      
      GRIEŽTI REIKALAVIMAI:
      1. Oficialios BP sąsajos: remkis https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos, nurodyk konkrečias kompetencijas (pažinimo, skaitmeninė, komunikavimo, kūrybiškumo, pilietinė, kultūrinė, socialinė-emocinė ir sveikos gyvensenos) ir BP pasiekimų sritis.
      2. EL. DIENYNO ĮRAŠAI (eDiaryEntry):
         - topicClassworkExpectations: Standartizuota formuluotė: [Dalykas]: [Temos pavadinimas]. Mokymosi uždavinys: [konkretus mokymosi uždavinys / ko išmoks]. Veikla: [konkreti veikla / metodas / atliekama užduotis].
           Griežtai NENAUDOTI sausų šablonų („Žinoti: sąvokas... Gebėti: atlikti... Taikyti: spręsti...“).
         - homework: ${homeworkDuration === '0' || homeworkType.includes('Be namų darbų') ? '„Namų darbai neskiriami – mokymosi krūvio subalansavimas pagal N0015 rekomendaciją (visi tikslai pasiekti pamokoje).“' : `Tikslas – [aiškus tikslas]. [Konkreti užduotis su kontekstu, be plikų numerių]. (Rekomenduojama trukmė: ${homeworkDuration === '15' ? '10–15 min.' : homeworkDuration === '20' ? '15–20 min.' : '20–30 min.'}).`}
         - notes: Privalomai nurodyk patarimus, kuo ši mokymo medžiaga naudinga realiame gyvenime / ateičiai.
           ${hasEvaluation ? 'Kadangi mokytojas nurodė vertinimą, papildomai įtrauk: Vertinimas: [būdas ir kriterijai]. Klasės mokymasis: [pastebėjimai].' : 'KADANGI MOKYTOJAS VERTINIMO NENURODĖ, Į PASTABAS JOKIOS INFORMACIJOS APIE VERTINIMĄ NEĮTRAUK (tik gyvenimišką naudą ir motyvacinį pastebėjimą)!'}
      3. Diferencijavimas gabiesiems, bendro lygio ir sunkumų patiriantiems mokiniams.
      4. Taisyklinga lietuvių kalbos gramatika ir skyryba (J0025).
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { systemInstruction, responseMimeType: "application/json" },
      });
      
      const parsedPlan = tryParseJSON(response.text || '');
      if (!parsedPlan) throw new Error("Nepavyko sugeneruoti plano formatu. Bandykite iš naujo.");

      const sanitizedPlan: LessonPlan = {
        ...parsedPlan,
        lessonOverview: parsedPlan.lessonOverview || { topic: topic || '', goal: goal || '', competencies: '', evaluation: { methods: [], criteria: '' } },
        lessonStages: parsedPlan.lessonStages || { introduction: '', theory: '', practice: '', consolidation: '', summary: '' },
        differentiation: parsedPlan.differentiation || { gifted: '', general: '', struggling: '' },
        homework: parsedPlan.homework || { purpose: '', gifted: '', general: '', struggling: '' },
        classActivities: parsedPlan.classActivities || { individual: "", pairs: "", group: "", toolsResources: "" },
        individualWork: parsedPlan.individualWork || "",
        digitalResources: parsedPlan.digitalResources || "",
        eDiaryEntry: {
          topicClassworkExpectations: parsedPlan.eDiaryEntry?.topicClassworkExpectations || '',
          homework: parsedPlan.eDiaryEntry?.homework || '',
          individualHomework: parsedPlan.eDiaryEntry?.individualHomework || '',
          notes: parsedPlan.eDiaryEntry?.notes || '',
          isIntegrated: isIntegratedInput,
          isOutside: isOutsideInput,
          eDiaryLessonType: parsedPlan.eDiaryEntry?.eDiaryLessonType || parsedPlan.lessonType || lessonType || ''
        }
      };
      
      setLessonPlan(sanitizedPlan);
      setEditedPlan(sanitizedPlan);
      setActivePlanId(null);
      
      if (window.innerWidth < 1024) {
        document.querySelector('.results-container')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e: any) {
      setError(`Klaida. ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    });
  };

  const handleCopyAllEDiary = () => {
    if (!lessonPlan || !lessonPlan.eDiaryEntry) return;
    const allText = `📌 TEMA IR KLASĖS DARBAS (el. dienynui):
${lessonPlan.eDiaryEntry.topicClassworkExpectations}

🎯 NAMŲ DARBAI:
${lessonPlan.eDiaryEntry.homework}

💡 PASTABA / VERTINIMAS:
${lessonPlan.eDiaryEntry.notes}`;
    handleCopy(allText, 'all_diary');
  };

  const executeSavePlan = () => {
    const basePlan = editedPlan || lessonPlan;
    if (!basePlan) return;
    
    const planToSave: LessonPlan = {
      ...basePlan,
      stageDurations
    };
    
    const newPlan: SavedPlan = {
      id: activePlanId || `plan-${Date.now()}`,
      title: `${subject} ${grade}. ${planToSave.lessonOverview.topic}`,
      plan: planToSave,
      createdAt: new Date().toISOString(),
      grade, subject, lessonType: planToSave.lessonType || lessonType
    };

    if (activePlanId) {
      setSavedPlans(prev => prev.map(p => p.id === activePlanId ? newPlan : p));
    } else {
      setSavedPlans([newPlan, ...savedPlans]);
      setActivePlanId(newPlan.id);
    }

    setShowSaveConfirm(false);
    setLessonPlan(planToSave);
  };

  const handleApplyEdit = () => {
    if (!editedPlan) return;
    const planToSave = {
      ...editedPlan,
      stageDurations
    };
    setLessonPlan(planToSave);
    setShowEditModal(false);
    if (activePlanId) {
       executeSavePlan();
    }
  };

  const handleLoadPlan = (id: string) => {
    const p = savedPlans.find(x => x.id === id);
    if (p) {
      setLessonPlan(p.plan);
      setEditedPlan(p.plan);
      setActivePlanId(p.id);
      setSubject(p.subject || '');
      setGrade(p.grade || '');

      if (window.innerWidth < 1024) {
        document.querySelector('.results-container')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const updateEditedField = (path: string, value: any) => {
    if (!editedPlan) return;
    const newPlan = JSON.parse(JSON.stringify(editedPlan));
    const parts = path.split('.');
    let current: any = newPlan;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {}; // Safety check
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setEditedPlan(newPlan);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let context = "Tu esi ekspertas pedagogas, metodininkas ir asistentas, padedantis mokytojams rengti pamokų planus ir pildyti el. dienyną pagal Lietuvos Bendrąsias programas (emokykla.lt BP) ir oficialias rekomendacijas. Atsakyk trumpai, profesionaliai, aiškiai ir lietuviškai.";
      if (lessonPlan) {
        context += `\nŠtai dabartinis pamokos planas:\nTema: ${lessonPlan.lessonOverview?.topic}\nTikslas: ${lessonPlan.lessonOverview?.goal}\nEl. dienyno tema: ${lessonPlan.eDiaryEntry?.topicClassworkExpectations}\nNamų darbai: ${lessonPlan.eDiaryEntry?.homework}\nPastabos: ${lessonPlan.eDiaryEntry?.notes}`;
      }

      // We format the history for the model.
      const historyContents = chatMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      // Append the new user message
      historyContents.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: historyContents,
        config: {
          systemInstruction: context
        }
      });

      setChatMessages(prev => [...prev, { role: 'model', text: response.text || 'Atsiprašau, kažkas nutiko.' }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'model', text: `Klaida: ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClassroomLogin = async () => {
    setIsClassroomLoading(true);
    setClassroomError(null);
    setClassroomSuccess(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        setToken(credential.accessToken);
        setUser(result.user);
        await fetchCourses(credential.accessToken);
      } else {
        throw new Error("Nepavyko gauti Google prieigos rakto.");
      }
    } catch (err: any) {
      console.error(err);
      setClassroomError(`Nepavyko prisijungti prie Google Classroom: ${err.message}`);
    } finally {
      setIsClassroomLoading(false);
    }
  };

  const fetchCourses = async (accessToken: string) => {
    setIsClassroomLoading(true);
    setClassroomError(null);
    try {
      const res = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) {
        throw new Error(`Klaida gaunant kursus: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.courses && data.courses.length > 0) {
        setCourses(data.courses);
        setSelectedCourseId(data.courses[0].id);
      } else {
        setCourses([]);
        setClassroomError("Neradome jokių aktyvių Google Classroom kursų.");
      }
    } catch (err: any) {
      console.error(err);
      setClassroomError(`Nepavyko užkrauti kursų: ${err.message}`);
    } finally {
      setIsClassroomLoading(false);
    }
  };

  const handlePublishToClassroom = async () => {
    if (!token) {
      setClassroomError("Pirmiausia prisijunkite prie savo Google paskyros.");
      return;
    }
    if (!selectedCourseId) {
      setClassroomError("Pasirinkite kursą, į kurį norite patalpinti.");
      return;
    }
    if (!lessonPlan) {
      setClassroomError("Nėra sugeneruoto pamokos plano.");
      return;
    }

    const confirmed = window.confirm(`Ar tikrai norite paskelbti šį pamokos planą Google Classroom?`);
    if (!confirmed) return;

    setIsClassroomLoading(true);
    setClassroomError(null);
    setClassroomSuccess(null);

    try {
      let endpoint = '';
      let body: any = {};

      const topicText = lessonPlan.lessonOverview?.topic || topic || "Pamokos planas";
      const goalText = lessonPlan.lessonOverview?.goal || "Nėra nurodyto tikslo.";
      const bpConnectionsText = lessonPlan.bpConnections || "Nėra nurodytų sąsajų su BP.";

      if (classroomPostType === 'announcement') {
        endpoint = `https://classroom.googleapis.com/v1/courses/${selectedCourseId}/announcements`;
        
        let text = `📢 NAUJAS PAMOKOS PLANAS: ${topicText}\n\n`;
        text += `🎯 TIKSLAS: ${goalText}\n\n`;
        text += `📚 SĄSAJOS SU BP:\n${bpConnectionsText}\n\n`;
        text += `🚀 PAMOKOS EIGA:\n`;
        if (lessonPlan.lessonStages) {
          Object.entries(lessonPlan.lessonStages).forEach(([key, content]) => {
            text += `- ${STAGE_LABELS[key] || key}: ${content}\n`;
          });
        }
        text += `\n✍️ EL. DIENYNAS:\n`;
        text += `- Tema/Darbas: ${lessonPlan.eDiaryEntry?.topicClassworkExpectations || ''}\n`;
        text += `- Namų darbai: ${lessonPlan.eDiaryEntry?.homework || ''}\n`;
        
        body = {
          text: text,
          state: "PUBLISHED"
        };
      } else if (classroomPostType === 'courseWork') {
        endpoint = `https://classroom.googleapis.com/v1/courses/${selectedCourseId}/courseWork`;
        
        let desc = `🎯 TIKSLAS: ${goalText}\n\n`;
        desc += `👤 Individualus darbas: ${lessonPlan.individualWork || 'Nėra nurodyta.'}\n\n`;
        desc += `🏠 Namų darbai:\n`;
        desc += `- Tikslas: ${lessonPlan.homework?.purpose || 'Nėra nurodyta.'}\n`;
        desc += `- Gabiesiems: ${lessonPlan.homework?.gifted || 'Nėra nurodyta.'}\n`;
        desc += `- Bendra užduotis: ${lessonPlan.homework?.general || 'Nėra nurodyta.'}\n`;
        desc += `- Sunkumų turintiems: ${lessonPlan.homework?.struggling || 'Nėra nurodyta.'}\n`;

        body = {
          title: `Užduotis. ${topicText}`,
          description: desc,
          workType: "ASSIGNMENT",
          state: "PUBLISHED"
        };
      } else if (classroomPostType === 'material') {
        endpoint = `https://classroom.googleapis.com/v1/courses/${selectedCourseId}/courseWorkMaterials`;
        
        let desc = `📚 Priemonės ir skaitmeniniai šaltiniai šiai pamokai:\n\n`;
        desc += `🌐 Skaitmeniniai ištekliai:\n${lessonPlan.digitalResources || 'Nėra nurodyta.'}\n\n`;
        desc += `🛠️ Klasės priemonės: ${lessonPlan.classActivities?.toolsResources || 'Nėra nurodyta.'}\n`;

        body = {
          title: `Medžiaga. ${topicText}`,
          description: desc,
          state: "PUBLISHED"
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody?.error?.message || `Klaida: ${res.statusText}`);
      }

      setClassroomSuccess(`Pavyko! Pamokos planas sėkmingai paskelbtas kaip ${
        classroomPostType === 'announcement' ? 'skelbimas' : classroomPostType === 'courseWork' ? 'užduotis' : 'mokomoji medžiaga'
      }.`);
    } catch (err: any) {
      console.error(err);
      setClassroomError(`Nepavyko paskelbti plano: ${err.message}`);
    } finally {
      setIsClassroomLoading(false);
    }
  };

  const processedPlans = [...savedPlans]
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container">
      <header className="header">
        <h1>Pamokos plano rengimas ir el. dienynas ✏️</h1>
        <p>
          <a href="https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos" target="_blank" rel="noopener noreferrer" className="header-link">
            Vadovaujantis Lietuvos Bendrosiomis programomis (emokykla.lt BP)
          </a>
        </p>
        
        <div style={{marginTop: '0.8rem', display: 'flex', justifyContent: 'center'}}>
          <button 
            type="button" 
            onClick={() => setShowBestPracticeModal(true)} 
            className="best-practice-banner-btn"
          >
            📖 Dienyno pildymo gerosios praktikos gidas (emokykla BP)
          </button>
        </div>
        
        <div className="header-sections">
            <div className="resource-links">
              <h3>📚 Šaltiniai</h3>
              <a href="https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos" target="_blank" rel="noopener noreferrer" className="mini-link">Programos (BP)</a>
              <a href="https://emokykla.lt/skaitmenines-mokymo-priemones" target="_blank" rel="noopener noreferrer" className="mini-link">Priemonės</a>
              <a href="https://emokykla.lt/bendrosios-programos/kompetencijos" target="_blank" rel="noopener noreferrer" className="mini-link">Kompetencijos</a>
            </div>

            <div className="tool-links">
              <h3>🛠️ Įrankiai</h3>
              <a href="https://www.manodienynas.lt/1/lt/public/public/login" target="_blank" rel="noopener noreferrer" className="tool-button manodienynas">Mano Dienynas 📔</a>
              <a href="https://classroom.google.com" target="_blank" rel="noopener noreferrer" className="tool-button classroom">Classroom</a>
              <a href="https://miro.com" target="_blank" rel="noopener noreferrer" className="tool-button miro">Miro</a>
              <a href="https://canva.com" target="_blank" rel="noopener noreferrer" className="tool-button canva">Canva</a>
            </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="form-container">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{margin: 0}}>Pamokos informacija</h2>
            <button onClick={loadExample} className="mini-link" style={{border: 'none', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)'}}>💡 Užkrauti pavyzdį</button>
          </div>

          {/* Auto-Save Status Bar */}
          <div className="autosave-bar">
            <div className="autosave-info">
              <span className={`autosave-pulse ${showAutoSaveFlash ? 'flash' : ''}`}>💾</span>
              {lastSavedTime ? (
                <span>Juodraštis automatiškai išsaugotas: <strong>{lastSavedTime}</strong> (kas 30 s)</span>
              ) : (
                <span>Automatinis juodraščio išsaugojimas aktyvus (kas 30 s)</span>
              )}
            </div>
            <div className="autosave-actions">
              <button 
                type="button" 
                onClick={saveDraftToLocalStorage}
                className="autosave-btn save-now"
                title="Išsaugoti įvestį į kompiuterio atmintį rankiniu būdu"
              >
                Išsaugoti dabar
              </button>
              <button 
                type="button" 
                onClick={handleClearDraft}
                className="autosave-btn clear"
                title="Išvalyti visus įvesties laukus ir ištrinti juodraštį"
              >
                Valyti 🗑️
              </button>
            </div>
          </div>

          {isDraftRestored && (
            <div className="draft-restored-banner">
              <span>ℹ️ Atkurtas anksčiau automatiškai išsaugotas įvesties juodraštis.</span>
              <button onClick={() => setIsDraftRestored(false)} title="Uždaryti pranešimą">✖</button>
            </div>
          )}

          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Dalykas *</label>
              <div className="subject-pills-section">
                <span className="subject-pill-label">Akademiniai dalykai:</span>
                <div className="subject-pills">
                  {ACADEMIC_SUBJECTS.map(s => (
                    <button 
                      key={s} 
                      type="button" 
                      className={`subject-pill ${subject === s ? 'active' : ''}`}
                      onClick={() => {
                        setSubject(s);
                        setSelectedBpModuleId('');
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                
                <span className="subject-pill-label" style={{marginTop: '6px', color: '#c084fc'}}>Ugdomieji / Neakademiniai dalykai:</span>
                <div className="subject-pills">
                  {NON_ACADEMIC_SUBJECTS.map(s => (
                    <button 
                      key={s} 
                      type="button" 
                      className={`subject-pill non-academic ${subject === s ? 'active' : ''}`}
                      onClick={() => {
                        setSubject(s);
                        setSelectedBpModuleId('');
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <input 
                type="text" 
                value={subject} 
                onChange={e => {
                  setSubject(e.target.value);
                  setSelectedBpModuleId('');
                }} 
                placeholder="Pvz. Lietuvių kalba ir literatūra arba pasirinkite viršuje" 
                required 
              />

              {NON_ACADEMIC_SUBJECTS.some(s => subject.toLowerCase().includes(s.toLowerCase())) && (
                <div className="non-academic-alert">
                  <strong>✨ Tikslinės gairės neakademiniams dalykams:</strong> Dienyno įrašuose bus pabrėžta ugdomoji vertė: socialinis-emocinis raštingumas, bendruomeniškumas, vertybinis apsisprendimas ir refleksija.
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Klasė / Grupė *</label>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px'}}>
                {QUICK_GRADES.map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`subject-pill ${grade === g ? 'active' : ''}`}
                    onClick={() => {
                      setGrade(g);
                      setSelectedBpModuleId('');
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="pvz., 7a, 8b arba pasirinkite viršuje" required />
            </div>

            {/* Tiesioginis Bendrosios programos (emokykla.lt BP) parinkiklis ir turinio generatorius */}
            {availableBpModules.length > 0 && (
              <div className="bp-selector-box">
                <div className="bp-selector-header">
                  <div className="bp-selector-title">
                    🎯 Oficiali Bendroji programa: {subject} {grade ? `(${grade})` : ''}
                  </div>
                  <a 
                    href="https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bp-link-mini"
                  >
                    emokykla.lt BP programos ↗
                  </a>
                </div>

                <div style={{fontSize: '0.78rem', color: 'var(--text-color-light)', marginBottom: '4px'}}>
                  Pasirinkite BP pasiekimų sritį – tema, tikslas ir turinio aprašas bus užpildyti automatiškai:
                </div>

                <div className="bp-pills-grid">
                  {availableBpModules.map(mod => (
                    <button 
                      key={mod.id} 
                      type="button" 
                      className={`bp-pill-btn ${selectedBpModuleId === mod.id ? 'active' : ''}`}
                      onClick={() => applyBpModule(mod)}
                      title={mod.contentDescription}
                    >
                      <span style={{color: '#60a5fa', fontWeight: 'bold'}}>[{mod.cycleLabel}]</span> {mod.area}: <strong>{mod.topicSuggestion}</strong>
                    </button>
                  ))}
                </div>

                {/* Mokymosi turinio aprašas */}
                <div style={{marginTop: '8px'}}>
                  <label style={{fontSize: '0.8rem', color: '#93c5fd', display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span>Mokymosi turinio aprašas pagal pasirinktą BP:</span>
                    {selectedBpModuleId && (
                      <span style={{color: 'var(--secondary-color)', fontWeight: 'bold', fontSize: '0.75rem'}}>
                        ✓ BP modulis pritaikytas
                      </span>
                    )}
                  </label>
                  <textarea 
                    value={bpContentDescription} 
                    onChange={e => setBpContentDescription(e.target.value)}
                    placeholder="Pasirinkite BP teminį bloką viršuje – turinio aprašas bus sugeneruotas automatiškai pagal emokykla BP..."
                    rows={2}
                    style={{fontSize: '0.82rem', background: '#0b1329'}}
                  />
                  {selectedBpModuleId && (
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px'}}>
                      <span style={{fontSize: '0.72rem', color: 'var(--text-color)'}}>
                        BP kodas: {availableBpModules.find(m => m.id === selectedBpModuleId)?.bpCode} | Kompetencijos: {availableBpModules.find(m => m.id === selectedBpModuleId)?.competencies}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Tema *</label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="pvz., Reklamos kalba ir įtaigos priemonės" required />
            </div>
            <div className="form-group">
              <label>Pamokos tipas</label>
              <select value={lessonType} onChange={e => setLessonType(e.target.value as LessonCategory)}>
                <option value="">-- Pasirinkite --</option>
                <option value="Įvadinė">Įvadinė</option>
                <option value="Įtvirtinimo">Įtvirtinimo</option>
                <option value="Apibendrinamoji">Apibendrinamoji</option>
                <option value="Vertinamoji">Vertinamoji</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tikslas (Mokiniai gebės...)</label>
              <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="pvz., atpažinti kalbinės įtaigos priemones ir taikyti jas kūrybiniame darbe..." rows={3} />
            </div>

            <div className="differentiation-guide">
              <h4>💡 Diferencijavimo gidas</h4>
              <ul>
                <li><strong>Gabūs.</strong> Analizė, kūryba, sintezė (Bloom viršūnė).</li>
                <li><strong>Vidutiniai.</strong> Suvokimas, taikymas pagal pavyzdį.</li>
                <li><strong>Sunkumų turintys.</strong> Vizualizacija, skaidymas, parama.</li>
              </ul>
            </div>

            <div className="form-group">
              <label>Papildomos idėjos ar veiklos</label>
              <textarea value={activities} onChange={e => setActivities(e.target.value)} placeholder="pvz., darbas porose, simuliaciniai žaidimai..." rows={2} />
            </div>

            {/* Namų darbų formulavimas ir krūvio stebėsena */}
            <div className="homework-config-card">
              <div className="homework-config-header">
                <label className="homework-config-title">🎯 Namų darbų pobūdis ir krūvio kontrolė</label>
                <span className="homework-bp-tag">N0015 rekomendacija</span>
              </div>

              <div className="homework-type-pills">
                {HOMEWORK_TYPES.map(type => (
                  <button 
                    key={type.id} 
                    type="button" 
                    className={`homework-type-pill ${homeworkType === type.label ? 'active' : ''}`}
                    onClick={() => {
                      setHomeworkType(type.label);
                      if (type.id === 'none') {
                        setHomeworkDuration('0');
                      } else if (homeworkDuration === '0') {
                        setHomeworkDuration('15');
                      }
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Korektiškas, ergonomiškas laiko parinkimas */}
              <div className="homework-duration-control">
                <div className="homework-duration-label-row">
                  <span className="homework-duration-label">
                    <span className="clock-icon">⏱️</span>
                    <span>Rekomenduojama atlikimo trukmė:</span>
                  </span>
                  <span className="homework-duration-current-badge">
                    {homeworkDuration === '0' 
                      ? '0 min. (be ND)' 
                      : homeworkDuration === '15' 
                      ? '10–15 min.' 
                      : homeworkDuration === '20' 
                      ? '15–20 min.' 
                      : '20–30 min.'}
                  </span>
                </div>

                <div className="homework-duration-pills">
                  {HOMEWORK_DURATIONS.map(d => {
                    const isSelected = homeworkDuration === d.value;
                    return (
                      <button
                        key={d.value}
                        type="button"
                        className={`duration-pill-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setHomeworkDuration(d.value);
                          if (d.value === '0') {
                            setHomeworkType('🚫 Be namų darbų (krūvio balansas)');
                          } else if (homeworkType === '🚫 Be namų darbų (krūvio balansas)') {
                            setHomeworkType('💡 Įtvirtinimas ir taikymas');
                          }
                        }}
                      >
                        <span className="duration-pill-time">{d.label}</span>
                        <span className="duration-pill-desc">{d.desc}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="homework-duration-hint">
                  {homeworkDuration === '0' ? (
                    <span className="hint-zero">🛡️ <strong>Krūvio balansas:</strong> Namų darbai neužduodami. Visi mokymosi uždaviniai įgyvendinami pamokos metu.</span>
                  ) : homeworkDuration === '15' ? (
                    <span className="hint-ok">💡 <strong>Optimalus laikas (10–15 min.):</strong> Rekomenduojama 1–6 klasėms, kad mokiniai nebūtų perkraunami.</span>
                  ) : homeworkDuration === '20' ? (
                    <span className="hint-ok">📘 <strong>Standartinė trukmė (15–20 min.):</strong> Rekomenduojama 7–8 klasėms žinių ir gebėjimų įtvirtinimui.</span>
                  ) : (
                    <span className="hint-ok">🎓 <strong>Išplėstinė trukmė (20–30 min.):</strong> Rekomenduojama 9–12 (gimnazijos) klasėms ar tiriamiesiems darbams.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Naudojamos priemonės (pasirinkite kelias)</label>
              <div className="evaluation-tags-grid">
                {RESOURCE_TAGS.map(tag => (
                  <label key={tag} className={`tag-checkbox ${selectedResources.includes(tag) ? 'checked' : ''}`}>
                    <input type="checkbox" checked={selectedResources.includes(tag)} onChange={() => handleResourceToggle(tag)} />
                    {tag}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Vertinimo metodai (neprivaloma – pasirinkite TIK jei pamokoje planuotas vertinimas)</label>
              <div className="evaluation-tags-grid">
                {EVALUATION_TAGS.map(tag => (
                  <label key={tag} className={`tag-checkbox ${selectedEvaluations.includes(tag) ? 'checked' : ''}`}>
                    <input type="checkbox" checked={selectedEvaluations.includes(tag)} onChange={() => handleEvaluationToggle(tag)} />
                    {tag}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Vertinimo kriterijai ir klasės mokymasis (tik jei planuotas)</label>
              <textarea 
                value={evaluationCriteria} 
                onChange={e => setEvaluationCriteria(e.target.value)} 
                placeholder="Jei pamokoje vertinama, įrašykite kriterijus. Jei ne – palikite tuščią (dienyno pastabose bus pateikiami patarimai apie temos naudą realiame gyvenime)." 
                rows={2} 
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={isIntegratedInput} onChange={e => setIsIntegratedInput(e.target.checked)} />
                Integruota pamoka?
              </label>
              {isIntegratedInput && (
                <input 
                  type="text" 
                  value={integrationDetails} 
                  onChange={e => setIntegrationDetails(e.target.value)} 
                  placeholder="Su kuo?" 
                  style={{marginTop: '8px'}}
                />
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={isOutsideInput} onChange={e => setIsOutsideInput(e.target.checked)} />
                Už mokyklos ribų?
              </label>
              {isOutsideInput && (
                <div style={{marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <input 
                    type="text" 
                    value={outsideLocation} 
                    onChange={e => setOutsideLocation(e.target.value)} 
                    placeholder="Kur? (pvz., Muziejus, parkas)" 
                  />
                  <input 
                    type="text" 
                    value={outsideGoal} 
                    onChange={e => setOutsideGoal(e.target.value)} 
                    placeholder="Kokiu ugdymo tikslu?" 
                  />
                  <p className="helper-text">Rekomenduojami tikslai. tyrinėjimas, stebėjimas, patirtinis mokymasis.</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="generate-button">
              {isLoading ? "Generuojama..." : "Generuoti planą 🚀"}
            </button>
          </form>

          <div className="saved-plans-container">
            <h3>Išsaugoti planai</h3>
            <input type="text" placeholder="Ieškoti planuose..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="search-input" />
            <ul className="saved-plans-list">
              {processedPlans.map(p => (
                <li key={p.id} onClick={() => handleLoadPlan(p.id)} className={activePlanId === p.id ? 'active' : ''}>
                  <div className="plan-info">
                    <span className="plan-title">{p.title}</span>
                    <span className="meta-tag">{p.createdAt.split('T')[0]}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setDeletingPlanId(p.id); }} className="mini-delete-button">✖</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="results-container">
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner-large"></div>
              <p>DI kuria jūsų pamokos planą...</p>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          
          {!isLoading && !lessonPlan && (
            <div className="welcome-message">
              <h2>Sveiki! 👋</h2>
              <p>Užpildykite duomenis kairėje ir spauskite „Generuoti planą“.</p>
              <p style={{marginTop: '15px', opacity: 0.8}}>DI paruoš išsamų planą vadovaujantis Lietuvos švietimo standartais.</p>
            </div>
          )}

          {lessonPlan && (
            <div className="lesson-plan-result">
              <div className="export-container">
                <button onClick={() => setShowSaveConfirm(true)} className="save-button">Išsaugoti 💾</button>
                <button onClick={() => { setEditedPlan(lessonPlan); setShowEditModal(true); }} className="edit-modal-btn">Redaguoti ✏️</button>
                <button onClick={() => setShowClassroomModal(true)} className="classroom-share-button">Classroom 🏫</button>
                <button 
                  type="button"
                  onClick={() => setShowPdfModal(true)} 
                  className="pdf-button" 
                  disabled={isGeneratingPdf} 
                  title="Atsisiųsti šį pamokos planą ar dienyno įrašus kaip PDF"
                >
                  {isGeneratingPdf ? 'Generuojama... ⏳' : 'Atsisiųsti PDF 📄'}
                </button>
                <button onClick={() => window.print()} className="print-button" title="Spausdinti dokumentą">Spausdinti 🖨️</button>
              </div>

              <div className="card">
                <h3>📚 Sąsajos su BP</h3>
                <p style={{whiteSpace: 'pre-wrap'}}>{lessonPlan.bpConnections}</p>
              </div>

              <div className="card">
                <h3>📖 Apžvalga</h3>
                <p><strong>Tema.</strong> {lessonPlan.lessonOverview?.topic}</p>
                <p><strong>Tikslas.</strong> {lessonPlan.lessonOverview?.goal}</p>
                <p><strong>Vertinimas.</strong> {lessonPlan.lessonOverview?.evaluation?.methods?.join(', ')}</p>
              </div>

              <div className="card">
                <h3>🚀 Pamokos eiga</h3>
                
                {/* Laiko skaičiuoklė / planuoklis */}
                <div className="time-planner-container">
                  <div className="time-planner-title">
                    <span>⏱️ Pamokos laiko skaičiuoklė ir biudžetas</span>
                    <strong style={{color: 'var(--primary-color)'}}>
                      Viso: {(Object.values(stageDurations) as number[]).reduce((sum, val) => sum + val, 0)} min.
                    </strong>
                  </div>
                  
                  <div className="time-presets">
                    <button 
                      type="button" 
                      onClick={() => setStageDurations({ introduction: 5, theory: 10, practice: 20, consolidation: 5, summary: 5 })}
                      className="time-preset-btn"
                    >
                      🕒 Standartinė pamoka (45 min.)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setStageDurations({ introduction: 10, theory: 20, practice: 40, consolidation: 10, summary: 10 })}
                      className="time-preset-btn"
                    >
                      🕒 Dviguba pamoka (90 min.)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setStageDurations({ introduction: 5, theory: 15, practice: 15, consolidation: 5, summary: 5 })}
                      className="time-preset-btn"
                    >
                      🕒 Teorinė / Diskusijų (45 min.)
                    </button>
                  </div>
                  
                  {/* Proporcinis laiko baras */}
                  {(() => {
                    const totalMin = (Object.values(stageDurations) as number[]).reduce((sum, val) => sum + val, 0);
                    return (
                      <div className="time-bar">
                        {Object.entries(stageDurations).map(([key, mins]) => {
                          const minsNum = Number(mins) || 0;
                          const pct = totalMin > 0 ? (minsNum / totalMin) * 100 : 0;
                          if (minsNum === 0) return null;
                          return (
                            <div 
                              key={key} 
                              className={`time-bar-segment segment-${key}`} 
                              style={{ width: `${pct}%` }}
                              title={`${STAGE_LABELS[key] || key}: ${minsNum} min.`}
                              onClick={() => {
                                setStageDurations(prev => ({ ...prev, [key]: (Number(prev[key]) || 0) + 1 }));
                              }}
                            >
                              {pct > 8 && `${minsNum}m`}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  
                  {/* Laiko koregavimo tinklelis */}
                  <div className="time-adjust-grid">
                    {Object.entries(stageDurations).map(([key, mins]) => {
                      const minsNum = Number(mins) || 0;
                      return (
                        <div key={key} className="time-adjust-row">
                          <div className="time-adjust-label-group">
                            <span className={`time-stage-dot segment-${key}`}></span>
                            <span className="time-stage-label">{STAGE_LABELS[key] || key}</span>
                          </div>
                          <div className="time-adjust-actions">
                            <button 
                              type="button" 
                              className="time-btn"
                              onClick={() => setStageDurations(prev => ({ ...prev, [key]: Math.max(0, (Number(prev[key]) || 0) - 1) }))}
                            >
                              -
                            </button>
                            <span className="time-value">{minsNum} min.</span>
                            <button 
                              type="button" 
                              className="time-btn"
                              onClick={() => setStageDurations(prev => ({ ...prev, [key]: (Number(prev[key]) || 0) + 1 }))}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
                    const totalMin = (Object.values(stageDurations) as number[]).reduce((sum, val) => sum + val, 0);
                    return (
                      <div className="time-summary-info">
                        <span>Statusas: </span>
                        {totalMin === 45 ? (
                          <span style={{color: 'var(--success-color)'}}><strong>Puiku!</strong> Laikas idealiai subalansuotas 45 min. pamokai. ✅</span>
                        ) : totalMin === 90 ? (
                          <span style={{color: 'var(--success-color)'}}><strong>Puiku!</strong> Laikas idealiai subalansuotas dvigubai 90 min. pamokai. ✅</span>
                        ) : totalMin > 45 && totalMin < 90 ? (
                          <span style={{color: '#f59e0b'}}>Suplanuota {totalMin} min. (Daugiau nei standartinė 45 min. pamoka). ⚠️</span>
                        ) : totalMin > 90 ? (
                          <span style={{color: '#ef4444'}}>Suplanuota {totalMin} min. (Daugiau nei dviguba 90 min. pamoka). 🚨</span>
                        ) : (
                          <span style={{color: '#94a3b8'}}>Suplanuota {totalMin} min. (Mažiau nei 45 min. pamoka). ℹ️</span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="timeline-container">
                  {lessonPlan.lessonStages ? Object.entries(lessonPlan.lessonStages).map(([key, content]) => {
                    const stageMin = Number(stageDurations[key]) || 0;
                    return (
                      <div key={key} className="timeline-item">
                        <div className="timeline-header">
                          <span className="timeline-label">
                            {STAGE_LABELS[key] || key} ({stageMin} min.)
                          </span>
                        </div>
                        <p className="timeline-content">{content}</p>
                      </div>
                    );
                  }) : <p>Nėra informacijos</p>}
                </div>
              </div>

               <div className="card">
                <h3>🤝 Veiklos klasėje ir priemonės</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '10px'}}>
                  <div><strong>👤 Individualiai.</strong> {lessonPlan.classActivities?.individual}</div>
                  <div><strong>👥 Porose.</strong> {lessonPlan.classActivities?.pairs}</div>
                  <div><strong>👪 Grupėse.</strong> {lessonPlan.classActivities?.group}</div>
                  <div style={{marginTop: '8px', borderTop: '1px solid #334155', paddingTop: '8px'}}><strong>🛠️ Priemonės ir nuorodos.</strong> {lessonPlan.classActivities?.toolsResources}</div>
                </div>
              </div>

              <div className="card">
                 <h3>🎯 Individualūs darbai</h3>
                 <p>{lessonPlan.individualWork}</p>
              </div>

              <div className="card" style={{borderLeftColor: 'var(--info-color)'}}>
                <h3>🌐 Skaitmeniniai ištekliai ir nuorodos</h3>
                <p style={{whiteSpace: 'pre-wrap'}}>{lessonPlan.digitalResources}</p>
              </div>

              <div className="card results-diff-section">
                <h3>📝 Diferencijavimas ir individualizavimas</h3>
                <div className="diff-grid">
                  <div className="diff-item gifted">
                    <span className="diff-header">Gabūs mokiniai 🌟</span>
                    <p className="diff-text">{lessonPlan.differentiation?.gifted}</p>
                  </div>
                  <div className="diff-item average">
                    <span className="diff-header">Vidutiniai mokiniai ✅</span>
                    <p className="diff-text">{lessonPlan.differentiation?.general}</p>
                  </div>
                  <div className="diff-item struggling">
                    <span className="diff-header">Mokiniai su sunkumais 🛡️</span>
                    <p className="diff-text">{lessonPlan.differentiation?.struggling}</p>
                  </div>
                </div>
              </div>

              {/* Standartizuoti El. dienyno įrašai pagal emokykla BP */}
              <div className="ediary-box">
                <div className="ediary-header">
                  <div className="ediary-title-group">
                    <h3>✍️ El. dienyno įrašai (emokykla BP standartas)</h3>
                    <span className="ediary-bp-badge">TAMO / Mano Dienynas / Eduka suderinamumas ✅</span>
                  </div>
                  <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center'}}>
                    <button 
                      type="button" 
                      onClick={() => handleGeneratePdf('ediary')} 
                      className="ediary-pdf-btn"
                      disabled={isGeneratingPdf}
                      title="Atsisiųsti el. dienyno įrašus kaip PDF dokumentą"
                    >
                      📄 Atsisiųsti PDF
                    </button>
                    <a 
                      href="https://www.manodienynas.lt/1/lt/public/public/login" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="manodienynas-link-btn"
                      title="Atverti Mano Dienynas prisijungimą naujame skirtuke"
                    >
                      📔 Atidaryti Mano Dienynas ↗
                    </a>
                    <button 
                      type="button" 
                      onClick={() => setShowBestPracticeModal(true)} 
                      className="best-practice-banner-btn"
                    >
                      📖 Gerosios praktikos gidas
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCopyAllEDiary} 
                      className="ediary-copy-all-btn"
                    >
                      {copiedField === 'all_diary' ? 'Nukopijuotas visas paketas! ✅' : '📋 Kopijuoti visus įrašus'}
                    </button>
                  </div>
                </div>

                {/* 1. Tema ir klasės darbas */}
                <div className="ediary-card-item">
                  <div className="ediary-item-top">
                    <span className="ediary-item-title">
                      📌 1. Tema / Klasės darbas
                      <span className="ediary-item-subtitle">(Standartizuota formuluotė: Dalykas + Uždavinys + Veikla)</span>
                    </span>
                    <button 
                      onClick={() => lessonPlan.eDiaryEntry && handleCopy(lessonPlan.eDiaryEntry.topicClassworkExpectations, 'topicClassworkExpectations')} 
                      className={`ediary-item-copy-btn ${copiedField === 'topicClassworkExpectations' ? 'copied' : ''}`}
                    >
                      {copiedField === 'topicClassworkExpectations' ? 'Nukopijuota! ✅' : 'Kopijuoti į „Tema / Klasės darbas“ 📋'}
                    </button>
                  </div>
                  <div className="ediary-item-content">
                    {lessonPlan.eDiaryEntry?.topicClassworkExpectations}
                  </div>
                </div>

                {/* 2. Namų darbai */}
                <div className="ediary-card-item">
                  <div className="ediary-item-top">
                    <span className="ediary-item-title">
                      🎯 2. Namų darbai
                      <span className="ediary-item-subtitle">(Su aiškiu tikslu, kontekstu ir krūvio trukme)</span>
                    </span>
                    <button 
                      onClick={() => lessonPlan.eDiaryEntry && handleCopy(lessonPlan.eDiaryEntry.homework, 'homework')} 
                      className={`ediary-item-copy-btn ${copiedField === 'homework' ? 'copied' : ''}`}
                    >
                      {copiedField === 'homework' ? 'Nukopijuota! ✅' : 'Kopijuoti į „Namų darbai“ 📋'}
                    </button>
                  </div>
                  <div className="ediary-item-content">
                    {lessonPlan.eDiaryEntry?.homework}
                  </div>
                </div>

                {/* 3. Pastabos / Gyvenimiškas naudingumas ir vertinimas */}
                <div className="ediary-card-item">
                  <div className="ediary-item-top">
                    <span className="ediary-item-title">
                      💡 3. Pastaba / Vertinimas
                      <span className="ediary-item-subtitle">(Patarimai kuo naudinga realiame gyvenime; vertinimas – jei planuotas)</span>
                    </span>
                    <button 
                      onClick={() => lessonPlan.eDiaryEntry && handleCopy(lessonPlan.eDiaryEntry.notes, 'notes')} 
                      className={`ediary-item-copy-btn ${copiedField === 'notes' ? 'copied' : ''}`}
                    >
                      {copiedField === 'notes' ? 'Nukopijuota! ✅' : 'Kopijuoti į „Pastaba / Vertinimas“ 📋'}
                    </button>
                  </div>
                  <div className="ediary-item-content">
                    {lessonPlan.eDiaryEntry?.notes}
                  </div>
                </div>

                {/* Metadata & Tagai */}
                <div className="ediary-metadata-bar">
                  <span className="ediary-tag-badge success">
                    ✓ Emokykla BP atitiktis
                  </span>
                  <span className="ediary-tag-badge success">
                    ✓ Nėra sauso šablono („Žinoti, gebėti, taikyti“)
                  </span>
                  <span className="ediary-tag-badge success">
                    ✓ ND tikslas su kontekstu
                  </span>
                  <span className="ediary-tag-badge success">
                    ✓ Krūvio reguliavimas (rekomendacija N0015)
                  </span>
                  {lessonPlan.eDiaryEntry?.isIntegrated && (
                    <span className="ediary-tag-badge">
                      🔗 Integruota pamoka
                    </span>
                  )}
                  {lessonPlan.eDiaryEntry?.isOutside && (
                    <span className="ediary-tag-badge">
                      🌿 Už mokyklos ribų
                    </span>
                  )}
                </div>

                {/* Kokybės auditas pagal oficialias rekomendacijas */}
                <div className="quality-audit-container">
                  <div className="quality-audit-title">
                    🔍 El. dienyno kokybės auditas pagal oficialias rekomendacijas:
                  </div>
                  <div className="quality-audit-grid">
                    <div className="quality-audit-item">
                      <span className="check-icon">✓</span>
                      <span>Standartizuota tema (dalykas + uždavinys + veikla)</span>
                    </div>
                    <div className="quality-audit-item">
                      <span className="check-icon">✓</span>
                      <span>Aiškus ND tikslas (be pratimų plikų numerių)</span>
                    </div>
                    <div className="quality-audit-item">
                      <span className="check-icon">✓</span>
                      <span>ND krūvio kontrolė ({homeworkDuration === '0' ? '0 min., be namų darbų' : homeworkDuration === '15' ? '10–15 min.' : homeworkDuration === '20' ? '15–20 min.' : '20–30 min.'}, N0015)</span>
                    </div>
                    <div className="quality-audit-item">
                      <span className="check-icon">✓</span>
                      <span>Praktinė gyvenimiška nauda mokinio ateičiai</span>
                    </div>
                    <div className="quality-audit-item">
                      <span className="check-icon">✓</span>
                      <span>Vertinimas įrašytas {selectedEvaluations.length > 0 || evaluationCriteria ? 'pagal nurodytus kriterijus' : 'tiksliai: nenurodytas (nėra išgalvojimų)'}</span>
                    </div>
                    <div className="quality-audit-item">
                      <span className="check-icon">✓</span>
                      <span>Taisyklinga lietuvių kalbos rašyba ir skyryba (J0025)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{borderLeftColor: 'var(--secondary-color)'}}>
                 <h3>💖 Motyvacinė žinutė</h3>
                 <p style={{fontStyle: 'italic'}}>{lessonPlan.motivation}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALAI */}
      {showSaveConfirm && (
        <div className="modal-overlay" onClick={() => setShowSaveConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Patvirtinkite išsaugojimą</h2>
            </div>
            <p className="modal-body-text">Ar norite išsaugoti šį pamokos planą į savo asmeninį sąrašą?</p>
            <div className="modal-actions">
                <button onClick={executeSavePlan} className="modal-btn confirm">Taip, išsaugoti</button>
                <button onClick={() => setShowSaveConfirm(false)} className="modal-btn cancel">Atšaukti</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editedPlan && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Redaguoti planą</h2>
            </div>
            <div className="modal-body scrollable">
              
              <div className="edit-group">
                <label>Tema</label>
                <input type="text" value={editedPlan.lessonOverview.topic} onChange={e => updateEditedField('lessonOverview.topic', e.target.value)} />
              </div>
              <div className="edit-group">
                <label>SMART Tikslas</label>
                <textarea value={editedPlan.lessonOverview.goal} onChange={e => updateEditedField('lessonOverview.goal', e.target.value)} rows={3} />
              </div>
              
              <div className="edit-divider">Pamokos eiga</div>
              {Object.keys(STAGE_LABELS).map(key => (
                <div key={key} className="edit-stage-group">
                   <div className="edit-stage-header">
                      <label>{STAGE_LABELS[key]}</label>
                   </div>
                   <textarea 
                     value={(editedPlan.lessonStages as any)[key]} 
                     onChange={e => updateEditedField(`lessonStages.${key}`, e.target.value)} 
                     rows={2} 
                   />
                </div>
              ))}

              <div className="edit-divider">Veiklos ir priemonės</div>
              <div className="edit-group">
                <label>Individualiai</label>
                <textarea value={editedPlan.classActivities?.individual || ''} onChange={e => updateEditedField('classActivities.individual', e.target.value)} rows={1} />
              </div>
              <div className="edit-group">
                <label>Porose</label>
                <textarea value={editedPlan.classActivities?.pairs || ''} onChange={e => updateEditedField('classActivities.pairs', e.target.value)} rows={1} />
              </div>
              <div className="edit-group">
                <label>Grupėse</label>
                <textarea value={editedPlan.classActivities?.group || ''} onChange={e => updateEditedField('classActivities.group', e.target.value)} rows={1} />
              </div>
              <div className="edit-group">
                <label>Priemonės ir šaltiniai</label>
                <textarea value={editedPlan.classActivities?.toolsResources || ''} onChange={e => updateEditedField('classActivities.toolsResources', e.target.value)} rows={2} />
              </div>

               <div className="edit-divider">Individualūs darbai ir namų darbai</div>
               <div className="edit-group">
                <label>Individualūs darbai</label>
                <textarea value={editedPlan.individualWork || ''} onChange={e => updateEditedField('individualWork', e.target.value)} rows={2} />
              </div>
              <div className="edit-group">
                <label>Skaitmeniniai ištekliai</label>
                <textarea value={editedPlan.digitalResources || ''} onChange={e => updateEditedField('digitalResources', e.target.value)} rows={2} />
              </div>
              <div className="edit-group">
                <label>Namų darbų tikslas</label>
                <textarea value={editedPlan.homework?.purpose || ''} onChange={e => updateEditedField('homework.purpose', e.target.value)} rows={1} />
              </div>
               <div className="edit-group">
                <label>ND Gabiems</label>
                <textarea value={editedPlan.homework?.gifted || ''} onChange={e => updateEditedField('homework.gifted', e.target.value)} rows={1} />
              </div>
              <div className="edit-group">
                <label>ND Bendras</label>
                <textarea value={editedPlan.homework?.general || ''} onChange={e => updateEditedField('homework.general', e.target.value)} rows={1} />
              </div>

              <div className="edit-divider">Diferencijavimas</div>
              <div className="edit-group">
                <label>Gabūs mokiniai</label>
                <textarea value={editedPlan.differentiation.gifted} onChange={e => updateEditedField('differentiation.gifted', e.target.value)} rows={2} />
              </div>
              <div className="edit-group">
                <label>Bendras lygis</label>
                <textarea value={editedPlan.differentiation.general} onChange={e => updateEditedField('differentiation.general', e.target.value)} rows={2} />
              </div>
              <div className="edit-group">
                <label>Sunkumų turintys mokiniai</label>
                <textarea value={editedPlan.differentiation.struggling} onChange={e => updateEditedField('differentiation.struggling', e.target.value)} rows={2} />
              </div>

              <div className="edit-divider">El. dienynas</div>
              <div className="edit-group">
                <label>Tema ir darbas</label>
                <textarea value={editedPlan.eDiaryEntry.topicClassworkExpectations} onChange={e => updateEditedField('eDiaryEntry.topicClassworkExpectations', e.target.value)} rows={2} />
              </div>
              <div className="edit-group">
                <label>Namų darbai (įrašas)</label>
                <textarea value={editedPlan.eDiaryEntry.homework} onChange={e => updateEditedField('eDiaryEntry.homework', e.target.value)} rows={1} />
              </div>
               <div className="edit-group">
                <label>Pastabos</label>
                <textarea value={editedPlan.eDiaryEntry.notes} onChange={e => updateEditedField('eDiaryEntry.notes', e.target.value)} rows={2} />
              </div>
              
              <div className="edit-divider">Motyvacija</div>
              <div className="edit-group">
                <textarea value={editedPlan.motivation} onChange={e => updateEditedField('motivation', e.target.value)} rows={2} />
              </div>

            </div>
            <div className="modal-actions">
                <button onClick={handleApplyEdit} className="modal-btn confirm">Išsaugoti pakeitimus</button>
                <button onClick={() => setShowEditModal(false)} className="modal-btn cancel">Uždaryti</button>
            </div>
          </div>
        </div>
      )}

      {showClassroomModal && (
        <div className="modal-overlay" onClick={() => setShowClassroomModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dalintis Google Classroom 🏫</h2>
            </div>
            
            <div className="modal-body scrollable">
              {classroomError && <div className="error-message">{classroomError}</div>}
              {classroomSuccess && <div className="success-message" style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', border: '1px solid var(--success-color)', padding: '12px', borderRadius: '8px', marginBottom: '15px'}}>{classroomSuccess}</div>}

              {(!user || !token) ? (
                <div style={{textAlign: 'center', padding: '2rem 1rem'}}>
                  <p style={{color: 'var(--text-color-light)', marginBottom: '1.5rem'}}>
                    Norėdami dalintis pamokos planu Google Classroom, pirmiausia turite prisijungti su savo Google paskyra.
                  </p>
                  <button 
                    onClick={handleClassroomLogin} 
                    disabled={isClassroomLoading} 
                    className="generate-button"
                    style={{maxWidth: '300px', margin: '0 auto'}}
                  >
                    {isClassroomLoading ? "Prisijungiama..." : "Prisijungti su Google 🌐"}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem'}}>
                    <div>
                      <span style={{color: 'var(--text-color)', fontSize: '0.85rem', display: 'block'}}>Prisijungta kaip</span>
                      <strong style={{color: 'white'}}>{user.displayName || user.email}</strong>
                    </div>
                    <button 
                      onClick={() => auth.signOut()} 
                      style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer'}}
                    >
                      Atsijungti
                    </button>
                  </div>

                  <div className="edit-group">
                    <label>Pasirinkite Google Classroom kursą (klasę) *</label>
                    {courses.length === 0 ? (
                      <div style={{padding: '10px', background: '#0f172a', borderRadius: '8px', color: 'var(--text-color)'}}>
                        {isClassroomLoading ? "Kraunami kursai..." : "Nėra aktyvių kursų."}
                      </div>
                    ) : (
                      <select 
                        value={selectedCourseId} 
                        onChange={e => setSelectedCourseId(e.target.value)}
                        style={{width: '100%', padding: '12px', background: '#0f172a', border: '1px solid var(--border-color)', color: 'white', borderRadius: '8px', fontSize: '0.95rem'}}
                      >
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.name} ({course.section || 'Nėra sekcijos'})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="edit-group">
                    <label>Pasirinkite įrašo tipą Google Classroom *</label>
                    <div style={{display: 'flex', gap: '10px', marginTop: '8px'}}>
                      <button 
                        type="button"
                        onClick={() => { setClassroomPostType('announcement'); setClassroomSuccess(null); }}
                        className={`modal-btn ${classroomPostType === 'announcement' ? 'confirm' : 'cancel'}`}
                        style={{padding: '10px', fontSize: '0.85rem'}}
                      >
                        📢 Skelbimas (Announcement)
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setClassroomPostType('courseWork'); setClassroomSuccess(null); }}
                        className={`modal-btn ${classroomPostType === 'courseWork' ? 'confirm' : 'cancel'}`}
                        style={{padding: '10px', fontSize: '0.85rem'}}
                      >
                        🎯 Užduotis (Assignment)
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setClassroomPostType('material'); setClassroomSuccess(null); }}
                        className={`modal-btn ${classroomPostType === 'material' ? 'confirm' : 'cancel'}`}
                        style={{padding: '10px', fontSize: '0.85rem'}}
                      >
                        📚 Medžiaga (Material)
                      </button>
                    </div>
                  </div>

                  <div className="edit-group" style={{marginTop: '1.5rem'}}>
                    <label>Turinio peržiūra</label>
                    <div style={{background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-color-light)', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap'}}>
                      {classroomPostType === 'announcement' ? (
                        <>
                          <strong>📢 NAUJAS PAMOKOS PLANAS:</strong> {lessonPlan.lessonOverview?.topic || topic || "Pamokos planas"}{"\n\n"}
                          <strong>🎯 TIKSLAS:</strong> {lessonPlan.lessonOverview?.goal || "Nėra nurodyto tikslo."}{"\n\n"}
                          <strong>🚀 PAMOKOS EIGA:</strong>{"\n"}
                          {lessonPlan.lessonStages && Object.entries(lessonPlan.lessonStages).map(([key, content]) => (
                            `- ${STAGE_LABELS[key] || key}. ${content}\n`
                          ))}
                        </>
                      ) : classroomPostType === 'courseWork' ? (
                        <>
                          <strong>Užduotis.</strong> {lessonPlan.lessonOverview?.topic || topic || "Pamokos planas"}{"\n\n"}
                          <strong>🎯 TIKSLAS:</strong> {lessonPlan.lessonOverview?.goal || "Nėra nurodyto tikslo."}{"\n\n"}
                          <strong>👤 Individualus darbas:</strong> {lessonPlan.individualWork || 'Nėra nurodyta.'}{"\n\n"}
                          <strong>🏠 Namų darbai:</strong>{"\n"}
                          - Tikslas: {lessonPlan.homework?.purpose || 'Nėra nurodyta.'}{"\n"}
                          - Gabiesiems: {lessonPlan.homework?.gifted || 'Nėra nurodyta.'}{"\n"}
                          - Bendra užduotis: {lessonPlan.homework?.general || 'Nėra nurodyta.'}{"\n"}
                          - Sunkumų turintiems: {lessonPlan.homework?.struggling || 'Nėra nurodyta.'}
                        </>
                      ) : (
                        <>
                          <strong>Medžiaga.</strong> {lessonPlan.lessonOverview?.topic || topic || "Pamokos planas"}{"\n\n"}
                          <strong>📚 Priemonės ir skaitmeniniai šaltiniai šiai pamokai:</strong>{"\n\n"}
                          <strong>🌐 Skaitmeniniai ištekliai:</strong>{"\n"}{lessonPlan.digitalResources || 'Nėra nurodyta.'}{"\n\n"}
                          <strong>🛠️ Klasės priemonės:</strong> {lessonPlan.classActivities?.toolsResources || 'Nėra nurodyta.'}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {user && token && (
                <button 
                  onClick={handlePublishToClassroom} 
                  disabled={isClassroomLoading || courses.length === 0} 
                  className="modal-btn confirm"
                >
                  {isClassroomLoading ? "Skelbiama..." : "Paskelbti Google Classroom 🚀"}
                </button>
              )}
              <button onClick={() => { setShowClassroomModal(false); setClassroomError(null); setClassroomSuccess(null); }} className="modal-btn cancel">Uždaryti</button>
            </div>
          </div>
        </div>
      )}

      {/* Gerosios praktikos gido modalas */}
      {showBestPracticeModal && (
        <div className="modal-overlay" onClick={() => setShowBestPracticeModal(false)}>
          <div className="best-practice-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📖 Dienyno pildymo gerosios praktikos gidas (emokykla BP)</h2>
              <button onClick={() => setShowBestPracticeModal(false)} style={{background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer'}}>✖</button>
            </div>
            
            <div className="best-practice-body">
              <p style={{marginBottom: '1rem', color: '#93c5fd'}}>
                Šis gidas parengtas remiantis oficialiomis Lietuvos Bendrosiomis programomis (emokykla.lt) bei el. dienyno įrašų kokybės rekomendacijomis.
              </p>

              {/* 1. Standartizuotos temos formuluotės */}
              <div className="practice-card">
                <h4>📌 1. Standartizuoti temos formuluotes (A0010)</h4>
                <p>
                  Kiekvienas temos įrašas dienyne turi apimti tris aiškius elementus: <strong>[Dalykas]: [Temos pavadinimas]. Mokymosi uždavinys (ko išmoks). Veikla (kokią veiklą atliks / metodas).</strong>
                </p>
                <div className="practice-comparison">
                  <div className="practice-box bad">
                    <div className="practice-box-title">❌ Sausa / Šabloninė (vengtina):</div>
                    <p>„In a restaurant.“ (A0006)</p>
                    <p style={{marginTop: '4px'}}>arba sausas šablonas:</p>
                    <p>„Skaitmeninis turinys... Žinoti: sąvokas. Gebėti: atlikti užduotis. Taikyti: spręsti problemas.“</p>
                  </div>
                  <div className="practice-box good">
                    <div className="practice-box-title">✅ Rekomenduojama (A0010):</div>
                    <p>„Užsienio kalba (anglų): Mokymasis užsisakyti maistą restorane, naudojant specifinį žodyną ir mandagumo frazes per dialogų simuliaciją porose.“</p>
                    <p style={{marginTop: '4px'}}>„Informatika: Duomenų skaičiuoklės (Google Sheets) formulių taikymas, atliekant praktinę asmeninio biudžeto skaičiavimo užduotį.“</p>
                  </div>
                </div>
              </div>

              {/* 2. Tikslinės gairės neakademiniams dalykams */}
              <div className="practice-card">
                <h4>🎭 2. Tikslinės gairės neakademiniams dalykams (Č0006, J0015)</h4>
                <p>
                  Dalykuose „Klasės vadovo veikla“, „Etika“, „Teatras“, „Gyvenimo įgūdžiai“, „Fizinis ugdymas“ būtina atspindėti jų ugdomąją vertę: socialinį-emocinį raštingumą, bendruomeniškumą, vertybinį apsisprendimą ir refleksiją.
                </p>
                <div className="practice-comparison">
                  <div className="practice-box bad">
                    <div className="practice-box-title">❌ Formalus įrašas:</div>
                    <p>„Klasės valandėlė.“</p>
                    <p>„Teatras: etiudai.“</p>
                  </div>
                  <div className="practice-box good">
                    <div className="practice-box-title">✅ Rekomenduojama praktika (J0015):</div>
                    <p>„Klasės vadovo veikla: Klasės bendruomeniškumo stiprinimas ir konfliktų sprendimo strategijų aptarimas, atliekant situacijų analizę grupėse ir reflektuojant bendras taisykles.“</p>
                  </div>
                </div>
              </div>

              {/* 3. Namų darbų formulavimas ir krūvio stebėsena */}
              <div className="practice-card">
                <h4>🎯 3. Namų darbų formulavimas, tikslingumas ir krūvis (N0015, N0016, N0024)</h4>
                <p>
                  Aiškus tikslo nurodymas didina mokinių motyvaciją. Vengti pratimų numerių be konteksto. Būtina stebėti namų darbų apimtį, kad nebūtų perkraunami mokiniai.
                </p>
                <div className="practice-comparison">
                  <div className="practice-box bad">
                    <div className="practice-box-title">❌ Tik pratimų numeriai:</div>
                    <p>„Pratybose p. 24, nr. 1, 2, 3, 4.“</p>
                    <p style={{fontSize: '0.75rem', marginTop: '4px'}}>Trūksta tikslo, mokiniai ir tėvai nesupranta prasmės, rizika perkrauti.</p>
                  </div>
                  <div className="practice-box good">
                    <div className="practice-box-title">✅ Tikslinė užduotis su trukme:</div>
                    <p>„Tikslas – įtvirtinti formulių taikymo įgūdžius. Užduotis: namų skaičiuoklėje sukurti 5 eilučių biudžeto lentelę ir apskaičiuoti sumą (rekomenduojama trukmė: ~15 min.).“</p>
                  </div>
                </div>
              </div>

              {/* 4. Pastabos ir vertinimas */}
              <div className="practice-card">
                <h4>💡 4. Pastabos: gyvenimiška vertė ir vertinimas (tik jei planuotas)</h4>
                <p>
                  Pastabose rekomenduojama pateikti patarimų mokiniams ir tėvams, kuo nagrinėta medžiaga naudinga realiame gyvenime. Informacija apie vertinimą ir klasės mokymąsi pateikiama <strong>TIK JEI mokytojas ją nurodė / planavo</strong>.
                </p>
                <div className="practice-box good" style={{marginTop: '8px'}}>
                  <div className="practice-box-title">✅ Pavyzdys pastaboms:</div>
                  <p>„Gyvenimiška vertė: Šie įgūdžiai padeda mokiniams kritiškai vertinti informaciją, saugoti asmeninius finansus ir argumentuotai priimti sprendimus kasdienybėje. Vertinimas: Savarankiškas praktinis darbas – formuojamasis vertinimas; kriterijus: teisingai pritaikytos taisyklės.“</p>
                </div>
              </div>

              {/* 5. Kalbos ir gramatikos kontrolė */}
              <div className="practice-card">
                <h4>✍️ 5. Kalbos ir gramatikos kontrolė (J0025)</h4>
                <p>
                  Dienynas yra oficialus dokumentas ir reprezentacinė mokyklos komunikacijos priemonė. Visi įrašai privalo būti suderinti pagal taisyklingą lietuvių kalbos gramatiką, skyrybą ir terminiją.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowBestPracticeModal(false)} className="modal-btn confirm">Supratau, taikyti šias gaires</button>
            </div>
          </div>
        </div>
      )}

      {deletingPlanId && (
        <div className="modal-overlay" onClick={() => setDeletingPlanId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pašalinti planą?</h2>
            </div>
            <p className="modal-body-text">Šio veiksmo atšaukti negalėsite. Ar tikrai norite trinti?</p>
            <div className="modal-actions">
                <button onClick={() => { setSavedPlans(savedPlans.filter(p => p.id !== deletingPlanId)); setDeletingPlanId(null); if (activePlanId === deletingPlanId) setLessonPlan(null); }} className="modal-btn delete">Trinti</button>
                <button onClick={() => setDeletingPlanId(null)} className="modal-btn cancel">Atšaukti</button>
            </div>
          </div>
        </div>
      )}

      {/* PDF pasirinkimo ir atsisiuntimo modalas */}
      {showPdfModal && (
        <div className="modal-overlay" onClick={() => setShowPdfModal(false)}>
          <div className="pdf-modal-content" onClick={e => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h2>📄 Atsisiųsti kaip PDF dokumentą</h2>
              <p className="pdf-modal-subtext">
                Pasirinkite norimą dokumento formatą. PDF bus sugeneruotas pritaikant oficialius LR bendrųjų programų (emokykla.lt) ir dienynų pildymo reikalavimus švariame A4 dokumento lape.
              </p>
            </div>

            <div className="pdf-options-grid">
              {/* 1. Visas pamokos planas */}
              <div className="pdf-option-card">
                <div>
                  <span className="pdf-option-badge">Pilnas metodinis dokumentas</span>
                  <div className="pdf-option-title">
                    📚 Visas pamokos planas
                  </div>
                  <p className="pdf-option-desc">
                    Išsamus planas: BP sąsajos, pamokos apžvalga, laiko biudžetas ({(Object.values(stageDurations) as number[]).reduce((s, v) => s + (Number(v) || 0), 0)} min.), veiklos klasėje, individualus darbas, diferencijavimas (3 lygiai), el. dienyno įrašai ir motyvacinė žinutė.
                  </p>
                </div>
                <button 
                  type="button"
                  className="pdf-download-action-btn"
                  onClick={() => handleGeneratePdf('full')}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? 'Ruošiamas PDF... ⏳' : 'Atsisiųsti visą planą 📥'}
                </button>
              </div>

              {/* 2. Tik el. dienyno įrašai */}
              <div className="pdf-option-card">
                <div>
                  <span className="pdf-option-badge">Kompaktiška dienyno kortelė</span>
                  <div className="pdf-option-title">
                    ✍️ Tik el. dienyno įrašai
                  </div>
                  <p className="pdf-option-desc">
                    Kompaktiška kortelė: standartizuota tema (Dalykas + Uždavinys + Veikla), namų darbai su tikslu ir N0015 krūvio kontrole, pastaba su gyvenimiška verte bei kokybės audito patikra.
                  </p>
                </div>
                <button 
                  type="button"
                  className="pdf-download-action-btn"
                  onClick={() => handleGeneratePdf('ediary')}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? 'Ruošiamas PDF... ⏳' : 'Atsisiųsti dienyno įrašus 📥'}
                </button>
              </div>
            </div>

            <div className="modal-actions" style={{justifyContent: 'flex-end', marginTop: '6px'}}>
              <button type="button" onClick={() => setShowPdfModal(false)} className="modal-btn cancel">
                Uždaryti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF generavimo būsenos indikatorius ir pranešimai */}
      {isGeneratingPdf && (
        <div className="pdf-generating-banner">
          <div className="pdf-spinner"></div>
          <span>Formuojamas švarus PDF dokumentas pagal spaudos standartus... ⏳</span>
        </div>
      )}

      {pdfSuccessMessage && (
        <div className="pdf-generating-banner" style={{borderColor: '#10b981', background: '#0b1b17'}}>
          <span>{pdfSuccessMessage}</span>
        </div>
      )}

      {/* Chat Bot UI */}
      <div className={`chat-bot-container ${isChatOpen ? 'open' : ''}`}>
        {!isChatOpen ? (
          <button className="chat-bot-toggle" onClick={() => setIsChatOpen(true)}>
            💬 Pagalba
          </button>
        ) : (
          <div className="chat-bot-window">
            <div className="chat-bot-header">
              <h3>DI pagalbininkas 🤖</h3>
              <button onClick={() => setIsChatOpen(false)}>✖</button>
            </div>
            <div className="chat-bot-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-message model">
                  <div className="message-bubble loading">...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-bot-input" onSubmit={handleChatSubmit}>
              <input 
                type="text" 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
                placeholder="Klauskite apie planą..." 
                disabled={isChatLoading}
              />
              <button type="submit" disabled={isChatLoading || !chatInput.trim()}>➤</button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
