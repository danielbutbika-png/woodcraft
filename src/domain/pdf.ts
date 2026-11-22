/**
 * הערה: גופן ברירת המחדל של jsPDF אינו תומך בעברית, לכן כל טקסט עברי נכנס כתמונה
 * (מהדפדפן), והכיתוב בתחתית העמוד באנגלית בלבד.
 *
 * בניית קובץ PDF אמיתי מהמקטעים שמוצגים בחבילת הייצוא (PrintSheet).
 * כל מקטע מצולם בדפדפן, כך שהעברית והכיוון RTL נשמרים כפי שהם מוצגים.
 * הספריות נטענות בעצלתיים, כך שאינן נכנסות לטעינת העמוד הראשון.
 */

const A4_W = 210
const A4_H = 297
const MARGIN = 12

export interface PdfProgress {
  (done: number, total: number): void
}

export async function buildPdfFromSections(root: HTMLElement, onProgress?: PdfProgress): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])

  const sections = Array.from(root.querySelectorAll<HTMLElement>('.pdf-section'))
  if (sections.length === 0) throw new Error('אין תוכן לייצוא.')

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  const usableW = A4_W - 2 * MARGIN
  const usableH = A4_H - 2 * MARGIN
  let y = MARGIN

  for (let i = 0; i < sections.length; i++) {
    onProgress?.(i, sections.length)
    const canvas = await html2canvas(sections[i], {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    })
    const imgH = (canvas.height * usableW) / canvas.width

    if (imgH <= usableH) {
      if (y + imgH > A4_H - MARGIN) {
        pdf.addPage()
        y = MARGIN
      }
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', MARGIN, y, usableW, imgH, undefined, 'FAST')
      y += imgH + 4
      continue
    }

    // מקטע גבוה מעמוד אחד: חותכים אותו לפרוסות.
    const pxPerMm = canvas.width / usableW
    const slicePx = usableH * pxPerMm
    let offset = 0
    while (offset < canvas.height) {
      if (y > MARGIN) {
        pdf.addPage()
        y = MARGIN
      }
      const h = Math.min(slicePx, canvas.height - offset)
      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = h
      slice.getContext('2d')!.drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h)
      const sliceMm = h / pxPerMm
      pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', MARGIN, MARGIN, usableW, sliceMm, undefined, 'FAST')
      offset += h
      y = MARGIN + sliceMm
    }
    y += 4
  }
  onProgress?.(sections.length, sections.length)

  const pages = pdf.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p)
    pdf.setFontSize(8)
    pdf.setTextColor(120)
    pdf.text(`DRAFT - NOT VERIFIED FOR CONSTRUCTION  |  page ${p} of ${pages}`, A4_W / 2, A4_H - 5, { align: 'center' })
  }

  return pdf.output('blob')
}
