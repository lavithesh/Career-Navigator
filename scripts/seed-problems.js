require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Problem = require('../models/Problem');

// Load environment variables
process.env.MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://likithnirvan08:u1bBVqGL6PfbdNQW@cluster0.u39v8.mongodb.net/codecraft?retryWrites=true&w=majority&tls=true';

console.log('🔍 Environment Variables Loaded:', Object.keys(process.env).length);
console.log(
  '🛢️ MongoDB URI:',
  process.env.MONGODB_URI ? 'Found (Hidden for security)' : 'Not found'
);

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('❌ MONGODB_URI not found in .env');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
}

// Seed problems into the database using Upsert (Update existing + Insert new)
async function seedProblems() {
  try {
    await connectToDatabase();

    const dataPath = path.join(process.cwd(), 'data');
    console.log('📂 Looking for JSON files in:', dataPath);

    const files = await fs.readdir(dataPath);
    const jsonFiles = files.filter((file) => file.endsWith('-problems.json'));

    console.log('📜 Found JSON files:', jsonFiles);

    if (jsonFiles.length === 0) {
      console.log('⚠️ No problem data files found in the "data" directory.');
      process.exit(1);
    }

    for (const file of jsonFiles) {
      console.log(`📌 Processing ${file}...`);

      const filePath = path.join(dataPath, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const problems = JSON.parse(fileContent);

      const courseId = file.replace('-problems.json', '');
      console.log(`🔄 Seeding ${problems.length} problems for course: ${courseId}...`);

      // ✅ **Upsert Update (Modify existing + Add new problems)**
      for (const problem of problems) {
        await Problem.updateOne(
          { courseId, problemId: problem.problemId }, // Find by courseId and problemId
          { $set: { ...problem, courseId } }, // Update fields
          { upsert: true } // Insert if not found
        );
        console.log(`✅ Updated/Inserted: ${problem.title}`);
      }

      console.log(`🎯 Completed updates for course: ${courseId}`);
    }

    // Verify inserted data
    await verifySeeding();

    console.log('🎉 Database seeding complete!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Verify inserted problems
async function verifySeeding() {
  try {
    const courses = await Problem.distinct('courseId');
    console.log('📚 Available courses:', courses);

    for (const course of courses) {
      const count = await Problem.countDocuments({ courseId: course });
      console.log(`📊 Course ${course}: ${count} problems`);

      const problems = await Problem.find({ courseId: course })
        .select('problemId title')
        .sort({ problemId: 1 });

      console.log(`📖 Problems for ${course}:`);
      problems.forEach((p) => console.log(`  📌 ${p.problemId}: ${p.title}`));
    }
  } catch (error) {
    console.error('❌ Error verifying seeded data:', error);
  }
}

// Run the seeding function
seedProblems();
