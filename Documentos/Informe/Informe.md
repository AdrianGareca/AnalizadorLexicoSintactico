# Analizador léxico y sintáctico

Proyecto final de Lenguajes Formales y Autómatas.  
Tema 1: validador de sintaxis (mini-compilador).  
Equipo: Dani-XD (léxico), AdrianGareca (balanceo y sintáctico), gabrielarcp (interfaz, ejemplos, informe y presentación).  
Noviembre 2026.

## 1. Qué hace el programa

Es una aplicación de escritorio en C# WinForms (.NET 10). La persona escribe un programa en un mini-lenguaje en español y pulsa **Analizar**. El programa no se ejecuta: se revisa si está bien escrito.

El análisis va en este orden:

1. **Léxico.** Un autómata finito determinista separa el texto en tokens.
2. **Balanceo.** Una pila revisa que `( )`, `[ ]` y `{ }` cierren bien.
3. **Sintáctico.** Un parser descendente recursivo comprueba la gramática, arma el árbol de derivación y llena la tabla de símbolos.

La ventana muestra los tokens, los errores, el árbol, la tabla de símbolos y los pasos de la pila.

## 2. El mini-lenguaje

Quedó acordado por los tres. No se cambia sin avisarlo en el grupo.

```
entero edad = 25;
real nota = 7.5;
cadena nombre = "Ana";
entero lista[5];

si (edad >= 18) {
    imprimir("Mayor de edad");
} sino {
    imprimir("Menor de edad");
}

mientras (edad < 30) {
    edad = edad + 1;
}
```

- Palabras reservadas: `entero`, `real`, `cadena`, `si`, `sino`, `mientras`, `imprimir`.
- Identificadores: empiezan con letra o `_` y siguen con letras, dígitos o `_`.
- Números enteros (`25`) y reales (`7.5`).
- Cadenas entre comillas dobles (`"Ana"`).
- Operadores aritméticos `+ - * /`, relacionales `== != < > <= >=` y la asignación `=`.
- Delimitadores `( ) [ ] { } ; ,`.
- Comentarios de una línea con `//`. El léxico los ignora.

## 3. Cómo se reparte el trabajo

| Parte | Persona | Qué entrega |
|---|---|---|
| P1 | Dani-XD | `Lexico/` y el diagrama del AFD en `Documentos/AFD/` |
| P2 | AdrianGareca | `Sintactico/` y la gramática en `Documentos/Gramatica/` |
| P3 | gabrielarcp | `Interfaz/`, `Ejemplos/`, este informe y la presentación |

Cada uno trabaja en su rama y solo toca sus carpetas. `main` se actualiza con pull requests.

La ventana usa estas clases, con los nombres del contrato:

- `AnalizadorLexico.Analizar(string)` devuelve `List<Token>` y llena `Errores`.
- `VerificadorBalanceo.Verificar(List<Token>)` devuelve si la pila quedó vacía, y llena `Errores` y `Pasos`.
- `AnalizadorSintactico.Analizar(List<Token>)` devuelve un `ArbolSintactico` y llena `Errores` y `Tabla`.
- Cada error es un `ErrorAnalisis` con tipo (`Lexico`, `Balanceo`, `Sintactico` o `Semantico`), mensaje, línea y columna.

## 4. Análisis léxico

El detalle y la tabla de transiciones están en [../AFD/AFD_tabla_transiciones.md](../AFD/AFD_tabla_transiciones.md). El diagrama está en [../AFD/AFD_diagrama.png](../AFD/AFD_diagrama.png).

El autómata es M = (Q, Σ, δ, q0, F).

- Q tiene 19 estados, de q0 a q18.
- Σ no es cada carácter: son 13 clases (letra, dígito, punto, comilla, barra, igual, admiración, menor, mayor, operador aritmético, delimitador, salto de línea y «otro»).
- q0 es el inicio.
- Un estado final acepta un lexema. q3 (número con punto y sin dígito), q5 (cadena abierta) y q11 (`!` solo) no son finales: si el autómata se queda ahí, hay error léxico.

Se lee el lexema más largo. Por eso `<=` es un solo token y no `<` seguido de `=`.

Ejemplo con `real p = 7.5;`:

| Se lee | Recorrido | Token |
|---|---|---|
| `real` | q0 → q1 | Palabra reservada |
| `p` | q0 → q1 | Identificador |
| `=` | q0 → q9 | Asignación |
| `7.5` | q0 → q2 → q3 → q4 | Número real |
| `;` | q0 → q18 | Delimitador |

En q1 salen igual los identificadores y las palabras reservadas. Al aceptar, se consulta la lista y, si está, el token pasa a ser palabra reservada.

Errores léxicos: carácter que no pertenece al lenguaje (`@`), cadena sin cerrar, real mal formado (`7.`), `!` sin `=` y un número pegado a letras (`2x`).

El último token de la lista siempre es `FinArchivo` (`EOF`). Lo usa el sintáctico para saber que el texto terminó. La barra de estado no lo cuenta entre los tokens del programa.

## 5. Balanceo con pila

`VerificadorBalanceo` recorre los tokens. Solo le importan `( )`, `[ ]` y `{ }`.

- Si el token abre, se hace push y se anota el paso.
- Si cierra y la pila está vacía, es un error: se cerró algo que no estaba abierto.
- Si cierra y en el tope está la pareja, se hace pop.
- Si cierra y la pareja no coincide, es un error.
- Al terminar, lo que siga en la pila quedó sin cerrar.

Esos pasos son los que muestra el botón **Pila**.

## 6. Análisis sintáctico

La gramática en BNF está en [../Gramatica/Gramatica.md](../Gramatica/Gramatica.md). El símbolo inicial es `<programa>`.

Cada regla es un método: `Declaracion`, `Si`, `Mientras`, `Imprimir`, `Expresion`, `Termino`, `Factor`, y los demás. El método mira el token actual, elige la alternativa y llama a los métodos de las reglas que la componen. Lo que se repite es un `while`. Lo opcional es un `if`.

La recursión de las expresiones es por la derecha. Si fuera por la izquierda (`<expresion> ::= <expresion> "+" <termino>`), el método se llamaría a sí mismo sin leer ningún token.

`*` y `/` se agrupan antes que `+` y `-`. Por eso `a + b * c` se lee como `a + (b * c)`.

Mientras analiza arma el árbol: cada regla es un nodo (`<si>`, `<expresion>`…) y cada token es una hoja. El botón **Árbol** lo muestra en un TreeView.

Si falta un `;`, hay un `sino` sin `si`, en la condición se usó `=` en vez de `==`, o la expresión está incompleta, se anota un error sintáctico y se salta hasta el próximo `;`, `}` o inicio de sentencia. Eso es el modo pánico: permite seguir y mostrar más de un error.

## 7. Tabla de símbolos

Cada declaración agrega un símbolo con nombre, tipo y línea. Un arreglo queda como `entero[5]`.

Hay dos errores semánticos:

- La variable se usa y no está en la tabla.
- La variable se declara dos veces.

No se revisan los tipos de una expresión (por ejemplo sumar una cadena y un entero). Esa comprobación no forma parte de este proyecto.

## 8. La interfaz

La ventana sigue `ESTILO.md`. Los colores y las fuentes salen de `Comun/Tema.cs`: cabecera azul, menú lateral gris, botón Analizar azul y botón Limpiar rojo. El editor pinta las palabras reservadas de azul, los números de naranja, las cadenas de verde y los comentarios de gris.

Arriba están **Abrir ejemplo**, **Analizar** y **Limpiar**. A la izquierda, el menú de resultados. En el centro, el editor y la vista elegida. Abajo, una línea de estado: «Análisis terminado: N tokens, M errores.»

`AnalizarCodigo` hace las tres fases en orden, junta los errores y llena las cinco vistas. Si hay errores, se abre sola la vista de errores. Si no hay, se abren los tokens. Las otras vistas se consultan con el menú.

Cada fila de error usa el color de `Tema.ColorDeError`: léxico en carmesí, balanceo en naranja, sintáctico en rojo y semántico en magenta.

## 9. Ejemplos

Están en `AnalizadorLexicoSintactico/Ejemplos/`. El proyecto ya los copia junto al ejecutable. **Abrir ejemplo** abre esa carpeta.

| Archivo | Qué se espera |
|---|---|
| `correcto.txt` | 0 errores. Tabla: `edad` entero, `nota` real, `nombre` cadena, `lista` entero[5]. |
| `error-lexico.txt` | Un solo error léxico: el carácter `@`. El resto es válido. |
| `error-balanceo.txt` | La pila dice que `{` quedó sin cerrar. El sintáctico también pide esa llave. |
| `error-sintactico.txt` | Falta `;` después de `18`. La pila queda bien y `edad` sí entra a la tabla. |
| `error-no-declarada.txt` | Error semántico: `nota` no está declarada. `edad` sí. |

En el de balanceo aparecen dos errores a propósito. Una llave sin cerrar la ve la pila y también la gramática. La vista para explicarlo es **Pila**.

## 10. Cómo probarlo

La ventana es `Interfaz.FrmPrincipal`. `Program.cs` es un archivo compartido y hoy abre un formulario vacío. Para ver esta ventana, en `Program.cs` hay que dejar esta línea (Adrian la cambia al integrar, porque ese archivo no se toca desde la rama de la interfaz):

```csharp
Application.Run(new Interfaz.FrmPrincipal());
```

Hay que compilar en Windows, con Visual Studio 2026. WinForms no abre la ventana en macOS.

## 11. Conclusión

El mini-compilador separa el trabajo en las fases clásicas de un compilador: léxico con AFD, balanceo con pila, sintaxis con descenso recursivo y una tabla de símbolos para lo semántico más simple. La interfaz no analiza por su cuenta: llama a esas clases en orden y muestra lo que devuelven, para poder explicar cada fase en la presentación.
