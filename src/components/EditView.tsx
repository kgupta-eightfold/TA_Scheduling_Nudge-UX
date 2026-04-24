import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button, ButtonVariant, ButtonSize, ButtonShape } from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import {
  mdiPlus,
  mdiChevronDown,
  mdiChevronUp,
  mdiCheck,
  mdiCreation,
  mdiDotsVertical,
  mdiDeleteOutline,
  mdiFileDocumentOutline,
  mdiCodeBraces,
  mdiFormatListBulleted,
  mdiGraphOutline,
  mdiClockOutline,
  mdiSwapVertical,
  mdiClose,
  mdiAlertOutline,
  mdiClipboardCheckOutline,
  mdiHeartOutline,
  mdiAccountOutline,
  mdiStarOutline,
  mdiDragVertical,
  mdiLockOutline,
  mdiCheckCircleOutline,
  mdiTuneVariant,
  mdiCheckboxMarkedOutline,
  mdiPencilOutline,
} from '@mdi/js';

type QualifyingCriteria = 'none' | 'on_qualifying' | 'set_criteria';

const qualifyingCriteriaOptions: { value: QualifyingCriteria; label: string; description: string }[] = [
  { value: 'none', label: 'Add qualifying criteria', description: 'All candidates proceed to the interview' },
  { value: 'on_qualifying', label: 'On qualifying assessments', description: 'Only candidates who pass assessments proceed' },
  { value: 'set_criteria', label: 'Set criteria', description: 'Define custom pass/fail thresholds' },
];

interface UndoEntry {
  section: Section;
  index: number;
  timestamp: number;
}
import type { Section, SectionType } from '../data/interviewSections';
import { sectionTypeOptions, v4SidebarOptions, computeSectionMins } from '../data/interviewSections';
import type { InterviewSettings } from './AIInterviewPanel';

interface EditViewProps {
  sections: Section[];
  selectedSectionId: string | null;
  expandedSectionId: string | null;
  activeVersion: 1 | 2 | 3 | 4 | 5;
  interviewSettings?: InterviewSettings;
  onSelectSection: (id: string | null) => void;
  onExpandSection: (id: string | null) => void;
  onAddSection: (type: SectionType, afterSectionId?: string) => void;
  onOpenAddQuestions: (sectionId: string) => void;
  onDeleteQuestion: (sectionId: string, questionId: string) => void;
  onReorderQuestions: (sectionId: string, fromIndex: number, toIndex: number) => void;
  onManageSections: () => void;
  onUpdateSections: (sections: Section[]) => void;
  onRemoveAssessment?: (sectionId: string, assessmentId: string) => void;
  onOpenSettings?: () => void;
}

const categoryColors: Record<string, string> = {
  Technical: '#414996',
  Cognitive: '#2B8C4E',
  Psychometric: '#9D6309',
};

const sectionTypeIcons: Record<string, string> = {
  assessment: mdiClipboardCheckOutline,
  screening: mdiHeartOutline,
  functional: mdiAccountOutline,
  technical: mdiGraphOutline,
  coding: mdiCodeBraces,
  algorithmic: mdiFileDocumentOutline,
  case_study: mdiStarOutline,
};

export default function EditView({
  sections,
  selectedSectionId,
  expandedSectionId,
  activeVersion,
  interviewSettings,
  onSelectSection,
  onExpandSection,
  onAddSection,
  onOpenAddQuestions,
  onDeleteQuestion,
  onReorderQuestions,
  onManageSections,
  onUpdateSections,
  onRemoveAssessment,
  onOpenSettings,
}: EditViewProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragSectionId = useRef<string | null>(null);

  // V3 state
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [toolbarAddMenuSectionId, setToolbarAddMenuSectionId] = useState<string | null>(null);
  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [reorderSections, setReorderSections] = useState<Section[]>([]);
  const [reorderDragIdx, setReorderDragIdx] = useState<number | null>(null);
  const [reorderDragOverIdx, setReorderDragOverIdx] = useState<number | null>(null);

  // V4 scroll-to-new-section
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevSectionCount = useRef(sections.length);

  // V4 floating toolbar state
  const [v4HoveredSectionId, setV4HoveredSectionId] = useState<string | null>(null);
  const [v4ExpandedMenuSectionId, setV4ExpandedMenuSectionId] = useState<string | null>(null);
  const [v4ReorderDragOverIdx, setV4ReorderDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (sections.length > prevSectionCount.current && selectedSectionId) {
      const el = sectionRefs.current[selectedSectionId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    prevSectionCount.current = sections.length;
  }, [sections.length, selectedSectionId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    }
    if (addMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addMenuOpen]);

  useEffect(() => {
    if (!toolbarAddMenuSectionId) return;
    function handleClickOutside() {
      setToolbarAddMenuSectionId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toolbarAddMenuSectionId]);

  // Reset V4 expanded menu when clicking outside
  useEffect(() => {
    if (!v4ExpandedMenuSectionId) return;
    function handleClickOutside() {
      setV4ExpandedMenuSectionId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [v4ExpandedMenuSectionId]);

  const handleSectionClick = useCallback((sectionId: string) => {
    onSelectSection(sectionId);
  }, [onSelectSection]);

  const handleToggleExpand = useCallback((sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onExpandSection(expandedSectionId === sectionId ? null : sectionId);
  }, [expandedSectionId, onExpandSection]);

  const handleAddMenuSelect = useCallback((type: SectionType, afterSectionId?: string) => {
    setAddMenuOpen(false);
    setToolbarAddMenuSectionId(null);
    onAddSection(type, afterSectionId);
  }, [onAddSection]);

  const handleDragStart = useCallback((sectionId: string, index: number) => {
    dragSectionId.current = sectionId;
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((sectionId: string, toIndex: number) => {
    if (dragIndex !== null && dragSectionId.current === sectionId) {
      onReorderQuestions(sectionId, dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
    dragSectionId.current = null;
  }, [dragIndex, onReorderQuestions]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragSectionId.current = null;
  }, []);

  // Reorder modal handlers
  const openReorderModal = useCallback(() => {
    setReorderSections(JSON.parse(JSON.stringify(sections)));
    setReorderModalOpen(true);
  }, [sections]);

  const handleReorderDelete = useCallback((id: string) => {
    setReorderSections(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleReorderDragStart = useCallback((index: number) => {
    setReorderDragIdx(index);
  }, []);

  const handleReorderDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    setReorderDragOverIdx(index);
  }, []);

  const handleReorderDrop = useCallback((toIndex: number) => {
    if (reorderDragIdx === null) return;
    setReorderSections(prev => {
      const next = [...prev];
      const [moved] = next.splice(reorderDragIdx, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setReorderDragIdx(null);
    setReorderDragOverIdx(null);
  }, [reorderDragIdx]);

  const handleReorderDragEnd = useCallback(() => {
    setReorderDragIdx(null);
    setReorderDragOverIdx(null);
  }, []);

  const handleReorderConfirm = useCallback(() => {
    onUpdateSections(reorderSections);
    setReorderModalOpen(false);
  }, [reorderSections, onUpdateSections]);

  // V4: Delete section
  const handleV4DeleteSection = useCallback((sectionId: string) => {
    onUpdateSections(sections.filter(s => s.id !== sectionId));
    if (selectedSectionId === sectionId) onSelectSection(null);
    setV4ExpandedMenuSectionId(null);
  }, [sections, selectedSectionId, onUpdateSections, onSelectSection]);

  // V4: Inline reorder mode
  const [v4ReorderMode, setV4ReorderMode] = useState(false);
  const [v4ReorderDragFromIdx, setV4ReorderDragFromIdx] = useState<number | null>(null);

  const handleV4EnterReorder = useCallback(() => {
    setV4ReorderMode(true);
    setV4ExpandedMenuSectionId(null);
  }, []);

  const handleV4ReorderDragOver = useCallback((idx: number, e: React.DragEvent) => {
    e.preventDefault();
    setV4ReorderDragOverIdx(idx);
  }, []);

  const handleV4ReorderDrop = useCallback((toIdx: number) => {
    if (v4ReorderDragFromIdx === null || v4ReorderDragFromIdx === toIdx) {
      setV4ReorderDragFromIdx(null);
      setV4ReorderDragOverIdx(null);
      return;
    }
    const next = [...sections];
    const [moved] = next.splice(v4ReorderDragFromIdx, 1);
    next.splice(toIdx, 0, moved);
    onUpdateSections(next);
    setV4ReorderDragFromIdx(null);
    setV4ReorderDragOverIdx(null);
    setV4ReorderMode(false);
  }, [v4ReorderDragFromIdx, sections, onUpdateSections]);

  const handleV4ReorderDragEnd = useCallback(() => {
    setV4ReorderDragFromIdx(null);
    setV4ReorderDragOverIdx(null);
    setV4ReorderMode(false);
  }, []);

  // V5: Direct drag reorder + undo delete
  const [v5DragFromIdx, setV5DragFromIdx] = useState<number | null>(null);
  const [v5DragOverIdx, setV5DragOverIdx] = useState<number | null>(null);
  const [v5UndoStack, setV5UndoStack] = useState<UndoEntry[]>([]);

  // Assessment expanded state
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);

  // Qualifying criteria state
  const [qualifyingCriteria, setQualifyingCriteria] = useState<QualifyingCriteria>('none');
  const [qualifyingMenuOpen, setQualifyingMenuOpen] = useState(false);
  const qualifyingMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qualifyingMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (qualifyingMenuRef.current && !qualifyingMenuRef.current.contains(e.target as Node)) {
        setQualifyingMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [qualifyingMenuOpen]);

  const handleV5DragStart = useCallback((idx: number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    setV5DragFromIdx(idx);
  }, []);

  const handleV5DragOver = useCallback((idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setV5DragOverIdx(idx);
  }, []);

  const handleV5Drop = useCallback((toIdx: number) => {
    if (v5DragFromIdx === null || v5DragFromIdx === toIdx) {
      setV5DragFromIdx(null);
      setV5DragOverIdx(null);
      return;
    }
    const next = [...sections];
    const [moved] = next.splice(v5DragFromIdx, 1);
    next.splice(toIdx, 0, moved);
    onUpdateSections(next);
    setV5DragFromIdx(null);
    setV5DragOverIdx(null);
  }, [v5DragFromIdx, sections, onUpdateSections]);

  const handleV5DragEnd = useCallback(() => {
    setV5DragFromIdx(null);
    setV5DragOverIdx(null);
  }, []);

  const handleV5Delete = useCallback((sectionId: string) => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    const deleted = sections[idx];
    onUpdateSections(sections.filter(s => s.id !== sectionId));
    if (selectedSectionId === sectionId) onSelectSection(null);
    setV5UndoStack(prev => [...prev, { section: deleted, index: idx, timestamp: Date.now() }]);
  }, [sections, selectedSectionId, onUpdateSections, onSelectSection]);

  const handleV5Undo = useCallback((entry: UndoEntry) => {
    const next = [...sections];
    const insertIdx = Math.min(entry.index, next.length);
    next.splice(insertIdx, 0, entry.section);
    onUpdateSections(next);
    setV5UndoStack(prev => prev.filter(e => e.timestamp !== entry.timestamp));
  }, [sections, onUpdateSections]);

  const handleV5DismissUndo = useCallback((timestamp: number) => {
    setV5UndoStack(prev => prev.filter(e => e.timestamp !== timestamp));
  }, []);

  // Auto-dismiss undo toasts after 5 seconds
  useEffect(() => {
    if (v5UndoStack.length === 0) return;
    const oldest = v5UndoStack[0];
    const elapsed = Date.now() - oldest.timestamp;
    const remaining = Math.max(5000 - elapsed, 0);
    const timer = setTimeout(() => {
      setV5UndoStack(prev => prev.filter(e => e.timestamp !== oldest.timestamp));
    }, remaining);
    return () => clearTimeout(timer);
  }, [v5UndoStack]);

  const renderAddSectionMenu = (afterSectionId?: string) => (
    <div className="add-sections-menu">
      {sectionTypeOptions.map(opt => (
        <button
          key={opt.type}
          className="add-sections-menu-item"
          onClick={(e) => { e.stopPropagation(); handleAddMenuSelect(opt.type, afterSectionId); }}
        >
          <div className="menu-item-icon">
            <Icon path={sectionTypeIcons[opt.type] || mdiFormatListBulleted} size={0.8} color="#343C4C" />
          </div>
          <div className="menu-item-text">
            <span className="menu-item-title">{opt.title}</span>
            <span className="menu-item-desc">{opt.description}</span>
          </div>
        </button>
      ))}
    </div>
  );

  const renderSectionCard = (section: Section) => {
    const isSelected = selectedSectionId === section.id;
    const isExpanded = expandedSectionId === section.id;
    const hasQuestions = section.questions.length > 0;
    const mins = computeSectionMins(section);

    return (
      <div
        key={section.id}
        ref={el => { sectionRefs.current[section.id] = el; }}
        className={`edit-section-card ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
        onClick={() => handleSectionClick(section.id)}
      >
        <div className="edit-section-top">
          <div className="edit-section-info">
            <div className="edit-section-title-row">
              <span className="edit-section-title">{section.title}</span>
              {hasQuestions ? (
                <>
                  <span className="section-pill">{section.questions.length} questions</span>
                  <span className="section-pill">{mins} mins</span>
                </>
              ) : (
                <>
                  <span className="section-pill no-questions">No questions added</span>
                  <span className="section-pill no-questions">0 mins</span>
                </>
              )}
            </div>
            <span className="edit-section-desc">{section.description}</span>
          </div>
          <div className="edit-section-actions">
            {isExpanded && hasQuestions && (section.type === 'coding' || section.type === 'algorithmic') && (
              <button className="create-pool-btn" onClick={e => e.stopPropagation()}>
                <Icon path={mdiFormatListBulleted} size={0.65} />
                <span>Create pool</span>
              </button>
            )}
            <button
              className={activeVersion >= 2 ? 'add-btn-teal-outline' : 'add-btn-outline'}
              onClick={(e) => { e.stopPropagation(); onOpenAddQuestions(section.id); }}
            >
              <Icon path={mdiPlus} size={0.6} />
              <span>Add</span>
            </button>
            <button
              className="chevron-btn"
              onClick={(e) => handleToggleExpand(section.id, e)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={1} color="#1A212E" />
            </button>
          </div>
        </div>

        {section.aiNote && !isExpanded && (
          <>
            <div className="ai-note-divider" />
            <div className="ai-note">
              <span className="ai-note-text">{section.aiNote}</span>
              <Icon path={mdiCreation} size={0.6} color="#414996" />
            </div>
          </>
        )}

        {isExpanded && hasQuestions && (
          <div className="expanded-questions">
            {section.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`question-row ${dragOverIndex === idx && dragSectionId.current === section.id ? 'drag-over' : ''}`}
                draggable
                onDragStart={() => handleDragStart(section.id, idx)}
                onDragOver={(e) => handleDragOver(idx, e)}
                onDrop={() => handleDrop(section.id, idx)}
                onDragEnd={handleDragEnd}
              >
                <div className="question-row-inner">
                  <div className="drag-handle" aria-label="Drag to reorder">
                    <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" />
                    <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" style={{ marginLeft: -14 }} />
                  </div>
                  <div className="question-info">
                    <span className="question-title">{q.title}</span>
                    <div className="question-meta">
                      {q.difficulty && (
                        <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
                          {q.difficulty === 'Easy' && <Icon path={mdiGraphOutline} size={0.5} />}
                          {q.difficulty === 'Medium' && <Icon path={mdiGraphOutline} size={0.5} />}
                          {q.difficulty === 'Difficult' && <Icon path={mdiGraphOutline} size={0.5} />}
                          {q.difficulty}
                        </span>
                      )}
                      <span className="question-duration">
                        <Icon path={mdiClockOutline} size={0.5} color="#69717F" /> {q.duration} min
                      </span>
                      {q.languages && (
                        <span className="question-langs">
                          <Icon path={mdiCodeBraces} size={0.5} /> {q.languages.join(', ')}
                          {q.extraLanguageCount ? <span className="lang-extra">+{q.extraLanguageCount}</span> : null}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="chevron-btn-sm" onClick={e => e.stopPropagation()}>
                    <Icon path={mdiChevronDown} size={0.8} color="#69717F" />
                  </button>
                </div>
                <button
                  className="delete-question-btn"
                  onClick={(e) => { e.stopPropagation(); onDeleteQuestion(section.id, q.id); }}
                  aria-label="Delete question"
                >
                  <Icon path={mdiDeleteOutline} size={0.8} color="#69717F" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const addSectionDropdown = (
    <div className={activeVersion === 2 ? 'v2-add-section-wrapper' : 'add-sections-action'} ref={addMenuRef}>
      <button
        className={activeVersion === 2 ? 'v2-pill-btn' : 'add-btn-teal'}
        onClick={() => setAddMenuOpen(prev => !prev)}
      >
        <span>Add section</span>
        <Icon path={mdiChevronDown} size={0.65} />
      </button>
      {addMenuOpen && renderAddSectionMenu()}
    </div>
  );

  return (
    <div className={`edit-view${activeVersion >= 4 ? ' edit-view-v4' : ''}`}>
      {/* Header (outside layout for V1-V3, inside v4/v5-content for V4+) */}
      {activeVersion < 4 && (
        <div className="edit-view-header">
          <div className="edit-view-header-left">
            <h3 className="content-title">Comprehensive evaluation</h3>
            <div className="content-tags">
              <span className="tag-accent">360° interview</span>
              <span className="tag-separator">·</span>
              <span className="tag-muted">John Doe (AI agent)</span>
              <span className="tag-separator">·</span>
              <span className="tag-check-group">
                <Icon path={mdiCheck} size={0.55} color="#69717F" />
                <span className="tag-muted">Evaluate language proficiency</span>
              </span>
            </div>
          </div>
          <button className="manage-sections-link" onClick={onManageSections}>
            Manage sections
          </button>
        </div>
      )}

      {activeVersion === 1 ? (
        <>
          {/* V1: Assessments row */}
          <div className="edit-section-card assessments-card">
            <div className="edit-section-info">
              <span className="edit-section-title">Add assessments</span>
              <span className="edit-section-desc">Assessments will be shared to candidate first</span>
            </div>
            <button className="add-btn-outline">
              <Icon path={mdiPlus} size={0.7} />
            </button>
          </div>

          {/* V1: Section cards */}
          <div className="edit-sections-list">
            {sections.map(section => renderSectionCard(section))}
          </div>

          {/* V1: Add sections row */}
          <div className="add-sections-row">
            <div className="add-sections-info">
              <span className="add-sections-title">Add sections</span>
              <span className="add-sections-desc">You can re-order the sections for the desired candidate experience</span>
            </div>
            {addSectionDropdown}
          </div>
        </>
      ) : activeVersion === 2 ? (
        <>
          {/* V2: Centered flow layout */}
          <div className="v2-flow">
            <div className="v2-flow-center">
              <button className="v2-pill-btn">Add assessment</button>
            </div>
            <div className="v2-connector" />
            <div className="v2-sections-list">
              {sections.map((section, idx) => (
                <div key={section.id}>
                  {renderSectionCard(section)}
                  {idx < sections.length - 1 && <div className="v2-connector" />}
                </div>
              ))}
            </div>
            <div className="v2-connector" />
            <div className="v2-flow-center">
              {addSectionDropdown}
            </div>
          </div>
        </>
      ) : activeVersion === 3 ? (
        <>
          {/* V3: Centered flow with toolbar, no bottom add section */}
          <div className="v2-flow">
            <div className="v2-flow-center">
              <button className="v2-pill-btn">Add assessment</button>
            </div>
            <div className="v2-connector" />
            <div className="v2-sections-list">
              {sections.map((section, idx) => {
                const showToolbar = section.id === selectedSectionId || section.id === hoveredSectionId;
                return (
                  <div key={section.id}>
                    <div
                      className="v3-section-wrapper"
                      onMouseEnter={() => setHoveredSectionId(section.id)}
                      onMouseLeave={() => {
                        setHoveredSectionId(null);
                        if (toolbarAddMenuSectionId === section.id && section.id !== selectedSectionId) {
                          setToolbarAddMenuSectionId(null);
                        }
                      }}
                    >
                      {renderSectionCard(section)}
                      <div className={`v3-toolbar ${showToolbar ? 'visible' : ''}`}>
                        <div className="v3-toolbar-btn-wrapper">
                          <button
                            className="v3-toolbar-btn"
                            data-tooltip="Add section"
                            onClick={(e) => {
                              e.stopPropagation();
                              setToolbarAddMenuSectionId(
                                toolbarAddMenuSectionId === section.id ? null : section.id
                              );
                            }}
                          >
                            <Icon path={mdiPlus} size={0.7} color="#343C4C" />
                          </button>
                          {toolbarAddMenuSectionId === section.id && (
                            <div className="v3-toolbar-menu" onMouseDown={e => e.stopPropagation()}>
                              {renderAddSectionMenu(section.id)}
                            </div>
                          )}
                        </div>
                        <button
                          className="v3-toolbar-btn"
                          data-tooltip="Re-order section"
                          onClick={(e) => { e.stopPropagation(); openReorderModal(); }}
                        >
                          <Icon path={mdiSwapVertical} size={0.7} color="#343C4C" />
                        </button>
                      </div>
                    </div>
                    {idx < sections.length - 1 && <div className="v2-connector" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* V3: Reorder modal (portaled to body for full-page overlay) */}
          {reorderModalOpen && createPortal(
            <div className="reorder-modal-overlay" onClick={() => setReorderModalOpen(false)}>
              <div className="reorder-modal" onClick={e => e.stopPropagation()}>
                <div className="reorder-modal-header">
                  <h3 className="reorder-modal-title">Manage sections</h3>
                  <button
                    className="reorder-modal-close"
                    onClick={() => setReorderModalOpen(false)}
                    aria-label="Close"
                  >
                    <Icon path={mdiClose} size={0.85} color="#343C4C" />
                  </button>
                </div>

                <div className="manage-warning-banner">
                  <Icon path={mdiAlertOutline} size={0.7} color="#9D6309" />
                  <span>AI agent will ask questions in this order</span>
                </div>

                <div className="manage-sections-list">
                  {reorderSections.map((section, idx) => {
                    const mins = computeSectionMins(section);
                    return (
                      <div
                        key={section.id}
                        className={`manage-section-card ${reorderDragOverIdx === idx ? 'drag-over' : ''}`}
                        draggable
                        onDragStart={() => handleReorderDragStart(idx)}
                        onDragOver={(e) => handleReorderDragOver(idx, e)}
                        onDrop={() => handleReorderDrop(idx)}
                        onDragEnd={handleReorderDragEnd}
                      >
                        <div className="drag-handle" aria-label="Drag to reorder">
                          <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" />
                          <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" style={{ marginLeft: -14 }} />
                        </div>
                        <div className="manage-section-info">
                          <div className="manage-section-title-row">
                            <span className="edit-section-title">{section.title}</span>
                            <span className="section-pill">{section.questions.length} questions</span>
                            <span className="section-pill">{mins} mins</span>
                          </div>
                        </div>
                        <button
                          className="delete-question-btn"
                          onClick={() => handleReorderDelete(section.id)}
                          aria-label="Remove section"
                        >
                          <Icon path={mdiDeleteOutline} size={0.8} color="#69717F" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="reorder-modal-footer">
                  <button className="edit-footer-cancel" onClick={() => setReorderModalOpen(false)}>Cancel</button>
                  <button className="edit-footer-confirm" onClick={handleReorderConfirm}>Done</button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      ) : activeVersion === 4 ? (
        <>
          {/* V4: Sidebar + section cards */}
          <div className="v4-layout">
            <div className="v4-sidebar">
              <div className="v4-sidebar-title">Add sections to the interview</div>
              {v4SidebarOptions.map((opt) => (
                <React.Fragment key={opt.type}>
                  <button
                    className="v4-sidebar-item"
                    onClick={() => onAddSection(opt.type)}
                  >
                    <div className="v4-sidebar-item-text">
                      <span className="v4-sidebar-item-title">{opt.title}</span>
                      <span className="v4-sidebar-item-desc">{opt.description}</span>
                    </div>
                  </button>
                  {opt.type === 'assessment' && <div className="v4-sidebar-divider" />}
                </React.Fragment>
              ))}
            </div>
            <div className="v4-content">
              <div className="edit-view-header">
                <div className="edit-view-header-left">
                  <h3 className="content-title">{interviewSettings?.interviewName || 'Comprehensive evaluation'}</h3>
                  <div className="content-tags">
                    <span className="tag-accent">360° interview</span>
                    <span className="tag-separator">·</span>
                    <span className="tag-muted">{interviewSettings?.aiAgent || 'John Doe (AI agent)'}</span>
                    <span className="tag-separator">·</span>
                    {interviewSettings?.evaluateLanguageProficiency !== false && (
                      <span className="tag-check-group">
                        <Icon path={mdiCheck} size={0.55} color="#69717F" />
                        <span className="tag-muted">Evaluate language proficiency</span>
                      </span>
                    )}
                  </div>
                </div>
                {onOpenSettings && (
                  <button className="v4-header-settings-btn" onClick={onOpenSettings} aria-label="Edit settings">
                    <Icon path={mdiPencilOutline} size={0.7} color="#4F5666" />
                  </button>
                )}
              </div>
              {v4ReorderMode ? (
                <div className="v4-reorder-list">
                  {sections.map((section, idx) => {
                    const mins = computeSectionMins(section);
                    return (
                      <div
                        key={section.id}
                        className={`manage-section-card${v4ReorderDragOverIdx === idx ? ' drag-over' : ''}`}
                        draggable
                        onDragStart={() => setV4ReorderDragFromIdx(idx)}
                        onDragOver={(e) => handleV4ReorderDragOver(idx, e)}
                        onDrop={() => handleV4ReorderDrop(idx)}
                        onDragEnd={handleV4ReorderDragEnd}
                      >
                        <div className="drag-handle" aria-label="Drag to reorder">
                          <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" />
                          <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" style={{ marginLeft: -14 }} />
                        </div>
                        <div className="manage-section-info">
                          <div className="manage-section-title-row">
                            <span className="edit-section-title">{section.title}</span>
                            <span className="section-pill">{section.questions.length} questions</span>
                            <span className="section-pill">{mins} mins</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="edit-sections-list">
                  {sections.map((section) => {
                    const showToolbar =
                      section.id === selectedSectionId ||
                      section.id === v4HoveredSectionId;
                    const isMenuExpanded = v4ExpandedMenuSectionId === section.id;

                    return (
                      <div
                        key={section.id}
                        className="v4-section-wrapper"
                        onMouseEnter={() => setV4HoveredSectionId(section.id)}
                        onMouseLeave={() => {
                          setV4HoveredSectionId(null);
                          if (section.id !== selectedSectionId) {
                            setV4ExpandedMenuSectionId(prev => prev === section.id ? null : prev);
                          }
                        }}
                      >
                        {renderSectionCard(section)}
                        <div
                          className={`v4-floating-toolbar ${showToolbar ? 'visible' : ''}`}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <button
                            className="v4-ftb-btn"
                            data-tooltip="Re-order"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleV4EnterReorder();
                            }}
                          >
                            <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" />
                            <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" style={{ marginLeft: -14 }} />
                          </button>
                          {isMenuExpanded ? (
                            <>
                              <div className="v4-ftb-divider" />
                              <button
                                className="v4-ftb-btn v4-ftb-delete"
                                data-tooltip="Delete section"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleV4DeleteSection(section.id);
                                }}
                              >
                                <Icon path={mdiDeleteOutline} size={0.7} color="#993838" />
                              </button>
                            </>
                          ) : (
                            <button
                              className="v4-ftb-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setV4ExpandedMenuSectionId(section.id);
                              }}
                            >
                              <Icon path={mdiChevronDown} size={0.8} color="#69717F" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* V5: Direct manipulation — inline drag reorder + delete with undo */}
          <div className="v4-layout">
            <div className="v4-sidebar">
              <div className="v4-sidebar-title">Add sections to the interview</div>
              {v4SidebarOptions.map((opt) => (
                <React.Fragment key={opt.type}>
                  <div
                    className="v4-sidebar-item"
                    onClick={() => onAddSection(opt.type)}
                  >
                    <div className="v4-sidebar-item-text">
                      <span className="v4-sidebar-item-title">{opt.title}</span>
                      <span className="v4-sidebar-item-desc">{opt.description}</span>
                    </div>
                    <div className="v4-sidebar-item-add">
                      <Button
                        variant={ButtonVariant.Neutral}
                        size={ButtonSize.Small}
                        iconProps={{ path: mdiPlus as any }}
                        onClick={(e) => { e.stopPropagation(); onAddSection(opt.type); }}
                      />
                    </div>
                  </div>
                  {opt.type === 'assessment' && <div className="v4-sidebar-divider" />}
                </React.Fragment>
              ))}
            </div>
            <div className="v4-content">
              <div className="edit-view-header">
                <div className="edit-view-header-left">
                  <h3 className="content-title">{interviewSettings?.interviewName || 'Comprehensive evaluation'}</h3>
                  <div className="content-tags">
                    <span className="tag-accent">360° interview</span>
                    <span className="tag-separator">·</span>
                    <span className="tag-muted">{interviewSettings?.aiAgent || 'John Doe (AI agent)'}</span>
                    <span className="tag-separator">·</span>
                    {interviewSettings?.evaluateLanguageProficiency !== false && (
                      <span className="tag-check-group">
                        <Icon path={mdiCheck} size={0.55} color="#69717F" />
                        <span className="tag-muted">Evaluate language proficiency</span>
                      </span>
                    )}
                  </div>
                </div>
                {onOpenSettings && (
                  <button className="v4-header-settings-btn" onClick={onOpenSettings} aria-label="Edit settings">
                    <Icon path={mdiPencilOutline} size={0.7} color="#4F5666" />
                  </button>
                )}
              </div>
              <div className="edit-sections-list v5-sections-list">
                {(() => {
                  const assessmentSections = sections.filter(s => s.type === 'assessment');
                  const interviewSections = sections.filter(s => s.type !== 'assessment');
                  const assessmentCount = assessmentSections.length;

                  const renderV5SectionRow = (section: Section, _idx: number) => {
                    const isSelected = selectedSectionId === section.id;
                    const isExpanded = expandedSectionId === section.id;
                    const hasQuestions = section.questions.length > 0;
                    const mins = computeSectionMins(section);
                    const globalIdx = sections.indexOf(section);
                    const isDragOver = v5DragOverIdx === globalIdx && v5DragFromIdx !== globalIdx;
                    const isAssessment = section.type === 'assessment';

                    return (
                      <div
                        key={section.id}
                        className={`v5-section-row${isDragOver ? ' v5-drop-above' : ''}${v5DragFromIdx === globalIdx ? ' v5-dragging' : ''}${isAssessment ? ' v5-no-reorder' : ''}`}
                        onDragOver={isAssessment ? undefined : (e) => handleV5DragOver(globalIdx, e)}
                        onDrop={isAssessment ? undefined : () => handleV5Drop(globalIdx)}
                      >
                        {!isAssessment && (
                          <div
                            className="v5-drag-handle"
                            draggable
                            onDragStart={(e) => handleV5DragStart(globalIdx, e)}
                            onDragEnd={handleV5DragEnd}
                            data-tooltip="Re-order"
                          >
                            <Icon path={mdiDragVertical} size={0.85} color="#9DA3AE" />
                          </div>
                        )}
                        <div
                          ref={el => { sectionRefs.current[section.id] = el; }}
                          className={`edit-section-card ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => handleSectionClick(section.id)}
                        >
                        <div className="edit-section-top">
                          <div className="edit-section-info">
                            <div className="edit-section-title-row">
                              <span className="edit-section-title">{section.title}</span>
                              {isAssessment ? (
                                (section.assessments?.length ?? 0) > 0 ? (
                                  <span className="section-pill">{section.assessments!.length} assessments</span>
                                ) : (
                                  <span className="section-pill no-questions">No assessments added</span>
                                )
                              ) : hasQuestions ? (
                                <>
                                  <span className="section-pill">{section.questions.length} questions</span>
                                  <span className="section-pill">{mins} mins</span>
                                </>
                              ) : (
                                <>
                                  <span className="section-pill no-questions">No questions added</span>
                                  <span className="section-pill no-questions">0 mins</span>
                                </>
                              )}
                            </div>
                            <span className="edit-section-desc">{section.description}</span>
                          </div>
                          <div className="edit-section-actions">
                            {isExpanded && hasQuestions && (section.type === 'coding' || section.type === 'algorithmic') && (
                              <button className="create-pool-btn" onClick={e => e.stopPropagation()}>
                                <Icon path={mdiFormatListBulleted} size={0.65} />
                                <span>Create pool</span>
                              </button>
                            )}
                            <button
                              className="add-btn-teal-outline"
                              onClick={(e) => { e.stopPropagation(); isAssessment ? onAddSection('assessment') : onOpenAddQuestions(section.id); }}
                            >
                              <Icon path={mdiPlus} size={0.6} />
                              <span>Add</span>
                            </button>
                            {((isAssessment && (section.assessments?.length ?? 0) > 0) || (!isAssessment)) && (
                              <button
                                className="chevron-btn"
                                onClick={(e) => handleToggleExpand(section.id, e)}
                                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                <Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={1} color="#1A212E" />
                              </button>
                            )}
                          </div>
                        </div>
                        {section.aiNote && !isExpanded && (
                          <>
                            <div className="ai-note-divider" />
                            <div className="ai-note">
                              <span className="ai-note-text">{section.aiNote}</span>
                              <Icon path={mdiCreation} size={0.6} color="#414996" />
                            </div>
                          </>
                        )}

                        {/* Assessment items */}
                        {isAssessment && isExpanded && (section.assessments?.length ?? 0) > 0 && (
                          <div className="expanded-assessments">
                            {section.assessments!.map(asmt => {
                              const asmtExpanded = expandedAssessmentId === asmt.id;
                              return (
                                <div key={asmt.id} className="asmt-inline-card">
                                  <div className="asmt-inline-top" onClick={() => setExpandedAssessmentId(asmtExpanded ? null : asmt.id)}>
                                    <div className="asmt-inline-info">
                                      <div className="asmt-inline-title-row">
                                        <span className="asmt-inline-title">{asmt.title}</span>
                                        <span className="asmt-pick-source">{asmt.source}</span>
                                      </div>
                                      <div className="asmt-pick-meta">
                                        <span className="asmt-category-pill" style={{ color: categoryColors[asmt.category], borderColor: categoryColors[asmt.category] }}>
                                          {asmt.category}
                                        </span>
                                        <span className="asmt-pick-meta-dots">{asmt.metadata.join(' · ')} · {asmt.duration} mins</span>
                                      </div>
                                    </div>
                                    <div className="asmt-inline-actions">
                                      <button className="chevron-btn-sm" onClick={e => { e.stopPropagation(); setExpandedAssessmentId(asmtExpanded ? null : asmt.id); }}>
                                        <Icon path={asmtExpanded ? mdiChevronUp : mdiChevronDown} size={0.8} color="#69717F" />
                                      </button>
                                      <button
                                        className="delete-question-btn"
                                        onClick={e => { e.stopPropagation(); onRemoveAssessment?.(section.id, asmt.id); }}
                                        aria-label="Remove assessment"
                                      >
                                        <Icon path={mdiDeleteOutline} size={0.8} color="#69717F" />
                                      </button>
                                    </div>
                                  </div>
                                  {asmtExpanded && (
                                    <div className="asmt-inline-expanded">
                                      <p className="asmt-inline-desc">{asmt.description}</p>
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
                                  <div className="asmt-inline-footer">
                                    <Icon path={mdiCheckboxMarkedOutline} size={0.55} color="#6B7C3A" />
                                    <span className="asmt-cutoff-text">Cutoff — {asmt.cutoff}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Question items (non-assessment sections) */}
                        {!isAssessment && isExpanded && hasQuestions && (
                          <div className="expanded-questions">
                            {section.questions.map((q, qIdx) => (
                              <div
                                key={q.id}
                                className={`question-row ${dragOverIndex === qIdx && dragSectionId.current === section.id ? 'drag-over' : ''}`}
                                draggable
                                onDragStart={(e) => { e.stopPropagation(); handleDragStart(section.id, qIdx); }}
                                onDragOver={(e) => { e.stopPropagation(); handleDragOver(qIdx, e); }}
                                onDrop={(e) => { e.stopPropagation(); handleDrop(section.id, qIdx); }}
                                onDragEnd={handleDragEnd}
                              >
                                <div className="question-row-inner">
                                  <div className="drag-handle" aria-label="Drag to reorder">
                                    <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" />
                                    <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" style={{ marginLeft: -14 }} />
                                  </div>
                                  <div className="question-info">
                                    <span className="question-title">{q.title}</span>
                                    <div className="question-meta">
                                      {q.difficulty && (
                                        <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
                                          <Icon path={mdiGraphOutline} size={0.5} />
                                          {q.difficulty}
                                        </span>
                                      )}
                                      <span className="question-duration">
                                        <Icon path={mdiClockOutline} size={0.5} color="#69717F" /> {q.duration} min
                                      </span>
                                      {q.languages && (
                                        <span className="question-langs">
                                          <Icon path={mdiCodeBraces} size={0.5} /> {q.languages.join(', ')}
                                          {q.extraLanguageCount ? <span className="lang-extra">+{q.extraLanguageCount}</span> : null}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button className="chevron-btn-sm" onClick={e => e.stopPropagation()}>
                                    <Icon path={mdiChevronDown} size={0.8} color="#69717F" />
                                  </button>
                                </div>
                                <button
                                  className="delete-question-btn"
                                  onClick={(e) => { e.stopPropagation(); onDeleteQuestion(section.id, q.id); }}
                                  aria-label="Delete question"
                                >
                                  <Icon path={mdiDeleteOutline} size={0.8} color="#69717F" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="v5-row-actions">
                        <button
                          className="v5-add-btn"
                          onClick={(e) => { e.stopPropagation(); handleAddMenuSelect(section.type, section.id); }}
                          data-tooltip="Add section"
                        >
                          <Icon path={mdiPlus} size={0.7} color="#69717F" />
                        </button>
                        <Button
                          variant={ButtonVariant.Default}
                          disruptive
                          iconProps={{ path: mdiDeleteOutline as any }}
                          size={ButtonSize.Small}
                          shape={ButtonShape.Round}
                          ariaLabel="Delete section"
                          onClick={(e) => { e.stopPropagation(); handleV5Delete(section.id); }}
                        />
                      </div>
                    </div>
                  );
                  };

                  return (
                    <>
                      {/* Assessment sections */}
                      {assessmentSections.map((s, i) => renderV5SectionRow(s, i))}

                      {/* Qualifying criteria divider */}
                      {assessmentCount > 0 && (
                        <div className="qc-divider" ref={qualifyingMenuRef}>
                          <div className="qc-line" />
                          <button
                            className={`qc-touchpoint${qualifyingCriteria !== 'none' ? ' qc-active' : ''}`}
                            onClick={() => setQualifyingMenuOpen(prev => !prev)}
                          >
                            <Icon
                              path={qualifyingCriteria === 'none' ? mdiTuneVariant : qualifyingCriteria === 'on_qualifying' ? mdiCheckCircleOutline : mdiTuneVariant}
                              size={0.6}
                              color={qualifyingCriteria !== 'none' ? '#3A8A3E' : '#69717F'}
                            />
                            <span className="qc-label">
                              {qualifyingCriteriaOptions.find(o => o.value === qualifyingCriteria)?.label}
                            </span>
                            <Icon path={mdiChevronDown} size={0.55} color="#69717F" />
                          </button>
                          <div className="qc-line" />
                          {qualifyingMenuOpen && (
                            <div className="qc-dropdown" onMouseDown={e => e.stopPropagation()}>
                              {qualifyingCriteriaOptions.map(opt => (
                                <button
                                  key={opt.value}
                                  className={`qc-dropdown-item${qualifyingCriteria === opt.value ? ' selected' : ''}`}
                                  onClick={() => { setQualifyingCriteria(opt.value); setQualifyingMenuOpen(false); }}
                                >
                                  <div className="qc-dropdown-item-text">
                                    <span className="qc-dropdown-item-label">{opt.label}</span>
                                    <span className="qc-dropdown-item-desc">{opt.description}</span>
                                  </div>
                                  {qualifyingCriteria === opt.value && (
                                    <Icon path={mdiCheck} size={0.65} color="#414996" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interview sections */}
                      {qualifyingCriteria !== 'none' && interviewSections.length > 0 && (
                        <div className="qc-gate-label">
                          <Icon path={mdiLockOutline} size={0.55} color="#9DA3AE" />
                          <span>Sections below require candidates to pass assessments</span>
                        </div>
                      )}
                      {interviewSections.map((s, i) => renderV5SectionRow(s, i + assessmentCount))}
                    </>
                  );
                })()}
              </div>

              {/* Snackbar stack — slides in from top */}
              {v5UndoStack.length > 0 && createPortal(
                <div className="v5-snackbar-container">
                  {v5UndoStack.map(entry => (
                    <div key={entry.timestamp} className="v5-snackbar v5-snackbar-positive">
                      <div className="v5-snackbar-icon">
                        <Icon path={mdiCheck} size={0.7} color="#fff" />
                      </div>
                      <span className="v5-snackbar-message">
                        {entry.section.title} deleted successfully
                      </span>
                      <button
                        className="v5-snackbar-action"
                        onClick={() => handleV5Undo(entry)}
                      >
                        Undo
                      </button>
                      <button
                        className="v5-snackbar-close"
                        onClick={() => handleV5DismissUndo(entry.timestamp)}
                        aria-label="Dismiss"
                      >
                        <Icon path={mdiClose} size={0.6} color="#343C4C" />
                      </button>
                    </div>
                  ))}
                </div>,
                document.body
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
