import assetMeta from './assets.json'
import contentList from './content.json'
import { projects } from './projects'

/** content.json is an array so it can be edited in the CMS; index it here. */
const content = Object.fromEntries(contentList.content.map((c) => [c.id, c]))

/** Intrinsic aspect ratios keyed by "folder/NN.ext". */
const ratios = {}
const dims = {}
for (const [page, blob] of Object.entries(assetMeta)) {
  blob.images.forEach((im, i) => {
    const ext = new URL(im.url).pathname.match(/\.[^.]+$/)?.[0] ?? '.jpg'
    const key = `${page}/${String(i + 1).padStart(2, '0')}${ext}`
    const [w, h] = im.natural_size ?? [0, 0]
    ratios[key] = w && h ? w / h : 1
    dims[key] = [w, h]
  })
}

export const mosaic = assetMeta.home.images.map((im, i) => {
  const ext = new URL(im.url).pathname.match(/\.[^.]+$/)?.[0] ?? '.jpg'
  return `/assets/home/${String(i + 1).padStart(2, '0')}${ext}`
})

function resolve(projectId, group, file) {
  const folder = group.folder ?? content[projectId]?.folder
  const key = `${folder}/${file}`
  if (!(key in ratios) && import.meta.env.DEV) {
    console.warn(`[content.json] no asset for "${key}"`)
  }
  return {
    src: `/assets/${key}`,
    ar: ratios[key] ?? 1,
    w: dims[key]?.[0] ?? 0,
    h: dims[key]?.[1] ?? 0,
  }
}

/**
 * Every artwork, flattened and indexed. Each one is addressable at
 * #/p/<projectId>/<n>, which is what gives a piece its own page.
 */
export const byProject = {}
export const artworks = []

for (const p of projects) {
  const groups = content[p.id]?.groups ?? []
  const list = []
  groups.forEach((g) => {
    ;(g.files ?? []).forEach((file) => {
      const { src, ar, w, h } = resolve(p.id, g, file)
      const art = {
        projectId: p.id,
        projectTitle: p.title,
        group: g.title,
        note: g.note || '',
        file,
        src,
        ar,
        w,
        h,
        n: list.length + 1,
      }
      list.push(art)
      artworks.push(art)
    })
  })
  byProject[p.id] = list
}

export const groupsFor = (id) => content[id]?.groups ?? []
export const isSequence = (id) => Boolean(content[id]?.sequence)
export const isCompact = (id) => Boolean(content[id]?.compact)
export const artFor = (id, n) => byProject[id]?.[Number(n) - 1] ?? null
export const coverFor = (id) =>
  projects.find((p) => p.id === id)?.cover ?? byProject[id]?.[0]?.src ?? mosaic[12]
export const countFor = (id) => byProject[id]?.length ?? 0
