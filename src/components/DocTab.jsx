import { Link, useLocation, useNavigate } from 'react-router-dom'
import { projects } from '../projects'
import { artFor } from '../assets'

const psd = (title) =>
  title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '.psd'

/**
 * Open-document tabs between the header and the rulers. The site itself is
 * always the first document; whatever you've opened sits beside it, the way
 * Photoshop keeps every open file in the bar.
 */
export default function DocTab() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [, seg, id, n] = pathname.split('/')

  const tabs = [{ to: '/', name: 'parthcreations.psd', mode: 'Background, RGB/8' }]

  if (pathname === '/about') {
    tabs.push({ to: '/about', name: 'about.txt', mode: 'Text, RGB/8' })
  } else if (seg === 'p' && id) {
    const project = projects.find((p) => p.id === id)
    if (project) {
      const art = n ? artFor(id, n) : null
      tabs.push({
        to: `/p/${id}`,
        name: psd(project.title),
        mode: art ? `${art.group}, RGB/8` : 'Layer Group, RGB/8',
      })
    }
  }

  return (
    <div className="doctab-bar">
      {tabs.map((t, i) => {
        const active = i === tabs.length - 1
        return (
          <Link
            key={t.to}
            to={t.to}
            className={`doctab${active ? ' on' : ''}`}
            title={`${t.name} @ 100% (${t.mode})`}
          >
            {/* only a document opened on top of the site can be closed */}
            {active && i > 0 ? (
              <span
                className="doctab-x"
                role="button"
                aria-label="Close document"
                onClick={(e) => { e.preventDefault(); navigate('/') }}
              >
                ×
              </span>
            ) : (
              <span className="doctab-x" aria-hidden="true">×</span>
            )}
            <span className="doctab-name">{t.name}</span>
            {active && <span className="doctab-meta">@ 100% ({t.mode}) *</span>}
          </Link>
        )
      })}
    </div>
  )
}
