import { useEffect, useState } from 'react';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiArrowExpand,
  mdiArrowUp,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { Button, ButtonSize, ButtonVariant, Tooltip } from '@eightfold.ai/octuple';
import type { Candidate } from '../data/candidates';
import './Oda4ComparePanel.css';

/** Split "Role, Company" from title, skipping duplicate segments */
function parseTitleParts(title: string): { role: string; company: string } {
  const parts = title.split(', ');
  const role = parts[0] ?? title;
  // Find first part after role that is different from role
  const company = parts.slice(1).find((p) => p !== role) ?? '';
  return { role, company };
}

interface Oda4ComparePanelProps {
  open: boolean;
  onClose: () => void;
  prompt: string | null;
  selectedCandidates: Candidate[];
}

/* ── Match-score dots ── */
function MatchDots({ score, large }: { score: number; large?: boolean }) {
  const filled = Math.round(score);
  return (
    <div
      className={`oda4-match-dots${large ? ' oda4-match-dots--large' : ''}`}
      aria-label={`Match score ${filled} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`oda4-match-dot${i <= filled ? ' oda4-match-dot--filled' : ''}${large ? ' oda4-match-dot--large' : ''}`}
        />
      ))}
    </div>
  );
}

/* ── Skills / Experience row ── */
function CardRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="oda4-card-row">
      <Icon
        path={ok ? mdiCheckCircle : mdiCloseCircle}
        size={0.65}
        color={ok ? '#3d8f79' : '#c15151'}
      />
      <span>{text}</span>
    </div>
  );
}

/* ── Candidate comparison card ── */
function CandidateCard({ candidate }: { candidate: Candidate }) {
  const score = candidate.matchScore ?? 3;
  const isStrong = score >= 4;

  const { role, company } = parseTitleParts(candidate.title);
  const roleCompany = company ? `${role} · ${company}` : role;

  return (
    <div className="oda4-cand-card">
      <div className="oda4-cand-card-header">
        <div className="oda4-cand-avatar" style={{ backgroundColor: candidate.avatarColor }}>
          {candidate.avatarSrc ? (
            <img src={candidate.avatarSrc} alt={candidate.name} />
          ) : (
            candidate.initials
          )}
        </div>
        <div className="oda4-cand-info">
          <div className="oda4-cand-name-row">
            <span className="oda4-cand-name">{candidate.name}</span>
            <MatchDots score={score} />
          </div>
          <span className="oda4-cand-role">{roleCompany}</span>
        </div>
      </div>

      <div className="oda4-card-divider" />

      <div className="oda4-card-section">
        <span className="oda4-card-section-title">Skills</span>
        <CardRow ok={true} text={isStrong ? 'Python, Apache Spark' : 'Python, ML Experimentation'} />
        <CardRow
          ok={false}
          text={isStrong ? 'Design patterns, AI frameworks' : 'React Js, Artificial Intelligence'}
        />
      </div>

      <div className="oda4-card-divider" />

      <div className="oda4-card-section">
        <span className="oda4-card-section-title">Experience</span>
        <CardRow
          ok={true}
          text={
            isStrong
              ? `${candidate.experience?.split(' ')[0] ?? '5'}+ years in relevant roles`
              : 'Strong product analytics'
          }
        />
        {isStrong ? (
          <CardRow ok={true} text="Strong system design fundamentals" />
        ) : (
          <CardRow ok={false} text="No AI development projects" />
        )}
      </div>
    </div>
  );
}

/* ── Compact candidate chip (candidate strip) ── */
function CandidateChip({ candidate }: { candidate: Candidate }) {
  const score = candidate.matchScore ?? 3;
  const { role, company } = parseTitleParts(candidate.title);
  const subtitle = company ? `${role} · ${company}` : role;

  return (
    <div className="oda4-cand-chip">
      <div className="oda4-cand-chip-avatar" style={{ backgroundColor: candidate.avatarColor }}>
        {candidate.avatarSrc ? (
          <img src={candidate.avatarSrc} alt={candidate.name} />
        ) : (
          candidate.initials
        )}
      </div>
      <div className="oda4-cand-chip-info">
        <div className="oda4-cand-chip-name-row">
          <Tooltip
            content={candidate.name}
            placement="top"
            portal
            portalRoot={document.body}
            positionStrategy="fixed"
            wrapperClassNames="oda4-chip-tooltip-name"
            tooltipStyle={{ zIndex: 1500 }}
          >
            <span className="oda4-cand-chip-name">{candidate.name}</span>
          </Tooltip>
          <MatchDots score={score} large />
        </div>
        <Tooltip
          content={subtitle}
          placement="top"
          portal
          portalRoot={document.body}
          positionStrategy="fixed"
          wrapperClassNames="oda4-chip-tooltip-role"
          tooltipStyle={{ zIndex: 1500 }}
        >
          <span className="oda4-cand-chip-role">{subtitle}</span>
        </Tooltip>
      </div>
    </div>
  );
}

/* ── Main panel ── */
export default function Oda4ComparePanel({
  open,
  onClose,
  prompt,
  selectedCandidates,
}: Oda4ComparePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showCandidateStrip, setShowCandidateStrip] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Collapse the strip when the panel collapses
  useEffect(() => {
    if (!expanded) setShowCandidateStrip(false);
  }, [expanded]);

  const SUGGESTED_QUERIES = [
    'Compare their overall interview performance',
    'Identify who has stronger Python skills',
    "Assess each candidate's leadership potential",
    'Analyze diversity in backgrounds and experience',
    'Review and compare their career stability and tenure history',
  ];

  // Sort by match score, highest first
  const sorted = [...selectedCandidates].sort(
    (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)
  );
  const best = sorted[0];
  const rest = sorted.slice(1);

  const displayPrompt = prompt ?? 'Compare candidates';

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setInputValue('');
  };

  return (
    <>
      {/* Panel — push mode, no overlay */}
      <div
        className={`oda4-panel${open ? ' oda4-panel--open' : ''}${expanded ? ' oda4-panel--expanded' : ''}`}
        role="dialog"
        aria-label="Compare candidates"
      >
        {/* ── Header ── */}
        <div className="oda4-header">
          <div className="oda4-header-text">
            <h2 className="oda4-title">Compare candidates</h2>
            <p className="oda4-subtitle">
              Information used from skills, experience, diversity, and interview feedback
            </p>
          </div>
          <div className="oda4-header-actions">
            <button
              type="button"
              className="oda4-icon-btn"
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
            >
              <Icon path={mdiArrowExpand} size={0.8} color="#343c4c" />
            </button>
            <button
              type="button"
              className="oda4-icon-btn"
              onClick={onClose}
              aria-label="Close panel"
            >
              <Icon path={mdiClose} size={0.8} color="#343c4c" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="oda4-body">
          <div className="oda4-input-card">

            {/* Scrollable chat area — content anchors to bottom */}
            <div className="oda4-chat-scroll">
              <div className="oda4-chat-inner">

                {/* User prompt bubble */}
                <div className="oda4-user-bubble">
                  <div className="oda4-user-avatar">
                    <img src="/ai-interview-logo.png" alt="" />
                  </div>
                  <span className="oda4-user-text">{displayPrompt}</span>
                </div>

                {/* AI response */}
                <div className="oda4-ai-response">
                  <div className="oda4-ai-icon">
                    <img src="/ai-interview-logo.png" alt="" />
                  </div>
                  <div className="oda4-ai-content">
                    {best && (
                      <p className="oda4-ai-summary">
                        <strong>{best.name}</strong> is more skilled for this role with strong
                        experience essential for advanced development.
                        {rest.length > 0 && (
                          <>
                            {' '}
                            {rest.map((c, i) => (
                              <span key={c.id}>
                                {i > 0 ? ', ' : ''}
                                <strong>{c.name}</strong>
                              </span>
                            ))}{' '}
                            lack equivalent depth, making{' '}
                            <strong>{best.name} the better fit for this role.</strong>
                          </>
                        )}
                      </p>
                    )}

                    {/* Horizontal comparison cards strip */}
                    {sorted.length > 0 && (
                      <div className="oda4-cards-strip">
                        {sorted.map((c) => (
                          <CandidateCard key={c.id} candidate={c} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Sticky footer — suggested queries + input bar */}
            <div className="oda4-chat-footer">
              <div className="oda4-suggested-link-row">
                <a
                  href="#"
                  className="oda4-suggested-link"
                  onClick={(e) => { e.preventDefault(); setShowSuggestions((s) => !s); }}
                  aria-expanded={showSuggestions}
                >
                  Suggested queries to get started
                  <Icon
                    path={showSuggestions ? mdiChevronUp : mdiChevronDown}
                    size={0.7}
                    color="#5d2156"
                  />
                </a>

                {/* Suggestion pills — always mounted, CSS-animated open/close */}
                <div className={`oda4-suggestion-pills${showSuggestions ? ' oda4-suggestion-pills--open' : ''}`}>
                  {SUGGESTED_QUERIES.map((q) => (
                    <Button
                      key={q}
                      text={q}
                      variant={ButtonVariant.Default}
                      size={ButtonSize.Small}
                      onClick={() => {
                        setInputValue(q);
                        setShowSuggestions(false);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Input bar + candidate strip — wrapped in bordered card with copilot glow */}
              <div className="oda4-input-bar-card">
                <div className="oda4-input-bar-white">

                  {/* Avatar group + chevron — expanded panel only, sits beside the field bubble */}
                  {expanded && sorted.length > 0 && (
                    <div className={`oda4-input-avatar-bubble${showCandidateStrip ? ' oda4-input-avatar-bubble--active' : ''}`}>
                      <div className="oda4-input-avatar-stack">
                        {/* First candidate avatar */}
                        <div
                          className="oda4-input-avatar"
                          style={{ backgroundColor: sorted[0].avatarColor }}
                        >
                          {sorted[0].avatarSrc ? (
                            <img src={sorted[0].avatarSrc} alt={sorted[0].name} />
                          ) : (
                            sorted[0].initials
                          )}
                        </div>
                        {/* Overflow count for remaining candidates */}
                        {sorted.length > 1 && (
                          <div className="oda4-input-avatar oda4-input-avatar--overflow">
                            +{sorted.length - 1}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="oda4-input-chevron-btn"
                        onClick={() => setShowCandidateStrip((s) => !s)}
                        aria-label={showCandidateStrip ? 'Collapse candidate strip' : 'Expand candidate strip'}
                        aria-expanded={showCandidateStrip}
                      >
                        <Icon
                          path={showCandidateStrip ? mdiChevronUp : mdiChevronDown}
                          size={0.7}
                          color="#343c4c"
                        />
                      </button>
                    </div>
                  )}

                  {/* Gradient field bubble — input + send */}
                  <div className="oda4-input-field-bubble">
                    <input
                      type="text"
                      className="oda4-input-field"
                      placeholder="Type custom query to compare candidates..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="oda4-send-btn"
                      aria-label="Send query"
                      onClick={handleSend}
                    >
                      <Icon path={mdiArrowUp} size={0.85} color="#343c4c" />
                    </button>
                  </div>

                </div>

                {/* Candidate strip — always mounted in expanded mode, CSS-animated open/close */}
                {expanded && sorted.length > 0 && (
                  <div className={`oda4-cand-strip${showCandidateStrip ? ' oda4-cand-strip--open' : ''}`}>
                    {sorted.map((c) => (
                      <CandidateChip key={c.id} candidate={c} />
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
