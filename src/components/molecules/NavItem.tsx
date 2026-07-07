import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

interface NavItemProps {
  to: string
  icon: ReactNode
  label: string
  end?: boolean
}

/** Sidebar navigation link - active state driven by the router. */
export function NavItem({ to, icon, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'mb-0.5 flex items-center gap-[11px] rounded-[9px] px-2.5 py-2.5 text-[13.5px] font-medium transition-colors',
          isActive
            ? 'bg-primary font-semibold text-white shadow-card'
            : 'text-sidebar-fg hover:bg-sidebar-2 hover:text-white/90',
        )
      }
    >
      <span className="size-[17px] shrink-0">{icon}</span>
      {label}
    </NavLink>
  )
}
