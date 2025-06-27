# Mi Colección Pokémon 

Aplicación web interactiva para coleccionar, visualizar e intercambiar cartas digitales de los primeros 150 Pokémon, inspirada en la experiencia de abrir sobres físicos. Desarrollada con HTML5, CSS3 y JavaScript puro, aprovechando la [PokeAPI](https://pokeapi.co/) y WebSockets para funcionalidades en tiempo real.

---

## Funcionalidades principales

- ** Índice de cartas**  
  Visualiza una cuadrícula con los 150 Pokémon. Las cartas desbloqueadas muestran sus detalles, las no obtenidas están grisadas.

- ** Apertura de sobres**  
  Genera 6 cartas aleatorias con animación. Se almacenan en `localStorage` y actualizan el progreso del jugador.

- ** Intercambio en tiempo real**  
  Dos usuarios pueden intercambiar cartas usando WebSockets. Ambos deben seleccionar una carta desbloqueada para hacer el intercambio.

- ** Diseño responsive**  
  Optimizado para dispositivos móviles con enfoque *mobile first*.

---

## Como usarlo?

1. Abre el archivo views/coleccion/coleccion.html o cualquier otra vista en tu navegador.
2. Para probar el intercambio, abre intercambio.html en dos dispositivos o pestañas distintas. (no sirve)
3. También puedes desplegar el sitio en GitHub Pages para probarlo desde móviles. (no sirve)

