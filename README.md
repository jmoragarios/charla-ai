# todo-app

Lista de tareas: API en NestJS + PostgreSQL (TypeORM) y web en Angular.

Requisitos: Node 24.15+ (ver `.nvmrc`), pnpm 10 y Docker o Podman.

## Puesta en marcha

```bash
cp .env.example .env
docker compose up -d          # o: podman-compose up -d
pnpm install
pnpm --filter api migration:run
pnpm --filter api seed
```

Arranca cada parte en su propia terminal:

```bash
pnpm --filter api start:dev   # http://localhost:3000/tasks
pnpm --filter web start       # http://localhost:4200
```

## Tests y lint

```bash
npm run test --prefix api       # unit, sin base de datos
npm run test:e2e --prefix api   # e2e, usa la base todo_test
npm run test --prefix web
npm run lint
```
