import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { cn } from '../lib/utils';

type StepStatus = 'complete' | 'current' | 'upcoming';

export interface OnboardingStep {
  title: string;
  description: string;
  status: StepStatus;
}

export function OnboardingMilestones({ steps }: { steps: OnboardingStep[] }) {
  const renderIcon = (status: StepStatus) => {
    if (status === 'complete') return <CheckCircle2 size={20} />;
    if (status === 'current') return <CircleDot size={20} />;
    return <Circle size={18} />;
  };

  const getConnectorClass = (status: StepStatus) =>
    cn('h-[2px] flex-1 mx-3 min-w-[32px] rounded-full transition-colors duration-300', {
      'bg-primary': status === 'complete',
      'bg-primary/40': status === 'current',
      'bg-border': status === 'upcoming',
    });

  const horizontalSequence = steps.flatMap((step, idx) => {
    const items = [
      <div
        key={`step-${idx}`}
        className='flex flex-col items-center text-center gap-3 flex-[1_1_0] min-w-[160px] max-w-[240px]'
      >
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-300',
            {
              'border-primary bg-primary/10 text-primary': step.status === 'complete',
              'border-foreground bg-card text-foreground shadow-sm': step.status === 'current',
              'border-border text-muted-foreground': step.status === 'upcoming',
            }
          )}
        >
          {renderIcon(step.status)}
        </div>
        <div className='space-y-1'>
          <p
            className={cn('text-sm font-semibold tracking-tight', {
              'text-foreground': step.status === 'current' || step.status === 'complete',
              'text-muted-foreground': step.status === 'upcoming',
            })}
          >
            {idx + 1}. {step.title}
          </p>
          <p className='text-xs text-muted-foreground leading-5'>{step.description}</p>
        </div>
      </div>,
    ];

    if (idx < steps.length - 1) {
      items.push(
        <div key={`connector-${idx}`} className={getConnectorClass(step.status)} aria-hidden='true' />
      );
    }

    return items;
  });

  return (
    <div className='w-full rounded-2xl border border-border/70 bg-background/80 dark:bg-card/80 shadow-sm backdrop-blur-sm p-5 sm:p-6'>
      <h2 className='text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground mb-4'>Onboarding</h2>
      <div className='flex flex-col gap-4'>
        <div className='flex w-full items-center justify-between gap-3 flex-wrap'>{horizontalSequence}</div>
      </div>
    </div>
  );
}
