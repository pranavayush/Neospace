import { Task } from '../types';

const STORAGE_KEY = 'neonotex_tasks_v1';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse tasks from localStorage', e);
  }
  return [];
};

const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    await delay(100);
    return getTasks();
  },

  getById: async (id: string): Promise<Task | undefined> => {
    await delay(50);
    const tasks = getTasks();
    return tasks.find(t => t.id === id);
  },

  create: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<Task> => {
    await delay(100);
    const tasks = getTasks();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    await delay(100);
    const tasks = getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    tasks[index] = updatedTask;
    saveTasks(tasks);
    return updatedTask;
  },

  delete: async (id: string): Promise<void> => {
    await delay(100);
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
  }
};
