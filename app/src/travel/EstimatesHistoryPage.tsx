import { useAuth } from 'wasp/client/auth';
import { getTravelEstimates, useQuery } from 'wasp/client/operations';
import type { TravelEstimate } from 'wasp/entities';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { routes } from 'wasp/client/router';

const formatCurrency = (amount: number | null | undefined, currency = 'CAD') => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const formatTrip = (origin?: string | null, destination?: string | null) => {
  if (!origin && !destination) return '—';
  if (!destination) return origin ?? '—';
  if (!origin) return destination;
  return `${origin} → ${destination}`;
};

export default function EstimatesHistoryPage() {
  const { data: user } = useAuth();
  const estimatesQuery = useQuery(getTravelEstimates, undefined, { enabled: Boolean(user) });
  const estimates = (estimatesQuery.data as TravelEstimate[] | undefined) ?? [];
  const status = estimatesQuery.status;
  const isLoading = status === 'loading';
  const hasError = status === 'error';

  return (
    <div className='bg-background text-foreground'>
      <main className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20'>
        <header className='mb-10 text-center'>
          <p className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary'>
            Estimate history
          </p>
          <h1 className='mt-6 text-3xl font-semibold tracking-tight sm:text-4xl'>Saved travel estimates</h1>
          <p className='mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg'>
            Each time you recalculate totals, we store a policy snapshot so you can revisit previous itineraries or share them with finance.
          </p>
        </header>

        {!user ? (
          <Card className='mx-auto max-w-3xl border-dashed border-primary/40 bg-primary/5'>
            <CardHeader>
              <CardTitle className='text-lg font-semibold text-primary'>Sign in to view history</CardTitle>
              <CardDescription>
                Create a free account or log in to track your estimates over time and keep an audit trail for approvals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                <Button asChild size='lg'>
                  <a href={routes.SignupRoute.to}>Create account</a>
                </Button>
                <Button variant='outline' asChild size='lg'>
                  <a href={routes.LoginRoute.to}>Log in</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className='border border-border/60'>
            <CardHeader>
              <CardTitle>Recent estimates</CardTitle>
              <CardDescription>
                Showing the 20 most recent estimates you generated. Need more history? Export the CSV or PDF and archive them in your records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-3'>
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className='h-12 rounded-lg bg-muted animate-pulse' />
                  ))}
                </div>
              ) : hasError ? (
                <p className='text-sm text-destructive'>We couldn’t load your history. Please try again later.</p>
              ) : estimates.length === 0 ? (
                <p className='text-sm text-muted-foreground'>Run your first estimate to see it appear here.</p>
              ) : (
                <div className='space-y-4'>
                  {estimates.map((estimate) => {
                    const regionLabel = estimate.tripRegion === 'international' ? 'International' : 'Domestic';
                    return (
                      <div
                        key={estimate.id}
                        className='flex flex-col gap-3 rounded-xl border border-border/50 bg-background/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between'
                      >
                        <div className='space-y-1'>
                          <p className='text-sm font-semibold text-foreground'>{formatTrip(estimate.origin, estimate.destination)}</p>
                          <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                            <span>{formatDate(estimate.createdAt)}</span>
                            <span>•</span>
                            <span>{estimate.travelMode === 'rental' ? 'Rental vehicle' : 'Personal vehicle'}</span>
                            <span>•</span>
                            <span>{regionLabel}</span>
                            {estimate.days ? (
                              <>
                                <span>•</span>
                                <span>{estimate.days} day{estimate.days === 1 ? '' : 's'}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <Badge variant='outline'>{regionLabel}</Badge>
                          {estimate.includeHotel && <Badge variant='outline'>Hotel</Badge>}
                          {estimate.includeIncidentals && <Badge variant='outline'>Incidentals</Badge>}
                          {estimate.includeOneTimeExtras && <Badge variant='outline'>Extras</Badge>}
                          <div className='text-right'>
                            <p className='text-sm font-semibold text-foreground'>{formatCurrency(estimate.grandTotal)}</p>
                            <p className='text-xs text-muted-foreground'>Total estimate</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
