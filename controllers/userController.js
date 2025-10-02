const User = require('../models/User');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = {};

    const allowedFields = [
      'fullName',
      'phone',
      'city',
      'profession',
      'birthYear',
      'about',
      'password',
      'avatar'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.password) {
      if (updates.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    if (updates.birthYear) updates.birthYear = Number(updates.birthYear);
    if (updates.about) updates.about = updates.about.toString();

    // Handle avatar upload
    if (req.file) {
      const user = await User.findById(userId);
      if (user.avatar) {
        const oldPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json(updatedUser);
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Soft delete: postavi isActive na false
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};