import { NavItem } from '@/components/molecules/NavItem'
import {
  ChevronRightIcon,
  DashboardIcon,
  MicIcon,
  PatientsIcon,
  ReportIcon,
  SessionsIcon,
  SettingsIcon,
  ToothIcon,
} from '@/components/atoms/icons'
import { useAuth } from '@/features/auth/AuthProvider'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/initials'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function NavLabel({ children }: { children: string }) {
  return (
    <p className="px-2 pb-2 text-[10.5px] font-bold uppercase tracking-[0.11em] text-sidebar-label">
      {children}
    </p>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { clinic } = useAuth()
  const clinicName = clinic?.clinic_name ?? 'Your Clinic'

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col bg-sidebar py-5 text-sidebar-fg',
        collapsed ? 'px-2.5' : 'px-4',
      )}
    >
      {/* Brand + collapse toggle (button sits beside the title) */}
      <div
        className={cn(
          'flex border-b border-white/[0.07] pb-[18px]',
          collapsed ? 'flex-col items-center gap-2.5' : 'items-center gap-[11px] px-2',
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary">
          <ToothIcon className="size-[21px] text-white" />
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-display text-[16.5px] font-extrabold leading-none tracking-[-0.02em] text-white">
              DentalScribe
            </p>
            <p className="mt-[3px] text-[11px] font-medium text-[#7F8DA0]">Clinical AI Scribe</p>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
          className="grid size-7 shrink-0 place-items-center rounded-md text-sidebar-fg transition-colors hover:bg-sidebar-2 hover:text-white/90"
        >
          <ChevronRightIcon className={cn('size-4 transition-transform', !collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="mt-5">
        {!collapsed && <NavLabel>Overview</NavLabel>}
        <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" collapsed={collapsed} />
      </nav>

      <nav className="mt-5">
        {!collapsed && <NavLabel>Clinical</NavLabel>}
        <NavItem to="/patients" icon={<PatientsIcon />} label="Patients" collapsed={collapsed} />
        <NavItem to="/sessions" icon={<SessionsIcon />} label="Sessions" collapsed={collapsed} />
        <NavItem to="/scribe" icon={<MicIcon />} label="Start Scribe" collapsed={collapsed} />
        <NavItem to="/reports" icon={<ReportIcon />} label="Reports" collapsed={collapsed} />
      </nav>

      <nav className="mt-5">
        {!collapsed && <NavLabel>System</NavLabel>}
        <NavItem to="/settings" icon={<SettingsIcon />} label="Settings" collapsed={collapsed} />
      </nav>

      {/* Clinic footer */}
      <div
        className={cn(
          'mt-auto flex items-center rounded-[11px] bg-sidebar-2',
          collapsed ? 'justify-center p-2' : 'gap-2.5 p-2.5',
        )}
      >
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#274263] font-display text-[13px] font-bold text-[#CBD7E6]">
          {initials(clinicName)}
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-semibold leading-tight text-[#EAF0F7]">
              {clinicName}
            </p>
            <p className="text-[11px] font-medium text-[#7F8DA0]">Clinic account</p>
          </div>
        )}
      </div>
    </aside>
  )
}
