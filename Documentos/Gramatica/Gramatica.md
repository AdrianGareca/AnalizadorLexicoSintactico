# Gramática del mini-lenguaje

El analizador sintáctico revisa que el código cumpla esta **gramática libre de contexto**. Está escrita en **BNF extendida (EBNF)**, que es BNF con dos atajos:

- `{ X }` quiere decir que X se repite **cero o más veces**.
- `[ X ]` quiere decir que X es **opcional** (aparece cero o una vez).
- Lo que va entre comillas es un símbolo terminal, tal cual aparece en el código: `"si"`, `";"`.
- Lo que va en mayúsculas es un token que entrega el léxico: `IDENTIFICADOR`, `NUMERO_ENTERO`, `NUMERO_REAL`, `CADENA`, `OPERADOR_RELACIONAL`.
- Lo que va entre `< >` es un símbolo no terminal, es decir, una regla.

El símbolo inicial es `<programa>`.

## Reglas

```
<programa>     ::= { <sentencia> } EOF

<sentencia>    ::= <declaracion> | <asignacion> | <si> | <mientras> | <imprimir>

<declaracion>  ::= <tipo> IDENTIFICADOR [ "[" NUMERO_ENTERO "]" ] [ "=" <expresion> ] ";"
<tipo>         ::= "entero" | "real" | "cadena"

<asignacion>   ::= IDENTIFICADOR [ "[" <expresion> "]" ] "=" <expresion> ";"

<si>           ::= "si" "(" <condicion> ")" <bloque> [ "sino" <bloque> ]
<mientras>     ::= "mientras" "(" <condicion> ")" <bloque>
<imprimir>     ::= "imprimir" "(" <expresion> ")" ";"
<bloque>       ::= "{" { <sentencia> } "}"

<condicion>    ::= <expresion> OPERADOR_RELACIONAL <expresion>

<expresion>    ::= <termino> { ( "+" | "-" ) <termino> }
<termino>      ::= <factor> { ( "*" | "/" ) <factor> }
<factor>       ::= NUMERO_ENTERO | NUMERO_REAL | CADENA
                 | IDENTIFICADOR [ "[" <expresion> "]" ]
                 | "(" <expresion> ")"
                 | "-" <factor>
```

`<expresion>` y `<termino>` están separadas para respetar la **precedencia**: primero se agrupan `*` y `/` (en `<termino>`) y después `+` y `-` (en `<expresion>`). Por eso `a + b * c` se lee como `a + (b * c)`.

## Las mismas reglas en BNF pura

BNF pura no tiene `{ }` ni `[ ]`. Las repeticiones se escriben con recursión y lo opcional con la cadena vacía **ε**. Por ejemplo:

```
<programa>      ::= <sentencias> EOF
<sentencias>    ::= <sentencia> <sentencias> | ε

<expresion>     ::= <termino> <expresion'>
<expresion'>    ::= "+" <termino> <expresion'> | "-" <termino> <expresion'> | ε

<termino>       ::= <factor> <termino'>
<termino'>      ::= "*" <factor> <termino'> | "/" <factor> <termino'> | ε

<si>            ::= "si" "(" <condicion> ")" <bloque> <sino>
<sino>          ::= "sino" <bloque> | ε
```

La recursión es por la **derecha** (`<expresion'>` se llama a sí misma al final) porque un analizador **descendente recursivo** no puede usar recursión por la izquierda: con `<expresion> ::= <expresion> "+" <termino>` se llamaría a sí mismo para siempre sin leer ningún token.

## Cómo se usa en el código

El analizador (`Sintactico/AnalizadorSintactico.cs`) es **descendente recursivo**: cada regla es un método con el mismo nombre (`Declaracion()`, `Si()`, `Expresion()`, `Factor()`…). Cada método mira el token actual, decide qué alternativa de la regla sigue y llama a los métodos de las reglas que la forman. Las repeticiones `{ }` son `while` y lo opcional `[ ]` es un `if`.

Mientras analiza:
- Arma el **árbol de derivación**. Cada regla agrega un nodo `<regla>` y cada token leído agrega una hoja.
- Llena la **tabla de símbolos** con cada variable declarada (nombre, tipo y línea).

## Errores que detecta

**Sintácticos** (el código no cumple la gramática):
- Falta `;` al final de una sentencia.
- Expresión incompleta, por ejemplo `x = + ;`.
- En una condición se usó `=` en vez de `==`.
- `sino` sin un `si` antes.
- Falta `(`, `)`, `{` o `}` donde la regla lo pide.
- El tamaño de un arreglo no es un número entero.

**Semánticos** (con la tabla de símbolos):
- Variable usada sin declarar.
- Variable declarada dos veces.

Cuando encuentra un error de sintaxis, lo anota y salta hasta el próximo `;`, `}` o inicio de sentencia (**modo pánico**). Así sigue revisando el resto del código y puede mostrar varios errores en una sola pasada.

## Árbol de derivación de ejemplo

Para este código:

```
entero edad = 18;
si (edad >= 18) {
  imprimir("Mayor");
}
```

el analizador arma este árbol (las reglas van entre `< >` y las hojas son los tokens):

```
<programa>
├── <sentencia>
│   └── <declaracion>
│       ├── <tipo>
│       │   └── entero
│       ├── edad
│       ├── =
│       ├── <expresion>
│       │   └── <termino>
│       │       └── <factor>
│       │           └── 18
│       └── ;
└── <sentencia>
    └── <si>
        ├── si
        ├── (
        ├── <condicion>
        │   ├── <expresion>
        │   │   └── <termino>
        │   │       └── <factor>
        │   │           └── edad
        │   ├── >=
        │   └── <expresion>
        │       └── <termino>
        │           └── <factor>
        │               └── 18
        ├── )
        └── <bloque>
            ├── {
            ├── <sentencia>
            │   └── <imprimir>
            │       ├── imprimir
            │       ├── (
            │       ├── <expresion>
            │       │   └── <termino>
            │       │       └── <factor>
            │       │           └── "Mayor"
            │       ├── )
            │       └── ;
            └── }
```

Si se leen las hojas de izquierda a derecha sale el código original: `entero edad = 18 ; si ( edad >= 18 ) { imprimir ( "Mayor" ) ; }`.
