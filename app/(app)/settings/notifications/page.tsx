'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { useToast } from '@/app/contexts/ToastContext'
import { Bell, BellOff, Smartphone } from 'lucide-react'
import { useState, useEffect } from 'react'

function ToggleRow({
  label, description, enabled, time, onToggle, onTimeChange
}: {
  label: string
  description: string
  enabled: boolean
  time: string
  onToggle: (v: boolean) => void
  onTimeChange: (t: string) => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans font-medium text-ink">{label}</p>
          <p className="text-xs font-sans text-ink-300 mt-0.5">{description}</p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-amber-warm' : 'bg-paper-400'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>
      {enabled && (
        <input
          type="time"
          value={time}
          onChange={e => onTimeChange(e.target.value)}
          className="w-full rounded-xl border border-paper-400 px-4 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm"
        />
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const { showToast } = useToast()
  const { requestPermission, isGranted } = useNotifications()
  const [permGranted, setPermGranted] = useState(false)

  useEffect(() => {
    setPermGranted(isGranted())
  }, [isGranted])
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  const notifs = settings?.notifications ?? {
    diaryPromptEnabled: false, diaryPromptTime: '21:00',
    gtdReviewEnabled: false, gtdReviewTime: '09:00',
    workoutEnabled: false, workoutTime: '07:00',
  }

  const update = async (patch: Partial<typeof notifs>) => {
    await db.settings.update('singleton', { notifications: { ...notifs, ...patch } })
  }

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    setPermGranted(granted)
    if (!granted) showToast('Permission denied. Enable notifications in iOS Settings.', 'error')
  }

  const isInstalled = typeof window !== 'undefined' && (window.navigator as unknown as { standalone?: boolean }).standalone

  return (
    <div>
      <PageHeader title="Notifications" />
      <div className="px-4 space-y-4">
        {!permGranted && (
          <div className="bg-amber-faint border border-amber-warm/30 rounded-2xl p-4">
            {!isInstalled && (
              <div className="flex gap-2 mb-3">
                <Smartphone size={16} className="text-amber-dark flex-shrink-0 mt-0.5" />
                <p className="text-sm font-sans text-amber-dark">
                  Add Diary Pro to your Home Screen first, then enable notifications for them to work on iOS.
                </p>
              </div>
            )}
            <Button fullWidth onClick={handleRequestPermission}>
              <Bell size={16} /> Enable Notifications
            </Button>
          </div>
        )}

        {permGranted && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            <Bell size={14} className="text-green-600" />
            <span className="text-sm font-sans text-green-700">Notifications enabled</span>
          </div>
        )}

        <ToggleRow
          label="Daily Diary Prompt"
          description="Remind me to write in my diary"
          enabled={notifs.diaryPromptEnabled}
          time={notifs.diaryPromptTime}
          onToggle={v => update({ diaryPromptEnabled: v })}
          onTimeChange={t => update({ diaryPromptTime: t })}
        />

        <ToggleRow
          label="GTD Review Reminder"
          description="Process your GTD inbox"
          enabled={notifs.gtdReviewEnabled}
          time={notifs.gtdReviewTime}
          onToggle={v => update({ gtdReviewEnabled: v })}
          onTimeChange={t => update({ gtdReviewTime: t })}
        />

        <ToggleRow
          label="Workout Reminder"
          description="Time to hit the gym"
          enabled={notifs.workoutEnabled}
          time={notifs.workoutTime}
          onToggle={v => update({ workoutEnabled: v })}
          onTimeChange={t => update({ workoutTime: t })}
        />
      </div>
    </div>
  )
}
