import { projects } from './projects'

/** Folder order in the Layers panel and the filter row. */
export const CATEGORIES = [
  'Sports',
  'Creators',
  'Film & TV',
  'Music',
  'Product & Brand',
]

/** Categories that actually have projects, in the order above. */
export const usedCategories = CATEGORIES.filter((c) =>
  projects.some((p) => p.category === c)
).concat(
  // anything assigned a category not in the list still shows, at the end
  [...new Set(projects.map((p) => p.category))]
    .filter((c) => c && !CATEGORIES.includes(c))
)

export const projectsIn = (cat) => projects.filter((p) => p.category === cat)
