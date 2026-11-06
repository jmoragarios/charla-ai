# Guías del proyecto

## Stack
- Angular (standalone components), NestJS, PostgreSQL

## Comandos
- Package manager: pnpm (no uses npm ni yarn)
- Tests del backend: `pnpm --filter api test`
- Tests e2e del backend (requieren la base de datos): `pnpm --filter api test:e2e`
- Tests del frontend: `pnpm --filter web test`
- Lint: `pnpm lint` (debe pasar antes de terminar)
- Correr migrations: `pnpm --filter api migration:run`

## Reglas
- Usa standalone components y signals en Angular cuando corresponda
- No introduzcas NgModules
- No agregues dependencias nuevas sin preguntar
- Sigue la estructura de carpetas existente en `api/src` y `web/src/app`

## Base de datos
- Los cambios de schema se hacen con migrations
- Nunca modifiques datos de producción directamente

## Definición de terminado
- Tests agregados o actualizados, lint y tests pasando
- Resume los cambios y los riesgos pendientes
