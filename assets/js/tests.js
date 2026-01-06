/**
 * Suite de tests unitaires pour Ticket Manager
 * À lancer dans la console du navigateur via : runTests()
 */

const TestSuite = {
    // Utilitaires de test
    assert: (condition, message) => {
        if (!condition) {
            console.error(`❌ ÉCHEC : ${message}`);
            return false;
        }
        console.log(`✅ SUCCÈS : ${message}`);
        return true;
    },

    setup: () => {
        console.group('🛠️ Initialisation des tests');
        // Sauvegarde des données actuelles
        TestSuite.backupData = localStorage.getItem(CONFIG.STORAGE_KEY);
        // Utilisation d'une clé de test pour ne pas polluer
        TestSuite.originalKey = CONFIG.STORAGE_KEY;
        CONFIG.STORAGE_KEY = 'tickets_test_suite';
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        console.log('Environnement de test isolé configuré');
        console.groupEnd();
    },

    teardown: () => {
        console.group('🧹 Nettoyage');
        // Restauration de la configuration et des données
        CONFIG.STORAGE_KEY = TestSuite.originalKey;
        if (TestSuite.backupData) {
            localStorage.setItem(CONFIG.STORAGE_KEY, TestSuite.backupData);
        }
        console.log('Environnement restauré');
        console.groupEnd();
    },

    // 1. Tests Logique Métier Critique
    testBusinessLogic: () => {
        console.group('🧪 Tests Logique Métier');
        let passed = 0;
        let total = 0;

        // Test Assignation Automatique
        total++;
        const assigneeTech = getAssigneeForCategory('technique');
        if (TestSuite.assert(assigneeTech === 'Aymen', "Assignation 'technique' doit être 'Aymen'")) passed++;

        total++;
        const assigneeUX = getAssigneeForCategory('ux');
        if (TestSuite.assert(assigneeUX === 'Cécile', "Assignation 'ux' doit être 'Cécile'")) passed++;

        // Test Validation Création
        total++;
        const invalidTicket = addTicket({ title: '', description: 'Test', category: 'technique' });
        if (TestSuite.assert(invalidTicket === null, "Création doit échouer sans titre")) passed++;

        total++;
        const validTicket = addTicket({ title: 'Test Unit', description: 'Description Unit', category: 'comprehension' });
        if (TestSuite.assert(validTicket !== null && validTicket.id, "Création valide doit retourner un ticket avec ID")) passed++;

        if (validTicket) {
            total++;
            if (TestSuite.assert(validTicket.assignedTo === 'Benoit', "Ticket créé 'comprehension' doit être assigné à Benoit")) passed++;

            total++;
            if (TestSuite.assert(validTicket.status === 'todo', "Statut initial doit être 'todo'")) passed++;
        }

        console.groupEnd();
        return { passed, total };
    },

    // 2. Tests Stockage & Mises à jour
    testStorageAndUpdates: () => {
        console.group('💾 Tests Stockage & Mises à jour');
        let passed = 0;
        let total = 0;

        // Création d'un ticket pour les tests
        const ticket = addTicket({ title: 'Storage Test', description: 'Desc', category: 'technique' });

        // Test Récupération
        total++;
        const tickets = getTickets();
        const storedTicket = tickets.find(t => t.id === ticket.id);
        if (TestSuite.assert(storedTicket !== undefined, "Ticket doit être récupérable via getTickets()")) passed++;

        // Test Changement Statut (Drag & Drop logique)
        total++;
        const updatedTicket = updateTicket(ticket.id, { status: 'inProgress' });
        if (TestSuite.assert(updatedTicket.status === 'inProgress', "Mise à jour statut valide")) passed++;

        // Test Persistance après mise à jour
        total++;
        const reloadedTicket = getTicketById(ticket.id);
        if (TestSuite.assert(reloadedTicket.status === 'inProgress', "Statut doit persister dans le storage")) passed++;

        // Test Ajout Commentaire
        total++;
        const commentedTicket = addComment(ticket.id, { author: 'Benoit', text: 'Test Comment' });
        if (TestSuite.assert(commentedTicket.comments.length === 1, "Commentaire doit être ajouté")) passed++;

        total++;
        if (TestSuite.assert(commentedTicket.comments[0].author === 'Benoit', "Auteur commentaire correct")) passed++;

        console.groupEnd();
        return { passed, total };
    }
};

/**
 * Fonction publique pour lancer tous les tests
 */
window.runTests = function () {
    console.clear();
    console.log('%c🚀 Démarrage de la suite de tests...', 'font-size: 16px; font-weight: bold; color: #2563eb');

    try {
        TestSuite.setup();

        const results1 = TestSuite.testBusinessLogic();
        const results2 = TestSuite.testStorageAndUpdates();

        const totalPassed = results1.passed + results2.passed;
        const totalTests = results1.total + results2.total;

        console.log('\n%c📝 RÉSULTAT FINAL', 'font-size: 14px; font-weight: bold');
        console.log(`Tests passés : ${totalPassed}/${totalTests}`);
        console.log(`Couverture : ${Math.round((totalPassed / totalTests) * 100)}%`);

        if (totalPassed === totalTests) {
            console.log('%c✅ TOUS LES TESTS SONT PASSÉS !', 'color: #10b981; font-weight: bold');
        } else {
            console.log('%c⚠️ CERTAINS TESTS ONT ÉCHOUÉ', 'color: #ef4444; font-weight: bold');
        }

    } catch (e) {
        console.error('Erreur critique pendant les tests:', e);
    } finally {
        TestSuite.teardown();
    }
};

console.log('ℹ️ Le module de tests est chargé. Tapez runTests() pour lancer les tests.');
