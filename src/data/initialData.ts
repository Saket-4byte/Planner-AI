import { Task, BlackBoxLog, LearningLog } from '../types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Implement OAuth Token Validation Flow',
    duration: 3,
    actualDuration: 3.5,
    priority: 'high',
    category: 'Code',
    status: 'completed',
    deadline: 'Today',
    subtasks: ['Generate PKCE verification codes', 'Integrate callback routes', 'Verify token expiration'],
    completedSubtasks: ['Generate PKCE verification codes', 'Integrate callback routes', 'Verify token expiration']
  },
  {
    id: 't2',
    title: 'Review Machine Learning Patent Draft',
    duration: 4,
    priority: 'high',
    category: 'Research',
    status: 'in_progress',
    deadline: 'Today',
    subtasks: ['Check clause 4.2 definitions', 'Cross-reference prior art citations', 'Format submission documents'],
    completedSubtasks: ['Check clause 4.2 definitions']
  },
  {
    id: 't3',
    title: 'Draft Security Post-Mortem Report',
    duration: 2,
    priority: 'medium',
    category: 'Writing',
    status: 'backlog',
    deadline: 'Tomorrow',
    subtasks: ['Reconstruct DDoS attack timeline', 'Document firewall policy patches', 'Draft executive summary']
  },
  {
    id: 't4',
    title: 'Prepare Advanced Algorithms Midterm Exam',
    duration: 5,
    priority: 'high',
    category: 'Exam Prep',
    status: 'backlog',
    deadline: 'In 2 days',
    subtasks: ['Practice Dynamic Programming memoization', 'Solve Dijkstra & A* grid puzzles', 'Review NP-Completeness proofs']
  },
  {
    id: 't5',
    title: 'Design UI Wireframes for Analytics Console',
    duration: 1.5,
    actualDuration: 1.2,
    priority: 'low',
    category: 'Design',
    status: 'completed',
    deadline: 'Tomorrow',
    subtasks: ['Create high-contrast layout grids', 'Define color tokens', 'Export icons to SVG'],
    completedSubtasks: ['Create high-contrast layout grids', 'Define color tokens', 'Export icons to SVG']
  },
  {
    id: 't6',
    title: 'Optimize Database Indexing on User Logins',
    duration: 2.5,
    priority: 'medium',
    category: 'Code',
    status: 'backlog',
    deadline: 'Next week',
    subtasks: ['Analyze query planner on login query', 'Add composite index on email/status', 'Verify index scan throughput']
  }
];

export const INITIAL_BLACK_BOX_LOGS: BlackBoxLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-29T09:00:00Z',
    action: 'OS_BOOT',
    reason: 'System booted on standard node thread. Core logical engines validated.',
    status: 'info'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-29T09:15:30Z',
    action: 'COGNITIVE_LOAD_ESTIMATE',
    reason: 'Evaluated backlog queue. High priority tasks exceed ideal 4-hour threshold.',
    status: 'warning'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-29T10:30:12Z',
    action: 'TASK_COMPLETED',
    reason: 'Task: "Design UI Wireframes for Analytics Console" marked done. Error deviation -20.0%.',
    status: 'success'
  },
  {
    id: 'log-4',
    timestamp: '2026-06-29T11:02:45Z',
    action: 'NAVIGATOR_ADVICE',
    reason: 'Suggested user to focus on "Review Machine Learning Patent Draft" due to peak mental capacity.',
    status: 'info'
  }
];

export const INITIAL_LEARNING_LOGS: LearningLog[] = [
  {
    id: 'l1',
    taskTitle: 'Design UI Wireframes for Analytics Console',
    predicted: 1.5,
    actual: 1.2,
    errorPercentage: -20,
    timestamp: '2026-06-29T10:30:12Z'
  },
  {
    id: 'l2',
    taskTitle: 'Implement OAuth Token Validation Flow',
    predicted: 3.0,
    actual: 3.5,
    errorPercentage: 16.7,
    timestamp: '2026-06-29T16:45:00Z'
  }
];

export const ENERGY_HOURLY_DATA = [
  { hour: '08:00', level: 85, focus: 90 },
  { hour: '10:00', level: 95, focus: 95 },
  { hour: '12:00', level: 70, focus: 75 },
  { hour: '14:00', level: 60, focus: 50 },
  { hour: '16:00', level: 80, focus: 85 },
  { hour: '18:00', level: 75, focus: 70 },
  { hour: '20:00', level: 50, focus: 45 },
  { hour: '22:00', level: 30, focus: 20 }
];
