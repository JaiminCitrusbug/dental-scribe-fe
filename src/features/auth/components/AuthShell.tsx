import type { ReactNode } from 'react'
import { ToothIcon } from '@/components/atoms/icons'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-[11px] bg-primary">
            <ToothIcon className="size-6 text-white" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink">
            DentalScribe
          </span>
        </div>

        <div className="rounded-card border border-border bg-surface p-7 shadow-card">
          <h1 className="text-center text-[22px] font-extrabold">{title}</h1>
          <p className="mt-1 text-center text-[13.5px] text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-5 text-center text-[13px] text-muted">{footer}</p>
      </div>
    </div>
  )
}
