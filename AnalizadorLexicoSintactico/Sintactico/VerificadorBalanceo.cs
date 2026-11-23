using System;
using System.Collections.Generic;
using System.Text;
using AnalizadorLexicoSintactico.Comun;
using AnalizadorLexicoSintactico.Lexico;

namespace AnalizadorLexicoSintactico.Sintactico
{
    public class VerificadorBalanceo
    {
        public List<ErrorAnalisis> Errores { get; } = new List<ErrorAnalisis>();
        public List<string> Pasos { get; } = new List<string>();

        public bool Verificar(List<Token> tokens)
        {
            Errores.Clear();
            Pasos.Clear();
            Stack<Token> simbolo = new Stack<Token>();

            foreach (Token token in tokens)
            {
                if (token.Texto == "(" || token.Texto == "[" || token.Texto == "{")
                {
                    simbolo.Push(token);
                    Pasos.Add("Push " + token.Texto + " en linea " + token.Linea);
                }
                else if (token.Texto == ")" || token.Texto == "]" || token.Texto == "}")
                {
                    if (simbolo.Count == 0)
                    {
                        Errores.Add(new ErrorAnalisis(TipoError.Balanceo,
                            "Se cerró '" + token.Texto + "' pero no había nada abierto",
                            token.Linea, token.Columna));
                        Pasos.Add("Error: " + token.Texto + " sin abrir en linea " + token.Linea);
                    }
                    else
                    {
                        Token abierto = simbolo.Pop();

                        if (abierto.Texto == Apertura(token.Texto))
                        {
                            Pasos.Add("Pop " + abierto.Texto + " con " + token.Texto + " en linea " + token.Linea);
                        }
                        else
                        {
                            Errores.Add(new ErrorAnalisis(TipoError.Balanceo,
                                "Se esperaba cerrar '" + abierto.Texto + "' (abierto en la línea " + abierto.Linea +
                                ") pero se encontró '" + token.Texto + "'",
                                token.Linea, token.Columna));
                            Pasos.Add("Error: " + abierto.Texto + " no corresponde con " + token.Texto + " en linea " + token.Linea);
                        }
                    }
                }
            }

            while (simbolo.Count > 0)
            {
                Token abierto = simbolo.Pop();
                Errores.Add(new ErrorAnalisis(TipoError.Balanceo,
                    "Se abrió '" + abierto.Texto + "' y nunca se cerró",
                    abierto.Linea, abierto.Columna));
                Pasos.Add("Error: " + abierto.Texto + " de la linea " + abierto.Linea + " quedó sin cerrar");
            }

            return Errores.Count == 0;
        }

        private string Apertura(string cierre)
        {
            if (cierre == ")") return "(";
            if (cierre == "]") return "[";
            return "{";
        }
    }
}
