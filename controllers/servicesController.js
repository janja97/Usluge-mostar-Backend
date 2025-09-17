const Service = require('../models/Service');

// Dodavanje usluga
exports.addServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { services } = req.body;

    if (!services || !Array.isArray(services)) {
      return res.status(400).json({ message: 'Lista usluga nije ispravna' });
    }

    const createdServices = await Service.insertMany(
      services.map(s => ({ ...s, user: userId }))
    );

    res.json({ message: 'Usluge spremljene', services: createdServices });
  } catch (err) {
    console.error('Greška kod spremanja usluga:', err);
    res.status(500).json({ message: 'Greška servera' });
  }
};

// Dohvaćanje svih usluga
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('user', 'fullName city');
    res.json(services);
  } catch (err) {
    console.error('Greška kod dohvaćanja usluga:', err);
    res.status(500).json({ message: 'Greška servera' });
  }
};
