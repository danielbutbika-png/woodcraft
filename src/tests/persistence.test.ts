import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, type PlanState } from '../db/db'
import { clearPlanState, loadPlanState, savePlanState } from '../db/planState'

const sample = (over: Partial<PlanState> = {}): Omit<PlanState, 'updatedAt'> => ({
  modelId: 'storage-box',
  form: {
    variables: { innerW: 320, innerD: 200, innerH: 120 },
    thickness: 12,
    material: 'אורן מוקצע',
    useSpace: true,
    space: { width: 500, depth: 300, height: 250 },
    clearance: 5,
  },
  applied: { variables: { innerW: 320, innerD: 200, innerH: 120 }, thickness: 12, material: 'אורן מוקצע' },
  purchased: ['A01', 'A03'],
  notes: { A01: 'לבקש קצוות ישרים' },
  doneSteps: [0, 1, 4],
  stepIdx: 4,
  ...over,
})

describe('שמירת מצב תוכנית ב-IndexedDB', () => {
  beforeEach(async () => {
    await db.planStates.clear()
    await db.projects.clear()
    await db.favorites.clear()
  })

  it('נשמר ונטען בחזרה במלואו', async () => {
    await savePlanState(sample())
    const loaded = await loadPlanState('storage-box')
    expect(loaded).toBeDefined()
    expect(loaded!.form.variables.innerW).toBe(320)
    expect(loaded!.form.space.width).toBe(500)
    expect(loaded!.purchased).toEqual(['A01', 'A03'])
    expect(loaded!.notes.A01).toBe('לבקש קצוות ישרים')
    expect(loaded!.doneSteps).toEqual([0, 1, 4])
    expect(loaded!.stepIdx).toBe(4)
    expect(typeof loaded!.updatedAt).toBe('number')
  })

  it('שמירה שנייה מחליפה את הראשונה ולא יוצרת כפילות', async () => {
    await savePlanState(sample())
    await savePlanState(sample({ purchased: [], doneSteps: [] }))
    expect(await db.planStates.count()).toBe(1)
    const loaded = await loadPlanState('storage-box')
    expect(loaded!.purchased).toEqual([])
  })

  it('מחזיר undefined כשאין מצב שמור', async () => {
    expect(await loadPlanState('phone-stand')).toBeUndefined()
  })

  it('ניתן למחוק מצב שמור', async () => {
    await savePlanState(sample())
    await clearPlanState('storage-box')
    expect(await loadPlanState('storage-box')).toBeUndefined()
  })

  it('פרויקטים ומועדפים נשמרים גם הם', async () => {
    const now = Date.now()
    const id = await db.projects.add({ modelId: 'phone-stand', name: 'מעמד', status: 'planned', notes: '', createdAt: now, updatedAt: now })
    await db.favorites.put({ modelId: 'phone-stand', addedAt: now })
    expect((await db.projects.get(id))!.name).toBe('מעמד')
    expect((await db.favorites.get('phone-stand'))!.modelId).toBe('phone-stand')
  })
})
