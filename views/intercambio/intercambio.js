// ID único para identificar al usuario en esta sesión
const clientId = "usuario-" + Math.random().toString(36).substring(2, 10);

let seleccionadasPropias = [];
let seleccionadasOponente = [];
let MAX_CARTAS;
let btnIntercambio;
let canal;

let solicitudRecibida = null; 
let yoYaPresione = false;   
let nombreOtroUsuario = null;
let conexionEstablecida = false;


document.addEventListener("DOMContentLoaded", () => {
    
  const misCartas = document.getElementById("misCartas");
  const cartasRecibidas = document.getElementById("cartasRecibidas");
  btnIntercambio = document.getElementById("btnIntercambio");
  MAX_CARTAS = 5;
  const ably = new Ably.Realtime("bO3YUA.nawySw:rthGQwtfJ6c_T6BwDWs0bMBn9j4mVo6132tL11NTfKQ");
  canal = ably.channels.get("intercambioPokemon")
  const idsDesbloqueados = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];

  if (idsDesbloqueados.length === 0) {
    misCartas.innerHTML = "<p>No tienes cartas desbloqueadas.</p>";
    return;
  }

  idsDesbloqueados.forEach(async (id) => {
    const poke = await obtenerPokemon(id);
    const carta = crearCarta(poke, false); 
    misCartas.appendChild(carta);
  });

    
  canal.subscribe("seleccion", async (mensaje) => {
    
    if (mensaje.data.origen === clientId) return; // no proceses si tú lo enviaste
    
    if (!conexionEstablecida) {
      nombreOtroUsuario = mensaje.data.origen;
      actualizarHeaderConexion();
      conexionEstablecida = true;
    }

    const ids = mensaje.data.cartas;
    seleccionadasOponente = ids;
    cartasRecibidas.innerHTML = "";

    for (let id of ids) {
      const poke = await obtenerPokemon(id);
      const carta = crearCarta(poke, true);
      cartasRecibidas.appendChild(carta);
    }

    btnIntercambio.disabled = !(seleccionadasPropias.length > 0 && seleccionadasOponente.length > 0);
  });
    
  canal.subscribe("intercambioSolicitado", (mensaje) => {
    if (!conexionEstablecida) {
      nombreOtroUsuario = mensaje.data.origen;
      actualizarHeaderConexion();
      conexionEstablecida = true; 
    }

    actualizarHeaderConexion();

    // Ignorar si soy yo mismo
    if (mensaje.data.origen === clientId) return; 
    solicitudRecibida = mensaje.data;
    // Verificamos si ya ambos presionaron
    verificarIntercambio(); 
  });

  btnIntercambio.addEventListener("click", () => {
    yoYaPresione = true;
    canal.publish("intercambioSolicitado", {
      origen: clientId,
      cartas: seleccionadasPropias
    });
    // Verificamos si ya ambos han presionado
    verificarIntercambio(); 
  });

});

async function obtenerPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return await res.json();
}

function crearCarta(poke, esDelOponente) {
  let pokeId= poke.id.toString();
  const div = document.createElement("div");
  div.classList.add("carta");

  //Para ponerle mas ceros al id
  if (pokeId.length === 1){
    pokeId= "00"+pokeId;
  }else if (pokeId.length === 2){
    pokeId= "0"+pokeId;
  }

  const tipos = poke.types.map(type => type.type.name);
  const rootStyles = getComputedStyle(document.documentElement);
  const colores = tipos.map(tipo => rootStyles.getPropertyValue(`--type-${tipo}`));

  if (colores.length === 1) {
    div.style.background = colores[0];
  } else if (colores.length >= 2) {
    div.style.background = `linear-gradient(135deg, ${colores[0]}, ${colores[1]})`;
  }

  div.innerHTML = `
    <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
    <p>${poke.name}</p>
    <p>#${pokeId}</p>
  `;

  if (!esDelOponente) {
    div.addEventListener("click", () => {
      manejarSeleccion(div, poke.id);
    });
  }
  return div;
}

function manejarSeleccion(cartaDiv, id) {
  const index = seleccionadasPropias.indexOf(id);
  const yaEstaba = index !== -1;

  if (yaEstaba) {
    seleccionadasPropias.splice(index, 1);
    cartaDiv.classList.remove("seleccionada");
  } else {
    if (seleccionadasPropias.length < MAX_CARTAS) {
      seleccionadasPropias.push(id);
      cartaDiv.classList.add("seleccionada");
    } else {
      alert("Máximo 5 cartas.");
      return;
    }
  }

  // Enviar selección a Ably
  canal.publish("seleccion", {
    cartas: seleccionadasPropias,
    origen: clientId //  agregamos quién lo envió
  });

  // Habilitar botón si ambas partes tienen cartas
  btnIntercambio.disabled = !(seleccionadasPropias.length > 0 && seleccionadasOponente.length > 0);
}

function verificarIntercambio() {
  if (yoYaPresione && solicitudRecibida) {
  
    yoYaPresione = false;
    btnIntercambio.disabled = true;

    const modal = document.getElementById("modalResumen");
    const entregadas = document.getElementById("cartasEntregadas");
    const recibidas = document.getElementById("cartasRecibidasResumen");

    entregadas.innerHTML = "";
    recibidas.innerHTML = "";

    // Renderizar tus cartas
    seleccionadasPropias.forEach(async (id) => {
      const poke = await obtenerPokemon(id);
      const carta = crearCarta(poke, true);
      entregadas.appendChild(carta);
    });

    // Renderizar cartas recibidas
    solicitudRecibida.cartas.forEach(async (id) => {
      const poke = await obtenerPokemon(id);
      const carta = crearCarta(poke, true);
      recibidas.appendChild(carta);
    });

    modal.classList.remove("oculto");

    // CONFIRMACIÓN DOBLE
    let yoConfirme = false;
    let otroConfirmo = false;

    document.getElementById("btnConfirmarResumen").onclick = () => {
      yoConfirme = true;
      canal.publish("confirmacionIntercambio", { origen: clientId });
      verificarConfirmacion();
      modal.classList.add("oculto");
    };

    document.getElementById("btnCancelarResumen").onclick = () => {
      canal.publish("cancelarIntercambio", { origen: clientId });
      modal.classList.add("oculto");
      console.log("Intercambio cancelado por este usuario.");
    };

    // ESCUCHAR CONFIRMACIÓN DEL OTRO
    canal.subscribe("confirmacionIntercambio", (mensaje) => {
      if (mensaje.data.origen !== clientId) {
        otroConfirmo = true;
        verificarConfirmacion();
      }
    });

    canal.subscribe("cancelarIntercambio", (mensaje) => {
      if (mensaje.data.origen !== clientId) {
        alert("El otro usuario canceló el intercambio.");
        modal.classList.add("oculto");
      }
    });

    function verificarConfirmacion() {
      if (yoConfirme && otroConfirmo) {
        
        // Ejecutar intercambio real
        let desbloqueados = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];
        desbloqueados = desbloqueados.filter(id => !seleccionadasPropias.includes(id));
        
        solicitudRecibida.cartas.forEach(id => {
          if (!desbloqueados.includes(id)) desbloqueados.push(id);
        });
        
        localStorage.setItem("pokemonesDesbloqueados", JSON.stringify(desbloqueados));
        alert("Intercambio realizado con éxito.");
        location.reload();
      }
    }
  }
}

function actualizarHeaderConexion() {
  const infoConexion = document.getElementById("infoConexion");
  
  if (infoConexion && nombreOtroUsuario) {
    infoConexion.textContent = "Conectado con: " + nombreOtroUsuario;
  }

}