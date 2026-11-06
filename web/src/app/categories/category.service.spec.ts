import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TaskService } from '../tasks/task.service';
import { Category } from './category.model';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let http: HttpTestingController;

  const category: Category = {
    id: 3,
    name: 'Trabajo',
    color: '#539bf5',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  const taskService = {
    categoryFilter: signal<number | null>(null),
    load: vi.fn(),
    setCategoryFilter: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    taskService.categoryFilter.set(null);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TaskService, useValue: taskService },
      ],
    });
    service = TestBed.inject(CategoryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads categories into the categories signal', () => {
    service.load();

    http.expectOne('/categories').flush([category]);

    expect(service.categories()).toEqual([category]);
  });

  it('creates a category and reloads', () => {
    service.create({ name: 'Trabajo', color: '#539bf5' });

    const req = http.expectOne('/categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Trabajo', color: '#539bf5' });
    req.flush(category);
    http.expectOne('/categories').flush([category]);
  });

  it('removes a category and reloads categories and tasks', () => {
    service.remove(category);

    const req = http.expectOne('/categories/3');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    http.expectOne('/categories').flush([]);

    expect(taskService.load).toHaveBeenCalled();
    expect(taskService.setCategoryFilter).not.toHaveBeenCalled();
  });

  it('resets the category filter when the filtered category is removed', () => {
    taskService.categoryFilter.set(3);

    service.remove(category);

    http.expectOne('/categories/3').flush(null);
    http.expectOne('/categories').flush([]);

    expect(taskService.setCategoryFilter).toHaveBeenCalledWith(null);
    expect(taskService.load).not.toHaveBeenCalled();
  });
});
