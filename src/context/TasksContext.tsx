import React, { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react';
import type { TaskItem } from '../types';
import { loadTasks, saveTasks } from '../utils/storage';
import { generateId } from '../utils/formatters';

interface TasksContextType {
  tasks: TaskItem[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  addTask: (title: string) => TaskItem;
  updateTask: (id: string, updates: Partial<Omit<TaskItem, 'id' | 'createdAt'>>) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompletedTasks: () => void;
  getTaskById: (id: string | null | undefined) => TaskItem | undefined;
}

const TasksContext = createContext<TasksContextType | null>(null);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadTasks());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Save tasks on changes
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Clean up selectedTaskId if task is deleted
  useEffect(() => {
    if (selectedTaskId && !tasks.some(t => t.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [tasks, selectedTaskId]);

  const addTask = useCallback((title: string): TaskItem => {
    const trimmed = title.trim();
    const newTask: TaskItem = {
      id: generateId(),
      title: trimmed || 'Untitled focus task',
      isCompleted: false,
      createdAt: Date.now(),
    };
    startTransition(() => {
      setTasks(prev => [newTask, ...prev]);
    });
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<TaskItem, 'id' | 'createdAt'>>) => {
    startTransition(() => {
      setTasks(prev =>
        prev.map(task => {
          if (task.id === id) {
            return {
              ...task,
              ...updates,
              title: updates.title !== undefined ? updates.title.trim() : task.title,
            };
          }
          return task;
        })
      );
    });
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    startTransition(() => {
      setTasks(prev =>
        prev.map(task => {
          if (task.id === id) {
            const nextCompleted = !task.isCompleted;
            return {
              ...task,
              isCompleted: nextCompleted,
              completedAt: nextCompleted ? Date.now() : undefined,
            };
          }
          return task;
        })
      );
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    startTransition(() => {
      setTasks(prev => prev.filter(task => task.id !== id));
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
    });
  }, [selectedTaskId]);

  const clearCompletedTasks = useCallback(() => {
    startTransition(() => {
      setTasks(prev => prev.filter(task => !task.isCompleted));
    });
  }, []);

  const getTaskById = useCallback((id: string | null | undefined): TaskItem | undefined => {
    if (!id) return undefined;
    return tasks.find(t => t.id === id);
  }, [tasks]);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        selectedTaskId,
        setSelectedTaskId,
        addTask,
        updateTask,
        toggleTaskCompletion,
        deleteTask,
        clearCompletedTasks,
        getTaskById,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export function useTasks(): TasksContextType {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return ctx;
}
