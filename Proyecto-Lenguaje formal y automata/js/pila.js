(function (root) {
  "use strict";

  const Lexia = root.Lexia = root.Lexia || {};
  const ABRE = new Set(["(", "[", "{"]);
  const CIERRA = { ")": "(", "]": "[", "}": "{" };
  const ESPERA = { "(": ")", "[": "]", "{": "}" };

  function visible(simbolo) {
    return simbolo === "Z0" ? "Z₀" : simbolo;
  }

  Lexia.simboloPila = visible;

  /**
   * Autómata de pila para ( ) [ ] { }.
   * Acepta por pila vacía de delimitadores: al terminar, solo queda Z₀
   * y la transición ε lleva a qf.
   * Comentarios y cadenas no forman parte de su entrada.
   */
  Lexia.validarBalance = function (entrada) {
    const fuente = Lexia.normalizar(entrada);
    const partes = Lexia.dividirContexto(fuente);
    const pila = [{ sim: "Z0" }];
    const pasos = [];
    const errores = [];
    let profundidad = 0;
    let detenido = false;

    function foto() {
      return pila.map(function (item) { return item.sim; });
    }

    function ubicar(indice) {
      return Lexia.ubicar(fuente, indice);
    }

    partes.forEach(function (parte) {
      if (detenido) return;

      if (parte.tipo === "comentario" || parte.tipo === "cadena") {
        if (!parte.cerrado) {
          const lugar = ubicar(parte.inicio);
          const mensaje = parte.tipo === "cadena"
            ? "Cadena sin cerrar. La pila se detiene porque el resto de la entrada ya no está delimitado."
            : "Comentario de bloque sin cerrar. La pila se detiene porque el resto de la entrada ya no está delimitado.";
          errores.push({
            mensaje: mensaje,
            linea: lugar.linea,
            columna: lugar.columna,
            inicio: parte.inicio,
            fin: parte.fin
          });
          pasos.push({
            accion: "error",
            titulo: "Entrada inválida",
            detalle: mensaje,
            inicio: parte.inicio,
            fin: parte.fin,
            pila: foto(),
            linea: lugar.linea,
            columna: lugar.columna
          });
          detenido = true;
          return;
        }

        const texto = fuente.slice(parte.inicio, parte.fin);
        const hallados = texto.match(/[()[\]{}]/g);
        if (hallados) {
          const lugar = ubicar(parte.inicio);
          const cual = parte.tipo === "cadena" ? "una cadena" : "un comentario";
          pasos.push({
            accion: "omitir",
            titulo: parte.tipo === "cadena" ? "Se omite una cadena" : "Se omite un comentario",
            detalle: `Contiene ${hallados.join(" ")}, pero está dentro de ${cual} y no entra a la pila.`,
            inicio: parte.inicio,
            fin: parte.fin,
            pila: foto(),
            linea: lugar.linea,
            columna: lugar.columna
          });
        }
        return;
      }

      for (let i = parte.inicio; i < parte.fin; i += 1) {
        const ch = fuente[i];
        if (!ABRE.has(ch) && !CIERRA[ch]) continue;

        const lugar = ubicar(i);
        if (ABRE.has(ch)) {
          const tope = pila[pila.length - 1].sim;
          pila.push({ sim: ch, linea: lugar.linea, columna: lugar.columna, inicio: i });
          profundidad = Math.max(profundidad, pila.length - 1);
          pasos.push({
            accion: "apilar",
            titulo: `Apilar ${ch}`,
            detalle: `δ(q, '${ch}', ${visible(tope)}) = (q, ${ch} ${visible(tope)}).`,
            inicio: i,
            fin: i + 1,
            pila: foto(),
            linea: lugar.linea,
            columna: lugar.columna
          });
          continue;
        }

        const tope = pila[pila.length - 1];
        const esperadoAbre = CIERRA[ch];
        if (tope.sim === esperadoAbre) {
          pila.pop();
          pasos.push({
            accion: "desapilar",
            titulo: `Desapilar ${esperadoAbre}`,
            detalle: `δ(q, '${ch}', '${esperadoAbre}') = (q, ε).`,
            inicio: i,
            fin: i + 1,
            pila: foto(),
            linea: lugar.linea,
            columna: lugar.columna
          });
          continue;
        }

        let mensaje;
        if (tope.sim === "Z0") {
          mensaje = `Se leyó '${ch}' y la pila solo tiene Z₀. Ese cierre no tiene apertura.`;
        } else {
          mensaje = `Se leyó '${ch}' en la línea ${lugar.linea}, pero el tope es '${tope.sim}' abierto en la línea ${tope.linea}. Se esperaba '${ESPERA[tope.sim]}'.`;
        }
        errores.push({
          mensaje: mensaje,
          linea: lugar.linea,
          columna: lugar.columna,
          inicio: i,
          fin: i + 1
        });
        pasos.push({
          accion: "error",
          titulo: "Rechazo",
          detalle: `${mensaje} No hay transición definida.`,
          inicio: i,
          fin: i + 1,
          pila: foto(),
          linea: lugar.linea,
          columna: lugar.columna
        });
        detenido = true;
        break;
      }
    });

    if (!detenido) {
      if (pila.length === 1) {
        const lugar = ubicar(fuente.length);
        pasos.push({
          accion: "aceptar",
          titulo: "Acepta",
          detalle: "La entrada se consumió y la pila conserva solo Z₀. δ(q, ε, Z₀) = (qf, Z₀): el autómata acepta.",
          inicio: fuente.length,
          fin: fuente.length,
          pila: foto(),
          linea: lugar.linea,
          columna: lugar.columna
        });
      } else {
        const ultimo = pila[pila.length - 1];
        const mensaje = `La entrada terminó con delimitadores abiertos. El más interno es '${ultimo.sim}', abierto en la línea ${ultimo.linea}, columna ${ultimo.columna}.`;
        errores.push({
          mensaje: mensaje,
          linea: ultimo.linea,
          columna: ultimo.columna,
          inicio: ultimo.inicio,
          fin: ultimo.inicio + 1
        });
        pasos.push({
          accion: "rechazar",
          titulo: "Rechazo",
          detalle: mensaje,
          inicio: ultimo.inicio,
          fin: ultimo.inicio + 1,
          pila: foto(),
          linea: ultimo.linea,
          columna: ultimo.columna
        });
      }
    }

    return {
      ok: errores.length === 0,
      pasos: pasos,
      profundidad: profundidad,
      errores: errores,
      pilaFinal: foto()
    };
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
