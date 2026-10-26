import { Button } from './Button'
import styles from './StateMessage.module.css'

type ErrorStateProps = {
  title: string
  message: string
  isRetrying: boolean
  onRetry: () => void
}

export function ErrorState({ title, message, isRetrying, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className={styles.container}>
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      <Button aria-disabled={isRetrying} onClick={isRetrying ? undefined : onRetry}>
        {isRetrying ? 'Tentando...' : 'Tentar novamente'}
      </Button>
    </div>
  )
}
