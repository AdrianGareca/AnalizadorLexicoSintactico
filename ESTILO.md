# Estilo de la ventana

Para que la app se vea igual en todas partes, los colores, las fuentes y los botones están en `AnalizadorLexicoSintactico/Comun/Tema.cs`. **No pongas colores ni fuentes a mano**: usa los de `Tema`.

## Cómo se ve

```
┌──────────────────────────────────────────────────────────────┐
│  Analizador Léxico y Sintáctico              (cabecera azul) │
│  Lenguajes Formales y Autómatas — Proyecto final             │
├────────────────┬─────────────────────────────────────────────┤
│ RESULTADOS     │ [Abrir ejemplo] [Analizar] [Limpiar]        │
│ ┌────────────┐ ├──────────────────────┬──────────────────────┤
│ │ Tokens     │ │ // código            │ Tipo   Lexema  Línea │
│ ├────────────┤ │ entero edad = 25;    │ ...                  │
│ │ Errores    │ │ si (edad >= 18) {    │                      │
│ ├────────────┤ │   imprimir("hola");  │                      │
│ │ Árbol      │ │ }                    │                      │
│ ├────────────┤ │                      │                      │
│ │ Tabla símb.│ │      (editor)        │  (resultado elegido) │
│ ├────────────┤ │                      │                      │
│ │ Pila       │ │                      │                      │
│ └────────────┘ ├──────────────────────┴──────────────────────┤
│ (menú gris)    │ Análisis terminado: 46 tokens, 0 errores.   │
└────────────────┴─────────────────────────────────────────────┘
```

- **Cabecera:** panel arriba de 80 px, color `Tema.Azul`. El título va con `Tema.Titulo` en blanco y el subtítulo con `Tema.Subtitulo` en `Color.LightBlue`.
- **Menú lateral:** panel a la izquierda de 230 px, color `Tema.Lateral`. Arriba lleva una etiqueta "RESULTADOS" con `Tema.Negrita` en `Tema.Ambar`. Los botones miden 200×36, empiezan en x = 15 y van uno debajo del otro, cada 44 px.
- **Contenido:** fondo `Tema.Fondo`. Arriba va una barra de botones de 50 px. Al medio, el editor y la tabla del resultado elegido en el menú. Abajo, un `Label` de estado de 25 px.

## Cómo usarlo

```csharp
using AnalizadorLexicoSintactico.Comun;

// en el constructor, después de InitializeComponent()
BackColor = Tema.Fondo;
Font = Tema.Normal;

Tema.BotonPrincipal(btnAnalizar);   // azul
Tema.BotonPeligro(btnLimpiar);      // rojo
// btnAbrirEjemplo se queda como botón normal

Tema.BotonMenu(btnTokens);          // botones del menú lateral
Tema.BotonMenu(btnErrores);

Tema.Grilla(dgvTokens);             // tablas de tokens, errores y símbolos
txtCodigo.Font = Tema.Codigo;       // editor (RichTextBox)
```

## Colores del código y de los errores

- En el editor: `Tema.PalabraReservada` (azul), `Tema.Numero` (naranja), `Tema.Cadena` (verde) y `Tema.Comentario` (gris).
- En la lista de errores, cada tipo tiene su color: `Tema.ColorDeError(error.Tipo)`.
