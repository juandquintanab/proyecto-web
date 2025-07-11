// ID único para identificar al usuario en esta sesión
const clientId = "usuario-" + Math.random().toString(36).substring(2, 10);
// Variables para manejar la selección y el intercambio
let seleccionadasPropias = [];
let seleccionadasOponente = [];
let MAX_CARTAS;
let btnIntercambio;
let canal;
//Esto es la solicitud del otro usuario
let solicitudRecibida = null; 
//para saber si ya confirme
let yoYaPresione = false;   
let nombreOtroUsuario = null;
let conexionEstablecida = false;

// Espera a que el DOM esté listo para inicializar la lógica
// Configura la conexión con Ably y la interfaz
// Carga las cartas desbloqueadas y prepara los eventos

document.addEventListener("DOMContentLoaded", () => {
    
  const misCartas = document.getElementById("misCartas");
  const cartasRecibidas = document.getElementById("cartasRecibidas");
  btnIntercambio = document.getElementById("btnIntercambio");
  MAX_CARTAS = 5;
   // Inicializa la conexión con Ably (WebSockets)
  const ably = new Ably.Realtime("bO3YUA.nawySw:rthGQwtfJ6c_T6BwDWs0bMBn9j4mVo6132tL11NTfKQ");
  canal = ably.channels.get("intercambioPokemon")
  // Carga las cartas desbloqueados del localStorage
  const idsDesbloqueados = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];

  // Si no hay cartas, muestra mensaje
  if (idsDesbloqueados.length === 0) {
    misCartas.innerHTML = "<p>No tienes cartas desbloqueadas.</p>";
    return;
  }

  // Muestra las cartas desbloqueadas
  idsDesbloqueados.forEach(async (id) => {
    const poke = await obtenerPokemon(id);
    const carta = crearCarta(poke, false); 
    misCartas.appendChild(carta);
  });

  // Suscribe a eventos de selección de cartas del otro usuario
  canal.subscribe("seleccion", async (mensaje) => {
    
    // Ignora si el mensaje es propio
    if (mensaje.data.origen === clientId) return; // no proceses si tú lo enviaste
    // Si es la primera vez, establece la conexión
    if (!conexionEstablecida) {
      nombreOtroUsuario = mensaje.data.origen;
      actualizarHeaderConexion();
      conexionEstablecida = true;
    }

    // Actualiza las cartas seleccionadas del oponente
    const ids = mensaje.data.cartas;
    seleccionadasOponente = ids;
    cartasRecibidas.innerHTML = "";

    for (let id of ids) {
      const poke = await obtenerPokemon(id);
      const carta = crearCarta(poke, true);
      cartasRecibidas.appendChild(carta);
    }

    // Habilita el botón si ambos han seleccionado cartas
    btnIntercambio.disabled = !(seleccionadasPropias.length > 0 && seleccionadasOponente.length > 0);
  });
  
  // Suscribe a eventos de solicitud de intercambio
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

   // Evento de click en el botón para proponer intercambio
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

// Obtiene los datos de un Pokémon por su ID desde la API
async function obtenerPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return await res.json();
}

// Crea la carta visual de un Pokémon
// Si esDelOponente=true, la carta no es seleccionable
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

   // Estructura de la carta
  div.innerHTML = `
    <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
    <p>${poke.name}</p>
    <p>#${pokeId}</p>
  `;

   // Si es tu carta, permite seleccionarla
  if (!esDelOponente) {
    div.addEventListener("click", () => {
      manejarSeleccion(div, poke.id);
    });
  }
  return div;
}

// Maneja la selección/deselección de cartas propias
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

// Verifica si ambos usuarios han confirmado el intercambio
// Si es así, muestra el resumen y realiza el intercambio
function verificarIntercambio() {
  if (yoYaPresione && solicitudRecibida) {
  
    yoYaPresione = false;
    btnIntercambio.disabled = true;

    const modal = document.getElementById("modalResumen");
    const entregadas = document.getElementById("cartasEntregadas");
    const recibidas = document.getElementById("cartasRecibidasResumen");

    entregadas.innerHTML = "";
    recibidas.innerHTML = "";

     // Muestra las cartas que entregas
    seleccionadasPropias.forEach(async (id) => {
      const poke = await obtenerPokemon(id);
      const carta = crearCarta(poke, true);
      entregadas.appendChild(carta);
    });

     // Muestra las cartas que recibes
    solicitudRecibida.cartas.forEach(async (id) => {
      const poke = await obtenerPokemon(id);
      const carta = crearCarta(poke, true);
      recibidas.appendChild(carta);
    });

    // Muestra el modal de resumen
    modal.classList.remove("oculto");

    // CONFIRMACIÓN DOBLE
    let yoConfirme = false;
    let otroConfirmo = false;

    // Botón para confirmar
    document.getElementById("btnConfirmarResumen").onclick = () => {
      yoConfirme = true;
      canal.publish("confirmacionIntercambio", { origen: clientId });
      verificarConfirmacion();
      modal.classList.add("oculto");
    };

    // Botón para cancelar
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

    //Verifica la confirmacion y la hace
    function verificarConfirmacion() {
      if (yoConfirme && otroConfirmo) {
        
        // Ejecutar intercambio real
        let desbloqueados = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];
        desbloqueados = desbloqueados.filter(id => !seleccionadasPropias.includes(id));
        
        solicitudRecibida.cartas.forEach(id => {
          if (!desbloqueados.includes(id)) desbloqueados.push(id);
        });
        
        // Guarda y recarga la página        
        localStorage.setItem("pokemonesDesbloqueados", JSON.stringify(desbloqueados));
        alert("Intercambio realizado con éxito.");
        location.reload();
      }
    }
  }
}

// Actualiza el header con el nombre del otro usuario si está conectado
function actualizarHeaderConexion() {
  const infoConexion = document.getElementById("infoConexion");
  
  if (infoConexion && nombreOtroUsuario) {
    infoConexion.textContent = "Conectado con: " + nombreOtroUsuario;
  }

}