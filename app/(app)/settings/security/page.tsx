'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { PINPad } from '@/components/shared/PINPad'
import { usePIN } from '@/lib/hooks/usePIN'
import { useToast } from '@/app/contexts/ToastContext'
import { Shield, ShieldOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'overview' | 'setup-enter' | 'setup-confirm'

export default function SecurityPage() {
  const { showToast } = useToast()
  const { setupPIN, removePIN } = usePIN()
  const [step, setStep] = useState<Step>('overview')
  const [firstPIN, setFirstPIN] = useState('')
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  const pinEnabled = settings?.pinEnabled ?? false

  const handleFirstPIN = (pin: string) => {
    setFirstPIN(pin)
    setStep('setup-confirm')
  }

  const handleConfirmPIN = async (pin: string) => {
    if (pin !== firstPIN) {
      showToast('PINs do not match', 'error')
      setStep('setup-enter')
      setFirstPIN('')
      return
    }
    await setupPIN(pin)
    showToast('PIN set successfully')
    setStep('overview')
  }

  const handleRemovePIN = async () => {
    await removePIN()
    showToast('PIN removed')
  }

  return (
    <div>
      <PageHeader title="Security & PIN" />
      <div className="px-4">
        <AnimatePresence mode="wait">
          {step === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex flex-col items-center py-8">
                <div className="w-20 h-20 rounded-full bg-amber-faint flex items-center justify-center mb-4">
                  {pinEnabled
                    ? <Shield size={36} className="text-amber-warm" />
                    : <ShieldOff size={36} className="text-ink-200" />
                  }
                </div>
                <p className="font-serif font-semibold text-xl text-ink">
                  {pinEnabled ? 'PIN Enabled' : 'PIN Disabled'}
                </p>
                <p className="text-sm font-sans text-ink-300 mt-1 text-center max-w-xs">
                  {pinEnabled
                    ? 'Your diary is protected. The app will lock when backgrounded.'
                    : 'Add a PIN to protect your private entries.'
                  }
                </p>
              </div>

              {pinEnabled ? (
                <div className="space-y-3">
                  <Button fullWidth onClick={() => { setStep('setup-enter'); setFirstPIN('') }}>
                    Change PIN
                  </Button>
                  <Button variant="secondary" fullWidth onClick={handleRemovePIN}>
                    Remove PIN
                  </Button>
                </div>
              ) : (
                <Button fullWidth onClick={() => setStep('setup-enter')}>
                  Set Up PIN
                </Button>
              )}
            </motion.div>
          )}

          {step === 'setup-enter' && (
            <motion.div key="enter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-4">
              <div className="text-center mb-8">
                <p className="font-serif font-semibold text-xl text-ink">Choose a PIN</p>
                <p className="text-sm font-sans text-ink-300 mt-1">Enter a 4-digit PIN</p>
              </div>
              <PINPad onComplete={handleFirstPIN} />
              <button onClick={() => setStep('overview')} className="w-full text-center text-sm font-sans text-ink-300 mt-6">
                Cancel
              </button>
            </motion.div>
          )}

          {step === 'setup-confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-4">
              <div className="text-center mb-8">
                <p className="font-serif font-semibold text-xl text-ink">Confirm PIN</p>
                <p className="text-sm font-sans text-ink-300 mt-1">Enter the same PIN again</p>
              </div>
              <PINPad onComplete={handleConfirmPIN} />
              <button onClick={() => setStep('setup-enter')} className="w-full text-center text-sm font-sans text-ink-300 mt-6">
                Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
