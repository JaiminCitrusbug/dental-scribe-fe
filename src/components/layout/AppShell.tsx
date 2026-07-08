import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
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

const COLLAPSE_KEY = 'ds_sidebar_collapsed'

export function AppShell() {
  const { pathname } = useLocation()
  const segment = pathname.split('/')[1] || 'dashboard'
  const crumb = CRUMBS[segment] ?? 'Dashboard'

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })

  function toggle() {
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      } catch {
        /* noop */
      }
      return next
    })
  }

  return (
    <div
      className={cn(
        'grid min-h-screen max-[720px]:grid-cols-1',
        collapsed ? 'grid-cols-[72px_1fr]' : 'grid-cols-[250px_1fr]',
      )}
    >
      <div className="max-[720px]:hidden">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
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
