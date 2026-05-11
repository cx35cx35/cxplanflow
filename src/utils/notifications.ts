import type { Task } from '@/types';

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return Promise.resolve('denied');
  if (Notification.permission === 'granted') return Promise.resolve('granted');
  return Notification.requestPermission();
}

export function sendNotification(title: string, body?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '/vite.svg',
    badge: '/vite.svg',
  });
}

export function checkDueTasks(tasks: Task[]) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const overdue = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today);
  const dueToday = tasks.filter((t) => !t.completed && t.dueDate === today);
  const dueTomorrow = tasks.filter((t) => !t.completed && t.dueDate === tomorrow);

  if (overdue.length > 0) {
    sendNotification(
      `${overdue.length} 个任务已逾期`,
      overdue.map((t) => t.title).join('、')
    );
  }

  if (dueToday.length > 0) {
    sendNotification(
      `今天有 ${dueToday.length} 个任务待完成`,
      dueToday.map((t) => t.title).join('、')
    );
  }

  if (dueTomorrow.length > 0) {
    sendNotification(
      `明天有 ${dueTomorrow.length} 个任务到期`,
      dueTomorrow.map((t) => t.title).join('、')
    );
  }
}

export function sendDailyReminder(tasks: Task[]) {
  const pending = tasks.filter((t) => !t.completed);
  if (pending.length === 0) return;

  sendNotification(
    '每日任务提醒',
    `你还有 ${pending.length} 个任务待完成`
  );
}
