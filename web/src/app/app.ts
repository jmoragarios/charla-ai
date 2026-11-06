import { Component } from '@angular/core';
import { CategoryManager } from './categories/category-manager/category-manager';
import { TaskForm } from './tasks/task-form/task-form';
import { TaskList } from './tasks/task-list/task-list';

@Component({
  selector: 'app-root',
  imports: [CategoryManager, TaskForm, TaskList],
  template: `
    <main>
      <h1>Tareas</h1>
      <app-task-form />
      <app-task-list />
      <app-category-manager />
    </main>
  `,
})
export class App {}
