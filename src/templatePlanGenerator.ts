// Išsamus pedagoginis generatorius pagal Lietuvos Bendrąsias programas (BP) ir eMokykla.lt standartus
// Atitinka ŠMSM ir eMokykla.lt metodines rekomendacijas el. dienyno pildymui (aiškumas, tikslingumas, neperkrovimas)

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
  classLearningNotes?: string;
  realWorldNote?: string;
  isIntegratedInput?: boolean;
  integrationDetails?: string;
  isOutsideInput?: boolean;
  outsideLocation?: string;
  outsideGoal?: string;
  stageDurations?: Record<string, number>;
  selectedStudentLevels?: string[];
}

// Dalyko ir temos semantinis profilis
interface TopicDomainProfile {
  isNonAcademic: boolean;
  domainName: string;
  actionContext: string;
  learningObjectives: string;
  knowItem: string;
  ableItem: string;
  applyItem: string;
  realWorldUse: string;
  homeworkSpecificTask: string;
  homeworkConnection: string;
  homeworkGoalStatement: string;
  sampleMethods: string[];
}

// Analizuoja dalyką ir temą pagal eMokykla BP sritis
function analyzeSubjectAndTopic(
  subject: string,
  topic: string,
  activities: string,
  goal: string,
  hwPurpose: string
): TopicDomainProfile {
  const sLow = (subject || '').toLowerCase();
  const tLow = (topic || '').toLowerCase();
  const aLow = (activities || '').toLowerCase();
  const gLow = (goal || '').toLowerCase();
  const combined = `${sLow} ${tLow} ${aLow} ${gLow}`;

  // 1. NEAKADEMINIAI / UGDOMIEJI DALYKAI
  const isClassTutor = sLow.includes('vadov') || sLow.includes('valand') || tLow.includes('vadov') || tLow.includes('valandėl');
  const isEthics = sLow.includes('etik') || sLow.includes('tikyb') || tLow.includes('etik') || tLow.includes('moral');
  const isTheatre = sLow.includes('teatr') || sLow.includes('dram') || tLow.includes('vaidyb') || tLow.includes('etiud');
  const isLifeSkills = sLow.includes('gyvenimo') || sLow.includes('socialin') || sLow.includes('emocin') || sLow.includes('seu') || tLow.includes('savimon');
  const isCareer = sLow.includes('karjer') || sLow.includes('profes') || tLow.includes('karjer');
  const isPE = sLow.includes('fizin') || sLow.includes('kūn') || sLow.includes('sport') || tLow.includes('estafet');
  const isArt = sLow.includes('dail') || sLow.includes('men') || sLow.includes('pieš') || tLow.includes('kompozic');
  const isMusic = sLow.includes('muzik') || tLow.includes('chor') || tLow.includes('ritm');

  if (isClassTutor) {
    return {
      isNonAcademic: true,
      domainName: 'Klasės vadovo veikla',
      actionContext: `Klasės mikroklimato, bendravimo kultūros ir tarpusavio susitarimų stiprinimas tema „${topic}“.`,
      learningObjectives: `Mokiniai ugdysis empatiją, atsakomybę bendruomenėje, gebės atvirai diskutuoti ir reflektuoti asmeninį indėlį į klasės santykius.`,
      knowItem: `bendruomeniškumo principus, saugaus elgesio ir pagarbaus bendravimo susitarimus.`,
      ableItem: `išklausyti bendraklasį be išankstinio vertinimo, argumentuoti savo poziciją, ieškoti kompromisų.`,
      applyItem: `taikyti pozityvaus bendravimo strategijas kasdienėse klasės ir pertraukų situacijose.`,
      realWorldUse: `Šios socialinės-emocinės kompetencijos padeda kurti saugius santykius gyvenime, spręsti konfliktus be streso ir sėkmingai bendradarbiauti bet kuriame kolektyve ar būsimoje profesinėje veikloje.`,
      homeworkSpecificTask: `Užsirašyti 1 asmeninį pastebėjimą apie klasės santykius arba parengti 1 pasiūlymą bendrai klasės veiklai.`,
      homeworkConnection: `Tęsia pamokoje nagrinėtą klasės mikroklimato ir bendradarbiavimo temą.`,
      homeworkGoalStatement: `Tikslas – apmąstyti asmeninę atsakomybę ir pasirengti kitos klasės valandėlės diskusijai.`,
      sampleMethods: ['Diskusija ratu (Circle practice)', 'Atvejo analizė', 'Komandos formavimo žaidimas']
    };
  }

  if (isEthics) {
    return {
      isNonAcademic: true,
      domainName: 'Etika',
      actionContext: `Vertybinių pasirinkimų ir moralinių dilemų tyrinėjimas nagrinėjant temą „${topic}“.`,
      learningObjectives: `Mokiniai mokysis atpažinti etines dilemas, vertinti elgesio motyvus bei pasekmes, ugdysis toleranciją ir kritinį mąstymą.`,
      knowItem: `esmines etines sąvokas, sąžiningumo, teisingumo ir atsakomybės reikšmę.`,
      ableItem: `analizuoti moralines situacijas, skirti faktus nuo vertinimų, pagarbiai išklausyti kitokią nuomonę.`,
      applyItem: `pagrįstai priimti etiškus sprendimus kasdieniuose santykiuose ir skaitmeninėje erdvėje.`,
      realWorldUse: `Etinis raštingumas padeda orientuotis sudėtingose gyvenimo situacijose, atsispirti manipuliacijoms ir kurti pasitikėjimu grįstus santykius.`,
      homeworkSpecificTask: `Pagalvoti apie vieną gyvenimišką situaciją, kurioje kilo etinė dilema, ir suformuluoti 2 argumentus už skirtingus sprendimus.`,
      homeworkConnection: `Padeda susieti teorines etikos sąvokas su asmenine mokinio patirtimi.`,
      homeworkGoalStatement: `Tikslas – kūrybiškai apmąstyti moralinius pasirinkimus ir pasirengti argumentuotai diskusijai.`,
      sampleMethods: ['Dilemų svarstymas (Kohlberg modelis)', 'Vertybių aukcionas', 'Debatai porose']
    };
  }

  if (isTheatre) {
    return {
      isNonAcademic: true,
      domainName: 'Teatras',
      actionContext: `Sceninės raiškos, judesio ir vaidybinių improvizacijų atlikimas tema „${topic}“.`,
      learningObjectives: `Mokiniai ugdysis kūrybiškumą, pasitikėjimą savimi, sceninio buvimo jausmą ir bendradarbiavimo scenoje įgūdžius.`,
      knowItem: `sceninės erdvės, tempo-ritmo, neverbalinės raiškos ir sceninio dėmesio dėsningumus.`,
      ableItem: `kurti trumpą etiudą ar personažą, valdyti kūno kalbą, balso intonaciją ir reaguoti į partnerį.`,
      applyItem: `laisvai ir drąsiai reikšti mintis prieš auditoriją, improvizuoti netikėtose situacijose.`,
      realWorldUse: `Teatrinė patirtis šalina viešojo kalbėjimo baimę, moko valdyti emocijas, kūno kalbą ir suteikia pasitikėjimo savimi pristatymuose bei bendravime.`,
      homeworkSpecificTask: `Stebėti ir trumpai užfiksuoti vieno pasirinkto žmogaus ar personažo 2 būdingus judesius ar kalbos ypatumus.`,
      homeworkConnection: `Ugdo pastabumą aplinkai ir padeda kurti autentiškus personažus.`,
      homeworkGoalStatement: `Tikslas – lavinti pastabumą ir pasirengti praktiniam etiudui kitos pamokos metu.`,
      sampleMethods: ['Improvizacija', 'Gyvieji paveikslai (Tableau)', 'Neverbalinės komunikacijos pratimai']
    };
  }

  if (isLifeSkills) {
    return {
      isNonAcademic: true,
      domainName: 'Gyvenimo įgūdžiai',
      actionContext: `Praktinių kasdienio gyvenimo, saugumo ir emocinės sveikatos įgūdžių stiprinimas tema „${topic}“.`,
      learningObjectives: `Mokiniai įgis praktinių žinių, kaip saugoti sveikatą, valdyti stresą ir priimti apgalvotus sprendimus.`,
      knowItem: `sveikos gyvensenos, emocijų atpažinimo ir saugaus elgesio taisykles.`,
      ableItem: `atpažinti streso ar pavojaus požymius, taikyti savireguliacijos ir pagalbos sau technikas.`,
      applyItem: `priimti saugius sprendimus realiose kasdienėse situacijose ir internete.`,
      realWorldUse: `Gyvenimo įgūdžiai yra tiesioginė investicija į asmeninį saugumą, emocinį atsparumą, sveikatą ir sėkmingą kasdienybę.`,
      homeworkSpecificTask: `Išbandyti 1 streso valdymo ar laiko planavimo techniką ir užfiksuoti jos poveikį.`,
      homeworkConnection: `Padeda pamokos teorines žinias paversti kasdieniu asmeniniu įpročiu.`,
      homeworkGoalStatement: `Tikslas – praktiškai išbandyti savireguliacijos metodą ir įsivertinti jo naudą.`,
      sampleMethods: ['Simuliacija', 'Praktinė situacijų analizė', 'Refleksijos dienoraštis']
    };
  }

  // 2. SKAITMENINIS TURINYS / IT / GOOGLE SHEETS / SKAIČIUOKLĖS
  const isSpreadsheets = combined.includes('sheet') || combined.includes('excel') || combined.includes('skaičiuokl') || combined.includes('lentel') || combined.includes('formul');
  const isIT = sLow.includes('informac') || sLow.includes('it') || sLow.includes('skaitmen') || isSpreadsheets;

  if (isSpreadsheets) {
    return {
      isNonAcademic: false,
      domainName: subject || 'Informacinės technologijos',
      actionContext: `Skaitmeninis ugdymo turinys. Duomenų organizavimas, skaičiavimo formulių ir funkcijų taikymas Google Sheets aplinkoje nagrinėjant temą „${topic}“.`,
      learningObjectives: `Mokiniai mokysis struktūruoti duomenis skaičiuoklėje, naudoti automatines matematines formules ir vizualizuoti rezultatus diagramomis.`,
      knowItem: `skaičiuoklės langelių adresavimą, duomenų tipus (tekstas, skaičius, data), pagrindines funkcijas (SUM, AVERAGE, MIN, MAX).`,
      ableItem: `savarankiškai kurti ir formatuoti lenteles, įrašyti teisingas skaičiavimo formules, filtruoti ir rūšiuoti duomenis.`,
      applyItem: `panaudoti skaičiuoklę praktiniam skaičiavimui (biudžetui, asmeniniam tvarkaraščiui ar eksperimento duomenų analizei).`,
      realWorldUse: `Skaičiuoklių (Google Sheets / Excel) valdymas yra viena labiausiai vertinamų kompetencijų šiuolaikinėje darbo rinkoje, nepakeičiama asmeninių finansų planavimui, verslo analitikai, inžinerijai ir organizaciniams darbams.`,
      homeworkSpecificTask: `Papildyti klasėje pradėtą Google Sheets lentelę 2 naujomis formulėmis arba atlikti trumpą skaičiavimo užduotį (apie 15 min.).`,
      homeworkConnection: `Tiesiogiai įtvirtina klasėje išmoktą formulių sintaksę ir duomenų formatavimo įgūdžius.`,
      homeworkGoalStatement: `Tikslas – įtvirtinti skaičiuoklės formulių naudojimo įgūdžius ir pabaigti pradėtą skaitmeninę lentelę.`,
      sampleMethods: ['Interaktyvus demonstravimas ekrane', 'Praktinis darbas kompiuteriu', 'Užduotys porose']
    };
  }

  if (isIT) {
    return {
      isNonAcademic: false,
      domainName: subject || 'Informacinės technologijos',
      actionContext: `Skaitmeninių įrankių, algoritmų ir technologinių sprendimų tyrinėjimas tema „${topic}“.`,
      learningObjectives: `Mokiniai mokysis taikyti skaitmeninius įrankius užduotims atlikti, suprasti algoritmų logiką ir saugaus darbo internete principus.`,
      knowItem: `pagrindines skaitmeninio įrankio funkcijas, sąsajos elementus ir saugaus duomenų tvarkymo taisykles.`,
      ableItem: `kurti skaitmeninį produktą, šalinti atsiradusias technologines klaidas, paaiškinti atliktus žingsnius.`,
      applyItem: `pritaikyti skaitmeninius įgūdžius kitų pamokų projektams ir asmeniniams kūrybiniams sumanymams.`,
      realWorldUse: `Skaitmeninis raštingumas ir loginis technologinis mąstymas atveria duris į šiuolaikines technologijų industrijas ir užtikrina saugų, efektyvų skaitmeninių įrankių valdymą kasdienybėje.`,
      homeworkSpecificTask: `Pabaigti pradėtą skaitmeninį eskizą / kodą arba peržiūrėti 3 min. mokomąją instrukciją kitos pamokos temai.`,
      homeworkConnection: `Sujungia pamokoje pradėtą skaitmeninį projektą su pasirengimu kitam etapui.`,
      homeworkGoalStatement: `Tikslas – pabaigti klasės praktinį darbą ir pasirengti kitai pamokai (iki 15–20 min.).`,
      sampleMethods: ['Gyvas programavimo/kūrimo demonstravimas', 'Klaidų paieškos iššūkis', 'Projektinė veikla']
    };
  }

  // 3. UŽSIENIO KALBOS (Anglų k., Vokiečių k., Prancūzų k.)
  const isForeignLang = sLow.includes('angl') || sLow.includes('užsienio') || sLow.includes('vokieč') || sLow.includes('prancūz') || combined.includes('restaurant') || combined.includes('english');
  if (isForeignLang) {
    const isRestaurant = combined.includes('restaurant') || combined.includes('maist') || combined.includes('food');
    return {
      isNonAcademic: false,
      domainName: subject || 'Užsienio kalba (anglų)',
      actionContext: isRestaurant 
        ? `Užsienio kalba: Mokymasis užsisakyti maistą restorane, naudojant specifinį žodyną, mandagumo frazes ir dialogų modelius temoje „${topic}“.`
        : `Užsienio kalba: Komunikacinių gebėjimų ir specifinio žodyno lavinimas nagrinėjant temą „${topic}“.`,
      learningObjectives: `Mokiniai mokysis vartoti naują teminį žodyną, sudaryti taisyklingus sakinius ir laisvai susikalbėti realiose kasdienėse situacijose.`,
      knowItem: `teminius žodžius ir frazes, taisyklingą tarimą, mandagaus bendravimo kalbines konstrukcijas.`,
      ableItem: `suprasti girdimą tekstą, palaikyti dialogą poroje, taisyklingai užduoti klausimus ir atsakyti į juos.`,
      applyItem: `savarankiškai sukurti ir suvaidinti realistinį dialogą ar parašyti trumpą žinutę/laišką.`,
      realWorldUse: `Užsienio kalbos mokėjimas yra tiesioginis raktas į laisvą keliavimą, tarptautinę komunikaciją, filmų/literatūros supratimą originalo kalba ir pasaulines studijų bei karjeros galimybes.`,
      homeworkSpecificTask: isRestaurant
        ? `Sukurti trumpą 4–6 replikų dialogą restorane (klientas ir padavėjas) panaudojant bent 3 naujas pamokos frazes.`
        : `Atlikti 1 trumpą komunikacinį pratimą arba parengti 3 klausimus porininkui kitai pamokai (iki 15 min.).`,
      homeworkConnection: `Įtvirtina pamokoje išmoktas kalbines konstrukcijas ir ruošia laisvam kalbėjimui.`,
      homeworkGoalStatement: `Tikslas – įtvirtinti naują žodyną ir praktiškai panaudoti mandagumo frazes dialoge.`,
      sampleMethods: ['Vaidmenų žaidimas (Role-play)', 'Greitieji dialogai (Speed-dating kalbėjimui)', 'Klausymo užduotys']
    };
  }

  // 4. LIETUVIŲ KALBA IR LITERATŪRA
  const isLithuanian = sLow.includes('lietuvi') || combined.includes('kalba') || combined.includes('rašyba') || combined.includes('skyryba') || combined.includes('veiksmažod') || combined.includes('tekst');
  if (isLithuanian) {
    const isDirectSpeech = combined.includes('tiesiogin') || combined.includes('netiesiogin');
    return {
      isNonAcademic: false,
      domainName: subject || 'Lietuvių kalba ir literatūra',
      actionContext: isDirectSpeech
        ? `Tiesioginės ir netiesioginės kalbos skyrybos taisyklių taikymas, dialogų konstravimas ir teksto raiškos analizė tema „${topic}“.`
        : `Gimtosios kalbos dėsningumų, taisyklingos raiškos ir teksto analizės įgūdžių tobulinimas tema „${topic}“.`,
      learningObjectives: `Mokiniai mokysis taisyklingai vartoti kalbos taisykles, analizuoti autoriaus mintį ir kurti aiškius, rišlius sakinius.`,
      knowItem: isDirectSpeech ? `tiesioginės kalbos ir autoriaus žodžių skyrybos schemas bei transformavimo į netiesioginę kalbą principus.` : `nagrinėjamos temos taisykles, sąvokas ir teksto sandaros reikalavimus.`,
      ableItem: `atpažinti kalbos reiškinius tekste, taisyklingai dėti skyrybos ženklus, redaguoti ir taisyti sakinius.`,
      applyItem: `pritaikyti taisykles savo kuriamuose tekstuose, viešajame kalbėjime ir argumentuotame samprotavime.`,
      realWorldUse: `Sklandi, taisyklinga ir įtaigi lietuvių kalba užtikrina akademinę sėkmę, profesionalų įvaizdį, padeda įtikinti auditoriją ir sklandžiai formuluoti mintis raštu bei žodžiu.`,
      homeworkSpecificTask: isDirectSpeech
        ? `Perrašyti 3 tiesioginės kalbos sakinius į netiesioginę kalbą arba sukurti trumpą 4 eilučių dialogą su taisyklinga skyryba.`
        : `Atlikti 1 tikslinį kalbos įtvirtinimo pratimą iš vadovėlio / skaitmeninės aplinkos (iki 15 min.).`,
      homeworkConnection: `Tęsia klasėje pradėtą taisyklių taikymo praktiką ir padeda pasitikrinti supratimą.`,
      homeworkGoalStatement: `Tikslas – įtvirtinti taisyklių taikymą ir lavinti kalbinę raišką (optimali trukmė 15 min.).`,
      sampleMethods: ['Teksto redagavimo dirbtuvės', 'Klaidų medžioklė', 'Kūrybinis mini rašinys']
    };
  }

  // 5. MATEMATIKA
  const isMath = sLow.includes('matemat') || combined.includes('lygt') || combined.includes('geometr') || combined.includes('trupmen') || combined.includes('skaič');
  if (isMath) {
    return {
      isNonAcademic: false,
      domainName: subject || 'Matematika',
      actionContext: `Matematinių dėsningumų, skaičiavimo algoritmų ir problemų sprendimo strategijų taikymas tema „${topic}“.`,
      learningObjectives: `Mokiniai mokysis taikyti matematinį algoritmą, logiškai pagrįsti sprendimo eigą ir tikrinti gautus rezultatus.`,
      knowItem: `matematines formules, dėsnius, apibrėžimus ir skaičiavimo žingsnius.`,
      ableItem: `atlikti matematines operacijas, pasirinkti racionalų sprendimo būdą, grafiškai ar skaitiškai pavaizduoti ryšius.`,
      applyItem: `išspręsti praktinį kontekstinį uždavinį, siejantį matematiką su kasdienėmis situacijomis.`,
      realWorldUse: `Matematinis mąstymas lavina loginį samprotavimą, kritinį duomenų vertinimą, finansinį raštingumą ir padeda priimti optimalius sprendimus kasdienybėje bei technologijose.`,
      homeworkSpecificTask: `Išspręsti 2–3 pasirinkto lygio uždavinius iš temos „${topic}“ (optimali trukmė iki 15–20 min.).`,
      homeworkConnection: `Įtvirtina klasėje nagrinėtą algoritmą ir parodo savarankiško taikymo gebėjimus.`,
      homeworkGoalStatement: `Tikslas – įtvirtinti skaičiavimo algoritmą ir pasitikrinti atsakymus savikontrolės būdu.`,
      sampleMethods: ['Probleminis uždavinys iš gyvenimo', 'Darbas porose Think-Pair-Share', 'Etaloninių sprendimų analizė']
    };
  }

  // 6. GAMTOS MOKSLAI (Biologija, Chemija, Fizika)
  const isScience = sLow.includes('biolog') || sLow.includes('fizik') || sLow.includes('chemij') || sLow.includes('gamt');
  if (isScience) {
    return {
      isNonAcademic: false,
      domainName: subject || 'Gamtos mokslai',
      actionContext: `Gamtos reiškinių tyrinėjimas, priežastinių ryšių ir mokslinio metodo taikymas tema „${topic}“.`,
      learningObjectives: `Mokiniai mokysis paaiškinti gamtos procesus, kelti hipotezes, analizuoti stebėjimų duomenis ir daryti pagrįstas išvadas.`,
      knowItem: `gamtos mokslo dėsnius, sąvokas, procesų etapus ir saugaus eksperimentavimo taisykles.`,
      ableItem: `aprašyti reiškinio eigą, interpretuoti grafikus bei lenteles, paaiškinti priežasties ir pasekmės ryšį.`,
      applyItem: `susieti mokslo dėsningumus su ekologinėmis problemomis, technologijomis ir žmogaus sveikata.`,
      realWorldUse: `Gamtamokslinis supratimas padeda tausoti sveikatą ir aplinką, suprasti gamtos reiškinius bei technologijų veikimo principus.`,
      homeworkSpecificTask: `Atsakyti į 2 probleminius klausimus arba atlikti mini stebėjimą namų aplinkoje (iki 15 min.).`,
      homeworkConnection: `Sustiprina ryšį tarp klasės laboratorinio/teorinio darbo ir realių reiškinių.`,
      homeworkGoalStatement: `Tikslas – įtvirtinti gamtamokslines sąvokas ir paaiškinti reiškinio priežastis.`,
      sampleMethods: ['Mokslinis stebėjimas', 'Virtualus eksperimentas', 'Priežasčių-pasekmių žemėlapis']
    };
  }

  // 7. SOCIALINIAI MOKSLAI (Istorija, Geografija, Pilietiškumas)
  const isSocial = sLow.includes('istorij') || sLow.includes('geograf') || sLow.includes('piliet');
  if (isSocial) {
    return {
      isNonAcademic: false,
      domainName: subject || 'Socialiniai mokslai',
      actionContext: `Istorinių šaltinių analizė, geografinės erdvės tyrinėjimas ir pilietinio sąmoningumo ugdymas tema „${topic}“.`,
      learningObjectives: `Mokiniai mokysis analizuoti šaltinius, lyginti procesus laike ir erdvėje, vertinti įvykių priežastis bei pasekmes.`,
      knowItem: `pagrindinius faktus, datas, sąvokas, asmenybes ar geografinius dėsningumus.`,
      ableItem: `skaityti žemėlapį ar istorinį šaltinį, palyginti skirtingus požiūrius, argumentuotai diskutuoti.`,
      applyItem: `susieti praeities pamokas su šių dienų visuomenės ir valstybės iššūkiais.`,
      realWorldUse: `Istorinis ir geografinis raštingumas ugdo pilietinę brandą, padeda suprasti pasaulio įvykių kontekstą ir atpažinti dezinformaciją.`,
      homeworkSpecificTask: `Išanalizuoti 1 trumpą šaltinio ištrauką arba žemėlapio fragmentą ir suformuluoti 1 išvadą (iki 15 min.).`,
      homeworkConnection: `Gilina šaltinių analizės įgūdžius ir ruošia kitos pamokos diskusijai.`,
      homeworkGoalStatement: `Tikslas – lavinti šaltinių analizės įgūdžius ir pasirengti bendrai diskusijai.`,
      sampleMethods: ['Šaltinių kritika', 'Debatai', 'Istorinė/geografinė rekonstrukcija']
    };
  }

  // 8. UNIVERSALUS DINAMINIS PROFILIS BET KOKIAM KITAM DALYKUI
  return {
    isNonAcademic: false,
    domainName: subject || 'Bendrasis ugdymas',
    actionContext: `Dalykinių žinių ir praktinių įgūdžių gilinimas nagrinėjant temą „${topic}“.`,
    learningObjectives: `Mokiniai mokysis suprasti temos „${topic}“ esmę, atlikti diferencijuotas praktines veiklas ir argumentuoti savo sprendimus.`,
    knowItem: `temos „${topic}“ pagrindinius terminus, principus ir taisykles.`,
    ableItem: `atlikti praktines užduotis, paaiškinti sprendimo logiką poroje, įsivertinti savo atsakymus.`,
    applyItem: `pritaikyti įgytas žinias naujose praktinėse situacijose ar kūrybiniame darbe.`,
    realWorldUse: `Šios temos žinios ugdo analitinį mąstymą, padeda spręsti kasdienes praktines problemas ir atveria naujas galimybes tolimesniam mokymuisi.`,
    homeworkSpecificTask: `Atlikti 1 tikslinę diferencijuotą užduotį arba apmąstyti 1 praktinį temos pavyzdį (rekomenduojama iki 15 min.).`,
    homeworkConnection: `Tiesiogiai siejasi su pamokoje nagrinėta tema „${topic}“ ir padeda pasitikrinti asmeninę pažangą.`,
    homeworkGoalStatement: `Tikslas – ${hwPurpose.toLowerCase()} atliekant tikslinę užduotį be mokinių perkrovimo.`,
    sampleMethods: ['Mąstyk-Tarkis-Dalykis', 'Klaidų paieška', 'Praktinė simuliacija']
  };
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
    classLearningNotes,
    realWorldNote,
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

  // Išanalizuojame dalyką ir temą pagal eMokyklos standartus
  const profile = analyzeSubjectAndTopic(currentSubject, currentTopic, activities || '', goal || '', hwPurpose);

  // 1. SMART pamokos uždavinys pagal BP
  const smartGoal = goal && goal.trim().length > 0 
    ? goal.trim()
    : `Išnagrinėję temą „${currentTopic}“, mokiniai gebės:
1. Žinoti ir paaiškinti: taisyklingai įvardyti ${profile.knowItem} (bent 80% tikslumu).
2. Praktiškai taikyti: savarankiškai bei porose ${profile.ableItem}, pagrindžiant sprendimo eigą.
3. Gilintis ir kurti: ${profile.applyItem}, įsivertinti pasiekimus pagal pateiktus sėkmės kriterijus.`;

  // 2. Kompetencijos pagal atnaujintas BP
  const competencies = `• Pažinimo kompetencija: kritinis mąstymas nagrinėjant temą „${currentTopic}“, priežasčių ir pasekmių ryšių paieška bei informacijos analizė.
• Komunikavimo kompetencija: taisyklingas dalykinių terminų vartojimas, gebėjimas aiškiai išreikšti idėjas, aktyvus klausymasis ir konstruktyvus grįžtamasis ryšys poroje.
• Skaitmeninė kompetencija: skaitmeninių mokymosi platformų ir įrankių tikslingas panaudojimas žinių įtvirtinimui.
• Pilietiškumo ir socialinė-emocinė kompetencija: pagarbus bendradarbiavimas, tarpusavio pagalba ir asmeninė atsakomybė už klasės darbą.
• Kūrybiškumo kompetencija: alternatyvių sprendimų paieška ir originalių praktinių pavyzdžių kūrimas.`;

  // 3. Sąsajos su BP
  const bpConnections = `Pamoka parengta remiantis atnaujintos ${currentSubject} (${currentGrade}) bendrosios programos pasiekimų sritimis:
- Žinios ir supratimas: ${profile.knowItem}
- Praktinis pritaikymas: ${profile.ableItem}
- Aukštesnieji gebėjimai: ${profile.applyItem}
- Mokėjimas mokytis: gebėjimas planuoti savo darbą, fiksuoti spragas ir įsivertinti pažangą.`;

  // 4. Vertinimo kriterijai
  const criteriaText = evaluationCriteria && evaluationCriteria.trim().length > 0
    ? evaluationCriteria.trim()
    : `Sėkmės kriterijai mokiniui („Aš gebėsiu“):
✔ Slenkstinis lygis (4–5 balai): Atpažįstu pagrindines sąvokas, atlieku bazinę užduotį su pagalba ar atmintine.
✔ Pagrindinis lygis (6–8 balai): Savarankiškai atlieku standartines užduotis temai „${currentTopic}“, paaiškinu atsakymo logiką.
✔ Aukštesnysis lygis (9–10 balų): Išsprendžiu nestandartinę probleminę situaciją, argumentuotai pakonsultuoju kitus.`;

  const evaluationMethods = selectedEvaluations.length > 0 
    ? selectedEvaluations 
    : ["Formuojamasis vertinimas pamokos eigoje", "Tarpusavio vertinimas (Peer Review) porose", "Greitasis įsivertinimas"];

  // 5. Pamokos etapai
  const introduction = `1. Pamokos pradžia ir tikslo suformulavimas (1–2 min.):
   • Kartu su mokiniais perskaitomas ir paaiškinamas pamokos uždavinys bei sėkmės kriterijai („Ko šiandien išmoksime ir ką gebėsime?“).
2. Dėmesio sužadinimas / Didaktinė intriga:
   • Gyvenimiškas pavyzdys / provokuojantis klausimas: „Kaip tema „${currentTopic}“ kasdien veikia mus ir kur ją pritaikome realiame pasaulyje?“
   • Mokytojas pateikia trumpą situaciją arba vaizdinę mįslę, kviečiančią mąstyti.
3. Ankstesnių žinių aktyvinimas (2 min.):
   • 2–3 klausimų blitz-apklausa ryšiui su ankstesne medžiaga užmegzti.`;

  const theory = `1. Temos tyrinėjimas ir konceptualus aiškinimas:
   • Mokytojas pristato esminius temos „${currentTopic}“ principus: ${profile.knowItem}.
   • Metodas „Mąstymas garsiai“ (Think-Aloud): demonstruojamas tipinis pavyzdys žingsnis po žingsnio komentuojant sprendimo logiką.
2. Tarpinis supratimo patikrinimas (Check for Understanding):
   • Mokiniai signalinėmis kortelėmis ar pirštais parodo supratimo lygį prieš pradedant savarankišką praktinį darbą.`;

  const practice = activities && activities.trim().length > 0 
    ? `${activities.trim()}

Diferencijuotos praktikos eiga:
• 1 etapas: Praktinis darbas porose (Think-Pair-Share) nagrinėjant pavyzdžius.
• 2 etapas: Savarankiškas diferencijuotas darbas pagal lygius (Aukštesnysis, Pagrindinis, Slenkstinis).
• 3 etapas: Tikslinė mokytojo pagalba ir operatyvus grįžtamasis ryšys.`
    : `Diferencijuotas praktinis žinių taikymas (3 lygiais ir etapais):
1. Užduotys porose:
   • Mokiniai atlieka bazinę užduotį kartu su suolo draugu, pasitardami dėl sprendimo logikos.
2. Savarankiška praktika:
   • Slenkstinis lygis: baziniai pratimai su atraminiais žodžiais ar pavyzdžiu.
   • Pagrindinis lygis: standartinės užduotys, reikalaujančios sprendimo pagrindimo.
   • Pažengusiųjų lygis: probleminis iššūkis ar asistento vaidmuo padedant draugui.
3. Mokytojo konsultavimas: individualus pastiprinimas ir klaidų taisymas realiu laiku.`;

  const consolidation = `Žinių įtvirtinimas ir operatyvus patikrinimas:
• Interaktyvi mini viktorina (Kahoot / Quizizz / Wordwall) arba „Klaidų medžioklė“ porose.
• Tarpusavio vertinimas porose: mokiniai apsikeičia darbais ir pagal sėkmės kriterijus pasako vienas kitam 1 pagyrimą ir 1 patarimą.`;

  const summary = `Pamokos apibendrinimas, refleksija ir įsivertinimas:
• Refleksijos metodas „3-2-1“:
   - 3 svarbiausi dalykai, kuriuos sužinojau apie „${currentTopic}“;
   - 2 klausimai ar situacijos, kur dar noriu pasitreniruoti;
   - 1 būdas, kaip tai pritaikysiu praktiškai.
• Įsivertinimas: Mokiniai įsivertina pažangą pagal pamokos pradžioje iškeltus sėkmės kriterijus.
• Namų darbų tikslingumo ir atlikimo gairių aptarimas (Tikslingumas: ${hwPurpose}).`;

  // 6. Veiklos klasėje
  const classActivities = {
    individual: `• Savarankiškas užduočių atlikimas pasirinktu tempu.
• Asmeninio konspekto, schemos ar sąvokų žemėlapio pildymas.
• Savikontrolė pagal pateiktą etaloninį atsakymų lapą.`,
    pairs: `• Metodas „Pagalvok – Pasitark poroje – Pasidalink su klase“ (Think-Pair-Share).
• Tarpusavio vertinimas (Peer Review) pagal sėkmės kriterijus.
• Bendras probleminio klausimo sprendimas.`,
    group: `• Komandinis iššūkis: sukurti mini plakatą, išspręsti situacinį uždavinį ar suklasifikuoti pavyzdžius.
• „Ekspertų mozaika“ (Jigsaw): atskiros temos dalies analizė ir paaiškinimas kitiems.`,
    toolsResources: selectedResources.length > 0 
      ? selectedResources.join(', ') + ' | Vadovėliai, užduočių lapai, interaktyvus ekranas, skaitmeniniai įrenginiai.'
      : "Vadovėliai, užduočių lapai, interaktyvus ekranas, mokinių išmanieji įrenginiai."
  };

  const individualWork = `1. Bazinio lygio užduotys: 2–3 pratimai taisyklei ar algoritmui įtvirtinti (su atraminiais žodžiais).
2. Pagrindinio lygio užduotys: 3–4 pratimai, reikalaujantys savarankiško sprendimo ir paaiškinimo.
3. Aukštesniojo lygio užduotys: kūrybinis iššūkis – sukurti savo pavyzdį ar probleminį klausimą bendraklasiams.`;

  // 7. Diferencijavimas trims lygiams
  const differentiation = {
    gifted: `• Kūrybinės ir tyrimo užduotys (Bloom: Analizė, Kūrimas): ieškoti sąsajų su kitais mokslais, analizuoti nestandartinius atvejus.
• „Eksperto / Asistento“ vaidmuo: pagalba bendraklasiams porose, argumentuotas atsakymų komentavimas.`,
    general: `• Pilnas Bendrosios programos reikalavimų pasiekimas: nuoseklaus sunkumo užduotys.
• Darbas porose aptariant sprendimus ir taisant pastebėtas klaidas.`,
    struggling: `• Užduočių skaidymas nedideliais žingsniais (Step-by-step metodas).
• Pagalbinės priemonės: taisyklių atmintinės, atraminės kortelės, pavyzdinis algoritmas.`
  };

  const differentiatedTasks = {
    advanced: `• Gilinamasis iššūkis: Išanalizuoti nestandartinę probleminę temos „${currentTopic}“ situaciją, rasti priežastinius ryšius.
• Kūrybinė veikla: Parengti originalų praktinį pavyzdį ar testą bendraklasiams.
• Bendraklasių mentorystė: Atlikti „Eksperto“ funkciją teikiant konstruktyvų grįžtamąjį ryšį (Peer Review).`,
    average: `• Standartinis pritaikymas: Atlikti pagrindinio lygio pratimus temai „${currentTopic}“ įtvirtinti pagal nagrinėtą algoritmą.
• Darbas poroje: Išnagrinėti situaciją kartu su suolo draugu metodu „Pagalvok – Pasitark – Pasidalink“.
• Savikontrolė: Pasitikrinti atsakymus ir savarankiškai ištaisyti klaidas.`,
    struggling: `• Bazinė struktūruota užduotis: Atlikti 2 bazines užduotis, suskaidytas į mažus žingsnelius su dalinai užpildytu pavyzdžiu.
• Atraminės priemonės: Naudotis sąvokų kortele, atraminiais žodžiais ir schema.
• Mokytojo palaikymas: Užduotį atlikti su periodiniu paskatinimu ir nukreipiamaisiais klausimais.`
  };

  const differentiatedAssessment = {
    advanced: `• Kriterinis vertinimas pagal aukštesniojo lygio pasiekimų deskriptorius (argumentacija, savarankiškumas, kūrybiškumas).
• Įsivertinimas: Refleksijos klausimas „Kaip šios žinios padeda spręsti kitas problemas?“.`,
    average: `• Formuojamasis vertinimas pagal aiškius sėkmės kriterijus (atlikta bent 70–80% užduočių).
• Įsivertinimas: Šviesoforo metodas (žalia / geltona / raudona) ir tarpusavio patikrinimas poroje.`,
    struggling: `• Padrąsinamasis formuojamasis vertinimas, fiksuojant asmeninę pažangą ir pastangas be streso.
• Įsivertinimas: Žingsninis kontrolinis sąrašas (Checklist): 3 trumpi teiginiai apie tai, ką pavyko atlikti.`
  };

  // 8. Namų darbai pagal eMokykla.lt rekomendacijas (aiškus tikslas, sąsaja su tema, įvairovė, neperkraunant mokinių)
  const isNoHomework = hwPurpose === 'Be namų darbų';
  
  const homework = {
    purpose: hwPurpose,
    gifted: isNoHomework 
      ? 'Namų darbai neužduodami (mokiniai viską atliko pamokoje).'
      : `${profile.homeworkGoalStatement} Sąsaja su tema: Gilinamasis iššūkis temai „${currentTopic}“. Užduotis: Kūrybiškai pritaikyti žinias, sukurti 2 probleminius klausimus arba mini projektinį pavyzdį (rekomenduojama trukmė: ~15–20 min.).`,
    general: isNoHomework
      ? 'Namų darbai neužduodami (mokiniai viską atliko pamokoje).'
      : `${profile.homeworkGoalStatement} Sąsaja su tema: ${profile.homeworkConnection} Užduotis: ${profile.homeworkSpecificTask} (rekomenduojama trukmė: ~15 min., neperkraunant mokinių).`,
    struggling: isNoHomework
      ? 'Namų darbai neužduodami (mokiniai viską atliko pamokoje).'
      : `${profile.homeworkGoalStatement} Sąsaja su tema: Bazinio lygio įtvirtinimas. Užduotis: Pabaigti klasėje pradėtą bazinę užduotį naudojantis pamokoje gauta atmintine ar pavyzdžiu (rekomenduojama trukmė: ~10–15 min.).`
  };

  // 9. Skaitmeniniai resursai
  const digitalResources = selectedResources.length > 0
    ? `Parinkti įrankiai: ${selectedResources.join(', ')}.\nPapildomi šaltiniai: eMokykla.lt skaitmeninė saugykla, Eduka klasė, interaktyvūs testai (Wordwall, Quizizz, Kahoot).`
    : `• eMokykla.lt atnaujintų Bendrųjų programų metodinė medžiaga ir skaitmeniniai ištekliai.
• Interaktyvūs įrankiai greitam patikrinimui: Quizizz, Kahoot, Wordwall.
• Bendradarbiavimo ir vizualizavimo priemonės: Canva plakatams, Miro / Padlet lentos.
• Edukaciniai vaizdo įrašai: LRT mediateka, Youtube edukaciniai kanalai.`;

  // 10. EL. DIENYNO ĮRAŠAI PAGAL EMOKYKLA REKOMENDACIJAS
  // Standartizuota temos formuluotė: Dalykas: Tema. Aprašymas ko išmoks ir ką darys.
  // Neakademiniams: pabrėžiama ugdomoji vertė ir veikla!
  // Namų darbai: tikslas, sąsaja su tema, konkreti užduotis, apimtis be perkrovimo.
  // Pastabos: gyvenimiška nauda visada + vertinimas ir klasės mokymasis TIK jei mokytojas nurodė!

  let eDiaryTopicClasswork = '';
  if (profile.isNonAcademic) {
    // Specialios gairės neakademiniams dalykams (Klasės vadovo veikla, Etika, Teatras...)
    eDiaryTopicClasswork = `${profile.domainName}: ${currentTopic}. Ugdomoji vertė ir mokymosi uždaviniai: ${profile.learningObjectives} Veikla: ${profile.actionContext}`;
  } else {
    // Standartizuota akademinė formuluotė pagal eMokykla.lt
    eDiaryTopicClasswork = `${profile.domainName}: ${currentTopic}. Mokymosi uždaviniai ir veikla: ${profile.learningObjectives} Žinoti: ${profile.knowItem} Gebėti: ${profile.ableItem} Taikyti: ${profile.applyItem}`;
  }

  // Namų darbai dienyne
  let eDiaryHomework = '';
  if (isNoHomework) {
    eDiaryHomework = 'Namų darbai neužduoti (mokiniai visus tikslus pasiekė ir praktinius darbus atliko pamokos metu).';
  } else {
    eDiaryHomework = `${profile.homeworkGoalStatement} Sąsaja su tema: ${profile.homeworkConnection} Užduotis: ${profile.homeworkSpecificTask} Rekomenduojama trukmė: iki 15–20 min. (optimalus krūvis).`;
  }

  // Pastabos dienyne
  // Reikalavimas: „Pastabose pateik patarimų kuo naudinga mokymo medžiaga realiame gyvenime, jei mokytojas nurodė pateik informaciją apie vertinimą, klasės mokymąsi. Tai pateik jei mokytojas nurodė.“
  const realWorldText = realWorldNote && realWorldNote.trim().length > 0 
    ? realWorldNote.trim() 
    : profile.realWorldUse;

  const teacherRequestedEvaluation = (selectedEvaluations && selectedEvaluations.length > 0) || (evaluationCriteria && evaluationCriteria.trim().length > 0);
  const teacherProvidedClassNotes = classLearningNotes && classLearningNotes.trim().length > 0;

  const notesParts: string[] = [];

  // 1. Gyvenimiškas patarimas (visada pateikiamas pastabose)
  notesParts.push(`💡 Kuo naudinga realiame gyvenime: ${realWorldText}`);

  // 2. Vertinimas (TIK jei mokytojas nurodė)
  if (teacherRequestedEvaluation) {
    const evalMethodsStr = selectedEvaluations.length > 0 ? selectedEvaluations.join(', ') : 'Formuojamasis vertinimas';
    const evalCritStr = evaluationCriteria && evaluationCriteria.trim() ? `. Kriterijai: ${evaluationCriteria.trim()}` : '';
    notesParts.push(`📊 Planuojamas vertinimas: ${evalMethodsStr}${evalCritStr}.`);
  }

  // 3. Klasės mokymasis (TIK jei mokytojas nurodė)
  if (teacherProvidedClassNotes) {
    notesParts.push(`👥 Klasės mokymasis / ypatumai: ${classLearningNotes.trim()}`);
  }

  const diaryNotes = notesParts.join('\n\n');

  const eDiaryEntry = {
    topicClassworkExpectations: eDiaryTopicClasswork,
    homework: eDiaryHomework,
    individualHomework: isNoHomework ? '' : `${profile.homeworkGoalStatement} Individuali diferencijuota užduotis pagal mokinio lygį (iki 15 min.).`,
    notes: diaryNotes,
    realWorldUse: realWorldText,
    assessmentNote: teacherRequestedEvaluation 
      ? `Vertinimas: ${selectedEvaluations.length > 0 ? selectedEvaluations.join(', ') : 'Formuojamasis vertinimas'}${evaluationCriteria ? `. Kriterijai: ${evaluationCriteria}` : ''}.` 
      : '',
    classLearningNote: teacherProvidedClassNotes ? classLearningNotes.trim() : '',
    isIntegrated: !!isIntegratedInput,
    isOutside: !!isOutsideInput,
    eDiaryLessonType: lessonType || (profile.isNonAcademic ? profile.domainName : 'Dalykinė pamoka')
  };

  // 11. Didaktinis metodų bankas
  const methodologyBank: MethodologyBank = {
    icebreakers: [
      {
        option: "A variantas",
        title: "Gyvenimiškas paradoksas ir provokuojantis klausimas",
        prompt: `„Įsivaizduokite situaciją: jums reikia priimti sprendimą temoje „${currentTopic}“, bet neturite interneto. Kaip mąstytumėte? Nuo ko pradėtumėte?“`
      },
      {
        option: "B variantas",
        title: "„Tiesa ar mitas?“ / Klaidų provokacija",
        prompt: `Mokytojas lentoje pateikia 3 teiginius apie „${currentTopic}“ (du teisingi, vienas mitas). Mokiniai balsuoja signalinėmis kortelėmis arba pirštais.`
      },
      {
        option: "C variantas",
        title: "Asociacijų žemėlapis ir minčių lietus",
        prompt: `„Kokius 3 svarbiausius žodžius ar praktines situacijas jums primena tema „${currentTopic}“?“ Sukuriamas bendras minčių debesis.`
      },
      {
        option: "D variantas",
        title: "Vaizdinė mįslė / Artefaktas",
        prompt: `Mokytojas parodo nuotrauką ar trumpą schemą: „Kaip šis vaizdas tiesiogiai susijęs su šiandienos tema „${currentTopic}“?“`
      }
    ],
    activeMethods: [
      {
        name: "„Pagalvok – Pasitark poroje – Pasidalink“ (Think-Pair-Share)",
        description: `Mokiniai 1 min. individualiai apmąsto klausimą apie „${currentTopic}“, 2 min. diskutuoja su suolo draugu ir suformuluoja bendrą atsakymą klasei.`,
        practicalTip: "Puikiai tinka įtraukti tylesnius mokinius ir sukurti saugią erdvę pasitikrinti mintis prieš kalbant viešai."
      },
      {
        name: "„Ekspertų mozaika“ (Jigsaw)",
        description: `Klasė suskirstoma į ekspertų grupes. Kiekviena grupė gilinasi į atskirą temos „${currentTopic}“ aspektą, o vėliau grįžta į pradinę komandą ir išmoko kitus.`,
        practicalTip: "Skatina tarpusavio atsakomybę – kiekvienas mokinys tampa atsakingas už savo komandos sėkmę."
      },
      {
        name: "„Frayer sąvokų modelis“",
        description: `Lapelyje pildomi 4 langai: 1) Apibrėžimas savais žodžiais, 2) Esminės savybės, 3) Pavyzdžiai, 4) Nepavyzdžiai ar dažnos klaidos.`,
        practicalTip: "Apsaugo nuo mechaninio iškalimo ir ugdo gilų konceptualų mąstymą."
      },
      {
        name: "„Klaidų detektyvas / Klaidų laboratorija“",
        description: `Mokytojas pateikia atliktą užduotį su 2 sąmoningai padarytomis klaidomis. Mokiniai porose jas suranda ir argumentuotai paaiškina teisingą variantą.`,
        practicalTip: "Ugdo kritinį vertinimą (Bloom 4–5 lygiai) ir padeda suprasti tipinius klaidų šaltinius."
      },
      {
        name: "„Užduočių stotelės ir rotacija“ (Station Rotation)",
        description: `Klasėje įrengiamos stotelės: 1) Teorinės analizės, 2) Praktinių pratimų, 3) Kūrybinio iššūkio. Grupės rotuoja kas 7–8 min.`,
        practicalTip: "Užtikrina judėjimą klasėje, dinamiką ir padeda išlaikyti aukštą mokinių koncentraciją."
      }
    ],
    realWorldContext: profile.realWorldUse,
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
      }
    ],
    reflectionIdeas: [
      {
        method: "Metodas „3-2-1“",
        description: "3 svarbiausi dalykai, kuriuos sužinojau šiandien; 2 klausimai, apie kuriuos noriu pasidomėti; 1 idėja, kaip tai pritaikysiu praktiškai."
      },
      {
        method: "„Išėjimo bilietas“ (Exit Ticket)",
        description: "Paskutinėmis 3 pamokos minutėmis kiekvienas mokinys atsako į vieną esminį probleminį klausimą ir atiduoda mokytojui."
      },
      {
        method: "„Šviesoforas ir viena mintis“",
        description: "Žalia: supratau puikiai, gebu paaiškinti draugui; Geltona: supratau esmę, bet reikia papildomos praktikos; Raudona: kilo neaiškumų."
      }
    ]
  };

  return {
    generalNotes: `Išsamus pamokos planas pagal atnaujintas BP ir eMokykla.lt standartus (${currentSubject}, ${currentGrade}).`,
    lessonType: lessonType || (profile.isNonAcademic ? profile.domainName : 'Įtvirtinimo'),
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
