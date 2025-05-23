const express = require('express');
const router = express.Router();
const practitionerController = require('../controllers/practitionerController');
const protect = require('../middleware/protect');
const { authorizeRoles } = require('../middleware/authorizeRoles');

router.post('/practionerApplication/apply', practitionerController.apply);
router.get('/practionerApplication/all', protect, authorizeRoles('admin'), practitionerController.getAllApplications);
router.put('/practionerApplication/update-status/:id', protect, authorizeRoles('admin'), practitionerController.updateStatus);
router.get('/practionerApplication/my-application/:userid', protect, authorizeRoles('admin'), practitionerController.getUserApplication);
router.put('/practionerApplication/Edit-application/:id', protect, authorizeRoles('admin'), practitionerController.editApplication);


module.exports = router;
