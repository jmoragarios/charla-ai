import { Component, computed, inject, signal } from '@angular/core';
import { CategoryService } from '../../categories/category.service';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.html',
})
export class TaskForm {
  private readonly taskService = inject(TaskService);
  protected readonly categoryService = inject(CategoryService);

  protected readonly title = signal('');
  protected readonly description = signal('');
  /** Empty string means "no category" (the value of the first option). */
  protected readonly categoryId = signal('');
  protected readonly canSubmit = computed(() => this.title().trim().length > 0);

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) {
      return;
    }
    this.taskService.create({
      title: this.title().trim(),
      description: this.description().trim() || undefined,
      categoryId: this.categoryId() ? Number(this.categoryId()) : undefined,
    });
    this.title.set('');
    this.description.set('');
    this.categoryId.set('');
  }
}
