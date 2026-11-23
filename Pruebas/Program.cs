using AnalizadorLexicoSintactico.Lexico;
using AnalizadorLexicoSintactico.Sintactico;

// Prueba el léxico, el balanceo y el sintáctico igual que lo hará la ventana.
//   dotnet run --project Pruebas                  -> corre los ejemplos de abajo
//   dotnet run --project Pruebas -- archivo.txt   -> analiza ese archivo y muestra el árbol

Console.OutputEncoding = System.Text.Encoding.UTF8;

if (args.Length > 0)
{
    Analizar(Path.GetFileName(args[0]), File.ReadAllText(args[0]), true);
    return;
}

Analizar("Programa correcto",
    "entero edad = 25;\nreal nota = 7.5;\ncadena nombre = \"Ana\";\nentero lista[5];\n\nsi (edad >= 18) {\n    imprimir(\"Mayor de edad\");\n} sino {\n    imprimir(\"Menor de edad\");\n}\n\nmientras (edad < 30) {\n    edad = edad + 1;\n}", false);
Analizar("Léxico: carácter no válido", "entero precio$ = 10;", false);
Analizar("Balanceo: no corresponden", "entero a = (5 + 2];", false);
Analizar("Balanceo: llave sin cerrar", "si (1 < 2) {\n    imprimir(\"hola\");", false);
Analizar("Sintaxis: falta ;", "entero x = 5\nentero y = 2;", false);
Analizar("Sintaxis: = en vez de ==", "entero a = 1;\nsi (a = 1) { imprimir(a); }", false);
Analizar("Semántico: no declarada y repetida", "entero a = 1;\nreal a = 2.0;\nb = a + c;", false);

void Analizar(string titulo, string codigo, bool mostrarArbol)
{
    Console.WriteLine("==================== " + titulo);
    Console.WriteLine(codigo);
    Console.WriteLine("--------------------");

    AnalizadorLexico lexico = new AnalizadorLexico();
    List<Token> tokens = lexico.Analizar(codigo);

    VerificadorBalanceo balanceo = new VerificadorBalanceo();
    bool balanceado = balanceo.Verificar(tokens);

    AnalizadorSintactico sintactico = new AnalizadorSintactico();
    ArbolSintactico arbol = sintactico.Analizar(tokens);

    Console.WriteLine("Tokens: " + tokens.Count + "   Balanceado: " + (balanceado ? "sí" : "no"));
    foreach (string paso in balanceo.Pasos) Console.WriteLine("  pila  > " + paso);
    foreach (var error in lexico.Errores) Console.WriteLine("  " + error);
    foreach (var error in balanceo.Errores) Console.WriteLine("  " + error);
    foreach (var error in sintactico.Errores) Console.WriteLine("  " + error);
    foreach (Simbolo simbolo in sintactico.Tabla.Simbolos)
        Console.WriteLine("  tabla > " + simbolo.Nombre + " : " + simbolo.Tipo + " (línea " + simbolo.Linea + ")");

    if (lexico.Errores.Count + balanceo.Errores.Count + sintactico.Errores.Count == 0)
        Console.WriteLine("  ✔ Código correcto");
    if (mostrarArbol)
        Console.Write(arbol.ComoTexto());
    Console.WriteLine();
}
