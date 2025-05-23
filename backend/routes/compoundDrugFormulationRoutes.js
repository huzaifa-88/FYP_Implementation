const express = require('express');
const router = express.Router();
const compoundDrugFormulationController = require('../controllers/compoundDrugFormulationController');
const protect = require('../middleware/protect');
const { authorizeRoles } = require('../middleware/authorizeRoles');

// Add a new compound drug formulation
router.post('/compoundDrugFormulations/add', protect, authorizeRoles('admin'), compoundDrugFormulationController.addCompoundDrugFormulation);

// Get all compound drug formulations
router.get('/compoundDrugFormulations/getAll', protect, compoundDrugFormulationController.getAllCompoundDrugFormulations);

// Get a compound drug formulation by ID
router.get('/compoundDrugFormulations/:id', protect, compoundDrugFormulationController.getCompoundDrugFormulationById);

// Update a compound drug formulation
router.put('/compoundDrugFormulations/update/:id', protect, authorizeRoles('admin'), compoundDrugFormulationController.updateCompoundDrugFormulation);

// Delete a compound drug formulation
router.delete('/compoundDrugFormulations/delete/:id', protect, authorizeRoles('admin'), compoundDrugFormulationController.deleteCompoundDrugFormulation);

module.exports = router;
