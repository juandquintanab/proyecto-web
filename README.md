# Mi Colección Pokémon

Aplicación web interactiva para coleccionar, visualizar e intercambiar cartas digitales de los primeros 150 Pokémon, inspirada en la experiencia de abrir sobres físicos. Desarrollada con HTML5, CSS3 y JavaScript puro, aprovechando la [PokeAPI](https://pokeapi.co/) y WebSockets para funcionalidades en tiempo real.
## ¿Qué hace la app?

Esta es una aplicación web para coleccionar cartas de Pokémon que incluye tres funcionalidades principales:

### Colección
- Visualiza los primeros 150 Pokémon de la PokéAPI
- Filtra Pokémon por tipo (Normal, Fire, Water, Grass, etc.)
- Busca Pokémon por nombre
- Ve detalles completos de cada Pokémon (estadísticas, descripción, peso, altura)
- Sistema de progreso que muestra cuántos Pokémon has desbloqueado
- Los Pokémon no desbloqueados aparecen en gris
- Responsive Design - Funciona en móviles y escritorio
- Progreso persistente - Tu colección se guarda en el navegador
- Solo HTML, CSS y JavaScript vanilla
- API pública - Utiliza la PokéAPI gratuita

### Sobres
- Abre sobres virtuales con 5 cartas aleatorias
- Las cartas obtenidas se añaden automáticamente a tu colección
- Interfaz interactiva para revelar las cartas una por una
- Resumen final de todas las cartas obtenidas

### Intercambio
- Intercambia cartas con otros usuarios en tiempo real
- Selecciona hasta 5 cartas para intercambiar
- Confirmación visual antes de realizar el intercambio
- Conexión en tiempo real usando Ably

## Cómo instalarla o visualizarla ?

### Opción 1: Visualización directa
1. Descarga o clona este proyecto
2. Abre el archivo `index.html` en tu navegador web
3. Listo, de esta manera La aplicación funcionará completamente

### Opción 2: Servidor local 
1. Descarga o clona este proyecto
2. Abre una terminal en la carpeta del proyecto
3. Ejecuta un servidor local:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (si tienes http-server instalado)
   npx http-server
   
   # Con PHP
   php -S localhost:8000
   ```
4. Abre tu navegador y ve a `http://localhost:8000`

## Librerías utilizadas

Librerías externas:
- **Ably Realtime** - Para la funcionalidad de intercambio en tiempo real
  - CDN: `https://cdn.ably.io/lib/ably.min-1.js`

APIs externas:
- **PokéAPI** - Para obtener datos de Pokémon
  - Endpoint: `https://pokeapi.co/api/v2/pokemon/`
  - Endpoint especies: `https://pokeapi.co/api/v2/pokemon-species/`

### Tecnologías nativas:
- **HTML5** - Estructura de la aplicación
- **CSS3** - Estilos y diseño responsive
- **JavaScript (ES6+)** - Funcionalidad interactiva
- **LocalStorage** - Almacenamiento local de la colección
- **Fetch API** - Peticiones HTTP a la PokéAPI

## Estructura del proyecto
Aqui presentamos la estructura de carpetas para distribuir responsabilidades y lograr un codigo modular

proyecto-web/
├── index.html                 - Página principal (Colección)
├── README.md                  - documentación
├── shared/
│   ├── css/
│   │   ├── globales.css      - Estilos globales
│   │   └── descripcion.css   - Estilos para descripciones
│   └── js/
│       └── navbar.js         - Navegación entre páginas
└── views/
    ├── coleccion/
    │   ├── coleccion.css     - Estilos de la colección
    │   └── coleccion.js      - Lógica de la colección
    ├── sobres/
    │   ├── sobres.html       - Página de sobres
    │   ├── sobres.css        - Estilos de sobres
    │   └── sobres.js         - Lógica de sobres
    └── intercambio/
        ├── intercambio.html  - Página de intercambio
        ├── intercambio.css   - Estilos de intercambio
        └── intercambio.js    - Lógica de intercambio
```


### WebSockets (Ably Realtime)
Los WebSockets permiten la comunicación en tiempo real entre usuarios. En esta aplicación:
- Cuando un usuario selecciona cartas para intercambiar, se envían automáticamente al otro usuario
- Ambos usuarios pueden ver las cartas seleccionadas en tiempo real
- El intercambio se confirma cuando ambos usuarios están listos
- Utilizamos Ably como servicio de WebSockets para manejar las conexiones

### LocalStorage
El LocalStorage del navegador almacena la colección del usuario de forma persistente:
- Cada vez que abres un sobre, las nuevas cartas se guardan automáticamente
- Tu progreso se mantiene incluso si cierras el navegador
- Los datos se almacenan localmente en tu dispositivo
- No se pierden al recargar la página
