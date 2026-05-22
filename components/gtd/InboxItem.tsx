'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Trash2, Clock } from 'lucide-react'
import type { GTDInboxItem } from '@/types'
import { timeAgo } from '@/lib/utils/date'
import { deleteInboxItem } from '@/lib/db/gtd'

interface InboxItemProps {
  item: GTDInboxItem
  onProcess: (item: GTDInboxItem) => void
}

export function InboxItem({ item, onProcess }: InboxItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4"
    >
      <p className="font-sans text-ink text-base mb-3 leading-relaxed">{item.content}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-ink-200">
          <Clock size={11} />
          <span className="text-xs font-sans">{timeAgo(item.createdAt)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => item.id && deleteInboxItem(item.id)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
          <button
            onClick={() => onProcess(item)}
            className="flex items-center gap-1.5 bg-amber-warm text-white text-sm font-sans font-medium px-3 py-1.5 rounded-xl hover:bg-amber-dark transition-colors"
          >
            Process <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
