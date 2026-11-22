(function () {
  "use strict";

  var estado = null;
  var pasos = [];
  var indiceSim = -1;
  var timer = null;
  var sucio = false;

  function $(id) { return document.getElementById(id); }

  function esc(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dfaDe(id) {
    return id === "numero" ? Lexia.DFA_NUMERO : Lexia.DFA_IDENT;
  }

  function textoCamino(camino) {
    if (!camino || !camino.length) return "";
    var texto = camino[0].estado || camino[0];
    for (var i = 1; i < camino.length; i += 1) {
      var paso = camino[i];
      var estadoPaso = paso.estado || paso;
      var simbolo = paso.simbolo ? paso.simbolo : "";
      texto += simbolo ? " —" + simbolo + "→ " + estadoPaso : " → " + estadoPaso;
    }
    return texto;
  }

  function pintarAutomata(id, camino) {
    var svg = $("auto-" + id);
    if (!svg) return;
    var dfa = dfaDe(id);
    var estados = (camino || []).map(function (paso) {
      return typeof paso === "string" ? paso : paso.estado;
    });
    Array.prototype.forEach.call(svg.querySelectorAll(".st"), function (el) {
      el.classList.remove("activo", "ok", "malo");
    });
    Array.prototype.forEach.call(svg.querySelectorAll(".ar"), function (el) {
      el.classList.remove("activo");
    });
    estados.forEach(function (nombre, indice) {
      var nodo = svg.querySelector('[data-estado="' + nombre + '"]');
      if (nodo) {
        nodo.classList.add("activo");
        if (indice === estados.length - 1) {
          nodo.classList.add(dfa.F.indexOf(nombre) !== -1 ? "ok" : "malo");
        }
      }
      if (indice > 0) {
        var arista = svg.querySelector('[data-edge="' + estados[indice - 1] + "-" + nombre + '"]');
        if (arista) arista.classList.add("activo");
      }
    });
  }

  function reconocerEnLab(id, cadena) {
    var dfa = dfaDe(id);
    var resultado = Lexia.reconocer(dfa, cadena);
    pintarAutomata(id, resultado.camino);
    var nota = textoCamino(resultado.camino) + ". " + resultado.razon;
    if (resultado.reservada) {
      nota += " La tabla de palabras reservadas lo clasifica como palabra reservada, no como identificador.";
    } else if (dfa.id === "ident" && resultado.ok) {
      nota += " No está en la tabla de reservadas: el token sería un identificador.";
    }
    if (dfa.id === "numero" && cadena === "-3") {
      nota += " En el analizador léxico el signo es un operador unario y 3 es el número.";
    }
    $("nota-" + id).textContent = (resultado.ok ? "Acepta. " : "Rechaza. ") + nota;
    var entrada = $(id === "numero" ? "entrada-numero" : "entrada-ident");
    if (entrada && entrada.value !== cadena) entrada.value = cadena;
  }

  function htmlTablaDelta(dfa) {
    var cabeza = dfa.columnas.map(function (col) { return "<th>" + esc(col.titulo) + "</th>"; }).join("");
    var filas = dfa.Q.map(function (estado) {
      var marca = dfa.F.indexOf(estado) !== -1 ? "*" : "";
      var celdas = dfa.columnas.map(function (col) {
        return "<td>" + esc(Lexia.destinoAfd(dfa, estado, col.clave)) + "</td>";
      }).join("");
      return "<tr><th>" + esc(estado + marca) + "</th>" + celdas + "</tr>";
    }).join("");
    return "<table><thead><tr><th>δ</th>" + cabeza + "</tr></thead><tbody>" + filas + "</tbody></table>"
      + "<p class='nota'>El asterisco marca un estado de aceptación. La tabla es total: lo que el diagrama no dibuja va a qe.</p>";
  }

  function htmlReservadas() {
    return Lexia.GRUPOS_RESERVADAS.map(function (grupo) {
      return "<p><strong>" + esc(grupo.nombre) + ".</strong> " + grupo.palabras.map(esc).join(", ") + "</p>";
    }).join("") + "<p class='nota'>El AFD solo decide si la forma es de identificador. Esta tabla, consultada después, separa las palabras reservadas.</p>";
  }

  function actualizarGutter(lineasError, lineaActiva) {
    var area = $("fuente");
    var total = area.value.split("\n").length;
    var html = "";
    for (var n = 1; n <= total; n += 1) {
      var clase = "";
      if (lineaActiva === n) clase = "activa";
      else if (lineasError && lineasError[n]) clase = "error";
      html += "<span class='" + clase + "'>" + n + "</span>";
    }
    $("gutter").innerHTML = html;
    $("gutter").scrollTop = area.scrollTop;
  }

  function lineasDeError(res) {
    var marcas = {};
    function sumar(lista) {
      (lista || []).forEach(function (error) {
        if (error && error.linea) marcas[error.linea] = true;
      });
    }
    if (!res) return marcas;
    sumar(res.erroresLexicos);
    sumar(res.balance.errores);
    sumar(res.sintaxis.errores);
    return marcas;
  }

  function sincronizarGutter() {
    $("gutter").scrollTop = $("fuente").scrollTop;
  }

  function actualizarPosicion() {
    var area = $("fuente");
    var lugar = Lexia.ubicar(area.value, area.selectionStart);
    $("posicion").textContent = "Línea " + lugar.linea + ", columna " + lugar.columna;
  }

  function htmlPila(simbolos) {
    if (!simbolos || !simbolos.length) return "";
    var tonos = { "(": "par", ")": "par", "[": "cor", "]": "cor", "{": "lla", "}": "lla", Z0: "z0" };
    var placas = simbolos.slice().reverse().map(function (simbolo, indice) {
      var tono = tonos[simbolo] || "";
      var tope = indice === 0 && simbolo !== "Z0" ? " tope" : "";
      var visible = simbolo === "Z0" ? "Z₀" : simbolo;
      return "<div class='placa " + tono + tope + "'>" + esc(visible) + "</div>";
    }).join("");
    return "<div class='pila-caja'><div class='pila'>" + placas + "</div><p class='pila-nota'>Arriba está el tope. Z₀ es el símbolo inicial.</p></div>";
  }

  function textoVeredicto(res) {
    var sintaxisDetenida = res.sintaxis.errores[0] && res.sintaxis.errores[0].origen === "lexico";
    if (res.aceptado && res.tokens.length === 0) {
      return "No quedan tokens después de quitar espacios y comentarios. El programa vacío pertenece al lenguaje y la pila acepta.";
    }
    if (res.aceptado && res.modo === "expresion") {
      return "La expresión pertenece al lenguaje: el léxico, la pila y la gramática aceptan.";
    }
    if (res.aceptado) {
      return "El programa pertenece al lenguaje: el léxico, la pila y la gramática aceptan.";
    }
    if (res.erroresLexicos.length && res.balance.ok && sintaxisDetenida) {
      return "Hay símbolos fuera del alfabeto. La pila no encontró un fallo de balanceo y la sintaxis se detuvo en el primer token inválido.";
    }
    if (!res.erroresLexicos.length && res.balance.ok && !res.sintaxis.ok) {
      return "Los delimitadores balancean, pero el fragmento no pertenece a la gramática. Balanceo y sintaxis comprueban cosas distintas.";
    }
    if (!res.erroresLexicos.length && !res.balance.ok && !res.sintaxis.ok) {
      return "La pila rechaza el balanceo y la gramática tampoco reconoce el fragmento.";
    }
    return "La entrada no fue aceptada. El léxico, la pila y la sintaxis informan cada uno por su lado.";
  }

  function htmlChips(res) {
    var lex = res.erroresLexicos.length
      ? { clase: "mal", titulo: "Rechaza", texto: res.erroresLexicos.length + (res.erroresLexicos.length === 1 ? " error" : " errores") }
      : { clase: "ok", titulo: "Acepta", texto: res.tokens.length ? "tokens bien formados" : "sin tokens" };
    var pila = res.balance.ok
      ? { clase: "ok", titulo: "Acepta", texto: "profundidad " + res.balance.profundidad }
      : { clase: "mal", titulo: "Rechaza", texto: res.balance.pasos.some(function (p) { return p.accion === "rechazar"; }) ? "quedó abierto" : "pareja inválida" };
    var syn;
    if (res.sintaxis.ok) syn = { clase: "ok", titulo: "Acepta", texto: res.modo === "expresion" ? "expresión" : "programa" };
    else if (res.sintaxis.errores[0] && res.sintaxis.errores[0].origen === "lexico") syn = { clase: "alerta", titulo: "Detenido", texto: "había un token inválido" };
    else syn = { clase: "mal", titulo: "Rechaza", texto: "fuera de la gramática" };
    return [
      ["Léxico", lex],
      ["Pila", pila],
      ["Sintaxis", syn]
    ].map(function (item) {
      return "<article class='chip " + item[1].clase + "'><span>" + item[0] + "</span><strong>" + item[1].titulo + "</strong><p>" + esc(item[1].texto) + "</p></article>";
    }).join("");
  }

  function htmlArbol(nodo) {
    if (!nodo) return "";
    var hijos = (nodo.hijos || []).map(htmlArbol).join("");
    var texto = nodo.texto && nodo.texto !== nodo.tipo ? "<span class='tx'>" + esc(nodo.texto) + "</span>" : "";
    var titulo = nodo.produccion ? " title='" + esc(nodo.produccion) + "'" : "";
    return "<li data-id='" + (nodo.id == null ? "" : nodo.id) + "'" + titulo + "><span class='nodo-arb t-" + esc(nodo.tipo) + "'><span class='tp'>" + esc(nodo.tipo) + "</span>" + texto + "</span>"
      + (hijos ? "<ul>" + hijos + "</ul>" : "") + "</li>";
  }

  function htmlProducciones(lista) {
    if (!lista || !lista.length) return "";
    var items = lista.map(function (produccion) { return "<li>" + esc(produccion) + "</li>"; }).join("");
    return "<details><summary>Producciones elegidas (" + lista.length + ")</summary><ol>" + items + "</ol></details>";
  }

  function renderTokens(res) {
    if (!res.tokens.length) {
      $("vista-tokens").innerHTML = "<p class='nota'>No hay tokens. Los espacios y los comentarios se descartan antes de los autómatas.</p>";
      return;
    }
    var filas = res.tokens.map(function (token, indice) {
      return "<tr data-i='" + indice + "' class='" + (token.tipo === "ERROR" ? "error" : "") + "'>"
        + "<td>" + (indice + 1) + "</td>"
        + "<td>" + token.linea + "</td>"
        + "<td>" + token.columna + "</td>"
        + "<td class='tipo " + token.tipo + "'>" + esc(Lexia.nombreTipo(token)) + "</td>"
        + "<td><code class='lexema'>" + esc(token.valor) + "</code></td>"
        + "<td>" + esc(token.detalle || token.mensaje || "") + "</td>"
        + "</tr>";
    }).join("");
    $("vista-tokens").innerHTML = "<div class='tabla-wrap'><table><thead><tr><th>#</th><th>Línea</th><th>Col</th><th>Tipo</th><th>Lexema</th><th>Cómo se reconoció</th></tr></thead><tbody>"
      + filas + "</tbody></table></div><p id='ayuda-token' class='nota'>Elige un identificador o un número para iluminar su autómata. La pestaña Autómatas conserva ese recorrido.</p>";
  }

  function renderPila(res) {
    var pasosPila = res.balance.pasos.map(function (paso, indice) {
      return "<li class='paso paso-" + paso.accion + "' data-paso='" + indice + "'><strong>" + esc(paso.titulo) + "</strong><span>línea " + paso.linea + "</span><p>" + esc(paso.detalle) + "</p></li>";
    }).join("");
    $("pila-analisis").innerHTML = "<div class='pila-layout'><div><p class='kicker'>Configuración final</p><div id='pila-foto'>"
      + htmlPila(res.balance.pilaFinal) + "</div></div><ol class='pasos'>" + pasosPila + "</ol></div>";
  }

  function renderArbol(res) {
    var modo = res.modo === "expresion"
      ? "Se analizó como expresión: no hay punto y coma, llaves ni una sentencia."
      : "Se analizó como programa.";
    var cuerpo = "<p class='nota'>" + modo + "</p>";
    if (!res.sintaxis.ok && res.sintaxis.errores[0]) {
      var error = res.sintaxis.errores[0];
      cuerpo += "<div class='alerta-caja'><strong>Línea " + error.linea + ", columna " + error.columna + ".</strong> " + esc(error.mensaje) + "</div>";
    }
    if (res.sintaxis.arbol) {
      cuerpo += "<ul class='arbol'>" + htmlArbol(res.sintaxis.arbol) + "</ul>";
    }
    cuerpo += htmlProducciones(res.sintaxis.producciones);
    $("vista-arbol").innerHTML = cuerpo;
  }

  function construirPasos(res) {
    var lista = [];
    res.tokens.forEach(function (token, indice) {
      lista.push({
        fase: "Léxico",
        titulo: Lexia.nombreTipo(token) + "  " + token.valor,
        detalle: token.detalle || token.mensaje || "",
        inicio: token.inicio,
        fin: token.fin,
        automata: token.automata || null,
        camino: token.camino || null,
        tokenIndice: indice
      });
    });
    res.balance.pasos.forEach(function (paso, indice) {
      lista.push({
        fase: "Pila",
        titulo: paso.titulo,
        detalle: paso.detalle,
        inicio: paso.inicio,
        fin: paso.fin,
        pila: paso.pila,
        accion: paso.accion,
        pasoPila: indice
      });
    });
    if (res.sintaxis.ok && res.sintaxis.arbol) {
      var frases = { Programa: 1, "Expresión": 1, "Declaración": 1, "Asignación": 1, If: 1, While: 1, Return: 1, Bloque: 1 };
      (function recorrer(nodo) {
        if (frases[nodo.tipo]) {
          var texto = nodo.texto && nodo.texto !== nodo.tipo ? nodo.tipo + " " + nodo.texto : nodo.tipo;
          lista.push({
            fase: "Sintaxis",
            titulo: texto,
            detalle: nodo.produccion || "Se reconoce esta construcción y sus hijos.",
            nodoId: nodo.id
          });
        }
        (nodo.hijos || []).forEach(recorrer);
      })(res.sintaxis.arbol);
    } else if (res.sintaxis.errores[0]) {
      var error = res.sintaxis.errores[0];
      lista.push({
        fase: "Sintaxis",
        titulo: error.origen === "lexico" ? "La sintaxis se detiene" : "Error sintáctico",
        detalle: error.mensaje,
        inicio: error.inicio,
        fin: error.fin
      });
    }
    return lista;
  }

  function limpiarMarcas() {
    Array.prototype.forEach.call(document.querySelectorAll("tr.actual, .paso.actual"), function (el) {
      el.classList.remove("actual");
    });
    var arbol = document.querySelector(".arbol");
    if (arbol) {
      arbol.classList.remove("en-sim");
      Array.prototype.forEach.call(arbol.querySelectorAll("li"), function (li) {
        li.classList.remove("pendiente", "actual");
      });
    }
    if (estado) {
      var foto = $("pila-foto");
      if (foto) foto.innerHTML = htmlPila(estado.balance.pilaFinal);
    }
    $("sim-pila").innerHTML = "";
    actualizarGutter(lineasDeError(estado), null);
  }

  function seleccionarRango(inicio, fin) {
    var area = $("fuente");
    var desde = Math.max(0, inicio || 0);
    var hasta = Math.max(desde, fin || desde);
    area.setSelectionRange(desde, hasta);
    var linea = Lexia.ubicar(area.value, desde).linea;
    var alto = parseFloat(getComputedStyle(area).lineHeight) || 22;
    var objetivo = Math.max(0, (linea - 4) * alto);
    if (area.scrollTop > objetivo || area.scrollTop + area.clientHeight < objetivo) {
      area.scrollTop = objetivo;
    }
    sincronizarGutter();
  }

  function restaurarError() {
    if (!estado) return;
    var candidatos = []
      .concat(estado.sintaxis.errores || [])
      .concat(estado.balance.errores || [])
      .concat(estado.erroresLexicos || []);
    var error = candidatos.filter(function (item) { return item && item.fin > item.inicio; })[0];
    if (error) seleccionarRango(error.inicio, error.fin);
  }

  function verResultado() {
    pausar();
    indiceSim = -1;
    limpiarMarcas();
    $("sim-fase").textContent = "Resultado";
    $("sim-titulo").textContent = "Vista final";
    $("sim-detalle").textContent = pasos.length ? "El recorrido tiene " + pasos.length + " pasos." : "";
    restaurarError();
    actualizarPosicion();
  }

  function irA(indice) {
    if (!pasos.length) return;
    indice = Math.max(0, Math.min(pasos.length - 1, indice));
    indiceSim = indice;
    var paso = pasos[indice];
    $("sim").hidden = false;
    $("sim-fase").textContent = paso.fase + " · " + (indice + 1) + " / " + pasos.length;
    $("sim-titulo").textContent = paso.titulo;
    $("sim-detalle").textContent = paso.detalle;
    $("sim-rango").value = String(indice);
    $("sim-prev").disabled = indice === 0;
    $("sim-next").disabled = indice === pasos.length - 1;

    Array.prototype.forEach.call(document.querySelectorAll("#vista-tokens tr"), function (fila) {
      fila.classList.toggle("actual", Number(fila.getAttribute("data-i")) === paso.tokenIndice);
    });
    Array.prototype.forEach.call(document.querySelectorAll("#pila-analisis .paso"), function (item) {
      item.classList.toggle("actual", Number(item.getAttribute("data-paso")) === paso.pasoPila);
    });

    if (paso.pila) {
      var foto = $("pila-foto");
      if (foto) foto.innerHTML = htmlPila(paso.pila);
      $("sim-pila").innerHTML = htmlPila(paso.pila);
    } else {
      $("sim-pila").innerHTML = "";
    }

    if (paso.automata && paso.camino) {
      pintarAutomata(paso.automata, paso.camino);
      var nota = $("nota-" + paso.automata);
      if (nota) nota.textContent = textoCamino(paso.camino) + ". " + paso.detalle;
    }

    var arbol = document.querySelector(".arbol");
    if (arbol) {
      var enSintaxis = paso.fase === "Sintaxis" && paso.nodoId != null && estado.sintaxis.arbol;
      var visibles = {};
      if (enSintaxis) {
        (function recoger(nodo, heredado) {
          var incluir = heredado || nodo.id <= paso.nodoId;
          if (incluir) visibles[nodo.id] = true;
          (nodo.hijos || []).forEach(function (hijo) { recoger(hijo, incluir); });
        })(estado.sintaxis.arbol, false);
      }
      arbol.classList.toggle("en-sim", enSintaxis);
      Array.prototype.forEach.call(arbol.querySelectorAll("li"), function (li) {
        var id = Number(li.getAttribute("data-id"));
        li.classList.toggle("pendiente", enSintaxis && !visibles[id]);
        li.classList.toggle("actual", enSintaxis && id === paso.nodoId);
      });
    }

    if (paso.fin > paso.inicio) seleccionarRango(paso.inicio, paso.fin);
    var linea = paso.inicio == null ? null : Lexia.ubicar($("fuente").value, paso.inicio).linea;
    actualizarGutter(lineasDeError(estado), linea);
    actualizarPosicion();
  }

  function pausar() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    var boton = $("sim-play");
    if (boton) boton.textContent = "Reproducir";
  }

  function reproducir() {
    if (!pasos.length) return;
    if (timer) {
      pausar();
      return;
    }
    if (indiceSim >= pasos.length - 1) indiceSim = -1;
    var boton = $("sim-play");
    boton.textContent = "Pausar";
    var tick = function () {
      if (indiceSim >= pasos.length - 1) {
        pausar();
        return;
      }
      irA(indiceSim + 1);
    };
    tick();
    timer = setInterval(tick, 700);
  }

  function analizar() {
    pausar();
    var area = $("fuente");
    estado = Lexia.procesar(area.value);
    if (area.value !== estado.fuente) area.value = estado.fuente;
    sucio = false;
    $("aviso").textContent = "";
    pasos = construirPasos(estado);
    indiceSim = -1;

    var veredicto = $("veredicto");
    veredicto.textContent = textoVeredicto(estado);
    veredicto.className = "veredicto " + (estado.aceptado ? "acepta" : "rechaza");
    $("chips").innerHTML = htmlChips(estado);
    $("resumen").textContent = estado.tokens.length + " tokens · profundidad " + estado.balance.profundidad
      + " · " + (estado.modo === "expresion" ? "modo expresión" : "modo programa");

    renderTokens(estado);
    renderPila(estado);
    renderArbol(estado);
    actualizarGutter(lineasDeError(estado), null);

    $("sim").hidden = false;
    $("sim-rango").max = String(Math.max(0, pasos.length - 1));
    $("sim-rango").value = "0";
    $("sim-fase").textContent = "Resultado";
    $("sim-titulo").textContent = estado.aceptado ? "Entrada aceptada" : "Entrada rechazada";
    $("sim-detalle").textContent = "El recorrido tiene " + pasos.length + " pasos.";
    $("sim-pila").innerHTML = "";
    $("sim-prev").disabled = true;
    $("sim-next").disabled = pasos.length === 0;
    restaurarError();
    actualizarPosicion();
  }

  function cargarEjemplo(indice) {
    var ejemplo = Lexia.EJEMPLOS[indice];
    if (!ejemplo) return;
    $("fuente").value = ejemplo.codigo;
    sucio = false;
    analizar();
  }

  function llenarTeoria() {
    $("gramatica").textContent = Lexia.GRAMATICA;
    $("notas-gramatica").innerHTML = Lexia.NOTAS_GRAMATICA.map(function (nota) {
      return "<li>" + esc(nota) + "</li>";
    }).join("");
    $("tupla-ident").textContent = Lexia.describirAfd(Lexia.DFA_IDENT);
    $("tupla-numero").textContent = Lexia.describirAfd(Lexia.DFA_NUMERO);
    $("tabla-ident").innerHTML = htmlTablaDelta(Lexia.DFA_IDENT);
    $("tabla-numero").innerHTML = htmlTablaDelta(Lexia.DFA_NUMERO);
    $("reservadas").innerHTML = htmlReservadas();
  }

  function mostrarTab(id) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-vista]"), function (boton) {
      boton.setAttribute("aria-selected", boton.getAttribute("data-vista") === id ? "true" : "false");
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-panel]"), function (panel) {
      panel.hidden = panel.getAttribute("data-panel") !== id;
    });
  }

  function simularPilaLibre(cadena) {
    var resultado = Lexia.validarBalance(cadena);
    var clase = resultado.ok ? "acepta" : "rechaza";
    var titulo = resultado.ok ? "La pila acepta." : "La pila rechaza.";
    $("salida-pila").innerHTML = "<p class='veredicto " + clase + "'>" + titulo + "</p>" + htmlPila(resultado.pilaFinal);
  }

  function marcarSucio() {
    sucio = true;
    pausar();
    $("aviso").textContent = "El texto cambió. Analiza de nuevo.";
  }

  function iniciar() {
    var select = $("ejemplos");
    Lexia.EJEMPLOS.forEach(function (ejemplo, indice) {
      var opcion = document.createElement("option");
      opcion.value = String(indice);
      opcion.textContent = ejemplo.nombre;
      select.appendChild(opcion);
    });
    llenarTeoria();
    reconocerEnLab("ident", "contador");
    reconocerEnLab("numero", "3.14");
    simularPilaLibre("([]{})");

    $("analizar").addEventListener("click", analizar);
    $("reproducir-atajo").addEventListener("click", function () {
      if (!estado || sucio) analizar();
      reproducir();
    });
    $("sim-play").addEventListener("click", reproducir);
    $("sim-prev").addEventListener("click", function () { pausar(); irA(indiceSim < 0 ? 0 : indiceSim - 1); });
    $("sim-next").addEventListener("click", function () { pausar(); irA(indiceSim < 0 ? 0 : indiceSim + 1); });
    $("sim-fin").addEventListener("click", verResultado);
    $("sim-rango").addEventListener("input", function (evento) {
      pausar();
      irA(Number(evento.target.value));
    });
    select.addEventListener("change", function () { cargarEjemplo(Number(select.value)); });

    var area = $("fuente");
    area.addEventListener("input", function () {
      marcarSucio();
      actualizarGutter(lineasDeError(estado), null);
      actualizarPosicion();
    });
    area.addEventListener("scroll", sincronizarGutter);
    area.addEventListener("keyup", actualizarPosicion);
    area.addEventListener("click", actualizarPosicion);
    area.addEventListener("keydown", function (evento) {
      if ((evento.ctrlKey || evento.metaKey) && evento.key === "Enter") {
        evento.preventDefault();
        analizar();
      }
    });

    $("vista-tokens").addEventListener("click", function (evento) {
      var fila = evento.target.closest("tr[data-i]");
      if (!fila || !estado) return;
      var token = estado.tokens[Number(fila.getAttribute("data-i"))];
      Array.prototype.forEach.call(document.querySelectorAll("#vista-tokens tr"), function (tr) {
        tr.classList.toggle("actual", tr === fila);
      });
      var ayuda = $("ayuda-token");
      if (token.automata && token.camino) {
        pintarAutomata(token.automata, token.camino);
        var nota = $("nota-" + token.automata);
        var recorrido = "Token " + token.valor + ". " + textoCamino(token.camino) + ". " + (token.detalle || "");
        if (nota) nota.textContent = recorrido;
        if (ayuda) ayuda.textContent = recorrido + " Abre Autómatas para ver el diagrama.";
      } else if (ayuda) {
        ayuda.textContent = token.detalle || token.mensaje || "";
      }
      seleccionarRango(token.inicio, token.fin);
    });

    document.querySelector(".tabs").addEventListener("click", function (evento) {
      var boton = evento.target.closest("[data-vista]");
      if (boton) mostrarTab(boton.getAttribute("data-vista"));
    });

    document.addEventListener("click", function (evento) {
      var prueba = evento.target.closest("[data-cadena]");
      if (!prueba) return;
      reconocerEnLab(prueba.getAttribute("data-auto"), prueba.getAttribute("data-cadena"));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".lab-afd"), function (form) {
      form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var id = form.getAttribute("data-auto");
        var campo = form.querySelector("input");
        reconocerEnLab(id, campo.value);
      });
    });
    $("lab-pila").addEventListener("submit", function (evento) {
      evento.preventDefault();
      simularPilaLibre($("entrada-pila").value);
    });

    cargarEjemplo(0);
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
