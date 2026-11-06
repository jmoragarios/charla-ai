import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;
  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };

  const makeTask = (overrides: Partial<Task> = {}): Task => ({
    id: 1,
    title: 'Write tests',
    description: null,
    done: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
  const task = makeTask();

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(TasksService);
  });

  describe('findAll', () => {
    it('returns all tasks when no filter is given', async () => {
      repository.find.mockResolvedValue([task]);

      expect(await service.findAll({})).toEqual([task]);
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC', id: 'DESC' },
      });
    });

    it('filters by done', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll({ done: true });

      expect(repository.find).toHaveBeenCalledWith({
        where: { done: true },
        order: { createdAt: 'DESC', id: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('returns the task', async () => {
      repository.findOneBy.mockResolvedValue(task);

      expect(await service.findOne(1)).toEqual(task);
    });

    it('throws NotFoundException when the task does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  it('creates a task', async () => {
    repository.create.mockReturnValue(task);
    repository.save.mockResolvedValue(task);

    expect(await service.create({ title: 'Write tests' })).toEqual(task);
    expect(repository.create).toHaveBeenCalledWith({ title: 'Write tests' });
  });

  it('updates a task', async () => {
    repository.findOneBy.mockResolvedValue(task);
    repository.save.mockResolvedValue(makeTask({ done: true }));

    const result = await service.update(1, { done: true });

    expect(repository.merge).toHaveBeenCalledWith(task, { done: true });
    expect(result.done).toBe(true);
  });

  it('removes a task', async () => {
    repository.findOneBy.mockResolvedValue(task);

    await service.remove(1);

    expect(repository.remove).toHaveBeenCalledWith(task);
  });

  it('throws NotFoundException when removing a missing task', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
