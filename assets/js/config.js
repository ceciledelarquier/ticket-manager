/**
 * Config Module - Constantes centralisées de l'application
 */

const CONFIG = {
    // Clé localStorage
    STORAGE_KEY: 'tickets',

    // Limites de validation
    VALIDATION: {
        TITLE_MAX_LENGTH: 200,
        DESCRIPTION_MAX_LENGTH: 5000,
        COMMENT_MAX_LENGTH: 2000
    },

    // Équipe support
    TEAM_MEMBERS: ['Aymen', 'Benoit', 'Cécile'],

    // Catégories et leurs assignations automatiques
    CATEGORIES: {
        'comprehension': {
            label: 'Compréhension produit',
            shortLabel: 'Compréhension',
            assignedTo: 'Benoit'
        },
        'ux': {
            label: 'Problème UX/Navigation',
            shortLabel: 'UX/Navigation',
            assignedTo: 'Cécile'
        },
        'technique': {
            label: 'Bug technique N8N',
            shortLabel: 'Bug N8N',
            assignedTo: 'Aymen'
        }
    },

    // Statuts
    STATUSES: {
        'todo': 'À traiter',
        'inProgress': 'En cours',
        'done': 'Traitée'
    },

    // Configuration Google Sheets
    GOOGLE: {
        USE_GOOGLE_SHEETS: true,
        SHEET_ID: '1lZay50MzIJMREAQQDqICPmpUbzxWtsjB6VL8nFT5S-E',
        API_KEY: 'AIzaSyAMGXX1lAEqIlJfDphUmqvXJR1lC4hSmgA',
        CLIENT_ID: '585587788552-od14rt35a4p8nuian3glnll5mkgfhn7c.apps.googleusercontent.com',
        RANGE: 'Feuille 1!A:H' // Plage de données (A:H pour inclure les commentaires en colonne 8)
    }
};

/**
 * Récupère l'assignation automatique pour une catégorie
 * @param {string} category - Clé de la catégorie
 * @returns {string|null} Nom de la personne assignée ou null si catégorie invalide
 */
function getAssigneeForCategory(category) {
    const cat = CONFIG.CATEGORIES[category];
    return cat ? cat.assignedTo : null;
}

/**
 * Vérifie si une catégorie est valide
 * @param {string} category - Clé de la catégorie
 * @returns {boolean}
 */
function isValidCategory(category) {
    return category in CONFIG.CATEGORIES;
}

/**
 * Vérifie si un membre de l'équipe est valide
 * @param {string} name - Nom du membre
 * @returns {boolean}
 */
function isValidTeamMember(name) {
    return CONFIG.TEAM_MEMBERS.includes(name);
}
