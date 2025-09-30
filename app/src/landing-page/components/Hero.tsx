import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Hero() {
  return (
    <div className='relative w-full pt-12 sm:pt-16 lg:pt-20'>
      <TopGradient />
      <BottomGradient />
      <div className='py-16 sm:py-20'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-3xl text-center lg:mb-20'>
            <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight'>
              Government Travel Cost <span className='text-gradient-primary'>Estimator</span>
            </h1>
            <p className='mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8'>
              Calculate per diem, mileage, and hotel caps using official Canadian rates (NJC, PWGSC). Export-ready totals in seconds.
            </p>
            <div className='mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4'>
              <Button size='lg' variant='default' asChild className='w-full sm:w-auto'>
                <WaspRouterLink to={routes.EstimatorRoute.to}>
                  Get Started <span aria-hidden='true'>→</span>
                </WaspRouterLink>
              </Button>
              <Button size='lg' variant='outline' asChild className='w-full sm:w-auto'>
                <WaspRouterLink to={routes.PricingPageRoute.to}>See Pricing</WaspRouterLink>
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
    <div className='mx-auto mt-12 max-w-4xl px-4 sm:px-6 md:mt-14 md:px-0'>
      <div className='relative mx-auto max-w-4xl p-[1px] rounded-[28px] bg-gradient-to-br from-primary/20 via-secondary/30 to-primary/10 shadow-2xl'>
        <div className='flex flex-col gap-6 rounded-[26px] border border-border/60 bg-background/95 p-6 backdrop-blur-md dark:bg-card/95 sm:p-8 lg:flex-row lg:items-center lg:gap-10'>
          <div className='flex-1 space-y-4 sm:space-y-5'>
            <span className='inline-flex items-center rounded-full bg-secondary-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary-foreground'>
              Sample estimate
            </span>
            <h3 className='text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>Ottawa Client Visit</h3>
            <p className='max-w-md text-sm leading-6 text-muted-foreground sm:text-base'>
              Two-day trip from Toronto to Ottawa. Includes mileage, per diem, and nightly accommodation cap sourced from the
              latest NJC directive.
            </p>
            <dl className='grid grid-cols-2 gap-4 text-sm sm:max-w-md'>
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
          <Card className='w-full bg-card/95 shadow-lg sm:w-[280px]'>
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
