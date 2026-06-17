/**
 * lib/validation/networth — esquemas Zod para la feature de patrimonio.
 *
 * Los formularios trabajan en unidad mayor (euros); la conversion a `Cents` se
 * hace en el store al persistir. Aqui solo validamos la entrada del usuario.
 */
import { z } from 'zod';

export const ASSET_CATEGORIES = [
  'liquid',
  'invested',
  'real_estate',
  'vehicle',
  'other',
] as const;

const positiveAmount = z
  .number({ message: 'Introduce un importe valido' })
  .nonnegative('El importe no puede ser negativo');

export const assetFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  category: z.enum(ASSET_CATEGORIES),
  value: positiveAmount,
});
export type AssetFormValues = z.infer<typeof assetFormSchema>;

export const liabilityFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  principal: positiveAmount,
  /** Interes anual en % (opcional); se guarda como fraccion. */
  interestRatePercent: z.number().min(0).max(100).optional(),
});
export type LiabilityFormValues = z.infer<typeof liabilityFormSchema>;

export const valuationFormSchema = z.object({
  value: positiveAmount,
  /** Fecha YYYY-MM-DD (de un <input type="date">). */
  date: z.string().min(1, 'La fecha es obligatoria'),
});
export type ValuationFormValues = z.infer<typeof valuationFormSchema>;
