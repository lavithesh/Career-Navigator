'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const { data: session, status } = useSession();
  
  return (
    <div className="py-20 bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 text-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to transform your interview preparation?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of developers who have accelerated their careers with our AI-powered platform. Start your journey today.
          </p>
          
          <div className="inline-flex items-center justify-center">
            <Link href={status === 'authenticated' ? "/learn" : "/auth/signin"}>
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-blue-50 rounded-full px-8 py-6 text-lg font-semibold">
                {status === 'authenticated' ? 'Continue Your Learning Path' : 'Start Your Free Journey'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="flex items-center">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-indigo-900 bg-indigo-${300 + i*100} flex items-center justify-center text-xs font-bold`}>
                    {i}
                  </div>
                ))}
              </div>
              <p className="ml-4 text-blue-100">Join 10,000+ users</p>
            </div>
            
            <div className="flex items-center">
              <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-sm font-medium">
                4.9/5 Average Rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CTASection;