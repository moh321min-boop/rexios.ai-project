export type Difficulty = 'Small' | 'Medium' | 'Expert'
export interface Problem {
  id: string
  company: string
  initial: string
  age: string
  title: string
  summary: string
  skills: string[]
  difficulty: Difficulty
  days: number
  proposals: number
  reward: number
  description?: string
  sections?: { title: string; items: string[] }[]
  attachments?: string[]
}
export interface ProblemComment {
  id: string
  author: string
  text: string
  time: string
  company?: boolean
  replyTo?: string
}
export const problems: Problem[] = [
  {
    id: 'p-101',
    company: 'Orient Textile Co.',
    initial: 'O',
    age: '2 days ago',
    title: 'Low-cost temperature monitoring system for an industrial oven',
    summary:
      "We need a simple way to read an industrial oven's temperature accurately and send an alert when it exceeds the limit, with a small dashboard showing the readings.",
    skills: ['Python', 'Embedded', 'IoT'],
    difficulty: 'Medium',
    days: 12,
    proposals: 7,
    reward: 45000,
    description:
      "Our company runs a production line built around an industrial oven, and temperature readings fluctuate wildly when nearby motors run, causing false alarms and unnecessary stops. We're looking for a simple, low-cost system that reads temperature accurately and sends an alert when the limit is exceeded.",
    sections: [
      {
        title: 'Deliverables',
        items: [
          'Read temperature with at least ±0.5° accuracy',
          'Send an alert by email or SMS when the limit is exceeded',
          'A simple web dashboard showing the last 24 hours of readings',
          'Short documentation on installation and calibration',
        ],
      },
      {
        title: 'Constraints and conditions',
        items: [
          'Hardware budget must not exceed 15,000 DZD',
          'Runs on an ESP32 or equivalent',
          'Delivery within 14 days of solution acceptance',
        ],
      },
      {
        title: 'Evaluation criteria',
        items: [
          'Accuracy and stability of readings',
          'Simple installation and low cost',
          'Quality of documentation and code',
        ],
      },
    ],
    attachments: ['oven-diagram.pdf', 'sample-readings.csv'],
  },
  {
    id: 'p-102',
    company: 'Aures Foods Factory',
    initial: 'A',
    age: '3 days ago',
    title: 'Monitoring dashboard for two filling lines with simple alerts',
    summary:
      "We're looking for a web dashboard that shows the status of two filling lines and alerts the supervisor when one stops, without needing an expensive SCADA system.",
    skills: ['SCADA', 'SQL'],
    difficulty: 'Small',
    days: 20,
    proposals: 3,
    reward: 20000,
  },
  {
    id: 'p-103',
    company: 'Sirta Smart Solutions',
    initial: 'S',
    age: '1 week ago',
    title: 'Failure prediction model for electric motors from vibration data',
    summary:
      'We have three months of vibration logs for ten motors and want a model that predicts failure days ahead, with an alert interface and a detailed accuracy report.',
    skills: ['AI/ML', 'Python', 'IoT'],
    difficulty: 'Expert',
    days: 30,
    proposals: 11,
    reward: 180000,
  },
  {
    id: 'p-104',
    company: 'El Waha Distribution',
    initial: 'W',
    age: '2 weeks ago',
    title: 'Syncing branch inventory when the internet goes down',
    summary:
      'The inventory app runs in three branches and suffers frequent outages; we want a sync mechanism that tolerates disconnections without data conflicts.',
    skills: ['Backend', 'SQL', 'React'],
    difficulty: 'Medium',
    days: 9,
    proposals: 5,
    reward: 60000,
  },
]
export const initialProblemComments: ProblemComment[] = [
  {
    id: 'c1',
    author: 'Leila Bouzid',
    time: '2 hours ago',
    text: 'Can we visit the site to inspect the oven before submitting a solution?',
  },
  {
    id: 'c2',
    author: 'Orient Textile Co.',
    time: '1 hour ago',
    company: true,
    replyTo: 'c1',
    text: "Yes, we can arrange one visit per provisionally accepted proposal. We'll share the location after the initial review.",
  },
  {
    id: 'c3',
    author: 'Karim Haddad',
    time: '40 minutes ago',
    text: 'Is there a limit on how many sensors can be installed in the oven?',
  },
  {
    id: 'c4',
    author: 'Orient Textile Co.',
    time: '15 minutes ago',
    company: true,
    replyTo: 'c3',
    text: 'The oven has three measurement points, and two more can be added if needed.',
  },
]
