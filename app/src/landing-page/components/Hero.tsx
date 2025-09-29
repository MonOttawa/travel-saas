import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Hero() {
  return (
    <div className='relative pt-14 w-full'>
      <TopGradient />
      <BottomGradient />
      <div className='md:p-24'>
        <div className='mx-auto max-w-8xl px-6 lg:px-8'>
          <div className='lg:mb-18 mx-auto max-w-3xl text-center'>
            <h1 className='text-5xl font-bold tracking-tight text-foreground sm:text-6xl sm:leading-tight'>
              Government Travel Cost <span className='text-gradient-primary'>Estimator</span>
            </h1>
            <p className='mt-6 mx-auto max-w-2xl text-lg leading-7 text-muted-foreground sm:text-xl sm:leading-8'>
              Calculate per diem, mileage, and hotel caps using official Canadian rates (NJC, PWGSC). Export-ready totals in seconds.
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <Button size='lg' variant='outline' asChild>
                <WaspRouterLink to={routes.PricingPageRoute.to}>See Pricing</WaspRouterLink>
              </Button>
              <Button size='lg' variant='default' asChild>
                <WaspRouterLink to={routes.EstimatorRoute.to}>
                  Get Started <span aria-hidden='true'>→</span>
                </WaspRouterLink>
              </Button>
            </div>
          </div>
          <HeroPreview />
        </div>
      </div>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className='absolute top-0 right-0 -z-10 transform-gpu overflow-hidden w-full blur-3xl sm:top-0'
      aria-hidden='true'
    >
      <div
        className='aspect-[1020/880] w-[70rem] flex-none sm:right-1/4 sm:translate-x-1/2 dark:hidden bg-gradient-to-tr from-amber-400 to-purple-300 opacity-10'
        style={{
          clipPath: 'polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)',
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className='absolute inset-x-0 top-[calc(100%-40rem)] sm:top-[calc(100%-65rem)] -z-10 transform-gpu overflow-hidden blur-3xl'
      aria-hidden='true'
    >
      <div
        className='relative aspect-[1020/880] sm:-left-3/4 sm:translate-x-1/4 dark:hidden bg-gradient-to-br from-amber-400 to-purple-300 opacity-10 w-[90rem]'
        style={{
          clipPath: 'ellipse(80% 30% at 80% 50%)',
        }}
      />
    </div>
  );
}

function HeroPreview() {
  return (
    <div className='mt-14 hidden md:block'>
      <div className='relative mx-auto max-w-4xl p-[1px] rounded-[28px] bg-gradient-to-br from-primary/20 via-secondary/30 to-primary/10 shadow-2xl'>
        <div className='rounded-[26px] bg-background/95 dark:bg-card/95 backdrop-blur-md border border-border/60 p-8 flex flex-col gap-8 sm:flex-row sm:items-center'>
          <div className='flex-1 space-y-4'>
            <span className='inline-flex items-center rounded-full bg-secondary-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary-foreground'>
              Sample estimate
            </span>
            <h3 className='text-2xl font-semibold tracking-tight text-foreground'>Ottawa Client Visit</h3>
            <p className='text-sm text-muted-foreground leading-6 max-w-sm'>
              Two-day trip from Toronto to Ottawa. Includes mileage, per diem, and nightly accommodation cap sourced from the
              latest NJC directive.
            </p>
            <dl className='grid grid-cols-2 gap-4 max-w-md text-sm'>
              <div>
                <dt className='text-muted-foreground'>Origin</dt>
                <dd className='font-semibold text-foreground'>Toronto, ON</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>Destination</dt>
                <dd className='font-semibold text-foreground'>Ottawa, ON</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>Distance</dt>
                <dd className='font-semibold text-foreground'>450 km return</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>Days</dt>
                <dd className='font-semibold text-foreground'>2</dd>
              </div>
            </dl>
          </div>
          <Card className='w-full sm:w-[280px] bg-card/90 border-border/70 shadow-lg'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base font-semibold tracking-tight text-foreground'>Estimate breakdown</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-foreground/90'>
              <div className='flex items-center justify-between'>
                <span>Meals & Incidentals</span>
                <span className='font-semibold'>$221.30</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Kilometric Allowance</span>
                <span className='font-semibold'>$276.75</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Accommodation Guidance</span>
                <span className='font-semibold'>$300.00</span>
              </div>
              <div className='border-t border-border pt-3 flex items-center justify-between text-base font-semibold text-foreground'>
                <span>Total Estimate</span>
                <span>$798.05</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
