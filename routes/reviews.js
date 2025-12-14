const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// 🔹 POST - dodaj novi review (NO CHANGES)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { reviewedUser, rating, comment } = req.body;

    if (!reviewedUser || !rating) {
      return res.status(400).json({ message: "Nedostaju potrebni podaci." });
    }

    // spriječi da korisnik ocijeni sam sebe
    if (req.userId === reviewedUser) {
      return res.status(400).json({ message: "Ne možete ocijeniti sami sebe." });
    }

    const review = new Review({
      reviewer: req.userId,
      reviewedUser,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({ message: "Recenzija spremljena.", review });
  } catch (err) {
    console.error("❌ Greška pri spremanju recenzije:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
});

// 🔹 GET - sve recenzije za određenog korisnika (NO CHANGES)
router.get("/user/:id", async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUser: req.params.id })
      .populate("reviewer", "fullName email")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("❌ Greška pri dohvaćanju recenzija:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
});


router.get("/user/:id/summary", async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Nađi sve reviewe
    const reviews = await Review.find({ reviewedUser: userId })
      .populate("reviewer", "fullName email")
      .sort({ createdAt: -1 });

    // 2. Ako nema recenzija
    if (reviews.length === 0) {
      return res.json({
        // Ovdje reviews može biti izostavljen ako je cilj samo sažetak
        averageRating: 0,
        totalReviews: 0 // Ključ usklađen s front-endom
      });
    }

    // 3. Izračun prosjeka
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / reviews.length;

    res.json({
      // Nema potrebe slati cijelu listu recenzija ako front-end traži samo sažetak
      // reviews, 
      totalReviews: reviews.length, // Ispravljen ključ!
      averageRating: Number(avg.toFixed(1)) // npr. 4.3
    });

  } catch (err) {
    console.error("❌ Greška pri dohvaćanju recenzija:", err);
    res.status(500).json({ message: "Greška na serveru." });
  }
});


module.exports = router;