//Variables globales
  const listaPokemon = document.querySelector("#listaPokemon");
  const botonesHeader = document.querySelectorAll(".btn-header");
  //Se usan para la barra de busqueda
  const inputBusqueda = document.querySelector("#inputBusqueda"); 
  let todosLosPokemones = []; 
  //Carga desde localstorage los pokemones desbloqueados
  const desbloqueados = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];  
  //URL de la poke api
  let URL= "https://pokeapi.co/api/v2/pokemon/";
  // Elementos del DOM
  const modal = document.getElementById("modal-pokemon");
  const cerrarModalBtn = document.getElementById("cerrarModal");

//hace la carga inicial, con un ciclo for que reocrre los 150 primeros
for(let i=1; i<=150; i++){
    fetch(URL+i)
        .then((response) => response.json())
        .then(data => {
            //muestra los pokemones
            mostrarPokemon(data);
            // Guarda para búsqueda, se usa para lo de la barra de busqueda
            todosLosPokemones.push(data);  
        })  
}

function mostrarPokemon(poke) {

  let pokeId= poke.id.toString();
    
  const div = document.createElement("div");
  div.classList.add("pokemon");

  const estaDesbloqueado = desbloqueados.includes(poke.id);
  
  //Para ponerle mas ceros al id
  if (pokeId.length === 1){
    pokeId= "00"+pokeId;
  }else if (pokeId.length === 2){
    pokeId= "0"+pokeId;
  }
   
  //esto pasa si el pokemon que tengo  esta desbloqueado
  if (estaDesbloqueado) {
  
    //para poner fondo de color
    const tipos = poke.types.map(type => type.type.name);
    const rootStyles = getComputedStyle(document.documentElement);
    const colores = tipos.map(tipo => rootStyles.getPropertyValue(`--type-${tipo}`));

    if (colores.length === 1) {
        div.style.background = colores[0];
    } else if (colores.length >= 2) {
        div.style.background = `linear-gradient(135deg, ${colores[0]}, ${colores[1]})`;
    }

    //lo que tendra mi html
    div.innerHTML = `
        <div class="pokemon-imagen">
          <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
        </div>

        <div class="pokemon-info">
          <div class="nombre-contenedor">
            <h2 class="pokemon-nombre">${poke.name}</h2>
            <p class="pokemon-id">#${pokeId}</p>
          </div> 

          <div class="pokemon-stats">
            <p class="stat">HP ${poke.stats[0].base_stat}</p>
          </div>

        </div>`;

    //Si le dooy click al pokemon sale el modal
    div.addEventListener("click", () => {
      mostrarModalConPokemon(poke);
    });

  //Si no esta desbloqueado pasa esto
  } else{
    div.classList.add("bloqueado");

    div.innerHTML = `
        <div class="pokemon-imagen">
          <img src="${poke.sprites.other["official-artwork"].front_default}" alt="Desconocido" style="filter: grayscale(1); opacity: 0.3;">
        </div>

        <div class="pokemon-info">
          <div class="nombre-contenedor">
            <h2 class="pokemon-nombre">????</h2>
            <p class="pokemon-id">#???</p>
          </div>

          <div class="pokemon-stats">
            <p class="stat">HP ???</p>
          </div>
        </div>`;
  }

  //lo agrego a la lista de pokemones
  listaPokemon.append(div);
}

//para que los botones sirvan
botonesHeader.forEach(boton => boton.addEventListener("click",(event)=>{
  const botonId = event.currentTarget.id;
  listaPokemon.innerHTML="";

  for(let i=1; i<=150;i++){
    fetch(URL+i)
      .then((response) => response.json())
      .then(data => {

        if (botonId ==="vtodos"){
          mostrarPokemon(data);
        }else{
          const tipos = data.types.map(type => type.type.name);
          if(tipos.some(tipo => tipo.includes(botonId))){
            mostrarPokemon(data);
          }
        }    
      })
  }
}));

// Mostrar varios pokémon
function mostrarPokemones(lista) {
    listaPokemon.innerHTML = "";
    lista.forEach(poke => mostrarPokemon(poke));
}

// Búsqueda en tiempo real por nombre
inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.toLowerCase();
    const filtrados = todosLosPokemones.filter(poke => poke.name.toLowerCase().startsWith(texto));
    mostrarPokemones(filtrados);
});

//Muestra el modal (descripcion del pokemon)
function mostrarModalConPokemon(poke) {
  // ID y nombre
  let pokeId= poke.id.toString();
  
  if (pokeId.length === 1){
    pokeId= "00"+pokeId;
  }else if (pokeId.length === 2){
    pokeId= "0"+pokeId;
  }
   
  document.getElementById("modal-id").textContent = "#" + pokeId;
  document.getElementById("modal-nombre").textContent = poke.name.toUpperCase();
  document.getElementById("modal-img").src = poke.sprites.other["official-artwork"].front_default;
  const tipoContenedor = document.getElementById("modal-tipo");
  tipoContenedor.innerHTML = "";
  
  poke.types.forEach(t => {
    const tipo = t.type.name;
    const p = document.createElement("p");
    p.classList.add(tipo);
    p.textContent = tipo.toUpperCase();
    tipoContenedor.appendChild(p);
  });

  document.getElementById("modal-peso").textContent = `${poke.weight / 10} kg`;
  document.getElementById("modal-altura").textContent = `${poke.height/10} m`;
  
  const statsContenedor = document.getElementById("modal-stats");
  statsContenedor.innerHTML = "";

  poke.stats.forEach(stat => {
    const p = document.createElement("p");
    const nombreStat = stat.stat.name.replace("-", " ");
    p.innerHTML = `<strong>${nombreStat}:</strong> ${stat.base_stat}`;
    statsContenedor.appendChild(p);
  });

  // Descripción
  fetch(`https://pokeapi.co/api/v2/pokemon-species/${poke.name}`)
    .then(res => res.json())
    .then(data => {
      const texto = data.flavor_text_entries.find(t => t.language.name === "es");
      document.getElementById("modal-descripcion").textContent = texto?.flavor_text.replace(/\f/g, " ") || "Sin descripción.";
  });

  // Mostrar modal
  modal.classList.remove("oculto");
}

// Cierra el modal
cerrarModalBtn.addEventListener("click", () => {modal.classList.add("oculto");});

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorDesbloqueados();
  actualizarProgresoColeccion();
});

//Actualiza el contador de cartas desbloqueadas
function actualizarContadorDesbloqueados() {
  
  const contador = document.getElementById("contador-cartas");

  // Obtiene el array de IDs desde localStorage (o lista vacía si no existe)
  const desbloqueados = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];

  // Calcula cuántos están desbloqueados
  const cantidad = desbloqueados.length;

  // Actualiza el contenido del contador
  contador.textContent = `${cantidad}/150 Pokémon`;
}

//Actualiza la barra de progreso y el texto de porcentaje
function actualizarProgresoColeccion() {
  
  const progreso = document.getElementById("progreso");
  const porcentajeTexto = document.getElementById("porcentaje-progreso");
  // Obtener el array de IDs desde localStorage (si no hay, usar lista vacía)
  const desbloqueados = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];
  // Calcular cuántos Pokémon están desbloqueados
  const cantidad = desbloqueados.length;
  // Valor máximo de la colección
  const total = 150;

  // Actualizar el valor de la barra de progreso
  progreso.value = cantidad;
  progreso.max = total;

  // Calcular el porcentaje y actualizar el texto
  const porcentaje = Math.round((cantidad / total) * 100);
  porcentajeTexto.textContent = `${porcentaje}%`;

}