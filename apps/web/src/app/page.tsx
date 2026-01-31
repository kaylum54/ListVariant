import { Navbar } from '@/components/sections/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { PlatformsBar } from '@/components/sections/PlatformsBar';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { FeaturesGrid } from '@/components/sections/FeaturesGrid';
import { PricingSection } from '@/components/sections/PricingSection';
import { CTASection } from '@/components/sections/CTASection';
import { Footer } from '@/components/sections/Footer';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tom Flips',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Cross-listing platform for UK furniture resellers. List furniture on eBay, Facebook Marketplace, and Gumtree with one click.',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      name: 'Free',
      description: '10 listings per month, 2 marketplaces, basic analytics',
    },
    {
      '@type': 'Offer',
      price: '14.99',
      priceCurrency: 'GBP',
      name: 'Pro',
      description: '100 listings per month, all marketplaces, full analytics',
    },
    {
      '@type': 'Offer',
      price: '29.99',
      priceCurrency: 'GBP',
      name: 'Business',
      description:
        'Unlimited listings, all marketplaces, wholesale catalog access',
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
        <HowItWorks />
        <FeaturesGrid />
        <PricingSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
