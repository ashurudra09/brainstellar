// Single source of truth for every domain (Quant, DSA, SQL, ...), their
// categories/difficulties, and the default section layout for their
// question template. Every consumer that used to hardcode this list reads
// it from here instead, so adding a domain or category is a one-file edit.

export const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', accent: '#5fab54' },
  { key: 'medium', label: 'Medium', accent: '#547bd3' },
  { key: 'hard', label: 'Hard', accent: '#d35454' },
  { key: 'deadly', label: 'Deadly', accent: '#8a54d3' },
];

export const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2, deadly: 3 };

export const DOMAINS = [
  {
    slug: 'quant',
    label: 'Quant Puzzles',
    icon: '🎲',
    accent: '#993333',
    difficulties: ['easy', 'medium', 'hard', 'deadly'],
    categories: ['probability', 'discrete', 'strategy', 'general'],
    sections: {
      open: ['Question'],
      collapsed: ['Hint', 'Answer', 'Solution'],
    },
  },
  {
    slug: 'dsa',
    label: 'DSA',
    icon: '🧩',
    accent: '#4a8fd3',
    difficulties: ['easy', 'medium', 'hard'],
    categories: ['arrays', 'strings', 'trees', 'graphs', 'dp', 'greedy',
                 'binary-search', 'heaps', 'tries', 'bit-manipulation', 'math'],
    sections: {
      open: ['Question', 'Constraints', 'Examples'],
      collapsed: ['Hint', 'Approach', 'Complexity', 'Code', 'Solution'],
    },
  },
  {
    slug: 'sql',
    label: 'SQL',
    icon: '🗄️',
    accent: '#3d9970',
    difficulties: ['easy', 'medium', 'hard'],
    categories: ['joins', 'aggregation', 'window-functions', 'subqueries',
                 'indexing', 'schema-design', 'optimization'],
    sections: {
      open: ['Question', 'Schema'],
      collapsed: ['Hint', 'Query', 'Solution'],
    },
  },
  {
    slug: 'lld',
    label: 'LLD',
    icon: '🧱',
    accent: '#b5651d',
    difficulties: ['easy', 'medium', 'hard'],
    categories: ['design-patterns', 'oop-principles', 'concurrency', 'api-design', 'case-study'],
    sections: {
      open: ['Question', 'Requirements'],
      collapsed: ['Hint', 'Approach', 'Trade-offs', 'Code', 'Solution'],
    },
  },
  {
    slug: 'hld',
    label: 'HLD',
    icon: '🏗️',
    accent: '#8a54d3',
    difficulties: ['easy', 'medium', 'hard'],
    categories: ['scalability', 'caching', 'databases', 'messaging', 'consistency', 'case-study'],
    sections: {
      open: ['Question', 'Requirements'],
      collapsed: ['Hint', 'Approach', 'Trade-offs', 'Solution'],
    },
  },
  {
    slug: 'os-networks',
    label: 'OS & Networks',
    icon: '💻',
    accent: '#547bd3',
    difficulties: ['easy', 'medium', 'hard'],
    categories: ['processes', 'memory', 'concurrency', 'filesystems', 'tcp-ip', 'http', 'dns', 'security'],
    sections: {
      open: ['Question'],
      collapsed: ['Hint', 'Answer', 'Solution'],
    },
  },
  {
    slug: 'data-science',
    label: 'Data Science',
    icon: '📊',
    accent: '#d3a454',
    difficulties: ['easy', 'medium', 'hard'],
    categories: ['statistics', 'hypothesis-testing', 'regression', 'experiment-design', 'pandas', 'case-study'],
    sections: {
      open: ['Question'],
      collapsed: ['Hint', 'Approach', 'Answer', 'Solution'],
    },
  },
  {
    slug: 'ai-ml',
    label: 'AI/ML',
    icon: '🤖',
    accent: '#5fab54',
    difficulties: ['easy', 'medium', 'hard'],
    categories: ['classical-ml', 'deep-learning', 'nlp', 'llms', 'evaluation', 'mlops', 'math-foundations'],
    sections: {
      open: ['Question'],
      collapsed: ['Hint', 'Approach', 'Answer', 'Solution'],
    },
  },
  {
    slug: 'behavioural',
    label: 'Behavioural',
    icon: '🗣️',
    accent: '#d35454',
    difficulties: [],
    categories: ['leadership', 'conflict', 'failure', 'teamwork', 'motivation', 'project-deep-dive'],
    sections: {
      open: ['Question'],
      collapsed: ['Structure', 'My Story'],
    },
  },
];

export const DOMAIN_BY_SLUG = Object.fromEntries(DOMAINS.map(d => [d.slug, d]));

export const getDomain = slug => DOMAIN_BY_SLUG[slug];
