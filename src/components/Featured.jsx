import site from '../site.json'

// Past this many, the row starts scrolling instead of wrapping.
const SCROLL_AFTER = 6

/**
 * Logo band for places the work has appeared, with the headline stats on the
 * same line. Both lists live in site.json, so they're editable in the CMS.
 *
 * Once there are more logos than fit comfortably, the row becomes a ticker —
 * the list is rendered twice and the track slides by half its width, so the
 * loop is seamless.
 */
export default function Featured() {
  const items = site.featured ?? []
  const chips = site.chips ?? []
  if (!items.length && !chips.length) return null

  const scroll = items.length > SCROLL_AFTER
  const pass = scroll ? [...items, ...items] : items

  return (
    <section className="feat" aria-label="Featured in">
      {items.length > 0 && (
        <>
          <p className="feat-label">{site.featured_label || 'Featured in'}</p>

          <div className={`feat-view${scroll ? ' scrolling' : ''}`}>
            <ul
              className="feat-row"
              style={scroll ? { '--marquee': `${items.length * 4.5}s` } : undefined}
            >
              {pass.map((f, i) => {
                const mark = (
                  <>
                    <img src={f.logo} alt={i < items.length ? f.name : ''} loading="lazy" />
                    <span className="feat-tip" aria-hidden="true">{f.name}</span>
                  </>
                )
                return (
                  <li key={`${f.name}-${i}`} aria-hidden={i >= items.length}>
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noreferrer">{mark}</a>
                    ) : (
                      <span className="feat-mark">{mark}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
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
