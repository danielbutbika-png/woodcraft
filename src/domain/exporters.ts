/**
 * ייצוא כתב הכמויות: CSV (עם BOM לעברית) ו-Excel (גיליונות מימין לשמאל).
 * ייצוא PDF נעשה בדפדפן דרך תצוגת הדפסה, ומופעל מתוך הממשק.
 */
import ExcelJS from 'exceljs'
import type { PartSpec } from './engine'
import type { HardwareRow, PlanDef } from './plans/types'

export interface PartRow {
  number: string
  name: string
  material: string
  wood: string
  length: number
  width: number
  thickness: number
  qty: number
  notes: string
  status: string
}

export const PART_HEADERS = [
  'מספר חלק',
  'שם החלק',
  'חומר',
  'סוג העץ',
  'אורך (מ"מ)',
  'רוחב (מ"מ)',
  'עובי (מ"מ)',
  'כמות יחידות',
  'הערות',
  'סטטוס רכישה',
]

export const HARDWARE_HEADERS = ['מזהה', 'שם המחבר', 'סוג', 'כמות', 'מפרט קוטר ואורך', 'שימוש']

export const DRAFT_NOTICE = 'טיוטה: לא מאומת. אין להשתמש בכתב זה לבנייה לפני אימות מקצועי.'

export function partRows(plan: PlanDef, parts: PartSpec[]): PartRow[] {
  return parts.map((p) => ({
    number: p.id,
    name: p.name,
    material: plan.woods.find((w) => w.name === p.material)?.category ?? 'לא צוין',
    wood: p.material,
    length: p.length,
    width: p.width,
    thickness: p.thickness,
    qty: p.quantity,
    notes: '',
    status: 'טרם נרכש',
  }))
}

export function totals(rows: PartRow[]): { pieces: number; areaM2: number } {
  let pieces = 0
  let area = 0
  for (const r of rows) {
    pieces += r.qty
    area += ((r.length * r.width) / 1_000_000) * r.qty
  }
  return { pieces, areaM2: Math.round(area * 10000) / 10000 }
}

const csvCell = (value: string | number): string => {
  const s = String(value)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** CSV עם BOM בתחילת הקובץ, כדי ש-Excel יציג עברית נכון. */
export function toCsv(rows: PartRow[], hardware: HardwareRow[]): string {
  const lines: string[] = [
    DRAFT_NOTICE,
    PART_HEADERS.join(','),
    ...rows.map((r) =>
      [r.number, r.name, r.material, r.wood, r.length, r.width, r.thickness, r.qty, r.notes, r.status].map(csvCell).join(','),
    ),
    '',
    HARDWARE_HEADERS.join(','),
    ...hardware.map((h) => [h.id, h.name, h.type, h.quantity, h.spec, h.usage].map(csvCell).join(',')),
  ]
  return '﻿' + lines.join('\r\n')
}

const HEADER_FILL = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD1B08A' } }
const DRAFT_FONT = { bold: true, color: { argb: 'FF8A5A00' } }

function writeHeader(ws: ExcelJS.Worksheet, rowNumber: number, headers: string[]): void {
  const row = ws.getRow(rowNumber)
  headers.forEach((h, i) => {
    const cell = row.getCell(i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: 'FF2B1F15' } }
    cell.fill = HEADER_FILL
    cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true }
  })
}

/** Excel עם שני גיליונות בכיוון מימין לשמאל: כתב כמויות ומחברים. */
export async function toExcel(
  meta: { title: string },
  rows: PartRow[],
  hardware: HardwareRow[],
  steps: { title: string; body: string; partIds?: string[] }[] = [],
): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'WoodCraft'

  const ws = wb.addWorksheet('כתב כמויות', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 4 }],
  })
  ws.getCell('A1').value = meta.title
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF3A2A1D' } }
  ws.getCell('A2').value = DRAFT_NOTICE
  ws.getCell('A2').font = DRAFT_FONT

  writeHeader(ws, 4, PART_HEADERS)
  rows.forEach((r, i) => {
    const row = ws.getRow(5 + i)
    ;[r.number, r.name, r.material, r.wood, r.length, r.width, r.thickness, r.qty, r.notes, r.status].forEach(
      (v, c) => {
        row.getCell(c + 1).value = v
      },
    )
    row.alignment = { horizontal: 'right' }
  })

  const t = totals(rows)
  const totalRowNumber = 5 + rows.length + 1
  ws.getCell(`A${totalRowNumber}`).value = 'סה"כ'
  ws.getCell(`A${totalRowNumber}`).font = { bold: true }
  ws.getCell(`H${totalRowNumber}`).value = t.pieces
  ws.getCell(`H${totalRowNumber}`).font = { bold: true }
  ws.getCell(`I${totalRowNumber}`).value = `שטח כולל: ${t.areaM2} מ"ר`

  const widths = [12, 22, 14, 18, 14, 14, 14, 14, 24, 16]
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w
  })

  const hw = wb.addWorksheet('מחברים', { views: [{ rightToLeft: true }] })
  writeHeader(hw, 1, HARDWARE_HEADERS)
  hardware.forEach((h, i) => {
    const row = hw.getRow(2 + i)
    ;[h.id, h.name, h.type, h.quantity, h.spec, h.usage].forEach((v, c) => {
      row.getCell(c + 1).value = v
    })
  })
  ;[10, 18, 26, 10, 22, 44].forEach((w, i) => {
    hw.getColumn(i + 1).width = w
  })

  const sw = wb.addWorksheet('שלבי עבודה', { views: [{ rightToLeft: true }] })
  writeHeader(sw, 1, ['מספר שלב', 'כותרת', 'הסבר', 'חלקים בשלב'])
  steps.forEach((st, i) => {
    const row = sw.getRow(2 + i)
    ;[i + 1, st.title, st.body, (st.partIds ?? []).join(', ')].forEach((v, c) => {
      row.getCell(c + 1).value = v
      row.getCell(c + 1).alignment = { wrapText: true, horizontal: 'right', vertical: 'top' }
    })
  })
  ;[10, 28, 60, 18].forEach((w, i) => {
    sw.getColumn(i + 1).width = w
  })

  const buffer = await wb.xlsx.writeBuffer()
  return buffer as unknown as ArrayBuffer
}
