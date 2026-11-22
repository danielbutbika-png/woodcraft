/**
 * שרטוטי SVG שנבנים מחדש מהמידות הנוכחיות בכל חישוב.
 * אין כאן תמונות סטטיות: כל מידה נגזרת מתוצאת המנוע.
 */
import type { PartSpec, Space } from './engine'

const INK = '#3A2A1D'
const WOOD = '#D1B08A'
const PAPER = '#FBF6EE'
const SAGE = '#8C9A72'

/** תוכן טקסט בתוך SVG: מספיק לברוח מתווים שמשנים מבנה. */
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** ערך תכונה (attribute) בתוך SVG: צריך לברוח גם ממירכאות. */
const escAttr = (s: string): string => esc(s).replace(/"/g, '&quot;')

export interface Drawings {
  front: string
  side: string
  top: string
  exploded: string
}

/** מבט מלבני עם קווי מידה. היחידות במילימטרים, כך שהשרטוט מתאים לגודל המסך. */
function outlineView(title: string, w: number, h: number, hLabel: string, vLabel: string): string {
  const fs = Math.max(w, h) * 0.065
  const pad = fs * 4
  const x = pad
  const y = pad
  const vbW = w + pad * 2
  const vbH = h + pad * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="${escAttr(title)}" style="direction:ltr">
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${WOOD}" fill-opacity="0.35" stroke="${INK}" stroke-width="${fs * 0.12}"/>
<line x1="${x}" y1="${y - fs}" x2="${x + w}" y2="${y - fs}" stroke="${INK}" stroke-width="${fs * 0.06}"/>
<text x="${x + w / 2}" y="${y - fs * 1.4}" text-anchor="middle" font-size="${fs}" fill="${INK}">${esc(hLabel)}</text>
<line x1="${x - fs}" y1="${y}" x2="${x - fs}" y2="${y + h}" stroke="${INK}" stroke-width="${fs * 0.06}"/>
<text x="${x - fs * 1.4}" y="${y + h / 2}" text-anchor="middle" font-size="${fs}" fill="${INK}" transform="rotate(-90 ${x - fs * 1.4} ${y + h / 2})">${esc(vLabel)}</text>
<text x="${x + w / 2}" y="${y + h + fs * 2.4}" text-anchor="middle" font-size="${fs}" fill="${INK}">${esc(title)}</text>
</svg>`
}

/** מבט מפורק: החלקים בשורות, בגודלם האמיתי, עם תוויות שלא חופפות. */
export function explodedView(parts: PartSpec[]): string {
  const MAX_ROW = 1000
  const GAP = 60
  const FS = 26
  const LINE = FS * 1.4
  const LABEL_GAP = FS * 1.6

  interface Item { x: number; w: number; h: number; l1: string; l2: string }
  interface Row { y: number; h: number; items: Item[] }

  const rows: Row[] = [{ y: 0, h: 0, items: [] }]
  let cur = rows[0]
  let x = 0
  let maxX = 0

  for (const p of parts) {
    const l1 = `${p.id} ${p.name}`
    const l2 = `${p.length}×${p.width}×${p.thickness} mm · ×${p.quantity}`
    const labelW = Math.max(l1.length, l2.length) * FS * 0.6
    const cell = Math.max(p.length, labelW)
    if (cur.items.length > 0 && x + cell > MAX_ROW) {
      const nextY = cur.y + cur.h + LABEL_GAP + LINE * 2 + GAP
      cur = { y: nextY, h: 0, items: [] }
      rows.push(cur)
      x = 0
    }
    cur.items.push({ x, w: p.length, h: p.width, l1, l2 })
    cur.h = Math.max(cur.h, p.width)
    x += cell + GAP
    maxX = Math.max(maxX, x)
  }

  const last = rows[rows.length - 1]
  const vbW = Math.max(maxX, 200)
  const vbH = last.y + last.h + LABEL_GAP + LINE * 2 + GAP
  const shapes = rows
    .flatMap((row) =>
      row.items.map((it) => {
        const labelY = row.y + row.h + LABEL_GAP
        return (
          `<rect x="${it.x}" y="${row.y}" width="${it.w}" height="${it.h}" fill="${WOOD}" fill-opacity="0.45" stroke="${INK}" stroke-width="3"/>` +
          `<text x="${it.x}" y="${labelY}" font-size="${FS}" fill="${INK}">${esc(it.l1)}</text>` +
          `<text x="${it.x}" y="${labelY + LINE}" font-size="${FS}" fill="${INK}">${esc(it.l2)}</text>`
        )
      }),
    )
    .join('\n')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="מבט מפורק" style="direction:ltr;background:${PAPER}">
${shapes}
</svg>`
}

/**
 * שרטוט הרכבה: מבט חזית ומבט צד של החלקים שכבר הורכבו עד השלב הנוכחי.
 * החלקים של השלב הנוכחי מסומנים בירוק-מרווה. מיקומי התיבות מגיעים מהמנוע.
 */
export function assemblyView(outer: Space, parts: PartSpec[], shown: Set<string>, current: Set<string>): string {
  const H = outer.height
  const W = outer.width
  const D = outer.depth
  const fs = Math.max(W, D, H) * 0.06
  const pad = fs * 2.5
  const gap = fs * 4
  const sideX = pad + W + gap
  const vbW = sideX + D + pad
  const vbH = H + pad * 2 + fs * 2.5
  const top = pad
  const boxes: string[] = []
  for (const part of parts) {
    if (!shown.has(part.id) || !part.placements) continue
    const fill = current.has(part.id) ? SAGE : WOOD
    part.placements.forEach((b, i) => {
      const fy = top + (H - b.z1)
      const h = b.z1 - b.z0
      boxes.push(
        `<rect x="${pad + b.x0}" y="${fy}" width="${b.x1 - b.x0}" height="${h}" fill="${fill}" fill-opacity="0.7" stroke="${INK}" stroke-width="${fs * 0.08}"/>` +
          (i === 0 && h > fs * 1.2 && b.x1 - b.x0 > fs * 2
            ? `<text x="${pad + (b.x0 + b.x1) / 2}" y="${fy + h / 2 + fs * 0.35}" text-anchor="middle" font-size="${fs}" fill="${INK}">${esc(part.id)}</text>`
            : ''),
      )
      boxes.push(
        `<rect x="${sideX + b.y0}" y="${fy}" width="${b.y1 - b.y0}" height="${h}" fill="${fill}" fill-opacity="0.7" stroke="${INK}" stroke-width="${fs * 0.08}"/>`,
      )
    })
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" role="img" aria-label="שרטוט הרכבה" style="direction:ltr;background:${PAPER}">
<rect x="${pad}" y="${top}" width="${W}" height="${H}" fill="none" stroke="${INK}" stroke-dasharray="${fs * 0.3} ${fs * 0.2}" stroke-width="${fs * 0.05}"/>
<rect x="${sideX}" y="${top}" width="${D}" height="${H}" fill="none" stroke="${INK}" stroke-dasharray="${fs * 0.3} ${fs * 0.2}" stroke-width="${fs * 0.05}"/>
${boxes.join('\n')}
<text x="${pad + W / 2}" y="${top + H + fs * 2}" text-anchor="middle" font-size="${fs}" fill="${INK}">חזית</text>
<text x="${sideX + D / 2}" y="${top + H + fs * 2}" text-anchor="middle" font-size="${fs}" fill="${INK}">צד</text>
</svg>`
}

/** כל השרטוטים לפי המידות החיצוניות והחלקים של התוצאה הנוכחית. */
export function buildDrawings(outer: Space, parts: PartSpec[]): Drawings {
  const unit = (n: number) => `${Math.round(n)} מ"מ`
  return {
    front: outlineView('חזית', outer.width, outer.height, unit(outer.width), unit(outer.height)),
    side: outlineView('מבט צד', outer.depth, outer.height, unit(outer.depth), unit(outer.height)),
    top: outlineView('מבט על', outer.width, outer.depth, unit(outer.width), unit(outer.depth)),
    exploded: explodedView(parts),
  }
}
