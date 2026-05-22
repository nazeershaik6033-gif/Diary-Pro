export type TagCategoryId = 'feeling' | 'activity' | 'people' | 'place' | 'topic' | 'custom'

export const TAG_CATEGORY_CONFIG: Record<TagCategoryId, { label: string; emoji: string }> = {
  feeling:  { label: 'Feeling',   emoji: '😊' },
  activity: { label: 'Activity',  emoji: '🏃' },
  people:   { label: 'People',    emoji: '👥' },
  place:    { label: 'Place',     emoji: '📍' },
  topic:    { label: 'Topic',     emoji: '💬' },
  custom:   { label: 'Custom',    emoji: '🏷️' },
}

export interface Tag {
  id?: number
  name: string
  categoryId: TagCategoryId
  emoji?: string
  color?: string   // tailwind color class e.g. 'bg-amber-100 text-amber-800'
  createdAt: number
}

export interface TagCategory {
  id?: number
  name: string
  emoji: string
  order: number
}
