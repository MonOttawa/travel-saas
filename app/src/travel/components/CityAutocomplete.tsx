import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import canadianCities from '../../../data/canadian-cities.json';

interface CityAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSelectSuggestion?: (suggestion: CitySuggestion | null) => void;
}

export type CitySuggestion = {
  city: string;
  province: string;
  lat: number | null;
  lon: number | null;
};

const CITY_SUGGESTIONS: CitySuggestion[] = (canadianCities as { cities: CitySuggestion[] }).cities;

export function CityAutocomplete({ id, label, value, onChange, placeholder, onSelectSuggestion }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setQuery(value);
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

  const filteredCities = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle
      ? CITY_SUGGESTIONS.filter((item) =>
          `${item.city}, ${item.province}`.toLowerCase().includes(needle)
        )
      : CITY_SUGGESTIONS;
    return matches.slice(0, 12);
  }, [query]);

  const handleSelect = (suggestion: CitySuggestion) => {
    const formatted = `${suggestion.city}, ${suggestion.province}`;
    setQuery(formatted);
    onChange(formatted);
    setOpen(false);
    inputRef.current?.blur();
    onSelectSuggestion?.(suggestion);
  };

  return (
    <div className='space-y-2' ref={containerRef}>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
        {label}
      </label>
      <div className='relative'>
        <input
          id={id}
          ref={inputRef}
          value={query}
          placeholder={placeholder}
          autoComplete='off'
          onChange={(event) => {
            const nextValue = event.target.value;
            setQuery(nextValue);
            onChange(nextValue);
            setOpen(true);
            onSelectSuggestion?.(null);
          }}
          onFocus={() => setOpen(true)}
          className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
        />
        {open && (
          <div className='absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg dark:bg-card'>
            {filteredCities.length > 0 ? (
              <ul className='max-h-60 overflow-y-auto divide-y divide-border/70 text-sm'>
                {filteredCities.map((item) => (
                  <li key={`${item.city}-${item.province}`}>
                    <button
                      type='button'
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-full px-3 py-2 text-left transition-colors hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      <span className='font-medium'>{item.city}</span>
                      <span className='text-muted-foreground ml-1'>({item.province})</span>
                      {item.lat === null || item.lon === null ? (
                        <span className='ml-2 text-[11px] uppercase tracking-wide text-amber-600 dark:text-amber-400'>Manual distance</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className='px-3 py-2 text-sm text-muted-foreground'>No matching cities found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CityAutocomplete;
