import { NextResponse } from 'next/server';
import { getProblemDetails } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string; problemId: string } }
) {
  try {
    const { courseId, problemId } = params;
    
    const problem = await getProblemDetails(courseId, parseInt(problemId));
    
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problem details' },
      { status: 500 }
    );
  }
}
