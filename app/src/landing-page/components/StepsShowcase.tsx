import { Button } from '../../components/ui/button';

const STEPS = [
  {
    title: 'Trip basics',
    description: 'Choose origin, destination, and dates. We auto-suggest mileage with official geodata.',
  },
  {
    title: 'Transport & rates',
    description:
      'Toggle personal vs. rental vehicles and lock in the latest kilometric or rental allowances with one click.',
  },
  {
    title: 'Lodging & extras',
    description:
      'Dial in hotel limits, incidentals, and one-time extras using Treasury Board rate caps and contextual guidance.',
  },
  {
    title: 'Review & export',
    description: 'Generate localized summaries, CSV downloads, and printable PDFs ready for finance teams.',
  },
];

export default function StepsShowcase() {
  return (
    <section className='relative overflow-hidden bg-secondary/5 py-16 sm:py-20 lg:py-24'>
      <div className='absolute inset-y-0 left-1/2 hidden w-[120%] -translate-x-1/2 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-60 blur-3xl lg:block' />
      <div className='container relative z-10 mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl text-center'>
          <p className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary'>
            Four-step estimator
          </p>
          <h2 className='mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
            From blank page to export-ready in minutes
          </h2>
          <p className='mt-4 text-base text-muted-foreground sm:text-lg'>
            Every workflow mirrors Treasury Board requirements. No guesswork, no spreadsheets, just a guided path from input to deliverable.
          </p>
        </div>

        <div className='relative mt-12 sm:mt-14 lg:mt-18'>
          <div className='absolute left-[10%] right-[10%] top-11 hidden h-px bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 xl:block' />
          <ol className='grid gap-6 sm:grid-cols-2 xl:grid-cols-4'>
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className='relative flex h-full flex-col gap-4 rounded-2xl border border-border/50 bg-background/75 p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.65)] backdrop-blur supports-[backdrop-filter]:bg-background/65 sm:p-6'
              >
                <div className='flex items-center gap-3'>
                  <span className='flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-base font-semibold text-primary'>
                    {index + 1}
                  </span>
                  <h3 className='text-lg font-semibold text-foreground sm:text-xl'>{step.title}</h3>
                </div>
                <p className='text-sm leading-6 text-muted-foreground'>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className='mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4'>
          <Button asChild size='lg' className='px-8'>
            <a href='/login'>Start an estimate</a>
          </Button>
          <span className='text-sm text-muted-foreground sm:text-base'>No training required—just follow the four steps.</span>
        </div>
      </div>
    </section>
  );
}
