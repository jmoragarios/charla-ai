import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Task } from './task.model';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;

  const task: Task = {
    id: 1,
    title: 'Write tests',
    description: null,
    done: false,
    categoryId: null,
    category: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads all tasks into the tasks signal', () => {
    service.load();

    http.expectOne('/tasks').flush([task]);

    expect(service.tasks()).toEqual([task]);
  });

  it('sends done=false when filtering pending tasks', () => {
    service.setFilter('pending');

    http.expectOne('/tasks?done=false').flush([task]);

    expect(service.filter()).toBe('pending');
  });

  it('sends done=true when filtering done tasks', () => {
    service.setFilter('done');

    http.expectOne('/tasks?done=true').flush([]);

    expect(service.tasks()).toEqual([]);
  });

  it('creates a task and reloads', () => {
    service.create({ title: 'New' });

    const req = http.expectOne('/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'New' });
    req.flush(task);
    http.expectOne('/tasks').flush([task]);
  });

  it('toggles done and reloads', () => {
    service.toggleDone(task);

    const req = http.expectOne('/tasks/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ done: true });
    req.flush({ ...task, done: true });
    http.expectOne('/tasks').flush([]);
  });

  it('removes a task and reloads', () => {
    service.remove(task);

    const req = http.expectOne('/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    http.expectOne('/tasks').flush([]);
  });

  it('sends categoryId when filtering by category, combined with done', () => {
    service.filter.set('pending');
    service.setCategoryFilter(3);

    http.expectOne('/tasks?done=false&categoryId=3').flush([]);

    expect(service.categoryFilter()).toBe(3);
  });

  it('clears the category filter with null', () => {
    service.setCategoryFilter(null);

    http.expectOne('/tasks').flush([]);
  });

  it('sets the category of a task and reloads', () => {
    service.setCategory(task, 3);

    const req = http.expectOne('/tasks/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ categoryId: 3 });
    req.flush({ ...task, categoryId: 3 });
    http.expectOne('/tasks').flush([]);
  });

  it('removes the category of a task with null', () => {
    service.setCategory(task, null);

    const req = http.expectOne('/tasks/1');
    expect(req.request.body).toEqual({ categoryId: null });
    req.flush(task);
    http.expectOne('/tasks').flush([]);
  });
});
