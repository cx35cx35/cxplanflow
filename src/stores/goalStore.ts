import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Goal, Milestone } from '@/types';

interface GoalState {
  goals: Goal[];
  addGoal: (title: string, opts?: Partial<Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'milestones'>>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (goalId: string, title: string, description?: string, date?: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  updateMilestone: (goalId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#f97316'];

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      goals: [],

      addGoal: (title, opts) => {
        const now = new Date().toISOString();
        const goal: Goal = {
          id: uuid(),
          title,
          status: 'active',
          color: opts?.color ?? COLORS[Math.floor(Math.random() * COLORS.length)],
          milestones: [],
          createdAt: now,
          updatedAt: now,
          ...opts,
        };
        set((s) => ({ goals: [goal, ...s.goals] }));
      },

      updateGoal: (id, updates) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          ),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addMilestone: (goalId, title, description, date) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  milestones: [
                    ...g.milestones,
                    {
                      id: uuid(),
                      title,
                      description,
                      completed: false,
                      order: g.milestones.length,
                      date: date || undefined,
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        })),

      toggleMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  milestones: g.milestones.map((m) =>
                    m.id === milestoneId
                      ? {
                          ...m,
                          completed: !m.completed,
                          completedAt: !m.completed ? new Date().toISOString() : undefined,
                        }
                      : m
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        })),

      updateMilestone: (goalId, milestoneId, updates) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  milestones: g.milestones.map((m) =>
                    m.id === milestoneId ? { ...m, ...updates } : m
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        })),

      deleteMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  milestones: g.milestones.filter((m) => m.id !== milestoneId),
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        })),
    }),
    { name: 'planflow-goals' }
  )
);
