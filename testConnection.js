require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI); 
        
        // Zastarjele opcije { useNewUrlParser: true, useUnifiedTopology: true } su UKLONJENE.
        // Mongoose 6+ ih automatski koristi.
        
        console.log('✅ MongoDB connected');
        
        // PAŽNJA: Uklonjena je linija process.exit(0);
        // Da bi server radio, konekcija mora ostati aktivna.

    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        
        // Izlaz iz procesa s greškom ako konekcija ne uspije
        process.exit(1);
    }
};

// Ako ovu datoteku koristite samo za inicijalizaciju konekcije:
module.exports = connectDB;

// Ako je ovo bio cijeli testni script, i dalje trebate pozvati funkciju:
// connectDB();