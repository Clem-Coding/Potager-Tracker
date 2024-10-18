document.addEventListener("DOMContentLoaded", init);

function init() {
  rentrerLesDonnees();
  autocompletion();
  loadDonnees();
  gestionCheckboxes();
  afficherDeleteMessageBox();
}

//A VERIFIER, j'ai rien compris ci-après!!!________________________________________

// Fonction asynchrone pour charger les données JSON depuis un fichier externe
async function chargerDonneesJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erreur de chargement des données JSON");
    }
    const data = await response.json();

    return data; // Retourner les données pour une utilisation ultérieure si nécessaire
  } catch (error) {
    console.error("Erreur :", error);
    // Gérer l'erreur ici
  }
}

//____________________________________________________________________________________________

// VARIABLES BALISES HTML
let legumeEntrant = document.getElementById("nom");
let btnAjouter = document.getElementById("bouton-ajouter");
let dateEntrante = document.getElementById("date");
let tableau = document.getElementById("tableau");
let divTableau = document.querySelector(".section-tableau");

// VARIABLES DiVERSES
let dateInvalid = false;

//__________________FONCTION PRINCIPALE pour le moment avec écouteur, A RENOMMER?!________________________
function rentrerLesDonnees() {
  btnAjouter.addEventListener("click", async (e) => {
    e.preventDefault();

    console.log("date verif", dateEntrante.value);

    // Charger les données JSON
    const listeLegumes = await chargerDonneesJson("data.json");

    const nomsLegume = listeLegumes.map((legume) => legume["Nom"]);
    const legumeSaisi = legumeEntrant.value.trim().toUpperCase();
    const liensImagesLegumes = listeLegumes.map((legume) => legume["Image"]);

    // Afficher une alerte si aucune date ou légume n'est saisi
    if (!legumeSaisi && !dateEntrante.value) {
      console.log("date", dateEntrante);
      legumeEntrant.value = "";
      dateEntrante.value = "";

      alert("Pas de légume ni de date saisis !");
      return;
    } else if (!legumeSaisi) {
      legumeEntrant.value = "";
      // dateEntrante.value = "";

      alert("Pas de légume saisi !");
      return;
    } else if (!dateEntrante.value) {
      dateEntrante.value = "";
      // legumeEntrant.value = "";
      alert("Pas de date saisie !");
      return;
    } else if (dateEntrante.value) {
      const nouvelleDate = new Date(dateEntrante.value);
      console.log("Objet Date créé :", nouvelleDate);
      const year = nouvelleDate.getFullYear(); // Obtient l'année de la date
      if (year < 2024 || year > 2025) {
        alert("Veuillez saisir une date valide");
        dateInvalid = true;
      }
    }

    for (let i = 0; i < nomsLegume.length; i++) {
      if (!dateInvalid) {
        if (legumeSaisi === nomsLegume[i].toUpperCase()) {
          nbJoursLevee = listeLegumes[i]["Temps de levée"];
          nbJoursRecolte = listeLegumes[i]["Temps de récolte"];

          //les valeurs à envoyer dans le tableau de la fonction ajouterLigne()
          let imageLegume = liensImagesLegumes[i];

          let valeur1 = nomsLegume[i];
          let valeur2 = formaterDateFr(new Date(dateEntrante.value));
          let valeur3 = listeLegumes[i]["Température de germination"] + "°C";
          let valeur4 = listeLegumes[i]["Temps de levée"] + " jours";
          let valeur5 =
            "• levera autour du <br>" +
            "<span class='important'>" +
            dateLevee(nbJoursLevee) +
            "</span>" +
            "<br>" +
            "• recolte autour du <br>" +
            "<span class='important'>" +
            dateRecolte(nbJoursRecolte) +
            "</span>";

          // Ajoute la ligne
          const derniereLigne = ajouterLigne(
            valeur1,
            valeur2,
            valeur3,
            valeur4,
            valeur5,
            imageLegume
          );

          // Fait défiler jusqu'à la nouvelle ligne ajoutée
          let nombreDeLignes = tableau.rows.length;

          if (nombreDeLignes <= 4) {
            divTableau.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          }

          sauverDonnees(
            valeur1,
            valeur2,
            valeur3,
            valeur4,
            valeur5,
            imageLegume
          );
          gestionCheckboxes();
        }
      }
    }

    legumeEntrant.value = "";
    dateEntrante.value = "";
  });
}

//_____________ AUTOCOMPLETION pour le champ de recherche des légumes________-_____

async function autocompletion() {
  const input = document.getElementById("nom");
  const suggestionsList = document.getElementById("suggestions");
  suggestionsList.innerHTML = ""; // Vider les suggestions précédentes
  const listeLegumesAuto = await chargerDonneesJson("data.json");

  for (let legume of listeLegumesAuto) {
    const legumeItem = document.createElement("li");
    legumeItem.textContent = legume.Nom;
    legumeItem.classList.add("suggestion-item");

    // Ajoute un gestionnaire d'événement pour sélectionner le légume
    legumeItem.addEventListener("click", () => {
      input.value = legume.Nom; // Met le nom du légume dans l'input
      suggestionsList.innerHTML = ""; // Vider les suggestions après sélection
      displayVegetableDetails(legume); // Fonction pour afficher les détails
    });

    suggestionsList.appendChild(legumeItem);
  }
}

// Test filtrer suggestions

async function filterSuggestions() {
  const input = document.getElementById("nom").value.toLowerCase();
  const suggestionsList = document.getElementById("suggestions");
  const listeLegumesAuto = await chargerDonneesJson("data.json"); // Charger les données JSON

  suggestionsList.innerHTML = ""; // Vider les suggestions précédentes

  // Si l'input est vide, ne rien afficher
  if (input === "") {
    return;
  }

  // Filtrer les légumes en fonction de la saisie
  const filteredLegumes = listeLegumesAuto.filter((legume) =>
    legume.Nom.toLowerCase().startsWith(input)
  );

  // Si aucun légume ne correspond, afficher un message
  if (filteredLegumes.length === 0) {
    const noResultItem = document.createElement("li");
    noResultItem.textContent = "Aucun résultat trouvé";
    noResultItem.classList.add("no-result-item");
    suggestionsList.appendChild(noResultItem);
    return;
  }

  // Ajouter les résultats filtrés dans la liste
  filteredLegumes.forEach((legume) => {
    const legumeItem = document.createElement("li");
    legumeItem.textContent = legume.Nom;
    legumeItem.classList.add("suggestion-item");

    // Lorsqu'un utilisateur clique sur un légume, remplir le champ et vider la liste
    legumeItem.addEventListener("click", () => {
      document.getElementById("nom").value = legume.Nom;
      suggestionsList.innerHTML = ""; // Vider la liste après sélection
      displayVegetableDetails(legume); // Appeler une fonction pour afficher les détails du légume
    });

    suggestionsList.appendChild(legumeItem);
  });
}

//_____________AFFICHER la date et additionner les jours (temps de levée et récole)_____________________________

// Fonction globale pour additionner des jours à une date donnée
function ajouterJours(date, nbJours) {
  const nouvelleDate = new Date(date);
  nouvelleDate.setDate(nouvelleDate.getDate() + nbJours);

  return nouvelleDate;
}

// function pour formater n'importe quelle date en français
function formaterDateFr(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("fr-FR", options);
}

//Calculer la date de levée (+formatage) à partir des 2 fonctions précédantes
function dateLevee(nbJoursLevee) {
  const dateInitiale = dateEntrante.value;
  const nouvelleDateLevee = ajouterJours(dateInitiale, nbJoursLevee);
  const dateFormateeLevee = formaterDateFr(nouvelleDateLevee);
  return dateFormateeLevee;
}

//Calculer la date de recolte (+formatage) à partir des 2 fonctions précédantes
function dateRecolte(nbJoursRecolte) {
  const dateInitiale = dateEntrante.value;
  const nouvelleDateRecolte = ajouterJours(dateInitiale, nbJoursRecolte);
  const dateFormateeRecolte = formaterDateFr(nouvelleDateRecolte);
  return dateFormateeRecolte;
}

//_______________FONCTION AJOUTER LIGNE AU TABLEAU____________________________
function ajouterLigne(
  valeur1,
  valeur2,
  valeur3,
  valeur4,
  valeur5,
  imageLegume
) {
  //crée une ligne au tableau
  const nouvelleLigne = document.createElement("tr");

  nouvelleLigne.classList.add("ligne-tableau");

  // Création de cellules avec leur contenu
  nouvelleLigne.innerHTML = `
  <td>${valeur1}<br><img src="${imageLegume}"/></td>
  <td>${valeur2}</td>
  <td>${valeur3}</td>
  <td>${valeur4}</td>
  <td>${valeur5}</td>
  <td><input type="checkbox" class="checkbox"></td>
  <td><div class="comment-container">
  <textarea class="commentaire-input" placeholder="Ajouter un commentaire..."></textarea>
  <button class="envoyer-button" disabled>Enregistrer</button>
</div>
  </td>
  
  <td><div class="delete-action-container">
       <button class="remove-icon"> <img src="./assets/remove-icon.png" alt="icone supprimer la ligne"></button>
      </div>
      <div id="delete-message-box" onclick="supprimerLigne(this)"><i class="fa-solid fa-trash"></i> Supprimer la ligne</div>
      
</td> `;

  // Ajout de la ligne au tableau
  tableau.appendChild(nouvelleLigne);

  //Variables pour gérer l'ajout de commentaire et leur "storage"
  const commentaireInput = nouvelleLigne.querySelector(".commentaire-input");
  const envoyerButton = nouvelleLigne.querySelector(".envoyer-button");

  chargerCommentaire(commentaireInput, envoyerButton);
  modifCommentaire(commentaireInput, envoyerButton);
  afficherDeleteMessageBox();

  // quand je clique sur le boutton "Envoyer", cela rajoute une commentaire
  envoyerButton.addEventListener("click", (e) => {
    sauvegarderCommentaire(commentaireInput, envoyerButton);
  });
  return nouvelleLigne;
}

//_____________ Fonction pour SUPPRIMER LA LIGNE correspondante__________ A___________________
function supprimerLigne(bouton) {
  const ligne = bouton.closest("tr");

  const indexLigne = getIndexLigne(bouton);

  ligne.parentNode.removeChild(ligne);

  // Suppression des données associées
  const keyCommentaire = `commentaire_${indexLigne}`;
  localStorage.removeItem(keyCommentaire);

  const keyCheckbox = `checkbox_${indexLigne}`;
  localStorage.removeItem(keyCheckbox);

  reindexationLocalStorage();

  let donneesJSON = localStorage.getItem("donneesTableau");
  let donneesTableau = JSON.parse(donneesJSON || "[]");
  donneesTableau.splice(indexLigne - 1, 1);
  localStorage.setItem("donneesTableau", JSON.stringify(donneesTableau));
}

//_________________Fonction pour SAUVER LES DONNEES (localStorage)____________________________

function sauverDonnees(
  valeur1,
  valeur2,
  valeur3,
  valeur4,
  valeur5,
  imageLegume
) {
  // Récupérer les données existantes du localStorage
  let donneesExistantesJSON = localStorage.getItem("donneesTableau");
  let donneesExistantes = JSON.parse(donneesExistantesJSON || "[]");

  // Créer un tableau avec les nouvelles valeurs
  let nouvellesDonnees = {
    valeur1: valeur1,
    valeur2: valeur2,
    valeur3: valeur3,
    valeur4: valeur4,
    valeur5: valeur5,
    imageLegume: imageLegume,
  };

  // Ajouter les nouvelles données aux données existantes
  donneesExistantes.push(nouvellesDonnees);

  // Convertir le tableau combiné en chaîne JSON
  let donneesJSON = JSON.stringify(donneesExistantes);

  // Stocker la chaîne JSON combinée dans le localStorage
  localStorage.setItem("donneesTableau", donneesJSON);
}

// ________________Fonction pour CHARGER LES DONNEES __________

function loadDonnees() {
  legumeEntrant.value = "";
  dateEntrante.value = "";
  // Récupérer les données du localStorage
  let donneesJSON = localStorage.getItem("donneesTableau");

  // Vérifier si des données existent dans le localStorage
  if (donneesJSON) {
    // Convertir les données JSON en tableau JavaScript d'objets
    let donnees = JSON.parse(donneesJSON);

    // Pour chaque objet de données, ajouter une ligne au tableau
    donnees.forEach(function (rowData) {
      // Extraire les valeurs de l'objet de données
      let valeur1 = rowData.valeur1;
      let valeur2 = rowData.valeur2;
      let valeur3 = rowData.valeur3;
      let valeur4 = rowData.valeur4;
      let valeur5 = rowData.valeur5;
      let imageLegume = rowData.imageLegume;

      // Ajouter une nouvelle ligne au tableau en utilisant la fonction ajouterLigne
      ajouterLigne(valeur1, valeur2, valeur3, valeur4, valeur5, imageLegume);
    });
  }
}

//__________________Fonction pour récupérer l'état de la CHECKBOX_________________________________
function gestionCheckboxes() {
  let checkboxes = document.querySelectorAll("#tableau .checkbox ");

  // Ajoutez un gestionnaire d'événements pour chaque case à cocher pour charger leur état au chargement de la page
  checkboxes.forEach(function (checkbox) {
    chargerEtatCheckbox(checkbox);
    checkbox.addEventListener("change", function () {
      sauvegarderEtatCheckbox(checkbox);
    });
  });
}

// Fonction pour sauvegarder l'état de la case à cocher
function sauvegarderEtatCheckbox(checkbox) {
  const indexLigne = getIndexLigne(checkbox);

  const keyCheckbox = `checkbox_${indexLigne}`;

  // Récupérez l'état de la case à cocher
  var statutCheckbox = checkbox.checked;

  // Enregistrez l'état de la case à cocher dans le localStorage
  localStorage.setItem(keyCheckbox, statutCheckbox);
}

// Fonction pour charger l'état de la case à cocher au chargement de la page
function chargerEtatCheckbox(checkbox) {
  const indexLigne = getIndexLigne(checkbox);

  // Récupérer l'état enregistré de la case à cocher depuis le localStorage
  var key = `checkbox_${indexLigne}`;
  var isChecked = localStorage.getItem(key);

  // Si l'état récupéré est valide, mettre à jour l'état de la case à cocher
  if (isChecked !== null) {
    // Convertir la chaîne en booléen
    var isCheckedBool = isChecked === "true";

    // Mettre à jour l'état de la case à cocher
    checkbox.checked = isCheckedBool;
  }
}

//____________________METHODE GLOBABLE POUR GERER L'AJOUT DE COMMENTAIRES________________________

// Fonction pour sauvegarger un cmmentaire dans le local storage
function sauvegarderCommentaire(commentaireInput, envoyerButton) {
  const indexLigne = getIndexLigne(commentaireInput);
  console.log(indexLigne);
  const commentaire = commentaireInput.value.trim();
  const key = `commentaire_${indexLigne}`;
  localStorage.setItem(key, commentaire);

  envoyerButton.disabled = false;
  envoyerButton.classList.add("gris");

  showToast();
}

// Fonction pour charger le commentaire depuis le local storage
function chargerCommentaire(commentaireInput, envoyerButton) {
  envoyerButton.disabled = true;
  envoyerButton.classList.add("gris");

  // // Récupérer le commentaire depuis le local storage
  const indexLigne = getIndexLigne(commentaireInput);
  const key = `commentaire_${indexLigne}`;
  let commentaire = localStorage.getItem(key, "commentaire");

  // // Si un commentaire est trouvé dans le local storage, l'afficher dans la zone de commentaire
  if (commentaire) {
    commentaireInput.value = commentaire;
  }
}

// Gestionnaire d'évenement pour modifier l'apparence du bouton quand on modifie n'importe quel commentaire
function modifCommentaire(commentaireInput, envoyerButton) {
  commentaireInput.addEventListener("input", function () {
    envoyerButton.disabled = false;
    envoyerButton.classList.remove("gris");

    envoyerButton.addEventListener("click", function () {
      envoyerButton.disabled = true;
      envoyerButton.classList.add("gris");
    });

    // }
  });
}

//_______________________SUCCES TOAST NOTIFICATION pour l'ajout des des commentaires _____________________________________________

function showToast() {
  let toast = document.createElement("div");

  toast.classList.add("toast-container");
  toast.innerHTML =
    ' <i class="fa-solid fa-check"></i>&nbsp; Commentaire enregistré avec succès';

  // Affiche l'élément toast et déclenche l'animation
  document.body.appendChild(toast); // Ajoute l'élément toast au DOM
  toast.classList.add("toast-active");

  toast.addEventListener("animationend", function (event) {
    // Vérifie la fin de l'animation (à revoir et comprendre?)
    if (event.animationName === "fadeInOut") {
      // Supprime l'élément toast du DOM à la fin de l'animation
      toast.remove();
    }
  });

  // permet de faire disparaître le toast quand on clique dessus
  toast.addEventListener("click", (e) => {
    toast.remove();
  });
}

// // ________________ affichage menu contextuel________
function afficherDeleteMessageBox() {
  const boutonsRemoveIcon = document.querySelectorAll("#tableau .remove-icon");

  // Ajoutez un écouteur d'événements à chaque bouton remove-icon
  boutonsRemoveIcon.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      const parentTd = bouton.closest("td");

      // Rechercher l'élément du menu contextuel à l'intérieur du parent td
      const deleteMessageBox = parentTd.querySelector("#delete-message-box");

      if (deleteMessageBox) {
        deleteMessageBox.style.display = "block";

        // Obtenir les coordonnées du bouton
        let buttonRect = bouton.getBoundingClientRect();

        // Définir la position du menu contextuel
        deleteMessageBox.style.left =
          buttonRect.left - 59 + window.scrollX + "px";
        deleteMessageBox.style.top = buttonRect.bottom + window.scrollY + "px";
      }

      document.addEventListener("click", function (event) {
        // Masque le menu contextuel si le clic est en dehors du bouton contextuel ou du menu contextuel lui-même
        if (!bouton.contains(event.target)) {
          deleteMessageBox.style.display = "none";
        }
      });
    });
  });
}

// fonction pour récupérer l'index Ligne des éléments du tableau

function getIndexLigne(element) {
  let tr = element.closest("tr"); // Trouvez l'élément tr parent le plus proche
  let indexLigne = Array.from(tr.parentNode.children).indexOf(tr); // Obtenez l'index de ligne

  return indexLigne;
}

// à continuer!!!!

function reindexationLocalStorage() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith("commentaire_") || key.startsWith("checkbox_")) {
      const chiffre = key.replace(/\D/g, "");
      const valeur = localStorage.getItem(key);

      // Vérifier si le chiffre est supérieur à 1
      if (chiffre > 1) {
        const nouvelleCle = key.replace(/\d+/, chiffre - 1);
        localStorage.removeItem(key);
        localStorage.setItem(nouvelleCle, valeur);
      } // Pas besoin de faire quelque chose si chiffre = 1
    }
  }
}

function reindexationLocalStorage() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith("commentaire_") || key.startsWith("checkbox_")) {
      const chiffre = key.replace(/\D/g, "");
      const valeur = localStorage.getItem(key);

      // Vérifier si le chiffre est supérieur à 1
      if (chiffre >= 2) {
        console.log("tu saoûles!!!!!!!!!!!!");
        const nouvelleCle = key.replace(/\d+/, chiffre - 1);
        localStorage.removeItem(key);
        localStorage.setItem(nouvelleCle, valeur);
      } else if (chiffre == 1) {
        localStorage.removeItem(key);
        localStorage.setItem(key, valeur);
      }
    }
  }
}

// // Exemple d'utilisation :
// reindexationLocalStorage();

// }

// //   // Supprimer l'ancienne clé

// const valeur = localStorage.getItem(key);
// console.log(valeur);
// //   // Réinsérer la valeur avec la nouvelle clé

// let resultat = reindexationLocalStorage();
// console.log("affiche moi le resultat", resultat);

// function extractNumberFromKey(key) {
//   // Remplacer tous les caractères non numériques par une chaîne vide
//   const chiffre = key.replace(/\D/g, "");
//   return chiffre;
// }

// const key = "commentaire_1";
// const numero = extractNumberFromKey(key);
// console.log("affiche moi le  numéro", numero);

// // Ajoutez un gestionnaire d'événements pour chaque case à cocher pour charger leur état au chargement de la page
// checkboxes.forEach(function (checkbox) {
//   chargerEtatCheckbox(checkbox);
//   checkbox.addEventListener("change", function () {
//     sauvegarderEtatCheckbox(checkbox);
//   });
// });
