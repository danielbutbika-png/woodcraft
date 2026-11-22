import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, STATUS_LABELS } from '../db/db'

export default function PlanPage() {
  const projects = useLiveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray(), [])

  return (
    <div className="page">
      <h1 className="page-title">תכנון</h1>

      <div className="notice">
        <strong>מנוע התאמת המידות ייבנה בשלב ג</strong>
        עדיין לא ניתן להזין מידות שטח ולקבל תוכנית מחושבת. עד אז אפשר לנהל את הפרויקטים ולעקוב אחר הסטטוס שלהם.
      </div>

      <h2>הפרויקטים שלי</h2>
      {projects && projects.length === 0 && (
        <div className="empty">
          אין עדיין פרויקטים. <Link to="/catalog">בחר דגם מהקטלוג</Link> כדי להתחיל.
        </div>
      )}
      <ul className="verify-list">
        {projects?.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link>
            <span className="muted">{STATUS_LABELS[p.status]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
