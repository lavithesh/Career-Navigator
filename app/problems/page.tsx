'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CheckCircle } from 'lucide-react';

// Add this interface to define the Problem type
interface Problem {
  problemId: number;
  title?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

function ProblemsPageContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course') || 'javascript';
  const { data: session, status } = useSession();
  
  // Update this to include the type
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedProblems, setCompletedProblems] = useState<Record<string, boolean>>({});

  // Fetch problem list
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/problems/${courseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch problems');
        }
        
        const data = await response.json();
        setProblems(data.problems || []);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProblems();
  }, [courseId]);

  // Fetch user's progress if authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const fetchProgress = async () => {
        try {
          const response = await fetch(`/api/progress/${courseId}`);
          if (response.ok) {
            const data = await response.json();
            setCompletedProblems(data.problemCompletions || {});
          }
        } catch (error) {
          console.error('Error fetching progress:', error);
        }
      };
      
      fetchProgress();
    }
  }, [courseId, session, status]);

  return (
    <div className="container mx-auto py-8">
       <div className="px-4 flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Problems</h1>
      <Link href="/learn">
        <Button variant="outline">Back to Courses</Button>
      </Link>
    </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {problems.map((problem) => (
            <Link 
              key={problem.problemId} 
              href={`/problems/${problem.problemId}?course=${courseId}`}
            >
             <div className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors h-[170px] flex flex-col justify-between">

                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Problem {problem.problemId}</h3>
                  {completedProblems[problem.problemId.toString()] && (
                    <CheckCircle className="text-green-500 h-5 w-5" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {problem.title}
                  </span>
                  {problem.difficulty && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.difficulty}
                    </span>
                  )}
                </div>
                <Button 
                  variant="default"
                  className="w-full mt-2"
                >
                  Solve
                </Button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense>
      <ProblemsPageContent />
    </Suspense>
  );
}