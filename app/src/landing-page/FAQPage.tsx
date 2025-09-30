import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import FAQ from './components/FAQ';
import { faqs } from './contentSections';
import { Button } from '../components/ui/button';

export default function FAQPage() {
  return (
    <div className='bg-background text-foreground'>
      <main className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20'>
        <header className='mb-12 sm:mb-16 text-center'>
          <p className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary'>
            Help centre
          </p>
          <h1 className='mt-6 text-3xl font-semibold tracking-tight sm:text-4xl'>Frequently asked questions</h1>
          <p className='mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg'>
            Everything you need to know about data sources, compliance safeguards, and why teams rely on the Travel Cost Estimator for faster approvals.
          </p>
        </header>

        <FAQ faqs={faqs} />

        <section className='mt-20 rounded-3xl border border-border/60 bg-muted/30 px-6 py-8 sm:px-8 sm:py-12'>
          <div className='mx-auto flex max-w-3xl flex-col gap-4 text-center'>
            <h2 className='text-2xl font-semibold text-foreground'>Still have questions?</h2>
            <p className='text-sm text-muted-foreground sm:text-base'>
              We’re happy to walk through your travel policy and show you how to mirror it in the estimator. Reach out or jump into the app to see the workflow in action.
            </p>
            <div className='flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
              <Button asChild size='lg'>
                <WaspRouterLink to={routes.EstimatorRoute.to}>Start an estimate</WaspRouterLink>
              </Button>
              <Button variant='outline' size='lg' asChild>
                <a href='mailto:support@travelcost.app'>Talk to us</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
