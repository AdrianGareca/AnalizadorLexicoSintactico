# Instrucciones para asistentes de IA

Este archivo lo leen solos Codex, Cursor, GitHub Copilot, Gemini CLI y otros asistentes. Claude Code lo lee a través de `CLAUDE.md`, y Copilot en Visual Studio a través de `.github/copilot-instructions.md`.

**Si usas ChatGPT, Gemini o Claude en el navegador**, el chat no puede leer este archivo. Copia el bloque del final y pégalo al inicio de la conversación.

---

## Contexto

Este es un proyecto de **3 personas**. Cada una tiene **una parte** y una rama propia. Estás ayudando a **una sola** de esas personas, así que solo trabajas en su parte.

- La tecnología es **C# WinForms en .NET 10** (Visual Studio 2026), un solo proyecto: `AnalizadorLexicoSintactico.csproj`.
- No es una página web, ni una app de consola, ni Python o JavaScript.
- El mini-lenguaje que se analiza está definido en `README.md` y tiene palabras reservadas **en español** (`entero`, `real`, `cadena`, `si`, `sino`, `mientras`, `imprimir`).
- Cómo se conectan las partes (clases, propiedades y métodos) está en la sección "Contrato entre las partes" de `COMO-TRABAJAR.md`.

## Paso 1: averigua de quién es la parte

Mira la rama actual con `git branch --show-current`:

- `p1-lexico` (P1, léxico): solo puedes tocar `AnalizadorLexicoSintactico/Lexico/` y `Documentos/AFD/`.
- `p2-sintactico` (P2, balanceo y sintáctico): solo puedes tocar `AnalizadorLexicoSintactico/Sintactico/` y `Documentos/Gramatica/`.
- `p3-interfaz` (P3, interfaz e informe): solo puedes tocar `AnalizadorLexicoSintactico/Interfaz/`, `AnalizadorLexicoSintactico/Ejemplos/`, `Documentos/Informe/` y `Documentos/Presentacion/`.
- `main` o cualquier otra rama: **no modifiques nada**. Pregunta de quién es la parte y pide que se cambie a su rama.

## Reglas

1. **No crees, modifiques ni borres archivos fuera de las carpetas de esa rama.** Eso incluye stubs, mocks o versiones "provisionales" o "de ejemplo" de las clases de otra parte, aunque sea para que compile.
2. **Si la parte necesita algo de otra que todavía no está en `main`** (por ejemplo, P2 necesita `Token`), usa los nombres exactos del contrato de `COMO-TRABAJAR.md` y avísale al usuario que tiene que esperar a que esa parte entre a `main` y luego hacer `git pull origin main`. No la escribas tú.
3. **No toques los archivos compartidos:** `AnalizadorLexicoSintactico.sln`, `AnalizadorLexicoSintactico.csproj`, `Program.cs`, `Comun/`, `Pruebas/`, `.gitignore` ni ningún `.md` de la raíz. Si hace falta un cambio ahí, dile al usuario que lo pida en el grupo.
4. **No cambies el mini-lenguaje** (palabras reservadas, operadores, sintaxis). Tampoco lo traduzcas al inglés.
5. **No cambies la tecnología.** Nada de crear otro proyecto, otra solución, una versión web o de consola, ni de mover archivos a otra estructura.
6. **No cambies el contrato** (nombres de clases, propiedades o métodos públicos) sin que el usuario confirme que lo habló con el grupo.
7. **Git:**
   - Nunca hagas commit ni push en `main`, ni merge a `main`, ni `push --force`.
   - Nunca uses `git add .` ni `git add -A`. Agrega solo las rutas de la carpeta de la parte.
   - Antes de cada commit, muestra `git status` y confirma que solo cambian archivos de la parte.
8. **No subas `bin/`, `obj/` ni `.vs/`.**
9. **Si el usuario pide algo que rompe estas reglas**, explícale cuál y sugiérele hablarlo con el grupo antes de hacerlo.

## Si la persona trabaja en Mac

WinForms no se ejecuta en Mac, pero sí compila. En ese caso:

- Escribe la ventana **toda por código** en `AnalizadorLexicoSintactico/Interfaz/FrmPrincipal.cs` (`public class FrmPrincipal : Form`, namespace `AnalizadorLexicoSintactico.Interfaz`). No uses el diseñador ni crees `.Designer.cs` o `.resx`.
- Para comprobar que no hay errores: `dotnet build AnalizadorLexicoSintactico/AnalizadorLexicoSintactico.csproj`. No intentes ejecutar la app. Para ver la lógica funcionando: `dotnet run --project Pruebas`.
- **No conviertas el proyecto** a Avalonia, MAUI, web ni consola, y no cambies `TargetFramework` ni el `.csproj` para que "funcione en Mac". La ventana la ejecuta Adrian en Windows.

## Estilo del código

- Código **simple y claro**, que la persona pueda **explicar en la exposición**. Nada de librerías externas ni trucos avanzados.
- Nombres y comentarios **en español**, como el resto del proyecto.
- Los errores se reportan con `ErrorAnalisis` (de `Comun/`), con línea y columna.
- La interfaz usa los colores, las fuentes y los métodos de `Comun/Tema.cs`, siguiendo `ESTILO.md`. No inventes otros colores ni otro estilo (ni modo oscuro, ni degradados, ni otras fuentes).

---

## Bloque para pegar en ChatGPT / Gemini / Claude web

Cambia lo que está entre corchetes antes de pegarlo:

```
Estoy en un proyecto de grupo de 3 personas: un analizador léxico y sintáctico en C# WinForms (.NET 10, Visual Studio 2026). Cada persona tiene una parte y yo solo hago la mía.

Mi parte es: [P1 léxico con AFD | P2 balanceo con pila + parser descendente recursivo + tabla de símbolos | P3 interfaz WinForms + ejemplos + informe].
Mis archivos son: [lista de tus archivos, sacada de COMO-TRABAJAR.md].

Reglas:
- Dame código SOLO para mis archivos. No me generes clases de las otras partes, ni versiones provisionales o de ejemplo de ellas.
- Si necesito algo de otra parte, usa exactamente estos nombres (no los inventes ni los cambies): [pega aquí la sección "Contrato entre las partes" de COMO-TRABAJAR.md].
- Los errores se reportan con la clase ErrorAnalisis(TipoError tipo, string mensaje, int linea, int columna), namespace AnalizadorLexicoSintactico.Comun.
- No cambies la tecnología (nada de web, consola u otro lenguaje) ni la estructura de carpetas.
- El mini-lenguaje tiene palabras reservadas en español: entero, real, cadena, si, sino, mientras, imprimir; operadores + - * / == != < > <= >= =; delimitadores ( ) [ ] { } ; , y comentarios //. No lo cambies.
- Código simple, con nombres y comentarios en español, que yo pueda explicar en la exposición.
```
