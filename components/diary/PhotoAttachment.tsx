'use client'
import { useRef, useState } from 'react'
import { Camera, X, ImagePlus, ZoomIn } from 'lucide-react'

interface Photo {
  data: string
  mimeType: string
}

interface PhotoAttachmentProps {
  photos: Photo[]
  onChange: (photos: Photo[]) => void
}

export function PhotoAttachment({ photos, onChange }: PhotoAttachmentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    // Capture current photos snapshot; accumulate results from all readers
    const snapshot = [...photos]
    let loaded = 0
    const incoming: Photo[] = []

    fileArray.forEach((file, i) => {
      const reader = new FileReader()
      reader.onload = e => {
        incoming[i] = { data: e.target?.result as string, mimeType: file.type }
        loaded++
        if (loaded === fileArray.length) {
          // All files ready — merge with snapshot in original order
          onChange([...snapshot, ...incoming.filter(Boolean)])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const remove = (i: number) => {
    onChange(photos.filter((_, idx) => idx !== i))
  }

  return (
    <>
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Camera size={14} className="text-ink-300" />
          <span className="text-sm font-medium font-sans text-ink-400">Photos</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {photos.map((p, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-paper-300">
              <img
                src={p.data}
                alt=""
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightbox(p.data)}
              />
              {/* zoom hint */}
              <button
                type="button"
                onClick={() => setLightbox(p.data)}
                className="absolute bottom-1 left-1 w-5 h-5 bg-ink/50 rounded-full flex items-center justify-center"
              >
                <ZoomIn size={10} className="text-white" />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-ink/60 rounded-full flex items-center justify-center"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-paper-400 flex flex-col items-center justify-center gap-1 hover:border-amber-warm transition-colors"
          >
            <ImagePlus size={18} className="text-ink-200" />
            <span className="text-xs text-ink-200">Add</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => {
              handleFiles(e.target.files)
              // reset so same file can be re-selected
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <X size={18} className="text-white" />
          </button>
          {/* overflow-auto + large image lets iOS/Android handle native pinch-to-zoom */}
          <div className="overflow-auto w-full h-full flex items-center justify-center p-4">
            <img
              src={lightbox}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              onClick={e => e.stopPropagation()}
              style={{ touchAction: 'pinch-zoom' }}
            />
          </div>
        </div>
      )}
    </>
  )
}
