/**
 * Storage Module - Gestion centralisée du localStorage
 * Dépend de : config.js (doit être chargé avant)
 */

/**
 * Récupère tous les tickets du localStorage
 * @returns {Array} Liste des tickets
 */
function getTickets() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Erreur lecture localStorage:', e);
        return [];
    }
}

/**
 * Sauvegarde les tickets dans le localStorage
 * @param {Array} tickets - Liste des tickets à sauvegarder
 * @returns {boolean} Succès de la sauvegarde
 */
function saveTickets(tickets) {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(tickets));
        return true;
    } catch (e) {
        console.error('Erreur sauvegarde localStorage:', e);
        return false;
    }
}

/**
 * Valide et nettoie les données d'un ticket
 * @param {Object} ticketData - Données brutes du ticket
 * @returns {Object} Objet avec { valid: boolean, data: Object, errors: Array }
 */
function validateTicketData(ticketData) {
    const errors = [];
    const data = {};

    // Titre
    if (!ticketData.title || typeof ticketData.title !== 'string') {
        errors.push('Le titre est requis');
    } else {
        data.title = ticketData.title.trim().slice(0, CONFIG.VALIDATION.TITLE_MAX_LENGTH);
        if (data.title.length === 0) {
            errors.push('Le titre ne peut pas être vide');
        }
    }

    // Description
    if (!ticketData.description || typeof ticketData.description !== 'string') {
        errors.push('La description est requise');
    } else {
        data.description = ticketData.description.trim().slice(0, CONFIG.VALIDATION.DESCRIPTION_MAX_LENGTH);
        if (data.description.length === 0) {
            errors.push('La description ne peut pas être vide');
        }
    }

    // Catégorie
    if (!isValidCategory(ticketData.category)) {
        errors.push('Catégorie invalide');
    } else {
        data.category = ticketData.category;
    }

    return {
        valid: errors.length === 0,
        data: data,
        errors: errors
    };
}

/**
 * Ajoute un nouveau ticket
 * @param {Object} ticketData - Données du ticket (title, description, category)
 * @returns {Object} Le ticket créé avec ID et metadata, ou null si invalide
 */
function addTicket(ticketData) {
    const validation = validateTicketData(ticketData);

    if (!validation.valid) {
        console.error('Validation échouée:', validation.errors);
        return null;
    }

    const tickets = getTickets();

    const newTicket = {
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: validation.data.title,
        description: validation.data.description,
        category: validation.data.category,
        assignedTo: getAssigneeForCategory(validation.data.category),
        status: 'todo',
        createdAt: new Date().toISOString(),
        comments: []
    };

    tickets.push(newTicket);

    if (!saveTickets(tickets)) {
        return null;
    }

    return newTicket;
}

/**
 * Récupère un ticket par son ID
 * @param {string} id - ID du ticket
 * @returns {Object|null} Le ticket ou null si non trouvé
 */
function getTicketById(id) {
    if (!id || typeof id !== 'string') return null;
    const tickets = getTickets();
    return tickets.find(ticket => ticket.id === id) || null;
}

/**
 * Met à jour un ticket existant
 * @param {string} id - ID du ticket à modifier
 * @param {Object} updates - Champs à mettre à jour
 * @returns {Object|null} Le ticket mis à jour ou null si non trouvé
 */
function updateTicket(id, updates) {
    if (!id || typeof id !== 'string') return null;

    const tickets = getTickets();
    const index = tickets.findIndex(ticket => ticket.id === id);

    if (index === -1) return null;

    // Validation des mises à jour autorisées
    const allowedUpdates = {};

    if (updates.status && ['todo', 'inProgress', 'done'].includes(updates.status)) {
        allowedUpdates.status = updates.status;
    }

    if (updates.assignedTo && isValidTeamMember(updates.assignedTo)) {
        allowedUpdates.assignedTo = updates.assignedTo;
    }

    tickets[index] = { ...tickets[index], ...allowedUpdates };

    if (!saveTickets(tickets)) {
        return null;
    }

    return tickets[index];
}

/**
 * Valide les données d'un commentaire
 * @param {Object} commentData - Données du commentaire
 * @returns {Object} Objet avec { valid: boolean, data: Object, errors: Array }
 */
function validateCommentData(commentData) {
    const errors = [];
    const data = {};

    if (!isValidTeamMember(commentData.author)) {
        errors.push('Auteur invalide');
    } else {
        data.author = commentData.author;
    }

    if (!commentData.text || typeof commentData.text !== 'string') {
        errors.push('Le texte du commentaire est requis');
    } else {
        data.text = commentData.text.trim().slice(0, CONFIG.VALIDATION.COMMENT_MAX_LENGTH);
        if (data.text.length === 0) {
            errors.push('Le commentaire ne peut pas être vide');
        }
    }

    return {
        valid: errors.length === 0,
        data: data,
        errors: errors
    };
}

/**
 * Ajoute un commentaire à un ticket
 * @param {string} ticketId - ID du ticket
 * @param {Object} commentData - Données du commentaire (author, text)
 * @returns {Object|null} Le ticket mis à jour ou null si erreur
 */
function addComment(ticketId, commentData) {
    const validation = validateCommentData(commentData);

    if (!validation.valid) {
        console.error('Validation commentaire échouée:', validation.errors);
        return null;
    }

    const tickets = getTickets();
    const index = tickets.findIndex(ticket => ticket.id === ticketId);

    if (index === -1) return null;

    const newComment = {
        id: `comment_${Date.now()}`,
        author: validation.data.author,
        text: validation.data.text,
        date: new Date().toISOString()
    };

    tickets[index].comments.push(newComment);

    if (!saveTickets(tickets)) {
        return null;
    }

    return tickets[index];
}

/**
 * Récupère les tickets par statut
 * @param {string} status - Statut recherché (todo, inProgress, done)
 * @returns {Array} Liste des tickets avec ce statut
 */
function getTicketsByStatus(status) {
    if (!['todo', 'inProgress', 'done'].includes(status)) {
        return [];
    }
    const tickets = getTickets();
    return tickets.filter(ticket => ticket.status === status);
}
