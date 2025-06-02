const express = require('express');
const router = express.Router();
// const userController = require('');
// const userController = require('../controllers/mongoDBUserCon')
// const userController = require('../controllers/userControllers')
const userController = require('../controllers/userControllers');
const protect = require('../middleware/protect');
const { authorizeRoles } = require('../middleware/authorizeRoles');

// Route to login user
router.post('/users/login', userController.loginUser);
router.post('/users/register', userController.createUser);
router.get('/users/getUserById/:userid', protect, userController.getUserById);
router.get('/users/getallUsers', protect, authorizeRoles('admin'), userController.getUsers);
router.put('/users/updateUser/:userid', protect, authorizeRoles('admin'), userController.updateUser);
router.delete('/users/deleteUserByID/:userid', protect, authorizeRoles('admin'), userController.deleteUser);
router.get('/users/checkPractitioner/:userid', userController.checkPractitioner);
router.delete('/practitioner_applications/deleteByUser/:userid', userController.deletePractitionerApplicationsByUser);



module.exports = router;
