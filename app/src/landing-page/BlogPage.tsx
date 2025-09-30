import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1900&q=80&sat=-20';

const METRICS = [
  { label: 'Minutes per trip', value: '45 → 10', hint: 'Average planning time before vs. after adopting the estimator.' },
  { label: 'Hours saved / month', value: '5+', hint: 'Across 8–10 itineraries, coordinators reclaim a full workday.' },
  { label: 'Compliance accuracy', value: '100%', hint: 'Rates sync with NJC and PWGSC updates automatically.' },
];

const OLD_WORKFLOW = [
  'Collect trip details via email – itineraries, travellers, and justifications all live in inboxes.',
  'Fetch per diem, mileage, and accommodation limits from bookmarked NJC/PWGSC pages.',
  'Update massive spreadsheets (usually by copy-pasting formulas) and hope no cells break.',
  'Package everything for finance approval and answer the inevitable “is this rate current?” follow-up.',
];

const NEW_WORKFLOW = [
  'Enter trip basics once – origin, destination, and dates drive automatic mileage suggestions.',
  'Choose transport and lodging – the estimator enforces NJC mileage and PWGSC accommodation caps in real time.',
  'Add extras or policy notes – context for approvers lives alongside the numbers.',
  'Export polished PDFs/CSVs – finance gets audit-ready deliverables without chasing formatting fixes.',
];

export default function BlogPage() {
  return (
    <div className='bg-background text-foreground'>
      <main className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16'>
        <Hero />
        <Metrics />
        <ArticleBody />
        <CTA />
      </main>
    </div>
  );
}

function Hero() {
  return (
    <section className='relative mb-16 overflow-hidden rounded-3xl border border-border/40 bg-muted/40 shadow-[0_35px_70px_-35px_rgba(15,23,42,0.45)]'>
      <div
        className='absolute inset-0'
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(15,23,42,0.82), rgba(30,58,138,0.78)), url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className='relative z-10 px-6 py-16 sm:px-10 lg:px-16 lg:py-20 text-slate-100'>
        <p className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]'>
          Productivity gains
        </p>
        <h1 className='mt-6 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.75rem]'>
          How our Travel Cost Estimator saves teams hours every month
        </h1>
        <p className='mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg'>
          A behind-the-scenes look at how coordinators reclaim time by replacing spreadsheets and manual lookups with our four-step workflow.
        </p>
        <div className='mt-6 flex flex-col gap-3 text-sm text-slate-200/80 sm:flex-row sm:items-center sm:gap-4'>
          <span>Travel Cost Estimator Team</span>
          <span className='hidden sm:inline'>•</span>
          <span>September 29, 2025</span>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className='grid gap-4 sm:grid-cols-3 sm:gap-6'>
      {METRICS.map((metric) => (
        <Card key={metric.label} className='border-border/60 bg-card/80 backdrop-blur'>
          <CardContent className='flex flex-col gap-3 p-5 sm:p-6'>
            <span className='text-xs font-semibold uppercase tracking-[0.3em] text-primary'>{metric.label}</span>
            <span className='text-2xl font-semibold text-foreground sm:text-3xl'>{metric.value}</span>
            <p className='text-sm text-muted-foreground'>{metric.hint}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function ArticleBody() {
  return (
    <article className='prose prose-neutral mx-auto mt-16 max-w-3xl dark:prose-invert prose-headings:font-semibold prose-h2:mt-12 prose-p:leading-7'>
      <p>
        Government travel planning is not just about picking flights and hotels. For most federal and provincial departments, every itinerary has to satisfy the National Joint Council (NJC) directives, kilometre allowances, accommodation rate caps, and internal approval workflows. The math is precise, but the process is manual—and that adds up to hours of repetitive work each month.
      </p>

      <h2>The old playbook: manual inputs everywhere</h2>
      <p>
        Before teams adopt our estimator, we usually see a familiar set of tools. A sprawling spreadsheet holds per-diems, mileage, and accommodation caps. NJC and PWGSC pages are bookmarked for quick reference (and frantic re-checking when directives shift). Email threads go back and forth to confirm totals. It works, but it’s tedious and error-prone. Across a full month of travel planning, the hours spent on data entry and validation become a hidden cost.
      </p>

      <Card className='not-prose my-8 border-border/60 bg-muted/40'>
        <CardContent className='grid gap-4 p-6 sm:grid-cols-2 sm:p-7'>
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-[0.3em] text-primary'>Manual workflow</h3>
            <ul className='mt-3 space-y-2 text-sm text-muted-foreground'>
              {OLD_WORKFLOW.map((item) => (
                <li key={item} className='flex gap-2'>
                  <span className='mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <figure className='overflow-hidden rounded-2xl border border-border/40 bg-background/70 shadow-inner'>
            <img
              src='https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'
              alt='Stacks of printed spreadsheets and binders.'
              className='h-full w-full object-cover'
            />
          </figure>
        </CardContent>
      </Card>

      <h2>A month in the life: Amelia’s regional field audits</h2>
      <p>
        Meet Amelia, a regional program coordinator responsible for field audits across Ontario and Quebec. In peak season she supports 8–10 trips per month, each with at least two travellers. Her old workflow looked like this:
      </p>
      <ol>
        {OLD_WORKFLOW.map((item) => (
          <li key={`old-${item}`}>{item}</li>
        ))}
      </ol>
      <p>
        Each itinerary took about 45 minutes end-to-end. Multiply that by nine trips and Amelia was spending roughly seven hours a month just assembling cost estimates—before any revisions when someone spotted a typo.
      </p>

      <h2>The new workflow with Travel Cost Estimator</h2>
      <p>
        Now the process fits inside our four-step wizard. Trip basics, transport & rates, lodging & extras, and export review happen in minutes. Mileage is auto-suggested based on official geodata, hotel caps are enforced with PWGSC limits, and exports are ready for finance the moment Amelia clicks “Generate”.
      </p>

      <Card className='not-prose my-10 border-border/60 bg-muted/30'>
        <CardContent className='grid gap-4 p-6 sm:grid-cols-[1fr,1.5fr] sm:p-7'>
          <div className='flex flex-col gap-3'>
            <h3 className='text-sm font-semibold uppercase tracking-[0.3em] text-primary'>Automated workflow</h3>
            <p className='text-sm text-muted-foreground'>What once took 45 minutes now fits in a guided, policy-aware experience.</p>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              {NEW_WORKFLOW.map((item) => (
                <li key={item} className='flex gap-2'>
                  <span className='mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className='grid gap-3 rounded-2xl border border-border/40 bg-background/70 p-5 text-sm shadow-inner sm:p-6'>
            <header className='flex items-center justify-between font-semibold text-foreground'>
              <span>Time per trip</span>
              <span>45 min → 10 min</span>
            </header>
            <div className='rounded-xl bg-primary/10 p-4 text-primary'>
              <p className='text-sm font-semibold uppercase tracking-[0.3em]'>Monthly impact</p>
              <p className='mt-2 text-lg font-semibold text-primary-foreground/90'>≈ 5 hours saved</p>
              <p className='mt-1 text-xs text-primary-foreground/70'>Across 8–10 itineraries, the estimator frees up a full workday.</p>
            </div>
            <blockquote className='border-l-4 border-primary/60 pl-4 text-muted-foreground'>
              “Instead of reconciling spreadsheets, I now spend that time planning better routes and communicating with travellers.”
            </blockquote>
          </div>
        </CardContent>
      </Card>

      <h2>Where those hours go instead</h2>
      <ul>
        <li>
          <strong>Travellers get itineraries faster.</strong> Approvals roll in sooner because policy-compliant numbers are visible instantly.
        </li>
        <li>
          <strong>Finance stops reformatting.</strong> Exports include the same breakdown they need for audit trails, so there’s less duplication downstream.
        </li>
        <li>
          <strong>Coordinators focus on higher-value work.</strong> Amelia now spends the reclaimed hours optimizing routes and staying on top of policy changes instead of maintaining spreadsheets.
        </li>
      </ul>

      <h2>Why a subscription quickly pays for itself</h2>
      <p>
        Even our entry subscription tier costs less than a half-day of a coordinator’s time. When the tool saves five or more hours per month, as it did for Amelia, the subscription essentially pays for itself in the first week. After that, it’s pure operational headroom—and compliance without stress.
      </p>
    </article>
  );
}

function CTA() {
  return (
    <section className='mx-auto mt-20 max-w-4xl'>
      <Card className='border-border/60 bg-primary/10 backdrop-blur'>
        <CardContent className='flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h3 className='text-2xl font-semibold text-primary-foreground/90'>Ready to reclaim your time?</h3>
            <p className='mt-2 text-sm text-primary-foreground/70'>Run your next estimate through the Travel Cost Estimator and feel the difference within minutes.</p>
          </div>
          <Button asChild size='lg' variant='default' className='w-full sm:w-auto'>
            <WaspRouterLink to={routes.EstimatorRoute.to}>Start an estimate</WaspRouterLink>
          </Button>
        </CardContent>
      </Card>
      <div className='mt-10 flex justify-center'>
        <Button variant='ghost' asChild>
          <WaspRouterLink to={routes.LandingPageRoute.to}>← Back to home</WaspRouterLink>
        </Button>
      </div>
    </section>
  );
}
