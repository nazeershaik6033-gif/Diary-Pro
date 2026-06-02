export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function matchesQuery(query: string, ...fields: string[]): boolean {
  const q = query.toLowerCase().trim()
  if (!q) return true
  return fields.some(f => f?.toLowerCase().includes(q))
}
