import { useState, useMemo, useCallback } from 'react';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiMagnify,
  mdiCheckboxMarkedOutline,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import type { Assessment } from '../data/interviewSections';
import { assessmentBank } from '../data/interviewSections';

interface AddAssessmentPanelProps {
  onAdd: (assessments: Assessment[]) => void;
  onCancel: () => void;
  existingAssessmentIds?: string[];
}

const categoryColors: Record<string, string> = {
  Technical: '#414996',
  Cognitive: '#2B8C4E',
  Psychometric: '#9D6309',
};

export default function AddAssessmentPanel({ onAdd, onCancel, existingAssessmentIds = [] }: AddAssessmentPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAssessments = useMemo(() => {
    const available = assessmentBank.filter(a => !existingAssessmentIds.includes(a.id));
    if (!searchQuery) return available;
    const q = searchQuery.toLowerCase();
    return available.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.competencies.some(c => c.toLowerCase().includes(q))
    );
  }, [searchQuery, existingAssessmentIds]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    const selected = assessmentBank.filter(a => selectedIds.has(a.id));
    onAdd(selected);
  }, [selectedIds, onAdd]);

  return (
    <div className="add-questions-overlay">
      <div className="add-questions-panel">
        <div className="aq-header">
          <div>
            <h3 className="aq-title">Add assessments</h3>
            <p className="aq-subtitle">Select assessments to evaluate candidates</p>
          </div>
          <button className="panel-close-btn" onClick={onCancel}>
            <Icon path={mdiClose} size={0.85} color="#343C4C" />
          </button>
        </div>

        <div className="aq-search-bar">
          <div className="aq-search-input-wrap">
            <Icon path={mdiMagnify} size={0.75} color="#9DA3AE" />
            <input
              className="aq-search-input"
              placeholder="Search assessments…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="aq-question-list">
          {filteredAssessments.map(asmt => {
            const isSelected = selectedIds.has(asmt.id);
            const isExpanded = expandedId === asmt.id;
            return (
              <div
                key={asmt.id}
                className={`asmt-pick-card${isSelected ? ' checked' : ''}`}
                onClick={() => handleToggle(asmt.id)}
              >
                <div className="asmt-pick-top">
                  <div className={`aq-checkbox${isSelected ? ' checked' : ''}`}>
                    {isSelected && <Icon path={mdiClose} size={0.45} color="#fff" style={{ transform: 'rotate(45deg)' }} />}
                  </div>
                  <div className="asmt-pick-header">
                    <div className="asmt-pick-title-row">
                      <span className="asmt-pick-title">{asmt.title}</span>
                      <span className="asmt-pick-source">{asmt.source}</span>
                    </div>
                    <div className="asmt-pick-meta">
                      <span
                        className="asmt-category-pill"
                        style={{ color: categoryColors[asmt.category], borderColor: categoryColors[asmt.category] }}
                      >
                        {asmt.category}
                      </span>
                      <span className="asmt-pick-meta-dots">
                        {asmt.metadata.join(' · ')} · {asmt.duration} mins
                      </span>
                    </div>
                  </div>
                  <button
                    className="chevron-btn-sm"
                    onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : asmt.id); }}
                  >
                    <Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={0.8} color="#69717F" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="asmt-pick-expanded">
                    <p className="asmt-pick-desc">{asmt.description}</p>
                    <div className="asmt-pick-competencies">
                      {asmt.competencies.map(c => (
                        <span key={c} className="asmt-competency-pill">{c}</span>
                      ))}
                      {asmt.extraCompetencyCount && (
                        <span className="asmt-competency-pill asmt-competency-extra">+{asmt.extraCompetencyCount}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="asmt-pick-footer">
                  <Icon path={mdiCheckboxMarkedOutline} size={0.55} color="#6B7C3A" />
                  <span className="asmt-cutoff-text">Cutoff — {asmt.cutoff}%</span>
                </div>
              </div>
            );
          })}
          {filteredAssessments.length === 0 && (
            <div className="gen-inline-search-empty">
              {searchQuery ? 'No matching assessments found' : 'All assessments have been added'}
            </div>
          )}
        </div>

        <div className="aq-footer">
          <button className="edit-footer-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="edit-footer-confirm"
            disabled={selectedIds.size === 0}
            onClick={handleAdd}
          >
            Add {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
