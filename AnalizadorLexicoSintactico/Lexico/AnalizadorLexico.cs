using System.Collections.Generic;
using AnalizadorLexicoSintactico.Comun;

namespace AnalizadorLexicoSintactico.Lexico
{
    /// <summary>
    /// Recorre el código carácter por carácter usando el AFD y arma la lista de tokens.
    ///
    /// Algoritmo (por cada token):
    ///   1. Saltar espacios, tabulaciones y saltos de línea.
    ///   2. Empezar en q0 y avanzar mientras exista transición δ(estado, c).
    ///   3. Cuando no hay transición:
    ///        - si el estado es final  -> se acepta el lexema y se crea el token;
    ///        - si no es final         -> error léxico.
    ///   4. Volver a q0 para el siguiente token.
    /// Así siempre se toma el lexema más largo posible ("<=" y no "<" + "=").
    /// </summary>
    public class AnalizadorLexico
    {
        private string codigo = "";
        private int pos;      // índice en el código
        private int linea;    // línea actual (desde 1)
        private int columna;  // columna actual (desde 1)

        public List<Token> Tokens { get; } = new List<Token>();
        public List<ErrorAnalisis> Errores { get; } = new List<ErrorAnalisis>();

        /// <summary>
        /// Recorrido del autómata, paso por paso (ej: "q0 --'x'--> q1").
        /// Sirve para mostrar en la exposición cómo cambia de estado.
        /// </summary>
        public List<string> Recorrido { get; } = new List<string>();

        /// <summary>Si es true, se llena la lista Recorrido.</summary>
        public bool GuardarRecorrido { get; set; } = true;

        public bool TieneErrores => Errores.Count > 0;

        /// <summary>
        /// Analiza el código y devuelve la lista de tokens.
        /// El último token siempre es FinArchivo.
        /// </summary>
        public List<Token> Analizar(string texto)
        {
            codigo = (texto ?? "").Replace("\r\n", "\n").Replace('\r', '\n');
            pos = 0;
            linea = 1;
            columna = 1;
            Tokens.Clear();
            Errores.Clear();
            Recorrido.Clear();

            while (true)
            {
                SaltarEspacios();
                if (pos >= codigo.Length) break;
                LeerSiguienteToken();
            }

            Tokens.Add(new Token(TipoToken.FinArchivo, "EOF", linea, columna));
            return Tokens;
        }

        // ------------------------------------------------------------------

        private void SaltarEspacios()
        {
            while (pos < codigo.Length)
            {
                char c = codigo[pos];
                if (c == ' ' || c == '\t' || c == '\n')
                    Avanzar();
                else
                    break;
            }
        }

        private void Avanzar()
        {
            if (codigo[pos] == '\n')
            {
                linea++;
                columna = 1;
            }
            else
            {
                columna++;
            }
            pos++;
        }

        private void LeerSiguienteToken()
        {
            int inicio = pos;
            int lineaInicio = linea;
            int columnaInicio = columna;
            int estado = AutomataFinito.Q0_INICIO;

            // Avanzar por el AFD mientras haya transición
            while (pos < codigo.Length)
            {
                char c = codigo[pos];
                int siguiente = AutomataFinito.Transicion(estado, c);
                if (siguiente == AutomataFinito.SIN_TRANSICION) break;

                if (GuardarRecorrido)
                    Recorrido.Add($"q{estado} --'{Mostrar(c)}'--> q{siguiente}");

                estado = siguiente;
                Avanzar();
            }

            string lexema = codigo.Substring(inicio, pos - inicio);

            // ---------- Caso 1: estado final -> token aceptado ----------
            if (AutomataFinito.EsFinal(estado))
            {
                if (GuardarRecorrido)
                    Recorrido.Add($"   q{estado} es final -> acepta '{lexema}'");

                if (estado == AutomataFinito.Q8_COMENTARIO)
                    return; // los comentarios se ignoran

                TipoToken tipo = AutomataFinito.TipoDeEstado(estado)!.Value;
                if (tipo == TipoToken.Identificador && PalabrasReservadas.EsReservada(lexema))
                    tipo = TipoToken.PalabraReservada;

                // Un número pegado a letras (ej: 2x, 3.5abc) no es un identificador válido
                if ((tipo == TipoToken.NumeroEntero || tipo == TipoToken.NumeroReal)
                    && pos < codigo.Length
                    && AutomataFinito.ObtenerClase(codigo[pos]) == AutomataFinito.C_LETRA)
                {
                    while (pos < codigo.Length)
                    {
                        int clase = AutomataFinito.ObtenerClase(codigo[pos]);
                        if (clase != AutomataFinito.C_LETRA && clase != AutomataFinito.C_DIGITO) break;
                        Avanzar();
                    }
                    lexema = codigo.Substring(inicio, pos - inicio);
                    AgregarError($"Identificador inválido '{lexema}': no puede empezar con un número",
                                 lineaInicio, columnaInicio);
                    return;
                }

                Tokens.Add(new Token(tipo, lexema, lineaInicio, columnaInicio));
                return;
            }

            // ---------- Caso 2: no es final -> error léxico ----------
            if (GuardarRecorrido)
            {
                char? c = pos < codigo.Length ? codigo[pos] : (char?)null;
                string leido = c.HasValue ? $"'{Mostrar(c.Value)}'" : "fin de archivo";
                Recorrido.Add($"   q{estado} no tiene transición con {leido} y no es final -> ERROR");
            }

            switch (estado)
            {
                case AutomataFinito.Q0_INICIO:
                    // Ni siquiera el primer carácter es válido (ej: @, #, $)
                    char malo = codigo[pos];
                    Avanzar();
                    AgregarError($"Carácter no válido '{malo}'", lineaInicio, columnaInicio);
                    break;

                case AutomataFinito.Q3_PUNTO_DECIMAL:
                    AgregarError($"Número real mal formado '{lexema}': falta un dígito después del punto",
                                 lineaInicio, columnaInicio);
                    break;

                case AutomataFinito.Q5_CADENA_ABIERTA:
                    AgregarError($"Cadena sin cerrar {lexema}: falta la comilla \" de cierre",
                                 lineaInicio, columnaInicio);
                    break;

                case AutomataFinito.Q11_EXCLAMACION:
                    AgregarError("Se esperaba '=' después de '!' (el operador es !=)",
                                 lineaInicio, columnaInicio);
                    break;

                default:
                    AgregarError($"Lexema no reconocido '{lexema}'", lineaInicio, columnaInicio);
                    break;
            }
        }

        private void AgregarError(string mensaje, int lin, int col)
        {
            Errores.Add(new ErrorAnalisis(TipoError.Lexico, mensaje, lin, col));
        }

        private static string Mostrar(char c)
        {
            if (c == '\n') return "\\n";
            if (c == '\t') return "\\t";
            if (c == ' ') return "espacio";
            return c.ToString();
        }
    }
}
