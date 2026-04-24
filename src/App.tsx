import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { SnackbarContainer } from '@eightfold.ai/octuple';
import Navbar from './components/Navbar';
import PositionHeader from './components/PositionHeader';
import CandidateTable from './components/CandidateTable';
import AIInterviewPanel from './components/AIInterviewPanel';
import NativeAIAssistantPanel from './components/NativeAIAssistantPanel';
import CandidateProfilePanel from './components/CandidateProfilePanel';
import CandidateInsightPanel from './components/CandidateInsightPanel';
import FloatingInputPanel from './components/FloatingInputPanel';
import TextSelectionPopover from './components/TextSelectionPopover';
import { candidates, type Candidate } from './data/candidates';
import type { CandidateNudge } from './data/candidateNudges';
import './App.css';

const DEFAULT_FLOATING_PLACEHOLDER = 'Type custom query to compare candidates...';

function App() {
  const [activeTab, setActiveTab] = useState('applicants');
  const [panelOpen, setPanelOpen] = useState(false);
  const [nativeAssistantOpen, setNativeAssistantOpen] = useState(false);
  const [profileCandidate, setProfileCandidate] = useState<Candidate | null>(null);
  const [insightCandidate, setInsightCandidate] = useState<Candidate | null>(null);
  const [insightNudge, setInsightNudge] = useState<CandidateNudge | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [nudgeVersion, setNudgeVersion] = useState('floating-chat');
  const [assistantLaunchPrompt, setAssistantLaunchPrompt] = useState<string | null>(null);

  const consumeAssistantLaunchPrompt = useCallback(() => {
    setAssistantLaunchPrompt(null);
  }, []);

  const handleCandidateClick = (candidate: Candidate) => {
    setProfileCandidate(candidate);
  };

  const handleProfileClose = () => {
    setProfileCandidate(null);
  };

  const handleNudgeViewClick = (candidate: Candidate, nudge: CandidateNudge) => {
    setInsightCandidate(candidate);
    setInsightNudge(nudge);
    setNativeAssistantOpen(false);
    setProfileCandidate(null);
  };

  const handleInsightClose = () => {
    setInsightCandidate(null);
    setInsightNudge(null);
  };

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllCandidates = () => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map((c) => c.id)));
    }
  };

  const selectedCandidates = useMemo(
    () => candidates.filter((c) => selectedIds.has(c.id)),
    [selectedIds]
  );

  const floatingPlaceholder = useMemo(() => {
    const list = selectedCandidates;
    const n = list.length;
    if (n === 0) return DEFAULT_FLOATING_PLACEHOLDER;
    if (n === 1) {
      return `Assess ${list[0].name}'s leadership potential`;
    }
    const names = list.map((c) => c.name).join(', ');
    return `Compare ${names}...`;
  }, [selectedCandidates]);

  const hasSelection = selectedIds.size > 0;

  const showFloatingInputBar =
    nudgeVersion === 'floating-chat' ||
    nudgeVersion === 'floating-input-v2' ||
    nudgeVersion === 'floating-input-v3' ||
    nudgeVersion === 'od-actionable' ||
    nudgeVersion === 'oda-2-0' ||
    nudgeVersion === 'free-world' ||
    (nudgeVersion === 'oda-3' && hasSelection);

  const showProfileFloatingBar =
    nudgeVersion !== 'floating-input-v3' &&
    nudgeVersion !== 'od-actionable' &&
    nudgeVersion !== 'free-world';

  const nudgeDisplayMode =
    nudgeVersion === 'inline-nudges'
      ? 'inline'
      : nudgeVersion === 'inline-chat'
        ? 'inlineChat'
        : nudgeVersion === 'oda-2-0' || nudgeVersion === 'oda-3'
          ? 'oda20'
          : nudgeVersion === 'free-world'
            ? 'freeWorld'
            : nudgeVersion === 'actionable' ||
                nudgeVersion === 'floating-input-v2' ||
                nudgeVersion === 'floating-input-v3' ||
                nudgeVersion === 'od-actionable'
              ? 'actionable'
              : 'popup';

  const openAssistantWithPromptForCandidate = useCallback((c: Candidate, prompt: string) => {
    setSelectedIds(new Set([c.id]));
    setAssistantLaunchPrompt(prompt);
    setNativeAssistantOpen(true);
  }, []);

  const openAssistantPipelinePrompt = useCallback((prompt: string, candidateIds: string[]) => {
    setSelectedIds(new Set(candidateIds));
    setAssistantLaunchPrompt(prompt);
    setNativeAssistantOpen(true);
  }, []);

  return (
    <div className={`app-shell${nudgeVersion === 'oda-3' && nativeAssistantOpen ? ' app-shell--ai-push' : ''}`}>
      <Navbar />
      <div className="app-main">
        <PositionHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          nudgeVersion={nudgeVersion}
          onNudgeVersionChange={setNudgeVersion}
        />
        <CandidateTable
          onInterviewWithAI={() => setPanelOpen(true)}
          onCandidateClick={handleCandidateClick}
          onNudgeViewClick={handleNudgeViewClick}
          selectedIds={selectedIds}
          onToggleCandidate={toggleCandidate}
          onToggleAll={toggleAllCandidates}
          onClearSelection={() => setSelectedIds(new Set())}
          nudgeDisplayMode={nudgeDisplayMode}
          onOpenAssistantWithPrompt={openAssistantWithPromptForCandidate}
          onAssistantPipelinePrompt={openAssistantPipelinePrompt}
        />
      </div>
      {showFloatingInputBar && (
        <FloatingInputPanel
          variant={nudgeVersion === 'floating-input-v2' || nudgeVersion === 'floating-input-v3' || nudgeVersion === 'oda-3' ? 'v2' : 'v1'}
          hasSelection={hasSelection}
          placeholder={floatingPlaceholder}
          selectedCandidates={selectedCandidates}
          onOpenAssistant={() => setNativeAssistantOpen(true)}
          onOpenAssistantWithPrompt={(prompt) => {
            setAssistantLaunchPrompt(prompt);
            setNativeAssistantOpen(true);
          }}
          onClearSelection={() => setSelectedIds(new Set())}
          dimmed={nativeAssistantOpen || insightCandidate !== null}
        />
      )}

      <AIInterviewPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
      <NativeAIAssistantPanel
        open={nativeAssistantOpen}
        onClose={() => setNativeAssistantOpen(false)}
        selectedCandidates={selectedCandidates}
        placeholder={floatingPlaceholder}
        initialUserPrompt={assistantLaunchPrompt}
        onInitialUserPromptConsumed={consumeAssistantLaunchPrompt}
        pushMode={nudgeVersion === 'oda-3'}
      />
      <CandidateInsightPanel
        open={insightCandidate !== null && insightNudge !== null}
        candidate={insightCandidate}
        nudge={insightNudge}
        onClose={handleInsightClose}
      />
      <CandidateProfilePanel
        candidate={profileCandidate}
        open={profileCandidate !== null}
        onClose={handleProfileClose}
        onNavigate={setProfileCandidate}
        showFloatingBar={showProfileFloatingBar}
        nudgeVersion={nudgeVersion}
        aiPanelOpen={nudgeVersion === 'oda-3' && nativeAssistantOpen}
        onAssessWithAI={(c) => {
          setSelectedIds(new Set([c.id]));
          setNativeAssistantOpen(true);
        }}
        onOpenAssistantWithPrompt={(c, prompt) => {
          setSelectedIds(new Set([c.id]));
          setAssistantLaunchPrompt(prompt);
          setNativeAssistantOpen(true);
        }}
      />
      <TextSelectionPopover />
      {createPortal(<SnackbarContainer />, document.body)}
    </div>
  );
}

export default App;
