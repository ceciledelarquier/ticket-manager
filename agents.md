# Agent Guidelines - Ticket Manager

CONTEXTE MÉTIER
Application de gestion de tickets simplifiée (Kanban) pour une équipe de 3 personnes.
Priorité : Robustesse, Simplicité (Pas de backend), Expérience Utilisateur fluide.

## 5 VÉRIFICATIONS DE SANTÉ OBLIGATOIRES (SANITY CHECKS)

### 1. Intégrité des données tickets
- **Validation stricte** : Aucun ticket ne doit être créé sans titre, description et catégorie valide.
- **Fail-safe** : Le code doit gérer les erreurs de `localStorage` (quota, corruption) sans faire planter l'app.
- **Orphelins** : Pas de tickets sans ID ou avec des références utilisateurs inexistantes.

### 2. Cohérence état Kanban
- **Source unique** : Le DOM doit toujours refléter exactement l'état du `localStorage`.
- **Drag & Drop robuste** : Un déplacement échoué doit visuellement remettre la carte à sa place d'origine.
- **Compteurs** : Les compteurs (Assignés/Total) doivent rester synchronisés en temps réel.

### 3. Isolation du code
- **Nettoyage** : Tout event listener global (dragover, drop) doit être correctement géré pour éviter les fuites de mémoire (ou doublons d'événements).
- **Fonctions pures** : Privilégier des fonctions qui ne dépendent que de leurs arguments pour la logique métier (calculs, formatage).

### 4. Sécurité XSS (Critique)
- **Sanitization** : Utilisation systématique de `escapeHtml()` sur tous les inputs utilisateur (titres, descriptions, commentaires) avant affichage.
- **Validation pré-stockage** : Valider les données côté client avant même de les enregistrer.

### 5. Simplicité & Performance
- **Code Synchrone** : Pas d'API prévue à court terme. Utiliser le `localStorage` de manière synchrone pour garder le code simple et rapide.
- **KISS (Keep It Simple, Stupid)** : Éviter la sur-ingénierie (pas de patterns complexes inutiles comme des observables ou des state managers lourds).
