const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // middleware auth
const { updateProfile } = require('../controllers/userController');

// PUT /api/users/profile
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
