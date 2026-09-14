import { useCallback, useRef, useState } from 'react'

/**
 * Before/after slider. The "after" image sits underneath at full size and the
 * "before" is clipped to the handle position, so dragging wipes between them.
 */
export default function Compare({ before, after, label, ratio = '16 / 9' }) {
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

        <span className="cmp-tag cmp-tag-l">BEFORE</span>
        <span className="cmp-tag cmp-tag-r">AFTER</span>

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
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
              <path d="M6.6 1 2 6l4.6 5V1zM11.4 1 16 6l-4.6 5V1z" />
            </svg>
          </span>
        </div>
      </div>
      {label && <figcaption>{label}</figcaption>}
    </figure>
  )
}
