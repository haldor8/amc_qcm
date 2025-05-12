const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const User = require('./models/User');

const USERS = {
  prof1: 'pass1',
  prof2: 'pass2'
};

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: "Champs requis" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.json({ success: false, message: "Utilisateur inconnu" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.json({ success: false, message: "Mot de passe invalide" });
  }

  req.session.user = username;

  const userDir = path.join(__dirname, 'uploads', username);
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

  res.json({ success: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: 'Champs requis' });
  }

  const exists = await User.findOne({ username });
  if (exists) {
    return res.json({ success: false, message: 'Utilisateur déjà existant' });
  }

  const newUser = new User({ username, password });
  await newUser.save();

  const userDir = path.join(__dirname, 'uploads', username);
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

  res.json({ success: true });
});


module.exports = router;
