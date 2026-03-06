# 🏥 Pharmacie ISIS - Front-End

Application web de gestion d'inventaire pour la **Pharmacie ISIS**. Ce projet a été développé en utilisant **Vue 3**, **Vite** et **Vuetify**.

---

## ⚠️ AVIS IMPORTANT : Temps de chargement initial ⚠️

Le serveur backend (API Spring Boot et Base de données PostgreSQL) de ce projet est hébergé sur une instance gratuite de [Render.com](https://render.com). 

En raison des restrictions de ce service gratuit, le serveur se met en veille après une période d'inactivité. Par conséquent, lors de votre première visite, **le chargement initial peut prendre entre 2 et 10 minutes** pour que le serveur se "réveille". 

Une animation de chargement apparaîtra à l'écran. Une fois la connexion établie, l'application fonctionnera de manière fluide et instantanée. **Merci de votre patience !** ⏳

---

## ✨ Fonctionnalités Principales

- **Dashboard Interactif :** Vue d'ensemble des médicaments avec gestion des stocks en temps réel.
- **Recherche & Filtrage :** Barre de recherche en direct et tri par ordre alphabétique, quantité ou récence.
- **Gestion des Stocks :** Boutons d'incrémentation et décrémentation rapides. Alertes visuelles en cas de sous-stock.
- **Corbeille (Soft Delete) :** Les médicaments supprimés sont archivés et peuvent être restaurés depuis le panneau "Archives".
- **Intégration d'Images :** Possibilité de rechercher et d'ajouter directement des images via l'API Unsplash intégrée.

## 🛠️ Technologies Utilisées

- **Framework :** [Vue.js 3](https://vuejs.org/) (Composition API)
- **Outil de build :** [Vite](https://vitejs.dev/)
- **UI Library :** [Vuetify 3](https://vuetifyjs.com/)
- **Requêtes HTTP :** [Axios](https://axios-http.com/)

---

## 🚀 Installation et Configuration (Local)

Si vous souhaitez exécuter ce projet sur votre propre machine, suivez ces étapes :

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 20.0 ou supérieure recommandée)

### 2. Installation des dépendances
`npm install`

### 3. Lancer le serveur de développement
`npm run dev`

### 4. Compiler pour la production
`npm run build`

---
*Développé par Lucas Rodriguez.*