const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { ensureAuthenticated } = require('./auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, 'uploads', req.session.user, req.body.projet);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
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
    console.log(`./scripts/creer_projet.sh "${relPath}"`);
    exec(`bash "${scriptPath}" "${relPath}"`, (err) => {
      if (err) return res.status(500).send('Erreur script');
      return res.sendStatus(200);
    });
  } else {
    res.status(400).send('Projet existe');
  }
});

router.post('/upload', ensureAuthenticated, upload.any(), (req, res) => {
  res.sendStatus(200);
});

router.post('/action', ensureAuthenticated, (req, res) => {
  const { projet, action } = req.body;
  const dir = path.join(__dirname, 'uploads', req.session.user, projet);
  let script;
  if (action === 'corriger') script = 'corriger_copies.sh';
  else if (action === 'creer') script = 'creer_copies.sh';
  else return res.status(400).send('Action invalide');

  exec(`./scripts/${script}`, { cwd: dir }, (err) => {
    if (err) return res.status(500).send('Erreur script');
    const resultPath = action === 'creer' ? 'copies.pdf' : 'notes.odt';
    res.download(path.join(dir, resultPath));
  });
});

module.exports = router;
