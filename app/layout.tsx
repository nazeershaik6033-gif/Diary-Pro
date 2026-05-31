import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { ToastProvider } from '@/app/contexts/ToastContext'
import { ToastContainer } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
  preload: true,
})

const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const metadata: Metadata = {
  title: 'My Journal',
  description: 'Your personal premium diary — journal, GTD, gym, and work log in one beautiful app.',
  manifest: `${bp}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'My Journal',
  },
  icons: {
    apple: [
      { url: `${bp}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
    ],
    icon: [
      { url: `${bp}/logo.svg`, type: 'image/svg+xml' },
      { url: `${bp}/icons/icon-192x192.png`, sizes: '192x192', type: 'image/png' },
      { url: `${bp}/icons/icon-512x512.png`, sizes: '512x512', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#C4933F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: `
          if('serviceWorker' in navigator){
            navigator.serviceWorker.getRegistrations().then(function(regs){
              regs.forEach(function(r){r.unregister()});
            });
            caches.keys().then(function(names){
              names.forEach(function(n){caches.delete(n)});
            });
          }
        `}} />
      </head>
      <body style={{ backgroundColor: '#0e0e0e', margin: 0 }}>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              {children}
              <ToastContainer />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
