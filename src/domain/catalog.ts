/**
 * מאגר הדגמים.
 *
 * עיקרון מחייב (מתוך מסמך הדרישות, סעיף 15):
 * - אין להזין כאן מידות, חומרים, מחברים או שלבי בנייה שלא נבדקו ממקור מאומת.
 * - כל דגם מתחיל בסטטוס "unverified" ולכן לא מוצגת לו תוכנית בנייה סופית.
 * - שדות המידות מוגדרים כ-null עד שייבדקו ויוזנו ממקור.
 */

export type VerificationStatus = 'unverified' | 'verified'

export interface Category {
  id: string
  name: string
  icon: string
}

export interface Dimensions {
  width: number
  depth: number
  height: number
}

export interface WoodModel {
  id: string
  name: string
  categoryId: string
  usage: string
  verification: VerificationStatus
  /** מידות חיצוניות במילימטרים. null = טרם אומת ממקור. */
  outerDimensions: Dimensions | null
}

export const CATEGORIES: Category[] = [
  { id: 'storage', name: 'אחסון וארגון הבית', icon: '🗄️' },
  { id: 'desk', name: 'שולחן עבודה ומשרד', icon: '🖥️' },
  { id: 'decor', name: 'עיצוב ודקורציה', icon: '🖼️' },
  { id: 'kitchen', name: 'מטבח', icon: '🍳' },
  { id: 'garden', name: 'גינה ומרפסת', icon: '🌿' },
  { id: 'family', name: 'פרויקטים משפחתיים', icon: '🎲' },
  { id: 'outdoor', name: 'ריהוט חוץ', icon: '🪑' },
]

const u = (id: string, name: string, categoryId: string, usage: string): WoodModel => ({
  id,
  name,
  categoryId,
  usage,
  verification: 'unverified',
  outerDimensions: null,
})

export const MODELS: WoodModel[] = [
  // אחסון וארגון הבית
  u('storage-box', 'קופסת אחסון', 'storage', 'אחסון חפצים קטנים בבית.'),
  u('storage-shelf', 'מדף שולחני', 'storage', 'מדף קטן להנחת חפצים על שולחן.'),
  u('key-organizer', 'ארגונית מפתחות', 'storage', 'תלייה מסודרת של מפתחות בכניסה.'),
  u('mail-holder', 'מתקן דואר', 'storage', 'מיון מכתבים וחשבונות.'),
  u('sign-box', 'קופסת שלטים', 'storage', 'אחסון ותצוגה של שלטים קטנים.'),
  u('object-organizer', 'ארגונית חפצים', 'storage', 'חלוקה מסודרת של חפצים קטנים במגירה או על מדף.'),

  // שולחן עבודה ומשרד
  u('phone-stand', 'מעמד טלפון', 'desk', 'החזקת טלפון זקוף על שולחן.'),
  u('tablet-stand', 'מעמד טאבלט', 'desk', 'החזקת טאבלט זקוף על שולחן.'),
  u('pen-holder', 'ארגונית עטים', 'desk', 'אחסון עטים ועפרונות על שולחן העבודה.'),
  u('cable-organizer', 'מארגן כבלים', 'desk', 'ניהול כבלים מסודר מאחורי השולחן.'),
  u('book-stand', 'מעמד ספרים', 'desk', 'החזקת ספרים בזווית נוחה לקריאה.'),
  u('desk-combo-shelf', 'מדף שולחני משולב', 'desk', 'מדף מעל שולחן העבודה לאחסון חפצים.'),

  // עיצוב ודקורציה
  u('picture-frame', 'מסגרת תמונה', 'decor', 'מסגרת להצגת תמונה.'),
  u('wood-tray', 'מגש מעץ', 'decor', 'מגש דקורטיבי לחפצים קטנים.'),
  u('photo-stand', 'מעמד תמונות', 'decor', 'הצגת תמונות בעמידה על משטח.'),
  u('gift-box', 'קופסת מתנה', 'decor', 'אריזה עשויה עץ למתנה.'),
  u('display-board', 'לוח תצוגה עומד', 'decor', 'לוח קטן לתצוגת פריטים או הודעות.'),
  u('postcard-holder', 'מתקן גלויות', 'decor', 'החזקת גלויות מוצגות.'),

  // מטבח
  u('napkin-holder', 'מתקן מפיות', 'kitchen', 'החזקת מפיות על שולחן האוכל.'),
  u('spice-rack', 'מתקן תבלינים עומד', 'kitchen', 'הצגה מסודרת של צנצנות תבלינים.'),
  u('recipe-box', 'קופסת מתכונים', 'kitchen', 'שמירת כרטיסיות מתכונים.'),
  u('tea-organizer', 'ארגונית שקיות תה', 'kitchen', 'אחסון שקיות תה במטבח.'),
  u('serving-tray', 'מגש הגשה', 'kitchen', 'מגש להגשת מזון ושתייה.'),
  u('cutting-board-rack', 'מתקן קרשי חיתוך', 'kitchen', 'החזקת קרשי חיתוך מסודרים.'),

  // גינה ומרפסת
  u('planter-low', 'אדנית נמוכה', 'garden', 'אדנית קטנה לצמחים במרפסת או בגינה.'),
  u('table-plant-stand', 'מעמד עציצים שולחני', 'garden', 'החזקת עציצים קטנים על שולחן.'),
  u('seed-organizer', 'ארגונית זרעים', 'garden', 'אחסון מסודר של שקיות זרעים.'),
  u('garden-sign', 'שלט לגינה', 'garden', 'שלט עם שם או הודעה לגינה.'),
  u('garden-tool-box', 'קופסת אביזרי גינון', 'garden', 'אחסון אביזרי גינון קטנים.'),
  u('low-seedling-shelf', 'מדף שתילה נמוך', 'garden', 'מדף נמוך להנחת שתילים.'),

  // פרויקטים משפחתיים
  u('tictactoe', 'משחק איקס עיגול', 'family', 'משחק לוח פשוט מעץ.'),
  u('drawing-holder', 'מתקן ציורים', 'family', 'תצוגה של ציורי ילדים.'),
  u('game-box', 'קופסת משחקים', 'family', 'אחסון משחקי לוח וקלפים.'),
  u('low-book-stand', 'מעמד ספרים נמוך', 'family', 'מעמד ספרים בגובה ילדים.'),
  u('craft-organizer', 'ארגונית יצירה', 'family', 'אחסון חומרי יצירה ואומנות.'),
  u('name-frame', 'מסגרת שם שולחנית', 'family', 'מסגרת עם שם לקישוט על שולחן.'),
  // ריהוט חוץ (טיוטת קטלוג בלבד: אין מידות או מפרטים עד לאימות ממקור)
  u('outdoor-bench', 'ספסל גן', 'outdoor', 'ישיבה לשניים או שלושה במרחב חיצוני.'),
  u('outdoor-chair', 'כיסא גן פשוט', 'outdoor', 'כיסא ישיבה לשימוש בחוץ.'),
  u('outdoor-table', 'שולחן גן קטן', 'outdoor', 'שולחן לאוכל או לשתייה בחוץ.'),
  u('outdoor-side-table', 'שולחן צד לגינה', 'outdoor', 'משטח קטן ליד כיסא או ספסל בחוץ.'),
  u('outdoor-folding-table', 'שולחן מרפסת מתקפל', 'outdoor', 'שולחן שניתן לקפל ולאחסן במרפסת.'),
  u('outdoor-lounge-chair', 'כורסת גן', 'outdoor', 'ישיבה נוחה עם משענת לשימוש בחוץ.'),
  u('outdoor-balcony-bench', 'ספסל מרפסת צר', 'outdoor', 'ספסל קטן לפינת מרפסת צרה.'),
  u('outdoor-storage-bench', 'ספסל אחסון לחוץ', 'outdoor', 'ספסל עם תא לאחסון כריות וציוד קטן.'),
  u('outdoor-umbrella-stand', 'מתקן למטריה לחוץ', 'outdoor', 'עמידה יציבה למטריית שמש על משטח בחוץ.'),
  u('outdoor-plant-bench', 'ספסל עם תיבת צמחים', 'outdoor', 'ספסל שמשולבת בו תיבה לצמחים.'),
  // תוספות ממקורות חינמיים שנמצאו בחיפוש (ללא מידות עד אימות)
  u('outdoor-adirondack-chair', 'כיסא אדירונדק', 'outdoor', 'כיסא גן רחב עם משענת מוטה, לשימוש בחוץ.'),
  u('outdoor-picnic-table', 'שולחן פיקניק', 'outdoor', 'שולחן עם ספסלים מחוברים לארוחות בחוץ.'),
  u('craftsman-picture-frame', 'מסגרת תמונה בסגנון קראפטסמן', 'decor', 'מסגרת עץ פשוטה בלי חיתוכי שיפוע בפינות.'),
  u('kitchen-mug-tree', 'עץ ספלים למטבח', 'kitchen', 'תלייה מסודרת של ספלים על מוט או מסגרת.'),
  u('drawer-organizer', 'ארגונית מגירה', 'storage', 'חלוקה של מגירה לתאים לחפצים קטנים.'),
  u('desk-caddy', 'קדי שולחני', 'desk', 'מגש קטן על שולחן העבודה לעטים, פתקים וחפצים קטנים.'),
]

export const getModel = (id: string): WoodModel | undefined =>
  MODELS.find((m) => m.id === id)

export const getCategory = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id)
