// Charger les variables d'environnement à partir du fichier .env
require('dotenv').config();

// Importer les modules nécessaires
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const errorHandler = require('./middlewares/errorHandler');

const cron = require('node-cron');
const updateAges = require('./updateAges');


// Initialiser une instance d'Express
const app = express();

// Utiliser les middlewares
app.use(cors()); // Activer CORS pour permettre les requêtes cross-origin
app.use(express.json()); // Middleware pour parser les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Middleware pour parser les requêtes URL-encoded

// Définir les routes de l'API
app.use('/members', require('./routes/memberRoutes')); // Routes liées aux membres
app.use('/employees', require('./routes/employeeRoutes')); // Routes liées aux employés
app.use('/import', require('./routes/importRoutes')); // Routes liées aux imports

// Middleware d'erreur global
app.use(errorHandler);

// Établir la connexion à la base de données
connectDB();

// Exécuter la mise à jour au démarrage
updateAges();

// Planifier la mise à jour quotidienne à minuit (00:00)
cron.schedule('0 0 * * *', () => {
  console.log('Lancement de la mise à jour quotidienne des âges.');
  updateAges();
});
// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});