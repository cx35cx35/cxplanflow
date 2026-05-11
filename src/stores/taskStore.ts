import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Task, TaskStatus } from '@/types';

interface TaskState {
  tasks: Task[];
  addTask: (title: string, opts?: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  reorderTasks: (ids: string[]) => void;
  moveTask: (id: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (title, opts) => {
        const now = new Date().toISOString();
        const task: Task = {
          id: uuid(),
          title,
          completed: false,
          priority: opts?.priority ?? 'medium',
          status: opts?.status ?? 'todo',
          tags: opts?.tags ?? [],
          order: opts?.order ?? Date.now(),
          createdAt: now,
          updatedAt: now,
          ...opts,
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
      },

      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  status: !t.completed ? 'done' : 'todo',
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      reorderTasks: (ids) =>
        set((s) => {
          const map = new Map(s.tasks.map((t) => [t.id, t]));
          const reordered = ids
            .map((id, i) => (map.has(id) ? { ...map.get(id)!, order: i } : null))
            .filter(Boolean) as Task[];
          const remaining = s.tasks.filter((t) => !ids.includes(t.id));
          return { tasks: [...reordered, ...remaining] };
        }),

      moveTask: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completed: status === 'done',
                  completedAt: status === 'done' ? new Date().toISOString() : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),
    }),
    { name: 'planflow-tasks' }
  )
);
