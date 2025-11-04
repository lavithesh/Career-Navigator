import { Logo } from '@/components/brand/logo';
import { getCurrentYear } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="border-t mt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {getCurrentYear()} Career Navigator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}