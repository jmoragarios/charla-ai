import { Component, OnInit, inject } from '@angular/core';
import { CategoryService } from '../../categories/category.service';
import { Task, TaskFilter } from '../task.model';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.html',
})
export class TaskList implements OnInit {
  protected readonly taskService = inject(TaskService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly filters: { value: TaskFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'done', label: 'Hechas' },
  ];

  ngOnInit(): void {
    this.taskService.load();
  }

  protected changeCategory(task: Task, value: string): void {
    this.taskService.setCategory(task, value ? Number(value) : null);
  }
}
