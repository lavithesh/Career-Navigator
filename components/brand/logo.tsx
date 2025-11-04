import { Compass } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
      <Compass className="h-6 w-6" />
      <span className="text-xl font-bold">Career Navigator</span>
    </Link>
  );
}