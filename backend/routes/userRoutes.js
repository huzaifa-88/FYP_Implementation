const express = require('express');
const router = express.Router();
// const userController = require('');
const userController = require('../controllers/userControllers')
const protect = require('../middleware/protect')

// Route to login user
router.post('/login', userController.loginUser);

module.exports = router;
