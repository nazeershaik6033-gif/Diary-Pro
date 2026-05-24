'use client'
import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import {
  addArticle, fetchArticleData, moveArticle, deleteArticle,
  addCollection, updateCollection, deleteCollection,
  addArticleToCollection, removeArticleFromCollection,
  reorderCollectionItems, getCollectionItems, getArticleCollections,
} from '@/lib/db/articles'
import { PageHeader } from '@/components/layout/PageHeader'
import { useHeader } from '@/app/contexts/HeaderContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Search, X, Loader2, Clock, ExternalLink, Trash2,
  BookMarked, Inbox, CheckCircle2, Star, Briefcase, User,
  MoreVertical, ChevronRight, FileText, Link2, FolderOpen,
  GripVertical, ArrowLeft, Edit2, Check, Layers,
} from 'lucide-react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useToast } from '@/app/contexts/ToastContext'
import type { Article, ArticleSection, ArticleFolder, ArticleCollection } from '@/types'

const SECTIONS: { key: ArticleSection; label: string; icon: React.ElementType }[] = [
  { key: 'business', label: 'Business', icon: Briefcase },
  { key: 'personal', label: 'Personal', icon: User },
]

const FOLDERS: { key: ArticleFolder; label: string; icon: React.ElementType }[] = [
  { key: 'to-read', label: 'To be Read',       icon: Inbox        },
  { key: 'read',    label: 'Read',              icon: CheckCircle2 },
  { key: 'review',  label: 'Marked for Review', icon: Star         },
]

const COLLECTION_COLORS: { key: string; bg: string; border: string; dot: string }[] = [
  { key: 'amber',  bg: 'bg-amber-50',  border: 'border-l-amber-400',  dot: 'bg-amber-400'  },
  { key: 'rose',   bg: 'bg-rose-50',   border: 'border-l-rose-400',   dot: 'bg-rose-400'   },
  { key: 'blue',   bg: 'bg-blue-50',   border: 'border-l-blue-400',   dot: 'bg-blue-400'   },
  { key: 'green',  bg: 'bg-green-50',  border: 'border-l-green-400',  dot: 'bg-green-400'  },
  { key: 'violet', bg: 'bg-violet-50', border: 'border-l-violet-400', dot: 'bg-violet-400' },
]

function getCollectionStyle(color?: string) {
  return COLLECTION_COLORS.find(c => c.key === color) ?? COLLECTION_COLORS[0]
}

function domain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return url }
}

// ---------------------------------------------------------------------------
// Article card with Manage Collections option
// ---------------------------------------------------------------------------
function ArticleCard({ article, onMove, onDelete, onManageCollections, collectionMode, position, onRemoveFromCollection, href }: {
  article: Article
  onMove?: (id: number, f: ArticleFolder) => void
  onDelete?: (id: number) => void
  onManageCollections?: (article: Article) => void
  collectionMode?: boolean
  position?: number
  onRemoveFromCollection?: (id: number) => void
  href: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isPdf = article.type === 'pdf'

  return (
    <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 overflow-hidden">
      <Link href={href} className="block p-4">
        <div className="flex gap-3">
          {collectionMode && position !== undefined && (
            <div className="w-7 h-7 rounded-full bg-amber-warm text-white flex items-center justify-center text-xs font-bold font-sans flex-shrink-0 mt-0.5">
              {position + 1}
            </div>
          )}
          {isPdf ? (
            <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-red-400" />
            </div>
          ) : article.imageUrl ? (
            <img src={article.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-paper-300"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isPdf && <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-500 uppercase tracking-wide flex-shrink-0">PDF</span>}
              <p className="font-sans font-semibold text-ink text-sm leading-snug line-clamp-2">{article.title}</p>
            </div>
            <p className="text-xs text-ink-300 font-sans mt-0.5">
              {isPdf ? (article.url ? domain(article.url) : 'Local file') : (article.siteName || domain(article.url))}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {article.estimatedReadTime && (
                <span className="flex items-center gap-1 text-xs text-ink-300 font-sans"><Clock size={11} /> {article.estimatedReadTime} min</span>
              )}
              {article.tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-paper-300 text-ink-300 font-sans">{t}</span>
              ))}
            </div>
          </div>
          {!collectionMode && <ChevronRight size={16} className="text-ink-300 flex-shrink-0 mt-1" />}
        </div>
      </Link>

      <div className="flex items-center border-t border-paper-200 px-4 py-2 gap-2">
        {!isPdf && article.url && (
          <a href={article.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-ink-300 hover:text-ink font-sans" onClick={e => e.stopPropagation()}>
            <ExternalLink size={12} /> Open original
          </a>
        )}
        <div className="flex-1" />
        {collectionMode && onRemoveFromCollection && (
          <button onClick={() => onRemoveFromCollection(article.id!)}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-sans px-2 py-1 rounded-lg hover:bg-red-50">
            <X size={12} /> Remove
          </button>
        )}
        {!collectionMode && (
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)} className="p-1.5 rounded-lg hover:bg-paper-300 text-ink-300">
              <MoreVertical size={14} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 bottom-8 bg-white rounded-xl shadow-lg border border-paper-300 py-1 z-10 min-w-[170px]">
                  {onManageCollections && (
                    <>
                      <button onClick={() => { onManageCollections(article); setMenuOpen(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-sans text-ink hover:bg-paper-200">
                        <Layers size={14} className="text-violet-400" /> Manage Collections
                      </button>
                      <div className="border-t border-paper-200 my-1" />
                    </>
                  )}
                  {onMove && FOLDERS.filter(f => f.key !== article.folder).map(f => (
                    <button key={f.key} onClick={() => { onMove(article.id!, f.key); setMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm font-sans text-ink hover:bg-paper-200">
                      <f.icon size={14} className="text-ink-300" /> Move to {f.label}
                    </button>
                  ))}
                  {onDelete && (
                    <>
                      <div className="border-t border-paper-200 my-1" />
                      <button onClick={() => { onDelete(article.id!); setMenuOpen(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-sans text-red-500 hover:bg-red-50">
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reorder item wrapper for collection detail
// ---------------------------------------------------------------------------
function DraggableArticleCard({ article, position, collectionId, onRemove, href }: {
  article: Article
  position: number
  collectionId: number
  onRemove: (id: number) => void
  href: string
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item value={article.id!} dragListener={false} dragControls={controls}>
      <div className="flex items-start gap-2 mb-3">
        <div
          className="touch-none cursor-grab active:cursor-grabbing text-ink-200 pt-4 flex-shrink-0"
          onPointerDown={e => controls.start(e)}
        >
          <GripVertical size={16} />
        </div>
        <div className="flex-1">
          <ArticleCard
            article={article}
            position={position}
            collectionMode
            onRemoveFromCollection={onRemove}
            href={href}
          />
        </div>
      </div>
    </Reorder.Item>
  )
}

// ---------------------------------------------------------------------------
// Collection detail view
// ---------------------------------------------------------------------------
function CollectionDetail({ collection, onBack, showToast }: {
  collection: ArticleCollection
  onBack: () => void
  showToast: (msg: string, type: 'success' | 'error') => void
}) {
  const [articles, setArticles] = useState<Article[]>([])
  const [orderedIds, setOrderedIds] = useState<number[]>([])
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [addSearch, setAddSearch] = useState('')
  const style = getCollectionStyle(collection.color)

  useEffect(() => {
    getCollectionItems(collection.id!).then(items => {
      setArticles(items)
      setOrderedIds(items.map(a => a.id!))
    })
  }, [collection.id])

  async function handleReorder(newIds: number[]) {
    setOrderedIds(newIds)
    const reordered = newIds.map(id => articles.find(a => a.id === id)!).filter(Boolean)
    setArticles(reordered)
    await reorderCollectionItems(collection.id!, newIds)
  }

  async function handleRemove(articleId: number) {
    await removeArticleFromCollection(collection.id!, articleId)
    const updated = articles.filter(a => a.id !== articleId)
    setArticles(updated)
    setOrderedIds(updated.map(a => a.id!))
    showToast('Removed from collection', 'success')
  }

  async function openAddSheet() {
    const all = await db.articles.toArray()
    setAllArticles(all)
    setAddSheetOpen(true)
  }

  async function toggleArticle(article: Article) {
    const inCollection = articles.some(a => a.id === article.id)
    if (inCollection) {
      await removeArticleFromCollection(collection.id!, article.id!)
      const updated = articles.filter(a => a.id !== article.id)
      setArticles(updated)
      setOrderedIds(updated.map(a => a.id!))
    } else {
      await addArticleToCollection(collection.id!, article.id!)
      const updated = [...articles, article]
      setArticles(updated)
      setOrderedIds(updated.map(a => a.id!))
    }
  }

  const filtered = addSearch.trim()
    ? allArticles.filter(a => a.title.toLowerCase().includes(addSearch.toLowerCase()))
    : allArticles

  return (
    <div>
      {/* Header */}
      <div className={cn('rounded-2xl border-l-4 p-4 mb-4', style.bg, style.border)}>
        <div className="flex items-center gap-2 mb-1">
          <button onClick={onBack} className="p-1 rounded-lg hover:bg-black/10 text-ink-300">
            <ArrowLeft size={18} />
          </button>
          <h2 className="font-serif font-bold text-ink text-lg flex-1">{collection.name}</h2>
          <button onClick={openAddSheet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-warm text-white text-xs font-sans font-semibold">
            <Plus size={13} /> Add Articles
          </button>
        </div>
        {collection.description && (
          <p className="text-xs text-ink-300 font-sans ml-8">{collection.description}</p>
        )}
        <p className="text-xs text-ink-300 font-sans ml-8 mt-0.5">{articles.length} article{articles.length !== 1 ? 's' : ''} · drag to reorder</p>
      </div>

      {/* Ordered article list */}
      {articles.length === 0 ? (
        <div className="text-center py-16">
          <Layers size={36} className="mx-auto text-ink-300 mb-3" />
          <p className="font-sans text-ink-300 font-medium">No articles yet</p>
          <button onClick={openAddSheet}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-warm text-white font-sans text-sm font-semibold">
            <Plus size={15} /> Add Articles
          </button>
        </div>
      ) : (
        <Reorder.Group axis="y" values={orderedIds} onReorder={handleReorder} className="list-none p-0 m-0">
          {articles.map((article, i) => (
            <DraggableArticleCard
              key={article.id}
              article={article}
              position={i}
              collectionId={collection.id!}
              onRemove={handleRemove}
              href={`/articles/reader?id=${article.id}&collectionId=${collection.id}`}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Add articles sheet */}
      <AnimatePresence>
        {addSheetOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setAddSheetOpen(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="w-full bg-paper rounded-t-3xl max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-paper-300 flex-shrink-0">
                <p className="font-serif font-bold text-ink text-lg">Add to "{collection.name}"</p>
                <button onClick={() => setAddSheetOpen(false)} className="text-ink-300"><X size={20} /></button>
              </div>
              <div className="px-6 py-3 border-b border-paper-200 flex-shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                  <input value={addSearch} onChange={e => setAddSearch(e.target.value)}
                    placeholder="Search articles…"
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-paper-300 text-sm font-sans text-ink outline-none" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-ink-300 font-sans text-sm py-8">No articles found</p>
                ) : filtered.map(article => {
                  const inCollection = articles.some(a => a.id === article.id)
                  return (
                    <button key={article.id} onClick={() => toggleArticle(article)}
                      className={cn('w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors',
                        inCollection ? 'border-amber-warm bg-amber-faint' : 'border-paper-300 hover:border-amber-warm/50')}>
                      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        inCollection ? 'bg-amber-warm border-amber-warm' : 'border-paper-300')}>
                        {inCollection && <Check size={11} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-ink text-sm truncate">{article.title}</p>
                        <p className="text-xs text-ink-300 font-sans truncate">
                          {article.type === 'pdf' ? 'PDF' : (article.siteName || domain(article.url))}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Collections grid
// ---------------------------------------------------------------------------
function CollectionsGrid({ onOpen, showToast }: {
  onOpen: (c: ArticleCollection) => void
  showToast: (msg: string, type: 'success' | 'error') => void
}) {
  const collections = useLiveQuery(() => db.articleCollections.orderBy('createdAt').reverse().toArray()) ?? []
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState('amber')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const [counts, setCounts] = useState<Record<number, number>>({})

  useEffect(() => {
    if (collections.length === 0) return
    Promise.all(collections.map(async c => {
      const n = await db.articleCollectionItems.where('collectionId').equals(c.id!).count()
      return [c.id!, n] as [number, number]
    })).then(pairs => setCounts(Object.fromEntries(pairs)))
  }, [collections])

  async function handleCreate() {
    if (!newName.trim()) return
    await addCollection({ name: newName.trim(), description: newDesc.trim() || undefined, color: newColor })
    showToast('Collection created', 'success')
    setNewName(''); setNewDesc(''); setNewOpen(false)
  }

  async function handleDelete(id: number) {
    await deleteCollection(id)
    showToast('Collection deleted', 'success')
    setMenuOpenId(null)
  }

  async function handleRename(id: number) {
    if (!editName.trim()) return
    await updateCollection(id, { name: editName.trim() })
    setEditingId(null)
    showToast('Renamed', 'success')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-sans text-xs font-semibold text-ink-300 uppercase tracking-wider">{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setNewOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-warm text-white text-xs font-sans font-semibold">
          <Plus size={13} /> New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-16">
          <Layers size={36} className="mx-auto text-ink-300 mb-3" />
          <p className="font-sans font-semibold text-ink-300">No collections yet</p>
          <p className="text-xs text-ink-300 font-sans mt-1">Group articles about the same topic or event</p>
          <button onClick={() => setNewOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-warm text-white font-sans text-sm font-semibold">
            <Plus size={15} /> Create your first collection
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map(c => {
            const style = getCollectionStyle(c.color)
            return (
              <div key={c.id} className={cn('rounded-2xl border-l-4 p-4 relative', style.bg, style.border)}>
                <div className="flex items-start gap-2">
                  <button onClick={() => onOpen(c)} className="flex-1 text-left min-w-0">
                    {editingId === c.id ? (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          autoFocus onKeyDown={e => e.key === 'Enter' && handleRename(c.id!)}
                          className="flex-1 px-2 py-1 rounded-lg border border-paper-300 text-sm font-sans font-bold text-ink outline-none" />
                        <button onClick={() => handleRename(c.id!)} className="text-amber-warm">
                          <Check size={15} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-ink-300">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <p className="font-sans font-bold text-ink text-sm">{c.name}</p>
                    )}
                    {c.description && <p className="text-xs text-ink-300 font-sans mt-0.5 line-clamp-1">{c.description}</p>}
                    <p className="text-xs text-ink-300 font-sans mt-1">
                      {counts[c.id!] ?? 0} article{(counts[c.id!] ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onOpen(c)} className="p-1.5 rounded-lg hover:bg-black/10 text-ink-300">
                      <ChevronRight size={16} />
                    </button>
                    <div className="relative">
                      <button onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id!)}
                        className="p-1.5 rounded-lg hover:bg-black/10 text-ink-300">
                        <MoreVertical size={14} />
                      </button>
                      <AnimatePresence>
                        {menuOpenId === c.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-paper-300 py-1 z-10 min-w-[140px]">
                            <button onClick={() => { setEditingId(c.id!); setEditName(c.name); setMenuOpenId(null) }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-sans text-ink hover:bg-paper-200">
                              <Edit2 size={13} /> Rename
                            </button>
                            <div className="border-t border-paper-200 my-1" />
                            <button onClick={() => handleDelete(c.id!)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-sans text-red-500 hover:bg-red-50">
                              <Trash2 size={13} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New collection sheet */}
      <AnimatePresence>
        {newOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setNewOpen(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="w-full bg-paper rounded-t-3xl p-6 space-y-4"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <p className="font-serif font-bold text-ink text-lg">New Collection</p>
                <button onClick={() => setNewOpen(false)} className="text-ink-300"><X size={20} /></button>
              </div>
              <div>
                <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Name *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. WWDC 2025 Coverage"
                  autoFocus
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm" />
              </div>
              <div>
                <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Description</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Optional"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm" />
              </div>
              <div>
                <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2 block">Color</label>
                <div className="flex gap-3">
                  {COLLECTION_COLORS.map(c => (
                    <button key={c.key} onClick={() => setNewColor(c.key)}
                      className={cn('w-8 h-8 rounded-full transition-transform', c.dot, newColor === c.key ? 'scale-125 ring-2 ring-offset-2 ring-amber-warm' : '')}>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreate} disabled={!newName.trim()}
                className="w-full py-3 rounded-2xl bg-amber-warm text-white font-sans font-semibold text-sm disabled:opacity-50">
                Create Collection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Manage collections sheet (from article card menu)
// ---------------------------------------------------------------------------
function ManageCollectionsSheet({ article, onClose, showToast }: {
  article: Article
  onClose: () => void
  showToast: (msg: string, type: 'success' | 'error') => void
}) {
  const collections = useLiveQuery(() => db.articleCollections.orderBy('createdAt').reverse().toArray()) ?? []
  const [membership, setMembership] = useState<Set<number>>(new Set())
  const [newName, setNewName] = useState('')
  const [addingNew, setAddingNew] = useState(false)

  useEffect(() => {
    getArticleCollections(article.id!).then(cols => {
      setMembership(new Set(cols.map(c => c.id!)))
    })
  }, [article.id])

  async function toggle(collectionId: number) {
    if (membership.has(collectionId)) {
      await removeArticleFromCollection(collectionId, article.id!)
      setMembership(prev => { const s = new Set(prev); s.delete(collectionId); return s })
    } else {
      await addArticleToCollection(collectionId, article.id!)
      setMembership(prev => { const s = new Set(prev); s.add(collectionId); return s })
    }
  }

  async function handleCreateAndAdd() {
    if (!newName.trim()) return
    const id = await addCollection({ name: newName.trim(), color: 'amber' })
    await addArticleToCollection(id, article.id!)
    setMembership(prev => { const s = new Set(prev); s.add(id); return s })
    setNewName('')
    setAddingNew(false)
    showToast('Added to new collection', 'success')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="w-full bg-paper rounded-t-3xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-paper-300 flex-shrink-0">
          <div>
            <p className="font-serif font-bold text-ink">Manage Collections</p>
            <p className="text-xs text-ink-300 font-sans mt-0.5 line-clamp-1">{article.title}</p>
          </div>
          <button onClick={onClose} className="text-ink-300"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {collections.length === 0 && !addingNew && (
            <p className="text-center text-ink-300 font-sans text-sm py-4">No collections yet</p>
          )}
          {collections.map(c => {
            const style = getCollectionStyle(c.color)
            const inCol = membership.has(c.id!)
            return (
              <button key={c.id} onClick={() => toggle(c.id!)}
                className={cn('w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors border-l-4',
                  style.border.replace('border-l-', 'border-l-'),
                  inCol ? 'border-amber-warm bg-amber-faint' : 'border-paper-300 hover:border-amber-warm/50', style.bg)}>
                <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  inCol ? 'bg-amber-warm border-amber-warm' : 'border-paper-300')}>
                  {inCol && <Check size={11} className="text-white" />}
                </div>
                <p className="font-sans font-medium text-ink text-sm">{c.name}</p>
              </button>
            )
          })}
          {addingNew ? (
            <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-amber-warm bg-amber-faint">
              <input value={newName} onChange={e => setNewName(e.target.value)} autoFocus
                placeholder="New collection name"
                onKeyDown={e => { if (e.key === 'Enter') handleCreateAndAdd(); if (e.key === 'Escape') setAddingNew(false) }}
                className="flex-1 bg-transparent text-sm font-sans text-ink outline-none" />
              <button onClick={handleCreateAndAdd} disabled={!newName.trim()} className="text-amber-warm disabled:opacity-40">
                <Check size={16} />
              </button>
              <button onClick={() => setAddingNew(false)} className="text-ink-300"><X size={16} /></button>
            </div>
          ) : (
            <button onClick={() => setAddingNew(true)}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-paper-300 text-ink-300 text-sm font-sans hover:border-amber-warm">
              <Plus size={14} /> New collection
            </button>
          )}
        </div>
        <div className="px-6 py-4 border-t border-paper-200 flex-shrink-0">
          <button onClick={onClose} className="w-full py-3 rounded-2xl bg-ink text-white font-sans font-semibold text-sm">Done</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
type ViewMode = ArticleFolder | 'collections'
type ModalStep = 'closed' | 'type-pick' | 'url-input' | 'url-fetching' | 'url-details' | 'pdf-form'

export default function ArticlesPage() {
  const { showToast } = useToast()
  const { setRightSlot } = useHeader()
  const [section, setSection] = useState<ArticleSection>('business')
  const [view, setView] = useState<ViewMode>('to-read')
  const [query, setQuery] = useState('')
  const [step, setStep] = useState<ModalStep>('closed')
  const [selectedCollection, setSelectedCollection] = useState<ArticleCollection | null>(null)
  const [managingArticle, setManagingArticle] = useState<Article | null>(null)

  const [formSection, setFormSection] = useState<ArticleSection>('business')
  const [formTags, setFormTags] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [fetchedData, setFetchedData] = useState<Partial<Article>>({})
  const [pdfInputType, setPdfInputType] = useState<'file' | 'url'>('file')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfTitle, setPdfTitle] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRightSlot(
      <button onClick={() => setStep('type-pick')}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-warm text-white hover:bg-amber-dark transition-colors"
        aria-label="Add article or PDF">
        <Plus size={18} />
      </button>
    )
    return () => setRightSlot(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const folder = view !== 'collections' ? view as ArticleFolder : 'to-read'

  const all = useLiveQuery<import('@/types').Article[]>(
    () => view !== 'collections'
      ? db.articles.where('section').equals(section).and(a => a.folder === folder).reverse().sortBy('createdAt')
      : Promise.resolve([]),
    [section, view, folder],
  ) ?? []

  const articles = query.trim()
    ? all.filter(a => {
        const q = query.toLowerCase()
        return a.title.toLowerCase().includes(q)
          || (a.description || '').toLowerCase().includes(q)
          || a.tags.some(t => t.toLowerCase().includes(q))
      })
    : all

  async function handleFetchUrl() {
    if (!inputUrl.trim()) return
    setStep('url-fetching')
    try {
      const data = await fetchArticleData(inputUrl.trim())
      setFetchedData(data)
      setFormTitle(data.title || inputUrl)
      setFormDesc(data.description || '')
    } catch {
      setFetchedData({})
      setFormTitle('')
    }
    setStep('url-details')
  }

  async function handleSaveArticle() {
    if (!inputUrl.trim() || !formTitle.trim()) return
    const tags = formTags.split(',').map(t => t.trim()).filter(Boolean)
    await addArticle({
      type: 'article',
      url: inputUrl.trim(),
      title: formTitle.trim(),
      description: formDesc.trim() || undefined,
      siteName: fetchedData.siteName || domain(inputUrl),
      imageUrl: fetchedData.imageUrl,
      content: fetchedData.content,
      plainText: fetchedData.plainText,
      estimatedReadTime: fetchedData.estimatedReadTime,
      section: formSection,
      folder: 'to-read',
      tags,
      notes: '',
    })
    showToast('Article saved', 'success')
    resetForm()
  }

  async function handleSavePdf() {
    if (!pdfTitle.trim()) { showToast('Please enter a title', 'error'); return }
    if (pdfInputType === 'file' && !pdfFile) { showToast('Please select a PDF file', 'error'); return }
    if (pdfInputType === 'url' && !pdfUrl.trim()) { showToast('Please enter a URL', 'error'); return }
    const tags = formTags.split(',').map(t => t.trim()).filter(Boolean)
    const blob = pdfInputType === 'file' && pdfFile
      ? new Blob([await pdfFile.arrayBuffer()], { type: 'application/pdf' })
      : undefined
    await addArticle({
      type: 'pdf',
      url: pdfInputType === 'url' ? pdfUrl.trim() : '',
      pdfBlob: blob,
      title: pdfTitle.trim(),
      section: formSection,
      folder: 'to-read',
      tags,
      notes: '',
    })
    showToast('PDF saved', 'success')
    resetForm()
  }

  function resetForm() {
    setStep('closed')
    setInputUrl(''); setFormTitle(''); setFormDesc(''); setFormTags(''); setFetchedData({})
    setPdfFile(null); setPdfUrl(''); setPdfTitle('')
    setFormSection(section)
  }

  const ALL_TABS: { key: ViewMode; label: string; icon: React.ElementType }[] = [
    ...FOLDERS.map(f => ({ key: f.key as ViewMode, label: f.label, icon: f.icon })),
    { key: 'collections', label: 'Collections', icon: Layers },
  ]

  return (
    <div className="min-h-screen">
      <PageHeader title="Article Reader" showBack={false} />

      <div className="px-4 pb-16 space-y-4">
        {/* Section toggle — hidden in collection detail */}
        {!selectedCollection && (
          <div className="flex gap-2">
            {SECTIONS.map(s => (
              <button key={s.key} onClick={() => setSection(s.key)}
                className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-sans font-semibold transition-colors',
                  section === s.key ? 'bg-amber-warm text-white' : 'bg-paper-300 text-ink-300')}>
                <s.icon size={15} /> {s.label}
              </button>
            ))}
          </div>
        )}

        {/* View tabs */}
        {!selectedCollection && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {ALL_TABS.map(t => (
              <button key={t.key} onClick={() => { setView(t.key); setQuery('') }}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium flex-shrink-0 transition-colors',
                  view === t.key ? 'bg-ink text-white' : 'bg-paper-300 text-ink-300')}>
                <t.icon size={12} /> {t.label}
                {view === t.key && view !== 'collections' && all.length > 0 && (
                  <span className="ml-0.5 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] leading-none">{all.length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Collections view */}
        {view === 'collections' && !selectedCollection && (
          <CollectionsGrid onOpen={setSelectedCollection} showToast={showToast} />
        )}

        {/* Collection detail */}
        {selectedCollection && (
          <CollectionDetail
            collection={selectedCollection}
            onBack={() => setSelectedCollection(null)}
            showToast={showToast}
          />
        )}

        {/* Normal article list views */}
        {view !== 'collections' && !selectedCollection && (
          <>
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search articles…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-paper-300 text-sm font-sans text-ink placeholder:text-ink-300 outline-none" />
              {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300"><X size={14} /></button>}
            </div>

            <AnimatePresence mode="popLayout">
              {articles.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <BookMarked size={36} className="mx-auto text-ink-300 mb-3" />
                  <p className="font-sans font-semibold text-ink-300">
                    {query ? 'No matching articles' : `No ${FOLDERS.find(f2 => f2.key === view)?.label} items`}
                  </p>
                  {!query && (
                    <button onClick={() => setStep('type-pick')}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-warm text-white font-sans text-sm font-semibold">
                      <Plus size={15} /> Add your first article
                    </button>
                  )}
                </motion.div>
              ) : articles.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.04 }}>
                  <ArticleCard
                    article={a}
                    href={`/articles/reader?id=${a.id}`}
                    onMove={async (id, f) => { await moveArticle(id, f); showToast(`Moved to ${FOLDERS.find(x => x.key === f)?.label}`, 'success') }}
                    onDelete={async id => { await deleteArticle(id); showToast('Deleted', 'success') }}
                    onManageCollections={setManagingArticle}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Manage collections sheet */}
      <AnimatePresence>
        {managingArticle && (
          <ManageCollectionsSheet
            article={managingArticle}
            onClose={() => setManagingArticle(null)}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* ---- Add article modal ---- */}
      <AnimatePresence>
        {step !== 'closed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 flex items-end" onClick={resetForm}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="w-full bg-paper rounded-t-3xl p-6 space-y-4 max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between">
                <p className="font-serif font-bold text-ink text-lg">Add to Article Reader</p>
                <button onClick={resetForm} className="text-ink-300"><X size={20} /></button>
              </div>

              <div className="flex gap-2">
                {SECTIONS.map(s => (
                  <button key={s.key} onClick={() => setFormSection(s.key)}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-sans transition-colors',
                      formSection === s.key ? 'bg-amber-warm text-white' : 'bg-paper-300 text-ink')}>
                    <s.icon size={14} /> {s.label}
                  </button>
                ))}
              </div>

              {step === 'type-pick' && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setStep('url-input')}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-paper-300 hover:border-amber-warm transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <Link2 size={22} className="text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-sans font-semibold text-ink text-sm">Web Article</p>
                      <p className="text-xs text-ink-300 font-sans mt-0.5">Paste a URL</p>
                    </div>
                  </button>
                  <button onClick={() => setStep('pdf-form')}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-paper-300 hover:border-amber-warm transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                      <FileText size={22} className="text-red-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-sans font-semibold text-ink text-sm">PDF</p>
                      <p className="text-xs text-ink-300 font-sans mt-0.5">Upload or URL</p>
                    </div>
                  </button>
                </div>
              )}

              {(step === 'url-input' || step === 'url-fetching') && (
                <>
                  <div>
                    <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Article URL</label>
                    <input value={inputUrl} onChange={e => setInputUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFetchUrl()}
                      placeholder="https://example.com/article" autoFocus
                      className="mt-1 w-full px-4 py-3 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm" />
                  </div>
                  <button onClick={handleFetchUrl} disabled={step === 'url-fetching' || !inputUrl.trim()}
                    className="w-full py-3 rounded-2xl bg-amber-warm text-white font-sans font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {step === 'url-fetching' ? <><Loader2 size={16} className="animate-spin" /> Fetching…</> : 'Fetch & Preview'}
                  </button>
                  <button onClick={() => setStep('url-details')} className="w-full py-1 text-sm font-sans text-ink-300 text-center">Enter manually instead</button>
                  <button onClick={() => setStep('type-pick')} className="w-full py-1 text-sm font-sans text-ink-300 text-center">← Back</button>
                </>
              )}

              {step === 'url-details' && (
                <>
                  {fetchedData.imageUrl && (
                    <img src={fetchedData.imageUrl} alt="" className="w-full h-32 object-cover rounded-xl"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                  <div className="space-y-3">
                    {[
                      { label: 'URL', val: inputUrl, set: setInputUrl, placeholder: '' },
                      { label: 'Title *', val: formTitle, set: setFormTitle, placeholder: 'Article title' },
                      { label: 'Description', val: formDesc, set: setFormDesc, placeholder: 'Optional' },
                      { label: 'Tags', val: formTags, set: setFormTags, placeholder: 'ai, design  (comma-separated)' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">{f.label}</label>
                        <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setStep('url-input')} className="flex-1 py-3 rounded-2xl border border-paper-300 text-sm font-sans text-ink">Back</button>
                    <button onClick={handleSaveArticle} disabled={!formTitle.trim() || !inputUrl.trim()}
                      className="flex-1 py-3 rounded-2xl bg-amber-warm text-white font-sans font-semibold text-sm disabled:opacity-50">Save Article</button>
                  </div>
                </>
              )}

              {step === 'pdf-form' && (
                <>
                  <div className="flex gap-2 p-1 bg-paper-300 rounded-xl">
                    {(['file', 'url'] as const).map(t => (
                      <button key={t} onClick={() => setPdfInputType(t)}
                        className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-sans font-medium transition-colors',
                          pdfInputType === t ? 'bg-white text-ink shadow-sm' : 'text-ink-300')}>
                        {t === 'file' ? <><FileText size={14} /> Upload File</> : <><Link2 size={14} /> PDF URL</>}
                      </button>
                    ))}
                  </div>

                  {pdfInputType === 'file' ? (
                    <>
                      <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) { setPdfFile(f); if (!pdfTitle) setPdfTitle(f.name.replace(/\.pdf$/i, '')) } }} />
                      <button onClick={() => fileRef.current?.click()}
                        className={cn('w-full py-8 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors',
                          pdfFile ? 'border-amber-warm bg-amber-faint' : 'border-paper-300 hover:border-amber-warm')}>
                        <FileText size={28} className={pdfFile ? 'text-amber-warm' : 'text-ink-300'} />
                        <p className="font-sans text-sm font-medium text-ink">{pdfFile ? pdfFile.name : 'Tap to choose a PDF'}</p>
                        {pdfFile && <p className="text-xs text-ink-300 font-sans">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p>}
                      </button>
                    </>
                  ) : (
                    <div>
                      <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">PDF URL</label>
                      <input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://example.com/doc.pdf"
                        className="mt-1 w-full px-4 py-3 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm" />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Title *</label>
                    <input value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} placeholder="Document title"
                      className="mt-1 w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm" />
                  </div>
                  <div>
                    <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Tags</label>
                    <input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="finance, report  (comma-separated)"
                      className="mt-1 w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm" />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setStep('type-pick')} className="flex-1 py-3 rounded-2xl border border-paper-300 text-sm font-sans text-ink">Back</button>
                    <button onClick={handleSavePdf} disabled={!pdfTitle.trim()}
                      className="flex-1 py-3 rounded-2xl bg-amber-warm text-white font-sans font-semibold text-sm disabled:opacity-50">Save PDF</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
