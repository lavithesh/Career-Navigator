import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, withDbConnection } from '@/lib/mongoose';
import Progress from '@/models/Progress';
import Problem from '@/models/Problem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // First establish the database connection
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { courseId } = params;
    const userId = session.user.id;
    
    console.log(`Fetching progress for user ${userId} in course ${courseId}`);
    
    // Wrap database operations in withDbConnection
    return await withDbConnection(async () => {
      // Get total number of problems for this course
      const totalProblems = await Problem.countDocuments({ courseId });
      console.log(`Total problems for ${courseId}: ${totalProblems}`);
      
      // Find progress entry
      let progress = await Progress.findOne({ userId, courseId }).lean();
      
      if (!progress) {
        console.log(`No progress found, creating new entry for ${userId} in ${courseId}`);
        progress = await Progress.create({
          userId,
          courseId,
          problemCompletions: {},
          lastAccessedAt: new Date()
        });
      } else {
        // Update last accessed time
        await Progress.findOneAndUpdate(
          { userId, courseId },
          { $set: { lastAccessedAt: new Date() } }
        );
      }
      
      // Calculate progress percentage
      const completedProblems = progress.problemCompletions ? 
        Object.keys(progress.problemCompletions).length : 0;
      
      const progressPercentage = totalProblems > 0 ? 
        Math.round((completedProblems / totalProblems) * 100) : 0;
      
      console.log(`Progress for ${userId} in ${courseId}: ${completedProblems}/${totalProblems} (${progressPercentage}%)`);
      
      return NextResponse.json({
        courseId,
        problemCompletions: progress.problemCompletions || {},
        completedProblems,
        totalProblems,
        overallProgress: progressPercentage,
        lastAccessedAt: progress.lastAccessedAt
      });
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
