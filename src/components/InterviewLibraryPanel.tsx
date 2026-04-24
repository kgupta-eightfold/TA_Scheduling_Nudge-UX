import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiMagnify,
  mdiChevronDown,
} from '@mdi/js';
import type { LibraryGuide } from '../data/libraryGuides';
import { libraryGuides } from '../data/libraryGuides';
import { assessmentBank, computeSectionMins } from '../data/interviewSections';
import { GuideSection } from './AIInterviewPanel';

interface InterviewLibraryPanelProps {
  onClose: () => void;
}

type TabKey = 'interviews' | 'assessments';

export default function InterviewLibraryPanel({ onClose }: InterviewLibraryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('interviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(libraryGuides[0]?.id ?? null);

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return libraryGuides;
    const q = searchQuery.toLowerCase();
    return libraryGuides.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const selectedGuide: LibraryGuide | null = useMemo(
    () => libraryGuides.find(g => g.id === selectedGuideId) ?? null,
    [selectedGuideId],
  );

  const handleGuideClick = (id: string) => {
    setSelectedGuideId(prev => (prev === id ? null : id));
  };

  const handleAddToPosition = () => {
    onClose();
  };

  return createPortal(
    <div className="lib-overlay" onClick={onClose}>
      <div className="lib-panel" onClick={e => e.stopPropagation()}>
        {/* Header — full width */}
        <div className="lib-header">
          <h2 className="lib-header-title">Interview guides library</h2>
          <button className="lib-header-close" onClick={onClose} aria-label="Close">
            <Icon path={mdiClose} size={0.85} color="#343C4C" />
          </button>
        </div>

        <div className="lib-top-constrained">
          {/* Tabs */}
          <div className="lib-tabs">
            <button
              className={`lib-tab${activeTab === 'interviews' ? ' lib-tab-active' : ''}`}
              onClick={() => setActiveTab('interviews')}
            >
              Interviews <span className="lib-tab-count">150</span>
            </button>
            <button
              className={`lib-tab${activeTab === 'assessments' ? ' lib-tab-active' : ''}`}
              onClick={() => setActiveTab('assessments')}
            >
              Assessments <span className="lib-tab-count">24</span>
            </button>
          </div>
        </div>

        {/* Body — grid + detail side-by-side, below tabs */}
        <div className="lib-body">
          {/* Left: scrollable content */}
          <div className="lib-main">
            <div className="lib-content-constrained">
              {/* Banner + search */}
              <div className="lib-banner">
                <span className="lib-banner-text">
                  Use AI interview guides with preset questions and customizable options, informed by market insights and real-world hiring decisions, to hire with confidence and efficiency.
                </span>
                <div className="lib-search-bar">
                  <Icon path={mdiMagnify} size={0.8} color="#9DA3AE" />
                  <input
                    className="lib-search-input"
                    placeholder="Search for roles and skills"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="lib-filter-section">
                <span className="lib-filter-heading">All guides</span>
                <div className="lib-filters">
                  <button className="lib-filter-pill">
                    View: All <Icon path={mdiChevronDown} size={0.6} color="#69717F" />
                  </button>
                  <button className="lib-filter-pill">
                    Industry <span className="lib-filter-pill-count">1</span> <Icon path={mdiChevronDown} size={0.6} color="#69717F" />
                  </button>
                  <button className="lib-filter-pill">
                    Industry <span className="lib-filter-pill-count">1</span> <Icon path={mdiChevronDown} size={0.6} color="#69717F" />
                  </button>
                  <button className="lib-filter-pill">
                    Interview type <Icon path={mdiChevronDown} size={0.6} color="#69717F" />
                  </button>
                  <span className="lib-filter-count">
                    Showing {activeTab === 'interviews' ? '150' : '24'} results
                  </span>
                </div>
              </div>

              {/* Grid */}
              {activeTab === 'interviews' ? (
                <div className="lib-grid">
                  {filteredGuides.map(guide => (
                    <button
                      key={guide.id}
                      className={`lib-guide-card${selectedGuideId === guide.id ? ' lib-guide-card-selected' : ''}`}
                      onClick={() => handleGuideClick(guide.id)}
                    >
                      <div className="lib-guide-card-top">
                        <span className="lib-guide-title">{guide.title}</span>
                        {guide.recommended && (
                          <span className="lib-guide-rec-badge">Recommended</span>
                        )}
                      </div>
                      <div className="lib-guide-tags">
                        {guide.tags.map(tag => (
                          <span key={tag} className="lib-guide-tag">{tag}</span>
                        ))}
                      </div>
                      <span className="lib-guide-meta">
                        {guide.questionCount} questions · {guide.duration} mins
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="lib-grid">
                  {assessmentBank.map(asmt => (
                    <div key={asmt.id} className="lib-asmt-card">
                      <div className="lib-asmt-title-row">
                        <span className="lib-asmt-title">{asmt.title}</span>
                        <span className="lib-asmt-source">{asmt.source}</span>
                      </div>
                      <div className="lib-asmt-meta">
                        <span className="lib-asmt-category">{asmt.category}</span>
                        <span className="lib-asmt-dots">{asmt.metadata.join(' · ')} · {asmt.duration} mins</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: detail card */}
          {selectedGuide && (
            <div className="lib-detail">
              <div className="lib-detail-card">
                <div className="lib-detail-header">
                  <div className="lib-detail-title-row">
                    <h3 className="lib-detail-title">{selectedGuide.title}</h3>
                    {selectedGuide.recommended && (
                      <span className="lib-detail-rec">Recommended</span>
                    )}
                  </div>
                  <span className="lib-detail-stats-text">
                    {selectedGuide.questionCount} questions  ·  {selectedGuide.duration} mins
                  </span>
                </div>

                <div className="lib-detail-sections guide-sections">
                  {selectedGuide.sections.map(s => (
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

                <div className="lib-detail-footer">
                  <button className="lib-detail-add-btn" onClick={handleAddToPosition}>
                    Add to Software Engineer position
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
