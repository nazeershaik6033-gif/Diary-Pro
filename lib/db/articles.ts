import { db } from '@/lib/db'
import type { Article, ArticleHighlight, ArticleFolder, ArticleSection } from '@/types'

export async function addArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  return db.articles.add({
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }) as Promise<number>
}

export async function updateArticle(id: number, data: Partial<Article>): Promise<void> {
  await db.articles.update(id, { ...data, updatedAt: Date.now() })
}

export async function deleteArticle(id: number): Promise<void> {
  await db.articles.delete(id)
  await db.articleHighlights.where('articleId').equals(id).delete()
}

export async function moveArticle(id: number, folder: ArticleFolder): Promise<void> {
  const patch: Partial<Article> = { folder, updatedAt: Date.now() }
  if (folder === 'read') patch.readAt = Date.now()
  await db.articles.update(id, patch)
}

export async function addHighlight(data: Omit<ArticleHighlight, 'id' | 'createdAt'>): Promise<number> {
  return db.articleHighlights.add({ ...data, createdAt: Date.now() }) as Promise<number>
}

export async function updateHighlight(id: number, data: Partial<ArticleHighlight>): Promise<void> {
  await db.articleHighlights.update(id, data)
}

export async function deleteHighlight(id: number): Promise<void> {
  await db.articleHighlights.delete(id)
}

/** Fetch article metadata + content via CORS proxy and Readability */
export async function fetchArticleData(url: string): Promise<Partial<Article>> {
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const html = await res.text()

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Set base so relative URLs resolve correctly
  let base = doc.querySelector('base')
  if (!base) {
    base = doc.createElement('base')
    doc.head.appendChild(base)
  }
  base.href = url

  // Extract OG / meta tags
  const metaTitle =
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
    doc.querySelector('title')?.textContent || ''
  const description =
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
  const imageUrl =
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || ''
  const siteName =
    doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
    new URL(url).hostname.replace(/^www\./, '')

  // Try Readability for full content
  let content: string | undefined
  let plainText: string | undefined
  let estimatedReadTime: number | undefined

  try {
    const { Readability } = await import('@mozilla/readability')
    const article = new Readability(doc.cloneNode(true) as Document).parse()
    if (article) {
      content = article.content ?? undefined
      plainText = article.textContent ?? undefined
      const wordCount = (article.textContent || '').trim().split(/\s+/).length
      estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200))
    }
  } catch {
    // Readability failed — store without content
  }

  return {
    title: metaTitle.trim(),
    description: description.trim(),
    imageUrl: imageUrl || undefined,
    siteName,
    content,
    plainText,
    estimatedReadTime,
  }
}
