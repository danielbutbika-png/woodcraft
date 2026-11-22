import { describe, expect, it } from 'vitest'
import { PLANS } from '../domain/plans'
import { calculate, type UserInputs } from '../domain/engine'
import type { PlanDef } from '../domain/plans/types'
import { WOOD_NAMES } from '../domain/plans/woods'
import { CATEGORIES, MODELS } from '../domain/catalog'

const BIG = { width: 2000, depth: 2000, height: 2000 }
const ids = Object.keys(PLANS)

/** שלוש תצורות לכל דגם: ברירת מחדל, מינימום וטווח מקסימלי (עם עובי אחר בכל תצורה). */
function configurations(plan: PlanDef): { label: string; inputs: UserInputs }[] {
  const t = plan.allowedThicknesses
  const defaults = Object.fromEntries(plan.variables.map((v) => [v.key, v.default]))
  const mins = Object.fromEntries(plan.variables.map((v) => [v.key, v.min]))
  const maxes = Object.fromEntries(plan.variables.map((v) => [v.key, v.max]))
  return [
    { label: 'ברירת מחדל', inputs: { variables: defaults, thickness: t[0], material: WOOD_NAMES[0] } },
    { label: 'מינימום', inputs: { variables: mins, thickness: t[1], material: WOOD_NAMES[1] } },
    { label: 'מקסימום', inputs: { variables: maxes, thickness: t[2], material: WOOD_NAMES[2] } },
  ]
}

describe('קטלוג ותוכניות', () => {
  it('כל תוכנית משויכת לדגם קיים ולקטגוריה קיימת', () => {
    for (const id of ids) {
      const model = MODELS.find((m) => m.id === id)
      expect(model, id).toBeDefined()
      expect(CATEGORIES.some((c) => c.id === PLANS[id].categoryId), id).toBe(true)
    }
  })

  it('כל התוכניות נשארות בסטטוס לא מאומת', () => {
    for (const id of ids) expect(PLANS[id].verification, id).toBe('unverified')
  })
})

describe.each(ids)('תוכנית %s', (id) => {
  const plan = PLANS[id]
  const cases = configurations(plan)

  it.each(cases.map((c) => [c.label, c.inputs] as const))('תצורה "%s" מחושבת בהצלחה כטיוטה', (_label, inputs) => {
    const r = calculate(plan, inputs)
    expect(r.ok, r.errors.join(' | ')).toBe(true)
    expect(r.status).toBe('draft')
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it.each(cases.map((c) => [c.label, c.inputs] as const))('תצורה "%s": כל החלקים חיוביים ובעובי שנבחר', (_label, inputs) => {
    const r = calculate(plan, inputs)
    for (const p of r.parts) {
      expect(p.length, p.id).toBeGreaterThan(0)
      expect(p.width, p.id).toBeGreaterThan(0)
      expect(p.thickness, p.id).toBe(inputs.thickness)
      expect(Number.isInteger(p.quantity), p.id).toBe(true)
    }
  })

  it.each(cases.map((c) => [c.label, c.inputs] as const))('תצורה "%s": כתב הכמויות תואם לחלקים', (_label, inputs) => {
    const r = calculate(plan, inputs)
    const pieces = r.parts.reduce((s, p) => s + p.quantity, 0)
    expect(r.bom.reduce((s, row) => s + row.pieces, 0)).toBe(pieces)
    const area = r.parts.reduce((s, p) => s + (p.length * p.width * p.quantity) / 1_000_000, 0)
    expect(r.bom.reduce((s, row) => s + row.area, 0)).toBeCloseTo(area, 3)
  })

  it.each(cases.map((c) => [c.label, c.inputs] as const))('תצורה "%s": החומר שנבחר מופיע בכל החלקים', (_label, inputs) => {
    const r = calculate(plan, inputs)
    expect(r.parts.every((p) => p.material === inputs.material)).toBe(true)
  })

  it.each(cases.map((c) => [c.label, c.inputs] as const))('תצורה "%s": מתאים לשטח גדול ונדחה בשטח קטן מדי', (_label, inputs) => {
    expect(calculate(plan, { ...inputs, space: BIG, clearance: 5 }).ok).toBe(true)
    const tiny = calculate(plan, { ...inputs, space: { width: 1, depth: 1, height: 1 } })
    expect(tiny.ok).toBe(false)
    expect(tiny.status).toBe('rejected')
  })

  it('דוחה עובי ומשתנה מחוץ לטווח', () => {
    const base = cases[0].inputs
    expect(calculate(plan, { ...base, thickness: 15 }).ok).toBe(false)
    const first = plan.variables[0]
    expect(calculate(plan, { ...base, variables: { ...base.variables, [first.key]: first.max + 1 } }).ok).toBe(false)
  })

  it('דוחה חומר שאינו מאושר', () => {
    expect(calculate(plan, { ...cases[0].inputs, material: 'עץ שלא קיים' }).ok).toBe(false)
  })
})

describe('בדיקות ספציפיות לדגם', () => {
  it('קופסת אחסון: התחתית והמכסה תואמים למידות החיצוניות', () => {
    const plan = PLANS['storage-box']
    const r = calculate(plan, { variables: { innerW: 300, innerD: 200, innerH: 120 }, thickness: 18 })
    const bottom = r.parts.find((p) => p.id === 'A01')!
    expect(bottom.length).toBe(r.outer!.width)
    expect(bottom.width).toBe(r.outer!.depth)
    expect(r.outer!.height).toBe(120 + 2 * 18)
  })

  it('קופסת אחסון: שינוי רוחב משנה רק את חלקי הרוחב ולא את העובי', () => {
    const plan = PLANS['storage-box']
    const a = calculate(plan, { variables: { innerW: 300, innerD: 200, innerH: 120 }, thickness: 12 })
    const b = calculate(plan, { variables: { innerW: 400, innerD: 200, innerH: 120 }, thickness: 12 })
    expect(b.parts.every((p) => p.thickness === 12)).toBe(true)
    expect(b.parts.find((p) => p.id === 'A03')!.length).toBe(a.parts.find((p) => p.id === 'A03')!.length)
    expect(b.parts.find((p) => p.id === 'A01')!.length).toBe(a.parts.find((p) => p.id === 'A01')!.length + 100)
  })

  it('מעמד לטלפון: בדיקת מקום לטלפון מחזירה הסבר כשהעומק קטן מדי', () => {
    const plan = PLANS['phone-stand']
    const errors = plan.checks!({ standW: 90, baseD: 60, backH: 110 }, 18)
    expect(errors.length).toBe(1)
    expect(errors[0]).toContain('עומק הבסיס')
    expect(plan.checks!({ standW: 90, baseD: 120, backH: 110 }, 18)).toEqual([])
  })

  it('ארגונית שולחן: מחיצות לפי מספר התאים, ללא מחיצה לתא אחד', () => {
    const plan = PLANS['pen-holder']
    const three = calculate(plan, { variables: { length: 300, depth: 100, height: 80, compartments: 3 }, thickness: 9 })
    expect(three.parts.find((p) => p.id === 'D01')!.quantity).toBe(2)
    const one = calculate(plan, { variables: { length: 300, depth: 100, height: 80, compartments: 1 }, thickness: 9 })
    expect(one.parts.some((p) => p.id === 'D01')).toBe(false)
  })

  it('ארגונית שולחן: מספר תאים רב מדי לאורך קטן נדחה', () => {
    const plan = PLANS['pen-holder']
    const r = calculate(plan, { variables: { length: 150, depth: 100, height: 80, compartments: 4 }, thickness: 9 })
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.includes('רוחב התא'))).toBe(true)
  })

  it('ארגונית שולחן: מספר תאים לא שלם נדחה', () => {
    const plan = PLANS['pen-holder']
    const r = calculate(plan, { variables: { length: 300, depth: 100, height: 80, compartments: 2.5 }, thickness: 9 })
    expect(r.ok).toBe(false)
  })
})
