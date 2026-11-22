import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { getCategory, getModel } from '../domain/catalog'
import { getPlan } from '../domain/plans'
import { getModelSources } from '../domain/sources'
import { ModelIllustration } from '../components/ModelIllustration'
import PlanCalculator from '../components/PlanCalculator'

const SECTIONS: { title: string; note: string }[] = [
  { title: 'תמונת תוצר מוגמר', note: 'תמונה תתווסף לאחר אימות ממקור.' },
  { title: 'מידות חיצוניות (רוחב, עומק, גובה)', note: 'טרם אומתו מידות לדגם זה.' },
  { title: 'סוג עץ מומלץ ועובי', note: 'טרם אומתו חומרים לדגם זה.' },
  { title: 'חומרים חלופיים', note: 'יוצגו רק כשתהיה התאמה מוכחת.' },
  { title: 'מידות מדויקות לכל חלק', note: 'טבלת חלקים תופיע לאחר אימות התוכנית.' },
  { title: 'שרטוטי חזית, צד ומבט על', note: 'שרטוטים ייבנו ממקור המידות המאומת בלבד.' },
  { title: 'שרטוט הרכבה עם סימון חלקים', note: 'טרם נבנה, כי אין מידות מאומתות.' },
  { title: 'כתב כמויות', note: 'לא ניתן לחשב לפני אימות החלקים והמידות.' },
  { title: 'מחברים (סוג, קוטר ואורך)', note: 'יוצגו לפי מפרט מאומת בלבד.' },
  { title: 'כלי עבודה ואביזרי מגן', note: 'רשימה תופיע לאחר אימות התוכנית.' },
  { title: 'מדריך עבודה לפי שלבים', note: 'מדריך לא זמין לדגם שלא אומת.' },
  { title: 'תמונה או תרשים לכל שלב', note: 'יתווספו עם המדריך.' },
  { title: 'סרטון הדרכה', note: 'יוטמע רק כשיש סרטון שנבדק ואומת.' },
  { title: 'בדיקות איכות בסיום', note: 'רשימת בדיקות תופיע עם התוכנית המאומתת.' },
]

export default function ModelPage() {
  const { modelId = '' } = useParams()
  const navigate = useNavigate()
  const model = getModel(modelId)
  const plan = getPlan(modelId)
  const isFavorite = useLiveQuery(() => db.favorites.get(modelId).then((f) => !!f), [modelId], false)

  if (!model) {
    return (
      <div className="page">
        <h1 className="page-title">הדגם לא נמצא</h1>
        <Link className="btn secondary" to="/catalog">חזרה לקטלוג</Link>
      </div>
    )
  }

  const category = getCategory(model.categoryId)

  const toggleFavorite = async () => {
    if (isFavorite) await db.favorites.delete(model.id)
    else await db.favorites.put({ modelId: model.id, addedAt: Date.now() })
  }

  const startProject = async () => {
    const now = Date.now()
    const id = await db.projects.add({
      modelId: model.id,
      name: model.name,
      status: 'planned',
      notes: '',
      createdAt: now,
      updatedAt: now,
    })
    navigate(`/projects/${id}`)
  }

  return (
    <div className="page">
      <div className="breadcrumb muted no-print">
        <Link to="/catalog">קטלוג</Link> / {category?.name}
      </div>
      <h1 className="page-title">{plan?.name ?? model.name}</h1>

      <figure className="model-illustration no-print">
        <ModelIllustration modelId={modelId} name={plan?.name ?? model.name} />
        <figcaption className="muted">המחשה בלבד: איור מקורי של הדגם לאחר הרכבה. זה אינו שרטוט בנייה ואינו מציג מידות.</figcaption>
      </figure>

      <div className="notice no-print" role="alert">
        <strong>הדגם טרם אומת</strong>
        התוכנית, המידות והבדיקות של הדגם עדיין לא נבדקו ממקור מאומת. אין כאן הוראות בנייה סופיות.
      </div>

      <div className="card no-print">
        <h2 style={{ marginTop: 0 }}>תיאור השימוש</h2>
        <p>{plan?.usage ?? model.usage}</p>
        <div className="row">
          <span className="badge">רמת קושי: {plan?.difficulty ?? 'טרם נקבעה'}</span>
          <span className="badge warn">סטטוס: לא מאומת</span>
        </div>
      </div>

      <div className="row no-print" style={{ margin: '16px 0' }}>
        <button className="btn secondary" onClick={toggleFavorite} aria-pressed={!!isFavorite}>
          {isFavorite ? '★ במועדפים' : '☆ הוסף למועדפים'}
        </button>
        {!plan && <button className="btn" onClick={startProject}>הוסף לפרויקטים שלי</button>}
      </div>

      {plan ? (
        <PlanCalculator plan={plan} />
      ) : (
        <>
          <div className="card no-print">
            <h2 style={{ marginTop: 0 }}>מקורות חיצוניים חינמיים</h2>
            <p className="muted">
              אלה הפניות בלבד. WoodCraft לא בדקה את התוכניות האלה ולא העתיקה מהן מידות או שלבים.
            </p>
            {getModelSources(modelId).length === 0 ? (
              <p>לא נמצא מקור חינמי מתאים לדגם הזה בחיפוש הנוכחי.</p>
            ) : (
              <ul>
                {getModelSources(modelId).map((src) => (
                  <li key={src.url}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer">{src.title}</a>{' '}
                    <span className="muted">({src.publisher})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <h2>תוכן הדגם</h2>
          {SECTIONS.map((s, i) => (
            <div key={s.title} className="section-box">
              <h3>{i + 1}. {s.title}</h3>
              <div className="muted">{s.note}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
