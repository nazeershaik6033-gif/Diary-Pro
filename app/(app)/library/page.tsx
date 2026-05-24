'use client'
import { Suspense, useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { format } from 'date-fns'
import Link from 'next/link'
import { Image as ImageIcon, Mic, Play, Pause, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DiaryAsset, DiaryEntry } from '@/types'

// ─── Fullscreen photo viewer with pinch/double-tap zoom ───────────────────────
function PhotoViewer({ asset, onClose }: { asset: DiaryAsset; onClose: () => void }) {
  const entry = useLiveQuery<DiaryEntry | undefined>(
    () => db.diaryEntries.get(asset.entryId),
    [asset.entryId]
  )
  const [scale, setScale] = useState(1)
  const lastTapRef = useRef(0)
  const lastDistRef = useRef<number | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      lastDistRef.current = Math.hypot(dx, dy)
    } else if (e.touches.length === 1) {
      const now = Date.now()
      if (now - lastTapRef.current < 280) {
        // Double-tap: toggle zoom
        setScale(s => (s > 1 ? 1 : 2.5))
      }
      lastTapRef.current = now
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 2 || lastDistRef.current == null) return
    e.preventDefault()
    const dx = e.touches[1].clientX - e.touches[0].clientX
    const dy = e.touches[1].clientY - e.touches[0].clientY
    const dist = Math.hypot(dx, dy)
    const delta = dist / lastDistRef.current
    setScale(s => Math.min(5, Math.max(1, s * delta)))
    lastDistRef.current = dist
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) lastDistRef.current = null
    if (scale < 1.1) setScale(1)
  }

  const dateLabel = entry
    ? format(new Date(entry.date + 'T00:00:00'), 'MMMM d, yyyy')
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imgRef}
          src={asset.data}
          alt={dateLabel ?? ''}
          draggable={false}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `scale(${scale})`,
            transition: scale === 1 ? 'transform 0.25s ease' : 'none',
            touchAction: scale > 1 ? 'none' : 'pan-y',
          }}
        />
      </div>

      {/* Bottom bar */}
      <div className="px-5 pt-3 pb-8 bg-gradient-to-t from-black/70 to-transparent">
        {dateLabel && (
          <p className="text-white/60 text-xs font-sans mb-2">{dateLabel}</p>
        )}
        {entry && (
          <Link
            href={`/diary/entry?date=${entry.date}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-amber-400 text-sm font-sans font-medium"
          >
            View diary entry →
          </Link>
        )}
      </div>
    </motion.div>
  )
}

// ─── Duration formatter MM:SS ─────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Photo tile: tapping opens the fullscreen viewer ─────────────────────────
function PhotoTile({ asset, onOpen }: { asset: DiaryAsset; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="block w-full text-left">
      <div className="aspect-square relative rounded-xl overflow-hidden bg-paper-300">
        <img
          src={asset.data}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </button>
  )
}

// ─── Audio card: uses HTML5 <audio> ──────────────────────────────────────────
function AudioCard({ asset, index }: { asset: DiaryAsset; index: number }) {
  const entry = useLiveQuery<DiaryEntry | undefined>(
    () => db.diaryEntries.get(asset.entryId),
    [asset.entryId]
  )
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play()
      setPlaying(true)
    }
  }

  const handleEnded = () => setPlaying(false)

  const dateLabel = entry
    ? format(new Date(entry.date + 'T00:00:00'), 'MMMM d, yyyy')
    : format(new Date(asset.createdAt), 'MMMM d, yyyy')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 flex items-center gap-4"
    >
      <button
        onClick={togglePlay}
        className="w-11 h-11 shrink-0 rounded-full bg-amber-warm flex items-center justify-center text-white shadow-warm active:scale-95 transition-transform"
      >
        {playing ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-sans font-medium text-ink truncate">{dateLabel}</p>
        {asset.duration != null && (
          <p className="text-xs font-sans text-ink-300 mt-0.5">
            {formatDuration(asset.duration)}
          </p>
        )}
      </div>
      {entry && (
        <Link
          href={`/diary/entry?date=${entry.date}`}
          className="text-xs font-sans text-amber-warm hover:underline shrink-0"
        >
          View entry
        </Link>
      )}
      <audio
        ref={audioRef}
        src={asset.data}
        onEnded={handleEnded}
        preload="metadata"
        className="hidden"
      />
    </motion.div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
type Tab = 'photos' | 'voice'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex gap-1 bg-paper-300 rounded-2xl p-1 mx-4 mb-4">
      {(['photos', 'voice'] as Tab[]).map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={[
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-sans font-medium transition-all duration-150',
            active === tab
              ? 'bg-white text-ink shadow-warm-sm'
              : 'text-ink-300 hover:text-ink',
          ].join(' ')}
        >
          {tab === 'photos' ? <ImageIcon size={15} /> : <Mic size={15} />}
          {tab === 'photos' ? 'Photos' : 'Voice Notes'}
        </button>
      ))}
    </div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────
function LibraryContent() {
  const [activeTab, setActiveTab] = useState<Tab>('photos')
  const [viewingAsset, setViewingAsset] = useState<DiaryAsset | null>(null)

  const assets = useLiveQuery(() =>
    db.diaryAssets.orderBy('createdAt').reverse().toArray()
  )

  const isLoading = assets === undefined
  const photos = assets?.filter(a => a.type === 'photo') ?? []
  const voices = assets?.filter(a => a.type === 'audio') ?? []

  return (
    <div>
      <PageHeader title="Library" />
      <TabBar active={activeTab} onChange={setActiveTab} />

      <div className="px-4 pb-8">
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-warm border-t-transparent animate-spin" />
          </div>
        )}

        {/* Photos tab */}
        {!isLoading && activeTab === 'photos' && (
          <>
            {photos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <ImageIcon size={48} className="text-ink-200 mb-4" />
                <p className="font-serif font-semibold text-lg text-ink">No photos yet</p>
                <p className="text-sm font-sans text-ink-300 mt-1 max-w-xs">
                  Photos you add to diary entries will appear here.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((asset, i) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <PhotoTile asset={asset} onOpen={() => setViewingAsset(asset)} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Voice notes tab */}
        {!isLoading && activeTab === 'voice' && (
          <>
            {voices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <Mic size={48} className="text-ink-200 mb-4" />
                <p className="font-serif font-semibold text-lg text-ink">No voice notes yet</p>
                <p className="text-sm font-sans text-ink-300 mt-1 max-w-xs">
                  Voice recordings you add to diary entries will appear here.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {voices.map((asset, i) => (
                  <AudioCard key={asset.id} asset={asset} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Fullscreen photo viewer */}
      <AnimatePresence>
        {viewingAsset && (
          <PhotoViewer asset={viewingAsset} onClose={() => setViewingAsset(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Exported page ────────────────────────────────────────────────────────────
export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-amber-warm border-t-transparent animate-spin" />
      </div>
    }>
      <LibraryContent />
    </Suspense>
  )
}
