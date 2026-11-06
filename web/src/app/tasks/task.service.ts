import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { CreateTaskInput, Task, TaskFilter } from './task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/tasks';

  readonly tasks = signal<Task[]>([]);
  readonly filter = signal<TaskFilter>('all');
  /** `null` means every category, including tasks without one. */
  readonly categoryFilter = signal<number | null>(null);

  load(): void {
    let params = new HttpParams();
    const filter = this.filter();
    if (filter !== 'all') {
      params = params.set('done', filter === 'done');
    }
    const categoryId = this.categoryFilter();
    if (categoryId !== null) {
      params = params.set('categoryId', categoryId);
    }
    this.http.get<Task[]>(this.apiUrl, { params }).subscribe((tasks) => this.tasks.set(tasks));
  }

  setFilter(filter: TaskFilter): void {
    this.filter.set(filter);
    this.load();
  }

  setCategoryFilter(categoryId: number | null): void {
    this.categoryFilter.set(categoryId);
    this.load();
  }

  create(input: CreateTaskInput): void {
    this.http.post<Task>(this.apiUrl, input).subscribe(() => this.load());
  }

  toggleDone(task: Task): void {
    this.http
      .patch<Task>(`${this.apiUrl}/${task.id}`, { done: !task.done })
      .subscribe(() => this.load());
  }

  setCategory(task: Task, categoryId: number | null): void {
    this.http
      .patch<Task>(`${this.apiUrl}/${task.id}`, { categoryId })
      .subscribe(() => this.load());
  }

  remove(task: Task): void {
    this.http.delete<void>(`${this.apiUrl}/${task.id}`).subscribe(() => this.load());
  }
}
