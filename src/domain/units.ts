/** כל החישובים הפנימיים מתבצעים במילימטרים. */
export type Mm = number

export const mmFromCm = (cm: number): Mm => cm * 10
export const mmFromM = (m: number): Mm => m * 1000
export const cmFromMm = (mm: Mm): number => mm / 10

/** עיגול למילימטר שלם, כדי למנוע שברי מילימטר בחיתוכים. */
export const roundMm = (mm: Mm): Mm => Math.round(mm)

export const formatMm = (mm: Mm): string => `${roundMm(mm)} מ"מ`

export const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)
