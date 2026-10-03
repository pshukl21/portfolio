/**
 * Post-build guard.
 *
 * Runs after `vite build` and fails the build if the output is broken in a
 * way that has bitten this site before — a missing admin page, or an image
 * path in the data files that doesn't exist on disk.
 *
 * Failing here means Vercel reports a failed deploy and keeps the previous
 * version live, instead of publishing a site with a dead /admin or blank
 * cards.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const problems = []
const ok = (msg) => console.log(`  ok    ${msg}`)
const bad = (msg) => { problems.push(msg); console.log(`  FAIL  ${msg}`) }

console.log('\nchecking build output\n')

// ---- the pages exist -------------------------------------------------------
for (const f of ['index.html', 'admin/index.html']) {
  existsSync(join(DIST, f)) ? ok(f) : bad(`${f} is missing from ${DIST}/`)
}

// ---- the admin page carries its own config ---------------------------------
const adminPath = join(DIST, 'admin/index.html')
if (existsSync(adminPath)) {
  const admin = readFileSync(adminPath, 'utf8')
  admin.includes('CMS.init')
    ? ok('admin config is embedded')
    : bad('admin/index.html has no CMS.init — the CMS will not load')
  admin.includes('decap-cms')
    ? ok('decap script tag present')
    : bad('admin/index.html does not load decap-cms')
}

// ---- every referenced image actually shipped -------------------------------
const refs = new Map()   // path -> where it came from
const add = (p, where) => {
  if (typeof p === 'string' && p.startsWith('/assets/')) refs.set(p, where)
}

const read = (p) => {
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null }
}

const site = read('src/site.json')
if (site) {
  add(site.portrait, 'site.portrait')
  for (const f of site.featured ?? []) add(f.logo, `logo "${f.name}"`)
}

const projects = read('src/projects.json')
for (const p of projects?.projects ?? []) add(p.cover, `cover of "${p.id}"`)

const content = read('src/content.json')
for (const proj of content?.content ?? []) {
  for (const g of proj.groups ?? []) {
    for (const src of g.images ?? []) add(src, `${proj.id} / ${g.title}`)
    for (const c of g.compare ?? []) {
      add(c.before, `${proj.id} / ${g.title} (before)`)
      add(c.after, `${proj.id} / ${g.title} (after)`)
    }
  }
}

let missing = 0
for (const [p, where] of refs) {
  if (!existsSync(join(DIST, p))) {
    bad(`${p}  — referenced by ${where}`)
    missing++
  }
}
if (!missing) ok(`all ${refs.size} referenced images shipped`)

// ---- verdict ---------------------------------------------------------------
if (problems.length) {
  console.error(`\n${problems.length} problem(s) — build failed, nothing deployed.`)
  console.error('If image paths are missing, run:  python3 sync_assets.py\n')
  process.exit(1)
}
console.log('\nbuild looks good\n')
