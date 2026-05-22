'use client'

export function WordCount({ html }: { html: string }) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text ? text.split(' ').filter(Boolean).length : 0
  const chars = text.length
  return (
    <p className="text-xs font-sans text-ink-300">
      {words} words · {chars} chars
    </p>
  )
}
