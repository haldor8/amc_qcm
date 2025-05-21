# AMC Web Interface – Serveur de génération et correction de QCM

Ce projet propose une **interface web légère** permettant à des enseignants de :
- créer des projets AMC,
- envoyer leurs fichiers LaTeX et listes d’étudiants,
- générer automatiquement des copies PDF,
- corriger des copies scannées,
- récupérer les notes au format `.ods`.

L’ensemble repose sur un serveur **Node.js**, une base de données **MongoDB**, des **scripts shell** (déjà fournis) et **Auto Multiple Choice (AMC)**, avec une interface minimaliste en HTML. Le tout est **conçu pour Linux**, avec une **version Docker** prête à l’emploi.

---

## Installation sans Docker (Linux uniquement)

### Prérequis

- Node.js + npm
- MongoDB
- Auto Multiple Choice
- Bash + make + texlive-full (pour AMC)

### Étapes

1. Clonez le projet :
   ```bash
   git clone <repo-url>
   cd amc_site
   ```

2. Installez les dépendances Node.js :

   ```bash
   npm install
   ```

3. Assurez-vous que MongoDB est en cours d'exécution :

   ```bash
   mongod --dbpath ./db
   ```

4. Lancez le serveur :

   ```bash
   node index.js
   ```

5. Accédez à l’interface :
   [http://localhost:3000](http://localhost:3000)

---

## Installation avec Docker

### Étapes

1. Assurez-vous que Docker est installé :

   ```bash
   docker --version
   ```

2. Construisez l’image Docker :

   ```bash
   docker build -t amc-app .
   ```

3. Lancez le conteneur :

   ```bash
   docker run -p 3000:3000 amc-app
   ```

4. Accédez à l’interface :
   [http://localhost:3000](http://localhost:3000)

---

## ✨ Fonctionnalités

* Connexion / inscription des professeurs
* Création de projets AMC via script
* Upload de fichiers `.tex`, `.csv`, `.xml`, scans `.jpg`/`.png`
* Compilation AMC automatisée (`creer_copies.sh`, `corriger_copies.sh`)
* Récupération des copies PDF et des notes corrigées
* Nettoyage ou suppression des projets
* Interface épurée, rapide, sans framework CSS

---

## Contributeurs / Contact

Ce projet a été réalisé dans un cadre universitaire.
Il est conçu pour être **simplement déployé et réutilisable** pour toute structure utilisant AMC.