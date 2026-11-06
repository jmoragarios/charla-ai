import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Task, TaskFilter } from '../task.model';
import { TaskService } from '../task.service';
import { TaskList } from './task-list';

describe('TaskList', () => {
  let fixture: ComponentFixture<TaskList>;
  let element: HTMLElement;

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Pending task',
      description: 'Some details',
      done: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      title: 'Done task',
      description: null,
      done: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const taskService = {
    tasks: signal<Task[]>([]),
    filter: signal<TaskFilter>('all'),
    load: vi.fn(),
    setFilter: vi.fn(),
    toggleDone: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    taskService.tasks.set(tasks);
    taskService.filter.set('all');

    await TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [{ provide: TaskService, useValue: taskService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskList);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('loads tasks on init', () => {
    expect(taskService.load).toHaveBeenCalled();
  });

  it('renders the tasks', () => {
    const items = element.querySelectorAll('.tasks li');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('Pending task');
    expect(items[0].textContent).toContain('Some details');
    expect(items[1].classList).toContain('done');
  });

  it('shows an empty message when there are no tasks', async () => {
    taskService.tasks.set([]);
    await fixture.whenStable();

    expect(element.querySelector('.empty')?.textContent).toContain('No hay tareas');
  });

  it('changes the filter', () => {
    const buttons = element.querySelectorAll<HTMLButtonElement>('.filters button');
    buttons[2].click();

    expect(taskService.setFilter).toHaveBeenCalledWith('done');
  });

  it('toggles a task as done', () => {
    element.querySelector<HTMLInputElement>('.tasks input[type=checkbox]')?.click();

    expect(taskService.toggleDone).toHaveBeenCalledWith(tasks[0]);
  });

  it('removes a task', () => {
    element.querySelector<HTMLButtonElement>('.tasks .delete')?.click();

    expect(taskService.remove).toHaveBeenCalledWith(tasks[0]);
  });
});
