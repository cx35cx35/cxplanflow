import { useEffect, useRef, useCallback } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import {
  requestNotificationPermission,
  checkDueTasks,
  sendDailyReminder,
} from '@/utils/notifications';

const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const DAILY_KEY = 'planflow-last-daily-reminder';

export function useNotifications() {
  const tasks = useTaskStore((s) => s.tasks);
  const notificationsEnabled = useUIStore((s) => s.notificationsEnabled);
  const lastCheckRef = useRef<string>('');

  const check = useCallback(() => {
    if (!notificationsEnabled) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hour = now.getHours();

    // Check due tasks every interval
    const checkKey = `${today}-${hour}`;
    if (checkKey !== lastCheckRef.current) {
      checkDueTasks(tasks);
      lastCheckRef.current = checkKey;
    }

    // Daily reminder at 9am
    if (hour >= 9) {
      const lastDaily = localStorage.getItem(DAILY_KEY);
      if (lastDaily !== today) {
        sendDailyReminder(tasks);
        localStorage.setItem(DAILY_KEY, today);
      }
    }
  }, [tasks, notificationsEnabled]);

  useEffect(() => {
    if (notificationsEnabled) {
      requestNotificationPermission();
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled) return;
    check();
    const interval = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [check, notificationsEnabled]);
}
