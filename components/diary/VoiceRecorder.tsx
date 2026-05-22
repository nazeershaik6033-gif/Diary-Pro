'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Play, Pause, Check, Trash2 } from 'lucide-react'
import type { DiaryAsset } from '@/types/diary'
import { cn } from '@/lib/utils/cn'

interface VoiceRecorderProps {
  onRecorded: (asset: Omit<DiaryAsset, 'id' | 'entryId'>) => void
}

type RecordState = 'idle' | 'recording' | 'processing' | 'done'

export function VoiceRecorder({ onRecorded }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const elapsedRef = useRef(0)

  // keep elapsed ref in sync
  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm'
      const mr = new MediaRecorder(stream, { mimeType })
      chunks.current = []

      mr.ondataavailable = e => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      mr.onstop = () => {
        setState('processing')
        const blob = new Blob(chunks.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setAudioSrc(url)

        const reader = new FileReader()
        reader.onload = () => {
          setState('done')
          // store data URL and duration for potential "Use" action
          ;(mr as any).__base64 = reader.result as string
          ;(mr as any).__mimeType = mimeType
        }
        reader.readAsDataURL(blob)

        stream.getTracks().forEach(t => t.stop())
      }

      mr.start(200)
      mediaRecorder.current = mr
      setElapsed(0)
      elapsedRef.current = 0
      setState('recording')

      timerRef.current = setInterval(() => {
        setElapsed(s => s + 1)
      }, 1000)
    } catch {
      // permission denied or not supported — stay idle
    }
  }

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop()
    }
  }

  const use = () => {
    const mr = mediaRecorder.current as any
    if (!mr || !mr.__base64) return
    onRecorded({
      data: mr.__base64,
      mimeType: mr.__mimeType,
      type: 'audio',
      duration: elapsedRef.current,
      order: 0,
      createdAt: Date.now(),
    })
    discard()
  }

  const discard = () => {
    if (audioSrc) URL.revokeObjectURL(audioSrc)
    setAudioSrc(null)
    setElapsed(0)
    setPlaying(false)
    setState('idle')
    mediaRecorder.current = null
    chunks.current = []
  }

  const togglePlayback = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      el.play()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* IDLE */}
      {state === 'idle' && (
        <button
          type="button"
          onClick={start}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-paper-300 hover:bg-paper-400 text-ink-300 font-sans text-sm font-medium transition-colors active:scale-[0.99]"
        >
          <Mic size={16} className="text-amber-warm" />
          <span>Record voice note</span>
        </button>
      )}

      {/* RECORDING */}
      {state === 'recording' && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200">
          {/* Animated red dot */}
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />

          {/* Timer */}
          <span className="font-sans font-medium text-sm text-red-600 tabular-nums">
            {formatTime(elapsed)}
          </span>

          {/* Stop button */}
          <button
            type="button"
            aria-label="Stop recording"
            onClick={stop}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-sm font-sans font-medium active:scale-[0.99] transition-all"
          >
            <Square size={12} />
            <span>Stop</span>
          </button>
        </div>
      )}

      {/* PROCESSING */}
      {state === 'processing' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-paper-300 text-ink-300 font-sans text-sm">
          <span className="animate-pulse">Processing…</span>
        </div>
      )}

      {/* DONE */}
      {state === 'done' && audioSrc && (
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-paper-300 bg-white shadow-warm-sm">
          {/* Playback row */}
          <div className="flex items-center gap-3">
            <Mic size={16} className="text-amber-warm flex-shrink-0" />
            <span className="text-xs font-sans text-ink-300 tabular-nums">
              {formatTime(elapsed)}
            </span>
            <button
              type="button"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-amber-warm flex items-center justify-center text-white flex-shrink-0 active:scale-[0.99] transition-all"
            >
              {playing ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <audio
              ref={audioRef}
              src={audioSrc}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              className="hidden"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={use}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl',
                'bg-amber-warm text-white text-sm font-sans font-medium active:scale-[0.99] transition-all'
              )}
            >
              <Check size={14} />
              <span>Use</span>
            </button>
            <button
              type="button"
              onClick={discard}
              className={cn(
                'flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl',
                'bg-paper-300 text-ink-300 text-sm font-sans font-medium active:scale-[0.99] transition-all hover:bg-paper-400'
              )}
            >
              <Trash2 size={14} />
              <span>Discard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
