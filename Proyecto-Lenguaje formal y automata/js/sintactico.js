(function (root) {
  "use strict";

  const Lexia = root.Lexia = root.Lexia || {};

  Lexia.GRAMATICA = [
    "Programa     → Sentencia*",
    "Sentencia    → Declaración | Asignación | If | While | Return | Bloque",
    "Declaración  → Tipo Identificador { \"[\" Expresión \"]\" } [ \"=\" Expresión ] \";\"",
    "Tipo         → \"int\" | \"float\" | \"bool\"",
    "Asignación   → Designador \"=\" Expresión \";\"",
    "Designador   → Identificador { \"[\" Expresión \"]\" }",
    "If           → \"if\" \"(\" Expresión \")\" Sentencia [ \"else\" Sentencia ]",
    "While        → \"while\" \"(\" Expresión \")\" Sentencia",
    "Return       → \"return\" [ Expresión ] \";\"",
    "Bloque       → \"{\" Sentencia* \"}\"",
    "Expresión    → Or",
    "Or           → And { \"or\" And }",
    "And          → Rel { \"and\" Rel }",
    "Rel          → Arit [ RelOp Arit ]",
    "RelOp        → \"==\" | \"!=\" | \"<\" | \"<=\" | \">\" | \">=\"",
    "Arit         → Término { (\"+\" | \"-\") Término }",
    "Término      → Unario { (\"*\" | \"/\") Unario }",
    "Unario       → (\"not\" | \"!\" | \"-\" | \"+\") Unario | Primario",
    "Primario     → Número | Cadena | \"true\" | \"false\" | Designador | \"(\" Expresión \")\""
  ].join("\n");

  Lexia.NOTAS_GRAMATICA = [
    "El analizador es descendente recursivo. Con un token de anticipación elige la producción, como un analizador LL(1).",
    "Precedencia, de menor a mayor: or, and, comparación, suma y resta, producto y división, unario. Los binarios del mismo nivel asocian a la izquierda. Los unarios asocian a la derecha.",
    "Las comparaciones no se encadenan: a < b < c se rechaza. Se escribe a < b and b < c.",
    "El else se asocia al if más cercano. Esa regla quita la ambigüedad clásica del if-else.",
    "No hay análisis semántico: no se comprueban tipos ni declaraciones. El proyecto cubre la fase léxica y la sintáctica.",
    "Si la entrada no tiene punto y coma, llaves ni una sentencia (if, while, return o una declaración), se analiza como expresión matemática."
  ];

  function decidirModo(tokens) {
    const utiles = tokens.filter(function (token) { return token.tipo !== "ERROR"; });
    if (utiles.length === 0) return "programa";
    const claves = new Set(["if", "else", "while", "return", "int", "float", "bool"]);
    const programa = utiles.some(function (token) {
      return token.valor === ";"
        || token.valor === "{"
        || token.valor === "}"
        || token.valor === "="
        || (token.tipo === "RESERVADA" && claves.has(token.valor));
    });
    return programa ? "programa" : "expresion";
  }

  function analizarSintaxis(tokens, modo, fuente) {
    const producciones = [];
    let i = 0;
    const posFin = Lexia.ubicar(fuente, fuente.length);
    const finEntrada = {
      tipo: "EOF",
      valor: "fin de entrada",
      inicio: fuente.length,
      fin: fuente.length,
      linea: posFin.linea,
      columna: posFin.columna
    };

    function mirar() {
      return i < tokens.length ? tokens[i] : finEntrada;
    }

    function es(tipo, valor) {
      const token = mirar();
      if (token.tipo !== tipo) return false;
      if (valor !== undefined && token.valor !== valor) return false;
      return true;
    }

    function esOp(valor) {
      return es("OPERADOR", valor);
    }

    function esDelim(valor) {
      return es("DELIMITADOR", valor);
    }

    function esReservada(valor) {
      return es("RESERVADA", valor);
    }

    function anotar(produccion) {
      producciones.push(produccion);
    }

    function nodo(tipo, texto, hijos, produccion) {
      if (produccion) producciones.push(produccion);
      return {
        tipo: tipo,
        texto: texto,
        hijos: (hijos || []).filter(Boolean),
        produccion: produccion || ""
      };
    }

    function fallo(mensaje, token) {
      const error = new Error(mensaje);
      error.esSintaxis = true;
      error.datos = {
        mensaje: mensaje,
        linea: token.linea,
        columna: token.columna,
        inicio: token.inicio,
        fin: token.fin,
        origen: token.tipo === "ERROR" ? "lexico" : "sintaxis"
      };
      return error;
    }

    function vigilar() {
      const token = mirar();
      if (token.tipo === "ERROR") throw fallo(token.mensaje, token);
    }

    function avanzar() {
      if (i < tokens.length) i += 1;
      return tokens[i - 1];
    }

    function consumir(predicado, esperado) {
      vigilar();
      const token = mirar();
      if (predicado(token)) return avanzar();
      const encontrado = token.tipo === "EOF" ? "el final de la entrada" : `'${token.valor}'`;
      throw fallo(`Se esperaba ${esperado} y se encontró ${encontrado}.`, token);
    }

    function consumirReservada(palabra) {
      return consumir(function (token) {
        return token.tipo === "RESERVADA" && token.valor === palabra;
      }, `la palabra '${palabra}'`);
    }

    function consumirDelim(simbolo, texto) {
      return consumir(function (token) {
        return token.tipo === "DELIMITADOR" && token.valor === simbolo;
      }, texto || `'${simbolo}'`);
    }

    function consumirOp(simbolo) {
      return consumir(function (token) {
        return token.tipo === "OPERADOR" && token.valor === simbolo;
      }, `'${simbolo}'`);
    }

    function empiezaExpresion() {
      const token = mirar();
      if (token.tipo === "NUMERO" || token.tipo === "IDENTIFICADOR" || token.tipo === "CADENA") return true;
      if (token.tipo === "RESERVADA" && (token.valor === "true" || token.valor === "false" || token.valor === "not")) return true;
      if (token.tipo === "OPERADOR" && (token.valor === "+" || token.valor === "-" || token.valor === "!")) return true;
      return token.tipo === "DELIMITADOR" && token.valor === "(";
    }

    function esComparacion() {
      return ["==", "!=", "<", ">", "<=", ">="].some(esOp);
    }

    function consumirIdentificador() {
      vigilar();
      if (es("IDENTIFICADOR")) return avanzar();
      const token = mirar();
      if (token.tipo === "RESERVADA") {
        throw fallo(`Se esperaba un identificador y se encontró la palabra reservada '${token.valor}'.`, token);
      }
      throw fallo("Se esperaba un identificador.", token);
    }

    function designador() {
      const nombre = consumirIdentificador();
      let base = nodo("Identificador", nombre.valor, [], "Designador → Identificador");
      while (esDelim("[")) {
        anotar("Designador → Designador [ Expresión ]");
        avanzar();
        const indice = expresion();
        consumirDelim("]", "']' para cerrar el índice");
        base = nodo("Indice", "[]", [base, indice], "");
      }
      return base;
    }

    function primario() {
      vigilar();
      if (esDelim("(")) {
        anotar("Primario → ( Expresión )");
        avanzar();
        const interior = expresion();
        consumirDelim(")", "')' para cerrar la expresión");
        return interior;
      }
      if (es("NUMERO")) {
        const token = avanzar();
        return nodo("Número", token.valor, [], "Primario → Número");
      }
      if (es("CADENA")) {
        const token = avanzar();
        return nodo("Cadena", token.valor, [], "Primario → Cadena");
      }
      if (esReservada("true") || esReservada("false")) {
        const token = avanzar();
        return nodo("Literal", token.valor, [], `Primario → ${token.valor}`);
      }
      if (es("IDENTIFICADOR")) return designador();
      throw fallo("Se esperaba una expresión.", mirar());
    }

    function unario() {
      if (esReservada("not") || esOp("!") || esOp("-") || esOp("+")) {
        const operador = avanzar();
        const expr = unario();
        return nodo("Unario", operador.valor, [expr], `Unario → ${operador.valor} Unario`);
      }
      return primario();
    }

    function termino() {
      let actual = unario();
      while (esOp("*") || esOp("/")) {
        const operador = avanzar();
        const derecho = unario();
        actual = nodo("Binario", operador.valor, [actual, derecho], `Término → Término ${operador.valor} Unario`);
      }
      return actual;
    }

    function aritmetica() {
      let actual = termino();
      while (esOp("+") || esOp("-")) {
        const operador = avanzar();
        const derecho = termino();
        actual = nodo("Binario", operador.valor, [actual, derecho], `Arit → Arit ${operador.valor} Término`);
      }
      return actual;
    }

    function relacional() {
      let actual = aritmetica();
      if (esComparacion()) {
        const operador = avanzar();
        const derecho = aritmetica();
        actual = nodo("Binario", operador.valor, [actual, derecho], `Rel → Arit ${operador.valor} Arit`);
        if (esComparacion()) {
          throw fallo("No se encadenan comparaciones. Une las condiciones con and u or.", mirar());
        }
      }
      return actual;
    }

    function conjuncion() {
      let actual = relacional();
      while (esReservada("and")) {
        avanzar();
        const derecho = relacional();
        actual = nodo("Binario", "and", [actual, derecho], "And → And and Rel");
      }
      return actual;
    }

    function expresion() {
      let actual = conjuncion();
      while (esReservada("or")) {
        avanzar();
        const derecho = conjuncion();
        actual = nodo("Binario", "or", [actual, derecho], "Or → Or or And");
      }
      return actual;
    }

    function bloque() {
      anotar("Sentencia → Bloque");
      anotar("Bloque → { Sentencia* }");
      consumirDelim("{");
      const hijos = [];
      while (!esDelim("}") && mirar().tipo !== "EOF") {
        const antes = i;
        hijos.push(sentencia());
        if (i === antes) throw fallo("No se pudo avanzar dentro del bloque.", mirar());
      }
      consumirDelim("}", "'}' para cerrar el bloque");
      return nodo("Bloque", "bloque", hijos, "");
    }

    function declaracion() {
      anotar("Sentencia → Declaración");
      const tipo = avanzar();
      const nombre = consumirIdentificador();
      const hijos = [];
      while (esDelim("[")) {
        anotar("Declaración → … [ Expresión ] …");
        avanzar();
        const tamano = expresion();
        consumirDelim("]", "']' para cerrar el tamaño");
        hijos.push(nodo("Dimensión", "[]", [tamano], ""));
      }
      if (esOp("=")) {
        anotar("Declaración → … = Expresión ;");
        avanzar();
        hijos.push(nodo("Inicialización", "=", [expresion()], ""));
      }
      consumirDelim(";", "';' al final de la declaración");
      return nodo(
        "Declaración",
        `${tipo.valor} ${nombre.valor}`,
        hijos,
        "Declaración → Tipo Identificador { [ Expresión ] } [ = Expresión ] ;"
      );
    }

    function asignacion() {
      anotar("Sentencia → Asignación");
      const destino = designador();
      consumirOp("=");
      const valor = expresion();
      consumirDelim(";", "';' al final de la asignación");
      return nodo("Asignación", "=", [destino, valor], "Asignación → Designador = Expresión ;");
    }

    function sentenciaIf() {
      anotar("Sentencia → If");
      consumirReservada("if");
      consumirDelim("(", "'(' después de if");
      const condicion = expresion();
      consumirDelim(")", "')' para cerrar la condición");
      const entonces = sentencia();
      const hijos = [
        nodo("Condición", "condición", [condicion], ""),
        nodo("Entonces", "entonces", [entonces], "")
      ];
      let conElse = false;
      if (esReservada("else")) {
        conElse = true;
        anotar("If → if ( Expresión ) Sentencia else Sentencia");
        avanzar();
        hijos.push(nodo("Sino", "si no", [sentencia()], ""));
      } else {
        anotar("If → if ( Expresión ) Sentencia");
      }
      return nodo("If", "if", hijos, conElse ? "" : "");
    }

    function sentenciaWhile() {
      anotar("Sentencia → While");
      anotar("While → while ( Expresión ) Sentencia");
      consumirReservada("while");
      consumirDelim("(", "'(' después de while");
      const condicion = expresion();
      consumirDelim(")", "')' para cerrar la condición");
      const cuerpo = sentencia();
      return nodo("While", "while", [
        nodo("Condición", "condición", [condicion], ""),
        nodo("Cuerpo", "cuerpo", [cuerpo], "")
      ], "");
    }

    function sentenciaReturn() {
      anotar("Sentencia → Return");
      consumirReservada("return");
      const hijos = [];
      if (empiezaExpresion()) {
        anotar("Return → return Expresión ;");
        hijos.push(expresion());
      } else {
        anotar("Return → return ;");
      }
      consumirDelim(";", "';' al final de return");
      return nodo("Return", "return", hijos, "");
    }

    function sentencia() {
      vigilar();
      if (esReservada("if")) return sentenciaIf();
      if (esReservada("while")) return sentenciaWhile();
      if (esReservada("return")) return sentenciaReturn();
      if (esReservada("int") || esReservada("float") || esReservada("bool")) return declaracion();
      if (esDelim("{")) return bloque();
      if (es("IDENTIFICADOR")) return asignacion();
      if (esReservada("else")) throw fallo("else no tiene un if abierto. Se asocia siempre al if más cercano.", mirar());
      throw fallo("Se esperaba una sentencia.", mirar());
    }

    function programa() {
      anotar("Programa → Sentencia*");
      const hijos = [];
      while (mirar().tipo !== "EOF") {
        const antes = i;
        hijos.push(sentencia());
        if (i === antes) throw fallo("No se pudo avanzar en la entrada.", mirar());
      }
      return nodo("Programa", "Programa", hijos, "");
    }

    function entradaExpresion() {
      anotar("Entrada → Expresión");
      const expr = expresion();
      if (mirar().tipo !== "EOF") {
        throw fallo("Se esperaba el final de la expresión.", mirar());
      }
      return nodo("Expresión", "expresión", [expr], "");
    }

    try {
      const arbol = modo === "expresion" ? entradaExpresion() : programa();
      enumerar(arbol, { n: 0 });
      return { ok: true, arbol: arbol, producciones: producciones, errores: [], modo: modo };
    } catch (error) {
      if (!error.esSintaxis) throw error;
      return { ok: false, arbol: null, producciones: producciones, errores: [error.datos], modo: modo };
    }
  }

  function enumerar(arbol, estado) {
    arbol.id = estado.n;
    estado.n += 1;
    (arbol.hijos || []).forEach(function (hijo) { enumerar(hijo, estado); });
  }

  Lexia.decidirModo = decidirModo;
  Lexia.analizarSintaxis = analizarSintaxis;

  Lexia.procesar = function (entrada) {
    const lexico = Lexia.tokenizar(entrada);
    const balance = Lexia.validarBalance(lexico.fuente);
    const modo = decidirModo(lexico.tokens);
    const sintaxis = analizarSintaxis(lexico.tokens, modo, lexico.fuente);
    return {
      fuente: lexico.fuente,
      modo: modo,
      tokens: lexico.tokens,
      erroresLexicos: lexico.errores,
      balance: balance,
      sintaxis: sintaxis,
      aceptado: lexico.errores.length === 0 && balance.ok && sintaxis.ok
    };
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
