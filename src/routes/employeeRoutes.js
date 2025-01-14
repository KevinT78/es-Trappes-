const express = require('express');
const EmployeeController = require('../controllers/employeeController');

const router = express.Router();

// Routes pour gérer les employés
router.get('/', EmployeeController.getAllEmployees);          // Récupérer tous les employés
router.get('/:employeeId', EmployeeController.getEmployeeById); // Récupérer un employé par ID
router.post('/', EmployeeController.createEmployee);          // Créer un nouvel employé
router.put('/:employeeId', EmployeeController.updateEmployee); // Mettre à jour un employé
router.delete('/:employeeId', EmployeeController.deleteEmployee); // Supprimer un employé

// Routes pour gérer les salaires
router.post('/salary', EmployeeController.addSalaryPayment);    // Ajouter un paiement de salaire
router.get('/:employeeId/salary', EmployeeController.getSalaryHistory); // Historique des paiements

module.exports = router;
