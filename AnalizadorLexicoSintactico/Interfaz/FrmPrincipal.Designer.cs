namespace AnalizadorLexicoSintactico.Interfaz
{
    partial class FrmPrincipal
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
                components.Dispose();
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            this.pnlCabecera = new System.Windows.Forms.Panel();
            this.lblTitulo = new System.Windows.Forms.Label();
            this.lblSubtitulo = new System.Windows.Forms.Label();
            this.pnlLateral = new System.Windows.Forms.Panel();
            this.lblResultados = new System.Windows.Forms.Label();
            this.btnTokens = new System.Windows.Forms.Button();
            this.btnErrores = new System.Windows.Forms.Button();
            this.btnArbol = new System.Windows.Forms.Button();
            this.btnSimbolos = new System.Windows.Forms.Button();
            this.btnPila = new System.Windows.Forms.Button();
            this.pnlContenido = new System.Windows.Forms.Panel();
            this.pnlBotones = new System.Windows.Forms.Panel();
            this.btnAbrirEjemplo = new System.Windows.Forms.Button();
            this.btnAnalizar = new System.Windows.Forms.Button();
            this.btnLimpiar = new System.Windows.Forms.Button();
            this.splitContenido = new System.Windows.Forms.SplitContainer();
            this.txtCodigo = new System.Windows.Forms.RichTextBox();
            this.dgvTokens = new System.Windows.Forms.DataGridView();
            this.dgvErrores = new System.Windows.Forms.DataGridView();
            this.dgvSimbolos = new System.Windows.Forms.DataGridView();
            this.tvArbol = new System.Windows.Forms.TreeView();
            this.lstPila = new System.Windows.Forms.ListBox();
            this.lblEstado = new System.Windows.Forms.Label();
            this.pnlCabecera.SuspendLayout();
            this.pnlLateral.SuspendLayout();
            this.pnlBotones.SuspendLayout();
            this.pnlContenido.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContenido)).BeginInit();
            this.splitContenido.Panel1.SuspendLayout();
            this.splitContenido.Panel2.SuspendLayout();
            this.splitContenido.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dgvTokens)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgvErrores)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgvSimbolos)).BeginInit();
            this.SuspendLayout();
            //
            // pnlCabecera
            //
            this.pnlCabecera.Controls.Add(this.lblSubtitulo);
            this.pnlCabecera.Controls.Add(this.lblTitulo);
            this.pnlCabecera.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlCabecera.Height = 80;
            this.pnlCabecera.Name = "pnlCabecera";
            //
            // lblTitulo
            //
            this.lblTitulo.AutoSize = true;
            this.lblTitulo.Location = new System.Drawing.Point(16, 12);
            this.lblTitulo.Name = "lblTitulo";
            this.lblTitulo.Text = "Analizador Léxico y Sintáctico";
            //
            // lblSubtitulo
            //
            this.lblSubtitulo.AutoSize = true;
            this.lblSubtitulo.Location = new System.Drawing.Point(18, 46);
            this.lblSubtitulo.Name = "lblSubtitulo";
            this.lblSubtitulo.Text = "Lenguajes Formales y Autómatas — Proyecto final";
            //
            // pnlLateral
            //
            this.pnlLateral.Controls.Add(this.btnPila);
            this.pnlLateral.Controls.Add(this.btnSimbolos);
            this.pnlLateral.Controls.Add(this.btnArbol);
            this.pnlLateral.Controls.Add(this.btnErrores);
            this.pnlLateral.Controls.Add(this.btnTokens);
            this.pnlLateral.Controls.Add(this.lblResultados);
            this.pnlLateral.Dock = System.Windows.Forms.DockStyle.Left;
            this.pnlLateral.Name = "pnlLateral";
            this.pnlLateral.Width = 230;
            //
            // lblResultados
            //
            this.lblResultados.AutoSize = false;
            this.lblResultados.Location = new System.Drawing.Point(15, 16);
            this.lblResultados.Name = "lblResultados";
            this.lblResultados.Size = new System.Drawing.Size(200, 24);
            this.lblResultados.Text = "RESULTADOS";
            //
            // btnTokens
            //
            this.btnTokens.Location = new System.Drawing.Point(15, 52);
            this.btnTokens.Name = "btnTokens";
            this.btnTokens.Size = new System.Drawing.Size(200, 36);
            this.btnTokens.Text = "Tokens";
            this.btnTokens.Click += new System.EventHandler(this.btnVista_Click);
            //
            // btnErrores
            //
            this.btnErrores.Location = new System.Drawing.Point(15, 96);
            this.btnErrores.Name = "btnErrores";
            this.btnErrores.Size = new System.Drawing.Size(200, 36);
            this.btnErrores.Text = "Errores";
            this.btnErrores.Click += new System.EventHandler(this.btnVista_Click);
            //
            // btnArbol
            //
            this.btnArbol.Location = new System.Drawing.Point(15, 140);
            this.btnArbol.Name = "btnArbol";
            this.btnArbol.Size = new System.Drawing.Size(200, 36);
            this.btnArbol.Text = "Árbol";
            this.btnArbol.Click += new System.EventHandler(this.btnVista_Click);
            //
            // btnSimbolos
            //
            this.btnSimbolos.Location = new System.Drawing.Point(15, 184);
            this.btnSimbolos.Name = "btnSimbolos";
            this.btnSimbolos.Size = new System.Drawing.Size(200, 36);
            this.btnSimbolos.Text = "Tabla de símbolos";
            this.btnSimbolos.Click += new System.EventHandler(this.btnVista_Click);
            //
            // btnPila
            //
            this.btnPila.Location = new System.Drawing.Point(15, 228);
            this.btnPila.Name = "btnPila";
            this.btnPila.Size = new System.Drawing.Size(200, 36);
            this.btnPila.Text = "Pila";
            this.btnPila.Click += new System.EventHandler(this.btnVista_Click);
            //
            // pnlBotones
            //
            this.pnlBotones.Controls.Add(this.btnLimpiar);
            this.pnlBotones.Controls.Add(this.btnAnalizar);
            this.pnlBotones.Controls.Add(this.btnAbrirEjemplo);
            this.pnlBotones.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlBotones.Height = 50;
            this.pnlBotones.Name = "pnlBotones";
            //
            // btnAbrirEjemplo
            //
            this.btnAbrirEjemplo.Location = new System.Drawing.Point(12, 9);
            this.btnAbrirEjemplo.Name = "btnAbrirEjemplo";
            this.btnAbrirEjemplo.Size = new System.Drawing.Size(140, 32);
            this.btnAbrirEjemplo.Text = "Abrir ejemplo";
            this.btnAbrirEjemplo.Click += new System.EventHandler(this.btnAbrirEjemplo_Click);
            //
            // btnAnalizar
            //
            this.btnAnalizar.Location = new System.Drawing.Point(164, 9);
            this.btnAnalizar.Name = "btnAnalizar";
            this.btnAnalizar.Size = new System.Drawing.Size(120, 32);
            this.btnAnalizar.Text = "Analizar";
            this.btnAnalizar.Click += new System.EventHandler(this.btnAnalizar_Click);
            //
            // btnLimpiar
            //
            this.btnLimpiar.Location = new System.Drawing.Point(296, 9);
            this.btnLimpiar.Name = "btnLimpiar";
            this.btnLimpiar.Size = new System.Drawing.Size(120, 32);
            this.btnLimpiar.Text = "Limpiar";
            this.btnLimpiar.Click += new System.EventHandler(this.btnLimpiar_Click);
            //
            // txtCodigo
            //
            this.txtCodigo.AcceptsTab = true;
            this.txtCodigo.DetectUrls = false;
            this.txtCodigo.Dock = System.Windows.Forms.DockStyle.Fill;
            this.txtCodigo.Name = "txtCodigo";
            this.txtCodigo.ScrollBars = System.Windows.Forms.RichTextBoxScrollBars.Both;
            this.txtCodigo.WordWrap = false;
            this.txtCodigo.TextChanged += new System.EventHandler(this.txtCodigo_TextChanged);
            //
            // dgvTokens
            //
            this.dgvTokens.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvTokens.Name = "dgvTokens";
            //
            // dgvErrores
            //
            this.dgvErrores.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvErrores.Name = "dgvErrores";
            this.dgvErrores.Visible = false;
            //
            // tvArbol
            //
            this.tvArbol.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tvArbol.Name = "tvArbol";
            this.tvArbol.Visible = false;
            //
            // dgvSimbolos
            //
            this.dgvSimbolos.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvSimbolos.Name = "dgvSimbolos";
            this.dgvSimbolos.Visible = false;
            //
            // lstPila
            //
            this.lstPila.Dock = System.Windows.Forms.DockStyle.Fill;
            this.lstPila.HorizontalScrollbar = true;
            this.lstPila.IntegralHeight = false;
            this.lstPila.Name = "lstPila";
            this.lstPila.Visible = false;
            //
            // splitContenido
            //
            this.splitContenido.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContenido.Name = "splitContenido";
            this.splitContenido.Orientation = System.Windows.Forms.Orientation.Vertical;
            this.splitContenido.Panel1.Controls.Add(this.txtCodigo);
            this.splitContenido.Panel2.Controls.Add(this.lstPila);
            this.splitContenido.Panel2.Controls.Add(this.dgvSimbolos);
            this.splitContenido.Panel2.Controls.Add(this.tvArbol);
            this.splitContenido.Panel2.Controls.Add(this.dgvErrores);
            this.splitContenido.Panel2.Controls.Add(this.dgvTokens);
            //
            // lblEstado
            //
            this.lblEstado.AutoSize = false;
            this.lblEstado.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.lblEstado.Height = 25;
            this.lblEstado.Name = "lblEstado";
            this.lblEstado.Padding = new System.Windows.Forms.Padding(8, 0, 0, 0);
            this.lblEstado.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            //
            // pnlContenido
            //
            this.pnlContenido.Controls.Add(this.splitContenido);
            this.pnlContenido.Controls.Add(this.lblEstado);
            this.pnlContenido.Controls.Add(this.pnlBotones);
            this.pnlContenido.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlContenido.Name = "pnlContenido";
            //
            // FrmPrincipal
            //
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1100, 700);
            this.Controls.Add(this.pnlContenido);
            this.Controls.Add(this.pnlLateral);
            this.Controls.Add(this.pnlCabecera);
            this.MinimumSize = new System.Drawing.Size(900, 600);
            this.Name = "FrmPrincipal";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Analizador Léxico y Sintáctico";
            this.Load += new System.EventHandler(this.FrmPrincipal_Load);
            this.pnlCabecera.ResumeLayout(false);
            this.pnlCabecera.PerformLayout();
            this.pnlLateral.ResumeLayout(false);
            this.pnlBotones.ResumeLayout(false);
            this.splitContenido.Panel1.ResumeLayout(false);
            this.splitContenido.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContenido)).EndInit();
            this.splitContenido.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.dgvTokens)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgvErrores)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgvSimbolos)).EndInit();
            this.pnlContenido.ResumeLayout(false);
            this.ResumeLayout(false);
        }

        private System.Windows.Forms.Panel pnlCabecera;
        private System.Windows.Forms.Label lblTitulo;
        private System.Windows.Forms.Label lblSubtitulo;
        private System.Windows.Forms.Panel pnlLateral;
        private System.Windows.Forms.Label lblResultados;
        private System.Windows.Forms.Button btnTokens;
        private System.Windows.Forms.Button btnErrores;
        private System.Windows.Forms.Button btnArbol;
        private System.Windows.Forms.Button btnSimbolos;
        private System.Windows.Forms.Button btnPila;
        private System.Windows.Forms.Panel pnlContenido;
        private System.Windows.Forms.Panel pnlBotones;
        private System.Windows.Forms.Button btnAbrirEjemplo;
        private System.Windows.Forms.Button btnAnalizar;
        private System.Windows.Forms.Button btnLimpiar;
        private System.Windows.Forms.SplitContainer splitContenido;
        private System.Windows.Forms.RichTextBox txtCodigo;
        private System.Windows.Forms.DataGridView dgvTokens;
        private System.Windows.Forms.DataGridView dgvErrores;
        private System.Windows.Forms.DataGridView dgvSimbolos;
        private System.Windows.Forms.TreeView tvArbol;
        private System.Windows.Forms.ListBox lstPila;
        private System.Windows.Forms.Label lblEstado;
    }
}
