require('dotenv').config();

// Hardcode the connection string if environment variable isn't loaded
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://likithnirvan08:u1bBVqGL6PfbdNQW@cluster0.u39v8.mongodb.net/codecraft?retryWrites=true&w=majority&tls=true";

const mongoose = require('mongoose');

// Log to check if .env is being loaded
console.log('Environment variables loaded:', Object.keys(process.env).length);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found (not showing for security)' : 'Not found');

async function simpleSeed() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // Define a simple schema
    const ProblemSchema = new mongoose.Schema({
      problemId: Number,
      courseId: String,
      title: String,
      difficulty: String,
      description: String
    });
    
    // Create the model
    const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema, 'problems');
    
    // Clear existing data
    console.log('Clearing existing problems...');
    await Problem.deleteMany({});
    
    // Insert a test problem
    console.log('Inserting test problem...');
    await Problem.create({
      problemId: 1,
      courseId: 'javascript',
      title: 'Test Problem',
      difficulty: 'Easy',
      description: 'This is a test problem'
    });
    
    // Verify the problem was created
    const count = await Problem.countDocuments();
    console.log(`Problems in database: ${count}`);
    
    const problems = await Problem.find();
    console.log('Problems:', problems);
    
    console.log('Simple seeding complete!');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error during simple seeding:', error);
  }
}

// Run the seeding function properly
simpleSeed(); 