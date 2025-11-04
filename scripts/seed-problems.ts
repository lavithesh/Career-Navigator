import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import Problem from '../models/Problem';

// Load environment variables
dotenv.config();

// Define the problem structure
interface ProblemSeed {
  problemId: number;
  courseId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
  hints: string[];
  solution?: string;
  tags: string[];
}

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is not defined in .env file');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
}

// Function to seed problems into the database
async function seedProblems() {
  try {
    await connectToDatabase();

    const dataPath = path.join(process.cwd(), 'data');
    const files = await fs.readdir(dataPath);
    const jsonFiles = files.filter((file: string) => file.endsWith('-problems.json'));

    if (jsonFiles.length === 0) {
      console.log('⚠️ No problem data files found. Please add JSON files in the "data" directory.');
      process.exit(1);
    }

    for (const file of jsonFiles) {
      console.log(`📂 Processing ${file}...`);

      const filePath = path.join(dataPath, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const problems = JSON.parse(fileContent) as ProblemSeed[];

      const courseId = file.replace('-problems.json', '');
      console.log(`📌 Seeding ${problems.length} problems for course: ${courseId}...`);

      // ✅ **Option 2: Upsert Update (Modify existing + Add new problems)**
      for (const problem of problems) {
        await Problem.updateOne(
          { courseId, problemId: problem.problemId }, // Find by courseId and problemId
          { $set: { ...problem, courseId } }, // Update fields
          { upsert: true } // Insert if not found
        );
        console.log(`🔄 Updated/Inserted: ${problem.title}`);
      }

      console.log(`✅ Completed updates for course: ${courseId}`);
    }

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedProblems();
