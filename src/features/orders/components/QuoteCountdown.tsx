import { useEffect, useRef, useState } from 'react'
import { useAnnouncer } from '../../../shared/hooks/useAnnouncer'
import styles from './QuoteCountdown.module.css'

const WARNING_SECONDS = 10

type QuoteCountdownProps = {
  expiresAt: string
  onExpire: () => void
}

function secondsUntil(expiresAt: string, now: number): number {
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000))
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function QuoteCountdown({ expiresAt, onExpire }: QuoteCountdownProps) {
  const announce = useAnnouncer()
  const [remaining, setRemaining] = useState(() => secondsUntil(expiresAt, Date.now()))
  const warned = useRef(false)
  const expired = useRef(false)

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(secondsUntil(expiresAt, Date.now())), 1000)
    return () => window.clearInterval(timer)
  }, [expiresAt])

  // Leitores de tela recebem só dois anúncios (aos 10 s e ao expirar), nunca um por segundo.
  useEffect(() => {
    if (remaining > 0 && remaining <= WARNING_SECONDS && !warned.current) {
      warned.current = true
      announce(`Faltam ${WARNING_SECONDS} segundos para a cotação expirar.`)
    }
    if (remaining === 0 && !expired.current) {
      expired.current = true
      announce('A cotação expirou. Crie uma nova ordem.')
      onExpire()
    }
  }, [remaining, announce, onExpire])

  if (remaining === 0) {
    return <p className={`${styles.countdown} ${styles.expired}`}>A cotação expirou.</p>
  }

  return (
    <p className={`${styles.countdown} ${remaining <= WARNING_SECONDS ? styles.warning : ''}`}>
      Cotação válida por{' '}
      <span role="timer" aria-live="off" className={styles.time}>
        {formatSeconds(remaining)}
      </span>
    </p>
  )
}
