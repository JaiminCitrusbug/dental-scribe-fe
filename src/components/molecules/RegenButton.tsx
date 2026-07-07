import { RefreshIcon } from '@/components/atoms/icons'
import { Spinner } from '@/components/atoms/Spinner'

interface RegenButtonProps {
  onClick: () => void
  loading?: boolean
  label?: string
}

export function RegenButton({ onClick, loading, label = 'Regenerate' }: RegenButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-md border border-border text-muted hover:bg-bg disabled:opacity-50"
    >
      {loading ? <Spinner className="size-3.5" /> : <RefreshIcon className="size-4" />}
    </button>
  )
}
