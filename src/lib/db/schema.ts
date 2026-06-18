/**
 * lib/db/schema — forma de los registros TAL Y COMO SE PERSISTEN en IndexedDB.
 *
 * Los campos sensibles se guardan como `EncryptedValue` (cifrados). Los campos
 * indexables no sensibles (id, tipo, fecha, moneda, ids de relacion) se guardan
 * en claro para permitir queries/indexes de Dexie. Trade-off asumido: los
 * metadatos no sensibles quedan en claro a cambio de poder indexar.
 */
import type { EncryptedValue } from '@/lib/crypto';
import type {
  AccountType,
  AssetCategory,
  CategoryKind,
  EventKind,
  RecurringFrequency,
  RefType,
  TransactionType,
} from '@/types/domain';

export interface StoredAccount {
  id: string;
  type: AccountType;
  currency: string;
  createdAt: string;
  name: EncryptedValue;
}

export interface StoredAsset {
  id: string;
  category: AssetCategory;
  currency: string;
  createdAt: string;
  name: EncryptedValue;
}

export interface StoredLiability {
  id: string;
  createdAt: string;
  interestRate?: number;
  name: EncryptedValue;
  principal: EncryptedValue;
}

export interface StoredValuation {
  id: string;
  refId: string;
  refType: RefType;
  date: string;
  createdAt: string;
  value: EncryptedValue;
}

export interface StoredTransaction {
  id: string;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  date: string;
  createdAt: string;
  tags: string[];
  amount: EncryptedValue;
  note: EncryptedValue;
}

export interface StoredCategory {
  id: string;
  kind: CategoryKind;
  parentId?: string;
  color: string;
  name: EncryptedValue;
}

export interface StoredRecurringRule {
  id: string;
  frequency: RecurringFrequency;
  nextRun: string;
  /** templateTxn completo cifrado como JSON (contiene amount/note sensibles). */
  templateTxn: EncryptedValue;
}

export interface StoredBudget {
  id: string;
  categoryId: string;
  month: string;
  limit: EncryptedValue;
}

export interface StoredGoal {
  id: string;
  targetDate?: string;
  name: EncryptedValue;
  target: EncryptedValue;
  current: EncryptedValue;
}

export interface StoredAutoRule {
  id: string;
  categoryId: string;
  keyword: EncryptedValue;
}

export interface StoredFinancialEvent {
  id: string;
  date: string;
  kind: EventKind;
  createdAt: string;
  title: EncryptedValue;
  note?: EncryptedValue;
}

/** Metadatos de la app: salt de cifrado, verificador de PIN, version de esquema. */
export interface AppMeta {
  /** Clave fija; solo hay un registro. */
  id: 'app';
  /** Salt unico por instalacion (base64), en claro (no es secreto). */
  salt: string;
  /** Token conocido cifrado: permite verificar el PIN sin guardarlo. */
  verifier: EncryptedValue;
  /** Version del esquema de datos. */
  schemaVersion: number;
  /** Preferencias no sensibles. */
  locale?: string;
}
