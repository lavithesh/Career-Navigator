import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Progress from '@/models/Progress';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; problemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { courseId, problemId } = params;
    const userId = session.user.id;
    
    const body = await request.json();
    const { solution } = body;
    
    // Update progress entry with completion info
    await Progress.findOneAndUpdate(
      { userId, courseId },
      { 
        $set: { 
          [`problemCompletions.${problemId}`]: {
            completedAt: new Date(),
            solution
          },
          lastAccessedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
