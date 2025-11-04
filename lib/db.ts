/**
 * Database utility functions
 */
import mongoose from 'mongoose';
import { dbConnect } from './mongoose';
import { User, Session, IUser } from '../models/User';
import clientPromise from './mongodb';
import { ProblemCompletion, CourseProgress } from '../models/Progress';
import Problem  from '../models/Problem';

// User Operations
export async function createUser(userData: Partial<IUser>) {
  await dbConnect();
  const user = new User(userData);
  await user.save();
  return user.toObject();
}

export async function getUserById(userId: string) {
  await dbConnect();
  const user = await User.findById(userId).lean();
  return user;
}

export async function getUserByEmail(email: string): Promise<any> {
  await dbConnect();
  const user = await User.findOne({ email }).lean();
  return user;
}

// Function to update user profile data
export async function updateUser(email: string, updateData: Partial<IUser>) {
  await dbConnect();
  
  // Don't allow email updates through this function for security
  if (updateData.email) {
    delete updateData.email;
  }
  
  const result = await User.findOneAndUpdate(
    { email },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true, runValidators: true }
  ).lean();
  
  // Also sync to NextAuth users collection if using separate collections
  // This is only needed if you're storing users in multiple collections
  try {
    const client = await clientPromise;
    const db = client.db();
    await db.collection('users').updateOne(
      { email },
      { $set: { name: updateData.name, image: updateData.image } }
    );
  } catch (error) {
    console.error('Failed to sync user to NextAuth collection:', error);
    // Don't fail the request if this fails - it's just a sync
  }

  return result;
}

// Function to sync a user from NextAuth to Mongoose model
export async function syncUserFromNextAuth(email: string) {
  await dbConnect();
  
  // Check if user already exists in Mongoose
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    return existingUser;
  }
  
  // If not, fetch from NextAuth users collection
  const client = await clientPromise;
  const db = client.db();
  
  const nextAuthUser = await db.collection('users').findOne({ email });
  
  if (!nextAuthUser) {
    console.log('User not found in NextAuth collection either');
    return null;
  }
  
  // Create user in Mongoose
  const newUser = new User({
    name: nextAuthUser.name,
    email: nextAuthUser.email,
    image: nextAuthUser.image,
    emailVerified: nextAuthUser.emailVerified,
    createdAt: nextAuthUser.createdAt || new Date(),
    updatedAt: nextAuthUser.updatedAt || new Date()
  });
  
  await newUser.save();
  console.log('Synced user from NextAuth to Mongoose model');
  
  return newUser.toObject();
}

// Session Operations
export async function getSession(sessionToken: string) {
  await dbConnect();
  return Session.findOne({ sessionToken });
}

export async function updateSession(sessionToken: string, updates: any) {
  await dbConnect();
  
  await Session.updateOne(
    { sessionToken },
    { $set: updates }
  );
}

// Get user's progress for a specific course
export async function getCourseProgress(userId: string, courseId: string) {
  await dbConnect();
  
  const progress = await CourseProgress.findOne({ 
    userId: new mongoose.Types.ObjectId(userId), 
    courseId 
  }).lean();
  
  if (!progress) {
    // Create initial progress record if none exists
    const newProgress = new CourseProgress({
      userId: new mongoose.Types.ObjectId(userId),
      courseId,
      totalProblems: 30, // Default value, can be made dynamic
      completedProblems: 0,
      overallProgress: 0,
      lastUpdated: new Date()
    });
    
    await newProgress.save();
    return newProgress.toObject();
  }
  
  return progress;
}

// Get user's progress for all courses
export async function getAllCourseProgress(userId: string) {
  await dbConnect();
  
  const progress = await CourseProgress.find({ 
    userId: new mongoose.Types.ObjectId(userId) 
  }).lean();
  
  return progress;
}

// Get the completion status for a specific problem
export async function getProblemCompletionStatus(userId: string, courseId: string, problemId: number) {
  await dbConnect();
  
  const completion = await ProblemCompletion.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    courseId,
    problemId
  }).lean();
  
  return completion || { completed: false };
}

// Get all problem completions for a course
export async function getAllProblemCompletions(userId: string, courseId: string) {
  await dbConnect();
  
  const completions = await ProblemCompletion.find({
    userId: new mongoose.Types.ObjectId(userId),
    courseId
  }).lean();
  
  return completions;
}

// Mark a problem as completed
export async function markProblemCompleted(userId: string, courseId: string, problemId: number, solution?: string) {
  await dbConnect();
  
  // Update or create problem completion
  const completion = await ProblemCompletion.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(userId),
      courseId,
      problemId
    },
    {
      $set: {
        completed: true,
        solution,
        completedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
  
  // Count completed problems
  const completedCount = await ProblemCompletion.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    courseId,
    completed: true
  });
  
  // Update course progress
  const progress = await CourseProgress.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(userId),
      courseId
    },
    {
      $set: {
        completedProblems: completedCount,
        overallProgress: Math.round((completedCount / 30) * 100), // Assuming 30 problems
        lastProblemId: problemId,
        lastUpdated: new Date()
      }
    },
    { upsert: true, new: true }
  );
  
  return { completion, progress };
}

// Get problem details by ID and course
export async function getProblemDetails(courseId: string, problemId: number) {
  await dbConnect();
  
  const problem = await Problem.findOne({
    courseId,
    problemId
  }).lean();
  
  return problem;
}

// Get all problems for a course
export async function getCourseProblems(courseId: string) {
  await dbConnect();
  
  const problems = await Problem.find({
    courseId
  }).sort({ problemId: 1 }).lean();
  
  return problems;
} 