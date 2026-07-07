import { NavItem } from '@/components/molecules/NavItem'
import {
  DashboardIcon,
  MicIcon,
  PatientsIcon,
  ReportIcon,
  SessionsIcon,
  SettingsIcon,
  ToothIcon,
} from '@/components/atoms/icons'
import { useAuth } from '@/features/auth/AuthProvider'
import { initials } from '@/lib/initials'

function NavLabel({ children }: { children: string }) {
  return (
    <p className="px-2 pb-2 text-[10.5px] font-bold uppercase tracking-[0.11em] text-sidebar-label">
      {children}
    </p>
  )
}

export function Sidebar() {
  const { clinic } = useAuth()
  const clinicName = clinic?.clinic_name ?? 'Your Clinic'

  return (
    <aside className="sticky top-0 flex h-screen flex-col bg-sidebar px-4 py-5 text-sidebar-fg">
      {/* Brand */}
      <div className="flex items-center gap-[11px] border-b border-white/[0.07] px-2 pb-[18px]">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary">
          <ToothIcon className="size-[21px] text-white" />
        </span>
        <div>
          <p className="font-display text-[16.5px] font-extrabold leading-none tracking-[-0.02em] text-white">
            DentalScribe
          </p>
          <p className="mt-[3px] text-[11px] font-medium text-[#7F8DA0]">Clinical AI Scribe</p>
        </div>
      </div>

      <nav className="mt-5">
        <NavLabel>Overview</NavLabel>
        <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
      </nav>

      <nav className="mt-5">
        <NavLabel>Clinical</NavLabel>
        <NavItem to="/patients" icon={<PatientsIcon />} label="Patients" />
        <NavItem to="/sessions" icon={<SessionsIcon />} label="Sessions" />
        <NavItem to="/scribe" icon={<MicIcon />} label="Start Scribe" />
        <NavItem to="/reports" icon={<ReportIcon />} label="Reports" />
      </nav>

      <nav className="mt-5">
        <NavLabel>System</NavLabel>
        <NavItem to="/settings" icon={<SettingsIcon />} label="Settings" />
      </nav>

      {/* Clinic footer */}
      <div className="mt-auto flex items-center gap-2.5 rounded-[11px] bg-sidebar-2 p-2.5">
        <span className="grid size-[34px] place-items-center rounded-[9px] bg-[#274263] font-display text-[13px] font-bold text-[#CBD7E6]">
          {initials(clinicName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold leading-tight text-[#EAF0F7]">
            {clinicName}
          </p>
          <p className="text-[11px] font-medium text-[#7F8DA0]">Clinic account</p>
        </div>
      </div>
    </aside>
  )
}
