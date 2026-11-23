using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using AnalizadorLexicoSintactico.Comun;
using AnalizadorLexicoSintactico.Lexico;
using AnalizadorLexicoSintactico.Sintactico;

namespace AnalizadorLexicoSintactico.Interfaz
{
    // Ventana principal.
    // El análisis va en este orden: léxico, balanceo y sintáctico.
    // Aunque una fase encuentre errores, se corren las tres para mostrar
    // todo lo que se alcanzó a reconocer.
    public partial class FrmPrincipal : Form
    {
        private bool coloreando;

        public FrmPrincipal()
        {
            InitializeComponent();
            AplicarTema();
            PrepararGrillas();
            MostrarVista(btnTokens);
            lblEstado.Text = "Escribe código o abre un ejemplo, y pulsa Analizar.";
        }

        // Colores, fuentes y botones. Todo sale de Tema: no hay colores puestos a mano.
        private void AplicarTema()
        {
            BackColor = Tema.Fondo;
            Font = Tema.Normal;

            pnlCabecera.BackColor = Tema.Azul;
            lblTitulo.ForeColor = Color.White;
            lblTitulo.Font = Tema.Titulo;
            lblSubtitulo.ForeColor = Color.LightBlue;
            lblSubtitulo.Font = Tema.Subtitulo;

            pnlLateral.BackColor = Tema.Lateral;
            lblResultados.ForeColor = Tema.Ambar;
            lblResultados.Font = Tema.Negrita;

            pnlContenido.BackColor = Tema.Fondo;
            pnlBotones.BackColor = Tema.Fondo;

            btnAbrirEjemplo.Font = Tema.Normal;
            Tema.BotonPrincipal(btnAnalizar);
            Tema.BotonPeligro(btnLimpiar);
            btnLimpiar.Font = Tema.Boton;

            Tema.BotonMenu(btnTokens);
            Tema.BotonMenu(btnErrores);
            Tema.BotonMenu(btnArbol);
            Tema.BotonMenu(btnSimbolos);
            Tema.BotonMenu(btnPila);

            Tema.Grilla(dgvTokens);
            Tema.Grilla(dgvErrores);
            Tema.Grilla(dgvSimbolos);
            dgvTokens.Font = Tema.Normal;
            dgvErrores.Font = Tema.Normal;
            dgvSimbolos.Font = Tema.Normal;

            txtCodigo.Font = Tema.Codigo;
            txtCodigo.BackColor = Color.White;
            txtCodigo.ForeColor = Tema.TextoOscuro;

            tvArbol.Font = Tema.Normal;
            tvArbol.BackColor = Color.White;
            lstPila.Font = Tema.Normal;
            lstPila.BackColor = Color.White;

            lblEstado.Font = Tema.Normal;
            lblEstado.ForeColor = Tema.TextoOscuro;
            lblEstado.BackColor = Tema.Fondo;
        }

        private void PrepararGrillas()
        {
            dgvTokens.Columns.Add("Tipo", "Tipo");
            dgvTokens.Columns.Add("Lexema", "Lexema");
            dgvTokens.Columns.Add("Linea", "Línea");
            dgvTokens.Columns.Add("Columna", "Columna");
            dgvTokens.Columns["Linea"].FillWeight = 40;
            dgvTokens.Columns["Columna"].FillWeight = 45;

            dgvErrores.Columns.Add("Tipo", "Tipo");
            dgvErrores.Columns.Add("Mensaje", "Mensaje");
            dgvErrores.Columns.Add("Linea", "Línea");
            dgvErrores.Columns.Add("Columna", "Columna");
            dgvErrores.Columns["Mensaje"].FillWeight = 220;
            dgvErrores.Columns["Linea"].FillWeight = 40;
            dgvErrores.Columns["Columna"].FillWeight = 45;

            dgvSimbolos.Columns.Add("Nombre", "Nombre");
            dgvSimbolos.Columns.Add("Tipo", "Tipo");
            dgvSimbolos.Columns.Add("Linea", "Línea");
            dgvSimbolos.Columns["Linea"].FillWeight = 40;
        }

        private void FrmPrincipal_Load(object sender, EventArgs e)
        {
            int mitad = splitContenido.Width / 2;
            if (mitad > 50 && mitad < splitContenido.Width - 50)
                splitContenido.SplitterDistance = mitad;
        }

        private void btnVista_Click(object sender, EventArgs e)
        {
            MostrarVista((Button)sender);
        }

        // El menú de la izquierda muestra una sola vista a la vez.
        private void MostrarVista(Button boton)
        {
            dgvTokens.Visible = boton == btnTokens;
            dgvErrores.Visible = boton == btnErrores;
            tvArbol.Visible = boton == btnArbol;
            dgvSimbolos.Visible = boton == btnSimbolos;
            lstPila.Visible = boton == btnPila;

            if (boton == btnTokens)
                dgvTokens.BringToFront();
            else if (boton == btnErrores)
                dgvErrores.BringToFront();
            else if (boton == btnArbol)
                tvArbol.BringToFront();
            else if (boton == btnSimbolos)
                dgvSimbolos.BringToFront();
            else
                lstPila.BringToFront();

            MarcarBoton(boton);
        }

        private void MarcarBoton(Button activo)
        {
            Button[] botones = { btnTokens, btnErrores, btnArbol, btnSimbolos, btnPila };
            foreach (Button boton in botones)
            {
                if (boton == activo)
                    boton.BackColor = Tema.Azul;
                else
                    boton.BackColor = Tema.BotonLateral;
            }
        }

        private void btnAnalizar_Click(object sender, EventArgs e)
        {
            AnalizarCodigo();
        }

        private void AnalizarCodigo()
        {
            AnalizadorLexico lexico = new AnalizadorLexico();
            List<Token> tokens = lexico.Analizar(txtCodigo.Text);

            VerificadorBalanceo balanceo = new VerificadorBalanceo();
            balanceo.Verificar(tokens);

            AnalizadorSintactico sintactico = new AnalizadorSintactico();
            ArbolSintactico arbol = sintactico.Analizar(tokens);

            List<ErrorAnalisis> errores = new List<ErrorAnalisis>();
            errores.AddRange(lexico.Errores);
            errores.AddRange(balanceo.Errores);
            errores.AddRange(sintactico.Errores);

            LlenarTokens(tokens);
            LlenarErrores(errores);
            LlenarArbol(arbol);
            LlenarSimbolos(sintactico.Tabla);
            LlenarPila(balanceo.Pasos);

            int cantidadTokens = 0;
            foreach (Token token in tokens)
            {
                if (token.Tipo != TipoToken.FinArchivo)
                    cantidadTokens++;
            }

            lblEstado.Text = "Análisis terminado: " + cantidadTokens
                + " tokens, " + errores.Count + " errores.";

            if (errores.Count > 0)
                MostrarVista(btnErrores);
            else
                MostrarVista(btnTokens);
        }

        private void LlenarTokens(List<Token> tokens)
        {
            dgvTokens.Rows.Clear();
            foreach (Token token in tokens)
            {
                dgvTokens.Rows.Add(token.Tipo.ToString(), token.Texto, token.Linea, token.Columna);
            }
        }

        private void LlenarErrores(List<ErrorAnalisis> errores)
        {
            dgvErrores.Rows.Clear();
            foreach (ErrorAnalisis error in errores)
            {
                int fila = dgvErrores.Rows.Add(NombreDeError(error.Tipo), error.Mensaje, error.Linea, error.Columna);
                dgvErrores.Rows[fila].DefaultCellStyle.ForeColor = Tema.ColorDeError(error.Tipo);
            }
        }

        private string NombreDeError(TipoError tipo)
        {
            switch (tipo)
            {
                case TipoError.Lexico: return "Léxico";
                case TipoError.Balanceo: return "Balanceo";
                case TipoError.Sintactico: return "Sintáctico";
                case TipoError.Semantico: return "Semántico";
                default: return tipo.ToString();
            }
        }

        private void LlenarArbol(ArbolSintactico arbol)
        {
            tvArbol.Nodes.Clear();
            if (arbol == null || arbol.Raiz == null)
                return;

            tvArbol.Nodes.Add(CrearNodo(arbol.Raiz));
            tvArbol.ExpandAll();
        }

        // Cada regla de la gramática es un nodo; cada token es una hoja.
        private TreeNode CrearNodo(NodoArbol nodo)
        {
            TreeNode visual = new TreeNode(nodo.Nombre);
            foreach (NodoArbol hijo in nodo.Hijos)
                visual.Nodes.Add(CrearNodo(hijo));
            return visual;
        }

        private void LlenarSimbolos(TablaSimbolos tabla)
        {
            dgvSimbolos.Rows.Clear();
            foreach (Simbolo simbolo in tabla.Simbolos)
            {
                dgvSimbolos.Rows.Add(simbolo.Nombre, simbolo.Tipo, simbolo.Linea);
            }
        }

        private void LlenarPila(List<string> pasos)
        {
            lstPila.Items.Clear();
            foreach (string paso in pasos)
                lstPila.Items.Add(paso);
        }

        private void btnLimpiar_Click(object sender, EventArgs e)
        {
            txtCodigo.Clear();
            dgvTokens.Rows.Clear();
            dgvErrores.Rows.Clear();
            dgvSimbolos.Rows.Clear();
            tvArbol.Nodes.Clear();
            lstPila.Items.Clear();
            MostrarVista(btnTokens);
            lblEstado.Text = "Listo para analizar.";
        }

        private void btnAbrirEjemplo_Click(object sender, EventArgs e)
        {
            using (OpenFileDialog dialogo = new OpenFileDialog())
            {
                dialogo.Title = "Abrir ejemplo";
                dialogo.Filter = "Ejemplos (*.txt)|*.txt";
                dialogo.InitialDirectory = BuscarCarpetaEjemplos();

                if (dialogo.ShowDialog(this) != DialogResult.OK)
                    return;

                try
                {
                    txtCodigo.Text = File.ReadAllText(dialogo.FileName);
                    lblEstado.Text = "Ejemplo cargado: " + Path.GetFileName(dialogo.FileName) + ". Pulsa Analizar.";
                }
                catch (IOException)
                {
                    MessageBox.Show("No se pudo leer el archivo.", "Abrir ejemplo");
                }
            }
        }

        // Los ejemplos se copian junto al .exe. Si todavía no, se buscan en el proyecto.
        private string BuscarCarpetaEjemplos()
        {
            string juntoAlExe = Path.Combine(AppContext.BaseDirectory, "Ejemplos");
            if (Directory.Exists(juntoAlExe))
                return juntoAlExe;

            DirectoryInfo dir = new DirectoryInfo(AppContext.BaseDirectory);
            while (dir != null)
            {
                string enProyecto = Path.Combine(dir.FullName, "AnalizadorLexicoSintactico", "Ejemplos");
                if (Directory.Exists(enProyecto))
                    return enProyecto;

                string aqui = Path.Combine(dir.FullName, "Ejemplos");
                if (File.Exists(Path.Combine(aqui, "correcto.txt")))
                    return aqui;

                dir = dir.Parent;
            }

            return AppContext.BaseDirectory;
        }

        private void txtCodigo_TextChanged(object sender, EventArgs e)
        {
            ColorearCodigo();
        }

        // Pinta palabras reservadas, números, cadenas y comentarios con los colores de Tema.
        private void ColorearCodigo()
        {
            if (coloreando)
                return;

            coloreando = true;
            try
            {
                int cursor = txtCodigo.SelectionStart;
                int seleccion = txtCodigo.SelectionLength;
                string texto = txtCodigo.Text;

                txtCodigo.SelectAll();
                txtCodigo.SelectionColor = Tema.TextoOscuro;

                int i = 0;
                while (i < texto.Length)
                {
                    if (i + 1 < texto.Length && texto[i] == '/' && texto[i + 1] == '/')
                    {
                        int fin = texto.IndexOf('\n', i);
                        if (fin < 0)
                            fin = texto.Length;
                        Pintar(i, fin - i, Tema.Comentario);
                        i = fin;
                    }
                    else if (texto[i] == '"')
                    {
                        int fin = i + 1;
                        while (fin < texto.Length && texto[fin] != '"' && texto[fin] != '\n')
                            fin++;
                        if (fin < texto.Length && texto[fin] == '"')
                            fin++;
                        Pintar(i, fin - i, Tema.Cadena);
                        i = fin;
                    }
                    else if (char.IsDigit(texto[i]))
                    {
                        int fin = i + 1;
                        while (fin < texto.Length && (char.IsDigit(texto[fin]) || texto[fin] == '.'))
                            fin++;
                        Pintar(i, fin - i, Tema.Numero);
                        i = fin;
                    }
                    else if (EsLetra(texto[i]))
                    {
                        int fin = i + 1;
                        while (fin < texto.Length && (EsLetra(texto[fin]) || char.IsDigit(texto[fin])))
                            fin++;
                        string palabra = texto.Substring(i, fin - i);
                        if (PalabrasReservadas.EsReservada(palabra))
                            Pintar(i, fin - i, Tema.PalabraReservada);
                        i = fin;
                    }
                    else
                    {
                        i++;
                    }
                }

                if (cursor > texto.Length)
                    cursor = texto.Length;
                txtCodigo.Select(cursor, seleccion);
                if (seleccion == 0)
                    txtCodigo.SelectionColor = Tema.TextoOscuro;
            }
            finally
            {
                coloreando = false;
            }
        }

        private void Pintar(int desde, int cantidad, Color color)
        {
            if (cantidad <= 0)
                return;
            txtCodigo.Select(desde, cantidad);
            txtCodigo.SelectionColor = color;
        }

        private static bool EsLetra(char c)
        {
            return char.IsLetter(c) || c == '_';
        }
    }
}
