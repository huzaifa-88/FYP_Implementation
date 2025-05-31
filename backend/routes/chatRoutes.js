const express = require('express');
const router = express.Router();
const { handleChat, getThreads, getThreadById } = require('../controllers/chatController');
const protect = require('../middleware/protect');
const { authorizeRoles } = require('../middleware/authorizeRoles');

// Apply middlewares to all routes in this router
router.use(protect);
router.use(authorizeRoles('General User'));

// POST /api/chat
router.post('/chat', handleChat);

// GET /api/threads - get all threads for user
router.get('/chat/threads', getThreads);

// GET /api/threads/:id - get a thread by ID
router.get('/chat/threads/:id', getThreadById);

module.exports = router;

