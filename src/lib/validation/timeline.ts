/**
 * lib/validation/timeline — esquema Zod del formulario de eventos (timeline).
 *
 * Valida la entrada del usuario antes de persistir. Las fechas se comprueban con
 * `Date.parse` además del patrón, para descartar fechas imposibles.
 */
import { z } from 'zod';

export const EVENT_KINDS = [
  'milestone',
  'purchase',
  'investment',
  'debt',
  'income',
  'family',
  'other',
] as const;

export const eventFormSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha no válida'),
  kind: z.enum(EVENT_KINDS),
  note: z.string().trim().optional(),
});
export type EventFormValues = z.infer<typeof eventFormSchema>;
