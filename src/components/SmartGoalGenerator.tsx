import React, { useState, useEffect } from 'react';
import { BLOOM_LEVELS } from '../bloomData';
import { 
  SmartGoalResult, 
  generateSmartGoalPedagogical, 
  generateSmartGoalWithAI 
} from '../smartGoalService';

interface SmartGoalGeneratorProps {
  initialSubject?: string;
  initialTopic?: string;
  initialGrade?: string;
  apiKey?: string;
  geminiCaller?: (key: string, req: { contents: string; config?: any }) => Promise<{ text?: string }>;
  onInsertIntoGoal: (text: string, mode?: 'replace' | 'append' | 'prepend') => void;
  onShowToast: (msg: string) => void;
}

const COMMON_SUBJECTS = [
  'Lietuvių kalba',
  'Matematika',
  'Istorija',
  'Biologija',
  'Geografija',
  'Anglų kalba',
  'Fizika',
  'Chemija',
  'Informatika'
];

const FOCUS_METHODS = [
  'Praktinis taikymas',
  'Probleminis tyrimas',
  'Teksto analizė',
  'Diskusija ir argumentavimas',
  'Kūrybinis projektas',
  'Darbas porose'
];

export const SmartGoalGenerator: React.FC<SmartGoalGeneratorProps> = ({
  initialSubject = '',
  initialTopic = '',
  initialGrade = '',
  apiKey = '',
  geminiCaller,
  onInsertIntoGoal,
  onShowToast
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [grade, setGrade] = useState(initialGrade);
  const [selectedBloomLevel, setSelectedBloomLevel] = useState<string>('all');
  const [focusMethod, setFocusMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartGoalResult | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'main' | 'smart' | 'levels' | 'criteria'>('main');

  // Sinchronizuojame, jei išoriniai rekvizitai pasikeičia ir vartotojas dar nieko neįvedė
  useEffect(() => {
    if (initialSubject && !subject) setSubject(initialSubject);
    if (initialTopic && !topic) setTopic(initialTopic);
    if (initialGrade && !grade) setGrade(initialGrade);
  }, [initialSubject, initialTopic, initialGrade]);

  const handleGenerate = async (useAi = true) => {
    if (!topic.trim()) {
      onShowToast('⚠️ Įveskite pamokos temą SMART tikslo generavimui.');
      return;
    }

    setIsLoading(true);
    try {
      if (useAi && apiKey && geminiCaller) {
        const res = await generateSmartGoalWithAI(
          apiKey,
          {
            subject: subject.trim() || 'Bendrasis ugdymas',
            topic: topic.trim(),
            grade: grade.trim(),
            bloomLevelId: selectedBloomLevel === 'all' ? undefined : selectedBloomLevel,
            focusMethod: focusMethod.trim()
          },
          geminiCaller
        );
        setResult(res);
        onShowToast('✨ SMART pamokos tikslas sėkmingai sugeneruotas su DI.');
      } else {
        const res = generateSmartGoalPedagogical({
          subject: subject.trim() || 'Bendrasis ugdymas',
          topic: topic.trim(),
          grade: grade.trim(),
          bloomLevelId: selectedBloomLevel === 'all' ? 'applying' : selectedBloomLevel,
          focusMethod: focusMethod.trim()
        });
        setResult(res);
        onShowToast('⚡ SMART pamokos tikslas sugeneruotas pagal pedagoginį šabloną.');
      }
    } catch (err) {
      console.error(err);
      // Atsarginis variantas garantuoja, kad vartotojas visada gaus rezultatą
      const fallback = generateSmartGoalPedagogical({
        subject: subject.trim() || 'Bendrasis ugdymas',
        topic: topic.trim(),
        grade: grade.trim(),
        bloomLevelId: selectedBloomLevel === 'all' ? 'applying' : selectedBloomLevel,
        focusMethod: focusMethod.trim()
      });
      setResult(fallback);
      onShowToast('⚡ Pritaikytas pedagoginis SMART šablonas.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label = 'Tekstas nukopijuotas.') => {
    try {
      navigator.clipboard.writeText(text);
      onShowToast(`📋 ${label}`);
    } catch (e) {
      onShowToast('📋 Nukopijuoti nepavyko.');
    }
  };

  return (
    <div className="smart-generator-wrapper">
      {/* Pristatymo blokas */}
      <div className="smart-intro-card">
        <div className="smart-intro-icon">🎯</div>
        <div className="smart-intro-text">
          <h4 className="smart-intro-title">SMART pamokos tikslų generatorius</h4>
          <p className="smart-intro-desc">
            Įveskite dalyką ir temą – dirbtinis intelektas arba pedagoginis variklis sukonstruos išmatuojamą, pagal Bloom taksonomiją diferencijuotą pamokos tikslą.
          </p>
        </div>
      </div>

      {/* Formos laukai */}
      <div className="smart-form-card">
        {/* Dalykas */}
        <div className="smart-field-group">
          <div className="smart-field-label-row">
            <label className="smart-label">Mokomasis dalykas</label>
            <span className="smart-hint">Pvz. Lietuvių kalba, Matematika</span>
          </div>
          <input
            type="text"
            className="smart-input"
            placeholder="Įrašykite arba pasirinkite dalyką..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          {/* Greiti dalykų mygtukai */}
          <div className="smart-quick-chips">
            {COMMON_SUBJECTS.map(s => (
              <button
                key={s}
                type="button"
                className={`smart-chip ${subject === s ? 'active' : ''}`}
                onClick={() => setSubject(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tema ir Klasė greta */}
        <div className="smart-two-col">
          <div className="smart-field-group" style={{ flex: 3 }}>
            <div className="smart-field-label-row">
              <label className="smart-label">Pamokos tema *</label>
              <span className="smart-required">Privaloma</span>
            </div>
            <input
              type="text"
              className="smart-input highlight"
              placeholder="Pvz. Trupmenų sudėtis, Baroko menas, Veiksmažodis..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>

          <div className="smart-field-group" style={{ flex: 1.2 }}>
            <div className="smart-field-label-row">
              <label className="smart-label">Klasė</label>
            </div>
            <select
              className="smart-select"
              value={grade}
              onChange={e => setGrade(e.target.value)}
            >
              <option value="">Nenurodyta</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                <option key={g} value={`${g}`}>
                  {g} klasė
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tikslinis Bloom taksonomijos lygis */}
        <div className="smart-field-group">
          <div className="smart-field-label-row">
            <label className="smart-label">Siekiamas Bloom taksonomijos lygis</label>
            <span className="smart-hint">Pagal BP pasiekimų sritis</span>
          </div>
          <select
            className="smart-select"
            value={selectedBloomLevel}
            onChange={e => setSelectedBloomLevel(e.target.value)}
          >
            <option value="all">🧠 Parinkti optimalų automatiškai (Rekomenduojama)</option>
            {BLOOM_LEVELS.map(lvl => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.name} ({lvl.levelTier} lygis)
              </option>
            ))}
          </select>
        </div>

        {/* Papildomas veiklos akcentas */}
        <div className="smart-field-group">
          <div className="smart-field-label-row">
            <label className="smart-label">Papildomas metodinis akcentas (nebūtina)</label>
          </div>
          <div className="smart-quick-chips">
            {FOCUS_METHODS.map(m => (
              <button
                key={m}
                type="button"
                className={`smart-chip ${focusMethod === m ? 'active' : ''}`}
                onClick={() => setFocusMethod(focusMethod === m ? '' : m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Veiksmų mygtukai */}
        <div className="smart-actions-row">
          <button
            type="button"
            className="smart-btn primary"
            disabled={isLoading || !topic.trim()}
            onClick={() => handleGenerate(true)}
          >
            {isLoading ? (
              <>
                <span className="smart-spinner" />
                <span>Generuojama...</span>
              </>
            ) : (
              <>
                <span>✨ Sugeneruoti SMART tikslą su DI</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="smart-btn secondary"
            disabled={isLoading || !topic.trim()}
            onClick={() => handleGenerate(false)}
            title="Greitas generavimas pagal didaktinį šabloną be DI užklausos"
          >
            <span>⚡ Pedagoginis šablonas</span>
          </button>
        </div>
      </div>

      {/* Rezultatų kortelė */}
      {result && (
        <div className="smart-result-card">
          {/* Rezultato viršutinė juosta */}
          <div className="smart-result-topbar">
            <div className="smart-result-badge-group">
              <span className="smart-bloom-badge">
                🧠 {result.bloomLevelName}
              </span>
              <span className="smart-verb-badge">
                Veiksmažodis. <strong>{result.bloomVerb}</strong>
              </span>
            </div>
          </div>

          {/* Pagrindinis sukonstruotas SMART tikslas */}
          <div className="smart-main-goal-box">
            <div className="smart-goal-header-row">
              <span className="smart-goal-label">Sukonstruotas pamokos tikslas.</span>
              <div className="smart-goal-actions">
                <button
                  type="button"
                  className="smart-icon-btn"
                  onClick={() => copyToClipboard(result.mainGoal, 'SMART tikslas nukopijuotas.')}
                  title="Kopijuoti tikslą"
                >
                  📋 Kopijuoti
                </button>
              </div>
            </div>
            <p className="smart-main-goal-text">{result.mainGoal}</p>

            {/* Mygtukas įkelti į pagrindinės formos tikslo laukelį */}
            <div className="smart-insert-row">
              <button
                type="button"
                className="smart-insert-btn"
                onClick={() => {
                  onInsertIntoGoal(result.mainGoal, 'replace');
                  onShowToast('✓ SMART tikslas sėkmingai įkeltas į pamokos formą.');
                }}
              >
                <span>📥 Įkelti į pamokos tikslo laukelį</span>
              </button>
              <button
                type="button"
                className="smart-insert-append-btn"
                onClick={() => {
                  onInsertIntoGoal(result.mainGoal, 'append');
                  onShowToast('✓ SMART tikslas prijungtas prie esamo tikslo.');
                }}
                title="Prijungti prie jau esamo teksto"
              >
                <span>+ Prijungti</span>
              </button>
            </div>
          </div>

          {/* Skirtukai detaliai analizei */}
          <div className="smart-subtabs-row">
            <button
              type="button"
              className={`smart-subtab ${activeSubTab === 'main' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('main')}
            >
              📐 SMART struktūra
            </button>
            <button
              type="button"
              className={`smart-subtab ${activeSubTab === 'levels' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('levels')}
            >
              🎯 Diferencijavimas (3 lygiai)
            </button>
            <button
              type="button"
              className={`smart-subtab ${activeSubTab === 'criteria' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('criteria')}
            >
              ✅ Sėkmės kriterijai
            </button>
          </div>

          {/* 1. SMART Formulės išskaidymas */}
          {activeSubTab === 'main' && (
            <div className="smart-breakdown-grid">
              <div className="smart-breakdown-item s">
                <div className="smart-letter-pill">S</div>
                <div className="smart-breakdown-content">
                  <strong>Konkretus (Specific).</strong>
                  <p>{result.smartBreakdown.specific}</p>
                </div>
              </div>

              <div className="smart-breakdown-item m">
                <div className="smart-letter-pill">M</div>
                <div className="smart-breakdown-content">
                  <strong>Išmatuojamas (Measurable).</strong>
                  <p>{result.smartBreakdown.measurable}</p>
                </div>
              </div>

              <div className="smart-breakdown-item a">
                <div className="smart-letter-pill">A</div>
                <div className="smart-breakdown-content">
                  <strong>Pasiekiamas (Achievable).</strong>
                  <p>{result.smartBreakdown.achievable}</p>
                </div>
              </div>

              <div className="smart-breakdown-item r">
                <div className="smart-letter-pill">R</div>
                <div className="smart-breakdown-content">
                  <strong>Aktualus (Relevant).</strong>
                  <p>{result.smartBreakdown.relevant}</p>
                </div>
              </div>

              <div className="smart-breakdown-item t">
                <div className="smart-letter-pill">T</div>
                <div className="smart-breakdown-content">
                  <strong>Apibrėžtas laike (Time-bound).</strong>
                  <p>{result.smartBreakdown.timeBound}</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Diferencijuoti lygiai */}
          {activeSubTab === 'levels' && (
            <div className="smart-diff-list">
              <div className="smart-diff-card advanced">
                <div className="smart-diff-header">
                  <span className="smart-diff-tag advanced">Aukštesnysis lygis 🌟</span>
                  <button
                    type="button"
                    className="smart-small-use-btn"
                    onClick={() => {
                      onInsertIntoGoal(result.differentiatedVariants.advanced, 'replace');
                      onShowToast('✓ Aukštesniojo lygio tikslas įkeltas.');
                    }}
                  >
                    Įkelti šį lygį
                  </button>
                </div>
                <p className="smart-diff-text">{result.differentiatedVariants.advanced}</p>
              </div>

              <div className="smart-diff-card average">
                <div className="smart-diff-header">
                  <span className="smart-diff-tag average">Pagrindinis lygis ✅</span>
                  <button
                    type="button"
                    className="smart-small-use-btn"
                    onClick={() => {
                      onInsertIntoGoal(result.differentiatedVariants.average, 'replace');
                      onShowToast('✓ Pagrindinio lygio tikslas įkeltas.');
                    }}
                  >
                    Įkelti šį lygį
                  </button>
                </div>
                <p className="smart-diff-text">{result.differentiatedVariants.average}</p>
              </div>

              <div className="smart-diff-card struggling">
                <div className="smart-diff-header">
                  <span className="smart-diff-tag struggling">Slenkstinis lygis (SUP) 🛡️</span>
                  <button
                    type="button"
                    className="smart-small-use-btn"
                    onClick={() => {
                      onInsertIntoGoal(result.differentiatedVariants.struggling, 'replace');
                      onShowToast('✓ Slenkstinio lygio tikslas įkeltas.');
                    }}
                  >
                    Įkelti šį lygį
                  </button>
                </div>
                <p className="smart-diff-text">{result.differentiatedVariants.struggling}</p>
              </div>
            </div>
          )}

          {/* 3. Sėkmės kriterijai mokiniams */}
          {activeSubTab === 'criteria' && (
            <div className="smart-criteria-box">
              <div className="smart-criteria-header">
                <span>Mokinio sėkmės kriterijai („Aš gebu...“)</span>
                <button
                  type="button"
                  className="smart-small-use-btn"
                  onClick={() => {
                    const text = result.successCriteria.join('\n');
                    copyToClipboard(text, 'Sėkmės kriterijai nukopijuoti.');
                  }}
                >
                  📋 Kopijuoti visus
                </button>
              </div>
              <ul className="smart-criteria-list">
                {result.successCriteria.map((crit, idx) => (
                  <li key={idx} className="smart-criteria-item">
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
