import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@mdi/react';
import { mdiClose, mdiCreation } from '@mdi/js';
import './TextSelectionPopover.css';

const PROMPTS = ['Summarize this', 'Explain further', 'Compare with requirements'];

type Phase = 'idle' | 'button' | 'popover';

export default function TextSelectionPopover() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [selectedText, setSelectedText] = useState('');
  const [buttonPos, setButtonPos] = useState({ top: 0, left: 0 });
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [highlightRects, setHighlightRects] = useState<DOMRect[]>([]);
  const savedRangeRef = useRef<Range | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const recalcHighlightRects = useCallback(() => {
    const range = savedRangeRef.current;
    if (!range) return;
    setHighlightRects(Array.from(range.getClientRects()));
  }, []);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (phase === 'popover') return;
      if (
        buttonRef.current &&
        buttonRef.current.contains(e.target as Node)
      )
        return;

      const sel = window.getSelection();
      const text = sel?.toString().trim();

      if (!text || text.length < 2) {
        setPhase('idle');
        setSelectedText('');
        savedRangeRef.current = null;
        return;
      }

      const range = sel!.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      savedRangeRef.current = range.cloneRange();
      setSelectedText(text);
      setButtonPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
      setPhase('button');
    },
    [phase]
  );

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleAnalyseClick = () => {
    const range = savedRangeRef.current;
    if (!range) return;

    const rects = Array.from(range.getClientRects());
    setHighlightRects(rects);

    const lastRect = rects[rects.length - 1] ?? range.getBoundingClientRect();
    setPopoverPos({
      top: lastRect.bottom + 10,
      left: lastRect.left + lastRect.width / 2,
    });

    setPhase('popover');
    window.getSelection()?.removeAllRanges();
  };

  const handleClose = useCallback(() => {
    setPhase('idle');
    setHighlightRects([]);
    setSelectedText('');
    savedRangeRef.current = null;
  }, []);

  useEffect(() => {
    if (phase !== 'popover') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase, handleClose]);

  useEffect(() => {
    if (phase !== 'popover') return;
    const onScroll = () => recalcHighlightRects();
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [phase, recalcHighlightRects]);

  return createPortal(
    <>
      {phase === 'popover' &&
        highlightRects.map((r, i) => (
          <div
            key={i}
            className="tsp-highlight-overlay"
            style={{
              top: r.top,
              left: r.left,
              width: r.width,
              height: r.height,
            }}
          />
        ))}

      {phase === 'button' && (
        <button
          ref={buttonRef}
          className="tsp-analyse-btn"
          style={{ top: buttonPos.top, left: buttonPos.left }}
          onClick={handleAnalyseClick}
          type="button"
        >
          <Icon path={mdiCreation} size={0.6} color="#fff" />
          Analyse with AI
        </button>
      )}

      {phase === 'popover' && (
        <>
          <div className="tsp-backdrop" onClick={handleClose} />
          <div
            className="tsp-popover"
            style={{ top: popoverPos.top, left: popoverPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tsp-popover-header">
              <div>
                <h3 className="tsp-popover-title">Ask AI</h3>
                <p className="tsp-popover-subtitle">
                  &ldquo;
                  {selectedText.length > 80
                    ? selectedText.slice(0, 80) + '…'
                    : selectedText}
                  &rdquo;
                </p>
              </div>
              <button
                type="button"
                className="tsp-popover-close"
                onClick={handleClose}
                aria-label="Close"
              >
                <Icon path={mdiClose} size={0.85} color="#343C4C" />
              </button>
            </div>

            <div className="tsp-popover-prompts">
              <p className="tsp-popover-prompts-label">Try a prompt</p>
              <div className="tsp-popover-prompt-row">
                {PROMPTS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="tsp-popover-prompt-pill"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="tsp-popover-input-wrap">
              <input
                type="text"
                className="tsp-popover-input"
                placeholder="Ask anything about this text..."
                aria-label="AI prompt"
                autoFocus
              />
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
