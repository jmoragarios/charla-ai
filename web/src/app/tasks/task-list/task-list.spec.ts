import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Category } from '../../categories/category.model';
import { CategoryService } from '../../categories/category.service';
import { Task, TaskFilter } from '../task.model';
import { TaskService } from '../task.service';
import { TaskList } from './task-list';

describe('TaskList', () => {
  let fixture: ComponentFixture<TaskList>;
  let element: HTMLElement;

  const category: Category = {
    id: 3,
    name: 'Trabajo',
    color: '#539bf5',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Pending task',
      description: 'Some details',
      done: false,
      categoryId: 3,
      category,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      title: 'Done task',
      description: null,
      done: true,
      categoryId: null,
      category: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const taskService = {
    tasks: signal<Task[]>([]),
    filter: signal<TaskFilter>('all'),
    categoryFilter: signal<number | null>(null),
    load: vi.fn(),
    setFilter: vi.fn(),
    setCategoryFilter: vi.fn(),
    setCategory: vi.fn(),
    toggleDone: vi.fn(),
    remove: vi.fn(),
  };
  const categoryService = { categories: signal<Category[]>([]) };

  beforeEach(async () => {
    vi.resetAllMocks();
    taskService.tasks.set(tasks);
    taskService.filter.set('all');
    taskService.categoryFilter.set(null);
    categoryService.categories.set([category]);

    await TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [
        { provide: TaskService, useValue: taskService },
        { provide: CategoryService, useValue: categoryService },
      ],
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

  it('shows the category chip only for tasks with a category', () => {
    const items = element.querySelectorAll('.tasks li');
    const chip = items[0].querySelector<HTMLElement>('.category-chip');
    expect(chip?.textContent).toContain('Trabajo');
    expect(chip?.style.getPropertyValue('--chip-color')).toBe('#539bf5');
    expect(items[1].querySelector('.category-chip')).toBeNull();
  });

  it('preselects the current category of each task', () => {
    const selects = element.querySelectorAll<HTMLSelectElement>('.tasks .task-category');
    expect(selects[0].value).toBe('3');
    expect(selects[1].value).toBe('');
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

  it('filters by category and clears the category filter', () => {
    const buttons = element.querySelectorAll<HTMLButtonElement>('.category-filters button');
    expect(buttons).toHaveLength(2);

    buttons[1].click();
    expect(taskService.setCategoryFilter).toHaveBeenCalledWith(3);

    buttons[0].click();
    expect(taskService.setCategoryFilter).toHaveBeenCalledWith(null);
  });

  it('hides the category filters when there are no categories', async () => {
    categoryService.categories.set([]);
    await fixture.whenStable();

    expect(element.querySelector('.category-filters')).toBeNull();
  });

  it('changes the category of a task', () => {
    const selects = element.querySelectorAll<HTMLSelectElement>('.tasks .task-category');

    selects[1].value = '3';
    selects[1].dispatchEvent(new Event('change'));
    expect(taskService.setCategory).toHaveBeenCalledWith(tasks[1], 3);

    selects[0].value = '';
    selects[0].dispatchEvent(new Event('change'));
    expect(taskService.setCategory).toHaveBeenCalledWith(tasks[0], null);
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
