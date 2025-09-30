const INDICATORS = [
  {
    title: '4-step workflow',
    highlight: 'Create policy-ready estimates in under 5 minutes with our guided wizard.',
    detail: 'Trip basics, transportation, lodging, and export review—nothing extra to learn.'
  },
  {
    title: '100+ official rates',
    highlight: 'Meal, mileage, and accommodation caps sync automatically from NJC and PWGSC sources.',
    detail: 'Stay compliant without spreadsheets or manual lookups when directives change.'
  },
  {
    title: 'Exports finance trusts',
    highlight: 'Generate CSV and PDF packages with itemised totals and approval notes.',
    detail: 'Hand deliverables straight to finance teams or procurement portals without reformatting.'
  }
];

export default function ValueIndicators() {
  return (
    <section className='px-4 py-16 sm:px-6 sm:py-18 lg:px-8 lg:py-24'>
      <div className='mx-auto flex max-w-5xl flex-col gap-10 text-center'>
        <div>
          <p className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary'>
            Built for teams
          </p>
          <h2 className='mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
            Everything approvers need—nothing they do not
          </h2>
          <p className='mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg'>
            Replace legacy spreadsheets with a guided experience that mirrors Canadian government requirements and delivers finance-ready outputs.
          </p>
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          {INDICATORS.map((indicator) => (
            <article
              key={indicator.title}
              className='flex h-full flex-col gap-4 rounded-2xl border border-border/50 bg-background/90 p-6 text-left shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/80'
            >
              <h3 className='text-sm font-semibold uppercase tracking-[0.25em] text-primary'>{indicator.title}</h3>
              <p className='text-lg font-semibold text-foreground'>{indicator.highlight}</p>
              <p className='text-sm leading-6 text-muted-foreground'>{indicator.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
