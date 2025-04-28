const express = require('express');
const router = express.Router();
const compoundDrugFormulationController = require('../controllers/compoundDrugFormulationController');

// Add a new compound drug formulation
router.post('/compoundDrugFormulations/add', compoundDrugFormulationController.addCompoundDrugFormulation);

// Get all compound drug formulations
router.get('/compoundDrugFormulations/getAll', compoundDrugFormulationController.getAllCompoundDrugFormulations);

// Get a compound drug formulation by ID
router.get('/compoundDrugFormulations/:id', compoundDrugFormulationController.getCompoundDrugFormulationById);

// Update a compound drug formulation
router.put('/compoundDrugFormulations/update/:id', compoundDrugFormulationController.updateCompoundDrugFormulation);

// Delete a compound drug formulation
router.delete('/compoundDrugFormulations/delete/:id', compoundDrugFormulationController.deleteCompoundDrugFormulation);

module.exports = router;
