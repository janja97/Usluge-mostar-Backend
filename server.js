const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Rute
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const serviceRoutes = require('./routes/services');
const favoritesRoutes = require('./routes/favorites'); // <-- dodano

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// **Serviraj uploads folder statički**
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// API rute
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/favorites', favoritesRoutes); // <-- dodano

// Test route
app.get('/', (req, res) => res.send('API is running'));

// Port
const PORT = process.env.PORT || 5000;

// Mongo konekcija
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
