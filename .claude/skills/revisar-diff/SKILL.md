---
name: revisar-diff
description: Revisa el diff actual antes de abrir un pull request y devuelve solo los problemas que afectan la corrección. Úsalo cuando el usuario pida revisar el cambio o preparar el PR.
disable-model-invocation: true
model: sonnet
---

Revisa los últimos cambios de la rama en la que estoy trabajando. No compares contra main ni contra ninguna otra rama, aunque exista.

## Cómo obtener el diff

1. Corre `git status --short` para ver qué cambió.
2. **Si hay cambios sin commitear** (lo normal justo después de que un agente trabajó):
   - Corre `git diff HEAD`, que incluye lo que está en staging y lo que no.
   - `git diff` no muestra archivos nuevos sin rastrear. Obtén su lista con `git ls-files --others --exclude-standard` y lee cada uno completo, porque entidades, migraciones y pruebas nuevas suelen estar ahí.
3. **Si no hay cambios pendientes**, revisa el último commit con `git show HEAD`.
4. Si no hay cambios pendientes ni commits, dilo y no inventes una revisión.

Al empezar, di en una línea qué estás revisando (por ejemplo: "3 archivos modificados y 4 nuevos sin commitear en la rama `demo/start`").

## Qué revisar

Responde estas cinco preguntas, cada una con archivo y línea cuando aplique:

1. **Regla de negocio:** ¿el cambio cumple lo que pidió el ticket? Revisa en especial qué pasa al borrar registros que tienen dependientes.
2. **Validación:** ¿se validan las entradas nuevas en el backend, no solo en el frontend?
3. **Base de datos:** ¿hay migración? ¿Tiene índice la clave foránea nueva? ¿El borrado es en cascada cuando no debería?
4. **Pruebas:** ¿las pruebas nuevas cubren más que el caso feliz? ¿Alguna prueba pasaría aunque el código estuviera mal?
5. **Dependencias:** ¿cambió package.json o el lockfile? Si hay una dependencia nueva, ¿la permite el AGENTS.md?

Reporta solo problemas que afecten la corrección o rompan una regla del AGENTS.md. No sugieras cambios de estilo. Si no encuentras problemas en una pregunta, di "sin hallazgos" y sigue.
