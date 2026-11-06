import { Component, OnInit, inject } from '@angular/core';
import { TaskFilter } from '../task.model';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.html',
})
export class TaskList implements OnInit {
  protected readonly taskService = inject(TaskService);
  protected readonly filters: { value: TaskFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'done', label: 'Hechas' },
  ];

  ngOnInit(): void {
    this.taskService.load();
  }
}
