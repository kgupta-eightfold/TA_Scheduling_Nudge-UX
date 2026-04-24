import type { Candidate } from './candidates';

export type AssistantPromptSuggestion = { id: string; label: string };

/** Suggested queries for the AI assistant / floating panel (contextual to selection). */
export function getAssistantPromptSuggestions(
  selected: Candidate[]
): AssistantPromptSuggestion[] {
  const names = selected.map((c) => c.name);
  if (names.length === 0) {
    return [
      { id: 'a', label: 'Top skills' },
      { id: 'b', label: 'Leadership potential' },
      { id: 'c', label: 'Background diversity' },
    ];
  }
  if (names.length === 1) {
    return [
      { id: 'a', label: 'Key strengths' },
      { id: 'b', label: 'Leadership potential' },
      { id: 'c', label: 'Background diversity' },
    ];
  }
  return [
    { id: 'a', label: "Who's the best match?" },
    { id: 'b', label: 'Summarize strengths' },
    { id: 'c', label: 'Find skill gaps' },
    { id: 'd', label: 'Rank by experience' },
    { id: 'e', label: 'Cultural fit' },
    { id: 'f', label: 'Compare leadership potential' },
  ];
}
