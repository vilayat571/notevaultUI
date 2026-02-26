// Converts a string to a URL-safe slug
// e.g. "My Favorite Book!" → "my-favorite-book"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars
    .replace(/[\s_-]+/g, '-')   // spaces/underscores → hyphens
    .replace(/^-+|-+$/g, '')    // trim leading/trailing hyphens
}

// Builds the public share path for a note
// e.g. category="book", title="My Book", id="507f1f77bcf86cd799439011"
// → "/share/book/my-book-439011"
export function noteSharePath(category: string, title: string, id: string): string {
  const slug   = slugify(title)
  const suffix = id.slice(-6)   // last 6 chars of the MongoDB ObjectId
  return `/share/${category}/${slug}-${suffix}`
}