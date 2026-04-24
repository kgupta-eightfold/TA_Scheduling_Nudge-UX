export type SectionType = 'assessment' | 'screening' | 'technical' | 'coding' | 'algorithmic' | 'functional' | 'case_study';

export type AssessmentCategory = 'Technical' | 'Cognitive' | 'Psychometric';
export type AssessmentSource = 'Eightfold' | 'Vendor';

export interface Assessment {
  id: string;
  title: string;
  category: AssessmentCategory;
  source: AssessmentSource;
  metadata: string[];
  duration: number;
  description: string;
  competencies: string[];
  extraCompetencyCount?: number;
  cutoff: number;
}

export const assessmentBank: Assessment[] = [
  {
    id: 'asmt-dsa',
    title: 'Software engineer — DSA & problem solving',
    category: 'Technical',
    source: 'Eightfold',
    metadata: ['Coding challenge', 'MCQ'],
    duration: 60,
    description: 'Evaluates a candidate\'s ability to solve algorithmic problems, optimize code for performance, and apply core data structures. Designed for mid-level IC roles requiring hands-on coding daily.',
    competencies: ['Arrays & strings', 'Trees & graphs', 'Dynamic programming', 'Time/space complexity'],
    extraCompetencyCount: 2,
    cutoff: 75,
  },
  {
    id: 'asmt-sysdesign',
    title: 'Software engineer — System design',
    category: 'Cognitive',
    source: 'Eightfold',
    metadata: ['SJT', 'Video playback'],
    duration: 45,
    description: 'Assesses a candidate\'s ability to architect scalable systems, make trade-off decisions, and reason about distributed infrastructure. Best suited for senior IC and tech lead roles.',
    competencies: ['Scalability', 'Trade-off analysis', 'API design', 'Database modeling'],
    extraCompetencyCount: 1,
    cutoff: 70,
  },
  {
    id: 'asmt-debug',
    title: 'Software engineer — Debugging & code quality',
    category: 'Technical',
    source: 'Eightfold',
    metadata: ['Situational', 'MCQ', 'Adaptive'],
    duration: 30,
    description: 'Measures a candidate\'s ability to identify bugs, reason through failing test cases, and write clean, maintainable code. Ideal for roles where production reliability is critical.',
    competencies: ['Bug identification', 'Code review', 'Testing strategies', 'Refactoring'],
    extraCompetencyCount: 1,
    cutoff: 70,
  },
  {
    id: 'asmt-collab',
    title: 'Software engineer — Collaboration & culture fit',
    category: 'Psychometric',
    source: 'Vendor',
    metadata: ['SJT', 'Video playback'],
    duration: 25,
    description: 'Evaluates how a candidate navigates team dynamics, handles disagreements in code reviews, and communicates across functions. Designed for orgs where cross-team collaboration is essential.',
    competencies: ['Teamwork', 'Conflict resolution', 'Communication', 'Adaptability'],
    cutoff: 65,
  },
  {
    id: 'asmt-fullstack',
    title: 'Software engineer — Full stack proficiency',
    category: 'Technical',
    source: 'Eightfold',
    metadata: ['Cognitive', 'Coding challenge', 'MCQ'],
    duration: 50,
    description: 'A comprehensive assessment spanning frontend, backend, and infrastructure fundamentals. Measures a candidate\'s ability to work across the stack and reason about end-to-end product delivery.',
    competencies: ['Frontend frameworks', 'REST & GraphQL', 'Database design', 'CI/CD & DevOps'],
    extraCompetencyCount: 2,
    cutoff: 72,
  },
];

export interface Question {
  id: string;
  title: string;
  difficulty?: 'Easy' | 'Medium' | 'Difficult';
  duration: number;
  languages?: string[];
  extraLanguageCount?: number;
  category?: string;
  createdBy?: string;
  description?: string;
  hasEvaluationCriteria?: boolean;
  aiGenerated?: boolean;
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  description: string;
  questions: Question[];
  aiNote?: string;
  assessments?: Assessment[];
}

export const defaultSections: Section[] = [
  {
    id: 'sec-profile',
    type: 'screening',
    title: 'Profile',
    description: 'Validates prerequisites, experience and logistics',
    aiNote: 'Includes AI generated questions based on job description and resume',
    questions: [
      { id: 'q-p1', title: 'Will you now or in the future require sponsorship for employment?', duration: 3, category: 'Visa', createdBy: 'admin user' },
      { id: 'q-p2', title: 'What is your current employment status?', duration: 3, category: 'Visa', createdBy: 'admin user' },
      { id: 'q-p3', title: 'Where are you currently located?', duration: 3, category: 'Location preferences', createdBy: 'admin user' },
      { id: 'q-p4', title: 'Which time zones are you comfortable working in?', duration: 3, category: 'Location preferences', createdBy: 'admin user' },
      { id: 'q-p5', title: 'Do you have a reliable setup for home office?', duration: 3, category: 'Work setup', createdBy: 'admin user' },
    ],
  },
  {
    id: 'sec-technical',
    type: 'technical',
    title: 'Technical Q&A',
    description: 'Only candidates who qualify in pre-screening proceed to interview',
    questions: [
      { id: 'q-t1', title: 'Leadership', duration: 15, description: 'The ability to identify, analyze, and resolve issues effectively by applying logical thinking, creativity, and sound judgment. Demonstrates a structured approach to diagnosing root causes, evaluating alternatives, and implementing practical, sustainable solutions.', hasEvaluationCriteria: true, aiGenerated: true },
      { id: 'q-t2', title: 'Leadership', duration: 15, description: 'The ability to identify, analyze, and resolve issues effectively by applying logical thinking, creativity, and sound judgment. Demonstrates a structured approach to diagnosing root causes, evaluating alternatives, and implementing practical, sustainable solutions.', hasEvaluationCriteria: true, aiGenerated: true },
      { id: 'q-t3', title: 'Leadership', duration: 15, description: 'The ability to identify, analyze, and resolve issues effectively by applying logical thinking, creativity, and sound judgment. Demonstrates a structured approach to diagnosing root causes, evaluating alternatives, and implementing practical, sustainable solutions.', hasEvaluationCriteria: true, createdBy: 'Jane Doe' },
    ],
  },
  {
    id: 'sec-coding',
    type: 'coding',
    title: 'Coding',
    description: 'Coding questions to assess practical application',
    questions: [
      { id: 'q-c1', title: 'Permutation in string', difficulty: 'Difficult', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
      { id: 'q-c2', title: 'Dynamic programming: Fibonacci', difficulty: 'Medium', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
    ],
  },
];

export const sectionTypeOptions: { type: SectionType; title: string; description: string; icon: string }[] = [
  { type: 'screening', title: 'Screening', description: 'Validates prerequisites, experience, logistics of the candidate', icon: 'screening' },
  { type: 'technical', title: 'Technical Q&A', description: 'Tests conceptual depth tied to JD', icon: 'technical' },
  { type: 'coding', title: 'Coding exercises', description: 'Role-specific coding tasks tied to JD', icon: 'coding' },
  { type: 'algorithmic', title: 'Algorithmic', description: 'Standard algorithmic problems with automated test cases', icon: 'algorithmic' },
];

export const screeningQuestionBank: Question[] = [
  { id: 'qb-s1', title: 'Will you now or in the future require sponsorship for employment?', duration: 3, category: 'Visa', createdBy: 'admin user' },
  { id: 'qb-s2', title: 'What is your current employment status? Are you currently employed? If so, are you open to discussing opportunities during work hours?', duration: 3, category: 'Visa', createdBy: 'admin user' },
  { id: 'qb-s3', title: 'Where are you currently located?', duration: 3, category: 'Location preferences', createdBy: 'admin user' },
  { id: 'qb-s4', title: 'Which time zones are you comfortable working in?', duration: 3, category: 'Location preferences', createdBy: 'admin user' },
  { id: 'qb-s5', title: 'Do you have a reliable setup for home office?', duration: 3, category: 'Work setup', createdBy: 'admin user' },
  { id: 'qb-s6', title: 'Are any of your certifications expiring within the next 12 months?', duration: 3, category: 'Certifications', createdBy: 'admin user' },
  { id: 'qb-s7', title: 'Are you pursuing any certifications currently?', duration: 3, category: 'Certifications', createdBy: 'admin user' },
  { id: 'qb-s8', title: 'Which professional certifications do you currently have?', duration: 3, category: 'Certifications', createdBy: 'admin user' },
];

export const codingQuestionBank: Question[] = [
  { id: 'qb-c1', title: 'Permutation in string', difficulty: 'Difficult', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
  { id: 'qb-c2', title: 'Dynamic programming: Fibonacci', difficulty: 'Medium', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
  { id: 'qb-c3', title: 'Space matrix', difficulty: 'Medium', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
  { id: 'qb-c4', title: 'Two by two array', difficulty: 'Medium', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
  { id: 'qb-c5', title: 'Median of sorted arrays', difficulty: 'Easy', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
  { id: 'qb-c6', title: 'Binary search 1', difficulty: 'Medium', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
];

export const functionalQuestionBank: Question[] = [
  { id: 'qb-f1', title: 'Leadership', duration: 15, description: 'The ability to identify, analyze, and resolve issues effectively by applying logical thinking, creativity, and sound judgment. Demonstrates a structured approach to diagnosing root causes, evaluating alternatives, and implementing practical, sustainable solutions.', hasEvaluationCriteria: true, aiGenerated: true },
  { id: 'qb-f2', title: 'Leadership', duration: 15, description: 'The ability to identify, analyze, and resolve issues effectively by applying logical thinking, creativity, and sound judgment. Demonstrates a structured approach to diagnosing root causes, evaluating alternatives, and implementing practical, sustainable solutions.', hasEvaluationCriteria: true, aiGenerated: true },
  { id: 'qb-f3', title: 'Leadership', duration: 15, description: 'The ability to identify, analyze, and resolve issues effectively by applying logical thinking, creativity, and sound judgment. Demonstrates a structured approach to diagnosing root causes, evaluating alternatives, and implementing practical, sustainable solutions.', hasEvaluationCriteria: true, createdBy: 'Jane Doe' },
  { id: 'qb-f4', title: 'Leadership', duration: 15, description: 'The ability to identify, analyze, and resolve issues effectively by applying logical thinking, creativity, and sound judgment. Demonstrates a structured approach to diagnosing root causes, evaluating alternatives, and implementing practical, sustainable solutions.', hasEvaluationCriteria: true, createdBy: 'Admin user' },
];

export const v4SidebarOptions: { type: SectionType; title: string; description: string }[] = [
  { type: 'assessment', title: 'Assessments', description: 'Presets to evaluate candidates on various skills and competencies' },
  { type: 'screening', title: 'Screening', description: 'Validates prerequisites, experience, logistics of the candidate' },
  { type: 'functional', title: 'Functional', description: 'Behavioural questions based on the role' },
  { type: 'technical', title: 'Conceptual/Technical Q&A', description: 'Tests domain knowledge tied to JD' },
  { type: 'coding', title: 'Coding exercises', description: 'Role-specific coding tasks tied to JD' },
  { type: 'algorithmic', title: 'DSA/Algorithmic', description: 'Standard algorithmic problems with automated test cases' },
  { type: 'case_study', title: 'Case study', description: 'White-boarding activities' },
];

export function createEmptySection(type: SectionType): Section {
  const v4Meta = v4SidebarOptions.find(o => o.type === type);
  const meta = sectionTypeOptions.find(o => o.type === type) || v4Meta;
  const title = meta?.title || type;
  return {
    id: `sec-${type}-${Date.now()}`,
    type,
    title: title === 'Coding exercises' ? 'Coding' : title === 'Conceptual/Technical Q&A' ? 'Technical Q&A' : title,
    description: meta?.description || '',
    questions: [],
  };
}

export function getQuestionBank(type: SectionType): Question[] {
  switch (type) {
    case 'screening': return screeningQuestionBank;
    case 'coding':
    case 'algorithmic':
    case 'case_study': return codingQuestionBank;
    case 'technical':
    case 'functional':
    case 'assessment':
    default: return functionalQuestionBank;
  }
}

export function computeSectionMins(section: Section): number {
  return section.questions.reduce((sum, q) => sum + q.duration, 0);
}

/* =====================================================
   GENERATE NEW GUIDE — topics & generated sections
   ===================================================== */

export interface TopicPill {
  id: string;
  label: string;
}

export interface RecommendedTopic extends TopicPill {
  recommended: boolean;
}

export const allTopics: RecommendedTopic[] = [
  { id: 'prof-exp', label: 'Professional experience', recommended: true },
  { id: 'proj-exp', label: 'Project experience', recommended: false },
  { id: 'prob-solve', label: 'Problem solving', recommended: true },
  { id: 'dsa', label: 'DSA', recommended: false },
  { id: 'oop', label: 'Object oriented programming', recommended: false },
  { id: 'api-design', label: 'API design', recommended: true },
  { id: 'backend-infra', label: 'Backend infrastructure', recommended: false },
  { id: 'db-design', label: 'Database design', recommended: true },
  { id: 'concurrency', label: 'Concurrency and performance', recommended: false },
  { id: 'algo-coding', label: 'Algorithmic coding challenge', recommended: true },
  { id: 'real-world', label: 'Real-world coding task', recommended: true },
  { id: 'debugging', label: 'Debugging', recommended: false },
  { id: 'code-correction', label: 'Code correction', recommended: false },
  { id: 'lld', label: 'Low-level system design', recommended: false },
  { id: 'prod-incident', label: 'Production incident analysis', recommended: false },
  { id: 'feature-design', label: 'Feature design', recommended: false },
];

export const defaultSelectedTopicIds = ['prof-exp', 'prob-solve', 'api-design', 'db-design', 'algo-coding', 'real-world'];

export const durationPresets = [30, 45, 60, 90, 120];

export const generatedGuideSections: Section[] = [
  {
    id: 'gen-dsa',
    type: 'algorithmic',
    title: 'DSA',
    description: 'Data structures and algorithmic problem solving',
    aiNote: 'AI generated based on selected topics',
    questions: [
      { id: 'gq-d1', title: 'Binary tree level-order traversal', difficulty: 'Medium', duration: 8, languages: ['Java', 'Python'], extraLanguageCount: 2 },
      { id: 'gq-d2', title: 'Graph shortest path — Dijkstra\'s', difficulty: 'Difficult', duration: 10, languages: ['Java', 'Python'], extraLanguageCount: 1 },
      { id: 'gq-d3', title: 'Hash map collision resolution', difficulty: 'Easy', duration: 7, languages: ['Java', 'Python'], extraLanguageCount: 2 },
    ],
  },
  {
    id: 'gen-coding',
    type: 'coding',
    title: 'Coding',
    description: 'Hands-on coding exercises for practical assessment',
    aiNote: 'AI generated based on selected topics',
    questions: [
      { id: 'gq-c1', title: 'Design a rate limiter', difficulty: 'Difficult', duration: 15, languages: ['Java', 'Python', 'Go'], extraLanguageCount: 1 },
      { id: 'gq-c2', title: 'Implement LRU cache', difficulty: 'Medium', duration: 15, languages: ['Java', 'Python'], extraLanguageCount: 2 },
    ],
  },
  {
    id: 'gen-case',
    type: 'case_study',
    title: 'Case Study / HLD',
    description: 'High-level system design and architecture white-boarding',
    aiNote: 'AI generated based on selected topics',
    questions: [
      { id: 'gq-cs1', title: 'Design a URL shortener at scale', duration: 20, description: 'End-to-end system design covering data model, API, scaling, and caching strategies.', hasEvaluationCriteria: true, aiGenerated: true },
    ],
  },
  {
    id: 'gen-technical',
    type: 'technical',
    title: 'Conceptual / Technical',
    description: 'Domain knowledge and conceptual depth assessment',
    questions: [
      { id: 'gq-t1', title: 'Explain SOLID principles with real-world examples', duration: 5, hasEvaluationCriteria: true, aiGenerated: true },
      { id: 'gq-t2', title: 'Compare REST vs gRPC trade-offs', duration: 5, hasEvaluationCriteria: true, aiGenerated: true },
      { id: 'gq-t3', title: 'How would you handle database migrations at scale?', duration: 5, hasEvaluationCriteria: true, aiGenerated: true },
    ],
  },
];
