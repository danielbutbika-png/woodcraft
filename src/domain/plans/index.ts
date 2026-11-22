import type { PlanDef } from './types'
import { storageBox } from './storageBox'
import { phoneStand } from './phoneStand'
import { deskOrganizer } from './deskOrganizer'

/** תוכניות שיש להן מנוע חישוב. המפתח הוא מזהה הדגם בקטלוג. */
export const PLANS: Record<string, PlanDef> = {
  [storageBox.id]: storageBox,
  [phoneStand.id]: phoneStand,
  [deskOrganizer.id]: deskOrganizer,
}

export const getPlan = (modelId: string): PlanDef | undefined => PLANS[modelId]
