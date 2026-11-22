import type { ModelDef } from '../engine'
import type { Mm } from '../units'

export interface WoodOption {
  id: string
  /** שם החומר כפי שיופיע בכתב הכמויות. */
  name: string
  /** קטגוריית החומר: עץ מלא, לביד, MDF. */
  category: string
  /** הערה כללית על החומר. נדרש אימות מקצועי לפני שימוש בפרויקט אמיתי. */
  note: string
}

export interface HardwareRow {
  id: string
  name: string
  type: string
  quantity: number
  usage: string
  /** מפרט קוטר ואורך. נשאר "נדרש מפרט מאומת" עד אימות ממקור. */
  spec: string
}

export interface StepSpec {
  title: string
  body: string
  /** מזהי החלקים שנוספים בשלב זה. מזין את שרטוט ההרכבה המצטבר. */
  partIds?: string[]
}

/**
 * תוכנית דגם. כל הערכים בה הם הצעת תכנון שטרם אומתה ממקור מקצועי.
 * ה-status נשאר "unverified" עד שהתוכנית נבדקת ואושרה.
 */
export interface PlanDef extends ModelDef {
  name: string
  categoryId: string
  usage: string
  difficulty: string
  woods: WoodOption[]
  hardware: (v: Record<string, Mm>, t: Mm) => HardwareRow[]
  tools: string[]
  safety: string[]
  steps: StepSpec[]
  /** מקורות למידות ולשיטות הרכבה. ריק בטיוטה. */
  sources: string[]
  /** מצב הבדיקה המקצועית. 'draft' עד שתבוצע בדיקה מתאימה. */
  review: 'draft' | 'reviewed'
}

export const SPEC_PENDING = 'נדרש מפרט מאומת'
