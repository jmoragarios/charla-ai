import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { TaskService } from '../tasks/task.service';
import { Category, CreateCategoryInput } from './category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly taskService = inject(TaskService);
  private readonly apiUrl = '/categories';

  readonly categories = signal<Category[]>([]);

  load(): void {
    this.http.get<Category[]>(this.apiUrl).subscribe((categories) => this.categories.set(categories));
  }

  create(input: CreateCategoryInput): void {
    this.http.post<Category>(this.apiUrl, input).subscribe(() => this.load());
  }

  /** Tasks in the category are kept; the API leaves them without a category. */
  remove(category: Category): void {
    this.http.delete<void>(`${this.apiUrl}/${category.id}`).subscribe(() => {
      this.load();
      if (this.taskService.categoryFilter() === category.id) {
        this.taskService.setCategoryFilter(null);
      } else {
        this.taskService.load();
      }
    });
  }
}
