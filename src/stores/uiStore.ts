import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewMode, Theme } from '@/types';

interface UIState {
  sidebarOpen: boolean;
  viewMode: ViewMode;
  theme: Theme;
  notificationsEnabled: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: Theme) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      viewMode: 'list',
      theme: 'light',
      notificationsEnabled: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    { name: 'planflow-ui' }
  )
);
