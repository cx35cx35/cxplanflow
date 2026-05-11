import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import {
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Flame,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { useGoalStore } from '@/stores/goalStore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const tasks = useTaskStore((s) => s.tasks);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const goals = useGoalStore((s) => s.goals);
  const navigate = useNavigate();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === today || t.createdAt.startsWith(today)),
    [tasks, today]
  );
  const weekStats = useMemo(() => {
    const weekStart = getWeekStart();
    const weekTasks = tasks.filter((t) => t.createdAt >= weekStart);
    const weekDone = weekTasks.filter((t) => t.completed).length;
    const weekTotal = weekTasks.length;
    const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
    return { weekDone, weekTotal, weekPct };
  }, [tasks]);

  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'active'), [goals]);
  const streak = useMemo(() => calculateStreak(tasks), [tasks]);

  const motivationalQuotes = [
    '每天一小步，终将跨越一大步。',
    '追求进步，而非完美。',
    '未来的你会感谢现在的自己。',
    '专注于今天最重要的事。',
    '完成比完美更重要。',
  ];
  const quote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length];

  const [showAllTasks, setShowAllTasks] = useState(false);
  const displayedTasks = showAllTasks ? todayTasks : todayTasks.slice(0, 5);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="仪表盘"
        description={new Date().toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}
      />

      {/* Motivational Quote */}
      <div className="card p-4 mb-6 border-l-2 border-l-accent">
        <p className="text-sm text-text-secondary italic">"{quote}"</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<CheckCircle2 size={18} className="text-green-400" />}
          label="今日待办"
          value={todayTasks.length.toString()}
          sub={`${todayTasks.filter((t) => t.completed).length} 已完成`}
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-accent" />}
          label="本周进度"
          value={`${weekStats.weekPct}%`}
          sub={`${weekStats.weekDone}/${weekStats.weekTotal} 个任务`}
        />
        <StatCard
          icon={<Target size={18} className="text-purple-400" />}
          label="进行中目标"
          value={activeGoals.length.toString()}
          sub="进行中"
        />
        <StatCard
          icon={<Flame size={18} className="text-orange-400" />}
          label="连续打卡"
          value={`${streak} 天`}
          sub="继续加油！"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              今日待办
            </h2>
            <Link
              to="/tasks"
              className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-text-muted py-8 text-center">
              今天没有待办任务，享受你的时光吧！
            </p>
          ) : (
            <>
              <div className="space-y-0.5">
                {displayedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer group ${
                      task.completed ? 'opacity-50' : ''
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className={`w-[18px] h-[18px] rounded-full border-[1.5px] shrink-0 flex items-center justify-center transition-all duration-200 ${
                        task.completed
                          ? 'bg-accent border-accent'
                          : 'border-gray-300 hover:border-accent'
                      }`}
                    >
                      {task.completed && (
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div
                      className="flex-1 min-w-0 flex items-center gap-2"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <span className={`text-[13px] truncate ${
                        task.completed ? 'line-through text-text-muted' : 'text-text-primary'
                      }`}>
                        {task.title}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        task.priority === 'high' ? 'bg-red-400' :
                        task.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
              {todayTasks.length > 5 && (
                <button
                  onClick={() => setShowAllTasks(!showAllTasks)}
                  className="w-full mt-2 py-2 text-xs text-text-muted hover:text-accent transition-colors flex items-center justify-center gap-1"
                >
                  {showAllTasks ? (
                    <>收起 <ChevronUp size={14} /></>
                  ) : (
                    <>展开剩余 {todayTasks.length - 5} 项 <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Goal Progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Target size={16} className="text-purple-400" />
              长期目标进度
            </h2>
            <Link
              to="/goals"
              className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>
          {activeGoals.length === 0 ? (
            <p className="text-sm text-text-muted py-8 text-center">
              还没有设定目标，创建一个开始吧！
            </p>
          ) : (
            <div className="space-y-4">
              {activeGoals.slice(0, 4).map((goal) => {
                const total = goal.milestones.length;
                const done = goal.milestones.filter((m) => m.completed).length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const daysRemaining = goal.targetDate ? getDaysRemaining(goal.targetDate) : null;

                return (
                  <div
                    key={goal.id}
                    onClick={() => navigate(`/goals/${goal.id}`)}
                    className="p-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{goal.icon || '🎯'}</span>
                      <span className="text-sm text-text-primary font-medium flex-1 truncate">
                        {goal.title}
                      </span>
                      <span className="text-xs font-medium" style={{ color: goal.color }}>
                        {pct}%
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-text-muted mb-2 line-clamp-1 ml-6">{goal.description}</p>
                    )}
                    <div className="ml-6">
                      <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: goal.color }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-muted">
                        <span>{done}/{total} 个里程碑</span>
                        {goal.targetDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {daysRemaining !== null && daysRemaining >= 0
                              ? `剩余 ${daysRemaining} 天`
                              : daysRemaining !== null && daysRemaining < 0
                              ? `已逾期 ${Math.abs(daysRemaining)} 天`
                              : formatDate(goal.targetDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return monday.toISOString().split('T')[0];
}

function calculateStreak(tasks: { completedAt?: string; completed: boolean }[]): number {
  const completedDates = new Set(
    tasks
      .filter((t) => t.completed && t.completedAt)
      .map((t) => t.completedAt!.split('T')[0])
  );

  let streak = 0;
  const d = new Date();
  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    if (completedDates.has(dateStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getDaysRemaining(targetDate: string): number {
  const target = new Date(targetDate);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
