export type Priority = 'high' | 'medium' | 'low';
export type TaskCategory = 'Code' | 'Research' | 'Writing' | 'Exam Prep' | 'Design';
export type TaskStatus = 'backlog' | 'in_progress' | 'completed' | 'postponed';

export interface Task {
  id: string;
  title: string;
  duration: number; // predicted duration in hours
  actualDuration?: number; // actual hours spent, if completed
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  subtasks: string[];
  completedSubtasks?: string[];
  deadline: string; // "Today", "Tomorrow", "In 2 days", "Next week"
  riskLevel?: 'low' | 'medium' | 'high';
  recommendation?: string;
  postponedAt?: string;
}

export interface BlackBoxLog {
  id: string;
  timestamp: string;
  action: string;
  reason: string;
  status: 'info' | 'success' | 'warning' | 'panic' | 'rescue';
}

export interface LearningLog {
  id: string;
  taskTitle: string;
  predicted: number;
  actual: number;
  errorPercentage: number; // e.g. +50% or -20%
  timestamp: string;
}

export interface CapacityStats {
  focusBudget: number; // total focus hours available today
  remainingHours: number; // total hours of remaining high/med tasks
  completedHours: number;
  stressLevel: number; // calculated stress percentage
}

export type NavigatorIntent = 'CREATE' | 'EVALUATE' | 'SUMMARY' | 'GENERAL_CHAT';

export interface NavigatorResponse {
  intent: NavigatorIntent;
  reply: string;
  task?: {
    title: string;
    duration: number;
    priority: Priority;
    category?: TaskCategory;
  };
  subtasks?: string[];
  riskEvaluation?: {
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
  };
}
