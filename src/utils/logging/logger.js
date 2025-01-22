// Importation des modules nécessaires
const winston = require('winston'); // Module pour le logging
const fs = require('fs'); // Module pour les opérations sur le système de fichiers
const path = require('path'); // Module pour manipuler les chemins de fichiers
const moment = require('moment'); // Module pour manipuler les dates et les heures

// Fonction pour configurer le logging
const setupLogging = () => {
  // Définir les noms des fichiers de log
  const logFileName = `logs/import_${moment().format('YYYYMMDD_HHmmss')}.log`; // Nom du fichier de log principal
  const noLicenseLogFileName = `logs/no_license_${moment().format('YYYYMMDD_HHmmss')}.log`; // Nom du fichier de log pour les membres sans licence
  const errorLogFileName = `logs/error_${moment().format('YYYYMMDD_HHmmss')}.log`; // Nom du fichier de log pour les erreurs
  const warningLogFileName = `logs/warning_${moment().format('YYYYMMDD_HHmmss')}.log`; // Nom du fichier de log pour les avertissements
  const duplicateLicenseLogFileName = `logs/duplicate_license_${moment().format('YYYYMMDD_HHmmss')}.log`; // Nom du fichier de log pour les numéros de licence en double
  const defaultValueLogFileName = `logs/default_value_${moment().format('YYYYMMDD_HHmmss')}.log`; // Nom du fichier de log pour les valeurs par défaut
  const logDirectory = path.dirname(logFileName); // Répertoire des fichiers de log

  // Créer le répertoire des fichiers de log s'il n'existe pas
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }

  // Configuration du logger principal
  const logger = winston.createLogger({
    level: 'info', // Niveau de log par défaut
    format: winston.format.combine(
      winston.format.timestamp(), // Ajouter un timestamp à chaque log
      winston.format.json() // Formater les logs en JSON
    ),
    transports: [
      new winston.transports.Console(), // Afficher les logs dans la console
      new winston.transports.File({ filename: logFileName }) // Écrire les logs dans un fichier
    ]
  });

  // Configuration du logger pour les membres sans licence
  const noLicenseLogger = winston.createLogger({
    level: 'info', // Niveau de log par défaut
    format: winston.format.combine(
      winston.format.timestamp(), // Ajouter un timestamp à chaque log
      winston.format.json() // Formater les logs en JSON
    ),
    transports: [
      new winston.transports.File({ filename: noLicenseLogFileName }) // Écrire les logs dans un fichier
    ]
  });

  // Configuration du logger pour les erreurs
  const errorLogger = winston.createLogger({
    level: 'error', // Niveau de log par défaut
    format: winston.format.combine(
      winston.format.timestamp(), // Ajouter un timestamp à chaque log
      winston.format.json() // Formater les logs en JSON
    ),
    transports: [
      new winston.transports.File({ filename: errorLogFileName }) // Écrire les logs dans un fichier
    ]
  });

  // Configuration du logger pour les avertissements
  const warningLogger = winston.createLogger({
    level: 'warn', // Niveau de log par défaut
    format: winston.format.combine(
      winston.format.timestamp(), // Ajouter un timestamp à chaque log
      winston.format.json() // Formater les logs en JSON
    ),
    transports: [
      new winston.transports.File({ filename: warningLogFileName }) // Écrire les logs dans un fichier
    ]
  });

  // Configuration du logger pour les numéros de licence en double
  const duplicateLicenseLogger = winston.createLogger({
    level: 'info', // Niveau de log par défaut
    format: winston.format.combine(
      winston.format.timestamp(), // Ajouter un timestamp à chaque log
      winston.format.json() // Formater les logs en JSON
    ),
    transports: [
      new winston.transports.File({ filename: duplicateLicenseLogFileName }) // Écrire les logs dans un fichier
    ]
  });

  // Configuration du logger pour les valeurs par défaut
  const defaultValueLogger = winston.createLogger({
    level: 'info', // Niveau de log par défaut
    format: winston.format.combine(
      winston.format.timestamp(), // Ajouter un timestamp à chaque log
      winston.format.json() // Formater les logs en JSON
    ),
    transports: [
      new winston.transports.File({ filename: defaultValueLogFileName }) // Écrire les logs dans un fichier
    ]
  });

  // Retourner les loggers
  return { logger, noLicenseLogger, errorLogger, warningLogger, duplicateLicenseLogger, defaultValueLogger };
};

// Exportation de la fonction de configuration du logging
module.exports = setupLogging;

