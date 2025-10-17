const mongoose = require('mongoose');

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

  // 🔹 avatar slika pohranjena kao binarni sadržaj
  avatar: {
    data: Buffer,
    contentType: String
  },

  isActive: { type: Boolean, default: true },

  favorites: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
