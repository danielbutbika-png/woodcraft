import { Link, useSearchParams } from 'react-router-dom'
import { CATEGORIES, MODELS, getCategory } from '../domain/catalog'

export default function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const cat = params.get('cat') ?? ''

  const models = MODELS.filter((m) => {
    if (cat && m.categoryId !== cat) return false
    if (q && !m.name.includes(q) && !m.usage.includes(q)) return false
    return true
  })

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="page">
      <h1 className="page-title">קטלוג דגמים</h1>

      <label htmlFor="catalog-search" className="muted">חיפוש בקטלוג</label>
      <input
        id="catalog-search"
        className="search"
        type="search"
        value={q}
        placeholder="חפש לפי שם או שימוש"
        onChange={(e) => setParam('q', e.target.value)}
      />

      <div className="chips" role="group" aria-label="סינון לפי קטגוריה">
        <button className="chip" aria-pressed={!cat} onClick={() => setParam('cat', '')}>הכול</button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className="chip"
            aria-pressed={cat === c.id}
            onClick={() => setParam('cat', c.id)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <p className="muted">
        {models.length} דגמים{cat && getCategory(cat) ? ` ב${getCategory(cat)?.name}` : ''}
      </p>

      {models.length === 0 ? (
        <div className="empty">לא נמצאו דגמים לחיפוש הזה.</div>
      ) : (
        <div className="grid">
          {models.map((m) => (
            <Link key={m.id} className="card-link" to={`/catalog/${m.id}`}>
              <div className="card">
                <div className="thumb" aria-hidden="true">🪵</div>
                <strong>{m.name}</strong>
                <div className="muted" style={{ fontSize: '0.9rem' }}>{getCategory(m.categoryId)?.name}</div>
                <div style={{ marginTop: 8 }}>
                  <span className="badge warn">לא מאומת</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
