/**
 * מקורות חיצוניים חינמיים לדגמים.
 *
 * הכללים:
 * - רק מקורות שההורדה שלהם חינמית. מקורות בתשלום לא נכללים.
 * - WoodCraft לא העתיקה מידות או שלבים מהמקורות האלה. הקישור הוא הפניה בלבד.
 * - כל תוכנית שמבוססת על מקור כזה נשארת לא מאומתת עד בדיקה מקצועית.
 * - דגם בלי מקור כאן: לא נמצא מקור חינמי מתאים בחיפוש הנוכחי.
 * - כל קישור נבדק פעם אחת: נפתח, וסומן כחינמי רק אם התוכנית עצמה מוצגת בלי תשלום.
 */

export interface ModelSource {
  title: string
  publisher: string
  url: string
}

export const MODEL_SOURCES: Record<string, ModelSource[]> = {
  'outdoor-chair': [
    { title: 'Modern Outdoor Chair from 2x4s and 2x6s', publisher: 'Ana-White.com', url: 'https://ana-white.com/comment/96901' },
    { title: 'Outdoor Chair Plans', publisher: 'myoutdoorplans.com', url: 'https://myoutdoorplans.com/furniture/outdoor-chair-plans/' },
  ],
  'outdoor-lounge-chair': [
    { title: 'Essential Wood Outdoor Chair Frame for Deep Seat Cushion', publisher: 'Ana-White.com', url: 'https://ana-white.com/comment/139891' },
    { title: 'Lounge Chair Plans', publisher: 'myoutdoorplans.com', url: 'https://myoutdoorplans.com/furniture/lounge-chair-plans/' },
    { title: 'DIY Outdoor Lounge Chair', publisher: 'Shanty2Chic', url: 'https://www.shanty-2-chic.com/diy-outdoor-lounge-chair-2/' },
  ],
  'outdoor-folding-table': [
    { title: 'Folding Picnic Table Plans', publisher: 'myoutdoorplans.com', url: 'https://myoutdoorplans.com/?p=20935' },
  ],
  'outdoor-adirondack-chair': [
    { title: 'Free Adirondack Chair Plans', publisher: 'myoutdoorplans.com', url: 'https://myoutdoorplans.com/furniture/free-adirondack-chair-plans/' },
  ],
  'outdoor-picnic-table': [
    { title: '2 Person Picnic Table - Free Plans', publisher: 'Ana-White.com', url: 'https://ana-white.com/woodworking-projects/2-person-picnic-table-free-plans' },
    { title: '12 Free Picnic Table Plans (roundup)', publisher: 'Homedit', url: 'https://www.homedit.com/picnic-table-plans' },
  ],
  'picture-frame': [
    { title: 'Easy DIY Picture Frame (free instructions; detailed PDF is paid)', publisher: 'Saws On Skates', url: 'https://sawsonskates.com/how-to-make-a-no-miter-cut-picture-frame-free-plans/' },
    { title: 'Picture Frame Plans', publisher: 'myoutdoorplans.com', url: 'https://myoutdoorplans.com/?p=6965' },
  ],
  'craftsman-picture-frame': [
    { title: 'Craftsman Frame (free plans)', publisher: 'Ana-White.com', url: 'https://ana-white.com/comment/43483' },
    { title: 'Making a Craftsman Style Picture Frame with No Miters (free plans)', publisher: 'Woodsmith', url: 'https://woodsmith.com/article/making-a-craftsman-style-picture-frame-with-no-miters-free-plans' },
  ],
  'spice-rack': [
    { title: 'How to Build a DIY Countertop Spice Rack (free plans)', publisher: 'Shanty2Chic', url: 'https://www.shanty-2-chic.com/countertop-spice-rack/' },
  ],
  'kitchen-mug-tree': [
    { title: 'Kitchen Accessories: free plans list', publisher: 'Woodworkers Workshop', url: 'https://woodworkersworkshop.com/ResourcesCategory/440' },
  ],
  'drawer-organizer': [
    { title: 'Drawer Organizer: free plans list', publisher: 'Woodworkers Workshop', url: 'https://woodworkersworkshop.com/ResourcesCategory/887' },
  ],
  'desk-caddy': [
    { title: 'Desktop Office or Vanity Beauty Organizer', publisher: 'Ana-White.com', url: 'https://ana-white.com/comment/73593' },
    { title: 'Build a Simple Desk Organizer', publisher: 'Fine Woodworking', url: 'https://www.finewoodworking.com/project-guides/beginner-projects/weekend-project-a-simple-desk-organizer' },
  ],
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
