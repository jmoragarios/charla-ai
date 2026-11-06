import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Category } from '../../categories/category.model';
import { CategoryService } from '../../categories/category.service';
import { TaskService } from '../task.service';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  let fixture: ComponentFixture<TaskForm>;
  let element: HTMLElement;
  const taskService = { create: vi.fn() };
  const categories: Category[] = [
    {
      id: 3,
      name: 'Trabajo',
      color: '#539bf5',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const categoryService = { categories: signal<Category[]>(categories) };

  const type = (selector: string, value: string) => {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  const select = (selector: string, value: string) => {
    const el = element.querySelector<HTMLSelectElement>(selector)!;
    el.value = value;
    el.dispatchEvent(new Event('change'));
  };

  const submit = async () => {
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [
        { provide: TaskService, useValue: taskService },
        { provide: CategoryService, useValue: categoryService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('disables submit while the title is empty', () => {
    expect(element.querySelector<HTMLButtonElement>('button')?.disabled).toBe(true);
  });

  it('lists the categories plus a "no category" option', () => {
    const options = element.querySelectorAll('#category option');
    expect(Array.from(options).map((o) => o.textContent?.trim())).toEqual([
      'Sin categoría',
      'Trabajo',
    ]);
  });

  it('creates a task without category and clears the form', async () => {
    type('#title', '  Buy milk ');
    type('#description', 'Two liters');
    await fixture.whenStable();

    await submit();

    expect(taskService.create).toHaveBeenCalledWith({
      title: 'Buy milk',
      description: 'Two liters',
      categoryId: undefined,
    });
    expect(element.querySelector<HTMLInputElement>('#title')?.value).toBe('');
  });

  it('creates a task with the selected category and resets the select', async () => {
    type('#title', 'Report');
    select('#category', '3');
    await fixture.whenStable();

    await submit();

    expect(taskService.create).toHaveBeenCalledWith({
      title: 'Report',
      description: undefined,
      categoryId: 3,
    });
    expect(element.querySelector<HTMLSelectElement>('#category')?.value).toBe('');
  });
});
