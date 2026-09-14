import site from '../site.json'

/**
 * Logo band for places the work has appeared. Entries live in site.json, so
 * new ones can be added through the CMS without touching code.
 */
export default function Featured() {
  const items = site.featured ?? []
  if (!items.length) return null

  return (
    <section className="feat" aria-label="Featured in">
      <p className="feat-label">{site.featured_label || 'Featured in'}</p>
      <ul className="feat-row">
        {items.map((f) => (
          <li key={f.name}>
            {f.url ? (
              <a href={f.url} target="_blank" rel="noreferrer" title={f.name}>
                <img src={f.logo} alt={f.name} loading="lazy" />
              </a>
            ) : (
              <img src={f.logo} alt={f.name} loading="lazy" />
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
