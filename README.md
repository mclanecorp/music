# Music Streamer - YouTube Audio

Ce projet est une application web simple qui permet aux utilisateurs de rechercher une musique et de l'écouter directement. L'audio est extrait de vidéos YouTube en temps réel, sans télécharger la vidéo.

## Architecture

L'application est construite sur une architecture client-serveur :

- **Frontend** : Une application React qui fournit l'interface utilisateur.
- **Backend** : Un serveur Node.js (avec Express) qui gère la recherche sur YouTube et le streaming audio.

### Fonctionnement détaillé

1.  L'utilisateur saisit un nom de musique dans l'interface React.
2.  Le frontend envoie une requête de recherche à l'API du backend.
3.  Le backend utilise la bibliothèque `ytsr` pour trouver des vidéos correspondantes sur YouTube.
4.  Le backend renvoie une liste de résultats (titre, ID de la vidéo) au frontend.
5.  L'utilisateur clique sur un résultat.
6.  Le frontend demande le flux audio au backend en utilisant l'ID de la vidéo.
7.  Le backend utilise la bibliothèque `ytdl-core` pour extraire uniquement le flux audio de la vidéo YouTube.
8.  Le serveur envoie ce flux audio en continu (streaming) au lecteur `<audio>` du frontend.
9.  La musique est jouée dans le navigateur de l'utilisateur.

## Technologies

- **Frontend**:
  - [React](https://reactjs.org/)
  - [Bootstrap](https://getbootstrap.com/) pour le style
- **Backend**:
  - [Node.js](https://nodejs.org/)
  - [Express](https://expressjs.com/)
  - [ytsr](https://github.com/TimeForANinja/node-ytsr) - Pour la recherche YouTube
  - [ytdl-core](https://github.com/fent/node-ytdl-core) - Pour l'extraction audio

## Installation et Lancement

Suivez ces étapes pour lancer le projet en local.

### 1. Prérequis

- [Node.js](https://nodejs.org/en/download/) (version 14 ou supérieure)
- [npm](https://www.npmjs.com/get-npm) (généralement inclus avec Node.js)

### 2. Backend

```bash
# Se placer dans le dossier du backend
cd backend

# Installer les dépendances
npm install express ytdl-core ytsr cors

# Démarrer le serveur
node server.js
# Le serveur sera accessible sur http://localhost:3001
```

### 3. Frontend

```bash
# Dans un autre terminal, se placer à la racine du projet

# Créer l'application React (si elle n'existe pas)
npx create-react-app frontend

# Se placer dans le dossier du frontend
cd frontend

# Installer les dépendances
npm install bootstrap

# Démarrer l'application React
npm start
# L'application sera accessible sur http://localhost:3000
```
