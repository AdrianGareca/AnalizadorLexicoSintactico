"use strict";

var Lexia;
(function cargar() {
  var archivos = ["afd.js", "lexico.js", "pila.js", "sintactico.js", "ejemplos.js"];
  if (typeof require === "function") {
    var fs = require("fs");
    var path = require("path");
    var vm = require("vm");
    var sandbox = { console: console };
    vm.createContext(sandbox);
    archivos.forEach(function (archivo) {
      var codigo = fs.readFileSync(path.join(__dirname, archivo), "utf8");
      vm.runInContext(codigo, sandbox, { filename: archivo });
    });
    Lexia = sandbox.Lexia;
    return;
  }
  archivos.forEach(function (archivo) { load(archivo); });
  Lexia = globalThis.Lexia;
})();
var fallos = 0;

function avisar(texto) {
  if (typeof console !== "undefined" && console.log) console.log(texto);
  else if (typeof print === "function") print(texto);
}

function assert(condicion, mensaje) {
  if (!condicion) {
    fallos += 1;
    avisar("FALLO: " + mensaje);
  }
}

function igual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function forma(nodo) {
  if (!nodo) return null;
  if (nodo.tipo === "Expresión" || nodo.tipo === "Programa") {
    return nodo.hijos.length === 1 ? forma(nodo.hijos[0]) : nodo.hijos.map(forma);
  }
  if (!nodo.hijos || nodo.hijos.length === 0) return nodo.texto;
  if (nodo.tipo === "Unario") return ["neg", nodo.texto].concat(nodo.hijos.map(forma));
  if (nodo.tipo === "Indice") return ["[]"].concat(nodo.hijos.map(forma));
  if (nodo.tipo === "Binario") return [nodo.texto].concat(nodo.hijos.map(forma));
  return [nodo.tipo].concat(nodo.hijos.map(forma));
}

function ejemplo(id) {
  return Lexia.EJEMPLOS.find(function (item) { return item.id === id; }).codigo;
}

function tipos(fuente) {
  return Lexia.tokenizar(fuente).tokens.map(function (token) {
    return token.tipo + ":" + token.valor;
  });
}

assert(Lexia.reconocer(Lexia.DFA_IDENT, "contador").ok, "contador es identificador");
assert(Lexia.reconocer(Lexia.DFA_IDENT, "año").ok, "año es identificador");
assert(Lexia.reconocer(Lexia.DFA_IDENT, "_x1").ok, "_x1 es identificador");
assert(!Lexia.reconocer(Lexia.DFA_IDENT, "2a").ok, "2a no es identificador");
assert(!Lexia.reconocer(Lexia.DFA_IDENT, "").ok, "vacío no es identificador");
const reservada = Lexia.reconocer(Lexia.DFA_IDENT, "if");
assert(reservada.ok && reservada.reservada, "if lo acepta el AFD y la tabla lo marca");

assert(Lexia.reconocer(Lexia.DFA_NUMERO, "42").ok, "42 es entero");
assert(Lexia.reconocer(Lexia.DFA_NUMERO, "42").estado === "q1", "42 termina en q1");
assert(Lexia.reconocer(Lexia.DFA_NUMERO, "3.14").ok, "3.14 es real");
assert(Lexia.reconocer(Lexia.DFA_NUMERO, "3.14").estado === "q3", "3.14 termina en q3");
assert(!Lexia.reconocer(Lexia.DFA_NUMERO, "12.").ok, "12. no es un real completo");
assert(Lexia.reconocer(Lexia.DFA_NUMERO, "12.").estado === "q2", "12. queda en q2");
assert(!Lexia.reconocer(Lexia.DFA_NUMERO, ".5").ok, ".5 se rechaza");
assert(!Lexia.reconocer(Lexia.DFA_NUMERO, "12a").ok, "12a se rechaza");
assert(!Lexia.reconocer(Lexia.DFA_NUMERO, "-3").ok, "el signo no pertenece al AFD de números");

assert(igual(tipos("if contador"), ["RESERVADA:if", "IDENTIFICADOR:contador"]), "if no es identificador");
assert(igual(tipos(">="), ["OPERADOR:>="]), "munch máximo de >=");
assert(igual(tipos("=="), ["OPERADOR:=="]), "munch máximo de ==");
assert(igual(tipos("a/b"), ["IDENTIFICADOR:a", "OPERADOR:/", "IDENTIFICADOR:b"]), "la división no es un comentario");
assert(igual(tipos("a//b\n+ c"), ["IDENTIFICADOR:a", "OPERADOR:+", "IDENTIFICADOR:c"]), "comentario de línea");
assert(igual(tipos("a /* + */ + b"), ["IDENTIFICADOR:a", "OPERADOR:+", "IDENTIFICADOR:b"]), "comentario de bloque");
assert(igual(tipos("\"if\""), ["CADENA:\"if\""]), "cadena no es palabra reservada");
assert(igual(tipos("año_1"), ["IDENTIFICADOR:año_1"]), "identificador con ñ");

const doce = Lexia.tokenizar("12.;").tokens;
assert(doce[0].tipo === "NUMERO" && doce[0].valor === "12" && doce[0].retroceso, "12. retrocede al entero");
assert(doce[1].tipo === "ERROR" && doce[1].valor === ".", "el punto sobrante es un error");
assert(doce[2].valor === ";", "el punto y coma sigue al error");

const lexico = Lexia.procesar(ejemplo("lexico"));
assert(lexico.erroresLexicos.length === 3, "tres errores léxicos, hay " + lexico.erroresLexicos.length);
assert(lexico.balance.ok, "el error léxico de ejemplo no desbalancea");
assert(!lexico.sintaxis.ok && lexico.sintaxis.errores[0].origen === "lexico", "la sintaxis se detiene en el token inválido");
assert(!lexico.aceptado, "el ejemplo léxico no se acepta");

assert(Lexia.validarBalance("([]{})").ok, "([]{}) balancea");
assert(Lexia.validarBalance("([]{})").profundidad === 2, "profundidad de ([]{})");
assert(Lexia.validarBalance("((()))").profundidad === 3, "profundidad de ((()))");
var cruce = Lexia.validarBalance("(]");
assert(!cruce.ok, "(] se rechaza");
assert(cruce.errores[0].mensaje.indexOf("Se leyó ']'") !== -1, "mensaje de cruce");
assert(Lexia.validarBalance("( /* ) */ )").ok, "el paréntesis del comentario no cuenta");
assert(!Lexia.validarBalance("// )\n(").ok, "el paréntesis real queda abierto");
assert(Lexia.validarBalance("bool t = \"(\" == \")\";").ok, "paréntesis dentro de cadenas");
assert(!Lexia.validarBalance("\"").ok, "cadena sin cerrar detiene la pila");

const programa = Lexia.procesar(ejemplo("programa"));
assert(programa.aceptado, "el programa de ejemplo se acepta");
assert(programa.modo === "programa", "se analiza como programa");
assert(programa.sintaxis.arbol.hijos.length === 7, "siete sentencias, hay " + (programa.sintaxis.arbol ? programa.sintaxis.arbol.hijos.length : 0));
assert(programa.balance.profundidad === 3, "profundidad del programa, hay " + programa.balance.profundidad);
assert(programa.tokens.some(function (token) { return token.valor === ">=" && token.tipo === "OPERADOR"; }), "el programa usa >=");
assert(programa.tokens.some(function (token) { return token.valor === "2.0" && token.subtipo === "real"; }), "2.0 es real");
assert(!programa.tokens.some(function (token) { return token.valor.indexOf("Promedio") !== -1; }), "el comentario no genera tokens");

const expr = Lexia.procesar(ejemplo("expresion"));
assert(expr.aceptado && expr.modo === "expresion", "la expresión se acepta");
assert(igual(forma(expr.sintaxis.arbol), ["/", ["*", ["+", "a", ["[]", "b", "i"]], ["-", "c", "3.5"]], ["neg", "-", "d"]]), "precedencia de la expresión: " + JSON.stringify(forma(expr.sintaxis.arbol)));

assert(igual(forma(Lexia.procesar("a + b * c").sintaxis.arbol), ["+", "a", ["*", "b", "c"]]), "a + b * c");
assert(igual(forma(Lexia.procesar("a and b == c").sintaxis.arbol), ["and", "a", ["==", "b", "c"]]), "and y comparación");
assert(igual(forma(Lexia.procesar("a or b and c").sintaxis.arbol), ["or", "a", ["and", "b", "c"]]), "or y and");
assert(igual(forma(Lexia.procesar("-a-b").sintaxis.arbol), ["-", ["neg", "-", "a"], "b"]), "-a-b");
assert(igual(forma(Lexia.procesar("a--b").sintaxis.arbol), ["-", "a", ["neg", "-", "b"]]), "a--b");
assert(!Lexia.procesar("a < b < c").sintaxis.ok, "no se encadenan comparaciones");

const anidado = Lexia.procesar("if (a) if (b) x = 1; else x = 2;");
assert(anidado.aceptado, "if anidado se acepta");
const externo = anidado.sintaxis.arbol.hijos[0];
assert(externo.tipo === "If" && externo.hijos.length === 2, "el else no cuelga del if externo");
const interno = externo.hijos[1].hijos[0];
assert(interno.tipo === "If" && interno.hijos.length === 3, "el else cuelga del if interno");

const balanceado = Lexia.procesar(ejemplo("balanceado"));
assert(balanceado.balance.ok && !balanceado.sintaxis.ok && balanceado.erroresLexicos.length === 0, "balanceado no implica sintaxis válida");

const cruzados = Lexia.procesar(ejemplo("cruzados"));
assert(!cruzados.balance.ok && !cruzados.sintaxis.ok && cruzados.erroresLexicos.length === 0, "(] falla en pila y en gramática");

const sintaxis = Lexia.procesar(ejemplo("sintaxis"));
assert(sintaxis.erroresLexicos.length === 0 && sintaxis.balance.ok && !sintaxis.sintaxis.ok, "error solo sintáctico");
assert(sintaxis.sintaxis.errores[0].linea === 1, "el primer error sintáctico está en la línea 1");
assert(sintaxis.sintaxis.errores[0].mensaje.includes("expresión"), "avisa que falta la expresión");

const abierto = Lexia.procesar(ejemplo("abierto"));
assert(!abierto.balance.ok && !abierto.sintaxis.ok, "el bloque abierto se rechaza");

const cadenas = Lexia.procesar(ejemplo("cadenas"));
assert(cadenas.aceptado, "cadenas y comentarios forman un programa válido: " + JSON.stringify({
  lex: cadenas.erroresLexicos,
  pila: cadenas.balance.errores,
  sin: cadenas.sintaxis.errores
}));

const vacio = Lexia.procesar("   \n  // solo un comentario\n");
assert(vacio.aceptado && vacio.tokens.length === 0, "comentario y vacío se aceptan");

const columna = Lexia.procesar("int x = 1;\nint y = ;");
assert(!columna.sintaxis.ok, "falta la expresión de y");
assert(columna.sintaxis.errores[0].linea === 2, "el error de y está en la línea 2, hay " + (columna.sintaxis.errores[0] && columna.sintaxis.errores[0].linea));
assert(columna.sintaxis.errores[0].columna === 9, "columna 9, hay " + (columna.sintaxis.errores[0] && columna.sintaxis.errores[0].columna));

assert(Lexia.procesar("return;").aceptado, "return vacío");
assert(Lexia.procesar("return 1;").aceptado, "return con valor");
assert(!Lexia.procesar("else x = 1;").sintaxis.ok, "else huérfano");
assert(Lexia.procesar("int matriz[2][3];").aceptado, "dos dimensiones");
assert(Lexia.procesar("notas[1] = notas[0] + 1;").aceptado, "asignación con índice");

if (fallos > 0) {
  avisar(fallos + " prueba(s) fallida(s).");
  if (typeof quit === "function") quit(1);
  if (typeof process !== "undefined") process.exit(1);
}

avisar("Todas las pruebas pasaron.");
