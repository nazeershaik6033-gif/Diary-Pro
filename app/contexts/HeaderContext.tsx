'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface HeaderCtx {
  rightSlot: ReactNode
  setRightSlot: (node: ReactNode) => void
}

const HeaderContext = createContext<HeaderCtx>({ rightSlot: null, setRightSlot: () => {} })

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [rightSlot, setRightSlot] = useState<ReactNode>(null)
  return (
    <HeaderContext.Provider value={{ rightSlot, setRightSlot }}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader() {
  return useContext(HeaderContext)
}
