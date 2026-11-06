import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CategoriesService } from './categories.service.js';
import { Category } from './category.entity.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    existsBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };

  const category: Category = {
    id: 1,
    name: 'Trabajo',
    color: '#539bf5',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(CategoriesService);
  });

  it('lists categories ordered by name', async () => {
    repository.find.mockResolvedValue([category]);

    expect(await service.findAll()).toEqual([category]);
    expect(repository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
  });

  describe('create', () => {
    it('creates a category with a trimmed name', async () => {
      repository.existsBy.mockResolvedValue(false);
      repository.create.mockReturnValue(category);
      repository.save.mockResolvedValue(category);

      expect(
        await service.create({ name: '  Trabajo ', color: '#539bf5' }),
      ).toEqual(category);
      expect(repository.existsBy).toHaveBeenCalledWith({ name: 'Trabajo' });
      expect(repository.create).toHaveBeenCalledWith({
        name: 'Trabajo',
        color: '#539bf5',
      });
    });

    it('rejects a duplicated name', async () => {
      repository.existsBy.mockResolvedValue(true);

      await expect(
        service.create({ name: 'Trabajo', color: '#539bf5' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('maps a unique violation raised by the database to a conflict', async () => {
      repository.existsBy.mockResolvedValue(false);
      repository.save.mockRejectedValue(
        new QueryFailedError('INSERT', [], { code: '23505' } as never),
      );

      await expect(
        service.create({ name: 'Trabajo', color: '#539bf5' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('removes the category', async () => {
      repository.findOneBy.mockResolvedValue(category);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(category);
    });

    it('throws NotFoundException when the category does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
