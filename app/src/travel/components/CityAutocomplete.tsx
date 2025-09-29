import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

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
  lat: number;
  lon: number;
};

export const CITY_SUGGESTIONS: CitySuggestion[] = [
  { city: 'Toronto', province: 'ON', lat: 43.6532, lon: -79.3832 },
  { city: 'Ottawa', province: 'ON', lat: 45.4215, lon: -75.6972 },
  { city: 'Montreal', province: 'QC', lat: 45.5019, lon: -73.5674 },
  { city: 'Quebec City', province: 'QC', lat: 46.8139, lon: -71.2080 },
  { city: 'Vancouver', province: 'BC', lat: 49.2827, lon: -123.1207 },
  { city: 'Victoria', province: 'BC', lat: 48.4284, lon: -123.3656 },
  { city: 'Calgary', province: 'AB', lat: 51.0447, lon: -114.0719 },
  { city: 'Edmonton', province: 'AB', lat: 53.5461, lon: -113.4938 },
  { city: 'Winnipeg', province: 'MB', lat: 49.8954, lon: -97.1385 },
  { city: 'Regina', province: 'SK', lat: 50.4452, lon: -104.6189 },
  { city: 'Saskatoon', province: 'SK', lat: 52.1332, lon: -106.6700 },
  { city: 'Halifax', province: 'NS', lat: 44.6488, lon: -63.5752 },
  { city: 'Fredericton', province: 'NB', lat: 45.9636, lon: -66.6431 },
  { city: 'Charlottetown', province: 'PE', lat: 46.2382, lon: -63.1311 },
  { city: 'St. John\'s', province: 'NL', lat: 47.5615, lon: -52.7126 },
  { city: 'Yellowknife', province: 'NT', lat: 62.4540, lon: -114.3718 },
  { city: 'Whitehorse', province: 'YT', lat: 60.7212, lon: -135.0568 },
  { city: 'Iqaluit', province: 'NU', lat: 63.7467, lon: -68.5168 },
];

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
    if (!query) return CITY_SUGGESTIONS.slice(0, 6);
    return CITY_SUGGESTIONS.filter((item) =>
      `${item.city}, ${item.province}`.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
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
        {open && filteredCities.length > 0 && (
          <div className='absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg dark:bg-card'>
            <ul className='max-h-52 overflow-y-auto divide-y divide-border/70 text-sm'>
              {filteredCities.map((item) => (
                <li key={`${item.city}-${item.province}`}>
                  <button
                    type='button'
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-primary/10 hover:text-primary transition-colors'
                    )}
                  >
                    <span className='font-medium'>{item.city}</span>
                    <span className='text-muted-foreground ml-1'>({item.province})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CityAutocomplete;
