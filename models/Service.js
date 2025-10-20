const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  customService: { type: String },
  priceType: { type: String },
  price: { type: Number },
  city: { type: String },
  description: { type: String, maxlength: 200 },
  mode: { type: String, enum: ['offer', 'demand'], required: true }, 
  images: [{ type: String }], 
  mainImg: { type: Number }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);
