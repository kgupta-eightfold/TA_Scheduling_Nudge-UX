import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@mdi/react';
import { mdiClose } from '@mdi/js';
import type { Candidate } from '../data/candidates';
import type { CandidateNudge } from '../data/candidateNudges';
import './InlineChatMiniModal.css';

const MODAL_W = 640;
const MODAL_H = 480;

export const INLINE_CHAT_PROMPTS = [
  'Experience check',
  'Education check',
  'Skill check',
] as const;

export interface InlineChatMiniModalProps {
  open: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  nudge: CandidateNudge | null;
}

export default function InlineChatMiniModal({
  open,
  onClose,
  candidate,
  nudge,
}: InlineChatMiniModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !candidate || !nudge) return null;

  return createPortal(
    <>
      <div className="inline-chat-mini-backdrop" onClick={onClose} aria-hidden />
      <div
        className="inline-chat-mini-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inline-chat-mini-title"
        style={{ width: MODAL_W, minHeight: MODAL_H }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inline-chat-mini-header">
          <div>
            <h2 id="inline-chat-mini-title" className="inline-chat-mini-title">
              Ask AI
            </h2>
            <p className="inline-chat-mini-subtitle">
              {candidate.name} · {nudge.label}
            </p>
          </div>
          <button type="button" className="inline-chat-mini-close" onClick={onClose} aria-label="Close">
            <Icon path={mdiClose} size={0.85} color="#343C4C" />
          </button>
        </div>
        <p className="inline-chat-mini-context">{nudge.text}</p>
        <div className="inline-chat-mini-prompts">
          <p className="inline-chat-mini-prompts-label">Try a prompt</p>
          <div className="inline-chat-mini-prompt-row">
            {INLINE_CHAT_PROMPTS.map((label) => (
              <button key={label} type="button" className="inline-chat-mini-prompt-pill">
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="inline-chat-mini-input-wrap">
          <input
            type="text"
            className="inline-chat-mini-input"
            placeholder="Ask anything about this candidate..."
            aria-label="Chat message"
          />
        </div>
      </div>
    </>,
    document.body
  );
}
