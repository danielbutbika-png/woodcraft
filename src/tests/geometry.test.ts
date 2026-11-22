import { describe, expect, it } from 'vitest'
import { calculate, geometryErrors, type PartSpec } from '../domain/engine'
import { PLANS } from '../domain/plans'
import { testBox } from './fixtures/testBox'

const outer = { width: 100, depth: 100, height: 100 }
const panel = (id: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): PartSpec => ({
  id,
  name: id,
  material: 'אורן מוקצע',
  thickness: 10,
  length: x1 - x0,
  width: y1 - y0,
  quantity: 1,
  placements: [{ x0, y0, z0, x1, y1, z1 }],
})

describe('בדיקות גיאומטריה במנוע', () => {
  it('מאשר חלקים שאינם חופפים ונוגעים זה בזה לאורך פנים', () => {
    const parts = [panel('A', 0, 0, 0, 100, 100, 10), panel('B', 0, 0, 10, 100, 10, 20)]
    expect(geometryErrors(parts, outer)).toEqual([])
  })

  it('דוחה חפיפה נפחית בין שני חלקים', () => {
    const parts = [panel('A', 0, 0, 0, 50, 50, 10), panel('B', 40, 40, 0, 90, 90, 10)]
    const errs = geometryErrors(parts, outer)
    expect(errs.some((e) => e.includes('חפיפה') && e.includes('A') && e.includes('B'))).toBe(true)
  })

  it('דוחה חלק שחורג מהמידות החיצוניות', () => {
    const parts = [panel('A', 0, 0, 0, 120, 10, 10)]
    expect(geometryErrors(parts, outer).some((e) => e.includes('חורג'))).toBe(true)
  })

  it('דוחה מיקום שמידותיו אינן תואמות לחלק', () => {
    const parts = [{ ...panel('A', 0, 0, 0, 50, 50, 10), length: 80 }]
    expect(geometryErrors(parts, outer).some((e) => e.includes('אינו תואם'))).toBe(true)
  })

  it('דוחה כמות מיקומים שאינה שווה לכמות החלקים', () => {
    const p = { ...panel('A', 0, 0, 0, 50, 50, 10), quantity: 2 }
    expect(geometryErrors([p], outer).some((e) => e.includes('מיקומים'))).toBe(true)
  })

  it('calculate דוחה תוכנית עם חפיפה ומחזיר סטטוס rejected', () => {
    const model = {
      ...testBox(),
      buildParts: () => [panel('A', 0, 0, 0, 50, 50, 10), panel('B', 40, 40, 0, 90, 90, 10)],
      outerSize: () => outer,
    }
    const r = calculate(model, { variables: { innerW: 300, innerD: 200, innerH: 120 }, thickness: 18 })
    expect(r.ok).toBe(false)
    expect(r.status).toBe('rejected')
  })
})

describe('מיקומי התוכניות תואמים למידות', () => {
  for (const [id, plan] of Object.entries(PLANS)) {
    it(`${id}: לכל יחידה יש מיקום, ואין חפיפות בתצורה ברירת המחדל`, () => {
      const v = Object.fromEntries(plan.variables.map((x) => [x.key, x.default]))
      const r = calculate(plan, { variables: v, thickness: plan.allowedThicknesses[0] })
      expect(r.ok, r.errors.join(' | ')).toBe(true)
      for (const p of r.parts) {
        expect(p.placements?.length, p.id).toBe(p.quantity)
      }
    })
  }
})
