(function (root) {
  "use strict";

  const Lexia = root.Lexia = root.Lexia || {};

  Lexia.EJEMPLOS = [
    {
      id: "programa",
      nombre: "Programa válido",
      codigo: [
        "// Promedio y conteo sobre un arreglo",
        "int a = 4;",
        "int b = 8;",
        "int notas[3];",
        "float promedio = (a + b) / 2.0;",
        "bool activo = promedio >= 6;",
        "",
        "notas[0] = a + b * (a - 1);",
        "",
        "if (notas[0] < 10 and activo) {",
        "  while (notas[0] > 0) {",
        "    notas[0] = notas[0] - 1;",
        "  }",
        "} else {",
        "  return promedio;",
        "}"
      ].join("\n")
    },
    {
      id: "expresion",
      nombre: "Expresión matemática",
      codigo: "(a + b[i]) * (c - 3.5) / -d"
    },
    {
      id: "cadenas",
      nombre: "Cadenas y comentarios",
      codigo: [
        "// El cierre ) ] } de este comentario se ignora",
        "bool texto = \"(\" == \")\";",
        "int x = 1; /* tampoco cuenta ( ni [ */",
        "if (texto and x >= 1) {",
        "  return x;",
        "}"
      ].join("\n")
    },
    {
      id: "balanceado",
      nombre: "Balanceado, sintaxis inválida",
      codigo: "{ ( [ 1 + 2 ] ) }"
    },
    {
      id: "cruzados",
      nombre: "Delimitadores cruzados",
      codigo: "(]"
    },
    {
      id: "sintaxis",
      nombre: "Error sintáctico",
      codigo: [
        "int x = ;",
        "if x > 0 {",
        "  return",
        "}"
      ].join("\n")
    },
    {
      id: "lexico",
      nombre: "Error léxico",
      codigo: [
        "int precio$ = 10;",
        "float total = 12.;",
        "bool ok = @true;"
      ].join("\n")
    },
    {
      id: "abierto",
      nombre: "Bloque sin cerrar",
      codigo: [
        "{",
        "  int x = 1;"
      ].join("\n")
    }
  ];
})(typeof globalThis !== "undefined" ? globalThis : this);
