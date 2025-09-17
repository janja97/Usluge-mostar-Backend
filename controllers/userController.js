// controllers/userController.js
const User = require('../models/User');

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId; 
    const data = req.body;

    console.log("Payload koji dolazi:", data);  // <-- dodaj ovo za debugging

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({ message: 'Profil uspješno ažuriran', user });
  } catch (err) {
    console.error('Greška backend-a:', err); // <-- log greške
    res.status(500).json({ message: 'Greška servera', error: err.message });
  }
};
