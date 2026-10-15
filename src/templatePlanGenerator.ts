// Išsamus pedagoginis generatorius su gausiomis galimybėmis ir praktinėmis alternatyvomis
// Pagal Lietuvos Bendrąsias programas (BP)

export interface ActiveMethodItem {
  name: string;
  description: string;
  practicalTip: string;
}

export interface IcebreakerItem {
  option: string;
  title: string;
  prompt: string;
}

export interface DigitalIdeaItem {
  tool: string;
  idea: string;
}

export interface ReflectionIdeaItem {
  method: string;
  description: string;
}

export interface MethodologyBank {
  activeMethods: ActiveMethodItem[];
  icebreakers: IcebreakerItem[];
  realWorldContext: string;
  digitalAndGamified: DigitalIdeaItem[];
  reflectionIdeas: ReflectionIdeaItem[];
  creativePrompts?: string[];
}

export interface GenerateTemplateParams {
  subject: string;
  grade: string;
  topic: string;
  lessonType: string;
  goal?: string;
  activities?: string;
  homeworkPurpose?: string;
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
    homeworkPurpose = 'Įtvirtinti įgūdžius ir žinias',
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
  const hwPurpose = homeworkPurpose.trim() || 'Įtvirtinti įgūdžius ir žinias';

  // 1. Išsamus SMART pamokos uždavinys su kriterijais ir Bloom taksonomija
  const smartGoal = goal && goal.trim().length > 0 
    ? goal.trim()
    : `Išnagrinėję temą „${currentTopic}“, mokiniai gebės:
1. Žinoti ir paaiškinti: taisyklingai įvardinti ir apibrėžti pagrindines sąvokas, dėsningumus bei taisykles (bent 80% tikslumu).
2. Praktiškai taikyti: savarankiškai bei porose išanalizuoti ir išspręsti bent 3 diferencijuotas praktines užduotis, pagrindžiant pasirinktą sprendimo kelią.
3. Analizuoti ir įsivertinti: identifikuoti tipines klaidas, paaiškinti sprendimą bendraklasiui (Peer Review) ir įsivertinti pasiekimus pagal pateiktus sėkmės kriterijus.`;

  // 2. Kompetencijos su konkrečia raiška pagal atnaujintas BP
  const competencies = `• Pažinimo kompetencija: kritinis mąstymas, priežasties ir pasekmės ryšių paieška, informacijos analizė, hipotezių kėlimas ir problemų sprendimas.
• Komunikavimo kompetencija: argumentuotas savo minčių ir sprendimo eigos dėstymas, taisyklingas dalykinių terminų vartojimas, aktyvus klausymasis ir grįžtamasis ryšys poroje.
• Skaitmeninė kompetencija: skaitmeninių mokymosi platformų (Eduka, Quizizz, Wordwall, Canva) tikslingas panaudojimas žinių įtvirtinimui ir rezultatų vizualizavimui.
• Pilietiškumo ir socialinė-emocinė kompetencija: pagarbus bendradarbiavimas komandoje, pagalba sunkiau suprantančiam draugui, asmeninė atsakomybė už bendrą rezultatą.
• Kūrybiškumo kompetencija: originalių pavyzdžių kūrimas, alternatyvių sprendimo kelių paieška.`;

  // 3. Sąsajos su atnaujintomis BP (Lietuvos Bendrosiomis programomis)
  const bpConnections = `Pamoka parengta remiantis atnaujintos ${currentSubject} (${currentGrade}) bendrosios programos pasiekimų sritimis:
- Žinios ir supratimas: temos „${currentTopic}“ esminių sąvokų, dėsningumų, loginių ryšių ir taisyklių įsisavinimas.
- Praktinis pritaikymas: gebėjimas teorines žinias perkelti į naujas, standartines bei problemines situacijas.
- Aukštesnieji mąstymo gebėjimai (Bloom 4–6 lygiai): analizė, lyginimas, vertinimas ir kūrybinis žinių pritaikymas.
- Mokėjimas mokytis: gebėjimas planuoti savo darbą, fiksuoti mokymosi spragas ir įsivertinti pažangą pagal sėkmės kriterijus.`;

  // 4. Vertinimo kriterijai ir galimybės
  const criteriaText = evaluationCriteria && evaluationCriteria.trim().length > 0
    ? evaluationCriteria.trim()
    : `Sėkmės kriterijai mokiniui („Aš gebėsiu“):
✔ Slenkstinis lygis (4–5 balai): Atpažįstu pagrindines sąvokas ir taisykles, atlieku bazinį pavyzdį su pagalba ar atmintine.
✔ Pagrindinis lygis (6–8 balai): Savarankiškai atlieku standartines užduotis temai „${currentTopic}“, paaiškinu atsakymo logiką bendraklasiui.
✔ Aukštesnysis lygis (9–10 balų): Išsprendžiu nestandartinę probleminę situaciją, randu alternatyvų sprendimą, argumentuotai pakonsultuoju kitus.`;

  const evaluationMethods = selectedEvaluations.length > 0 
    ? selectedEvaluations 
    : ["Formuojamasis vertinimas pamokos eigoje", "Tarpusavio vertinimas (Peer Review) porose", "Greitasis įsivertinimas (šviesoforo / mini testuko metodas)"];

  // 5. Išsamūs pamokos eigos etapai su gausiomis alternatyvomis ir konkrečiais veiksmais
  const introduction = `1. Pamokos pradžia ir tikslo suformulavimas (1–2 min.):
   • Kartu su mokiniais perskaitomas ir paaiškinamas pamokos uždavinys bei sėkmės kriterijai („Ką šiandien gebėsiu atlikti?“).
2. Dėmesio sužadinimas / Didaktinė intriga (pasirinktinai mokytojui):
   • A variantas (Gyvenimiškas paradoksas): Probleminis klausimas iš kasdienybės: „Kaip tema „${currentTopic}“ kasdien veikia mus, nors to net nepastebime? Kas nutiktų, jei jos nebūtų?“
   • B variantas („Tiesa ar mitas?“): Mokytojas ekrane pateikia 3 teiginius apie „${currentTopic}“ (du teisingi, vienas mitas). Mokiniai balsuoja pirštais ar kortelėmis.
   • C variantas (Vaizdinė mįslė): Trumpas vizualinis intarpas, nuotrauka ar infografikas, kviečiantis pastebėti dėsningumus.
   • D variantas (Minčių debesis): Greitas mentimeter/lentos klausimas: „Kokius 2 žodžius jums primena ši tema?“
3. Ankstesnių žinių aktyvinimas (2 min.):
   • 3 klausimų blitz-apklausa ryšiui su ankstesne medžiaga užmegzti.`;

  const theory = `1. Naujos medžiagos tyrinėjimas ir konceptualus modeliavimas:
   • Mokytojas pristato esminius temos „${currentTopic}“ principus, schemas ar taisykles lentoje/skaidrėse.
   • Metodas „Mąstymas garsiai“ (Think-Aloud): mokytojas demonstruoja tipinį pavyzdį žingsnis po žingsnio garsiai komentuodamas kiekvieną savo mintį ir sprendimo logiką.
2. Interaktyvus sąvokų įtvirtinimas:
   • Pildomas „Frayer sąvokų modelis“ arba struktūruotas konspektas sąsiuviniuose.
3. Tarpinis supratimo patikrinimas (Check for Understanding):
   • Mokiniai pirštais (1–5 balų skalė) arba signalinėmis kortelėmis parodo savo supratimo lygį prieš pradedant praktinį darbą.
   • Aptariamas dažniausiai pasitaikantis mokinių klaidingas stereotipas šioje temoje.`;

  const practice = activities && activities.trim().length > 0 
    ? `${activities.trim()}

Diferencijuotos praktikos eiga:
• 1 etapas (Bendradarbiavimas): Užduočių sprendimas porose metodu „Pagalvok – Pasitark – Pasidalink“.
• 2 etapas (Savarankiškumas): Individualus darbas pagal pasiekimų lygius (Aukštesnysis, Pagrindinis, Slenkstinis).
• 3 etapas (Konsultavimas): Mokytojas teikia operatyvų mikrogrįžtamąjį ryšį (Micro-feedback), konsultuoja sunkumų patiriančius mokinius.`
    : `Diferencijuotas praktinis žinių taikymas (3 lygiais ir etapais):
1. Treniravimasis su atrama (porose):
   • Mokiniai atlieka 2 bazines užduotis kartu su suolo draugu, naudodamiesi pamokoje pateiktu algoritmu.
2. Savarankiška diferencijuota praktika:
   • Slenkstinis lygis: baziniai pratimai su atraminiais žodžiais ir pavyzdžiu.
   • Pagrindinis lygis: standartinės užduotys, reikalaujančios sprendimo pagrindimo.
   • Pažengusiųjų lygis: probleminis / nestandartinis iššūkis arba „Eksperto / Asistento“ vaidmuo padedant draugui.
3. Mokytojo vaidmuo: periodinis stebėjimas, individualus pastiprinimas, klaidų fiksavimas.`;

  const consolidation = `Žinių įtvirtinimas ir operatyvus patikrinimas:
• A galimybė (Interaktyvus testas): 5 min. mini viktorina (Kahoot / Quizizz / Wordwall) su greita klaidų analize.
• B galimybė („Klaidų medžioklė“): Mokytojas lentoje pateikia užduotį su sąmoningai padarytomis 2 klaidomis – mokiniai porose jas suranda, ištaiso ir paaiškina taisymo taisyklę.
• C galimybė (Tarpusavio vertinimas porose): Mokiniai apsikeičia sąsiuviniais ir pagal sėkmės kriterijus įvertina vienas kito darbą („2 pagyrimai ir 1 pasiūlymas“).`;

  const summary = `Pamokos apibendrinimas, refleksija ir įsivertinimas:
• Refleksijos metodas „3-2-1“:
   - 3 svarbiausi dalykai, kuriuos sužinojau apie „${currentTopic}“;
   - 2 klausimai ar situacijos, kur dar norisi pasitreniruoti;
   - 1 praktinis būdas, kaip šias žinias panaudosiu gyvenime ar kitose pamokose.
• Įsivertinimas: Mokiniai įsivertina savo pažangą pagal pamokos pradžioje iškeltus sėkmės kriterijus (Šviesoforo metodas: žalia / geltona / raudona).
• Namų darbų tikslingumo ir atlikimo gairių aptarimas (Tikslingumas: ${hwPurpose}).`;

  // 6. Veiklos klasėje su gausiomis galimybėmis
  const classActivities = {
    individual: `• Savarankiškas diferencijuotų užduočių atlikimas pasirinktu tempu.
• Asmeninio konspekto, Frayer sąvokų modelio ar schemos pildymas.
• Savikontrolės atlikimas pagal pateiktą etaloninį atsakymų lapą.`,
    pairs: `• Metodas „Pagalvok – Pasitark su porininku – Pasidalink su klase“ (Think-Pair-Share).
• Tarpusavio vertinimas (Peer Review): mokiniai tikrina vienas kito užduotį ir komentuoja pagal sėkmės kriterijus.
• Bendras probleminio uždavinio sprendimas ir argumentų formulavimas.`,
    group: `• Komandinis 3–4 mokinių iššūkis: sukurti mini plakatą, suklasifikuoti pavyzdžius ar išspręsti situacinį uždavinį.
• „Ekspertų mozaika“ (Jigsaw): kiekvienas mokinys tampa atskiros temos dalies žinovu ir paaiškina savo komandai.
• „Idėjų mugė“: grupių atstovai pristato savo išvadas kitoms komandoms.`,
    toolsResources: selectedResources.length > 0 
      ? selectedResources.join(', ') + ' | Vadovėliai, pratybų lapai, interaktyvi lenta, skaitmeniniai įrenginiai.'
      : "Vadovėliai, užduočių lapai, interaktyvus ekranas, mokinių išmanieji įrenginiai (Kahoot / Quizizz / Wordwall / Canva)."
  };

  const individualWork = `1. Bazinio lygio užduotys: 3 esminiai pratimai taisyklei ar algoritmui įtvirtinti (su užuominomis ir atraminiais žodžiais).
2. Pagrindinio lygio užduotys: 4–5 pratimai, reikalaujantys savarankiško sprendimo ir paaiškinimo.
3. Aukštesniojo lygio užduotys: kūrybinis iššūkis – sukurti savo pavyzdį, probleminį klausimą ar situacinį testą bendraklasiams.`;

  // 7. Diferencijavimas trims lygiams su praktiniais patarimais
  const differentiation = {
    gifted: `• Kūrybinės ir tyrimo užduotys (Bloom: Analizė, Vertinimas, Kūrimas): ieškoti sąsajų su kitais mokslais, analizuoti nestandartinius atvejus.
• „Eksperto / Konsultanto“ vaidmuo: pagalba bendraklasiams porose, argumentuotas atsakymų komentavimas.
• Alternatyva: kurti savo uždavinius, taisyklių schemas ar vizualias instrukcijas.`,
    general: `• Pilnas Bendrosios programos reikalavimų pasiekimas: standartinės užduotys su nuosekliai didėjančiu kompleksiškumu.
• Darbas porose aptariant sprendimus ir taisant pastebėtas klaidas.
• Praktiniai pavyzdžiai, siejantys teoriją su mokinio kasdiene aplinka.`,
    struggling: `• Užduočių skaidymas nedideliais žingsniais (Step-by-step metodas).
• Pagalbinės priemonės: atraminių žodžių kortelės, taisyklių atmintinės, išspręstas pavyzdinis algoritmas.
• Mokytojo palaikymas: periodinis priėjimas, padrąsinimas ir nukreipiamieji klausimai (scaffolding).`
  };

  // 7a. Konkrečios diferencijuotos užduotys trims grupėms
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

  // 8. Namų darbai su aiškiu tikslingumu pagal vartotojo pageidavimą
  const isNoHomework = hwPurpose === 'Be namų darbų';
  const homework = {
    purpose: hwPurpose,
    gifted: isNoHomework 
      ? 'Namų darbai neužduodami (mokiniai viską atliko pamokoje).'
      : `Tikslingumas: ${hwPurpose}. Savarankiškai parengti kūrybinį pavyzdį arba 3 probleminius klausimus kitos pamokos viktorinai.`,
    general: isNoHomework
      ? 'Namų darbai neužduodami (mokiniai viską atliko pamokoje).'
      : `Tikslingumas: ${hwPurpose}. Atlikti 2–3 įtvirtinimo pratimus iš temos „${currentTopic}“, pasikartoti esmines sąvokas.`,
    struggling: isNoHomework
      ? 'Namų darbai neužduodami (mokiniai viską atliko pamokoje).'
      : `Tikslingumas: ${hwPurpose}. Užbaigti klasėje pradėtą bazinį pratimą naudojantis pamokoje gauta atmintine ar pavyzdžiu.`
  };

  // 9. Skaitmeniniai resursai su konkrečiomis nuorodomis
  const digitalResources = selectedResources.length > 0
    ? `Parinkti įrankiai: ${selectedResources.join(', ')}.\nPapildomi šaltiniai: eMokykla.lt skaitmeninė saugykla, Eduka klasė, EMA pratybos, vaizdinė medžiaga YouTube, interaktyvūs testai (Wordwall, Quizizz, Kahoot).`
    : `• eMokykla.lt atnaujintų Bendrųjų programų metodinė medžiaga ir skaitmeniniai ištekliai.
• Interaktyvūs įrankiai greitam patikrinimui: Quizizz, Kahoot, Wordwall.
• Bendradarbiavimo ir vizualizavimo priemonės: Canva plakatams, Miro / Padlet lentos.
• Edukaciniai vaizdo įrašai: LRT mediateka, Youtube edukaciniai kanalai.`;

  // 10. El. dienyno įrašas (optimizuota „Mano dienynas“ ir TAMO sistemoms)
  // Reikalavimas: nurodyti pamokos temą, ką mokiniai turėtų gebėti, žinoti ir galėtų taikyti.
  // Namų darbų tikslingumas: pabaigti klasės darbą, pasirengti kitai pamokai, įtvirtinti įgūdžius ar žinias, prisiminti ir pan.
  // Vertinimas: palikti TIK JEI pats mokytojas paprašė (pasirinko vertinimo metodus arba įvedė kriterijus).
  const teacherRequestedEvaluation = (selectedEvaluations && selectedEvaluations.length > 0) || (evaluationCriteria && evaluationCriteria.trim().length > 0);
  
  const diaryEvaluationNote = teacherRequestedEvaluation 
    ? `Vertinimas: ${selectedEvaluations.length > 0 ? selectedEvaluations.join(', ') : 'Formuojamasis vertinimas'}${evaluationCriteria ? `. Kriterijai: ${evaluationCriteria}` : ''}.`
    : '';

  const eDiaryTopicClasswork = `${currentTopic}. Žinoti: esmines sąvokas, dėsningumus ir taisykles. Gebėti: atlikti diferencijuotas praktines užduotis, analizuoti pavyzdžius, pagrįsti atsakymus. Taikyti: spręsti praktines ir kontekstines problemas, įsivertinti pasiekimus.`;

  const eDiaryHomework = isNoHomework
    ? 'Namų darbai neužduoti.'
    : `Tikslingumas: ${hwPurpose}. Užduotis: atlikti nurodytus įtvirtinimo pratimus iš temos „${currentTopic}“ (arba pasirinktą diferencijuotą užduotį).`;

  const eDiaryEntry = {
    topicClassworkExpectations: eDiaryTopicClasswork,
    homework: eDiaryHomework,
    individualHomework: isNoHomework ? '' : `Tikslingumas: ${hwPurpose}. Individualios pagalbinės arba gilinamosios užduotys.`,
    notes: diaryEvaluationNote,
    isIntegrated: !!isIntegratedInput,
    isOutside: !!isOutsideInput,
    eDiaryLessonType: lessonType || 'Dalykinė pamoka'
  };

  // 11. Gausus didaktinis metodų ir kūrybinių idėjų bankas
  const methodologyBank: MethodologyBank = {
    icebreakers: [
      {
        option: "A variantas",
        title: "Gyvenimiškas paradoksas ir provokuojantis klausimas",
        prompt: `„Įsivaizduokite situaciją: jums reikia priimti svarbų sprendimą, susijusį su tema „${currentTopic}“, bet neturite interneto. Kaip mąstytumėte? Ką pastebėtumėte pirmiausia?“`
      },
      {
        option: "B variantas",
        title: "„Tiesa ar mitas?“ / Klaidų provokacija",
        prompt: `Mokytojas lentoje demonstruoja 3 teiginius apie „${currentTopic}“ (du teisingi, vienas klaidingas). Mokiniai balsuoja signalinėmis kortelėmis arba pirštais.`
      },
      {
        option: "C variantas",
        title: "Asociacijų žemėlapis ir minčių lietus (Mentimeter / lenta)",
        prompt: `„Kokius 3 pirmuosius žodžius, daiktus ar praktines situacijas jums primena tema „${currentTopic}“?“ Sukuriamas bendras klasės minčių debesis.`
      },
      {
        option: "D variantas",
        title: "Vaizdinė mįslė / Artefaktas",
        prompt: `Mokytojas parodo nuotrauką ar trumpą vaizdo iškarpą (30 sek.) be garso: „Kaip šis vaizdas tiesiogiai susijęs su šiandienos tema „${currentTopic}“?“`
      }
    ],
    activeMethods: [
      {
        name: "„Pagalvok – Pasitark poroje – Pasidalink“ (Think-Pair-Share)",
        description: `Mokiniai 1 min. individualiai apmąsto temos „${currentTopic}“ klausimą, 2 min. diskutuoja su suolo draugu ir suformuluoja bendrą atsakymą klasei.`,
        practicalTip: "Puikiai tinka įtraukti tylesnius mokinius ir sukurti saugią erdvę pasitikrinti savo mintis prieš kalbant visai klasei."
      },
      {
        name: "„Ekspertų mozaika“ (Jigsaw)",
        description: `Klasė suskirstoma į 4 ekspertų grupes. Kiekviena grupė gilinasi į atskirą temos „${currentTopic}“ dalį ar taisyklę, o vėliau grįžta į savo pradinę komandą ir išmoko kitus.`,
        practicalTip: "Skatina tarpusavio atsakomybę – kiekvienas mokinys tampa atsakingas už savo komandos sėkmę."
      },
      {
        name: "„Frayer sąvokų modelis“",
        description: `Lapelyje pildomi 4 langai apie pagrindinę sąvoką: 1) Apibrėžimas savais žodžiais, 2) Esminės savybės, 3) Pavyzdžiai, 4) Nepavyzdžiai ar dažnos klaidos.`,
        practicalTip: "Apsaugo nuo paviršutiniško taisyklių iškalimo ir ugdo gilų konceptualų mąstymą."
      },
      {
        name: "„Klaidų detektyvas / Klaidų laboratorija“",
        description: `Mokytojas pateikia atliktą užduotį ar tekstą su 3 sąmoningai padarytomis klaidomis. Mokiniai porose randa netikslumus ir pateikia teisingą paaiškinimą.`,
        practicalTip: "Ugdo kritinį vertinimą, analizę (Bloom 4–5 lygiai) ir padeda suprasti tipinius klaidų šaltinius."
      },
      {
        name: "„Sniego gniūžtė“ (Snowballing)",
        description: `Mokinys atsako individualiai (1), tada suderina atsakymą poroje (2), vėliau susijungia dvi poros į grupę (4) ir suformuluoja bendrą išvadą.`,
        practicalTip: "Ugdo kompromiso paiešką ir argumentavimo gebėjimus."
      },
      {
        name: "„Užduočių stotelės ir rotacija“ (Station Rotation)",
        description: `Klasėje įrengiamos 3 stotelės: 1) Teorinis analizės centras, 2) Praktinių pratimų stotelė, 3) Kūrybinis / Skaitmeninis iššūkis. Grupės rotuoja kas 7–8 min.`,
        practicalTip: "Užtikrina judėjimą klasėje, dinamiką ir padeda išlaikyti aukštą mokinių koncentraciją."
      }
    ],
    realWorldContext: `Tema „${currentTopic}“ yra glaudžiai susijusi su praktinėmis gyvenimo situacijomis: analitiniu sprendimų priėmimu, technologijomis, šiuolaikinėmis profesijomis (duomenų analitikai, inžinieriai, tekstų kūrėjai, dizaineriai, tyrėjai) bei kasdiene komunikacija. Mokiniams svarbu parodyti, kur šios žinios padeda išvengti klaidų, sutaupyti laiko ar sukurti vertę realiame pasaulyje.`,
    digitalAndGamified: [
      {
        tool: "Quizizz / Kahoot",
        idea: `5–7 klausimų greitasis žinių mūšis temos „${currentTopic}“ įtvirtinimui su momentine klaidų analize.`
      },
      {
        tool: "Canva / Miro",
        idea: `Skaitmeninis mini plakatas arba schematiškas taisyklių / algoritmų žemėlapis bendradarbiaujant porose.`
      },
      {
        tool: "Padlet lenta",
        idea: `„Klausimų ir atradimų siena“: mokiniai kelia savo praktinius klausimus arba geriausius rastus pavyzdžius.`
      },
      {
        tool: "Wordwall / LearningApps",
        idea: `Interaktyvus kortelių rūšiavimo arba sąvokų ir pavyzdžių sujungimo žaidimas.`
      },
      {
        tool: "Mentimeter",
        idea: `Žodžių debesis pamokos pradžioje arba momentinė apklausa sugrįžimui prie pagrindinės minties.`
      }
    ],
    reflectionIdeas: [
      {
        method: "Metodas „3-2-1“",
        description: "3 svarbiausi dalykai, kuriuos sužinojau šiandien; 2 klausimai, apie kuriuos noriu pasidomėti; 1 idėja, kaip tai pritaikysiu praktiškai."
      },
      {
        method: "„Išėjimo bilietas“ (Exit Ticket)",
        description: "Paskutinėmis 3 pamokos minutėmis kiekvienas mokinys ant lapelio arba programėlėje atsako į vieną esminį probleminį klausimą ir atiduoda mokytojui."
      },
      {
        method: "„Šviesoforas ir viena mintis“",
        description: "Žalia: supratau puikiai, gebu paaiškinti draugui; Geltona: supratau esmę, bet reikia papildomos praktikos; Raudona: kilo neaiškumų, reikia mokytojo konsultacijos."
      },
      {
        method: "„Mokymosi kopėčios“",
        description: "Mokinys įvardija: kur buvau pamokos pradžioje (ant kokio laiptelio), kur esu dabar ir ko trūksta iki kito laiptelio."
      }
    ]
  };

  return {
    generalNotes: `Išsamus pamokos planas su gausiomis pedagoginėmis alternatyvomis (${currentSubject}, ${currentGrade}).`,
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
      general: `Pagrindinės diferencijuotos praktinės užduotys temai „${currentTopic}“ įsisavinti.`,
      highLevel: `Probleminiai ir analitiniai iššūkiai aukštesniajam pasiekimų lygiui.`,
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
    methodologyBank,
    differentiation,
    differentiatedTasks,
    differentiatedAssessment,
    targetLevels: selectedStudentLevels,
    digitalResources,
    homework,
    eDiaryEntry,
    specialAdvice: "Pasiūlykite mokiniams rinktis užduoties atlikimo lygį ar būdą (poroje ar savarankiškai) – tai pastebimai didina motyvaciją ir asmeninę atsakomybę.",
    consultationAdvice: "Mokiniams, kuriems kilo klausimų praktikos metu, organizuoti 3 min. mini konsultaciją prie atskiros lentos.",
    motivation: `„Kiekvienas šiandien žengtas žingsnis temoje „${currentTopic}“ ugdo pasitikėjimą savo gebėjimais!“`,
    stageDurations
  };
}
