import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiMinus,
  mdiPlus,
  mdiMonitor,
  mdiMicrophoneOff,
  mdiPhoneReturn,
  mdiMonitorOff,
  mdiFullscreenExit,
  mdiCancel,
  mdiAccountMultiple,
} from '@mdi/js';
import type { InterviewSettings } from './AIInterviewPanel';

interface EditSettingsModalProps {
  settings: InterviewSettings;
  onSave: (settings: InterviewSettings) => void;
  onCancel: () => void;
  variant?: 'modal' | 'panel';
}

const AI_AGENT_OPTIONS = [
  'Olivia- English (Female, American)',
  'James- English (Male, British)',
  'Sophia- English (Female, Australian)',
  'Raj- Hindi (Male, Indian)',
];

const PROCTORING_ITEMS = [
  { icon: mdiMonitor, label: 'Browser tab switched' },
  { icon: mdiMicrophoneOff, label: 'Microphone muted' },
  { icon: mdiPhoneReturn, label: 'Rejoined interview' },
  { icon: mdiMonitorOff, label: 'Moved out of view' },
  { icon: mdiFullscreenExit, label: 'Fullscreen exited' },
  { icon: mdiCancel, label: 'Prohibited item seen on screen' },
  { icon: mdiAccountMultiple, label: 'Multiple people in view' },
];

export default function EditSettingsModal({ settings, onSave, onCancel, variant = 'modal' }: EditSettingsModalProps) {
  const [draft, setDraft] = useState<InterviewSettings>({ ...settings });
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const isPanel = variant === 'panel';

  const update = <K extends keyof InterviewSettings>(key: K, value: InterviewSettings[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  return createPortal(
    <div className={`settings-modal-overlay${isPanel ? ' settings-panel-overlay' : ''}`} onClick={onCancel}>
      <div className={`settings-modal${isPanel ? ' settings-panel' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="settings-modal-header">
          <div>
            <h3 className="settings-modal-title">Edit settings</h3>
            <p className="settings-modal-subtitle">Basic details and interview settings</p>
          </div>
          <button className="settings-modal-close" onClick={onCancel}>
            <Icon path={mdiClose} size={0.85} color="#343C4C" />
          </button>
        </div>

        <div className="settings-modal-body">
          {/* Interview name */}
          <div className="settings-field">
            <label className="settings-label">
              Interview name<span className="settings-required">*</span>
            </label>
            <span className="settings-hint">Visible to candidate</span>
            <input
              className="settings-input"
              type="text"
              value={draft.interviewName}
              onChange={e => update('interviewName', e.target.value)}
            />
          </div>

          {/* Interview description */}
          <div className="settings-field">
            <label className="settings-label">
              Interview description<span className="settings-required">*</span>
            </label>
            <span className="settings-hint">Visible to candidate</span>
            <textarea
              className="settings-textarea"
              value={draft.interviewDescription}
              onChange={e => update('interviewDescription', e.target.value)}
              rows={3}
            />
          </div>

          {/* AI agent */}
          <div className="settings-field">
            <label className="settings-label">AI agent</label>
            <div className="settings-dropdown-wrapper">
              <button
                className="settings-dropdown-trigger"
                onClick={() => setAgentDropdownOpen(p => !p)}
              >
                <span>{draft.aiAgent}</span>
                <Icon path={mdiClose} size={0} />
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="#343C4C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {agentDropdownOpen && (
                <div className="settings-dropdown-menu">
                  {AI_AGENT_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      className={`settings-dropdown-item${opt === draft.aiAgent ? ' active' : ''}`}
                      onClick={() => { update('aiAgent', opt); setAgentDropdownOpen(false); }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Evaluate language proficiency */}
          <div className="settings-field">
            <label className="settings-label">
              Evaluate English language proficiency?<span className="settings-required">*</span>
            </label>
            <div className="settings-radio-group">
              <label className="settings-radio">
                <input
                  type="radio"
                  name="langProficiency"
                  checked={draft.evaluateLanguageProficiency}
                  onChange={() => update('evaluateLanguageProficiency', true)}
                />
                <span className="settings-radio-dot" />
                <span>Yes</span>
              </label>
              <label className="settings-radio">
                <input
                  type="radio"
                  name="langProficiency"
                  checked={!draft.evaluateLanguageProficiency}
                  onChange={() => update('evaluateLanguageProficiency', false)}
                />
                <span className="settings-radio-dot" />
                <span>No</span>
              </label>
            </div>
          </div>

          <div className="settings-divider" />

          {/* Interview invite expiry */}
          <div className="settings-field-row">
            <div className="settings-field-row-left">
              <span className="settings-label-inline">Interview invite expiry</span>
              <span className="settings-hint">Set how long the interview invite is valid after it is sent</span>
            </div>
            <div className="settings-stepper">
              <button
                className="settings-stepper-btn"
                onClick={() => update('inviteExpiryDays', Math.max(1, draft.inviteExpiryDays - 1))}
              >
                <Icon path={mdiMinus} size={0.6} color="#343C4C" />
              </button>
              <span className="settings-stepper-value">{draft.inviteExpiryDays} days</span>
              <button
                className="settings-stepper-btn"
                onClick={() => update('inviteExpiryDays', draft.inviteExpiryDays + 1)}
              >
                <Icon path={mdiPlus} size={0.6} color="#343C4C" />
              </button>
            </div>
          </div>

          {/* Apply and interview */}
          <div className="settings-field-row">
            <div className="settings-field-row-left">
              <span className="settings-label-inline">Apply and interview</span>
              <span className="settings-hint">Automatically send an interview link to every applicant</span>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={draft.applyAndInterview}
                onChange={e => update('applyAndInterview', e.target.checked)}
              />
              <span className="settings-toggle-track" />
            </label>
          </div>

          <div className="settings-divider" />

          {/* ID verification */}
          <div className="settings-field-row">
            <div className="settings-field-row-left">
              <span className="settings-label-inline">ID verification</span>
              <span className="settings-hint">Verify candidate ID with Clear, a third party provider</span>
            </div>
            <span className={`settings-yes-badge${draft.idVerification ? ' active' : ''}`} onClick={() => update('idVerification', !draft.idVerification)}>
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Yes
            </span>
          </div>

          {/* AI agent checks */}
          <div className="settings-field-row">
            <div className="settings-field-row-left">
              <span className="settings-label-inline">AI agent checks</span>
              <span className="settings-hint">Check candidate ability to hear and respond to the agent</span>
            </div>
            <span className={`settings-yes-badge${draft.aiAgentChecks ? ' active' : ''}`} onClick={() => update('aiAgentChecks', !draft.aiAgentChecks)}>
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Yes
            </span>
          </div>

          {/* Proctoring checks */}
          <div className="settings-field-row settings-field-row-top">
            <div className="settings-field-row-left">
              <span className="settings-label-inline">Proctoring checks</span>
            </div>
            <span className={`settings-yes-badge${draft.proctoringChecks ? ' active' : ''}`} onClick={() => update('proctoringChecks', !draft.proctoringChecks)}>
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Yes
            </span>
          </div>
          {draft.proctoringChecks && (
            <div className="settings-proctoring-list">
              {PROCTORING_ITEMS.map(item => (
                <div key={item.label} className="settings-proctoring-item">
                  <Icon path={item.icon} size={0.65} color="#69717F" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="settings-modal-footer">
          <button className="settings-cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="settings-save-btn" onClick={() => onSave(draft)}>Save</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
