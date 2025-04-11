// File: scripts/init-db.js
// This script initializes the database with empty seats
// You can run this script using: node scripts/init-db.js

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-booking';

async function initDatabase() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if seats collection exists and has data
    const seatsCount = await db.collection('seats').countDocuments();
    
    if (seatsCount === 0) {
      // Initialize seats
      const seatsData = Array(80).fill(null).map((_, index) => ({
        id: index + 1,
        booked: false,
        bookedBy: null,
        bookingTime: null
      }));
      
      await db.collection('seats').insertMany(seatsData);
      console.log('Initialized 80 seats');
    } else {
      console.log(`Seats collection already contains ${seatsCount} seats`);
    }
    
    await client.close();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDatabase();