import React, { useState, useMemo, useEffect } from 'react';
import { BLOOM_LEVELS, OBJECTIVE_FORMULA_GUIDE, BloomLevel } from '../bloomData';
import { SmartGoalGenerator } from './SmartGoalGenerator';

interface BloomSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: string;
  onInsertIntoGoal: (insertedText: string, mode?: 'replace' | 'append' | 'prepend') => void;
  currentSubject?: string;
  currentTopic?: string;
  currentGrade?: string;
  apiKey?: string;
  geminiCaller?: (key: string, req: { contents: string; config?: any }) => Promise<{ text?: string }>;
  initialTab?: string;
}

export const BloomSidebar: React.FC<BloomSidebarProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onInsertIntoGoal,
  currentSubject = '',
  currentTopic = '',
  currentGrade = '',
  apiKey = '',
  geminiCaller,
  initialTab = 'generator'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => {
      setCopiedNotification(null);
    }, 2400);
  };

  const handleVerbClick = (verb: string, level: BloomLevel) => {
    // Jei tikslo laukas tuščias, suformuluojame pradžią su veiksmažodžiu
    if (!currentGoal || !currentGoal.trim()) {
      const initialText = `Mokiniai gebės ${verb} `;
      onInsertIntoGoal(initialText, 'replace');
      showNotification(`✓ Veiksmažodis „${verb}“ įrašytas į tikslą.`);
    } else {
      // Jei jau yra tekstas, patikriname, ar galima sklandžiai prijungti
      const trimmed = currentGoal.trim();
      if (trimmed.endsWith('gebės') || trimmed.endsWith('gebės:')) {
        onInsertIntoGoal(`${trimmed.replace(/:$/, '')} ${verb} `, 'replace');
      } else if (trimmed.endsWith('.') || trimmed.endsWith(';') || trimmed.endsWith(',')) {
        onInsertIntoGoal(`${trimmed} taip pat gebės ${verb} `, 'replace');
      } else {
        onInsertIntoGoal(`${trimmed}, ${verb} `, 'replace');
      }
      showNotification(`✓ Veiksmažodis „${verb}“ pridėtas į tikslą.`);
    }
  };

  const handleExampleClick = (example: string) => {
    if (!currentGoal || !currentGoal.trim()) {
      onInsertIntoGoal(example, 'replace');
      showNotification('✓ Pavyzdinis tikslas įkeltas į formą.');
    } else {
      onInsertIntoGoal(`${currentGoal.trim()}\n${example}`, 'replace');
      showNotification('✓ Pavyzdinis tikslas pridėtas.');
    }
  };

  // Filtruojami lygiai pagal paiešką ir aktyvų skirtuką
  const filteredLevels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return BLOOM_LEVELS.filter(level => {
      // Tab filtravimas
      if (activeTab !== 'all' && activeTab !== 'formula' && level.id !== activeTab) {
        return false;
      }
      // Paieškos filtravimas
      if (!query) return true;

      const inName = level.name.toLowerCase().includes(query);
      const inVerbs = level.verbs.some(v => v.toLowerCase().includes(query));
      const inDesc = level.description.toLowerCase().includes(query);
      const inExamples = level.exampleObjectives.some(e => e.toLowerCase().includes(query));

      return inName || inVerbs || inDesc || inExamples;
    });
  }, [searchQuery, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="bloom-drawer-overlay" onClick={onClose}>
      <div 
        className="bloom-drawer-content" 
        onClick={e => e.stopPropagation()}
        aria-label="Bloom taksonomijos įrankis"
      >
        {/* Pranešimas apie įterpimą */}
        {copiedNotification && (
          <div className="bloom-toast-notification">
            {copiedNotification}
          </div>
        )}

        {/* Antraštė */}
        <div className="bloom-drawer-header">
          <div className="bloom-header-title-group">
            <div className="bloom-header-icon-badge">🧠</div>
            <div>
              <h3 className="bloom-header-title">Bloom taksonomija pamokos tikslams</h3>
              <p className="bloom-header-subtitle">
                Atnaujintų BP pasiekimų lygiai ir išmatuojamų veiksmažodžių žodynas
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="bloom-close-btn" 
            onClick={onClose}
            title="Užverti Bloom gidą"
          >
            ✕
          </button>
        </div>

        {/* Paieškos laukas (rodomas naršant lygius) */}
        {activeTab !== 'generator' && (
          <div className="bloom-search-container">
            <div className="bloom-search-input-wrapper">
              <span className="bloom-search-icon">🔍</span>
              <input
                type="text"
                className="bloom-search-input"
                placeholder="Ieškoti veiksmažodžio (pvz. analizuoti, įvertinti, pritaikyti)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="bloom-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Skirtukų juosta */}
        <div className="bloom-tabs-scroll">
          <button
            type="button"
            className={`bloom-tab-chip generator-tab ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <span className="bloom-tab-sparkle">✨</span>
            <span>SMART generatorius</span>
          </button>
          <button
            type="button"
            className={`bloom-tab-chip ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Visi lygiai (6)
          </button>
          {BLOOM_LEVELS.map(lvl => (
            <button
              key={lvl.id}
              type="button"
              className={`bloom-tab-chip ${activeTab === lvl.id ? 'active' : ''}`}
              onClick={() => setActiveTab(lvl.id)}
            >
              <span className="bloom-tab-order">{lvl.order}</span>
              <span>{lvl.englishName}</span>
            </button>
          ))}
          <button
            type="button"
            className={`bloom-tab-chip formula-tab ${activeTab === 'formula' ? 'active' : ''}`}
            onClick={() => setActiveTab('formula')}
          >
            📐 SMART formulė
          </button>
        </div>

        {/* Turinys */}
        <div className="bloom-drawer-body">
          {/* Jei pasirinktas SMART generatorius */}
          {activeTab === 'generator' && (
            <SmartGoalGenerator
              initialSubject={currentSubject}
              initialTopic={currentTopic}
              initialGrade={currentGrade}
              apiKey={apiKey}
              geminiCaller={geminiCaller}
              onInsertIntoGoal={onInsertIntoGoal}
              onShowToast={showNotification}
            />
          )}

          {/* Jei pasirinktas SMART formulės skirtukas */}
          {activeTab === 'formula' && (
            <div className="bloom-formula-section">
              <div 
                className="bloom-generator-prompt-banner"
                onClick={() => setActiveTab('generator')}
              >
                <div className="bloom-prompt-banner-content">
                  <span className="bloom-prompt-banner-icon">✨</span>
                  <div>
                    <strong>Norite pilno SMART tikslo pagal savo temą?</strong>
                    <p>Įveskite dalyką bei temą ir leiskite DI sukonstruoti išmatuojamą tikslą.</p>
                  </div>
                </div>
                <span className="bloom-prompt-banner-arrow">Atverti generatorių →</span>
              </div>
              <div className="bloom-card formula-card">
                <div className="bloom-card-title">
                  <span>📐 {OBJECTIVE_FORMULA_GUIDE.title}</span>
                </div>
                <div className="bloom-formula-display">
                  {OBJECTIVE_FORMULA_GUIDE.formula}
                </div>
                <p className="bloom-formula-help-text">
                  Kiekvienas pamokos tikslas turi atsakyti į klausimą. ką mokinys gebės atlikti pamokos pabaigoje ir kaip mokytojas sužinos, kad tai pasiekta?
                </p>

                <div className="bloom-notice-box success">
                  <strong>💡 Teisingas principas.</strong> {OBJECTIVE_FORMULA_GUIDE.goodVerbsNotice}
                </div>
                <div className="bloom-notice-box warning">
                  <strong>⚠️ Dažna klaida.</strong> {OBJECTIVE_FORMULA_GUIDE.avoidVerbsNotice}
                </div>
              </div>

              <div className="bloom-card">
                <div className="bloom-card-title">
                  <span>⚖️ Palyginamieji pavyzdžiai</span>
                </div>
                <div className="bloom-contrast-list">
                  {OBJECTIVE_FORMULA_GUIDE.contrastExamples.map((item, idx) => (
                    <div key={idx} className="bloom-contrast-item">
                      <div className="bloom-contrast-bad">
                        <span className="contrast-tag bad">Vengtina</span>
                        <p>{item.bad}</p>
                      </div>
                      <div className="bloom-contrast-good">
                        <span className="contrast-tag good">Rekomenduojama</span>
                        <p>{item.good}</p>
                        <button
                          type="button"
                          className="bloom-use-example-btn"
                          onClick={() => handleExampleClick(item.good)}
                        >
                          + Įterpti šį tikslą
                        </button>
                      </div>
                      <div className="bloom-contrast-reason">
                        <em>Pedagoginis komentaras.</em> {item.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lygiai ir veiksmažodžiai */}
          {activeTab !== 'formula' && activeTab !== 'generator' && (
            <div className="bloom-levels-list">
              {/* Greitas raginimas atverti generatorių */}
              {!searchQuery && (
                <div 
                  className="bloom-generator-prompt-banner"
                  onClick={() => setActiveTab('generator')}
                >
                  <div className="bloom-prompt-banner-content">
                    <span className="bloom-prompt-banner-icon">✨</span>
                    <div>
                      <strong>Reikia sukonstruoti pilną pamokos uždavinį?</strong>
                      <p>Išbandykite SMART tikslų generatorių su DI pagal savo dalyką ir temą.</p>
                    </div>
                  </div>
                  <span className="bloom-prompt-banner-arrow">Atverti generatorių →</span>
                </div>
              )}
              {filteredLevels.length === 0 ? (
                <div className="bloom-empty-search">
                  <p>Pagal užklausą <strong>„{searchQuery}“</strong> veiksmažodžių nerasta.</p>
                  <button
                    type="button"
                    className="bloom-reset-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Išvalyti paiešką
                  </button>
                </div>
              ) : (
                filteredLevels.map(lvl => (
                  <div 
                    key={lvl.id} 
                    className="bloom-level-panel"
                    style={{ borderLeftColor: lvl.badgeColor }}
                  >
                    {/* Lygio antraštė */}
                    <div className="bloom-level-topbar">
                      <div className="bloom-level-title-wrap">
                        <h4 className="bloom-level-name" style={{ color: lvl.badgeColor }}>
                          {lvl.name}
                        </h4>
                        <span className="bloom-level-eng">({lvl.englishName})</span>
                      </div>
                      <span 
                        className="bloom-tier-badge"
                        style={{ backgroundColor: lvl.bgLight, color: lvl.badgeColor }}
                      >
                        {lvl.levelTier} lygis
                      </span>
                    </div>

                    {/* Aprašymas ir BP atitiktis */}
                    <p className="bloom-level-desc">{lvl.description}</p>
                    
                    <div className="bloom-question-row">
                      <span className="bloom-question-icon">❓</span>
                      <span className="bloom-question-text">{lvl.evaluationQuestion}</span>
                    </div>

                    {/* Veiksmažodžių debesėlis */}
                    <div className="bloom-verbs-section">
                      <div className="bloom-verbs-header">
                        <span className="bloom-verbs-title">Rekomenduojami veiksmažodžiai (spustelėkite įterpimui).</span>
                      </div>
                      <div className="bloom-verb-chips-grid">
                        {lvl.verbs.map(verb => (
                          <button
                            key={verb}
                            type="button"
                            className="bloom-verb-chip"
                            onClick={() => handleVerbClick(verb, lvl)}
                            title={`Spustelėkite, norėdami įterpti „${verb}“ į pamokos tikslą`}
                          >
                            <span className="bloom-verb-add-icon">+</span>
                            <span>{verb}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pavyzdiniai tikslai */}
                    <div className="bloom-examples-section">
                      <div className="bloom-examples-header">
                        <span>Pavyzdiniai tikslai pagal BP.</span>
                      </div>
                      <div className="bloom-examples-list">
                        {lvl.exampleObjectives.map((ex, idx) => (
                          <div key={idx} className="bloom-example-item">
                            <span className="bloom-example-text">„{ex}“</span>
                            <button
                              type="button"
                              className="bloom-example-use-btn"
                              onClick={() => handleExampleClick(ex)}
                              title="Naudoti šį tikslą pamokos plane"
                            >
                              Įterpti
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Patarimas */}
                    <div className="bloom-level-tip">
                      <strong>Patarimas mokytojui.</strong> {lvl.tip}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Poraštė */}
        <div className="bloom-drawer-footer">
          <div className="bloom-footer-info">
            Spustelėjus bet kurį veiksmažodį ar pavyzdį, jis akimirksniu įterpiamas į formos laukelį „Tikslas“.
          </div>
          <button
            type="button"
            className="bloom-footer-close-btn"
            onClick={onClose}
          >
            Užverti gidą
          </button>
        </div>
      </div>
    </div>
  );
};
