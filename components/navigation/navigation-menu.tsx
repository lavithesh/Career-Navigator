'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme/theme-toggle';
import { NavigationLinks } from './navigation-links';
import { MobileMenu } from './mobile-menu';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function NavigationMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/learn');
  };

  return (
    <div className="flex items-center space-x-4">
      <MobileMenu />
      <NavigationLinks className="hidden md:flex" />
      <div className="flex items-center space-x-4">
        {session ? (
          <Button variant="ghost" onClick={() => router.push('/profile')}>
            Profile
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => signIn()}>
              Sign In
            </Button>
            <Button onClick={handleGetStarted}>
              Get Started
            </Button>
          </>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}