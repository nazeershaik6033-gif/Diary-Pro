'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { ChevronRight, Lock, Bell, Download, Palette, LogOut, Sparkles, Eye, EyeOff, Check } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { formatDisplay, toDateString } from '@/lib/utils/date'
import { motion } from 'framer-motion'

const SETTINGS_LINKS = [
  { href: '/settings/appearance',    label: 'Appearance',      icon: Palette,  desc: 'Theme, font style and size' },
  { href: '/settings/security',      label: 'Security & PIN',  icon: Lock,     desc: 'Set up PIN lock' },
  { href: '/settings/notifications', label: 'Notifications',   icon: Bell,     desc: 'Reminders and prompts' },
  { href: '/settings/backup',        label: 'Backup & Export', icon: Download, desc: 'JSON and PDF export' },
]

function ApiKeySection() {
  const settings = useLiveQuery(() => db.settings.get('singleton'))
  const [keyInput, setKeyInput] = useState('')
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)

  const currentKey = settings?.anthropicApiKey ?? ''

  const handleSave = async () => {
    const trimmed = keyInput.trim()
    if (!trimmed) return
    await db.settings.update('singleton', { anthropicApiKey: trimmed })
    setKeyInput('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleRemove = async () => {
    await db.settings.update('singleton', { anthropicApiKey: '' })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-violet-500" />
        </div>
        <div>
          <p className="font-sans font-medium text-ink">AI Digest (Anthropic)</p>
          <p className="text-xs font-sans text-ink-300">Used for AI weekly summaries</p>
        </div>
      </div>

      {currentKey ? (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 border border-green-200 mb-3">
          <Check size={14} className="text-green-600 flex-shrink-0" />
          <span className="text-sm font-sans text-green-700 flex-1">API key saved</span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-sans text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      ) : null}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? 'text' : 'password'}
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder={currentKey ? 'Replace API key…' : 'sk-ant-api…'}
            className="w-full px-3 pr-9 py-2 rounded-xl border border-paper-400 bg-white text-sm font-sans text-ink focus:outline-none focus:border-amber-warm"
            style={{ fontSize: 16 }}
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-300"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!keyInput.trim()}
          className="px-4 py-2 rounded-xl bg-amber-warm text-white text-sm font-sans font-medium disabled:opacity-40 transition-opacity"
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
      <p className="text-xs font-sans text-ink-300 mt-2">
        Your key is stored only on this device.{' '}
        <a href="https://console.anthropic.com/keys" target="_blank" rel="noreferrer" className="text-amber-warm hover:underline">
          Get a key →
        </a>
      </p>
    </Card>
  )
}

export default function SettingsPage() {
  const { lock, pinEnabled } = useAuth()
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  const lastBackup = settings?.lastBackupAt
    ? formatDisplay(toDateString(new Date(settings.lastBackupAt)))
    : 'Never'

  return (
    <div className="px-4 pb-4">
      <div className="pt-2 pb-4">
        <h2 className="text-2xl font-serif font-bold text-ink">Settings</h2>
      </div>

      <div className="space-y-2 mb-6">
        {SETTINGS_LINKS.map((link, i) => (
          <motion.div key={link.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={link.href}>
              <Card className="p-4 flex items-center gap-3 hover:shadow-warm-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-paper-300 flex items-center justify-center flex-shrink-0">
                  <link.icon size={18} className="text-ink-400" />
                </div>
                <div className="flex-1">
                  <p className="font-sans font-medium text-ink">{link.label}</p>
                  <p className="text-xs font-sans text-ink-300">{link.desc}</p>
                </div>
                <ChevronRight size={16} className="text-ink-300" />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* AI section */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
        <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2">AI Features</p>
        <ApiKeySection />
      </motion.div>

      {pinEnabled && (
        <button
          onClick={lock}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-paper-300 hover:bg-paper-400 transition-colors"
        >
          <LogOut size={18} className="text-ink-400" />
          <span className="font-sans font-medium text-ink">Lock App</span>
        </button>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs font-sans text-ink-300">Diary Pro · v0.1.0</p>
        <p className="text-xs font-sans text-ink-300 mt-1">All data stored locally on your device</p>
        <p className="text-xs font-sans text-ink-300 mt-0.5">Last backup: {lastBackup}</p>
      </div>
    </div>
  )
}
