import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import SectionTitle from './SectionTitle';

export interface GridFeature {
  name: string;
  description: string;
  eyebrow?: string;
  points?: string[];
  note?: string;
}

interface FeaturesGridProps {
  features: GridFeature[];
}

const FeaturesGrid = ({ features }: FeaturesGridProps) => {
  return (
    <section className='relative my-20 md:my-28 lg:my-36' id='features'>
      <div className='absolute inset-x-12 -top-10 -z-10 hidden h-72 rounded-full bg-gradient-to-r from-primary/10 via-secondary/15 to-primary/5 blur-3xl md:block' />
      <div className='mx-auto flex max-w-6xl flex-col gap-12 px-6 sm:px-8 lg:px-0'>
        <SectionTitle
          title='Designed for every part of the travel approval chain'
          description='Compliance officers, planners, and finance teams share a single source of truth for trip budgets.'
        />
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {features.map((feature) => (
            <FeaturePanel key={feature.name} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

function FeaturePanel({ feature }: { feature: GridFeature }) {
  return (
    <article className='group relative h-full'>
      <div className='absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-primary/15 via-secondary/15 to-primary/5 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100' />
      <Card className='relative h-full overflow-hidden rounded-[24px] border border-border/60 bg-background/95 shadow-xl transition-transform duration-500 group-hover:-translate-y-1 dark:bg-card/90'>
        <CardHeader className='space-y-4'>
          {feature.eyebrow && (
            <span className='inline-flex items-center rounded-full bg-secondary-muted/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-foreground/80'>
              {feature.eyebrow}
            </span>
          )}
          <CardTitle className='text-2xl font-bold tracking-tight text-foreground'>{feature.name}</CardTitle>
          <CardDescription className='text-base leading-relaxed text-foreground/80'>
            {feature.description}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-5 pb-8'>
          {feature.points && feature.points.length > 0 && (
            <ul className='space-y-3'>
              {feature.points.map((point) => (
                <li key={point} className='flex items-start gap-3 text-sm leading-6 text-muted-foreground'>
                  <span className='mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/70' />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
          {feature.note && (
            <p className='rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground'>{feature.note}</p>
          )}
        </CardContent>
      </Card>
    </article>
  );
}

export default FeaturesGrid;
