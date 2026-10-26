import { useEffect, useId, useRef, type KeyboardEvent, type SyntheticEvent } from 'react'
import { Button } from './Button'
import styles from './ConfirmDialog.module.css'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  confirmingLabel: string
  cancelLabel?: string
  isConfirming?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, ...props }: ConfirmDialogProps) {
  // Só existe no DOM enquanto aberto: abrir de novo sempre recomeça com foco no "Voltar".
  return open ? <OpenDialog {...props} /> : null
}

function OpenDialog({
  title,
  description,
  confirmLabel,
  confirmingLabel,
  cancelLabel = 'Voltar',
  isConfirming = false,
  error,
  onConfirm,
  onClose,
}: Omit<ConfirmDialogProps, 'open'>) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null

    // <dialog> nativo com showModal(): conteúdo de fundo inerte e foco preso no diálogo.
    dialog?.showModal()
    backButtonRef.current?.focus()

    return () => {
      if (dialog?.open) dialog.close()
      // Devolve o foco a quem abriu; se o botão sumiu (ex.: ordem já cancelada), vai para o conteúdo principal.
      const target = opener?.isConnected ? opener : document.getElementById('conteudo')
      target?.focus()
    }
  }, [])

  function close() {
    if (!isConfirming) onClose()
  }

  // Esc fecha sem confirmar. Tratado no keydown para o comportamento ser o mesmo em qualquer navegador.
  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
  }

  // Outras formas nativas de fechar (ex.: botão voltar do Android) passam pelo mesmo caminho.
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault()
    close()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onKeyDown={handleKeyDown}
      onCancel={handleCancel}
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <p id={descriptionId} className={styles.description}>
        {description}
      </p>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button ref={backButtonRef} variant="secondary" onClick={close} aria-disabled={isConfirming}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={isConfirming ? undefined : onConfirm} aria-disabled={isConfirming}>
          {isConfirming ? confirmingLabel : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
