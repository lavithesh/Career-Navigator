require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    console.log('Connected successfully to MongoDB!');
    
    const db = client.db(process.env.MONGODB_DB);
    console.log('Database:', process.env.MONGODB_DB);
    
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('Connection closed.');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

testConnection(); 