import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DatePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatISO(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DatePicker({ id, label, value, onChange, min, max, className }: DatePickerProps) {
  const parsedValue = value ? new Date(value) : undefined;
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => parsedValue ?? new Date());
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (parsedValue) {
      setCurrentMonth(parsedValue);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const startOffset = (startOfMonth.getDay() + 6) % 7; // convert Sunday=0 to Monday=0
    const totalDays = endOfMonth.getDate();

    const days: Array<Date | null> = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const monthLabel = new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' }).format(currentMonth);

  const minDate = min ? new Date(min) : undefined;
  const maxDate = max ? new Date(max) : undefined;

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <label htmlFor={id} className='space-y-2 block'>
        <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>{label}</span>
        <button
          type='button'
          onClick={() => setOpen((prev) => !prev)}
          className='w-full inline-flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm font-medium text-foreground shadow-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value
              ? new Intl.DateTimeFormat('en-CA', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).format(new Date(value))
              : 'Select date'}
          </span>
          <Calendar className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
        </button>
      </label>
      <input type='hidden' id={id} value={value} readOnly />

      {open && (
        <div className='absolute left-0 z-50 mt-2 w-full max-w-xs rounded-xl border border-border bg-background/95 shadow-xl backdrop-blur-lg dark:bg-card/95'>
          <div className='flex items-center justify-between px-3 pb-2 pt-3'>
            <button
              type='button'
              className='rounded-full p-1 hover:bg-muted'
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              aria-label='Previous month'
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
            <span className='text-sm font-semibold'>{monthLabel}</span>
            <button
              type='button'
              className='rounded-full p-1 hover:bg-muted'
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              aria-label='Next month'
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
          <div className='grid grid-cols-7 gap-1 px-3 pb-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-1 px-3 pb-4 text-sm'>
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <span key={`empty-${idx}`} className='h-9' />;
              }

              const iso = formatISO(date);
              const isSelected = value === iso;
              const disabled = isDisabled(date);

              return (
                <button
                  type='button'
                  key={iso}
                  onClick={() => {
                    if (disabled) return;
                    onChange(iso);
                    setOpen(false);
                  }}
                  disabled={disabled}
                  className={cn(
                    'h-9 w-full rounded-lg transition-colors duration-200',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'hover:bg-primary/10 text-foreground',
                    disabled && 'text-muted-foreground cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
