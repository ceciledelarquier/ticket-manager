/**
 * Form Module - Logique du formulaire de création de ticket
 * Dépend de : config.js, storage.js (doivent être chargés avant)
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('ticketForm');
    const successMessage = document.getElementById('successMessage');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');

    if (!form) return;

    // Ajouter les attributs maxLength depuis la config
    if (titleInput) {
        titleInput.maxLength = CONFIG.VALIDATION.TITLE_MAX_LENGTH;
    }
    if (descriptionInput) {
        descriptionInput.maxLength = CONFIG.VALIDATION.DESCRIPTION_MAX_LENGTH;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

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

        // Création du ticket via le module storage (avec validation côté storage)
        const newTicket = addTicket({
            title: title,
            description: description,
            category: category
        });

        if (!newTicket) {
            alert('Erreur lors de la création du ticket. Veuillez réessayer.');
            return;
        }

        // Afficher le message de succès
        form.classList.add('hidden');
        successMessage.classList.add('show');
    });
});
