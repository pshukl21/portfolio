import { Link } from 'react-router-dom'

/** Each image at a set height and its own natural width. */
export default function Plates({ items, editing }) {
  return (
    <div className="plates">
      {items.map((a) => (
        <Link className="plate" key={a.n} to={`/p/${a.projectId}/${a.n}`}>
          <img src={a.src} alt={a.group} loading="lazy" decoding="async" />
          {editing && <span className="tag">{a.file}</span>}
        </Link>
      ))}
    </div>
  )
}
