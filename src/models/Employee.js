const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  hoursWorked: { type: Number, required: false }, // Champ optionnel
});

const EmployeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['M', 'F'], required: true },
  position: { type: String, required: true },
  contractStatus: { type: String, enum: ['CDI', 'CDD', 'Indépendant'], required: true },
  salary: { type: Number, required: true },
  salaryType: { type: String, enum: ['Mensuel', 'Horaire'], required: true },
  paymentHistory: [SalarySchema],
});

module.exports = mongoose.model('Employee', EmployeeSchema);
