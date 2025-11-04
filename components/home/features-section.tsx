"use client"
import FeatureCard from './feature-card';
import { Clock, Code, BookOpen, BrainCircuit, Zap, Target, CheckCircle2 } from 'lucide-react';

export function FeaturesSection() {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Transform Your Interview Preparation</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to ace technical interviews in one intelligent platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Main Features */}
          <div className="flex flex-col gap-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-full bg-orange-100 border border-orange-200 p-3">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-orange-800">From Chaos to Clarity</h3>
              </div>
              <p className="text-orange-700 mb-4">
                Stop wasting time juggling between multiple tools and resources. Our platform streamlines your preparation process.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <span className="text-orange-700">Consolidate your learning in one place</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <span className="text-orange-700">Reduce context switching between tools</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <span className="text-orange-700">Focus on learning, not logistics</span>
                </li>
              </ul>
            </div>
            
            <FeatureCard 
              icon={<BrainCircuit className="h-6 w-6 text-indigo-600" />}
              title="AI-Powered Mentorship"
              description="Get instant guidance, hints, and explanations from our AI assistant whenever you're stuck."
            />
          </div>
          
          {/* Key Features List */}
          <div className="p-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 h-fit">
            <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">Key Platform Features</h3>
            
            <div className="space-y-6">
              {[
                '600+ company-specific questions from top tech companies',
                'Built-in coding editor with syntax highlighting and auto-complete',
                'Personalized AI mentorship for instant help and explanations',
                'Comprehensive resource hub with guides, patterns, and solutions',
                'Time-optimized learning paths based on your target companies'
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-green-200 rounded-full h-7 w-7 flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-green-800 font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-green-800">{feature}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional Features */}
          <div className="flex flex-col gap-8">
            <FeatureCard 
              icon={<Code className="h-6 w-6 text-indigo-600" />}
              title="Integrated Coding Environment"
              description="Write, test, and debug your code in our powerful editor without switching between platforms."
            />
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-full bg-indigo-100 border border-indigo-200 p-3">
                  <Target className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-indigo-800">Targeted Preparation</h3>
              </div>
              <p className="text-indigo-700 mb-4">
                Focus your study on questions and patterns relevant to your target companies.
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-indigo-200 mb-4">
                <div className="text-sm font-mono text-indigo-900">
                  <div className="text-gray-500 mb-1">// Sample problem preview</div>
                  <div>function twoSum(nums, target) {'{'}</div>
                  <div className="pl-4 text-indigo-600">// Find two numbers that add up to target</div>
                  <div className="pl-4">const map = new Map();</div>
                  <div className="pl-4">for (let i = 0; i {'<'} nums.length; i++) {'{'}</div>
                  <div className="pl-8">...</div>
                  <div className="pl-4">{'}'}</div>
                  <div>{'}'}</div>
                </div>
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <span className="text-indigo-700">Company-specific question banks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <span className="text-indigo-700">Topic-based practice sessions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturesSection;