import { Navbar } from '@/components/sections/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { PlatformsBar } from '@/components/sections/PlatformsBar';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { FeaturesGrid } from '@/components/sections/FeaturesGrid';
import { PricingSection } from '@/components/sections/PricingSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CTASection } from '@/components/sections/CTASection';
import { Footer } from '@/components/sections/Footer';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SyncSellr',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Cross-listing platform for UK resellers. List once and sell on eBay, Facebook Marketplace, Gumtree, Etsy, Vinted, Depop, and Poshmark with one click.',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      name: 'Starter',
      description: 'Up to 10 active listings, 3 marketplace connections, basic listing templates',
    },
    {
      '@type': 'Offer',
      price: '14.99',
      priceCurrency: 'GBP',
      name: 'Pro',
      description: 'Unlimited active listings, all 7 marketplaces, automatic image sync, smart auto-fill',
    },
    {
      '@type': 'Offer',
      price: '29.99',
      priceCurrency: 'GBP',
      name: 'Business',
      description:
        'Everything in Pro, multiple user accounts, advanced analytics, inventory tracking, dedicated account manager',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '127',
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <Navbar />
        <HeroSection />
        <PlatformsBar />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <FeaturesGrid />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
