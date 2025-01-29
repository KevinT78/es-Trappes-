const xlsx = require('xlsx');
const Member = require('../models/Member');
const Employee = require('../models/Employee');
const processMember = require('../utils/helpers/memberProcessor');
const processEmployee = require('../utils/helpers/employeeProcessor');
const { normalizePhoneNumber } = require('../utils/helpers/phoneHelper');

// Importation des membres et employés depuis un fichier
exports.importMembers = async (req, res, next) => {
  try {
    // Vérification de l'existence du fichier
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier n'a été uploadé" });
    }

    // Lecture du fichier Excel
    const workbook = xlsx.readFile(req.file.path, { cellDates: true, dateNF: 'DD/MM/YYYY' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'DD/MM/YYYY' });

    // Exclure certaines valeurs spécifiques
    const excludedValues = ["Problème Affectation ANCV", "AUTRES CAS", "MEMBRES SANS LICENCE", "LICENCES A FORMALISER"];
    const filteredData = data.filter(row => {
      const name = row['Nom, prénom']?.trim();
      return name && !excludedValues.includes(name);
    }).map(row => {
      Object.keys(row).forEach(key => {
        if (typeof row[key] === 'string') {
          row[key] = row[key].trim();
        }
      });
      return row;
    });

    // Vérification si des données valides existent après le filtrage
    if (filteredData.length === 0) {
      return res.status(400).json({ message: "Aucune donnée valide trouvée dans le fichier" });
    }

    // Gestion des doublons de licence
    const licenseDuplicates = new Map();
    filteredData.forEach((row) => {
      const licenseNumber = row['Numéro licence'];
      if (licenseNumber) {
        if (!licenseDuplicates.has(licenseNumber)) {
          licenseDuplicates.set(licenseNumber, []);
        }
        licenseDuplicates.get(licenseNumber).push(row);
      }
    });

    // Marquage des doublons de licence
    licenseDuplicates.forEach((rows, licenseNumber) => {
      if (rows.length > 1) {
        rows.forEach((row, index) => {
          if (index > 0) {
            row['Numéro licence'] = `${licenseNumber}_DUPLICATE_${index}`;
            row.comments = row.comments || [];
            row.comments.push(`Numéro de licence dupliqué modifié : ${row['Numéro licence']}`);
          }
        });
      }
    });

    const members = [];
    const employees = [];
    const successfulImports = { members: [], employees: [] };

    // Traitement des données ligne par ligne
    const promises = filteredData.map(async (row) => {
      row['Mobile personnel'] = normalizePhoneNumber(row['Mobile personnel']);
      const licenseType = (row['Type licence']?.trim() || '').toLowerCase();

      try {
        if (['libre', '', null].includes(licenseType)) {
          const result = await processMember(row);
          if (result?.member) {
            members.push(result.member);
            successfulImports.members.push(result.licenseNumber);
          }
        } else {
          const result = await processEmployee(row);
          if (result?.employee) {
            employees.push(result.employee);
            successfulImports.employees.push(result.email);
          }
        }
      } catch (error) {
        console.error("Erreur lors du traitement d'une ligne:", error);
      }
    });

    await Promise.all(promises);

    // Récupération des numéros de licence existants
    const existingMemberLicenses = new Set(
      (await Member.find({}, { licenseNumber: 1 }).lean()).map(m => m.licenseNumber)
    );
    const existingEmployeeLicenses = new Set(
      (await Employee.find({}, { licenseNumber: 1 }).lean()).map(e => e.licenseNumber)
    );

    // Filtrage des entrées déjà existantes
    const membersToInsert = members.filter(member => !existingMemberLicenses.has(member.licenseNumber));
    const employeesToInsert = employees.filter(employee => !existingEmployeeLicenses.has(employee.licenseNumber));

    // Insertion des nouvelles entrées dans la base de données
    if (membersToInsert.length > 0) await Member.insertMany(membersToInsert);
    if (employeesToInsert.length > 0) await Employee.insertMany(employeesToInsert);

    // Réponse avec un résumé de l'importation
    res.status(200).json({
      message: 'Importation terminée',
      summary: {
        members: { total: members.length, successful: membersToInsert.length },
        employees: { total: employees.length, successful: employeesToInsert.length }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Récupération des entrées avec des commentaires
exports.getEntriesWithComments = async (req, res, next) => {
  try {
    // Recherche des membres et employés ayant des commentaires
    const membersWithComments = await Member.find({ comments: { $ne: [] } });
    const employeesWithComments = await Employee.find({ comments: { $ne: [] } });

    // Réponse avec les entrées trouvées
    res.status(200).json({ members: membersWithComments, employees: employeesWithComments });
  } catch (error) {
    next(error);
  }
};
