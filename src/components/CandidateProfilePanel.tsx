import {
  Button,
  ButtonVariant,
  ButtonSize,
  ButtonShape,
  Empty,
  EmptyMode,
  IconName,
} from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronDown,
  mdiMapMarkerOutline,
  mdiBriefcaseOutline,
  mdiNoteTextOutline,
  mdiAccountOutline,
  mdiPhone,
  mdiEmailOutline,
  mdiStarOutline,
  mdiDotsHorizontal,
  mdiDotsVertical,
  mdiDownload,
  mdiCreation,
  mdiPencilOutline,
  mdiLinkedin,
  mdiSchool,
  mdiCertificate,
  mdiTrophy,
  mdiFileDocument,
  mdiOpenInNew,
  mdiThumbUp,
  mdiEarth,
  mdiAlertOutline,
} from '@mdi/js';
import { useMemo, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { type Candidate, candidates } from '../data/candidates';
import { getNudgeForCandidate } from '../data/candidateNudges';
import FloatingInputPanel from './FloatingInputPanel';
import ProfileAiInsightsSection, { type ProfileInsightSubtab } from './ProfileAiInsightsSection';
import './CandidateProfilePanel.css';

interface CandidateProfilePanelProps {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
  onNavigate?: (candidate: Candidate) => void;
  showFloatingBar?: boolean;
  nudgeVersion?: string;
  onAssessWithAI?: (candidate: Candidate) => void;
  onOpenAssistantWithPrompt?: (candidate: Candidate, prompt: string) => void;
  aiPanelOpen?: boolean;
}

function MatchDots({ score }: { score: number }) {
  const dots = [];
  for (let i = 0; i < 5; i++) {
    const filled = score >= i + 1;
    const half = !filled && score >= i + 0.5;
    dots.push(
      <span
        key={i}
        className={`cp-match-dot ${filled ? 'filled' : half ? 'half' : 'empty'}`}
      />
    );
  }
  return <div className="cp-match-dots">{dots}</div>;
}

export default function CandidateProfilePanel({
  candidate,
  open,
  onClose,
  onNavigate,
  showFloatingBar = true,
  nudgeVersion,
  onAssessWithAI,
  onOpenAssistantWithPrompt,
  aiPanelOpen = false,
}: CandidateProfilePanelProps) {
  const lastCandidateRef = useRef<Candidate | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSubtab, setActiveSubtab] = useState<'overview' | 'resume' | 'linkedin' | 'files'>('overview');
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [floatingCollapsed, setFloatingCollapsed] = useState(false);

  const isOda3 = nudgeVersion === 'oda-3';
  const isOdActionable = nudgeVersion === 'od-actionable';

  useEffect(() => {
    if (candidate) {
      lastCandidateRef.current = candidate;
      setFloatingCollapsed(false);
    }
  }, [candidate]);

  const displayCandidate = candidate ?? lastCandidateRef.current;
  const profileCandidateList = useMemo(
    () => (displayCandidate ? [displayCandidate] : []),
    [displayCandidate]
  );
  const profilePlaceholder = displayCandidate
    ? `Assess ${displayCandidate.name}'s leadership potential`
    : '';

  if (!displayCandidate) return null;

  const currentIndex = candidates.findIndex((c) => c.id === displayCandidate.id);
  const total = candidates.length;
  const profileNudge = getNudgeForCandidate(
    displayCandidate.id,
    candidates.map((c) => c.id)
  );

  const handlePrev = () => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate(candidates[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1 && onNavigate) {
      onNavigate(candidates[currentIndex + 1]);
    }
  };

  return createPortal(
    <>
      <div
        className={`cp-overlay ${open && !aiPanelOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <div className={`cp-panel${open ? ' open' : ''}${aiPanelOpen ? ' cp-panel--ai-shifted' : ''}`}>
        {/* Header — solid teal, name + candidate nav + window controls */}
        <div className="cp-header-bar">
          <div className="cp-header-left">
            <span className="cp-header-name">{displayCandidate.name}</span>
          </div>
          <div className="cp-header-right">
            <div className="cp-header-nav">
              <button
                type="button"
                className={`cp-nav-btn cp-nav-btn--header ${currentIndex === 0 ? 'disabled' : ''}`}
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Previous candidate"
              >
                <Icon path={mdiChevronLeft} size={0.7} color="currentColor" />
              </button>
              <span className="cp-nav-label cp-nav-label--header">
                {currentIndex + 1} of {total}
              </span>
              <button
                type="button"
                className={`cp-nav-btn cp-nav-btn--header ${currentIndex === total - 1 ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={currentIndex === total - 1}
                aria-label="Next candidate"
              >
                <Icon path={mdiChevronRight} size={0.7} color="currentColor" />
              </button>
            </div>
            <button type="button" className="cp-header-icon-btn" aria-label="Open in new tab">
              <Icon path={mdiOpenInNew} size={0.75} color="white" />
            </button>
            <button type="button" className="cp-header-icon-btn" onClick={onClose} aria-label="Close">
              <Icon path={mdiClose} size={0.85} color="white" />
            </button>
          </div>
        </div>

        {/* Action bar — pill secondary actions */}
        <div className="cp-action-bar">
          <div className="cp-action-scroll">
            <button type="button" className="cp-icon-btn-outlined" aria-label="Favorite">
              <Icon path={mdiStarOutline} size={0.85} color="#146DA6" />
            </button>
            <Button text="Advance Stage" variant={ButtonVariant.Secondary}>
              <Icon path={mdiChevronDown} size={0.65} />
            </Button>
            <Button text="Share" variant={ButtonVariant.Secondary} />
            <Button text="Share Feedback" variant={ButtonVariant.Secondary} />
            <Button
              text="Interview with AI"
              variant={ButtonVariant.Secondary}
              classNames="cp-action-interview-ai"
            >
              <Icon path={mdiCreation} size={0.65} color="#593CB4" />
            </Button>
            <Button text="Request Decision" variant={ButtonVariant.Secondary} />
            <Button text="Contact" variant={ButtonVariant.Secondary}>
              <Icon path={mdiChevronDown} size={0.65} />
            </Button>
            <Button text="Reject" variant={ButtonVariant.Secondary} classNames="cp-action-reject" />
            <Button text="Schedule" variant={ButtonVariant.Secondary}>
              <Icon path={mdiChevronDown} size={0.65} />
            </Button>
            <button type="button" className="cp-icon-btn-outlined" aria-label="More actions">
              <Icon path={mdiDotsHorizontal} size={0.85} color="#146DA6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`cp-body ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Main content */}
          <div className="cp-main">
            {/* Profile card */}
            <div className="cp-profile-card">
              <div className="cp-profile-top">
                <div className="cp-profile-row">
                  {displayCandidate.avatarSrc ? (
                    <img
                      className="cp-avatar"
                      src={displayCandidate.avatarSrc}
                      alt={displayCandidate.name}
                    />
                  ) : (
                    <div
                      className="cp-avatar cp-avatar-initials"
                      style={{ backgroundColor: displayCandidate.avatarColor }}
                    >
                      {displayCandidate.initials}
                    </div>
                  )}
                  <div className="cp-profile-info">
                    <div className="cp-name-row">
                      <h2 className="cp-name">{displayCandidate.name}</h2>
                      <div className="cp-name-actions">
                        <button className="cp-small-icon-btn">
                          <Icon path={mdiDownload} size={0.8} color="#4F5666" />
                        </button>
                        <button className="cp-small-icon-btn">
                          <Icon path={mdiPencilOutline} size={0.8} color="#4F5666" />
                        </button>
                      </div>
                    </div>
                    <p className="cp-title">{displayCandidate.title}</p>
                    {displayCandidate.location && (
                      <div className="cp-meta-item">
                        <Icon path={mdiMapMarkerOutline} size={0.7} color="#4F5666" />
                        <span>
                          {displayCandidate.location}
                          {displayCandidate.localTime && ` (${displayCandidate.localTime})`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="cp-meta-details">
                  {displayCandidate.experience && (
                    <div className="cp-meta-item">
                      <Icon path={mdiBriefcaseOutline} size={0.7} color="#4F5666" />
                      <span>
                        {displayCandidate.experience}
                        {displayCandidate.relevantExperience &&
                          ` | ${displayCandidate.relevantExperience}`}
                      </span>
                    </div>
                  )}
                  {displayCandidate.noteBy && displayCandidate.noteDate && (
                    <div className="cp-meta-item">
                      <Icon path={mdiNoteTextOutline} size={0.7} color="#4F5666" />
                      <span>
                        {displayCandidate.noteBy} added a note on {displayCandidate.noteDate}
                      </span>
                    </div>
                  )}
                  {displayCandidate.sourcedBy && (
                    <div className="cp-meta-item">
                      <Icon path={mdiAccountOutline} size={0.7} color="#4F5666" />
                      <span>Sourced by {displayCandidate.sourcedBy}</span>
                    </div>
                  )}
                  <div className="cp-contact-row">
                    {displayCandidate.phone && (
                      <a className="cp-contact-link" href={`tel:${displayCandidate.phone}`}>
                        <Icon path={mdiPhone} size={0.6} color="#146DA6" />
                        {displayCandidate.phone}
                      </a>
                    )}
                    {displayCandidate.phone && displayCandidate.email && (
                      <span className="cp-contact-sep">·</span>
                    )}
                    {displayCandidate.email && (
                      <a
                        className="cp-contact-link"
                        href={`mailto:${displayCandidate.email}`}
                      >
                        <Icon path={mdiEmailOutline} size={0.6} color="#146DA6" />
                        {displayCandidate.email}
                      </a>
                    )}
                    {displayCandidate.linkedIn && (
                      <>
                        <span className="cp-contact-sep">·</span>
                        <a className="cp-contact-link" href="#">
                          <Icon path={mdiLinkedin} size={0.6} color="#0A66C2" />
                          LinkedIn
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job match card */}
            {(displayCandidate.currentRole || profileNudge) && (
              <div className="cp-match-card">
                {displayCandidate.currentRole && (
                  <>
                    <div className="cp-match-top">
                      <span className="cp-match-role">{displayCandidate.currentRole}</span>
                      <Icon path={mdiChevronDown} size={0.85} color="#4F5666" />
                    </div>
                    <div className="cp-match-bottom">
                      <MatchDots score={displayCandidate.matchScore ?? 0} />
                      {displayCandidate.interviewRound && (
                        <>
                          <span className="cp-match-sep">·</span>
                          <span className="cp-match-round">
                            {displayCandidate.interviewRound}
                          </span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Profile tabs */}
            <div className="cp-tabs">
              <button className="cp-tab active">Profile</button>
              <button className="cp-tab">Pipeline activity</button>
              <button className="cp-tab">Notes &amp; Tags</button>
              <button className="cp-tab">Messages</button>
              <button className="cp-tab">Engagement</button>
            </div>

            {/* Sub-tabs */}
            <div className="cp-subtabs-row">
              <div className="cp-subtabs">
                {(['overview', 'resume', 'linkedin', 'files'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`cp-subtab ${activeSubtab === tab ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSubtab(tab);
                      setInsightsExpanded(false);
                    }}
                  >
                    {tab === 'overview' ? 'Overview' : tab === 'resume' ? 'CV' : tab === 'linkedin' ? 'LinkedIn' : 'Files'}
                    {tab === 'files' && <span className="cp-subtab-badge">0</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* AI contextual insights — content varies by active subtab */}
            {activeSubtab !== 'files' && (
              <ProfileAiInsightsSection
                key={`${displayCandidate.id}-${activeSubtab}`}
                activeSubtab={activeSubtab as ProfileInsightSubtab}
                insightsExpanded={insightsExpanded}
                onToggleExpanded={() => setInsightsExpanded((prev) => !prev)}
                isOdActionable={isOdActionable}
                displayCandidate={displayCandidate}
                onOpenAssistantWithPrompt={onOpenAssistantWithPrompt}
                onAssessWithAI={onAssessWithAI}
              />
            )}

            {/* ── Tab content ── */}

            {/* Overview tab */}
            {activeSubtab === 'overview' && (
              <div className="cp-overview">
                {/* Summary */}
                <section className="cp-ov-section cp-ov-card">
                  <h3 className="cp-ov-section-title">
                    Summary
                    <button type="button" className="cp-ov-edit-btn"><Icon path={mdiPencilOutline} size={0.6} color="#69717F" /></button>
                  </h3>
                  <p className="cp-ov-summary-text">
                    Product-minded UX designer with 8+ years of experience shipping complex enterprise applications.
                    Specializes in design systems, data-heavy interfaces, and cross-functional collaboration.
                    Built and scaled a component library adopted by 40+ engineers at Cisco.
                    <button className="cp-ov-see-more">see more</button>
                  </p>
                </section>

                {/* Work Experience */}
                <section className="cp-ov-section cp-ov-card">
                  <h3 className="cp-ov-section-title">
                    Work Experience
                    <span className="cp-ov-section-badge">3</span>
                    <button type="button" className="cp-ov-edit-btn"><Icon path={mdiPencilOutline} size={0.6} color="#69717F" /></button>
                  </h3>

                  <div className="cp-ov-job">
                    <div className="cp-ov-job-logo eightfold">8f</div>
                    <div className="cp-ov-job-content">
                      <div className="cp-ov-job-header">
                        <strong>Sr Principal UX Designer</strong>
                        <span className="cp-ov-job-dates">Nov 2022 – Present</span>
                      </div>
                      <span className="cp-ov-job-company">Eightfold AI</span>
                      <p className="cp-ov-job-desc">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        <button className="cp-ov-see-more">see more</button>
                      </p>
                    </div>
                  </div>

                  <div className="cp-ov-job">
                    <img className="cp-ov-job-logo" src="https://logo.clearbit.com/google.com" alt="Google" />
                    <div className="cp-ov-job-content">
                      <div className="cp-ov-job-header">
                        <strong>Sr Principal UX Designer</strong>
                        <span className="cp-ov-job-dates">Oct 2020 – Nov 2022</span>
                      </div>
                      <span className="cp-ov-job-company">Google</span>
                      <p className="cp-ov-job-desc">
                        Design system lead for internal developer tools platform. <button className="cp-ov-see-more">see more</button>
                      </p>
                      <div className="cp-ov-tags">
                        <span className="cp-ov-tag">Interaction Design</span>
                        <span className="cp-ov-tag">Prototyping</span>
                        <span className="cp-ov-tag">UX</span>
                        <span className="cp-ov-tag">Agile</span>
                        <span className="cp-ov-tag">Team Management</span>
                      </div>
                    </div>
                  </div>

                  <div className="cp-ov-job">
                    <div className="cp-ov-job-logo linkedin-logo">in</div>
                    <div className="cp-ov-job-content">
                      <div className="cp-ov-job-header">
                        <strong>UX Designer</strong>
                        <span className="cp-ov-job-dates">May 2017 – Oct 2020</span>
                      </div>
                      <span className="cp-ov-job-company">LinkedIn</span>
                      <p className="cp-ov-job-desc">
                        Designed recruiter-facing features and candidate experience flows.
                        <button className="cp-ov-see-more">see more</button>
                      </p>
                      <div className="cp-ov-tags">
                        <span className="cp-ov-tag">Interaction Design</span>
                        <span className="cp-ov-tag">Prototyping</span>
                        <span className="cp-ov-tag">UX</span>
                        <span className="cp-ov-tag">UX Research</span>
                      </div>
                    </div>
                  </div>

                  <button className="cp-ov-show-more-btn">See 3 more work experience</button>
                </section>

                {/* Education */}
                <section className="cp-ov-section cp-ov-card">
                  <h3 className="cp-ov-section-title">
                    Education
                    <span className="cp-ov-section-badge">2</span>
                    <button type="button" className="cp-ov-edit-btn"><Icon path={mdiPencilOutline} size={0.6} color="#69717F" /></button>
                  </h3>
                  <div className="cp-ov-edu">
                    <Icon path={mdiSchool} size={0.85} color="#2C8CC9" />
                    <div className="cp-ov-edu-content">
                      <strong>Masters in Design</strong>
                      <span className="cp-ov-edu-school">University of California, Berkeley · <em>Industrial Design</em></span>
                      <span className="cp-ov-edu-dates">2007 – 2009</span>
                    </div>
                  </div>
                  <div className="cp-ov-edu">
                    <Icon path={mdiSchool} size={0.85} color="#2C8CC9" />
                    <div className="cp-ov-edu-content">
                      <strong>Bachelor of Fine Arts</strong>
                      <span className="cp-ov-edu-school">IIT, Delhi · <em>Computer Science</em></span>
                      <span className="cp-ov-edu-dates">2003 – 2007</span>
                    </div>
                  </div>
                </section>

                {/* Mobility */}
                <section className="cp-ov-section cp-ov-card">
                  <h3 className="cp-ov-section-title">Mobility</h3>
                  <dl className="cp-ov-mobility">
                    <div className="cp-ov-mobility-row">
                      <dt>Are you willing to Relocate?</dt>
                      <dd>No</dd>
                    </div>
                    <div className="cp-ov-mobility-row">
                      <dt>Region</dt>
                      <dd>N/A</dd>
                    </div>
                    <div className="cp-ov-mobility-row">
                      <dt>Country</dt>
                      <dd>N/A</dd>
                    </div>
                    <div className="cp-ov-mobility-row">
                      <dt>Area of Preference</dt>
                      <dd>N/A</dd>
                    </div>
                  </dl>
                </section>

                {/* Skills */}
                <section className="cp-ov-section cp-ov-card">
                  <h3 className="cp-ov-section-title">
                    Skills
                    <button type="button" className="cp-ov-edit-btn"><Icon path={mdiPencilOutline} size={0.6} color="#69717F" /></button>
                  </h3>
                  <div className="cp-ov-tags">
                    <span className="cp-ov-tag">Product Design</span>
                    <span className="cp-ov-tag">Product Management</span>
                    <span className="cp-ov-tag">Product Management</span>
                    <span className="cp-ov-tag">Design Systems</span>
                    <span className="cp-ov-tag">UX Design</span>
                  </div>
                  <button className="cp-ov-see-more" style={{ marginTop: 4 }}>See more</button>
                </section>

                {/* Recommendations */}
                <section className="cp-ov-section cp-ov-card">
                  <h3 className="cp-ov-section-title">Recommendations</h3>
                  <div className="cp-ov-recommendation">
                    <div className="cp-ov-rec-avatar">MM</div>
                    <div className="cp-ov-rec-content">
                      <div className="cp-ov-rec-header">
                        <strong>Mark Masscroft</strong>
                        <span>Lead UX Designer</span>
                        <span className="cp-ov-rec-date">Sep 1, 2023</span>
                      </div>
                      <p className="cp-ov-rec-text">
                        April 20, 2021 · Tim worked with him on the same team.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        <button className="cp-ov-see-more">see more</button>
                      </p>
                    </div>
                  </div>
                  <div className="cp-ov-recommendation">
                    <div className="cp-ov-rec-avatar">MM</div>
                    <div className="cp-ov-rec-content">
                      <div className="cp-ov-rec-header">
                        <strong>Mark Masscroft</strong>
                        <span>Lead UX Designer</span>
                        <span className="cp-ov-rec-date">Sep 1, 2023</span>
                      </div>
                      <p className="cp-ov-rec-text">
                        April 20, 2021 · Tim worked with him on the same team.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        <button className="cp-ov-see-more">see more</button>
                      </p>
                    </div>
                  </div>
                  <button className="cp-ov-see-more" style={{ marginTop: 4 }}>See more</button>
                </section>

                {/* Certifications */}
                <section className="cp-ov-section cp-ov-card">
                  <h3 className="cp-ov-section-title">Certifications</h3>
                  <div className="cp-ov-cert">
                    <Icon path={mdiCertificate} size={0.85} color="#2C8CC9" />
                    <div className="cp-ov-cert-content">
                      <strong>Google UX Design Professional Certificate</strong>
                      <span className="cp-ov-cert-meta">Google · Jun 2020 – Jun 2025</span>
                      <span className="cp-ov-cert-id">Certificate number: GOOG1234</span>
                    </div>
                  </div>
                </section>

                {/* Awards */}
                <section className="cp-ov-section cp-ov-card">
                  <h3 className="cp-ov-section-title">Awards</h3>
                  <div className="cp-ov-cert">
                    <Icon path={mdiTrophy} size={0.85} color="#E5A100" />
                    <div className="cp-ov-cert-content">
                      <strong>Interaction and User experience</strong>
                      <span className="cp-ov-cert-meta">Red Dot Award · Jun 2024</span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Resume tab */}
            {activeSubtab === 'resume' && (
              <div className="cp-resume-viewer">
                <div className="cp-resume-toolbar">
                  <span className="cp-resume-filename">
                    <Icon path={mdiFileDocument} size={0.7} color="#146DA6" />
                    {displayCandidate.name.replace(/\s+/g, '_')}_Resume.pdf
                  </span>
                  <div className="cp-resume-toolbar-actions">
                    <button className="cp-resume-toolbar-btn" aria-label="Download">
                      <Icon path={mdiDownload} size={0.7} color="#4F5666" />
                    </button>
                    <button className="cp-resume-toolbar-btn" aria-label="Open in new tab">
                      <Icon path={mdiOpenInNew} size={0.7} color="#4F5666" />
                    </button>
                  </div>
                </div>
                <div className="cp-resume-doc">
                  <div className="cp-resume-page">
                    <div className="cp-resume-page-header">
                      <h2>{displayCandidate.name}</h2>
                      <p>{displayCandidate.title}</p>
                      <p className="cp-resume-contact-line">
                        {displayCandidate.email} · {displayCandidate.phone} · {displayCandidate.location}
                      </p>
                    </div>
                    <div className="cp-resume-section">
                      <h4>PROFESSIONAL SUMMARY</h4>
                      <p>Product-minded UX designer with 8+ years of experience shipping complex enterprise applications.
                         Specializes in design systems, data-heavy interfaces, and cross-functional collaboration.
                         Built and scaled a component library adopted by 40+ engineers.</p>
                    </div>
                    <div className="cp-resume-section">
                      <h4>EXPERIENCE</h4>
                      <div className="cp-resume-entry">
                        <div className="cp-resume-entry-header">
                          <strong>Sr Principal UX Designer</strong>
                          <span>Nov 2022 – Present</span>
                        </div>
                        <span className="cp-resume-entry-company">Eightfold AI · Santa Clara, CA</span>
                        <ul>
                          <li>Led end-to-end design for AI-powered talent intelligence platform</li>
                          <li>Built and maintained a design system serving 40+ engineers</li>
                          <li>Drove 30% improvement in recruiter workflow efficiency through UX optimization</li>
                        </ul>
                      </div>
                      <div className="cp-resume-entry">
                        <div className="cp-resume-entry-header">
                          <strong>Sr Principal UX Designer</strong>
                          <span>Oct 2020 – Nov 2022</span>
                        </div>
                        <span className="cp-resume-entry-company">Google · Mountain View, CA</span>
                        <ul>
                          <li>Design system lead for internal developer tools platform</li>
                          <li>Shipped 12 major features across 3 product areas in 2 years</li>
                        </ul>
                      </div>
                      <div className="cp-resume-entry">
                        <div className="cp-resume-entry-header">
                          <strong>UX Designer</strong>
                          <span>May 2017 – Oct 2020</span>
                        </div>
                        <span className="cp-resume-entry-company">LinkedIn · Sunnyvale, CA</span>
                        <ul>
                          <li>Designed recruiter-facing features and candidate experience flows</li>
                          <li>Conducted 50+ usability studies to validate design decisions</li>
                        </ul>
                      </div>
                    </div>
                    <div className="cp-resume-section">
                      <h4>EDUCATION</h4>
                      <div className="cp-resume-entry">
                        <div className="cp-resume-entry-header">
                          <strong>Masters in Design – Industrial Design</strong>
                          <span>2007 – 2009</span>
                        </div>
                        <span className="cp-resume-entry-company">University of California, Berkeley</span>
                      </div>
                      <div className="cp-resume-entry">
                        <div className="cp-resume-entry-header">
                          <strong>Bachelor of Fine Arts – Computer Science</strong>
                          <span>2003 – 2007</span>
                        </div>
                        <span className="cp-resume-entry-company">IIT, Delhi</span>
                      </div>
                    </div>
                    <div className="cp-resume-section">
                      <h4>SKILLS</h4>
                      <p>Product Design · Interaction Design · Prototyping · Design Systems · UX Research · Figma · Sketch · Agile · Team Management</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LinkedIn tab */}
            {activeSubtab === 'linkedin' && (
              <div className="cp-linkedin-preview">
                <div className="cp-li-banner" />
                <div className="cp-li-profile-header">
                  {displayCandidate.avatarSrc ? (
                    <img className="cp-li-avatar" src={displayCandidate.avatarSrc} alt={displayCandidate.name} />
                  ) : (
                    <div className="cp-li-avatar cp-li-avatar-initials" style={{ backgroundColor: displayCandidate.avatarColor }}>
                      {displayCandidate.initials}
                    </div>
                  )}
                  <div className="cp-li-profile-info">
                    <h2 className="cp-li-name">{displayCandidate.name}</h2>
                    <p className="cp-li-headline">{displayCandidate.title}</p>
                    <p className="cp-li-location">
                      <Icon path={mdiMapMarkerOutline} size={0.55} color="#69717F" />
                      {displayCandidate.location}
                      <span className="cp-li-connections"> · 500+ connections</span>
                    </p>
                  </div>
                  <div className="cp-li-actions">
                    <a className="cp-li-open-link" href="#" onClick={(e) => e.preventDefault()}>
                      <Icon path={mdiOpenInNew} size={0.6} color="#0A66C2" />
                      Open in LinkedIn
                    </a>
                  </div>
                </div>

                <div className="cp-li-card">
                  <h3>About</h3>
                  <p>
                    Product-minded UX designer with 8+ years of experience shipping complex enterprise applications.
                    Passionate about design systems and developer experience. Currently building AI-powered recruiting tools at Eightfold.
                  </p>
                </div>

                <div className="cp-li-card">
                  <h3>Experience</h3>
                  <div className="cp-li-exp">
                    <div className="cp-li-exp-logo eightfold">8f</div>
                    <div className="cp-li-exp-content">
                      <strong>Sr Principal UX Designer</strong>
                      <span className="cp-li-exp-company">Eightfold AI · Full-time</span>
                      <span className="cp-li-exp-meta">Nov 2022 – Present · 3 yrs 5 mo</span>
                      <span className="cp-li-exp-meta">Santa Clara, California, United States</span>
                    </div>
                  </div>
                  <div className="cp-li-exp">
                    <img className="cp-li-exp-logo" src="https://logo.clearbit.com/google.com" alt="Google" />
                    <div className="cp-li-exp-content">
                      <strong>Sr Principal UX Designer</strong>
                      <span className="cp-li-exp-company">Google · Full-time</span>
                      <span className="cp-li-exp-meta">Oct 2020 – Nov 2022 · 2 yrs 1 mo</span>
                      <span className="cp-li-exp-meta">Mountain View, California</span>
                    </div>
                  </div>
                  <div className="cp-li-exp">
                    <div className="cp-li-exp-logo linkedin-logo">in</div>
                    <div className="cp-li-exp-content">
                      <strong>UX Designer</strong>
                      <span className="cp-li-exp-company">LinkedIn · Full-time</span>
                      <span className="cp-li-exp-meta">May 2017 – Oct 2020 · 3 yrs 5 mo</span>
                      <span className="cp-li-exp-meta">Sunnyvale, California</span>
                    </div>
                  </div>
                </div>

                <div className="cp-li-card">
                  <h3>Education</h3>
                  <div className="cp-li-exp">
                    <Icon path={mdiSchool} size={0.85} color="#69717F" />
                    <div className="cp-li-exp-content">
                      <strong>University of California, Berkeley</strong>
                      <span className="cp-li-exp-company">Masters in Design, Industrial Design</span>
                      <span className="cp-li-exp-meta">2007 – 2009</span>
                    </div>
                  </div>
                </div>

                <div className="cp-li-card">
                  <h3>Skills</h3>
                  <div className="cp-li-skills">
                    <div className="cp-li-skill">
                      <span>UX Design</span>
                      <span className="cp-li-endorsements">
                        <Icon path={mdiThumbUp} size={0.5} color="#69717F" />
                        14
                      </span>
                    </div>
                    <div className="cp-li-skill">
                      <span>Design Systems</span>
                      <span className="cp-li-endorsements">
                        <Icon path={mdiThumbUp} size={0.5} color="#69717F" />
                        9
                      </span>
                    </div>
                    <div className="cp-li-skill">
                      <span>Product Design</span>
                      <span className="cp-li-endorsements">
                        <Icon path={mdiThumbUp} size={0.5} color="#69717F" />
                        7
                      </span>
                    </div>
                    <div className="cp-li-skill">
                      <span>Prototyping</span>
                      <span className="cp-li-endorsements">
                        <Icon path={mdiThumbUp} size={0.5} color="#69717F" />
                        5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="cp-li-card">
                  <h3>Activity</h3>
                  <p className="cp-li-activity-meta">
                    <Icon path={mdiEarth} size={0.5} color="#69717F" />
                    Posted 2 weeks ago
                  </p>
                  <p className="cp-li-activity-text">
                    Excited to share that I'm open to new opportunities! After 3+ amazing years at Eightfold,
                    I'm looking for my next challenge in design leadership. #OpenToWork
                  </p>
                  <div className="cp-li-activity-stats">
                    <span>24 likes</span> · <span>8 comments</span>
                  </div>
                </div>
              </div>
            )}

            {/* Files tab */}
            {activeSubtab === 'files' && (
              <div className="cp-files-empty">
                <Empty
                  mode={EmptyMode.data}
                  title="No files uploaded yet"
                  description="Upload files in .pdf, .doc, .docx, .txt, .jpg, .pptx, .ppt format, up to 5MB"
                />
                <Button
                  text="Upload file"
                  variant={ButtonVariant.Secondary}
                  iconProps={{ path: IconName.mdiUpload }}
                  style={{ marginTop: 12 }}
                />
              </div>
            )}
          </div>

          {/* Divider with expand/collapse button */}
          <div className="cp-divider">
            <div className="cp-divider-line" />
            <button
              className={`cp-divider-btn ${sidebarCollapsed ? 'rotated' : ''}`}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
            >
              <Icon path={mdiChevronRight} size={0.75} color="#146DA6" />
            </button>
          </div>

          {/* Right sidebar */}
          <div className={`cp-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="cp-sidebar-card">
              <div className="cp-sidebar-section">
                <div className="cp-sidebar-header">
                  <h4 className="cp-sidebar-card-title">Personal Details</h4>
                  <button type="button" className="cp-add-new-btn">
                    Add new
                    <Icon path={mdiChevronDown} size={0.65} color="#146DA6" />
                  </button>
                </div>
                <div className="cp-sidebar-pills">
                  <button type="button" className="cp-pill active">
                    Contact <span className="cp-pill-count">1</span>
                  </button>
                  <button type="button" className="cp-pill">
                    Hyperlinks <span className="cp-pill-count">2</span>
                  </button>
                  <button type="button" className="cp-pill">
                    Files <span className="cp-pill-count">0</span>
                  </button>
                </div>
                <div className="cp-cv-block">
                  <span className="cp-cv-block-label">CV</span>
                  <div className="cp-cv-empty">
                    <Icon path={mdiAlertOutline} size={0.85} color="#9A6700" />
                    <span className="cp-cv-empty-text">There is no CV yet.</span>
                    <button type="button" className="cp-cv-upload-link">Upload</button>
                  </div>
                </div>
                <div className="cp-sidebar-contacts">
                  <div className="cp-sidebar-contact-item">
                    <Icon path={mdiEmailOutline} size={0.75} color="#146DA6" />
                    <span className="cp-sidebar-contact-val">{displayCandidate.email || 'emartinez@email.com'}</span>
                    <span className="cp-sidebar-more">2 more</span>
                    <Icon path={mdiDotsHorizontal} size={0.7} color="#69717F" />
                  </div>
                  <div className="cp-sidebar-contact-item">
                    <Icon path={mdiPhone} size={0.75} color="#146DA6" />
                    <span className="cp-sidebar-contact-val">{displayCandidate.phone || '+91 9889987678'}</span>
                    <span className="cp-sidebar-more">2 more</span>
                    <Icon path={mdiDotsHorizontal} size={0.7} color="#69717F" />
                  </div>
                </div>
              </div>
            </div>

            <div className="cp-sidebar-card">
              <div className="cp-sidebar-section">
                <div className="cp-sidebar-header">
                  <h4 className="cp-sidebar-card-title">Add notes &amp; tags</h4>
                  <button type="button" className="cp-add-new-btn">
                    Add new
                    <Icon path={mdiChevronDown} size={0.65} color="#146DA6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="cp-sidebar-card">
              <div className="cp-sidebar-section">
                <h4 className="cp-sidebar-card-title">Similar Candidates</h4>
                <div className="cp-similar-list">
                  {[
                    { initials: 'RK', color: '#2C8CC9', name: 'Ravi Kumar', sub: 'Senior Engineer · Bengaluru' },
                    { initials: 'PS', color: '#975590', name: 'Priya Sharma', sub: 'Staff SWE · Hyderabad' },
                    { initials: 'AM', color: '#9D6309', name: 'Amit Mehta', sub: 'Principal Engineer · Pune' },
                    { initials: 'LN', color: '#1a7a2e', name: 'Lakshmi Nair', sub: 'Engineering Manager · Chennai' },
                  ].map((c) => (
                    <button key={c.name} type="button" className="cp-similar-row">
                      <span className="cp-similar-avatar" style={{ backgroundColor: c.color }}>{c.initials}</span>
                      <span className="cp-similar-text">
                        <span className="cp-similar-name">{c.name}</span>
                        <span className="cp-similar-sub">{c.sub}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <button type="button" className="cp-similar-more">
                  View More Results
                  <Icon path={mdiOpenInNew} size={0.65} color="#146DA6" />
                </button>
              </div>
            </div>

            <div className="cp-sidebar-card">
              <div className="cp-sidebar-section">
                <h4 className="cp-sidebar-card-title cp-sidebar-card-title--with-badge">
                  Matched Positions
                  <span className="cp-ov-section-badge cp-ov-section-badge--sidebar">5</span>
                </h4>
                {[
                  { title: 'UX Designer-887678997 (IC4)', loc: 'Santa Clara, CA', mgr: 'Julian Brandt · Open', score: 4.5 },
                  { title: 'Product Designer-9921001 (IC3)', loc: 'Remote US', mgr: 'Sam Lee · Open', score: 3.5 },
                  { title: 'Sr UX Designer-7712002 (IC4)', loc: 'New York, NY', mgr: 'Alex Kim · Open', score: 5 },
                  { title: 'Design Systems Lead-6600443', loc: 'Austin, TX', mgr: 'Jordan Pat · Open', score: 4 },
                  { title: 'Staff Designer-5544332', loc: 'Seattle, WA', mgr: 'Chris Wu · Open', score: 3 },
                ].map((row, i) => (
                  <div key={i} className="cp-matching-position">
                    <div className="cp-matching-icon">
                      <Icon path={mdiBriefcaseOutline} size={0.85} color="#2C8CC9" />
                    </div>
                    <div className="cp-matching-info">
                      <span className="cp-matching-title">{row.title}</span>
                      <span className="cp-matching-meta">
                        <Icon path={mdiMapMarkerOutline} size={0.55} color="#69717F" />
                        {row.loc}
                        &nbsp;
                        <Icon path={mdiAccountOutline} size={0.55} color="#69717F" />
                        {row.mgr}
                      </span>
                    </div>
                    <div className="cp-matching-trail">
                      <MatchDots score={row.score} />
                      <button type="button" className="cp-matching-kebab" aria-label="More">
                        <Icon path={mdiDotsVertical} size={0.85} color="#69717F" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showFloatingBar && !floatingCollapsed && (
          <div className={`cp-floating-bar${isOda3 ? ' cp-floating-bar--oda3' : ''}`}>
            <FloatingInputPanel
              variant="v2"
              hasSelection={true}
              placeholder={profilePlaceholder}
              selectedCandidates={profileCandidateList}
              onOpenAssistant={() => onAssessWithAI?.(displayCandidate)}
              onOpenAssistantWithPrompt={(prompt) =>
                onOpenAssistantWithPrompt?.(displayCandidate, prompt)
              }
              onClearSelection={() => {}}
              dimmed={false}
              onCollapse={isOda3 ? () => setFloatingCollapsed(true) : undefined}
            />
          </div>
        )}
        {isOda3 && floatingCollapsed && (
          <div className="cp-floating-fab">
            <Button
              text={`Ask about ${displayCandidate.name.split(' ')[0]}`}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              shape={ButtonShape.Pill}
              iconProps={{ path: IconName.mdiChevronRight }}
              onClick={() => setFloatingCollapsed(false)}
            />
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
