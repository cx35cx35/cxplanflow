import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Modal from '@/components/ui/Modal';
import { useGoalStore } from '@/stores/goalStore';
import { Plus, Target, CheckCircle2, Circle, Trash2, X, Pencil, Calendar } from 'lucide-react';
import type { Goal } from '@/types';

export default function Goals() {
  const { goals, addGoal, deleteGoal, addMilestone, toggleMilestone, deleteMilestone, updateGoal, updateMilestone } = useGoalStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<{ goalId: string; milestoneId: string; title: string; description: string; date: string } | null>(null);

  const handleAddGoal = () => {
    if (!title.trim()) return;
    addGoal(title.trim(), { description: description.trim() || undefined });
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  const handleAddMilestone = (goalId: string) => {
    if (!newMilestone.trim()) return;
    addMilestone(goalId, newMilestone.trim(), undefined, newMilestoneDate || undefined);
    setNewMilestone('');
    setNewMilestoneDate('');
  };

  const handleSaveGoal = (id: string, updates: Partial<Goal>) => {
    updateGoal(id, updates);
    setEditingGoal(null);
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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="长期目标"
        description={`${goals.filter((g) => g.status === 'active').length} 个进行中的目标`}
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> 新建目标
          </button>
        }
      />

      {/* Add Goal Form */}
      {showForm && (
        <div className="card p-5 mb-6 animate-slide-up">
          <div className="space-y-3">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="目标名称"
              className="input-base w-full text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述（可选）"
              rows={2}
              className="input-base w-full text-sm resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleAddGoal} className="btn-primary text-sm">
                创建目标
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="card p-12 text-center">
          <Target size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">还没有目标，创建一个开始追踪进度吧。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const total = goal.milestones.length;
            const done = goal.milestones.filter((m) => m.completed).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const expanded = expandedId === goal.id;

            return (
              <div key={goal.id} className="card p-5 transition-all duration-200 hover:border-surface-hover">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 cursor-pointer"
                    style={{ backgroundColor: `${goal.color}20` }}
                    onClick={() => setExpandedId(expanded ? null : goal.id)}
                  >
                    {goal.icon || '🎯'}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(expanded ? null : goal.id)}>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">{goal.title}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGoal(goal);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent transition-all p-0.5"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{goal.description}</p>
                    )}
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-text-muted">{done}/{total} 个里程碑</span>
                        <span className="text-[11px] font-medium" style={{ color: goal.color }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: goal.color }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGoal(goal);
                      }}
                      className="text-text-muted hover:text-accent transition-colors p-1"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGoal(goal.id);
                      }}
                      className="text-text-muted hover:text-danger transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded: Milestones */}
                {expanded && (
                  <div className="mt-4 pt-4 border-t border-surface-border animate-slide-up">
                    <div className="space-y-2 mb-3">
                      {goal.milestones.map((m) => (
                        <div key={m.id} className="flex items-start gap-2 group">
                          <button
                            onClick={() => toggleMilestone(goal.id, m.id)}
                            className="shrink-0 mt-0.5"
                          >
                            {m.completed ? (
                              <CheckCircle2 size={16} className="text-green-400" />
                            ) : (
                              <Circle size={16} className="text-text-muted hover:text-accent transition-colors" />
                            )}
                          </button>
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() =>
                              setEditingMilestone({ goalId: goal.id, milestoneId: m.id, title: m.title, description: m.description || '', date: m.date || '' })
                            }
                          >
                            <span
                              className={`text-sm ${
                                m.completed ? 'line-through text-text-muted' : 'text-text-primary'
                              }`}
                            >
                              {m.title}
                            </span>
                            {m.description && (
                              <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{m.description}</p>
                            )}
                            {m.date && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-1">
                                <Calendar size={10} />
                                {formatDateShort(m.date)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              setEditingMilestone({ goalId: goal.id, milestoneId: m.id, title: m.title, description: m.description || '', date: m.date || '' })
                            }
                            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent transition-all"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => deleteMilestone(goal.id, m.id)}
                            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={expandedId === goal.id ? newMilestone : ''}
                          onChange={(e) => setNewMilestone(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(goal.id)}
                          placeholder="添加里程碑..."
                          className="input-base flex-1 text-xs"
                        />
                        <button
                          onClick={() => handleAddMilestone(goal.id)}
                          className="btn-primary text-xs px-3"
                        >
                          添加
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-text-muted shrink-0" />
                        <input
                          type="date"
                          value={newMilestoneDate}
                          onChange={(e) => setNewMilestoneDate(e.target.value)}
                          className="input-base text-xs"
                          placeholder="选择日期（可选）"
                        />
                        {newMilestoneDate && (
                          <button
                            onClick={() => setNewMilestoneDate('')}
                            className="text-text-muted hover:text-text-secondary p-0.5"
                            title="清除日期"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Status toggle */}
                    <div className="flex gap-2 mt-3">
                      {([
                        { key: 'active' as const, label: '进行中' },
                        { key: 'paused' as const, label: '已暂停' },
                        { key: 'completed' as const, label: '已完成' },
                      ]).map(({ key: s, label }) => (
                        <button
                          key={s}
                          onClick={() => updateGoal(goal.id, { status: s, completedAt: s === 'completed' ? new Date().toISOString() : undefined })}
                          className={`text-xs px-2 py-1 rounded-md transition-colors ${
                            goal.status === s
                              ? 'bg-accent/15 text-accent'
                              : 'text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Edit Modal */}
      <GoalEditModal
        goal={editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleSaveGoal}
      />

      {/* Milestone Edit Modal */}
      <Modal
        open={!!editingMilestone}
        onClose={() => setEditingMilestone(null)}
        title="编辑里程碑"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">标题</label>
            <input
              autoFocus
              value={editingMilestone?.title || ''}
              onChange={(e) =>
                setEditingMilestone((prev) => (prev ? { ...prev, title: e.target.value } : null))
              }
              className="input-base w-full text-sm"
              placeholder="里程碑标题"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">描述</label>
            <textarea
              value={editingMilestone?.description || ''}
              onChange={(e) =>
                setEditingMilestone((prev) => (prev ? { ...prev, description: e.target.value } : null))
              }
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
                onChange={(e) =>
                  setEditingMilestone((prev) => (prev ? { ...prev, date: e.target.value } : null))
                }
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

/* ==================== GOAL EDIT MODAL ==================== */
function GoalEditModal({
  goal,
  onClose,
  onSave,
}: {
  goal: Goal | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Goal>) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setTargetDate(goal.targetDate || '');
    }
  }, [goal]);

  if (!goal) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(goal.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
    });
    setTitle('');
    setDescription('');
    setTargetDate('');
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setTargetDate('');
    onClose();
  };

  return (
    <Modal open={!!goal} onClose={handleClose} title="编辑目标">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-text-muted mb-1.5 block">目标名称</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-base w-full text-sm"
            placeholder="目标名称"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-muted mb-1.5 block">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-base w-full text-sm resize-none"
            placeholder="目标描述（可选）"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-muted mb-1.5 block">目标日期</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="input-base w-full text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={handleClose} className="btn-ghost text-sm">
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

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
