document.addEventListener("DOMContentLoaded", function () {
  navbarUnderline();
  // Récupère le lien "Voir mes enregistrements"
  const enregistrementsLink = document.getElementById("enregistrementsLink");
  const accueilLink = document.getElementById("accueilLink");
  const tableau = document.querySelector(".section-tableau");

  // Ajoute un écouteur d'événements pour le clic sur le lien "Voir mes enregistrements"
  enregistrementsLink.addEventListener("click", function (event) {
    event.preventDefault();
    tableau.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Ajoute un écouteur d'événements pour le clic sur le lien "Accueil"
  accueilLink.addEventListener("click", function (event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// _____ style navbar______
function navbarUnderline() {
  const navigationLinks = document.querySelectorAll(".nav-link");

  navigationLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      // Supprime la classe active de tous les liens
      navigationLinks.forEach(function (link) {
        link.classList.remove("active");
      });

      // Ajoute la classe active uniquement au lien cliqué
      link.classList.add("active");
    });
  });
}
