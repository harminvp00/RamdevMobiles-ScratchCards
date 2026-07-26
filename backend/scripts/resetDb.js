require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../models/Card');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Admin = require('../models/Admin');
const RedemptionLog = require('../models/RedemptionLog');
const seedDatabase = require('./seed');

const resetDb = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lucky_scratch';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Remove all documents from all collections
    console.log('Clearing all collections...');
    await Card.deleteMany({});
    await User.collection.drop().catch(() => {});
    await Campaign.deleteMany({});
    await Admin.deleteMany({});
    await RedemptionLog.deleteMany({});
    console.log('✓ Cleared all data successfully.');

    // Seed the database with the new seed rules
    console.log('Running seeder...');
    await seedDatabase();

    console.log('✓ Reseeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDb();
