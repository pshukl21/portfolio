import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import LayersPanel from './components/LayersPanel'
import Rulers from './components/Rulers'
import Home from './pages/Home'
import About from './pages/About'
import Project from './pages/Project'
import Artwork from './pages/Artwork'
import NotFound from './pages/NotFound'
import site from './site.json'
import './theme.css'

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => { scrollTo(0, 0) }, [pathname])
  return null
}

function Shell() {
  const [open, setOpen] = useState(false)
  const [editing] = useState(() => location.search.includes('edit'))
  useEffect(() => { document.body.classList.toggle('edit', editing) }, [editing])
  useEffect(() => { document.body.classList.toggle('lp-open', open) }, [open])

  return (
    <>
      <header className="topbar">
        <button className="lp-toggle" onClick={() => setOpen((o) => !o)}
                aria-expanded={open}>Layers</button>
        <Link className="topmark" to="/">{site.wordmark}</Link>
        <span className="toprole">{site.role}</span>
        <span className="topchips">
          {site.chips.map((c) => (
            <span className="chip" key={c.strong}><b>{c.strong}</b> {c.rest}</span>
          ))}
        </span>
      </header>

      <div className="app">
        <LayersPanel onNavigate={() => setOpen(false)} />
        <Rulers />

        <main className="doc">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/p/:projectId" element={<Project editing={editing} />} />
            <Route path="/p/:projectId/:n" element={<Artwork />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <footer>
            <span>© {new Date().getFullYear()} Parth Shukla</span>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </footer>
        </main>
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollReset />
      <Shell />
    </BrowserRouter>
  )
}
