import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/stores/taskStore';
import TaskCheckbox from '@/components/ui/TaskCheckbox';
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Tag,
  Flag,
} from 'lucide-react';
import type { Priority, TaskStatus } from '@/types';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, updateTask, toggleTask, deleteTask } = useTaskStore();

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setTagsInput(task.tags.join(', '));
      setStatus(task.status);
    }
  }, [task]);

  if (!task) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm flex items-center gap-1.5 mb-4">
          <ArrowLeft size={16} /> 返回
        </button>
        <div className="card p-12 text-center">
          <p className="text-sm text-text-muted">任务不存在</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!title.trim()) return;
    const tags = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      tags,
      status,
      completed: status === 'done',
      completedAt: status === 'done' ? new Date().toISOString() : undefined,
    });
  };

  const handleDelete = () => {
    deleteTask(task.id);
    navigate(-1);
  };

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const priorityLabel = { high: '高', medium: '中', low: '低' };
  const priorityColor = {
    high: 'bg-red-500/15 text-red-400',
    medium: 'bg-yellow-500/15 text-yellow-400',
    low: 'bg-blue-500/15 text-blue-400',
  };
  const statusLabel = { todo: '待办', 'in-progress': '进行中', done: '已完成' };
  const statusColor = {
    todo: 'bg-surface-elevated text-text-muted',
    'in-progress': 'bg-yellow-500/15 text-yellow-400',
    done: 'bg-green-500/15 text-green-400',
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm flex items-center gap-1.5 mb-4">
        <ArrowLeft size={16} /> 返回
      </button>

      {/* Task Header */}
      <div className="card p-4 md:p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <TaskCheckbox completed={task.completed} onToggle={handleToggle} size="lg" />
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge text-xs ${priorityColor[task.priority]}`}>
                <Flag size={10} className="mr-1" />
                {priorityLabel[task.priority]}优先级
              </span>
              <span className={`badge text-xs ${statusColor[task.status]}`}>
                {statusLabel[task.status]}
              </span>
            </div>
          </div>
          <button onClick={handleDelete} className="text-text-muted hover:text-danger transition-colors p-2">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">标题</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="input-base w-full text-base font-medium"
              placeholder="任务标题"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              rows={4}
              className="input-base w-full text-sm resize-none"
              placeholder="添加描述..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 flex items-center gap-1">
                <Flag size={11} /> 优先级
              </label>
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value as Priority); }}
                onBlur={handleSave}
                className="input-base w-full text-sm"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 flex items-center gap-1">
                <Calendar size={11} /> 截止日期
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onBlur={handleSave}
                className="input-base w-full text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 block">状态</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as TaskStatus); }}
                onBlur={handleSave}
                className="input-base w-full text-sm"
              >
                <option value="todo">待办</option>
                <option value="in-progress">进行中</option>
                <option value="done">已完成</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1.5 flex items-center gap-1">
                <Tag size={11} /> 标签
              </label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onBlur={handleSave}
                className="input-base w-full text-sm"
                placeholder="用逗号分隔"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="card p-4 flex items-center gap-4 text-xs text-text-muted">
        <span>创建于 {new Date(task.createdAt).toLocaleDateString('zh-CN')}</span>
        {task.completedAt && (
          <span>完成于 {new Date(task.completedAt).toLocaleDateString('zh-CN')}</span>
        )}
      </div>
    </div>
  );
}
