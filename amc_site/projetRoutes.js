const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const fs = require('fs');
const { exec } = require('child_process');
const { ensureAuthenticated } = require('./auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const utilisateur = req.session.user;
    const projet = req.params.projet;

    if (!utilisateur || !projet) {
      return cb(new Error('projet ou utilisateur manquant'));
    }

    const dir = path.join(__dirname, 'uploads', utilisateur, projet);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.get('/liste', ensureAuthenticated, (req, res) => {
  const dir = path.join(__dirname, 'uploads', req.session.user);
  const projets = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());
  res.json(projets);
});

router.post('/creer', ensureAuthenticated, (req, res) => {
  const { nom } = req.body;
  const username = req.session.user;

  const relPath = path.join(username, nom); // username/nom_du_projet
  const fullPath = path.join(__dirname, 'uploads', relPath);

  const scriptPath = path.join(__dirname, 'scripts', 'creer_projet.sh');

  if (!fs.existsSync(fullPath)) {
    console.log(`bash "${scriptPath}" "${relPath}"`);
    exec(`bash "${scriptPath}" "${relPath}"`, (err) => {
      if (err) {
      // console.error(`[ERREUR] exec error: ${err.message}`);
      return res.status(500).send(`Erreur lors de l'exécution du script`);
    }
    res.sendStatus(200);
    });
  } else {
    res.status(400).send('Projet existe');
  }
});

router.post('/upload/:projet', ensureAuthenticated, upload.array('fichiers'), (req, res) => {
  res.sendStatus(200);
});

router.get('/fichiers', ensureAuthenticated, (req, res) => {
  const { projet } = req.query;
  const dir = path.join(__dirname, 'uploads', req.session.user, projet);
  if (!fs.existsSync(dir)) return res.status(404).send('Projet non trouvé');

  const fichiers = fs.readdirSync(dir)
    .filter(f => fs.statSync(path.join(dir, f)).isFile());

  res.json(fichiers); // exemple : ["exam.tex", "etudiants.csv", "notes.odt"]
});


router.post('/action', ensureAuthenticated, async (req, res) => {
  const { projet, action, latex, etudiants, xml } = req.body;
  const user = req.session.user;
  const projetPath = path.join(__dirname, 'uploads', user, projet);

  if (!fs.existsSync(projetPath)) {
    return res.status(404).send('Projet introuvable');
  }

  // Choisir le nom du script à copier
  const scriptName = action === 'compiler'
    ? 'compiler_qcm.sh'
    : `${action}_copies.sh`;

  const srcScript = path.join(__dirname, 'scripts', scriptName);
  const destScript = path.join(projetPath, scriptName);
  fs.copyFileSync(srcScript, destScript);
  fs.chmodSync(destScript, 0o755); // rendre exécutable

  // Préparer la commande (juste les noms de fichiers)
  let cmd;
  if (action === 'creer') {
    if (!latex || !etudiants) return res.status(400).send('Paramètres manquants');
    cmd = `./${scriptName} "${latex}" "${etudiants}"`;
  } else if (action === 'corriger') {
    if (!etudiants) return res.status(400).send('Paramètre manquant');
    cmd = `./${scriptName} "${etudiants}"`;
  } else if (action === 'compiler') {
    if (!xml) return res.status(400).send('Fichier XML manquant');
    cmd = `./${scriptName} "${xml}"`;
  } else {
    return res.status(400).send('Action inconnue');
  }

  // Exécuter dans le bon dossier
  exec(cmd, { cwd: projetPath }, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur exécution script');
    }

    // Choisir le bon fichier à renvoyer (ou non)
    let filePath;
    if (action === 'creer') {
      filePath = path.join(projetPath, 'copies.tar.gz');
    } else if (action === 'corriger') {
      filePath = path.join(projetPath, 'exports', 'resultats.ods');
    } else if (action === 'compiler') {
      return res.sendStatus(200); // aucun téléchargement attendu
    } else {
      return res.status(400).send('Action inconnue');
    }

    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).send('Fichier généré introuvable');
    }
  });
});

const scanStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const utilisateur = req.session.user;
    const projet = req.params.projet;

    if (!utilisateur || !projet) {
      return cb(new Error('projet ou utilisateur manquant'));
    }

    const scanDir = path.join(__dirname, 'uploads', utilisateur, projet, 'scans');
    fs.mkdirSync(scanDir, { recursive: true });
    cb(null, scanDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadScans = multer({ storage: scanStorage });

router.post('/upload/:projet/scans', ensureAuthenticated, uploadScans.array('scans'), (req, res) => {
  res.sendStatus(200);
});

// Nettoyer les fichiers d'un projet (pas les sous-dossiers)
router.delete('/nettoyer/:projet', ensureAuthenticated, (req, res) => {
  const projetDir = path.join(__dirname, 'uploads', req.session.user, req.params.projet);
  if (!fs.existsSync(projetDir)) return res.status(404).send('Projet introuvable');

  // Fonction récursive pour supprimer tous les fichiers mais garder les dossiers
  function nettoyerDossier(dir) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        nettoyerDossier(fullPath); // récursion
      } else {
        fs.unlinkSync(fullPath); // supprime le fichier
      }
    });
  }

  nettoyerDossier(projetDir);
  res.sendStatus(200);
});


// Supprimer tous les scans
router.delete('/supprimer-scans/:projet', ensureAuthenticated, (req, res) => {
  const scanDir = path.join(__dirname, 'uploads', req.session.user, req.params.projet, 'scans');
  if (!fs.existsSync(scanDir)) return res.status(404).send('Dossier scans introuvable');

  fs.readdirSync(scanDir).forEach(file => {
    const fullPath = path.join(scanDir, file);
    if (fs.statSync(fullPath).isFile()) {
      fs.unlinkSync(fullPath);
    }
  });

  res.sendStatus(200);
});

router.delete('/supprimer/:projet', ensureAuthenticated, (req, res) => {
  const projetDir = path.join(__dirname, 'uploads', req.session.user, req.params.projet);
  if (!fs.existsSync(projetDir)) return res.status(404).send('Projet introuvable');

  fs.rmSync(projetDir, { recursive: true, force: true });
  res.sendStatus(200);
});


module.exports = router;
