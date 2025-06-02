const express = require('express');
const router = express.Router();
const practitionerController = require('../controllers/practitionerController');
const protect = require('../middleware/protect');
const { authorizeRoles } = require('../middleware/authorizeRoles');

router.post('/practitionerApplication/apply', protect, practitionerController.apply);
router.get('/practitionerApplication/all', protect, authorizeRoles('admin'), practitionerController.getAllApplications);
router.patch('/practitionerApplication/update-status/:id', protect, authorizeRoles('admin'), practitionerController.updateStatus);
router.get('/practitionerApplication/my-application/:userid', protect, authorizeRoles('admin'), practitionerController.getUserApplication);
router.put('/practitionerApplication/Edit-application/:id', protect, authorizeRoles('admin'), practitionerController.editApplication);


module.exports = router;
