import { format } from 'date-fns';
import {
  Banknote,
  Circle,
  Flag,
  Heart,
  Landmark,
  Plus,
  ShoppingCart,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { t, type MessageKey } from '@/i18n';
import { formatDate, formatEur } from '@/lib/format';
import type { Cents } from '@/lib/money';
import { cn } from '@/lib/utils';
import { EVENT_KINDS, eventFormSchema } from '@/lib/validation/timeline';
import { useEventsStore } from '@/stores/eventsStore';
import { useNetworthStore } from '@/stores/networthStore';
import type { EventKind } from '@/types/domain';

import { buildTimeline } from './timeline';

const KIND_ICON: Record<EventKind, typeof Flag> = {
  milestone: Flag,
  purchase: ShoppingCart,
  investment: TrendingUp,
  debt: Landmark,
  income: Banknote,
  family: Heart,
  other: Circle,
};

const kindLabel = (kind: EventKind): string =>
  t(`event.kind.${kind}` as MessageKey);

/** Importe con signo explícito (formatEur ya antepone "-" a los negativos). */
const signedEur = (value: Cents): string =>
  (value > 0 ? '+' : '') + formatEur(value);

function AddEventDialog() {
  const addEvent = useEventsStore((s) => s.addEvent);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [kind, setKind] = useState<EventKind>('milestone');
  const [note, setNote] = useState('');

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const parsed = eventFormSchema.safeParse({ title, date, kind, note });
    if (!parsed.success) return;
    const { note: parsedNote, ...rest } = parsed.data;
    await addEvent({
      ...rest,
      ...(parsedNote ? { note: parsedNote } : {}),
    });
    setTitle('');
    setNote('');
    setKind('milestone');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          {t('timeline.add')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('timeline.add')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">{t('event.title')}</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-date">{t('event.date')}</Label>
            <Input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-kind">{t('event.kind')}</Label>
            <Select
              id="event-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as EventKind)}
            >
              {EVENT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {kindLabel(k)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-note">{t('event.note')}</Label>
            <Input
              id="event-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button type="submit">{t('common.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Cronología financiera: hitos de la vida del usuario con su patrimonio. */
export function TimelinePage() {
  const events = useEventsStore((s) => s.events);
  const loadEvents = useEventsStore((s) => s.load);
  const deleteEvent = useEventsStore((s) => s.deleteEvent);

  const loadNetworth = useNetworthStore((s) => s.load);
  const assets = useNetworthStore((s) => s.assets);
  const liabilities = useNetworthStore((s) => s.liabilities);
  const valuations = useNetworthStore((s) => s.valuations);

  useEffect(() => {
    void loadEvents();
    void loadNetworth();
  }, [loadEvents, loadNetworth]);

  const timeline = useMemo(
    () => buildTimeline(events, assets, liabilities, valuations),
    [events, assets, liabilities, valuations],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <PageHeader
          title={t('timeline.title')}
          description={t('timeline.subtitle')}
        />
        <AddEventDialog />
      </div>

      {timeline.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            {t('timeline.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {timeline.map((group) => (
            <section key={group.year}>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                {group.year}
              </h2>
              <ul className="space-y-3">
                {group.entries.map(({ event, netWorth, netWorthDelta }) => {
                  const Icon = KIND_ICON[event.kind];
                  return (
                    <li key={event.id}>
                      <Card>
                        <CardContent className="flex gap-3 p-4">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {event.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(event.date)} ·{' '}
                                  {kindLabel(event.kind)}
                                </p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={t('common.delete')}
                                onClick={() => void deleteEvent(event.id)}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                            {event.note && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {event.note}
                              </p>
                            )}
                            <div className="mt-2 flex items-baseline gap-2">
                              <span className="text-xs text-muted-foreground">
                                {t('timeline.netWorthAt')}
                              </span>
                              <span className="text-sm font-medium tabular-nums">
                                {formatEur(netWorth)}
                              </span>
                              {netWorthDelta !== null && (
                                <span
                                  className={cn(
                                    'text-xs font-semibold tabular-nums',
                                    netWorthDelta >= 0
                                      ? 'text-primary'
                                      : 'text-destructive',
                                  )}
                                >
                                  {signedEur(netWorthDelta)}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
