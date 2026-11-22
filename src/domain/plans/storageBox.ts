import type { PlanDef } from './types'
import { SPEC_PENDING } from './types'
import { WOODS, WOOD_NAMES, DEFAULT_WOOD, PANEL_THICKNESSES } from './woods'

/**
 * קופסת אחסון: תחתית, חזית ואחורית, שני צדדים ומכסה.
 * הגיאומטריה: הצדדים נכנסים בין החזית לאחורית, והמכסה מעל הכול.
 * טיוטה: לא עברה בדיקה מקצועית.
 */
export const storageBox: PlanDef = {
  id: 'storage-box',
  verification: 'unverified',
  review: 'draft',
  sources: [],
  name: 'קופסת אחסון',
  categoryId: 'storage',
  usage: 'קופסה עם מכסה להחזקת חפצים קטנים בבית.',
  difficulty: 'קלה',
  woods: WOODS,
  allowedThicknesses: PANEL_THICKNESSES,
  allowedMaterials: WOOD_NAMES,
  variables: [
    { key: 'innerW', label: 'רוחב פנימי', min: 150, max: 500, default: 300 },
    { key: 'innerD', label: 'עומק פנימי', min: 100, max: 400, default: 200 },
    { key: 'innerH', label: 'גובה פנימי', min: 60, max: 250, default: 120 },
  ],
  outerSize: (v, t) => ({
    width: v.innerW + 2 * t,
    depth: v.innerD + 2 * t,
    height: v.innerH + 2 * t,
  }),
  buildParts: (v, t) => {
    const W = v.innerW + 2 * t
    const D = v.innerD + 2 * t
    const H = v.innerH
    return [
      {
        id: 'A01', name: 'תחתית', material: DEFAULT_WOOD, thickness: t, length: W, width: D, quantity: 1,
        placements: [{ x0: 0, y0: 0, z0: 0, x1: W, y1: D, z1: t }],
      },
      {
        id: 'A02', name: 'חזית ואחורית', material: DEFAULT_WOOD, thickness: t, length: W, width: H, quantity: 2,
        placements: [
          { x0: 0, y0: 0, z0: t, x1: W, y1: t, z1: t + H },
          { x0: 0, y0: D - t, z0: t, x1: W, y1: D, z1: t + H },
        ],
      },
      {
        id: 'A03', name: 'צדדים', material: DEFAULT_WOOD, thickness: t, length: D - 2 * t, width: H, quantity: 2,
        placements: [
          { x0: 0, y0: t, z0: t, x1: t, y1: D - t, z1: t + H },
          { x0: W - t, y0: t, z0: t, x1: W, y1: D - t, z1: t + H },
        ],
      },
      {
        id: 'A04', name: 'מכסה', material: DEFAULT_WOOD, thickness: t, length: W, width: D, quantity: 1,
        placements: [{ x0: 0, y0: 0, z0: t + H, x1: W, y1: D, z1: 2 * t + H }],
      },
    ]
  },
  hardware: () => [
    { id: 'H01', name: 'בורג עץ', type: 'בורג עץ עם ראש שטוח', quantity: 16, usage: 'חיבור הצדדים לחזית ולאחורית (כמות מוצעת)', spec: SPEC_PENDING },
    { id: 'H02', name: 'בורג עץ', type: 'בורג עץ עם ראש שטוח', quantity: 12, usage: 'חיבור התחתית לקירות (כמות מוצעת)', spec: SPEC_PENDING },
  ],
  tools: ['מסור יד או מסור חשמלי (בידי מי שמיומן בכך)', 'מקדחה ומברג', 'מלחציים', 'נייר זכוכית', 'סרגל ומרובע נגרות'],
  safety: [
    'לובשים משקפי מגן ואוזניות בעבודה עם כלי חשמל.',
    'חיתוך במכונה חשמלית יתבצע בידי מבוגר אחראי או בעל מקצוע, ולא לפי ההוראות כאן.',
    'מחזיקים את החלקים במלחציים כשמברגים כדי שלא יזוזו.',
  ],
  steps: [
    { title: 'בדיקת המידות והחומרים', body: 'השוו את המידות לשטח שבו תעמוד הקופסה. ודאו שהתוכנית נבדקה מקצועית לפני שמתחילים.' },
    { title: 'הזמנת חלקים שהוכנו למידה', body: 'העבירו את רשימת החלקים לחנות עצים או לבעל מקצוע, כדי שיכינו אותם לפי כתב הכמויות.' },
    { title: 'הכנת סביבת עבודה', body: 'משטח יציב, תאורה טובה, כלי מגן ופינוי מקום.' },
    { title: 'זיהוי חלקים וסידורם', body: 'סמנו כל חלק לפי המזהה בכתב הכמויות, כגון A01 או A03.' },
    { title: 'הרכבת התחתית', body: 'הניחו את התחתית על משטח ישר. זו הבסיס לכל השאר.', partIds: ['A01'] },
    { title: 'חיבור החזית והאחורית', body: 'הניחו את החזית והאחורית על התחתית בקצוות, בזווית ישרה, וברגו.', partIds: ['A02'] },
    { title: 'הוספת הצדדים', body: 'הכניסו את הצדדים בין החזית לאחורית וברגו מכל צד. בדקו ריבוע לפני הברגה סופית.', partIds: ['A03'] },
    { title: 'הוספת המכסה', body: 'הניחו את המכסה על העליון. ודאו שהוא נסגר ישר.', partIds: ['A04'] },
    { title: 'גימור לפי החומר', body: 'ליטוש ואיטום בהתאם לסוג החומר שנבחר.' },
    { title: 'בדיקת יציבות ואיכות', body: 'הקופסה יציבה, המכסה נסגר ישר ואין חלקים רופפים.' },
    { title: 'ניקיון ותיעוד', body: 'נקו את אבק העץ ותעדו את התוצר.' },
  ],
}
