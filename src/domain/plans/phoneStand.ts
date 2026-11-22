import type { PlanDef } from './types'
import { SPEC_PENDING } from './types'
import { WOODS, WOOD_NAMES, DEFAULT_WOOD, PANEL_THICKNESSES } from './woods'

/** שפה קדמית שמונעת מהטלפון להחליק. רוחב מוצע, לאימות. */
const LIP = 20
const MIN_PHONE_ROOM = 40

/**
 * מעמד לטלפון: בסיס, גב זקוף ושפה קדמית.
 * הגב נשען על הבסיס בקצה האחורי, והשפה מונחת על הבסיס בקצה הקדמי.
 * טיוטה: לא עברה בדיקה מקצועית. זווית הגב אינה מדומה כאן.
 */
export const phoneStand: PlanDef = {
  id: 'phone-stand',
  verification: 'unverified',
  review: 'draft',
  sources: [],
  name: 'מעמד לטלפון',
  categoryId: 'desk',
  usage: 'החזקת טלפון זקוף על שולחן.',
  difficulty: 'קלה',
  woods: WOODS,
  allowedThicknesses: PANEL_THICKNESSES,
  allowedMaterials: WOOD_NAMES,
  variables: [
    { key: 'standW', label: 'רוחב המעמד', min: 60, max: 200, default: 90 },
    { key: 'baseD', label: 'עומק הבסיס', min: 80, max: 200, default: 120 },
    { key: 'backH', label: 'גובה הגב', min: 80, max: 220, default: 110 },
  ],
  outerSize: (v, t) => ({ width: v.standW, depth: v.baseD, height: v.backH + t }),
  checks: (v, t) => {
    const room = v.baseD - t - LIP
    return room < MIN_PHONE_ROOM
      ? [`עומק הבסיס קטן מדי: נשארים ${Math.round(room)} מ"מ לטלפון, והמינימום המוצע הוא ${MIN_PHONE_ROOM} מ"מ (לאימות).`]
      : []
  },
  buildParts: (v, t) => {
    const W = v.standW
    const D = v.baseD
    return [
      {
        id: 'A01', name: 'בסיס', material: DEFAULT_WOOD, thickness: t, length: W, width: D, quantity: 1,
        placements: [{ x0: 0, y0: 0, z0: 0, x1: W, y1: D, z1: t }],
      },
      {
        id: 'B01', name: 'גב', material: DEFAULT_WOOD, thickness: t, length: W, width: v.backH, quantity: 1,
        placements: [{ x0: 0, y0: 0, z0: t, x1: W, y1: t, z1: t + v.backH }],
      },
      {
        id: 'C01', name: 'שפה קדמית', material: DEFAULT_WOOD, thickness: t, length: W, width: LIP, quantity: 1,
        placements: [{ x0: 0, y0: D - LIP, z0: t, x1: W, y1: D, z1: 2 * t }],
      },
    ]
  },
  hardware: () => [
    { id: 'H01', name: 'בורג עץ', type: 'בורג עץ עם ראש שטוח', quantity: 4, usage: 'חיבור הגב לבסיס (כמות מוצעת)', spec: SPEC_PENDING },
    { id: 'H02', name: 'בורג עץ', type: 'בורג עץ עם ראש שטוח', quantity: 4, usage: 'חיבור השפה הקדמית לבסיס (כמות מוצעת)', spec: SPEC_PENDING },
  ],
  tools: ['מסור יד או מסור חשמלי (בידי מי שמיומן בכך)', 'מקדחה ומברג', 'מלחציים', 'נייר זכוכית', 'סרגל ומרובע נגרות'],
  safety: [
    'לובשים משקפי מגן בעבודה עם כלי חשמל.',
    'חיתוך במכונה חשמלית יתבצע בידי מבוגר אחראי או בעל מקצוע.',
    'בודקים שהגב יושב זקוף ויציב לפני שמשתמשים במעמד.',
  ],
  steps: [
    { title: 'בדיקת המידות והחומרים', body: 'ודאו שהטלפון שלכם נכנס במעמד עם מרווח, ושהתוכנית נבדקה מקצועית לפני ביצוע.' },
    { title: 'הזמנת חלקים שהוכנו למידה', body: 'העבירו את רשימת החלקים לחנות עצים או לבעל מקצוע.' },
    { title: 'הכנת סביבת עבודה', body: 'משטח יציב, תאורה טובה וכלי מגן.' },
    { title: 'זיהוי חלקים וסידורם', body: 'סמנו את הבסיס, הגב והשפה לפי המזהה בכתב הכמויות.' },
    { title: 'הרכבת הבסיס', body: 'הניחו את הבסיס על משטח ישר. זו הבסיס למעמד.', partIds: ['A01'] },
    { title: 'חיבור הגב', body: 'חברו את הגב לקצה האחורי של הבסיס בזווית ישרה, וברגו.', partIds: ['B01'] },
    { title: 'חיבור השפה הקדמית', body: 'חברו את השפה לקצה הקדמי של הבסיס, כך שתחזיק את הטלפון.', partIds: ['C01'] },
    { title: 'גימור לפי החומר', body: 'ליטוש ואיטום, כולל שוליים שחשופים לחות.' },
    { title: 'בדיקת יציבות ואיכות', body: 'הניחו טלפון במעמד ובדקו שאינו נופל או מחליק.' },
    { title: 'ניקיון ותיעוד', body: 'נקו את אבק העץ ותעדו את התוצר.' },
  ],
}
