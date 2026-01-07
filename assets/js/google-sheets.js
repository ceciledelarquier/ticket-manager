/**
 * Google Sheets API Module
 * Gère les interactions avec l'API Google Sheets
 */

const GoogleSheets = {
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    scopes: "https://www.googleapis.com/auth/spreadsheets",

    isInited: false,

    /**
     * Helper pour mettre à jour le statut UI
     */
    logStatus: (message, isError = false) => {
        const el = document.getElementById('connection-status');
        if (el) {
            el.textContent = message;
            el.style.color = isError ? 'red' : '#666';
            if (isError) console.error(message);
            else console.log(message);
        }
    },

    /**
     * Initialise le client Google API
     */
    initClient: async () => {
        if (!CONFIG.GOOGLE.API_KEY || !CONFIG.GOOGLE.CLIENT_ID) {
            GoogleSheets.logStatus("Config manquante (Clés)", true);
            return false;
        }

        GoogleSheets.logStatus("Init Google API...");

        return new Promise((resolve, reject) => {
            gapi.load('client:auth2', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.GOOGLE.API_KEY,
                        clientId: CONFIG.GOOGLE.CLIENT_ID,
                        discoveryDocs: GoogleSheets.discoveryDocs,
                        scope: GoogleSheets.scopes
                    });

                    // Ne PAS signer automatiquement ici (bloqué par les navigateurs)
                    // On vérifie juste l'état
                    GoogleSheets.isInited = true;

                    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
                        GoogleSheets.logStatus("Connecté (Auto)");
                    } else {
                        GoogleSheets.logStatus("Prêt (Non connecté)");
                    }

                    resolve(true);

                } catch (error) {
                    const msg = "Erreur Init: " + (error.details || error.error || JSON.stringify(error));
                    GoogleSheets.logStatus(msg, true);
                    reject(error);
                }
            });
        });
    },

    /**
     * Lance la connexion (Doit être appelé par un clic utilisateur)
     */
    signIn: async () => {
        GoogleSheets.logStatus("Ouverture popup...");
        if (!GoogleSheets.isInited) await GoogleSheets.initClient();
        try {
            await gapi.auth2.getAuthInstance().signIn();
            GoogleSheets.logStatus("Connexion réussie !");
            return true;
        } catch (e) {
            GoogleSheets.logStatus("Erreur Auth: " + JSON.stringify(e), true);
            throw e;
        }
    },

    /**
     * Déconnexion
     */
    signOut: () => {
        if (gapi.auth2) {
            gapi.auth2.getAuthInstance().signOut();
            GoogleSheets.logStatus("Déconnecté");
        }
    },

    /**
     * Vérifie si connecté
     */
    isSignedIn: () => {
        return gapi.auth2 && gapi.auth2.getAuthInstance().isSignedIn.get();
    },

    /**
     * Récupère tous les tickets (READ)
     */
    getTickets: async () => {
        GoogleSheets.logStatus("Chargement tickets...");
        if (!GoogleSheets.isInited) await GoogleSheets.initClient();

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.GOOGLE.SHEET_ID,
                range: CONFIG.GOOGLE.RANGE,
            });

            GoogleSheets.logStatus("Tickets chargés");
            const rows = response.result.values;
            if (!rows || rows.length === 0) return [];

            // Mapping selon les colonnes spécifiées :
            // 0: id | 1: titre | 2: description | 3: categorie | 4: statut | 5: assigne | 6: date | 7: comments (JSON)
            return rows.map(row => ({
                id: row[0],
                title: row[1],
                description: row[2],
                category: row[3],
                status: row[4],      // Index 4
                assignedTo: row[5],  // Index 5
                createdAt: row[6],
                comments: row[7] ? JSON.parse(row[7]) : []
            }));

        } catch (error) {
            GoogleSheets.logStatus("Erreur lecture: " + (error.result?.error?.message || error.status), true);
            console.error(error);
            return [];
        }
    },

    /**
     * Ajoute un ticket (WRITE - Append)
     */
    addTicket: async (ticket) => {
        if (!GoogleSheets.isInited) await GoogleSheets.initClient();

        try {
            const row = [
                ticket.id,
                ticket.title,
                ticket.description,
                ticket.category,
                ticket.status,      // Index 4
                ticket.assignedTo,  // Index 5
                ticket.createdAt,
                JSON.stringify(ticket.comments)
            ];

            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: CONFIG.GOOGLE.SHEET_ID,
                range: CONFIG.GOOGLE.RANGE,
                valueInputOption: 'RAW',
                resource: { values: [row] }
            });

            GoogleSheets.logStatus("Ticket sauvegardé");
            return true;
        } catch (error) {
            GoogleSheets.logStatus("Erreur sauvegarde: " + error.message, true);
            return false;
        }
    },

    /**
     * Met à jour un ticket (WRITE - Update)
     */
    updateTicket: async (ticket) => {
        if (!GoogleSheets.isInited) await GoogleSheets.initClient();

        try {
            const allTickets = await GoogleSheets.getTickets();
            const index = allTickets.findIndex(t => t.id === ticket.id);

            if (index === -1) return false;

            const rowNumber = index + 1;
            const range = `Feuille 1!A${rowNumber}:H${rowNumber}`;

            const row = [
                ticket.id,
                ticket.title,
                ticket.description,
                ticket.category,
                ticket.status,      // Index 4
                ticket.assignedTo,  // Index 5
                ticket.createdAt,
                JSON.stringify(ticket.comments)
            ];

            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: CONFIG.GOOGLE.SHEET_ID,
                range: range,
                valueInputOption: 'RAW',
                resource: { values: [row] }
            });

            GoogleSheets.logStatus("Ticket mis à jour");
            return true;
        } catch (e) {
            GoogleSheets.logStatus("Erreur update: " + e.message, true);
            return false;
        }
    }
};
