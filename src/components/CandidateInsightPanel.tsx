import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@mdi/react';
import { mdiArrowUp, mdiClose } from '@mdi/js';
import type { Candidate } from '../data/candidates';
import type { CandidateNudge } from '../data/candidateNudges';
import {
  AssistantSummary,
  buildAssistantReply,
  buildComparisonCardContent,
  ComparisonCardFigma,
  type ComparisonCardContent,
} from './NativeAIAssistantPanel';
import './NativeAIAssistantPanel.css';

const aiAgentIconUrl = new URL('../../Assets/AI agent icon.svg', import.meta.url).href;
const recruiterPhotoUrl = new URL('../../Assets/RecruiterPhoto.svg', import.meta.url).href;

const PANEL_TRANSITION_MS = 380;

export interface CandidateInsightPanelProps {
  open: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  nudge: CandidateNudge | null;
}

type InsightAssistantMsg = {
  id: string;
  role: 'assistant';
  summaryBody: string;
  recommendedName: string | null;
  recommendedCandidateId: string | null;
  cards: ComparisonCardContent[];
};

type InsightMessage =
  | { id: string; role: 'user'; text: string }
  | InsightAssistantMsg;

function buildInsightIntro(candidate: Candidate, nudge: CandidateNudge): Omit<InsightAssistantMsg, 'id' | 'role'> {
  const summaryBody = `Here’s a focused ${nudge.label.toLowerCase()} signal for ${candidate.name}. ${nudge.text} The card below summarizes skills alignment and experience relative to this role.`;
  return {
    summaryBody,
    recommendedName: null,
    recommendedCandidateId: null,
    cards: [buildComparisonCardContent(candidate)],
  };
}

function insightSuggestions(candidate: Candidate): { id: string; label: string }[] {
  return [
    { id: 'a', label: `Identify strengths for ${candidate.name}` },
    { id: 'b', label: `Assess ${candidate.name}’s leadership potential` },
    { id: 'c', label: 'Analyze diversity in backgrounds and experience' },
  ];
}

export default function CandidateInsightPanel({
  open,
  onClose,
  candidate,
  nudge,
}: CandidateInsightPanelProps) {
  const [messages, setMessages] = useState<InsightMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(
    () => (candidate ? insightSuggestions(candidate) : []),
    [candidate]
  );

  const placeholder = useMemo(
    () => (candidate ? `Ask about ${candidate.name}...` : 'Ask about this candidate...'),
    [candidate]
  );

  const sessionKey = useMemo(
    () => (candidate && nudge ? `${candidate.id}:${nudge.label}` : ''),
    [candidate, nudge]
  );

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
    if (!panelMounted || !candidate || !nudge) {
      setMessages([]);
      setDraft('');
      return;
    }
    setMessages([
      {
        id: `intro-${sessionKey}`,
        role: 'assistant',
        ...buildInsightIntro(candidate, nudge),
      },
    ]);
    setDraft('');
  }, [panelMounted, candidate, nudge, sessionKey]);

  useLayoutEffect(() => {
    if (!panelVisible) return;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [panelVisible, messages]);

  const appendExchange = useCallback(
    (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || !candidate) return;
      const uid = `u-${Date.now()}`;
      const aid = `a-${Date.now() + 1}`;
      const reply = buildAssistantReply([candidate], trimmed);
      setMessages((prev) => [
        ...prev,
        { id: uid, role: 'user', text: trimmed },
        { id: aid, role: 'assistant', ...reply },
      ]);
      setDraft('');
    },
    [candidate]
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

  if (!panelMounted || !candidate || !nudge) return null;

  return createPortal(
    <>
      <div
        className={`native-ai-overlay${panelVisible ? ' native-ai-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden={!panelVisible}
      />
      <div
        className={`native-ai-panel${panelVisible ? ' native-ai-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-insight-panel-title"
      >
        <div className="native-ai-panel-header">
          <div className="native-ai-panel-header-text">
            <h2 id="candidate-insight-panel-title" className="native-ai-panel-title">
              {candidate.name}
            </h2>
            <p className="native-ai-panel-subtitle">
              {nudge.label} — AI insight uses skills, experience, and interview signals.
            </p>
          </div>
          <button type="button" className="native-ai-panel-close" onClick={onClose} aria-label="Close">
            <Icon path={mdiClose} size={0.85} color="#343C4C" />
          </button>
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
              <div className="native-ai-suggestions">
                <p className="native-ai-suggested-queries-heading">Suggested queries to get started</p>
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

              <div
                className="native-ai-input-outer native-ai-input-outer--selection"
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
