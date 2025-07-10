// ✅ Ably: crea conexión y canal compartido
//const ably = new Ably.Realtime("bO3YUA.nawySw:rthGQwtfJ6c_T6BwDWs0bMBn9j4mVo6132tL11NTfKQ");
//const canal = ably.channels.get("intercambioPokemon");
/*document.addEventListener("DOMContentLoaded", async () => {
  const contenedorMisCartas = document.getElementById("misCartas");
  const contenedorCartasRecibidas = document.getElementById("cartasRecibidas");
  const btnIntercambio = document.getElementById("btnIntercambio");

  let cartasSeleccionadasUsuario = [];
  let cartasSeleccionadasRecibidas = [];

  const MAX_CARTAS = 5;
  let misCartas = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];

  if (misCartas.length === 0) {
    contenedorMisCartas.innerHTML = "<p>No tienes cartas desbloqueadas.</p>";
    return;
  }

  async function obtenerPokemon(id) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    return await res.json();
  }

  function aplicarColoresPorTipo(div, tipos) {
    const rootStyles = getComputedStyle(document.documentElement);
    const colores = tipos.map(tipo => rootStyles.getPropertyValue(`--type-${tipo}`));
    if (colores.length === 1) {
      div.style.background = colores[0];
    } else if (colores.length >= 2) {
      div.style.background = `linear-gradient(135deg, ${colores[0]}, ${colores[1]})`;
    }
  }

  function crearCarta(poke, seleccionable = false, grupo = []) {
    const div = document.createElement("div");
    div.classList.add("carta");

    const tipos = poke.types.map(t => t.type.name);
    aplicarColoresPorTipo(div, tipos);

    div.innerHTML = `
      <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
      <p class="nombre">${poke.name}</p>
      <p class="id">#${poke.id.toString().padStart(3, "0")}</p>
    `;

    if (seleccionable) {
      div.addEventListener("click", () => {
        const id = poke.id;
        const index = grupo.indexOf(id);

        if (div.classList.contains("seleccionada")) {
          div.classList.remove("seleccionada");
          if (index !== -1) grupo.splice(index, 1);
        } else {
          if (grupo.length < MAX_CARTAS) {
            div.classList.add("seleccionada");
            grupo.push(id);
          } else {
            alert("Solo puedes seleccionar hasta 5 cartas.");
          }
        }

        validarSeleccion();
      });
    }

    return div;
  }

  function validarSeleccion() {
    btnIntercambio.disabled =
      cartasSeleccionadasUsuario.length === 0 || cartasSeleccionadasRecibidas.length === 0;
  }

  async function renderizarMisCartas() {
    contenedorMisCartas.innerHTML = "";
    for (let id of misCartas) {
      const poke = await obtenerPokemon(id);
      const carta = crearCarta(poke, true, cartasSeleccionadasUsuario);
      contenedorMisCartas.appendChild(carta);
    }
  }

  // ✅ Escuchar cartas del otro usuario
  canal.subscribe("oferta", async mensaje => {
    const recibidas = mensaje.data.cartas;
    cartasSeleccionadasRecibidas = recibidas;
    contenedorCartasRecibidas.innerHTML = "";

    for (let id of recibidas) {
      const poke = await obtenerPokemon(id);
      const carta = crearCarta(poke, false);
      contenedorCartasRecibidas.appendChild(carta);
    }

    validarSeleccion();
  });

  // ✅ Proponer intercambio y aplicar cambios en localStorage
  btnIntercambio.addEventListener("click", () => {
    if (cartasSeleccionadasUsuario.length === 0 || cartasSeleccionadasRecibidas.length === 0) return;

    // Eliminar las cartas ofrecidas (si están)
    misCartas = misCartas.filter(id => !cartasSeleccionadasUsuario.includes(id));

    // Agregar las cartas nuevas (sin duplicados)
    cartasSeleccionadasRecibidas.forEach(id => {
      if (!misCartas.includes(id)) {
        misCartas.push(id);
      }
    });

    // Guardar en localStorage
    localStorage.setItem("pokemonesDesbloqueados", JSON.stringify(misCartas));

    // Enviar tus cartas al otro jugador
    canal.publish("oferta", {
      cartas: cartasSeleccionadasUsuario
    });

    alert("¡Intercambio realizado!");
    // Recargar visual
    cartasSeleccionadasUsuario = [];
    cartasSeleccionadasRecibidas = [];
    renderizarMisCartas();
    contenedorCartasRecibidas.innerHTML = "";
    validarSeleccion();
  });

  // 🔁 Inicializar visualización
  renderizarMisCartas();
});*/

document.addEventListener("DOMContentLoaded", async () => {
  const contenedorMisCartas = document.getElementById("misCartas");
  const contenedorCartasRecibidas = document.getElementById("cartasRecibidas");
  const btnIntercambio = document.getElementById("btnIntercambio");

  // Arrays para las cartas seleccionadas
  let cartasSeleccionadasUsuario = [];
  let cartasSeleccionadasRecibidas = [];

  const MAX_CARTAS = 5;

  let idsDesbloqueados = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];

  if (idsDesbloqueados.length === 0) {
    contenedorMisCartas.innerHTML = "<p>No tienes cartas desbloqueadas.</p>";
    contenedorCartasRecibidas.innerHTML = "<p>No tienes cartas desbloqueadas.</p>";
    return;
  }

  async function obtenerPokemon(id) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    return await res.json();
  }

  function aplicarColoresPorTipo(div, tipos) {
    const rootStyles = getComputedStyle(document.documentElement);
    const colores = tipos.map(tipo => rootStyles.getPropertyValue(`--type-${tipo}`));
    if (colores.length === 1) {
      div.style.background = colores[0];
    } else if (colores.length >= 2) {
      div.style.background = `linear-gradient(135deg, ${colores[0]}, ${colores[1]})`;
    }
  }

  function crearCarta(pokeData, esRecibida = false) {
    const div = document.createElement("div");
    div.classList.add("carta");

    const tipos = pokeData.types.map(t => t.type.name);
    aplicarColoresPorTipo(div, tipos);

    div.innerHTML =`
      <img src="${pokeData.sprites.other["official-artwork"].front_default}" alt="${pokeData.name}">
      <p class="nombre">${pokeData.name}</p>
      <p class="id">#${pokeData.id.toString().padStart(3, "0")}</p>`
    ;

    div.addEventListener("click", () => {
      const grupo = esRecibida ? cartasSeleccionadasRecibidas : cartasSeleccionadasUsuario;
      const grupoHTML = esRecibida ? contenedorCartasRecibidas : contenedorMisCartas;

      const yaSeleccionada = div.classList.contains("seleccionada");
      const pokeID = pokeData.id;

      if (yaSeleccionada) {
        div.classList.remove("seleccionada");
        const index = grupo.indexOf(pokeID);
        if (index !== -1) grupo.splice(index, 1);
      } else {
        if (grupo.length < MAX_CARTAS) {
          div.classList.add("seleccionada");
          grupo.push(pokeID);
        } else {
          alert("Solo puedes seleccionar hasta 5 cartas.");
        }
      }

      validarSeleccion();
    });

    return div;
  }

  function validarSeleccion() {
    if (cartasSeleccionadasUsuario.length > 0 && cartasSeleccionadasRecibidas.length > 0) {
      btnIntercambio.disabled = false;
    } else {
      btnIntercambio.disabled = true;
    }
  }

  for (let id of idsDesbloqueados) {
    const poke = await obtenerPokemon(id);
    const cartaUsuario = crearCarta(poke, false);
    const cartaRecibida = crearCarta(poke, true);
    contenedorMisCartas.appendChild(cartaUsuario);
    contenedorCartasRecibidas.appendChild(cartaRecibida);
  }
});
