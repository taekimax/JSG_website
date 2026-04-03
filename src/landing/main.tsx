import { createRoot } from 'react-dom/client';

import { LandingHeroSection } from '@/components/hero/LandingHeroSection';

const rootElement = document.getElementById('landingHeroRoot');

if (rootElement) {
  createRoot(rootElement).render(<LandingHeroSection />);
}
