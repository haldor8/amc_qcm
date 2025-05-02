// Dotenv
// require('dotenv').config();

// Expressjs
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const helmet = require("helmet");

// Db
const connectDB = require('./db');

connectDB();

app.use(express.json());

// Pour la sécurité
app.use(helmet({
  contentSecurityPolicy: {
      directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
      },
  },
  hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ou mets ton domaine spécifique
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});


// Le home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "pages/index.html"));
});

app.get('/copies', (req, res) => {
    res.sendFile(path.join(__dirname, "pages/copies.html"));
});

app.get('/correction', (req, res) => {
    res.sendFile(path.join(__dirname, "pages/correction.html"));
});

/*
// Page non trouvée
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/undefined.html'));
});
*/

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'pages/undefined.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});