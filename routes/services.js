const express = require('express');
const Service = require('../models/Service');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage(); // images are stored in buffer
const upload = multer({ storage, limits: { fileSize: 1024 * 1024 } }); // max 1MB per image

// ------------------ CREATE ------------------
router.post('/', authMiddleware, upload.array('images', 10), async (req,res) => {
  try {
    const userId = req.userId;
    const { category, subcategory, customService, priceType, price, description, county, city, mode, mainImg } = req.body;

    let images = [];
    if(req.files && req.files.length>0){
      images = req.files.map(f => f.buffer.toString('base64'));
    }

    const newService = new Service({
      user: userId,
      category,
      subcategory: subcategory || null,
      customService: customService || '',
      priceType: priceType || '',
      price: price !== undefined ? price : null,
      description: description || '',
      county: county || '', // ✅
      city: city || '',
      mode,
      images,
      mainImg: Number(mainImg)
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (err) {
    console.error('❌ Error adding service:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ------------------ READ MY ------------------
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const services = await Service.find({ user: req.userId }).populate('user', 'fullName');
    res.json(services);
  } catch (err) {
    console.error('❌ Error fetching my services:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------ READ ALL ------------------
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().populate('user', 'fullName');
    res.json(services);
  } catch (err) {
    console.error('❌ Error fetching all services:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------ FILTER ------------------
router.get('/filter', async (req, res) => {
  try {
    const { category, subcategory, customService, priceType, minPrice, maxPrice, county, city, mode } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (customService) filter.customService = customService;
    if (priceType) filter.priceType = priceType;
    if (county) filter.county = county;
    if (city) filter.city = city;
    if (mode && ['offer','demand'].includes(mode)) filter.mode = mode; // filter by mode

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(filter).populate('user', 'fullName');
    res.json(services);
  } catch (err) {
    console.error('❌ Error filtering services:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- READ service by ID ----------
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('user', 'fullName email');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    console.error('❌ Error fetching service by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /services/user/:id  -> fetch all services of a user
router.get('/user/:id', async (req, res) => {
  try {
    const services = await Service.find({ user: req.params.id }).populate('user', 'fullName email');
    res.json(services);
  } catch (err) {
    console.error('❌ Error fetching services by user ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------ UPDATE ------------------
router.put('/:id', authMiddleware, upload.array('images'), async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOne({ _id: id, user: req.userId });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    console.log('REQ.BODY:', req.body);      // debug log
    console.log('REQ.FILES:', req.files);    // debug log

    const {
      category,
      subcategory,
      customService,
      priceType,
      price,
      description,
      county,
      city,
      workingDays,
      workingHours,
      mode,
      mainImg,
      removeImages
    } = req.body;

    // --- Remove images ---
    if (removeImages) {
      const indicesToRemove = Array.isArray(removeImages)
        ? removeImages.map(Number)
        : [Number(removeImages)];
      service.images = service.images.filter((_, idx) => !indicesToRemove.includes(idx));

      if (service.mainImg !== undefined && indicesToRemove.includes(service.mainImg)) {
        service.mainImg = service.images.length ? 0 : null;
      }
    }

    // --- Add new images ---
    if (req.files && req.files.length > 0) {
      const sharp = require('sharp');
      const newImages = await Promise.all(req.files.map(async file => {
        const resized = await sharp(file.buffer)
          .rotate() // automatically rotate according to EXIF
          .resize({ width: 800, height: 800, fit: 'inside' })
          .jpeg({ quality: 70 })
          .toBuffer();
        return resized.toString('base64');
      }));
      service.images = [...service.images, ...newImages];
    }

    // --- Update other fields ---
    service.category = category || service.category;
    service.subcategory = subcategory || service.subcategory;
    service.customService = customService || service.customService;
    service.priceType = priceType || service.priceType;
    service.price = price !== undefined ? Number(price) : service.price;
    service.description = description || service.description;
    service.county = county || service.county;
    service.city = city || service.city;
    service.workingDays = workingDays || service.workingDays;
    service.workingHours = workingHours || service.workingHours;
    service.mode = mode && ['offer','demand'].includes(mode) ? mode : service.mode;
    service.mainImg = mainImg !== undefined ? Number(mainImg) : service.mainImg;

    const updatedService = await service.save();
    res.json(updatedService);

  } catch (err) {
    console.error('❌ Error updating service:', err);
    res.status(500).json({ message: 'Server error', err: err.message });
  }
});

// ------------------ DELETE ------------------
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOneAndDelete({ _id: id, user: req.userId });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('❌ Error deleting service:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
