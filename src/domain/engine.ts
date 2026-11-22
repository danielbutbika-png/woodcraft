/**
 * מנוע התאמת מידות.
 *
 * עקרונות:
 * - כל החישובים במילימטרים. מידות חיצוניות ופנימיות מופרדות.
 * - שינוי ברוחב לא משנה עובי, מחברים או ממדי חלקים שאינם ניתנים להתאמה.
 * - הערכים נבדקים מול טווחים מותרים לכל דגם; ערך שלילי, אפסי או לא סופי נדחה.
 * - בדיקת התאמה לשטח הפנוי כולל מרווחים.
 * - תוכנית שאינה מאומתת מחזירה סטטוס "draft" ואינה מאושרת לבנייה, גם אם החישוב עבר.
 */

import { isFiniteNumber, roundMm, type Mm } from './units'

export interface VariableDef {
  key: string
  label: string
  min: Mm
  max: Mm
  default: Mm
}

export interface Space {
  width: Mm
  depth: Mm
  height: Mm
}

export interface UserInputs {
  /** ערכי המשתנים של הדגם, לפי key. */
  variables: Record<string, Mm>
  /** השטח הפנוי שהמשתמש הזין. */
  space?: Space
  /** מרווח נדרש מכל צד של השטח. */
  clearance?: Mm
  /** עובי החומר שנבחר מתוך האפשרויות המאושרות לדגם. */
  thickness: Mm
  /** שם החומר שנבחר מתוך האפשרויות המאושרות לדגם. */
  material?: string
}

/** תיבה צירית במרחב הדגם. הראשית (0,0,0) בפינה התחתונה הקדמית-שמאלית. */
export interface Box {
  x0: Mm
  y0: Mm
  z0: Mm
  x1: Mm
  y1: Mm
  z1: Mm
}

export interface PartSpec {
  id: string
  name: string
  material: string
  thickness: Mm
  length: Mm
  width: Mm
  quantity: number
  /** מיקום מדויק של כל יחידה בדגם. כשקיים, המנוע בודק חפיפות וחריגה מהגבולות. */
  placements?: Box[]
}

export interface ModelDef {
  id: string
  /** 'verified' רק לאחר בדיקה מקצועית ממקור מאומת. */
  verification: 'unverified' | 'verified'
  variables: VariableDef[]
  allowedThicknesses: Mm[]
  allowedMaterials?: string[]
  /** פונקציה שמחזירה את החלקים לפי המשתנים והעובי. */
  buildParts: (v: Record<string, Mm>, thickness: Mm) => PartSpec[]
  /** גובה, רוחב ועומק החיצוניים, לפי המשתנים. */
  outerSize: (v: Record<string, Mm>, thickness: Mm) => Space
  /** בדיקות תכנון ספציפיות לדגם (למשל מספר תאים, עומק מינימלי). */
  checks?: (v: Record<string, Mm>, thickness: Mm) => string[]
}

export interface CalcResult {
  ok: boolean
  status: 'verified' | 'draft' | 'rejected'
  errors: string[]
  warnings: string[]
  parts: PartSpec[]
  outer: Space | null
  bom: { material: string; thickness: Mm; area: number; pieces: number }[]
}

const reject = (errors: string[]): CalcResult => ({
  ok: false,
  status: 'rejected',
  errors,
  warnings: [],
  parts: [],
  outer: null,
  bom: [],
})

export function validateInputs(model: ModelDef, inputs: UserInputs): string[] {
  const errors: string[] = []

  for (const def of model.variables) {
    const value = inputs.variables[def.key]
    if (!isFiniteNumber(value)) {
      errors.push(`${def.label}: הערך אינו מספר תקין.`)
      continue
    }
    if (value < def.min || value > def.max) {
      errors.push(`${def.label}: הערך חייב להיות בין ${def.min} ל-${def.max} מ"מ.`)
    }
  }

  if (!model.allowedThicknesses.includes(inputs.thickness)) {
    errors.push('העובי שנבחר אינו מתוך האפשרויות המאושרות לדגם.')
  }

  if (inputs.material !== undefined && model.allowedMaterials) {
    if (!model.allowedMaterials.includes(inputs.material)) {
      errors.push('החומר שנבחר אינו מתוך האפשרויות המאושרות לדגם.')
    }
  }

  if (inputs.clearance !== undefined) {
    if (!isFiniteNumber(inputs.clearance) || inputs.clearance < 0) {
      errors.push('המרווח הנדרש חייב להיות מספר אי-שלילי.')
    }
  }

  return errors
}

export function validateParts(parts: PartSpec[]): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const p of parts) {
    if (seen.has(p.id)) errors.push(`מזהה חלק כפול: ${p.id}.`)
    seen.add(p.id)
    if (!(p.length > 0) || !(p.width > 0) || !(p.thickness > 0)) {
      errors.push(`לחלק ${p.id} יש מידה אפסית או שלילית.`)
    }
    if (!Number.isInteger(p.quantity) || p.quantity < 1) {
      errors.push(`לחלק ${p.id} כמות לא תקינה.`)
    }
  }
  return errors
}

export function checkFit(outer: Space, space: Space, clearance: Mm): string[] {
  const errors: string[] = []
  const dims: [keyof Space, string][] = [
    ['width', 'רוחב'],
    ['depth', 'עומק'],
    ['height', 'גובה'],
  ]
  for (const [key, label] of dims) {
    const available = space[key] - 2 * clearance
    if (outer[key] > available) {
      errors.push(
        `ה${label} החיצוני (${roundMm(outer[key])} מ"מ) חורג מהשטח הפנוי (${roundMm(available)} מ"מ אחרי מרווחים).`,
      )
    }
  }
  return errors
}

/** כתב כמויות מאוחד לפי חומר ועובי. שטח במ"ר. */
export function buildBom(parts: PartSpec[]): CalcResult['bom'] {
  const map = new Map<string, { material: string; thickness: Mm; area: number; pieces: number }>()
  for (const p of parts) {
    const key = `${p.material}|${p.thickness}`
    const row = map.get(key) ?? { material: p.material, thickness: p.thickness, area: 0, pieces: 0 }
    row.area += ((p.length * p.width) / 1_000_000) * p.quantity
    row.pieces += p.quantity
    map.set(key, row)
  }
  return [...map.values()].map((r) => ({ ...r, area: Math.round(r.area * 10000) / 10000 }))
}

export function calculate(model: ModelDef, inputs: UserInputs): CalcResult {
  const inputErrors = validateInputs(model, inputs)
  if (inputErrors.length) return reject(inputErrors)

  const vars = inputs.variables
  const planErrors = model.checks ? model.checks(vars, inputs.thickness) : []
  if (planErrors.length) return reject(planErrors)

  const parts = model.buildParts(vars, inputs.thickness).map((p) => ({
    ...p,
    material: inputs.material ?? p.material,
    length: roundMm(p.length),
    width: roundMm(p.width),
    thickness: roundMm(p.thickness),
  }))
  const partErrors = validateParts(parts)
  if (partErrors.length) return reject(partErrors)

  const outer = model.outerSize(vars, inputs.thickness)
  const geoErrors = geometryErrors(parts, outer)
  if (geoErrors.length) {
    return { ...reject(geoErrors), outer }
  }
  const fitErrors = inputs.space ? checkFit(outer, inputs.space, inputs.clearance ?? 0) : []
  if (fitErrors.length) {
    return { ...reject(fitErrors), outer }
  }

  const isVerified = model.verification === 'verified'
  return {
    ok: true,
    status: isVerified ? 'verified' : 'draft',
    errors: [],
    warnings: isVerified ? [] : ['הדגם טרם אומת. החישוב הוא טיוטה בלבד ואינו מאושר לבנייה.'],
    parts,
    outer,
    bom: buildBom(parts),
  }
}

const EPS = 0.01

const boxExtents = (b: Box): number[] => [b.x1 - b.x0, b.y1 - b.y0, b.z1 - b.z0]

/**
 * בדיקות גיאומטריה: מספר היחידות, מידות התיבה מול מידות החלק,
 * חריגה מהמידות החיצוניות, וחפיפה נפחית בין כל שתי יחידות.
 * מגע לאורך פנים אינו נחשב לחפיפה.
 */
export function geometryErrors(parts: PartSpec[], outer: Space): string[] {
  const errors: string[] = []
  const all: { id: string; box: Box }[] = []

  for (const p of parts) {
    if (!p.placements) continue
    if (p.placements.length !== p.quantity) {
      errors.push(`לחלק ${p.id} יש ${p.placements.length} מיקומים אך כמות של ${p.quantity}.`)
    }
    const want = [p.length, p.width, p.thickness].sort((a, b) => a - b)
    for (const box of p.placements) {
      const got = boxExtents(box).sort((a, b) => a - b)
      if (got.some((g, i) => Math.abs(g - want[i]) > 0.5)) {
        errors.push(`מיקום החלק ${p.id} אינו תואם למידות החלק.`)
      }
      if (box.x0 < -EPS || box.y0 < -EPS || box.z0 < -EPS ||
          box.x1 > outer.width + EPS || box.y1 > outer.depth + EPS || box.z1 > outer.height + EPS) {
        errors.push(`החלק ${p.id} חורג מהמידות החיצוניות של הדגם.`)
      }
      all.push({ id: p.id, box })
    }
  }

  let overlaps = 0
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i].box
      const b = all[j].box
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)
      const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)
      const oz = Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0)
      if (ox > EPS && oy > EPS && oz > EPS) {
        overlaps++
        if (overlaps <= 3) errors.push(`חפיפה בין ${all[i].id} ל-${all[j].id}.`)
      }
    }
  }
  if (overlaps > 3) errors.push(`סה"כ ${overlaps} חפיפות בין חלקים.`)
  return errors
}

/** ערכי ברירת מחדל מכל המשתנים של הדגם. */
export function defaultVariables(model: ModelDef): Record<string, Mm> {
  return Object.fromEntries(model.variables.map((v) => [v.key, v.default]))
}
