import data from './projects.json'

/**
 * Project order, copy and grid covers. Edited at /admin, or by hand in
 * projects.json. `cover` points at a file in public/assets.
 *
 * The file is an object ({ projects: [...] }) rather than a bare array
 * because Decap CMS can only map fields onto a keyed object.
 */
export const projects = data.projects
