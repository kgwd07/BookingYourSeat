// File: lib/mongodb.js
// MongoDB connection utility

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-booking';
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  console.warn('No MongoDB URI provided, using local MongoDB');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;