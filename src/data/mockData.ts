import type { Question, Answer, Tag, Category } from '@/types'
// Sample content transcribed from the saved Figma frames. No live community data.
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'All', slug: 'all', questionCount: 248 },
  { id: 'cat-iot', name: 'Internet of Things', slug: 'iot', questionCount: 64 },
  { id: 'cat-ai', name: 'Artificial Intelligence', slug: 'ai', questionCount: 51 },
  { id: 'cat-embedded', name: 'Embedded Systems', slug: 'embedded', questionCount: 47 },
  { id: 'cat-automation', name: 'Industrial Automation', slug: 'automation', questionCount: 38 },
  { id: 'cat-web', name: 'Web Development', slug: 'web', questionCount: 29 },
  { id: 'cat-other', name: 'Other', slug: 'other', questionCount: 19 },
]
export const MOCK_TAGS: Tag[] = ['IOT', 'EMBEDDED', 'AI/ML', 'PYTHON', 'ROBOTICS', 'SQL'].map(
  (name) => ({ id: name, name, slug: name.toLowerCase(), questionCount: 0 })
)
export const MOCK_TOP_CONTRIBUTORS = [
  { id: 'sara', displayName: 'Sara Kasmi', solutionCount: 42 },
  { id: 'noureddine', displayName: 'Noureddine Mokrani', solutionCount: 37 },
  { id: 'amine', displayName: 'Amine Ben Ali', solutionCount: 25 },
]
export const MOCK_COMMUNITY_RULES = [
  'Be respectful and specific in your question',
  "Don't share confidential company information",
  'Search before you ask',
]
const summaries = [
  "I use a DS18B20 sensor to monitor an industrial oven's temperature, but readings fluctuate wildly when a nearby motor runs. Is a software filter enough, or is the problem electrical isolation?",
  'We have three months of vibration logs from a textile factory and want to predict failures before they happen. Should I start with clustering or with time-series models?',
  'We need a monitoring dashboard for two filling lines with simple alarms. Looking for real-world experience with Ignition or ScadaBR in terms of reliability and support.',
  'An inventory app runs in three branches and suffers frequent outages. I want a sync pattern that tolerates disconnections without data conflicts.',
]
const titles = [
  'How do I reduce temperature sensor noise on an ESP32 in a production line?',
  "What's the best approach to predictive maintenance for an electric motor using vibration data?",
  'Is an open-source SCADA system suitable for a small factory on a tight budget?',
  'Syncing a database across branches when the internet drops often',
]
export const MOCK_QUESTIONS: Question[] = titles.map((title, i) => ({
  id: `q-${101 + i}`,
  title,
  summary: summaries[i]!,
  body: i
    ? summaries[i]!
    : "I use a DS18B20 sensor to monitor the temperature of an industrial oven in a small factory, but readings fluctuate wildly (±4 degrees) whenever the motor near the sensor runs.\n\nI tried a simple moving average and it helped a little, but I don't know whether the problem is in the code or in the electrical wiring. Here is part of my current code:",
  code:
    i === 0
      ? 'float readTemp() {\n  sensors.requestTemperatures();\n  return sensors.getTempCByIndex(0);\n}'
      : undefined,
  authorId: ['amine', 'sara', 'karim', 'leila'][i]!,
  author: {
    id: ['amine', 'sara', 'karim', 'leila'][i]!,
    username: ['amine', 'sara', 'karim', 'leila'][i]!,
    displayName: ['Amine Ben Ali', 'Sara Kasmi', 'Karim Haddad', 'Leila Bouzid'][i]!,
  },
  authorRole: i === 0 ? 'Computer Engineering student — USTHB' : undefined,
  tags: [
    ['IOT', 'EMBEDDED'],
    ['AI/ML', 'PYTHON'],
    ['SCADA', 'AUTOMATION'],
    ['BACKEND', 'SQL'],
  ][i]!.map((name) => ({ id: name, name, slug: name.toLowerCase(), questionCount: 0 })),
  category: MOCK_CATEGORIES[[1, 2, 4, 5][i]!],
  status: i === 3 ? 'open' : 'answered',
  voteCount: [12, 21, 7, 3][i]!,
  insightCount: [4, 9, 3, 1][i],
  answerCount: [3, 5, 2, 0][i]!,
  viewCount: [248, 412, 133, 56][i]!,
  timeLabel: ['2 hours ago', '5 hours ago', 'Yesterday', '2 days ago'][i],
  createdAt: `2026-01-${20 - i}T12:00:00Z`,
  updatedAt: `2026-01-${20 - i}T12:00:00Z`,
}))
export const RELATED_QUESTIONS = [
  'Best way to isolate sensors from motor noise',
  'Using a Kalman filter with ESP32',
  'Calibrating a DS18B20 in a hot environment',
].map((title, i): Question => ({
  ...MOCK_QUESTIONS[0]!,
  id: `related-${i}`,
  title,
  body: 'The saved design includes this question title, but its full discussion is not available in this frontend preview.',
  summary: undefined,
  code: undefined,
  answerCount: 4,
}))
MOCK_QUESTIONS.push(...RELATED_QUESTIONS.map((q) => ({ ...q, createdAt: '2025-12-01T12:00:00Z' })))
export const MOCK_ANSWERS: Record<string, Answer[]> = {
  'q-101': [
    {
      id: 'a-101',
      questionId: 'q-101',
      body: "Most likely it's the isolation, not the code: use a shielded cable, connect its shield to ground at one end only, and add a 100nF capacitor near the sensor. After that, a simple Kalman filter is enough to smooth the readings.",
      authorId: 'noureddine',
      author: { id: 'noureddine', username: 'noureddine', displayName: 'Noureddine Mokrani' },
      authorRole: 'Embedded systems engineer',
      voteCount: 9,
      insightCount: 2,
      isAccepted: false,
      timeLabel: '20 minutes ago',
      createdAt: '2026-01-20T13:40:00Z',
      updatedAt: '2026-01-20T13:40:00Z',
    },
    {
      id: 'a-102',
      questionId: 'q-101',
      body: 'Before changing the wiring, try taking several samples each cycle and discarding outliers (median filter), then average. This reduces the effect of momentary spikes caused by the motor running.',
      authorId: 'sara',
      author: { id: 'sara', username: 'sara', displayName: 'Sara Kasmi' },
      authorRole: 'AI researcher',
      voteCount: 5,
      insightCount: 1,
      isAccepted: false,
      timeLabel: '1 hour ago',
      createdAt: '2026-01-20T13:00:00Z',
      updatedAt: '2026-01-20T13:00:00Z',
    },
  ],
}
