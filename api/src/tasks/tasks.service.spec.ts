import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../categories/category.entity.js';
import { Task } from './task.entity.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;
  const repository = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };
  const categoriesRepository = {
    existsBy: vi.fn(),
  };

  const category: Category = {
    id: 3,
    name: 'Trabajo',
    color: '#539bf5',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const makeTask = (overrides: Partial<Task> = {}): Task => ({
    id: 1,
    title: 'Write tests',
    description: null,
    done: false,
    categoryId: null,
    category: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
  const task = makeTask();
  const withRelation = { relations: { category: true } };
  const order = { createdAt: 'DESC', id: 'DESC' };

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repository },
        {
          provide: getRepositoryToken(Category),
          useValue: categoriesRepository,
        },
      ],
    }).compile();
    service = moduleRef.get(TasksService);
  });

  describe('findAll', () => {
    it('returns all tasks with their category when no filter is given', async () => {
      repository.find.mockResolvedValue([task]);

      expect(await service.findAll({})).toEqual([task]);
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        ...withRelation,
        order,
      });
    });

    it('filters by done', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll({ done: true });

      expect(repository.find).toHaveBeenCalledWith({
        where: { done: true },
        ...withRelation,
        order,
      });
    });

    it('filters by category combined with done', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll({ done: false, categoryId: 3 });

      expect(repository.find).toHaveBeenCalledWith({
        where: { done: false, categoryId: 3 },
        ...withRelation,
        order,
      });
    });
  });

  describe('findOne', () => {
    it('returns the task with its category', async () => {
      repository.findOne.mockResolvedValue(task);

      expect(await service.findOne(1)).toEqual(task);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        ...withRelation,
      });
    });

    it('throws NotFoundException when the task does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a task without category', async () => {
      repository.create.mockReturnValue(task);
      repository.save.mockResolvedValue(task);
      repository.findOne.mockResolvedValue(task);

      expect(await service.create({ title: 'Write tests' })).toEqual(task);
      expect(repository.create).toHaveBeenCalledWith({ title: 'Write tests' });
      expect(categoriesRepository.existsBy).not.toHaveBeenCalled();
    });

    it('creates a task with an existing category', async () => {
      const categorized = makeTask({ categoryId: 3, category });
      categoriesRepository.existsBy.mockResolvedValue(true);
      repository.create.mockReturnValue(categorized);
      repository.save.mockResolvedValue(categorized);
      repository.findOne.mockResolvedValue(categorized);

      const result = await service.create({ title: 'Write tests', categoryId: 3 });

      expect(categoriesRepository.existsBy).toHaveBeenCalledWith({ id: 3 });
      expect(result.category).toEqual(category);
    });

    it('rejects a category that does not exist', async () => {
      categoriesRepository.existsBy.mockResolvedValue(false);

      await expect(
        service.create({ title: 'Write tests', categoryId: 99 }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates a task', async () => {
      repository.findOneBy.mockResolvedValue(task);
      repository.findOne.mockResolvedValue(makeTask({ done: true }));

      const result = await service.update(1, { done: true });

      expect(repository.merge).toHaveBeenCalledWith(task, { done: true });
      expect(repository.save).toHaveBeenCalledWith(task);
      expect(result.done).toBe(true);
    });

    it('removes the category with null without checking it', async () => {
      repository.findOneBy.mockResolvedValue(makeTask({ categoryId: 3 }));
      repository.findOne.mockResolvedValue(task);

      await service.update(1, { categoryId: null });

      expect(categoriesRepository.existsBy).not.toHaveBeenCalled();
      expect(repository.merge).toHaveBeenCalledWith(expect.anything(), {
        categoryId: null,
      });
    });

    it('rejects a category that does not exist', async () => {
      repository.findOneBy.mockResolvedValue(task);
      categoriesRepository.existsBy.mockResolvedValue(false);

      await expect(service.update(1, { categoryId: 99 })).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the task does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { done: true })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('removes a task', async () => {
    repository.findOne.mockResolvedValue(task);

    await service.remove(1);

    expect(repository.remove).toHaveBeenCalledWith(task);
  });

  it('throws NotFoundException when removing a missing task', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
