import type { ComponentProps } from 'react'
import styles from './Button.module.css'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  return <button type={type} className={classNames} {...props} />
}
