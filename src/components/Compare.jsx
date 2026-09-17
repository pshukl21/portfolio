import { useCallback, useRef, useState } from 'react'

/**
 * Before/after slider. The "after" image sits underneath at full size and the
 * "before" is clipped to the handle position, so dragging wipes between them.
 */
export default function Compare({ before, after, label, views, ratio = '16 / 9' }) {
  const boxRef = useRef(null)
  const dragging = useRef(false)
  const [pos, setPos] = useState(50)

  const setFromEvent = useCallback((clientX) => {
    const box = boxRef.current
    if (!box) return
    const r = box.getBoundingClientRect()
    const pct = ((clientX - r.left) / r.width) * 100
    setPos(Math.max(0, Math.min(100, pct)))
  }, [])

  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 2
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - step))
    else if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + step))
    else if (e.key === 'Home') setPos(0)
    else if (e.key === 'End') setPos(100)
    else return
    e.preventDefault()
  }

  return (
    <figure className="cmp">
      <div
        className="cmp-box"
        ref={boxRef}
        style={{ aspectRatio: ratio, '--pos': `${pos}%` }}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          setFromEvent(e.clientX)
        }}
        onPointerMove={(e) => dragging.current && setFromEvent(e.clientX)}
        onPointerUp={() => { dragging.current = false }}
        onPointerCancel={() => { dragging.current = false }}
      >
        <img className="cmp-after" src={after} alt={`${label || 'Thumbnail'} — after`} loading="lazy" />
        <img className="cmp-before" src={before} alt={`${label || 'Thumbnail'} — before`} loading="lazy" />

        <div
          className="cmp-handle"
          role="slider"
          tabIndex={0}
          aria-label={`Reveal ${label || 'the finished thumbnail'}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={onKey}
        >
          <span className="cmp-grip" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"
                 strokeLinejoin="round">
              <path d="M4 9h16m-4-4 4 4M20 15H4m4 4-4-4" />
            </svg>
          </span>
        </div>

        {views && (
          <span className="cmp-count">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
                 stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
                 aria-hidden="true">
              <rect x="1.4" y="3.4" width="13.2" height="9.2" rx="2.6" />
              <path d="M6.7 6.2l3.5 1.8-3.5 1.8z" fill="currentColor" stroke="none" />
            </svg>
            <b>{views}</b>
            <i>views</i>
          </span>
        )}
      </div>
      {label && <figcaption><span className="cmp-title">{label}</span></figcaption>}
    </figure>
  )
}
