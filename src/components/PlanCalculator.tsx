import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculate, defaultVariables, type UserInputs } from '../domain/engine'
import type { PlanDef } from '../domain/plans/types'
import { assemblyView, buildDrawings } from '../domain/drawings'
import { DRAFT_NOTICE, partRows, toCsv, toExcel, totals, type PartRow } from '../domain/exporters'
import { buildPdfFromSections } from '../domain/pdf'
import { db, type PlanState } from '../db/db'
import { loadPlanState, savePlanState } from '../db/planState'
import PrintSheet from './PrintSheet'

interface Props {
  plan: PlanDef
}

interface FormState {
  variables: Record<string, number>
  thickness: number
  material: string
  useSpace: boolean
  space: { width: number; depth: number; height: number }
  clearance: number
}

function download(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const fileBase = (name: string) => name.replace(/[\s()/]+/g, '-').replace(/-+$/, '')

const time = (ts: number) => new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })

export default function PlanCalculator({ plan }: Props) {
  const navigate = useNavigate()
  const defaults = useMemo(
    () => ({
      variables: defaultVariables(plan),
      thickness: plan.allowedThicknesses[0],
      material: plan.allowedMaterials?.[0] ?? '',
    }),
    [plan],
  )
  const defaultForm: FormState = {
    variables: defaults.variables,
    thickness: defaults.thickness,
    material: defaults.material,
    useSpace: false,
    space: { width: 0, depth: 0, height: 0 },
    clearance: 0,
  }
  const defaultApplied: UserInputs = { variables: defaults.variables, thickness: defaults.thickness, material: defaults.material }

  const [form, setForm] = useState<FormState>(defaultForm)
  const [applied, setApplied] = useState<UserInputs>(defaultApplied)
  const [purchased, setPurchased] = useState<string[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [doneSteps, setDoneSteps] = useState<number[]>([])
  const [stepIdx, setStepIdx] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [pdfProgress, setPdfProgress] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const sheetRef = useRef<HTMLDivElement>(null)

  // טעינת המצב השמור בפתיחת התוכנית
  useEffect(() => {
    let cancelled = false
    loadPlanState(plan.id).then((saved) => {
      if (cancelled) return
      if (saved) {
        setForm(saved.form)
        setApplied({
          variables: saved.applied.variables,
          thickness: saved.applied.thickness,
          material: saved.applied.material,
          space: saved.applied.space,
          clearance: saved.applied.clearance,
        })
        setPurchased(saved.purchased)
        setNotes(saved.notes)
        setDoneSteps(saved.doneSteps)
        setStepIdx(saved.stepIdx)
        setSavedAt(saved.updatedAt)
      }
      setHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [plan.id])

  // שמירה אוטומטית בכל שינוי
  useEffect(() => {
    if (!hydrated) return
    const state: Omit<PlanState, 'updatedAt'> = {
      modelId: plan.id,
      form,
      applied: {
        variables: applied.variables,
        thickness: applied.thickness,
        material: applied.material,
        space: applied.space,
        clearance: applied.clearance,
      },
      purchased,
      notes,
      doneSteps,
      stepIdx,
    }
    savePlanState(state).then(setSavedAt)
  }, [hydrated, plan.id, form, applied, purchased, notes, doneSteps, stepIdx])

  const result = useMemo(() => calculate(plan, applied), [plan, applied])
  const baseline = useMemo(() => calculate(plan, defaultApplied), [plan])
  const drawings = useMemo(
    () => (result.ok && result.outer ? buildDrawings(result.outer, result.parts) : null),
    [result],
  )
  const hardware = useMemo(() => plan.hardware(applied.variables, applied.thickness), [plan, applied])

  const rows: PartRow[] = useMemo(
    () =>
      partRows(plan, result.parts).map((r) => ({
        ...r,
        notes: notes[r.number] ?? '',
        status: purchased.includes(r.number) ? 'נרכש' : 'טרם נרכש',
      })),
    [plan, result.parts, notes, purchased],
  )
  const sums = totals(rows)
  const baselineSums = totals(partRows(plan, baseline.parts))

  // שרטוט הרכבה לכל שלב: החלקים שנוספו עד השלב, והחלקים של השלב עצמו מסומנים
  const assemblies: string[] = useMemo(() => {
    if (!result.ok || !result.outer) return []
    const shown = new Set<string>()
    return plan.steps.map((step) => {
      for (const id of step.partIds ?? []) shown.add(id)
      return assemblyView(result.outer!, result.parts, shown, new Set(step.partIds ?? []))
    })
  }, [plan, result])

  const setVar = (key: string, value: number) =>
    setForm((f) => ({ ...f, variables: { ...f.variables, [key]: value } }))

  const recalculate = () => {
    setApplied({
      variables: { ...form.variables },
      thickness: form.thickness,
      material: form.material || undefined,
      space: form.useSpace ? { ...form.space } : undefined,
      clearance: form.useSpace ? form.clearance : undefined,
    })
    setMessage('החישוב עודכן.')
  }

  const resetDimensions = () => {
    setForm((f) => ({ ...f, variables: defaults.variables, thickness: defaults.thickness, material: defaults.material, useSpace: false }))
    setApplied(defaultApplied)
    setMessage('המידות הוחזרו לברירת המחדל. רכישות והערות נשמרו.')
  }

  const togglePurchased = (id: string) =>
    setPurchased((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const toggleDoneStep = (i: number) =>
    setDoneSteps((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))

  const exportExcel = async () => {
    const bytes = await toExcel({ title: plan.name }, rows, hardware, plan.steps)
    download(`${fileBase(plan.name)}.xlsx`, new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  }

  const exportCsv = () => {
    download(`${fileBase(plan.name)}.csv`, new Blob([toCsv(rows, hardware)], { type: 'text/csv;charset=utf-8' }))
  }

  const exportPdf = async () => {
    if (!sheetRef.current) return
    setPdfProgress('מכין את הקובץ...')
    try {
      const blob = await buildPdfFromSections(sheetRef.current, (done, total) =>
        setPdfProgress(`מצלם מקטעים ${done} מתוך ${total}...`),
      )
      download(`${fileBase(plan.name)}.pdf`, blob)
      setPdfProgress('')
    } catch (e) {
      setPdfProgress('')
      setMessage(`יצירת ה-PDF נכשלה: ${e instanceof Error ? e.message : 'שגיאה לא ידועה'}`)
    }
  }

  const saveToProject = async () => {
    const now = Date.now()
    const id = await db.projects.add({
      modelId: plan.id,
      name: plan.name,
      status: 'planned',
      notes: '',
      planInputs: { variables: applied.variables, thickness: applied.thickness, material: applied.material },
      createdAt: now,
      updatedAt: now,
    })
    navigate(`/projects/${id}`)
  }

  const step = plan.steps[stepIdx]
  const doneCount = doneSteps.length

  return (
    <>
      <div className="notice" role="note">
        <strong>טיוטה בלבד</strong>
        המידות, החלקים והמחברים של הדגם הזה הם הצעת תכנון שטרם עברה בדיקה מקצועית. התוצרים מסומנים כטיוטה ואינם מאושרים לבנייה.
      </div>

      <p className="muted autosave" role="status" aria-live="polite">
        {hydrated && savedAt ? `נשמר אוטומטית ב-${time(savedAt)}` : 'טוען את הנתונים השמורים...'}
      </p>

      <section className="card no-print" aria-labelledby="inputs-h">
        <h2 id="inputs-h" style={{ marginTop: 0 }}>מידות השטח שלי</h2>
        <form noValidate onSubmit={(e) => { e.preventDefault(); recalculate() }}>
          {plan.variables.map((v) => (
            <div className="field" key={v.key}>
              <label htmlFor={`v-${v.key}`}>{v.label} (מ"מ)</label>
              <input
                id={`v-${v.key}`}
                type="number"
                inputMode="numeric"
                min={v.min}
                max={v.max}
                step={1}
                value={Number.isFinite(form.variables[v.key]) ? form.variables[v.key] : ''}
                onChange={(e) => setVar(v.key, e.target.valueAsNumber)}
              />
              <span className="muted" style={{ fontSize: '0.9rem' }}>טווח מותר: {v.min} עד {v.max}</span>
            </div>
          ))}

          <div className="field">
            <label htmlFor="thickness">עובי החומר</label>
            <select id="thickness" value={form.thickness} onChange={(e) => setForm((f) => ({ ...f, thickness: Number(e.target.value) }))}>
              {plan.allowedThicknesses.map((t) => (
                <option key={t} value={t}>{t} מ"מ</option>
              ))}
            </select>
          </div>

          {plan.allowedMaterials && (
            <div className="field">
              <label htmlFor="material">סוג החומר</label>
              <select id="material" value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}>
                {plan.woods.map((w) => (
                  <option key={w.id} value={w.name}>{w.name} ({w.category})</option>
                ))}
              </select>
              <span className="muted" style={{ fontSize: '0.9rem' }}>
                {plan.woods.find((w) => w.name === form.material)?.note}
              </span>
            </div>
          )}

          <div className="field">
            <label className="check">
              <input type="checkbox" checked={form.useSpace} onChange={(e) => setForm((f) => ({ ...f, useSpace: e.target.checked }))} />
              בדוק התאמה לשטח פנוי
            </label>
          </div>

          {form.useSpace && (
            <>
              {(['width', 'depth', 'height'] as const).map((k) => (
                <div className="field" key={k}>
                  <label htmlFor={`space-${k}`}>{k === 'width' ? 'רוחב' : k === 'depth' ? 'עומק' : 'גובה'} פנוי (מ"מ)</label>
                  <input
                    id={`space-${k}`}
                    type="number"
                    inputMode="numeric"
                    value={Number.isFinite(form.space[k]) ? form.space[k] : ''}
                    onChange={(e) => setForm((f) => ({ ...f, space: { ...f.space, [k]: e.target.valueAsNumber } }))}
                  />
                </div>
              ))}
              <div className="field">
                <label htmlFor="clearance">מרווח נדרש מכל צד (מ"מ)</label>
                <input
                  id="clearance"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={Number.isFinite(form.clearance) ? form.clearance : ''}
                  onChange={(e) => setForm((f) => ({ ...f, clearance: e.target.valueAsNumber }))}
                />
              </div>
            </>
          )}

          <div className="row">
            <button type="submit" className="btn big">התאם למידות שלי</button>
            <button type="button" className="btn secondary" onClick={resetDimensions}>חזרה לברירת מחדל</button>
          </div>
        </form>
        {message && <p role="status" className="muted" style={{ marginBottom: 0 }}>{message}</p>}
      </section>

      <div className="print-area">
        {!result.ok && (
          <div className="notice" role="alert">
            <strong>התוכנית לא מתאימה</strong>
            <ul className="step-list">
              {result.errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
            {result.outer && (
              <p className="muted" style={{ marginBottom: 0 }}>
                המידות החיצוניות שחושבו: {Math.round(result.outer.width)}×{Math.round(result.outer.depth)}×{Math.round(result.outer.height)} מ"מ.
              </p>
            )}
          </div>
        )}

        {result.ok && result.outer && drawings && (
          <>
            <div className="row" style={{ margin: '12px 0' }}>
              <span className="badge warn">טיוטה</span>
              {result.warnings.map((w) => <span key={w} className="muted">{w}</span>)}
            </div>

            <h2>לפני ואחרי</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr><th>מידה</th><th>לפני (ברירת מחדל)</th><th>אחרי (המידות שלי)</th></tr>
                </thead>
                <tbody>
                  <tr><td>רוחב חיצוני</td><td>{Math.round(baseline.outer!.width)} מ"מ</td><td>{Math.round(result.outer.width)} מ"מ</td></tr>
                  <tr><td>עומק חיצוני</td><td>{Math.round(baseline.outer!.depth)} מ"מ</td><td>{Math.round(result.outer.depth)} מ"מ</td></tr>
                  <tr><td>גובה חיצוני</td><td>{Math.round(baseline.outer!.height)} מ"מ</td><td>{Math.round(result.outer.height)} מ"מ</td></tr>
                  <tr><td>מספר חלקים</td><td>{baselineSums.pieces}</td><td>{sums.pieces}</td></tr>
                  <tr><td>שטח כולל (מ"ר)</td><td>{baselineSums.areaM2}</td><td>{sums.areaM2}</td></tr>
                </tbody>
              </table>
            </div>

            <h2>כתב כמויות</h2>
            <p className="muted">{DRAFT_NOTICE}</p>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>נרכש</th><th>מספר חלק</th><th>שם החלק</th><th>חומר</th><th>סוג העץ</th>
                    <th>אורך</th><th>רוחב</th><th>עובי</th><th>כמות</th><th>הערות אישיות</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.number}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`נרכש: ${r.name} ${r.number}`}
                          checked={purchased.includes(r.number)}
                          onChange={() => togglePurchased(r.number)}
                        />
                      </td>
                      <td>{r.number}</td><td>{r.name}</td><td>{r.material}</td><td>{r.wood}</td>
                      <td>{r.length}</td><td>{r.width}</td><td>{r.thickness}</td><td>{r.qty}</td>
                      <td>
                        <input
                          className="note-input"
                          aria-label={`הערה לחלק ${r.number}`}
                          value={notes[r.number] ?? ''}
                          onChange={(e) => setNotes((n) => ({ ...n, [r.number]: e.target.value }))}
                          placeholder="הוסיפו הערה"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted">נרכשו {purchased.filter((id) => rows.some((r) => r.number === id)).length} מתוך {rows.length} חלקים.</p>

            <h2>מחברים וחומרי עזר</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr><th>מזהה</th><th>שם</th><th>סוג</th><th>כמות</th><th>מפרט</th><th>שימוש</th></tr>
                </thead>
                <tbody>
                  {hardware.map((h) => (
                    <tr key={h.id}>
                      <td>{h.id}</td><td>{h.name}</td><td>{h.type}</td><td>{h.quantity}</td>
                      <td><span className="badge warn">{h.spec}</span></td><td>{h.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>שרטוטים</h2>
            <div className="drawings">
              <figure className="drawing" dangerouslySetInnerHTML={{ __html: drawings.front }} />
              <figure className="drawing" dangerouslySetInnerHTML={{ __html: drawings.side }} />
              <figure className="drawing" dangerouslySetInnerHTML={{ __html: drawings.top }} />
              <figure className="drawing wide" dangerouslySetInnerHTML={{ __html: drawings.exploded }} />
            </div>
          </>
        )}
      </div>

      {result.ok && result.outer && drawings && (
        <div ref={sheetRef}>
          <PrintSheet
            plan={plan}
            result={result}
            applied={applied}
            rows={rows}
            hardware={hardware}
            drawings={drawings}
            assemblies={assemblies}
            generatedAt={new Date().toLocaleDateString('he-IL')}
          />
        </div>
      )}

      <section className="no-print" aria-labelledby="export-h">
        <h2 id="export-h">ייצוא ושמירה</h2>
        <div className="row">
          <button className="btn" onClick={exportExcel} disabled={!result.ok}>הורד Excel</button>
          <button className="btn secondary" onClick={exportCsv} disabled={!result.ok}>הורד CSV</button>
          <button className="btn" onClick={exportPdf} disabled={!result.ok || pdfProgress !== ''}>
            {pdfProgress || 'הורד PDF'}
          </button>
          <button className="btn secondary" onClick={saveToProject}>הוסף לפרויקטים שלי</button>
        </div>
        <p className="muted" style={{ fontSize: '0.9rem' }}>
          ה-PDF כולל שרטוטים, כתב כמויות, מחברים, חומרים, כלים, דגשי בטיחות ושלבי הרכבה עם שרטוט לכל שלב.
        </p>
      </section>

      <section className="no-print" aria-labelledby="steps-h">
        <h2 id="steps-h">מתחילים לבנות (טיוטה)</h2>
        <div className="notice">
          <strong>טיוטת מדריך</strong>
          אין להשתמש במדריך לבנייה לפני שהתוכנית נבדקה ואושרה מקצועית.
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            שלב {stepIdx + 1} מתוך {plan.steps.length}: {step.title}
          </h3>
          <p>{step.body}</p>
          {step.partIds && step.partIds.length > 0 && (
            <p className="muted">חלקים בשלב זה: {step.partIds.join(', ')}</p>
          )}
          {assemblies[stepIdx] && (
            <figure className="drawing" dangerouslySetInnerHTML={{ __html: assemblies[stepIdx] }} />
          )}
          <label className="check">
            <input type="checkbox" checked={doneSteps.includes(stepIdx)} onChange={() => toggleDoneStep(stepIdx)} />
            סמנתי שהשלב הושלם
          </label>
          <div className="row" style={{ marginTop: 12 }}>
            {stepIdx > 0 && <button className="btn secondary" onClick={() => setStepIdx(stepIdx - 1)}>השלב הקודם</button>}
            {stepIdx < plan.steps.length - 1 && <button className="btn" onClick={() => setStepIdx(stepIdx + 1)}>השלב הבא</button>}
          </div>
          <p className="muted" style={{ marginTop: 12 }}>
            שלבים שהושלמו: {doneCount} מתוך {plan.steps.length}
          </p>
        </div>

        <h3>כלים</h3>
        <ul className="step-list">{plan.tools.map((t) => <li key={t}>{t}</li>)}</ul>
        <h3>דגשי בטיחות</h3>
        <ul className="step-list">{plan.safety.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
    </>
  )
}
