import { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  IconName,
  snack,
} from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import { mdiClose, mdiChevronDown, mdiCreation as mdiCreationPath } from '@mdi/js';
import type { Candidate } from '../data/candidates';

export type ProfileInsightSubtab = 'overview' | 'resume' | 'linkedin';

interface ProfileAiInsightsSectionProps {
  activeSubtab: ProfileInsightSubtab;
  insightsExpanded: boolean;
  onToggleExpanded: () => void;
  isOdActionable: boolean;
  displayCandidate: Candidate;
  onOpenAssistantWithPrompt?: (candidate: Candidate, prompt: string) => void;
  onAssessWithAI?: (candidate: Candidate) => void;
  /** Neutral surface for ODA popover (no purple gradient panel) */
  surface?: 'panel' | 'popover';
}

export default function ProfileAiInsightsSection({
  activeSubtab,
  insightsExpanded,
  onToggleExpanded,
  isOdActionable,
  displayCandidate,
  onOpenAssistantWithPrompt,
  onAssessWithAI,
  surface = 'panel',
}: ProfileAiInsightsSectionProps) {
  const [notePopupIndex, setNotePopupIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const rootClass =
    surface === 'popover' ? 'cp-ai-insights cp-ai-insights--popover' : 'cp-ai-insights';

  return (
    <div className={rootClass}>
      <div className="cp-ai-insights-summary">
        <span className="cp-ai-insights-icon" aria-hidden>
          <Icon path={mdiCreationPath} size={0.65} color="#593CB4" />
        </span>
        <span className="cp-ai-insights-text">
          {activeSubtab === 'overview' && (
            <>
              <strong>2 mismatches</strong> between Resume &amp; LinkedIn
            </>
          )}
          {activeSubtab === 'resume' && (
            <>
              <strong>2 observations</strong> from resume analysis
            </>
          )}
          {activeSubtab === 'linkedin' && (
            <>
              <strong>3 signals</strong> from LinkedIn profile
            </>
          )}
        </span>
        <button type="button" className="cp-ai-insights-toggle" onClick={onToggleExpanded}>
          {insightsExpanded ? 'Show less' : 'Show more'}
          <Icon
            path={mdiChevronDown}
            size={0.6}
            color="#593CB4"
            className={insightsExpanded ? 'cp-ai-chevron-rotated' : ''}
          />
        </button>
      </div>

      {insightsExpanded && (
        <div className="cp-ai-insights-detail">
          {activeSubtab === 'overview' && (
            <>
              {[
                {
                  label: 'Job title',
                  desc: 'Resume says "Staff UX Designer" — LinkedIn shows "Sr Principal UX Designer"',
                },
                {
                  label: 'Tenure at Cisco',
                  desc: 'Resume lists 3 yrs 4 mo — LinkedIn shows 2 yrs 8 mo (8-month gap)',
                },
              ].map((item, idx) => (
                <div key={idx} className={`cp-ai-insights-item${isOdActionable ? ' od-actionable-row' : ''}`}>
                  <span className="cp-ai-insights-item-badge mismatch">Mismatch</span>
                  <div className="cp-ai-insights-item-content">
                    <span className="cp-ai-insights-item-label">{item.label}</span>
                    <span className="cp-ai-insights-item-desc">{item.desc}</span>
                  </div>
                  {isOdActionable && (
                    <div className="cp-od-cta-wrap">
                      <Button
                        text="Create note"
                        variant={ButtonVariant.SystemUI}
                        size={ButtonSize.Small}
                        iconProps={{ path: IconName.mdiNotePlusOutline }}
                        classNames="cp-od-create-note-btn"
                        onClick={() => {
                          setNotePopupIndex(notePopupIndex === idx ? null : idx);
                          setNoteText(item.desc);
                        }}
                      />
                      {notePopupIndex === idx && (
                        <div className="cp-od-note-popup" onClick={(e) => e.stopPropagation()}>
                          <div className="cp-od-note-popup-header">
                            <span>Create note</span>
                            <button
                              type="button"
                              className="cp-od-note-popup-close"
                              onClick={() => setNotePopupIndex(null)}
                            >
                              <Icon path={mdiClose} size={0.65} color="#69717F" />
                            </button>
                          </div>
                          <textarea
                            className="cp-od-note-textarea"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows={3}
                            autoFocus
                          />
                          <div className="cp-od-note-popup-footer">
                            <Button
                              text="Save note"
                              variant={ButtonVariant.Primary}
                              size={ButtonSize.Small}
                              onClick={() => {
                                setNotePopupIndex(null);
                                setNoteText('');
                                snack.servePositive({
                                  content: 'Note added successfully',
                                  duration: 3000,
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {!isOdActionable && (
                <>
                  <div className="cp-ai-insights-item highlight-row">
                    <span className="cp-ai-insights-item-badge highlight">Highlight</span>
                    <div className="cp-ai-insights-item-content">
                      <span className="cp-ai-insights-item-label">Design systems depth</span>
                      <span className="cp-ai-insights-item-desc">
                        Built and scaled a design system used by 40+ engineers at Cisco — directly relevant to this
                        role&apos;s core requirement
                      </span>
                    </div>
                  </div>
                  <div className="cp-ai-insights-item highlight-row">
                    <span className="cp-ai-insights-item-badge highlight">Highlight</span>
                    <div className="cp-ai-insights-item-content">
                      <span className="cp-ai-insights-item-label">Leadership signal</span>
                      <span className="cp-ai-insights-item-desc">
                        Mentored 3 junior designers and led a cross-functional design review process — strong fit for
                        the senior IC expectations
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeSubtab === 'resume' && (
            <>
              <div className="cp-ai-insights-item">
                <span className="cp-ai-insights-item-badge caution">Gap</span>
                <div className="cp-ai-insights-item-content">
                  <span className="cp-ai-insights-item-label">Employment gap</span>
                  <span className="cp-ai-insights-item-desc">
                    6-month gap between Acme Corp (ended Jun 2019) and Cisco (started Jan 2020) — not addressed in
                    cover letter
                  </span>
                </div>
              </div>
              <div className="cp-ai-insights-item">
                <span className="cp-ai-insights-item-badge info">Note</span>
                <div className="cp-ai-insights-item-content">
                  <span className="cp-ai-insights-item-label">Skills alignment</span>
                  <span className="cp-ai-insights-item-desc">
                    Resume lists Figma, Sketch &amp; design systems — all 3 are required in the JD. No mention of
                    usability testing.
                  </span>
                </div>
              </div>
            </>
          )}

          {activeSubtab === 'linkedin' && (
            <>
              {(
                [
                  {
                    badgeClass: 'info' as const,
                    badgeText: 'Signal',
                    label: 'Recent activity',
                    desc: 'Posted about "open to new opportunities" 2 weeks ago — high intent signal',
                  },
                  {
                    badgeClass: 'consistent' as const,
                    badgeText: 'Strong',
                    label: 'Endorsements',
                    desc: '14 endorsements for "UX Design" and 9 for "Design Systems" from verified connections at Cisco and Google',
                  },
                  {
                    badgeClass: 'caution' as const,
                    badgeText: 'Sparse',
                    label: 'Recommendations',
                    desc: 'Only 1 recommendation (from 2018) — peer profiles at this level average 4–6',
                  },
                ] as const
              ).map((row, idx) => (
                <div key={idx} className={`cp-ai-insights-item${isOdActionable ? ' od-actionable-row' : ''}`}>
                  <span className={`cp-ai-insights-item-badge ${row.badgeClass}`}>{row.badgeText}</span>
                  <div className="cp-ai-insights-item-content">
                    <span className="cp-ai-insights-item-label">{row.label}</span>
                    <span className="cp-ai-insights-item-desc">{row.desc}</span>
                  </div>
                  {isOdActionable && (
                    <div className="cp-od-cta-wrap">
                      <Button
                        text="Assess with AI"
                        variant={ButtonVariant.SystemUI}
                        size={ButtonSize.Small}
                        classNames="cp-od-assess-ai-btn"
                        onClick={() => {
                          const prompt = `Assess this LinkedIn insight for ${displayCandidate.name}: ${row.label} — ${row.desc}`;
                          if (onOpenAssistantWithPrompt) {
                            onOpenAssistantWithPrompt(displayCandidate, prompt);
                          } else {
                            onAssessWithAI?.(displayCandidate);
                          }
                        }}
                      >
                        <Icon path={mdiCreationPath} size={0.65} color="#593CB4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
