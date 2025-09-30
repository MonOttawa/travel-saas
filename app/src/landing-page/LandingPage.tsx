import FAQ from './components/FAQ';
import FeaturesGrid from './components/FeaturesGrid';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Testimonials from './components/Testimonials';
import AIReady from './ExampleHighlightedFeature';
import ValueIndicators from './components/ValueIndicators';
import { faqs, features, footerNavigation, testimonials } from './contentSections';
import StepsShowcase from './components/StepsShowcase';

export default function LandingPage() {
  return (
    <div className='bg-background text-foreground'>
      <main className='isolate'>
        <Hero />
        <StepsShowcase />
        <ValueIndicators />
        <AIReady />
        <FeaturesGrid features={features} />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}
