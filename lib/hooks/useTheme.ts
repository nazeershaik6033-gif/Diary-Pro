'use client'
import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export function useTheme() {
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', settings?.theme ?? 'warm')
    html.setAttribute('data-font', settings?.fontStyle ?? 'sans')
    html.setAttribute('data-fontsize', settings?.fontSize ?? 'md')
  }, [settings?.theme, settings?.fontStyle, settings?.fontSize])
}
