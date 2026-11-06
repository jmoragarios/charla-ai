import dataSource from './data-source.js';
import { Task } from './tasks/task.entity.js';

const tasks: Partial<Task>[] = [
  { title: 'Preparar la charla', description: 'Revisar slides y tiempos', done: true },
  { title: 'Probar el proyector', done: true },
  { title: 'Comprar café', description: 'Para la mañana del evento', done: false },
  { title: 'Responder correos', done: false },
  { title: 'Actualizar dependencias', description: 'Revisar el changelog antes', done: false },
  { title: 'Escribir tests del API', done: true },
  { title: 'Planificar el sprint', description: 'Reunión del lunes', done: false },
];

await dataSource.initialize();
const repository = dataSource.getRepository(Task);
await repository.clear();
await repository.save(repository.create(tasks));
console.log(`Seeded ${tasks.length} tasks`);
await dataSource.destroy();
