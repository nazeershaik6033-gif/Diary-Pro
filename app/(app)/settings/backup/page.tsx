'use client'
import { useState, useRef } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { exportAll, importAll, exportAllAsMarkdown, exportByDuration, type ExportDuration } from '@/lib/utils/export'
import { useToast } from '@/app/contexts/ToastContext'
import { Download, Upload, AlertTriangle, FileJson, FileDown, Clock } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { formatDisplay, toDateString, format } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'

const DURATIONS: { value: ExportDuration; label: string }[] = [
  { value: 'weekly',      label: 'Weekly' },
  { value: 'monthly',     label: 'Monthly' },
  { value: 'quarterly',   label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half-yearly' },
  { value: 'yearly',      label: 'Yearly' },
]

export default function BackupPage() {
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmImport, setConfirmImport] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<ExportDuration>('monthly')

  const settings = useLiveQuery(() => db.settings.get('singleton'))
  const lastBackup = settings?.lastBackupAt
    ? formatDisplay(toDateString(new Date(settings.lastBackupAt)))
    : 'Never'

  const handleMarkdownExport = async () => {
    setLoading('markdown')
    try {
      const files = await exportAllAsMarkdown()
      if (!files.length) { showToast('No entries to export', 'error'); return }
      const combined = files.map(f => `# ${f.filename}\n\n${f.content}`).join('\n\n---\n\n')
      const blob = new Blob([combined], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diary-pro-export-${format(new Date(), 'yyyy-MM-dd')}.md`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Markdown exported')
    } catch {
      showToast('Markdown export failed', 'error')
    } finally {
      setLoading(null)
    }
  }

  const handleExportJSON = async () => {
    setLoading('json')
    try {
      await exportAll()
      showToast('Backup downloaded')
    } catch {
      showToast('Export failed', 'error')
    } finally {
      setLoading(null)
    }
  }

  const handleDurationExport = async (fmt: 'json' | 'markdown') => {
    const key = `dur-${fmt}`
    setLoading(key)
    try {
      await exportByDuration(selectedDuration, fmt)
      showToast(`${selectedDuration} export downloaded`)
    } catch {
      showToast('Export failed', 'error')
    } finally {
      setLoading(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setConfirmImport(true)
    e.target.value = ''
  }

  const handleImport = async () => {
    if (!pendingFile) return
    setLoading('import')
    try {
      await importAll(pendingFile)
      showToast('Data imported successfully')
      setPendingFile(null)
    } catch {
      showToast('Import failed — invalid file', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <PageHeader title="Backup & Export" />
      <div className="px-4 space-y-4">

        {/* Duration export */}
        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-violet-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-ink">Export by Duration</p>
              <p className="text-xs font-sans text-ink-300 mt-0.5">Download a filtered snapshot of your data.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => setSelectedDuration(d.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors',
                  selectedDuration === d.value
                    ? 'bg-amber-warm text-white'
                    : 'bg-paper-300 text-ink-300 hover:bg-paper-400'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" fullWidth onClick={() => handleDurationExport('json')} disabled={!!loading}>
              <FileJson size={14} />{loading === 'dur-json' ? 'Exporting…' : 'JSON'}
            </Button>
            <Button variant="secondary" fullWidth onClick={() => handleDurationExport('markdown')} disabled={!!loading}>
              <FileDown size={14} />{loading === 'dur-markdown' ? 'Exporting…' : 'Markdown'}
            </Button>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <FileJson size={20} className="text-amber-warm flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-ink">Full Backup (JSON)</p>
              <p className="text-xs font-sans text-ink-300 mt-0.5">Export all data. Use this to restore or move to another device.</p>
              <p className="text-xs font-sans text-ink-200 mt-1">Last backup: {lastBackup}</p>
            </div>
          </div>
          <Button fullWidth onClick={handleExportJSON} disabled={loading === 'json'}>
            <Download size={16} />{loading === 'json' ? 'Exporting…' : 'Export JSON Backup'}
          </Button>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <FileDown size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-ink">Export as Markdown</p>
              <p className="text-xs font-sans text-ink-300 mt-0.5">All diary entries as a .md file. Great for Obsidian, Notion, or other tools.</p>
            </div>
          </div>
          <Button fullWidth onClick={handleMarkdownExport} disabled={loading === 'markdown'}>
            <FileDown size={16} />{loading === 'markdown' ? 'Exporting…' : 'Export Markdown'}
          </Button>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Upload size={20} className="text-sage flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-ink">Restore from Backup</p>
              <p className="text-xs font-sans text-ink-300 mt-0.5">Import a JSON backup file. This will replace all current data.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 rounded-xl p-3">
            <AlertTriangle size={14} className="text-orange-500 flex-shrink-0" />
            <p className="text-xs font-sans text-orange-600">All existing data will be replaced.</p>
          </div>
          <Button variant="secondary" fullWidth onClick={() => fileRef.current?.click()} disabled={loading === 'import'}>
            <Upload size={16} />{loading === 'import' ? 'Importing…' : 'Choose Backup File'}
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
        </Card>

        <div className="bg-paper-300 rounded-2xl p-4">
          <p className="text-xs font-sans text-ink-300 text-center leading-relaxed">
            Your data is stored entirely on this device. Regular backups protect against data loss if the app is removed or storage is cleared.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmImport}
        onClose={() => { setConfirmImport(false); setPendingFile(null) }}
        onConfirm={handleImport}
        title="Restore Backup"
        message={`This will replace ALL your current data with the contents of "${pendingFile?.name}". This cannot be undone.`}
        confirmLabel="Restore"
        danger
      />
    </div>
  )
}
