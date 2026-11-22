# Analizador Léxico y Sintáctico

Proyecto final de **Lenguajes Formales y Autómatas**. Tema 1: Validador de Sintaxis o Mini-Compilador.

Es una aplicación de escritorio en **C# WinForms** (.NET 10, Visual Studio 2026). Recibe código escrito en un mini-lenguaje en español y hace cuatro cosas:

1. Separa el código en tokens con un **autómata finito determinista (AFD)**.
2. Revisa con una **pila** que los `( ) [ ] { }` estén balanceados.
3. Comprueba que el código cumpla la **gramática libre de contexto** con un parser descendente recursivo y arma el árbol de derivación.
4. Avisa si una variable se usa sin declararla o se declara dos veces, usando una **tabla de símbolos**.

## Equipo

- **P1, análisis léxico (AFD):** Dani-XD, rama `p1-lexico`.
- **P2, balanceo y análisis sintáctico:** AdrianGareca, rama `p2-sintactico`.
- **P3, interfaz, ejemplos, informe y diapositivas:** gabrielarcp, rama `p3-interfaz`.

## Antes de empezar, lee esto

- [COMO-TRABAJAR.md](COMO-TRABAJAR.md): cómo crear tu rama, cómo subir tu parte, cómo hacer el pull request y qué carpeta es de cada uno.
- [AGENTS.md](AGENTS.md): reglas para cuando trabajes con IA (ChatGPT, Copilot, Claude, Gemini, Cursor…). Léelo aunque no uses IA, porque las reglas valen para todos.

## Estructura del proyecto

```
AnalizadorLexicoSintactico.sln            (compartido)
.gitignore                                (compartido)
AnalizadorLexicoSintactico/
├── AnalizadorLexicoSintactico.csproj     (compartido)
├── Program.cs                            (compartido)
├── Comun/
│   └── ErrorAnalisis.cs                  (compartido)
├── Lexico/                               P1
│   ├── TipoToken.cs
│   ├── Token.cs
│   ├── PalabrasReservadas.cs
│   ├── AutomataFinito.cs
│   └── AnalizadorLexico.cs
├── Sintactico/                           P2
│   ├── VerificadorBalanceo.cs
│   ├── AnalizadorSintactico.cs
│   ├── NodoArbol.cs
│   ├── ArbolSintactico.cs
│   └── TablaSimbolos.cs
├── Interfaz/                             P3
│   ├── FrmPrincipal.cs
│   ├── FrmPrincipal.Designer.cs
│   └── FrmPrincipal.resx
└── Ejemplos/                             P3
    └── (un .txt correcto y uno por cada tipo de error)
Documentos/
├── AFD/                                  P1 (diagrama y tabla de transiciones)
├── Gramatica/                            P2 (gramática BNF y árbol de ejemplo)
├── Informe/                              P3
└── Presentacion/                         P3
```

## El mini-lenguaje

Lo acordamos entre los tres y las tres partes dependen de él. **No se cambia sin avisar en el grupo.**

```
// Declaraciones
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

- **Palabras reservadas:** `entero`, `real`, `cadena`, `si`, `sino`, `mientras`, `imprimir`.
- **Identificadores:** empiezan con letra o `_` y siguen con letras, dígitos o `_`.
- **Números:** enteros (`25`) y reales (`7.5`).
- **Cadenas:** van entre comillas dobles (`"hola"`).
- **Operadores aritméticos:** `+ - * /`.
- **Operadores relacionales:** `== != < > <= >=`.
- **Asignación:** `=`.
- **Delimitadores:** `( ) [ ] { } ; ,`.
- **Comentarios:** de una línea, con `//`. El léxico los ignora.

## Fechas

- **Domingo 22-nov, noche:** integración. Cada uno abre su pull request a `main`, se une todo y se prueba con los ejemplos.
- **Lunes 23-nov:** presentación. Cada uno tiene que poder explicar su parte.

## Sobre la rama `respaldo-web`

La primera versión que se subió al repo (hecha en HTML/JavaScript) está guardada **completa y sin cambios** en la rama [`respaldo-web`](https://github.com/AdrianGareca/AnalizadorLexicoSintactico/tree/respaldo-web). No se borró nada. `main` queda para el proyecto en C#.
