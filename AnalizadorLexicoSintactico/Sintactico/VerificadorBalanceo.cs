using System;
using System.Collections.Generic;
using System.Text;
using AnalizadorLexicoSintactico.Comun;
using AnalizadorLexicoSintactico.Lexico;

namespace AnalizadorLexicoSintactico.Sintactico
{
    // Revisa con una pila que los ( ) [ ] { } estén bien abiertos y cerrados.
    // Trabaja sobre los tokens del léxico, así un "(" dentro de una cadena no cuenta.
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
                // Apertura: se mete a la pila
                if (token.Texto == "(" || token.Texto == "[" || token.Texto == "{")
                {
                    simbolo.Push(token);
                    Pasos.Add("Push " + token.Texto + " en linea " + token.Linea);
                }
                // Cierre: tiene que corresponder con el tope de la pila
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

            // Lo que quedó en la pila se abrió y nunca se cerró
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

        // Devuelve el símbolo que abre a cada cierre
        private string Apertura(string cierre)
        {
            if (cierre == ")") return "(";
            if (cierre == "]") return "[";
            return "{";
        }
    }
}
