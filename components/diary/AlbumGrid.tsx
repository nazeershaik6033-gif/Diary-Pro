'use client'

import { useRef, useState } from 'react'
import { X, Mic, Play, Pause } from 'lucide-react'
import type { DiaryAsset } from '@/types/diary'
import { cn } from '@/lib/utils/cn'

interface AlbumGridProps {
  assets: DiaryAsset[]
  onDelete?: (id: number) => void
  editable?: boolean
}

// ---- Audio player card ----
function AudioCard({
  asset,
  onDelete,
  editable,
}: {
  asset: DiaryAsset
  onDelete?: (id: number) => void
  editable?: boolean
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      el.play()
    }
  }

  const formatDuration = (secs?: number) => {
    if (!secs) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative flex-shrink-0 flex items-center gap-3 bg-white border border-paper-300 rounded-2xl shadow-warm-sm px-4 py-3 min-w-[180px]">
      {/* Waveform icon */}
      <Mic size={18} className="text-amber-warm flex-shrink-0" />

      {/* Duration */}
      <span className="text-xs font-sans text-ink-300 flex-shrink-0">
        {formatDuration(asset.duration)}
      </span>

      {/* Play/Pause button */}
      <button
        type="button"
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-amber-warm flex items-center justify-center text-white flex-shrink-0 active:scale-[0.99] transition-all"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>

      <audio
        ref={audioRef}
        src={asset.data}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />

      {editable && asset.id !== undefined && onDelete && (
        <button
          type="button"
          aria-label="Delete audio"
          onClick={() => onDelete(asset.id!)}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-warm-sm"
        >
          <X size={10} className="text-white" />
        </button>
      )}
    </div>
  )
}

// ---- Photo with lightbox ----
function PhotoItem({
  asset,
  onDelete,
  editable,
}: {
  asset: DiaryAsset
  onDelete?: (id: number) => void
  editable?: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden bg-paper-300 aspect-square">
        <img
          src={asset.data}
          alt=""
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setExpanded(true)}
        />
        {editable && asset.id !== undefined && onDelete && (
          <button
            type="button"
            aria-label="Delete photo"
            onClick={() => onDelete(asset.id!)}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-ink/60 rounded-full flex items-center justify-center"
          >
            <X size={12} className="text-white" />
          </button>
        )}
      </div>

      {/* Lightbox overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <img
            src={asset.data}
            alt=""
            className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
      )}
    </>
  )
}

export function AlbumGrid({ assets, onDelete, editable = false }: AlbumGridProps) {
  const photos = assets.filter(a => a.type === 'photo')
  const audios = assets.filter(a => a.type === 'audio')

  if (assets.length === 0) return null

  const photoCols = photos.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className="flex flex-col gap-4">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className={cn('grid gap-2', photoCols)}>
          {photos.map(asset => (
            <PhotoItem
              key={asset.id ?? asset.order}
              asset={asset}
              onDelete={onDelete}
              editable={editable}
            />
          ))}
        </div>
      )}

      {/* Audio scroll row */}
      {audios.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {audios.map(asset => (
            <AudioCard
              key={asset.id ?? asset.order}
              asset={asset}
              onDelete={onDelete}
              editable={editable}
            />
          ))}
        </div>
      )}
    </div>
  )
}
