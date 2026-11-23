using System;
using System.Collections.Generic;
using System.Text;
using AnalizadorLexicoSintactico.Comun;
using AnalizadorLexicoSintactico.Lexico;

namespace AnalizadorLexicoSintactico.Sintactico
{
    public class AnalizadorSintactico
    {
        public List<ErrorAnalisis> Errores { get; } = new List<ErrorAnalisis>();
        public TablaSimbolos Tabla { get; } = new TablaSimbolos();

        private List<Token> tokens;
        private int posicion;

        private class ErrorDeSintaxis : Exception { }

        public ArbolSintactico Analizar(List<Token> listaTokens)
        {
            Errores.Clear();
            Tabla.Limpiar();
            tokens = new List<Token>(listaTokens);
            posicion = 0;

            if (tokens.Count == 0 || tokens[tokens.Count - 1].Tipo != TipoToken.FinArchivo)
            {
                int ultimaLinea = tokens.Count > 0 ? tokens[tokens.Count - 1].Linea : 1;
                tokens.Add(new Token(TipoToken.FinArchivo, "EOF", ultimaLinea, 1));
            }

            NodoArbol raiz = new NodoArbol("<programa>");
            Programa(raiz);
            return new ArbolSintactico(raiz);
        }

        private void Programa(NodoArbol nodo)
        {
            while (Actual.Tipo != TipoToken.FinArchivo)
            {
                Sentencia(nodo);
            }
        }

        private void Sentencia(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<sentencia>");
            int inicio = posicion;

            try
            {
                if (Es("entero") || Es("real") || Es("cadena"))
                    Declaracion(nodo);
                else if (Actual.Tipo == TipoToken.Identificador)
                    Asignacion(nodo);
                else if (Es("si"))
                    Si(nodo);
                else if (Es("mientras"))
                    Mientras(nodo);
                else if (Es("imprimir"))
                    Imprimir(nodo);
                else if (Es("sino"))
                    Error("Hay un 'sino' sin un 'si' antes", Actual);
                else
                    Error("No se esperaba " + Describir(Actual) + " al inicio de una sentencia", Actual);
            }
            catch (ErrorDeSintaxis)
            {
                nodo.Agregar("(error)");
                Sincronizar(inicio);
            }
        }

        private void Declaracion(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<declaracion>");

            NodoArbol nodoTipo = nodo.Agregar("<tipo>");
            string tipo = Actual.Texto;
            Avanzar(nodoTipo);

            Token variable = EsperarTipo(TipoToken.Identificador, "el nombre de la variable", nodo);

            if (Es("["))
            {
                Avanzar(nodo);
                Token tamano = EsperarTipo(TipoToken.NumeroEntero, "el tamaño del arreglo (un número entero)", nodo);
                Esperar("]", nodo);
                tipo = tipo + "[" + tamano.Texto + "]";
            }

            if (Es("="))
            {
                Avanzar(nodo);
                Expresion(nodo);
            }

            if (!Tabla.Agregar(variable.Texto, tipo, variable.Linea))
            {
                ErrorSemantico("La variable '" + variable.Texto + "' ya fue declarada en la línea "
                    + Tabla.Buscar(variable.Texto).Linea, variable);
            }

            Esperar(";", nodo);
        }

        private void Asignacion(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<asignacion>");

            Token variable = Actual;
            Avanzar(nodo);
            RevisarDeclarada(variable);

            if (Es("["))
            {
                Avanzar(nodo);
                Expresion(nodo);
                Esperar("]", nodo);
            }

            Esperar("=", nodo);
            Expresion(nodo);
            Esperar(";", nodo);
        }

        private void Si(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<si>");
            Esperar("si", nodo);
            Esperar("(", nodo);
            Condicion(nodo);
            Esperar(")", nodo);
            Bloque(nodo);

            if (Es("sino"))
            {
                Avanzar(nodo);
                Bloque(nodo);
            }
        }

        private void Mientras(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<mientras>");
            Esperar("mientras", nodo);
            Esperar("(", nodo);
            Condicion(nodo);
            Esperar(")", nodo);
            Bloque(nodo);
        }

        private void Imprimir(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<imprimir>");
            Esperar("imprimir", nodo);
            Esperar("(", nodo);
            Expresion(nodo);
            Esperar(")", nodo);
            Esperar(";", nodo);
        }

        private void Bloque(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<bloque>");
            Esperar("{", nodo);

            while (!Es("}") && Actual.Tipo != TipoToken.FinArchivo)
            {
                Sentencia(nodo);
            }

            Esperar("}", nodo);
        }

        private void Condicion(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<condicion>");
            Expresion(nodo);

            if (Es("="))
                Error("En una condición se compara con '==', no con '='", Actual);
            if (Actual.Tipo != TipoToken.OperadorRelacional)
                Error("Se esperaba un operador de comparación (==, !=, <, >, <=, >=) y se encontró " + Describir(Actual), Actual);

            Avanzar(nodo);
            Expresion(nodo);
        }

        private void Expresion(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<expresion>");
            Termino(nodo);

            while (Es("+") || Es("-"))
            {
                Avanzar(nodo);
                Termino(nodo);
            }
        }

        private void Termino(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<termino>");
            Factor(nodo);

            while (Es("*") || Es("/"))
            {
                Avanzar(nodo);
                Factor(nodo);
            }
        }

        private void Factor(NodoArbol padre)
        {
            NodoArbol nodo = padre.Agregar("<factor>");
            Token token = Actual;

            if (token.Tipo == TipoToken.NumeroEntero || token.Tipo == TipoToken.NumeroReal || token.Tipo == TipoToken.Cadena)
            {
                Avanzar(nodo);
            }
            else if (token.Tipo == TipoToken.Identificador)
            {
                Avanzar(nodo);
                RevisarDeclarada(token);

                if (Es("["))
                {
                    Avanzar(nodo);
                    Expresion(nodo);
                    Esperar("]", nodo);
                }
            }
            else if (Es("("))
            {
                Avanzar(nodo);
                Expresion(nodo);
                Esperar(")", nodo);
            }
            else if (Es("-"))
            {
                Avanzar(nodo);
                Factor(nodo);
            }
            else
            {
                Error("Se esperaba un número, una variable, una cadena o '(' y se encontró " + Describir(token), token);
            }
        }

        private Token Actual
        {
            get { return tokens[posicion]; }
        }

        private Token Anterior
        {
            get { return posicion > 0 ? tokens[posicion - 1] : tokens[0]; }
        }

        private bool Es(string texto)
        {
            return Actual.Texto == texto;
        }

        private void Avanzar(NodoArbol nodo)
        {
            nodo.Agregar(Actual.Texto);
            if (Actual.Tipo != TipoToken.FinArchivo)
                posicion++;
        }

        private void Esperar(string texto, NodoArbol nodo)
        {
            if (Es(texto))
            {
                Avanzar(nodo);
                return;
            }

            if (texto == ";")
            {
                Token anterior = Anterior;
                Errores.Add(new ErrorAnalisis(TipoError.Sintactico,
                    "Falta ';' después de '" + anterior.Texto + "'",
                    anterior.Linea, anterior.Columna + anterior.Texto.Length));
                throw new ErrorDeSintaxis();
            }

            Error("Se esperaba '" + texto + "' y se encontró " + Describir(Actual), Actual);
        }

        private Token EsperarTipo(TipoToken tipo, string descripcion, NodoArbol nodo)
        {
            Token token = Actual;
            if (token.Tipo != tipo)
                Error("Se esperaba " + descripcion + " y se encontró " + Describir(token), token);

            Avanzar(nodo);
            return token;
        }

        private string Describir(Token token)
        {
            if (token.Tipo == TipoToken.FinArchivo)
                return "el final del código";
            return "'" + token.Texto + "'";
        }

        private void Error(string mensaje, Token token)
        {
            Errores.Add(new ErrorAnalisis(TipoError.Sintactico, mensaje, token.Linea, token.Columna));
            throw new ErrorDeSintaxis();
        }

        private void ErrorSemantico(string mensaje, Token token)
        {
            Errores.Add(new ErrorAnalisis(TipoError.Semantico, mensaje, token.Linea, token.Columna));
        }

        private void RevisarDeclarada(Token variable)
        {
            if (!Tabla.Existe(variable.Texto))
                ErrorSemantico("La variable '" + variable.Texto + "' no está declarada", variable);
        }

        private void Sincronizar(int inicio)
        {
            if (posicion == inicio && Actual.Tipo != TipoToken.FinArchivo)
                posicion++;

            while (Actual.Tipo != TipoToken.FinArchivo)
            {
                if (Es(";"))
                {
                    posicion++;
                    return;
                }
                if (Es("}") || EmpiezaSentencia())
                    return;
                if (Es("{"))
                {
                    SaltarBloque();
                    continue;
                }
                posicion++;
            }
        }

        private void SaltarBloque()
        {
            int nivel = 0;
            while (Actual.Tipo != TipoToken.FinArchivo)
            {
                if (Es("{")) nivel++;
                if (Es("}")) nivel--;
                posicion++;
                if (nivel == 0)
                    return;
            }
        }

        private bool EmpiezaSentencia()
        {
            return Es("entero") || Es("real") || Es("cadena")
                || Es("si") || Es("mientras") || Es("imprimir");
        }
    }
}
