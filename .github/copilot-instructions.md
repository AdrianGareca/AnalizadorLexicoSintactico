# Instrucciones para GitHub Copilot

Las reglas completas están en `AGENTS.md`, en la raíz del repositorio. Este es el resumen:

- Proyecto de 3 personas en **C# WinForms (.NET 10)**. Cada persona tiene una parte y una rama. Ayudas solo a la parte de la rama actual:
  - `p1-lexico`: solo `AnalizadorLexicoSintactico/Lexico/` y `Documentos/AFD/`.
  - `p2-sintactico`: solo `AnalizadorLexicoSintactico/Sintactico/` y `Documentos/Gramatica/`.
  - `p3-interfaz`: solo `AnalizadorLexicoSintactico/Interfaz/`, `AnalizadorLexicoSintactico/Ejemplos/`, `Documentos/Informe/` y `Documentos/Presentacion/`.
- No crees ni modifiques archivos de otras partes, tampoco versiones provisionales o de ejemplo de sus clases.
- Para conectar con otras partes, usa exactamente los nombres de la sección "Contrato entre las partes" de `COMO-TRABAJAR.md`.
- No toques archivos compartidos: `.sln`, `.csproj`, `Program.cs`, `Comun/`, `.gitignore` ni los `.md`.
- No cambies el mini-lenguaje (palabras reservadas en español: `entero`, `real`, `cadena`, `si`, `sino`, `mientras`, `imprimir`) ni la tecnología.
- Nunca hagas commit o push a `main`, ni uses `git add .`. No subas `bin/`, `obj/` ni `.vs/`.
- Código simple, con nombres y comentarios en español, que la persona pueda explicar en la exposición.
- La interfaz usa `Comun/Tema.cs` y sigue `ESTILO.md`. No inventes otros colores ni otro estilo.
