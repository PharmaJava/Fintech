import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina clases de Tailwind de forma segura (shadcn/ui helper). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
