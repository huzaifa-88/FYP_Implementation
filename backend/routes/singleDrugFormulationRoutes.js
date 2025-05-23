const express = require('express');
const router = express.Router();
// const singleDrugFormulationController = require('../controllers/mongoDBSingleDrugCon');  //MongoDB
const singleDrugFormulationController = require('../controllers/singleDrugFormulationController');  //SQL DB
const protect = require('../middleware/protect');
const { authorizeRoles } = require('../middleware/authorizeRoles');

router.get('/GetAll_SingleDrugFormulations', protect, singleDrugFormulationController.getAllSingleDrugFormulations);
router.get('/GetSingleDrugFormulation/:id', protect, singleDrugFormulationController.getSingleDrugFormulationById);
router.post('/Add_SingleDrugFormulation', protect, authorizeRoles('admin'), singleDrugFormulationController.addSingleDrugFormulation);
router.delete('/Delete_SingleDrugFormulation/:id', protect, authorizeRoles('admin'), singleDrugFormulationController.deleteSingleDrugFormulation);

module.exports = router;