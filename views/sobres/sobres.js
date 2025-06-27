//Busca en el HTML el botón con clase .btn-abrir y el elemento <main>, donde se insertarán las cartas.
const btnAbrir = document.querySelector(".btn-abrir");
const main = document.querySelector("main");

//variables globales
  // Aquí se almacenarán las cartas obtenidas
  let cartas = [];
  // indica cuál carta estamos mostrando
  let indiceActual = 0;

//Cuando el usuario hace clic en el botón, se ejecuta abrirSobre 
btnAbrir.addEventListener("click", abrirSobre);

//me genera los numeros, y no genera repetidos
function generarIdsAleatorios(n, min, max) {
  const ids = new Set();
  
  while (ids.size < n) {
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    ids.add(random);
  }

  return Array.from(ids);
}

async function abrirSobre() {
  
  //Limpia el contenido del <main>, reinicia la lista de cartas y el índice
  main.innerHTML = "";
  cartas = [];
  indiceActual = 0;

  //Genera 5 IDs únicos entre 1 y 150
  const ids = generarIdsAleatorios(5, 1, 150);

  //Hace fetch a la PokeAPI por cada ID y guarda los datos en el array cartas
  for (let id of ids) {
    const datos = await obtenerPokemon(id);
    cartas.push(datos);
  }

  // Extrae los IDs en número (sin el "#") para almacenarlos y guarda los datos en el array cartas
  const idsObtenidos = cartas.map(p => parseInt(p.id.replace("#", "")));
  guardarDesbloqueados(idsObtenidos);

  //Muestra la primera carta del sobre en pantalla
  mostrarCarta(cartas[indiceActual]);
}

async function obtenerPokemon(id) {
  
  //Llama a la API para obtener el Pokémon por su ID
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await fetch(url);
  const data = await res.json();
  
  let pId= data.id.toString();
    
    if (pId.length === 1){
      pId= "00"+pId;
    }else if (pId.length === 2){
      pId= "0"+pId;
    }

  //Devuelve un objeto con los datos que necesita la carta
  return {
    nombre: data.name,
    id: `#${pId}`,
    hp: data.stats[0].base_stat,
    imagen: data.sprites.other["official-artwork"].front_default,
    tipos: data.types.map(t => t.type.name)
  };
}

//Obtiene los colores definidos en CSS para los tipos del pokemon
function aplicarColorPorTipo(div, tipos) {
  const rootStyles = getComputedStyle(document.documentElement);
  const colores = tipos.map(tipo => rootStyles.getPropertyValue(`--type-${tipo}`));

  if (colores.length === 1) {
    div.style.background = colores[0];
  } else if (colores.length >= 2) {
    div.style.background = `linear-gradient(135deg, ${colores[0]}, ${colores[1]})`;
  }
}

function crearCartaHTML(poke) {
  //Crea un div con clase pokemon, y le aplica color de fondo por tipo
  const div = document.createElement("div");
  div.className = "pokemon";
  aplicarColorPorTipo(div, poke.tipos);

  //Inserta en HTML los datos 
  div.innerHTML = `
    <div class="pokemon-imagen">
      <img src="${poke.imagen}" alt="${poke.nombre}">
    </div>
    <div class="pokemon-info">
      <div class="nombre-contenedor">
        <h2 class="pokemon-nombre">${poke.nombre}</h2>
        <p class="pokemon-id">${poke.id}</p>
      </div>
      <div class="pokemon-stats">
        <p class="stat">HP ${poke.hp}</p>
      </div>
    </div>
  `;

  //Devuelve la carta lista para agregar al DOM
  return div;
}

function mostrarCarta(carta) {

  //Muestra una carta
  const div = crearCartaHTML(carta);

  
  div.addEventListener("click", () => {
    indiceActual++;
    //Muestra la siguiente si hay más
    if (indiceActual < cartas.length) {
      main.innerHTML = "";
      mostrarCarta(cartas[indiceActual]);
    //muestra el resumen final  
    } else {
      mostrarResumenFinal();
    }
  });

  //Inserta la carta en pantalla
  main.appendChild(div);
}

function mostrarResumenFinal() {

  //Para limpiar la pantalla
  main.innerHTML = "";

  //Creo un div blanco con estilos para mostrar las cartas 
  const contenedorResumen = document.createElement("div");
  contenedorResumen.style.background = "white";
  contenedorResumen.style.padding = "1rem";
  contenedorResumen.style.borderRadius = "1rem";
  contenedorResumen.style.boxShadow = "0 0 1rem rgba(0,0,0,0.2)";
  contenedorResumen.style.marginBottom = "2rem";

  const titulo = document.createElement("h2");
  titulo.textContent = "Nuevas Cartas!";
  titulo.style.textAlign = "center";
  titulo.style.marginBottom = "1rem";
  titulo.style.color = "#333";

  const contenedor = document.createElement("div");
  contenedor.className = "pokemon-todos";

  //Agrego todas las cartas obtenidas en el sobre
  cartas.forEach(poke => {
    const div = crearCartaHTML(poke);
    contenedor.appendChild(div);
  });

  contenedorResumen.appendChild(titulo);
  contenedorResumen.appendChild(contenedor);
  main.appendChild(contenedorResumen);

  //Crea botón para abrir otro sobre 
  const btn = document.createElement("button");
  btn.textContent = "Abrir otro  sobre!";
  btn.className = "btn-abrir";
  btn.style.marginTop = "2rem";

  //lo que hace es recargar la pagina
  btn.addEventListener("click", () => {
    window.location.href = "sobres.html";
  });

  main.appendChild(btn);
}

function guardarDesbloqueados(nuevosIds) {
  
  //Obtengo los desbloqueados actuales del localStorage
  let actuales = JSON.parse(localStorage.getItem("pokemonesDesbloqueados")) || [];

  let huboCambios = false;

  //Agrega los nuevos si no están ya
  nuevosIds.forEach(id => {
    if (!actuales.includes(id)) {
      actuales.push(id);
      huboCambios = true;
    }
  });

  //Solo actualiza el almacenamiento si hubo cambios
  if (huboCambios) {
    localStorage.setItem("pokemonesDesbloqueados", JSON.stringify(actuales));
  }
}

