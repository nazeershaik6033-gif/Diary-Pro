'use client'
import { Suspense } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { useRouter } from 'next/navigation'
import { FileText, X, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DiaryTemplate } from '@/types'

// ─── Category badge colors ────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  reflection: 'bg-blue-50 text-blue-700',
  gratitude:  'bg-amber-50 text-amber-700',
  daily:      'bg-green-50 text-green-700',
  review:     'bg-purple-50 text-purple-700',
  goal:       'bg-orange-50 text-orange-700',
  travel:     'bg-sky-50 text-sky-700',
  custom:     'bg-paper-300 text-ink-300',
}

function categoryBadgeClass(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] ?? CATEGORY_COLORS.custom
}

// ─── Single template card ─────────────────────────────────────────────────────
function TemplateCard({
  template,
  index,
  onDelete,
}: {
  template: DiaryTemplate
  index: number
  onDelete?: () => void
}) {
  const router = useRouter()
  const badgeClass = categoryBadgeClass(template.category)
  const pageCount = template.pages?.length ?? 1

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 relative"
    >
      {/* Delete button for user-created templates */}
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label="Delete template"
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-ink-300 hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      )}

      <div className="flex items-start gap-3 pr-6">
        <div className="w-10 h-10 rounded-xl bg-amber-faint flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-amber-warm" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-ink text-base leading-snug">
            {template.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full capitalize ${badgeClass}`}>
              {template.category}
            </span>
            {pageCount > 1 && (
              <span className="text-xs font-sans text-ink-300 bg-paper-300 px-2 py-0.5 rounded-full">
                {pageCount} pages
              </span>
            )}
          </div>
          {template.description && (
            <p className="text-sm font-sans text-ink-300 mt-1.5 line-clamp-1">
              {template.description}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => router.push(`/diary/new?templateId=${template.id}`)}
        className="mt-3 w-full py-2 rounded-xl bg-amber-warm text-white text-sm font-sans font-medium hover:bg-amber-dark active:scale-[0.98] transition-all"
      >
        Use Template
      </button>
    </motion.div>
  )
}

// ─── Main page content ────────────────────────────────────────────────────────
function TemplatesContent() {
  const templates = useLiveQuery(() => db.diaryTemplates.toArray())

  const isLoading = templates === undefined
  const builtIn = templates?.filter(t => !t.isUserCreated) ?? []
  const userCreated = templates?.filter(t => t.isUserCreated) ?? []

  const handleDelete = async (id: number) => {
    if (confirm('Delete this template? This cannot be undone.')) {
      await db.diaryTemplates.delete(id)
    }
  }

  return (
    <div>
      <PageHeader title="Templates" />
      <div className="px-4 pb-8 space-y-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-warm border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Built-in Templates */}
            {builtIn.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif font-semibold text-base text-ink px-0.5">
                  Built-in Templates
                </h2>
                <AnimatePresence mode="popLayout">
                  {builtIn.map((t, i) => (
                    <TemplateCard key={t.id} template={t} index={i} />
                  ))}
                </AnimatePresence>
              </section>
            )}

            {/* My Templates */}
            <section className="space-y-3">
              <h2 className="font-serif font-semibold text-base text-ink px-0.5">
                My Templates
              </h2>
              {userCreated.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-2xl border border-paper-300"
                >
                  <FileText size={36} className="text-ink-200 mb-3" />
                  <p className="text-sm font-sans text-ink-300 max-w-[220px]">
                    Save an entry as a template to see it here
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {userCreated.map((t, i) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      index={i}
                      onDelete={() => handleDelete(t.id!)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Exported page ────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-amber-warm border-t-transparent animate-spin" />
        </div>
      }
    >
      <TemplatesContent />
    </Suspense>
  )
}
