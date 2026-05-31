'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/diary')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e0e0e]">
      <div className="w-8 h-8 rounded-full border-2 border-[#c4933f]/30 border-t-[#c4933f] animate-spin" />
    </div>
  )
}
