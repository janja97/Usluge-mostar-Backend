const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// GET user favorites - return full service objects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('favorites');
    res.json(user.favorites); // return full service objects
  } catch (err) {
    console.error('Error loading favorites:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// TOGGLE favorite - add or remove a service from user's favorites
router.post('/:serviceId', authMiddleware, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.favorites.findIndex(fav => fav.toString() === serviceId);
    if (index >= 0) {
      user.favorites.splice(index, 1); // remove from favorites
    } else {
      user.favorites.push(serviceId); // add to favorites
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error('Error toggling favorite:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
