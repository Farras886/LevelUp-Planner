// Task-related type definitions

export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  due_date: string; // ISO string
  is_recurring: boolean;
  recurrence_rule: string | null;
  priority: Priority;
  status: TaskStatus;
  exp_reward: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface UserStats {
  id: string;
  user_id: string;
  level: number;
  current_exp: number;
  exp_to_next: number;
  total_exp: number;
  streak_count: number;
  last_active: string | null;
}

export interface ExpLog {
  id: string;
  user_id: string;
  task_id: string | null;
  exp_gained: number;
  reason: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CompleteTaskResponse {
  task: Task;
  expGained: number;
  leveledUp: boolean;
  newLevel?: number;
  stats: UserStats;
}
