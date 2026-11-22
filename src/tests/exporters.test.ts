import { describe, expect, it } from 'vitest'
import ExcelJS from 'exceljs'
import { calculate } from '../domain/engine'
import { PLANS } from '../domain/plans'
import { HARDWARE_HEADERS, PART_HEADERS, partRows, toCsv, toExcel, totals, DRAFT_NOTICE } from '../domain/exporters'

const plan = PLANS['storage-box']
const inputs = { variables: { innerW: 300, innerD: 200, innerH: 120 }, thickness: 18 }
const result = calculate(plan, inputs)
const rows = partRows(plan, result.parts)
const hw = plan.hardware(inputs.variables, inputs.thickness)

describe('כתב כמויות', () => {
  it('שורות החלקים כוללות את כל העמודות הנדרשות', () => {
    expect(rows).toHaveLength(4)
    expect(rows[0].material).toBe('עץ מלא')
    expect(rows[0].status).toBe('טרם נרכש')
  })

  it('סיכום כמויות ושטח מחושב נכון', () => {
    const t = totals(rows)
    expect(t.pieces).toBe(6)
    expect(t.areaM2).toBeGreaterThan(0)
  })
})

describe('ייצוא CSV', () => {
  it('מתחיל ב-BOM כדי לתמוך בעברית', () => {
    const csv = toCsv(rows, hw)
    expect(csv.charCodeAt(0)).toBe(0xfeff)
  })

  it('כולל הערת טיוטה, כותרות ושמות חלקים בעברית', () => {
    const csv = toCsv(rows, hw)
    expect(csv).toContain(DRAFT_NOTICE)
    expect(csv).toContain(PART_HEADERS.join(','))
    expect(csv).toContain('A01')
    expect(csv).toContain('תחתית')
    expect(csv).toContain(HARDWARE_HEADERS.join(','))
  })

  it('מוסיף מירכאות לתאים עם פסיקים או מירכאות', () => {
    const tricky = [{ ...rows[0], name: 'צד, "ימין"' }]
    const csv = toCsv(tricky, [])
    expect(csv).toContain('"צד, ""ימין"""')
  })
})

describe('ייצוא Excel', () => {
  it('נוצר קובץ xlsx תקין עם גיליונות בכיוון מימין לשמאל', async () => {
    const bytes = await toExcel({ title: plan.name }, rows, hw)
    expect(bytes.byteLength).toBeGreaterThan(1000)

    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(bytes)
    const ws = wb.getWorksheet('כתב כמויות')!
    expect(ws).toBeDefined()
    expect(ws.views[0].rightToLeft).toBe(true)
    expect(ws.getCell('A1').value).toBe(plan.name)
    expect(ws.getCell('A2').value).toBe(DRAFT_NOTICE)

    const headerValues = PART_HEADERS.map((_, i) => ws.getRow(4).getCell(i + 1).value)
    expect(headerValues).toEqual(PART_HEADERS)
    expect(ws.getCell('A5').value).toBe('A01')
    expect(ws.getCell('B5').value).toBe('תחתית')
    expect(ws.getCell('H5').value).toBe(1)
  })

  it('גיליון המחברים גם הוא בכיוון RTL ומכיל את השורות', async () => {
    const bytes = await toExcel({ title: plan.name }, rows, hw)
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(bytes)
    const hws = wb.getWorksheet('מחברים')!
    expect(hws.views[0].rightToLeft).toBe(true)
    expect(hws.getCell('A1').value).toBe(HARDWARE_HEADERS[0])
    expect(hws.getRow(2).getCell(1).value).toBe('H01')
  })

  it('כתיבה ללא רווחים מיותרים: מספר השורות תואם לחלקים', async () => {
    const bytes = await toExcel({ title: plan.name }, rows, hw)
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(bytes)
    const ws = wb.getWorksheet('כתב כמויות')!
    const ids = [5, 6, 7, 8].map((r) => ws.getRow(r).getCell(1).value)
    expect(ids).toEqual(['A01', 'A02', 'A03', 'A04'])
  })
})
