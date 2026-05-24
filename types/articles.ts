export type ArticleSection = 'business' | 'personal'
export type ArticleFolder = 'to-read' | 'read' | 'review'
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink'

export interface Article {
  id?: number
  url: string
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
