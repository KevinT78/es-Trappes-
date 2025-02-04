const mongoose = require('mongoose');

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
  age: { type: Number, required: true },
  comments: { type: [String] },
});

module.exports = mongoose.model('Employee', EmployeeSchema);