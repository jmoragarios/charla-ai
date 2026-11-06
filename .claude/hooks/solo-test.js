
// Hook PreToolUse del subagente "tester".
// Bloquea cualquier Edit/Write fuera de archivos de prueba.
// Claude Code manda el evento como JSON por stdin; salir con código 2 bloquea la acción
// y el texto de stderr le llega al agente como explicación.
 
let entrada = "";
process.stdin.on("data", (c) => (entrada += c));
process.stdin.on("end", () => {
  let ruta = "";
  try {
    ruta = JSON.parse(entrada).tool_input?.file_path ?? "";
  } catch {
    process.stderr.write("solo-tests: no pude leer el evento del hook\n");
    process.exit(2);
  }
 
  const esPrueba =
    /\.(spec|e2e-spec|test)\.ts$/.test(ruta) || /[\\/]test[\\/]/.test(ruta);
 
  if (!esPrueba) {
    process.stderr.write(
      `Bloqueado: el agente tester solo puede editar archivos de prueba. Intentó editar ${ruta}. ` +
        "Si encontraste un bug en el código, repórtalo en tu resumen.\n"
    );
    process.exit(2);
  }
  process.exit(0);
});