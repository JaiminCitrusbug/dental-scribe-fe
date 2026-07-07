import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const CRUMBS: Record<string, string> = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  sessions: 'Sessions',
  scribe: 'Start Scribe',
  reports: 'Reports',
  'knowledge-base': 'Knowledge Base',
  settings: 'Settings',
  'design-system': 'Design System',
}

export function AppShell() {
  const { pathname } = useLocation()
  const segment = pathname.split('/')[1] || 'dashboard'
  const crumb = CRUMBS[segment] ?? 'Dashboard'

  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] max-[720px]:grid-cols-1">
      <div className="max-[720px]:hidden">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-col">
        <Topbar crumb={crumb} />
        <main className="flex-1 overflow-auto px-7 pb-10 pt-[26px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
