import HighlightedFeature from './components/HighlightedFeature';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

export default function AIReady() {
  return (
    <HighlightedFeature
      name='Official Rates Built‑In'
      description='Keep every estimate aligned with current NJC directives. We sync meal allowances, accommodations guidance, and kilometric tables daily—no manual spreadsheets required.'
      highlightedComponent={<RatesSnapshot />}
      direction='row-reverse'
    />
  );
}

function RatesSnapshot() {
  return (
    <div className='w-full max-w-xl space-y-4'>
      <Card className='border border-border/70 bg-background/95 shadow-xl dark:bg-card/95'>
        <CardHeader className='space-y-3'>
          <Badge variant='secondary' className='w-fit uppercase tracking-[0.3em] text-xs font-semibold'>
            NJC — April 2024
          </Badge>
          <CardTitle className='text-xl font-semibold tracking-tight text-foreground'>Per diem & mileage digest</CardTitle>
          <p className='text-sm text-muted-foreground leading-6'>Daily sync with official Treasury Board and PWGSC bulletins keeps these figures current across regions.</p>
        </CardHeader>
        <CardContent className='space-y-4 text-sm text-foreground'>
          <div className='grid grid-cols-2 gap-4'>
            <RateItem label='Meals & Incidentals — Canada' value='$110.65 / day' sub='Breakfast 23.60 · Lunch 23.65 · Dinner 63.40' />
            <RateItem label='Kilometric Allowance — Ontario' value='61.5¢ / km' sub='Additional cents for first 5,000 km applied automatically.' />
            <RateItem label='Kilometric Allowance — Alberta' value='58.5¢ / km' sub='Adjusts instantly when quarterly updates arrive.' />
            <RateItem label='Accommodation Guidance — Ottawa' value='$150.00 / night' sub='Customisable ceilings for procurement teams.' />
          </div>
          <Separator className='bg-border/60' />
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground'>
            <span>Last refreshed: 04:15 ET · Sources: NJC Appendices B & C, PWGSC</span>
            <span className='font-medium text-foreground/80'>Change log & API export available</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RateItem({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className='flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/40 p-3'>
      <span className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{label}</span>
      <span className='text-lg font-semibold text-foreground'>{value}</span>
      {sub && <span className='text-[0.7rem] text-muted-foreground leading-4'>{sub}</span>}
    </div>
  );
}
