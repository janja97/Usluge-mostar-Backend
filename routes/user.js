
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Service = require('../models/Service');
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

// -------------------------
// FAVORITES ROUTES
// -------------------------

// GET all favorites for current user
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('favorites');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add a service to favorites
router.post('/favorites/:serviceId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { serviceId } = req.params;

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Provjera da li servis postoji
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Spriječi duplikate
    if (user.favorites.includes(serviceId)) {
      return res.status(200).json({ message: 'Already in favorites' });
    }

    user.favorites.push(serviceId);
    await user.save();
    res.status(201).json({ message: 'Service added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE remove a service from favorites
router.delete('/favorites/:serviceId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { serviceId } = req.params;

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.favorites = user.favorites.filter(
      fav => fav.toString() !== serviceId
    );
    await user.save();

    res.json({ message: 'Service removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

