import { useLocation } from 'react-router-dom'
import { projects } from '../projects'
import { artFor } from '../assets'

const psd = (title) =>
  title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '.psd'

/**
 * The open-document tab, sitting between the header and the rulers. It names
 * whatever is on screen, the way Photoshop's title bar does.
 */
export default function DocTab() {
  const { pathname } = useLocation()
  const [, seg, id, n] = pathname.split('/')

  let name = 'parthcreations.psd'
  let mode = 'Background, RGB/8'

  if (pathname === '/about') {
    name = 'about.txt'
    mode = 'Text, RGB/8'
  } else if (seg === 'p' && id) {
    const project = projects.find((p) => p.id === id)
    if (project) {
      name = psd(project.title)
      const art = n ? artFor(id, n) : null
      mode = art ? `${art.group}, RGB/8` : 'Layer Group, RGB/8'
    }
  }

  return (
    <div className="doctab" aria-hidden="true">
      <span className="doctab-x">×</span>
      <span className="doctab-name">{name}</span>
      <span className="doctab-meta">@ 100% ({mode}) *</span>
    </div>
  )
}
