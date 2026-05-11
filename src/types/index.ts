export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type ViewMode = 'list' | 'board' | 'calendar';
export type Theme = 'dark' | 'light';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  status: TaskStatus;
  order: number;
  goalId?: string;
  milestoneId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  color: string;
  icon?: string;
  status: GoalStatus;
  targetDate?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  date?: string;
  completedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Settings {
  theme: Theme;
  notificationsEnabled: boolean;
  reminderTime?: string;
}

export interface TaskFilters {
  priority?: Priority[];
  tags?: string[];
  status?: TaskStatus[];
  search?: string;
}
