import { Link, useParams } from 'react-router-dom'
import { projects } from '../projects'
import { byProject, groupsFor, isSequence, isCompact } from '../assets'
import Plates from '../components/Plates'
import InstagramEmbed from '../components/InstagramEmbed'
import Compare from '../components/Compare'
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
      {project.link_url && (
        <a className="plink" href={project.link_url} target="_blank" rel="noreferrer">
          <svg width="17" height="17" viewBox="0 0 16 16" fill="none"
               stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
               aria-hidden="true">
            <rect x="1.4" y="3.4" width="13.2" height="9.2" rx="2.6" />
            <path d="M6.7 6.2l3.5 1.8-3.5 1.8z" fill="currentColor" stroke="none" />
          </svg>
          {project.link_label || 'Open link'}
          <span aria-hidden="true">↗</span>
        </a>
      )}
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
        {groups.filter((g) => g.embed).map((g) => (
          <InstagramEmbed key={g.embed} url={g.embed} poster={flat[0]?.src} />
        ))}
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

      <div className="groups">
      {groups.map((g, gi) => {
        const count = g.images?.length ?? 0
        const slice = flat.slice(cursor, cursor + count)
        cursor += count
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
            {g.compare?.length > 0 && (
              <div className="cmp-row">
                {g.compare.map((c) => (
                  <Compare key={c.after} before={c.before} after={c.after}
                           label={c.label} views={c.views} />
                ))}
              </div>
            )}
            {g.embed && (
              <InstagramEmbed url={g.embed} poster={slice[0]?.src} />
            )}
          </div>
        )
      })}
      </div>
      <div className="tail" />
    </div>
  )
}
