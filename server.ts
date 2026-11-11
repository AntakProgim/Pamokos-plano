import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { buildPedagogicalPlan, GenerateTemplateParams, generateRealWorldExamples } from './src/templatePlanGenerator.ts';
import { generateSmartGoalPedagogical, GenerateSmartGoalParams } from './src/smartGoalService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function parseCliArgs() {
  const args = process.argv.slice(2);
  let port: number | null = null;
  let host: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && i + 1 < args.length) {
      const parsed = parseInt(args[i + 1], 10);
      if (!isNaN(parsed)) port = parsed;
    } else if (args[i].startsWith('--port=')) {
      const parsed = parseInt(args[i].split('=')[1], 10);
      if (!isNaN(parsed)) port = parsed;
    } else if (args[i] === '--host' && i + 1 < args.length) {
      host = args[i + 1];
    } else if (args[i].startsWith('--host=')) {
      host = args[i].split('=')[1];
    }
  }

  return { port, host };
}

const cliArgs = parseCliArgs();
const PORT = cliArgs.port ?? (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
const HOST = cliArgs.host ?? process.env.HOST ?? '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client with required telemetry User-Agent
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim() || apiKey.trim() === 'undefined' || apiKey.trim() === 'null' || apiKey.trim().length < 8) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function cleanJsonString(str: string): string {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 1. Generate comprehensive lesson plan
app.post('/api/generate-plan', async (req, res) => {
  const params: GenerateTemplateParams & { prompt?: string; systemInstruction?: string } = req.body;
  const {
    subject = '',
    grade = '',
    topic = '',
    lessonType = '',
    activities = '',
    goal = '',
    homeworkPurpose = 'Įtvirtinti įgūdžius ir žinias',
    evaluationCriteria = '',
    selectedEvaluations = [],
    selectedResources = [],
    selectedStudentLevels = ['pažengę', 'vidutiniai', 'turintys sunkumų'],
    classLearningNotes = '',
    realWorldNote = '',
    isIntegratedInput = false,
    integrationDetails = '',
    isOutsideInput = false,
    outsideLocation = '',
    outsideGoal = '',
    isAssessmentWork = false,
    assessmentType = 'Kontrolinis darbas',
    assessmentPurpose = '',
    assessmentTopics = '',
    assessmentDate = '',
    assessmentCorrectionDeadline = '',
    assessmentRetakePolicy = '',
    assessmentFeedbackDays = '5 d.d.',
    enableAssessmentReminderEmail = false,
    assessmentReminderEmail = '',
    assessmentReminderTime = 'Likus 1 d. iki termino',
    prompt: clientPrompt,
    systemInstruction: clientSystemInstruction
  } = params;

  const resolvedTopic = (topic && typeof topic === 'string' && topic.trim().length > 0)
    ? topic.trim()
    : (params.bpContentDescription ? params.bpContentDescription.split('.')[0].trim() : '') || `${subject || 'Bendrasis ugdymas'} pamoka pagal BP`;

  if (!grade || !subject) {
    return res.status(400).json({ error: 'Užpildykite privalomus laukus (dalykas ir klasė).' });
  }

  params.topic = resolvedTopic;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const systemInstruction = clientSystemInstruction || `
Tu esi profesionalus Lietuvos ugdymo ekspertas ir mokytojų asistentas. Tavo tikslas – padėti mokytojams kokybiškai, greitai ir pagal oficialias rekomendacijas užpildyti „Mano dienynas“ laukus bei parengti pamokos planą.

BŪTINOSIOS TAISYKLĖS EL. DIENYNO ĮRAŠAMS (eDiaryEntry):
1. Temos formuluotės standartas (A0010 modelis):
   Struktūra: „[Dalykas]: [Temos pavadinimas]. Mokymosi uždavinys: [ko išmoks]. Veikla: [kokią veiklą atliks / metodas].“
2. Atitiktis BP ir Pasiekimų raidai:
   Uždaviniai atitinka Bendrųjų programų pasiekimų raidą konkrečiam koncentrui. Naudok aktyvius veiksmažodžius.
3. Neakademiniai dalykai (Klasės vadovo veikla, Etika, Fizinis ugdymas, Gyvenimo įgūdžiai):
   Privaloma atspindėti socialinį-emocinį raštingumą, pilietiškumą, ugdymą karjerai, bendruomeniškumą ar vertybinį ugdymą.
4. Namų darbų formulavimas (N0015, N0016 modelis):
   Struktūra: „Tikslas – [nurodyti tikslą]. Užduotis: [konkretus veiksmas]. (Rekomenduojama trukmė: ~[X] min.).“
5. Integracija ir kitos aplinkos:
   Jei pamoka integruota ar vyksta už mokyklos ribų – aiškiai išskirk aprašo pradžioje (pvz., „[INTEGRUOTA PAMOKA (su biologija)]: ...“).
6. Pastabos (PEPIS ir Nesmurtinė komunikacija):
   Pastabose nurodyk temos gyvenimišką vertę ir sąsają su profesijomis. Komunikuok remiantis NVC ir PEPIS principals (pozityvumas, pastebėjimai, vertė).
7. TRYS VARIANTAI (eDiaryEntry.variants):
   - 1 VARIANTAS (Praktinis): Orientuotas į praktiką ir pritaikomumą.
   - 2 VARIANTAS (Kūrybinis / Probleminis): Orientuotas į kūrybiškumą, diskusijas ar problemų sprendimą.
   - 3 VARIANTAS (Analitinis / Tiriamasis): Orientuotas į gilesnę analizę ar savarankišką tyrinėjimą.
8. DIFERENCIJAVIMAS IR KOKYBĖ (eDiaryEntry.differentiationAdvice):
   - scaffolding: Konkretus patarimas, kaip padėti sunkiau besimokantiems (žodynėlis, atraminė schema).
   - challenge: Konkretus patarimas, kaip praplėsti veiklą gabesniems (papildomas kintamasis, lyderystė).
   - qualityFocus: Vienas patarimas įtraukimui ir kokybei (interaktyvus įrankis, refleksijos metodas).

Atsakymą pateik griežtai JSON formatu pagal nurodytą struktūrą.
      `;

      const prompt = clientPrompt || `
Sukurk pamokos planą ir 3 el. dienyno įrašų variantus pagal atnaujintas BP ir eMokykla.lt rekomendacijas:
- Mokomasis dalykas. ${subject}
- Klasė. ${grade}
- Pamokos tema. ${resolvedTopic}
- Pamokos tipas. ${lessonType || 'Standartinė / Mišri'}
- Mokytojo numatytas tikslas. ${goal || 'Parengti pagal Bloom taksonomiją ir SMART principus'}
- Mokytojo numatytos veiklos. ${activities || 'Pasiūlyti interaktyvias, aktyvaus ugdymo veiklas'}
- Namų darbų tikslingumas. ${homeworkPurpose}
- Vertinimo kriterijai. ${evaluationCriteria || 'Nenurodyta'}
- Pasirinkti vertinimo būdai. ${selectedEvaluations.join(', ') || 'Nenurodyta'}
- Klasės mokymosi ypatumai. ${classLearningNotes || 'Standartinis klasės tempas'}
- Papildomas gyvenimiškas kontekstas. ${realWorldNote || 'Išplėtoti pagal temos specifiką'}
- Pasirinktos priemonės. ${selectedResources.join(', ') || 'Vadovėlis, interaktyvus ekranas, skaitmeniniai įrankiai'}
- Mokinių pasiekimų lygiai klasėje. ${selectedStudentLevels.join(', ')}
- Integruota pamoka. ${isIntegratedInput ? `Taip. Integruojama su. ${integrationDetails}.` : 'Ne'}
- Pamoka už mokyklos ribų. ${isOutsideInput ? `Taip. Vieta. ${outsideLocation}, Tikslas. ${outsideGoal}.` : 'Ne'}

GRIEŽTAI NENAUDOK DVITAŠKIŲ TEKSTUOSE (naudok taškus arba brūkšnelius).
Pateik 3 el. dienyno variantus masyve "variants" ir diferencijavimo patarimus objekte "differentiationAdvice".
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const raw = response.text || '';
      const cleaned = cleanJsonString(raw);
      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed === 'object') {
        return res.json({ success: true, plan: parsed, mode: 'ai' });
      }
    } catch (aiErr: any) {
      const errMsg = aiErr?.message || String(aiErr);
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || aiErr?.status === 'INVALID_ARGUMENT') {
        console.log('Gemini API key is not valid, applying rich pedagogical template engine.');
      } else {
        console.log('Gemini plan generation fallback notice:', errMsg.slice(0, 100));
      }
    }
  }

  // Graceful fallback to verified comprehensive pedagogical plan
  const plan = buildPedagogicalPlan(params);
  return res.json({ success: true, plan, mode: 'pedagogical_template' });
});

// 2. Generate extra creative pedagogical ideas
app.post('/api/generate-ideas', async (req, res) => {
  const { subject = 'Bendrasis ugdymas', grade = '8 klasė', topic = 'Pamokos tema' } = req.body;
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `Tu esi kūrybingas didaktikos inovatorius. Pasiūlyk 3 IŠSKIRTINES, NETIKĖTAS IR GYVAS idėjas bei metodus pamokai.
Dalykas. ${subject}, Klasė. ${grade}, Tema. ${topic}.
Pasiūlyk.
1. Netikėtą žaidybinį ar simuliacinį metodą.
2. STEAM ar kūrybinį projektinį iššūkį.
3. Kūrybišką greito įsivertinimo ar refleksijos formatą.
GRIEŽTAI NENAUDOK DVITAŠKIŲ TEKSTUOSE. Kiekvieną idėją aprašyk su aiškia instrukcija mokytojui (2-3 sakiniai).
Atsakymą pateik JSON formatu. { "ideas": ["...", "...", "..."] }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(cleanJsonString(response.text || ''));
      if (parsed && Array.isArray(parsed.ideas)) {
        return res.json({ success: true, ideas: parsed.ideas, mode: 'ai' });
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key') || err?.status === 'INVALID_ARGUMENT') {
        console.log('Gemini API key is not valid, using pedagogical ideas.');
      } else {
        console.log('Gemini ideas fallback notice:', errMsg.slice(0, 100));
      }
    }
  }

  // Fallback high quality ideas
  const fallbackIdeas = [
    `Kūrybinis iššūkis „Temos detektyvai“. Mokiniai gauna paslaptingą voką su užuominomis apie temą „${topic}“ ir per 5 min. porose turi iššifruoti pagrindinį dėsningumą.`,
    `STEAM ir tarpdalykinė simuliacija. Sukurti trumpą radijo ar tinklalaidės (podcast) interviu (1 min.), kur vienas mokinys kalbina „ekspertą“ apie temos „${topic}“ pritaikymą šiuolaikiniame pasaulyje.`,
    `Mini žaidimas „Karštoji kėdė“. Vienas savanoris mokinys atsisėda prieš klasę ir per 2 min. turi atsakyti į 5 bendraklasių klausimus apie temą „${topic}“.`,
  ];
  return res.json({ success: true, ideas: fallbackIdeas, mode: 'pedagogical_template' });
});

// 3. Generate SMART Goal
app.post('/api/generate-smart-goal', async (req, res) => {
  const params: GenerateSmartGoalParams = req.body;
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `Tu esi patyręs Lietuvos bendrojo ugdymo didaktikos ekspertas.
Sukurk profesionalų, pedagogiškai nepriekaištingą SMART pamokos uždavinį / tikslą.
PAMOKOS DUOMENYS.
- Mokomasis dalykas. ${params.subject || 'Bendrasis ugdymas'}
- Pamokos tema. ${params.topic || 'Pamokos tema'}
- Klasė. ${params.grade || 'Klasė'}
- Pageidaujamas Bloom lygis. ${params.bloomLevelId || 'Taikymas'}
- Papildomas akcentas / metodas. ${params.focusMethod || 'Standartinis'}

METODINIAI REIKALAVIMAI.
1. Formuluok pagal SMART principą (Specific, Measurable, Achievable, Relevant, Time-bound).
2. GRIEŽTAI VENGTI DVITAŠKIŲ TEKSTUOSE (vietoj dvitaškių naudok taškus arba brūkšnelius).
3. Formuluok mokinių gebėjimų kalba („Mokiniai gebės...“), o ne mokytojo veiklos kalba.
4. Pateik 3 diferencijuotas pakopas (slenkstinis mokinys, pagrindinis mokinys, aukštesnysis/pažengęs mokinys).

Atsakymą pateik griežtai JSON formatu:
{
  "mainGoal": "Mokiniai gebės...",
  "smartBreakdown": {
    "specific": "...",
    "measurable": "...",
    "achievable": "...",
    "relevant": "...",
    "timeBound": "Iki pamokos pabaigos (45 min.)"
  },
  "differentiated": {
    "struggling": "...",
    "average": "...",
    "advanced": "..."
  },
  "successCriteria": ["...", "...", "..."]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(cleanJsonString(response.text || ''));
      if (parsed && parsed.mainGoal) {
        return res.json({ success: true, result: parsed, mode: 'ai' });
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key') || err?.status === 'INVALID_ARGUMENT') {
        console.log('Gemini API key is not valid, using pedagogical SMART goal template.');
      } else {
        console.log('Gemini SMART goal fallback notice:', errMsg.slice(0, 100));
      }
    }
  }

  const result = generateSmartGoalPedagogical(params);
  return res.json({ success: true, result, mode: 'pedagogical_template' });
});

// 3b. Real-world application examples generator endpoint
app.post('/api/generate-real-world-examples', async (req, res) => {
  const { subject = '', topic = '', grade = '' } = req.body;
  const ai = getGeminiClient();

  if (ai && topic) {
    try {
      const prompt = `Pateik 4 konkrečius realaus gyvenimo pritaikymo pavyzdžius šiai pamokai pagal atnaujintas BP ir eMokykla.lt rekomendacijas:
Dalykas. ${subject}
Tema. ${topic}
Klasė. ${grade}

Kategorijos:
1. daily (Kasdienybė ir asmeniniai finansai / asmeninė patirtis)
2. career (Šiuolaikinės profesijos ir darbo rinka)
3. steam (Technologijos, inovacijos ir ateities įgūdžiai)
4. advice (Praktinis patarimas mokiniui: „Kam man to prireiks?“)

Pateik atsakymą JSON masyvu:
[
  {
    "id": "rw-1",
    "category": "daily",
    "categoryTitle": "Kasdienis gyvenimas ir asmeniniai finansai",
    "categoryIcon": "🏠",
    "title": "...",
    "text": "...",
    "snippetForNotes": "Glausta frazė, tinkama įkelti tiesiai į el. dienyno pastabas..."
  },
  ...
]
GRIEŽTAI NENAUDOK DVITAŠKIŲ TEKSTUOSE.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(cleanJsonString(response.text || ''));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ success: true, examples: parsed, mode: 'ai' });
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key') || err?.status === 'INVALID_ARGUMENT') {
        console.log('Gemini API key is not valid, using pedagogical real-world examples.');
      } else {
        console.log('Gemini real-world examples fallback notice:', errMsg.slice(0, 100));
      }
    }
  }

  const examples = generateRealWorldExamples(subject, topic, grade);
  return res.json({ success: true, examples, mode: 'pedagogical_template' });
});

// 4. Pedagogical assistant chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages = [], lessonContext = '' } = req.body;
  const ai = getGeminiClient();

  if (ai) {
    try {
      const systemInstruction = `Tu esi patyręs Lietuvos mokytojų mentorius, didaktikos ir ugdymo metodininkas.
Atsakyk į mokytojo klausimus aiškiai, šiltai, kolegiškai ir profesionaliai.
Visada siūlyk konkrečius didaktinius metodus, aktyvias užduotis, diferencijavimo idėjas pagal atnaujintas BP.
Pamokos kontekstas: ${lessonContext || 'Bendrasis ugdymas'}.
Griežtai nenaudok dvitaškių tekstuose (vietoj jų naudok taškus arba brūkšnelius).`;

      const contents = messages.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: { systemInstruction },
      });

      return res.json({ success: true, reply: response.text || '' });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key') || err?.status === 'INVALID_ARGUMENT') {
        console.log('Gemini API key is not valid, using pedagogical mentor guidance.');
      } else {
        console.log('Gemini chat fallback notice:', errMsg.slice(0, 100));
      }
    }
  }

  // Fallback pedagogical reply
  const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
  let reply = 'Esu jūsų pedagoginis pagalbininkas! ';
  if (lastUserMsg.includes('metod') || lastUserMsg.includes('aktyv')) {
    reply += 'Šiai pamokai rekomenduoju išbandyti „Ekspertų mozaikos“ (Jigsaw) arba „Mąstyk-Tarkis-Dalykis“ (Think-Pair-Share) metodus. Jie padeda įtraukti visus mokinius ir sukurti saugią bendradarbiavimo atmosferą.';
  } else if (lastUserMsg.includes('vertin') || lastUserMsg.includes('refleksij')) {
    reply += 'Pamokos apibendrinimui labai tinka refleksijos metodas „3-2-1“ (3 dalykai, kuriuos išmokau; 2 klausimai, kurie kilo; 1 idėja praktikai) arba greitas įsivertinimas spalvotomis kortelėmis (Šviesoforas).';
  } else if (lastUserMsg.includes('diferenc')) {
    reply += 'Diferencijuodami užduotis skirstykite į 3 lygius: slenkstiniam lygiui pateikite žingsninę atramą (algoritmą), pagrindiniam – standartines praktines situacijas porose, o aukštesniajam – kūrybinį uždavinį ar bendraklasių mentorystę.';
  } else {
    reply += 'Kuo dar galėčiau padėti tobulinant šios pamokos planą, parenkant metodus ar diferencijuojant užduotis?';
  }

  return res.json({ success: true, reply });
});

// Configure Vite middleware in development or static file serving in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
