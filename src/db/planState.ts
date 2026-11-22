import { db, type PlanState } from './db'

/** טעינת מצב התוכנית השמור, או undefined אם לא נשמר דבר. */
export async function loadPlanState(modelId: string): Promise<PlanState | undefined> {
  return db.planStates.get(modelId)
}

/** שמירת מצב התוכנית. מחליף את הרשומה הקודמת במלואה. */
export async function savePlanState(state: Omit<PlanState, 'updatedAt'>): Promise<number> {
  const updatedAt = Date.now()
  await db.planStates.put({ ...state, updatedAt })
  return updatedAt
}

export async function clearPlanState(modelId: string): Promise<void> {
  await db.planStates.delete(modelId)
}
