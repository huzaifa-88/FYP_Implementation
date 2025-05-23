const express = require('express');
const router = express.Router();
const bookReferenceController = require('../controllers/bookReferenceController');
const protect = require('../middleware/protect');
const { authorizeRoles } = require('../middleware/authorizeRoles');

// GET all book references
router.get('/bookreferences/getAll', protect, authorizeRoles('admin'), bookReferenceController.getAllBookReferences);

// GET a single book reference by ID
router.get('/bookreferences/getByID/:id', protect, authorizeRoles('admin'), bookReferenceController.getBookReferenceById);

// POST a new book reference
router.post('/bookreferences/add', protect, authorizeRoles('admin'), bookReferenceController.createBookReference);

// PUT (update) a book reference
router.put('/bookreferences/update/:id', protect, authorizeRoles('admin'), bookReferenceController.updateBookReference);

// DELETE a book reference
router.delete('/bookreferences/delete/:id', protect, authorizeRoles('admin'), bookReferenceController.deleteBookReference);

module.exports = router;
