import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Button, ButtonVariant, ButtonSize, ButtonShape, IconName } from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import { mdiArrowUp, mdiClose, mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import type { Candidate } from '../data/candidates';
import { getAssistantPromptSuggestions } from '../data/assistantPromptSuggestions';
import './FloatingInputPanel.css';

export type FloatingInputPanelVariant = 'v1' | 'v2' | 'v4';

interface FloatingInputPanelProps {
  variant: FloatingInputPanelVariant;
  hasSelection: boolean;
  placeholder: string;
  selectedCandidates: Candidate[];
  onOpenAssistant: () => void;
  onOpenAssistantWithPrompt: (prompt: string) => void;
  onClearSelection?: () => void;
  dimmed: boolean;
  onCollapse?: () => void;
}

function AvatarStack({
  candidates: list,
  showOverflow,
  maxShown = 3,
}: {
  candidates: Candidate[];
  showOverflow?: boolean;
  maxShown?: number;
}) {
  const shown = list.slice(0, maxShown);
  const overflowCount = list.length - maxShown;
  return (
    <div className="fip-avatar-stack">
      {shown.map((c, i) => (
        <div
          key={c.id}
          className={`fip-avatar${c.avatarSrc ? ' fip-avatar--photo' : ''}`}
          style={{
            backgroundColor: c.avatarColor,
            zIndex: shown.length - i,
          }}
          title={c.name}
        >
          {c.avatarSrc ? (
            <img src={c.avatarSrc} alt={c.name} className="fip-avatar-img" />
          ) : (
            c.initials
          )}
        </div>
      ))}
      {showOverflow && overflowCount > 0 && (
        <div className="fip-avatar fip-avatar--overflow">+{overflowCount}</div>
      )}
    </div>
  );
}

export default function FloatingInputPanel({
  variant,
  hasSelection,
  placeholder,
  selectedCandidates,
  onOpenAssistant,
  onOpenAssistantWithPrompt,
  onClearSelection: _onClearSelection,
  dimmed,
  onCollapse,
}: FloatingInputPanelProps) {
  void _onClearSelection;
  const [askMode, setAskMode] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const pillsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const suggestions = useMemo(
    () => getAssistantPromptSuggestions(selectedCandidates),
    [selectedCandidates]
  );

  useEffect(() => {
    setAskMode(false);
    setCustomDraft('');
  }, [selectedCandidates]);

  useEffect(() => {
    if (askMode) inputRef.current?.focus();
  }, [askMode]);

  const updateScrollIndicators = () => {
    const el = pillsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    updateScrollIndicators();
    const el = pillsRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollIndicators, { passive: true });
    const ro = new ResizeObserver(updateScrollIndicators);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollIndicators);
      ro.disconnect();
    };
  }, [suggestions, hasSelection, askMode]);

  const scrollPills = (dir: 'left' | 'right') => {
    const el = pillsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
  };

  const handlePillClick = (label: string) => {
    onOpenAssistantWithPrompt(label);
  };

  const handleCustomSubmit = () => {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    onOpenAssistantWithPrompt(trimmed);
    setCustomDraft('');
    setAskMode(false);
  };

  const handleCustomKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit();
    }
    if (e.key === 'Escape') {
      setAskMode(false);
    }
  };

  const isV2 = variant === 'v2';
  const showV2Bar = isV2 && hasSelection;
  const isV4 = variant === 'v4';
  const showV4Bar = isV4 && hasSelection;

  if (isV2) {
    return (
      <div
        className={`floating-input-wrapper floating-input-wrapper--v2${dimmed ? ' floating-input-wrapper--assistant-open' : ''}${showV2Bar ? ' floating-input-wrapper--v2-active' : ''}`}
      >
        {showV2Bar ? (
          <div className="fip-bar">
            <AvatarStack candidates={selectedCandidates} />
            <div className="fip-selection-info">
              <span className="fip-selection-count">
                {selectedCandidates.length} selected
              </span>
              <span className="fip-selection-subtitle">Ask AI anything</span>
            </div>

            <div className="fip-divider" />

            {askMode ? (
              <div className="fip-custom-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  className="fip-custom-input"
                  placeholder="Ask a custom question..."
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value)}
                  onKeyDown={handleCustomKeyDown}
                />
                <button
                  type="button"
                  className="fip-custom-submit"
                  aria-label="Send custom prompt"
                  onClick={handleCustomSubmit}
                  disabled={!customDraft.trim()}
                >
                  <Icon path={mdiArrowUp} size={0.7} color="#fff" />
                </button>
                <button
                  type="button"
                  className="fip-icon-btn"
                  aria-label="Back to prompts"
                  onClick={() => setAskMode(false)}
                >
                  <Icon path={mdiClose} size={0.7} color="#69717f" />
                </button>
              </div>
            ) : (
              <>
                {canScrollLeft && (
                  <button
                    type="button"
                    className="fip-scroll-btn fip-scroll-btn--left"
                    aria-label="Scroll prompts left"
                    onClick={() => scrollPills('left')}
                  >
                    <Icon path={mdiChevronLeft} size={0.7} color="#4f5666" />
                  </button>
                )}
                <div className="fip-pills-track" ref={pillsRef}>
                  {suggestions.map((s) => (
                    <Button
                      key={s.id}
                      text={s.label}
                      variant={ButtonVariant.Default}
                      size={ButtonSize.Small}
                      shape={ButtonShape.Pill}
                      onClick={() => handlePillClick(s.label)}
                    />
                  ))}
                </div>
                {canScrollRight && (
                  <button
                    type="button"
                    className="fip-scroll-btn fip-scroll-btn--right"
                    aria-label="Scroll prompts right"
                    onClick={() => scrollPills('right')}
                  >
                    <Icon path={mdiChevronRight} size={0.7} color="#4f5666" />
                  </button>
                )}
                <Button
                  text="Ask"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  shape={ButtonShape.Pill}
                  iconProps={{ path: IconName.mdiPlus }}
                  onClick={() => setAskMode(true)}
                  classNames="fip-ask-btn"
                />
                {onCollapse && (
                  <>
                    <span className="fip-collapse-sep" aria-hidden="true" />
                    <button
                      type="button"
                      className="fip-collapse-btn"
                      aria-label="Collapse panel"
                      onClick={onCollapse}
                    >
                      <Icon path={mdiClose} size={0.65} color="#69717f" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <div className={`floating-input${hasSelection ? ' floating-input--has-selection' : ''}`}>
            <div className="floating-input-inner">
              <div className="floating-input-field">
                <input
                  type="text"
                  placeholder={placeholder}
                  className="floating-text-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onOpenAssistant();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="floating-send-btn"
                aria-label="Open AI assistant"
                onClick={() => onOpenAssistant()}
              >
                <Icon path={mdiArrowUp} size={0.85} color="#2B3271" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isV4) {
    return (
      <div className={`floating-input-wrapper floating-input-wrapper--v4${dimmed ? ' floating-input-wrapper--assistant-open' : ''}${showV4Bar ? ' floating-input-wrapper--v4-active' : ''}`}>
        {showV4Bar ? (
          <div className="fip-v4-card">
            <div className="fip-v4-inner">
              {/* Avatar bubble */}
              <div className="fip-v4-avatar-bubble">
                <AvatarStack candidates={selectedCandidates} showOverflow maxShown={2} />
              </div>

              {/* Pills track */}
              <div className="fip-v4-pills-area">
                {canScrollLeft && (
                  <button type="button" className="fip-scroll-btn fip-scroll-btn--left" aria-label="Scroll prompts left" onClick={() => scrollPills('left')}>
                    <Icon path={mdiChevronLeft} size={0.7} color="#4f5666" />
                  </button>
                )}
                <div className="fip-pills-track" ref={pillsRef}>
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="fip-v4-pill"
                      onClick={() => handlePillClick(s.label)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {canScrollRight && (
                  <button type="button" className="fip-scroll-btn fip-scroll-btn--right" aria-label="Scroll prompts right" onClick={() => scrollPills('right')}>
                    <Icon path={mdiChevronRight} size={0.7} color="#4f5666" />
                  </button>
                )}
              </div>

              {/* Ask AI bubble */}
              <div className="fip-v4-ask-bubble">
                <button type="button" className="fip-v4-ask-btn" onClick={() => onOpenAssistant()}>
                  <span className="fip-v4-ask-icon">+</span>
                  <span>Ask AI</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`floating-input${hasSelection ? ' floating-input--has-selection' : ''}`}>
            <div className="floating-input-inner">
              <div className="floating-input-field">
                <input
                  type="text"
                  placeholder={placeholder}
                  className="floating-text-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onOpenAssistant();
                    }
                  }}
                />
              </div>
              <button type="button" className="floating-send-btn" aria-label="Open AI assistant" onClick={() => onOpenAssistant()}>
                <Icon path={mdiArrowUp} size={0.85} color="#2B3271" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`floating-input-wrapper${dimmed ? ' floating-input-wrapper--assistant-open' : ''}`}
    >
      <div className={`floating-input${hasSelection ? ' floating-input--has-selection' : ''}`}>
        <div className="floating-input-inner">
          <div className="floating-input-field">
            <input
              type="text"
              placeholder={placeholder}
              className="floating-text-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onOpenAssistant();
                }
              }}
            />
          </div>
          <button
            type="button"
            className="floating-send-btn"
            aria-label="Open AI assistant"
            onClick={() => onOpenAssistant()}
          >
            <Icon path={mdiArrowUp} size={0.85} color="#2B3271" />
          </button>
        </div>
      </div>
    </div>
  );
}
