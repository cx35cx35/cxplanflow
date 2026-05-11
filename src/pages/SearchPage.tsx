import { useState, useMemo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import TaskCheckbox from '@/components/ui/TaskCheckbox';
import { useTaskStore } from '@/stores/taskStore';
import { Search, SlidersHorizontal, X, Trash2 } from 'lucide-react';
import type { Priority, TaskStatus } from '@/types';

export default function SearchPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const [query, setQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority[]>([]);
  const [filterStatus, setFilterStatus] = useState<TaskStatus[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Collect all unique tags from tasks
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [tasks]);

  const results = useMemo(() => {
    return tasks.filter((t) => {
      const matchQuery =
        !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description?.toLowerCase().includes(query.toLowerCase());
      const matchPriority =
        filterPriority.length === 0 || filterPriority.includes(t.priority);
      const matchStatus =
        filterStatus.length === 0 || filterStatus.includes(t.status);
      const matchTags =
        filterTags.length === 0 || filterTags.some((tag) => t.tags.includes(tag));
      const matchDateFrom = !dateFrom || (t.dueDate && t.dueDate >= dateFrom) || (!t.dueDate && t.createdAt.split('T')[0] >= dateFrom);
      const matchDateTo = !dateTo || (t.dueDate && t.dueDate <= dateTo) || (!t.dueDate && t.createdAt.split('T')[0] <= dateTo);
      return matchQuery && matchPriority && matchStatus && matchTags && matchDateFrom && matchDateTo;
    });
  }, [tasks, query, filterPriority, filterStatus, filterTags, dateFrom, dateTo]);

  const togglePriority = (p: Priority) =>
    setFilterPriority((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const toggleStatus = (s: TaskStatus) =>
    setFilterStatus((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const toggleTag = (tag: string) =>
    setFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );

  const clearFilters = () => {
    setFilterPriority([]);
    setFilterStatus([]);
    setFilterTags([]);
    setDateFrom('');
    setDateTo('');
    setQuery('');
  };

  const hasFilters = filterPriority.length > 0 || filterStatus.length > 0 || filterTags.length > 0 || dateFrom || dateTo || query;

  return (
    <div className="animate-fade-in">
      <PageHeader title="搜索" description="查找和筛选你的任务" />

      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索任务标题或描述..."
            className="input-base w-full pl-9 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-ghost flex items-center gap-1.5 text-sm ${
            hasFilters ? 'text-accent' : ''
          }`}
        >
          <SlidersHorizontal size={16} />
          筛选
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">
              {[filterPriority.length, filterStatus.length, filterTags.length, dateFrom ? 1 : 0, dateTo ? 1 : 0, query ? 1 : 0].reduce((a, b) => a + (b > 0 ? 1 : 0), 0)}
            </span>
          )}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost text-sm text-text-muted">
            清除
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-4 mb-4 animate-slide-up">
          <div className="space-y-4">
            {/* Priority */}
            <div>
              <span className="text-xs font-medium text-text-muted mb-2 block">优先级</span>
              <div className="flex gap-2">
                {([
                  { key: 'high' as Priority, label: '高' },
                  { key: 'medium' as Priority, label: '中' },
                  { key: 'low' as Priority, label: '低' },
                ]).map(({ key: p, label }) => (
                  <button
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={`badge text-xs transition-colors ${
                      filterPriority.includes(p)
                        ? p === 'high'
                          ? 'badge-high'
                          : p === 'medium'
                          ? 'badge-medium'
                          : 'badge-low'
                        : 'bg-surface-elevated text-text-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <span className="text-xs font-medium text-text-muted mb-2 block">状态</span>
              <div className="flex gap-2">
                {([
                  { key: 'in-progress' as TaskStatus, label: '进行中' },
                  { key: 'done' as TaskStatus, label: '已完成' },
                ]).map(({ key: s, label }) => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`badge text-xs transition-colors ${
                      filterStatus.includes(s)
                        ? 'bg-accent/15 text-accent'
                        : 'bg-surface-elevated text-text-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <span className="text-xs font-medium text-text-muted mb-2 block">标签</span>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`badge text-xs transition-colors ${
                        filterTags.includes(tag)
                          ? 'bg-accent/15 text-accent'
                          : 'bg-surface-elevated text-text-muted'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range */}
            <div>
              <span className="text-xs font-medium text-text-muted mb-2 block">日期范围</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input-base text-xs flex-1"
                />
                <span className="text-text-muted text-xs">至</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input-base text-xs flex-1"
                />
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                    className="text-text-muted hover:text-text-secondary p-1"
                    title="清除日期"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-xs text-text-muted mb-3">
        {results.length} 个结果
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="card p-12 text-center">
          <Search size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">
            {hasFilters ? '没有匹配的任务' : '输入关键词开始搜索'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {results.map((task) => (
            <div
              key={task.id}
              className={`card-hover p-3 flex items-center gap-3 group ${
                task.completed ? 'opacity-50' : ''
              }`}
            >
              <TaskCheckbox completed={task.completed} onToggle={() => toggleTask(task.id)} />
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                  {highlightMatch(task.title, query)}
                </span>
                {task.description && (
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                    {highlightMatch(task.description, query)}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`badge text-[10px] ${
                      task.priority === 'high'
                        ? 'badge-high'
                        : task.priority === 'medium'
                        ? 'badge-medium'
                        : 'badge-low'
                    }`}
                  >
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {task.status === 'todo' ? '待办' : task.status === 'in-progress' ? '进行中' : '已完成'}
                  </span>
                  {task.dueDate && (
                    <span className="text-[10px] text-text-muted">{task.dueDate}</span>
                  )}
                  {task.tags.map((tag) => (
                    <span key={tag} className="badge bg-surface-elevated text-text-muted text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all duration-200 p-1"
                title="删除任务"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-accent/30 text-accent-light rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
