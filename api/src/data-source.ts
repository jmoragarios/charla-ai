import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Task } from './tasks/task.entity.js';
import { CreateTasks1762300000000 } from './migrations/1762300000000-CreateTasks.js';

const envFile = resolve(import.meta.dirname, '../../.env');
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Task],
  migrations: [CreateTasks1762300000000],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
