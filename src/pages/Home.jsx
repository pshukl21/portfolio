import { useState } from 'react'
import DocCard from '../components/DocCard'
import Featured from '../components/Featured'
import { projects } from '../projects'
import { usedCategories } from '../categories'
import { coverFor } from '../assets'

/** Filename-safe slug, so a card reads like a real document. */
const psd = (title) =>
  title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '.psd'

export default function Home() {
  // Nothing is hidden by default — the full grid is the point, and the
  // filters are there for anyone who wants to narrow it.
  const [filter, setFilter] = useState(null)
  const shown = filter ? projects.filter((p) => p.category === filter) : projects

  return (
    <>
      <Featured />

      <div className="rowhead">
        <p className="rowlabel" id="work">Open documents</p>
        <div className="filters" role="group" aria-label="Filter by category">
          <button className={!filter ? 'on' : undefined} onClick={() => setFilter(null)}>
            All <span>{projects.length}</span>
          </button>
          {usedCategories.map((c) => (
            <button key={c} className={filter === c ? 'on' : undefined}
                    onClick={() => setFilter(filter === c ? null : c)}>
              {c} <span>{projects.filter((p) => p.category === c).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cards">
        {shown.map((p) => (
          <DocCard
            key={p.id}
            to={`/p/${p.id}`}
            file={psd(p.title)}
            title={p.title}
            cover={coverFor(p.id)}
            year={p.year}
            client={p.meta}
          />
        ))}
      </div>
    </>
  )
}
