import type { Section } from './interviewSections';

export interface LibraryGuide {
  id: string;
  title: string;
  tags: string[];
  recommended: boolean;
  questionCount: number;
  duration: number;
  sections: Section[];
}

export const libraryGuides: LibraryGuide[] = [
  {
    id: 'lg-fullstack',
    title: 'Full stack evaluation',
    tags: ['Profile', 'Technical Q&A', 'DSA', 'Coding'],
    recommended: true,
    questionCount: 12,
    duration: 90,
    sections: [
      {
        id: 'lg-fs-profile', type: 'screening', title: 'Profile',
        description: 'Questions may vary based on candidate\'s experience and responses',
        aiNote: 'Include AI generated questions based on job description and resume',
        questions: [
          { id: 'lg-fs-p1', title: 'Will you require sponsorship for employment?', duration: 3 },
          { id: 'lg-fs-p2', title: 'What is your current employment status?', duration: 3 },
          { id: 'lg-fs-p3', title: 'Where are you currently located?', duration: 3 },
          { id: 'lg-fs-p4', title: 'Which time zones are you comfortable working in?', duration: 3 },
          { id: 'lg-fs-p5', title: 'Do you have a reliable setup for home office?', duration: 3 },
        ],
      },
      {
        id: 'lg-fs-tech', type: 'technical', title: 'Technical Q&A',
        description: 'Only candidates who qualify in pre-screening proceed to interview',
        questions: [
          { id: 'lg-fs-t1', title: 'System design principles', duration: 15, hasEvaluationCriteria: true, aiGenerated: true },
          { id: 'lg-fs-t2', title: 'API design patterns', duration: 15, hasEvaluationCriteria: true, aiGenerated: true },
          { id: 'lg-fs-t3', title: 'Database optimization', duration: 15, hasEvaluationCriteria: true },
        ],
      },
      {
        id: 'lg-fs-dsa', type: 'algorithmic', title: 'DSA/Algorithmic',
        description: 'Coding questions to assess practical application',
        questions: [
          { id: 'lg-fs-d1', title: 'Binary search tree operations', difficulty: 'Medium', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
          { id: 'lg-fs-d2', title: 'Graph traversal', difficulty: 'Difficult', duration: 10, languages: ['Java', 'Python'], extraLanguageCount: 2 },
        ],
      },
      {
        id: 'lg-fs-code', type: 'coding', title: 'Coding',
        description: 'Coding questions to assess practical application',
        questions: [
          { id: 'lg-fs-c1', title: 'Permutation in string', difficulty: 'Difficult', duration: 20, languages: ['Java', 'Python'], extraLanguageCount: 2 },
          { id: 'lg-fs-c2', title: 'Dynamic programming: Fibonacci', difficulty: 'Medium', duration: 10, languages: ['Java', 'Python'], extraLanguageCount: 2 },
        ],
      },
    ],
  },
  {
    id: 'lg-applied',
    title: 'Applied skills evaluation',
    tags: ['Coding', 'Case-study', 'Technical Q&A'],
    recommended: true,
    questionCount: 9,
    duration: 65,
    sections: [
      {
        id: 'lg-ap-code', type: 'coding', title: 'Coding',
        description: 'Practical coding exercises',
        questions: [
          { id: 'lg-ap-c1', title: 'REST API implementation', difficulty: 'Medium', duration: 20, languages: ['JavaScript', 'TypeScript'] },
          { id: 'lg-ap-c2', title: 'Data transformation pipeline', difficulty: 'Medium', duration: 20, languages: ['Python'] },
        ],
      },
      {
        id: 'lg-ap-case', type: 'case_study', title: 'Case-study',
        description: 'White-boarding and system design',
        questions: [
          { id: 'lg-ap-cs1', title: 'Design a URL shortener', duration: 15, hasEvaluationCriteria: true },
          { id: 'lg-ap-cs2', title: 'E-commerce checkout flow', duration: 15, hasEvaluationCriteria: true },
        ],
      },
      {
        id: 'lg-ap-tech', type: 'technical', title: 'Technical Q&A',
        description: 'Conceptual depth evaluation',
        questions: [
          { id: 'lg-ap-t1', title: 'Microservices architecture', duration: 15, hasEvaluationCriteria: true, aiGenerated: true },
          { id: 'lg-ap-t2', title: 'Event-driven systems', duration: 15, hasEvaluationCriteria: true, aiGenerated: true },
          { id: 'lg-ap-t3', title: 'Caching strategies', duration: 15, hasEvaluationCriteria: true },
          { id: 'lg-ap-t4', title: 'CI/CD pipeline design', duration: 10, hasEvaluationCriteria: true },
          { id: 'lg-ap-t5', title: 'Security best practices', duration: 10, hasEvaluationCriteria: true },
        ],
      },
    ],
  },
  {
    id: 'lg-problemsolving',
    title: 'Problem solving',
    tags: ['Case-study', 'DSA'],
    recommended: false,
    questionCount: 5,
    duration: 45,
    sections: [
      {
        id: 'lg-ps-case', type: 'case_study', title: 'Case-study',
        description: 'Analytical problem-solving exercises',
        questions: [
          { id: 'lg-ps-cs1', title: 'Optimize a delivery routing system', duration: 15, hasEvaluationCriteria: true },
          { id: 'lg-ps-cs2', title: 'Design a recommendation engine', duration: 15, hasEvaluationCriteria: true },
        ],
      },
      {
        id: 'lg-ps-dsa', type: 'algorithmic', title: 'DSA',
        description: 'Algorithmic challenges',
        questions: [
          { id: 'lg-ps-d1', title: 'Dynamic programming: coin change', difficulty: 'Medium', duration: 15, languages: ['Java', 'Python'] },
          { id: 'lg-ps-d2', title: 'Graph shortest path', difficulty: 'Difficult', duration: 15, languages: ['Java', 'Python'] },
          { id: 'lg-ps-d3', title: 'Sliding window maximum', difficulty: 'Medium', duration: 15, languages: ['Java', 'Python'] },
        ],
      },
    ],
  },
  {
    id: 'lg-quickscreen',
    title: 'Quick screen',
    tags: ['Profile'],
    recommended: false,
    questionCount: 5,
    duration: 15,
    sections: [
      {
        id: 'lg-qs-profile', type: 'screening', title: 'Profile',
        description: 'Quick screening questions',
        questions: [
          { id: 'lg-qs-p1', title: 'Are you authorized to work in this country?', duration: 3 },
          { id: 'lg-qs-p2', title: 'What is your notice period?', duration: 3 },
          { id: 'lg-qs-p3', title: 'Are you open to on-site work?', duration: 3 },
          { id: 'lg-qs-p4', title: 'Expected compensation range?', duration: 3 },
          { id: 'lg-qs-p5', title: 'Available start date?', duration: 3 },
        ],
      },
    ],
  },
  {
    id: 'lg-algorithmic',
    title: 'Algorithmic assessment',
    tags: ['DSA', 'Coding'],
    recommended: false,
    questionCount: 6,
    duration: 50,
    sections: [
      {
        id: 'lg-al-dsa', type: 'algorithmic', title: 'DSA',
        description: 'Core algorithm challenges',
        questions: [
          { id: 'lg-al-d1', title: 'Two sum variations', difficulty: 'Easy', duration: 10, languages: ['Java', 'Python', 'JavaScript'] },
          { id: 'lg-al-d2', title: 'Merge intervals', difficulty: 'Medium', duration: 10, languages: ['Java', 'Python'] },
          { id: 'lg-al-d3', title: 'LRU Cache implementation', difficulty: 'Difficult', duration: 15, languages: ['Java', 'Python'] },
        ],
      },
      {
        id: 'lg-al-code', type: 'coding', title: 'Coding',
        description: 'Practical coding problems',
        questions: [
          { id: 'lg-al-c1', title: 'String manipulation', difficulty: 'Easy', duration: 10, languages: ['Java', 'Python'] },
          { id: 'lg-al-c2', title: 'Tree serialization', difficulty: 'Medium', duration: 15, languages: ['Java', 'Python'] },
          { id: 'lg-al-c3', title: 'Concurrent task scheduler', difficulty: 'Difficult', duration: 20, languages: ['Java', 'Go'] },
        ],
      },
    ],
  },
  {
    id: 'lg-screening-case',
    title: 'Screening + Case-study',
    tags: ['Profile', 'Case-study'],
    recommended: false,
    questionCount: 7,
    duration: 40,
    sections: [
      {
        id: 'lg-sc-profile', type: 'screening', title: 'Profile',
        description: 'Initial candidate screening',
        questions: [
          { id: 'lg-sc-p1', title: 'Tell me about your most recent role', duration: 5 },
          { id: 'lg-sc-p2', title: 'Why are you looking for a new opportunity?', duration: 3 },
          { id: 'lg-sc-p3', title: 'What is your preferred work arrangement?', duration: 2 },
        ],
      },
      {
        id: 'lg-sc-case', type: 'case_study', title: 'Case-study',
        description: 'Applied problem-solving',
        questions: [
          { id: 'lg-sc-cs1', title: 'Design a notification system', duration: 10, hasEvaluationCriteria: true },
          { id: 'lg-sc-cs2', title: 'Product feature prioritization', duration: 10, hasEvaluationCriteria: true },
          { id: 'lg-sc-cs3', title: 'Data pipeline architecture', duration: 10, hasEvaluationCriteria: true },
          { id: 'lg-sc-cs4', title: 'Incident response workflow', duration: 10, hasEvaluationCriteria: true },
        ],
      },
    ],
  },
];
