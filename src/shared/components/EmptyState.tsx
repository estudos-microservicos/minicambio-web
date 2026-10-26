import type { ReactNode } from 'react'
import styles from './StateMessage.module.css'

type EmptyStateProps = {
  title: string
  children?: ReactNode
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      {children}
    </div>
  )
}
