(function (root) {
  "use strict";

  const Lexia = root.Lexia = root.Lexia || {};

  const RESERVADAS = ["if", "else", "while", "return", "int", "float", "bool", "true", "false", "and", "or", "not"];

  Lexia.RESERVADAS = new Set(RESERVADAS);
  Lexia.GRUPOS_RESERVADAS = [
    { nombre: "Control", palabras: ["if", "else", "while", "return"] },
    { nombre: "Tipos", palabras: ["int", "float", "bool"] },
    { nombre: "Literales", palabras: ["true", "false"] },
    { nombre: "Lógicos", palabras: ["and", "or", "not"] }
  ];

  function esLetra(ch) {
    return (ch >= "a" && ch <= "z")
      || (ch >= "A" && ch <= "Z")
      || "áéíóúüñÁÉÍÓÚÜÑ".includes(ch);
  }

  function esDigito(ch) {
    return ch >= "0" && ch <= "9";
  }

  function claseIdent(ch) {
    if (esLetra(ch)) return "letra";
    if (esDigito(ch)) return "digito";
    if (ch === "_") return "_";
    return null;
  }

  function claseNumero(ch) {
    if (esDigito(ch)) return "digito";
    if (ch === ".") return "punto";
    return null;
  }

  Lexia.esLetra = esLetra;
  Lexia.esDigito = esDigito;

  Lexia.DFA_IDENT = {
    id: "ident",
    nombre: "AFD de identificadores",
    Q: ["q0", "q1", "qe"],
    inicio: "q0",
    F: ["q1"],
    columnas: [
      { clave: "letra", titulo: "letra" },
      { clave: "digito", titulo: "dígito" },
      { clave: "_", titulo: "_" }
    ],
    delta: {
      q0: { letra: "q1", _: "q1", digito: "qe" },
      q1: { letra: "q1", digito: "q1", _: "q1" },
      qe: { letra: "qe", digito: "qe", _: "qe" }
    },
    alfabeto: "letras (a–z, A–Z y á, é, í, ó, ú, ü, ñ), dígitos y _",
    clasificar: claseIdent
  };

  Lexia.DFA_NUMERO = {
    id: "numero",
    nombre: "AFD de números",
    Q: ["q0", "q1", "q2", "q3", "qe"],
    inicio: "q0",
    F: ["q1", "q3"],
    columnas: [
      { clave: "digito", titulo: "dígito" },
      { clave: "punto", titulo: "." }
    ],
    delta: {
      q0: { digito: "q1" },
      q1: { digito: "q1", punto: "q2" },
      q2: { digito: "q3" },
      q3: { digito: "q3" },
      qe: { digito: "qe", punto: "qe" }
    },
    alfabeto: "dígitos y el punto decimal",
    clasificar: claseNumero
  };

  Lexia.OPERADORES = ["==", "!=", "<=", ">=", "+", "-", "*", "/", "=", "<", ">", "!"];

  function destino(dfa, estado, clave) {
    if (estado === "qe") return "qe";
    return (dfa.delta[estado] || {})[clave] || "qe";
  }

  Lexia.destinoAfd = destino;

  Lexia.describirAfd = function (dfa) {
    return [
      dfa.nombre,
      `M = (Q, Σ, δ, ${dfa.inicio}, F)`,
      `Q = { ${dfa.Q.join(", ")} }`,
      `Σ = ${dfa.alfabeto}`,
      `q0 = ${dfa.inicio}`,
      `F = { ${dfa.F.join(", ")} }`
    ].join("\n");
  };

  /**
   * Reconocedor: la cadena completa debe terminar en un estado de F.
   * Una transición ausente cae en qe y ya no sale de ahí.
   */
  Lexia.reconocer = function (dfa, cadena) {
    let estado = dfa.inicio;
    const camino = [{ estado: estado, simbolo: "" }];
    let fuera = false;

    for (const ch of cadena) {
      if (estado !== "qe") {
        const clase = dfa.clasificar(ch);
        if (!clase) {
          fuera = true;
          estado = "qe";
        } else {
          estado = destino(dfa, estado, clase);
        }
      }
      camino.push({ estado: estado, simbolo: ch });
    }

    const ok = dfa.F.includes(estado);
    let razon;
    if (cadena.length === 0) {
      razon = `La cadena vacía deja el autómata en ${estado}, que no es de aceptación.`;
    } else if (fuera) {
      razon = "Hay un símbolo fuera del alfabeto. El autómata cae en qe y rechaza.";
    } else if (ok) {
      razon = `La cadena termina en ${estado}, que es de aceptación.`;
    } else if (estado === "qe") {
      razon = "Una transición no definida lleva a qe. Es un sumidero y no es de aceptación.";
    } else {
      razon = `La cadena termina en ${estado}, que no es de aceptación.`;
    }

    return {
      ok: ok,
      camino: camino,
      estado: estado,
      razon: razon,
      reservada: dfa.id === "ident" && ok && Lexia.RESERVADAS.has(cadena)
    };
  };

  /**
   * Analizador léxico: desde `desde` consume el prefijo más largo que
   * haya pasado por un estado de aceptación. No entra al sumidero.
   */
  Lexia.consumirAfd = function (fuente, desde, hasta, dfa) {
    let estado = dfa.inicio;
    let fin = -1;
    let estadoAceptado = null;
    const camino = [{ estado: estado, simbolo: "" }];
    let p = desde;

    while (p < hasta) {
      const clase = dfa.clasificar(fuente[p]);
      if (!clase) break;
      const siguiente = (dfa.delta[estado] || {})[clase];
      if (!siguiente || siguiente === "qe") break;
      estado = siguiente;
      camino.push({ estado: estado, simbolo: fuente[p] });
      p += 1;
      if (dfa.F.includes(estado)) {
        fin = p;
        estadoAceptado = estado;
      }
    }

    const aceptados = fin < 0 ? 0 : fin - desde;
    return {
      fin: fin,
      estado: estadoAceptado,
      camino: camino,
      caminoAceptado: camino.slice(0, aceptados + 1),
      leidoHasta: p,
      estadoLectura: estado
    };
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
