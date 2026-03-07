export type ClassValue = string | false | null | undefined

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ')
}


export function getFillPercentage(completed: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}
