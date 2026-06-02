'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { captureInbox } from '@/lib/db/gtd'
import { useToast } from '@/app/contexts/ToastContext'

interface QuickCaptureModalProps {
  open: boolean
  onClose: () => void
}

export function QuickCaptureModal({ open, onClose }: QuickCaptureModalProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (!open) setText('')
  }, [open])

  const handleCapture = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      await captureInbox(text.trim())
      setText('')
      onClose()
      showToast('Captured to inbox')
    } catch {
      showToast('Failed to capture', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 relative"
        style={{
          background: '#1a1a1a',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          border: '1px solid #2a2a2a',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-semibold text-lg text-white">Quick Capture</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleCapture() }}
          placeholder="What's on your mind? Capture anything…"
          rows={4}
          className="w-full rounded-xl px-4 py-3 text-[16px] font-sans text-white placeholder:text-[#555] focus:outline-none resize-none mb-4"
          style={{
            background: '#111',
            border: '1px solid #2a2a2a',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
          }}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-sans font-medium text-sm text-[#999] transition-colors"
            style={{ background: '#252525', border: '1px solid #2a2a2a' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCapture}
            disabled={!text.trim() || loading}
            className="flex-1 py-2.5 rounded-xl font-sans font-medium text-sm text-white transition-all disabled:opacity-40"
            style={{ background: '#c4933f', boxShadow: '0 2px 8px rgba(196,147,63,0.35)' }}
          >
            {loading ? 'Saving…' : 'Capture'}
          </button>
        </div>
      </div>
    </div>
  )
}
