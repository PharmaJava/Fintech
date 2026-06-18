import { Check, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { t, type MessageKey } from '@/i18n';
import { formatEur } from '@/lib/format';
import { useGoalsStore } from '@/stores/goalsStore';
import type { Goal } from '@/types/domain';

/** Sugerencias de metas comunes (nombre + importe orientativo, editable). */
const GOAL_PRESETS: { labelKey: MessageKey; amount: number }[] = [
  { labelKey: 'goals.preset.emergency', amount: 10_000 },
  { labelKey: 'goals.preset.vacations', amount: 3_000 },
  { labelKey: 'goals.preset.home', amount: 30_000 },
  { labelKey: 'goals.preset.car', amount: 15_000 },
];

function AddGoalDialog() {
  const addGoal = useGoalsStore((s) => s.addGoal);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [date, setDate] = useState('');

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const value = Number(target);
    if (name.trim() === '' || !Number.isFinite(value) || value <= 0) return;
    await addGoal(name.trim(), value, date || undefined);
    setName('');
    setTarget('');
    setDate('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          {t('goals.add')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('goals.add')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('goals.presets')}</Label>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_PRESETS.map((preset) => (
                <Button
                  key={preset.labelKey}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setName(t(preset.labelKey));
                    setTarget(String(preset.amount));
                  }}
                >
                  {t(preset.labelKey)}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-name">{t('goals.name')}</Label>
            <Input
              id="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-target">{t('goals.target')}</Label>
            <Input
              id="goal-target"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-date">{t('goals.targetDate')}</Label>
            <Input
              id="goal-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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

function ContributeDialog({ goal }: { goal: Goal }) {
  const contribute = useGoalsStore((s) => s.contribute);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    await contribute(goal.id, value);
    setAmount('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={t('goals.contribute')}>
          <TrendingUp className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('goals.contribute')}: {goal.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="contribute-amount">
              {t('goals.contributeAmount')}
            </Label>
            <Input
              id="contribute-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
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

/** Tarjeta de metas de ahorro con progreso, aportar y borrar. */
export function GoalsCard() {
  const goals = useGoalsStore((s) => s.goals);
  const load = useGoalsStore((s) => s.load);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-base">{t('goals.title')}</CardTitle>
        <AddGoalDialog />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {goals.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('goals.empty')}
          </p>
        ) : (
          <ul className="space-y-4">
            {goals.map((goal) => {
              const ratio =
                goal.target > 0 ? Math.min(goal.current / goal.target, 1) : 0;
              const reached = goal.current >= goal.target && goal.target > 0;
              return (
                <li key={goal.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1 truncate font-medium">
                      {reached && (
                        <Check className="size-4 shrink-0 text-primary" />
                      )}
                      {goal.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <ContributeDialog goal={goal} />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={t('common.delete')}
                        onClick={() => void deleteGoal(goal.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatEur(goal.current)} / {formatEur(goal.target)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
