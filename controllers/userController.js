const User = require("../models/User");
const bcrypt = require("bcrypt");

// -------------------------
// GET current user's profile
// -------------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-passwordHash")
      .populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// -------------------------
// UPDATE profile (with optional avatar)
// -------------------------
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = {};

    const allowedFields = [
      "fullName",
      "phone",
      "city",
      "profession",
      "birthYear",
      "about",
      "password"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // 🔹 hash lozinke ako se mijenja
    if (updates.password) {
      if (updates.password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    // 🔹 convert birthYear i about
    if (updates.birthYear) updates.birthYear = Number(updates.birthYear);
    if (updates.about) updates.about = updates.about.toString();

    // 🔹 uploadana slika
    if (req.file) {
      updates.avatar = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    res.json(updatedUser);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// -------------------------
// DELETE current user (soft delete)
// -------------------------
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = false; // soft delete
    await user.save();

    res.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// -------------------------
// GET user avatar by ID
// -------------------------
exports.getUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar || !user.avatar.data) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.contentType(user.avatar.contentType);
    res.send(user.avatar.data);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ message: "Error fetching image", error: err.message });
  }
};
