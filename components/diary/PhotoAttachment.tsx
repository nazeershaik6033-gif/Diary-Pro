'use client'
import { useRef, useState } from 'react'
import { Camera, X, ImagePlus } from 'lucide-react'
import Image from 'next/image'

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

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const data = e.target?.result as string
        onChange([...photos, { data, mimeType: file.type }])
      }
      reader.readAsDataURL(file)
    })
  }

  const remove = (i: number) => {
    onChange(photos.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <Camera size={14} className="text-ink-300" />
        <span className="text-sm font-medium font-sans text-ink-400">Photos</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {photos.map((p, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-paper-300">
            <img src={p.data} alt="" className="w-full h-full object-cover" />
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
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
    </div>
  )
}
