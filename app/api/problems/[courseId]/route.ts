import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Problem from '@/models/Problem';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log(`Connecting to database...`);
    await dbConnect();
    console.log(`Connected to database. Fetching problems for course: ${params.courseId}`);
    
    const { courseId } = params;
    
    // Check if any problems exist
    const count = await Problem.countDocuments();
    console.log(`Total problems in database: ${count}`);
    
    const problems = await Problem.find({ courseId })
      .select('problemId title difficulty tags')
      .sort({ problemId: 1 })
      .lean();
    
    console.log(`Found ${problems.length} problems for course ${courseId}`);

    if (!problems || problems.length === 0) {
      return NextResponse.json(
        { problems: [] },
        { status: 200 }
      );
    }
    
    // Transform the problems to include better titles if needed
    const transformedProblems = problems.map(problem => {
      // If a problem doesn't have a proper title, you could look it up from your JSON files
      return {
        ...problem,
        title: problem.title || "Descriptive Title Here" // Replace with actual title from your data
      };
    });

    return NextResponse.json({ problems: transformedProblems });
  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problems', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 