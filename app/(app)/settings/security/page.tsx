'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { PINPad } from '@/components/shared/PINPad'
import { usePIN } from '@/lib/hooks/usePIN'
import { useToast } from '@/app/contexts/ToastContext'
import { Shield, ShieldOff, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Security questions list ──────────────────────────────────────────────────
const SECURITY_QUESTIONS = [
  "What city were you born in?",
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What was your childhood nickname?",
  "What street did you grow up on?",
  "What was the make of your first car?",
  "What is the name of your favorite childhood friend?",
  "In what city did your parents meet?",
  "What was your high school mascot?",
]

// ─── SHA-256 hash helper ──────────────────────────────────────────────────────
async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

type Step = 'overview' | 'setup-enter' | 'setup-confirm'

export default function SecurityPage() {
  const { showToast } = useToast()
  const { setupPIN, removePIN } = usePIN()
  const [step, setStep] = useState<Step>('overview')
  const [firstPIN, setFirstPIN] = useState('')
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  // Security questions state
  const [q1Index, setQ1Index] = useState(0)
  const [q2Index, setQ2Index] = useState(1)
  const [a1, setA1] = useState('')
  const [a2, setA2] = useState('')
  const [savingQuestions, setSavingQuestions] = useState(false)

  const pinEnabled = settings?.pinEnabled ?? false
  const savedQuestions = settings?.securityQuestions

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

  const handleSaveQuestions = async () => {
    if (!a1.trim() || !a2.trim()) {
      showToast('Please answer both questions', 'error')
      return
    }
    if (q1Index === q2Index) {
      showToast('Please choose two different questions', 'error')
      return
    }
    setSavingQuestions(true)
    try {
      const [hash1, hash2] = await Promise.all([sha256Hex(a1), sha256Hex(a2)])
      await db.settings.update('singleton', {
        securityQuestions: [
          { questionIndex: q1Index, answerHash: hash1 },
          { questionIndex: q2Index, answerHash: hash2 },
        ],
      })
      setA1('')
      setA2('')
      showToast('Recovery questions saved')
    } finally {
      setSavingQuestions(false)
    }
  }

  return (
    <div>
      <PageHeader title="Security & PIN" />
      <div className="px-4 pb-8">
        <AnimatePresence mode="wait">
          {step === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* PIN status card */}
              <div className="space-y-4">
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
              </div>

              {/* Security Questions — only shown when PIN is enabled */}
              <AnimatePresence>
                {pinEnabled && (
                  <motion.div
                    key="security-questions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle size={18} className="text-amber-warm shrink-0" />
                      <div>
                        <p className="font-serif font-semibold text-ink text-base">Recovery Questions</p>
                        <p className="text-xs font-sans text-ink-300 mt-0.5">
                          {savedQuestions?.length
                            ? 'Questions saved. Re-enter answers to update them.'
                            : 'Set questions to recover access if you forget your PIN.'}
                        </p>
                      </div>
                    </div>

                    {/* Question 1 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-sans font-medium text-ink-300 uppercase tracking-wide">
                        Question 1
                      </label>
                      <select
                        value={q1Index}
                        onChange={e => setQ1Index(Number(e.target.value))}
                        className="w-full text-[16px] font-sans text-ink bg-paper-300 rounded-xl px-3 py-2.5 border border-paper-400 focus:outline-none focus:ring-2 focus:ring-amber-warm/40"
                      >
                        {SECURITY_QUESTIONS.map((q, i) => (
                          <option key={i} value={i}>{q}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={a1}
                        onChange={e => setA1(e.target.value)}
                        placeholder="Your answer"
                        className="w-full text-[16px] font-sans text-ink bg-paper-300 rounded-xl px-3 py-2.5 border border-paper-400 focus:outline-none focus:ring-2 focus:ring-amber-warm/40 placeholder:text-ink-200"
                        autoComplete="off"
                      />
                    </div>

                    {/* Question 2 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-sans font-medium text-ink-300 uppercase tracking-wide">
                        Question 2
                      </label>
                      <select
                        value={q2Index}
                        onChange={e => setQ2Index(Number(e.target.value))}
                        className="w-full text-[16px] font-sans text-ink bg-paper-300 rounded-xl px-3 py-2.5 border border-paper-400 focus:outline-none focus:ring-2 focus:ring-amber-warm/40"
                      >
                        {SECURITY_QUESTIONS.map((q, i) => (
                          <option key={i} value={i}>{q}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={a2}
                        onChange={e => setA2(e.target.value)}
                        placeholder="Your answer"
                        className="w-full text-[16px] font-sans text-ink bg-paper-300 rounded-xl px-3 py-2.5 border border-paper-400 focus:outline-none focus:ring-2 focus:ring-amber-warm/40 placeholder:text-ink-200"
                        autoComplete="off"
                      />
                    </div>

                    <Button
                      fullWidth
                      onClick={handleSaveQuestions}
                      disabled={savingQuestions || !a1.trim() || !a2.trim()}
                    >
                      {savingQuestions ? 'Saving…' : 'Save Questions'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
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
