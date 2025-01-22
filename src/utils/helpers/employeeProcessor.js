const moment = require('moment');
const Employee = require('../../models/Employee');
const extractNameParts = require('./nameExtractor');

// Fonction pour traiter un employé
const processEmployee = async (row, existingEmployees, logger, errorLogger, warningLogger, defaultValueLogger) => {
  try {
    // Nettoyage des valeurs de la ligne
    for (const key in row) {
      if (typeof row[key] === 'string') {
        row[key] = row[key].trim();
      }
    }

    const { firstName, lastName } = extractNameParts(row['Nom, prénom']);
    let birthDate = row['Né(e) le'];
    let age = 0;

    // Vérification de la date de naissance
    if (birthDate) {
      const momentDate = moment(birthDate, 'DD/MM/YYYY', true);
      if (momentDate.isValid()) {
        birthDate = momentDate.format('DD/MM/YYYY');
        age = moment().diff(momentDate, 'years');
      } else {
        warningLogger.warn(`Date de naissance invalide: ${birthDate}`);
      }
    }

    // Définition de l'email
    const email = row['Email principal'] || `${lastName.toLowerCase()}.${firstName.toLowerCase()}@placeholder.com`;
    if (!row['Email principal']) {
      defaultValueLogger.info(`Email par défaut utilisé: ${email} pour ${firstName} ${lastName}`);
    }

    // Définition du numéro de licence
    const licenseNumber = row['Numéro licence'] || `TEMP_${Date.now()}_${lastName}`;
    if (!row['Numéro licence']) {
      defaultValueLogger.info(`Numéro de licence par défaut utilisé: ${licenseNumber} pour ${firstName} ${lastName}`);
    }

    // Recherche d'un employé existant
    let employee = existingEmployees.find(emp => emp.email === email);
    if (!employee) {
      // Créer un nouvel employé
      employee = new Employee({
        firstName,
        lastName,
        email,
        licenseNumber, // Ajout du numéro de licence
        positions: [row['Type licence']],
        paymentHistory: [],
        birthDate,
        age,
      });
      await employee.save();
    } else {
      // Ajouter la position s'il n'existe pas
      if (!employee.positions.includes(row['Type licence'])) {
        employee.positions.push(row['Type licence']);
        await employee.save();
      }
    }

    return { employee, email, licenseNumber };
  } catch (error) {
    errorLogger.error('Erreur lors du traitement de l\'employé:', error);
    return { error: error.message };
  }
};

module.exports = processEmployee;
