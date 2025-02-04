const mongoose = require('mongoose');
const moment = require('moment');


const SalarySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  hoursWorked: { type: Number, required: false }, 
});

const EmployeeSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true, unique: true},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String, enum: ['M', 'F'] },
  positions: [{ type: String, required: true }],
  contractStatus: { type: String, enum: ['CDI', 'CDD', 'Indépendant'] },
  salary: { type: Number, required: false },
  salaryType: { type: String, enum: ['Mensuel', 'Horaire'] },
  salaryHistory: [SalarySchema],
  birthDate: { type: String, required: true },
  age: { type: Number, required: false},
  comments: { type: [String] },
});


// Middleware pré-sauvegarde pour calculer l'âge
EmployeeSchema.pre('save', function (next) {
  if (this.birthDate) {
    const birthDate = moment(this.birthDate, 'DD/MM/YYYY', true);
    if (birthDate.isValid()) {
      this.age = moment().diff(birthDate, 'years');
    } else {
      console.warn(`Format de date invalide pour l'employé ID: ${this._id}, Date: ${this.birthDate}`);
    }
  }
  next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);