import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="about">
        <p className="first">That page doesn’t exist.</p>
        <p><Link to="/" style={{ color: 'var(--accent)' }}>← Back to work</Link></p>
      </div>
    </div>
  )
}
