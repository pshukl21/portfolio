import { useEffect, useRef, useState } from 'react'

const MINOR = 10   // px between small ticks
const LABEL = 100  // px between numbered ticks
const PAD = 200    // render a little beyond the viewport so edges never pop

/**
 * Photoshop-style rulers pinned to the top and left of the document area.
 *
 * The vertical ruler only renders the ticks currently in view, computed from
 * the scroll position. Translating one enormous strip drifts and runs out at
 * the bottom of long pages; a windowed range can't.
 */
export default function Rulers() {
  const rootRef = useRef(null)
  const frame = useRef(0)
  const [view, setView] = useState({ w: 0, h: 0, top: 0 })

  useEffect(() => {
    const read = () => setView({
      w: innerWidth,
      h: innerHeight,
      top: window.scrollY,
    })
    read()
    addEventListener('scroll', read, { passive: true })
    addEventListener('resize', read)
    return () => { removeEventListener('scroll', read); removeEventListener('resize', read) }
  }, [])

  /* Cursor position goes into CSS variables, so the markers move without
     re-rendering anything. */
  useEffect(() => {
    const onMove = (e) => {
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        frame.current = 0
        const el = rootRef.current
        if (!el) return
        const box = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - box.left}px`)
        el.style.setProperty('--my', `${e.clientY - box.top}px`)
      })
    }
    addEventListener('pointermove', onMove, { passive: true })
    return () => {
      removeEventListener('pointermove', onMove)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [])

  const hTicks = []
  for (let v = 0; v <= view.w + LABEL; v += MINOR) {
    const major = v % LABEL === 0
    hTicks.push(
      <span key={v} className={`tk${major ? ' major' : ''}`} style={{ left: v }}>
        {major && v > 0 && <i>{v}</i>}
      </span>
    )
  }

  // only the slice of the document currently on screen
  const start = Math.max(0, Math.floor((view.top - PAD) / MINOR) * MINOR)
  const end = view.top + view.h + PAD
  const vTicks = []
  for (let v = start; v <= end; v += MINOR) {
    const major = v % LABEL === 0
    vTicks.push(
      <span key={v} className={`tk${major ? ' major' : ''}`} style={{ top: v - view.top }}>
        {major && v > 0 && <i>{v}</i>}
      </span>
    )
  }

  return (
    <div className="rulers" ref={rootRef} aria-hidden="true">
      <div className="rl rl-h">
        <div className="rl-ticks">{hTicks}</div>
        <span className="rl-mark" />
      </div>
      <div className="rl rl-v">
        <div className="rl-ticks">{vTicks}</div>
        <span className="rl-mark" />
      </div>
      <div className="rl-corner" />
    </div>
  )
}
