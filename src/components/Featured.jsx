import site from '../site.json'

/**
 * Logo band for places the work has appeared, with the headline stats on the
 * same line. Both lists live in site.json, so they're editable in the CMS.
 */
export default function Featured() {
  const items = site.featured ?? []
  const chips = site.chips ?? []
  if (!items.length && !chips.length) return null

  return (
    <section className="feat" aria-label="Featured in">
      {items.length > 0 && (
        <>
          <p className="feat-label">{site.featured_label || 'Featured in'}</p>
          <ul className="feat-row">
            {items.map((f) => {
              const mark = (
                <>
                  <img src={f.logo} alt={f.name} loading="lazy" />
                  <span className="feat-tip" aria-hidden="true">{f.name}</span>
                </>
              )
              return (
                <li key={f.name}>
                  {f.url ? (
                    <a href={f.url} target="_blank" rel="noreferrer">{mark}</a>
                  ) : (
                    <span className="feat-mark">{mark}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}

      {chips.length > 0 && (
        <span className="feat-chips">
          {chips.map((c) => (
            <span className="chip" key={c.strong}><b>{c.strong}</b> {c.rest}</span>
          ))}
        </span>
      )}
    </section>
  )
}
