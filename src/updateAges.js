const moment = require('moment');
const Member = require('./models/Member');
const Employee = require('./models/Employee');

// Fonction pour actualiser l'âge
const updateAges = async () => {
  try {
    console.log('Mise à jour des âges en cours...');

    // Mettre à jour les employés
    const employees = await Employee.find();
    for (let emp of employees) {
      if (emp.birthDate) {
        // Conversion du birthDate de String en objet moment en précisant le format
        const birthDate = moment(emp.birthDate, 'DD/MM/YYYY', true);
        if (birthDate.isValid()) {
          emp.age = moment().diff(birthDate, 'years');
          await emp.save();
        } else {
          console.warn(`Format de date invalide pour l'employé ID: ${emp._id}, Date: ${emp.birthDate}`);
        }
      }
    }

    // Mettre à jour les membres
    const members = await Member.find();
    for (let mem of members) {
      if (mem.birthDate) {
        const birthDate = moment(mem.birthDate, 'DD/MM/YYYY', true);
        if (birthDate.isValid()) {
          mem.age = moment().diff(birthDate, 'years');
          await mem.save();
        } else {
          console.warn(`Format de date invalide pour le membre ID: ${mem._id}, Date: ${mem.birthDate}`);
        }
      }
    }

    console.log('Mise à jour des âges terminée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des âges :', error);
  }
};

module.exports = updateAges;
