import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { Category } from '../src/categories/category.entity.js';

describe('Categories (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
    await dataSource.runMigrations();
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE "tasks", "categories" RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  const createCategory = (body: object) =>
    request(app.getHttpServer()).post('/categories').send(body);

  it('POST /categories creates a category', async () => {
    const res = await createCategory({
      name: '  Trabajo ',
      color: '#539bf5',
    }).expect(201);

    expect(res.body).toMatchObject({ name: 'Trabajo', color: '#539bf5' });
    expect(res.body.id).toEqual(expect.any(Number));
  });

  it('POST /categories rejects an invalid body', async () => {
    await createCategory({ name: '', color: '#539bf5' }).expect(400);
    await createCategory({ name: 'x'.repeat(51), color: '#539bf5' }).expect(
      400,
    );
    await createCategory({ name: 'Trabajo', color: '#000000' }).expect(400);
    await createCategory({ name: 'Trabajo' }).expect(400);
    await createCategory({
      name: 'Trabajo',
      color: '#539bf5',
      extra: 1,
    }).expect(400);
  });

  it('POST /categories rejects a duplicated name', async () => {
    await createCategory({ name: 'Trabajo', color: '#539bf5' }).expect(201);
    await createCategory({ name: 'Trabajo', color: '#57ab5a' }).expect(409);
  });

  it('GET /categories lists categories by name', async () => {
    await createCategory({ name: 'Personal', color: '#57ab5a' });
    await createCategory({ name: 'Casa', color: '#e5534b' });

    const res = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(res.body.map((c: Category) => c.name)).toEqual([
      'Casa',
      'Personal',
    ]);
  });

  it('DELETE /categories/:id keeps its tasks without a category', async () => {
    const { body: category } = await createCategory({
      name: 'Trabajo',
      color: '#539bf5',
    });
    const { body: task } = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Report', categoryId: category.id })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/categories/${category.id}`)
      .expect(204);

    const res = await request(app.getHttpServer())
      .get(`/tasks/${task.id}`)
      .expect(200);
    expect(res.body).toMatchObject({
      title: 'Report',
      categoryId: null,
      category: null,
    });
    await request(app.getHttpServer())
      .delete(`/categories/${category.id}`)
      .expect(404);
  });
});
