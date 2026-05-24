'use client'
import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { addArticle, fetchArticleData, moveArticle, deleteArticle } from '@/lib/db/articles'
import { PageHeader } from '@/components/layout/PageHeader'
import Link from 'next/link'
import {
  Plus, Search, X, Loader2, Clock, ExternalLink, Trash2,
  BookMarked, Inbox, CheckCircle2, Star, Briefcase, User,
  MoreVertical, ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useToast } from '@/app/contexts/ToastContext'
import type { Article, ArticleSection, ArticleFolder } from '@/types'

const SECTIONS: { key: ArticleSection; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'business', label: 'Business', icon: Briefcase, color: 'text-blue-500' },
  { key: 'personal', label: 'Personal', icon: User,      color: 'text-violet-500' },
]

const FOLDERS: { key: ArticleFolder; label: string; icon: React.ElementType }[] = [
  { key: 'to-read', label: 'To be Read',        icon: Inbox        },
  { key: 'read',    label: 'Read',               icon: CheckCircle2 },
  { key: 'review',  label: 'Marked for Review',  icon: Star         },
]

function domain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return url }
}

function ArticleCard({
  article,
  onMove,
  onDelete,
}: {
  article: Article
  onMove: (id: number, folder: ArticleFolder) => void
  onDelete: (id: number) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuFolders = FOLDERS.filter(f => f.key !== article.folder)

  return (
    <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 overflow-hidden">
      <Link href={`/articles/reader?id=${article.id}`} className="block p-4">
        <div className="flex gap-3">
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt=""
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-paper-300"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-ink text-sm leading-snug line-clamp-2">{article.title}</p>
            <p className="text-xs text-ink-300 font-sans mt-0.5">{article.siteName || domain(article.url)}</p>
            {article.description && (
              <p className="text-xs text-ink-300 font-sans mt-1 line-clamp-2">{article.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {article.estimatedReadTime && (
                <span className="flex items-center gap-1 text-xs text-ink-300 font-sans">
                  <Clock size={11} /> {article.estimatedReadTime} min
                </span>
              )}
              {article.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-paper-300 text-ink-300 font-sans">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <ChevronRight size={16} className="text-ink-300 flex-shrink-0 mt-1" />
        </div>
      </Link>

      {/* Action row */}
      <div className="flex items-center border-t border-paper-200 px-4 py-2 gap-2">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-ink-300 hover:text-ink font-sans"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={12} /> Open original
        </a>
        <div className="flex-1" />
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded-lg hover:bg-paper-300 text-ink-300"
          >
            <MoreVertical size={14} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 bottom-8 bg-white rounded-xl shadow-lg border border-paper-300 py-1 z-10 min-w-[160px]"
              >
                {menuFolders.map(f => (
                  <button
                    key={f.key}
                    onClick={() => { onMove(article.id!, f.key); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-sans text-ink hover:bg-paper-200"
                  >
                    <f.icon size={14} className="text-ink-300" />
                    Move to {f.label}
                  </button>
                ))}
                <div className="border-t border-paper-200 my-1" />
                <button
                  onClick={() => { onDelete(article.id!); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-sans text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

type Step = 'idle' | 'url' | 'fetching' | 'details'

export default function ArticlesPage() {
  const { showToast } = useToast()
  const [section, setSection] = useState<ArticleSection>('business')
  const [folder, setFolder] = useState<ArticleFolder>('to-read')
  const [query, setQuery] = useState('')
  const [step, setStep] = useState<Step>('idle')

  // Add-article form state
  const [inputUrl, setInputUrl] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formSection, setFormSection] = useState<ArticleSection>('business')
  const [fetchedData, setFetchedData] = useState<Partial<Article>>({})

  const urlRef = useRef<HTMLInputElement>(null)

  const all = useLiveQuery(
    () => db.articles
      .where('section').equals(section)
      .and(a => a.folder === folder)
      .reverse()
      .sortBy('createdAt'),
    [section, folder],
  ) ?? []

  const articles = query.trim()
    ? all.filter(a => {
        const q = query.toLowerCase()
        return a.title.toLowerCase().includes(q)
          || (a.description || '').toLowerCase().includes(q)
          || a.tags.some(t => t.toLowerCase().includes(q))
          || domain(a.url).includes(q)
      })
    : all

  async function handleFetchUrl() {
    const url = inputUrl.trim()
    if (!url) return
    setStep('fetching')
    try {
      const data = await fetchArticleData(url)
      setFetchedData(data)
      setFormTitle(data.title || url)
      setFormDesc(data.description || '')
    } catch {
      setFetchedData({})
      setFormTitle('')
      setFormDesc('')
    }
    setStep('details')
  }

  async function handleSave() {
    const url = inputUrl.trim()
    if (!url || !formTitle.trim()) return
    const tags = formTags.split(',').map(t => t.trim()).filter(Boolean)
    await addArticle({
      url,
      title: formTitle.trim(),
      description: formDesc.trim() || undefined,
      siteName: fetchedData.siteName || domain(url),
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

  function resetForm() {
    setStep('idle')
    setInputUrl('')
    setFormTitle('')
    setFormDesc('')
    setFormTags('')
    setFetchedData({})
  }

  async function handleMove(id: number, f: ArticleFolder) {
    await moveArticle(id, f)
    showToast(`Moved to ${FOLDERS.find(x => x.key === f)?.label}`, 'success')
  }

  async function handleDelete(id: number) {
    await deleteArticle(id)
    showToast('Article deleted', 'success')
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Article Reader" />

      <div className="px-4 pb-28 space-y-4">
        {/* Section toggle */}
        <div className="flex gap-2 pt-1">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-sans font-semibold transition-colors',
                section === s.key ? 'bg-amber-warm text-white' : 'bg-paper-300 text-ink-300',
              )}
            >
              <s.icon size={15} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Folder tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FOLDERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFolder(f.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium flex-shrink-0 transition-colors',
                folder === f.key ? 'bg-ink text-white' : 'bg-paper-300 text-ink-300',
              )}
            >
              <f.icon size={12} />
              {f.label}
              {folder === f.key && all.length > 0 && (
                <span className="ml-0.5 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                  {all.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-paper-300 text-sm font-sans text-ink placeholder:text-ink-300 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Article list */}
        <AnimatePresence mode="popLayout">
          {articles.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <BookMarked size={36} className="mx-auto text-ink-300 mb-3" />
              <p className="font-sans font-semibold text-ink-300">
                {query ? 'No matching articles' : `No ${FOLDERS.find(f2 => f2.key === folder)?.label} articles`}
              </p>
              {!query && (
                <p className="text-xs text-ink-300 mt-1 font-sans">
                  Tap + to save an article URL
                </p>
              )}
            </motion.div>
          ) : (
            articles.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.04 }}
              >
                <ArticleCard article={a} onMove={handleMove} onDelete={handleDelete} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <button
        onClick={() => setStep('url')}
        className="fixed right-4 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] w-14 h-14 rounded-full bg-amber-warm shadow-lg flex items-center justify-center z-20"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Add article modal */}
      <AnimatePresence>
        {step !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 flex items-end"
            onClick={resetForm}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="w-full bg-paper rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="font-serif font-bold text-ink text-lg">Save Article</p>
                <button onClick={resetForm} className="text-ink-300"><X size={20} /></button>
              </div>

              {/* Section picker inside modal */}
              <div className="flex gap-2">
                {SECTIONS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setFormSection(s.key)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-sans transition-colors',
                      formSection === s.key ? 'bg-amber-warm text-white' : 'bg-paper-300 text-ink',
                    )}
                  >
                    <s.icon size={14} /> {s.label}
                  </button>
                ))}
              </div>

              {/* URL step */}
              {(step === 'url' || step === 'fetching') && (
                <>
                  <div>
                    <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Article URL</label>
                    <input
                      ref={urlRef}
                      value={inputUrl}
                      onChange={e => setInputUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleFetchUrl()}
                      placeholder="https://example.com/article"
                      autoFocus
                      className="mt-1 w-full px-4 py-3 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm"
                    />
                  </div>
                  <button
                    onClick={handleFetchUrl}
                    disabled={step === 'fetching' || !inputUrl.trim()}
                    className="w-full py-3 rounded-2xl bg-amber-warm text-white font-sans font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {step === 'fetching' ? (
                      <><Loader2 size={16} className="animate-spin" /> Fetching article…</>
                    ) : 'Fetch & Preview'}
                  </button>
                  <button
                    onClick={() => setStep('details')}
                    className="w-full py-2 text-sm font-sans text-ink-300 text-center"
                  >
                    Enter details manually instead
                  </button>
                </>
              )}

              {/* Details step */}
              {step === 'details' && (
                <>
                  {fetchedData.imageUrl && (
                    <img
                      src={fetchedData.imageUrl}
                      alt=""
                      className="w-full h-32 object-cover rounded-xl"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">URL</label>
                      <input
                        value={inputUrl}
                        onChange={e => setInputUrl(e.target.value)}
                        className="mt-1 w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Title *</label>
                      <input
                        value={formTitle}
                        onChange={e => setFormTitle(e.target.value)}
                        placeholder="Article title"
                        className="mt-1 w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Description</label>
                      <textarea
                        value={formDesc}
                        onChange={e => setFormDesc(e.target.value)}
                        rows={2}
                        placeholder="Optional short description"
                        className="mt-1 w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Tags</label>
                      <input
                        value={formTags}
                        onChange={e => setFormTags(e.target.value)}
                        placeholder="ai, productivity, design  (comma-separated)"
                        className="mt-1 w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-sans outline-none focus:border-amber-warm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('url')}
                      className="flex-1 py-3 rounded-2xl border border-paper-300 text-sm font-sans text-ink"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!formTitle.trim() || !inputUrl.trim()}
                      className="flex-2 flex-1 py-3 rounded-2xl bg-amber-warm text-white font-sans font-semibold text-sm disabled:opacity-50"
                    >
                      Save Article
                    </button>
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
