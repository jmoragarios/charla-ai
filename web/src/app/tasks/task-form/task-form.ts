import { Component, computed, inject, signal } from '@angular/core';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.html',
})
export class TaskForm {
  private readonly taskService = inject(TaskService);

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly canSubmit = computed(() => this.title().trim().length > 0);

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) {
      return;
    }
    this.taskService.create({
      title: this.title().trim(),
      description: this.description().trim() || undefined,
    });
    this.title.set('');
    this.description.set('');
  }
}
