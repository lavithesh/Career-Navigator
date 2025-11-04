'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Rocket, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const { data: session, status } = useSession();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 text-white py-20">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]"></div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-sm font-medium">
              Accelerate Your Career Growth
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Master Coding Interviews <br /> With AI Guidance
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              A comprehensive learning platform designed to transform your interview preparation with personalized AI mentorship, structured learning paths, and hands-on practice.
            </p>
            <div className="flex flex-wrap gap-4">
              {status === 'authenticated' ? (
                <Link href="/learn">
                  <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-8">
                    Continue Learning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-8">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  
                </>
              )}
            </div>
          </div>
          
          <div className="relative">
            <div className="w-[350px] h-[350px] bg-gradient-to-tr from-indigo-600 to-blue-400 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-grid-white/[0.1] bg-[size:20px_20px]"></div>
              <Rocket className="h-32 w-32 text-white" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-tr from-pink-500 to-violet-500 rounded-full blur-xl opacity-70"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full blur-xl opacity-70"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;