import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Eye from './Eye'
import { coverFor, countFor } from '../assets'
import { usedCategories, projectsIn } from '../categories'
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

/**
 * Site navigation as a Layers panel: one folder per category, projects nested
 * inside. Only the folder holding the current page opens by default, so the
 * panel stays scannable.
 */
export default function LayersPanel({ onNavigate }) {
  const { pathname } = useLocation()
  const current = pathname.startsWith('/p/') ? pathname.split('/')[2] : null
  const activeCat = usedCategories.find((c) =>
    projectsIn(c).some((p) => p.id === current)
  )
  const [open, setOpen] = useState(() => (activeCat ? { [activeCat]: true } : {}))
  const isOpen = (c) => open[c] ?? c === activeCat

  return (
    <aside className="lp">
      <div className="lp-inner">
        <div className="lp-head">
          <span>Layers</span>
          <span className="lp-count">{usedCategories.length + 1}</span>
        </div>

        <div className="lp-rows">
          {usedCategories.map((cat) => {
            const list = projectsIn(cat)
            const on = cat === activeCat
            return (
              <div key={cat}>
                <div className={`lp-group${on ? ' on' : ''}`}>
                  <span className="lp-eye"><Eye on={on} /></span>
                  <button
                    className="lp-chev"
                    onClick={() => setOpen((o) => ({ ...o, [cat]: !isOpen(cat) }))}
                    aria-expanded={isOpen(cat)}
                    aria-label={`${isOpen(cat) ? 'Collapse' : 'Expand'} ${cat}`}
                  >
                    <Chevron open={isOpen(cat)} />
                  </button>
                  <span className="lp-folder"><Folder /></span>
                  <span className="lp-gname">{cat}</span>
                  <span className="lp-gcount">{list.length}</span>
                </div>

                {isOpen(cat) && list.map((p) => {
                  const active = p.id === current
                  return (
                    <Link key={p.id} to={`/p/${p.id}`} onClick={onNavigate}
                          className={`lp-row child${active ? ' on' : ''}`}>
                      <span className="lp-eye"><Eye on={active} /></span>
                      <span className="lp-thumb">
                        <img src={coverFor(p.id)} alt="" loading="lazy" />
                      </span>
                      <span className="lp-text">
                        <span className="lp-name">{p.title}</span>
                        <span className="lp-sub">{countFor(p.id)} layers</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            )
          })}

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
