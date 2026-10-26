import type { ComponentProps } from 'react'
import { Link } from 'react-router'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'danger'

type ButtonProps = ComponentProps<'button'> & {
  variant?: Variant
}

function classNamesFor(variant: Variant, className: string | undefined) {
  return [styles.button, styles[variant], className].filter(Boolean).join(' ')
}

export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  return <button type={type} className={classNamesFor(variant, className)} {...props} />
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant
}

// Navegação com aparência de botão (continua sendo um link para leitores de tela e para o navegador).
export function ButtonLink({ variant = 'primary', className, ...props }: ButtonLinkProps) {
  return <Link className={classNamesFor(variant, className)} {...props} />
}
