'use client'
import { useState, useRef } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { exportAll, importAll } from '@/lib/utils/export'
import { useToast } from '@/app/contexts/ToastContext'
import { Download, Upload, AlertTriangle, FileJson, FileText } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { formatDisplay, toDateString } from '@/lib/utils/date'

export default function BackupPage() {
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmImport, setConfirmImport] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const settings = useLiveQuery(() => db.settings.get('singleton'))
  const lastBackup = settings?.lastBackupAt
    ? formatDisplay(toDateString(new Date(settings.lastBackupAt)))
    : 'Never'

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
    } catch (err) {
      showToast('Import failed — invalid file', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <PageHeader title="Backup & Export" />
      <div className="px-4 space-y-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <FileJson size={20} className="text-amber-warm flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-ink">Full Backup (JSON)</p>
              <p className="text-xs font-sans text-ink-300 mt-0.5">
                Export all data as a JSON file. Use this to restore your data or move to another device.
              </p>
              <p className="text-xs font-sans text-ink-200 mt-1">Last backup: {lastBackup}</p>
            </div>
          </div>
          <Button fullWidth onClick={handleExportJSON} disabled={loading === 'json'}>
            <Download size={16} /> {loading === 'json' ? 'Exporting…' : 'Export JSON Backup'}
          </Button>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Upload size={20} className="text-sage flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-ink">Restore from Backup</p>
              <p className="text-xs font-sans text-ink-300 mt-0.5">
                Import a JSON backup file. This will replace all current data.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 rounded-xl p-3">
            <AlertTriangle size={14} className="text-orange-500 flex-shrink-0" />
            <p className="text-xs font-sans text-orange-600">All existing data will be replaced.</p>
          </div>
          <Button variant="secondary" fullWidth onClick={() => fileRef.current?.click()} disabled={loading === 'import'}>
            <Upload size={16} /> {loading === 'import' ? 'Importing…' : 'Choose Backup File'}
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
        </Card>

        <div className="bg-paper-300 rounded-2xl p-4">
          <p className="text-xs font-sans text-ink-300 text-center leading-relaxed">
            Your data is stored entirely on this device. Regular backups protect against data loss if the app is removed or storage is cleared by iOS.
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
