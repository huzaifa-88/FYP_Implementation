const express = require('express');
const router = express.Router();
// const userController = require('');
// const userController = require('../controllers/mongoDBUserCon')
// const userController = require('../controllers/userControllers')
const userController = require('../controllers/userControllers');
const protect = require('../middleware/protect');

// Route to login user
router.post('/users/login', userController.loginUser);
router.post('/users/register', userController.createUser);

module.exports = router;
