'use client'
import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
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

  return (
    <Sheet open={open} onClose={onClose} title="Quick Capture">
      <textarea
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleCapture() }}
        placeholder="What's on your mind? Capture anything…"
        rows={4}
        className="w-full rounded-xl border border-paper-400 bg-paper-50 px-4 py-3 text-[16px] font-sans text-ink placeholder:text-ink-200 focus:outline-none focus:ring-2 focus:ring-amber-warm resize-none mb-4"
      />
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
        <Button fullWidth onClick={handleCapture} disabled={!text.trim() || loading}>
          Capture
        </Button>
      </div>
    </Sheet>
  )
}
