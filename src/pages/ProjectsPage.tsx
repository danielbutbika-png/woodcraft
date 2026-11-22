import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, STATUS_LABELS } from '../db/db'
import { getModel } from '../domain/catalog'

export default function ProjectsPage() {
  const projects = useLiveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray(), [])

  return (
    <div className="page">
      <h1 className="page-title">הנגרייה שלי</h1>
      <p className="muted">הפרויקטים נשמרים במכשיר הזה. מומלץ לבדוק מדי פעם שהם נשמרים כראוי לאחר רענון הדף.</p>

      {projects && projects.length === 0 && (
        <div className="empty">
          <p>עוד לא התחלת פרויקט.</p>
          <Link className="btn" to="/catalog">בוא נבנה משהו</Link>
        </div>
      )}

      <div className="grid">
        {projects?.map((p) => (
          <Link key={p.id} className="card-link" to={`/projects/${p.id}`}>
            <div className="card">
              <div className="thumb" aria-hidden="true">🪚</div>
              <strong>{p.name}</strong>
              <div className="muted" style={{ fontSize: '0.9rem' }}>{STATUS_LABELS[p.status]}</div>
              {getModel(p.modelId)?.verification !== 'verified' && (
                <div style={{ marginTop: 8 }}><span className="badge warn">דגם לא מאומת</span></div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
