import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, ButtonSize, ButtonVariant } from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import { mdiClose, mdiCreation } from '@mdi/js';
import type { Candidate } from '../data/candidates';
import ProfileAiInsightsSection, { type ProfileInsightSubtab } from './ProfileAiInsightsSection';
import './CandidateProfilePanel.css';
import './AiInsightsPopover.css';

export interface AiInsightsPopoverProps {
  candidate: Candidate | null;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onOpenAssistantWithPrompt?: (candidate: Candidate, prompt: string) => void;
  onAddToCompare?: (candidate: Candidate) => void;
}

export default function AiInsightsPopover({
  candidate,
  open,
  anchorEl,
  onClose,
  onOpenAssistantWithPrompt,
  onAddToCompare,
}: AiInsightsPopoverProps) {
  const [tab, setTab] = useState<ProfileInsightSubtab>('overview');
  const [expanded, setExpanded] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && candidate) {
      setTab('overview');
      setExpanded(true);
    }
  }, [open, candidate?.id]);

  const positionPopover = useCallback(() => {
    if (!open || !anchorEl || !popoverRef.current) return;
    const pad = 8;
    const rect = anchorEl.getBoundingClientRect();
    const pop = popoverRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pw = Math.min(440, vw - 24);
    pop.style.width = `${pw}px`;
    const ph = pop.offsetHeight;
    let left = rect.left;
    let top = rect.bottom + pad;
    if (left + pw > vw - 12) left = vw - pw - 12;
    if (left < 12) left = 12;
    if (top + ph > vh - 12) top = Math.max(12, rect.top - ph - pad);
    if (top < 12) top = 12;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }, [open, anchorEl]);

  useLayoutEffect(() => {
    positionPopover();
  }, [positionPopover, candidate?.id]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', positionPopover, true);
    window.addEventListener('resize', positionPopover);
    return () => {
      window.removeEventListener('scroll', positionPopover, true);
      window.removeEventListener('resize', positionPopover);
    };
  }, [open, positionPopover]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);

  if (!open || !candidate) return null;

  const handleAnalyseWithAi = () => {
    onOpenAssistantWithPrompt?.(
      candidate,
      `Analyse cross-source AI insights for ${candidate.name}: resume vs. LinkedIn signals, gaps, and highlights.`
    );
    onClose();
  };

  const handleAddToCompare = () => {
    onAddToCompare?.(candidate);
  };

  return createPortal(
    <>
      <div className="ai-insights-popover-backdrop" onClick={onClose} aria-hidden />
      <div
        ref={popoverRef}
        className="ai-insights-popover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-insights-popover-title"
      >
        <div className="ai-insights-popover-top">
          <div className="ai-insights-popover-header">
            <div>
              <h2 id="ai-insights-popover-title" className="ai-insights-popover-title">
                AI insights
              </h2>
              <p className="ai-insights-popover-sub">{candidate.name}</p>
            </div>
            <button type="button" className="ai-insights-popover-close" onClick={onClose} aria-label="Close">
              <Icon path={mdiClose} size={0.85} color="#343C4C" />
            </button>
          </div>

          <div className="ai-insights-popover-subtabs" role="tablist" aria-label="Insight source">
            {(
              [
                { id: 'overview' as const, label: 'Overview' },
                { id: 'resume' as const, label: 'CV' },
                { id: 'linkedin' as const, label: 'LinkedIn' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`ai-insights-popover-subtab${tab === t.id ? ' active' : ''}`}
                onClick={() => {
                  setTab(t.id);
                  setExpanded(true);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ai-insights-popover-scroll">
          <ProfileAiInsightsSection
            key={candidate.id}
            activeSubtab={tab}
            insightsExpanded={expanded}
            onToggleExpanded={() => setExpanded((v) => !v)}
            isOdActionable={false}
            displayCandidate={candidate}
            onOpenAssistantWithPrompt={onOpenAssistantWithPrompt}
            surface="popover"
          />
        </div>

        <div className="ai-insights-popover-footer">
          <Button
            text="Analyse with AI"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={handleAnalyseWithAi}
          >
            <Icon path={mdiCreation} size={0.65} color="#fff" />
          </Button>
          <Button
            text="Add to compare"
            variant={ButtonVariant.Default}
            size={ButtonSize.Medium}
            onClick={handleAddToCompare}
          />
        </div>
      </div>
    </>,
    document.body
  );
}
