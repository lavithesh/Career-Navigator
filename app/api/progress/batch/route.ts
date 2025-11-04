import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Progress from '@/models/Progress';
import Problem from '@/models/Problem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database once
    await dbConnect();
    
    const { courseIds } = await request.json();
    const userId = session.user.id;
    
    console.log(`Batch fetching progress for user ${userId} for courses:`, courseIds);
    
    // Fetch all course problems in a single query
    const problemCounts = await Problem.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: '$courseId', count: { $sum: 1 } } }
    ]);
    
    // Build a map of course ID to problem count
    const problemCountMap = {};
    problemCounts.forEach(item => {
      problemCountMap[item._id] = item.count;
    });
    
    // Fetch all progress entries in a single query
    const progressEntries = await Progress.find({ 
      userId, 
      courseId: { $in: courseIds } 
    }).lean();
    
    // Build a map of course ID to progress
    const progressMap = {};
    
    // Initialize all requested courses with default values
    courseIds.forEach(courseId => {
      const totalProblems = problemCountMap[courseId] || 0;
      progressMap[courseId] = {
        percentage: 0,
        completedProblems: 0,
        totalProblems
      };
    });
    
    // Update with actual progress where available
    progressEntries.forEach(entry => {
      const courseId = entry.courseId;
      const totalProblems = problemCountMap[courseId] || 0;
      
      // Get completed problems
      const completedProblems = entry.problemCompletions ? 
        Object.keys(entry.problemCompletions).length : 0;
      
      // Calculate percentage
      const percentage = totalProblems > 0 ? 
        Math.round((completedProblems / totalProblems) * 100) : 0;
      
      // Find the last accessed problem
      let lastAccessedProblemId = 1; // Default to first problem
      
      // If there are completed problems, find the highest one
      if (completedProblems > 0) {
        const problemIds = Object.keys(entry.problemCompletions).map(id => parseInt(id));
        if (problemIds.length > 0) {
          lastAccessedProblemId = Math.max(...problemIds) + 1; // Go to next problem after highest completed
          
          // Make sure we don't exceed the total problems
          if (lastAccessedProblemId > totalProblems) {
            lastAccessedProblemId = totalProblems;
          }
        }
      }
      
      // Add to progress map
      progressMap[courseId] = {
        percentage,
        completedProblems,
        totalProblems,
        lastAccessedProblemId
      };
      
      // Also update last accessed time in the background
      Progress.findOneAndUpdate(
        { userId, courseId },
        { $set: { lastAccessedAt: new Date() } }
      ).exec();
    });
    
    // Create missing progress entries in the background
    courseIds.forEach(courseId => {
      if (!progressEntries.some(p => p.courseId === courseId)) {
        Progress.create({
          userId,
          courseId,
          problemCompletions: {},
          lastAccessedAt: new Date()
        }).catch(err => {
          console.error(`Error creating progress entry for ${courseId}:`, err);
        });
      }
    });
    
    console.log('Batch progress response:', progressMap);
    
    return NextResponse.json({ progress: progressMap });
  } catch (error) {
    console.error('Error fetching batch progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
} 