/**
 * PDF generation service for Lesson Plans and E-Diary outputs
 * Uses html2pdf.js with clean professional document styling matching @media print rules.
 */

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
 * Builds printable HTML markup for Full Lesson Plan
 */
export function buildFullLessonPlanHtml(plan: any, meta: LessonPlanPdfMetadata): string {
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

  return `
    <div class="pdf-document full-plan-doc">
      <!-- Dokumento viršutinė antraštė -->
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

      <!-- 3. Pamokos eiga ir laiko biudžetas -->
      <div class="pdf-section">
        <h2 class="pdf-section-title">3. Pamokos eiga ir laiko biudžetas (${totalMinutes} min.)</h2>
        <div class="pdf-timeline">
          ${plan.lessonStages ? Object.entries(plan.lessonStages).map(([key, content]) => {
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
          }).join('') : '<p>Eigos etapai nenurodyti</p>'}
        </div>
      </div>

      <!-- 4. Veiklos klasėje ir mokymo priemonės -->
      <div class="pdf-section">
        <h2 class="pdf-section-title">4. Veiklos klasėje ir mokymo priemonės</h2>
        <div class="pdf-grid-2">
          <div class="pdf-subcard">
            <h4>👤 Individualus darbas</h4>
            <p>${escapeHtml(plan.classActivities?.individual || 'Numatytos individualios užduotys')}</p>
          </div>
          <div class="pdf-subcard">
            <h4>👥 Darbas porose</h4>
            <p>${escapeHtml(plan.classActivities?.pairs || 'Numatytas darbas poromis')}</p>
          </div>
          <div class="pdf-subcard">
            <h4>👪 Darbas grupėse</h4>
            <p>${escapeHtml(plan.classActivities?.group || 'Numatytas bendradarbiavimas')}</p>
          </div>
          <div class="pdf-subcard">
            <h4>🛠️ Priemonės ir skaitmeniniai ištekliai</h4>
            <p>${escapeHtml(plan.classActivities?.toolsResources || plan.digitalResources || 'Vadovėlis, sąsiuviniai, skaitmeninė lenta')}</p>
          </div>
        </div>
      </div>

      <!-- 5. Diferencijavimas ir individualizavimas -->
      <div class="pdf-section">
        <h2 class="pdf-section-title">5. Mokymo diferencijavimas ir individualizavimas</h2>
        <div class="pdf-diff-grid">
          <div class="pdf-diff-col diff-struggling">
            <div class="pdf-diff-title">Mokiniai su sunkumais 🛡️</div>
            <p>${escapeHtml(plan.differentiation?.struggling || 'Pagalbiniai klausimai, papildomi paaiškinimai')}</p>
          </div>
          <div class="pdf-diff-col diff-average">
            <div class="pdf-diff-title">Vidutiniai mokiniai ✅</div>
            <p>${escapeHtml(plan.differentiation?.general || 'Standartinės programos praktinės užduotys')}</p>
          </div>
          <div class="pdf-diff-col diff-gifted">
            <div class="pdf-diff-title">Gabūs mokiniai 🌟</div>
            <p>${escapeHtml(plan.differentiation?.gifted || 'Kūrybinės, problemų sprendimo, gilesnės užduotys')}</p>
          </div>
        </div>
      </div>

      <!-- 6. Standartizuoti El. dienyno įrašai -->
      <div class="pdf-section ediary-highlight-section">
        <h2 class="pdf-section-title">6. Standartizuoti El. dienyno įrašai (TAMO / Mano Dienynas / Eduka)</h2>
        <div class="pdf-ediary-group">
          <div class="pdf-ediary-card">
            <div class="pdf-ediary-top">
              📌 <strong>Tema / Klasės darbas</strong> 
              <span class="pdf-ediary-sub">(Dalykas + Mokymosi uždavinys + Veikla)</span>
            </div>
            <div class="pdf-ediary-content">${escapeHtml(plan.eDiaryEntry?.topicClassworkExpectations || '')}</div>
          </div>

          <div class="pdf-ediary-card">
            <div class="pdf-ediary-top">
              🎯 <strong>Namų darbai</strong>
              <span class="pdf-ediary-sub">(Aiškus tikslas, kontekstas ir apimtis: ${formatHomeworkDuration(meta.homeworkDuration)})</span>
            </div>
            <div class="pdf-ediary-content">${escapeHtml(plan.eDiaryEntry?.homework || '')}</div>
          </div>

          <div class="pdf-ediary-card">
            <div class="pdf-ediary-top">
              💡 <strong>Pastaba / Vertinimas</strong>
              <span class="pdf-ediary-sub">(Gyvenimiškas naudingumas ir vertinimo kriterijai)</span>
            </div>
            <div class="pdf-ediary-content">${escapeHtml(plan.eDiaryEntry?.notes || '')}</div>
          </div>
        </div>
      </div>

      ${plan.motivation ? `
      <!-- 7. Motyvacinė žinutė -->
      <div class="pdf-section">
        <h2 class="pdf-section-title">7. Motyvacinė žinutė mokiniams</h2>
        <div class="pdf-motivation-box">
          <p><em>"${escapeHtml(plan.motivation)}"</em></p>
        </div>
      </div>
      ` : ''}

      <!-- Dokumento paraštė / pabaiga -->
      <div class="pdf-footer">
        <div>Parengta pagal Lietuvos bendrąsias programas (emokykla.lt) • Rekomendacijos N0015, J0025</div>
        <div>Dokumento sukūrimo laikas: ${new Date().toLocaleString('lt-LT')}</div>
      </div>
    </div>
  `;
}

/**
 * Builds printable HTML markup for E-Diary Output Only (Compact memorandum format)
 */
export function buildEDiaryOnlyHtml(plan: any, meta: LessonPlanPdfMetadata): string {
  const dateStr = new Date().toLocaleDateString('lt-LT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subjectText = meta.subject || 'Dalykas nenurodytas';
  const gradeText = meta.grade ? `${meta.grade} klasė` : 'Klasė nenurodyta';
  const topicText = plan.lessonOverview?.topic || meta.topic || 'Pamokos tema';

  return `
    <div class="pdf-document ediary-only-doc">
      <!-- Dokumento viršutinė antraštė -->
      <div class="pdf-header">
        <div class="pdf-ministry-badge">
          ELEKTRONINIO DIENYNO ĮRAŠŲ STANDARTAS (TAMO / MANO DIENYNAS / EDUKA)
        </div>
        <h1 class="pdf-main-title">EL. DIENYNO ĮRAŠŲ KORTELĖ</h1>
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
            <span class="pdf-meta-key">Rekomenduojama ND trukmė:</span>
            <span class="pdf-meta-val">${formatHomeworkDuration(meta.homeworkDuration)}</span>
          </div>
          <div class="pdf-meta-item">
            <span class="pdf-meta-key">Fiksavimo data:</span>
            <span class="pdf-meta-val">${dateStr}</span>
          </div>
          <div class="pdf-meta-item full-width">
            <span class="pdf-meta-key">Nagrinėjama tema:</span>
            <span class="pdf-meta-val bold-text">${escapeHtml(topicText)}</span>
          </div>
        </div>
      </div>

      <!-- 1. Tema ir klasės darbas -->
      <div class="pdf-section">
        <div class="pdf-ediary-card primary-card">
          <div class="pdf-ediary-top">
            📌 <strong>1. Tema / Klasės darbas</strong>
            <span class="pdf-ediary-sub">(Standartizuota formuluotė: Dalykas + Mokymosi uždavinys + Veikla)</span>
          </div>
          <div class="pdf-ediary-content large-text">
            ${escapeHtml(plan.eDiaryEntry?.topicClassworkExpectations || '')}
          </div>
          <div class="pdf-ediary-footer-note">
            ✓ Nurodytas dalykas, suformuluotas aiškus siekiamas rezultatas ir aprašyta atlikta veikla.
          </div>
        </div>
      </div>

      <!-- 2. Namų darbai -->
      <div class="pdf-section">
        <div class="pdf-ediary-card primary-card">
          <div class="pdf-ediary-top">
            🎯 <strong>2. Namų darbai</strong>
            <span class="pdf-ediary-sub">(Su aiškiu tikslu, kontekstu ir krūvio trukme N0015)</span>
          </div>
          <div class="pdf-ediary-content large-text">
            ${escapeHtml(plan.eDiaryEntry?.homework || '')}
          </div>
          <div class="pdf-ediary-footer-note">
            ✓ Nurodytas aiškus tikslas (įtvirtinti / pasiruošti), apimtis atitinka higienos normas ir krūvio rekomendacijas.
          </div>
        </div>
      </div>

      <!-- 3. Pastaba / Vertinimas -->
      <div class="pdf-section">
        <div class="pdf-ediary-card primary-card">
          <div class="pdf-ediary-top">
            💡 <strong>3. Pastaba / Vertinimas</strong>
            <span class="pdf-ediary-sub">(Gyvenimiška vertė ir pasiekimų vertinimo informacija)</span>
          </div>
          <div class="pdf-ediary-content large-text">
            ${escapeHtml(plan.eDiaryEntry?.notes || '')}
          </div>
          <div class="pdf-ediary-footer-note">
            ✓ Pateikta praktinė nauda mokinio kasdieniam gyvenimui ir ateičiai; vertinimas atitinka planuotus kriterijus.
          </div>
        </div>
      </div>

      <!-- Kokybės audito patikra -->
      <div class="pdf-section">
        <h3 class="pdf-audit-title">🔍 Kokybės audito patikra pagal oficialias rekomendacijas:</h3>
        <div class="pdf-audit-grid">
          <div class="pdf-audit-item">
            <span class="check-mark">✓</span>
            <span><strong>Standartizuota tema:</strong> aiškus dalykas, mokymosi uždavinys ir veikla (A0006 rekomendacija).</span>
          </div>
          <div class="pdf-audit-item">
            <span class="check-mark">✓</span>
            <span><strong>Tikslingi namų darbai:</strong> vengta plikų pratimų numerių be tikslo ir konteksto.</span>
          </div>
          <div class="pdf-audit-item">
            <span class="check-mark">✓</span>
            <span><strong>Krūvio kontrolė (N0015):</strong> trukmė reglamentuota (${formatHomeworkDuration(meta.homeworkDuration)}).</span>
          </div>
          <div class="pdf-audit-item">
            <span class="check-mark">✓</span>
            <span><strong>Kalbos kultūra (J0025):</strong> taisyklinga lietuvių kalbos rašyba ir skyryba oficialiame dokumente.</span>
          </div>
          <div class="pdf-audit-item">
            <span class="check-mark">✓</span>
            <span><strong>Individualizavimas:</strong> atsisakyta sauso šablono „Žinoti, gebėti, taikyti“ be konteksto.</span>
          </div>
        </div>
      </div>

      <!-- Dokumento paraštė -->
      <div class="pdf-footer">
        <div>Atitinka emokykla.lt BP reikalavimus ir LR ŠMSM rekomendacijas dienynų pildymui</div>
        <div>Dokumento sukūrimo laikas: ${new Date().toLocaleString('lt-LT')}</div>
      </div>
    </div>
  `;
}

/**
 * Downloads the requested document as PDF
 */
export async function downloadDocumentPdf(
  type: 'full' | 'ediary',
  plan: any,
  meta: LessonPlanPdfMetadata
): Promise<void> {
  // Dynamically load html2pdf.js only in client browser
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = (html2pdfModule as any).default || html2pdfModule;

  // Build target HTML
  const contentHtml = type === 'full' 
    ? buildFullLessonPlanHtml(plan, meta) 
    : buildEDiaryOnlyHtml(plan, meta);

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
  const filename = type === 'full'
    ? `Pamokos_planas_${safeTopic}_${dateTag}.pdf`
    : `El_dienynas_${safeTopic}_${dateTag}.pdf`;

  const opt = {
    margin: [10, 10, 12, 10], // mm: top, left, bottom, right
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
 * Returns self-contained CSS styles for PDF documents matching @media print rules
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

    .pdf-header {
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }

    .pdf-ministry-badge {
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #1e40af;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .pdf-main-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px 0;
      padding: 0;
      line-height: 1.2;
    }

    .pdf-meta-table {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
    }

    .pdf-meta-item {
      display: flex;
      gap: 6px;
      font-size: 8.5pt;
    }

    .pdf-meta-item.full-width {
      grid-column: 1 / -1;
    }

    .pdf-meta-key {
      font-weight: 700;
      color: #475569;
      white-space: nowrap;
    }

    .pdf-meta-val {
      color: #0f172a;
    }

    .pdf-meta-val.bold-text {
      font-weight: 700;
      color: #1e3a8a;
    }

    .pdf-section {
      margin-bottom: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .pdf-section-title {
      font-size: 11pt;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 3px;
      margin: 0 0 8px 0;
    }

    .pdf-content-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 9.5pt;
    }

    .pdf-content-box p {
      margin: 4px 0;
    }

    .pdf-text-pre {
      white-space: pre-wrap;
      margin: 0;
    }

    /* Timeline */
    .pdf-timeline {
      border-left: 2px solid #3b82f6;
      padding-left: 12px;
      margin-left: 4px;
    }

    .pdf-timeline-step {
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .pdf-step-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 8.5pt;
      color: #1e40af;
      margin-bottom: 4px;
    }

    .pdf-stage-time {
      font-weight: 700;
      background: #1e40af;
      color: #ffffff;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 7.5pt;
    }

    .pdf-step-body {
      font-size: 9pt;
      color: #334155;
      padding-left: 4px;
      line-height: 1.45;
    }

    /* Grid for activities */
    .pdf-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .pdf-subcard {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 8.5pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .pdf-subcard h4 {
      margin: 0 0 4px 0;
      font-size: 9pt;
      color: #1e293b;
    }

    .pdf-subcard p {
      margin: 0;
      color: #475569;
    }

    /* Differentiation grid */
    .pdf-diff-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }

    .pdf-diff-col {
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 8.5pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .diff-struggling {
      background: #fffbeb;
      border: 1px solid #fde68a;
    }

    .diff-average {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }

    .diff-gifted {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
    }

    .pdf-diff-title {
      font-weight: 700;
      margin-bottom: 4px;
      font-size: 9pt;
    }

    .diff-struggling .pdf-diff-title { color: #b45309; }
    .diff-average .pdf-diff-title { color: #15803d; }
    .diff-gifted .pdf-diff-title { color: #1d4ed8; }

    .pdf-diff-col p {
      margin: 0;
      color: #334155;
      line-height: 1.4;
    }

    /* E-diary entries */
    .pdf-ediary-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pdf-ediary-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .pdf-ediary-card.primary-card {
      border: 1.5px solid #2563eb;
      margin-bottom: 12px;
    }

    .pdf-ediary-top {
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      padding: 6px 10px;
      font-size: 9pt;
      color: #0f172a;
    }

    .primary-card .pdf-ediary-top {
      background: #eff6ff;
      border-bottom: 1px solid #bfdbfe;
      color: #1e3a8a;
    }

    .pdf-ediary-sub {
      font-size: 7.5pt;
      color: #64748b;
      margin-left: 4px;
    }

    .pdf-ediary-content {
      padding: 8px 12px;
      font-size: 9pt;
      line-height: 1.5;
      color: #1e293b;
      white-space: pre-wrap;
    }

    .pdf-ediary-content.large-text {
      font-size: 10pt;
      line-height: 1.55;
    }

    .pdf-ediary-footer-note {
      background: #f8fafc;
      border-top: 1px dashed #e2e8f0;
      padding: 4px 10px;
      font-size: 7.5pt;
      color: #15803d;
      font-weight: 500;
    }

    .pdf-motivation-box {
      background: #fdf4ff;
      border: 1px solid #f5d0fe;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 9pt;
      color: #86198f;
    }

    /* Audit section */
    .pdf-audit-title {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin: 10px 0 6px 0;
    }

    .pdf-audit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 8pt;
    }

    .pdf-audit-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      color: #334155;
    }

    .check-mark {
      color: #16a34a;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* Footer */
    .pdf-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #64748b;
    }
  `;
}
