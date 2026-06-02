export type ArticleSection = 'business' | 'personal'
export type ArticleFolder = 'to-read' | 'read' | 'review'
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink'
export type ArticleType = 'article' | 'pdf'

export interface Article {
  id?: number
  type: ArticleType
  url: string             // article/PDF URL; empty string for locally-uploaded PDFs
  pdfBlob?: Blob          // uploaded PDF stored as a Blob in IndexedDB
  title: string
  description?: string
  siteName?: string
  imageUrl?: string
  section: ArticleSection
  folder: ArticleFolder
  tags: string[]
  content?: string        // sanitized HTML for in-app reader
  plainText?: string      // for search + word count
  estimatedReadTime?: number // minutes
  notes?: string
  createdAt: number
  updatedAt: number
  readAt?: number
}

export interface ArticleHighlight {
  id?: number
  articleId: number
  text: string
  note?: string
  color: HighlightColor
  createdAt: number
}

export interface ArticleCollection {
  id?: number
  name: string
  description?: string
  color?: string  // 'amber' | 'rose' | 'blue' | 'green' | 'violet'
  createdAt: number
  updatedAt: number
}

export interface ArticleCollectionItem {
  id?: number
  collectionId: number
  articleId: number
  position: number
  addedAt: number
}
