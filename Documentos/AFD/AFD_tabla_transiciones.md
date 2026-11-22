# Analizador léxico: autómata finito determinista (AFD)

## Definición formal

M = (Q, Σ, δ, q0, F)

- **Q** = { q0, q1, …, q18 }
- **Σ** = clases de caracteres: letra (a–z, A–Z, _), dígito (0–9), `.`, `"`, `/`, `=`, `!`, `<`, `>`, `+ - *`, delimitador (`( ) [ ] { } ; ,`), salto de línea (`\n`), otro
- **q0** = estado inicial
- **F** = { q1, q2, q4, q6, q7, q8, q9, q10, q12, q13, q14, q15, q16, q17, q18 }
- **δ** = la tabla de abajo

Los caracteres se agrupan en clases para que la tabla no tenga una columna por cada carácter: todas las letras se comportan igual, todos los dígitos igual, etc.

## Estados

| Estado | Significado | ¿Final? | Token que genera |
|---|---|---|---|
| q0 | Inicio | No | — |
| q1 | Identificador | Sí | Identificador o PalabraReservada |
| q2 | Número entero | Sí | NumeroEntero |
| q3 | Leyó "número." (falta dígito) | No | — (error) |
| q4 | Número real | Sí | NumeroReal |
| q5 | Dentro de una cadena | No | — (error si no se cierra) |
| q6 | Cadena cerrada | Sí | Cadena |
| q7 | `/` | Sí | OperadorAritmetico |
| q8 | Comentario `// …` | Sí | (se ignora) |
| q9 | `=` | Sí | Asignacion |
| q10 | `==` | Sí | OperadorRelacional |
| q11 | `!` solo | No | — (error) |
| q12 | `!=` | Sí | OperadorRelacional |
| q13 | `<` | Sí | OperadorRelacional |
| q14 | `<=` | Sí | OperadorRelacional |
| q15 | `>` | Sí | OperadorRelacional |
| q16 | `>=` | Sí | OperadorRelacional |
| q17 | `+ - *` | Sí | OperadorAritmetico |
| q18 | `( ) [ ] { } ; ,` | Sí | Delimitador |

## Tabla de transiciones δ

→ = estado inicial, * = estado final, – = no hay transición.

| Estado | letra | dígito | `.` | `"` | `/` | `=` | `!` | `<` | `>` | `+ - *` | delim | `\n` | otro |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| →q0 | q1 | q2 | – | q5 | q7 | q9 | q11 | q13 | q15 | q17 | q18 | – | – |
| *q1 | q1 | q1 | – | – | – | – | – | – | – | – | – | – | – |
| *q2 | – | q2 | q3 | – | – | – | – | – | – | – | – | – | – |
| q3 | – | q4 | – | – | – | – | – | – | – | – | – | – | – |
| *q4 | – | q4 | – | – | – | – | – | – | – | – | – | – | – |
| q5 | q5 | q5 | q5 | q6 | q5 | q5 | q5 | q5 | q5 | q5 | q5 | – | q5 |
| *q6 | – | – | – | – | – | – | – | – | – | – | – | – | – |
| *q7 | – | – | – | – | q8 | – | – | – | – | – | – | – | – |
| *q8 | q8 | q8 | q8 | q8 | q8 | q8 | q8 | q8 | q8 | q8 | q8 | – | q8 |
| *q9 | – | – | – | – | – | q10 | – | – | – | – | – | – | – |
| *q10 | – | – | – | – | – | – | – | – | – | – | – | – | – |
| q11 | – | – | – | – | – | q12 | – | – | – | – | – | – | – |
| *q12 | – | – | – | – | – | – | – | – | – | – | – | – | – |
| *q13 | – | – | – | – | – | q14 | – | – | – | – | – | – | – |
| *q14 | – | – | – | – | – | – | – | – | – | – | – | – | – |
| *q15 | – | – | – | – | – | q16 | – | – | – | – | – | – | – |
| *q16 | – | – | – | – | – | – | – | – | – | – | – | – | – |
| *q17 | – | – | – | – | – | – | – | – | – | – | – | – | – |
| *q18 | – | – | – | – | – | – | – | – | – | – | – | – | – |

## Cómo se usa el autómata (para la exposición)

1. Se saltan espacios, tabulaciones y saltos de línea.
2. Se empieza en **q0** y, por cada carácter, se busca en la tabla el estado siguiente.
3. Se sigue avanzando mientras haya transición. Así siempre se toma el lexema más largo: `<=` es un solo token y no `<` y `=`.
4. Cuando no hay transición:
   - si el estado actual es **final**, se acepta el lexema y se crea el token;
   - si **no es final**, es un **error léxico**.
5. Se vuelve a q0 para el siguiente token.

En q1 se reconocen igual los identificadores y las palabras reservadas; al aceptar, se revisa la lista de palabras reservadas para saber cuál es.

### Ejemplo: `real p = 7.5;`

| Lee | Transición | Resultado |
|---|---|---|
| r, e, a, l | q0 → q1 → q1 → q1 → q1 | espacio: sin transición, q1 es final → **PalabraReservada** `real` |
| p | q0 → q1 | **Identificador** `p` |
| = | q0 → q9 | **Asignacion** `=` |
| 7 . 5 | q0 → q2 → q3 → q4 | **NumeroReal** `7.5` |
| ; | q0 → q18 | **Delimitador** `;` |

## Errores léxicos que detecta

| Error | Ejemplo | Dónde se detecta |
|---|---|---|
| Carácter no válido | `x = 5 @ 3;` | q0 no tiene transición con `@` |
| Cadena sin cerrar | `imprimir("hola);` | q5 llega al `\n` o al final del archivo (q5 no es final) |
| Real mal formado | `7.;` | q3 no tiene transición con `;` (q3 no es final) |
| `!` solo | `x ! 3` | q11 no tiene transición con el espacio (q11 no es final) |
| Número pegado a letras | `entero 2x = 1;` | q2 acepta `2` pero lo que sigue es una letra |

Después de un error, el analizador sigue leyendo para encontrar todos los errores de una vez.
