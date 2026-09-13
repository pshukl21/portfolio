import { Link } from 'react-router-dom'

/** Justified rows — each plate grows in proportion to its aspect ratio. */
export default function Plates({ items, editing }) {
  return (
    <div className="plates">
      {items.map((a) => (
        <Link
          className="plate"
          key={a.n}
          to={`/p/${a.projectId}/${a.n}`}
          style={{ '--ar': a.ar.toFixed(4) }}
        >
          <img src={a.src} alt={a.group} loading="lazy" decoding="async" />
          <span className="tag">{editing ? a.file : `${a.w}×${a.h}`}</span>
        </Link>
      ))}
    </div>
  )
}
