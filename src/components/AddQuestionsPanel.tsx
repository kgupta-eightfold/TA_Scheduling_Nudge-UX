import { useState, useMemo, useCallback } from 'react';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiCheck,
  mdiMagnify,
  mdiChevronDown,
  mdiPencilOutline,
  mdiCreation,
  mdiPlus,
  mdiGraphOutline,
  mdiClockOutline,
  mdiCodeBraces,
} from '@mdi/js';
import type { SectionType, Question } from '../data/interviewSections';
import { getQuestionBank } from '../data/interviewSections';

interface AddQuestionsPanelProps {
  sectionType: SectionType;
  onAdd: (questions: Question[]) => void;
  onCancel: () => void;
}

function DifficultyIcon({ difficulty }: { difficulty: string }) {
  const color = difficulty === 'Easy' ? '#6B7C3A' : difficulty === 'Medium' ? '#9D6309' : '#993838';
  return <Icon path={mdiGraphOutline} size={0.55} color={color} />;
}

export default function AddQuestionsPanel({ sectionType, onAdd, onCancel }: AddQuestionsPanelProps) {
  const questionBank = useMemo(() => getQuestionBank(sectionType), [sectionType]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleQuestion = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    const selected = questionBank.filter(q => selectedIds.has(q.id));
    const withNewIds = selected.map(q => ({ ...q, id: `${q.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }));
    onAdd(withNewIds);
  }, [questionBank, selectedIds, onAdd]);

  const isCoding = sectionType === 'coding' || sectionType === 'algorithmic';
  const isScreening = sectionType === 'screening';
  const isFunctional = sectionType === 'technical' || sectionType === 'functional';

  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return questionBank;
    const q = searchQuery.toLowerCase();
    return questionBank.filter(item => item.title.toLowerCase().includes(q));
  }, [questionBank, searchQuery]);

  const screeningCategories = useMemo(() => {
    if (!isScreening) return [];
    const cats: Record<string, Question[]> = {};
    filteredQuestions.forEach(q => {
      const cat = q.category || 'Other';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(q);
    });
    return Object.entries(cats);
  }, [isScreening, filteredQuestions]);

  return (
    <div className="add-questions-overlay">
      <div className="add-questions-panel">
        {/* Header */}
        <div className="aq-header">
          <div>
            <h3 className="aq-title">Add questions</h3>
            <p className="aq-subtitle">Set up questions for AI interview</p>
          </div>
          <button className="panel-close-btn" onClick={onCancel} aria-label="Close">
            <Icon path={mdiClose} size={0.85} color="#343C4C" />
          </button>
        </div>

        {/* Search + filters */}
        <div className="aq-search-bar">
          <div className="aq-search-input-wrap">
            <Icon path={mdiMagnify} size={0.85} color="#9DA3AE" />
            <input
              type="text"
              className="aq-search-input"
              placeholder="Type to search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {isFunctional && (
            <button className="create-new-btn">
              <Icon path={mdiPlus} size={0.7} />
              <span>Create new</span>
            </button>
          )}
        </div>

        <div className="aq-filters">
          {isCoding && (
            <>
              <button className="filter-pill">
                <DifficultyIcon difficulty="Medium" />
                <span>Difficulty level</span>
                <Icon path={mdiChevronDown} size={0.6} />
              </button>
              <button className="filter-pill">
                <Icon path={mdiClockOutline} size={0.55} color="#69717F" />
                <span>Duration</span>
                <Icon path={mdiChevronDown} size={0.6} />
              </button>
              <button className="filter-pill">
                <Icon path={mdiCodeBraces} size={0.55} color="#69717F" />
                <span>Language</span>
                <Icon path={mdiChevronDown} size={0.6} />
              </button>
            </>
          )}
          {isScreening && (
            <>
              <button className="filter-pill">
                <span>Category</span>
                <Icon path={mdiChevronDown} size={0.6} />
              </button>
              <button className="filter-pill">
                <span>Created by</span>
                <Icon path={mdiChevronDown} size={0.6} />
              </button>
              <div style={{ flex: 1 }} />
              <button className="create-new-btn">
                <Icon path={mdiPlus} size={0.7} />
                <span>Create new</span>
              </button>
            </>
          )}
        </div>

        {/* Question list */}
        <div className="aq-question-list">
          {isCoding && filteredQuestions.map(q => {
            const checked = selectedIds.has(q.id);
            return (
              <div
                key={q.id}
                className={`aq-coding-card ${checked ? 'checked' : ''}`}
                onClick={() => toggleQuestion(q.id)}
              >
                <div className="aq-coding-top">
                  <div className={`aq-checkbox ${checked ? 'checked' : ''}`}>
                    {checked && <Icon path={mdiCheck} size={0.5} color="#fff" />}
                  </div>
                  <span className="aq-coding-title">{q.title}</span>
                  <button className="chevron-btn-sm" onClick={e => e.stopPropagation()}>
                    <Icon path={mdiChevronDown} size={0.8} color="#69717F" />
                  </button>
                </div>
                <div className="aq-coding-meta">
                  {q.difficulty && (
                    <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
                      <DifficultyIcon difficulty={q.difficulty} />
                      {q.difficulty}
                    </span>
                  )}
                  <span className="aq-meta-item">
                    <Icon path={mdiClockOutline} size={0.5} color="#69717F" /> {q.duration} min
                  </span>
                  {q.languages && (
                    <span className="aq-meta-item">
                      <Icon path={mdiCodeBraces} size={0.5} color="#69717F" /> {q.languages.join(', ')}
                      {q.extraLanguageCount ? <span className="lang-extra">+{q.extraLanguageCount}</span> : null}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {isScreening && screeningCategories.map(([cat, questions]) => (
            <div key={cat} className="aq-screening-group">
              <h4 className="aq-screening-category">{cat}</h4>
              {questions.map(q => {
                const checked = selectedIds.has(q.id);
                return (
                  <div
                    key={q.id}
                    className="aq-screening-row"
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <div className={`aq-checkbox ${checked ? 'checked' : ''}`}>
                      {checked && <Icon path={mdiCheck} size={0.5} color="#fff" />}
                    </div>
                    <div className="aq-screening-text">
                      <span className="aq-screening-question">{q.title}</span>
                      <span className="aq-screening-creator">(Created by {q.createdBy})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {isFunctional && filteredQuestions.map(q => {
            const checked = selectedIds.has(q.id);
            return (
              <div
                key={q.id}
                className={`aq-functional-card ${checked ? 'checked' : ''}`}
                onClick={() => toggleQuestion(q.id)}
              >
                <div className="aq-functional-top">
                  <div className={`aq-checkbox ${checked ? 'checked' : ''}`}>
                    {checked && <Icon path={mdiCheck} size={0.5} color="#fff" />}
                  </div>
                  <span className="aq-functional-title">{q.title}</span>
                  <span className="aq-functional-duration">
                    <Icon path={mdiClockOutline} size={0.55} color="#69717F" /> {q.duration} mins
                  </span>
                  <span className="aq-functional-creator">
                    {q.aiGenerated ? (
                      <>
                        <Icon path={mdiCreation} size={0.55} color="#414996" /> AI generated
                      </>
                    ) : (
                      <>Created by {q.createdBy}</>
                    )}
                  </span>
                  <button className="icon-btn-sm" onClick={e => e.stopPropagation()}>
                    <Icon path={mdiPencilOutline} size={0.65} color="#69717F" />
                  </button>
                </div>
                <p className="aq-functional-desc">{q.description}</p>
                {q.hasEvaluationCriteria && (
                  <button className="aq-eval-link" onClick={e => e.stopPropagation()}>
                    Evaluation criteria
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="aq-footer">
          <button className="edit-footer-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="edit-footer-confirm"
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
          >
            Add {selectedIds.size > 0 && <span className="invite-count">{selectedIds.size}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
