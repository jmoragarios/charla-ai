import { Category } from '../categories/category.model';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  done: boolean;
  categoryId: number | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  categoryId?: number;
}

export type TaskFilter = 'all' | 'pending' | 'done';
