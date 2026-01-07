/**
 * Storage Module (Adapter Pattern)
 * Bascule entre LocalStorage et Google Sheets selon la config.
 * ATTENTION: Devient ASYNCHRONE pour supporter Google Sheets.
 */

const StorageAdapter = {
    // Determine quel driver utiliser
    getDriver: () => CONFIG.GOOGLE.USE_GOOGLE_SHEETS ? GoogleSheets : LocalStorageDriver
};

/**
 * Driver LocalStorage (L'ancien code encapsulé)
 */
const LocalStorageDriver = {
    getTickets: async () => {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Erreur lecture localStorage:', e);
            return [];
        }
    },

    saveTickets: (tickets) => {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(tickets));
            return true;
        } catch (e) { console.error(e); return false; }
    },

    addTicket: async (ticket) => {
        const tickets = await LocalStorageDriver.getTickets();
        tickets.push(ticket);
        return LocalStorageDriver.saveTickets(tickets);
    },

    updateTicket: async (updatedTicket) => {
        const tickets = await LocalStorageDriver.getTickets();
        const index = tickets.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
            tickets[index] = updatedTicket;
            return LocalStorageDriver.saveTickets(tickets);
        }
        return false;
    }
};


/* ==============================================
   DEVANTURE PUBLIQUE (API du Module)
   Mise à jour pour être ASYNC
   ============================================== */

async function getTickets() {
    return await StorageAdapter.getDriver().getTickets();
}

async function addTicket(ticketData) {
    const validation = validateTicketData(ticketData);
    if (!validation.valid) return null;

    const newTicket = {
        id: `ticket_${Date.now()}`,
        title: validation.data.title,
        description: validation.data.description,
        category: validation.data.category,
        assignedTo: getAssigneeForCategory(validation.data.category),
        status: 'todo',
        createdAt: new Date().toISOString(),
        comments: []
    };

    const success = await StorageAdapter.getDriver().addTicket(newTicket);
    return success ? newTicket : null;
}

async function updateTicket(id, updates) {
    const tickets = await getTickets();
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return null;

    // Merge updates
    const updatedTicket = { ...ticket, ...updates };

    // Validation basique post-merge si besoin...

    const success = await StorageAdapter.getDriver().updateTicket(updatedTicket);
    return success ? updatedTicket : null;
}

async function getTicketById(id) {
    const tickets = await getTickets();
    return tickets.find(t => t.id === id) || null;
}

async function addComment(ticketId, commentData) {
    const validation = validateCommentData(commentData);
    if (!validation.valid) return null;

    const ticket = await getTicketById(ticketId);
    if (!ticket) return null;

    const newComment = {
        id: `comment_${Date.now()}`,
        author: validation.data.author,
        text: validation.data.text,
        date: new Date().toISOString()
    };

    ticket.comments.push(newComment);

    const success = await StorageAdapter.getDriver().updateTicket(ticket);
    return success ? ticket : null;
}

// Reuse existing validation functions (unchanged)
function validateTicketData(ticketData) {
    // ... (copier l'ancien code de validation ou le laisser si on n'écrase pas tout)
    // Pour cet exemple, je réintègre la logique de validation simple
    const errors = [];
    const data = {};
    if (!ticketData.title) errors.push("Titre requis");
    else data.title = ticketData.title;

    data.description = ticketData.description || "";
    data.category = ticketData.category;

    return { valid: errors.length === 0, data, errors };
}

function validateCommentData(commentData) {
    if (!commentData.text) return { valid: false, errors: ["Texte requis"] };
    return { valid: true, data: commentData, errors: [] };
}
