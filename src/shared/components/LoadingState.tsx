import styles from './StateMessage.module.css'

type LoadingStateProps = {
  message: string
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div role="status" className={styles.container}>
      <p className={styles.message}>{message}</p>
    </div>
  )
}
