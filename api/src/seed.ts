import dataSource from './data-source.js';
import { Category } from './categories/category.entity.js';
import { Task } from './tasks/task.entity.js';

const categories: Partial<Category>[] = [
  { name: 'Trabajo', color: '#539bf5' },
  { name: 'Evento', color: '#986ee2' },
  { name: 'Personal', color: '#57ab5a' },
];

await dataSource.initialize();
await dataSource.query(
  'TRUNCATE "tasks", "categories" RESTART IDENTITY CASCADE',
);
const categoryRepository = dataSource.getRepository(Category);
const [work, event, personal] = await categoryRepository.save(
  categoryRepository.create(categories),
);

const tasks: Partial<Task>[] = [
  { title: 'Preparar la charla', description: 'Revisar slides y tiempos', done: true, categoryId: event.id },
  { title: 'Probar el proyector', done: true, categoryId: event.id },
  { title: 'Comprar café', description: 'Para la mañana del evento', done: false, categoryId: personal.id },
  { title: 'Responder correos', done: false, categoryId: work.id },
  { title: 'Actualizar dependencias', description: 'Revisar el changelog antes', done: false, categoryId: work.id },
  { title: 'Escribir tests del API', done: true, categoryId: work.id },
  { title: 'Planificar el sprint', description: 'Reunión del lunes', done: false },
];

const taskRepository = dataSource.getRepository(Task);
await taskRepository.save(taskRepository.create(tasks));
console.log(`Seeded ${categories.length} categories and ${tasks.length} tasks`);
await dataSource.destroy();
