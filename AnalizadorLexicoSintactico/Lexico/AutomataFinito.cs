using System.Text;

namespace AnalizadorLexicoSintactico.Lexico
{
    /// <summary>
    /// Autómata Finito Determinista (AFD) del analizador léxico.
    ///
    /// M = (Q, Σ, δ, q0, F)
    ///   Q  = { q0 ... q18 }
    ///   Σ  = clases de caracteres (letra, dígito, punto, comilla, ...)
    ///   δ  = la tabla de transiciones (matriz Transiciones)
    ///   q0 = estado inicial
    ///   F  = estados finales (marcados en EsFinal)
    ///
    /// Para no tener una columna por cada carácter, los caracteres se agrupan
    /// en "clases" (todas las letras se comportan igual, todos los dígitos igual, etc.).
    /// </summary>
    public static class AutomataFinito
    {
        // ------------------------------------------------------------------
        // ALFABETO: clases de caracteres (columnas de la tabla)
        // ------------------------------------------------------------------
        public const int C_LETRA = 0;   // a-z A-Z _ (y letras con tilde, ñ)
        public const int C_DIGITO = 1;  // 0-9
        public const int C_PUNTO = 2;   // .
        public const int C_COMILLA = 3; // "
        public const int C_BARRA = 4;   // /
        public const int C_IGUAL = 5;   // =
        public const int C_EXCLAM = 6;  // !
        public const int C_MENOR = 7;   // <
        public const int C_MAYOR = 8;   // >
        public const int C_OPARIT = 9;  // + - *
        public const int C_DELIM = 10;  // ( ) [ ] { } ; ,
        public const int C_SALTO = 11;  // \n
        public const int C_OTRO = 12;   // cualquier otro (espacio, @, #, $, ...)
        public const int NUM_CLASES = 13;

        public static readonly string[] NombresClases =
        {
            "letra", "dígito", ".", "\"", "/", "=", "!", "<", ">", "+ - *", "delim", "\\n", "otro"
        };

        // ------------------------------------------------------------------
        // ESTADOS (filas de la tabla)
        // ------------------------------------------------------------------
        public const int Q0_INICIO = 0;
        public const int Q1_IDENTIFICADOR = 1;
        public const int Q2_ENTERO = 2;
        public const int Q3_PUNTO_DECIMAL = 3;   // "7." -> falta un dígito
        public const int Q4_REAL = 4;
        public const int Q5_CADENA_ABIERTA = 5;  // dentro de "...
        public const int Q6_CADENA = 6;          // "..." cerrada
        public const int Q7_DIVISION = 7;        // /
        public const int Q8_COMENTARIO = 8;      // // ...
        public const int Q9_ASIGNACION = 9;      // =
        public const int Q10_IGUAL = 10;         // ==
        public const int Q11_EXCLAMACION = 11;   // ! (solo, no es válido)
        public const int Q12_DIFERENTE = 12;     // !=
        public const int Q13_MENOR = 13;         // <
        public const int Q14_MENOR_IGUAL = 14;   // <=
        public const int Q15_MAYOR = 15;         // >
        public const int Q16_MAYOR_IGUAL = 16;   // >=
        public const int Q17_OP_ARITMETICO = 17; // + - *
        public const int Q18_DELIMITADOR = 18;   // ( ) [ ] { } ; ,
        public const int NUM_ESTADOS = 19;

        /// <summary>Valor de la tabla cuando no hay transición.</summary>
        public const int SIN_TRANSICION = -1;

        public static readonly string[] NombresEstados =
        {
            "Inicio", "Identificador", "Entero", "Punto decimal", "Real",
            "Cadena abierta", "Cadena", "División", "Comentario", "Asignación",
            "Igual (==)", "Exclamación", "Diferente (!=)", "Menor", "Menor o igual",
            "Mayor", "Mayor o igual", "Op. aritmético", "Delimitador"
        };

        // ------------------------------------------------------------------
        // FUNCIÓN DE TRANSICIÓN δ(estado, clase) -> estado siguiente
        // ------------------------------------------------------------------
        private const int X = SIN_TRANSICION;

        public static readonly int[,] Transiciones = new int[NUM_ESTADOS, NUM_CLASES]
        {
            //            letra dig  .   "   /   =   !   <   >  +-*  del  \n otro
            /* q0  */   {  1,   2,  X,  5,  7,  9, 11, 13, 15, 17, 18,  X,  X },
            /* q1  */   {  1,   1,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q2  */   {  X,   2,  3,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q3  */   {  X,   4,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q4  */   {  X,   4,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q5  */   {  5,   5,  5,  6,  5,  5,  5,  5,  5,  5,  5,  X,  5 },
            /* q6  */   {  X,   X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q7  */   {  X,   X,  X,  X,  8,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q8  */   {  8,   8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  X,  8 },
            /* q9  */   {  X,   X,  X,  X,  X, 10,  X,  X,  X,  X,  X,  X,  X },
            /* q10 */   {  X,   X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q11 */   {  X,   X,  X,  X,  X, 12,  X,  X,  X,  X,  X,  X,  X },
            /* q12 */   {  X,   X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q13 */   {  X,   X,  X,  X,  X, 14,  X,  X,  X,  X,  X,  X,  X },
            /* q14 */   {  X,   X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q15 */   {  X,   X,  X,  X,  X, 16,  X,  X,  X,  X,  X,  X,  X },
            /* q16 */   {  X,   X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q17 */   {  X,   X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
            /* q18 */   {  X,   X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X,  X },
        };

        // ------------------------------------------------------------------
        // ESTADOS FINALES (F)
        // ------------------------------------------------------------------
        private static readonly bool[] esFinal =
        {
            false, // q0  Inicio
            true,  // q1  Identificador / palabra reservada
            true,  // q2  Entero
            false, // q3  Punto decimal (incompleto)
            true,  // q4  Real
            false, // q5  Cadena abierta (incompleta)
            true,  // q6  Cadena
            true,  // q7  División
            true,  // q8  Comentario (se acepta, pero se ignora)
            true,  // q9  Asignación
            true,  // q10 ==
            false, // q11 ! solo (incompleto)
            true,  // q12 !=
            true,  // q13 <
            true,  // q14 <=
            true,  // q15 >
            true,  // q16 >=
            true,  // q17 + - *
            true,  // q18 delimitador
        };

        public static bool EsFinal(int estado)
        {
            return estado >= 0 && estado < NUM_ESTADOS && esFinal[estado];
        }

        /// <summary>Convierte un carácter en su clase (columna de la tabla).</summary>
        public static int ObtenerClase(char c)
        {
            if (char.IsLetter(c) || c == '_') return C_LETRA;
            if (c >= '0' && c <= '9') return C_DIGITO;
            switch (c)
            {
                case '.': return C_PUNTO;
                case '"': return C_COMILLA;
                case '/': return C_BARRA;
                case '=': return C_IGUAL;
                case '!': return C_EXCLAM;
                case '<': return C_MENOR;
                case '>': return C_MAYOR;
                case '+':
                case '-':
                case '*': return C_OPARIT;
                case '(': case ')':
                case '[': case ']':
                case '{': case '}':
                case ';': case ',': return C_DELIM;
                case '\n': return C_SALTO;
                default: return C_OTRO;
            }
        }

        /// <summary>δ(estado, c): estado siguiente, o SIN_TRANSICION (-1).</summary>
        public static int Transicion(int estado, char c)
        {
            if (estado < 0 || estado >= NUM_ESTADOS) return SIN_TRANSICION;
            return Transiciones[estado, ObtenerClase(c)];
        }

        /// <summary>
        /// Tipo de token que corresponde a un estado final.
        /// (q1 devuelve Identificador; el analizador revisa luego si es palabra reservada.)
        /// </summary>
        public static TipoToken? TipoDeEstado(int estado)
        {
            switch (estado)
            {
                case Q1_IDENTIFICADOR: return TipoToken.Identificador;
                case Q2_ENTERO: return TipoToken.NumeroEntero;
                case Q4_REAL: return TipoToken.NumeroReal;
                case Q6_CADENA: return TipoToken.Cadena;
                case Q7_DIVISION:
                case Q17_OP_ARITMETICO: return TipoToken.OperadorAritmetico;
                case Q9_ASIGNACION: return TipoToken.Asignacion;
                case Q10_IGUAL:
                case Q12_DIFERENTE:
                case Q13_MENOR:
                case Q14_MENOR_IGUAL:
                case Q15_MAYOR:
                case Q16_MAYOR_IGUAL: return TipoToken.OperadorRelacional;
                case Q18_DELIMITADOR: return TipoToken.Delimitador;
                default: return null; // q8 (comentario) y estados no finales
            }
        }

        /// <summary>Tabla de transiciones en texto (para depurar o para el informe).</summary>
        public static string TablaComoTexto()
        {
            var sb = new StringBuilder();
            sb.Append("Estado".PadRight(8));
            foreach (var nombre in NombresClases) sb.Append(nombre.PadLeft(7));
            sb.AppendLine();
            for (int e = 0; e < NUM_ESTADOS; e++)
            {
                string fila = (EsFinal(e) ? "*q" : " q") + e;
                if (e == Q0_INICIO) fila = "->q0";
                sb.Append(fila.PadRight(8));
                for (int c = 0; c < NUM_CLASES; c++)
                {
                    int d = Transiciones[e, c];
                    sb.Append((d == SIN_TRANSICION ? "-" : "q" + d).PadLeft(7));
                }
                sb.AppendLine();
            }
            return sb.ToString();
        }
    }
}
