'use client'
import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { addArticle, fetchArticleData, moveArticle, deleteArticle } from '@/lib/db/articles'
import { PageHeader } from '@/components/layout/PageHeader'
import { useHeader } from '@/app/contexts/HeaderContext'
import Link from 'next/link'
import {
  Plus, Search, X, Loader2, Clock, ExternalLink, Trash2,
  BookMarked, Inbox, CheckCircle2, Star, Briefcase, User,
  MoreVertical, ChevronRight, FileText, Link2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useToast } from '@/app/contexts/ToastContext'
import type { Article, ArticleSection, ArticleFolder } from '@/types'

const SECTIONS: { key: ArticleSection; label: string; icon: React.ElementType }[] = [
  { key: 'business', label: 'Business', icon: Briefcase },
  { key: 'personal', label: 'Personal', icon: User },
]

const FOLDERS: { key: ArticleFolder; label: string; icon: React.ElementType }[] = [
  { key: 'to-read', label: 'To be Read',       icon: Inbox        },
  { key: 'read',    label: 'Read',              icon: CheckCircle2 },
  { key: 'review',  label: 'Marked for Review', icon: Star         },
]

function domain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return url }
}

function ArticleCard({ article, onMove, onDelete }: {
  article: Article
  onMove: (id: number, f: ArticleFolder) => void
  onDelete: (id: number) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isPdf = article.type === 'pdf'

  return (
    <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 overflow-hidden">
      <Link href={`/articles/reader?id=${article.id}`} className="block p-4">
        <div className="flex gap-3">
          {isPdf ? (
            <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <FileText size={26} className="text-red-400" />
            </div>
          ) : article.imageUrl ? (
            <img src={article.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-paper-300"
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
            {article.description && <p className="text-xs text-ink-300 font-sans mt-1 line-clamp-2">{article.description}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {article.estimatedReadTime && (
                <span className="flex items-center gap-1 text-xs text-ink-300 font-sans"><Clock size={11} /> {article.estimatedReadTime} min</span>
              )}
              {article.tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-paper-300 text-ink-300 font-sans">{t}</span>
              ))}
            </div>
          </div>
          <ChevronRight size={16} className="text-ink-300 flex-shrink-0 mt-1" />
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
        <div className="relative">
          <button onClick={() => setMenuOpen(v => !v)} className="p-1.5 rounded-lg hover:bg-paper-300 text-ink-300">
            <MoreVertical size={14} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 bottom-8 bg-white rounded-xl shadow-lg border border-paper-300 py-1 z-10 min-w-[160px]">
                {FOLDERS.filter(f => f.key !== article.folder).map(f => (
                  <button key={f.key} onClick={() => { onMove(article.id!, f.key); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-sans text-ink hover:bg-paper-200">
                    <f.icon size={14} className="text-ink-300" /> Move to {f.label}
                  </button>
                ))}
                <div className="border-t border-paper-200 my-1" />
                <button onClick={() => { onDelete(article.id!); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-sans text-red-500 hover:bg-red-50">
                  <Trash2 size={14} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

type ModalStep = 'closed' | 'type-pick' | 'url-input' | 'url-fetching' | 'url-details' | 'pdf-form'

export default function ArticlesPage() {
  const { showToast } = useToast()
  const { setRightSlot } = useHeader()
  const [section, setSection] = useState<ArticleSection>('business')
  const [folder, setFolder] = useState<ArticleFolder>('to-read')
  const [query, setQuery] = useState('')
  const [step, setStep] = useState<ModalStep>('closed')

  const [formSection, setFormSection] = useState<ArticleSection>('business')
  const [formTags, setFormTags] = useState('')

  // Article-URL state
  const [inputUrl, setInputUrl] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [fetchedData, setFetchedData] = useState<Partial<Article>>({})

  // PDF state
  const [pdfInputType, setPdfInputType] = useState<'file' | 'url'>('file')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfTitle, setPdfTitle] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Inject + button into global header
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

  const all = useLiveQuery(
    () => db.articles.where('section').equals(section).and(a => a.folder === folder).reverse().sortBy('createdAt'),
    [section, folder],
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

  return (
    <div className="min-h-screen">
      <PageHeader title="Article Reader" showBack={false} />

      <div className="px-4 pb-16 space-y-4">
        {/* Section toggle */}
        <div className="flex gap-2">
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setSection(s.key)}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-sans font-semibold transition-colors',
                section === s.key ? 'bg-amber-warm text-white' : 'bg-paper-300 text-ink-300')}>
              <s.icon size={15} /> {s.label}
            </button>
          ))}
        </div>

        {/* Folder tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FOLDERS.map(f => (
            <button key={f.key} onClick={() => setFolder(f.key)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium flex-shrink-0 transition-colors',
                folder === f.key ? 'bg-ink text-white' : 'bg-paper-300 text-ink-300')}>
              <f.icon size={12} /> {f.label}
              {folder === f.key && all.length > 0 && (
                <span className="ml-0.5 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] leading-none">{all.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search articles…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-paper-300 text-sm font-sans text-ink placeholder:text-ink-300 outline-none" />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300"><X size={14} /></button>}
        </div>

        {/* List */}
        <AnimatePresence mode="popLayout">
          {articles.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <BookMarked size={36} className="mx-auto text-ink-300 mb-3" />
              <p className="font-sans font-semibold text-ink-300">
                {query ? 'No matching articles' : `No ${FOLDERS.find(f2 => f2.key === folder)?.label} items`}
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
              <ArticleCard article={a} onMove={async (id, f) => { await moveArticle(id, f); showToast(`Moved to ${FOLDERS.find(x => x.key === f)?.label}`, 'success') }} onDelete={async id => { await deleteArticle(id); showToast('Deleted', 'success') }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ---- Add modal ---- */}
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

              {/* Section picker */}
              <div className="flex gap-2">
                {SECTIONS.map(s => (
                  <button key={s.key} onClick={() => setFormSection(s.key)}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-sans transition-colors',
                      formSection === s.key ? 'bg-amber-warm text-white' : 'bg-paper-300 text-ink')}>
                    <s.icon size={14} /> {s.label}
                  </button>
                ))}
              </div>

              {/* Type picker */}
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

              {/* URL steps */}
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

              {/* PDF form */}
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
