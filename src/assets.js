import assetMeta from './assets.json'
import contentList from './content.json'
import { projects } from './projects'

/** content.json is an array so the CMS can edit it; index it by id here. */
const content = Object.fromEntries(contentList.content.map((c) => [c.id, c]))

/**
 * Intrinsic pixel sizes captured by extract_assets.py, keyed by the path the
 * site uses. Images uploaded through the CMS won't be in here — those get
 * measured in the browser instead, so this is an optimisation, not a
 * requirement.
 */
const dims = {}
for (const [page, blob] of Object.entries(assetMeta)) {
  blob.images.forEach((im, i) => {
    const ext = new URL(im.url).pathname.match(/\.[^.]+$/)?.[0] ?? '.jpg'
    const [w, h] = im.natural_size ?? [0, 0]
    if (w && h) dims[`/assets/${page}/${String(i + 1).padStart(2, '0')}${ext}`] = [w, h]
  })
}

export const mosaic = assetMeta.home.images.map((im, i) => {
  const ext = new URL(im.url).pathname.match(/\.[^.]+$/)?.[0] ?? '.jpg'
  return `/assets/home/${String(i + 1).padStart(2, '0')}${ext}`
})

/** Every artwork, flattened and indexed — each addressable at /p/<id>/<n>. */
export const byProject = {}
export const artworks = []

for (const p of projects) {
  const list = []
  for (const g of content[p.id]?.groups ?? []) {
    for (const src of g.images ?? []) {
      const [w = 0, h = 0] = dims[src] ?? []
      const art = {
        projectId: p.id,
        projectTitle: p.title,
        group: g.title,
        note: g.note || '',
        src,
        file: src.split('/').pop(),
        ar: w && h ? w / h : 1,
        w,
        h,
        n: list.length + 1,
      }
      list.push(art)
      artworks.push(art)
    }
  }
  byProject[p.id] = list
}

export const groupsFor = (id) => content[id]?.groups ?? []
export const isSequence = (id) => Boolean(content[id]?.sequence)
export const isCompact = (id) => Boolean(content[id]?.compact)
export const artFor = (id, n) => byProject[id]?.[Number(n) - 1] ?? null
export const coverFor = (id) =>
  projects.find((p) => p.id === id)?.cover ?? byProject[id]?.[0]?.src ?? mosaic[12]
export const countFor = (id) => byProject[id]?.length ?? 0
