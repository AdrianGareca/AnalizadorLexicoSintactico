using System;
using System.Collections.Generic;

namespace AnalizadorLexicoSintactico.Lexico
{
    /// <summary>
    /// Palabras reservadas del mini-lenguaje.
    /// El AFD reconoce todas como "identificador" (estado q1); al terminar,
    /// se consulta esta lista para saber si en realidad es una palabra reservada.
    /// </summary>
    public static class PalabrasReservadas
    {
        private static readonly HashSet<string> palabras = new HashSet<string>(StringComparer.Ordinal)
        {
            "entero", "real", "cadena", "si", "sino", "mientras", "imprimir"
        };

        /// <summary>Lista de solo lectura (para mostrarla en la interfaz o el informe).</summary>
        public static IReadOnlyCollection<string> Lista => palabras;

        /// <summary>True si el lexema es una palabra reservada (distingue mayúsculas).</summary>
        public static bool EsReservada(string lexema)
        {
            return palabras.Contains(lexema);
        }
    }
}
