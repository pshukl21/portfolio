import DocCard from '../components/DocCard'
import { projects } from '../projects'
import { coverFor, countFor } from '../assets'

/** Filename-safe slug, so a card reads like a real document. */
const psd = (title) =>
  title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '.psd'

export default function Home() {
  return (
    <>
      <p className="rowlabel" id="work">Open documents</p>
      <div className="cards">
        {projects.map((p) => (
          <DocCard
            key={p.id}
            to={`/p/${p.id}`}
            file={psd(p.title)}
            title={p.title}
            cover={coverFor(p.id)}
            layers={countFor(p.id)}
            year={p.year}
            client={p.meta}
          />
        ))}
      </div>
    </>
  )
}
