const moment = require('moment');
const Member = require('../../models/Member');
const extractNameParts = require('./nameExtractor');
const getCategoryAndGender = require('./categoryGenderHelper');

// Fonction pour traiter un membre
const processMember = async (row, existingLicenseNumbers, logger, noLicenseLogger, duplicateLicenseNumbers, errorLogger, warningLogger, defaultValueLogger) => {
  try {
    // Nettoyage des valeurs de la ligne
    for (const key in row) {
      if (typeof row[key] === 'string') {
        row[key] = row[key].trim();
      }
    }

    // Vérifier si le type de licence est manquant et si le nom est présent
    if (!row['Type licence'] && row['Nom, prénom']) {
      const { firstName, lastName } = extractNameParts(row['Nom, prénom']);
      noLicenseLogger.info(`Membre sans type de licence: ${firstName} ${lastName}`);
      return { noLicense: true, firstName, lastName };
    }

    // Vérifier si le type de licence est valide
    if (row['Type licence']?.toLowerCase() !== 'libre') {
      return { skip: true };
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

    // Extraction de la catégorie et du genre
    const { category, gender } = getCategoryAndGender(row['Sous catégorie']);

    // Calcul des montants dus et payés
    const solde = parseFloat(row['Solde']?.replace(',', '.') || 0);
    const totalDue = solde > 0 ? solde : 0;
    const totalPaid = solde < 0 ? Math.abs(solde) : 0;
    
    // Déterminer le statut de paiement
    let paymentStatus = 'unpaid';
    if (totalPaid > totalDue) paymentStatus = 'paid';
    else if (totalPaid > 0) paymentStatus = 'partial';
    else if (solde === 0) paymentStatus = 'paid';

    // Nettoyage et formatage du numéro de téléphone
    let phone = row['Mobile personnel'] || '';
    phone = phone.toString().replace(/[^0-9]/g, '');
    if (phone && !phone.startsWith('0')) phone = '0' + phone;
    if (!phone) {
      phone = '0000000000';
      defaultValueLogger.info(`Numéro de téléphone par défaut utilisé: ${phone} pour ${firstName} ${lastName}`);
    }

    // Définition du numéro de licence
    const licenseNumber = row['Numéro licence'] || `TEMP_${Date.now()}_${lastName}`;
    if (!row['Numéro licence']) {
      defaultValueLogger.info(`Numéro de licence par défaut utilisé: ${licenseNumber} pour ${firstName} ${lastName}`);
    }

    // Vérifier les doublons
    if (existingLicenseNumbers.has(licenseNumber) || duplicateLicenseNumbers.has(licenseNumber)) {
      return { skip: true, duplicate: true, firstName, lastName, licenseNumber };
    }

    // Création du membre
    const member = new Member({
      licenseNumber,
      email: row['Email principal'] || `${lastName.toLowerCase()}.${firstName.toLowerCase()}@placeholder.com`,
      phone,
      firstName,
      lastName,
      birthDate,
      gender,
      age,
      category,
      active: row['Statut Licence'] === 'V',
      totalDue,
      totalPaid,
      paymentStatus
    });

    // Validation du membre
    await member.validate();
    return { member, licenseNumber };
  } catch (error) {
    errorLogger.error('Erreur lors du traitement du membre:', error);
    return { error: error.message };
  }
};

module.exports = processMember;
