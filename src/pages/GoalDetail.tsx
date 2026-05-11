import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useGoalStore } from '@/stores/goalStore';
import {
  ArrowLeft,
  Target,
  CheckCircle2,
  Circle,
  Pencil,
  X,
  Calendar,
  Clock,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { goals, updateGoal, addMilestone, toggleMilestone, deleteMilestone, updateMilestone } = useGoalStore();

  const goal = goals.find((g) => g.id === id);

  const [newMilestone, setNewMilestone] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editingMilestone, setEditingMilestone] = useState<{
    goalId: string;
    milestoneId: string;
    title: string;
    description: string;
    date: string;
  } | null>(null);

  // Auto-scroll to milestone
  const milestoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  useEffect(() => {
    const mId = searchParams.get('milestone');
    if (mId && milestoneRefs.current.has(mId)) {
      setTimeout(() => {
        milestoneRefs.current.get(mId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [searchParams]);

  if (!goal) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm flex items-center gap-1.5 mb-4">
          <ArrowLeft size={16} /> 返回
        </button>
        <div className="card p-12 text-center">
          <Target size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">目标不存在</p>
        </div>
      </div>
    );
  }

  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const daysRemaining = goal.targetDate ? getDaysRemaining(goal.targetDate) : null;

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    addMilestone(goal.id, newMilestone.trim(), undefined, newMilestoneDate || undefined);
    setNewMilestone('');
    setNewMilestoneDate('');
  };

  const handleSaveMilestone = () => {
    if (!editingMilestone || !editingMilestone.title.trim()) return;
    updateMilestone(editingMilestone.goalId, editingMilestone.milestoneId, {
      title: editingMilestone.title.trim(),
      description: editingMilestone.description.trim() || undefined,
      date: editingMilestone.date || undefined,
    });
    setEditingMilestone(null);
  };

  const handleStartEditGoal = () => {
    setEditTitle(goal.title);
    setEditDescription(goal.description || '');
    setEditTargetDate(goal.targetDate || '');
    setEditingGoal(true);
  };

  const handleSaveGoal = () => {
    if (!editTitle.trim()) return;
    updateGoal(goal.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      targetDate: editTargetDate || undefined,
    });
    setEditingGoal(false);
  };

  const handleCancelEditGoal = () => {
    setEditingGoal(false);
  };

  const statusLabel = { active: '进行中', paused: '已暂停', completed: '已完成' };
  const statusColor = {
    active: 'bg-green-500/15 text-green-400',
    paused: 'bg-yellow-500/15 text-yellow-400',
    completed: 'bg-accent/15 text-accent',
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm flex items-center gap-1.5 mb-4">
        <ArrowLeft size={16} /> 返回
      </button>

      {/* Goal Header */}
      <div className="card p-6 mb-6">
        {editingGoal ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 block">目标名称</label>
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input-base w-full text-base font-medium"
                placeholder="目标名称"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 block">描述</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="input-base w-full text-sm resize-none"
                placeholder="目标描述（可选）"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 flex items-center gap-1">
                <Calendar size={11} /> 目标日期
              </label>
              <input
                type="date"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
                className="input-base w-full text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={handleCancelEditGoal} className="btn-ghost text-sm">
                取消
              </button>
              <button onClick={handleSaveGoal} className="btn-primary text-sm">
                保存
              </button>
            </div>
          </div>
        ) : (
        <>
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {goal.icon || '🎯'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-text-primary">{goal.title}</h1>
              <span className={`badge text-xs ${statusColor[goal.status]}`}>
                {statusLabel[goal.status]}
              </span>
              <button
                onClick={handleStartEditGoal}
                className="text-text-muted hover:text-accent transition-colors p-1 ml-1"
                title="编辑目标"
              >
                <Pencil size={16} />
              </button>
            </div>
            {goal.description && (
              <p className="text-sm text-text-secondary mt-1">{goal.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
              {goal.targetDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  目标日期：{formatDateFull(goal.targetDate)}
                </span>
              )}
              {daysRemaining !== null && (
                <span className={`flex items-center gap-1 ${daysRemaining < 0 ? 'text-danger' : daysRemaining <= 7 ? 'text-warning' : ''}`}>
                  <Clock size={13} />
                  {daysRemaining < 0
                    ? `已逾期 ${Math.abs(daysRemaining)} 天`
                    : daysRemaining === 0
                    ? '今天到期'
                    : `剩余 ${daysRemaining} 天`}
                </span>
              )}
              <span>{done}/{total} 个里程碑</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">完成进度</span>
            <span className="text-sm font-semibold" style={{ color: goal.color }}>
              {pct}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: goal.color }}
            />
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex gap-2 mt-4">
          {([
            { key: 'active' as const, label: '进行中' },
            { key: 'paused' as const, label: '已暂停' },
            { key: 'completed' as const, label: '已完成' },
          ]).map(({ key: s, label }) => (
            <button
              key={s}
              onClick={() =>
                updateGoal(goal.id, {
                  status: s,
                  completedAt: s === 'completed' ? new Date().toISOString() : undefined,
                })
              }
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                goal.status === s
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Milestones */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-text-primary mb-4">里程碑</h2>

        {goal.milestones.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">还没有里程碑，添加一个开始吧。</p>
        ) : (
          <div className="space-y-2 mb-4">
            {goal.milestones.map((m) => (
              <div
                key={m.id}
                ref={(el) => {
                  if (el) milestoneRefs.current.set(m.id, el);
                  else milestoneRefs.current.delete(m.id);
                }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors group"
                id={`milestone-${m.id}`}
              >
                <button onClick={() => toggleMilestone(goal.id, m.id)} className="shrink-0 mt-0.5">
                  {m.completed ? (
                    <CheckCircle2 size={18} className="text-green-400" />
                  ) : (
                    <Circle size={18} className="text-text-muted hover:text-accent transition-colors" />
                  )}
                </button>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() =>
                    setEditingMilestone({
                      goalId: goal.id,
                      milestoneId: m.id,
                      title: m.title,
                      description: m.description || '',
                      date: m.date || '',
                    })
                  }
                >
                  <span className={`text-sm font-medium ${m.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {m.title}
                  </span>
                  {m.description && (
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{m.description}</p>
                  )}
                  {m.date && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-1">
                      <Calendar size={10} />
                      {formatDateFull(m.date)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    setEditingMilestone({
                      goalId: goal.id,
                      milestoneId: m.id,
                      title: m.title,
                      description: m.description || '',
                      date: m.date || '',
                    })
                  }
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent transition-all p-1"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteMilestone(goal.id, m.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all p-1"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Milestone */}
        <div className="pt-3 border-t border-surface-border space-y-2">
          <div className="flex gap-2">
            <input
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
              placeholder="添加里程碑..."
              className="input-base flex-1 text-sm"
            />
            <button onClick={handleAddMilestone} className="btn-primary text-sm px-4">
              添加
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-text-muted shrink-0" />
            <input
              type="date"
              value={newMilestoneDate}
              onChange={(e) => setNewMilestoneDate(e.target.value)}
              className="input-base text-sm"
              placeholder="选择日期（可选）"
            />
            {newMilestoneDate && (
              <button
                onClick={() => setNewMilestoneDate('')}
                className="text-text-muted hover:text-text-secondary p-1"
                title="清除日期"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Edit Modal */}
      <Modal open={!!editingMilestone} onClose={() => setEditingMilestone(null)} title="编辑里程碑">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">标题</label>
            <input
              autoFocus
              value={editingMilestone?.title || ''}
              onChange={(e) => setEditingMilestone((prev) => (prev ? { ...prev, title: e.target.value } : null))}
              className="input-base w-full text-sm"
              placeholder="里程碑标题"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">描述</label>
            <textarea
              value={editingMilestone?.description || ''}
              onChange={(e) => setEditingMilestone((prev) => (prev ? { ...prev, description: e.target.value } : null))}
              rows={3}
              className="input-base w-full text-sm resize-none"
              placeholder="里程碑描述（可选）"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 flex items-center gap-1">
              <Calendar size={11} /> 日期
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={editingMilestone?.date || ''}
                onChange={(e) => setEditingMilestone((prev) => (prev ? { ...prev, date: e.target.value } : null))}
                className="input-base flex-1 text-sm"
              />
              {editingMilestone?.date && (
                <button
                  onClick={() => setEditingMilestone((prev) => (prev ? { ...prev, date: '' } : null))}
                  className="text-text-muted hover:text-text-secondary p-1"
                  title="清除日期"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditingMilestone(null)} className="btn-ghost text-sm">
              取消
            </button>
            <button onClick={handleSaveMilestone} className="btn-primary text-sm">
              保存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function getDaysRemaining(targetDate: string): number {
  const target = new Date(targetDate);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
