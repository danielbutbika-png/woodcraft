import type { PlanDef } from './types'
import { SPEC_PENDING } from './types'
import { WOODS, WOOD_NAMES, DEFAULT_WOOD, PANEL_THICKNESSES } from './woods'

const MIN_COMPARTMENT = 30

/** רוחב תא אחד, כולל מחיצות, מחושב לפי אורך הארגונית ומספר התאים. */
function compartmentWidth(length: number, t: number, n: number): number {
  return (length - 2 * t - (n - 1) * t) / n
}

/**
 * ארגונית שולחן: תחתית, גב, שני צדדים ומחיצות שמחלקות לתאים.
 * הגב בקצה האחורי, הצדדים בין הגב לקצה הקדמי, והמחיצות ביניהם.
 * טיוטה: לא עברה בדיקה מקצועית.
 */
export const deskOrganizer: PlanDef = {
  id: 'pen-holder',
  verification: 'unverified',
  review: 'draft',
  sources: [],
  name: 'ארגונית שולחן (ארגונית עטים בקטלוג)',
  categoryId: 'desk',
  usage: 'חלוקת חפצים קטנים על שולחן העבודה לתאים מסודרים.',
  difficulty: 'בינונית',
  woods: WOODS,
  allowedThicknesses: PANEL_THICKNESSES,
  allowedMaterials: WOOD_NAMES,
  variables: [
    { key: 'length', label: 'אורך', min: 150, max: 500, default: 300 },
    { key: 'depth', label: 'עומק', min: 80, max: 200, default: 100 },
    { key: 'height', label: 'גובה פנימי מעל התחתית', min: 50, max: 150, default: 80 },
    { key: 'compartments', label: 'מספר תאים', min: 1, max: 4, default: 3 },
  ],
  outerSize: (v, t) => ({ width: v.length, depth: v.depth, height: v.height + t }),
  checks: (v, t) => {
    const n = v.compartments
    if (!Number.isInteger(n)) return ['מספר התאים חייב להיות מספר שלם.']
    const cw = compartmentWidth(v.length, t, n)
    return cw < MIN_COMPARTMENT
      ? [`רוחב התא (${Math.round(cw)} מ"מ) קטן מהמינימום המוצע (${MIN_COMPARTMENT} מ"מ). הקטינו את מספר התאים או הגדילו את האורך.`]
      : []
  },
  buildParts: (v, t) => {
    const L = v.length
    const D = v.depth
    const H = v.height
    const n = v.compartments
    const cw = compartmentWidth(L, t, n)
    const parts = [
      {
        id: 'A01', name: 'תחתית', material: DEFAULT_WOOD, thickness: t, length: L, width: D, quantity: 1,
        placements: [{ x0: 0, y0: 0, z0: 0, x1: L, y1: D, z1: t }],
      },
      {
        id: 'B01', name: 'גב', material: DEFAULT_WOOD, thickness: t, length: L, width: H, quantity: 1,
        placements: [{ x0: 0, y0: 0, z0: t, x1: L, y1: t, z1: t + H }],
      },
      {
        id: 'C01', name: 'צדדים', material: DEFAULT_WOOD, thickness: t, length: D - t, width: H, quantity: 2,
        placements: [
          { x0: 0, y0: t, z0: t, x1: t, y1: D, z1: t + H },
          { x0: L - t, y0: t, z0: t, x1: L, y1: D, z1: t + H },
        ],
      },
    ]
    const dividers = n - 1
    if (dividers > 0) {
      const placements = Array.from({ length: dividers }, (_, i) => {
        const x0 = t + (i + 1) * cw + i * t
        return { x0, y0: t, z0: t, x1: x0 + t, y1: D, z1: t + H }
      })
      parts.push({
        id: 'D01', name: 'מחיצות', material: DEFAULT_WOOD, thickness: t, length: D - t, width: H, quantity: dividers,
        placements,
      })
    }
    return parts
  },
  hardware: (v) => [
    { id: 'H01', name: 'בורג עץ', type: 'בורג עץ עם ראש שטוח', quantity: 8, usage: 'חיבור הצדדים לתחתית ולגב (כמות מוצעת)', spec: SPEC_PENDING },
    { id: 'H02', name: 'בורג עץ', type: 'בורג עץ עם ראש שטוח', quantity: Math.max(0, 4 * (Math.round(v.compartments) - 1)), usage: 'חיבור המחיצות (כמות מוצעת)', spec: SPEC_PENDING },
  ],
  tools: ['מסור יד או מסור חשמלי (בידי מי שמיומן בכך)', 'מקדחה ומברג', 'מלחציים', 'נייר זכוכית', 'סרגל ומרובע נגרות'],
  safety: [
    'לובשים משקפי מגן ואוזניות בעבודה עם כלי חשמל.',
    'חיתוך במכונה חשמלית יתבצע בידי מבוגר אחראי או בעל מקצוע.',
    'מחיצות מודבקות ומברגות רק אחרי שהתחתית מיושרת.',
  ],
  steps: [
    { title: 'בדיקת המידות והחומרים', body: 'ודאו שהארגונית נכנסת למקום שבשולחן, ושהתוכנית נבדקה מקצועית לפני ביצוע.' },
    { title: 'הזמנת חלקים שהוכנו למידה', body: 'העבירו את רשימת החלקים לחנות עצים או לבעל מקצוע.' },
    { title: 'הכנת סביבת עבודה', body: 'משטח יציב, תאורה טובה וכלי מגן.' },
    { title: 'זיהוי חלקים וסידורם', body: 'סמנו את התחתית, הגב, הצדדים והמחיצות לפי המזהים.' },
    { title: 'הרכבת התחתית והגב', body: 'חברו את הגב לקצה האחורי של התחתית בזווית ישרה.', partIds: ['A01', 'B01'] },
    { title: 'הוספת הצדדים', body: 'חברו את הצדדים לתחתית ולגב משני הצדדים, וברגו.', partIds: ['C01'] },
    { title: 'הוספת המחיצות', body: 'הכניסו את המחיצות בין הצדדים לפי רוחב התאים בכתב הכמויות.', partIds: ['D01'] },
    { title: 'גימור לפי החומר', body: 'ליטוש ואיטום בהתאם לסוג החומר שנבחר.' },
    { title: 'בדיקת יציבות ואיכות', body: 'התאים נפתחים בחופשיות והארגונית עומדת ישר על השולחן.' },
    { title: 'ניקיון ותיעוד', body: 'נקו את אבק העץ ותעדו את התוצר.' },
  ],
}
