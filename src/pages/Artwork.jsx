import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { projects } from '../projects'
import { byProject, artFor } from '../assets'
import Histogram from '../components/Histogram'
import NotFound from './NotFound'

const STEPS = [0.25, 0.33, 0.5, 0.67, 1, 1.5, 2, 3]

export default function Artwork() {
  const { projectId, n } = useParams()
  const navigate = useNavigate()
  const stageRef = useRef(null)
  const [fit, setFit] = useState(true)
  const [scale, setScale] = useState(1)
  const [fitScale, setFitScale] = useState(1)
  // Images added through the CMS have no stored dimensions, so measure them.
  const [natural, setNatural] = useState(null)

  const project = projects.find((p) => p.id === projectId)
  const list = byProject[projectId] ?? []
  const art = artFor(projectId, n)
  const index = art ? art.n - 1 : -1
  const W = natural?.w || art?.w || 0
  const H = natural?.h || art?.h || 0

  useEffect(() => {
    if (!art) return
    setNatural(null)
    const img = new Image()
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = art.src
  }, [art?.src])

  /* Fit inside the stage, never scaling past 100%. */
  const measure = useCallback(() => {
    const box = stageRef.current
    if (!box || !W || !H) return
    const pad = 70
    const s = Math.min(
      (box.clientWidth - pad) / W,
      (innerHeight * 0.78 - pad) / H,
      1
    )
    setFitScale(s > 0 ? s : 1)
  }, [W, H])

  useEffect(() => {
    measure()
    addEventListener('resize', measure)
    return () => removeEventListener('resize', measure)
  }, [measure])

  useEffect(() => {
    setFit(true)
    scrollTo(0, 0)
  }, [projectId, n])

  const shown = fit ? fitScale : scale

  const step = useCallback((dir) => {
    const cur = fit ? fitScale : scale
    const next = dir > 0
      ? STEPS.find((s) => s > cur + 0.001) ?? STEPS[STEPS.length - 1]
      : [...STEPS].reverse().find((s) => s < cur - 0.001) ?? STEPS[0]
    setScale(next)
    setFit(false)
  }, [fit, fitScale, scale])

  const go = useCallback((delta) => {
    if (index < 0) return
    const next = index + delta
    if (next >= 0 && next < list.length) navigate(`/p/${projectId}/${next + 1}`)
  }, [index, list.length, navigate, projectId])

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === '+' || e.key === '=') step(1)
      else if (e.key === '-' || e.key === '_') step(-1)
      else if (e.key === '0') setFit(true)
      else if (e.key === 'Escape') navigate(`/p/${projectId}`)
      else return
      e.preventDefault()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [go, step, navigate, projectId])

  if (!project || !art) return <NotFound />

  return (
    <div className="wrap">
      <div className="art">
        <div>
          <div className="stagebar">
            <Link className="back" to={`/p/${project.id}`}>← {project.title}</Link>
            <span className="spacer" />
            <span>{art.n} / {list.length}</span>
            <button onClick={() => go(-1)} disabled={index === 0} aria-label="Previous">‹</button>
            <button onClick={() => go(1)} disabled={index === list.length - 1} aria-label="Next">›</button>
            <button onClick={() => step(-1)} aria-label="Zoom out">−</button>
            <span className="pct">{Math.round(shown * 100)}%</span>
            <button onClick={() => step(1)} aria-label="Zoom in">+</button>
            <button onClick={() => setFit(true)}>Fit</button>
          </div>

          <div className="stage" ref={stageRef}>
            <div className="frame" style={{ width: W * shown, height: H * shown }}>
              <img src={art.src} alt={`${project.title} — ${art.group}`} decoding="async" />
            </div>
          </div>
        </div>

        <aside className="rail">
          <h4>Properties</h4>
          <dl className="props">
            <div><dt>Layer</dt><dd>{art.group}</dd></div>
            <div><dt>File</dt><dd>{art.file}</dd></div>
            <div><dt>Size</dt><dd>{W && H ? `${W} × ${H} px` : "—"}</dd></div>
            <div><dt>Client</dt><dd>{project.meta}</dd></div>
            <div><dt>Year</dt><dd>{project.year}</dd></div>
            {art.note && <div><dt>Note</dt><dd className="note">{art.note}</dd></div>}
          </dl>

          <h4>Histogram</h4>
          <Histogram src={art.src} />

          <h4>In this project</h4>
          <div className="layers">
            {list.map((a) => (
              <Link
                key={a.n}
                to={`/p/${project.id}/${a.n}`}
                className={`layer${a.n === art.n ? ' on' : ''}`}
              >
                <img src={a.src} alt="" loading="lazy" />
                <span style={{ minWidth: 0 }}>
                  <span className="ln">{a.group}</span>
                  <span className="lf">{a.file}</span>
                </span>
              </Link>
            ))}
          </div>

          <p className="keys">
            <kbd>←</kbd> <kbd>→</kbd> browse · <kbd>+</kbd> <kbd>−</kbd> zoom ·{' '}
            <kbd>0</kbd> fit · <kbd>esc</kbd> back
          </p>
        </aside>
      </div>
    </div>
  )
}
