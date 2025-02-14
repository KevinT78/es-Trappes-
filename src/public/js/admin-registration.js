// Fonction pour charger les inscriptions
async function loadRegistrations() {
  const statusFilter = document.getElementById("statusFilter").value;
  const typeFilter = document.getElementById("typeFilter").value;

  try {
    let url = "http://localhost:3000/registration?";
    const params = [];

    if (statusFilter) params.push(`status=${statusFilter}`);
    if (typeFilter) params.push(`typeInscription=${typeFilter}`);

    if (params.length > 0) {
      url += params.join("&");
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    if (!response.ok)
      throw new Error("Erreur lors du chargement des inscriptions");

    const registrations = await response.json();
    displayRegistrations(registrations);
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors du chargement des inscriptions");
  }
}

// Fonction pour afficher les inscriptions dans le tableau
function displayRegistrations(registrations) {
  const tbody = document.getElementById("registrationsTableBody");
  tbody.innerHTML = "";

  registrations.forEach((registration) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${registration.lastName}</td>
      <td>${registration.firstName}</td>
      <td>${registration.typeInscription}</td>
      <td>${registration.status}</td>
      <td class="action-buttons">
        <button class="details-btn" onclick="showDetails('${
          registration._id
        }')">Détails</button>
        ${
          registration.status === "attente"
            ? `<button class="accept-btn" onclick="updateStatus('${registration._id}', 'accepté')">Accepter</button>
             <button class="reject-btn" onclick="updateStatus('${registration._id}', 'refusé')">Refuser</button>`
            : registration.status === "refusé"
            ? `<button class="delete-btn" onclick="deleteRegistration('${registration._id}')">Supprimer</button>`
            : ""
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Fonction pour mettre à jour le statut d'une inscription
async function updateStatus(id, newStatus) {
  try {
    const response = await fetch(`http://localhost:3000/registration/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok)
      throw new Error("Erreur lors de la mise à jour du statut");

    // Recharger la liste des inscriptions après mise à jour
    await loadRegistrations();
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la mise à jour du statut");
  }
}

// Fonction pour supprimer une inscription
async function deleteRegistration(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette inscription ?"))
    return;

  try {
    const response = await fetch(`http://localhost:3000/registration/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    if (!response.ok)
      throw new Error("Erreur lors de la suppression de l'inscription");

    await loadRegistrations();
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la suppression de l'inscription");
  }
}

// Fonction pour afficher les détails d'une inscription
async function showDetails(id) {
  try {
    const response = await fetch(`http://localhost:3000/registration/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    if (!response.ok) throw new Error("Erreur lors du chargement des détails");

    const registration = await response.json();
    const detailsDiv = document.getElementById("registrationDetails");

    detailsDiv.innerHTML = `
                    <div class="detail-row">
                        <div class="detail-label">Type d'inscription:</div>
                        <div class="detail-value">${
                          registration.typeInscription
                        }</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Nom complet:</div>
                        <div class="detail-value">${registration.firstName} ${
      registration.lastName
    }</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Date de naissance:</div>
                        <div class="detail-value">${new Date(
                          registration.birthDate
                        ).toLocaleDateString()}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Genre:</div>
                        <div class="detail-value">${registration.gender}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Contact:</div>
                        <div class="detail-value">
                            Tél: ${registration.contact.phone}<br>
                            Email: ${registration.contact.email}
                        </div>
                    </div>
                    ${
                      registration.tutor
                        ? `
                        <div class="detail-row">
                            <div class="detail-label">Tuteur:</div>
                            <div class="detail-value">
                                Nom: ${registration.tutor.name}<br>
                                Tél: ${registration.tutor.phone}<br>
                                Email: ${registration.tutor.email}
                            </div>
                        </div>
                    `
                        : ""
                    }
                    <div class="detail-row">
                        <div class="detail-label">Adresse:</div>
                        <div class="detail-value">
                            ${registration.address.fullAddress}<br>
                            ${registration.address.city}, ${
      registration.address.postalCode
    }
                        </div>
                    </div>
                    <div class="detail-row">
    <div class="detail-label">Documents:</div>
    <div class="detail-value">
        ${
          registration.documents.carteIdentite
            ? `<div><strong>Carte d'identité :</strong></div>
               ${
                 registration.documents.carteIdentite.startsWith(
                   "data:application/pdf;base64"
                 )
                   ? `<iframe class="document-pdf" src="${registration.documents.carteIdentite}" frameborder="0"></iframe>`
                   : `<img src="${registration.documents.carteIdentite}" class="document-image" alt="Carte d'identité">`
               }`
            : "Carte d'identité: Non fourni"
        }
        <br>
        ${
          registration.documents.justificatifDomicile
            ? `<div><strong>Justificatif de domicile  :</strong></div>
            ${
              registration.documents.justificatifDomicile.startsWith(
                "data:application/pdf;base64"
              )
                ? `<iframe class="document-pdf" src="${registration.documents.justificatifDomicile}" frameborder="0"></iframe>`
                : `<img src="${registration.documents.justificatifDomicile}" class="document-image" alt="Justificatif de domicile">`
            }`
            : "Justificatif de domicile: Non fourni"
        }
        <br>
        ${
          registration.documents.certificatMedical
            ? `<div><strong>Certificat médical :</strong></div>
                     ${
                       registration.documents.certificatMedical.startsWith(
                         "data:application/pdf;base64"
                       )
                         ? `<iframe class="document-pdf" src="${registration.documents.certificatMedical}" frameborder="0"></iframe>`
                         : `<img src="${registration.documents.certificatMedical}" class="document-image" alt="Certificat médical">`
                     }`
            : "Certificat médical: Non fourni"
        }
    </div>
</div>
                    <div class="detail-row">
                        <div class="detail-label">Droit à l'image:</div>
                        <div class="detail-value">${
                          registration.droitImage
                        }</div>
                    </div>
                `;

    document.getElementById("detailsModal").style.display = "block";
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors du chargement des détails");
  }
}

// Gestionnaire d'événements pour la fermeture du modal
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("detailsModal").style.display = "none";
});

// Gestionnaire d'événements pour les filtres
document
  .getElementById("statusFilter")
  .addEventListener("change", loadRegistrations);
document
  .getElementById("typeFilter")
  .addEventListener("change", loadRegistrations);

// Charger les inscriptions au chargement de la page
window.onload = loadRegistrations;
