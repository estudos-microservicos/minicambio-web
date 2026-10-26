import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'

type CancelOrderDialogProps = {
  open: boolean
  isCancelling: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

export function CancelOrderDialog({ open, isCancelling, error, onConfirm, onClose }: CancelOrderDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Cancelar ordem?"
      description="A cotação será descartada e a ordem não poderá mais ser confirmada. Ela continua no histórico com o status Cancelada."
      confirmLabel="Sim, cancelar ordem"
      confirmingLabel="Cancelando..."
      cancelLabel="Voltar"
      isConfirming={isCancelling}
      error={error}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
