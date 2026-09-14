/**
 * A link card for an Instagram post, built from scratch.
 *
 * Instagram's official embed is a cross-origin iframe — its white card and
 * chrome can't be restyled from here. This trades inline playback for a card
 * that matches the site, and loads no third-party script at all.
 */
export default function InstagramEmbed({ url, poster, caption, handle = '@parthcreations' }) {
  if (!url) return null

  return (
    <a className="reel" href={url} target="_blank" rel="noreferrer">
      <span className="reel-shot">
        {poster && <img src={poster} alt={caption || 'Instagram post'} loading="lazy" />}
        <span className="reel-play" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.2v13.6L19 12z" />
          </svg>
        </span>
      </span>

      <span className="reel-foot">
        <svg className="reel-ig" width="15" height="15" viewBox="0 0 16 16" fill="none"
             stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
          <rect x="2" y="2" width="12" height="12" rx="3.4" />
          <circle cx="8" cy="8" r="3" />
          <circle cx="11.6" cy="4.4" r=".85" fill="currentColor" stroke="none" />
        </svg>
        <span className="reel-handle">{handle}</span>
        <span className="reel-cta">Watch on Instagram ↗</span>
      </span>

      {caption && <span className="reel-cap">{caption}</span>}
    </a>
  )
}
