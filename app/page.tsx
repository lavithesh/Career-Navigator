import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';
import { CTASection } from '@/components/home/cta-section';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}