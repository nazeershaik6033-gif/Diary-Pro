'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { updateArticle, moveArticle, addHighlight, deleteHighlight, updateHighlight } from '@/lib/db/articles'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, ExternalLink, Clock, CheckCircle2, Star, Inbox,
  Highlighter, Trash2, MessageSquare, X, ChevronDown,
  StickyNote, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useToast } from '@/app/contexts/ToastContext'
import type { ArticleFolder, HighlightColor } from '@/types'

const FOLDER_ACTIONS: { key: ArticleFolder; label: string; icon: React.ElementType }[] = [
  { key: 'to-read', label: 'To be Read',      icon: Inbox        },
  { key: 'read',    label: 'Mark as Read',     icon: CheckCircle2 },
  { key: 'review',  label: 'Mark for Review',  icon: Star         },
]

const HIGHLIGHT_COLORS: { key: HighlightColor; bg: string; border: string }[] = [
  { key: 'yellow', bg: 'bg-yellow-200',  border: 'border-yellow-400' },
  { key: 'green',  bg: 'bg-green-200',   border: 'border-green-400'  },
  { key: 'blue',   bg: 'bg-blue-200',    border: 'border-blue-400'   },
  { key: 'pink',   bg: 'bg-pink-200',    border: 'border-pink-400'   },
]

const COLOR_CLASS: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-200',
  green:  'bg-green-200',
  blue:   'bg-blue-200',
  pink:   'bg-pink-200',
}

function PdfViewer({ article }: { article: import('@/types').Article }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (article.pdfBlob) {
      const url = URL.createObjectURL(article.pdfBlob)
      setBlobUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [article.pdfBlob])

  const src = blobUrl || article.url || null

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 110px)' }}>
      {src ? (
        <>
          <embed src={src} type="application/pdf" className="flex-1 w-full" />
          <div className="px-4 py-2 border-t border-paper-200 bg-white flex items-center gap-3">
            <FileText size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-xs font-sans text-ink-300 truncate flex-1">{article.title}</p>
            {article.url && (
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xs font-sans text-amber-dark flex items-center gap-1">
                <ExternalLink size={12} /> Open
              </a>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <FileText size={48} className="text-red-300" />
          <p className="font-sans text-ink-300 text-center text-sm">PDF not available</p>
        </div>
      )}
    </div>
  )
}

function ReaderInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const id = Number(searchParams.get('id'))

  const article = useLiveQuery(() => (id ? db.articles.get(id) : undefined), [id])
  const highlights = useLiveQuery(
    () => (id ? db.articleHighlights.where('articleId').equals(id).sortBy('createdAt') : []),
    [id],
  ) ?? []

  const [highlightPanel, setHighlightPanel] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [highlightToolbar, setHighlightToolbar] = useState<{ x: number; y: number } | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingNoteDraft, setEditingNoteDraft] = useState('')

  useEffect(() => {
    if (article?.notes !== undefined) setNoteDraft(article.notes ?? '')
  }, [article?.notes])

  function handleTextSelection() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelectedText('')
      setHighlightToolbar(null)
      return
    }
    const text = sel.toString().trim()
    if (text.length < 5) return
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    setSelectedText(text)
    setHighlightToolbar({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 60 })
  }

  async function handleHighlight(color: HighlightColor) {
    if (!selectedText || !id) return
    await addHighlight({ articleId: id, text: selectedText, color })
    showToast('Highlight saved', 'success')
    setSelectedText('')
    setHighlightToolbar(null)
    window.getSelection()?.removeAllRanges()
    setHighlightPanel(true)
  }

  async function handleMoveFolder(folder: ArticleFolder) {
    if (!id) return
    await moveArticle(id, folder)
    showToast(`Moved to ${FOLDER_ACTIONS.find(a => a.key === folder)?.label}`, 'success')
  }

  async function saveNotes() {
    if (!id) return
    await updateArticle(id, { notes: noteDraft })
    showToast('Notes saved', 'success')
    setNotesOpen(false)
  }

  async function handleDeleteHighlight(hid: number) {
    await deleteHighlight(hid)
    showToast('Highlight removed', 'success')
  }

  async function handleSaveHighlightNote(hid: number) {
    await updateHighlight(hid, { note: editingNoteDraft })
    setEditingNoteId(null)
    showToast('Note saved', 'success')
  }

  if (!id || article === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-paper-300 border-t-amber-warm animate-spin" />
      </div>
    )
  }

  if (!article) {
    router.replace('/articles')
    return null
  }

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#faf8f3]/95 backdrop-blur-sm border-b border-paper-300 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-paper-300 text-ink">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-sans text-ink-300 truncate">
            {article.type === 'pdf'
              ? (article.url ? (() => { try { return new URL(article.url).hostname } catch { return 'PDF' } })() : 'Local PDF')
              : (article.siteName || (() => { try { return new URL(article.url).hostname } catch { return article.url } })())}
          </p>
        </div>
        {article.url && (
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-xl hover:bg-paper-300 text-ink-300">
            <ExternalLink size={18} />
          </a>
        )}
        <button
          onClick={() => setHighlightPanel(v => !v)}
          className={cn('p-1.5 rounded-xl text-ink-300 hover:bg-paper-300', highlightPanel && 'bg-yellow-100 text-yellow-600')}
        >
          <Highlighter size={18} />
        </button>
        <button
          onClick={() => setNotesOpen(v => !v)}
          className={cn('p-1.5 rounded-xl text-ink-300 hover:bg-paper-300', notesOpen && 'bg-amber-faint text-amber-dark')}
        >
          <StickyNote size={18} />
        </button>
      </div>

      {/* Folder action bar */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-paper-200 bg-white">
        {FOLDER_ACTIONS.map(a => (
          <button
            key={a.key}
            onClick={() => handleMoveFolder(a.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium flex-shrink-0 transition-colors border',
              article.folder === a.key
                ? 'bg-amber-warm border-amber-warm text-white'
                : 'bg-white border-paper-300 text-ink-300 hover:border-amber-warm hover:text-amber-dark',
            )}
          >
            <a.icon size={12} />
            {a.label}
          </button>
        ))}
      </div>

      {/* Article / PDF content */}
      {article.type === 'pdf' ? (
        <PdfViewer article={article} />
      ) : (
        <div className="max-w-2xl mx-auto px-5 py-8">
          <h1 className="font-serif font-bold text-ink text-2xl leading-snug mb-3">{article.title}</h1>

          <div className="flex items-center gap-3 text-xs text-ink-300 font-sans mb-6 flex-wrap">
            <span className="font-medium text-ink-300">
              {article.siteName || (() => { try { return new URL(article.url).hostname } catch { return '' } })()}
            </span>
            {article.estimatedReadTime && (
              <span className="flex items-center gap-1">
                <Clock size={11} /> {article.estimatedReadTime} min read
              </span>
            )}
            {article.tags.length > 0 && article.tags.map(t => (
              <span key={t} className="bg-paper-300 px-2 py-0.5 rounded-full text-[11px]">{t}</span>
            ))}
          </div>

          {article.content ? (
            <div
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
              className={cn(
                'prose prose-sm max-w-none font-sans text-ink',
                'prose-headings:font-serif prose-headings:text-ink',
                'prose-p:leading-relaxed prose-p:text-[15px]',
                'prose-a:text-amber-dark prose-a:no-underline hover:prose-a:underline',
                'prose-img:rounded-xl prose-img:shadow-warm-sm',
                'prose-blockquote:border-l-amber-warm prose-blockquote:text-ink-300',
              )}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="text-center py-16 space-y-4">
              <p className="text-ink-300 font-sans text-sm">
                Article content couldn't be extracted. Read it in your browser.
              </p>
              <a href={article.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-warm text-white font-sans text-sm font-semibold">
                <ExternalLink size={15} /> Open in Browser
              </a>
            </div>
          )}
        </div>
      )}

      {/* Floating highlight toolbar */}
      {highlightToolbar && selectedText && (
        <div
          className="fixed z-50 flex items-center gap-1 bg-ink rounded-2xl shadow-lg px-3 py-2"
          style={{ left: Math.max(8, highlightToolbar.x - 80), top: highlightToolbar.y }}
        >
          <Highlighter size={12} className="text-white mr-1" />
          {HIGHLIGHT_COLORS.map(c => (
            <button
              key={c.key}
              onClick={() => handleHighlight(c.key)}
              className={cn('w-5 h-5 rounded-full border-2', c.bg, c.border)}
            />
          ))}
          <button onClick={() => { setSelectedText(''); setHighlightToolbar(null) }} className="ml-1 text-white/60">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Highlights panel */}
      {highlightPanel && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[220px] bg-white border-t border-paper-300 z-30 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-paper-200 sticky top-0 bg-white">
            <p className="font-sans font-semibold text-sm text-ink flex items-center gap-2">
              <Highlighter size={15} className="text-yellow-500" />
              Highlights ({highlights.length})
            </p>
            <button onClick={() => setHighlightPanel(false)} className="text-ink-300">
              <ChevronDown size={18} />
            </button>
          </div>
          {highlights.length === 0 ? (
            <p className="text-xs text-ink-300 font-sans text-center py-8">
              Select text in the article to highlight it
            </p>
          ) : (
            <div className="p-4 space-y-3">
              {highlights.map(h => (
                <div key={h.id} className={cn('rounded-xl p-3 space-y-2', COLOR_CLASS[h.color])}>
                  <p className="font-sans text-sm text-ink leading-relaxed">"{h.text}"</p>
                  {editingNoteId === h.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingNoteDraft}
                        onChange={e => setEditingNoteDraft(e.target.value)}
                        rows={2}
                        placeholder="Add a note…"
                        className="w-full px-3 py-2 rounded-lg bg-white/80 text-xs font-sans outline-none resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveHighlightNote(h.id!)}
                          className="px-3 py-1 rounded-lg bg-ink text-white text-xs font-sans"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 rounded-lg text-ink-300 text-xs font-sans"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    h.note && <p className="text-xs text-ink-300 font-sans italic">{h.note}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingNoteId(h.id!); setEditingNoteDraft(h.note ?? '') }}
                      className="flex items-center gap-1 text-xs text-ink-300 font-sans"
                    >
                      <MessageSquare size={11} /> {h.note ? 'Edit note' : 'Add note'}
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => handleDeleteHighlight(h.id!)} className="text-ink-300">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes panel */}
      {notesOpen && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[220px] bg-white border-t border-paper-300 z-30">
          <div className="flex items-center justify-between px-4 py-3 border-b border-paper-200">
            <p className="font-sans font-semibold text-sm text-ink flex items-center gap-2">
              <StickyNote size={15} className="text-amber-dark" />
              My Notes
            </p>
            <button onClick={() => setNotesOpen(false)} className="text-ink-300">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <textarea
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              rows={5}
              placeholder="Write your thoughts, key takeaways, or action items…"
              className="w-full px-4 py-3 rounded-xl border border-paper-300 bg-paper text-sm font-sans text-ink outline-none focus:border-amber-warm resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setNotesOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-paper-300 text-sm font-sans text-ink"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="flex-1 py-2.5 rounded-2xl bg-amber-warm text-white font-sans font-semibold text-sm"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ArticleReaderPage() {
  return (
    <Suspense>
      <ReaderInner />
    </Suspense>
  )
}
