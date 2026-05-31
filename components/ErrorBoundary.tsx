'use client'
import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#0e0e0e', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif' }}>
          <p style={{ color: '#c4933f', fontSize: '16px', marginBottom: '8px' }}>Something went wrong</p>
          <p style={{ color: '#666', fontSize: '12px', textAlign: 'center', maxWidth: '280px' }}>{this.state.error.message}</p>
          <button
            onClick={() => { caches.keys().then(k => Promise.all(k.map(n => caches.delete(n)))).then(() => window.location.reload()) }}
            style={{ marginTop: '24px', background: '#c4933f', color: '#000', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: 600 }}
          >
            Clear Cache &amp; Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
