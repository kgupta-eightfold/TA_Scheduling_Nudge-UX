/** AI insight nudges for candidate rows — [Figma Native AI assistant](https://www.figma.com/design/7B9t6lmTWAbdJkN8D1E1oc/Native-AI-assistant?node-id=14-28396&t=5vNN1U3S1G6t6dpE-4) */

export type NudgeActionCategory = 'negative' | 'position' | 'neutral' | 'overqualified';

export interface CandidateNudge {
  label: string;
  text: string;
  /** Drives suggested action in Actionable version */
  actionCategory: NudgeActionCategory;
}

const NUDGE_TEMPLATES: CandidateNudge[] = [
  {
    label: 'Hidden strength',
    text: 'One of 3 applicants with hands-on Kubernetes + Go experience.',
    actionCategory: 'neutral',
  },
  {
    label: 'Signal mismatch',
    text: '92% match, but expects ₹28L — 15% above your range.',
    actionCategory: 'negative',
  },
  {
    label: 'Competitive urgency',
    text: 'Also in pipeline for 2 other roles in your org.',
    actionCategory: 'position',
  },
  {
    label: 'Readiness signal',
    text: 'Responded to outreach in 47 minutes — high intent.',
    actionCategory: 'neutral',
  },
  {
    label: 'Risk / blocker',
    text: 'Declined a similar role here 8 months ago.',
    actionCategory: 'negative',
  },
  {
    label: 'Overqualified',
    text: 'Senior experience exceeds JD level; may expect faster ramp to lead.',
    actionCategory: 'overqualified',
  },
];

export function getActionLabelForCategory(category: NudgeActionCategory): string {
  switch (category) {
    case 'negative':
      return 'Remove';
    case 'position':
      return 'Advance';
    case 'neutral':
      return 'Add to compare';
    case 'overqualified':
      return 'Move';
    default:
      return 'Add to compare';
  }
}

/**
 * First row (index 0) always gets Hidden strength.
 * Remaining rows cycle through the other five nudge types.
 */
export function getNudgeForRowIndex(rowIndex: number): CandidateNudge {
  if (rowIndex === 0) {
    return NUDGE_TEMPLATES[0];
  }
  return NUDGE_TEMPLATES[1 + ((rowIndex - 1) % 5)];
}

/** Nudge for a candidate based on their index in the applicants list */
export function getNudgeForCandidate(candidateId: string, orderedIds: string[]): CandidateNudge | null {
  const rowIndex = orderedIds.indexOf(candidateId);
  if (rowIndex < 0) return null;
  return getNudgeForRowIndex(rowIndex);
}
