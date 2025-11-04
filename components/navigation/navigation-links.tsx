'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationLinksProps {
  className?: string;
}

export function NavigationLinks({ className }: NavigationLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: '/learn', label: 'Learn' },
    { href: '/code-editor', label: 'Code Editor' },
    { href: '/ai-assistant', label: 'AI Assistant' },
  ];

  return (
    <nav className={cn('flex items-center space-x-4', className)}>
      {links.map(({ href, label }) => (
        <Button
          key={href}
          variant={pathname === href ? 'default' : 'ghost'}
          asChild
        >
          <Link href={href}>{label}</Link>
        </Button>
      ))}
    </nav>
  );
}