using System;
using System.Collections.Generic;
using System.Text;

namespace AnalizadorLexicoSintactico.Sintactico
{
    public class NodoArbol
    {
        public string Nombre { get; }
        public List<NodoArbol> Hijos { get; } = new List<NodoArbol>();

        public NodoArbol(string nombre)
        {
            Nombre = nombre;
        }

        public NodoArbol Agregar(string nombre)
        {
            NodoArbol hijo = new NodoArbol(nombre);
            Hijos.Add(hijo);
            return hijo;
        }

        public bool EsHoja
        {
            get { return Hijos.Count == 0; }
        }

        public override string ToString()
        {
            return Nombre;
        }
    }
}
