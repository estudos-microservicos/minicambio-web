import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnnouncerContext } from './announcerContext'

type LiveAnnouncerProps = {
  children: ReactNode
}

// Região única aria-live="polite" para anunciar mudanças de status e resultados de ações.
export function LiveAnnouncer({ children }: LiveAnnouncerProps) {
  const [message, setMessage] = useState('')
  const timer = useRef<number | undefined>(undefined)

  const announce = useCallback((next: string) => {
    // Esvazia a região antes, para que a mesma mensagem repetida volte a ser anunciada.
    setMessage('')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(next), 50)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <AnnouncerContext value={announce}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="visually-hidden" data-testid="live-announcer">
        {message}
      </div>
    </AnnouncerContext>
  )
}
