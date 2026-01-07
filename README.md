# Ticket Manager 🎫

### Vue d'ensemble
- **Quoi** : App Kanban simple.
- **Stack** : Vanilla JS / CSS / HTML.
- **Données** : LocalStorage (navigateur).
- **Zéro dépendance** : Pas de Node.js, pas de build.

### Installation
- **Cloner** : `git clone [url_repo]`
- **Ouvrir** : Lancer `index.html` dans le navigateur.

### Architecture
- **Structure** :
  - `index.html` : Kanban.
  - `create-ticket.html` : Formulaire.
  - `assets/js/storage.js` : Accès données.
  - `assets/js/app.js` : Contrôleur UI.

### Utilisation - Dev
- **Tests** :
  1. Ouvrir console (`F12`).
  2. Lancer `runTests()`.
  3. Vérifier : `✅ TOUS LES TESTS SONT PASSÉS !`.

### Contribution (Règles)
- **Sanity Checks** : 
  - Intégrité données (champs requis).
  - Cohérence DOM/Storage.
  - Sécurité XSS (`escapeHtml`).
- **Simplicité** : Code synchrone uniquement.