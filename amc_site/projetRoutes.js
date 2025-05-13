const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const fs = require('fs');
const { exec } = require('child_process');
const { ensureAuthenticated } = require('./auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projet = req.body.projet;
    const user = req.session.utilisateur;

    console.log(req.projet, req.body.projet);
    if (!projet || !user) {
      return cb(new Error('projet ou utilisateur manquant'));
    }

    const dir = path.join(__dirname, 'projets', user, projet);

    fs.mkdirSync(dir, { recursive: true }); // Crée le dossier si nécessaire
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

router.post('/upload', ensureAuthenticated, upload.array('fichiers'), (req, res) => {
  res.send('Fichiers uploadés');
});

router.get('/fichiers', ensureAuthenticated, (req, res) => {
  const { projet } = req.query;
  const dir = path.join(__dirname, '..', 'uploads', req.session.user, projet);
  if (!fs.existsSync(dir)) return res.status(404).send('Projet non trouvé');
  const fichiers = fs.readdirSync(dir);
  res.json(fichiers);
});

router.post('/action', ensureAuthenticated, (req, res) => {
  const { projet, action, latex, etudiants } = req.body;
  const user = req.session.user;
  const projetPath = path.join(__dirname, '..', 'uploads', user, projet);

  let cmd;
  if (action === 'creer') {
    cmd = `bash "${__dirname}/../scripts/creer_copies.sh" "${user}/${projet}" "${latex}" "${etudiants}"`;
  } else if (action === 'corriger') {
    cmd = `bash "${__dirname}/../scripts/corriger_copies.sh" "${user}/${projet}" "${etudiants}"`;
  } else {
    return res.status(400).send('Action inconnue');
  }

  exec(cmd, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur exécution script');
    }

    const fichier = action === 'creer' ? 'copies.pdf' : 'notes.odt';
    const filePath = path.join(projetPath, fichier);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).send('Fichier non trouvé');
    }
  });
});


module.exports = router;
