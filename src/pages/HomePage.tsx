import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, STATUS_LABELS } from '../db/db'
import { CATEGORIES, getModel } from '../domain/catalog'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'לילה טוב'
  if (h < 12) return 'בוקר טוב'
  if (h < 17) return 'צהריים טובים'
  if (h < 21) return 'ערב טוב'
  return 'לילה טוב'
}

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const lastProject = useLiveQuery(() => db.projects.orderBy('updatedAt').reverse().first(), [])
  const favorites = useLiveQuery(() => db.favorites.orderBy('addedAt').reverse().toArray(), [])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/catalog?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>{greeting()}, ברוך הבא לנגרייה</h1>
        <p>תכנון, התאמת מידות ובנייה של פרויקטי עץ ביתיים, בעברית ובשלבים ברורים.</p>
        <Link className="btn big" to="/catalog" style={{ background: 'var(--cream)', color: 'var(--deep)', borderColor: 'var(--cream)' }}>
          בוא נבנה משהו
        </Link>
      </header>

      <form onSubmit={onSearch} role="search" style={{ marginTop: 16 }}>
        <label htmlFor="home-search" className="muted">חיפוש פרויקט</label>
        <input
          id="home-search"
          className="search"
          type="search"
          placeholder="למשל: מעמד טלפון"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {lastProject && (
        <section>
          <h2>המשך פרויקט אחרון</h2>
          <Link className="card-link" to={`/projects/${lastProject.id}`}>
            <div className="card">
              <strong>{lastProject.name}</strong>
              <div className="muted">{STATUS_LABELS[lastProject.status]}</div>
            </div>
          </Link>
        </section>
      )}

      <section>
        <h2>קטגוריות נגרות</h2>
        <div className="grid">
          {CATEGORIES.map((c) => (
            <Link key={c.id} className="card-link" to={`/catalog?cat=${c.id}`}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem' }} aria-hidden="true">{c.icon}</div>
                <strong>{c.name}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>פרויקטים מועדפים</h2>
        {favorites && favorites.length === 0 && (
          <div className="empty">עדיין אין מועדפים. אפשר לסמן דגם כמועדף מתוך כרטיס הדגם.</div>
        )}
        <div className="grid">
          {favorites?.map((f) => {
            const m = getModel(f.modelId)
            if (!m) return null
            return (
              <Link key={f.modelId} className="card-link" to={`/catalog/${m.id}`}>
                <div className="card"><strong>{m.name}</strong></div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="row" style={{ marginTop: 24 }}>
        <Link className="btn secondary" to="/projects">הפרויקטים שלי</Link>
        <Link className="btn secondary" to="/suppliers">ספקים בסביבה שלי</Link>
      </section>
    </div>
  )
}
