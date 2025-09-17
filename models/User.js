// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  // Osnovni podaci
  birthYear: Number,
  profession: String,
  city: String,
  phone: String,
  avatar: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
