/**
 * types/domain — tipos de dominio compartidos (forma DESCIFRADA, en memoria).
 *
 * Estos son los objetos con los que trabaja la app. La forma cifrada que se
 * persiste en IndexedDB vive en `lib/db/schema.ts`. Los repositorios traducen
 * entre ambas formas. Los campos marcados como sensibles (*) se cifran al
 * persistir.
 *
 * Fechas: siempre ISO 8601 UTC en almacenamiento; el formateo local va en UI.
 * Importes: siempre `Cents` (entero), nunca floats.
 */
import type { Cents } from '@/lib/money';

export type AccountType = 'cash' | 'bank' | 'broker' | 'other';

export type AssetCategory =
  | 'liquid'
  | 'invested'
  | 'real_estate'
  | 'vehicle'
  | 'other';

export type RefType = 'asset' | 'liability';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type CategoryKind = 'income' | 'expense';

export type RecurringFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

/** Cuenta/contenedor de dinero liquido. (* name sensible) */
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  createdAt: string;
}

/** Activo. (* name sensible) */
export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  currency: string;
  createdAt: string;
}

/** Pasivo/deuda. (* name y principal sensibles) */
export interface Liability {
  id: string;
  name: string;
  principal: Cents;
  interestRate?: number;
  createdAt: string;
}

/** Valoracion fechada de un Asset/Liability: base de la curva de patrimonio. (* value sensible) */
export interface Valuation {
  id: string;
  refId: string;
  refType: RefType;
  value: Cents;
  date: string;
  createdAt: string;
}

/** Movimiento. (* amount y note sensibles) */
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: Cents;
  accountId: string;
  categoryId: string;
  date: string;
  note: string;
  tags: string[];
  createdAt: string;
}

/** Categoria de ingreso/gasto. (* name sensible) */
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  kind: CategoryKind;
  color: string;
}

/** Regla de movimiento recurrente. */
export interface RecurringRule {
  id: string;
  templateTxn: Omit<Transaction, 'id' | 'createdAt' | 'date'>;
  frequency: RecurringFrequency;
  nextRun: string;
}

/** Presupuesto mensual por categoria. (* limit sensible) */
export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  limit: Cents;
}

/** Meta de ahorro. (* name, target y current sensibles) */
export interface Goal {
  id: string;
  name: string;
  target: Cents;
  current: Cents;
  targetDate?: string;
}

/** Regla de auto-categorizacion: si la nota contiene `keyword`, asigna `categoryId`. (* keyword sensible) */
export interface AutoRule {
  id: string;
  keyword: string;
  categoryId: string;
}
