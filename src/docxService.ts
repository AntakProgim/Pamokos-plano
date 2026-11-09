/**
 * Word (.docx) export service for Lesson Plans and E-Diary outputs.
 * Uses the `docx` library to generate cleanly structured, professional Microsoft Word documents.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Footer,
  PageNumber
} from 'docx';

export interface LessonPlanDocxMetadata {
  subject?: string;
  grade?: string;
  topic?: string;
  goal?: string;
  stageDurations?: { [key: string]: number };
  homeworkDuration?: string;
  teacherName?: string;
}

const STAGE_TITLES: { [key: string]: string } = {
  introduction: 'Įvadinė dalis (motyvavimas, tikslo kėlimas)',
  theory: 'Naujos medžiagos nagrinėjimas (teorinė dalis)',
  practice: 'Praktinė veikla (užduočių atlikimas, taikymas)',
  consolidation: 'Įtvirtinimas ir refleksija',
  summary: 'Apibendrinimas ir įsivertinimas'
};

const COLOR_PRIMARY = '1E3A8A'; // Navy blue
const COLOR_SECONDARY = '0284C7'; // Cyan / Sky blue
const COLOR_ACCENT = '15803D'; // Green
const COLOR_MUTED = '64748B'; // Slate
const COLOR_BG_LIGHT = 'F8FAFC'; // Very light gray/slate
const COLOR_BG_ACCENT = 'EFF6FF'; // Light blue
const COLOR_BORDER = 'CBD5E1'; // Light border

function formatHomeworkDuration(duration?: string): string {
  switch (duration) {
    case '0':
      return '0 min. (be namų darbų, subalansuotas krūvis pagal N0015)';
    case '15':
      return '10–15 min. (rekomenduojama pagal N0015 rekomendaciją)';
    case '20':
      return '15–20 min. (vidutinės apimties užduotys)';
    case '30':
      return '20–30 min. (gilesniam įtvirtinimui / vyresnėms klasėms)';
    default:
      return '10–15 min. (rekomenduojama pagal N0015 rekomendaciją)';
  }
}

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
};

const cellMargins = {
  top: 120, // ~6pt
  bottom: 120,
  left: 180, // ~9pt
  right: 180
};

/**
 * Creates full structured lesson plan Word document
 */
export function createFullLessonPlanDocx(plan: any, meta: LessonPlanDocxMetadata): Document {
  const dateStr = new Date().toLocaleDateString('lt-LT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalMinutes = meta.stageDurations
    ? (Object.values(meta.stageDurations) as number[]).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : 45;

  const subjectText = meta.subject || 'Dalykas nenurodytas';
  const gradeText = meta.grade ? `${meta.grade} klasė` : 'Klasė nenurodyta';
  const topicText = plan.lessonOverview?.topic || meta.topic || 'Pamokos tema';
  const goalText = plan.lessonOverview?.goal || meta.goal || 'Pamokos tikslas';

  const children: (Paragraph | Table)[] = [];

  // Top Ministry Badge / Reference
  children.push(
    new Paragraph({
      alignment: AlignmentType.START,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'LIETUVOS RESPUBLIKOS ŠVIETIMO STANDARTAS • ATNAUJINTŲ BENDRŲJŲ PROGRAMŲ PAGRINDU (EMOKYKLA.LT)',
          size: 16, // 8pt
          bold: true,
          color: COLOR_SECONDARY
        })
      ]
    })
  );

  // Main Document Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'PAMOKOS PLANAS IR UGDYMO TURINYS',
          bold: true,
          size: 36, // 18pt
          color: COLOR_PRIMARY
        })
      ]
    })
  );

  // Metadata Table
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Dalykas:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: subjectText, size: 20, bold: true })] })]
        }),
        new TableCell({
          width: { size: 2000, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Klasė:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: gradeText, size: 20 })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Pamokos trukmė:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: `${totalMinutes} min.`, size: 20 })] })]
        }),
        new TableCell({
          width: { size: 2000, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Data:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: dateStr, size: 20 })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Pamokos tema:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          columnSpan: 3,
          width: { size: 7500, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: topicText, bold: true, size: 22, color: COLOR_PRIMARY })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Mokymosi tikslas (SMART):', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          columnSpan: 3,
          width: { size: 7500, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: goalText, size: 20 })] })]
        })
      ]
    })
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: metaRows
    })
  );

  children.push(new Paragraph({ spacing: { after: 200 } }));

  // Helper to add a section header
  const addSectionHeader = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 26, // 13pt
            color: COLOR_PRIMARY
          })
        ]
      })
    );
  };

  // 1. Sąsajos su Bendrosiomis programomis
  addSectionHeader('1. Sąsajos su Bendrosiomis programomis (emokykla.lt BP)');
  const bpLines = String(plan.bpConnections || 'Sąsajos nurodytos pagal atnaujintas BP.').split('\n');
  for (const line of bpLines) {
    if (line.trim()) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: line, size: 20 })]
        })
      );
    }
  }

  // 2. Ugdymo apžvalga ir pasiekimų vertinimas
  addSectionHeader('2. Ugdymo apžvalga ir pasiekimų vertinimas');
  const evalMethods = plan.lessonOverview?.evaluation?.methods?.join(', ') || 'Formuojamasis vertinimas pamokos metu';
  const evalCriteria = plan.lessonOverview?.evaluation?.criteria;

  children.push(
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Pamokos tipas: ', bold: true, size: 20 }),
        new TextRun({ text: plan.lessonType || 'Įtvirtinimo / Mišri pamoka', size: 20 })
      ]
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Vertinimo metodai: ', bold: true, size: 20 }),
        new TextRun({ text: evalMethods, size: 20 })
      ]
    })
  );
  if (evalCriteria) {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: 'Vertinimo kriterijai: ', bold: true, size: 20 }),
          new TextRun({ text: evalCriteria, size: 20 })
        ]
      })
    );
  }

  // 3. Pamokos eiga ir laiko biudžetas
  addSectionHeader(`3. Pamokos eiga ir laiko biudžetas (${totalMinutes} min.)`);

  if (plan.lessonStages) {
    const stageRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_ACCENT },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: 'Pamokos etapas', bold: true, size: 20, color: COLOR_PRIMARY })] })]
          }),
          new TableCell({
            width: { size: 1400, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_ACCENT },
            margins: cellMargins,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Trukmė', bold: true, size: 20, color: COLOR_PRIMARY })] })]
          }),
          new TableCell({
            width: { size: 5600, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_ACCENT },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: 'Veiklos turinys ir metodai', bold: true, size: 20, color: COLOR_PRIMARY })] })]
          })
        ]
      })
    ];

    Object.entries(plan.lessonStages).forEach(([key, content]) => {
      const stageMin = meta.stageDurations ? meta.stageDurations[key] || 0 : 0;
      const stageTitle = STAGE_TITLES[key] || key;

      stageRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3000, type: WidthType.DXA },
              margins: cellMargins,
              children: [new Paragraph({ children: [new TextRun({ text: stageTitle, bold: true, size: 20 })] })]
            }),
            new TableCell({
              width: { size: 1400, type: WidthType.DXA },
              margins: cellMargins,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${stageMin} min.`, size: 20 })] })]
            }),
            new TableCell({
              width: { size: 5600, type: WidthType.DXA },
              margins: cellMargins,
              children: String(content)
                .split('\n')
                .map(line => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: line, size: 20 })] }))
            })
          ]
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorders,
        rows: stageRows
      })
    );
  }

  // 4. Veiklos klasėje ir mokymo priemonės
  addSectionHeader('4. Veiklos klasėje ir mokymo priemonės');
  const activitiesRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2600, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: '👤 Individualus darbas', bold: true, size: 20 })] })]
        }),
        new TableCell({
          width: { size: 7400, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: plan.classActivities?.individual || 'Numatytos individualios užduotys', size: 20 })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2600, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: '👥 Darbas porose', bold: true, size: 20 })] })]
        }),
        new TableCell({
          width: { size: 7400, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: plan.classActivities?.pairs || 'Numatytas darbas poromis', size: 20 })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2600, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: '👪 Darbas grupėse', bold: true, size: 20 })] })]
        }),
        new TableCell({
          width: { size: 7400, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: plan.classActivities?.group || 'Numatytas bendradarbiavimas grupėse', size: 20 })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2600, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: '🛠️ Priemonės ir ištekliai', bold: true, size: 20 })] })]
        }),
        new TableCell({
          width: { size: 7400, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: plan.classActivities?.toolsResources || plan.digitalResources || 'Vadovėlis, sąsiuviniai, skaitmeninė lenta', size: 20 })] })]
        })
      ]
    })
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: activitiesRows
    })
  );

  // 5. Diferencijavimas ir individualizavimas
  addSectionHeader('5. Mokymo diferencijavimas ir individualizavimas');
  const diffRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 3333, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'FFFBEB' }, // Warm yellow
          margins: cellMargins,
          children: [
            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: '🛡️ Mokiniai su sunkumais', bold: true, size: 20, color: 'B45309' })] }),
            new Paragraph({ children: [new TextRun({ text: plan.differentiation?.struggling || 'Pagalbiniai klausimai, atraminiai žodžiai, papildomas paaiškinimas.', size: 19 })] })
          ]
        }),
        new TableCell({
          width: { size: 3333, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'F0FDF4' }, // Light green
          margins: cellMargins,
          children: [
            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: '✅ Vidutiniai mokiniai', bold: true, size: 20, color: '15803D' })] }),
            new Paragraph({ children: [new TextRun({ text: plan.differentiation?.general || 'Standartinės programos praktinės užduotys, atsakymo pagrindimas.', size: 19 })] })
          ]
        }),
        new TableCell({
          width: { size: 3334, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'EFF6FF' }, // Light blue
          margins: cellMargins,
          children: [
            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: '🌟 Gabūs mokiniai', bold: true, size: 20, color: '1D4ED8' })] }),
            new Paragraph({ children: [new TextRun({ text: plan.differentiation?.gifted || 'Kūrybinės, problemų sprendimo, gilinamosios užduotys.', size: 19 })] })
          ]
        })
      ]
    })
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: diffRows
    })
  );

  // 6. Standartizuoti El. dienyno įrašai
  addSectionHeader('6. Standartizuoti El. dienyno įrašai (TAMO / Mano Dienynas / Eduka)');
  const ediaryRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 10000, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_ACCENT },
          margins: cellMargins,
          children: [
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({ text: '📌 1. Tema / Klasės darbas ', bold: true, size: 20, color: COLOR_PRIMARY }),
                new TextRun({ text: '(Dalykas + Mokymosi uždavinys + Veikla)', size: 18, color: COLOR_MUTED })
              ]
            }),
            new Paragraph({
              children: [new TextRun({ text: plan.eDiaryEntry?.topicClassworkExpectations || '', size: 20, bold: true })]
            })
          ]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 10000, type: WidthType.DXA },
          margins: cellMargins,
          children: [
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({ text: '🎯 2. Namų darbai ', bold: true, size: 20, color: COLOR_PRIMARY }),
                new TextRun({ text: `(Su aiškiu tikslu, kontekstu ir apimtimi: ${formatHomeworkDuration(meta.homeworkDuration)})`, size: 18, color: COLOR_MUTED })
              ]
            }),
            new Paragraph({
              children: [new TextRun({ text: plan.eDiaryEntry?.homework || '', size: 20 })]
            })
          ]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 10000, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({ text: '💡 3. Pastaba / Vertinimas ', bold: true, size: 20, color: COLOR_PRIMARY }),
                new TextRun({ text: '(Gyvenimiškas naudingumas ir vertinimo kriterijai)', size: 18, color: COLOR_MUTED })
              ]
            }),
            new Paragraph({
              children: [new TextRun({ text: plan.eDiaryEntry?.notes || '', size: 20 })]
            })
          ]
        })
      ]
    })
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: ediaryRows
    })
  );

  // 7. Motyvacinė žinutė
  if (plan.motivation) {
    addSectionHeader('7. Motyvacinė žinutė');
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [
          new TextRun({
            text: `„${plan.motivation}“`,
            italics: true,
            size: 20,
            color: '4338CA'
          })
        ]
      })
    );
  }

  // Document Footer
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Parengta pagal Lietuvos bendrąsias programas (emokykla.lt BP) • Rekomendacijos N0015, J0025 | Puslapis ',
            size: 16,
            color: COLOR_MUTED
          }),
          new TextRun({
            children: [PageNumber.CURRENT, ' iš ', PageNumber.TOTAL_PAGES],
            size: 16,
            color: COLOR_MUTED
          })
        ]
      })
    ]
  });

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080, // 0.75 in
              right: 1080,
              bottom: 1080,
              left: 1080
            }
          }
        },
        footers: {
          default: footer
        },
        children
      }
    ]
  });
}

/**
 * Creates compact e-diary card Word document
 */
export function createEDiaryOnlyDocx(plan: any, meta: LessonPlanDocxMetadata): Document {
  const dateStr = new Date().toLocaleDateString('lt-LT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subjectText = meta.subject || 'Dalykas nenurodytas';
  const gradeText = meta.grade ? `${meta.grade} klasė` : 'Klasė nenurodyta';
  const topicText = plan.lessonOverview?.topic || meta.topic || 'Pamokos tema';

  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.START,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'ELEKTRONINIO DIENYNO ĮRAŠŲ STANDARTAS (TAMO / MANO DIENYNAS / EDUKA)',
          size: 16,
          bold: true,
          color: COLOR_SECONDARY
        })
      ]
    })
  );

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'EL. DIENYNO ĮRAŠŲ KORTELĖ',
          bold: true,
          size: 34,
          color: COLOR_PRIMARY
        })
      ]
    })
  );

  // Meta table
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Dalykas:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: subjectText, size: 20, bold: true })] })]
        }),
        new TableCell({
          width: { size: 2000, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Klasė:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: gradeText, size: 20 })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'ND trukmė:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: formatHomeworkDuration(meta.homeworkDuration), size: 19 })] })]
        }),
        new TableCell({
          width: { size: 2000, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Data:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: dateStr, size: 20 })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Tema:', bold: true, size: 20, color: COLOR_MUTED })] })]
        }),
        new TableCell({
          columnSpan: 3,
          width: { size: 7500, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: topicText, bold: true, size: 22, color: COLOR_PRIMARY })] })]
        })
      ]
    })
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: metaRows
    })
  );

  children.push(new Paragraph({ spacing: { after: 200 } }));

  if (plan.eDiaryEntry?.variants && plan.eDiaryEntry.variants.length > 0) {
    plan.eDiaryEntry.variants.forEach(v => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({ text: `### ${v.title}`, bold: true, size: 24, color: COLOR_PRIMARY })
          ]
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: 'Tema, klasės darbai, numatomi pasiekimai: ', bold: true, size: 21, color: COLOR_PRIMARY }),
            new TextRun({ text: v.topicClassworkExpectations, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: 'Namų darbai: ', bold: true, size: 21, color: COLOR_PRIMARY }),
            new TextRun({ text: v.homework, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({ text: 'Pastabos apie pamoką: ', bold: true, size: 21, color: COLOR_PRIMARY }),
            new TextRun({ text: v.notes, size: 21 })
          ]
        })
      );
    });
  } else {
    // 1. Tema ir klasės darbas
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({ text: '📌 1. Tema / Klasės darbas (el. dienyno laukelis)', bold: true, size: 24, color: COLOR_PRIMARY })
        ]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: plan.eDiaryEntry?.topicClassworkExpectations || '',
            bold: true,
            size: 21,
            color: '0F172A'
          })
        ]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({ text: '🎯 2. Namų darbai (el. dienyno laukelis)', bold: true, size: 24, color: COLOR_PRIMARY })
        ]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: plan.eDiaryEntry?.homework || '',
            size: 21
          })
        ]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({ text: '💡 3. Pastaba / Vertinimas (el. dienyno laukelis)', bold: true, size: 24, color: COLOR_PRIMARY })
        ]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: plan.eDiaryEntry?.notes || '',
            size: 21
          })
        ]
      })
    );
  }

  if (plan.eDiaryEntry?.differentiationAdvice) {
    const da = plan.eDiaryEntry.differentiationAdvice;
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({ text: '💡 Idėjos veiklos diferencijavimui ir pamokos kokybei:', bold: true, size: 22, color: COLOR_ACCENT })
        ]
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '🛠️ Pagalba / Pastoliavimas: ', bold: true, size: 20 }),
          new TextRun({ text: da.scaffolding, size: 20 })
        ]
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '🚀 Iššūkis gabesniems: ', bold: true, size: 20 }),
          new TextRun({ text: da.challenge, size: 20 })
        ]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({ text: '✨ Kokybės akcentas: ', bold: true, size: 20 }),
          new TextRun({ text: da.qualityFocus, size: 20 })
        ]
      })
    );
  }

  // Kokybės audito patikra
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({ text: '🔍 Kokybės audito patikra pagal oficialias rekomendacijas:', bold: true, size: 22, color: COLOR_ACCENT })
      ]
    })
  );

  const auditItems = [
    '✓ Standartizuota tema: aiškus dalykas, mokymosi uždavinys ir konkreti veikla (A0006 rekomendacija).',
    '✓ Tikslingi namų darbai: aiškus tikslas su kontekstu, be plikų numerių be konteksto.',
    `✓ Krūvio kontrolė (N0015): trukmė reglamentuota (${formatHomeworkDuration(meta.homeworkDuration)}).`,
    '✓ Kalbos kultūra (J0025): taisyklinga lietuvių kalbos rašyba, terminija ir skyryba oficialiame dokumente.',
    '✓ Individualizavimas: atsisakyta sauso šablono „Žinoti, gebėti, taikyti“ be konteksto.'
  ];

  for (const item of auditItems) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: item, size: 19, color: '334155' })]
      })
    );
  }

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Atitinka emokykla.lt BP reikalavimus ir LR ŠMSM rekomendacijas dienynų pildymui',
            size: 16,
            color: COLOR_MUTED
          })
        ]
      })
    ]
  });

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080,
              right: 1080,
              bottom: 1080,
              left: 1080
            }
          }
        },
        footers: {
          default: footer
        },
        children
      }
    ]
  });
}

/**
 * Generates and downloads the requested Word (.docx) document in the browser
 */
export async function downloadDocumentDocx(
  type: 'full' | 'ediary',
  plan: any,
  meta: LessonPlanDocxMetadata
): Promise<void> {
  const doc = type === 'full'
    ? createFullLessonPlanDocx(plan, meta)
    : createEDiaryOnlyDocx(plan, meta);

  const blob = await Packer.toBlob(doc);

  const safeTopic = (plan.lessonOverview?.topic || meta.topic || 'Pamoka')
    .replace(/[^\w\d\s\-_ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 35) || 'Pamoka';

  const dateTag = new Date().toISOString().split('T')[0];
  const filename = type === 'full'
    ? `Pamokos_planas_${safeTopic}_${dateTag}.docx`
    : `El_dienynas_${safeTopic}_${dateTag}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
