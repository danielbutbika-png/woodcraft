import type { WoodOption } from './types'

/** הערות כלליות בלבד. אינן תחליף לבדיקת חומר ולמפרט יצרן. */
export const WOODS: WoodOption[] = [
  {
    id: 'pine',
    name: 'אורן מוקצע',
    category: 'עץ מלא',
    note: 'עץ רך וזול. עשוי להתעוות עם שינויי לחות, ודורש גימור או איטום.',
  },
  {
    id: 'birch',
    name: 'לביד ליבנה',
    category: 'לביד',
    note: 'יציב יותר מעץ מלא במידות. קצוות החיתוך דורשים כיסוי או שוליים.',
  },
  {
    id: 'mdf',
    name: 'MDF',
    category: 'MDF',
    note: 'משטח חלק שמתאים לצביעה. פחות מתאים לחורים שנפתחים שוב ושוב ולסביבה לחה.',
  },
]

export const WOOD_NAMES = WOODS.map((w) => w.name)
export const DEFAULT_WOOD = WOOD_NAMES[0]
export const PANEL_THICKNESSES = [9, 12, 18]
