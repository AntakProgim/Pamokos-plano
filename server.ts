import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { buildPedagogicalPlan, GenerateTemplateParams } from './src/templatePlanGenerator';
import { generateSmartGoalPedagogical, GenerateSmartGoalParams } from './src/smartGoalService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client with required telemetry User-Agent
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
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
  const params: GenerateTemplateParams = req.body;
  const {
    subject = '',
    grade = '',
    topic = '',
    lessonType = '',
    activities = '',
    goal = '',
    evaluationCriteria = '',
    selectedEvaluations = [],
    selectedResources = [],
    selectedStudentLevels = ['pažengę', 'vidutiniai', 'turintys sunkumų'],
    isIntegratedInput = false,
    integrationDetails = '',
    isOutsideInput = false,
    outsideLocation = '',
    outsideGoal = '',
  } = params;

  if (!grade || !subject || !topic) {
    return res.status(400).json({ error: 'Užpildykite privalomus laukus (dalykas, klasė, tema).' });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const systemInstruction = `
Tu esi aukščiausio lygio Lietuvos bendrojo ugdymo didaktikos ekspertas ir metodininkas.
Tavo tikslas – parengti nepriekaištingą, išsamų, gausų praktinių idėjų ir metodų pamokos planą pagal atnaujintas Lietuvos Bendrąsias programas (BP).
Planas turi būti gilus, konkretus, praktiškas ir jokiu būdu NE sausas! Pateik tikslias užduočių formuluotes, klausimus mokiniams, diferencijavimą trims lygiams ir gausų metodų banką.
GRIEŽTAI NENAUDOK DVITAŠKIŲ TEKSTUOSE (vietoj jų naudok taškus arba brūkšnelius).
El. dienyne (eDiaryEntry) NERAŠYK žodžių "Tema." ar "Namų darbas.", pateik tik turinį.
Atsakymą pateik griežtai JSON formatu pagal nurodytą struktūrą.
      `;

      const prompt = `
Sukurk išsamų, gilų ir idėjomis turtingą pamokos planą pagal šiuos parametrus:
- Mokomasis dalykas. ${subject}
- Klasė. ${grade}
- Pamokos tema. ${topic}
- Pamokos tipas. ${lessonType || 'Standartinė / Mišri'}
- Mokytojo numatytas tikslas. ${goal || 'Parengti pagal Bloom taksonomiją ir SMART principus'}
- Mokytojo numatytos veiklos. ${activities || 'Pasiūlyti interaktyvias, aktyvaus ugdymo veiklas'}
- Vertinimo kriterijai. ${evaluationCriteria || 'Pagal BP pasiekimų lygius'}
- Pasirinkti vertinimo būdai. ${selectedEvaluations.join(', ') || 'Formuojamasis vertinimas, įsivertinimas 3-2-1'}
- Pasirinktos priemonės. ${selectedResources.join(', ') || 'Vadovėlis, interaktyvus ekranas, skaitmeniniai įrankiai'}
- Mokinių pasiekimų lygiai klasėje. ${selectedStudentLevels.join(', ')}
- Integruota pamoka. ${isIntegratedInput ? `Taip. Integruojama su. ${integrationDetails}.` : 'Ne'}
- Pamoka už mokyklos ribų. ${isOutsideInput ? `Taip. Vieta. ${outsideLocation}, Tikslas. ${outsideGoal}.` : 'Ne'}

REIKALAVIMAI TURINIO GAUSUMUI IR METODIKAI:
1. PAMOKOS EIGA (lessonStages) - kiekvienas etapas turi turėti konkrečius žingsnius, mokytojo klausimus ir alternatyvas:
   - introduction: bent 3 intriguojantys sužadinimo būdai (klausimas-provokacija, medijų/vizualinė mįslė, asociacijų debesis).
   - theory: supratimo patikrinimas (Check for Understanding), demonstracija, mąstymo garsiai (Think-aloud) metodas.
   - practice: diferencijuotas darbas stotelėmis arba lygiais, darbas porose (Think-Pair-Share), aiškios užduočių formuluotės.
   - consolidation: greitas patikrinimas (Kahoot/Quizizz mini viktorina), klaidų taisymo iššūkis.
   - summary: refleksijos metodas (3-2-1, išėjimo bilietas, šviesoforas).
2. METODŲ IR KŪRYBINIŲ IDĖJŲ BANKAS (methodologyBank):
   - activeMethods: 4 konkretūs metodai (objektai su "name", "description", "practicalTip").
   - icebreakers: 3 alternatyvūs sužadinimai (objektai su "option", "title", "prompt").
   - realWorldContext: temos ryšys su gyvenimu, profesijomis ir STEAM.
   - digitalAndGamified: 3-4 skaitmeniniai įrankiai (objektai su "tool", "idea").
   - reflectionIdeas: 3 refleksijos formatai (objektai su "method", "description").
3. DIFERENCIJAVIMAS TRIMIS LYGIAIS:
   - Gabūs: kūrybinis iššūkis, nestandartinė problema.
   - Vidutiniai: aiškus algoritmas, kontekstinė praktika porose.
   - Sunkumų turintys: žingsninė atrama (scaffolding), vizualinės užuominos.
4. GRIEŽTAI NENAUDOK DVITAŠKIŲ TEKSTUOSE.
5. El. dienyne (eDiaryEntry) NERAŠYK žodžių "Tema." ir "Namų darbas.", pateik tik gryną turinį.
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
      console.warn('Gemini API call failed, falling back to rich pedagogical template:', aiErr?.message || aiErr);
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
      console.warn('AI ideas failed, fallback to pedagogical ideas:', err?.message || err);
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
      console.warn('AI SMART goal failed, falling back to pedagogical template:', err?.message || err);
    }
  }

  const result = generateSmartGoalPedagogical(params);
  return res.json({ success: true, result, mode: 'pedagogical_template' });
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
      console.warn('AI Chat failed, falling back to pedagogical guidance:', err?.message || err);
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
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
