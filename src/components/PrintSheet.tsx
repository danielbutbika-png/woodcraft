import type { CalcResult, UserInputs } from '../domain/engine'
import type { PlanDef } from '../domain/plans/types'
import type { Drawings } from '../domain/drawings'
import { DRAFT_NOTICE, type PartRow } from '../domain/exporters'

interface Props {
  plan: PlanDef
  result: CalcResult
  applied: UserInputs
  rows: PartRow[]
  hardware: { id: string; name: string; type: string; quantity: number; spec: string; usage: string }[]
  drawings: Drawings
  assemblies: string[]
  generatedAt: string
}

/**
 * תוכן חבילת ה-PDF. מוצג מחוץ למסך (ולא מוסתר), כדי שהדפדפן יוכל לצלם אותו.
 * כל מקטע מסומן בכיתה pdf-section, וכל מקטע נכנס לעמוד או נחתך לעמודים.
 */
export default function PrintSheet({ plan, result, applied, rows, hardware, drawings, assemblies, generatedAt }: Props) {
  const outer = result.outer!
  return (
    <div className="pdf-sheet" dir="rtl" lang="he" aria-hidden="true">
      <section className="pdf-section">
        <h1>{plan.name}</h1>
        <p className="pdf-draft">{DRAFT_NOTICE}</p>
        <p className="pdf-muted">הופק: {generatedAt}</p>
        <table className="pdf-table">
          <tbody>
            <tr><th>מידות חיצוניות (רוחב × עומק × גובה)</th><td>{Math.round(outer.width)} × {Math.round(outer.depth)} × {Math.round(outer.height)} מ"מ</td></tr>
            <tr><th>עובי חומר</th><td>{applied.thickness} מ"מ</td></tr>
            <tr><th>חומר נבחר</th><td>{applied.material ?? 'לא צוין'}</td></tr>
            {plan.variables.map((v) => (
              <tr key={v.key}><th>{v.label}</th><td>{applied.variables[v.key]} מ"מ</td></tr>
            ))}
          </tbody>
        </table>
        <p className="pdf-muted">{plan.usage}</p>
      </section>

      <section className="pdf-section">
        <h2>שרטוטים</h2>
        <div className="pdf-drawings">
          <div dangerouslySetInnerHTML={{ __html: drawings.front }} />
          <div dangerouslySetInnerHTML={{ __html: drawings.side }} />
          <div dangerouslySetInnerHTML={{ __html: drawings.top }} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: drawings.exploded }} />
      </section>

      <section className="pdf-section">
        <h2>כתב כמויות</h2>
        <table className="pdf-table pdf-grid">
          <thead>
            <tr><th>מספר</th><th>שם החלק</th><th>חומר</th><th>סוג העץ</th><th>אורך</th><th>רוחב</th><th>עובי</th><th>כמות</th><th>סטטוס רכישה</th><th>הערות</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.number}>
                <td>{r.number}</td><td>{r.name}</td><td>{r.material}</td><td>{r.wood}</td>
                <td>{r.length}</td><td>{r.width}</td><td>{r.thickness}</td><td>{r.qty}</td>
                <td>{r.status}</td><td>{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="pdf-section">
        <h2>מחברים וחומרי עזר</h2>
        <p className="pdf-muted">המפרט (קוטר ואורך) נשאר "נדרש מפרט מאומת" עד בדיקה מקצועית.</p>
        <table className="pdf-table pdf-grid">
          <thead><tr><th>מזהה</th><th>שם</th><th>סוג</th><th>כמות</th><th>מפרט</th><th>שימוש</th></tr></thead>
          <tbody>
            {hardware.map((h) => (
              <tr key={h.id}><td>{h.id}</td><td>{h.name}</td><td>{h.type}</td><td>{h.quantity}</td><td>{h.spec}</td><td>{h.usage}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="pdf-section">
        <h2>חומרים</h2>
        <ul>
          {plan.woods.map((w) => (
            <li key={w.id}><strong>{w.name}</strong> ({w.category}): {w.note}</li>
          ))}
        </ul>
        <h2>כלים</h2>
        <ul>{plan.tools.map((t) => <li key={t}>{t}</li>)}</ul>
        <h2>דגשי בטיחות</h2>
        <ul>{plan.safety.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>

      {plan.steps.map((step, i) => (
        <section className="pdf-section pdf-step" key={step.title}>
          <h2>שלב {i + 1}: {step.title}</h2>
          <p>{step.body}</p>
          {step.partIds && step.partIds.length > 0 && <p className="pdf-muted">חלקים בשלב: {step.partIds.join(', ')}</p>}
          {assemblies[i] && <div dangerouslySetInnerHTML={{ __html: assemblies[i] }} />}
        </section>
      ))}
    </div>
  )
}
