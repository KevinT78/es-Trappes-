const xlsx = require('xlsx'); // Module pour lire les fichiers Excel
const Member = require('../models/Member'); // Modèle pour les membres
const Employee = require('../models/Employee'); // Modèle pour les employés
const setupLogging = require('../utils/logging/logger'); // Configuration du logging
const processMember = require('../utils/helpers/memberProcessor'); // Fonction pour traiter les membres
const processEmployee = require('../utils/helpers/employeeProcessor'); // Fonction pour traiter les employés

// Fonction pour importer les membres
const importMembers = async (req, res) => {
  try {
    // Configuration du logging uniquement lorsque l'endpoint est appelé
    const { logger, noLicenseLogger, errorLogger, warningLogger, duplicateLicenseLogger, defaultValueLogger } = setupLogging();

    // Vérification si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier n'a été uploadé" });
    }

    // Logging du début de l'importation
    logger.info(`Début de l'importation du fichier: ${req.file.path}`);

    // Lecture du fichier Excel
    const workbook = xlsx.readFile(req.file.path, {
      cellDates: true,
      dateNF: 'DD/MM/YYYY'
    });

    // Sélection de la première feuille du classeur
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    // Conversion de la feuille en JSON
    const data = xlsx.utils.sheet_to_json(worksheet, {
      raw: false,
      dateNF: 'DD/MM/YYYY'
    });

    // Initialisation des tableaux pour stocker les membres, employés, erreurs, avertissements, etc.
    const members = [];
    const employees = [];
    const errors = [];
    const warnings = [];
    const successfulImports = { members: [], employees: [] };
    const noLicenseMembers = [];
    const duplicateLicenseNumbers = new Map();

    // Taille du lot pour le traitement par lots
    const batchSize = 100;
    const totalBatches = Math.ceil(data.length / batchSize);

    // Récupération de tous les numéros de licence existants
    const existingLicenseNumbers = new Set((await Member.find().distinct('licenseNumber')).map(ln => ln.toString()));

    // Identification des numéros de licence en double dans les données à importer
    const licenseNumberCounts = new Map();
    data.forEach(row => {
      const licenseNumber = row['Numéro licence'];
      if (licenseNumber) {
        licenseNumberCounts.set(licenseNumber, (licenseNumberCounts.get(licenseNumber) || 0) + 1);
        if (licenseNumberCounts.get(licenseNumber) === 2) {
          duplicateLicenseNumbers.set(licenseNumber, []);
        }
      }
    });

    // Récupération de tous les employés existants
    const existingEmployees = await Employee.find();

    // Traitement des données par lots
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batch = data.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
      for (const row of batch) {
        try {
          const licenseType = row['Type licence']?.trim().toLowerCase() || '';

          if (licenseType === 'libre' || !licenseType) {
            // Traitement des membres
            const result = await processMember(
              row,
              existingLicenseNumbers,
              logger,
              noLicenseLogger,
              duplicateLicenseNumbers,
              errorLogger,
              warningLogger,
              defaultValueLogger
            );

            if (result.noLicense) {
              noLicenseMembers.push({ firstName: result.firstName, lastName: result.lastName });
              continue;
            }

            if (result.skip) {
              if (result.duplicate && duplicateLicenseNumbers.has(result.licenseNumber)) {
                duplicateLicenseNumbers.get(result.licenseNumber).push({
                  firstName: result.firstName,
                  lastName: result.lastName
                });
                continue;
              }
            }

            if (!result.skip) {
              members.push(result.member);
              successfulImports.members.push(result.licenseNumber);
              existingLicenseNumbers.add(result.licenseNumber);
            }
          } else {
            // Traitement des employés
            const result = await processEmployee(
              row,
              existingEmployees,
              logger,
              errorLogger,
              warningLogger,
              defaultValueLogger
            );

            if (!result.skip) {
              employees.push(result.employee);
              successfulImports.employees.push(result.email);
              existingEmployees.push(result.employee);
            }
          }
        } catch (error) {
          // Logging des erreurs
          errorLogger.error(`Erreur lors du traitement de la ligne: ${JSON.stringify(row)}`, error);
          errors.push({
            error: error.message,
            rawData: row
          });
        }
      }
      // Logging de la progression
      logger.info(`Traitement du lot ${batchIndex + 1}/${totalBatches} terminé`);
    }

    // Insertion des membres dans la base de données
    if (members.length > 0) {
      await Member.insertMany(members);
      logger.info(`${members.length} membres importés avec succès`);
    }

    // Résumé de l'importation
    const summary = {
      total: data.length,
      members: {
        success: members.length,
        errors: errors.length,
        noLicense: noLicenseMembers.length,
        duplicateLicenseNumbers: duplicateLicenseNumbers.size
      },
      employees: {
        success: employees.length,
        errors: errors.filter(e => e.rawData['Type licence']?.trim().toLowerCase() !== 'libre').length
      }
    };

    // Logging de la fin de l'importation
    logger.info('Importation terminée', { summary });

    // Log des numéros de licence en double
    if (duplicateLicenseNumbers.size > 0) {
      const duplicateEntries = Array.from(duplicateLicenseNumbers.entries()).map(([licenseNumber, members]) => ({
        licenseNumber,
        members
      }));
      duplicateLicenseLogger.info('Numéros de licence en double trouvés:', { duplicateEntries });
    }

    // Réponse HTTP avec le résumé de l'importation
    res.status(200).json({
      message: 'Importation terminée',
      summary
    });

  } catch (error) {
    // Logging des erreurs d'importation
    errorLogger.error('Échec de l\'importation', error);
    res.status(500).json({
      message: "Erreur lors de l'importation",
      error: error.message
    });
  }
};

// Exportation de la fonction importMembers
module.exports = {
  importMembers
};
