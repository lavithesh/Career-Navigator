require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Connecting to MongoDB with Mongoose...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB,
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    
    console.log('Connected successfully to MongoDB!');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('Connection closed.');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

testConnection(); 