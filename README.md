# Ticket Manager 🎫

Une application de gestion de tickets type Kanban, développée en Vanilla JS.

> Projet réalisé dans le cadre d'un parcours de formation développeur.
> **Architecture MVP** : HTML/CSS/JS natif, sans framework ni dépendances.

## 🚀 Fonctionnalités

**Côté Utilisateur :**
- Formulaire de création de ticket simplifié
- Assignation automatique intelligente (UX → Cécile, Tech → Aymen, etc.)
- Stockage local (localStorage)

**Côté Support :**
- Tableau Kanban (À traiter / En cours / Traitée)
- Drag & Drop natif pour gérer les statuts
- Vue détaillée des tickets (Modal)
- Système de commentaires

## 📁 Architecture du projet

```
ticket-manager/
├── assets/
│   ├── css/
│   │   └── styles.css       # Styles globaux (Design System)
│   └── js/
│       ├── config.js        # Configuration et constantes (Source of Truth)
│       ├── storage.js       # Couche d'accès aux données (localStorage)
│       ├── app.js           # Logique du Kanban (Drag & Drop, Modal)
│       ├── form.js          # Logique du formulaire public
│       └── tests.js         # Suite de tests unitaires
├── index.html               # Tableau de bord (Page principale)
├── create-ticket.html       # Formulaire de signalement
├── .gitignore               # Exclusion des fichiers système
└── README.md                # Documentation
```

## 🛠️ Installation & Démarrage

Ce projet ne nécessite **aucune installation** (pas de `npm install`, pas de serveur Node).

1. Clonez ce dépôt ou téléchargez les fichiers.
2. Ouvrez `index.html` dans votre navigateur pour voir le **Tableau de bord**.
3. Ouvrez `create-ticket.html` pour voir le **Formulaire de création**.

## 🧪 Tests Unitaires

Une suite de tests unitaires "maison" est incluse pour valider la logique critique.

1. Ouvrez `index.html` dans votre navigateur.
2. Ouvrez la console développeur (F12).
3. Tapez la commande suivante :
   ```javascript
   runTests()
   ```

## ⚠️ Notes techniques

- **Données :** Les données sont stockées dans le `localStorage` de votre navigateur. Elles ne sont pas partagées entre différents appareils.
- **Sécurité :** Les données saisies sont échappées (`escapeHtml`) à l'affichage pour prévenir les failles XSS.
- **Performance :** Aucun téléchargement externe, chargement instantané.

---
*© 2026 - Ticket Manager Team*