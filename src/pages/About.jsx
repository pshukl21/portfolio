import site from '../site.json'
import { artworks } from '../assets'
import { projects } from '../projects'

export default function About() {
  const paragraphs = site.about_body.split('\n\n').filter(Boolean)
  return (
    <div className="wrap">
      <div className="about">
        <p className="first">{site.about_lead}</p>
        {paragraphs.map((t, i) => <p key={i}>{t}</p>)}

        <dl>
          <div><dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
          <div><dt>Instagram</dt><dd><a href={site.instagram} target="_blank" rel="noreferrer">Instagram</a></dd></div>
          <div><dt>TikTok</dt><dd><a href={site.tiktok} target="_blank" rel="noreferrer">TikTok</a></dd></div>
          <div><dt>YouTube</dt><dd><a href={site.youtube} target="_blank" rel="noreferrer">YouTube</a></dd></div>
          <div><dt>Tools</dt><dd>{site.tools}</dd></div>
          <div><dt>Archive</dt><dd>{projects.length} projects, {artworks.length} pieces</dd></div>
        </dl>
      </div>
    </div>
  )
}
