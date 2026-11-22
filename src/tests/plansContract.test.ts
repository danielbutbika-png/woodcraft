import { describe, expect, it } from 'vitest'
import { PLANS } from '../domain/plans'
import { calculate } from '../domain/engine'
import { MODELS } from '../domain/catalog'

/**
 * חוזה לכל תוכנית. כל תוכנית חדשה חייבת לעבור את הבדיקות האלה לפני שמופיעה בקטלוג.
 */
describe.each(Object.entries(PLANS))('חוזה תוכנית %s', (id, plan) => {
  it('משויכת לדגם בקטלוג עם אותו מזהה', () => {
    expect(MODELS.some((m) => m.id === id)).toBe(true)
  })

  it('יש לה לפחות שלושה שלבים, ותיאור לכל שלב', () => {
    expect(plan.steps.length).toBeGreaterThanOrEqual(3)
    for (const s of plan.steps) expect(s.body.length).toBeGreaterThan(5)
  })

  it('כל מזהה חלק בשלבי ההרכבה קיים בתוכנית, ואין כפילויות', () => {
    const v = Object.fromEntries(plan.variables.map((x) => [x.key, x.default]))
    const partIds = plan.buildParts(v, plan.allowedThicknesses[0]).map((p) => p.id)
    const used = plan.steps.flatMap((s) => s.partIds ?? [])
    expect(used.every((u) => partIds.includes(u)), used.join(',')).toBe(true)
    expect(new Set(used).size).toBe(used.length)
  })

  it('כל חלק מופיע באחד השלבים, כדי ששרטוט ההרכבה יהיה שלם', () => {
    const v = Object.fromEntries(plan.variables.map((x) => [x.key, x.default]))
    const partIds = plan.buildParts(v, plan.allowedThicknesses[0]).map((p) => p.id)
    const used = new Set(plan.steps.flatMap((s) => s.partIds ?? []))
    expect(partIds.every((p) => used.has(p))).toBe(true)
  })

  it('לכל חומר יש שם, קטגוריה והערה', () => {
    for (const w of plan.woods) {
      expect(w.name.length).toBeGreaterThan(0)
      expect(w.category.length).toBeGreaterThan(0)
      expect(w.note.length).toBeGreaterThan(0)
    }
  })

  it('כל מחבר מציין כמות ושימוש, והמפרט נשאר "נדרש מפרט מאומת" עד אימות', () => {
    const v = Object.fromEntries(plan.variables.map((x) => [x.key, x.default]))
    for (const h of plan.hardware(v, plan.allowedThicknesses[0])) {
      expect(h.quantity).toBeGreaterThanOrEqual(0)
      expect(h.usage.length).toBeGreaterThan(0)
      if (plan.review === 'draft') expect(h.spec).toBe('נדרש מפרט מאומת')
    }
  })

  it('תוכנית שסומנה כנבדקת חייבת לציין מקורות', () => {
    if (plan.review === 'reviewed') expect(plan.sources.length).toBeGreaterThan(0)
    else expect(plan.verification).toBe('unverified')
  })

  it('בתצורת ברירת מחדל התוכנית מחושבת כטיוטה בלבד', () => {
    const v = Object.fromEntries(plan.variables.map((x) => [x.key, x.default]))
    const r = calculate(plan, { variables: v, thickness: plan.allowedThicknesses[0] })
    expect(r.status).toBe(plan.verification === 'verified' ? 'verified' : 'draft')
  })
})
