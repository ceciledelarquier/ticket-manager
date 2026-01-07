/**
 * Form Module - Logique du formulaire de création de ticket
 * Dépend de : config.js, storage.js (doivent être chargés avant)
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('ticketForm');
    const successMessage = document.getElementById('successMessage');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const submitBtn = document.getElementById('submitBtn');

    if (!form) return;

    // Ajouter les attributs maxLength depuis la config
    if (titleInput) {
        titleInput.maxLength = CONFIG.VALIDATION.TITLE_MAX_LENGTH;
    }
    if (descriptionInput) {
        descriptionInput.maxLength = CONFIG.VALIDATION.DESCRIPTION_MAX_LENGTH;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Debug Logs
        console.log("Début création ticket");
        console.log("Mode Google Sheets:", CONFIG.GOOGLE.USE_GOOGLE_SHEETS);

        // Récupération des valeurs
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const category = document.getElementById('category').value;

        // Validation côté formulaire
        if (!title) {
            alert('Veuillez saisir un titre.');
            titleInput.focus();
            return;
        }

        if (!description) {
            alert('Veuillez saisir une description.');
            descriptionInput.focus();
            return;
        }

        if (!category || !isValidCategory(category)) {
            alert('Veuillez sélectionner une catégorie valide.');
            return;
        }

        // Désactiver le bouton pendant l'envoi
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';
        }

        try {
            console.log("Appel saveTicket()");
            // Création du ticket via le module storage (ASYNC)
            const newTicket = await addTicket({
                title: title,
                description: description,
                category: category
            });

            if (!newTicket) {
                console.error("Échec création ticket (retour null)");
                alert('Erreur lors de la création du ticket. Vérifiez votre connexion.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Envoyer le ticket';
                }
                return;
            }

            console.log("Ticket sauvegardé avec succès", newTicket);

            // Afficher le message de succès
            form.classList.add('hidden');
            successMessage.classList.add('show');

        } catch (error) {
            console.error("Erreur inattendue:", error);
            alert("Une erreur technique est survenue: " + error.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Envoyer le ticket';
            }
        }
    });
});
