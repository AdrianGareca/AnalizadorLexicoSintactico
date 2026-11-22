# Cómo trabajamos en el repositorio

## Lo primero: Token y TipoToken (Dani)

> ⚠️ **Esto va antes que todo lo demás.** El sintáctico (Adrian) y la interfaz (Gabriela) trabajan con la lista de tokens que arma el léxico. Mientras `Token.cs` y `TipoToken.cs` no estén en `main`, ninguno de los dos puede compilar ni probar su parte.

Dani, apenas clones el repo (los pasos están más abajo, en "La primera vez"):

1. Crea tu rama `p1-lexico`.
2. Crea la carpeta `AnalizadorLexicoSintactico/Lexico/` con **solo dos archivos**, en el namespace `AnalizadorLexicoSintactico.Lexico`:
   - `TipoToken.cs`: el enum con las categorías de token (palabra reservada, identificador, número entero, número real, cadena, operador aritmético, operador relacional, asignación, delimitador…).
   - `Token.cs`: la clase con `Tipo` (TipoToken), `Texto`, `Linea` y `Columna`, como dice el [contrato](#contrato-entre-las-partes).
3. Revisa que compile, haz commit **solo de esos dos archivos** y push a tu rama.
4. Abre un pull request a `main` con el título `P1: Token y TipoToken` y avisa en el grupo.
5. Cuando Adrian lo une, Adrian y Gabriela hacen `git pull origin main` en sus ramas y ya pueden seguir.
6. Después sigue con el resto del léxico (`PalabrasReservadas`, `AutomataFinito`, `AnalizadorLexico`) en la misma rama, y al final abre otro pull request.

Si más adelante necesitas cambiar algo de `Token` o `TipoToken` (un nombre, una categoría), **avisa en el grupo antes**, porque rompe el código de los otros dos.

## La regla principal

1. Cada uno trabaja **solo en su rama**.
2. Cada uno toca **solo los archivos de su carpeta**.
3. **Nadie sube directo a `main`.** Todo entra a `main` por un *pull request*. Adrian lo revisa y hace el merge.

Así nadie pisa el trabajo de otro, y en el historial se ve qué hizo cada uno, que es lo que el inge va a mirar.

## Qué es de quién

**P1, Dani-XD, rama `p1-lexico`**
- `AnalizadorLexicoSintactico/Lexico/`: `TipoToken.cs`, `Token.cs`, `PalabrasReservadas.cs`, `AutomataFinito.cs`, `AnalizadorLexico.cs`.
- `Documentos/AFD/`: el diagrama del AFD (draw.io o JFLAP) y su tabla de transiciones.

**P2, AdrianGareca, rama `p2-sintactico`**
- `AnalizadorLexicoSintactico/Sintactico/`: `VerificadorBalanceo.cs`, `AnalizadorSintactico.cs`, `NodoArbol.cs`, `ArbolSintactico.cs`, `TablaSimbolos.cs`.
- `Documentos/Gramatica/`: la gramática en BNF y un árbol de derivación de ejemplo.

**P3, gabrielarcp, rama `p3-interfaz`**
- `AnalizadorLexicoSintactico/Interfaz/`: `FrmPrincipal.cs`, `FrmPrincipal.Designer.cs`, `FrmPrincipal.resx`.
- `AnalizadorLexicoSintactico/Ejemplos/`: un `.txt` con código correcto y uno por cada tipo de error (léxico, balanceo, sintáctico y variable no declarada).
- `Documentos/Informe/` y `Documentos/Presentacion/`.

**Compartido** (no se toca desde las ramas personales):
- `AnalizadorLexicoSintactico.sln`, `AnalizadorLexicoSintactico.csproj`, `Program.cs`, `Comun/ErrorAnalisis.cs`, `Comun/Tema.cs`, `.gitignore` y los archivos `.md`.
- Si necesitas un cambio en algo compartido, avisa en el grupo y Adrian lo hace en `main`.
- Por ahora `Program.cs` abre una ventana vacía, para que el proyecto compile aunque todavía no esté la interfaz. Cuando entre `FrmPrincipal` a `main`, Adrian cambia esa línea.
- Las carpetas `Lexico/`, `Sintactico/`, `Interfaz/` y `Ejemplos/` todavía no existen en el repo (Git no guarda carpetas vacías). Cada uno crea la suya en su rama, con el nombre exacto.

> No hace falta tocar el `.csproj` para agregar tus archivos. El proyecto incluye solo cualquier `.cs` que esté dentro de la carpeta.

## La primera vez: clonar y crear tu rama

### Con Visual Studio 2026

1. **Git → Clonar repositorio** y pega `https://github.com/AdrianGareca/AnalizadorLexicoSintactico.git`.
2. Abajo a la derecha aparece la rama actual (`main`). Haz clic ahí, luego **Nueva rama**.
3. En el nombre pon tu rama (`p1-lexico`, `p2-sintactico` o `p3-interfaz`) y en "basada en" elige `main`. Deja marcada la casilla para cambiarte a esa rama (en inglés dice *Checkout branch*) y dale **Crear**.
4. Revisa que abajo a la derecha diga **tu rama** antes de escribir código.

### Con la consola

```bash
git clone https://github.com/AdrianGareca/AnalizadorLexicoSintactico.git
cd AnalizadorLexicoSintactico
git checkout -b p1-lexico          # cambia por tu rama
git push -u origin p1-lexico
```

## El día a día

1. Abre el proyecto y **confirma que estás en tu rama**.
2. Programa en tus archivos.
3. Haz **commits pequeños** con un mensaje claro, por ejemplo `AFD: tabla de transiciones` o `Balanceo: pila con línea del error`. No dejes un solo commit gigante para el final.
4. **Antes de cada commit, mira la lista de archivos cambiados.** Solo tienen que aparecer archivos de tu carpeta. Si aparece uno de otro, quítalo: clic derecho → *Deshacer cambios*, o `git restore <archivo>`.
5. Haz **push** a tu rama.

En consola:

```bash
git status                                   # revisa qué cambió
git add AnalizadorLexicoSintactico/Lexico    # SOLO tu carpeta (nunca "git add ." ni "git add -A")
git commit -m "AFD: estados para números reales"
git push
```

En Visual Studio todo esto se hace desde la ventana **Cambios de Git**: marcas tus archivos, escribes el mensaje y das **Confirmar todo** y luego **Insertar** (push).

## Traer a tu rama lo nuevo de `main`

Cuando la parte de otro ya entró a `main` y la necesitas para probar la tuya:

- **Consola:** `git pull origin main`, estando en tu rama.
- **Visual Studio:** Git → Administrar ramas → clic derecho en `origin/main` → **Combinar en la rama actual**.

Esto **no** pasa los archivos del otro a tu carpeta: solo actualiza tu rama con lo que ya está aprobado.

## Subir tu parte a `main` (pull request)

1. Haz push de tu rama.
2. Entra al repo en GitHub. Va a salir **Compare & pull request**. Si no sale, ve a *Pull requests → New pull request*.
3. Elige **base: `main`** y **compare: tu rama**.
4. Título: `P1: analizador léxico` (o el de tu parte). En la descripción pon qué hace y qué falta.
5. Revisa la pestaña **Files changed**: tienen que salir **solo tus archivos**.
6. Adrian lo revisa y hace el merge. Si toca archivos de otra parte, se pide corregir antes de unirlo.

## Contrato entre las partes

Así se conectan las partes. Si alguien necesita cambiar un nombre o un método, **avisa en el grupo antes**, porque rompe el código de los demás.

**Namespaces:** `AnalizadorLexicoSintactico.Lexico`, `.Sintactico`, `.Interfaz` y `.Comun`.

**Comun (ya existe, compartido):**
- `ErrorAnalisis`: guarda `Tipo` (`TipoError.Lexico`, `Balanceo`, `Sintactico` o `Semantico`), `Mensaje`, `Linea` y `Columna`. Se crea con `new ErrorAnalisis(TipoError.Lexico, "mensaje", linea, columna)`.
- `Tema`: los colores, las fuentes y el estilo de los botones y las tablas. La interfaz usa solo esto. Ver [ESTILO.md](ESTILO.md).

**P1 entrega (lo usan P2 y P3):**
- `TipoToken`: un enum con las categorías de token (palabra reservada, identificador, número entero, número real, cadena, operadores, delimitadores…).
- `Token`: tiene `Tipo` (TipoToken), `Texto` (el lexema tal cual), `Linea` y `Columna`.
- `AnalizadorLexico`: tiene `List<Token> Analizar(string codigo)` y la propiedad `List<ErrorAnalisis> Errores`.

**P2 entrega (lo usa P3):**
- `VerificadorBalanceo`: tiene `bool Verificar(List<Token> tokens)`, `List<ErrorAnalisis> Errores` y `List<string> Pasos` (lo que hizo la pila, para mostrarlo en la interfaz).
- `AnalizadorSintactico`: tiene `ArbolSintactico Analizar(List<Token> tokens)`, `List<ErrorAnalisis> Errores` y `TablaSimbolos Tabla`.
- `ArbolSintactico` tiene `NodoArbol Raiz`. Cada `NodoArbol` tiene `Nombre` y `List<NodoArbol> Hijos`.
- `TablaSimbolos`: es la lista de variables, cada una con nombre, tipo y línea donde se declaró.

**P3 usa todo en este orden:** léxico → balanceo → sintáctico, y muestra los tokens, los errores, el árbol (en un TreeView), la tabla de símbolos y los pasos de la pila.

**Orden de entrega:** P2 y P3 dependen de `Token` y `TipoToken`. Por eso **P1 sube primero esos dos archivos en un pull request chiquito**. Cuando entran a `main`, los demás hacen `git pull origin main` en su rama y siguen.

## Qué NO se sube

- `bin/`, `obj/` ni `.vs/`. El `.gitignore` ya los excluye; si Visual Studio te los muestra, no los marques.
- Archivos de otra parte. Tampoco versiones "provisionales" o "de prueba" de sus clases para que tu código compile.
- Otros proyectos u otras versiones (web, consola, Python…), ni `.zip`.
- Nada con **"Add files via upload"** desde la página de GitHub. Eso sube directo a `main`. Todo se sube desde Visual Studio o la consola, a tu rama.

## Si algo sale mal

- **Hice commit en `main` sin querer y todavía no hice push:** no hagas push. Avisa en el grupo y lo movemos a tu rama.
- **Ya hice push a `main`:** avisa a Adrian y se revierte. No intentes arreglarlo con `--force`.
- **Me salió un conflicto:** casi siempre pasa porque se tocó un archivo de otro. Escribe en el grupo antes de resolverlo.
- **No sé en qué rama estoy:** `git branch --show-current`, o mira abajo a la derecha en Visual Studio.

## Calendario

- **Domingo 22-nov:** cada uno termina su parte en su rama. P1 sube `Token` y `TipoToken` lo antes posible.
- **Domingo 22-nov, noche:** cada uno abre su pull request y se integra en `main`. Se prueba con los ejemplos y se corrige. P1 y P2 le pasan a P3 el diagrama del AFD y la gramática para el informe.
- **Lunes 23-nov:** presentación. Cada uno repasa su parte para poder explicarla si el inge pregunta.
