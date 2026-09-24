import React, { useState } from 'react';
import { Plus, Check, Trash2, Edit3, Circle, CheckCircle2, Bookmark } from 'lucide-react';
import { useTasks } from '../context/TasksContext';
import { cn } from '../utils/formatters';

export const TaskList: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    clearCompletedTasks,
  } = useTasks();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = addTask(newTitle);
    if (!selectedTaskId) {
      setSelectedTaskId(created.id);
    }
    setNewTitle('');
  };

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveEdit = (id: string) => {
    if (editingTitle.trim()) {
      updateTask(id, { title: editingTitle });
    }
    setEditingId(null);
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;

  return (
    <div className="flex flex-col h-full bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--text-app)]">
          Tasks
        </h2>
        {completedCount > 0 && (
          <div className="relative">
            {showClearConfirm ? (
              <div className="flex items-center gap-1.5 text-xs bg-[var(--surface-hover)] px-2 py-1 rounded-md border border-[var(--border-app)]">
                <span className="text-[var(--text-muted)]">Clear {completedCount}?</span>
                <button
                  onClick={() => {
                    clearCompletedTasks();
                    setShowClearConfirm(false);
                  }}
                  className="text-red-600 hover:underline font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[var(--text-subtle)] hover:underline"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors"
                title="Clear completed tasks"
              >
                Clear done ({completedCount})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task input form */}
      <form onSubmit={handleCreate} className="relative mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add an intention or task..."
          className="w-full text-xs py-2 pl-3 pr-8 bg-[var(--surface-hover)] border border-[var(--border-app)] rounded-lg text-[var(--text-app)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-app)]"
          aria-label="New task title"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-subtle)] hover:text-[var(--accent-app)] disabled:opacity-30 disabled:hover:text-[var(--text-subtle)]"
          aria-label="Add task"
        >
          <Plus size={15} />
        </button>
      </form>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-3 text-[11px]">
        {(['all', 'active', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'px-2.5 py-1 rounded-md capitalize transition-colors',
              filter === tab
                ? 'bg-[var(--sage-muted)] text-[var(--text-app)] font-medium'
                : 'text-[var(--text-subtle)] hover:text-[var(--text-app)]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks list scroll area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[360px]">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-[var(--text-subtle)]">
            <p>No tasks here yet.</p>
            <p className="mt-1 text-[11px] opacity-75">Keep your list small and deliberate.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isSelected = selectedTaskId === task.id;
            return (
              <div
                key={task.id}
                className={cn(
                  'group flex items-center justify-between p-2.5 rounded-lg border transition-all duration-150',
                  isSelected
                    ? 'bg-[var(--accent-light)] border-[var(--accent-app)] shadow-2xs'
                    : 'bg-[var(--surface-app)] border-[var(--border-app)] hover:border-[var(--border-app)]'
                )}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="text-[var(--text-subtle)] hover:text-[var(--accent-app)] transition-colors shrink-0"
                    title={task.isCompleted ? 'Mark active' : 'Mark completed'}
                    aria-label={task.isCompleted ? 'Mark active' : 'Mark completed'}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 size={16} className="text-[var(--accent-app)]" />
                    ) : (
                      <Circle size={16} />
                    )}
                  </button>

                  {editingId === task.id ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit(task.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="w-full text-xs py-1 px-1.5 bg-[var(--surface-hover)] border border-[var(--accent-app)] rounded text-[var(--text-app)] focus:outline-none"
                      />
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="text-[var(--accent-app)] p-1 hover:bg-[var(--surface-hover)] rounded"
                        aria-label="Save task edit"
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                      className={cn(
                        'text-xs cursor-pointer truncate select-none',
                        task.isCompleted
                          ? 'line-through text-[var(--text-subtle)]'
                          : 'text-[var(--text-app)]'
                      )}
                      title="Click to focus on this task in timer"
                    >
                      {task.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {/* Select for session toggle */}
                  <button
                    onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                    className={cn(
                      'p-1 rounded text-xs transition-colors',
                      isSelected
                        ? 'text-[var(--accent-app)] bg-[var(--surface-app)] font-medium'
                        : 'text-[var(--text-subtle)] hover:text-[var(--text-app)]'
                    )}
                    title={isSelected ? 'Remove from current session' : 'Select for current session'}
                    aria-label={isSelected ? 'Remove from current session' : 'Select for current session'}
                  >
                    <Bookmark size={13} fill={isSelected ? 'currentColor' : 'none'} />
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => startEdit(task.id, task.title)}
                    className="p-1 text-[var(--text-subtle)] hover:text-[var(--text-app)] rounded"
                    title="Edit task title"
                    aria-label="Edit task"
                  >
                    <Edit3 size={13} />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-[var(--text-subtle)] hover:text-red-500 rounded"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-subtle)] flex items-center justify-between">
        <span>Click bookmark to bind task to timer</span>
        <span>{tasks.filter(t => !t.isCompleted).length} remaining</span>
      </div>
    </div>
  );
};
