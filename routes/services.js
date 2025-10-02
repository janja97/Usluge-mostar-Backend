const express = require('express');
const Service = require('../models/Service');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// ------------------ CREATE ------------------
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { category, subcategory, customService, priceType, price, description, city, workingDays, workingHours } = req.body;

    if (!category) return res.status(400).json({ message: 'Kategorija je obavezna' });

    if (description) {
      const wordCount = description.trim().split(/\s+/).length;
      if (wordCount > 200) return res.status(400).json({ message: 'Opis ne smije prelaziti 200 riječi' });
    }

    const newService = new Service({
      user: userId,
      category,
      subcategory: subcategory || null,
      customService: customService || '',
      priceType: priceType || '',
      price: price !== undefined ? price : null,
      description: description || '',
      city: city || '',
      workingDays: workingDays || [],
      workingHours: workingHours || { from: '', to: '' }
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (err) {
    console.error('❌ Greška kod dodavanja usluge:', err);
    res.status(500).json({ message: err.message || 'Greška servera' });
  }
});

// ------------------ READ MY ------------------
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const services = await Service.find({ user: req.userId }).populate('user', 'fullName');
    res.json(services);
  } catch (err) {
    console.error('❌ Greška kod dohvata mojih usluga:', err);
    res.status(500).json({ message: 'Greška servera' });
  }
});

// ------------------ READ ALL ------------------
router.get('/', async (req, res) => {  // Promijenjeno iz '/services' u '/' kako bi ruta bila /api/services
  try {
    const services = await Service.find().populate('user', 'fullName');
    res.json(services);
  } catch (err) {
    console.error('❌ Greška kod dohvata svih usluga:', err);
    res.status(500).json({ message: 'Greška servera' });
  }
});

// ------------------ FILTER ------------------
router.get('/filter', async (req, res) => {
  try {

    const { category, subcategory, customService, priceType, minPrice, maxPrice, city } = req.query
    const filter = {}

    if (category) filter.category = category
    if (subcategory) filter.subcategory = subcategory
    if (customService) filter.customService = customService
    if (priceType) filter.priceType = priceType
    if (city) filter.city = city
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }


    const services = await Service.find(filter).populate('user', 'fullName')

    res.json(services)
  } catch (err) {
    console.error('❌ Greška kod filtriranja usluga:', err)
    res.status(500).json({ message: 'Greška servera' })
  }
})

// ---------------- READ service by ID ----------
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('user', 'fullName email');
    if (!service) {
      return res.status(404).json({ message: 'Usluga nije pronađena' });
    }
    res.json(service);
  } catch (err) {
    console.error('❌ Greška kod dohvata usluge po ID-u:', err);
    res.status(500).json({ message: 'Greška servera' });
  }
});
// ------------------ UPDATE ------------------
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOne({ _id: id, user: req.userId });
    if (!service) return res.status(404).json({ message: 'Usluga nije pronađena' });

    const { category, subcategory, customService, priceType, price, description, city, workingDays, workingHours } = req.body;

    if (description) {
      const wordCount = description.trim().split(/\s+/).length;
      if (wordCount > 200) return res.status(400).json({ message: 'Opis ne smije prelaziti 200 riječi' });
    }

    service.category = category || service.category;
    service.subcategory = subcategory || service.subcategory;
    service.customService = customService || service.customService;
    service.priceType = priceType || service.priceType;
    service.price = price !== undefined ? price : service.price;
    service.description = description || service.description;
    service.city = city || service.city;
    service.workingDays = workingDays || service.workingDays;
    service.workingHours = workingHours || service.workingHours;

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (err) {
    console.error('❌ Greška kod editiranja usluge:', err);
    res.status(500).json({ message: 'Greška servera' });
  }
});

// ------------------ DELETE ------------------
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOneAndDelete({ _id: id, user: req.userId });
    if (!service) return res.status(404).json({ message: 'Usluga nije pronađena' });

    res.json({ message: 'Usluga obrisana' });
  } catch (err) {
    console.error('❌ Greška kod brisanja usluge:', err);
    res.status(500).json({ message: 'Greška servera' });
  }
});




module.exports = router;