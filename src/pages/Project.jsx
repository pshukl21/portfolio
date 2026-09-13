import { Link, useParams } from 'react-router-dom'
import { projects } from '../projects'
import { byProject, groupsFor, isSequence, isCompact } from '../assets'
import Plates from '../components/Plates'
import NotFound from './NotFound'

export default function Project({ editing }) {
  const { projectId } = useParams()
  const project = projects.find((p) => p.id === projectId)
  if (!project) return <NotFound />

  const groups = groupsFor(project.id)
  const sequence = isSequence(project.id)
  const compact = isCompact(project.id)
  const flat = byProject[project.id] ?? []

  const head = (
    <div className="phead">
      <Link className="back" to="/">← Work</Link>
      <h2>{project.title}</h2>
      <p className="meta">{project.meta} · {project.year}</p>
      <p className="lead">{project.lead}</p>
      {project.body && <p className="body">{project.body}</p>}
    </div>
  )

  /* Compact: the written steps collapse into a list, and every image flows
     through one justified gallery — far less scrolling for a project whose
     groups are a single screenshot each. */
  if (compact) {
    return (
      <div className="wrap">
        {head}
        <ol className={`steps${sequence ? ' numbered' : ''}`}>
          {groups.map((g) => (
            <li key={g.title}>
              <b>{g.title}</b>
              {g.note && <span>{g.note}</span>}
            </li>
          ))}
        </ol>
        <Plates items={flat} editing={editing} />
        <div className="tail" />
      </div>
    )
  }

  let cursor = 0
  return (
    <div className="wrap">
      {head}

      {groups.length === 0 && (
        <p className="body">
          No images yet — add files to <code>public/assets/{project.id}/</code> and list
          them in <code>content.json</code>.
        </p>
      )}

      {groups.map((g, gi) => {
        const slice = flat.slice(cursor, cursor + (g.files?.length ?? 0))
        cursor += g.files?.length ?? 0
        return (
          <div className="group" key={g.title}>
            <div className="ghead">
              <h3>
                {sequence && <span className="step">{gi + 1}</span>}
                {g.title}
              </h3>
              {g.note && <p className="gnote">{g.note}</p>}
            </div>
            <Plates items={slice} editing={editing} />
          </div>
        )
      })}
      <div className="tail" />
    </div>
  )
}
