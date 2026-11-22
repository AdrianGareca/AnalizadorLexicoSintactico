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
            return true;
        }
    }
}
