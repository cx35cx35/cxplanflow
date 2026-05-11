import { useMemo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { useTaskStore } from '@/stores/taskStore';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Target,
  Trophy,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

export default function Statistics() {
  const tasks = useTaskStore((s) => s.tasks);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const dailyData = useMemo(() => getDailyCompletions(tasks, 30), [tasks]);
  const { current: streak, longest: longestStreak } = useMemo(() => calculateStreaks(tasks), [tasks]);
  const heatmapData = useMemo(() => getHeatmapData(tasks, 20), [tasks]);
  const avgDaily = totalTasks > 0 ? (completedTasks / Math.max(1, getDaysSinceFirst(tasks))).toFixed(1) : '0';

  return (
    <div className="animate-fade-in">
      <PageHeader title="数据统计" description="追踪你的生产力趋势" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={<Target size={18} className="text-pink-400" />}
          label="今日完成"
          value={getTodayCompleted(tasks).toString()}
          sub="今天完成的任务数"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-accent" />}
          label="完成率"
          value={`${completionRate}%`}
          sub="总体完成率"
        />
        <StatCard
          icon={<Calendar size={18} className="text-purple-400" />}
          label="日均完成"
          value={avgDaily}
          sub="平均每天完成任务数"
        />
        <StatCard
          icon={<Flame size={18} className="text-orange-400" />}
          label="当前连胜"
          value={`${streak} 天`}
          sub="连续完成任务天数"
        />
        <StatCard
          icon={<Trophy size={18} className="text-yellow-400" />}
          label="最长连胜"
          value={`${longestStreak} 天`}
          sub="历史最佳纪录"
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-green-400" />}
          label="已完成任务"
          value={completedTasks.toString()}
          sub={`共 ${totalTasks} 个任务`}
        />
      </div>

      {/* Completion Trend - Recharts Line Chart */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-text-primary mb-4">完成趋势（近 30 天）</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#787774', fontSize: 10 }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={{ stroke: '#e8e5e0' }}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#787774', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e8e5e0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#37352f',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                labelFormatter={(label) => `日期: ${label}`}
                formatter={(value: number) => [`${value} 个任务`, '完成数']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-4">活跃度热力图</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-0.5">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="w-3 h-3 rounded-[2px] transition-colors cursor-default"
                    style={{ backgroundColor: getHeatmapColor(day.count) }}
                    title={`${day.date}: ${day.count} 个任务`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-3">
            <span className="text-[10px] text-text-muted">少</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <div
                key={l}
                className="w-3 h-3 rounded-[2px]"
                style={{ backgroundColor: getHeatmapColor(l) }}
              />
            ))}
            <span className="text-[10px] text-text-muted">多</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== Stat Card ==================== */
function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-text-muted font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted mt-0.5">{sub}</div>
    </div>
  );
}

/* ==================== Helper Functions ==================== */

function getDailyCompletions(tasks: { completedAt?: string; completed: boolean }[], days: number) {
  const data: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = tasks.filter(
      (t) => t.completed && t.completedAt?.startsWith(dateStr)
    ).length;
    data.push({ date: dateStr, count });
  }
  return data;
}

function getHeatmapData(tasks: { completedAt?: string; completed: boolean }[], weeks: number) {
  const data: { date: string; count: number }[][] = [];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));

  for (let w = weeks - 1; w >= 0; w--) {
    const week: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() - w * 7 + d);
      const dateStr = date.toISOString().split('T')[0];
      const count = tasks.filter(
        (t) => t.completed && t.completedAt?.startsWith(dateStr)
      ).length;
      week.push({ date: dateStr, count });
    }
    data.push(week);
  }
  return data;
}

function getHeatmapColor(count: number): string {
  if (count === 0) return '#f0efeb';
  if (count <= 1) return 'rgba(99, 102, 241, 0.15)';
  if (count <= 3) return 'rgba(99, 102, 241, 0.35)';
  if (count <= 5) return 'rgba(99, 102, 241, 0.55)';
  return 'rgba(99, 102, 241, 0.85)';
}

function calculateStreaks(tasks: { completedAt?: string; completed: boolean }[]): { current: number; longest: number } {
  const completedDates = new Set(
    tasks.filter((t) => t.completed && t.completedAt).map((t) => t.completedAt!.split('T')[0])
  );

  if (completedDates.size === 0) return { current: 0, longest: 0 };

  // Sort dates
  const sortedDates = Array.from(completedDates).sort();

  // Calculate current streak (from today backwards)
  let currentStreak = 0;
  const d = new Date();
  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    if (completedDates.has(dateStr)) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) };
}

function getDaysSinceFirst(tasks: { createdAt: string }[]): number {
  if (tasks.length === 0) return 1;
  const first = new Date(tasks[tasks.length - 1].createdAt);
  const now = new Date();
  return Math.max(1, Math.ceil((now.getTime() - first.getTime()) / 86400000));
}

function getTodayCompleted(tasks: { completedAt?: string; completed: boolean }[]): number {
  const today = new Date().toISOString().split('T')[0];
  return tasks.filter((t) => t.completed && t.completedAt?.startsWith(today)).length;
}
