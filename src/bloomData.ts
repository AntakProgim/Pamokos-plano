export interface BloomLevel {
  id: string;
  name: string;
  levelTier: number;
  verbs: string[];
  description: string;
}

export const BLOOM_LEVELS: BloomLevel[] = [
  {
    id: 'remembering',
    name: 'Prisiminimas / Žinojimas',
    levelTier: 1,
    verbs: ['įvardyti', 'atpažinti', 'apibrėžti', 'išvardyti', 'pakartoti', 'aprašyti'],
    description: 'Faktų, terminų, sąvokų ir dėsnių atgaminimas iš atminties.'
  },
  {
    id: 'understanding',
    name: 'Supratimas',
    levelTier: 2,
    verbs: ['paaiškinti', 'interpretuoti', 'apibendrinti', 'klasifikuoti', 'palyginti', 'perfrazuoti'],
    description: 'Prasmės supratimas, idėjų aiškinimas savais žodžiais.'
  },
  {
    id: 'applying',
    name: 'Taikymas',
    levelTier: 3,
    verbs: ['pritaikyti', 'išspręsti', 'pademonstruoti', 'įgyvendinti', 'atlikti', 'panaudoti'],
    description: 'Žinių ir taisyklių naudojimas naujose ar praktinėse situacijose.'
  },
  {
    id: 'analyzing',
    name: 'Analizė',
    levelTier: 4,
    verbs: ['išanalizuoti', 'išskirti', 'palyginti', 'atskirti', 'nustatyti priežastis', 'tirti'],
    description: 'Informacijos skaidymas į dalis, ryšių ir motyvų tyrinėjimas.'
  },
  {
    id: 'evaluating',
    name: 'Vertinimas',
    levelTier: 5,
    verbs: ['įvertinti', 'pagrįsti', 'argumentuoti', 'kritikuoti', 'padaryti išvadas', 'įsivertinti'],
    description: 'Sprendimų, argumentų ar rezultatų kokybės vertinimas remiantis kriterijais.'
  },
  {
    id: 'creating',
    name: 'Kūrimas',
    levelTier: 6,
    verbs: ['sukurti', 'suprojektuoti', 'sukonstruoti', 'suformuluoti', 'parengti', 'išrasti'],
    description: 'Elementų sujungimas į naują visumą, originalaus produkto ar modelio kūrimas.'
  }
];
