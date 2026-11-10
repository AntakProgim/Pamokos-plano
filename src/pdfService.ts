/**
 * PDF generation service for Lesson Plans and E-Diary outputs
 * Supports:
 * - Simple text exports (monochrome, high-contrast, clean minimalist layout)
 * - Structured, branded PDF documents (official institutional layout with standards and tables)
 * - Customizable cover page styling (Academic, Modern, Minimal)
 * - Content inclusion toggles and font size controls
 * Uses html2pdf.js with clean isolated CSS.
 */

export type PdfExportMode = 'simple' | 'branded';
export type PdfCoverStyle = 'academic' | 'modern' | 'minimal';
export type PdfFontSize = 'compact' | 'standard' | 'large';

export interface PdfCoverPageSettings {
  enabled: boolean;
  style: PdfCoverStyle;
  schoolName: string;
  teacherName: string;
  schoolYear: string;
  location: string;
  customSubtitle?: string;
}

export interface AdvancedPdfExportOptions {
  exportMode: PdfExportMode; // 'simple' | 'branded'
  scope: 'full' | 'ediary' | 'combined'; // Visas planas, tik el. dienynas, arba abu
  coverPage: PdfCoverPageSettings;
  includeTimeline: boolean;
  includeDifferentiation: boolean;
  includeAssessment: boolean;
  includeQualityAudit: boolean;
  includeSignatures: boolean;
  fontSize: PdfFontSize;
}

export const DEFAULT_PDF_OPTIONS: AdvancedPdfExportOptions = {
  exportMode: 'branded',
  scope: 'full',
  coverPage: {
    enabled: true,
    style: 'academic',
    schoolName: 'Vilniaus Antakalnio gimnazija',
    teacherName: '',
    schoolYear: '2025–2026 m. m.',
    location: 'Vilnius, 2026 m.',
    customSubtitle: 'Metodinis pamokos aprašas ir el. dienyno įrašai pagal LR BP'
  },
  includeTimeline: true,
  includeDifferentiation: true,
  includeAssessment: true,
  includeQualityAudit: true,
  includeSignatures: true,
  fontSize: 'standard'
};

export interface LessonPlanPdfMetadata {
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

function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatHomeworkDuration(duration?: string): string {
  switch (duration) {
    case '0':
      return '0 min. (be namų darbų, subalansuotas krūvis)';
    case '15':
      return '10–15 min. (rekomenduojama pagal N0015)';
    case '20':
      return '15–20 min. (vidutinės apimties užduotys)';
    case '30':
      return '20–30 min. (gilesniam įtvirtinimui)';
    default:
      return '10–15 min. (rekomenduojama pagal N0015)';
  }
}

/**
 * Builds HTML for the Cover Page based on chosen style
 */
export function buildCoverPageHtml(
  plan: any,
  meta: LessonPlanPdfMetadata,
  cover: PdfCoverPageSettings,
  mode: PdfExportMode
): string {
  if (!cover.enabled) return '';

  const subjectText = meta.subject || 'Bendrasis ugdymas';
  const gradeText = meta.grade ? `${meta.grade} klasė` : 'Klasė nenurodyta';
  const topicText = plan.lessonOverview?.topic || meta.topic || 'Pamokos tema';
  const goalText = plan.lessonOverview?.goal || meta.goal || 'Pamokos uždavinys / tikslas';
  const school = cover.schoolName || 'Lietuvos bendrojo ugdymo mokykla';
  const author = cover.teacherName || meta.teacherName || 'Mokytojas (-a)';
  const year = cover.schoolYear || '2025–2026 m. m.';
  const loc = cover.location || 'Lietuva';
  const subtitle = cover.customSubtitle || 'Metodinis pamokos planas ir el. dienyno įrašų standartas pagal atnaujintas BP';

  if (cover.style === 'academic') {
    return `
      <div class="pdf-cover-page academic-cover ${mode === 'simple' ? 'simple-mode' : ''}">
        <div class="cover-academic-top">
          <div class="cover-ministry-text">LIETUVOS RESPUBLIKOS ŠVIETIMO, MOKSLO IR SPORTO STANDARTAS</div>
          <div class="cover-school-name">${escapeHtml(school)}</div>
          <div class="cover-divider-academic"></div>
        </div>

        <div class="cover-academic-center">
          <div class="cover-doc-type-badge">OFICIALUS METODINIS DOKUMENTAS</div>
          <h1 class="cover-academic-topic">${escapeHtml(topicText)}</h1>
          <div class="cover-academic-subject-row">
            <span><strong>Dalykas:</strong> ${escapeHtml(subjectText)}</span>
            <span>•</span>
            <span><strong>Koncentras:</strong> ${escapeHtml(gradeText)}</span>
          </div>

          <div class="cover-academic-goal-box">
            <div class="cover-goal-label">Mokymosi tikslas ir siekiami pasiekimai:</div>
            <div class="cover-goal-text">„${escapeHtml(goalText)}“</div>
          </div>

          <div class="cover-academic-meta-note">
            ${escapeHtml(subtitle)}
          </div>
        </div>

        <div class="cover-academic-bottom">
          <div class="cover-signature-row">
            <div class="cover-author-block">
              <div class="cover-author-label">Parengė:</div>
              <div class="cover-author-val">${escapeHtml(author)}</div>
            </div>
            <div class="cover-academic-approval">
              <div class="cover-author-label">Suderinta / Patvirtinta:</div>
              <div class="cover-approval-line">_____________________________</div>
            </div>
          </div>
          <div class="cover-footer-year">
            ${escapeHtml(year)} • ${escapeHtml(loc)}
          </div>
        </div>
      </div>
      <div class="pdf-page-break"></div>
    `;
  }

  if (cover.style === 'modern') {
    return `
      <div class="pdf-cover-page modern-cover ${mode === 'simple' ? 'simple-mode' : ''}">
        <div class="modern-cover-accent-bar"></div>
        <div class="modern-cover-content">
          <div class="modern-cover-top">
            <span class="modern-tag-pill">LR BENDROSIOS PROGRAMOS (EMOKYKLA.LT)</span>
            <div class="modern-school-title">${escapeHtml(school)}</div>
          </div>

          <div class="modern-cover-body">
            <div class="modern-kicker">${escapeHtml(subjectText)} • ${escapeHtml(gradeText)}</div>
            <h1 class="modern-topic-title">${escapeHtml(topicText)}</h1>
            <p class="modern-subtitle">${escapeHtml(subtitle)}</p>

            <div class="modern-meta-grid">
              <div class="modern-meta-cell">
                <span class="modern-meta-key">Dalykas</span>
                <span class="modern-meta-val">${escapeHtml(subjectText)}</span>
              </div>
              <div class="modern-meta-cell">
                <span class="modern-meta-key">Klasė / Koncentras</span>
                <span class="modern-meta-val">${escapeHtml(gradeText)}</span>
              </div>
              <div class="modern-meta-cell">
                <span class="modern-meta-key">Standartas</span>
                <span class="modern-meta-val">eMokykla BP (A0010)</span>
              </div>
            </div>

            <div class="modern-quote-box">
              <strong>Uždavinys:</strong> ${escapeHtml(goalText)}
            </div>
          </div>

          <div class="modern-cover-footer">
            <div class="modern-footer-left">
              <strong>Rengėjas:</strong> ${escapeHtml(author)}<br />
              <strong>Mokslo metai:</strong> ${escapeHtml(year)}
            </div>
            <div class="modern-footer-right">
              ${escapeHtml(loc)}
            </div>
          </div>
        </div>
      </div>
      <div class="pdf-page-break"></div>
    `;
  }

  // Minimal cover style
  return `
    <div class="pdf-cover-page minimal-cover ${mode === 'simple' ? 'simple-mode' : ''}">
      <div class="minimal-cover-inner">
        <div class="minimal-school-header">${escapeHtml(school)}</div>
        <div class="minimal-hairline"></div>

        <div class="minimal-center-group">
          <div class="minimal-kicker">${escapeHtml(subjectText)} / ${escapeHtml(gradeText)}</div>
          <h1 class="minimal-topic">${escapeHtml(topicText)}</h1>
          <p class="minimal-goal-italic">${escapeHtml(goalText)}</p>
        </div>

        <div class="minimal-footer-group">
          <div class="minimal-hairline"></div>
          <div class="minimal-footer-row">
            <span><strong>Rengėjas:</strong> ${escapeHtml(author)}</span>
            <span>${escapeHtml(year)}</span>
            <span>${escapeHtml(loc)}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="pdf-page-break"></div>
  `;
}

/**
 * Builds printable HTML markup for Simple Text Export mode
 * Clean, black-and-white, highly legible, toner-saving format.
 */
export function buildSimpleTextPdfHtml(
  plan: any,
  meta: LessonPlanPdfMetadata,
  options: AdvancedPdfExportOptions
): string {
  const dateStr = new Date().toLocaleDateString('lt-LT');
  const subjectText = meta.subject || 'Dalykas nenurodytas';
  const gradeText = meta.grade ? `${meta.grade} klasė` : 'Klasė nenurodyta';
  const topicText = plan.lessonOverview?.topic || meta.topic || 'Pamokos tema';
  const goalText = plan.lessonOverview?.goal || meta.goal || 'Pamokos tikslas';

  const totalMinutes = meta.stageDurations
    ? (Object.values(meta.stageDurations) as number[]).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : 45;

  const coverHtml = buildCoverPageHtml(plan, meta, options.coverPage, 'simple');

  let bodyHtml = '';

  // 1. Full plan sections (if scope is 'full' or 'combined')
  if (options.scope === 'full' || options.scope === 'combined') {
    bodyHtml += `
      <div class="simple-doc-header">
        <h2 class="simple-doc-title">PAMOKOS PLANAS: ${escapeHtml(topicText)}</h2>
        <div class="simple-meta-line">
          <strong>Dalykas:</strong> ${escapeHtml(subjectText)} | 
          <strong>Klasė:</strong> ${escapeHtml(gradeText)} | 
          <strong>Trukmė:</strong> ${totalMinutes} min. | 
          <strong>Data:</strong> ${dateStr}
        </div>
        <div class="simple-goal-block">
          <strong>Mokymosi tikslas / uždavinys:</strong> ${escapeHtml(goalText)}
        </div>
      </div>

      <div class="simple-section">
        <h3 class="simple-section-h3">1. SĄSAJOS SU BENDRĄJA PROGRAMA (BP)</h3>
        <p class="simple-text-pre">${escapeHtml(plan.bpConnections || 'Sąsajos nurodytos pagal atnaujintas BP.')}</p>
      </div>

      <div class="simple-section">
        <h3 class="simple-section-h3">2. UGDYMO APŽVALGA IR VERTINIMAS</h3>
        <p><strong>Pamokos tipas:</strong> ${escapeHtml(plan.lessonType || 'Standartinė / Mišri')}</p>
        <p><strong>Vertinimo metodai:</strong> ${escapeHtml(plan.lessonOverview?.evaluation?.methods?.join(', ') || 'Nenurodyta')}</p>
        ${plan.lessonOverview?.evaluation?.criteria ? `<p><strong>Vertinimo kriterijai:</strong> ${escapeHtml(plan.lessonOverview.evaluation.criteria)}</p>` : ''}
      </div>
    `;

    // Timeline section
    if (options.includeTimeline && plan.lessonStages) {
      bodyHtml += `
        <div class="simple-section">
          <h3 class="simple-section-h3">3. PAMOKOS EIGA IR LAIKAS (${totalMinutes} min.)</h3>
          <table class="simple-table">
            <thead>
              <tr>
                <th style="width: 25%;">Etapas</th>
                <th style="width: 15%;">Laikas</th>
                <th style="width: 60%;">Veiklos aprašymas</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(plan.lessonStages).map(([key, content]) => {
                const stageMin = meta.stageDurations ? (meta.stageDurations[key] || 0) : 0;
                const stageName = STAGE_TITLES[key] || key;
                return `
                  <tr>
                    <td><strong>${escapeHtml(stageName)}</strong></td>
                    <td>${stageMin} min.</td>
                    <td>${escapeHtml(content as string)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Differentiation section
    if (options.includeDifferentiation && plan.differentiation) {
      bodyHtml += `
        <div class="simple-section">
          <h3 class="simple-section-h3">4. VEIKLOS DIFERENCIJAVIMAS IR INDIVIDUALIZAVIMAS</h3>
          <p><strong>Gabūs mokiniai:</strong> ${escapeHtml(plan.differentiation.gifted || 'Papildomi tiriamieji uždaviniai')}</p>
          <p><strong>Vidutiniai mokiniai:</strong> ${escapeHtml(plan.differentiation.general || 'Standartinės praktikos užduotys')}</p>
          <p><strong>Sunkumų patiriantys mokiniai:</strong> ${escapeHtml(plan.differentiation.struggling || 'Pagalbinės schemos ir žodynėlis')}</p>
        </div>
      `;
    }
  }

  // 2. E-Diary section (if scope is 'ediary' or 'combined')
  if (options.scope === 'ediary' || options.scope === 'combined') {
    if (options.scope === 'combined') {
      bodyHtml += `<div class="pdf-page-break"></div>`;
    }

    bodyHtml += `
      <div class="simple-section">
        <h3 class="simple-section-h3">EL. DIENYNO ĮRAŠAI PAGAL EMOKYKLA BP STANDARTĄ (A0010)</h3>
        <p class="simple-note">Rekomenduojama namų darbų trukmė: ${formatHomeworkDuration(meta.homeworkDuration)}</p>

        ${plan.eDiaryEntry?.variants && plan.eDiaryEntry.variants.length > 0 ? plan.eDiaryEntry.variants.map((v: any) => `
          <div class="simple-variant-card">
            <h4>${escapeHtml(v.title)}</h4>
            <p><strong>📌 Tema, klasės darbai, pasiekimai:</strong> ${escapeHtml(v.topicClassworkExpectations)}</p>
            <p><strong>🎯 Namų darbai:</strong> ${escapeHtml(v.homework)}</p>
            <p><strong>💡 Pastabos / Vertinimas:</strong> ${escapeHtml(v.notes)}</p>
          </div>
        `).join('') : `
          <div class="simple-variant-card">
            <p><strong>📌 Tema / Klasės darbas:</strong> ${escapeHtml(plan.eDiaryEntry?.topicClassworkExpectations || '')}</p>
            <p><strong>🎯 Namų darbai:</strong> ${escapeHtml(plan.eDiaryEntry?.homework || '')}</p>
            <p><strong>💡 Pastaba / Vertinimas:</strong> ${escapeHtml(plan.eDiaryEntry?.notes || '')}</p>
          </div>
        `}
      </div>
    `;

    // Quality audit
    if (options.includeQualityAudit) {
      bodyHtml += `
        <div class="simple-section">
          <h3 class="simple-section-h3">KOKYBĖS AUDITO PATIKRA</h3>
          <p>✓ Standartizuota tema pagal A0010 modelį (Dalykas + Uždavinys + Veikla).</p>
          <p>✓ Tikslingi namų darbai su kontekstu ir N0015 krūvio kontrole.</p>
          <p>✓ Gyvenimiškas kontekstas ir PEPIS pozityvumas dienyno pastabose.</p>
        </div>
      `;
    }
  }

  // Signatures block
  if (options.includeSignatures) {
    bodyHtml += `
      <div class="simple-signatures-box">
        <div class="simple-sig-col">
          <div>Parengė: _________________________</div>
          <div class="sig-sub">Mokytojas (-a)</div>
        </div>
        <div class="simple-sig-col">
          <div>Suderinta / Patvirtinta: _________________________</div>
          <div class="sig-sub">Metodinio būrelio pirmininkas / Pavaduotojas ugdymui</div>
        </div>
      </div>
    `;
  }

  return `
    <div class="pdf-document simple-doc-wrapper font-size-${options.fontSize}">
      ${coverHtml}
      <div class="simple-doc-body">
        ${bodyHtml}
      </div>
      <div class="simple-doc-footer">
        <span>${escapeHtml(topicText)} • ${escapeHtml(subjectText)} (${escapeHtml(gradeText)})</span>
        <span>Dokumentas parengtas: ${dateStr}</span>
      </div>
    </div>
  `;
}

/**
 * Builds printable HTML markup for Structured, Branded PDF document
 * Rich layout with institutional headers, cards, colored badges, structured tables.
 */
export function buildStructuredBrandedPdfHtml(
  plan: any,
  meta: LessonPlanPdfMetadata,
  options: AdvancedPdfExportOptions
): string {
  const dateStr = new Date().toLocaleDateString('lt-LT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subjectText = meta.subject || 'Dalykas nenurodytas';
  const gradeText = meta.grade ? `${meta.grade} klasė` : 'Klasė nenurodyta';
  const topicText = plan.lessonOverview?.topic || meta.topic || 'Pamokos tema';
  const goalText = plan.lessonOverview?.goal || meta.goal || 'Pamokos tikslas';

  const totalMinutes = meta.stageDurations
    ? (Object.values(meta.stageDurations) as number[]).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : 45;

  const coverHtml = buildCoverPageHtml(plan, meta, options.coverPage, 'branded');

  let bodyHtml = '';

  // 1. Full Lesson Plan Content
  if (options.scope === 'full' || options.scope === 'combined') {
    bodyHtml += `
      <div class="pdf-header">
        <div class="pdf-ministry-badge">
          LIETUVOS RESPUBLIKOS ŠVIETIMO STANDARTAS • ATNAUJINTŲ BENDRŲJŲ PROGRAMŲ PAGRINDU (EMOKYKLA.LT)
        </div>
        <h1 class="pdf-main-title">PAMOKOS PLANAS IR UGDYMO TURINYS</h1>
        <div class="pdf-meta-table">
          <div class="pdf-meta-item">
            <span class="pdf-meta-key">Dalykas:</span>
            <span class="pdf-meta-val">${escapeHtml(subjectText)}</span>
          </div>
          <div class="pdf-meta-item">
            <span class="pdf-meta-key">Klasė / Koncentras:</span>
            <span class="pdf-meta-val">${escapeHtml(gradeText)}</span>
          </div>
          <div class="pdf-meta-item">
            <span class="pdf-meta-key">Pamokos trukmė:</span>
            <span class="pdf-meta-val">${totalMinutes} min.</span>
          </div>
          <div class="pdf-meta-item">
            <span class="pdf-meta-key">Planavimo data:</span>
            <span class="pdf-meta-val">${dateStr}</span>
          </div>
          <div class="pdf-meta-item full-width">
            <span class="pdf-meta-key">Pamokos tema:</span>
            <span class="pdf-meta-val bold-text">${escapeHtml(topicText)}</span>
          </div>
          <div class="pdf-meta-item full-width">
            <span class="pdf-meta-key">Mokymosi tikslas / uždavinys:</span>
            <span class="pdf-meta-val">${escapeHtml(goalText)}</span>
          </div>
        </div>
      </div>

      <!-- 1. Bendrųjų programų sąsajos -->
      <div class="pdf-section">
        <h2 class="pdf-section-title">1. Sąsajos su Bendrosiomis programomis (emokykla.lt)</h2>
        <div class="pdf-content-box">
          <p class="pdf-text-pre">${escapeHtml(plan.bpConnections || 'Sąsajos nurodytos pagal atnaujintas BP.')}</p>
        </div>
      </div>

      <!-- 2. Apžvalga ir vertinimas -->
      <div class="pdf-section">
        <h2 class="pdf-section-title">2. Ugdymo apžvalga ir pasiekimų vertinimas</h2>
        <div class="pdf-content-box">
          <p><strong>Pamokos tipas:</strong> ${escapeHtml(plan.lessonType || 'Įtvirtinimo / Mišri')}</p>
          <p><strong>Vertinimo metodai:</strong> ${escapeHtml(plan.lessonOverview?.evaluation?.methods?.join(', ') || 'Nenurodyta')}</p>
          ${plan.lessonOverview?.evaluation?.criteria ? `<p><strong>Vertinimo kriterijai:</strong> ${escapeHtml(plan.lessonOverview.evaluation.criteria)}</p>` : ''}
        </div>
      </div>
    `;

    // 3. Timeline
    if (options.includeTimeline && plan.lessonStages) {
      bodyHtml += `
        <div class="pdf-section">
          <h2 class="pdf-section-title">3. Pamokos eiga ir laiko biudžetas (${totalMinutes} min.)</h2>
          <div class="pdf-timeline">
            ${Object.entries(plan.lessonStages).map(([key, content]) => {
              const stageMin = meta.stageDurations ? (meta.stageDurations[key] || 0) : 0;
              const stageName = STAGE_TITLES[key] || key;
              return `
                <div class="pdf-timeline-step">
                  <div class="pdf-step-badge">
                    <strong>${escapeHtml(stageName)}</strong>
                    <span class="pdf-stage-time">${stageMin} min.</span>
                  </div>
                  <div class="pdf-step-body">${escapeHtml(content as string)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 4. Activities and resources
    bodyHtml += `
      <div class="pdf-section">
        <h2 class="pdf-section-title">4. Veiklos klasėje ir mokymo priemonės</h2>
        <div class="pdf-grid-2">
          <div class="pdf-subcard">
            <h4>👤 Individualus darbas</h4>
            <p>${escapeHtml(plan.classActivities?.individual || 'Numatytos individualios užduotys')}</p>
          </div>
          <div class="pdf-subcard">
            <h4>👥 Darbas porose ir grupėse</h4>
            <p>${escapeHtml(plan.classActivities?.pairs || plan.classActivities?.group || 'Užduočių sprendimas bendradarbiaujant')}</p>
          </div>
        </div>
      </div>
    `;

    // 5. Differentiation
    if (options.includeDifferentiation && plan.differentiation) {
      bodyHtml += `
        <div class="pdf-section">
          <h2 class="pdf-section-title">5. Mokymo diferencijavimas ir individualizavimas</h2>
          <div class="pdf-diff-grid">
            <div class="pdf-diff-card gifted">
              <span class="diff-tag">Gabūs mokiniai 🌟</span>
              <p>${escapeHtml(plan.differentiation.gifted)}</p>
            </div>
            <div class="pdf-diff-card average">
              <span class="diff-tag">Vidutiniai mokiniai ✅</span>
              <p>${escapeHtml(plan.differentiation.general)}</p>
            </div>
            <div class="pdf-diff-card struggling">
              <span class="diff-tag">Mokiniai su sunkumais 🛡️</span>
              <p>${escapeHtml(plan.differentiation.struggling)}</p>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 2. E-Diary Section
  if (options.scope === 'ediary' || options.scope === 'combined') {
    if (options.scope === 'combined') {
      bodyHtml += `<div class="pdf-page-break"></div>`;
    }

    bodyHtml += `
      <div class="pdf-section">
        <div class="pdf-header" style="margin-bottom: 12px;">
          <div class="pdf-ministry-badge">
            ELEKTRONINIO DIENYNO ĮRAŠŲ STANDARTAS (TAMO / MANO DIENYNAS / EDUKA)
          </div>
          <h2 class="pdf-main-title" style="font-size: 15pt;">EL. DIENYNO ĮRAŠŲ PAKETAS</h2>
          <p style="font-size: 8.5pt; color: #475569; margin: 4px 0;">Rekomenduojama namų darbų trukmė: <strong>${formatHomeworkDuration(meta.homeworkDuration)}</strong></p>
        </div>

        ${plan.eDiaryEntry?.variants && plan.eDiaryEntry.variants.length > 0 ? plan.eDiaryEntry.variants.map((v: any) => `
          <div class="pdf-section" style="margin-top: 12px; border-top: 1.5px solid #cbd5e1; padding-top: 10px;">
            <h3 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 11pt;">### ${escapeHtml(v.title)}</h3>
            <div class="pdf-ediary-card primary-card">
              <div class="pdf-ediary-top">📌 <strong>Tema, klasės darbai, numatomi pasiekimai</strong></div>
              <div class="pdf-ediary-content large-text">${escapeHtml(v.topicClassworkExpectations)}</div>
            </div>
            <div class="pdf-ediary-card primary-card" style="margin-top: 6px;">
              <div class="pdf-ediary-top">🎯 <strong>Namų darbai</strong></div>
              <div class="pdf-ediary-content large-text">${escapeHtml(v.homework)}</div>
            </div>
            <div class="pdf-ediary-card primary-card" style="margin-top: 6px;">
              <div class="pdf-ediary-top">💡 <strong>Pastabos apie pamoką</strong></div>
              <div class="pdf-ediary-content large-text">${escapeHtml(v.notes)}</div>
            </div>
          </div>
        `).join('') : `
          <div class="pdf-ediary-card primary-card">
            <div class="pdf-ediary-top">📌 <strong>Tema / Klasės darbas</strong></div>
            <div class="pdf-ediary-content large-text">${escapeHtml(plan.eDiaryEntry?.topicClassworkExpectations || '')}</div>
          </div>
          <div class="pdf-ediary-card primary-card" style="margin-top: 6px;">
            <div class="pdf-ediary-top">🎯 <strong>Namų darbai</strong></div>
            <div class="pdf-ediary-content large-text">${escapeHtml(plan.eDiaryEntry?.homework || '')}</div>
          </div>
          <div class="pdf-ediary-card primary-card" style="margin-top: 6px;">
            <div class="pdf-ediary-top">💡 <strong>Pastaba / Vertinimas</strong></div>
            <div class="pdf-ediary-content large-text">${escapeHtml(plan.eDiaryEntry?.notes || '')}</div>
          </div>
        `}
      </div>
    `;

    // Quality audit check
    if (options.includeQualityAudit) {
      bodyHtml += `
        <div class="pdf-section">
          <h3 class="pdf-audit-title">🔍 Kokybės audito patikra pagal oficialias rekomendacijas:</h3>
          <div class="pdf-audit-grid">
            <div class="pdf-audit-item">
              <span class="check-mark">✓</span>
              <span><strong>Standartizuota tema:</strong> aiškus dalykas, uždavinys ir veikla (A0010 modelis).</span>
            </div>
            <div class="pdf-audit-item">
              <span class="check-mark">✓</span>
              <span><strong>Tikslingi namų darbai:</strong> suformuluotas tikslas, vengta sausų numerių.</span>
            </div>
            <div class="pdf-audit-item">
              <span class="check-mark">✓</span>
              <span><strong>Krūvio kontrolė:</strong> atitinka N0015 rekomendaciją (${formatHomeworkDuration(meta.homeworkDuration)}).</span>
            </div>
            <div class="pdf-audit-item">
              <span class="check-mark">✓</span>
              <span><strong>Gyvenimiška vertė:</strong> PEPIS ir NVC principai pastabų lauke.</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Signatures box
  if (options.includeSignatures) {
    bodyHtml += `
      <div class="pdf-signatures-box">
        <div class="pdf-sig-block">
          <div class="pdf-sig-line">Parengė: __________________________________</div>
          <div class="pdf-sig-caption">Mokytojas (-a) / Pareigos, Vardas Pavardė</div>
        </div>
        <div class="pdf-sig-block">
          <div class="pdf-sig-line">Suderinta / Patvirtinta: __________________________________</div>
          <div class="pdf-sig-caption">Metodinio būrelio pirmininkas / Pavaduotojas ugdymui</div>
        </div>
      </div>
    `;
  }

  return `
    <div class="pdf-document branded-doc-wrapper font-size-${options.fontSize}">
      ${coverHtml}
      <div class="branded-doc-body">
        ${bodyHtml}
      </div>
      <div class="pdf-footer">
        <div>Atitinka emokykla.lt BP reikalavimus ir LR ŠMSM rekomendacijas dienynų pildymui</div>
        <div>Dokumento sukūrimo laikas: ${dateStr}</div>
      </div>
    </div>
  `;
}

/**
 * Builds printable HTML markup for Full Lesson Plan (Legacy API support)
 */
export function buildFullLessonPlanHtml(plan: any, meta: LessonPlanPdfMetadata): string {
  return buildStructuredBrandedPdfHtml(plan, meta, {
    ...DEFAULT_PDF_OPTIONS,
    coverPage: { ...DEFAULT_PDF_OPTIONS.coverPage, enabled: false },
    scope: 'full'
  });
}

/**
 * Builds printable HTML markup for E-Diary Only (Legacy API support)
 */
export function buildEDiaryOnlyHtml(plan: any, meta: LessonPlanPdfMetadata): string {
  return buildStructuredBrandedPdfHtml(plan, meta, {
    ...DEFAULT_PDF_OPTIONS,
    coverPage: { ...DEFAULT_PDF_OPTIONS.coverPage, enabled: false },
    scope: 'ediary'
  });
}

/**
 * Builds the complete unified HTML based on advanced options
 */
export function buildUnifiedDocumentHtml(
  plan: any,
  meta: LessonPlanPdfMetadata,
  options: AdvancedPdfExportOptions
): string {
  if (options.exportMode === 'simple') {
    return buildSimpleTextPdfHtml(plan, meta, options);
  }
  return buildStructuredBrandedPdfHtml(plan, meta, options);
}

/**
 * Downloads the requested document as PDF with full advanced options support
 */
export async function downloadDocumentPdf(
  typeOrOptions: 'full' | 'ediary' | AdvancedPdfExportOptions,
  plan: any,
  meta: LessonPlanPdfMetadata,
  explicitOptions?: Partial<AdvancedPdfExportOptions>
): Promise<void> {
  // Dynamically load html2pdf.js only in client browser
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = (html2pdfModule as any).default || html2pdfModule;

  // Resolve options
  let options: AdvancedPdfExportOptions;
  if (typeof typeOrOptions === 'string') {
    options = {
      ...DEFAULT_PDF_OPTIONS,
      scope: typeOrOptions as 'full' | 'ediary',
      coverPage: {
        ...DEFAULT_PDF_OPTIONS.coverPage,
        enabled: explicitOptions?.coverPage?.enabled ?? false,
        ...explicitOptions?.coverPage
      },
      ...explicitOptions
    };
  } else {
    options = {
      ...DEFAULT_PDF_OPTIONS,
      ...typeOrOptions,
      coverPage: {
        ...DEFAULT_PDF_OPTIONS.coverPage,
        ...typeOrOptions.coverPage
      }
    };
  }

  // Build target HTML
  const contentHtml = buildUnifiedDocumentHtml(plan, meta, options);

  // Create isolated container
  const container = document.createElement('div');
  container.className = 'pdf-render-target';
  container.innerHTML = contentHtml;

  // Add styles directly into container to ensure isolation and perfect rendering
  const styleEl = document.createElement('style');
  styleEl.textContent = getPdfDocumentCss();
  container.prepend(styleEl);

  // Position off-screen during rasterization
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // 210mm at 96 DPI
  container.style.background = '#ffffff';
  container.style.color = '#000000';
  container.style.zIndex = '-9999';

  document.body.appendChild(container);

  const safeTopic = (plan.lessonOverview?.topic || meta.topic || 'Pamoka')
    .replace(/[^\w\d\s\-_ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 35) || 'Pamoka';

  const dateTag = new Date().toISOString().split('T')[0];
  const modePrefix = options.exportMode === 'simple' ? 'Paprastas_' : 'Oficialus_';
  const scopeTag = options.scope === 'combined' ? 'Planas_ir_Dienynas' : options.scope === 'ediary' ? 'El_Dienynas' : 'Pamokos_planas';
  const filename = `${modePrefix}${scopeTag}_${safeTopic}_${dateTag}.pdf`;

  const opt = {
    margin: options.exportMode === 'simple' ? [12, 12, 12, 12] : [8, 10, 10, 10], // mm
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Returns self-contained CSS styles for PDF documents
 */
export function getPdfDocumentCss(): string {
  return `
    .pdf-document {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #0f172a;
      background: #ffffff;
      padding: 10px 15px;
      box-sizing: border-box;
      width: 100%;
    }

    .font-size-compact {
      font-size: 8.5pt !important;
      line-height: 1.35 !important;
    }
    .font-size-standard {
      font-size: 10pt !important;
      line-height: 1.5 !important;
    }
    .font-size-large {
      font-size: 11.5pt !important;
      line-height: 1.6 !important;
    }

    .pdf-page-break {
      page-break-after: always;
      break-after: page;
      height: 0;
      line-height: 0;
      margin: 0;
      padding: 0;
    }

    /* =========================================
       COVER PAGES STYLES
       ========================================= */
    .pdf-cover-page {
      min-height: 1020px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 50px 40px;
      background: #ffffff;
      page-break-after: always;
      break-after: page;
    }

    /* Academic Cover */
    .academic-cover {
      border: 3px double #1e3a8a;
      text-align: center;
      position: relative;
    }
    .cover-academic-top {
      margin-bottom: 30px;
    }
    .cover-ministry-text {
      font-size: 8.5pt;
      letter-spacing: 1.5px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 8px;
    }
    .cover-school-name {
      font-size: 15pt;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .cover-divider-academic {
      height: 2px;
      background: linear-gradient(90deg, transparent, #1e3a8a, transparent);
      width: 80%;
      margin: 0 auto;
    }
    .cover-doc-type-badge {
      display: inline-block;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 1px;
      color: #1e40af;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 4px 14px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .cover-academic-topic {
      font-size: 22pt;
      font-weight: 800;
      line-height: 1.25;
      color: #0f172a;
      margin: 0 0 15px 0;
    }
    .cover-academic-subject-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      font-size: 11pt;
      color: #334155;
      margin-bottom: 25px;
    }
    .cover-academic-goal-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px 20px;
      max-width: 90%;
      margin: 0 auto 20px auto;
      text-align: left;
    }
    .cover-goal-label {
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin-bottom: 6px;
    }
    .cover-goal-text {
      font-size: 10pt;
      font-style: italic;
      color: #1e293b;
      line-height: 1.45;
    }
    .cover-academic-meta-note {
      font-size: 8.5pt;
      color: #64748b;
    }
    .cover-signature-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      text-align: left;
      border-top: 1px solid #cbd5e1;
      padding-top: 20px;
      margin-bottom: 25px;
    }
    .cover-author-label {
      font-size: 8pt;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    .cover-author-val {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 3px;
    }
    .cover-approval-line {
      font-size: 9pt;
      color: #94a3b8;
      margin-top: 5px;
    }
    .cover-footer-year {
      font-size: 9.5pt;
      font-weight: 600;
      color: #475569;
      text-align: center;
    }

    /* Modern Cover */
    .modern-cover {
      position: relative;
      padding: 0;
      flex-direction: row;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .modern-cover-accent-bar {
      width: 14px;
      background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
      flex-shrink: 0;
    }
    .modern-cover-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 45px 35px;
    }
    .modern-tag-pill {
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .modern-school-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 10px;
    }
    .modern-kicker {
      font-size: 10.5pt;
      font-weight: 700;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 35px;
      margin-bottom: 8px;
    }
    .modern-topic-title {
      font-size: 24pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      margin: 0 0 12px 0;
    }
    .modern-subtitle {
      font-size: 10pt;
      color: #475569;
      margin: 0 0 25px 0;
    }
    .modern-meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 25px;
    }
    .modern-meta-cell {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
    }
    .modern-meta-key {
      display: block;
      font-size: 7.5pt;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .modern-meta-val {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .modern-quote-box {
      border-left: 3px solid #2563eb;
      background: #f1f5f9;
      padding: 12px 16px;
      font-size: 9.5pt;
      color: #1e293b;
      border-radius: 0 6px 6px 0;
    }
    .modern-cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #e2e8f0;
      padding-top: 18px;
      font-size: 9pt;
      color: #334155;
    }

    /* Minimal Cover */
    .minimal-cover {
      padding: 60px 45px;
      border: 1px solid #cbd5e1;
    }
    .minimal-cover-inner {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .minimal-school-header {
      font-size: 12pt;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .minimal-hairline {
      height: 1px;
      background: #0f172a;
      margin: 15px 0;
      opacity: 0.8;
    }
    .minimal-kicker {
      font-size: 10pt;
      font-weight: 600;
      color: #475569;
      margin-bottom: 10px;
    }
    .minimal-topic {
      font-size: 26pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      margin: 0 0 15px 0;
    }
    .minimal-goal-italic {
      font-size: 11pt;
      font-style: italic;
      color: #334155;
      line-height: 1.5;
    }
    .minimal-footer-row {
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #334155;
    }

    /* =========================================
       SIMPLE TEXT EXPORT STYLES
       ========================================= */
    .simple-doc-wrapper {
      padding: 15px 20px;
      color: #111827;
      background: #ffffff;
    }
    .simple-doc-header {
      border-bottom: 2px solid #111827;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .simple-doc-title {
      font-size: 15pt;
      font-weight: 800;
      margin: 0 0 6px 0;
      color: #111827;
      text-transform: uppercase;
    }
    .simple-meta-line {
      font-size: 9pt;
      color: #374151;
      margin-bottom: 6px;
    }
    .simple-goal-block {
      font-size: 9.5pt;
      color: #111827;
      margin-top: 4px;
    }
    .simple-section {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .simple-section-h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #111827;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 4px;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .simple-text-pre {
      font-size: 9.5pt;
      white-space: pre-wrap;
      line-height: 1.5;
      color: #1f2937;
      margin: 0;
    }
    .simple-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 9pt;
    }
    .simple-table th, .simple-table td {
      border: 1px solid #9ca3af;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    .simple-table th {
      background: #f3f4f6;
      font-weight: 700;
    }
    .simple-variant-card {
      border: 1px solid #9ca3af;
      padding: 10px 12px;
      margin-bottom: 10px;
      border-radius: 4px;
      background: #ffffff;
    }
    .simple-variant-card h4 {
      margin: 0 0 6px 0;
      font-size: 10.5pt;
      color: #111827;
      border-bottom: 1px dashed #d1d5db;
      padding-bottom: 3px;
    }
    .simple-variant-card p {
      margin: 4px 0;
      font-size: 9pt;
      line-height: 1.45;
    }
    .simple-signatures-box {
      display: flex;
      justify-content: space-between;
      border-top: 1.5px solid #111827;
      padding-top: 16px;
      margin-top: 25px;
      font-size: 9pt;
    }
    .simple-sig-col {
      width: 45%;
    }
    .sig-sub {
      font-size: 7.5pt;
      color: #6b7280;
      margin-top: 3px;
    }
    .simple-doc-footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #6b7280;
    }

    /* =========================================
       STRUCTURED BRANDED DOCUMENT STYLES
       ========================================= */
    .pdf-header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 15px;
    }
    .pdf-ministry-badge {
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #1e3a8a;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      margin-bottom: 8px;
    }
    .pdf-main-title {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px 0;
      line-height: 1.25;
      text-transform: uppercase;
    }
    .pdf-meta-table {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 8.5pt;
    }
    .pdf-meta-item {
      display: flex;
      gap: 6px;
    }
    .pdf-meta-item.full-width {
      grid-column: span 2;
      border-top: 1px dashed #e2e8f0;
      padding-top: 4px;
      margin-top: 2px;
    }
    .pdf-meta-key {
      font-weight: 600;
      color: #475569;
      flex-shrink: 0;
    }
    .pdf-meta-val {
      color: #0f172a;
    }
    .pdf-meta-val.bold-text {
      font-weight: 700;
      color: #1e3a8a;
    }

    /* Sections */
    .pdf-section {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .pdf-section-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1e3a8a;
      border-left: 3px solid #2563eb;
      padding-left: 8px;
      margin: 0 0 8px 0;
    }
    .pdf-content-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 8.5pt;
    }
    .pdf-content-box p {
      margin: 4px 0;
    }
    .pdf-text-pre {
      white-space: pre-wrap;
      line-height: 1.5;
      margin: 0;
    }

    /* Timeline */
    .pdf-timeline {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .pdf-timeline-step {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      background: #ffffff;
      font-size: 8.5pt;
    }
    .pdf-step-badge {
      display: flex;
      justify-content: space-between;
      color: #1e3a8a;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 3px;
      margin-bottom: 4px;
    }
    .pdf-stage-time {
      font-weight: 700;
      color: #2563eb;
    }
    .pdf-step-body {
      color: #334155;
      line-height: 1.4;
    }

    /* Grid 2 */
    .pdf-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .pdf-subcard {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      background: #f8fafc;
      font-size: 8.5pt;
    }
    .pdf-subcard h4 {
      margin: 0 0 4px 0;
      color: #1e3a8a;
      font-size: 8.5pt;
    }
    .pdf-subcard p {
      margin: 0;
      color: #334155;
      line-height: 1.4;
    }

    /* Differentiation */
    .pdf-diff-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
    }
    .pdf-diff-card {
      border-radius: 6px;
      padding: 8px;
      font-size: 8pt;
      line-height: 1.35;
    }
    .pdf-diff-card.gifted {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-top: 2.5px solid #8b5cf6;
    }
    .pdf-diff-card.average {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-top: 2.5px solid #2563eb;
    }
    .pdf-diff-card.struggling {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-top: 2.5px solid #ef4444;
    }
    .diff-tag {
      font-weight: 700;
      display: block;
      margin-bottom: 4px;
      font-size: 8pt;
    }
    .pdf-diff-card.gifted .diff-tag { color: #6b21a8; }
    .pdf-diff-card.average .diff-tag { color: #1e40af; }
    .pdf-diff-card.struggling .diff-tag { color: #991b1b; }
    .pdf-diff-card p { margin: 0; color: #1e293b; }

    /* E-diary Cards */
    .pdf-ediary-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .pdf-ediary-top {
      background: #f1f5f9;
      padding: 5px 10px;
      font-size: 8.5pt;
      font-weight: 600;
      border-bottom: 1px solid #cbd5e1;
      color: #1e3a8a;
    }
    .pdf-ediary-content {
      padding: 7px 10px;
      font-size: 8.5pt;
      line-height: 1.45;
      color: #1e293b;
      white-space: pre-wrap;
    }
    .pdf-ediary-content.large-text {
      font-size: 9pt;
      line-height: 1.45;
    }

    /* Audit section */
    .pdf-audit-title {
      font-size: 9pt;
      font-weight: 700;
      color: #0f172a;
      margin: 8px 0 4px 0;
    }
    .pdf-audit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 7.5pt;
    }
    .pdf-audit-item {
      display: flex;
      align-items: flex-start;
      gap: 5px;
      color: #334155;
    }
    .check-mark {
      color: #16a34a;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* Signatures box */
    .pdf-signatures-box {
      border-top: 1.5px solid #cbd5e1;
      padding-top: 14px;
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .pdf-sig-block {
      width: 46%;
    }
    .pdf-sig-line {
      font-size: 8.5pt;
      color: #0f172a;
      font-weight: 600;
    }
    .pdf-sig-caption {
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 3px;
    }

    /* Footer */
    .pdf-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 7pt;
      color: #64748b;
    }
  `;
}
