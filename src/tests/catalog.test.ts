import { describe, expect, it } from 'vitest'
import { CATEGORIES, MODELS, getCategory } from '../domain/catalog'
import { MODEL_SOURCES } from '../domain/sources'

describe('מאגר הדגמים', () => {
  it('מכיל 52 דגמים ב-7 קטגוריות', () => {
    expect(MODELS).toHaveLength(52)
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

  it('מקורות חיצוניים משויכים לדגמים קיימים ובקישורי https בלבד', () => {
    const ids = new Set(MODELS.map((m) => m.id))
    for (const [id, list] of Object.entries(MODEL_SOURCES)) {
      expect(ids.has(id), id).toBe(true)
      for (const src of list) {
        expect(src.url.startsWith('https://'), src.url).toBe(true)
        expect(src.title.length, src.url).toBeGreaterThan(0)
        expect(src.publisher.length, src.url).toBeGreaterThan(0)
      }
    }
  })

  it('לכל דגם יש סוג איור מוגדר', async () => {
    const { ILLUSTRATION_KIND } = await import('../domain/illustrationKinds')
    for (const m of MODELS) {
      expect(ILLUSTRATION_KIND[m.id], m.id).toBeDefined()
    }
  })
})
