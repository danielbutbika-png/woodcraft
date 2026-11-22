import { describe, expect, it } from 'vitest'
import { calculate, defaultVariables, validateInputs, checkFit, buildBom, type UserInputs } from '../domain/engine'
import { mmFromCm, cmFromMm, roundMm } from '../domain/units'
import { testBox } from './fixtures/testBox'

const baseInputs = (overrides: Partial<UserInputs> = {}): UserInputs => ({
  variables: { innerW: 400, innerD: 250, innerH: 150 },
  thickness: 18,
  ...overrides,
})

describe('יחידות מידה', () => {
  it('ממיר ס"מ ומטרים למילימטרים', () => {
    expect(mmFromCm(12.5)).toBe(125)
    expect(cmFromMm(125)).toBe(12.5)
  })
  it('מעגל למילימטר שלם', () => {
    expect(roundMm(17.6)).toBe(18)
  })
})

describe('אימות קלטים', () => {
  it('דוחה ערך שלילי ואפסי', () => {
    const errs = validateInputs(testBox(), baseInputs({ variables: { innerW: -5, innerD: 250, innerH: 150 } }))
    expect(errs.some((e) => e.includes('רוחב פנימי'))).toBe(true)
    const zero = validateInputs(testBox(), baseInputs({ variables: { innerW: 0, innerD: 250, innerH: 150 } }))
    expect(zero.length).toBeGreaterThan(0)
  })

  it('דוחה ערך לא סופי', () => {
    const errs = validateInputs(testBox(), baseInputs({ variables: { innerW: NaN, innerD: 250, innerH: 150 } }))
    expect(errs.length).toBeGreaterThan(0)
  })

  it('דוחה ערך מחוץ לטווח המותר', () => {
    const errs = validateInputs(testBox(), baseInputs({ variables: { innerW: 5000, innerD: 250, innerH: 150 } }))
    expect(errs.length).toBeGreaterThan(0)
  })

  it('דוחה עובי שאינו מאושר לדגם', () => {
    const errs = validateInputs(testBox(), baseInputs({ thickness: 15 }))
    expect(errs.some((e) => e.includes('עובי'))).toBe(true)
  })

  it('דוחה מרווח שלילי', () => {
    const errs = validateInputs(testBox(), baseInputs({ clearance: -1 }))
    expect(errs.length).toBeGreaterThan(0)
  })
})

describe('מידות חיצוניות ופנימיות', () => {
  it('החיצוני שווה לפנימי ועוד שני עוביים בכל ציר', () => {
    const r = calculate(testBox(), baseInputs())
    expect(r.ok).toBe(true)
    expect(r.outer).toEqual({ width: 400 + 36, depth: 250 + 36, height: 150 + 36 })
  })
})

describe('שינוי מידות', () => {
  it('שינוי רוחב לא משנה את העובי, ורק את חלקי הרוחב', () => {
    const narrow = calculate(testBox(), baseInputs())
    const wide = calculate(testBox(), baseInputs({ variables: { innerW: 600, innerD: 250, innerH: 150 } }))
    expect(wide.parts.every((p) => p.thickness === 18)).toBe(true)
    const top = (r: typeof narrow) => r.parts.find((p) => p.id === 'A01')!
    expect(top(narrow).length).toBe(400)
    expect(top(wide).length).toBe(600)
    expect(wide.parts.find((p) => p.id === 'B01')!.length).toBe(150)
  })

  it('שינוי עובי מעדכן את המידות החיצוניות', () => {
    const t9 = calculate(testBox(), baseInputs({ thickness: 9 }))
    expect(t9.outer!.width).toBe(400 + 18)
  })
})

describe('התאמה לשטח פנוי', () => {
  const space = { width: 500, depth: 320, height: 250 }

  it('מקבל כשהחיצוני נכנס לשטח אחרי מרווחים', () => {
    const r = calculate(testBox(), baseInputs({ space, clearance: 10 }))
    expect(r.ok).toBe(true)
  })

  it('דוחה כשהחיצוני חורג מהשטח', () => {
    const r = calculate(testBox(), baseInputs({ space: { width: 420, depth: 300, height: 250 } }))
    expect(r.ok).toBe(false)
    expect(r.status).toBe('rejected')
    expect(r.errors.some((e) => e.includes('רוחב'))).toBe(true)
  })

  it('מרווח מצמצם את השטח הזמין', () => {
    const fits = checkFit({ width: 436, depth: 286, height: 186 }, space, 0)
    expect(fits).toEqual([])
    const noFit = checkFit({ width: 436, depth: 286, height: 186 }, space, 20)
    expect(noFit.length).toBeGreaterThan(0)
  })
})

describe('סטטוס אימות', () => {
  it('תוכנית של דגם לא מאומת היא טיוטה ומזהירה', () => {
    const r = calculate(testBox('unverified'), baseInputs())
    expect(r.ok).toBe(true)
    expect(r.status).toBe('draft')
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it('דגם מאומת מקבל סטטוס verified ללא אזהרה', () => {
    const r = calculate(testBox('verified'), baseInputs())
    expect(r.status).toBe('verified')
    expect(r.warnings).toEqual([])
  })
})

describe('כתב כמויות', () => {
  it('מאחד חלקים לפי חומר ועובי וחושב שטח במ"ר', () => {
    const r = calculate(testBox(), baseInputs())
    expect(r.bom).toHaveLength(1)
    const row = r.bom[0]
    expect(row.material).toBe('אורן')
    expect(row.thickness).toBe(18)
    expect(row.pieces).toBe(4)
    // תחתית 400x250 + מכסה 400x250 + שני צדדים 150x250
    const expectedArea = (2 * 400 * 250 + 2 * 150 * 250) / 1_000_000
    expect(row.area).toBeCloseTo(expectedArea, 4)
  })

  it('buildBom מפריד בין עוביים שונים', () => {
    const bom = buildBom([
      { id: 'a', name: '', material: 'אורן', thickness: 9, length: 100, width: 100, quantity: 1 },
      { id: 'b', name: '', material: 'אורן', thickness: 18, length: 100, width: 100, quantity: 1 },
    ])
    expect(bom).toHaveLength(2)
  })
})

describe('אימות חלקים', () => {
  it('מחזיר שגיאה כשחלק בעל מידה אפסית', () => {
    const model = testBox()
    const bad = {
      ...model,
      buildParts: () => [
        { id: 'X01', name: 'שבור', material: 'אורן', thickness: 18, length: 0, width: 100, quantity: 1 },
      ],
    }
    const r = calculate(bad, baseInputs())
    expect(r.ok).toBe(false)
    expect(r.errors.some((e) => e.includes('X01'))).toBe(true)
  })

  it('מחזיר שגיאה כשמזהה חלק כפול', () => {
    const model = testBox()
    const dup = {
      ...model,
      buildParts: () => [
        { id: 'A01', name: '', material: 'אורן', thickness: 18, length: 100, width: 100, quantity: 1 },
        { id: 'A01', name: '', material: 'אורן', thickness: 18, length: 100, width: 100, quantity: 1 },
      ],
    }
    const r = calculate(dup, baseInputs())
    expect(r.ok).toBe(false)
  })
})

describe('ברירות מחדל', () => {
  it('defaultVariables מחזיר את ערכי ברירת המחדל', () => {
    expect(defaultVariables(testBox())).toEqual({ innerW: 400, innerD: 250, innerH: 150 })
  })
})
