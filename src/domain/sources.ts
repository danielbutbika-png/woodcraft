/**
 * מקורות חיצוניים חינמיים לדגמים.
 *
 * הכללים:
 * - רק מקורות שההורדה שלהם חינמית. מקורות בתשלום לא נכללים.
 * - WoodCraft לא העתיקה מידות או שלבים מהמקורות האלה. הקישור הוא הפניה בלבד.
 * - כל תוכנית שמבוססת על מקור כזה נשארת לא מאומתת עד בדיקה מקצועית.
 * - דגם בלי מקור כאן: לא נמצא מקור חינמי מתאים בחיפוש הנוכחי.
 */

export interface ModelSource {
  title: string
  publisher: string
  url: string
}

export const MODEL_SOURCES: Record<string, ModelSource[]> = {
  'outdoor-bench': [
    { title: 'Free outdoor bench plans', publisher: 'myoutdoorplans.com', url: 'https://myoutdoorplans.com/furniture/free-outdoor-bench-plans/' },
    { title: 'Sawhorse Outdoor Bench', publisher: 'Ana-White.com', url: 'https://ana-white.com/comment/56815' },
  ],
  'outdoor-table': [
    { title: 'Build your own outdoor table (beginner friendly)', publisher: 'Ana-White.com', url: 'https://ana-white.com/comment/3553' },
    { title: 'Free outdoor table plans (8 ft table)', publisher: 'myoutdoorplans.com', url: 'https://myoutdoorplans.com/?p=11145' },
  ],
  'outdoor-side-table': [
    { title: 'Build your own outdoor side table with free plans', publisher: 'Ana-White.com', url: 'https://ana-white.com/comment/114831' },
  ],
  'outdoor-storage-bench': [
    { title: 'Outdoor storage bench plans (free)', publisher: 'myoutdoorplans.com', url: 'https://myoutdoorplans.com/furniture/outdoor-storage-bench-plans/' },
  ],
  'outdoor-plant-bench': [
    { title: 'Planter Bench Plans', publisher: 'myoutdoorplans.com', url: 'https://myoutdoorplans.com/furniture/planter-bench-plans/' },
    { title: 'Herb Garden Bench & Planter Project Plans', publisher: 'Real Cedar', url: 'https://www.realcedar.com/outdoor/free-diy-project-plans/herb-garden-bench-planter' },
  ],
}

export function getModelSources(modelId: string): ModelSource[] {
  return MODEL_SOURCES[modelId] ?? []
}
