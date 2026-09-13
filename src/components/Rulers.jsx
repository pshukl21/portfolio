import { useEffect, useRef, useState } from 'react'

const MINOR = 10   // px between small ticks
const LABEL = 100  // px between numbered ticks

/**
 * Photoshop-style rulers pinned to the top and left of the document area.
 * The vertical ruler scrolls with the page, so its numbers read as document
 * coordinates. A marker in each ruler tracks the cursor.
 */
export default function Rulers() {
  const rootRef = useRef(null)
  const frame = useRef(0)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const measure = () => {
      setSize({
        w: Math.ceil(innerWidth) + LABEL,
        h: Math.ceil(Math.max(document.body.scrollHeight, innerHeight)) + LABEL,
      })
    }
    measure()
    addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => { removeEventListener('resize', measure); ro.disconnect() }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  /* Cursor position is written to CSS variables so moving the markers never
     triggers a React render. */
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

  const ticks = (extent, axis) => {
    const out = []
    for (let v = 0; v <= extent; v += MINOR) {
      const major = v % LABEL === 0
      if (!major && v % (MINOR * 5) !== 0 && extent > 3000) continue
      out.push(
        <span
          key={v}
          className={`tk${major ? ' major' : ''}`}
          style={axis === 'h' ? { left: v } : { top: v }}
        >
          {major && v > 0 && <i>{v}</i>}
        </span>
      )
    }
    return out
  }

  return (
    <div className="rulers" ref={rootRef} aria-hidden="true">
      <div className="rl-corner" />
      <div className="rl rl-h">
        <div className="rl-ticks">{ticks(size.w, 'h')}</div>
        <span className="rl-mark" />
      </div>
      <div className="rl rl-v">
        <div className="rl-ticks" style={{ transform: `translateY(${-scrollY}px)` }}>
          {ticks(size.h, 'v')}
        </div>
        <span className="rl-mark" />
      </div>
    </div>
  )
}
