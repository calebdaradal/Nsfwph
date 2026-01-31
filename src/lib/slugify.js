/**
 * Slugify a title for URL use. Preserves case (titles are unique, case-sensitive).
 * Spaces -> hyphens, strips non-alphanumeric except hyphen, collapses hyphens.
 * @param {string} title
 * @returns {string}
 */
export function slugify(title) {
  if (!title || typeof title !== 'string') return ''
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
