import { Link } from 'react-router-dom'

/**
 * A project as an open .psd document: title bar with the filename, the artwork,
 * then a file-info strip. Every card is the same size.
 */
export default function DocCard({ to, file, title, cover, year, client }) {
  return (
    <Link className="doccard" to={to}>
      <span className="dc-bar">
        <span className="dc-dot" />
        <span className="dc-file">{file}</span>
      </span>

      <span className="dc-shot">
        <img src={cover} alt={title} loading="lazy" decoding="async" />
      </span>

      <span className="dc-info">
        <span className="dc-title">{title}</span>
        <span className="dc-stats">
          {/* The layers glyph stays as a mark; the count was noise. */}
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor"
               strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 1.8 14.5 5 8 8.2 1.5 5 8 1.8Z" />
            <path d="M1.5 8 8 11.2 14.5 8M1.5 11 8 14.2 14.5 11" />
          </svg>
          <span className="dc-stat">{year}</span>
        </span>
        <span className="dc-by">{client}</span>
      </span>
    </Link>
  )
}
