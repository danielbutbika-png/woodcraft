import { describe, expect, it } from 'vitest'
import { buildDrawings } from '../domain/drawings'
import { calculate } from '../domain/engine'
import { PLANS } from '../domain/plans'

const storage = PLANS['storage-box']
const cfg = (innerW: number) => ({ variables: { innerW, innerD: 200, innerH: 120 }, thickness: 18 })

describe('שרטוטים דינמיים', () => {
  it('מכילים את המידות החיצוניות הנוכחיות', () => {
    const r = calculate(storage, cfg(300))
    const d = buildDrawings(r.outer!, r.parts)
    expect(d.front).toContain('336 מ"מ')
    expect(d.side).toContain('236 מ"מ')
    expect(d.top).toContain('336 מ"מ')
    expect(d.front.startsWith('<svg')).toBe(true)
  })

  it('מתעדכנים כשמשנים מידה', () => {
    const a = calculate(storage, cfg(300))
    const b = calculate(storage, cfg(450))
    const da = buildDrawings(a.outer!, a.parts)
    const db = buildDrawings(b.outer!, b.parts)
    expect(db.front).not.toBe(da.front)
    expect(db.front).toContain('486 מ"מ')
    expect(db.exploded).not.toBe(da.exploded)
  })

  it('המבט המפורק מכיל את כל מזהי החלקים', () => {
    const r = calculate(storage, cfg(300))
    const d = buildDrawings(r.outer!, r.parts)
    for (const p of r.parts) expect(d.exploded).toContain(p.id)
  })

  it('תווים מיוחדים בשמות מסומנים בבטחה ב-SVG', () => {
    const r = calculate(storage, cfg(300))
    const bad = { ...r.parts[0], name: '<script>x</script>' }
    const d = buildDrawings(r.outer!, [bad])
    expect(d.exploded).not.toContain('<script>')
    expect(d.exploded).toContain('&lt;script&gt;')
  })
})
