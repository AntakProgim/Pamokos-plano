
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { buildPedagogicalPlan } from './src/templatePlanGenerator';

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
  differentiatedTasks?: {
    advanced: string;
    average: string;
    struggling: string;
  };
  differentiatedAssessment?: {
    advanced: string;
    average: string;
    struggling: string;
  };
  targetLevels?: string[];
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

interface LessonTemplate {
  id: string;
  name: string;
  grade: string;
  subject: string;
  lessonType: string;
  goal: string;
  activities: string;
  evaluationCriteria: string;
  selectedEvaluations: string[];
  selectedResources: string[];
  stageDurations: Record<string, number>;
  isCustom: boolean;
}

const DEFAULT_TEMPLATES: LessonTemplate[] = [
  {
    id: 'default-classic',
    name: "Klasikinė pamoka (45 min.) 🏫",
    grade: "7 klasė",
    subject: "Lietuvių kalba",
    lessonType: "Įtvirtinimo",
    goal: "Mokiniai gebės pritaikyti teorines taisykles praktinėse užduotyse.",
    activities: "Sąvokų kartojimas, darbas su tekstu, trumpas apibendrinimas.",
    evaluationCriteria: "Teisingai atlikta bent 70% praktinių užduočių.",
    selectedEvaluations: ["Savarankiškas darbas", "Formuojamojo vertinimo darbas"],
    selectedResources: ["Vadovėlis", "Darbo lapai"],
    stageDurations: { introduction: 5, theory: 15, practice: 15, consolidation: 5, summary: 5 },
    isCustom: false
  },
  {
    id: 'default-group',
    name: "Grupinis / Projektinis darbas (45 min.) 👥",
    grade: "8 klasė",
    subject: "Istorija",
    lessonType: "Įtvirtinimo",
    goal: "Dirbdami grupėse, mokiniai sukurs trumpą pristatymą ir jį pristatys.",
    activities: "Darbas grupėse naudojant Miro lentą, bendri pristatymai.",
    evaluationCriteria: "Kiekviena grupė parengia aiškų planą ir pristato bent 3 argumentus.",
    selectedEvaluations: ["Projektinis darbas", "Savarankiškas darbas"],
    selectedResources: ["Miro lenta", "Canva", "Išmanieji telefonai"],
    stageDurations: { introduction: 5, theory: 5, practice: 25, consolidation: 7, summary: 3 },
    isCustom: false
  },
  {
    id: 'default-flipped',
    name: "Apversta klasė (Flipped Classroom) 🔄",
    grade: "9 klasė",
    subject: "Matematika",
    lessonType: "Įtvirtinimo",
    goal: "Remiantis namuose peržiūrėta vaizdo medžiaga, spręsti sudėtingesnius uždavinius.",
    activities: "Klausimai-atsakymai apie teoriją, uždavinių sprendimas porose.",
    evaluationCriteria: "Uždavinių sprendimas porose ir gebėjimas paaiškinti sprendimą.",
    selectedEvaluations: ["Savarankiškas darbas"],
    selectedResources: ["YouTube", "Darbo lapai"],
    stageDurations: { introduction: 10, theory: 0, practice: 25, consolidation: 5, summary: 5 },
    isCustom: false
  },
  {
    id: 'default-test',
    name: "Kontrolinio darbo pamoka (45 min.) 📝",
    grade: "10 klasė",
    subject: "Fizika",
    lessonType: "Vertinamoji",
    goal: "Savarankiškai atlikti kontrolinį darbą ir pasitikrinti sukauptas žinias.",
    activities: "Instruktažas, savarankiškas sprendimas, lapų surinkimas.",
    evaluationCriteria: "Teisingi atsakymai į užduotis pagal taškų sistemą.",
    selectedEvaluations: ["Kontrolinis darbas", "Galutinis atsiskaitymas"],
    selectedResources: ["Darbo lapai"],
    stageDurations: { introduction: 3, theory: 2, practice: 35, consolidation: 3, summary: 2 },
    isCustom: false
  }
];

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

const STAGE_LABELS: Record<string, string> = {
  introduction: 'Sužadinimas. Įvadas',
  theory: 'Naujos medžiagos aiškinimas',
  practice: 'Praktinis darbas. Užduotys',
  consolidation: 'Įtvirtinimas. Refleksija',
  summary: 'Apibendrinimas. Pabaiga'
};

const STUDENT_LEVEL_OPTIONS = [
  {
    id: 'pažengę',
    label: 'Pažengę (Gabūs) 🌟',
    badge: 'Aukštesnysis lygis',
    bloom: 'Kūrimas, vertinimas, analizė',
    desc: 'Nestandartinės probleminės situacijos, atviri tyrimo iššūkiai, ekspertinis bendradarbiavimas.'
  },
  {
    id: 'vidutiniai',
    label: 'Vidutiniai mokiniai ✅',
    badge: 'Pagrindinis lygis',
    bloom: 'Supratimas, taikymas, analizė',
    desc: 'Standartiniai BP pratimai, kontekstinis taikymas, darbas porose, savikontrolė su etalonu.'
  },
  {
    id: 'turintys sunkumų',
    label: 'Turintys sunkumų (SUP) 🛡️',
    badge: 'Slenkstinis lygis',
    bloom: 'Žinojimas, atpažinimas, pradinis taikymas',
    desc: 'Struktūruotos bazinės užduotys, atraminė medžiaga, žingsnis po žingsnio su pagalba.'
  }
];

const EXAMPLE_PLAN_DATA: LessonPlan = {
  generalNotes: "Pamoka orientuota į kritinį mąstymą ir medijų raštingumą.",
  lessonType: "Įtvirtinimo",
  bpConnections: "BP 1.2. Mokinys geba analizuoti medijų tekstų turinį, formą ir raiškos priemones. BP 3.1. Taiko kalbos įtaigos priemones kurdamas savo tekstus.",
  lessonOverview: {
    topic: "Reklamos kalba ir įtaigos priemonės",
    goal: "Mokiniai gebės atpažinti 3 pagrindines reklamos įtaigos priemones ir pritaikyti jas kurdami prekės aprašymą.",
    competencies: "Komunikavimo, kultūrinė, skaitmeninė.",
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
    introduction: "Trumpa diskusija apie tai, kokios reklamas mus erzina, o kokios priverčia nusišypsoti. Demonstruojami du kontrastingi vaizdo įrašai.",
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
  differentiatedTasks: {
    advanced: "• Gilinamasis iššūkis (Bloom. Kūrimas ir sintezė). Sukurti ironišką antireklamą arba atlikti mini tyrimą apie socialinių tinklų reklaminius algoritmus ir manipuliacinius mechanizmus.\n• Kūrybinė veikla. Suformuluoti 3 probleminius klausimus bendraklasiams apie paslėptą įtaigą reklamoje.\n• Eksperto vaidmuo. Atlikti kitų mokinių sukurtų reklaminių tekstų recenziją (Peer Review).",
    average: "• Standartinis pritaikymas (Bloom. Supratimas ir taikymas). Išanalizuoti pateiktus reklaminius skelbimus, atpažinti bent 3 kalbinės įtaigos priemones ir perrašyti neutralų tekstą į įtaigų reklaminį tekstą.\n• Darbas poroje. Metodu „Pagalvok – Pasitark – Pasidalink“ sukurti 50 žodžių reklaminį tekstą pasirinktai prekei.\n• Savikontrolė. Pasitikrinti pagal pateiktą vertinimo rubriką.",
    struggling: "• Struktūruota bazinė užduotis (Bloom. Žinojimas ir atpažinimas). Atlikti 2 bazines užduotis pagal pateiktą pavyzdinį šabloną su atraminiais žodžiais.\n• Atraminės priemonės. Naudotis įtaigos priemonių atmintine ir pavyzdžių kortele.\n• Pagalba. Darbas tandeme su bendraklasiu arba mokytojo konsultacija."
  },
  differentiatedAssessment: {
    advanced: "• Vertinimo metodas. Kriterinis vertinimas pagal aukštesniojo lygio pasiekimų deskriptorius (kritinis mąstymas, analizės gilumas, originalumas).\n• Įsivertinimas. Savirefleksijos klausimas „Kokias manipuliacijas atpažinau ir kaip tai keičia mano požiūrį į medijų turinį?“.\n• Grįžtamasis ryšys. Mokytojo skatinamasis komentaras tolimesniam savarankiškam tyrimui.",
    average: "• Vertinimo metodas. Formuojamasis vertinimas pagal sėkmės kriterijus („Aš gebu atpažinti bent dvi įtaigos priemones“).\n• Įsivertinimas. Šviesoforo metodas ir trumpas pasitikrinimas poroje.\n• Grįžtamasis ryšys. Konkretūs patarimai, kaip sustiprinti teksto įtaigumą.",
    struggling: "• Vertinimo metodas. Padrąsinamasis vertinimas už pastangas ir bazinių terminų supratimą be streso dėl klaidų.\n• Įsivertinimas. Kontrolinis sąrašas (Checklist). 3 trumpi punktai apie atliktus žingsnius.\n• Grįžtamasis ryšys. Momentinis palaikymas žodžiu už kiekvieną atliktą dalį."
  },
  targetLevels: ['pažengę', 'vidutiniai', 'turintys sunkumų'],
  digitalResources: "Eduka klasė (skaitmeninis vadovėlis), Youtube kanalas 'Mokslo sriuba' (video apie psichologiją), Canva (plakatų kūrimui), Mentimeter (apklausoms).",
  homework: {
    purpose: "Įtvirtinti žinias stebint realią aplinką.",
    gifted: "Parengti mini tyrimą apie populiariausio socialinio tinklo reklamas.",
    general: "Rasti vieną reklamos pavyzdį namų aplinkoje ir įvardinti jos tikslinę grupę.",
    struggling: "Nurašyti vieną šūkį iš matytos reklamos ir nupiešti jai iliustraciją."
  },
  eDiaryEntry: {
    topicClassworkExpectations: "Reklamos kalba ir įtaigos priemonės. Klasės darbas. Reklaminių tekstų analizė, įtaigos priemonių atpažinimas, kūrybinis prekės aprašymas.",
    homework: "Rasti namų aplinkoje vieną reklamos pavyzdį ir įvardinti tikslinę grupę.",
    individualHomework: "Analizuoti manipuliacijos būdus pasirinktoje reklamoje.",
    notes: "Mokiniai dirbo aktyviai, ypač kūrybinėje dalyje.",
    isIntegrated: false,
    isOutside: false,
    eDiaryLessonType: "Įtvirtinimo"
  },
  motivation: "Kiekvienas mokinys yra kūrėjas. Šiandien jūs ne tik vartotojai, bet ir tie, kurie supranta žodžio galią. Sėkmės kūryboje."
};

const formatGeminiError = (err: any): string => {
  if (!err) return 'Nežinoma klaida.';
  console.error('DI Klaidos detalės:', err);
  const str = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
  
  if (str.includes('API_KEY_LEAKED') || str.includes('leaked') || str.includes('reported as leaked')) {
    return 'Klaida: Jūsų Gemini API raktas buvo anuliuotas/užblokuotas Google sistemoje (Google automatiškai blokuoja GitHub aptiktus raktus). Prašome susikurti naują raktą per Google AI Studio ir įvesti jį paspaudus „🔑 API Raktas“.';
  }
  if (str.includes('API_KEY_INVALID') || str.includes('API key not valid') || str.includes('400') || str.includes('403')) {
    return 'Klaida (403/400): Neteisingas, neaktyvus arba užblokuotas Gemini API raktas. Įveskite galiojantį Google AI Studio raktą per „🔑 API Raktas“.';
  }
  if (str.includes('Unexpected end of JSON input') || str.includes('Failed to execute \'json\'') || str.includes('tuščias atsakymas')) {
    return 'Klaida: Serveris negavo atsakymo iš Google DI. Dažniausia priežastis – užblokuotas arba nebegaliojantis API raktas. Atnaujinkite raktą per „🔑 API Raktas“.';
  }
  if (str.includes('429') || str.includes('RESOURCE_EXHAUSTED')) {
    return 'Klaida: Viršytas Gemini API užklausų limitas (Rate limit). Palaukite kelias sekundes ir bandykite vėl.';
  }
  if (str.includes('503') || str.includes('high demand') || str.includes('overloaded')) {
    return 'Klaida: Google DI serveriai šiuo metu perkrauti. Palaukite 5 sekundes ir paspauskite mygtuką dar kartą.';
  }
  if (str.includes('404') || str.includes('not found') || str.includes('NOT_FOUND')) {
    return `Klaida (404): Nurodytas Gemini API modelis nepasiekiamas jūsų projektui. Patikrinkite API rakto prieigą Google AI Studio.`;
  }
  return `Klaida: ${err.message || str}`;
};

const callDirectRestGemini = async (apiKey: string, model: string, contents: any, systemInstruction?: string, isJson?: boolean) => {
  const promptText = typeof contents === 'string' ? contents : (contents?.parts?.[0]?.text || JSON.stringify(contents));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  
  const bodyPayload: any = {
    contents: [{ parts: [{ text: promptText }] }]
  };
  if (systemInstruction) {
    bodyPayload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (isJson) {
    bodyPayload.generationConfig = { responseMimeType: 'application/json' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyPayload)
  });

  const rawText = await res.text();
  let data: any = null;
  if (rawText && rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn('REST API atsakymas nebuvo standartinis JSON:', rawText);
    }
  }

  if (!res.ok) {
    if (data?.error) {
      const errMsg = data.error.message || '';
      if (errMsg.includes('reported as leaked') || errMsg.includes('leaked')) {
        throw new Error('API_KEY_LEAKED: Jūsų Google Gemini API raktas buvo anuliuotas/užblokuotas Google sistemoje kaip nutekėjęs.');
      }
      throw new Error(errMsg || `Klaida ${res.status}: ${res.statusText}`);
    }
    if (rawText && (rawText.includes('leaked') || rawText.includes('reported as leaked'))) {
      throw new Error('API_KEY_LEAKED: Jūsų Google Gemini API raktas buvo anuliuotas/užblokuotas Google sistemoje kaip nutekėjęs.');
    }
    throw new Error(`Klaida (${res.status}): ${rawText || res.statusText || 'Tuščias serverio atsakymas'}`);
  }

  if (!data) {
    throw new Error('Gautas tuščias atsakymas iš Google DI serverio.');
  }

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    throw new Error('Tuščias DI atsakymas.');
  }
  return { text: generatedText };
};

const callGeminiWithFallback = async (apiKey: string, params: { contents: any; config?: any }) => {
  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  // 1. First attempt with @google/genai SDK across candidate models
  try {
    const ai = new GoogleGenAI({ apiKey });
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        if (msg.includes('leaked') || msg.includes('API_KEY_LEAKED')) {
          throw err;
        }
        console.warn(`SDK Modelis ${model} grąžino klaidą:`, err);
        continue;
      }
    }
  } catch (sdkInitErr: any) {
    const msg = sdkInitErr?.message || String(sdkInitErr);
    if (msg.includes('leaked') || msg.includes('API_KEY_LEAKED')) {
      throw sdkInitErr;
    }
    console.warn('SDK initialization/call issue, falling back to direct REST API...', sdkInitErr);
  }

  // 2. Fallback: Direct REST API fetch call (bypasses browser SDK bundling quirks)
  const systemInstructionText = typeof params.config?.systemInstruction === 'string' 
    ? params.config.systemInstruction 
    : (params.config?.systemInstruction?.parts?.[0]?.text || undefined);
  const isJsonMime = params.config?.responseMimeType === 'application/json';

  for (const model of models) {
    try {
      console.log(`Bandome tiesioginę REST užklausą su modeliu ${model}...`);
      const restRes = await callDirectRestGemini(apiKey, model, params.contents, systemInstructionText, isJsonMime);
      if (restRes && restRes.text) {
        return restRes;
      }
    } catch (restErr: any) {
      lastError = restErr;
      const msg = restErr?.message || String(restErr);
      if (msg.includes('leaked') || msg.includes('API_KEY_LEAKED')) {
        throw restErr;
      }
      console.warn(`Direct REST Modelis ${model} grąžino klaidą:`, restErr);
      continue;
    }
  }

  throw lastError || new Error('Nepavyko gauti atsakymo iš Gemini DI.');
};

const getStoredApiKey = (): string => {
  try {
    const local = localStorage.getItem('CUSTOM_GEMINI_API_KEY');
    if (local && local.trim().length > 0) return local.trim();
  } catch (e) {}

  const envKey = 
    process.env.API_KEY ||
    process.env.GEMINI_API_KEY ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.GEMINI_API_KEY) ||
    '';
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0 && envKey !== 'undefined') {
    return envKey.trim();
  }

  return '';
};

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
  const [selectedStudentLevels, setSelectedStudentLevels] = useState<string[]>(['pažengę', 'vidutiniai', 'turintys sunkumų']);

  const handleStudentLevelToggle = (levelId: string) => {
    setSelectedStudentLevels(prev => {
      if (prev.includes(levelId)) {
        if (prev.length === 1) return prev; // Visada paliekame bent vieną lygį
        return prev.filter(l => l !== levelId);
      } else {
        return [...prev, levelId];
      }
    });
  };
  
  const [isIntegratedInput, setIsIntegratedInput] = useState(false);
  const [integrationDetails, setIntegrationDetails] = useState('');
  const [isOutsideInput, setIsOutsideInput] = useState(false);
  const [outsideLocation, setOutsideLocation] = useState('');
  const [outsideGoal, setOutsideGoal] = useState('');

  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Modal states
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedPlan, setEditedPlan] = useState<LessonPlan | null>(null);

  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);
  const isLoadedFromDraft = useRef(false);

  // Reusable Template states
  const [customTemplates, setCustomTemplates] = useState<LessonTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

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

  // Time calculator states
  const [stageDurations, setStageDurations] = useState<Record<string, number>>({
    introduction: 5,
    theory: 10,
    practice: 20,
    consolidation: 5,
    summary: 5
  });

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

  // Load custom templates on mount
  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem('customLessonTemplates');
      if (storedTemplates) setCustomTemplates(JSON.parse(storedTemplates));
    } catch (e) { console.error(e); }
  }, []);

  // Sync custom templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('customLessonTemplates', JSON.stringify(customTemplates));
    } catch (e) { console.error(e); }
  }, [customTemplates]);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const draftStr = localStorage.getItem('lessonPlanDraft');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        if (draft.grade !== undefined) setGrade(draft.grade);
        if (draft.subject !== undefined) setSubject(draft.subject);
        if (draft.topic !== undefined) setTopic(draft.topic);
        if (draft.lessonType !== undefined) setLessonType(draft.lessonType);
        if (draft.goal !== undefined) setGoal(draft.goal);
        if (draft.activities !== undefined) setActivities(draft.activities);
        if (draft.evaluationCriteria !== undefined) setEvaluationCriteria(draft.evaluationCriteria);
        if (draft.selectedEvaluations !== undefined) setSelectedEvaluations(draft.selectedEvaluations);
        if (draft.selectedResources !== undefined) setSelectedResources(draft.selectedResources);
        if (draft.selectedStudentLevels !== undefined && Array.isArray(draft.selectedStudentLevels) && draft.selectedStudentLevels.length > 0) {
          setSelectedStudentLevels(draft.selectedStudentLevels);
        }
        if (draft.isIntegratedInput !== undefined) setIsIntegratedInput(draft.isIntegratedInput);
        if (draft.integrationDetails !== undefined) setIntegrationDetails(draft.integrationDetails);
        if (draft.isOutsideInput !== undefined) setIsOutsideInput(draft.isOutsideInput);
        if (draft.outsideLocation !== undefined) setOutsideLocation(draft.outsideLocation);
        if (draft.outsideGoal !== undefined) setOutsideGoal(draft.outsideGoal);
        if (draft.lessonPlan !== undefined) setLessonPlan(draft.lessonPlan);
        if (draft.editedPlan !== undefined) setEditedPlan(draft.editedPlan);
        if (draft.stageDurations !== undefined) setStageDurations(draft.stageDurations);
        if (draft.activePlanId !== undefined) setActivePlanId(draft.activePlanId);
      }
    } catch (e) {
      console.error("Klaida nuskaitant juodraštį:", e);
    } finally {
      isLoadedFromDraft.current = true;
    }
  }, []);

  // Auto-save progress to localStorage with debounce
  useEffect(() => {
    if (!isLoadedFromDraft.current) return;

    const timer = setTimeout(() => {
      try {
        const draft = {
          grade,
          subject,
          topic,
          lessonType,
          goal,
          activities,
          evaluationCriteria,
          selectedEvaluations,
          selectedResources,
          selectedStudentLevels,
          isIntegratedInput,
          integrationDetails,
          isOutsideInput,
          outsideLocation,
          outsideGoal,
          lessonPlan,
          editedPlan,
          stageDurations,
          activePlanId
        };
        localStorage.setItem('lessonPlanDraft', JSON.stringify(draft));
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
        setAutoSavedTime(timeStr);
      } catch (e) {
        console.error("Klaida automatiškai išsaugant juodraštį:", e);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    grade,
    subject,
    topic,
    lessonType,
    goal,
    activities,
    evaluationCriteria,
    selectedEvaluations,
    selectedResources,
    selectedStudentLevels,
    isIntegratedInput,
    integrationDetails,
    isOutsideInput,
    outsideLocation,
    outsideGoal,
    lessonPlan,
    editedPlan,
    stageDurations,
    activePlanId
  ]);

  const handleApplyTemplate = (templateId: string) => {
    const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];
    const t = allTemplates.find(x => x.id === templateId);
    if (t) {
      setGrade(t.grade);
      setSubject(t.subject);
      setLessonType(t.lessonType as LessonCategory);
      setGoal(t.goal);
      setActivities(t.activities);
      setEvaluationCriteria(t.evaluationCriteria);
      setSelectedEvaluations(t.selectedEvaluations);
      setSelectedResources(t.selectedResources);
      setStageDurations(t.stageDurations);
      setSelectedTemplateId(t.id);
    } else {
      setSelectedTemplateId('');
    }
  };

  const handleSaveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const newTemplate: LessonTemplate = {
      id: `template-${Date.now()}`,
      name: `${newTemplateName.trim()} 📋`,
      grade,
      subject,
      lessonType,
      goal,
      activities,
      evaluationCriteria,
      selectedEvaluations,
      selectedResources,
      stageDurations,
      isCustom: true
    };

    setCustomTemplates(prev => [newTemplate, ...prev]);
    setSelectedTemplateId(newTemplate.id);
    setNewTemplateName('');
    setShowSaveTemplateModal(false);
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Ar tikrai norite ištrinti šį šabloną?")) {
      setCustomTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplateId === id) {
        setSelectedTemplateId('');
      }
    }
  };

  const loadExample = () => {
    setSubject('Lietuvių kalba ir literatūra');
    setGrade('8 kl');
    setTopic(EXAMPLE_PLAN_DATA.lessonOverview.topic);
    setLessonType(EXAMPLE_PLAN_DATA.lessonType || 'Įtvirtinimo');
    setGoal(EXAMPLE_PLAN_DATA.lessonOverview.goal);
    setSelectedStudentLevels(['pažengę', 'vidutiniai', 'turintys sunkumų']);
    setSelectedEvaluations(EXAMPLE_PLAN_DATA.lessonOverview.evaluation.methods);
    setEvaluationCriteria(EXAMPLE_PLAN_DATA.lessonOverview.evaluation.criteria);
    setLessonPlan(EXAMPLE_PLAN_DATA);
    setEditedPlan(EXAMPLE_PLAN_DATA);
  };

  const systemInstruction = `Tu esi ekspertas pedagogas, puikiai išmanantis Lietuvos Bendrąsias ugdymo programas (BP). 
SVARBU. Visada remkis oficialiomis programomis, kurias galima rasti čia. https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos.

SVARBU. Tekstuose GRIEŽTAI VENGTI DVITAŠKIŲ. Vietoj jų naudok taškus.
Pvz. Vietoj "Tema: Veiksmažodis" rašyk "Tema. Veiksmažodis".

El. dienyno įrašuose (eDiaryEntry) NERAŠYK žodžių "Tema." ar "Namų darbai." pradžioje. Pateik tik turinį.
Pvz. Vietoj "Tema. Veiksmažodis" rašyk tiesiog "Veiksmažodis".
Nenaudok dvitaškių (:).

Struktūrizuotas diferencijavimas (differentiation) turi apimti.
- Gifted (Gabūs). Užduotys, kurios skatina analitinį, kritinį ir kūrybinį mąstymą (BLOOM taksonomijos viršūnė). Pateik sudėtingesnius tekstus, atvirus klausimus, projektinę veiklą.
- General (Vidutiniai). Užduotys, užtikrinančios BP reikalavimų pasiekimą (supratimas, taikymas).
- Struggling (Sunkumų turintys). Strategijos. vizualizacija, pagalbiniai klausimai, užduočių skaidymas į mažesnius etapus, sąvokų žodynėliai.

Būtinai pateik IŠSAMIAS veiklų organizavimo klasėje aprašymus (individualiai, porose, grupėse). Kiekviena veikla turi turėti nurodytą VEIKLOS BŪDĄ (pvz., diskusija, tyrimas, kūrybinis rašymas, simuliacija, debatai ir t.t.) ir konkrečias priemones bei šaltinius (internetines nuorodas, programėles).

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
  "differentiatedTasks": { "advanced": "...", "average": "...", "struggling": "..." },
  "differentiatedAssessment": { "advanced": "...", "average": "...", "struggling": "..." },
  "digitalResources": "...",
  "homework": { "purpose": "...", "gifted": "...", "general": "...", "struggling": "..." },
  "eDiaryEntry": { "topicClassworkExpectations": "...", "homework": "...", "individualHomework": "...", "notes": "...", "isIntegrated": false, "isOutside": false, "eDiaryLessonType": "..." },
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

  const handleGenerateFromTemplate = () => {
    if (!grade || !subject || !topic) {
      setError('Užpildykite privalomus laukus (*).');
      return;
    }
    setIsLoading(true);
    setError(null);
    setShowEditModal(false);

    try {
      const generated = buildPedagogicalPlan({
        subject,
        grade,
        topic,
        lessonType,
        goal,
        activities,
        selectedResources,
        selectedEvaluations,
        evaluationCriteria,
        isIntegratedInput,
        integrationDetails,
        isOutsideInput,
        outsideLocation,
        outsideGoal,
        stageDurations,
        selectedStudentLevels
      });

      const sanitizedPlan: LessonPlan = {
        ...generated,
        lessonType: (generated.lessonType as LessonCategory) || (lessonType as LessonCategory) || 'Įtvirtinimo'
      };

      setLessonPlan(sanitizedPlan);
      setEditedPlan(sanitizedPlan);
      setActivePlanId(null);

      if (window.innerWidth < 1024) {
        document.querySelector('.results-container')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(`Klaida generuojant šabloną: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grade || !subject || !topic) {
      setError('Užpildykite privalomus laukus (*).');
      return;
    }

    const activeKey = getStoredApiKey();
    // Jei nėra jokio API rakto arba jis neįvestas, iškart sklandžiai generuojame pagal pedagoginį šabloną (2 variantas)
    if (!activeKey) {
      handleGenerateFromTemplate();
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowEditModal(false);

    const prompt = `
      Sukurk išsamų ir struktūrizuotą pamokos planą.
      - Dalykas. ${subject}, Klasė. ${grade}, Tema. ${topic}
      - Tipas. ${lessonType}, Tikslas. ${goal}, Veiklos. ${activities}
      - Mokinių pasiekimų lygiai klasėje. ${selectedStudentLevels.join(', ')}
      - Naudojamos priemonės. ${selectedResources.join(', ')}
      - Vertinimo metodai. ${selectedEvaluations.join(', ')}
      - Vertinimo kriterijai. ${evaluationCriteria}
      - Integracija. ${isIntegratedInput ? integrationDetails : 'Ne'}
      - Pamoka už mokyklos ribų. ${isOutsideInput ? `Taip. Vieta. ${outsideLocation}, Tikslas. ${outsideGoal}.` : 'Ne'}
      
      GRIEŽTAI. 
      1. Būtinai remkis oficialiomis Lietuvos Bendrosiomis programomis (BP) iš https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos.
      2. Pateik labai konkrečias diferencijavimo strategijas trims mokinių grupėms (Gabūs, Vidutiniai, Sunkumų turintys). 
      3. Sugeneruok konkrečias diferencijuotas užduotis ('differentiatedTasks') ir vertinimo būdus ('differentiatedAssessment') kiekvienai pasirinktai mokinių grupei (advanced, average, struggling) pagal Bloom taksonomiją.
      4. NENAUDOK DVITAŠKIŲ TEKSTUOSE.
      5. Būtinai užpildyk 'classActivities' objektą pasiūlydamas IŠSAMIAS veiklas individualiai, porose ir grupėse. Kiekviena veikla turi turėti aiškų VEIKLOS BŪDĄ ir nurodytus įrankius.
      6. Pasiūlyk 'individualWork' (individualų darbą) atskirai bei 'digitalResources' (skaitmeninius išteklius - nuorodas, programėles) geriausiai tinkančius šiai temai.
      7. El. dienyne (eDiaryEntry) NERAŠYK "Tema." ir "Namų darbas." žodžių, pateik tik turinį.
    `;

    try {
      const response = await callGeminiWithFallback(activeKey, {
        contents: prompt,
        config: { systemInstruction, responseMimeType: "application/json" },
      });
      
      const parsedPlan = tryParseJSON(response.text || '');
      if (!parsedPlan) throw new Error("Nepavyko sugeneruoti plano formatu. Bandykite iš naujo.");

      const fallbackPedagogical = buildPedagogicalPlan({
        subject,
        grade,
        topic,
        lessonType,
        goal,
        activities,
        selectedResources,
        selectedEvaluations,
        evaluationCriteria,
        isIntegratedInput,
        integrationDetails,
        isOutsideInput,
        outsideLocation,
        outsideGoal,
        stageDurations,
        selectedStudentLevels
      });

      const sanitizedPlan: LessonPlan = {
        ...parsedPlan,
        targetLevels: selectedStudentLevels,
        differentiatedTasks: parsedPlan.differentiatedTasks || fallbackPedagogical.differentiatedTasks,
        differentiatedAssessment: parsedPlan.differentiatedAssessment || fallbackPedagogical.differentiatedAssessment,
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
      console.warn("DI generavimas nepavyko, persijungiama į pedagoginį šabloną:", e);
      // Atsarginis garantuotas variantas: jei DI raktas užblokuotas ar nepavyko, sugeneruojame pagal patikrintą šabloną
      handleGenerateFromTemplate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
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

    const activeKey = getStoredApiKey();
    if (!activeKey) {
      setTimeout(() => {
        let reply = "Esu jūsų pedagoginis pagalbininkas! Kadangi veikiame šabloniniu režimu be DI rakto, štai keletas patarimų:";
        if (lessonPlan) {
          reply += `\nPagal jūsų pamoką „${lessonPlan.lessonOverview?.topic}“ rekomenduojama:\n• Užduotis suskirstyti į 3 lygius (pagal poreikį).\n• Aktyvinti mokinius pasitelkiant porinį darbą ir refleksiją „3-2-1“ pamokos pabaigoje.`;
        } else {
          reply += "\nPasirinkite dalyką, klasę ir temą kairėje pusėje ir paspauskite „Generuoti planą 🚀“ arba „Šabloninis planas (be raktų)“!";
        }
        setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
        setIsChatLoading(false);
      }, 500);
      return;
    }

    try {
      let context = "Tu esi ekspertas pedagogas, asistentas, padedantis mokytojams. Atsakyk trumpai, aiškiai ir lietuviškai.";
      if (lessonPlan) {
        context += `\nŠtai dabartinis pamokos planas, apie kurį gali klausti mokytojas:\nTema: ${lessonPlan.lessonOverview.topic}\nTikslas: ${lessonPlan.lessonOverview.goal}\nEiga: ${JSON.stringify(lessonPlan.lessonStages)}`;
      }

      // We format the history for the model.
      const historyContents = chatMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      // Append the new user message
      historyContents.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await callGeminiWithFallback(activeKey, {
        contents: historyContents,
        config: {
          systemInstruction: context
        }
      });

      setChatMessages(prev => [...prev, { role: 'model', text: response.text || 'Atsiprašau, kažkas nutiko.' }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'model', text: formatGeminiError(err) }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const processedPlans = [...savedPlans]
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container">
      <header className="header">
        <h1>Pamokos plano rengimas ✏️</h1>
        <p>
          <a href="https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos" target="_blank" rel="noopener noreferrer" className="header-link">
            Griežtai vadovaujantis Lietuvos Bendrosiomis programomis
          </a>
        </p>
        
        <div className="header-sections">
            <div className="resource-links">
              <h3>📚 Šaltiniai</h3>
              <a href="https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos" target="_blank" rel="noopener noreferrer" className="mini-link">Programos (BP)</a>
              <a href="https://emokykla.lt/skaitmenines-mokymo-priemones" target="_blank" rel="noopener noreferrer" className="mini-link">Priemonės</a>
              <a href="https://emokykla.lt/bendrosios-programos/kompetencijos" target="_blank" rel="noopener noreferrer" className="mini-link">Kompetencijos</a>
            </div>

            <div className="tool-links">
              <h3>🛠️ Įrankiai</h3>
              <a href="https://www.manodienynas.lt" target="_blank" rel="noopener noreferrer" className="tool-button" style={{background: 'rgba(234, 88, 12, 0.18)', color: '#fb923c', border: '1px solid rgba(234, 88, 12, 0.4)', fontWeight: 600}}>
                📖 Mano Dienynas ↗
              </a>
              <a href="https://classroom.google.com" target="_blank" rel="noopener noreferrer" className="tool-button classroom">Classroom</a>
              <a href="https://miro.com" target="_blank" rel="noopener noreferrer" className="tool-button miro">Miro</a>
              <a href="https://canva.com" target="_blank" rel="noopener noreferrer" className="tool-button canva">Canva</a>
            </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="form-container">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
              <h2 style={{margin: 0}}>Pamokos informacija</h2>
              {autoSavedTime && (
                <span className="auto-save-badge" title="Juodraštis automatiškai išsaugotas naršyklėje">
                  💾 Išsaugota {autoSavedTime}
                </span>
              )}
            </div>
            <button onClick={loadExample} className="mini-link" style={{border: 'none', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)'}}>💡 Užkrauti pavyzdį</button>
          </div>
          <form onSubmit={handleGenerate}>
            {/* Šablonų valdymas */}
            <div className="templates-container" style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px'}}>
                <h4 style={{margin: 0, color: 'var(--heading-color)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <span>📋 Pamokos struktūros ir šablonai</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowSaveTemplateModal(true)} 
                  className="mini-link"
                  style={{
                    border: 'none', 
                    cursor: 'pointer', 
                    background: 'rgba(59, 130, 246, 0.15)', 
                    color: 'var(--primary-color)',
                    fontWeight: '600',
                    fontSize: '0.75rem'
                  }}
                >
                  💾 Išsaugoti šį šabloną
                </button>
              </div>
              
              <div className="templates-list-wrapper" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div className="templates-selector-group" style={{display: 'flex', gap: '8px'}}>
                  <select 
                    value={selectedTemplateId} 
                    onChange={e => handleApplyTemplate(e.target.value)}
                    style={{
                      flex: '1',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'var(--background-color)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-color-light)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="">-- Pasirinkite struktūros šabloną --</option>
                    <optgroup label="Paruošti pamokų šablonai">
                      {DEFAULT_TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </optgroup>
                    {customTemplates.length > 0 && (
                      <optgroup label="Mano išsaugoti šablonai">
                        {customTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  
                  {selectedTemplateId && customTemplates.some(t => t.id === selectedTemplateId) && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTemplate(selectedTemplateId, e)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: 'var(--error-color)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                      title="Ištrinti šį šabloną"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                
                {selectedTemplateId && (
                  <p className="helper-text" style={{margin: '0', fontSize: '0.75rem', color: 'var(--secondary-color)'}}>
                    ✓ Sėkmingai užkrauta šablono struktūra, laiko rėžiai ir metodai!
                  </p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Dalykas *</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Pvz. Lietuvių kalba ir literatūra" required />
            </div>
            <div className="form-group">
              <label>Klasė / Grupė *</label>
              <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="pvz., 7a" required />
            </div>
            <div className="form-group">
              <label>Tema *</label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="pvz., Veiksmažodžiai" required />
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
              <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="pvz., atpažinti..." rows={3} />
            </div>

            {/* Mokinių lygio pasirinkimas ir diferencijavimo nustatymai */}
            <div className="student-levels-container">
              <div className="student-levels-header">
                <div>
                  <h4 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span>👥 Mokinių pasiekimų lygiai klasėje</span>
                    <span style={{fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-color-light)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px'}}>
                      Pasirinkti lygiai. {selectedStudentLevels.length} iš 3
                    </span>
                  </h4>
                  <p style={{margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-color-light)'}}>
                    Pasirinkite, kokioms mokinių grupėms sugeneruoti konkrečias diferencijuotas užduotis ir vertinimo būdus pagal atnaujintas BP.
                  </p>
                </div>
              </div>

              {/* Greitieji pasirinkimai */}
              <div className="level-presets-bar">
                <button
                  type="button"
                  className="level-preset-btn"
                  onClick={() => setSelectedStudentLevels(['pažengę', 'vidutiniai', 'turintys sunkumų'])}
                >
                  ⚡ Visi lygiai (Heterogeninė klasė)
                </button>
                <button
                  type="button"
                  className="level-preset-btn"
                  onClick={() => setSelectedStudentLevels(['vidutiniai', 'turintys sunkumų'])}
                >
                  🎯 Standartinis + Pagalba (SUP)
                </button>
                <button
                  type="button"
                  className="level-preset-btn"
                  onClick={() => setSelectedStudentLevels(['pažengę', 'vidutiniai'])}
                >
                  🌟 Pažengę + Vidutiniai
                </button>
              </div>

              {/* Kortelės kiekvienam lygiui */}
              <div className="student-levels-grid">
                {STUDENT_LEVEL_OPTIONS.map(opt => {
                  const isChecked = selectedStudentLevels.includes(opt.id);
                  const levelClass = opt.id === 'pažengę' ? 'advanced' : opt.id === 'vidutiniai' ? 'average' : 'struggling';
                  return (
                    <div
                      key={opt.id}
                      className={`student-level-card ${levelClass} ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleStudentLevelToggle(opt.id)}
                    >
                      <div className="level-checkbox-row">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleStudentLevelToggle(opt.id)}
                          onClick={e => e.stopPropagation()}
                        />
                        <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                          <span className="level-title">{opt.label}</span>
                          <span className={`level-badge ${levelClass}`}>{opt.badge}</span>
                        </div>
                      </div>
                      <div className="level-bloom-tag">
                        Bloom. {opt.bloom}
                      </div>
                      <div className="level-desc">
                        {opt.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Papildomos idėjos</label>
              <textarea value={activities} onChange={e => setActivities(e.target.value)} placeholder="pvz., žaidimai..." rows={2} />
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
              <label>Vertinimo metodai (pasirinkite kelis)</label>
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
              <label>Vertinimo kriterijai</label>
              <textarea value={evaluationCriteria} onChange={e => setEvaluationCriteria(e.target.value)} placeholder="Aprašykite vertinimo kriterijus..." rows={3} />
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

            <div style={{marginTop: '1.25rem'}}>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="generate-button"
                style={{width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700}}
              >
                {isLoading ? "Rengiamas išsamus planas..." : "Sukurti pamokos planą 🚀"}
              </button>
            </div>
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
              <p>Rengiamas išsamus pamokos planas...</p>
            </div>
          )}
          {error && (
            <div className="error-message">
              <div>{error}</div>
            </div>
          )}
          
          {!isLoading && !lessonPlan && (
            <div className="welcome-message">
              <h2>Sveiki! 👋</h2>
              <p>Kairėje pasirinkite dalyką, klasę, įrašykite pamokos temą ir paspauskite <strong>„Sukurti pamokos planą 🚀“</strong>.</p>
              <p style={{marginTop: '15px', opacity: 0.9, fontSize: '0.92rem', lineHeight: '1.6'}}>
                ✓ Programa akimirksniu parengs <strong>išsamų, praktišką pamokos planą su konkrečiomis veiklomis</strong>, dideliu metodų pasirinkimu, diferencijuotomis užduotimis (Gabūs, Vidutiniai, Sunkumų patiriantys) bei paruoštais įrašais sistemai <strong>„Mano dienynas“</strong> (nukopijuosite vienu paspaudimu).
              </p>
            </div>
          )}

          {lessonPlan && (
            <div className="lesson-plan-result">
              <div className="export-container">
                <button onClick={() => setShowSaveConfirm(true)} className="save-button">Išsaugoti 💾</button>
                <button onClick={() => { setEditedPlan(lessonPlan); setShowEditModal(true); }} className="edit-modal-btn">Redaguoti ✏️</button>
                <button onClick={() => window.print()} className="print-button">Spausdinti 🖨️</button>
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
                      Viso: {(() => {
                        let sum = 0;
                        for (const val of Object.values(stageDurations)) {
                          sum += Number(val) || 0;
                        }
                        return sum;
                      })()} min.
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
                    let totalMin = 0;
                    for (const val of Object.values(stageDurations)) {
                      totalMin += Number(val) || 0;
                    }
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
                    let totalMin = 0;
                    for (const val of Object.values(stageDurations)) {
                      totalMin += Number(val) || 0;
                    }
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

              {/* 🎯 Diferencijuotos užduotys pagal mokinių lygius */}
              <div className="card results-diff-section" style={{borderLeftColor: '#38bdf8'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px'}}>
                  <h3 style={{margin: 0}}>🎯 Diferencijuotos užduotys pagal mokinių lygius</h3>
                  <span style={{fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '3px 8px', borderRadius: '6px'}}>
                    Atnaujintos BP pasiekimų lygiai ir Bloom taksonomija
                  </span>
                </div>
                <p style={{fontSize: '0.82rem', color: 'var(--text-color-light)', marginTop: 0, marginBottom: '14px'}}>
                  Kiekvienai mokinių grupei paruoštos konkrečios veiklos, atitinkančios jų pasiekimų lygį, mąstymo gylį bei individualius poreikius.
                </p>
                <div className="diff-grid">
                  <div className={`diff-item gifted ${selectedStudentLevels.includes('pažengę') ? 'highlight-active' : ''}`}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                      <span className="diff-header" style={{color: '#38bdf8', margin: 0}}>Pažengę (Gabūs) 🌟</span>
                      <span className="level-badge advanced">Aukštesnysis lygis</span>
                    </div>
                    <span className="level-bloom-tag">Bloom. Kūrimas, analizė ir sintezė</span>
                    <p className="diff-text" style={{whiteSpace: 'pre-line', marginTop: '6px'}}>
                      {lessonPlan.differentiatedTasks?.advanced || lessonPlan.differentiation?.gifted}
                    </p>
                  </div>

                  <div className={`diff-item average ${selectedStudentLevels.includes('vidutiniai') ? 'highlight-active' : ''}`}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                      <span className="diff-header" style={{color: '#60a5fa', margin: 0}}>Vidutiniai mokiniai ✅</span>
                      <span className="level-badge average">Pagrindinis lygis</span>
                    </div>
                    <span className="level-bloom-tag">Bloom. Supratimas ir taikymas</span>
                    <p className="diff-text" style={{whiteSpace: 'pre-line', marginTop: '6px'}}>
                      {lessonPlan.differentiatedTasks?.average || lessonPlan.differentiation?.general}
                    </p>
                  </div>

                  <div className={`diff-item struggling ${selectedStudentLevels.includes('turintys sunkumų') ? 'highlight-active' : ''}`}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                      <span className="diff-header" style={{color: '#f87171', margin: 0}}>Mokiniai su sunkumais (SUP) 🛡️</span>
                      <span className="level-badge struggling">Slenkstinis lygis</span>
                    </div>
                    <span className="level-bloom-tag">Bloom. Žinojimas ir bazinis taikymas</span>
                    <p className="diff-text" style={{whiteSpace: 'pre-line', marginTop: '6px'}}>
                      {lessonPlan.differentiatedTasks?.struggling || lessonPlan.differentiation?.struggling}
                    </p>
                  </div>
                </div>
              </div>

              {/* 📊 Diferencijuoti vertinimo ir įsivertinimo būdai */}
              <div className="card" style={{borderLeftColor: '#a855f7'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px'}}>
                  <h3 style={{margin: 0}}>📊 Diferencijuoti vertinimo ir įsivertinimo būdai</h3>
                  <span style={{fontSize: '0.75rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.12)', padding: '3px 8px', borderRadius: '6px'}}>
                    Kriterinis ir formuojamasis vertinimas
                  </span>
                </div>
                <p style={{fontSize: '0.82rem', color: 'var(--text-color-light)', marginTop: 0, marginBottom: '14px'}}>
                  Tiksliniai vertinimo metodai, įsivertinimo klausimai bei grįžtamojo ryšio strategijos kiekvienai mokinių grupei.
                </p>
                <div className="diff-grid">
                  <div className={`diff-item gifted ${selectedStudentLevels.includes('pažengę') ? 'highlight-active' : ''}`}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                      <span className="diff-header" style={{color: '#38bdf8', margin: 0}}>Pažengusiųjų vertinimas 🌟</span>
                      <span className="level-badge advanced">Aukštesnysis lygis</span>
                    </div>
                    <p className="diff-text" style={{whiteSpace: 'pre-line', marginTop: '6px'}}>
                      {lessonPlan.differentiatedAssessment?.advanced || "• Kriterinis vertinimas pagal aukštesniojo lygio deskriptorius.\n• Savirefleksija apie platesnį pritaikymą.\n• Tarpusavio vertinimas (Peer Review)."}
                    </p>
                  </div>

                  <div className={`diff-item average ${selectedStudentLevels.includes('vidutiniai') ? 'highlight-active' : ''}`}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                      <span className="diff-header" style={{color: '#60a5fa', margin: 0}}>Vidutinių mokinių vertinimas ✅</span>
                      <span className="level-badge average">Pagrindinis lygis</span>
                    </div>
                    <p className="diff-text" style={{whiteSpace: 'pre-line', marginTop: '6px'}}>
                      {lessonPlan.differentiatedAssessment?.average || "• Formuojamasis vertinimas pagal sėkmės kriterijus („Aš gebu...“).\n• Šviesoforo metodas ir greita mini viktorina.\n• Pasitikrinimas porose su etalonu."}
                    </p>
                  </div>

                  <div className={`diff-item struggling ${selectedStudentLevels.includes('turintys sunkumų') ? 'highlight-active' : ''}`}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                      <span className="diff-header" style={{color: '#f87171', margin: 0}}>Turinčių sunkumų vertinimas 🛡️</span>
                      <span className="level-badge struggling">Slenkstinis lygis</span>
                    </div>
                    <p className="diff-text" style={{whiteSpace: 'pre-line', marginTop: '6px'}}>
                      {lessonPlan.differentiatedAssessment?.struggling || "• Padrąsinamasis vertinimas už individualią pažangą ir pastangas.\n• Žingsninis kontrolinis sąrašas (Checklist).\n• Momentinis palaikymas žodžiu be baimės klysti."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card results-diff-section">
                <h3>📝 Bendrosios diferencijavimo ir pagalbos strategijos</h3>
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

              <div className="card" style={{borderLeftColor: '#f97316'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px'}}>
                  <h3 style={{margin: 0}}>📖 „Mano dienynas“ įrašai (paruošta nukopijavimui)</h3>
                  <a 
                    href="https://www.manodienynas.lt" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mini-link"
                    style={{color: '#fb923c', textDecoration: 'none', border: '1px solid rgba(251, 146, 60, 0.4)', padding: '4px 8px', borderRadius: '6px'}}
                  >
                    Atverti Mano Dienyną ↗
                  </a>
                </div>
                <p style={{fontSize: '0.82rem', color: 'var(--text-color-light)', marginBottom: '14px', marginTop: 0}}>
                  Šie laukai suformatuoti pagal „Mano dienynas“ reikalavimus (tema be perteklinių žodžių, aiški klasės veikla, namų darbai ir pastabos). Spustelėkite „Kopijuoti“ prie reikiamo laukelio.
                </p>
                {[
                  { key: 'topicClassworkExpectations', label: 'Pamokos tema ir klasės darbas', hint: 'Įklijuokite į „Tema / Klasės darbas“ lauką' },
                  { key: 'homework', label: 'Namų darbai', hint: 'Įklijuokite į „Namų darbai“ lauką' },
                  { key: 'notes', label: 'Pamokos pastaba / Vertinimas', hint: 'Įklijuokite į „Pastaba / Refleksija“ lauką' }
                ].map(({ key, label, hint }) => (
                  <div key={key} className="diary-field-wrapper">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
                      <label className="diary-label" style={{margin: 0, color: '#fb923c'}}>{label}</label>
                      <span style={{fontSize: '0.75rem', color: 'var(--text-color-light)', opacity: 0.7}}>{hint}</span>
                    </div>
                    <div className="diary-field">
                      <span className="diary-text">{lessonPlan.eDiaryEntry ? (lessonPlan.eDiaryEntry as any)[key] : ''}</span>
                      <button 
                        onClick={() => lessonPlan.eDiaryEntry && handleCopy((lessonPlan.eDiaryEntry as any)[key], key)} 
                        className="copy-button"
                        style={{
                          background: copiedField === key ? 'var(--success-color)' : '#ea580c',
                          minWidth: '90px'
                        }}
                      >
                        {copiedField === key ? 'Nukopijuota! ✓' : 'Kopijuoti'}
                      </button>
                    </div>
                  </div>
                ))}
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

              <div className="edit-divider">🎯 Diferencijuotos užduotys pagal lygius</div>
              <div className="edit-group">
                <label>Užduotys pažengusiems (Aukštesnysis lygis)</label>
                <textarea 
                  value={editedPlan.differentiatedTasks?.advanced || ''} 
                  onChange={e => updateEditedField('differentiatedTasks.advanced', e.target.value)} 
                  rows={2} 
                />
              </div>
              <div className="edit-group">
                <label>Užduotys vidutiniams (Pagrindinis lygis)</label>
                <textarea 
                  value={editedPlan.differentiatedTasks?.average || ''} 
                  onChange={e => updateEditedField('differentiatedTasks.average', e.target.value)} 
                  rows={2} 
                />
              </div>
              <div className="edit-group">
                <label>Užduotys turintiems sunkumų (Slenkstinis lygis)</label>
                <textarea 
                  value={editedPlan.differentiatedTasks?.struggling || ''} 
                  onChange={e => updateEditedField('differentiatedTasks.struggling', e.target.value)} 
                  rows={2} 
                />
              </div>

              <div className="edit-divider">📊 Diferencijuotas vertinimas</div>
              <div className="edit-group">
                <label>Vertinimas pažengusiems</label>
                <textarea 
                  value={editedPlan.differentiatedAssessment?.advanced || ''} 
                  onChange={e => updateEditedField('differentiatedAssessment.advanced', e.target.value)} 
                  rows={2} 
                />
              </div>
              <div className="edit-group">
                <label>Vertinimas vidutiniams</label>
                <textarea 
                  value={editedPlan.differentiatedAssessment?.average || ''} 
                  onChange={e => updateEditedField('differentiatedAssessment.average', e.target.value)} 
                  rows={2} 
                />
              </div>
              <div className="edit-group">
                <label>Vertinimas turintiems sunkumų</label>
                <textarea 
                  value={editedPlan.differentiatedAssessment?.struggling || ''} 
                  onChange={e => updateEditedField('differentiatedAssessment.struggling', e.target.value)} 
                  rows={2} 
                />
              </div>

              <div className="edit-divider">Bendrasis diferencijavimas</div>
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

              <div className="edit-divider">📖 „Mano dienynas“ įrašai</div>
              <div className="edit-group">
                <label>Pamokos tema ir klasės darbas</label>
                <textarea value={editedPlan.eDiaryEntry.topicClassworkExpectations} onChange={e => updateEditedField('eDiaryEntry.topicClassworkExpectations', e.target.value)} rows={2} />
              </div>
              <div className="edit-group">
                <label>Namų darbai</label>
                <textarea value={editedPlan.eDiaryEntry.homework} onChange={e => updateEditedField('eDiaryEntry.homework', e.target.value)} rows={1} />
              </div>
               <div className="edit-group">
                <label>Pamokos pastabos / Vertinimas</label>
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

      {showSaveTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowSaveTemplateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Išsaugoti kaip šabloną</h2>
            </div>
            <form onSubmit={handleSaveCustomTemplate}>
              <p className="modal-body-text" style={{color: 'var(--text-color)', marginBottom: '15px'}}>
                Įveskite šablono pavadinimą. Šis šablonas išsaugos dabartinius formos laukus (dalyką, klasę, pamokos tipą, tikslą, veiklas, vertinimo kriterijus bei nustatytus laiko rėžius) kaip greitai pasirinktiną struktūrą.
              </p>
              <div className="edit-group" style={{marginBottom: '20px'}}>
                <label style={{display: 'block', color: 'var(--text-color-light)', marginBottom: '6px', fontSize: '0.9rem'}}>Šablono pavadinimas *</label>
                <input 
                  type="text" 
                  value={newTemplateName} 
                  onChange={e => setNewTemplateName(e.target.value)} 
                  placeholder="pvz., Mano 8 kl. praktinė struktūra" 
                  required 
                  style={{
                    width: '100%', 
                    padding: '10px', 
                    background: 'var(--background-color)', 
                    border: '1px solid var(--border-color)', 
                    color: 'white', 
                    borderRadius: '8px', 
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <div className="modal-actions">
                  <button type="submit" className="modal-btn confirm">Išsaugoti šabloną</button>
                  <button type="button" onClick={() => setShowSaveTemplateModal(false)} className="modal-btn cancel">Atšaukti</button>
              </div>
            </form>
          </div>
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

const container = document.getElementById('root')!;
let root = (window as any).__reactRoot;
if (!root) {
  root = createRoot(container);
  (window as any).__reactRoot = root;
}
root.render(<App />);
