import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { Task } from '../src/tasks/task.entity.js';

describe('Tasks (e2e)', () => {
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

  const createTask = (body: object) =>
    request(app.getHttpServer()).post('/tasks').send(body);

  it('POST /tasks creates a task', async () => {
    const res = await createTask({ title: 'Buy milk' }).expect(201);

    expect(res.body).toMatchObject({
      title: 'Buy milk',
      description: null,
      done: false,
      categoryId: null,
      category: null,
    });
    expect(res.body.id).toEqual(expect.any(Number));
  });

  it('POST /tasks rejects an invalid body', async () => {
    await createTask({ title: '' }).expect(400);
    await createTask({ title: 'x'.repeat(121) }).expect(400);
    await createTask({ title: 'Ok', unknown: 1 }).expect(400);
  });

  it('GET /tasks lists tasks and filters by done', async () => {
    const { body: pending } = await createTask({ title: 'Pending' });
    const { body: finished } = await createTask({ title: 'Finished' });
    await request(app.getHttpServer())
      .patch(`/tasks/${finished.id}`)
      .send({ done: true })
      .expect(200);

    const all = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(all.body).toHaveLength(2);

    const done = await request(app.getHttpServer())
      .get('/tasks?done=true')
      .expect(200);
    expect(done.body.map((t: Task) => t.id)).toEqual([finished.id]);

    const notDone = await request(app.getHttpServer())
      .get('/tasks?done=false')
      .expect(200);
    expect(notDone.body.map((t: Task) => t.id)).toEqual([pending.id]);

    await request(app.getHttpServer()).get('/tasks?done=maybe').expect(400);
  });

  it('GET /tasks/:id returns a task or 404', async () => {
    const { body: task } = await createTask({ title: 'Read' });

    await request(app.getHttpServer())
      .get(`/tasks/${task.id}`)
      .expect(200)
      .expect((res) => expect(res.body.title).toBe('Read'));
    await request(app.getHttpServer()).get('/tasks/999999').expect(404);
  });

  it('PATCH /tasks/:id updates a task or 404', async () => {
    const { body: task } = await createTask({ title: 'Old' });

    const res = await request(app.getHttpServer())
      .patch(`/tasks/${task.id}`)
      .send({ title: 'New', done: true })
      .expect(200);
    expect(res.body).toMatchObject({ title: 'New', done: true });

    await request(app.getHttpServer())
      .patch('/tasks/999999')
      .send({ done: true })
      .expect(404);
  });

  it('DELETE /tasks/:id removes a task or 404', async () => {
    const { body: task } = await createTask({ title: 'Remove me' });

    await request(app.getHttpServer()).delete(`/tasks/${task.id}`).expect(204);
    await request(app.getHttpServer()).get(`/tasks/${task.id}`).expect(404);
    await request(app.getHttpServer()).delete(`/tasks/${task.id}`).expect(404);
  });

  describe('categories', () => {
    const createCategory = async (name: string) => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({ name, color: '#57ab5a' })
        .expect(201);
      return res.body as { id: number; name: string; color: string };
    };

    it('POST /tasks assigns a category and returns it', async () => {
      const category = await createCategory('Trabajo');

      const res = await createTask({
        title: 'Report',
        categoryId: category.id,
      }).expect(201);

      expect(res.body).toMatchObject({
        categoryId: category.id,
        category: { id: category.id, name: 'Trabajo', color: '#57ab5a' },
      });
    });

    it('rejects a category that does not exist or is not an integer', async () => {
      await createTask({ title: 'Report', categoryId: 999999 }).expect(400);
      await createTask({ title: 'Report', categoryId: 'abc' }).expect(400);

      const { body: task } = await createTask({ title: 'Report' });
      await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({ categoryId: 999999 })
        .expect(400);
    });

    it('PATCH /tasks/:id changes and removes the category', async () => {
      const work = await createCategory('Trabajo');
      const home = await createCategory('Casa');
      const { body: task } = await createTask({
        title: 'Report',
        categoryId: work.id,
      });

      const changed = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({ categoryId: home.id })
        .expect(200);
      expect(changed.body).toMatchObject({
        categoryId: home.id,
        category: { name: 'Casa' },
      });

      const cleared = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({ categoryId: null })
        .expect(200);
      expect(cleared.body).toMatchObject({ categoryId: null, category: null });
    });

    it('GET /tasks filters by category, combined with done', async () => {
      const work = await createCategory('Trabajo');
      const { body: a } = await createTask({ title: 'A', categoryId: work.id });
      const { body: b } = await createTask({ title: 'B', categoryId: work.id });
      await createTask({ title: 'C' });
      await request(app.getHttpServer())
        .patch(`/tasks/${b.id}`)
        .send({ done: true })
        .expect(200);

      const byCategory = await request(app.getHttpServer())
        .get(`/tasks?categoryId=${work.id}`)
        .expect(200);
      // Newest first: b was created after a.
      expect(byCategory.body.map((t: Task) => t.id)).toEqual([b.id, a.id]);

      const pendingInCategory = await request(app.getHttpServer())
        .get(`/tasks?categoryId=${work.id}&done=false`)
        .expect(200);
      expect(pendingInCategory.body.map((t: Task) => t.id)).toEqual([a.id]);

      await request(app.getHttpServer())
        .get('/tasks?categoryId=abc')
        .expect(400);
    });
  });
});
