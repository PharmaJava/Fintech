import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface Props {
  month: string; // YYYY-MM
  onChange: (month: string) => void;
}

const shift = (month: string, delta: number): string =>
  format(
    delta < 0
      ? subMonths(parseISO(`${month}-01`), Math.abs(delta))
      : addMonths(parseISO(`${month}-01`), delta),
    'yyyy-MM',
  );

/** Selector de mes (anterior/siguiente) usado en movimientos y presupuestos. */
export function MonthPicker({ month, onChange }: Props) {
  const label = format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: es });

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        size="icon"
        variant="outline"
        aria-label="Mes anterior"
        onClick={() => onChange(shift(month, -1))}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="flex-1 text-center font-medium capitalize">{label}</span>
      <Button
        size="icon"
        variant="outline"
        aria-label="Mes siguiente"
        onClick={() => onChange(shift(month, 1))}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
