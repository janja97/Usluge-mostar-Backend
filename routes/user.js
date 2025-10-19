const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const User = require('../models/User');
const Service = require('../models/Service');
const {
  updateProfile,
  getProfile,
  deleteUser,
  getUserAvatar
} = require('../controllers/userController');

// -------------------------
// Multer setup for memory upload
// -------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -------------------------
// Profile routes (for logged-in user)
// -------------------------

// PUT update profile (with image)
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);

// GET current user's profile
router.get('/profile', authMiddleware, getProfile);

// DELETE current user account
router.delete('/profile', authMiddleware, deleteUser);



// -------------------------
// Public route: get user avatar
// -------------------------
router.get('/avatar/:id', getUserAvatar);

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

// POST add service to favorites
router.post('/favorites/:serviceId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { serviceId } = req.params;

    if (!user) return res.status(404).json({ message: 'User not found' });
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

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

// DELETE remove service from favorites
router.delete('/favorites/:serviceId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { serviceId } = req.params;

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.favorites = user.favorites.filter(fav => fav.toString() !== serviceId);
    await user.save();

    res.json({ message: 'Service removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewedUser = await User.findById(req.params.id);

    if (!reviewedUser) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    // Provjera: ne možeš sam sebi ostaviti recenziju
    if (reviewedUser._id.toString() === req.userId) {
      return res.status(400).json({ message: 'Ne možeš ocijeniti sam sebe.' });
    }

    // Provjera: već ocijenio?
    const alreadyReviewed = reviewedUser.reviews.some(
      (rev) => rev.reviewer.toString() === req.userId
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Već si ocijenio ovog korisnika.' });
    }

    // Dodaj novu recenziju
    const newReview = {
      reviewer: req.userId,
      rating,
      comment
    };

    reviewedUser.reviews.push(newReview);
    await reviewedUser.save();

    res.status(201).json({ message: 'Recenzija dodana.', reviews: reviewedUser.reviews });
  } catch (err) {
    console.error('❌ Greška pri dodavanju recenzije:', err);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// GET - Dohvati sve recenzije korisnika
router.get('/:id/reviews', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('reviews.reviewer', 'fullName avatar')
      .select('reviews');
    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen' });

    res.json(user.reviews);
  } catch (err) {
    console.error('❌ Greška pri dohvaćanju recenzija:', err);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});
// -------------------------
// Public route: get user by ID
// -------------------------
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('favorites');
    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen' });
    res.json(user);
  } catch (err) {
    console.error('❌ Greška pri dohvaćanju korisnika:', err);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;
