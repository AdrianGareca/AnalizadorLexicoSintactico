using System.Drawing;
using System.Windows.Forms;

namespace AnalizadorLexicoSintactico.Comun;

// Colores y fuentes de la aplicación, para que todas las ventanas se vean igual.
// Cabecera azul, menú lateral gris oscuro y contenido en fondo claro.
public static class Tema
{
    // Colores
    public static readonly Color Azul = Color.FromArgb(37, 99, 235);          // cabecera y botón principal
    public static readonly Color Lateral = Color.FromArgb(31, 41, 55);        // fondo del menú lateral
    public static readonly Color BotonLateral = Color.FromArgb(55, 65, 81);   // botones del menú lateral
    public static readonly Color Rojo = Color.FromArgb(220, 38, 38);          // botones de borrar / salir
    public static readonly Color Ambar = Color.FromArgb(251, 191, 36);        // etiquetas destacadas del menú
    public static readonly Color Fondo = Color.WhiteSmoke;                    // fondo de las ventanas
    public static readonly Color TextoOscuro = Color.FromArgb(31, 41, 55);    // títulos sobre fondo claro

    // Colores del código en el editor
    public static readonly Color PalabraReservada = Azul;
    public static readonly Color Numero = Color.DarkOrange;
    public static readonly Color Cadena = Color.SeaGreen;
    public static readonly Color Comentario = Color.Gray;

    // Fuentes
    public static readonly Font Titulo = new Font("Segoe UI", 16F, FontStyle.Bold);
    public static readonly Font Subtitulo = new Font("Segoe UI", 10F);
    public static readonly Font Normal = new Font("Segoe UI", 9F);
    public static readonly Font Negrita = new Font("Segoe UI", 9F, FontStyle.Bold);
    public static readonly Font Boton = new Font("Segoe UI", 10F, FontStyle.Bold);
    public static readonly Font Codigo = new Font("Consolas", 11F);

    // Color con el que se muestra cada tipo de error
    public static Color ColorDeError(TipoError tipo)
    {
        switch (tipo)
        {
            case TipoError.Lexico: return Color.Crimson;
            case TipoError.Balanceo: return Color.DarkOrange;
            case TipoError.Sintactico: return Rojo;
            case TipoError.Semantico: return Color.DarkMagenta;
            default: return TextoOscuro;
        }
    }

    // Botón azul para la acción principal (Analizar)
    public static void BotonPrincipal(Button boton)
    {
        boton.BackColor = Azul;
        boton.ForeColor = Color.White;
        boton.FlatStyle = FlatStyle.Flat;
        boton.FlatAppearance.BorderSize = 0;
        boton.Font = Boton;
    }

    // Botón rojo (Limpiar)
    public static void BotonPeligro(Button boton)
    {
        boton.BackColor = Rojo;
        boton.ForeColor = Color.White;
        boton.FlatStyle = FlatStyle.Flat;
        boton.FlatAppearance.BorderSize = 0;
    }

    // Botón del menú lateral
    public static void BotonMenu(Button boton)
    {
        boton.BackColor = BotonLateral;
        boton.ForeColor = Color.White;
        boton.FlatStyle = FlatStyle.Flat;
        boton.TextAlign = ContentAlignment.MiddleLeft;
        boton.Padding = new Padding(8, 0, 0, 0);
        boton.Font = Normal;
    }

    // Tablas de resultados (tokens, errores, tabla de símbolos)
    public static void Grilla(DataGridView grilla)
    {
        grilla.BackgroundColor = Color.White;
        grilla.ReadOnly = true;
        grilla.AllowUserToAddRows = false;
        grilla.RowHeadersVisible = false;
        grilla.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
        grilla.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
    }
}
