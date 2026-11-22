import Dexie, { type Table } from 'dexie'

export type ProjectStatus = 'planned' | 'materials' | 'building' | 'done'

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'מתוכנן',
  materials: 'בהכנת חומרים',
  building: 'בביצוע',
  done: 'הושלם',
}

export interface PlanInputs {
  variables: Record<string, number>
  thickness: number
  material?: string
}

export interface Project {
  id?: number
  modelId: string
  name: string
  status: ProjectStatus
  notes: string
  /** המידות האחרונות שנשמרו מתוך מנוע ההתאמה. */
  planInputs?: PlanInputs
  createdAt: number
  updatedAt: number
}

export interface Favorite {
  modelId: string
  addedAt: number
}

export interface SpaceInput {
  width: number
  depth: number
  height: number
}

/**
 * מצב העבודה של תוכנית אחת: הטופס, התוצאה האחרונה שחושבה, רכישות, הערות והתקדמות בשלבים.
 * נשמר אוטומטית בכל שינוי.
 */
export interface PlanState {
  modelId: string
  form: {
    variables: Record<string, number>
    thickness: number
    material: string
    useSpace: boolean
    space: SpaceInput
    clearance: number
  }
  applied: PlanInputs & { space?: SpaceInput; clearance?: number }
  /** מזהי חלקים שנרכשו. */
  purchased: string[]
  /** הערות אישיות לכל חלק, לפי מזהה. */
  notes: Record<string, string>
  /** שלבי הבנייה שסומנו כהושלמו. */
  doneSteps: number[]
  stepIdx: number
  updatedAt: number
}

class WoodCraftDB extends Dexie {
  projects!: Table<Project, number>
  favorites!: Table<Favorite, string>
  planStates!: Table<PlanState, string>

  constructor(name = 'woodcraft') {
    super(name)
    this.version(1).stores({
      projects: '++id, modelId, updatedAt',
      favorites: 'modelId, addedAt',
    })
    this.version(2).stores({
      projects: '++id, modelId, updatedAt',
      favorites: 'modelId, addedAt',
      planStates: 'modelId',
    })
  }
}

export const db = new WoodCraftDB()

/** מבקש מהדפדפן לא למחוק את הנתונים המקומיים בלחץ אחסון. */
export async function requestPersistentStorage(): Promise<void> {
  if (navigator.storage?.persist) {
    await navigator.storage.persist()
  }
}
