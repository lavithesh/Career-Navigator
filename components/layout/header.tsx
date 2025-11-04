import { NavigationMenu } from '@/components/navigation/navigation-menu';
import { Logo } from '@/components/brand/logo';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        <NavigationMenu />
      </div>
    </header>
  );
}