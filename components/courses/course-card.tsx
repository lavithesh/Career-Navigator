'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  title: string;
  description: string;
  progress: number;
  icon: LucideIcon;
  courseId: string;
}

export function CourseCard({ title, description, progress, icon: Icon, courseId }: CourseCardProps) {
  const router = useRouter();
  
  const handleStartClick = () => {
    router.push(`/problems?course=${courseId}`);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Progress value={progress} className="mb-4" />
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {progress}% Complete
        </span>
        <Button size="sm" onClick={handleStartClick}>Start</Button>
      </div>
    </Card>
  );
}