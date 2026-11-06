import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskService } from '../task.service';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  let fixture: ComponentFixture<TaskForm>;
  let element: HTMLElement;
  const taskService = { create: vi.fn() };

  const type = (selector: string, value: string) => {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [{ provide: TaskService, useValue: taskService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('disables submit while the title is empty', () => {
    expect(element.querySelector<HTMLButtonElement>('button')?.disabled).toBe(true);
  });

  it('creates a task and clears the form', async () => {
    type('#title', '  Buy milk ');
    type('#description', 'Two liters');
    await fixture.whenStable();

    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(taskService.create).toHaveBeenCalledWith({
      title: 'Buy milk',
      description: 'Two liters',
    });
    expect(element.querySelector<HTMLInputElement>('#title')?.value).toBe('');
  });
});
