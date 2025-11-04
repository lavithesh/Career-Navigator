'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiAmazon, SiAirbnb, SiTcs, SiFacebook, SiAccenture, SiCisco, SiHcl, SiHp, SiGoogle, SiZoho, SiCognizant, SiInfosys, SiWipro, SiDell, SiIntel, SiGoldmansachs } from "react-icons/si";
import {  FaMicrosoft, FaCode } from "react-icons/fa";
import { IconType } from 'react-icons';


// Define proper types for the debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Define types for progress data
interface CourseProgress {
  percentage: number;
  completedProblems: number;
  totalProblems?: number;
  lastAccessedProblemId?: number;
}

interface ProgressMap {
  [courseId: string]: CourseProgress;
}

// Define course interface
interface Course {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  problemCount: number;
  color: string;
}

const IbmIcon = () => (
  <span style={{ fontWeight: "bold", fontSize: "0.5em", fontFamily: "Arial" }}>
    IBM
  </span>
);

const DeloitteIcon = () => (
  <span style={{ fontWeight: "bold", fontSize: "1.2em", fontFamily: "Arial", color: "black" }}>
    D<span style={{ color: "green" }}>•</span>
  </span>
);

const CapgeminiIcon = () => (
  <span style={{ fontWeight: "bold", fontSize: "0.8em", fontFamily: "cursive", color: "#0070AD" }}>
    Capgemini<span style={{ color: "#00AEEF", fontSize: "1.2em" }}>♠</span>
  </span>
);

const DSAIcon = () => (
  <span style={{ fontWeight: "bold", fontSize: "1.2em", fontFamily: "monospace", color: "black" }}>
    {"{/}"}
  </span>
);



// Define your courses once outside the component
const courses: Course[] = [
  {
    id: 'accenture',
    title: 'Accenture',
    description: 'Prepare for Accenture technology and consulting interviews.',
    icon: SiAccenture, // Best match for Accenture
    problemCount: 30,
    color: 'from-purple-700 to-purple-500' // Accenture's branding colors
  },
  {
    id: 'airbnb',
    title: 'Airbnb',
    description: 'Practice Airbnb interview questions and coding challenges.',
    icon: SiAirbnb,
    problemCount: 30,
    color: 'from-red-700 to-red-500'
  },
  {
    id: 'amazon',
    title: 'Amazon',
    description: 'Master Amazon interview preparation and problem solving.',
    icon: SiAmazon,
    problemCount: 30,
    color: 'from-blue-500 to-blue-300'
  },
  {
    id: 'basiccodingquestion',
    title: 'Basic Coding',
    description: 'Learn fundamental coding concepts and solve beginner-friendly problems.',
    icon: FaCode, // You can also try SiCodepen, SiVisualstudio, or FaCode
    problemCount: 30,
    color: 'from-green-400 to-green-300' // Friendly and beginner-oriented color
  },
  {
    id: "capgemini",
    title: "Capgemini",
    description: "Prepare for Capgemini coding assessments and technical interviews.",
    icon: CapgeminiIcon, 
    problemCount: 30,
    color: "from-white-700 to-white-500",
  },
  {
    id: 'cisco',
    title: 'Cisco',
    description: 'Prepare for Cisco networking and software engineering interviews.',
    icon: SiCisco, // Best match for Cisco (networking-related)
    problemCount: 30,
    color: 'from-blue-700 to-blue-500' // Cisco's branding colors
  },
  {
    id: 'cognizant',
    title: 'Cognizant',
    description: 'Prepare for Cognizant technology and software engineering interviews.',
    icon: SiCognizant, // Best match for Cognizant
    problemCount: 30,
    color: 'from-blue-500 to-blue-300' // Cognizant's branding colors
  },
  {
    id: 'dell',
    title: 'Dell',
    description: 'Prepare for Dell technical interviews and problem-solving challenges.',
    icon: SiDell, // Available in react-icons/si
    problemCount: 30,
    color: 'from-blue-900 to-blue-600' // Dell's branding colors
  },

  {
    id: "deloitte",
    title: "Deloitte",
    description: "Prepare for Deloitte technology and consulting interviews.",
    icon: DeloitteIcon, 
    problemCount: 30,
    color: "from-white-700 to-white-500",
  },
  
  {
    id: 'dsa',
    title: 'DSA',
    description: 'Learn and Master core Data Structures and Algorithms fundamentals.',
    icon: DSAIcon,  // Updated to SiCode for a better DSA representation
    problemCount: 30,
    color: 'from-white-500 to-white-300'
  },
  {
    id: 'facebook',
    title: 'Facebook',
    description: 'Prepare for Meta (Facebook) software engineering and system design interviews.',
    icon: SiFacebook, // Best match for Facebook
    problemCount: 30,
    color: 'from-blue-800 to-blue-600' // Facebook's branding colors
  },
  {
    id: 'goldmansachs',
    title: 'Goldman Sachs',
    description: 'Crack Goldman Sachs coding rounds and technical interviews.',
    icon: SiGoldmansachs, // Available in react-icons/si
    problemCount: 30,
    color: 'from-yellow-800 to-yellow-500' // Closest match to GS brand (black/gold)
  },
  {
    id: 'google',
    title: 'Google',
    description: 'Prepare for Google software engineering and system design interviews.',
    icon: SiGoogle, // Best match for Google
    problemCount: 30,
    color: 'from-orange-500 to-orange-500' // Google's branding colors
  },
  {
    id: 'hcltech',
    title: 'HCL',
    description: 'Get ready for HCL interview rounds with curated programming and system design problems.',
    icon: SiHcl, // Best match for HCL (also from 'react-icons/si')
    problemCount: 30,
    color: 'from-blue-800 to-blue-800' // HCL's brand tone
  },
  {
    id: 'hp',
    title: 'HP',
    description: 'Practice software engineering and technical interviews with HP-specific challenges.',
    icon: SiHp, // Best match for HP (requires 'react-icons/si')
    problemCount: 30,
    color: 'from-blue-700 to-blue-700' // HP's typical branding color
  },
  {
    id: "ibm",
    title: "IBM",
    description: "Prepare for IBM technical interviews and problem-solving assessments.",
    icon: IbmIcon, 
    problemCount: 30,
    color: "from-blue-700 to-blue-500",
  },
  {
    id: 'infosys',
    title: 'Infosys',
    description: 'Prepare for Infosys coding assessments and software engineering interviews.',
    icon: SiInfosys, // Best match for Infosys
    problemCount: 30,
    color: 'from-blue-500 to-blue-300' // Infosys' branding colors
  },
  {
    id: 'intel',
    title: 'Intel',
    description: 'Prepare for Intel software and hardware engineering interviews.',
    icon: SiIntel, // Available in react-icons/si
    problemCount: 30,
    color: 'from-blue-800 to-blue-500' // Intel's branding colors
  },
  {
    id: 'microsoft',
    title: 'Microsoft',
    description: 'Prepare for Microsoft software engineering and system design interviews.',
    icon: FaMicrosoft, // Best match from react-icons/si
    problemCount: 30,
    color: 'from-blue-600 to-blue-400' // Microsoft's branding colors
  },
  {
    id: 'tcs',
    title: 'TCS',
    description: 'Prepare for TCS coding assessments and technical interviews.',
    icon: SiTcs,
    problemCount: 30,
    color: 'from-blue-600 to-blue-400'
  },
  {
    id: 'wipro',
    title: 'Wipro',
    description: 'Prepare for Wipro technical interviews and coding challenges.',
    icon: SiWipro, 
    problemCount: 30,
    color: 'from-blue-600 to-blue-400' // Wipro's branding colors
  },
  {
    id: 'zoho',
    title: 'Zoho',
    description: 'Prepare for Zoho software engineering and coding interviews.',
    icon: SiZoho, // Best match for Zoho
    problemCount: 30,
    color: 'from-yellow-300 to-yellow-300'
  },


];



export default function LearnPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [isDataFetched, setIsDataFetched] = useState(false);

  // Memoize the fetch function to prevent recreating it on each render
  const fetchCourseProgress = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user || isDataFetched) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a single request with batched data
      const response = await fetch('/api/progress/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseIds: courses.map(course => course.id)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }
      
      const data = await response.json();
      setProgress(data.progress || {});
      setIsDataFetched(true);
    } catch (error) {
      console.error('Failed to fetch course progress:', error);
    } finally {
      setLoading(false);
    }
  }, [session, status, isDataFetched]);

  // Use useEffect with proper dependencies
  useEffect(() => {
    // Only fetch if authenticated and not already fetched
    if (status === 'authenticated' && !isDataFetched) {
      fetchCourseProgress();
    } else if (status !== 'loading') {
      setLoading(false);
    }
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [status, isDataFetched, fetchCourseProgress]);
  
  // Calculate overall progress
  const calculateOverallProgress = useCallback((): number => {
    if (!progress || Object.keys(progress).length === 0) return 0;
    
    const totalCompletedProblems = Object.values(progress).reduce(
      (sum: number, courseProgress: CourseProgress) => sum + (courseProgress?.completedProblems || 0), 
      0
    );
    
    const totalProblems = courses.reduce(
      (sum, course) => sum + course.problemCount, 
      0
    );
    
    return totalProblems > 0 
      ? Math.round((totalCompletedProblems / totalProblems) * 100) 
      : 0;
  }, [progress]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Your Courses</h1>
        {!loading && (
          <div className="bg-muted px-4 py-2 rounded-full">
            <span className="font-medium">
              {calculateOverallProgress()}% Complete
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-4">
        {courses.map((course) => {
          const courseProgress = progress[course.id] || { percentage: 0, completedProblems: 0 };
          const Icon = course.icon;
          
          const getStartProblemId = () => {
            if (courseProgress.percentage > 0 && courseProgress.lastAccessedProblemId) {
              return courseProgress.lastAccessedProblemId;
            }
            return 1;
          };
          
          const startProblemId = getStartProblemId();
          
          return (
            <div 
              key={course.id} 
              className="bg-card rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`relative h-40 bg-gradient-to-r ${course.color}`}>
                <div className="absolute inset-0 flex items-center justify-center text-4xl text-white">
                  <Icon />
                </div>
              </div>
              
              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-bold">{course.title}</h3>
                <p className="text-muted-foreground mt-2">{course.description}</p>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{courseProgress.completedProblems} / {course.problemCount} complete</span>
                    <span>{courseProgress.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${courseProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <Link href={`/problems?course=${course.id}`} className="text-primary font-medium">
                    View Problems
                  </Link>
                  
                  <Link href={`/problems?course=${course.id}&highlight=recommended`}>
                    <Button variant="outline" size="sm">
                      {courseProgress.percentage > 0 ? 'Continue' : 'Start'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}