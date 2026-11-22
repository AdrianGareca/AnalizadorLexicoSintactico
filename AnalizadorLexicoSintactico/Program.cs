namespace AnalizadorLexicoSintactico;

static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();

        // Ventana vacía mientras no esté la interfaz (P3).
        // Cuando FrmPrincipal entre a main, esta línea se cambia por:
        //     Application.Run(new Interfaz.FrmPrincipal());
        Application.Run(new Form { Text = "Analizador Léxico y Sintáctico" });
    }
}
