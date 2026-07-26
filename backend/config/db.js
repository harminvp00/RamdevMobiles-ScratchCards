const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      mongoUri = mongoUri.replace(/^["']|["']$/g, '');
    } else {
      mongoUri = "mongodb://127.0.0.1:27017/lucky_scratch";
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed campaign settings and cards if database is empty
    const seedDatabase = require('../scripts/seed');
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
