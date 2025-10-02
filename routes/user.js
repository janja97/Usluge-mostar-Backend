const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { updateProfile, getProfile, deleteUser } = require('../controllers/userController');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// PUT update profile with image upload
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);

// GET current profile
router.get('/profile', authMiddleware, getProfile);

// DELETE user
router.delete('/profile', authMiddleware, deleteUser);

module.exports = router;
