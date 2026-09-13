import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* Ruler ticks, numbered every 100 like Photoshop's. */
function Ruler({ axis, extent = 2400 }) {
  const marks = []
  for (let v = 0; v <= extent; v += 50) {
    marks.push(
      <span
        key={v}
        className={`tick${v % 100 === 0 ? ' major' : ''}`}
        style={axis === 'h' ? { left: v } : { top: v }}
      >
        {v % 100 === 0 && <i>{v}</i>}
      </span>
    )
  }
  return <div className={`ruler ruler-${axis}`}>{marks}</div>
}

/**
 * The hero is an empty document with one text layer on it. The layer can be
 * dragged around the canvas the way the Move tool works — double-click
 * recentres it.
 */
export default function HeroCanvas() {
  const canvasRef = useRef(null)
  const layerRef = useRef(null)
  const grabRef = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [moved, setMoved] = useState(false)

  /* Keep the layer inside the canvas, whatever its size. */
  const clamp = useCallback((x, y) => {
    const c = canvasRef.current
    const l = layerRef.current
    if (!c || !l) return { x, y }
    const limitX = Math.max(0, (c.clientWidth - l.offsetWidth) / 2)
    const limitY = Math.max(0, (c.clientHeight - l.offsetHeight) / 2)
    return {
      x: Math.max(-limitX, Math.min(limitX, x)),
      y: Math.max(-limitY, Math.min(limitY, y)),
    }
  }, [])

  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p.x, p.y))
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [clamp])

  const down = (e) => {
    grabRef.current = { px: e.clientX, py: e.clientY, ...pos }
    setDragging(true)
    setMoved(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const move = (e) => {
    const g = grabRef.current
    if (!g) return
    setPos(clamp(g.x + (e.clientX - g.px), g.y + (e.clientY - g.py)))
  }

  const up = () => {
    grabRef.current = null
    setDragging(false)
  }

  /* Arrow keys nudge the layer, as they do with a selected layer in PS. */
  const key = (e) => {
    const step = e.shiftKey ? 10 : 1
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0],
                ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key]
    if (!d) return
    e.preventDefault()
    setMoved(true)
    setPos((p) => clamp(p.x + d[0], p.y + d[1]))
  }

  const reset = () => { setPos({ x: 0, y: 0 }); setMoved(false) }

  return (
    <div className="psdoc">
      <div className="psdoc-bar">
        <span className="psdoc-x">×</span>
        <span>parthcreations.psd @ 100% (Parth Creations, RGB/8) *</span>
        <span className="psdoc-xy">X {Math.round(pos.x)} &nbsp; Y {Math.round(pos.y)}</span>
      </div>

      <div className="psdoc-body">
        <span className="ruler-corner" />
        <Ruler axis="h" />
        <Ruler axis="v" />

        <div className="artboard">
          <div className="checker" ref={canvasRef}>
            <div
              ref={layerRef}
              className={`textlayer${dragging ? ' dragging' : ''}`}
              style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onDoubleClick={reset}
              onKeyDown={key}
              tabIndex={0}
              role="button"
              aria-label="Parth Creations — drag to move, arrow keys to nudge, double-click to reset"
            >
              <span className="handles" aria-hidden="true">
                <i /><i /><i /><i /><i /><i /><i /><i />
              </span>
              <h1>Parth Creations</h1>
              <p className="who">Parth Shukla — graphic designer</p>
            </div>

            {moved && (
              <button className="resetpos" onClick={reset} type="button">
                Reset position
              </button>
            )}
            {!moved && <span className="movehint">Drag the text</span>}
          </div>

          {/* Photoshop's floating contextual task bar, doing real work here. */}
          <div className="taskbar">
            <a href="#work">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                   strokeWidth="1.3" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1"/><path d="M2 6h12"/></svg>
              View work
            </a>
            <Link to="/about">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                   strokeWidth="1.3" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 7.2v4M8 5.1v.1"/></svg>
              About
            </Link>
            <a href="mailto:REPLACE@EMAIL.COM">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                   strokeWidth="1.3" aria-hidden="true"><rect x="1.8" y="3.5" width="12.4" height="9" rx="1"/><path d="m2 4.5 6 4 6-4"/></svg>
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
