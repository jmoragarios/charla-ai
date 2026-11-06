import { Component } from '@angular/core';
import { TaskForm } from './tasks/task-form/task-form';
import { TaskList } from './tasks/task-list/task-list';

@Component({
  selector: 'app-root',
  imports: [TaskForm, TaskList],
  template: `
    <main>
      <h1>Tareas</h1>
      <app-task-form />
      <app-task-list />
    </main>
  `,
})
export class App {}
