import { Button } from './Button'
import styles from './Pagination.module.css'

type PaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, totalCount, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  if (totalPages <= 1) return null

  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    <nav aria-label="Paginação" className={styles.pagination}>
      <Button variant="secondary" aria-disabled={isFirst} onClick={isFirst ? undefined : () => onPageChange(page - 1)}>
        Anterior
      </Button>
      <span aria-live="polite" className={styles.position}>
        Página {page} de {totalPages}
      </span>
      <Button variant="secondary" aria-disabled={isLast} onClick={isLast ? undefined : () => onPageChange(page + 1)}>
        Próxima
      </Button>
    </nav>
  )
}
