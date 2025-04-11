import HeroSection from './sections/HeroSection'
import StatsSection from './sections/StatsSection'
import FeaturesSection from './sections/FeaturesSection'
import ExpertiseSection from './sections/ExpertiseSection'
import IntegrationsSection from './sections/IntegrationsSection'
import HowItWorksSection from './sections/HowItWorksSection'
import TestimonialsSection from './sections/TestimonialsSection'
import PricingSection from './sections/PricingSection'
import FaqSection from './sections/FaqSection'
import CtaSection from './sections/CtaSection'

// Feature flags
const SHOW_TESTIMONIALS = false;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ExpertiseSection />
      <IntegrationsSection />
      <HowItWorksSection />
      {SHOW_TESTIMONIALS && <TestimonialsSection />}
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </div>
  )
}

