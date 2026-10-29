import { BLOOM_LEVELS } from './bloomData.ts';

export interface GenerateSmartGoalParams {
  subject?: string;
  topic?: string;
  grade?: string;
  bloomLevelId?: string;
  focusMethod?: string;
}

export interface SmartGoalResult {
  mainGoal: string;
  bloomLevelName: string;
  bloomVerb: string;
  smartBreakdown: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  };
  differentiatedVariants: {
    struggling: string;
    average: string;
    advanced: string;
  };
  successCriteria: string[];
}

export function generateSmartGoalPedagogical(params: GenerateSmartGoalParams): SmartGoalResult {
  const subject = params.subject?.trim() || 'Bendrasis ugdymas';
  const topic = params.topic?.trim() || 'Pamokos tema';
  const grade = params.grade?.trim() ? `${params.grade} klasė` : 'klasė';
  const focus = params.focusMethod?.trim() ? ` naudojant ${params.focusMethod.toLowerCase()}` : '';

  const level = BLOOM_LEVELS.find(l => l.id === params.bloomLevelId) || BLOOM_LEVELS[2]; // Default to 'applying'
  const verb = level.verbs[0] || 'pritaikyti';

  const mainGoal = `Pamokos metu nagrinėdami temą „${topic}“ (${subject}, ${grade}), mokiniai gebės ${verb} esminius dėsningumus${focus} ir teisingai išspręsti bent 3 praktines užduotis.`;

  return {
    mainGoal,
    bloomLevelName: `${level.name} (${level.levelTier} lygis)`,
    bloomVerb: verb,
    smartBreakdown: {
      specific: `Mokiniai nagrinėja temą „${topic}“ ir atlieka tikslines praktines veiklas.`,
      measurable: `Gebėjimas pademonstruojamas atliekant 3 praktines užduotis arba pateikiant argumentuotą atsakymą.`,
      achievable: `Užduotys pritaikytos ${grade} mokinių pasiekimų lygiui su diferencijuota pagalba.`,
      relevant: `Ugdymo turinys atitinka atnaujintas bendrąsias programas ir suteikia gyvenimiškų įgūdžių.`,
      timeBound: `Iki pamokos pabaigos (45 min.) su refleksija paskutinėmis 5 min.`,
    },
    differentiatedVariants: {
      struggling: `Slenkstinis lygis: Su mokytojo ar atmintinės pagalba atpažinti pagrindines sąvokas iš temos „${topic}“ ir atlikti bazinę praktinę užduotį.`,
      average: `Pagrindinis lygis: Savarankiškai ${verb} temos „${topic}“ taisykles, atlikti standartines užduotis ir paaiškinti sprendimo eigą bendraklasiui.`,
      advanced: `Aukštesnysis lygis: Kūrybiškai pritaikyti temos „${topic}“ žinias nestandartinėje situacijoje, suformuluoti probleminį klausimą ir pagrįsti išvadas.`,
    },
    successCriteria: [
      `Galiu savais žodžiais paaiškinti temos „${topic}“ esmę.`,
      `Gebu savarankiškai atlikti skirtą praktinę užduotį be klaidų.`,
      `Galiu įsivertinti savo pasiekimus pamokos pabaigoje ir paaiškinti, kur tai pravers.`,
    ],
  };
}

export async function generateSmartGoalWithAI(
  params: GenerateSmartGoalParams
): Promise<SmartGoalResult> {
  const response = await fetch('/api/generate-smart-goal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Nepavyko gauti SMART tikslo iš serverio');
  }

  const data = await response.json();
  if (data && data.result) {
    return data.result;
  }
  return generateSmartGoalPedagogical(params);
}
