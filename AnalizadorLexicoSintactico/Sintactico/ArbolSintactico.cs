using System;
using System.Collections.Generic;
using System.Text;

namespace AnalizadorLexicoSintactico.Sintactico
{
    public class ArbolSintactico
    {
        public NodoArbol Raiz { get; }

        public ArbolSintactico(NodoArbol raiz)
        {
            Raiz = raiz;
        }

        public string ComoTexto()
        {
            StringBuilder texto = new StringBuilder();
            Escribir(Raiz, 0, texto);
            return texto.ToString();
        }

        private void Escribir(NodoArbol nodo, int nivel, StringBuilder texto)
        {
            texto.AppendLine(new string(' ', nivel * 2) + nodo.Nombre);
            foreach (NodoArbol hijo in nodo.Hijos)
            {
                Escribir(hijo, nivel + 1, texto);
            }
        }
    }
}
