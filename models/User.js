const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  birthYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  profession: { type: String, maxlength: 100 },
  city: { type: String, maxlength: 100 },
  phone: { type: String, maxlength: 20, match: /^[0-9+\-\s]*$/ },
  about: { type: String, maxlength: 500 },

  avatar: {
    data: Buffer,
    contentType: String
  },

  isActive: { type: Boolean, default: true },

  favorites: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }
  ],

  // 🔹 Novi dio – recenzije korisnika
  reviews: [reviewSchema],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
