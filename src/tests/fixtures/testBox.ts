/**
 * מודל בדיקה בלבד (fixture) - לא מוצג בקטלוג ואינו תוכנית בנייה.
 * קופסה פשוטה עם מידות פנימיות שנמדדות במילימטרים, כדי לבדוק את המנוע.
 */
import type { ModelDef, PartSpec } from '../../domain/engine'

export const testBox = (verification: 'unverified' | 'verified' = 'unverified'): ModelDef => ({
  id: 'test-box',
  verification,
  variables: [
    { key: 'innerW', label: 'רוחב פנימי', min: 100, max: 1000, default: 400 },
    { key: 'innerD', label: 'עומק פנימי', min: 100, max: 800, default: 250 },
    { key: 'innerH', label: 'גובה פנימי', min: 50, max: 600, default: 150 },
  ],
  allowedThicknesses: [9, 12, 18],
  outerSize: (v, t) => ({
    width: v.innerW + 2 * t,
    depth: v.innerD + 2 * t,
    height: v.innerH + 2 * t,
  }),
  buildParts: (v, t): PartSpec[] => [
    { id: 'A01', name: 'תחתית', material: 'אורן', thickness: t, length: v.innerW, width: v.innerD, quantity: 1 },
    { id: 'A02', name: 'מכסה', material: 'אורן', thickness: t, length: v.innerW, width: v.innerD, quantity: 1 },
    { id: 'B01', name: 'צד', material: 'אורן', thickness: t, length: v.innerH, width: v.innerD, quantity: 2 },
  ],
})
