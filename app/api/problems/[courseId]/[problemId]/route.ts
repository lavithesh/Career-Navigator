import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Problem from '@/models/Problem';
import mongoose from 'mongoose';

// Define interfaces for your problem structure
interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface ProblemDocument {
  _id: unknown;
  courseId: string;
  problemId: number | string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: TestCase[];
  hints?: string[];
  solution?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; problemId: string } }
) {
  try {
    await dbConnect();
    
    const { courseId, problemId } = params;
    console.log(`Fetching problem: courseId=${courseId}, problemId=${problemId}`);
    
    // First, check what course IDs exist in the database
    const uniqueCourseIds = await Problem.distinct('courseId');
    console.log('Available course IDs:', uniqueCourseIds);
    
    // Get a sample of problems to examine their structure
    const sampleProblems = await Problem.find().limit(2).lean();
    console.log('Sample problem structure:', JSON.stringify(sampleProblems, null, 2));
    
    // Check if courseId might be stored differently (case sensitivity, etc)
    const caseInsensitiveProblems = await Problem.find({ 
      courseId: { $regex: new RegExp(courseId, 'i') } 
    }).lean();
    console.log(`Problems matching course '${courseId}' with case insensitivity: ${caseInsensitiveProblems.length}`);
    
    if (caseInsensitiveProblems.length > 0) {
      console.log('First match courseId:', caseInsensitiveProblems[0].courseId);
    }
    
    // Continue with original logic
    const allProblems = await Problem.find().lean();
    console.log(`Total problems in database: ${allProblems.length}`);
    
    if (allProblems.length === 0) {
      console.log('No problems found in database! Check seeding process.');
      return NextResponse.json(
        { error: 'No problems found in database' },
        { status: 404 }
      );
    }
    
    // Let's try to find all problems for this course
    const courseProblems = await Problem.find({ courseId }).lean();
    console.log(`Problems for course ${courseId}: ${courseProblems.length}`);
    
    // Now try to find the specific problem
    const problem = await Problem.findOne({ 
      courseId, 
      problemId: problemId
    }).lean() as ProblemDocument | null;
    
    if (!problem) {
      console.log(`Problem not found: courseId=${courseId}, problemId=${problemId}`);
      
      // Try to find if problemId exists but under different courseId
      const problemWithIdOnly = await Problem.findOne({ problemId }).lean() as ProblemDocument | null;
      if (problemWithIdOnly) {
        console.log(`A problem with ID ${problemId} was found but under course: ${problemWithIdOnly.courseId}`);
      }
      
      return NextResponse.json(
        { error: 'Problem not found', availableCourseIds: uniqueCourseIds },
        { status: 404 }
      );
    }
    
    console.log(`Problem found: ${problem.title}`);
    
    // Don't send test cases with hidden flag and solutions to the client
    const sanitizedProblem = {
      ...problem,
      testCases: problem.testCases?.filter(tc => !tc.isHidden) || [],
      solution: undefined
    };
    
    return NextResponse.json(sanitizedProblem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problem', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}