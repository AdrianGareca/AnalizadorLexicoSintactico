using System;
using System.Collections.Generic;
using System.Text;

namespace AnalizadorLexicoSintactico.Sintactico
{
    public class Simbolo
    {
        public string Nombre { get; }
        public string Tipo { get; }
        public int Linea { get; }

        public Simbolo(string nombre, string tipo, int linea)
        {
            Nombre = nombre;
            Tipo = tipo;
            Linea = linea;
        }
    }

    public class TablaSimbolos
    {
        public List<Simbolo> Simbolos { get; } = new List<Simbolo>();

        public bool Agregar(string nombre, string tipo, int linea)
        {
            if (Existe(nombre))
                return false;

            Simbolos.Add(new Simbolo(nombre, tipo, linea));
            return true;
        }

        public bool Existe(string nombre)
        {
            return Buscar(nombre) != null;
        }

        public Simbolo Buscar(string nombre)
        {
            foreach (Simbolo simbolo in Simbolos)
            {
                if (simbolo.Nombre == nombre)
                    return simbolo;
            }
            return null;
        }

        public void Limpiar()
        {
            Simbolos.Clear();
        }
    }
}
