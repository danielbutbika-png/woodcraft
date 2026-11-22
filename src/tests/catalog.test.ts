import { describe, expect, it } from 'vitest'
import { CATEGORIES, MODELS, getCategory } from '../domain/catalog'

describe('מאגר הדגמים', () => {
  it('מכיל 46 דגמים ב-7 קטגוריות', () => {
    expect(MODELS).toHaveLength(46)
    expect(CATEGORIES).toHaveLength(7)
  })

  it('מזהי הדגמים ייחודיים', () => {
    const ids = MODELS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('לכל דגם קטגוריה קיימת', () => {
    for (const m of MODELS) {
      expect(getCategory(m.categoryId), m.id).toBeDefined()
    }
  })

  it('אף דגם לא מסומן כמאומת ואין מידות מומצאות', () => {
    for (const m of MODELS) {
      expect(m.verification, m.id).toBe('unverified')
      expect(m.outerDimensions, m.id).toBeNull()
    }
  })

  it('כל דגם מכיל שם ושימוש בעברית', () => {
    for (const m of MODELS) {
      expect(m.name.length, m.id).toBeGreaterThan(0)
      expect(/[֐-׿]/.test(m.name), m.id).toBe(true)
    }
  })
})
