import { t } from '@/i18n';
import type { RecurringFrequency, TransactionType } from '@/types/domain';

const TYPE_KEYS = {
  income: 'transactions.type.income',
  expense: 'transactions.type.expense',
  transfer: 'transactions.type.transfer',
} as const;

const FREQUENCY_KEYS = {
  daily: 'freq.daily',
  weekly: 'freq.weekly',
  monthly: 'freq.monthly',
  quarterly: 'freq.quarterly',
  yearly: 'freq.yearly',
} as const;

export const transactionTypeLabel = (type: TransactionType): string =>
  t(TYPE_KEYS[type]);

export const frequencyLabel = (frequency: RecurringFrequency): string =>
  t(FREQUENCY_KEYS[frequency]);

export const TRANSACTION_TYPES: TransactionType[] = [
  'expense',
  'income',
  'transfer',
];

export const FREQUENCIES: RecurringFrequency[] = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
];
