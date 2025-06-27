document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();

  const currentPage = path.includes("coleccion") ? "coleccion" :
                      path.includes("sobres") ? "sobres" :
                      path.includes("intercambio") ? "intercambio" : "";

  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add("active");
      link.removeAttribute("href"); // Desactiva redirección en página actual
    }
  });
});