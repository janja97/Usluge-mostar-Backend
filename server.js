// server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
