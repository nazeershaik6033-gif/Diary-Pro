'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils/cn'
import type { AppTheme, FontStyle, FontSize } from '@/types/settings'

const THEMES: { id: AppTheme; label: string; bg: string; accent: string; text: string }[] = [
  { id: 'warm',     label: 'Warm',     bg: '#F5F0E8', accent: '#C4933F', text: '#2C1810' },
  { id: 'ocean',    label: 'Ocean',    bg: '#eef4f8', accent: '#2a8eb8', text: '#1a3a4a' },
  { id: 'forest',   label: 'Forest',   bg: '#eef2ec', accent: '#4a8a2a', text: '#1a2e1a' },
  { id: 'dark',     label: 'Dark',     bg: '#1a1a2e', accent: '#e6a84a', text: '#e6dcd2' },
  { id: 'midnight', label: 'Midnight', bg: '#0d1117', accent: '#a78bfa', text: '#e6ecf1' },
]

const FONTS: { id: FontStyle; label: string; className: string }[] = [
  { id: 'sans',  label: 'Sans-serif', className: 'font-sans' },
  { id: 'serif', label: 'Serif',      className: 'font-serif' },
  { id: 'mono',  label: 'Monospace',  className: 'font-mono' },
]

const SIZES: { id: FontSize; label: string; textClass: string }[] = [
  { id: 'sm', label: 'Small',   textClass: 'text-xs' },
  { id: 'md', label: 'Medium',  textClass: 'text-sm' },
  { id: 'lg', label: 'Large',   textClass: 'text-base' },
  { id: 'xl', label: 'X-Large', textClass: 'text-lg' },
]

export default function AppearancePage() {
  const settings = useLiveQuery(() => db.settings.get('singleton'))
  const theme = settings?.theme ?? 'warm'
  const fontStyle = settings?.fontStyle ?? 'sans'
  const fontSize = settings?.fontSize ?? 'md'

  const update = (patch: object) => db.settings.update('singleton', patch)

  return (
    <div>
      <PageHeader title="Appearance" showBack />
      <div className="px-4 space-y-6 pb-8">

        <div>
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-3">Theme</p>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => update({ theme: t.id })}
                className="flex flex-col items-center gap-1.5">
                <div
                  className={cn('w-full rounded-2xl border-2 transition-all overflow-hidden', theme === t.id ? 'border-amber-warm scale-105' : 'border-paper-400')}
                  style={{ backgroundColor: t.bg, aspectRatio: '1' }}
                >
                  <div className="w-full h-1/2 flex items-center justify-center pt-2">
                    <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: t.accent }} />
                  </div>
                  <div className="px-1.5 pb-1.5 space-y-0.5">
                    <div className="w-full h-1 rounded-full opacity-30" style={{ backgroundColor: t.text }} />
                    <div className="w-2/3 h-1 rounded-full opacity-20" style={{ backgroundColor: t.text }} />
                  </div>
                </div>
                <span className={cn('text-[10px] font-sans', theme === t.id ? 'text-amber-warm font-semibold' : 'text-ink-300')}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-3">Font Style</p>
          <div className="grid grid-cols-3 gap-2">
            {FONTS.map(f => (
              <button key={f.id} onClick={() => update({ fontStyle: f.id })}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border transition-colors',
                  fontStyle === f.id ? 'border-amber-warm bg-amber-faint' : 'border-paper-300 bg-white'
                )}>
                <span className={cn('text-2xl font-bold leading-none', f.className,
                  fontStyle === f.id ? 'text-amber-dark' : 'text-ink-300'
                )}>Aa</span>
                <span className={cn('text-xs font-sans', fontStyle === f.id ? 'text-amber-dark font-semibold' : 'text-ink-300')}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-3">Font Size</p>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map(s => (
              <button key={s.id} onClick={() => update({ fontSize: s.id })}
                className={cn(
                  'py-3 rounded-2xl border text-center transition-colors font-sans',
                  fontSize === s.id ? 'border-amber-warm bg-amber-faint text-amber-dark font-semibold' : 'border-paper-300 bg-white text-ink-300',
                  s.textClass
                )}>{s.label}</button>
            ))}
          </div>
          <p className="text-xs font-sans text-ink-300 mt-2 text-center">Font size change takes effect after reload</p>
        </div>
      </div>
    </div>
  )
}
