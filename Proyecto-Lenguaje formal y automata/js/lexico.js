(function (root) {
  "use strict";

  const Lexia = root.Lexia = root.Lexia || {};
  const OPERADORES_DOBLES = ["==", "!=", "<=", ">="];
  const OPERADORES_SIMPLES = new Set(["+", "-", "*", "/", "=", "<", ">", "!"]);
  const DELIMITADORES = new Set(["(", ")", "[", "]", "{", "}", ";", ","]);

  function normalizar(fuente) {
    return String(fuente).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function ubicar(fuente, indice) {
    let linea = 1;
    let columna = 1;
    const limite = Math.min(indice, fuente.length);
    for (let i = 0; i < limite; i += 1) {
      if (fuente[i] === "\n") {
        linea += 1;
        columna = 1;
      } else if (fuente[i] === "\t") {
        columna += 4;
      } else {
        columna += 1;
      }
    }
    return { linea: linea, columna: columna };
  }

  function anchoCodigo(fuente, indice) {
    const punto = fuente.codePointAt(indice);
    return punto > 0xffff ? 2 : 1;
  }

  /**
   * Separa código, comentarios y cadenas antes de los autómatas.
   * Un paréntesis dentro de un texto no llega ni al léxico ni a la pila.
   */
  function dividirContexto(fuente) {
    const partes = [];
    let i = 0;
    let codigoDesde = 0;

    function cerrarCodigo(hasta) {
      if (hasta > codigoDesde) {
        partes.push({ tipo: "codigo", inicio: codigoDesde, fin: hasta });
      }
      codigoDesde = hasta;
    }

    while (i < fuente.length) {
      if (fuente.startsWith("//", i)) {
        cerrarCodigo(i);
        const inicio = i;
        i += 2;
        while (i < fuente.length && fuente[i] !== "\n") i += 1;
        partes.push({ tipo: "comentario", inicio: inicio, fin: i, cerrado: true });
        codigoDesde = i;
        continue;
      }

      if (fuente.startsWith("/*", i)) {
        cerrarCodigo(i);
        const inicio = i;
        i += 2;
        let cerrado = false;
        while (i < fuente.length) {
          if (fuente.startsWith("*/", i)) {
            i += 2;
            cerrado = true;
            break;
          }
          i += 1;
        }
        partes.push({ tipo: "comentario", inicio: inicio, fin: i, cerrado: cerrado });
        codigoDesde = i;
        continue;
      }

      if (fuente[i] === "\"") {
        cerrarCodigo(i);
        const inicio = i;
        i += 1;
        let cerrado = false;
        while (i < fuente.length && fuente[i] !== "\n") {
          if (fuente[i] === "\\") {
            i += 1;
            if (i < fuente.length && fuente[i] !== "\n") i += 1;
            continue;
          }
          if (fuente[i] === "\"") {
            i += 1;
            cerrado = true;
            break;
          }
          i += 1;
        }
        partes.push({ tipo: "cadena", inicio: inicio, fin: i, cerrado: cerrado });
        codigoDesde = i;
        continue;
      }

      i += 1;
    }

    cerrarCodigo(fuente.length);
    return partes;
  }

  function crearError(fuente, inicio, fin, mensaje, bloquea) {
    const lugar = ubicar(fuente, inicio);
    return {
      tipo: "ERROR",
      valor: fuente.slice(inicio, fin) || "EOF",
      mensaje: mensaje,
      inicio: inicio,
      fin: fin,
      linea: lugar.linea,
      columna: lugar.columna,
      bloquea: Boolean(bloquea),
      detalle: mensaje
    };
  }

  function completar(fuente, token) {
    const lugar = ubicar(fuente, token.inicio);
    token.linea = lugar.linea;
    token.columna = lugar.columna;
    return token;
  }

  function tokenizarCodigo(fuente, desde, hasta, tokens, errores) {
    let i = desde;

    while (i < hasta) {
      const ch = fuente[i];

      if (ch === " " || ch === "\t" || ch === "\n") {
        i += 1;
        continue;
      }

      if (Lexia.esLetra(ch) || ch === "_") {
        const lectura = Lexia.consumirAfd(fuente, i, hasta, Lexia.DFA_IDENT);
        const fin = lectura.fin;
        if (fin < 0) {
          const ancho = anchoCodigo(fuente, i);
          const error = crearError(fuente, i, i + ancho, `No se pudo leer un identificador a partir de '${ch}'.`, false);
          errores.push(error);
          tokens.push(error);
          i += ancho;
          continue;
        }
        const lexema = fuente.slice(i, fin);
        const reservada = Lexia.RESERVADAS.has(lexema);
        tokens.push(completar(fuente, {
          tipo: reservada ? "RESERVADA" : "IDENTIFICADOR",
          valor: lexema,
          inicio: i,
          fin: fin,
          automata: "ident",
          camino: lectura.caminoAceptado,
          detalle: reservada
            ? "El AFD de identificadores acepta la forma del lexema. La tabla de palabras reservadas lo clasifica aparte."
            : "Aceptado por el AFD de identificadores. Termina en q1."
        }));
        i = fin;
        continue;
      }

      if (Lexia.esDigito(ch)) {
        const lectura = Lexia.consumirAfd(fuente, i, hasta, Lexia.DFA_NUMERO);
        const fin = lectura.fin;
        if (fin < 0) {
          const error = crearError(fuente, i, i + 1, "Dígito inesperado.", false);
          errores.push(error);
          tokens.push(error);
          i += 1;
          continue;
        }
        const lexema = fuente.slice(i, fin);
        const real = lexema.includes(".");
        const retroceso = lectura.leidoHasta > fin;
        let detalle = real
          ? "AFD de números. Termina en q3, estado de aceptación de los reales."
          : "AFD de números. Termina en q1, estado de aceptación de los enteros.";
        if (retroceso) {
          detalle += ` Se avanzó con '${fuente[fin]}' hasta ${lectura.estadoLectura}, que no es de aceptación, y se retrocedió a q1.`;
        }
        tokens.push(completar(fuente, {
          tipo: "NUMERO",
          valor: lexema,
          subtipo: real ? "real" : "entero",
          inicio: i,
          fin: fin,
          automata: "numero",
          camino: retroceso ? lectura.camino : lectura.caminoAceptado,
          retroceso: retroceso,
          detalle: detalle
        }));
        i = fin;
        continue;
      }

      if (i + 1 < hasta && OPERADORES_DOBLES.includes(fuente.slice(i, i + 2))) {
        const lexema = fuente.slice(i, i + 2);
        tokens.push(completar(fuente, {
          tipo: "OPERADOR",
          valor: lexema,
          inicio: i,
          fin: i + 2,
          automata: "operador",
          detalle: "Munch máximo: se elige el operador de dos caracteres antes que dos de uno."
        }));
        i += 2;
        continue;
      }

      if (OPERADORES_SIMPLES.has(ch)) {
        tokens.push(completar(fuente, {
          tipo: "OPERADOR",
          valor: ch,
          inicio: i,
          fin: i + 1,
          automata: "operador",
          detalle: "Operador de un carácter."
        }));
        i += 1;
        continue;
      }

      if (DELIMITADORES.has(ch)) {
        const dePila = "()[]{}".includes(ch);
        tokens.push(completar(fuente, {
          tipo: "DELIMITADOR",
          valor: ch,
          inicio: i,
          fin: i + 1,
          pila: dePila,
          detalle: dePila
            ? "Delimitador que también entra al autómata de pila."
            : "Separador. Lo exige la gramática y no modifica la pila."
        }));
        i += 1;
        continue;
      }

      if (ch === ".") {
        const error = crearError(
          fuente,
          i,
          i + 1,
          "Punto aislado. Un número real necesita dígitos a ambos lados, como 3.14.",
          false
        );
        errores.push(error);
        tokens.push(error);
        i += 1;
        continue;
      }

      const ancho = anchoCodigo(fuente, i);
      const simbolo = fuente.slice(i, i + ancho);
      let mensaje = `El símbolo '${simbolo}' no pertenece al alfabeto del analizador.`;
      if (simbolo === "&" || simbolo === "|") {
        mensaje = `El símbolo '${simbolo}' no es un operador de este lenguaje. Las conectivas se escriben and, or y not.`;
      }
      const error = crearError(fuente, i, i + ancho, mensaje, false);
      errores.push(error);
      tokens.push(error);
      i += ancho;
    }
  }

  Lexia.normalizar = normalizar;
  Lexia.ubicar = ubicar;
  Lexia.dividirContexto = dividirContexto;

  Lexia.tokenizar = function (entrada) {
    const fuente = normalizar(entrada);
    const partes = dividirContexto(fuente);
    const tokens = [];
    const errores = [];

    partes.forEach(function (parte) {
      if (parte.tipo === "comentario") {
        if (!parte.cerrado) {
          const error = crearError(fuente, parte.inicio, Math.max(parte.fin, parte.inicio + 2), "Comentario de bloque sin cerrar.", true);
          errores.push(error);
          tokens.push(error);
        }
        return;
      }

      if (parte.tipo === "cadena") {
        if (!parte.cerrado) {
          const error = crearError(
            fuente,
            parte.inicio,
            Math.max(parte.fin, parte.inicio + 1),
            "Cadena sin cerrar. Falta la comilla de cierre antes del fin de línea.",
            true
          );
          errores.push(error);
          tokens.push(error);
          return;
        }
        tokens.push(completar(fuente, {
          tipo: "CADENA",
          valor: fuente.slice(parte.inicio, parte.fin),
          inicio: parte.inicio,
          fin: parte.fin,
          detalle: "Literal de cadena. El AFD de identificadores no recorre su interior."
        }));
        return;
      }

      tokenizarCodigo(fuente, parte.inicio, parte.fin, tokens, errores);
    });

    return { fuente: fuente, tokens: tokens, errores: errores };
  };

  Lexia.nombreTipo = function (token) {
    switch (token.tipo) {
      case "RESERVADA": return "Palabra reservada";
      case "IDENTIFICADOR": return "Identificador";
      case "NUMERO": return token.subtipo === "real" ? "Número real" : "Número entero";
      case "CADENA": return "Cadena";
      case "OPERADOR": return "Operador";
      case "DELIMITADOR": return token.pila ? "Delimitador" : "Separador";
      case "ERROR": return "Error léxico";
      default: return token.tipo;
    }
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
