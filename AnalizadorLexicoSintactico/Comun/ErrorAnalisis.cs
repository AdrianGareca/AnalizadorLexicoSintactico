namespace AnalizadorLexicoSintactico.Comun;

public enum TipoError
{
    Lexico,
    Balanceo,
    Sintactico,
    Semantico
}

// Un error encontrado en cualquiera de las fases del análisis
public class ErrorAnalisis
{
    public TipoError Tipo { get; set; }
    public string Mensaje { get; set; }
    public int Linea { get; set; }
    public int Columna { get; set; }

    public ErrorAnalisis(TipoError tipo, string mensaje, int linea, int columna)
    {
        Tipo = tipo;
        Mensaje = mensaje;
        Linea = linea;
        Columna = columna;
    }

    public override string ToString()
    {
        return "Error " + Tipo + " (línea " + Linea + ", columna " + Columna + "): " + Mensaje;
    }
}
