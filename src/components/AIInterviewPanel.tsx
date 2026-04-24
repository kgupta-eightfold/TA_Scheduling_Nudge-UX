import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, ButtonVariant } from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiInformationOutline,
  mdiPencilOutline,
  mdiChevronDown,
  mdiChevronUp,
  mdiChevronRight,
  mdiCheck,
  mdiDotsHorizontal,
  mdiAlertOutline,
  mdiCreation,
  mdiMagnify,
  mdiLoading,
  mdiPlus,
  mdiClockOutline,
} from '@mdi/js';
import type { Section, SectionType, Question, Assessment } from '../data/interviewSections';
import {
  defaultSections,
  computeSectionMins,
  createEmptySection,
  allTopics,
  defaultSelectedTopicIds,
  durationPresets,
  generatedGuideSections,
} from '../data/interviewSections';
import EditView from './EditView';
import AddQuestionsPanel from './AddQuestionsPanel';
import AddAssessmentPanel from './AddAssessmentPanel';
import ManageSectionsView from './ManageSectionsView';
import EditSettingsModal from './EditSettingsModal';
import InterviewLibraryPanel from './InterviewLibraryPanel';
import './AIInterviewPanel.css';

export interface InterviewSettings {
  interviewName: string;
  interviewDescription: string;
  aiAgent: string;
  evaluateLanguageProficiency: boolean;
  inviteExpiryDays: number;
  applyAndInterview: boolean;
  idVerification: boolean;
  aiAgentChecks: boolean;
  proctoringChecks: boolean;
}

const defaultInterviewSettings: InterviewSettings = {
  interviewName: 'Profile screening I',
  interviewDescription: 'Profile screening I',
  aiAgent: 'Olivia- English (Female, American)',
  evaluateLanguageProficiency: true,
  inviteExpiryDays: 7,
  applyAndInterview: true,
  idVerification: true,
  aiAgentChecks: true,
  proctoringChecks: true,
};

interface AIInterviewPanelProps {
  open: boolean;
  onClose: () => void;
}

type PanelView = 'preview' | 'edit' | 'manageSections';

const guideCategoryColors: Record<string, string> = {
  Technical: '#414996',
  Cognitive: '#2B8C4E',
  Psychometric: '#9D6309',
};

interface GuideSectionProps {
  title: string;
  questionCount: number;
  mins: number;
  description: string;
  aiNote?: string;
  questionItems: Question[];
  sectionType: SectionType;
  assessments?: Assessment[];
}

export function GuideSection({ title, questionCount, mins, description, aiNote, questionItems, sectionType, assessments }: GuideSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const isAssessment = sectionType === 'assessment';
  const assessmentCount = assessments?.length ?? 0;
  const hasExpandableContent = isAssessment ? assessmentCount > 0 : questionItems.length > 0;

  return (
    <div className="guide-section">
      <div className="guide-section-header">
        <div className="guide-section-info">
          <div className="guide-section-title-row">
            <span className="guide-section-title">{title}</span>
            {isAssessment ? (
              assessmentCount > 0 ? (
                <span className="section-pill">{assessmentCount} assessments</span>
              ) : (
                <span className="section-pill no-questions">No assessments added</span>
              )
            ) : (
              <>
                <span className="section-pill">{questionCount} questions</span>
                <span className="section-pill">{mins} mins</span>
              </>
            )}
          </div>
          <p className="guide-section-desc">{description}</p>
        </div>
        {hasExpandableContent && (
          <button className="chevron-btn" aria-label={expanded ? 'Collapse' : 'Expand'} onClick={() => setExpanded(e => !e)}>
            <Icon path={expanded ? mdiChevronUp : mdiChevronDown} size={1} color="#1A212E" />
          </button>
        )}
      </div>
      {expanded && !isAssessment && questionItems.length > 0 && (
        <div className="guide-questions-list">
          {questionItems.map(q => (
            <div key={q.id} className="guide-question-row">
              <span className="guide-question-title">{q.title}</span>
              <span className="guide-question-duration">
                <Icon path={mdiClockOutline} size={0.45} color="#9DA3AE" />
                {q.duration} min
              </span>
            </div>
          ))}
        </div>
      )}
      {expanded && isAssessment && assessmentCount > 0 && (
        <div className="expanded-assessments">
          {assessments!.map(asmt => (
            <div key={asmt.id} className="asmt-inline-card">
              <div className="asmt-inline-top">
                <div className="asmt-inline-info">
                  <div className="asmt-inline-title-row">
                    <span className="asmt-inline-title">{asmt.title}</span>
                    <span className="asmt-pick-source">{asmt.source}</span>
                  </div>
                  <div className="asmt-pick-meta">
                    <span className="asmt-category-pill" style={{ color: guideCategoryColors[asmt.category], borderColor: guideCategoryColors[asmt.category] }}>
                      {asmt.category}
                    </span>
                    <span className="asmt-pick-meta-dots">{asmt.metadata.join(' · ')} · {asmt.duration} mins</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {aiNote && !expanded && (
        <>
          <div className="ai-note-divider" />
          <div className="ai-note">
            <span className="ai-note-text">{aiNote}</span>
            <Icon path={mdiCreation} size={0.6} color="#414996" />
          </div>
        </>
      )}
    </div>
  );
}

export default function AIInterviewPanel({ open, onClose }: AIInterviewPanelProps) {
  const [panelView, setPanelView] = useState<PanelView>('preview');
  const [sections, setSections] = useState<Section[]>(() => JSON.parse(JSON.stringify(defaultSections)));
  const [editSections, setEditSections] = useState<Section[]>([]);
  const [addQuestionsOpen, setAddQuestionsOpen] = useState(false);
  const [addQuestionsSectionId, setAddQuestionsSectionId] = useState<string | null>(null);
  const [addAssessmentOpen, setAddAssessmentOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);
  const versionMenuRef = useRef<HTMLDivElement>(null);

  // Interview settings state
  const [interviewSettings, setInterviewSettings] = useState<InterviewSettings>(defaultInterviewSettings);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handleOpenSettings = useCallback(() => setSettingsModalOpen(true), []);
  const handleSaveSettings = useCallback((updated: InterviewSettings) => {
    setInterviewSettings(updated);
    setSettingsModalOpen(false);
  }, []);
  const handleCancelSettings = useCallback(() => setSettingsModalOpen(false), []);

  // Generate guide state
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [genSelectedTopicIds, setGenSelectedTopicIds] = useState<Set<string>>(new Set(defaultSelectedTopicIds));
  const [genDuration, setGenDuration] = useState(30);
  const [genSearchQuery, setGenSearchQuery] = useState('');
  const [genAddSearchOpen, setGenAddSearchOpen] = useState(false);
  const genSearchRef = useRef<HTMLInputElement>(null);
  const [genLoading, _setGenLoading] = useState(false);
  const [customGuide, setCustomGuide] = useState<Section[] | null>(null);
  const [activeGuide, setActiveGuide] = useState<'comprehensive' | 'custom'>('comprehensive');

  useEffect(() => {
    if (!open) {
      setPanelView('preview');
      setAddQuestionsOpen(false);
      setAddQuestionsSectionId(null);
      setSelectedSectionId(null);
      setExpandedSectionId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!versionMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (versionMenuRef.current && !versionMenuRef.current.contains(e.target as Node)) {
        setVersionMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [versionMenuOpen]);

  const handleEdit = useCallback(() => {
    setEditSections(JSON.parse(JSON.stringify(sections)));
    setPanelView('edit');
    setSelectedSectionId(null);
    setExpandedSectionId(null);
  }, [sections]);

  const handleEditConfirm = useCallback(() => {
    setSections(editSections);
    setPanelView('preview');
    setSelectedSectionId(null);
    setExpandedSectionId(null);
  }, [editSections]);

  const handleEditCancel = useCallback(() => {
    setPanelView('preview');
    setSelectedSectionId(null);
    setExpandedSectionId(null);
  }, []);

  const handleManageSections = useCallback(() => {
    setPanelView('manageSections');
  }, []);

  const handleManageConfirm = useCallback((updated: Section[]) => {
    setEditSections(updated);
    setPanelView('edit');
  }, []);

  const handleManageCancel = useCallback(() => {
    setPanelView('edit');
  }, []);

  const handleAddSection = useCallback((type: SectionType, afterSectionId?: string) => {
    if (type === 'assessment') {
      setAddAssessmentOpen(true);
      return;
    }
    const newSection = createEmptySection(type);
    setEditSections(prev => {
      if (afterSectionId) {
        const idx = prev.findIndex(s => s.id === afterSectionId);
        if (idx !== -1) {
          const next = [...prev];
          next.splice(idx + 1, 0, newSection);
          return next;
        }
      }
      return [...prev, newSection];
    });
    setSelectedSectionId(newSection.id);
    setExpandedSectionId(null);
    if (activeVersion >= 4) {
      setAddQuestionsSectionId(newSection.id);
      setAddQuestionsOpen(true);
    }
  }, [activeVersion]);

  const handleOpenAddQuestions = useCallback((sectionId: string) => {
    setAddQuestionsSectionId(sectionId);
    setAddQuestionsOpen(true);
  }, []);

  const handleAddQuestions = useCallback((questions: Question[]) => {
    if (!addQuestionsSectionId) return;
    setEditSections(prev =>
      prev.map(s =>
        s.id === addQuestionsSectionId
          ? { ...s, questions: [...s.questions, ...questions] }
          : s
      )
    );
    setSelectedSectionId(addQuestionsSectionId);
    setExpandedSectionId(addQuestionsSectionId);
    setAddQuestionsOpen(false);
    setAddQuestionsSectionId(null);
  }, [addQuestionsSectionId]);

  const handleCancelAddQuestions = useCallback(() => {
    setAddQuestionsOpen(false);
    setAddQuestionsSectionId(null);
  }, []);

  const handleAddAssessments = useCallback((assessments: Assessment[]) => {
    const assessmentSection: Section = {
      id: `sec-assessment-${Date.now()}`,
      type: 'assessment',
      title: 'Assessments',
      description: 'Assessments will be shared to candidate first',
      questions: [],
      assessments,
    };
    setEditSections(prev => {
      const existing = prev.find(s => s.type === 'assessment');
      if (existing) {
        setSelectedSectionId(existing.id);
        setExpandedSectionId(existing.id);
        return prev.map(s =>
          s.id === existing.id
            ? { ...s, assessments: [...(s.assessments || []), ...assessments] }
            : s
        );
      }
      setSelectedSectionId(assessmentSection.id);
      setExpandedSectionId(assessmentSection.id);
      return [assessmentSection, ...prev];
    });
    setAddAssessmentOpen(false);
  }, []);

  const handleCancelAddAssessment = useCallback(() => {
    setAddAssessmentOpen(false);
  }, []);

  const existingAssessmentIds = editSections
    .filter(s => s.type === 'assessment')
    .flatMap(s => (s.assessments || []).map(a => a.id));

  const handleDeleteQuestion = useCallback((sectionId: string, questionId: string) => {
    setEditSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
          : s
      )
    );
  }, []);

  const handleRemoveAssessment = useCallback((sectionId: string, assessmentId: string) => {
    setEditSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, assessments: (s.assessments || []).filter(a => a.id !== assessmentId) }
          : s
      )
    );
  }, []);

  const handleReorderQuestions = useCallback((sectionId: string, fromIndex: number, toIndex: number) => {
    setEditSections(prev =>
      prev.map(s => {
        if (s.id !== sectionId) return s;
        const qs = [...s.questions];
        const [moved] = qs.splice(fromIndex, 1);
        qs.splice(toIndex, 0, moved);
        return { ...s, questions: qs };
      })
    );
  }, []);

  const handleOpenGenerateModal = useCallback(() => {
    setGenSelectedTopicIds(new Set(defaultSelectedTopicIds));
    setGenDuration(60);
    setGenSearchQuery('');
    setGenAddSearchOpen(false);
    setGenerateModalOpen(true);
  }, []);

  const handleToggleTopic = useCallback((topicId: string) => {
    setGenSelectedTopicIds(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const [previewLoading, setPreviewLoading] = useState(false);

  const handleGenerateGuide = useCallback(() => {
    setGenerateModalOpen(false);
    setPreviewLoading(true);
    setTimeout(() => {
      const generated = JSON.parse(JSON.stringify(generatedGuideSections)) as Section[];
      const ts = Date.now();
      generated.forEach((s, si) => { s.id = `${s.id}-${ts}-${si}`; s.questions.forEach((q, qi) => { q.id = `${q.id}-${ts}-${qi}`; }); });
      setCustomGuide(generated);
      setSections(generated);
      setActiveGuide('custom');
      setPreviewLoading(false);
    }, 2500);
  }, []);

  const handleSelectGuide = useCallback((guide: 'comprehensive' | 'custom') => {
    setActiveGuide(guide);
    if (guide === 'comprehensive') {
      setSections(JSON.parse(JSON.stringify(defaultSections)));
    } else if (customGuide) {
      setSections(customGuide);
    }
  }, [customGuide]);

  const genSelectedTopics = allTopics.filter(t => genSelectedTopicIds.has(t.id));
  const unselectedTopics = allTopics.filter(t => !genSelectedTopicIds.has(t.id));
  const searchResultTopics = genSearchQuery
    ? unselectedTopics.filter(t => t.label.toLowerCase().includes(genSearchQuery.toLowerCase()))
    : unselectedTopics;

  const addQuestionsSectionType = addQuestionsSectionId
    ? editSections.find(s => s.id === addQuestionsSectionId)?.type ?? 'screening'
    : 'screening';

  const isEditing = panelView === 'edit' || panelView === 'manageSections';

  return (
    <>
      <div className={`panel-overlay ${open ? 'visible' : ''}`} onClick={onClose} />
      <div className={`ai-panel ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-left">
            <img src="/ai-interview-logo.png" alt="AI Interview" className="ai-logo-icon" />
            <h2 className="panel-title">AI interview</h2>
          </div>
          <div className="panel-header-right">
            {panelView === 'edit' && (
              <div className="version-switcher" ref={versionMenuRef}>
                <button
                  className="version-switcher-btn"
                  onClick={() => setVersionMenuOpen(prev => !prev)}
                >
                  <span>Versions</span>
                  <Icon path={mdiChevronDown} size={0.7} />
                </button>
                {versionMenuOpen && (
                  <div className="version-switcher-menu">
                    {([1, 2, 3, 4, 5] as const).map(v => (
                      <button
                        key={v}
                        className={`version-menu-item ${activeVersion === v ? 'active' : ''}`}
                        onClick={() => { setActiveVersion(v); setVersionMenuOpen(false); }}
                      >
                        Version {v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button className="panel-close-btn" onClick={onClose} aria-label="Close">
              <Icon path={mdiClose} size={0.85} color="#343C4C" />
            </button>
          </div>
        </div>

        <div className="panel-divider" />

        {/* Body */}
        <div className="panel-body">
          {/* Left sidebar - collapses in edit mode */}
          <div className={`panel-sidebar ${isEditing ? 'collapsed' : ''}`}>
            <div className="sidebar-content">
              <div className="candidates-selected">
                <p className="sidebar-label-bold">4 candidates selected</p>
                <div className="avatar-group">
                  <div className="avatar-sm" style={{ background: '#2C8CC9' }} />
                  <div className="avatar-sm" style={{ background: '#975590', marginLeft: -8 }} />
                  <div className="avatar-sm avatar-initials" style={{ background: '#993838', marginLeft: -8 }}>
                    FL
                  </div>
                  <div className="avatar-sm avatar-count" style={{ marginLeft: -8 }}>+1</div>
                </div>

                <div className="reviewer-row">
                  <div className="reviewer-divider" />
                  <div className="reviewer-info">
                    <span className="reviewer-text">
                      <strong>Reviewer:</strong>{' '}
                      <span className="reviewer-name">Jane Doe</span>{' '}
                      <Icon path={mdiInformationOutline} size={0.6} color="#69717F" className="inline-icon" />
                    </span>
                    <button className="icon-btn-sm" aria-label="Edit reviewer">
                      <Icon path={mdiPencilOutline} size={0.7} color="#4F5666" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="sidebar-section">
                <div className="section-label">
                  Pick a guide{' '}
                  <Icon path={mdiInformationOutline} size={0.6} color="#69717F" />
                </div>

                <div
                  className={`guide-card recommended${activeGuide === 'comprehensive' ? ' guide-card-active' : ''}${customGuide && activeGuide !== 'comprehensive' ? ' guide-card-dimmed' : ''}`}
                  onClick={() => handleSelectGuide('comprehensive')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="recommended-badge">Recommended</div>
                  <div className="guide-card-body">
                    <div className="guide-icon-tag">360°</div>
                    <div className="guide-card-info">
                      <span className="guide-card-title">Comprehensive evaluation</span>
                      <div className="guide-tags">
                        <span className="guide-tag">Profile</span>
                        <span className="guide-tag">Technical Q&A</span>
                        <span className="guide-tag">Coding</span>
                      </div>
                      <span className="guide-meta">10 questions · 60 mins</span>
                    </div>
                  </div>
                  <div className="recommended-footer">
                    <span>Faster hiring</span>
                    <span className="recommended-footer-dot">·</span>
                    <span>Richer insights</span>
                  </div>
                </div>

                {customGuide && (
                  <div
                    className={`guide-card custom-guide${activeGuide === 'custom' ? ' guide-card-active' : ' guide-card-dimmed'}`}
                    onClick={() => handleSelectGuide('custom')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="custom-badge">Custom</div>
                    <div className="guide-card-body">
                      <div className="guide-icon-tag custom-icon-tag">
                        <Icon path={mdiCreation} size={0.65} color="#414996" />
                      </div>
                      <div className="guide-card-info">
                        <span className="guide-card-title">Interview X</span>
                        <div className="guide-tags">
                          {genSelectedTopics.slice(0, 3).map(t => (
                            <span key={t.id} className="guide-tag">{t.label}</span>
                          ))}
                          {genSelectedTopics.length > 3 && (
                            <span className="guide-tag">+{genSelectedTopics.length - 3}</span>
                          )}
                        </div>
                        <span className="guide-meta">
                          {customGuide.reduce((sum, s) => sum + s.questions.length, 0)} questions · {customGuide.reduce((sum, s) => sum + computeSectionMins(s), 0)} mins
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sidebar-section">
                <div className="section-label">Other options</div>
                <div className="option-card" onClick={handleOpenGenerateModal} style={{ cursor: 'pointer' }}>
                  <div className="option-icon">
                    <Icon path={mdiCreation} size={1} color="#343C4C" />
                  </div>
                  <div className="option-info">
                    <span className="option-title">Create new guide</span>
                    <span className="option-desc">From scratch</span>
                  </div>
                </div>
              </div>

              <div className="library-card" onClick={() => setLibraryOpen(true)} style={{ cursor: 'pointer' }}>
                <div className="library-info">
                  <span className="library-title">AI interview library</span>
                  <span className="library-desc">Informed by market insights</span>
                </div>
                <div className="library-arrow">
                  <Icon path={mdiChevronRight} size={0.7} color="#2B3271" />
                </div>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className={`panel-content ${isEditing ? 'full-width' : ''}`}>
            {panelView === 'preview' && previewLoading && (
              <div className="preview-loading">
                <div className="preview-loading-skeleton">
                  <div className="skeleton-block skeleton-header" />
                  <div className="skeleton-block skeleton-card" />
                  <div className="skeleton-block skeleton-card-sm" />
                </div>
                <span className="preview-loading-text">Preview is loading</span>
              </div>
            )}

            {panelView === 'preview' && !previewLoading && (
              <>
                <div className="content-header">
                  <div className="content-header-left">
                    <h3 className="content-title">
                      {activeGuide === 'custom' ? 'Interview X' : 'Comprehensive evaluation'}
                    </h3>
                    <div className="content-tags">
                      {activeGuide === 'custom' ? (
                        <>
                          <span className="tag-accent">Custom guide</span>
                          <span className="tag-separator">·</span>
                          <span className="tag-muted">AI generated</span>
                          <span className="tag-separator">·</span>
                          <span className="tag-check-group">
                            <Icon path={mdiCreation} size={0.55} color="#414996" />
                            <span className="tag-muted">{genSelectedTopics.map(t => t.label).join(', ')}</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="tag-accent">360° interview</span>
                          <span className="tag-separator">·</span>
                          <span className="tag-muted">John Doe (AI agent)</span>
                          <span className="tag-separator">·</span>
                          <span className="tag-check-group">
                            <Icon path={mdiCheck} size={0.55} color="#69717F" />
                            <span className="tag-muted">Evaluate language proficiency</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="content-header-actions">
                    <Button
                      text="Edit"
                      variant={ButtonVariant.SystemUI}
                      iconProps={{ path: mdiPencilOutline as any }}
                      onClick={handleEdit}
                    />
                    <button className="icon-btn-neutral">
                      <Icon path={mdiDotsHorizontal} size={0.85} color="#343C4C" />
                    </button>
                  </div>
                </div>
                <div className="guide-sections">
                  {sections.map(s => (
                    <GuideSection
                      key={s.id}
                      title={s.title}
                      questionCount={s.questions.length}
                      mins={computeSectionMins(s)}
                      description={s.description}
                      aiNote={s.aiNote}
                      questionItems={s.questions}
                      sectionType={s.type}
                      assessments={s.assessments}
                    />
                  ))}
                </div>
              </>
            )}

            {panelView === 'edit' && (
              <EditView
                sections={editSections}
                selectedSectionId={selectedSectionId}
                expandedSectionId={expandedSectionId}
                activeVersion={activeVersion}
                interviewSettings={interviewSettings}
                onSelectSection={setSelectedSectionId}
                onExpandSection={setExpandedSectionId}
                onAddSection={handleAddSection}
                onOpenAddQuestions={handleOpenAddQuestions}
                onDeleteQuestion={handleDeleteQuestion}
                onReorderQuestions={handleReorderQuestions}
                onManageSections={handleManageSections}
                onUpdateSections={setEditSections}
                onRemoveAssessment={handleRemoveAssessment}
                onOpenSettings={handleOpenSettings}
              />
            )}

            {panelView === 'manageSections' && (
              <ManageSectionsView
                sections={editSections}
                onConfirm={handleManageConfirm}
                onCancel={handleManageCancel}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        {panelView === 'preview' && (
          <div className="panel-footer">
            <div className="footer-warning">
              <Icon path={mdiAlertOutline} size={0.7} color="#9D6309" />
              <span>Invites will only be sent to candidates with valid email addresses</span>
            </div>
            <button className="send-invite-btn">
              Send invite <span className="invite-count">8</span>
            </button>
          </div>
        )}

        {panelView === 'edit' && (
          <div className="edit-footer">
            <button className="edit-footer-cancel" onClick={handleEditCancel}>Cancel</button>
            <button className="edit-footer-confirm" onClick={handleEditConfirm}>Confirm</button>
          </div>
        )}

        {/* Edit settings modal */}
        {settingsModalOpen && (
          <EditSettingsModal
            settings={interviewSettings}
            onSave={handleSaveSettings}
            onCancel={handleCancelSettings}
            variant={activeVersion >= 4 ? 'panel' : 'modal'}
          />
        )}

        {/* Add questions overlay */}
        {addQuestionsOpen && (
          <AddQuestionsPanel
            sectionType={addQuestionsSectionType}
            onAdd={handleAddQuestions}
            onCancel={handleCancelAddQuestions}
          />
        )}

        {addAssessmentOpen && (
          <AddAssessmentPanel
            onAdd={handleAddAssessments}
            onCancel={handleCancelAddAssessment}
            existingAssessmentIds={existingAssessmentIds}
          />
        )}
      </div>

      {/* Library panel */}
      {libraryOpen && (
        <InterviewLibraryPanel onClose={() => setLibraryOpen(false)} />
      )}

      {/* Generate new guide modal */}
      {generateModalOpen && createPortal(
        <div className="gen-modal-overlay" onClick={() => !genLoading && setGenerateModalOpen(false)}>
          <div className="gen-modal" onClick={e => e.stopPropagation()}>
            {genLoading ? (
              <div className="gen-loading">
                <div className="gen-loading-spinner">
                  <Icon path={mdiLoading} size={2} color="#414996" spin />
                </div>
                <h3 className="gen-loading-title">Generating your interview guide</h3>
                <p className="gen-loading-desc">AI is creating sections based on your selected topics…</p>
              </div>
            ) : (
              <>
                <div className="gen-modal-header">
                  <h3 className="gen-modal-title">Generate new guide</h3>
                  <button className="gen-modal-close" onClick={() => setGenerateModalOpen(false)}>
                    <Icon path={mdiClose} size={0.85} color="#343C4C" />
                  </button>
                </div>

                <div className="gen-modal-body">
                  <div className="gen-field">
                    <label className="gen-field-label">
                      Duration presets
                      <Icon path={mdiInformationOutline} size={0.55} color="#9DA3AE" />
                    </label>
                    <div className="gen-duration-presets">
                      {durationPresets.map(d => (
                        <button
                          key={d}
                          className={`gen-duration-pill${genDuration === d ? ' gen-duration-active' : ''}`}
                          onClick={() => setGenDuration(d)}
                        >
                          {d} mins
                          {d === 60 && <span className="gen-duration-rec-tag">Recommended</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="gen-field">
                    <label className="gen-field-label">
                      Topics
                      <Icon path={mdiInformationOutline} size={0.55} color="#9DA3AE" />
                    </label>
                    <div className="gen-pills-wrap">
                      {genSelectedTopics.map(topic => (
                        <button
                          key={topic.id}
                          className="gen-pill gen-pill-selected"
                          onClick={() => handleToggleTopic(topic.id)}
                        >
                          <span>{topic.label}</span>
                          <Icon path={mdiClose} size={0.4} color="#0D6B5A" />
                        </button>
                      ))}
                      {!genAddSearchOpen && (
                        <button
                          className="gen-pill gen-pill-add-btn"
                          onClick={() => {
                            setGenAddSearchOpen(true);
                            setGenSearchQuery('');
                            setTimeout(() => genSearchRef.current?.focus(), 50);
                          }}
                        >
                          <Icon path={mdiPlus} size={0.55} color="#1999AC" />
                          <span>Add topic</span>
                        </button>
                      )}
                    </div>

                    {genAddSearchOpen && (
                      <div className="gen-inline-search">
                        <div className="gen-inline-search-bar">
                          <Icon path={mdiMagnify} size={0.7} color="#9DA3AE" />
                          <input
                            ref={genSearchRef}
                            className="gen-search-input"
                            placeholder="Search topics…"
                            value={genSearchQuery}
                            onChange={e => setGenSearchQuery(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Escape') { setGenAddSearchOpen(false); setGenSearchQuery(''); } }}
                          />
                          <button
                            className="gen-inline-search-close"
                            onClick={() => { setGenAddSearchOpen(false); setGenSearchQuery(''); }}
                          >
                            <Icon path={mdiClose} size={0.55} color="#69717F" />
                          </button>
                        </div>
                        {searchResultTopics.length > 0 && (
                          <div className="gen-inline-search-results">
                            {searchResultTopics.map(topic => (
                              <button
                                key={topic.id}
                                className="gen-inline-search-item"
                                onClick={() => {
                                  handleToggleTopic(topic.id);
                                  setGenSearchQuery('');
                                  genSearchRef.current?.focus();
                                }}
                              >
                                <Icon path={mdiPlus} size={0.55} color="#1999AC" />
                                <span>{topic.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResultTopics.length === 0 && genSearchQuery && (
                          <div className="gen-inline-search-empty">
                            No matching topics found
                          </div>
                        )}
                        {searchResultTopics.length === 0 && !genSearchQuery && (
                          <div className="gen-inline-search-empty">
                            All topics have been added
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="gen-modal-footer">
                  <button className="gen-scratch-link">Create from scratch</button>
                  <div className="gen-modal-footer-right">
                    <button className="gen-cancel-btn" onClick={() => setGenerateModalOpen(false)}>Cancel</button>
                    <button
                      className="gen-generate-btn"
                      disabled={genSelectedTopicIds.size === 0}
                      onClick={handleGenerateGuide}
                    >
                      <Icon path={mdiCreation} size={0.65} color="#2B3271" />
                      Generate guide
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
