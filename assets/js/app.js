/**
 * App Module - Logique principale du Kanban
 * Dépend de : config.js, storage.js (doivent être chargés avant)
 */

// Références pour nettoyage des event listeners
let dragListenersController = null;
let currentTicketId = null;

document.addEventListener('DOMContentLoaded', function () {
    // Initialisation
    renderAllTickets();
    setupModal();

    // Écouter les changements de localStorage depuis d'autres onglets
    window.addEventListener('storage', function (e) {
        if (e.key === CONFIG.STORAGE_KEY) {
            renderAllTickets();
        }
    });
});

/* ==============================================
   RENDU DES TICKETS
   ============================================== */

/**
 * Affiche tous les tickets dans leurs colonnes respectives
 */
function renderAllTickets() {
    const tickets = getTickets();

    // Vider les colonnes
    const listTodo = document.getElementById('list-todo');
    const listInProgress = document.getElementById('list-inProgress');
    const listDone = document.getElementById('list-done');

    listTodo.innerHTML = '';
    listInProgress.innerHTML = '';
    listDone.innerHTML = '';

    // Compteurs
    const counts = { todo: 0, inProgress: 0, done: 0 };

    // Trier par date décroissante (plus récent en haut) - copie pour ne pas muter
    const sortedTickets = [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Afficher chaque ticket
    sortedTickets.forEach(ticket => {
        const card = createTicketCard(ticket);
        const listId = `list-${ticket.status}`;
        const list = document.getElementById(listId);
        if (list) {
            list.appendChild(card);
            counts[ticket.status]++;
        }
    });

    // Mettre à jour les compteurs
    document.getElementById('count-todo').textContent = counts.todo;
    document.getElementById('count-inProgress').textContent = counts.inProgress;
    document.getElementById('count-done').textContent = counts.done;

    // Configurer drag & drop après le rendu
    setupDragAndDrop();
}

/**
 * Crée une carte de ticket
 * @param {Object} ticket - Données du ticket
 * @returns {HTMLElement} Élément DOM de la carte
 */
function createTicketCard(ticket) {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    card.draggable = true;
    card.dataset.ticketId = ticket.id;

    // Utiliser la config centralisée pour le label
    const categoryConfig = CONFIG.CATEGORIES[ticket.category];
    const categoryLabel = categoryConfig ? categoryConfig.shortLabel : ticket.category;

    // Formater la date
    const date = new Date(ticket.createdAt);
    const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
    });

    card.innerHTML = `
        <h3>${escapeHtml(ticket.title)}</h3>
        <div class="ticket-meta">
            <span class="ticket-category">${escapeHtml(categoryLabel)}</span>
            <span class="ticket-assignee">👤 ${escapeHtml(ticket.assignedTo)}</span>
            <span class="ticket-date">${formattedDate}</span>
        </div>
    `;

    // Clic pour ouvrir le modal (délégation via dataset)
    card.addEventListener('click', function (e) {
        if (!e.target.closest('.drag-handle')) {
            openTicketModal(ticket.id);
        }
    });

    return card;
}

/**
 * Échappe les caractères HTML pour éviter les injections XSS
 * @param {string} text - Texte à échapper
 * @returns {string} Texte échappé
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/* ==============================================
   DRAG AND DROP - Avec nettoyage des listeners
   ============================================== */

/**
 * Configure le système de drag and drop
 * Utilise AbortController pour un nettoyage propre
 */
function setupDragAndDrop() {
    // Nettoyer les anciens listeners
    if (dragListenersController) {
        dragListenersController.abort();
    }

    // Créer un nouveau controller pour ce cycle
    dragListenersController = new AbortController();
    const signal = dragListenersController.signal;

    // Configurer le drag sur les cartes
    const cards = document.querySelectorAll('.ticket-card');
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart, { signal });
        card.addEventListener('dragend', handleDragEnd, { signal });
    });

    // Configurer le drop sur les listes
    const lists = document.querySelectorAll('.tickets-list');
    lists.forEach(list => {
        list.addEventListener('dragover', handleDragOver, { signal });
        list.addEventListener('dragenter', handleDragEnter, { signal });
        list.addEventListener('dragleave', handleDragLeave, { signal });
        list.addEventListener('drop', handleDrop, { signal });
    });
}

let draggedCard = null;

function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.ticketId);
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.tickets-list').forEach(list => {
        list.classList.remove('drag-over');
    });
    draggedCard = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    // Vérifier qu'on quitte vraiment la zone
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    const ticketId = e.dataTransfer.getData('text/plain');
    const newStatus = this.closest('.kanban-column').dataset.status;

    // Mettre à jour le statut du ticket
    const updated = updateTicket(ticketId, { status: newStatus });

    if (updated) {
        // Re-render
        renderAllTickets();
    }
}

/* ==============================================
   MODAL - DÉTAIL DU TICKET
   ============================================== */

/**
 * Configure les événements du modal (une seule fois)
 */
function setupModal() {
    const modal = document.getElementById('ticketModal');
    const closeBtn = document.getElementById('closeModal');

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Fermer avec Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

/**
 * Ouvre le modal avec les détails d'un ticket
 * @param {string} ticketId - ID du ticket
 */
function openTicketModal(ticketId) {
    const ticket = getTicketById(ticketId);
    if (!ticket) return;

    currentTicketId = ticketId;

    // Utiliser la config centralisée
    const categoryConfig = CONFIG.CATEGORIES[ticket.category];
    const categoryLabel = categoryConfig ? categoryConfig.label : ticket.category;
    const statusLabel = CONFIG.STATUSES[ticket.status] || ticket.status;

    const date = new Date(ticket.createdAt);
    const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Générer les options du dropdown des membres
    const teamOptions = CONFIG.TEAM_MEMBERS.map(member =>
        `<option value="${escapeHtml(member)}" ${ticket.assignedTo === member ? 'selected' : ''}>${escapeHtml(member)}</option>`
    ).join('');

    const commentAuthorOptions = CONFIG.TEAM_MEMBERS.map(member =>
        `<option value="${escapeHtml(member)}">${escapeHtml(member)}</option>`
    ).join('');

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="ticket-detail">
            <div class="detail-section">
                <h3>${escapeHtml(ticket.title)}</h3>
                <p class="ticket-description">${escapeHtml(ticket.description)}</p>
            </div>
            
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Catégorie</label>
                    <span>${escapeHtml(categoryLabel)}</span>
                </div>
                <div class="detail-item">
                    <label>Statut</label>
                    <span>${escapeHtml(statusLabel)}</span>
                </div>
                <div class="detail-item">
                    <label>Créé le</label>
                    <span>${formattedDate}</span>
                </div>
                <div class="detail-item">
                    <label>Assigné à</label>
                    <select id="assigneeSelect" class="form-select">
                        ${teamOptions}
                    </select>
                </div>
            </div>
            
            <hr class="separator">
            
            <div class="comments-section">
                <h4>💬 Commentaires (${ticket.comments.length})</h4>
                
                <div class="comments-list" id="commentsList">
                    ${renderComments(ticket.comments)}
                </div>
                
                <div class="add-comment">
                    <select id="commentAuthor" class="form-select">
                        <option value="">Qui commente ?</option>
                        ${commentAuthorOptions}
                    </select>
                    <textarea id="commentText" placeholder="Ajouter un commentaire..." maxlength="${CONFIG.VALIDATION.COMMENT_MAX_LENGTH}"></textarea>
                    <button id="addCommentBtn" class="btn btn-primary">Ajouter</button>
                </div>
            </div>
        </div>
    `;

    // Événements
    document.getElementById('assigneeSelect').addEventListener('change', handleAssigneeChange);
    document.getElementById('addCommentBtn').addEventListener('click', handleAddComment);

    // Afficher le modal
    document.getElementById('ticketModal').classList.add('show');
    document.getElementById('modal-title').textContent = 'Détail du ticket';
}

/**
 * Ferme le modal
 */
function closeModal() {
    document.getElementById('ticketModal').classList.remove('show');
    currentTicketId = null;
}

/**
 * Rendu des commentaires
 * @param {Array} comments - Liste des commentaires
 * @returns {string} HTML des commentaires
 */
function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<p class="no-comments">Aucun commentaire pour le moment.</p>';
    }

    return comments.map(comment => {
        const date = new Date(comment.date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="comment">
                <div class="comment-header">
                    <strong>${escapeHtml(comment.author)}</strong>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <p>${escapeHtml(comment.text)}</p>
            </div>
        `;
    }).join('');
}

/**
 * Gère le changement d'assignation
 */
function handleAssigneeChange(e) {
    const newAssignee = e.target.value;
    if (currentTicketId && newAssignee) {
        const updated = updateTicket(currentTicketId, { assignedTo: newAssignee });
        if (updated) {
            renderAllTickets();
        }
    }
}

/**
 * Gère l'ajout d'un commentaire
 */
function handleAddComment() {
    const authorSelect = document.getElementById('commentAuthor');
    const textArea = document.getElementById('commentText');

    const author = authorSelect.value;
    const text = textArea.value.trim();

    if (!author) {
        alert('Veuillez sélectionner qui commente.');
        authorSelect.focus();
        return;
    }

    if (!text) {
        alert('Veuillez saisir un commentaire.');
        textArea.focus();
        return;
    }

    if (currentTicketId) {
        const updated = addComment(currentTicketId, { author, text });
        if (updated) {
            openTicketModal(currentTicketId); // Refresh modal
        } else {
            alert('Erreur lors de l\'ajout du commentaire.');
        }
    }
}
