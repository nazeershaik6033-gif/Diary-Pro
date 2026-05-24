import { db } from '@/lib/db'
import type { Article, ArticleHighlight, ArticleFolder, ArticleSection, ArticleCollection, ArticleCollectionItem } from '@/types'

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

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function addCollection(data: Omit<ArticleCollection, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  return db.articleCollections.add({ ...data, createdAt: Date.now(), updatedAt: Date.now() }) as Promise<number>
}

export async function updateCollection(id: number, data: Partial<ArticleCollection>): Promise<void> {
  await db.articleCollections.update(id, { ...data, updatedAt: Date.now() })
}

export async function deleteCollection(id: number): Promise<void> {
  await db.articleCollections.delete(id)
  await db.articleCollectionItems.where('collectionId').equals(id).delete()
}

export async function addArticleToCollection(collectionId: number, articleId: number): Promise<void> {
  const existing = await db.articleCollectionItems
    .where('collectionId').equals(collectionId)
    .and(i => i.articleId === articleId)
    .count()
  if (existing > 0) return
  const items = await db.articleCollectionItems.where('collectionId').equals(collectionId).toArray()
  const maxPos = items.reduce((m, i) => Math.max(m, i.position), -1)
  await db.articleCollectionItems.add({ collectionId, articleId, position: maxPos + 1, addedAt: Date.now() })
}

export async function removeArticleFromCollection(collectionId: number, articleId: number): Promise<void> {
  await db.articleCollectionItems
    .where('collectionId').equals(collectionId)
    .and(i => i.articleId === articleId)
    .delete()
}

export async function reorderCollectionItems(collectionId: number, orderedArticleIds: number[]): Promise<void> {
  const items = await db.articleCollectionItems.where('collectionId').equals(collectionId).toArray()
  await db.transaction('rw', db.articleCollectionItems, async () => {
    for (const item of items) {
      const newPos = orderedArticleIds.indexOf(item.articleId)
      if (newPos !== -1 && newPos !== item.position) {
        await db.articleCollectionItems.update(item.id!, { position: newPos })
      }
    }
  })
}

export async function getCollectionItems(collectionId: number): Promise<Article[]> {
  const items = await db.articleCollectionItems
    .where('collectionId').equals(collectionId)
    .sortBy('position')
  const articles = await db.articles.bulkGet(items.map(i => i.articleId))
  return articles.filter(Boolean) as Article[]
}

export async function getArticleCollections(articleId: number): Promise<ArticleCollection[]> {
  const items = await db.articleCollectionItems.where('articleId').equals(articleId).toArray()
  const collections = await db.articleCollections.bulkGet(items.map(i => i.collectionId))
  return collections.filter(Boolean) as ArticleCollection[]
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
