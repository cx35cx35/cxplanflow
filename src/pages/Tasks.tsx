import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Modal from '@/components/ui/Modal';
import TaskCheckbox from '@/components/ui/TaskCheckbox';
import { useUIStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { LayoutList, Columns3, CalendarDays, Plus, X, Pencil } from 'lucide-react';
import type { ViewMode, TaskStatus, Priority, Task } from '@/types';

export default function Tasks() {
  const { viewMode, setViewMode } = useUIStore();
  const { tasks, addTask, toggleTask, deleteTask, moveTask, updateTask } = useTaskStore();
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), { priority: newPriority, dueDate: new Date().toISOString().split('T')[0] });
    setNewTitle('');
    setShowAdd(false);
  };

  const viewTabs: { mode: ViewMode; icon: typeof LayoutList; label: string }[] = [
    { mode: 'list', icon: LayoutList, label: '列表' },
    { mode: 'board', icon: Columns3, label: '看板' },
    { mode: 'calendar', icon: CalendarDays, label: '日历' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="待办事项"
        description={`${tasks.filter((t) => !t.completed).length} 个任务待完成`}
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> 添加任务
          </button>
        }
      />

      {/* View Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-card rounded-lg w-fit mb-4 md:mb-6 border border-surface-border overflow-x-auto">
        {viewTabs.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              viewMode === mode
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Add Task Inline */}
      {showAdd && (
        <div className="card p-4 mb-4 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="需要做什么？"
              className="input-base flex-1 text-sm"
            />
            <div className="flex items-center gap-2">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="input-base text-sm flex-1 md:w-28"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
              <button onClick={handleAdd} className="btn-primary text-sm px-4">
                添加
              </button>
              <button onClick={() => setShowAdd(false)} className="text-text-muted hover:text-text-secondary p-2">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Content */}
      {viewMode === 'list' && (
        <ListView tasks={sortedTasks} onToggle={toggleTask} onDelete={deleteTask} onEdit={setEditingTask} />
      )}
      {viewMode === 'board' && (
        <BoardView tasks={sortedTasks} onDelete={deleteTask} onMove={moveTask} onEdit={setEditingTask} />
      )}
      {viewMode === 'calendar' && <CalendarView tasks={sortedTasks} />}

      {/* Edit Modal */}
      <TaskEditModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={(id, updates) => {
          updateTask(id, updates);
          setEditingTask(null);
        }}
      />
    </div>
  );
}

/* ==================== TASK EDIT MODAL ==================== */
function TaskEditModal({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setTagsInput(task.tags.join(', '));
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    const tags = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    onSave(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      tags,
    });
  };

  return (
    <Modal open={!!task} onClose={onClose} title="编辑任务">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-text-muted mb-1.5 block">标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-base w-full text-sm"
            placeholder="任务标题"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-muted mb-1.5 block">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-base w-full text-sm resize-none"
            placeholder="任务描述（可选）"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">优先级</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="input-base w-full text-sm"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">截止日期</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-base w-full text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-text-muted mb-1.5 block">标签</label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="input-base w-full text-sm"
            placeholder="用逗号分隔，如：工作, 重要"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost text-sm">
            取消
          </button>
          <button onClick={handleSave} className="btn-primary text-sm">
            保存
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ==================== LIST VIEW ==================== */
function ListView({
  tasks,
  onToggle,
  onDelete,
  onEdit,
}: {
  tasks: ReturnType<typeof useTaskStore.getState>['tasks'];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-text-muted text-sm">还没有任务，创建一个开始吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`card-hover p-3 flex items-center gap-3 group ${
            task.completed ? 'opacity-50' : ''
          }`}
        >
          <TaskCheckbox completed={task.completed} onToggle={() => onToggle(task.id)} />

          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(task)}>
            <span
              className={`text-sm font-medium ${
                task.completed ? 'line-through text-text-muted' : 'text-text-primary'
              }`}
            >
              {task.title}
            </span>
            {task.description && (
              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <PriorityDot priority={task.priority} />
              {task.dueDate && (
                <span className="text-[11px] text-text-muted">
                  {formatDate(task.dueDate)}
                </span>
              )}
              {task.tags.map((tag) => (
                <span key={tag} className="badge bg-surface-elevated text-text-muted text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => onEdit(task)}
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent transition-all duration-200 p-1"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all duration-200 p-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ==================== BOARD VIEW ==================== */
function BoardView({
  tasks,
  onDelete,
  onMove,
  onEdit,
}: {
  tasks: ReturnType<typeof useTaskStore.getState>['tasks'];
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}) {
  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'todo', label: '待办', color: 'text-text-secondary' },
    { status: 'in-progress', label: '进行中', color: 'text-yellow-400' },
    { status: 'done', label: '已完成', color: 'text-green-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(({ status, label, color }) => {
        const colTasks = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="card p-3">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
              <span className={`text-sm font-semibold ${color}`}>{label}</span>
              <span className="text-xs text-text-muted ml-auto">{colTasks.length}</span>
            </div>
            <div className="space-y-2 min-h-[100px]">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg bg-surface-elevated border border-surface-border group hover:border-surface-hover transition-all duration-200 cursor-pointer ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                  onClick={() => onEdit(task)}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-sm font-medium ${
                        task.completed ? 'line-through text-text-muted' : 'text-text-primary'
                      }`}
                    >
                      {task.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  {task.description && (
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <PriorityDot priority={task.priority} />
                    {task.dueDate && (
                      <span className="text-[10px] text-text-muted">{formatDate(task.dueDate)}</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {columns
                      .filter((c) => c.status !== status)
                      .map((c) => (
                        <button
                          key={c.status}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMove(task.id, c.status);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-surface-card text-text-muted hover:text-text-secondary transition-colors"
                        >
                          → {c.label}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <p className="text-xs text-text-muted text-center py-6">暂无任务</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==================== CALENDAR VIEW ==================== */
function CalendarView({
  tasks,
}: {
  tasks: ReturnType<typeof useTaskStore.getState>['tasks'];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const tasksByDate = new Map<string, typeof tasks>();
  tasks.forEach((t) => {
    if (t.dueDate) {
      const key = t.dueDate;
      if (!tasksByDate.has(key)) tasksByDate.set(key, []);
      tasksByDate.get(key)!.push(t);
    }
  });

  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn-ghost text-sm px-2 py-1">
          ←
        </button>
        <span className="text-sm font-semibold text-text-primary">
          {currentDate.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} className="btn-ghost text-sm px-2 py-1">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-surface-border rounded-lg overflow-hidden">
        {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
          <div key={d} className="bg-surface-card p-2 text-center text-[11px] font-medium text-text-muted">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const dateStr = day
            ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : '';
          const dayTasks = dateStr ? tasksByDate.get(dateStr) || [] : [];
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={i}
              className={`bg-surface-card p-2 min-h-[80px] ${
                day ? 'hover:bg-surface-hover transition-colors' : ''
              }`}
            >
              {day && (
                <>
                  <span
                    className={`text-xs font-medium ${
                      isToday
                        ? 'bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center'
                        : 'text-text-secondary'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate ${
                          t.completed
                            ? 'bg-green-500/10 text-green-400 line-through'
                            : 'bg-surface-elevated text-text-secondary'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-text-muted">
                        +{dayTasks.length - 3} 更多
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== HELPERS ==================== */
function PriorityDot({ priority }: { priority: Priority }) {
  const colors = { high: 'bg-red-400', medium: 'bg-yellow-400', low: 'bg-blue-400' };
  return <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors[priority]}`} />;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dateStr === today.toISOString().split('T')[0]) return '今天';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return '明天';
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
