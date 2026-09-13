import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Eye from './Eye'
import { projects } from '../projects'
import { coverFor, countFor } from '../assets'
import site from '../site.json'

const Chevron = ({ open }) => (
  <svg className={`chev${open ? ' open' : ''}`} width="9" height="9" viewBox="0 0 10 10"
       fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="m3 1.5 4 3.5-4 3.5" />
  </svg>
)

const Folder = () => (
  <svg width="15" height="13" viewBox="0 0 16 14" fill="currentColor" aria-hidden="true">
    <path d="M0 1.6A1.1 1.1 0 0 1 1.1.5h4.2l1.4 1.6h8.2A1.1 1.1 0 0 1 16 3.2v9.2
             a1.1 1.1 0 0 1-1.1 1.1H1.1A1.1 1.1 0 0 1 0 12.4Z" />
  </svg>
)


/* Social glyphs, drawn to sit in the panel footer like Photoshop's own. */
const Instagram = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
       strokeWidth="1.3" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="3.4" />
    <circle cx="8" cy="8" r="3" />
    <circle cx="11.6" cy="4.4" r=".85" fill="currentColor" stroke="none" />
  </svg>
)

const TikTok = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
       strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
    <path d="M9.4 1.8v7.9a2.9 2.9 0 1 1-2.4-2.85" />
    <path d="M9.4 1.8c.3 1.7 1.5 2.8 3.3 2.95" />
  </svg>
)

const YouTube = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
       strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
    <rect x="1.4" y="3.4" width="13.2" height="9.2" rx="2.6" />
    <path d="M6.7 6.2l3.5 1.8-3.5 1.8z" fill="currentColor" stroke="none" />
  </svg>
)

const Mail = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
       strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
    <rect x="1.5" y="3.4" width="13" height="9.2" rx="1.4" />
    <path d="m1.9 4.4 6.1 4.1 6.1-4.1" />
  </svg>
)

/** Site navigation as a Layers panel: Work is a group, pages are its layers. */
export default function LayersPanel({ onNavigate }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(true)
  const inWork = pathname === '/' || pathname.startsWith('/p/')

  return (
    <aside className="lp">
      <div className="lp-inner">
        <div className="lp-head">
          <span>Layers</span>
          <span className="lp-count">{projects.length + 1}</span>
        </div>

        <div className="lp-rows">
          {/* group header */}
          <div className={`lp-group${inWork ? ' on' : ''}`}>
            <span className="lp-eye"><Eye on={inWork} /></span>
            <button className="lp-chev" onClick={() => setOpen((o) => !o)}
                    aria-expanded={open} aria-label="Toggle group">
              <Chevron open={open} />
            </button>
            <span className="lp-folder"><Folder /></span>
            <Link to="/" onClick={onNavigate} className="lp-gname">Work</Link>
          </div>

          {open && projects.map((p) => {
            const on = pathname.startsWith(`/p/${p.id}`)
            return (
              <Link key={p.id} to={`/p/${p.id}`} onClick={onNavigate}
                    className={`lp-row child${on ? ' on' : ''}`}>
                <span className="lp-eye"><Eye on={on} /></span>
                <span className="lp-thumb"><img src={coverFor(p.id)} alt="" loading="lazy" /></span>
                <span className="lp-text">
                  <span className="lp-name">{p.title}</span>
                  <span className="lp-sub">{countFor(p.id)} layers</span>
                </span>
              </Link>
            )
          })}

          {/* a text layer, outside the group */}
          <Link to="/about" onClick={onNavigate}
                className={`lp-row${pathname === '/about' ? ' on' : ''}`}>
            <span className="lp-eye"><Eye on={pathname === '/about'} /></span>
            <span className="lp-thumb text"><span className="lp-tx">T</span></span>
            <span className="lp-text">
              <span className="lp-name">About</span>
              <span className="lp-sub">Text layer</span>
            </span>
          </Link>
        </div>

        <div className="lp-foot">
          <a href={site.instagram} target="_blank" rel="noreferrer"
             title="Instagram" aria-label="Instagram"><Instagram /></a>
          <a href={site.tiktok} target="_blank" rel="noreferrer"
             title="TikTok" aria-label="TikTok"><TikTok /></a>
          <a href={site.youtube} target="_blank" rel="noreferrer"
             title="YouTube" aria-label="YouTube"><YouTube /></a>
          <a href={`mailto:${site.email}`} title="Email" aria-label="Email"><Mail /></a>
        </div>
      </div>
    </aside>
  )
}
