// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// src/templatePlanGenerator.ts
function analyzeSubjectAndTopic(subject, topic, activities, goal, hwPurpose) {
  const sLow = (subject || "").toLowerCase();
  const tLow = (topic || "").toLowerCase();
  const aLow = (activities || "").toLowerCase();
  const gLow = (goal || "").toLowerCase();
  const combined = `${sLow} ${tLow} ${aLow} ${gLow}`;
  const isClassTutor = sLow.includes("vadov") || sLow.includes("valand") || tLow.includes("vadov") || tLow.includes("valand\u0117l");
  const isEthics = sLow.includes("etik") || sLow.includes("tikyb") || tLow.includes("etik") || tLow.includes("moral");
  const isTheatre = sLow.includes("teatr") || sLow.includes("dram") || tLow.includes("vaidyb") || tLow.includes("etiud");
  const isLifeSkills = sLow.includes("gyvenimo") || sLow.includes("socialin") || sLow.includes("emocin") || sLow.includes("seu") || tLow.includes("savimon");
  const isCareer = sLow.includes("karjer") || sLow.includes("profes") || tLow.includes("karjer");
  const isPE = sLow.includes("fizin") || sLow.includes("k\u016Bn") || sLow.includes("sport") || tLow.includes("estafet");
  const isArt = sLow.includes("dail") || sLow.includes("men") || sLow.includes("pie\u0161") || tLow.includes("kompozic");
  const isMusic = sLow.includes("muzik") || tLow.includes("chor") || tLow.includes("ritm");
  if (isClassTutor) {
    return {
      isNonAcademic: true,
      domainName: "Klas\u0117s vadovo veikla",
      actionContext: `Klas\u0117s mikroklimato, bendravimo kult\u016Bros ir tarpusavio susitarim\u0173 stiprinimas tema \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai ugdysis empatij\u0105, atsakomyb\u0119 bendruomen\u0117je, geb\u0117s atvirai diskutuoti ir reflektuoti asmenin\u012F ind\u0117l\u012F \u012F klas\u0117s santykius.`,
      knowItem: `bendruomeni\u0161kumo principus, saugaus elgesio ir pagarbaus bendravimo susitarimus.`,
      ableItem: `i\u0161klausyti bendraklas\u012F be i\u0161ankstinio vertinimo, argumentuoti savo pozicij\u0105, ie\u0161koti kompromis\u0173.`,
      applyItem: `taikyti pozityvaus bendravimo strategijas kasdien\u0117se klas\u0117s ir pertrauk\u0173 situacijose.`,
      realWorldUse: `\u0160ios socialin\u0117s-emocin\u0117s kompetencijos padeda kurti saugius santykius gyvenime, spr\u0119sti konfliktus be streso ir s\u0117kmingai bendradarbiauti bet kuriame kolektyve ar b\u016Bsimoje profesin\u0117je veikloje.`,
      homeworkSpecificTask: `U\u017Esira\u0161yti 1 asmenin\u012F pasteb\u0117jim\u0105 apie klas\u0117s santykius arba parengti 1 pasi\u016Blym\u0105 bendrai klas\u0117s veiklai.`,
      homeworkConnection: `T\u0119sia pamokoje nagrin\u0117t\u0105 klas\u0117s mikroklimato ir bendradarbiavimo tem\u0105.`,
      homeworkGoalStatement: `Tikslas \u2013 apm\u0105styti asmenin\u0119 atsakomyb\u0119 ir pasirengti kitos klas\u0117s valand\u0117l\u0117s diskusijai.`,
      sampleMethods: ["Diskusija ratu (Circle practice)", "Atvejo analiz\u0117", "Komandos formavimo \u017Eaidimas"]
    };
  }
  if (isEthics) {
    return {
      isNonAcademic: true,
      domainName: "Etika",
      actionContext: `Vertybini\u0173 pasirinkim\u0173 ir moralini\u0173 dilem\u0173 tyrin\u0117jimas nagrin\u0117jant tem\u0105 \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai mokysis atpa\u017Einti etines dilemas, vertinti elgesio motyvus bei pasekmes, ugdysis tolerancij\u0105 ir kritin\u012F m\u0105stym\u0105.`,
      knowItem: `esmines etines s\u0105vokas, s\u0105\u017Einingumo, teisingumo ir atsakomyb\u0117s reik\u0161m\u0119.`,
      ableItem: `analizuoti moralines situacijas, skirti faktus nuo vertinim\u0173, pagarbiai i\u0161klausyti kitoki\u0105 nuomon\u0119.`,
      applyItem: `pagr\u012Fstai priimti eti\u0161kus sprendimus kasdieniuose santykiuose ir skaitmenin\u0117je erdv\u0117je.`,
      realWorldUse: `Etinis ra\u0161tingumas padeda orientuotis sud\u0117tingose gyvenimo situacijose, atsispirti manipuliacijoms ir kurti pasitik\u0117jimu gr\u012Fstus santykius.`,
      homeworkSpecificTask: `Pagalvoti apie vien\u0105 gyvenimi\u0161k\u0105 situacij\u0105, kurioje kilo etin\u0117 dilema, ir suformuluoti 2 argumentus u\u017E skirtingus sprendimus.`,
      homeworkConnection: `Padeda susieti teorines etikos s\u0105vokas su asmenine mokinio patirtimi.`,
      homeworkGoalStatement: `Tikslas \u2013 k\u016Brybi\u0161kai apm\u0105styti moralinius pasirinkimus ir pasirengti argumentuotai diskusijai.`,
      sampleMethods: ["Dilem\u0173 svarstymas (Kohlberg modelis)", "Vertybi\u0173 aukcionas", "Debatai porose"]
    };
  }
  if (isTheatre) {
    return {
      isNonAcademic: true,
      domainName: "Teatras",
      actionContext: `Scenin\u0117s rai\u0161kos, judesio ir vaidybini\u0173 improvizacij\u0173 atlikimas tema \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai ugdysis k\u016Brybi\u0161kum\u0105, pasitik\u0117jim\u0105 savimi, sceninio buvimo jausm\u0105 ir bendradarbiavimo scenoje \u012Fg\u016Bd\u017Eius.`,
      knowItem: `scenin\u0117s erdv\u0117s, tempo-ritmo, neverbalin\u0117s rai\u0161kos ir sceninio d\u0117mesio d\u0117sningumus.`,
      ableItem: `kurti trump\u0105 etiud\u0105 ar persona\u017E\u0105, valdyti k\u016Bno kalb\u0105, balso intonacij\u0105 ir reaguoti \u012F partner\u012F.`,
      applyItem: `laisvai ir dr\u0105siai reik\u0161ti mintis prie\u0161 auditorij\u0105, improvizuoti netik\u0117tose situacijose.`,
      realWorldUse: `Teatrin\u0117 patirtis \u0161alina vie\u0161ojo kalb\u0117jimo baim\u0119, moko valdyti emocijas, k\u016Bno kalb\u0105 ir suteikia pasitik\u0117jimo savimi pristatymuose bei bendravime.`,
      homeworkSpecificTask: `Steb\u0117ti ir trumpai u\u017Efiksuoti vieno pasirinkto \u017Emogaus ar persona\u017Eo 2 b\u016Bdingus judesius ar kalbos ypatumus.`,
      homeworkConnection: `Ugdo pastabum\u0105 aplinkai ir padeda kurti autenti\u0161kus persona\u017Eus.`,
      homeworkGoalStatement: `Tikslas \u2013 lavinti pastabum\u0105 ir pasirengti praktiniam etiudui kitos pamokos metu.`,
      sampleMethods: ["Improvizacija", "Gyvieji paveikslai (Tableau)", "Neverbalin\u0117s komunikacijos pratimai"]
    };
  }
  if (isLifeSkills) {
    return {
      isNonAcademic: true,
      domainName: "Gyvenimo \u012Fg\u016Bd\u017Eiai",
      actionContext: `Praktini\u0173 kasdienio gyvenimo, saugumo ir emocin\u0117s sveikatos \u012Fg\u016Bd\u017Ei\u0173 stiprinimas tema \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai \u012Fgis praktini\u0173 \u017Eini\u0173, kaip saugoti sveikat\u0105, valdyti stres\u0105 ir priimti apgalvotus sprendimus.`,
      knowItem: `sveikos gyvensenos, emocij\u0173 atpa\u017Einimo ir saugaus elgesio taisykles.`,
      ableItem: `atpa\u017Einti streso ar pavojaus po\u017Eymius, taikyti savireguliacijos ir pagalbos sau technikas.`,
      applyItem: `priimti saugius sprendimus realiose kasdien\u0117se situacijose ir internete.`,
      realWorldUse: `Gyvenimo \u012Fg\u016Bd\u017Eiai yra tiesiogin\u0117 investicija \u012F asmenin\u012F saugum\u0105, emocin\u012F atsparum\u0105, sveikat\u0105 ir s\u0117kming\u0105 kasdienyb\u0119.`,
      homeworkSpecificTask: `I\u0161bandyti 1 streso valdymo ar laiko planavimo technik\u0105 ir u\u017Efiksuoti jos poveik\u012F.`,
      homeworkConnection: `Padeda pamokos teorines \u017Einias paversti kasdieniu asmeniniu \u012Fpro\u010Diu.`,
      homeworkGoalStatement: `Tikslas \u2013 prakti\u0161kai i\u0161bandyti savireguliacijos metod\u0105 ir \u012Fsivertinti jo naud\u0105.`,
      sampleMethods: ["Simuliacija", "Praktin\u0117 situacij\u0173 analiz\u0117", "Refleksijos dienora\u0161tis"]
    };
  }
  const isSpreadsheets = combined.includes("sheet") || combined.includes("excel") || combined.includes("skai\u010Diuokl") || combined.includes("lentel") || combined.includes("formul");
  const isIT = sLow.includes("informac") || sLow.includes("it") || sLow.includes("skaitmen") || isSpreadsheets;
  if (isSpreadsheets) {
    return {
      isNonAcademic: false,
      domainName: subject || "Informacin\u0117s technologijos",
      actionContext: `Skaitmeninis ugdymo turinys. Duomen\u0173 organizavimas, skai\u010Diavimo formuli\u0173 ir funkcij\u0173 taikymas Google Sheets aplinkoje nagrin\u0117jant tem\u0105 \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai mokysis strukt\u016Bruoti duomenis skai\u010Diuokl\u0117je, naudoti automatines matematines formules ir vizualizuoti rezultatus diagramomis.`,
      knowItem: `skai\u010Diuokl\u0117s langeli\u0173 adresavim\u0105, duomen\u0173 tipus (tekstas, skai\u010Dius, data), pagrindines funkcijas (SUM, AVERAGE, MIN, MAX).`,
      ableItem: `savaranki\u0161kai kurti ir formatuoti lenteles, \u012Fra\u0161yti teisingas skai\u010Diavimo formules, filtruoti ir r\u016B\u0161iuoti duomenis.`,
      applyItem: `panaudoti skai\u010Diuokl\u0119 praktiniam skai\u010Diavimui (biud\u017Eetui, asmeniniam tvarkara\u0161\u010Diui ar eksperimento duomen\u0173 analizei).`,
      realWorldUse: `Skai\u010Diuokli\u0173 (Google Sheets / Excel) valdymas yra viena labiausiai vertinam\u0173 kompetencij\u0173 \u0161iuolaikin\u0117je darbo rinkoje, nepakei\u010Diama asmenini\u0173 finans\u0173 planavimui, verslo analitikai, in\u017Einerijai ir organizaciniams darbams.`,
      homeworkSpecificTask: `Papildyti klas\u0117je prad\u0117t\u0105 Google Sheets lentel\u0119 2 naujomis formul\u0117mis arba atlikti trump\u0105 skai\u010Diavimo u\u017Eduot\u012F (apie 15 min.).`,
      homeworkConnection: `Tiesiogiai \u012Ftvirtina klas\u0117je i\u0161mokt\u0105 formuli\u0173 sintaks\u0119 ir duomen\u0173 formatavimo \u012Fg\u016Bd\u017Eius.`,
      homeworkGoalStatement: `Tikslas \u2013 \u012Ftvirtinti skai\u010Diuokl\u0117s formuli\u0173 naudojimo \u012Fg\u016Bd\u017Eius ir pabaigti prad\u0117t\u0105 skaitmenin\u0119 lentel\u0119.`,
      sampleMethods: ["Interaktyvus demonstravimas ekrane", "Praktinis darbas kompiuteriu", "U\u017Eduotys porose"]
    };
  }
  if (isIT) {
    return {
      isNonAcademic: false,
      domainName: subject || "Informacin\u0117s technologijos",
      actionContext: `Skaitmenini\u0173 \u012Franki\u0173, algoritm\u0173 ir technologini\u0173 sprendim\u0173 tyrin\u0117jimas tema \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai mokysis taikyti skaitmeninius \u012Frankius u\u017Eduotims atlikti, suprasti algoritm\u0173 logik\u0105 ir saugaus darbo internete principus.`,
      knowItem: `pagrindines skaitmeninio \u012Frankio funkcijas, s\u0105sajos elementus ir saugaus duomen\u0173 tvarkymo taisykles.`,
      ableItem: `kurti skaitmenin\u012F produkt\u0105, \u0161alinti atsiradusias technologines klaidas, paai\u0161kinti atliktus \u017Eingsnius.`,
      applyItem: `pritaikyti skaitmeninius \u012Fg\u016Bd\u017Eius kit\u0173 pamok\u0173 projektams ir asmeniniams k\u016Brybiniams sumanymams.`,
      realWorldUse: `Skaitmeninis ra\u0161tingumas ir loginis technologinis m\u0105stymas atveria duris \u012F \u0161iuolaikines technologij\u0173 industrijas ir u\u017Etikrina saug\u0173, efektyv\u0173 skaitmenini\u0173 \u012Franki\u0173 valdym\u0105 kasdienyb\u0117je.`,
      homeworkSpecificTask: `Pabaigti prad\u0117t\u0105 skaitmenin\u012F eskiz\u0105 / kod\u0105 arba per\u017Ei\u016Br\u0117ti 3 min. mokom\u0105j\u0105 instrukcij\u0105 kitos pamokos temai.`,
      homeworkConnection: `Sujungia pamokoje prad\u0117t\u0105 skaitmenin\u012F projekt\u0105 su pasirengimu kitam etapui.`,
      homeworkGoalStatement: `Tikslas \u2013 pabaigti klas\u0117s praktin\u012F darb\u0105 ir pasirengti kitai pamokai (iki 15\u201320 min.).`,
      sampleMethods: ["Gyvas programavimo/k\u016Brimo demonstravimas", "Klaid\u0173 paie\u0161kos i\u0161\u0161\u016Bkis", "Projektin\u0117 veikla"]
    };
  }
  const isForeignLang = sLow.includes("angl") || sLow.includes("u\u017Esienio") || sLow.includes("vokie\u010D") || sLow.includes("pranc\u016Bz") || combined.includes("restaurant") || combined.includes("english");
  if (isForeignLang) {
    const isRestaurant = combined.includes("restaurant") || combined.includes("maist") || combined.includes("food");
    return {
      isNonAcademic: false,
      domainName: subject || "U\u017Esienio kalba (angl\u0173)",
      actionContext: isRestaurant ? `U\u017Esienio kalba: Mokymasis u\u017Esisakyti maist\u0105 restorane, naudojant specifin\u012F \u017Eodyn\u0105, mandagumo frazes ir dialog\u0173 modelius temoje \u201E${topic}\u201C.` : `U\u017Esienio kalba: Komunikacini\u0173 geb\u0117jim\u0173 ir specifinio \u017Eodyno lavinimas nagrin\u0117jant tem\u0105 \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai mokysis vartoti nauj\u0105 temin\u012F \u017Eodyn\u0105, sudaryti taisyklingus sakinius ir laisvai susikalb\u0117ti realiose kasdien\u0117se situacijose.`,
      knowItem: `teminius \u017Eod\u017Eius ir frazes, taisykling\u0105 tarim\u0105, mandagaus bendravimo kalbines konstrukcijas.`,
      ableItem: `suprasti girdim\u0105 tekst\u0105, palaikyti dialog\u0105 poroje, taisyklingai u\u017Eduoti klausimus ir atsakyti \u012F juos.`,
      applyItem: `savaranki\u0161kai sukurti ir suvaidinti realistin\u012F dialog\u0105 ar para\u0161yti trump\u0105 \u017Einut\u0119/lai\u0161k\u0105.`,
      realWorldUse: `U\u017Esienio kalbos mok\u0117jimas yra tiesioginis raktas \u012F laisv\u0105 keliavim\u0105, tarptautin\u0119 komunikacij\u0105, film\u0173/literat\u016Bros supratim\u0105 originalo kalba ir pasaulines studij\u0173 bei karjeros galimybes.`,
      homeworkSpecificTask: isRestaurant ? `Sukurti trump\u0105 4\u20136 replik\u0173 dialog\u0105 restorane (klientas ir padav\u0117jas) panaudojant bent 3 naujas pamokos frazes.` : `Atlikti 1 trump\u0105 komunikacin\u012F pratim\u0105 arba parengti 3 klausimus porininkui kitai pamokai (iki 15 min.).`,
      homeworkConnection: `\u012Etvirtina pamokoje i\u0161moktas kalbines konstrukcijas ir ruo\u0161ia laisvam kalb\u0117jimui.`,
      homeworkGoalStatement: `Tikslas \u2013 \u012Ftvirtinti nauj\u0105 \u017Eodyn\u0105 ir prakti\u0161kai panaudoti mandagumo frazes dialoge.`,
      sampleMethods: ["Vaidmen\u0173 \u017Eaidimas (Role-play)", "Greitieji dialogai (Speed-dating kalb\u0117jimui)", "Klausymo u\u017Eduotys"]
    };
  }
  const isLithuanian = sLow.includes("lietuvi") || combined.includes("kalba") || combined.includes("ra\u0161yba") || combined.includes("skyryba") || combined.includes("veiksma\u017Eod") || combined.includes("tekst");
  if (isLithuanian) {
    const isDirectSpeech = combined.includes("tiesiogin") || combined.includes("netiesiogin");
    return {
      isNonAcademic: false,
      domainName: subject || "Lietuvi\u0173 kalba ir literat\u016Bra",
      actionContext: isDirectSpeech ? `Tiesiogin\u0117s ir netiesiogin\u0117s kalbos skyrybos taisykli\u0173 taikymas, dialog\u0173 konstravimas ir teksto rai\u0161kos analiz\u0117 tema \u201E${topic}\u201C.` : `Gimtosios kalbos d\u0117sningum\u0173, taisyklingos rai\u0161kos ir teksto analiz\u0117s \u012Fg\u016Bd\u017Ei\u0173 tobulinimas tema \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai mokysis taisyklingai vartoti kalbos taisykles, analizuoti autoriaus mint\u012F ir kurti ai\u0161kius, ri\u0161lius sakinius.`,
      knowItem: isDirectSpeech ? `tiesiogin\u0117s kalbos ir autoriaus \u017Eod\u017Ei\u0173 skyrybos schemas bei transformavimo \u012F netiesiogin\u0119 kalb\u0105 principus.` : `nagrin\u0117jamos temos taisykles, s\u0105vokas ir teksto sandaros reikalavimus.`,
      ableItem: `atpa\u017Einti kalbos rei\u0161kinius tekste, taisyklingai d\u0117ti skyrybos \u017Eenklus, redaguoti ir taisyti sakinius.`,
      applyItem: `pritaikyti taisykles savo kuriamuose tekstuose, vie\u0161ajame kalb\u0117jime ir argumentuotame samprotavime.`,
      realWorldUse: `Sklandi, taisyklinga ir \u012Ftaigi lietuvi\u0173 kalba u\u017Etikrina akademin\u0119 s\u0117km\u0119, profesional\u0173 \u012Fvaizd\u012F, padeda \u012Ftikinti auditorij\u0105 ir skland\u017Eiai formuluoti mintis ra\u0161tu bei \u017Eod\u017Eiu.`,
      homeworkSpecificTask: isDirectSpeech ? `Perra\u0161yti 3 tiesiogin\u0117s kalbos sakinius \u012F netiesiogin\u0119 kalb\u0105 arba sukurti trump\u0105 4 eilu\u010Di\u0173 dialog\u0105 su taisyklinga skyryba.` : `Atlikti 1 tikslin\u012F kalbos \u012Ftvirtinimo pratim\u0105 i\u0161 vadov\u0117lio / skaitmenin\u0117s aplinkos (iki 15 min.).`,
      homeworkConnection: `T\u0119sia klas\u0117je prad\u0117t\u0105 taisykli\u0173 taikymo praktik\u0105 ir padeda pasitikrinti supratim\u0105.`,
      homeworkGoalStatement: `Tikslas \u2013 \u012Ftvirtinti taisykli\u0173 taikym\u0105 ir lavinti kalbin\u0119 rai\u0161k\u0105 (optimali trukm\u0117 15 min.).`,
      sampleMethods: ["Teksto redagavimo dirbtuv\u0117s", "Klaid\u0173 med\u017Eiokl\u0117", "K\u016Brybinis mini ra\u0161inys"]
    };
  }
  const isMath = sLow.includes("matemat") || combined.includes("lygt") || combined.includes("geometr") || combined.includes("trupmen") || combined.includes("skai\u010D");
  if (isMath) {
    return {
      isNonAcademic: false,
      domainName: subject || "Matematika",
      actionContext: `Matematini\u0173 d\u0117sningum\u0173, skai\u010Diavimo algoritm\u0173 ir problem\u0173 sprendimo strategij\u0173 taikymas tema \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai mokysis taikyti matematin\u012F algoritm\u0105, logi\u0161kai pagr\u012Fsti sprendimo eig\u0105 ir tikrinti gautus rezultatus.`,
      knowItem: `matematines formules, d\u0117snius, apibr\u0117\u017Eimus ir skai\u010Diavimo \u017Eingsnius.`,
      ableItem: `atlikti matematines operacijas, pasirinkti racional\u0173 sprendimo b\u016Bd\u0105, grafi\u0161kai ar skaiti\u0161kai pavaizduoti ry\u0161ius.`,
      applyItem: `i\u0161spr\u0119sti praktin\u012F kontekstin\u012F u\u017Edavin\u012F, siejant\u012F matematik\u0105 su kasdien\u0117mis situacijomis.`,
      realWorldUse: `Matematinis m\u0105stymas lavina login\u012F samprotavim\u0105, kritin\u012F duomen\u0173 vertinim\u0105, finansin\u012F ra\u0161tingum\u0105 ir padeda priimti optimalius sprendimus kasdienyb\u0117je bei technologijose.`,
      homeworkSpecificTask: `I\u0161spr\u0119sti 2\u20133 pasirinkto lygio u\u017Edavinius i\u0161 temos \u201E${topic}\u201C (optimali trukm\u0117 iki 15\u201320 min.).`,
      homeworkConnection: `\u012Etvirtina klas\u0117je nagrin\u0117t\u0105 algoritm\u0105 ir parodo savaranki\u0161ko taikymo geb\u0117jimus.`,
      homeworkGoalStatement: `Tikslas \u2013 \u012Ftvirtinti skai\u010Diavimo algoritm\u0105 ir pasitikrinti atsakymus savikontrol\u0117s b\u016Bdu.`,
      sampleMethods: ["Probleminis u\u017Edavinys i\u0161 gyvenimo", "Darbas porose Think-Pair-Share", "Etalonini\u0173 sprendim\u0173 analiz\u0117"]
    };
  }
  const isScience = sLow.includes("biolog") || sLow.includes("fizik") || sLow.includes("chemij") || sLow.includes("gamt");
  if (isScience) {
    return {
      isNonAcademic: false,
      domainName: subject || "Gamtos mokslai",
      actionContext: `Gamtos rei\u0161kini\u0173 tyrin\u0117jimas, prie\u017Eastini\u0173 ry\u0161i\u0173 ir mokslinio metodo taikymas tema \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai mokysis paai\u0161kinti gamtos procesus, kelti hipotezes, analizuoti steb\u0117jim\u0173 duomenis ir daryti pagr\u012Fstas i\u0161vadas.`,
      knowItem: `gamtos mokslo d\u0117snius, s\u0105vokas, proces\u0173 etapus ir saugaus eksperimentavimo taisykles.`,
      ableItem: `apra\u0161yti rei\u0161kinio eig\u0105, interpretuoti grafikus bei lenteles, paai\u0161kinti prie\u017Easties ir pasekm\u0117s ry\u0161\u012F.`,
      applyItem: `susieti mokslo d\u0117sningumus su ekologin\u0117mis problemomis, technologijomis ir \u017Emogaus sveikata.`,
      realWorldUse: `Gamtamokslinis supratimas padeda tausoti sveikat\u0105 ir aplink\u0105, suprasti gamtos rei\u0161kinius bei technologij\u0173 veikimo principus.`,
      homeworkSpecificTask: `Atsakyti \u012F 2 probleminius klausimus arba atlikti mini steb\u0117jim\u0105 nam\u0173 aplinkoje (iki 15 min.).`,
      homeworkConnection: `Sustiprina ry\u0161\u012F tarp klas\u0117s laboratorinio/teorinio darbo ir reali\u0173 rei\u0161kini\u0173.`,
      homeworkGoalStatement: `Tikslas \u2013 \u012Ftvirtinti gamtamokslines s\u0105vokas ir paai\u0161kinti rei\u0161kinio prie\u017Eastis.`,
      sampleMethods: ["Mokslinis steb\u0117jimas", "Virtualus eksperimentas", "Prie\u017Eas\u010Di\u0173-pasekmi\u0173 \u017Eem\u0117lapis"]
    };
  }
  const isSocial = sLow.includes("istorij") || sLow.includes("geograf") || sLow.includes("piliet");
  if (isSocial) {
    return {
      isNonAcademic: false,
      domainName: subject || "Socialiniai mokslai",
      actionContext: `Istorini\u0173 \u0161altini\u0173 analiz\u0117, geografin\u0117s erdv\u0117s tyrin\u0117jimas ir pilietinio s\u0105moningumo ugdymas tema \u201E${topic}\u201C.`,
      learningObjectives: `Mokiniai mokysis analizuoti \u0161altinius, lyginti procesus laike ir erdv\u0117je, vertinti \u012Fvyki\u0173 prie\u017Eastis bei pasekmes.`,
      knowItem: `pagrindinius faktus, datas, s\u0105vokas, asmenybes ar geografinius d\u0117sningumus.`,
      ableItem: `skaityti \u017Eem\u0117lap\u012F ar istorin\u012F \u0161altin\u012F, palyginti skirtingus po\u017Ei\u016Brius, argumentuotai diskutuoti.`,
      applyItem: `susieti praeities pamokas su \u0161i\u0173 dien\u0173 visuomen\u0117s ir valstyb\u0117s i\u0161\u0161\u016Bkiais.`,
      realWorldUse: `Istorinis ir geografinis ra\u0161tingumas ugdo pilietin\u0119 brand\u0105, padeda suprasti pasaulio \u012Fvyki\u0173 kontekst\u0105 ir atpa\u017Einti dezinformacij\u0105.`,
      homeworkSpecificTask: `I\u0161analizuoti 1 trump\u0105 \u0161altinio i\u0161trauk\u0105 arba \u017Eem\u0117lapio fragment\u0105 ir suformuluoti 1 i\u0161vad\u0105 (iki 15 min.).`,
      homeworkConnection: `Gilina \u0161altini\u0173 analiz\u0117s \u012Fg\u016Bd\u017Eius ir ruo\u0161ia kitos pamokos diskusijai.`,
      homeworkGoalStatement: `Tikslas \u2013 lavinti \u0161altini\u0173 analiz\u0117s \u012Fg\u016Bd\u017Eius ir pasirengti bendrai diskusijai.`,
      sampleMethods: ["\u0160altini\u0173 kritika", "Debatai", "Istorin\u0117/geografin\u0117 rekonstrukcija"]
    };
  }
  return {
    isNonAcademic: false,
    domainName: subject || "Bendrasis ugdymas",
    actionContext: `Dalykini\u0173 \u017Eini\u0173 ir praktini\u0173 \u012Fg\u016Bd\u017Ei\u0173 gilinimas nagrin\u0117jant tem\u0105 \u201E${topic}\u201C.`,
    learningObjectives: `Mokiniai mokysis suprasti temos \u201E${topic}\u201C esm\u0119, atlikti diferencijuotas praktines veiklas ir argumentuoti savo sprendimus.`,
    knowItem: `temos \u201E${topic}\u201C pagrindinius terminus, principus ir taisykles.`,
    ableItem: `atlikti praktines u\u017Eduotis, paai\u0161kinti sprendimo logik\u0105 poroje, \u012Fsivertinti savo atsakymus.`,
    applyItem: `pritaikyti \u012Fgytas \u017Einias naujose praktin\u0117se situacijose ar k\u016Brybiniame darbe.`,
    realWorldUse: `\u0160ios temos \u017Einios ugdo analitin\u012F m\u0105stym\u0105, padeda spr\u0119sti kasdienes praktines problemas ir atveria naujas galimybes tolimesniam mokymuisi.`,
    homeworkSpecificTask: `Atlikti 1 tikslin\u0119 diferencijuot\u0105 u\u017Eduot\u012F arba apm\u0105styti 1 praktin\u012F temos pavyzd\u012F (rekomenduojama iki 15 min.).`,
    homeworkConnection: `Tiesiogiai siejasi su pamokoje nagrin\u0117ta tema \u201E${topic}\u201C ir padeda pasitikrinti asmenin\u0119 pa\u017Eang\u0105.`,
    homeworkGoalStatement: `Tikslas \u2013 ${hwPurpose.toLowerCase()} atliekant tikslin\u0119 u\u017Eduot\u012F be mokini\u0173 perkrovimo.`,
    sampleMethods: ["M\u0105styk-Tarkis-Dalykis", "Klaid\u0173 paie\u0161ka", "Praktin\u0117 simuliacija"]
  };
}
function buildPedagogicalPlan(params) {
  const {
    subject,
    grade,
    topic,
    lessonType,
    goal,
    activities,
    homeworkPurpose = "\u012Etvirtinti \u012Fg\u016Bd\u017Eius ir \u017Einias",
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
    selectedStudentLevels = ["pa\u017Eeng\u0119", "vidutiniai", "turintys sunkum\u0173"]
  } = params;
  const currentTopic = topic.trim();
  const currentSubject = subject.trim();
  const currentGrade = grade.trim();
  const hwPurpose = homeworkPurpose.trim() || "\u012Etvirtinti \u012Fg\u016Bd\u017Eius ir \u017Einias";
  const profile = analyzeSubjectAndTopic(currentSubject, currentTopic, activities || "", goal || "", hwPurpose);
  const smartGoal = goal && goal.trim().length > 0 ? goal.trim() : `I\u0161nagrin\u0117j\u0119 tem\u0105 \u201E${currentTopic}\u201C, mokiniai geb\u0117s:
1. \u017Dinoti ir paai\u0161kinti: taisyklingai \u012Fvardyti ${profile.knowItem} (bent 80% tikslumu).
2. Prakti\u0161kai taikyti: savaranki\u0161kai bei porose ${profile.ableItem}, pagrind\u017Eiant sprendimo eig\u0105.
3. Gilintis ir kurti: ${profile.applyItem}, \u012Fsivertinti pasiekimus pagal pateiktus s\u0117km\u0117s kriterijus.`;
  const competencies = `\u2022 Pa\u017Einimo kompetencija: kritinis m\u0105stymas nagrin\u0117jant tem\u0105 \u201E${currentTopic}\u201C, prie\u017Eas\u010Di\u0173 ir pasekmi\u0173 ry\u0161i\u0173 paie\u0161ka bei informacijos analiz\u0117.
\u2022 Komunikavimo kompetencija: taisyklingas dalykini\u0173 termin\u0173 vartojimas, geb\u0117jimas ai\u0161kiai i\u0161reik\u0161ti id\u0117jas, aktyvus klausymasis ir konstruktyvus gr\u012F\u017Etamasis ry\u0161ys poroje.
\u2022 Skaitmenin\u0117 kompetencija: skaitmenini\u0173 mokymosi platform\u0173 ir \u012Franki\u0173 tikslingas panaudojimas \u017Eini\u0173 \u012Ftvirtinimui.
\u2022 Pilieti\u0161kumo ir socialin\u0117-emocin\u0117 kompetencija: pagarbus bendradarbiavimas, tarpusavio pagalba ir asmenin\u0117 atsakomyb\u0117 u\u017E klas\u0117s darb\u0105.
\u2022 K\u016Brybi\u0161kumo kompetencija: alternatyvi\u0173 sprendim\u0173 paie\u0161ka ir originali\u0173 praktini\u0173 pavyzd\u017Ei\u0173 k\u016Brimas.`;
  const bpConnections = `Pamoka parengta remiantis atnaujintos ${currentSubject} (${currentGrade}) bendrosios programos pasiekim\u0173 sritimis:
- \u017Dinios ir supratimas: ${profile.knowItem}
- Praktinis pritaikymas: ${profile.ableItem}
- Auk\u0161tesnieji geb\u0117jimai: ${profile.applyItem}
- Mok\u0117jimas mokytis: geb\u0117jimas planuoti savo darb\u0105, fiksuoti spragas ir \u012Fsivertinti pa\u017Eang\u0105.`;
  const criteriaText = evaluationCriteria && evaluationCriteria.trim().length > 0 ? evaluationCriteria.trim() : `S\u0117km\u0117s kriterijai mokiniui (\u201EA\u0161 geb\u0117siu\u201C):
\u2714 Slenkstinis lygis (4\u20135 balai): Atpa\u017E\u012Fstu pagrindines s\u0105vokas, atlieku bazin\u0119 u\u017Eduot\u012F su pagalba ar atmintine.
\u2714 Pagrindinis lygis (6\u20138 balai): Savaranki\u0161kai atlieku standartines u\u017Eduotis temai \u201E${currentTopic}\u201C, paai\u0161kinu atsakymo logik\u0105.
\u2714 Auk\u0161tesnysis lygis (9\u201310 bal\u0173): I\u0161sprend\u017Eiu nestandartin\u0119 problemin\u0119 situacij\u0105, argumentuotai pakonsultuoju kitus.`;
  const evaluationMethods = selectedEvaluations.length > 0 ? selectedEvaluations : ["Formuojamasis vertinimas pamokos eigoje", "Tarpusavio vertinimas (Peer Review) porose", "Greitasis \u012Fsivertinimas"];
  const introduction = `1. Pamokos prad\u017Eia ir tikslo suformulavimas (1\u20132 min.):
   \u2022 Kartu su mokiniais perskaitomas ir paai\u0161kinamas pamokos u\u017Edavinys bei s\u0117km\u0117s kriterijai (\u201EKo \u0161iandien i\u0161moksime ir k\u0105 geb\u0117sime?\u201C).
2. D\u0117mesio su\u017Eadinimas / Didaktin\u0117 intriga:
   \u2022 Gyvenimi\u0161kas pavyzdys / provokuojantis klausimas: \u201EKaip tema \u201E${currentTopic}\u201C kasdien veikia mus ir kur j\u0105 pritaikome realiame pasaulyje?\u201C
   \u2022 Mokytojas pateikia trump\u0105 situacij\u0105 arba vaizdin\u0119 m\u012Fsl\u0119, kvie\u010Dian\u010Di\u0105 m\u0105styti.
3. Ankstesni\u0173 \u017Eini\u0173 aktyvinimas (2 min.):
   \u2022 2\u20133 klausim\u0173 blitz-apklausa ry\u0161iui su ankstesne med\u017Eiaga u\u017Emegzti.`;
  const theory = `1. Temos tyrin\u0117jimas ir konceptualus ai\u0161kinimas:
   \u2022 Mokytojas pristato esminius temos \u201E${currentTopic}\u201C principus: ${profile.knowItem}.
   \u2022 Metodas \u201EM\u0105stymas garsiai\u201C (Think-Aloud): demonstruojamas tipinis pavyzdys \u017Eingsnis po \u017Eingsnio komentuojant sprendimo logik\u0105.
2. Tarpinis supratimo patikrinimas (Check for Understanding):
   \u2022 Mokiniai signalin\u0117mis kortel\u0117mis ar pir\u0161tais parodo supratimo lyg\u012F prie\u0161 pradedant savaranki\u0161k\u0105 praktin\u012F darb\u0105.`;
  const practice = activities && activities.trim().length > 0 ? `${activities.trim()}

Diferencijuotos praktikos eiga:
\u2022 1 etapas: Praktinis darbas porose (Think-Pair-Share) nagrin\u0117jant pavyzd\u017Eius.
\u2022 2 etapas: Savaranki\u0161kas diferencijuotas darbas pagal lygius (Auk\u0161tesnysis, Pagrindinis, Slenkstinis).
\u2022 3 etapas: Tikslin\u0117 mokytojo pagalba ir operatyvus gr\u012F\u017Etamasis ry\u0161ys.` : `Diferencijuotas praktinis \u017Eini\u0173 taikymas (3 lygiais ir etapais):
1. U\u017Eduotys porose:
   \u2022 Mokiniai atlieka bazin\u0119 u\u017Eduot\u012F kartu su suolo draugu, pasitardami d\u0117l sprendimo logikos.
2. Savaranki\u0161ka praktika:
   \u2022 Slenkstinis lygis: baziniai pratimai su atraminiais \u017Eod\u017Eiais ar pavyzd\u017Eiu.
   \u2022 Pagrindinis lygis: standartin\u0117s u\u017Eduotys, reikalaujan\u010Dios sprendimo pagrindimo.
   \u2022 Pa\u017Eengusi\u0173j\u0173 lygis: probleminis i\u0161\u0161\u016Bkis ar asistento vaidmuo padedant draugui.
3. Mokytojo konsultavimas: individualus pastiprinimas ir klaid\u0173 taisymas realiu laiku.`;
  const consolidation = `\u017Dini\u0173 \u012Ftvirtinimas ir operatyvus patikrinimas:
\u2022 Interaktyvi mini viktorina (Kahoot / Quizizz / Wordwall) arba \u201EKlaid\u0173 med\u017Eiokl\u0117\u201C porose.
\u2022 Tarpusavio vertinimas porose: mokiniai apsikei\u010Dia darbais ir pagal s\u0117km\u0117s kriterijus pasako vienas kitam 1 pagyrim\u0105 ir 1 patarim\u0105.`;
  const summary = `Pamokos apibendrinimas, refleksija ir \u012Fsivertinimas:
\u2022 Refleksijos metodas \u201E3-2-1\u201C:
   - 3 svarbiausi dalykai, kuriuos su\u017Einojau apie \u201E${currentTopic}\u201C;
   - 2 klausimai ar situacijos, kur dar noriu pasitreniruoti;
   - 1 b\u016Bdas, kaip tai pritaikysiu prakti\u0161kai.
\u2022 \u012Esivertinimas: Mokiniai \u012Fsivertina pa\u017Eang\u0105 pagal pamokos prad\u017Eioje i\u0161keltus s\u0117km\u0117s kriterijus.
\u2022 Nam\u0173 darb\u0173 tikslingumo ir atlikimo gairi\u0173 aptarimas (Tikslingumas: ${hwPurpose}).`;
  const classActivities = {
    individual: `\u2022 Savaranki\u0161kas u\u017Eduo\u010Di\u0173 atlikimas pasirinktu tempu.
\u2022 Asmeninio konspekto, schemos ar s\u0105vok\u0173 \u017Eem\u0117lapio pildymas.
\u2022 Savikontrol\u0117 pagal pateikt\u0105 etalonin\u012F atsakym\u0173 lap\u0105.`,
    pairs: `\u2022 Metodas \u201EPagalvok \u2013 Pasitark poroje \u2013 Pasidalink su klase\u201C (Think-Pair-Share).
\u2022 Tarpusavio vertinimas (Peer Review) pagal s\u0117km\u0117s kriterijus.
\u2022 Bendras probleminio klausimo sprendimas.`,
    group: `\u2022 Komandinis i\u0161\u0161\u016Bkis: sukurti mini plakat\u0105, i\u0161spr\u0119sti situacin\u012F u\u017Edavin\u012F ar suklasifikuoti pavyzd\u017Eius.
\u2022 \u201EEkspert\u0173 mozaika\u201C (Jigsaw): atskiros temos dalies analiz\u0117 ir paai\u0161kinimas kitiems.`,
    toolsResources: selectedResources.length > 0 ? selectedResources.join(", ") + " | Vadov\u0117liai, u\u017Eduo\u010Di\u0173 lapai, interaktyvus ekranas, skaitmeniniai \u012Frenginiai." : "Vadov\u0117liai, u\u017Eduo\u010Di\u0173 lapai, interaktyvus ekranas, mokini\u0173 i\u0161manieji \u012Frenginiai."
  };
  const individualWork = `1. Bazinio lygio u\u017Eduotys: 2\u20133 pratimai taisyklei ar algoritmui \u012Ftvirtinti (su atraminiais \u017Eod\u017Eiais).
2. Pagrindinio lygio u\u017Eduotys: 3\u20134 pratimai, reikalaujantys savaranki\u0161ko sprendimo ir paai\u0161kinimo.
3. Auk\u0161tesniojo lygio u\u017Eduotys: k\u016Brybinis i\u0161\u0161\u016Bkis \u2013 sukurti savo pavyzd\u012F ar problemin\u012F klausim\u0105 bendraklasiams.`;
  const differentiation = {
    gifted: `\u2022 K\u016Brybin\u0117s ir tyrimo u\u017Eduotys (Bloom: Analiz\u0117, K\u016Brimas): ie\u0161koti s\u0105saj\u0173 su kitais mokslais, analizuoti nestandartinius atvejus.
\u2022 \u201EEksperto / Asistento\u201C vaidmuo: pagalba bendraklasiams porose, argumentuotas atsakym\u0173 komentavimas.`,
    general: `\u2022 Pilnas Bendrosios programos reikalavim\u0173 pasiekimas: nuoseklaus sunkumo u\u017Eduotys.
\u2022 Darbas porose aptariant sprendimus ir taisant pasteb\u0117tas klaidas.`,
    struggling: `\u2022 U\u017Eduo\u010Di\u0173 skaidymas nedideliais \u017Eingsniais (Step-by-step metodas).
\u2022 Pagalbin\u0117s priemon\u0117s: taisykli\u0173 atmintin\u0117s, atramin\u0117s kortel\u0117s, pavyzdinis algoritmas.`
  };
  const differentiatedTasks = {
    advanced: `\u2022 Gilinamasis i\u0161\u0161\u016Bkis: I\u0161analizuoti nestandartin\u0119 problemin\u0119 temos \u201E${currentTopic}\u201C situacij\u0105, rasti prie\u017Eastinius ry\u0161ius.
\u2022 K\u016Brybin\u0117 veikla: Parengti original\u0173 praktin\u012F pavyzd\u012F ar test\u0105 bendraklasiams.
\u2022 Bendraklasi\u0173 mentoryst\u0117: Atlikti \u201EEksperto\u201C funkcij\u0105 teikiant konstruktyv\u0173 gr\u012F\u017Etam\u0105j\u012F ry\u0161\u012F (Peer Review).`,
    average: `\u2022 Standartinis pritaikymas: Atlikti pagrindinio lygio pratimus temai \u201E${currentTopic}\u201C \u012Ftvirtinti pagal nagrin\u0117t\u0105 algoritm\u0105.
\u2022 Darbas poroje: I\u0161nagrin\u0117ti situacij\u0105 kartu su suolo draugu metodu \u201EPagalvok \u2013 Pasitark \u2013 Pasidalink\u201C.
\u2022 Savikontrol\u0117: Pasitikrinti atsakymus ir savaranki\u0161kai i\u0161taisyti klaidas.`,
    struggling: `\u2022 Bazin\u0117 strukt\u016Bruota u\u017Eduotis: Atlikti 2 bazines u\u017Eduotis, suskaidytas \u012F ma\u017Eus \u017Eingsnelius su dalinai u\u017Epildytu pavyzd\u017Eiu.
\u2022 Atramin\u0117s priemon\u0117s: Naudotis s\u0105vok\u0173 kortele, atraminiais \u017Eod\u017Eiais ir schema.
\u2022 Mokytojo palaikymas: U\u017Eduot\u012F atlikti su periodiniu paskatinimu ir nukreipiamaisiais klausimais.`
  };
  const differentiatedAssessment = {
    advanced: `\u2022 Kriterinis vertinimas pagal auk\u0161tesniojo lygio pasiekim\u0173 deskriptorius (argumentacija, savaranki\u0161kumas, k\u016Brybi\u0161kumas).
\u2022 \u012Esivertinimas: Refleksijos klausimas \u201EKaip \u0161ios \u017Einios padeda spr\u0119sti kitas problemas?\u201C.`,
    average: `\u2022 Formuojamasis vertinimas pagal ai\u0161kius s\u0117km\u0117s kriterijus (atlikta bent 70\u201380% u\u017Eduo\u010Di\u0173).
\u2022 \u012Esivertinimas: \u0160viesoforo metodas (\u017Ealia / geltona / raudona) ir tarpusavio patikrinimas poroje.`,
    struggling: `\u2022 Padr\u0105sinamasis formuojamasis vertinimas, fiksuojant asmenin\u0119 pa\u017Eang\u0105 ir pastangas be streso.
\u2022 \u012Esivertinimas: \u017Dingsninis kontrolinis s\u0105ra\u0161as (Checklist): 3 trumpi teiginiai apie tai, k\u0105 pavyko atlikti.`
  };
  const isNoHomework = hwPurpose === "Be nam\u0173 darb\u0173" || params.homeworkDuration === "0" || params.homeworkType && params.homeworkType.includes("Be nam\u0173 darb\u0173");
  const homework = {
    purpose: hwPurpose,
    gifted: isNoHomework ? "Nam\u0173 darbai neu\u017Eduodami (mokiniai visk\u0105 atliko pamokoje)." : `${profile.homeworkGoalStatement} S\u0105saja su tema: Gilinamasis i\u0161\u0161\u016Bkis temai \u201E${currentTopic}\u201C. U\u017Eduotis: K\u016Brybi\u0161kai pritaikyti \u017Einias, sukurti 2 probleminius klausimus arba mini projektin\u012F pavyzd\u012F (rekomenduojama trukm\u0117: ~15\u201320 min.).`,
    general: isNoHomework ? "Nam\u0173 darbai neu\u017Eduodami (mokiniai visk\u0105 atliko pamokoje)." : `${profile.homeworkGoalStatement} S\u0105saja su tema: ${profile.homeworkConnection} U\u017Eduotis: ${profile.homeworkSpecificTask} (rekomenduojama trukm\u0117: ~15 min., neperkraunant mokini\u0173).`,
    struggling: isNoHomework ? "Nam\u0173 darbai neu\u017Eduodami (mokiniai visk\u0105 atliko pamokoje)." : `${profile.homeworkGoalStatement} S\u0105saja su tema: Bazinio lygio \u012Ftvirtinimas. U\u017Eduotis: Pabaigti klas\u0117je prad\u0117t\u0105 bazin\u0119 u\u017Eduot\u012F naudojantis pamokoje gauta atmintine ar pavyzd\u017Eiu (rekomenduojama trukm\u0117: ~10\u201315 min.).`
  };
  const digitalResources = selectedResources.length > 0 ? `Parinkti \u012Frankiai: ${selectedResources.join(", ")}.
Papildomi \u0161altiniai: eMokykla.lt skaitmenin\u0117 saugykla, Eduka klas\u0117, interaktyv\u016Bs testai (Wordwall, Quizizz, Kahoot).` : `\u2022 eMokykla.lt atnaujint\u0173 Bendr\u0173j\u0173 program\u0173 metodin\u0117 med\u017Eiaga ir skaitmeniniai i\u0161tekliai.
\u2022 Interaktyv\u016Bs \u012Frankiai greitam patikrinimui: Quizizz, Kahoot, Wordwall.
\u2022 Bendradarbiavimo ir vizualizavimo priemon\u0117s: Canva plakatams, Miro / Padlet lentos.
\u2022 Edukaciniai vaizdo \u012Fra\u0161ai: LRT mediateka, Youtube edukaciniai kanalai.`;
  let eDiaryTopicClasswork = "";
  if (profile.isNonAcademic) {
    eDiaryTopicClasswork = `${profile.domainName}: ${currentTopic}. Ugdomoji vert\u0117 ir mokymosi u\u017Edaviniai: ${profile.learningObjectives} Veikla: ${profile.actionContext}`;
  } else {
    eDiaryTopicClasswork = `${profile.domainName}: ${currentTopic}. Mokymosi u\u017Edaviniai ir veikla: ${profile.learningObjectives} \u017Dinoti: ${profile.knowItem} Geb\u0117ti: ${profile.ableItem} Taikyti: ${profile.applyItem}`;
  }
  let eDiaryHomework = "";
  if (isNoHomework) {
    eDiaryHomework = "Nam\u0173 darbai neu\u017Eduodami (mokymosi kr\u016Bvio balansas pagal N0015 rekomendacij\u0105 \u2013 visi tikslai pasiekti pamokoje).";
  } else {
    const durationLabel = params.homeworkDuration === "15" ? "10\u201315 min. (rekomenduojama)" : params.homeworkDuration === "20" ? "15\u201320 min." : params.homeworkDuration === "30" ? "20\u201330 min." : "iki 15\u201320 min.";
    eDiaryHomework = `${profile.homeworkGoalStatement} S\u0105saja su tema: ${profile.homeworkConnection} U\u017Eduotis: ${profile.homeworkSpecificTask} (Rekomenduojama trukm\u0117: ${durationLabel}).`;
  }
  const realWorldText = realWorldNote && realWorldNote.trim().length > 0 ? realWorldNote.trim() : profile.realWorldUse;
  const teacherRequestedEvaluation = selectedEvaluations && selectedEvaluations.length > 0 || evaluationCriteria && evaluationCriteria.trim().length > 0;
  const teacherProvidedClassNotes = classLearningNotes && classLearningNotes.trim().length > 0;
  const notesParts = [];
  notesParts.push(`\u{1F4A1} Kuo naudinga realiame gyvenime: ${realWorldText}`);
  if (teacherRequestedEvaluation) {
    const evalMethodsStr = selectedEvaluations.length > 0 ? selectedEvaluations.join(", ") : "Formuojamasis vertinimas";
    const evalCritStr = evaluationCriteria && evaluationCriteria.trim() ? `. Kriterijai: ${evaluationCriteria.trim()}` : "";
    notesParts.push(`\u{1F4CA} Planuojamas vertinimas: ${evalMethodsStr}${evalCritStr}.`);
  }
  if (teacherProvidedClassNotes) {
    notesParts.push(`\u{1F465} Klas\u0117s mokymasis / ypatumai: ${classLearningNotes.trim()}`);
  }
  const diaryNotes = notesParts.join("\n\n");
  const eDiaryEntry = {
    topicClassworkExpectations: eDiaryTopicClasswork,
    homework: eDiaryHomework,
    individualHomework: isNoHomework ? "" : `${profile.homeworkGoalStatement} Individuali diferencijuota u\u017Eduotis pagal mokinio lyg\u012F (iki 15 min.).`,
    notes: diaryNotes,
    realWorldUse: realWorldText,
    assessmentNote: teacherRequestedEvaluation ? `Vertinimas: ${selectedEvaluations.length > 0 ? selectedEvaluations.join(", ") : "Formuojamasis vertinimas"}${evaluationCriteria ? `. Kriterijai: ${evaluationCriteria}` : ""}.` : "",
    classLearningNote: teacherProvidedClassNotes ? classLearningNotes.trim() : "",
    isIntegrated: !!isIntegratedInput,
    isOutside: !!isOutsideInput,
    eDiaryLessonType: lessonType || (profile.isNonAcademic ? profile.domainName : "Dalykin\u0117 pamoka")
  };
  const methodologyBank = {
    icebreakers: [
      {
        option: "A variantas",
        title: "Gyvenimi\u0161kas paradoksas ir provokuojantis klausimas",
        prompt: `\u201E\u012Esivaizduokite situacij\u0105: jums reikia priimti sprendim\u0105 temoje \u201E${currentTopic}\u201C, bet neturite interneto. Kaip m\u0105stytum\u0117te? Nuo ko prad\u0117tum\u0117te?\u201C`
      },
      {
        option: "B variantas",
        title: "\u201ETiesa ar mitas?\u201C / Klaid\u0173 provokacija",
        prompt: `Mokytojas lentoje pateikia 3 teiginius apie \u201E${currentTopic}\u201C (du teisingi, vienas mitas). Mokiniai balsuoja signalin\u0117mis kortel\u0117mis arba pir\u0161tais.`
      },
      {
        option: "C variantas",
        title: "Asociacij\u0173 \u017Eem\u0117lapis ir min\u010Di\u0173 lietus",
        prompt: `\u201EKokius 3 svarbiausius \u017Eod\u017Eius ar praktines situacijas jums primena tema \u201E${currentTopic}\u201C?\u201C Sukuriamas bendras min\u010Di\u0173 debesis.`
      },
      {
        option: "D variantas",
        title: "Vaizdin\u0117 m\u012Fsl\u0117 / Artefaktas",
        prompt: `Mokytojas parodo nuotrauk\u0105 ar trump\u0105 schem\u0105: \u201EKaip \u0161is vaizdas tiesiogiai susij\u0119s su \u0161iandienos tema \u201E${currentTopic}\u201C?\u201C`
      }
    ],
    activeMethods: [
      {
        name: "\u201EPagalvok \u2013 Pasitark poroje \u2013 Pasidalink\u201C (Think-Pair-Share)",
        description: `Mokiniai 1 min. individualiai apm\u0105sto klausim\u0105 apie \u201E${currentTopic}\u201C, 2 min. diskutuoja su suolo draugu ir suformuluoja bendr\u0105 atsakym\u0105 klasei.`,
        practicalTip: "Puikiai tinka \u012Ftraukti tylesnius mokinius ir sukurti saugi\u0105 erdv\u0119 pasitikrinti mintis prie\u0161 kalbant vie\u0161ai."
      },
      {
        name: "\u201EEkspert\u0173 mozaika\u201C (Jigsaw)",
        description: `Klas\u0117 suskirstoma \u012F ekspert\u0173 grupes. Kiekviena grup\u0117 gilinasi \u012F atskir\u0105 temos \u201E${currentTopic}\u201C aspekt\u0105, o v\u0117liau gr\u012F\u017Eta \u012F pradin\u0119 komand\u0105 ir i\u0161moko kitus.`,
        practicalTip: "Skatina tarpusavio atsakomyb\u0119 \u2013 kiekvienas mokinys tampa atsakingas u\u017E savo komandos s\u0117km\u0119."
      },
      {
        name: "\u201EFrayer s\u0105vok\u0173 modelis\u201C",
        description: `Lapelyje pildomi 4 langai: 1) Apibr\u0117\u017Eimas savais \u017Eod\u017Eiais, 2) Esmin\u0117s savyb\u0117s, 3) Pavyzd\u017Eiai, 4) Nepavyzd\u017Eiai ar da\u017Enos klaidos.`,
        practicalTip: "Apsaugo nuo mechaninio i\u0161kalimo ir ugdo gil\u0173 konceptual\u0173 m\u0105stym\u0105."
      },
      {
        name: "\u201EKlaid\u0173 detektyvas / Klaid\u0173 laboratorija\u201C",
        description: `Mokytojas pateikia atlikt\u0105 u\u017Eduot\u012F su 2 s\u0105moningai padarytomis klaidomis. Mokiniai porose jas suranda ir argumentuotai paai\u0161kina teising\u0105 variant\u0105.`,
        practicalTip: "Ugdo kritin\u012F vertinim\u0105 (Bloom 4\u20135 lygiai) ir padeda suprasti tipinius klaid\u0173 \u0161altinius."
      },
      {
        name: "\u201EU\u017Eduo\u010Di\u0173 stotel\u0117s ir rotacija\u201C (Station Rotation)",
        description: `Klas\u0117je \u012Frengiamos stotel\u0117s: 1) Teorin\u0117s analiz\u0117s, 2) Praktini\u0173 pratim\u0173, 3) K\u016Brybinio i\u0161\u0161\u016Bkio. Grup\u0117s rotuoja kas 7\u20138 min.`,
        practicalTip: "U\u017Etikrina jud\u0117jim\u0105 klas\u0117je, dinamik\u0105 ir padeda i\u0161laikyti auk\u0161t\u0105 mokini\u0173 koncentracij\u0105."
      }
    ],
    realWorldContext: profile.realWorldUse,
    digitalAndGamified: [
      {
        tool: "Quizizz / Kahoot",
        idea: `5\u20137 klausim\u0173 greitasis \u017Eini\u0173 m\u016B\u0161is temos \u201E${currentTopic}\u201C \u012Ftvirtinimui su momentine klaid\u0173 analize.`
      },
      {
        tool: "Canva / Miro",
        idea: `Skaitmeninis mini plakatas arba schemati\u0161kas taisykli\u0173 / algoritm\u0173 \u017Eem\u0117lapis bendradarbiaujant porose.`
      },
      {
        tool: "Padlet lenta",
        idea: `\u201EKlausim\u0173 ir atradim\u0173 siena\u201C: mokiniai kelia savo praktinius klausimus arba geriausius rastus pavyzd\u017Eius.`
      },
      {
        tool: "Wordwall / LearningApps",
        idea: `Interaktyvus korteli\u0173 r\u016B\u0161iavimo arba s\u0105vok\u0173 ir pavyzd\u017Ei\u0173 sujungimo \u017Eaidimas.`
      }
    ],
    reflectionIdeas: [
      {
        method: "Metodas \u201E3-2-1\u201C",
        description: "3 svarbiausi dalykai, kuriuos su\u017Einojau \u0161iandien; 2 klausimai, apie kuriuos noriu pasidom\u0117ti; 1 id\u0117ja, kaip tai pritaikysiu prakti\u0161kai."
      },
      {
        method: "\u201EI\u0161\u0117jimo bilietas\u201C (Exit Ticket)",
        description: "Paskutin\u0117mis 3 pamokos minut\u0117mis kiekvienas mokinys atsako \u012F vien\u0105 esmin\u012F problemin\u012F klausim\u0105 ir atiduoda mokytojui."
      },
      {
        method: "\u201E\u0160viesoforas ir viena mintis\u201C",
        description: "\u017Dalia: supratau puikiai, gebu paai\u0161kinti draugui; Geltona: supratau esm\u0119, bet reikia papildomos praktikos; Raudona: kilo neai\u0161kum\u0173."
      }
    ],
    realWorldExamples: generateRealWorldExamples(currentSubject, currentTopic, currentGrade)
  };
  return {
    generalNotes: `I\u0161samus pamokos planas pagal atnaujintas BP ir eMokykla.lt standartus (${currentSubject}, ${currentGrade}).`,
    lessonType: lessonType || (profile.isNonAcademic ? profile.domainName : "\u012Etvirtinimo"),
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
      general: `Pagrindin\u0117s diferencijuotos praktin\u0117s u\u017Eduotys temai \u201E${currentTopic}\u201C \u012Fsisavinti.`,
      highLevel: `Probleminiai ir analitiniai i\u0161\u0161\u016Bkiai auk\u0161tesniajam pasiekim\u0173 lygiui.`,
      mainLevel: `Bazin\u0117s praktin\u0117s u\u017Eduotys pagal atnaujint\u0173 BP pasiekim\u0173 lygius.`
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
    specialAdvice: "Pasi\u016Blykite mokiniams rinktis u\u017Eduoties atlikimo lyg\u012F ar b\u016Bd\u0105 (poroje ar savaranki\u0161kai) \u2013 tai pastebimai didina motyvacij\u0105 ir asmenin\u0119 atsakomyb\u0119.",
    consultationAdvice: "Mokiniams, kuriems kilo klausim\u0173 praktikos metu, organizuoti 3 min. mini konsultacij\u0105 prie atskiros lentos.",
    motivation: `\u201EKiekvienas \u0161iandien \u017Eengtas \u017Eingsnis temoje \u201E${currentTopic}\u201C ugdo pasitik\u0117jim\u0105 savo geb\u0117jimais!\u201C`,
    stageDurations
  };
}
function generateRealWorldExamples(subject, topic, grade = "") {
  const sLow = (subject || "").toLowerCase();
  const tLow = (topic || "").toLowerCase();
  const combined = `${sLow} ${tLow}`;
  if (combined.includes("sheet") || combined.includes("excel") || combined.includes("skai\u010Diuokl") || combined.includes("lentel") || combined.includes("duomenys")) {
    return [
      {
        id: "rw-sheet-daily",
        category: "daily",
        categoryTitle: "Kasdienis gyvenimas ir asmeniniai finansai",
        categoryIcon: "\u{1F3E0}",
        title: "Asmeninio biud\u017Eeto ir ki\u0161enpinigi\u0173 planavimas",
        text: `Skai\u010Diuokl\u0117s leid\u017Eia susikurti asmenin\u012F i\u0161laid\u0173 ir santaup\u0173 sekikl\u012F: suskai\u010Diuoti m\u0117nesio ki\u0161enpinigius, planuoti pirkinius, automati\u0161kai apskai\u010Diuoti nuolaidas ir vizualizuoti i\u0161laidas skrituline diagrama.`,
        snippetForNotes: `Skai\u010Diuokli\u0173 valdymo \u012Fg\u016Bd\u017Eiai tiesiogiai taikomi asmeninio biud\u017Eeto planavimui, santaup\u0173 sekimui ir finansinio ra\u0161tingumo ugdymui kasdienyb\u0117je.`
      },
      {
        id: "rw-sheet-career",
        category: "career",
        categoryTitle: "\u0160iuolaikin\u0117s profesijos ir darbo rinka",
        categoryIcon: "\u{1F4BC}",
        title: "Verslo analitika, rinkodara ir projekt\u0173 valdymas",
        text: `Daugiau nei 75% \u0161iuolaikini\u0173 biuro ir technologij\u0173 specialist\u0173 (rinkodaros analitikai, in\u017Einieriai, finansininkai, rengini\u0173 vadybininkai, logistikos koordinatoriai) kasdien naudoja formules (SUM, AVERAGE, IF) greitam duomen\u0173 apdorojimui ir strategini\u0173 sprendim\u0173 pri\u0117mimui.`,
        snippetForNotes: `Google Sheets formuli\u0173 k\u016Brimas yra viena paklausiausi\u0173 bazini\u0173 kompetencij\u0173 verslo analitikos, rinkodaros, vadybos ir in\u017Einerijos profesijose.`
      },
      {
        id: "rw-sheet-steam",
        category: "steam",
        categoryTitle: "Technologijos, inovacijos ir STEAM",
        categoryIcon: "\u{1F680}",
        title: "Eksperiment\u0173 duomen\u0173 modeliavimas ir automatizavimas",
        text: `Skai\u010Diuokl\u0117 veikia kaip skaitmenin\u0117 laboratorija: suvedus biologijos, fizikos ar chemijos eksperimento matavimus, formul\u0117s akimirksniu apskai\u010Diuoja vidurkius, paklaidas ir nubrai\u017Eo d\u0117sningum\u0173 kreives.`,
        snippetForNotes: `Skai\u010Diuokl\u0117 taikoma mokslo eksperiment\u0173 duomen\u0173 apdorojimui, automatiniams skai\u010Diavimams ir rezultat\u0173 vizualizavimui.`
      },
      {
        id: "rw-sheet-advice",
        category: "advice",
        categoryTitle: "Praktinis patarimas mokiniui (\u201EKam man to prireiks?\u201C)",
        categoryIcon: "\u{1F4A1}",
        title: "Automatizavimas vietoje \u0161imt\u0173 valand\u0173 rankinio darbo",
        text: `I\u0161mok\u0119 vien\u0105 kart\u0105 sukurti teising\u0105 formul\u0119, sutaupysite \u0161imtus valand\u0173 ateityje: kompiuteris t\u016Bkstan\u010Dius eilu\u010Di\u0173 suskai\u010Diuoja per sekund\u0117s dal\u012F, apsaugodamas nuo \u017Emogi\u0161k\u0173 skai\u010Diavimo klaid\u0173.`,
        snippetForNotes: `Mokantis kurti formules ugdomas automatizavimo \u012Fprotis: vietoje varginan\u010Dio rankinio perskai\u010Diavimo kompiuteris darb\u0105 atlieka akimirksniu.`
      }
    ];
  }
  if (sLow.includes("angl") || sLow.includes("u\u017Esienio") || sLow.includes("vokie\u010D") || sLow.includes("pranc\u016Bz") || combined.includes("restaurant")) {
    const isFood = combined.includes("restaurant") || combined.includes("maist") || combined.includes("food");
    return [
      {
        id: "rw-lang-daily",
        category: "daily",
        categoryTitle: "Kasdienis gyvenimas ir kelion\u0117s",
        categoryIcon: "\u{1F3E0}",
        title: isFood ? "Laisvas bendravimas kavin\u0117se ir restoranuose u\u017Esienyje" : "Savaranki\u0161kumas keliaujant ir bendraujant internete",
        text: isFood ? `Mok\u0117jimas taisyklingai ir mandagiai u\u017Esisakyti maist\u0105, paklausti apie patiekalo sud\u0117t\u012F (alergenus) ir papra\u0161yti s\u0105skaitos suteikia visi\u0161k\u0105 laisv\u0119 bet kurioje pasaulio \u0161alyje.` : `Kalbini\u0173 konstrukcij\u0173 i\u0161manymas leid\u017Eia savaranki\u0161kai keliauti be gid\u0173, laisvai susikalb\u0117ti vie\u0161bu\u010Diuose, parduotuv\u0117se ir susirasti draug\u0173 i\u0161 kit\u0173 \u0161ali\u0173.`,
        snippetForNotes: `U\u017Esienio kalbos temos \u012Fg\u016Bd\u017Eiai suteikia savaranki\u0161kumo kelion\u0117se, padeda laisvai bendrauti kasdien\u0117se situacijose ir ugdo mandagaus dialogo kult\u016Br\u0105.`
      },
      {
        id: "rw-lang-career",
        category: "career",
        categoryTitle: "Tarptautin\u0117 karjera ir studijos",
        categoryIcon: "\u{1F4BC}",
        title: "Darbas tarptautin\u0117se komandose ir klient\u0173 aptarnavimas",
        text: `Tarptautin\u0117s kompanijos, IT startuoliai ir turizmo sektorius reikalauja sklandaus bendravimo ir specifinio teminio \u017Eodyno. Mandagus formalus ir neformalus bendravimas formuoja profesional\u0173 \u012Fvaizd\u012F.`,
        snippetForNotes: `Specifinis teminis \u017Eodynas ir mandagumo fraz\u0117s yra esminis pagrindas tarptautin\u0117ms studijoms, darbui pasaulin\u0117se kompanijose ir klient\u0173 aptarnavimui.`
      },
      {
        id: "rw-lang-steam",
        category: "steam",
        categoryTitle: "Kult\u016Brinis akiratis ir medijos",
        categoryIcon: "\u{1F680}",
        title: "Originalaus turinio supratimas be vert\u0117jo pagalbos",
        text: `Specifini\u0173 kalbos frazi\u0173 i\u0161manymas padeda \u017Ei\u016Br\u0117ti filmus, skaityti receptus ar instrukcijas originalo kalba, suprasti kult\u016Brinius niuansus ir humor\u0105, kuris da\u017Enai dingsta automatiniame vertime.`,
        snippetForNotes: `\u017Dodyno \u012Fvaldymas leid\u017Eia suprasti kult\u016Brinius kontekstus, tarptautines medijas ir bendrauti be kalbinio barjero.`
      },
      {
        id: "rw-lang-advice",
        category: "advice",
        categoryTitle: "Praktinis patarimas mokiniui (\u201EKam man to prireiks?\u201C)",
        categoryIcon: "\u{1F4A1}",
        title: "Pasitik\u0117jimas savimi realiame dialoge",
        text: `Tikslas n\u0117ra kalb\u0117ti tobulai be klaid\u0173, o geb\u0117ti ai\u0161kiai i\u0161reik\u0161ti savo poreik\u012F ir suprasti pa\u0161nekov\u0105. \u0160ios pamokos fraz\u0117s pa\u0161alina kalb\u0117jimo baim\u0119 realiose situacijose.`,
        snippetForNotes: `Kalbini\u0173 frazi\u0173 treniravimasis porose \u0161alina vie\u0161o bendravimo baim\u0119 ir ugdo dr\u0105s\u0105 kalb\u0117ti u\u017Esienio kalba realiame gyvenime.`
      }
    ];
  }
  if (sLow.includes("lietuvi") || combined.includes("ra\u0161yb") || combined.includes("skyryb") || combined.includes("tiesiogin") || combined.includes("reklam")) {
    const isDirect = combined.includes("tiesiogin");
    return [
      {
        id: "rw-lt-daily",
        category: "daily",
        categoryTitle: "Kasdien\u0117 komunikacija ir susira\u0161in\u0117jimas",
        categoryIcon: "\u{1F3E0}",
        title: isDirect ? "Taisyklingas citavimas ir min\u010Di\u0173 perdavimas prane\u0161imuose" : "Ai\u0161ki ir taisyklinga asmenin\u0117 komunikacija",
        text: isDirect ? `Tiesiogin\u0117s kalbos taisykl\u0117s padeda i\u0161vengti dviprasmybi\u0173 persiun\u010Diant kito \u017Emogaus \u017Eod\u017Eius \u017Einut\u0117se, socialiniuose tinkluose ir ra\u0161ant oficialius parei\u0161kimus ar skundus.` : `Taisyklinga ra\u0161yba ir ri\u0161li mintis kuria i\u0161silavinusio, patikimo \u017Emogaus \u012Fvaizd\u012F susira\u0161in\u0117jant su b\u016Bsimais darbdaviais, universitetais ar institucijomis.`,
        snippetForNotes: `Taisyklinga kalbos rai\u0161ka ir skyryba padeda ai\u0161kiai perduoti informacij\u0105 be dviprasmybi\u0173 ir kuria patikim\u0105 asmenin\u012F \u012Fvaizd\u012F.`
      },
      {
        id: "rw-lt-career",
        category: "career",
        categoryTitle: "\u0160iuolaikin\u0117s profesijos ir medijos",
        categoryIcon: "\u{1F4BC}",
        title: "\u017Durnalistika, komunikacija, teis\u0117 ir turinio k\u016Brimas",
        text: `Tekst\u0173 autoriai (copywriters), \u017Eurnalistai, teisininkai ir ry\u0161i\u0173 su visuomene specialistai privalo precizi\u0161kai cituoti \u0161altinius, argumentuoti ir kurti \u012Ftaigius tekstus, atitinkan\u010Dius auk\u0161\u010Diausius etikos standartus.`,
        snippetForNotes: `Temos \u012Fg\u016Bd\u017Eiai yra pamatiniai \u017Eurnalistikos, teis\u0117s, vie\u0161\u0173j\u0173 ry\u0161i\u0173 ir profesionalaus turinio k\u016Brimo profesijose.`
      },
      {
        id: "rw-lt-steam",
        category: "steam",
        categoryTitle: "Kritinis medij\u0173 ra\u0161tingumas",
        categoryIcon: "\u{1F680}",
        title: "Netikr\u0173 naujien\u0173 ir manipuliacij\u0173 atpa\u017Einimas",
        text: `Suprantant, kaip autoriaus \u017Eod\u017Eiai gali pakeisti cituojamos minties prasm\u0119, mokiniai i\u0161moksta kriti\u0161kai vertinti antra\u0161tes naujien\u0173 portaluose ir atpa\u017Einti i\u0161 konteksto i\u0161rautas frazes.`,
        snippetForNotes: `Teksto analiz\u0117s \u012Fg\u016Bd\u017Eiai padeda atpa\u017Einti manipuliacijas, netikras naujienas (Fake News) ir vertinti informacijos patikimum\u0105.`
      },
      {
        id: "rw-lt-advice",
        category: "advice",
        categoryTitle: "Praktinis patarimas mokiniui (\u201EKam man to prireiks?\u201C)",
        categoryIcon: "\u{1F4A1}",
        title: "Galia \u012Ftikinti ir apginti savo nuomon\u0119",
        text: `Taisyklingai suformuluotas sakinys ir pagr\u012Fsti argumentai padeda laim\u0117ti diskusijas, para\u0161yti \u012Ftaig\u0173 motyvacin\u012F lai\u0161k\u0105 ir apginti savo teises bet kurioje gyvenimo situacijoje.`,
        snippetForNotes: `Kalbin\u0117 kompetencija suteikia prana\u0161um\u0105 diskusijose, derybose ir leid\u017Eia argumentuotai apginti savo pozicij\u0105.`
      }
    ];
  }
  if (sLow.includes("vadov") || sLow.includes("valand") || sLow.includes("etik") || sLow.includes("teatr") || sLow.includes("gyvenimo")) {
    return [
      {
        id: "rw-nonacad-daily",
        category: "daily",
        categoryTitle: "Asmeniniai santykiai ir emocinis saugumas",
        categoryIcon: "\u{1F3E0}",
        title: "Konflikt\u0173 sprendimas ir saugi aplinka",
        text: `Socialiniai-emociniai \u012Fg\u016Bd\u017Eiai padeda atpa\u017Einti savo ir kit\u0173 ribas, laiku pasteb\u0117ti netinkam\u0105 elges\u012F ir sustabdyti paty\u010Dias ar nesutarimus be agresijos.`,
        snippetForNotes: `Temos veiklos tiesiogiai stiprina mokini\u0173 geb\u0117jim\u0105 spr\u0119sti kasdienius tarpusavio konfliktus taikiai ir kurti pagarb\u0173 klas\u0117s mikroklimat\u0105.`
      },
      {
        id: "rw-nonacad-career",
        category: "career",
        categoryTitle: "Komandinis darbas ir lyderyst\u0117",
        categoryIcon: "\u{1F4BC}",
        title: "Bendradarbiavimas \u0161iuolaikin\u0117se komandose",
        text: `Geb\u0117jimas i\u0161klausyti kitoki\u0105 nuomon\u0119, susitarti d\u0117l bendr\u0173 taisykli\u0173 ir kartu siekti tikslo yra Nr. 1 mink\u0161tasis \u012Fg\u016Bdis (Soft Skills), kurio ie\u0161ko modernios organizacijos.`,
        snippetForNotes: `Empatija, pagarbus dialogas ir bendradarbiavimas yra labiausiai vertinami \u0161iuolaikin\u0117s lyderyst\u0117s ir komandinio darbo \u012Fg\u016Bd\u017Eiai.`
      },
      {
        id: "rw-nonacad-steam",
        category: "steam",
        categoryTitle: "Skaitmenin\u0117 etika ir saugumas",
        categoryIcon: "\u{1F680}",
        title: "Atsakingas elgesys socialiniuose tinkluose",
        text: `Temos principai perkeliami \u012F internetin\u0119 erdv\u0119: mokiniai mokosi bendrauti forumuose, susira\u0161in\u0117jimo grup\u0117se (Discord, Messenger) ir atpa\u017Einti elektronines paty\u010Dias ar spaudim\u0105.`,
        snippetForNotes: `Ugdantis skaitmenin\u0119 etik\u0105 mokiniai i\u0161moksta saugoti savo privatum\u0105 ir pagarbiai bendrauti internetin\u0117se bendruomen\u0117se.`
      },
      {
        id: "rw-nonacad-advice",
        category: "advice",
        categoryTitle: "Praktinis patarimas mokiniui (\u201EKam man to prireiks?\u201C)",
        categoryIcon: "\u{1F4A1}",
        title: "Asmenin\u0117 ramyb\u0117 ir pasitik\u0117jimas savimi",
        text: `\u017Dinodami, kaip i\u0161reik\u0161ti savo jausmus ir kur kreiptis pagalbos, mokiniai jau\u010Diasi saug\u016Bs ir emoci\u0161kai stipresni bet kokioje netik\u0117toje gyvenimo situacijoje.`,
        snippetForNotes: `Emocij\u0173 atpa\u017Einimas ir pasitik\u0117jimas savimi padeda i\u0161laikyti vidin\u0119 ramyb\u0119 stresin\u0117se situacijose.`
      }
    ];
  }
  if (sLow.includes("matemat") || combined.includes("lygt") || combined.includes("geometr") || combined.includes("trupmen")) {
    return [
      {
        id: "rw-math-daily",
        category: "daily",
        categoryTitle: "Kasdieniai skai\u010Diavimai ir apsipirkimas",
        categoryIcon: "\u{1F3E0}",
        title: "Praktiniai matavimai, nuolaidos ir biud\u017Eetas",
        text: `Matematiniai ry\u0161iai padeda apskai\u010Diuoti reali\u0105 prek\u0117s kain\u0105 su nuolaida, palyginti skirtingos talpos pakuo\u010Di\u0173 vert\u0119 ir atlikti remonto ar bald\u0173 i\u0161d\u0117stymo matavimus kambaryje.`,
        snippetForNotes: `Matematiniai d\u0117sningumai tiesiogiai taikomi kasdieniuose pirkiniuose, finans\u0173 skai\u010Diavime ir praktiniuose erdv\u0117s matavimuose.`
      },
      {
        id: "rw-math-career",
        category: "career",
        categoryTitle: "In\u017Einerija, architekt\u016Bra ir IT",
        categoryIcon: "\u{1F4BC}",
        title: "Konstravimas, algoritmai ir modeliavimas",
        text: `Architektai, \u017Eaidim\u0173 k\u016Br\u0117jai, in\u017Einieriai ir logistikos planuotojai kasdien remiasi geometriniais d\u0117sningumais, funkcijomis ir proporcijomis, kurdami pastatus, 3D grafik\u0105 ir mar\u0161rutus.`,
        snippetForNotes: `Temos matematiniai algoritmai yra pamatas in\u017Einerijos, 3D modeliavimo, kompiuterini\u0173 \u017Eaidim\u0173 fizikos ir architekt\u016Bros disciplinose.`
      },
      {
        id: "rw-math-steam",
        category: "steam",
        categoryTitle: "Mokslas, duomenys ir technologijos",
        categoryIcon: "\u{1F680}",
        title: "Duomen\u0173 statistika ir dirbtinis intelektas",
        text: `\u0160iuolaikiniai dirbtinio intelekto algoritmai ir ma\u0161ininis mokymasis yra paremti matematin\u0117mis funkcijomis ir tikimybi\u0173 skai\u010Diavimais. Suprasdami matematik\u0105, mokiniai supranta ateities technologijas.`,
        snippetForNotes: `Loginis matematinis m\u0105stymas ugdo geb\u0117jim\u0105 suprasti \u0161iuolaikines duomen\u0173 technologijas ir algoritm\u0173 veikim\u0105.`
      },
      {
        id: "rw-math-advice",
        category: "advice",
        categoryTitle: "Praktinis patarimas mokiniui (\u201EKam man to prireiks?\u201C)",
        categoryIcon: "\u{1F4A1}",
        title: "M\u0105stymo a\u0161trumas ir loginis sprendim\u0173 pri\u0117mimas",
        text: `Matematika yra m\u0105stymo treniruot\u0117: i\u0161mok\u0119 strukt\u016Bruotai spr\u0119sti u\u017Edavin\u012F \u017Eingsnis po \u017Eingsnio, taip pat s\u0117kmingai i\u0161spr\u0119site bet koki\u0105 gyvenimi\u0161k\u0105 ar profesin\u0119 problem\u0105.`,
        snippetForNotes: `Matematikos mokymasis lavina nuosekl\u0173 problem\u0173 sprendim\u0105 ir login\u012F m\u0105stym\u0105, b\u016Btin\u0105 priimant apgalvotus sprendimus.`
      }
    ];
  }
  if (sLow.includes("biolog") || sLow.includes("fizik") || sLow.includes("chemij") || sLow.includes("gamt")) {
    return [
      {
        id: "rw-sci-daily",
        category: "daily",
        categoryTitle: "Kasdien\u0117 sveikata ir buities saugumas",
        categoryIcon: "\u{1F3E0}",
        title: "Sveika gyvensena, buitin\u0117 chemija ir energijos vartojimas",
        text: `Mokslo d\u0117sni\u0173 supratimas padeda pasirinkti sveikesnius maisto produktus, saugiai naudoti buities priemones ir taupyti elektros bei \u0161ilumos energij\u0105 namuose.`,
        snippetForNotes: `Gamtamokslin\u0117s \u017Einios padeda priimti sveikesnius mitybos pasirinkimus, saugiai elgtis su buitine technika ir tausoti aplink\u0105.`
      },
      {
        id: "rw-sci-career",
        category: "career",
        categoryTitle: "Medicina, ekologija ir energetika",
        categoryIcon: "\u{1F4BC}",
        title: "Ateities medicinos ir \u017Ealiosios energetikos sprendimai",
        text: `Gydytojai, biotechnologai, atsinaujinan\u010Dios energetikos in\u017Einieriai ir aplinkosaugos ekspertai remiasi \u0161iais d\u0117sniais kurdami naujus vaistus, saul\u0117s baterijas ir tvarias technologijas.`,
        snippetForNotes: `Temos d\u0117sniai taikomi medicinos, biotechnologij\u0173, aplinkosaugos ir moderniosios energetikos inovacijose.`
      },
      {
        id: "rw-sci-steam",
        category: "steam",
        categoryTitle: "Eksperimentai ir inovacijos",
        categoryIcon: "\u{1F680}",
        title: "Mokslinio tyr\u0117jo m\u0105stymas ir hipotezi\u0173 tikrinimas",
        text: `Mokiniai mokosi ne aklai tik\u0117ti mitais, o patikrinti faktus eksperimentu, fiksuoti matavimus ir daryti moksli\u0161kai pagr\u012Fstas i\u0161vadas.`,
        snippetForNotes: `Eksperimentin\u0117 veikla ugdo tiriam\u0105j\u012F m\u0105stym\u0105 ir geb\u0117jim\u0105 atskirti moksli\u0161kai pagr\u012Fstus faktus nuo pseudomokslo.`
      },
      {
        id: "rw-sci-advice",
        category: "advice",
        categoryTitle: "Praktinis patarimas mokiniui (\u201EKam man to prireiks?\u201C)",
        categoryIcon: "\u{1F4A1}",
        title: "Kaip veikia pasaulis aplink mus",
        text: `Suprasdami gamtos d\u0117snius, j\u016Bs matote tai, ko kiti nepastebi: kod\u0117l dangus m\u0117lynas, kaip veikia i\u0161maniojo telefono jutikliai ir kas vyksta \u017Emogaus k\u016Bne sportuojant.`,
        snippetForNotes: `Gamtos d\u0117sni\u0173 supratimas paai\u0161kina kasdienius rei\u0161kinius ir skatina smalsum\u0105 tyrin\u0117ti pasaul\u012F.`
      }
    ];
  }
  return [
    {
      id: "rw-gen-daily",
      category: "daily",
      categoryTitle: "Kasdienis gyvenimas ir asmenin\u0117 patirtis",
      categoryIcon: "\u{1F3E0}",
      title: `Temos \u201E${topic}\u201C taikymas kasdienyb\u0117je`,
      text: `\u0160ios temos principai padeda geriau suprasti mus supan\u010Di\u0105 aplink\u0105, analizuoti kasdienes situacijas ir priimti apgalvotus asmeninius sprendimus.`,
      snippetForNotes: `Temos \u201E${topic}\u201C med\u017Eiaga ugdo praktin\u012F m\u0105stym\u0105 ir padeda spr\u0119sti kasdienes gyvenimi\u0161kas problemas.`
    },
    {
      id: "rw-gen-career",
      category: "career",
      categoryTitle: "\u0160iuolaikin\u0117s profesijos ir karjera",
      categoryIcon: "\u{1F4BC}",
      title: `Kur \u0161i tema taikoma profesin\u0117je veikloje`,
      text: `\u0160iuolaikin\u0117je darbo rinkoje \u0161ios temos \u017Einios padeda analizuoti informacij\u0105, rengti projektus, bendradarbiauti komandoje ir kurti prid\u0117tin\u0119 vert\u0119.`,
      snippetForNotes: `\u012Egytos \u017Einios yra vertinga kompetencija \u0161iuolaikin\u0117se profesijose, reikalaujan\u010Diose analitikos ir komandinio darbo.`
    },
    {
      id: "rw-gen-steam",
      category: "steam",
      categoryTitle: "Technologijos, inovacijos ir ateities \u012Fg\u016Bd\u017Eiai",
      categoryIcon: "\u{1F680}",
      title: `Ry\u0161ys su technologijomis ir inovacijomis`,
      text: `Temos principai glaud\u017Eiai siejasi su \u0161iuolaikin\u0117mis skaitmenin\u0117mis priemon\u0117mis, technologiniais procesais ir tarpdalykiniu STEAM po\u017Ei\u016Briu.`,
      snippetForNotes: `Tema integruoja technologinius \u012Frankius ir ugdo XXI a. tarpdalykines kompetencijas.`
    },
    {
      id: "rw-gen-advice",
      category: "advice",
      categoryTitle: "Praktinis patarimas mokiniui (\u201EKam man to prireiks?\u201C)",
      categoryIcon: "\u{1F4A1}",
      title: `Asmenin\u0117 vert\u0117 ir praktin\u0117 nauda`,
      text: `\u0160ios pamokos \u012Fg\u016Bd\u017Eiai suteikia pasitik\u0117jimo savimi, moko kelti klausimus ir savaranki\u0161kai rasti teisingus atsakymus realiame pasaulyje.`,
      snippetForNotes: `Ugdantis temos geb\u0117jimus did\u0117ja asmeninis savaranki\u0161kumas ir geb\u0117jimas pritaikyti \u017Einias realiame gyvenime.`
    }
  ];
}

// src/bloomData.ts
var BLOOM_LEVELS = [
  {
    id: "remembering",
    name: "Prisiminimas / \u017Dinojimas",
    levelTier: 1,
    verbs: ["\u012Fvardyti", "atpa\u017Einti", "apibr\u0117\u017Eti", "i\u0161vardyti", "pakartoti", "apra\u0161yti"],
    description: "Fakt\u0173, termin\u0173, s\u0105vok\u0173 ir d\u0117sni\u0173 atgaminimas i\u0161 atminties."
  },
  {
    id: "understanding",
    name: "Supratimas",
    levelTier: 2,
    verbs: ["paai\u0161kinti", "interpretuoti", "apibendrinti", "klasifikuoti", "palyginti", "perfrazuoti"],
    description: "Prasm\u0117s supratimas, id\u0117j\u0173 ai\u0161kinimas savais \u017Eod\u017Eiais."
  },
  {
    id: "applying",
    name: "Taikymas",
    levelTier: 3,
    verbs: ["pritaikyti", "i\u0161spr\u0119sti", "pademonstruoti", "\u012Fgyvendinti", "atlikti", "panaudoti"],
    description: "\u017Dini\u0173 ir taisykli\u0173 naudojimas naujose ar praktin\u0117se situacijose."
  },
  {
    id: "analyzing",
    name: "Analiz\u0117",
    levelTier: 4,
    verbs: ["i\u0161analizuoti", "i\u0161skirti", "palyginti", "atskirti", "nustatyti prie\u017Eastis", "tirti"],
    description: "Informacijos skaidymas \u012F dalis, ry\u0161i\u0173 ir motyv\u0173 tyrin\u0117jimas."
  },
  {
    id: "evaluating",
    name: "Vertinimas",
    levelTier: 5,
    verbs: ["\u012Fvertinti", "pagr\u012Fsti", "argumentuoti", "kritikuoti", "padaryti i\u0161vadas", "\u012Fsivertinti"],
    description: "Sprendim\u0173, argument\u0173 ar rezultat\u0173 kokyb\u0117s vertinimas remiantis kriterijais."
  },
  {
    id: "creating",
    name: "K\u016Brimas",
    levelTier: 6,
    verbs: ["sukurti", "suprojektuoti", "sukonstruoti", "suformuluoti", "parengti", "i\u0161rasti"],
    description: "Element\u0173 sujungimas \u012F nauj\u0105 visum\u0105, originalaus produkto ar modelio k\u016Brimas."
  }
];

// src/smartGoalService.ts
function generateSmartGoalPedagogical(params) {
  const subject = params.subject?.trim() || "Bendrasis ugdymas";
  const topic = params.topic?.trim() || "Pamokos tema";
  const grade = params.grade?.trim() ? `${params.grade} klas\u0117` : "klas\u0117";
  const focus = params.focusMethod?.trim() ? ` naudojant ${params.focusMethod.toLowerCase()}` : "";
  const level = BLOOM_LEVELS.find((l) => l.id === params.bloomLevelId) || BLOOM_LEVELS[2];
  const verb = level.verbs[0] || "pritaikyti";
  const mainGoal = `Pamokos metu nagrin\u0117dami tem\u0105 \u201E${topic}\u201C (${subject}, ${grade}), mokiniai geb\u0117s ${verb} esminius d\u0117sningumus${focus} ir teisingai i\u0161spr\u0119sti bent 3 praktines u\u017Eduotis.`;
  return {
    mainGoal,
    bloomLevelName: `${level.name} (${level.levelTier} lygis)`,
    bloomVerb: verb,
    smartBreakdown: {
      specific: `Mokiniai nagrin\u0117ja tem\u0105 \u201E${topic}\u201C ir atlieka tikslines praktines veiklas.`,
      measurable: `Geb\u0117jimas pademonstruojamas atliekant 3 praktines u\u017Eduotis arba pateikiant argumentuot\u0105 atsakym\u0105.`,
      achievable: `U\u017Eduotys pritaikytos ${grade} mokini\u0173 pasiekim\u0173 lygiui su diferencijuota pagalba.`,
      relevant: `Ugdymo turinys atitinka atnaujintas bendr\u0105sias programas ir suteikia gyvenimi\u0161k\u0173 \u012Fg\u016Bd\u017Ei\u0173.`,
      timeBound: `Iki pamokos pabaigos (45 min.) su refleksija paskutin\u0117mis 5 min.`
    },
    differentiatedVariants: {
      struggling: `Slenkstinis lygis: Su mokytojo ar atmintin\u0117s pagalba atpa\u017Einti pagrindines s\u0105vokas i\u0161 temos \u201E${topic}\u201C ir atlikti bazin\u0119 praktin\u0119 u\u017Eduot\u012F.`,
      average: `Pagrindinis lygis: Savaranki\u0161kai ${verb} temos \u201E${topic}\u201C taisykles, atlikti standartines u\u017Eduotis ir paai\u0161kinti sprendimo eig\u0105 bendraklasiui.`,
      advanced: `Auk\u0161tesnysis lygis: K\u016Brybi\u0161kai pritaikyti temos \u201E${topic}\u201C \u017Einias nestandartin\u0117je situacijoje, suformuluoti problemin\u012F klausim\u0105 ir pagr\u012Fsti i\u0161vadas.`
    },
    successCriteria: [
      `Galiu savais \u017Eod\u017Eiais paai\u0161kinti temos \u201E${topic}\u201C esm\u0119.`,
      `Gebu savaranki\u0161kai atlikti skirt\u0105 praktin\u0119 u\u017Eduot\u012F be klaid\u0173.`,
      `Galiu \u012Fsivertinti savo pasiekimus pamokos pabaigoje ir paai\u0161kinti, kur tai pravers.`
    ]
  };
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var isProduction = process.env.NODE_ENV === "production";
app.use(express.json({ limit: "10mb" }));
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function cleanJsonString(str) {
  if (!str) return "";
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});
app.post("/api/generate-plan", async (req, res) => {
  const params = req.body;
  const {
    subject = "",
    grade = "",
    topic = "",
    lessonType = "",
    activities = "",
    goal = "",
    homeworkPurpose = "\u012Etvirtinti \u012Fg\u016Bd\u017Eius ir \u017Einias",
    evaluationCriteria = "",
    selectedEvaluations = [],
    selectedResources = [],
    selectedStudentLevels = ["pa\u017Eeng\u0119", "vidutiniai", "turintys sunkum\u0173"],
    classLearningNotes = "",
    realWorldNote = "",
    isIntegratedInput = false,
    integrationDetails = "",
    isOutsideInput = false,
    outsideLocation = "",
    outsideGoal = ""
  } = params;
  if (!grade || !subject || !topic) {
    return res.status(400).json({ error: "U\u017Epildykite privalomus laukus (dalykas, klas\u0117, tema)." });
  }
  const ai = getGeminiClient();
  if (ai) {
    try {
      const hasTeacherRequestedEvaluation = selectedEvaluations && selectedEvaluations.length > 0 || evaluationCriteria && evaluationCriteria.trim().length > 0;
      const hasTeacherClassNotes = classLearningNotes && classLearningNotes.trim().length > 0;
      const systemInstruction = `
Tu esi auk\u0161\u010Diausio lygio Lietuvos bendrojo ugdymo didaktikos ekspertas ir metodininkas, besiremiantis eMokykla.lt Bendrosiomis programomis (BP) ir \u0160MSM metodin\u0117mis rekomendacijomis.
Tavo tikslas \u2013 parengti gil\u0173, profesional\u0173, prakti\u0161k\u0105 pamokos plan\u0105 ir kokybi\u0161kus el. dienyno (\u201EMano dienynas\u201C, TAMO) \u012Fra\u0161us.
GRIE\u017DTAI VENGTI \u0160ABLONINI\u0172 IR SAUS\u0172 FRAZI\u0172 (\u201Eesmines s\u0105vokas ir taisykles\u201C, \u201Eatlikti nurodytus pratimus i\u0161 temos\u201C). Viskas turi b\u016Bti konkre\u010Diai pritaikyta nurodytam dalykui ir temai!
GRIE\u017DTAI NENAUDOK DVITA\u0160KI\u0172 TEKSTUOSE (vietoj j\u0173 naudok ta\u0161kus arba br\u016Bk\u0161nelius).

REIKALAVIMAI \u201EMANO DIENYNAS\u201C \u012ERA\u0160AMS PAGAL EMOKYKLA.LT METODIK\u0104 (eDiaryEntry):
1. topicClassworkExpectations (Standartizuota temos formuluot\u0117):
   - Jei neakademinis dalykas (Klas\u0117s vadovo veikla, Etika, Teatras, Gyvenimo \u012Fg\u016Bd\u017Eiai, Karjeros ugdymas ir pan.):
     Pabr\u0117\u017Eti ugdom\u0105j\u0105 vert\u0119 ir veikl\u0105. Formatas: \u201E[Dalykas]. [Tema]. Ugdomoji vert\u0117 ir mokymosi u\u017Edaviniai: [vertybinis ir socialinis tikslas]. Veikla: [konkreti praktin\u0117 veikla, diskusija, simuliacija ar susitarim\u0173 k\u016Brimas].\u201C
   - Jei akademinis dalykas:
     \u012Etraukti dalyk\u0105, tem\u0105 ir trump\u0105 apra\u0161ym\u0105, ko mokiniai i\u0161moks bei koki\u0105 veikl\u0105 atliks. Pavyzd\u017Eiui, pagal eMokykla rekomendacij\u0105: \u201EU\u017Esienio kalba (angl\u0173). Mokymasis u\u017Esisakyti maist\u0105 restorane, naudojant specifin\u012F \u017Eodyn\u0105 ir frazes. \u017Dinoti: [konkre\u010Dios temos terminai]. Geb\u0117ti: [konkretus veiksmas]. Taikyti: [konkretus taikymas/k\u016Brimas].\u201C
2. homework (Nam\u0173 darbai su ai\u0161kiu tikslu, s\u0105saja su tema ir be mokini\u0173 perkrovimo):
   - Ai\u0161kus tikslo nurodymas: \u201ETikslas \u2013 [\u012Ftvirtinti \u017Einias apie... / pasiruo\u0161ti diskusijai apie... / k\u016Brybi\u0161kai pritaikyti... / pabaigti klas\u0117s darb\u0105...]\u201C.
   - S\u0105saja su pamokos tema: pabr\u0117\u017Eti, kaip u\u017Eduotis t\u0119sia klas\u0117s veikl\u0105.
   - Konkreti u\u017Eduotis: nurodyti konkre\u010Di\u0105 u\u017Eduot\u012F (vengti vien abstrak\u010Di\u0173 pratim\u0173 numeri\u0173).
   - Optimali trukm\u0117: nurodyti rekomenduojam\u0105 trukm\u0119 (iki 15\u201320 min., kad mokiniai neb\u016Bt\u0173 perkraunami).
   - Jei pasirinkta \u201EBe nam\u0173 darb\u0173\u201C: \u201ENam\u0173 darbai neu\u017Eduoti (mokiniai visus tikslus pasiek\u0117 ir praktinius darbus atliko pamokos metu).\u201C
3. notes (Dienyno pastabos):
   - VISADA pateikti patarim\u0105, kuo \u0161i mokymo med\u017Eiaga naudinga realiame gyvenime (kasdienyb\u0117je, \u0161iuolaikiniame pasaulyje ar b\u016Bsimai profesijai).
   - TIK jei mokytojas nurod\u0117 vertinim\u0105: \u012Ftraukti \u201EPlanuojamas vertinimas: [metodai ir kriterijai]\u201C.
   - TIK jei mokytojas nurod\u0117 klas\u0117s mokymosi ypatumus: \u012Ftraukti \u201EKlas\u0117s mokymasis: [pasteb\u0117jimai]\u201C.
   - Jei mokytojas vertinimo ar klas\u0117s pastab\u0173 nenurod\u0117, pateikti tik gyvenimi\u0161ko pritaikymo patarim\u0105!

Atsakym\u0105 pateik grie\u017Etai JSON formatu pagal nurodyt\u0105 strukt\u016Br\u0105.
      `;
      const prompt = `
Sukurk pamokos plan\u0105 pagal atnaujintas BP ir eMokykla.lt rekomendacijas:
- Mokomasis dalykas. ${subject}
- Klas\u0117. ${grade}
- Pamokos tema. ${topic}
- Pamokos tipas. ${lessonType || "Standartin\u0117 / Mi\u0161ri"}
- Mokytojo numatytas tikslas. ${goal || "Parengti pagal Bloom taksonomij\u0105 ir SMART principus"}
- Mokytojo numatytos veiklos. ${activities || "Pasi\u016Blyti interaktyvias, aktyvaus ugdymo veiklas"}
- Nam\u0173 darb\u0173 tikslingumas. ${homeworkPurpose}
- Vertinimo kriterijai. ${evaluationCriteria || "Nenurodyta"}
- Pasirinkti vertinimo b\u016Bdai. ${selectedEvaluations.join(", ") || "Nenurodyta"}
- Klas\u0117s mokymosi ypatumai. ${classLearningNotes || "Standartinis klas\u0117s tempas"}
- Papildomas gyvenimi\u0161kas kontekstas. ${realWorldNote || "I\u0161pl\u0117toti pagal temos specifik\u0105"}
- Pasirinktos priemon\u0117s. ${selectedResources.join(", ") || "Vadov\u0117lis, interaktyvus ekranas, skaitmeniniai \u012Frankiai"}
- Mokini\u0173 pasiekim\u0173 lygiai klas\u0117je. ${selectedStudentLevels.join(", ")}
- Integruota pamoka. ${isIntegratedInput ? `Taip. Integruojama su. ${integrationDetails}.` : "Ne"}
- Pamoka u\u017E mokyklos rib\u0173. ${isOutsideInput ? `Taip. Vieta. ${outsideLocation}, Tikslas. ${outsideGoal}.` : "Ne"}

GRIE\u017DTAI NENAUDOK DVITA\u0160KI\u0172 TEKSTUOSE.
U\u017Epildyk eDiaryEntry laukus be \u0161ablonini\u0173 frazi\u0173, su konkre\u010Dia temos didaktika:
- topicClassworkExpectations
- homework
- notes
- realWorldUse
- assessmentNote
- classLearningNote
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });
      const raw = response.text || "";
      const cleaned = cleanJsonString(raw);
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === "object") {
        return res.json({ success: true, plan: parsed, mode: "ai" });
      }
    } catch (aiErr) {
      console.warn("Gemini API call failed, falling back to rich pedagogical template:", aiErr?.message || aiErr);
    }
  }
  const plan = buildPedagogicalPlan(params);
  return res.json({ success: true, plan, mode: "pedagogical_template" });
});
app.post("/api/generate-ideas", async (req, res) => {
  const { subject = "Bendrasis ugdymas", grade = "8 klas\u0117", topic = "Pamokos tema" } = req.body;
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Tu esi k\u016Brybingas didaktikos inovatorius. Pasi\u016Blyk 3 I\u0160SKIRTINES, NETIK\u0116TAS IR GYVAS id\u0117jas bei metodus pamokai.
Dalykas. ${subject}, Klas\u0117. ${grade}, Tema. ${topic}.
Pasi\u016Blyk.
1. Netik\u0117t\u0105 \u017Eaidybin\u012F ar simuliacin\u012F metod\u0105.
2. STEAM ar k\u016Brybin\u012F projektin\u012F i\u0161\u0161\u016Bk\u012F.
3. K\u016Brybi\u0161k\u0105 greito \u012Fsivertinimo ar refleksijos format\u0105.
GRIE\u017DTAI NENAUDOK DVITA\u0160KI\u0172 TEKSTUOSE. Kiekvien\u0105 id\u0117j\u0105 apra\u0161yk su ai\u0161kia instrukcija mokytojui (2-3 sakiniai).
Atsakym\u0105 pateik JSON formatu. { "ideas": ["...", "...", "..."] }`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(cleanJsonString(response.text || ""));
      if (parsed && Array.isArray(parsed.ideas)) {
        return res.json({ success: true, ideas: parsed.ideas, mode: "ai" });
      }
    } catch (err) {
      console.warn("AI ideas failed, fallback to pedagogical ideas:", err?.message || err);
    }
  }
  const fallbackIdeas = [
    `K\u016Brybinis i\u0161\u0161\u016Bkis \u201ETemos detektyvai\u201C. Mokiniai gauna paslapting\u0105 vok\u0105 su u\u017Euominomis apie tem\u0105 \u201E${topic}\u201C ir per 5 min. porose turi i\u0161\u0161ifruoti pagrindin\u012F d\u0117sningum\u0105.`,
    `STEAM ir tarpdalykin\u0117 simuliacija. Sukurti trump\u0105 radijo ar tinklalaid\u0117s (podcast) interviu (1 min.), kur vienas mokinys kalbina \u201Eekspert\u0105\u201C apie temos \u201E${topic}\u201C pritaikym\u0105 \u0161iuolaikiniame pasaulyje.`,
    `Mini \u017Eaidimas \u201EKar\u0161toji k\u0117d\u0117\u201C. Vienas savanoris mokinys atsis\u0117da prie\u0161 klas\u0119 ir per 2 min. turi atsakyti \u012F 5 bendraklasi\u0173 klausimus apie tem\u0105 \u201E${topic}\u201C.`
  ];
  return res.json({ success: true, ideas: fallbackIdeas, mode: "pedagogical_template" });
});
app.post("/api/generate-smart-goal", async (req, res) => {
  const params = req.body;
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Tu esi patyr\u0119s Lietuvos bendrojo ugdymo didaktikos ekspertas.
Sukurk profesional\u0173, pedagogi\u0161kai nepriekai\u0161ting\u0105 SMART pamokos u\u017Edavin\u012F / tiksl\u0105.
PAMOKOS DUOMENYS.
- Mokomasis dalykas. ${params.subject || "Bendrasis ugdymas"}
- Pamokos tema. ${params.topic || "Pamokos tema"}
- Klas\u0117. ${params.grade || "Klas\u0117"}
- Pageidaujamas Bloom lygis. ${params.bloomLevelId || "Taikymas"}
- Papildomas akcentas / metodas. ${params.focusMethod || "Standartinis"}

METODINIAI REIKALAVIMAI.
1. Formuluok pagal SMART princip\u0105 (Specific, Measurable, Achievable, Relevant, Time-bound).
2. GRIE\u017DTAI VENGTI DVITA\u0160KI\u0172 TEKSTUOSE (vietoj dvita\u0161ki\u0173 naudok ta\u0161kus arba br\u016Bk\u0161nelius).
3. Formuluok mokini\u0173 geb\u0117jim\u0173 kalba (\u201EMokiniai geb\u0117s...\u201C), o ne mokytojo veiklos kalba.
4. Pateik 3 diferencijuotas pakopas (slenkstinis mokinys, pagrindinis mokinys, auk\u0161tesnysis/pa\u017Eeng\u0119s mokinys).

Atsakym\u0105 pateik grie\u017Etai JSON formatu:
{
  "mainGoal": "Mokiniai geb\u0117s...",
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
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(cleanJsonString(response.text || ""));
      if (parsed && parsed.mainGoal) {
        return res.json({ success: true, result: parsed, mode: "ai" });
      }
    } catch (err) {
      console.warn("AI SMART goal failed, falling back to pedagogical template:", err?.message || err);
    }
  }
  const result = generateSmartGoalPedagogical(params);
  return res.json({ success: true, result, mode: "pedagogical_template" });
});
app.post("/api/generate-real-world-examples", async (req, res) => {
  const { subject = "", topic = "", grade = "" } = req.body;
  const ai = getGeminiClient();
  if (ai && topic) {
    try {
      const prompt = `Pateik 4 konkre\u010Dius realaus gyvenimo pritaikymo pavyzd\u017Eius \u0161iai pamokai pagal atnaujintas BP ir eMokykla.lt rekomendacijas:
Dalykas. ${subject}
Tema. ${topic}
Klas\u0117. ${grade}

Kategorijos:
1. daily (Kasdienyb\u0117 ir asmeniniai finansai / asmenin\u0117 patirtis)
2. career (\u0160iuolaikin\u0117s profesijos ir darbo rinka)
3. steam (Technologijos, inovacijos ir ateities \u012Fg\u016Bd\u017Eiai)
4. advice (Praktinis patarimas mokiniui: \u201EKam man to prireiks?\u201C)

Pateik atsakym\u0105 JSON masyvu:
[
  {
    "id": "rw-1",
    "category": "daily",
    "categoryTitle": "Kasdienis gyvenimas ir asmeniniai finansai",
    "categoryIcon": "\u{1F3E0}",
    "title": "...",
    "text": "...",
    "snippetForNotes": "Glausta fraz\u0117, tinkama \u012Fkelti tiesiai \u012F el. dienyno pastabas..."
  },
  ...
]
GRIE\u017DTAI NENAUDOK DVITA\u0160KI\u0172 TEKSTUOSE.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(cleanJsonString(response.text || ""));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ success: true, examples: parsed, mode: "ai" });
      }
    } catch (err) {
      console.warn("AI real-world examples failed, falling back to pedagogical generator:", err?.message || err);
    }
  }
  const examples = generateRealWorldExamples(subject, topic, grade);
  return res.json({ success: true, examples, mode: "pedagogical_template" });
});
app.post("/api/chat", async (req, res) => {
  const { messages = [], lessonContext = "" } = req.body;
  const ai = getGeminiClient();
  if (ai) {
    try {
      const systemInstruction = `Tu esi patyr\u0119s Lietuvos mokytoj\u0173 mentorius, didaktikos ir ugdymo metodininkas.
Atsakyk \u012F mokytojo klausimus ai\u0161kiai, \u0161iltai, kolegi\u0161kai ir profesionaliai.
Visada si\u016Blyk konkre\u010Dius didaktinius metodus, aktyvias u\u017Eduotis, diferencijavimo id\u0117jas pagal atnaujintas BP.
Pamokos kontekstas: ${lessonContext || "Bendrasis ugdymas"}.
Grie\u017Etai nenaudok dvita\u0161ki\u0173 tekstuose (vietoj j\u0173 naudok ta\u0161kus arba br\u016Bk\u0161nelius).`;
      const contents = messages.map((m) => ({
        role: m.role === "model" ? "model" : "user",
        parts: [{ text: m.text }]
      }));
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: { systemInstruction }
      });
      return res.json({ success: true, reply: response.text || "" });
    } catch (err) {
      console.warn("AI Chat failed, falling back to pedagogical guidance:", err?.message || err);
    }
  }
  const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || "";
  let reply = "Esu j\u016Bs\u0173 pedagoginis pagalbininkas! ";
  if (lastUserMsg.includes("metod") || lastUserMsg.includes("aktyv")) {
    reply += "\u0160iai pamokai rekomenduoju i\u0161bandyti \u201EEkspert\u0173 mozaikos\u201C (Jigsaw) arba \u201EM\u0105styk-Tarkis-Dalykis\u201C (Think-Pair-Share) metodus. Jie padeda \u012Ftraukti visus mokinius ir sukurti saugi\u0105 bendradarbiavimo atmosfer\u0105.";
  } else if (lastUserMsg.includes("vertin") || lastUserMsg.includes("refleksij")) {
    reply += "Pamokos apibendrinimui labai tinka refleksijos metodas \u201E3-2-1\u201C (3 dalykai, kuriuos i\u0161mokau; 2 klausimai, kurie kilo; 1 id\u0117ja praktikai) arba greitas \u012Fsivertinimas spalvotomis kortel\u0117mis (\u0160viesoforas).";
  } else if (lastUserMsg.includes("diferenc")) {
    reply += "Diferencijuodami u\u017Eduotis skirstykite \u012F 3 lygius: slenkstiniam lygiui pateikite \u017Eingsnin\u0119 atram\u0105 (algoritm\u0105), pagrindiniam \u2013 standartines praktines situacijas porose, o auk\u0161tesniajam \u2013 k\u016Brybin\u012F u\u017Edavin\u012F ar bendraklasi\u0173 mentoryst\u0119.";
  } else {
    reply += "Kuo dar gal\u0117\u010Diau pad\u0117ti tobulinant \u0161ios pamokos plan\u0105, parenkant metodus ar diferencijuojant u\u017Eduotis?";
  }
  return res.json({ success: true, reply });
});
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} (mode: ${isProduction ? "production" : "development"})`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
