import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function BlogPage() {
  return (
    <div className='bg-background text-foreground'>
      <main className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20'>
        <header className='mb-12 sm:mb-16 text-center'>
          <p className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary'>
            Product insights
          </p>
          <h1 className='mt-6 text-3xl font-semibold tracking-tight sm:text-4xl'>
            How Our Travel Cost Estimator Saves Teams Hours Every Month
          </h1>
          <p className='mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg'>
            A behind-the-scenes look at how coordinators reclaim time by replacing spreadsheets and manual lookups with our four-step workflow.
          </p>
          <div className='mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-center'>
            <span>Travel Cost Estimator Team</span>
            <span className='hidden sm:inline'>•</span>
            <span>September 29, 2025</span>
          </div>
        </header>

        <article className='prose prose-neutral mx-auto max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:mt-12 prose-h3:mt-8 prose-p:leading-7'>
          <p>
            Government travel planning is not just about picking flights and hotels. For most federal and provincial departments, every itinerary has to satisfy the National Joint Council (NJC) directives, kilometre allowances, accommodation rate caps, and internal approval workflows. The math is precise, but the process is manual—and that adds up to hours of repetitive work each month.
          </p>

          <h2>The old playbook: spreadsheets and bookmarked PDFs</h2>
          <p>
            Before teams adopt our estimator, we usually see a familiar set of tools: a gigantic spreadsheet with tabs for per-diems, mileage, and accommodation caps; bookmarked NJC and PWGSC pages for quick reference; and email threads between coordinators, travellers, and finance to double-check totals. It works, but it’s tedious and error-prone. Across a full month of travel planning, the hours spent on data entry and validation become a hidden cost.
          </p>

          <h2>A month in the life: Amelia’s regional field audits</h2>
          <p>
            Meet Amelia, a regional program coordinator responsible for field audits across Ontario and Quebec. In peak season she supports 8–10 trips per month, each with at least two travellers. Her old workflow looked like this:
          </p>
          <ol>
            <li>Collect trip details via email—origin, destination, dates, purpose, travellers.</li>
            <li>Check policy rates by digging through NJC per-diem tables and the PWGSC accommodation directory.</li>
            <li>Calculate totals manually in Excel for meals, mileage, hotel caps, and extras.</li>
            <li>Prepare an approval package with a summary tab and attachments for finance.</li>
          </ol>
          <p>
            Each itinerary took about 45 minutes end-to-end. Multiply that by nine trips and Amelia was spending roughly seven hours a month just assembling cost estimates—before any revisions when someone spotted a typo.
          </p>

          <h2>The new workflow with Travel Cost Estimator</h2>
          <p>
            Now the process fits inside our four-step wizard. Trip basics, transport & rates, lodging & extras, and export review happen in minutes. Mileage is auto-suggested based on official geodata, hotel caps are enforced with PWGSC limits, and exports are ready for finance the moment Amelia clicks “Generate”.
          </p>
          <p>
            Instead of 45 minutes, Amelia spends less than 10 minutes per trip. Her monthly time sink drops under two hours—a savings of roughly five hours <strong>every single month</strong>.
          </p>

          <h2>Where those hours go instead</h2>
          <ul>
            <li><strong>Travellers get itineraries faster.</strong> Approvals roll in sooner because policy-compliant numbers are visible instantly.</li>
            <li><strong>Finance stops reformatting.</strong> Exports include the same breakdown they need for audit trails, so there’s less duplication downstream.</li>
            <li><strong>Coordinators focus on higher-value work.</strong> Amelia now spends the reclaimed hours optimizing routes and staying on top of policy changes instead of maintaining spreadsheets.</li>
          </ul>

          <h2>Why a subscription quickly pays for itself</h2>
          <p>
            Even our entry subscription tier costs less than a half-day of a coordinator’s time. When the tool saves five or more hours per month, as it did for Amelia, the subscription essentially pays for itself in the first week. After that, it’s pure operational headroom—and compliance without stress.
          </p>

          <section className='not-prose mt-10'>
            <Card className='bg-secondary/10 border-border/50'>
              <CardContent className='flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-foreground'>Ready to reclaim your time?</h3>
                  <p className='text-sm text-muted-foreground'>Run your next estimate through the Travel Cost Estimator and see the difference.</p>
                </div>
                <Button asChild size='lg'>
                  <WaspRouterLink to={routes.EstimatorRoute.to}>Start an estimate</WaspRouterLink>
                </Button>
              </CardContent>
            </Card>
          </section>
        </article>

        <div className='mt-16 flex justify-center'>
          <Button variant='ghost' asChild>
            <WaspRouterLink to={routes.LandingPageRoute.to}>← Back to home</WaspRouterLink>
          </Button>
        </div>
      </main>
    </div>
  );
}
