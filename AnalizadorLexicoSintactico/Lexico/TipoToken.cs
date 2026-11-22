namespace AnalizadorLexicoSintactico.Lexico
{
    /// <summary>
    /// Categorías de token que reconoce el analizador léxico.
    /// </summary>
    public enum TipoToken
    {
        PalabraReservada,   // entero, real, cadena, si, sino, mientras, imprimir
        Identificador,      // x, promedio, _total, nota1
        NumeroEntero,       // 25
        NumeroReal,         // 7.5
        Cadena,             // "hola"
        OperadorAritmetico, // + - * /
        OperadorRelacional, // == != < > <= >=
        Asignacion,         // =
        Delimitador,        // ( ) [ ] { } ; ,
        FinArchivo          // marca el final de la lista (lo usa el sintáctico)
    }
}
