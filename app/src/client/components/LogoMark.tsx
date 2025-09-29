import { cn } from '../../lib/utils';

interface LogoMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeToClasses: Record<NonNullable<LogoMarkProps['size']>, string> = {
  sm: 'h-8 w-8 text-[0.6rem]',
  md: 'h-9 w-9 text-[0.65rem]',
  lg: 'h-11 w-11 text-[0.75rem]',
};

export function LogoMark({ size = 'md', className }: LogoMarkProps) {
  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-2xl font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-[0_8px_24px_rgba(2,32,71,0.25)]',
        sizeToClasses[size],
        className
      )}
      aria-hidden='true'
    >
      <span className='absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary/80' />
      <span className='absolute inset-0 translate-y-1/2 scale-[1.4] bg-gradient-to-t from-white/60 via-white/10 to-transparent opacity-40 blur-xl' />
      <span className='relative z-10'>TC</span>
    </span>
  );
}

export default LogoMark;
