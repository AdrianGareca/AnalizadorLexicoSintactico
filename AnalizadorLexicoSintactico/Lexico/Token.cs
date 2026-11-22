namespace AnalizadorLexicoSintactico.Lexico
{
    /// <summary>
    /// Un token: la unidad mínima con significado que entrega el léxico.
    /// </summary>
    public class Token
    {
        public TipoToken Tipo { get; }
        public string Texto { get; }    // el lexema, tal como aparece en el código
        public int Linea { get; }       // empieza en 1
        public int Columna { get; }     // empieza en 1

        public Token(TipoToken tipo, string texto, int linea, int columna)
        {
            Tipo = tipo;
            Texto = texto;
            Linea = linea;
            Columna = columna;
        }

        public override string ToString()
        {
            return $"[{Linea}:{Columna}] {Tipo,-18} '{Texto}'";
        }
    }
}
