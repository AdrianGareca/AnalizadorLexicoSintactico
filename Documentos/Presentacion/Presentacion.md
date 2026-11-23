# Presentación — Analizador léxico y sintáctico

Cada bloque es una diapositiva. La línea **Habla** dice quién la explica. La línea **Decir** es la idea, no un texto para leer completo.

Fecha: lunes 23 de noviembre de 2026.  
Proyecto final de Lenguajes Formales y Autómatas.

---

## 1. Portada

**Habla:** Gabriela

**En la diapositiva**

- Analizador léxico y sintáctico
- Mini-compilador en C# WinForms
- Dani-XD · AdrianGareca · gabrielarcp

**Decir:** El programa no ejecuta el código. Revisa si un programa escrito en nuestro lenguaje está bien formado.

---

## 2. Qué problema resolvemos

**Habla:** Gabriela

**En la diapositiva**

1. Léxico: separar el texto en tokens.
2. Balanceo: cerrar `( ) [ ] { }` con una pila.
3. Sintáctico: cumplir la gramática y armar el árbol.
4. Semántico: avisar si una variable no existe o está repetida.

**Decir:** Son las mismas fases de un compilador, en un lenguaje chico y en español.

---

## 3. El mini-lenguaje

**Habla:** cualquiera del equipo

**En la diapositiva**

```
entero edad = 25;
si (edad >= 18) {
    imprimir("Mayor de edad");
} sino {
    imprimir("Menor de edad");
}
```

- Reservadas: `entero`, `real`, `cadena`, `si`, `sino`, `mientras`, `imprimir`
- Comentarios con `//`

**Decir:** Esto es lo único que el analizador acepta. No es C# ni Python.

---

## 4. Léxico y el AFD

**Habla:** Dani

**En la diapositiva**

- Mostrar `Documentos/AFD/AFD_diagrama.png`
- M = (Q, Σ, δ, q0, F), estados q0…q18
- Se toma el lexema más largo: `<=` es un token, no dos
- Ejemplo: `real p = 7.5;`

**Decir:** El autómata empieza en q0. Mientras haya transición, avanza. Si se detiene en un estado final, acepta el token. Si no es final, es un error léxico. En q1, la lista de palabras reservadas decide si `real` es reservada o si `p` es un identificador.

---

## 5. Balanceo con pila

**Habla:** Adrian

**En la diapositiva**

- `(` `[` `{` → push
- `)` `]` `}` → pop y se compara con el tope
- Lo que queda en la pila nunca se cerró

**Decir:** No hace falta la gramática para esto. Con la pila se ve el orden de los delimitadores y en qué línea se abrió el que falló.

---

## 6. Gramática y parser

**Habla:** Adrian

**En la diapositiva**

- Descenso recursivo: una función por regla
- `<programa>`, `<sentencia>`, `<si>`, `<expresion>`…
- `*` y `/` antes que `+` y `-`
- Modo pánico: ante un error, salta al próximo `;` o `}`

**Decir:** El parser no se queda en el primer error. Anota el problema y sigue, para mostrar varios en una sola pasada. El árbol tiene las reglas como nodos y los tokens como hojas.

---

## 7. Tabla de símbolos

**Habla:** Adrian

**En la diapositiva**

| Nombre | Tipo | Línea |
|---|---|---|
| edad | entero | 2 |
| nota | real | 3 |
| nombre | cadena | 4 |
| lista | entero[5] | 5 |

Esas líneas son las de `correcto.txt` (la primera línea es el comentario).

- No declarada
- Declarada dos veces

**Decir:** Esto ya es semántico. La frase puede estar bien armada y aun así usar una variable que no existe.

---

## 8. La ventana

**Habla:** Gabriela

**En la diapositiva**

- Cabecera, editor y menú: Tokens, Errores, Árbol, Tabla de símbolos, Pila
- Orden al pulsar Analizar: léxico → balanceo → sintáctico
- Los colores salen de la clase `Tema`

**Decir:** La interfaz no decide si el código es válido. Llama a las tres clases y muestra lo que devuelven. Si hay errores, se abre sola esa lista.

---

## 9. Demo

**Habla:** Gabriela

**En la diapositiva**

1. Abrir `correcto.txt` y analizar. Recorrer tokens, árbol, tabla y pila.
2. `error-lexico.txt`: el carácter `@`.
3. `error-balanceo.txt`: mirar la pila. La llave no se cierra.
4. `error-sintactico.txt`: falta el `;`.
5. `error-no-declarada.txt`: `nota` no existe.

**Decir:** En el de balanceo también sale un error sintáctico, porque la gramática pide la misma llave. La pila es la que muestra el push y el pop.

---

## 10. Cierre

**Habla:** los tres

**En la diapositiva**

- Léxico: AFD
- Balanceo: pila
- Sintaxis: descenso recursivo y árbol
- Semántico: tabla de símbolos
- Interfaz: muestra las cuatro fases

**Decir:** Cada quien puede explicar su parte si hay preguntas. El código de cada fase está en su carpeta.
