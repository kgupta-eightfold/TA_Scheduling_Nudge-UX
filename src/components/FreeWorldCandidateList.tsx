import { Avatar, Button, ButtonVariant, CheckBox } from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import { mdiCreation, mdiAccountCircleOutline, mdiCalendarClock } from '@mdi/js';
import { candidates, type Candidate } from '../data/candidates';
import { getNudgeForRowIndex } from '../data/candidateNudges';
import './CandidateTableFreeWorld.css';

interface FreeWorldCandidateListProps {
  selectedIds: Set<string>;
  onToggleCandidate: (id: string) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onCandidateClick?: (candidate: Candidate) => void;
  onInterviewWithAI: () => void;
  onOpenAssistantWithPrompt?: (candidate: Candidate, prompt: string) => void;
  onAssistantPipelinePrompt?: (prompt: string, candidateIds: string[]) => void;
}

export default function FreeWorldCandidateList({
  selectedIds,
  onToggleCandidate,
  onToggleAll,
  onClearSelection,
  onCandidateClick,
  onInterviewWithAI,
  onOpenAssistantWithPrompt,
  onAssistantPipelinePrompt,
}: FreeWorldCandidateListProps) {
  const n = candidates.length;

  const handleIntelBar = () => {
    const sel = candidates.filter((c) => selectedIds.has(c.id));
    if (onAssistantPipelinePrompt) {
      if (sel.length === 0) {
        onAssistantPipelinePrompt(
          'Summarize pipeline health and who to prioritize next for Software Engineer.',
          [candidates[0].id]
        );
        return;
      }
      if (sel.length === 1) {
        onAssistantPipelinePrompt(
          `Give a recruiter-ready brief on ${sel[0].name}: fit, risks, and recommended next action.`,
          [sel[0].id]
        );
        return;
      }
      const names = sel.map((c) => c.name).join(', ');
      onAssistantPipelinePrompt(
        `Compare these applicants for the hiring bar: ${names}. Surface tradeoffs and a ranked recommendation.`,
        sel.map((c) => c.id)
      );
      return;
    }
    const selFallback = sel.length ? sel : [candidates[0]];
    onOpenAssistantWithPrompt?.(
      selFallback[0],
      sel.length <= 1
        ? `Give a recruiter-ready brief on ${selFallback[0].name}: fit, risks, and recommended next action.`
        : `Compare these applicants for the hiring bar: ${sel.map((c) => c.name).join(', ')}. Surface tradeoffs and a ranked recommendation.`
    );
  };

  return (
    <div className="fw-pipeline">
      <header className="fw-intel-header">
        <div className="fw-intel-header-text">
          <div className="fw-intel-kicker">
            <span className="fw-intel-spark" aria-hidden>
              <Icon path={mdiCreation} size={0.75} color="#593CB4" />
            </span>
            Talent intelligence
          </div>
          <h2 className="fw-intel-title">Applicants</h2>
          <p className="fw-intel-desc">
            AI-native triage: signals surfaced per candidate, natural-language actions, and one-tap handoff to your
            assistant.
          </p>
        </div>
        <div className="fw-intel-actions">
          <button type="button" className="fw-intel-query" onClick={handleIntelBar}>
            <Icon path={mdiCreation} size={0.7} color="#593CB4" />
            <span className="fw-intel-query-placeholder">
              Ask anything about this pipeline — priorities, comparisons, red flags…
            </span>
            <kbd className="fw-intel-kbd">⌘K</kbd>
          </button>
          <Button text="Interview with AI" variant={ButtonVariant.Primary} onClick={onInterviewWithAI}>
            <Icon path={mdiCreation} size={0.65} />
          </Button>
        </div>
      </header>

      <div className="fw-toolbar">
        <label className="fw-select-all">
          <CheckBox checked={selectedIds.size === n && n > 0} onChange={onToggleAll} />
          <span>Select all</span>
        </label>
        {selectedIds.size > 0 && (
          <button type="button" className="fw-clear" onClick={onClearSelection}>
            Clear {selectedIds.size} selected
          </button>
        )}
        <span className="fw-count">{n} in pipeline</span>
      </div>

      <ul className="fw-card-list" aria-label="Applicants">
        {candidates.map((candidate, rowIndex) => {
          const nudge = getNudgeForRowIndex(rowIndex);
          return (
            <li
              key={candidate.id}
              className={`fw-card${selectedIds.has(candidate.id) ? ' fw-card--selected' : ''}`}
            >
              <div className="fw-card-gutter" aria-hidden />
              <div className="fw-card-main">
                <div className="fw-card-top">
                  <CheckBox
                    checked={selectedIds.has(candidate.id)}
                    onChange={() => onToggleCandidate(candidate.id)}
                  />
                  {candidate.avatarSrc ? (
                    <Avatar src={candidate.avatarSrc} alt="" size="48px" type="round" />
                  ) : (
                    <div
                      className="fw-avatar-fallback"
                      style={{ backgroundColor: candidate.avatarColor }}
                      aria-hidden
                    >
                      {candidate.initials}
                    </div>
                  )}
                  <div className="fw-card-identity">
                    <button
                      type="button"
                      className="fw-name-btn"
                      onClick={() => onCandidateClick?.(candidate)}
                    >
                      {candidate.name}
                    </button>
                    <p className="fw-title">{candidate.title}</p>
                    <div className="fw-signal" role="status">
                      <span className="fw-signal-label">{nudge.label}</span>
                      <span className="fw-signal-text">{nudge.text}</span>
                    </div>
                  </div>
                </div>
                <div className="fw-card-meta">
                  <span className="fw-applied">{candidate.applicationDate}</span>
                  <span className="fw-local">{candidate.localTime}</span>
                </div>
              </div>
              <div className="fw-card-rail">
                <div className="fw-match-pill" title="Role match (illustrative)">
                  <Icon path={mdiCreation} size={0.55} color="#146DA6" />
                  Match {Math.min(5, Math.max(3, 5 - (rowIndex % 3)))}/5
                </div>
                <div className="fw-rail-actions">
                  <button
                    type="button"
                    className="fw-rail-btn"
                    onClick={() => onCandidateClick?.(candidate)}
                    aria-label={`Open profile for ${candidate.name}`}
                  >
                    <Icon path={mdiAccountCircleOutline} size={0.85} color="#343C4C" />
                    Profile
                  </button>
                  <button
                    type="button"
                    className="fw-rail-btn fw-rail-btn--primary"
                    onClick={() =>
                      onOpenAssistantWithPrompt?.(
                        candidate,
                        `Talent conversation: ${candidate.name} — ${nudge.label}. ${nudge.text} What should I validate in screening?`
                      )
                    }
                  >
                    <Icon path={mdiCreation} size={0.8} color="#593CB4" />
                    Discuss with AI
                  </button>
                  <button type="button" className="fw-rail-btn" aria-label={`Schedule ${candidate.name}`}>
                    <Icon path={mdiCalendarClock} size={0.85} color="#343C4C" />
                    Schedule
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
