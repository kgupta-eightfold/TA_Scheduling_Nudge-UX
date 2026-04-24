import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  Avatar,
  Button,
  ButtonVariant,
  ButtonWidth,
  CheckBox,
  SelectorSize,
} from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import { mdiArrowUp, mdiArrowExpand, mdiArrowCollapse, mdiCheck, mdiChevronDown, mdiClose } from '@mdi/js';
import type { Candidate } from '../data/candidates';
import { getAssistantPromptSuggestions } from '../data/assistantPromptSuggestions';
import './NativeAIAssistantPanel.css';

const aiAgentIconUrl = new URL('../../Assets/AI agent icon.svg', import.meta.url).href;
const recruiterPhotoUrl = new URL('../../Assets/RecruiterPhoto.svg', import.meta.url).href;

const REQUIRED_SKILLS_TOTAL = 21;
const PANEL_TRANSITION_MS = 380;

export interface NativeAIAssistantPanelProps {
  open: boolean;
  onClose: () => void;
  selectedCandidates: Candidate[];
  placeholder: string;
  /** When set as the panel opens, seeds the thread with this user message + assistant reply. */
  initialUserPrompt?: string | null;
  onInitialUserPromptConsumed?: () => void;
  /** Push mode: no overlay, slides in from right and pushes the page. */
  pushMode?: boolean;
}

type ComparisonRow = { ok: boolean; text: string };

export type ComparisonCardContent = {
  candidate: Candidate;
  requiredSkillsMet: number;
  requiredSkillsTotal: number;
  skills: ComparisonRow[];
  experience: ComparisonRow[];
};

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string;
      role: 'assistant';
      summaryBody: string;
      recommendedName: string | null;
      recommendedCandidateId: string | null;
      cards: ComparisonCardContent[];
    };

function formatRoleLine(c: Candidate): string {
  const parts = c.title.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]} @ ${parts[parts.length - 1]}`;
  }
  return c.title;
}

/** Highest match score wins; stable tie-break on id */
function pickRecommendedCandidate(candidates: Candidate[]): Candidate | null {
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => {
    const ds = (b.matchScore ?? 0) - (a.matchScore ?? 0);
    if (ds !== 0) return ds;
    return a.id.localeCompare(b.id);
  })[0];
}

function requiredSkillsMetForCandidate(c: Candidate): number {
  const score = c.matchScore ?? 0;
  const base = Math.round((score / 5) * REQUIRED_SKILLS_TOTAL);
  const jitter = (parseInt(c.id, 10) || 0) % 4;
  return Math.min(REQUIRED_SKILLS_TOTAL, Math.max(4, base + jitter - 2));
}

export function buildComparisonCardContent(c: Candidate): ComparisonCardContent {
  const score = c.matchScore ?? 0;
  const met = requiredSkillsMetForCandidate(c);
  const gapLine =
    score >= 4
      ? 'Narrower exposure to regulated industry workflows'
      : 'Design patterns, React Js, Artificial Intelligence';

  return {
    candidate: c,
    requiredSkillsMet: met,
    requiredSkillsTotal: REQUIRED_SKILLS_TOTAL,
    skills: [
      { ok: true, text: 'Python, Apache Spark, batch data pipelines' },
      { ok: true, text: 'Cloud-native delivery and ownership' },
      { ok: false, text: gapLine },
    ],
    experience: [
      { ok: true, text: c.experience ?? 'Experience on file' },
      { ok: true, text: 'Strong system design fundamentals' },
    ],
  };
}

function buildCompareNarrative(
  selected: Candidate[],
  userPrompt: string,
  recommended: Candidate | null
): { summaryBody: string; recommendedName: string | null; recommendedCandidateId: string | null } {
  const names = selected.map((c) => c.name);
  if (names.length === 0) {
    return {
      summaryBody: `To work on “${userPrompt}”, select one or more candidates in the table. Comparison uses experience, required skills (of ${REQUIRED_SKILLS_TOTAL}), and interview signals.`,
      recommendedName: null,
      recommendedCandidateId: null,
    };
  }
  if (names.length === 1) {
    return {
      summaryBody: `Here’s a structured view for ${names[0]} for “${userPrompt}”, using experience, required skills (${REQUIRED_SKILLS_TOTAL} checked against the role), and interview feedback.`,
      recommendedName: null,
      recommendedCandidateId: null,
    };
  }

  const others = names.filter((n) => n !== recommended?.name);
  const othersPhrase = others.length ? ` Relative to ${others.join(' and ')}, ${recommended?.name ?? ''} shows the stronger alignment on experience depth and skills match.` : '';

  const body = recommended
    ? `Across experience and required skills (${REQUIRED_SKILLS_TOTAL} role skills), ${recommended.name} leads on overall fit.${othersPhrase}`
    : `Side-by-side comparison for “${userPrompt}” using experience and required skills (${REQUIRED_SKILLS_TOTAL}).`;

  return {
    summaryBody: body,
    recommendedName: recommended?.name ?? null,
    recommendedCandidateId: recommended?.id ?? null,
  };
}

export function buildAssistantReply(
  selected: Candidate[],
  userPrompt: string
): Omit<Extract<ChatMessage, { role: 'assistant' }>, 'id' | 'role'> {
  const recommended = selected.length >= 2 ? pickRecommendedCandidate(selected) : null;
  const { summaryBody, recommendedName, recommendedCandidateId } = buildCompareNarrative(
    selected,
    userPrompt,
    recommended
  );
  const cards = selected.map((c) => buildComparisonCardContent(c));
  return { summaryBody, recommendedName, recommendedCandidateId, cards };
}

export function ComparisonCardFigma({
  card,
  isRecommended,
  showAdvanceCheckbox = false,
  advanceChecked = false,
  onAdvanceCheckboxChange,
}: {
  card: ComparisonCardContent;
  isRecommended: boolean;
  showAdvanceCheckbox?: boolean;
  advanceChecked?: boolean;
  onAdvanceCheckboxChange?: (checked: boolean) => void;
}) {
  const { candidate } = card;
  return (
    <div
      className={`native-ai-figma-card${isRecommended ? ' native-ai-figma-card--recommended' : ''}`}
    >
      <div className="native-ai-figma-card-head">
        {showAdvanceCheckbox && (
          <div className="native-ai-figma-card-check">
            <CheckBox
              checked={advanceChecked}
              onChange={(e) => onAdvanceCheckboxChange?.(e.target.checked)}
              ariaLabel={`Include ${candidate.name} when advancing candidates`}
              size={SelectorSize.Small}
            />
          </div>
        )}
        {candidate.avatarSrc ? (
          <Avatar src={candidate.avatarSrc} alt={candidate.name} size="44px" type="round" />
        ) : (
          <div
            className="native-ai-figma-card-avatar"
            style={{ backgroundColor: candidate.avatarColor }}
          >
            {candidate.initials}
          </div>
        )}
        <div className="native-ai-figma-card-id">
          <div className="native-ai-figma-card-name">{candidate.name}</div>
          <div className="native-ai-figma-card-role">{formatRoleLine(candidate)}</div>
        </div>
      </div>
      <div className="native-ai-figma-card-divider" />
      <div className="native-ai-figma-card-section">
        <div className="native-ai-figma-card-section-title">Skills</div>
        <div className="native-ai-figma-skills-metric">
          Required skills ({card.requiredSkillsMet}/{card.requiredSkillsTotal})
        </div>
        <ul className="native-ai-figma-card-list">
          {card.skills.map((row, i) => (
            <li key={`s-${i}`} className="native-ai-figma-card-row">
              <span
                className={
                  row.ok ? 'native-ai-figma-icon native-ai-figma-icon--ok' : 'native-ai-figma-icon native-ai-figma-icon--no'
                }
              >
                <Icon path={row.ok ? mdiCheck : mdiClose} size={0.55} />
              </span>
              <span className="native-ai-figma-row-text">{row.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="native-ai-figma-card-divider" />
      <div className="native-ai-figma-card-section">
        <div className="native-ai-figma-card-section-title">Experience</div>
        <ul className="native-ai-figma-card-list">
          {card.experience.map((row, i) => (
            <li key={`e-${i}`} className="native-ai-figma-card-row">
              <span className="native-ai-figma-icon native-ai-figma-icon--ok">
                <Icon path={mdiCheck} size={0.55} />
              </span>
              <span className="native-ai-figma-row-text">{row.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AssistantSummary({
  summaryBody,
  recommendedName,
}: {
  summaryBody: string;
  recommendedName: string | null;
}) {
  return (
    <p className="native-ai-summary">
      <span className="native-ai-summary-text">{summaryBody}</span>
      {recommendedName ? (
        <>
          {' '}
          <strong className="native-ai-strong-fit">Strong fit: {recommendedName}</strong>
        </>
      ) : null}
    </p>
  );
}

export default function NativeAIAssistantPanel({
  open,
  onClose,
  selectedCandidates,
  placeholder,
  initialUserPrompt = null,
  onInitialUserPromptConsumed,
  pushMode = false,
}: NativeAIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [advanceSelectedIds, setAdvanceSelectedIds] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const launchSessionKeyRef = useRef<string | null>(null);

  const hasSelection = selectedCandidates.length > 0;
  const suggestions = useMemo(
    () => getAssistantPromptSuggestions(selectedCandidates),
    [selectedCandidates]
  );

  const compareSelectionKey = useMemo(
    () => selectedCandidates.map((c) => c.id).sort().join('|'),
    [selectedCandidates]
  );

  const isCompareScenario = selectedCandidates.length >= 2;

  useEffect(() => {
    if (!open) return;
    setAdvanceSelectedIds(new Set(selectedCandidates.map((c) => c.id)));
  }, [open, compareSelectionKey, selectedCandidates]);

  const toggleAdvanceCandidate = useCallback((id: string, checked: boolean) => {
    setAdvanceSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (open) {
      setPanelMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setPanelVisible(false);
    const t = window.setTimeout(() => setPanelMounted(false), PANEL_TRANSITION_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!panelMounted) {
      setMessages([]);
      setDraft('');
    }
  }, [panelMounted]);

  useEffect(() => {
    if (!open) {
      launchSessionKeyRef.current = null;
      return;
    }

    const trimmed = initialUserPrompt?.trim();
    if (trimmed) {
      const reply = buildAssistantReply(selectedCandidates, trimmed);
      setMessages([
        { id: `u-launch-${Date.now()}`, role: 'user', text: trimmed },
        { id: `a-launch-${Date.now() + 1}`, role: 'assistant', ...reply },
      ]);
      launchSessionKeyRef.current = compareSelectionKey;
      onInitialUserPromptConsumed?.();
      return;
    }

    if (
      launchSessionKeyRef.current !== null &&
      launchSessionKeyRef.current === compareSelectionKey
    ) {
      return;
    }

    launchSessionKeyRef.current = null;

    if (isCompareScenario) {
      const payload = buildAssistantReply(selectedCandidates, 'Compare candidates');
      setMessages([
        {
          id: `default-compare-${compareSelectionKey}`,
          role: 'assistant',
          ...payload,
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [
    open,
    compareSelectionKey,
    isCompareScenario,
    selectedCandidates,
    initialUserPrompt,
    onInitialUserPromptConsumed,
  ]);

  useLayoutEffect(() => {
    if (!panelVisible) return;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [panelVisible, messages]);

  const appendExchange = useCallback(
    (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed) return;
      const uid = `u-${Date.now()}`;
      const aid = `a-${Date.now() + 1}`;
      const reply = buildAssistantReply(selectedCandidates, trimmed);
      setMessages((prev) => [
        ...prev,
        { id: uid, role: 'user', text: trimmed },
        { id: aid, role: 'assistant', ...reply },
      ]);
      setDraft('');
    },
    [selectedCandidates]
  );

  const handlePillClick = (label: string) => {
    appendExchange(label);
  };

  const handleSend = () => {
    appendExchange(draft);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!panelMounted) return null;

  return createPortal(
    <>
      {!pushMode && (
        <div
          className={`native-ai-overlay${panelVisible ? ' native-ai-overlay--visible' : ''}`}
          onClick={onClose}
          aria-hidden={!panelVisible}
        />
      )}
      <div
        className={`native-ai-panel${panelVisible ? ' native-ai-panel--open' : ''}${pushMode ? ' native-ai-panel--push' : ''}${expanded ? ' native-ai-panel--expanded' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="native-ai-panel-title"
      >
        <div className="native-ai-panel-header">
          <div className="native-ai-panel-header-text">
            <h2 id="native-ai-panel-title" className="native-ai-panel-title">
              Compare candidates
            </h2>
            <p className="native-ai-panel-subtitle">
              Information used from skills, experience, diversity, and interview feedback.
            </p>
          </div>
          <div className="native-ai-panel-header-actions">
            {pushMode && (
              <button
                type="button"
                className="native-ai-panel-close"
                aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
                onClick={() => setExpanded((v) => !v)}
              >
                <Icon path={expanded ? mdiArrowCollapse : mdiArrowExpand} size={0.85} color="#343C4C" />
              </button>
            )}
            <button type="button" className="native-ai-panel-close" onClick={onClose} aria-label="Close">
              <Icon path={mdiClose} size={0.85} color="#343C4C" />
            </button>
          </div>
        </div>
        <div className="native-ai-panel-divider" />

        <div className="native-ai-panel-body">
          <div className="native-ai-panel-main">
            <div className="native-ai-chat-scroll" role="log" aria-live="polite">
              <div className="native-ai-chat-inner">
                {messages.map((m) =>
                  m.role === 'user' ? (
                    <div key={m.id} className="native-ai-turn native-ai-turn--user">
                      <img
                        src={recruiterPhotoUrl}
                        alt=""
                        className="native-ai-avatar native-ai-avatar--recruiter"
                        width={36}
                        height={36}
                      />
                      <div className="native-ai-bubble">{m.text}</div>
                    </div>
                  ) : (
                    <div key={m.id} className="native-ai-turn native-ai-turn--assistant">
                      <img
                        src={aiAgentIconUrl}
                        alt=""
                        className="native-ai-avatar native-ai-avatar--ai"
                        width={36}
                        height={36}
                      />
                      <div className="native-ai-assistant-block">
                        <AssistantSummary
                          summaryBody={m.summaryBody}
                          recommendedName={m.recommendedName}
                        />
                        {m.cards.length > 0 && (
                          <div className="native-ai-response-cards-strip">
                            {m.cards.map((card) => (
                              <ComparisonCardFigma
                                key={card.candidate.id}
                                card={card}
                                isRecommended={
                                  m.recommendedCandidateId !== null &&
                                  card.candidate.id === m.recommendedCandidateId
                                }
                                showAdvanceCheckbox={isCompareScenario}
                                advanceChecked={advanceSelectedIds.has(card.candidate.id)}
                                onAdvanceCheckboxChange={(checked) =>
                                  toggleAdvanceCandidate(card.candidate.id, checked)
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={chatEndRef} className="native-ai-chat-anchor" />
              </div>
            </div>

            <div className="native-ai-footer">
              {isCompareScenario && hasSelection && (
                <div className="native-ai-advance-cta">
                  <Button
                    text={
                      advanceSelectedIds.size === selectedCandidates.length
                        ? 'Advance candidates'
                        : `Advance candidates (${advanceSelectedIds.size})`
                    }
                    variant={ButtonVariant.Primary}
                    buttonWidth={ButtonWidth.fill}
                    disabled={advanceSelectedIds.size === 0}
                    ariaLabel="Advance selected candidates"
                    onClick={() => {}}
                  />
                </div>
              )}

              <div className="native-ai-suggestions native-ai-suggestions--collapsible">
                <button
                  type="button"
                  className="native-ai-suggestions-toggle"
                  onClick={() => setSuggestionsOpen((v) => !v)}
                  aria-expanded={suggestionsOpen}
                  aria-controls="native-ai-suggested-queries"
                  id="native-ai-suggestions-toggle"
                >
                  <span className="native-ai-suggestions-toggle-label">
                    Suggested queries to get started
                  </span>
                  <span
                    className={`native-ai-suggestions-toggle-chevron${suggestionsOpen ? ' native-ai-suggestions-toggle-chevron--open' : ''}`}
                  >
                    <Icon path={mdiChevronDown} size={0.85} color="#593cb4" />
                  </span>
                </button>
                {suggestionsOpen && (
                  <div
                    className="native-ai-suggestions-panel"
                    id="native-ai-suggested-queries"
                    role="region"
                    aria-labelledby="native-ai-suggestions-toggle"
                  >
                    <div className="native-ai-query-pills">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="native-ai-query-pill"
                          onClick={() => handlePillClick(s.label)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`native-ai-input-outer${hasSelection ? ' native-ai-input-outer--selection' : ''}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="native-ai-input-inner">
                  <div className="native-ai-input-field">
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholder}
                      className="native-ai-text-input"
                      aria-label="Ask AI"
                    />
                  </div>
                  <button
                    type="button"
                    className="native-ai-send-btn"
                    aria-label="Send"
                    onClick={handleSend}
                  >
                    <Icon path={mdiArrowUp} size={0.85} color="#FFFFFF" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
