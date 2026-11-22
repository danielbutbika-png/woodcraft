import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db, STATUS_LABELS, type ProjectStatus } from '../db/db'
import { getModel } from '../domain/catalog'

export default function ProjectPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const id = Number(projectId)

  const [loaded, setLoaded] = useState(false)
  const [found, setFound] = useState(true)
  const [name, setName] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('planned')
  const [notes, setNotes] = useState('')
  const [modelId, setModelId] = useState('')
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    db.projects.get(id).then((p) => {
      if (cancelled) return
      if (!p) {
        setFound(false)
      } else {
        setName(p.name)
        setStatus(p.status)
        setNotes(p.notes)
        setModelId(p.modelId)
      }
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!loaded) return <div className="page"><p className="muted">טוען...</p></div>

  if (!found) {
    return (
      <div className="page">
        <h1 className="page-title">הפרויקט לא נמצא</h1>
        <Link className="btn secondary" to="/projects">חזרה לפרויקטים</Link>
      </div>
    )
  }

  const model = getModel(modelId)

  const save = async () => {
    await db.projects.update(id, {
      name: name.trim() || model?.name || 'פרויקט ללא שם',
      status,
      notes,
      updatedAt: Date.now(),
    })
    setSavedAt(Date.now())
  }

  const remove = async () => {
    if (!window.confirm('למחוק את הפרויקט? הפעולה אינה הפיכה.')) return
    await db.projects.delete(id)
    navigate('/projects')
  }

  return (
    <div className="page">
      <div className="breadcrumb muted">
        <Link to="/projects">הפרויקטים שלי</Link>
      </div>
      <h1 className="page-title">{name || model?.name}</h1>

      {model && model.verification !== 'verified' && (
        <div className="notice">
          <strong>הדגם טרם אומת</strong>
          הפרויקט נשמר לתכנון אישי בלבד. המידות והחומרים עדיין לא נבדקו, ולכן אין כאן תוכנית בנייה סופית.
          <div style={{ marginTop: 8 }}>
            <Link to={`/catalog/${model.id}`}>לצפייה בדגם</Link>
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="pname">שם הפרויקט</label>
        <input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="pstatus">סטטוס</label>
        <select id="pstatus" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
          {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="pnotes">הערות אישיות</label>
        <textarea id="pnotes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="row">
        <button className="btn" onClick={save}>שמור</button>
        <button className="btn danger" onClick={remove}>מחק פרויקט</button>
        {savedAt && <span className="muted" role="status">נשמר</span>}
      </div>
    </div>
  )
}
