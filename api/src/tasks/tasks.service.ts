import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Category } from '../categories/category.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { FindTasksQueryDto } from './dto/find-tasks-query.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { Task } from './task.entity.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(query: FindTasksQueryDto): Promise<Task[]> {
    const where: FindOptionsWhere<Task> = {};
    if (query.done !== undefined) {
      where.done = query.done;
    }
    if (query.categoryId !== undefined) {
      where.categoryId = query.categoryId;
    }
    return this.tasksRepository.find({
      where,
      relations: { category: true },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    await this.assertCategoryExists(dto.categoryId);
    const task = this.tasksRepository.create(dto);
    const saved = await this.tasksRepository.save(task);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    // Loaded without the relation: on save, a loaded `category` would take
    // precedence over the `categoryId` column and silently undo the change.
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    await this.assertCategoryExists(dto.categoryId);
    this.tasksRepository.merge(task, dto);
    await this.tasksRepository.save(task);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  private async assertCategoryExists(
    categoryId: number | null | undefined,
  ): Promise<void> {
    if (categoryId === undefined || categoryId === null) {
      return;
    }
    if (!(await this.categoriesRepository.existsBy({ id: categoryId }))) {
      throw new BadRequestException(`Category ${categoryId} does not exist`);
    }
  }
}
