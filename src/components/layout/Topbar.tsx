import { useNavigate } from 'react-router-dom'
import { HomeIcon, LogoutIcon } from '@/components/atoms/icons'
import { useAuth } from '@/features/auth/AuthProvider'
import { initials } from '@/lib/initials'

interface TopbarProps {
  crumb: string
}

export function Topbar({ crumb }: TopbarProps) {
  const { clinic, logout } = useAuth()
  const navigate = useNavigate()
  const name = clinic?.contact_name ?? 'Clinician'

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-surface px-7 py-3.5">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex h-[38px] items-center gap-2 rounded-md border border-border bg-surface px-3.5 text-[13px] font-semibold text-ink hover:bg-bg"
      >
        <HomeIcon className="size-[18px] text-muted" />
        Home
      </button>
      {crumb !== 'Dashboard' && (
        <p className="text-[13px] font-medium text-muted">
          /&nbsp;&nbsp;<span className="font-semibold text-ink">{crumb}</span>
        </p>
      )}

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-[38px] place-items-center rounded-md bg-[#DCE7F6] font-display text-sm font-bold text-[#2A4A74]">
            {initials(name)}
          </span>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold">{name}</p>
            <p className="text-[11.5px] font-medium text-muted">{clinic?.email ?? ''}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="grid size-[38px] place-items-center rounded-md border border-border bg-surface text-muted hover:bg-bg hover:text-rose-ink"
          aria-label="Log out"
          title="Log out"
        >
          <LogoutIcon className="size-[18px]" />
        </button>
      </div>
    </header>
  )
}
