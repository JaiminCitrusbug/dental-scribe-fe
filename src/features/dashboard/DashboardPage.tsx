import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Card, CardBody, CardHeader } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import {
  ChevronRightIcon,
  ClockIcon,
  MicIcon,
  PatientsIcon,
  PlusIcon,
  ReportIcon,
  SessionsIcon,
} from '@/components/atoms/icons'
import { StatTile, type StatDelta } from '@/components/molecules/StatTile'
import { useAuth } from '@/features/auth/AuthProvider'
import { GROUNDING } from '@/features/reports/components/ReportView'
import { procedureLabel, sessionStatus } from '@/features/scribe/constants'
import { accentForKey, accentSurface, type Accent } from '@/lib/accent'
import { initials } from '@/lib/initials'
import { useDashboardSummary } from './hooks'

function formatDate(value: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}

function EmptyPanel({ icon, title, note }: { icon: ReactNode; title: string; note: string }) {
  return (
    <div className="grid place-items-center gap-2 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-bg text-muted">{icon}</span>
      <p className="font-display text-[14px] font-bold text-ink">{title}</p>
      <p className="max-w-xs text-[12.5px] text-muted">{note}</p>
    </div>
  )
}

function CardLink({ label, to }: { label: string; to: string }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(to)} className="text-[12.5px] font-medium text-muted hover:text-primary">
      {label} ›
    </button>
  )
}

export function DashboardPage() {
  const { clinic } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading } = useDashboardSummary()

  const firstName = clinic?.contact_name?.split(/\s+/).slice(-1)[0] ?? 'there'
  const newThisMonth = data?.new_patients_this_month ?? 0
  const patientDelta: StatDelta =
    newThisMonth > 0
      ? { dir: 'up', text: `+${newThisMonth} this month` }
      : { dir: 'flat', text: 'this month' }

  const stats: {
    icon: ReactNode
    tone: Accent
    label: string
    value: string
    unit?: string
    delta: StatDelta
    to: string
  }[] = [
    { icon: <PatientsIcon />, tone: 'sky', label: 'Total Patients', value: (data?.total_patients ?? 0).toLocaleString(), delta: patientDelta, to: '/patients' },
    { icon: <MicIcon />, tone: 'mint', label: 'Sessions This Week', value: String(data?.sessions_this_week ?? 0), delta: { dir: 'flat', text: 'this week' }, to: '/sessions' },
    { icon: <ReportIcon />, tone: 'violet', label: 'Reports Generated', value: String(data?.reports_generated ?? 0), delta: { dir: 'flat', text: 'all time' }, to: '/reports' },
    { icon: <ClockIcon />, tone: 'amber', label: 'Avg. Visit Duration', value: String(data?.avg_visit_minutes ?? 0), unit: 'min', delta: { dir: 'flat', text: 'per visit' }, to: '' },
  ]

  const recentPatients = data?.recent_patients ?? []
  const recentSessions = data?.recent_sessions ?? []
  const recentReports = data?.recent_reports ?? []

  const quickActions: { icon: ReactNode; tone: Accent; title: string; sub: string; to: string; primary?: boolean }[] = [
    { icon: <MicIcon />, tone: 'sky', title: 'Start Scribe', sub: 'Begin a new visit', to: '/scribe', primary: true },
    { icon: <PlusIcon />, tone: 'sky', title: 'New Patient', sub: 'Add to records', to: '/patients' },
    { icon: <ReportIcon />, tone: 'mint', title: 'Reports', sub: 'View care reports', to: '/reports' },
    { icon: <SessionsIcon />, tone: 'amber', title: 'Sessions', sub: 'View past sessions', to: '/sessions' },
  ]

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24 text-primary">
        <Spinner className="size-7" />
      </div>
    )
  }

  return (
    <>
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1.5 text-[25px] font-extrabold">Dashboard Overview</h1>
          <p className="text-[13.5px] text-muted">
            Welcome back, Dr. {firstName}. Here's a snapshot of your clinic's scribe activity.
          </p>
        </div>
        <Button leadingIcon={<MicIcon />} onClick={() => navigate('/scribe')}>
          Start Scribe
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-4 max-[1080px]:grid-cols-2">
        {stats.map((s) =>
          s.to ? (
            <button key={s.label} onClick={() => navigate(s.to)} className="text-left transition-transform hover:-translate-y-0.5">
              <StatTile icon={s.icon} tone={s.tone} label={s.label} value={s.value} unit={s.unit} delta={s.delta} />
            </button>
          ) : (
            <StatTile key={s.label} icon={s.icon} tone={s.tone} label={s.label} value={s.value} unit={s.unit} delta={s.delta} />
          ),
        )}
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] items-start gap-4 max-[1080px]:grid-cols-1">
        <div className="space-y-4">
          <Card>
            <CardHeader title="Recent Sessions" action={<CardLink label="View all" to="/sessions" />} />
            <CardBody className="pt-1.5">
              {recentSessions.length === 0 ? (
                <EmptyPanel icon={<MicIcon className="size-5" />} title="No sessions yet" note="Start a scribe to record your first visit." />
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {recentSessions.map((s) => {
                      const st = sessionStatus(s.status)
                      return (
                        <tr key={s.id} className="cursor-pointer border-t border-border text-[13px] first:border-t-0 hover:bg-bg" onClick={() => navigate(`/sessions/${s.id}`)}>
                          <td className="px-2.5 py-3 font-semibold">{procedureLabel(s.procedure_type)}</td>
                          <td className="px-2.5 py-3"><Badge tone={st.tone}>{st.label}</Badge></td>
                          <td className="px-2.5 py-3 font-medium tnum text-muted">{formatDate(s.created_at)}</td>
                          <td className="px-2.5 py-3 text-right"><ChevronRightIcon className="ml-auto size-4 text-muted" /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent Patients" action={<CardLink label="View all" to="/patients" />} />
            <CardBody className="pt-1.5">
              {recentPatients.length === 0 ? (
                <EmptyPanel icon={<PatientsIcon className="size-5" />} title="No patients yet" note="Add your first patient to get started." />
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {recentPatients.map((p) => (
                      <tr key={p.id} className="cursor-pointer border-t border-border text-[13px] first:border-t-0 hover:bg-bg" onClick={() => navigate(`/patients/${p.id}`)}>
                        <td className="px-2.5 py-3">
                          <div className="flex items-center gap-[11px]">
                            <Avatar initials={initials(p.full_name)} tone={accentForKey(p.id)} size="sm" />
                            <div>
                              <p className="text-[13px] font-semibold">{p.full_name}</p>
                              <p className="text-[11.5px] font-medium text-muted">{p.email ?? `#${p.id.slice(0, 8)}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2.5 py-3 font-medium tnum text-muted">{formatDate(p.created_at)}</td>
                        <td className="px-2.5 py-3 text-right"><ChevronRightIcon className="ml-auto size-4 text-muted" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Recent Reports" action={<CardLink label="All" to="/reports" />} />
            <CardBody className="pt-1.5">
              {recentReports.length === 0 ? (
                <EmptyPanel icon={<ReportIcon className="size-5" />} title="No reports yet" note="Care reports appear here after a scribe session." />
              ) : (
                <div className="space-y-0">
                  {recentReports.map((r) => {
                    const g = GROUNDING[r.grounding_source] ?? GROUNDING.insufficient
                    return (
                      <button key={r.id} onClick={() => navigate(`/reports/${r.scribe_session_id}`)} className="flex w-full items-center gap-3 border-t border-border py-3 text-left first:border-t-0 hover:bg-bg">
                        <span className="w-[3px] self-stretch rounded-[3px] bg-primary" />
                        <div className="min-w-0 flex-1">
                          <Badge tone={g.tone}>{g.label}</Badge>
                        </div>
                        <span className="text-[11.5px] font-medium text-muted">{formatDate(r.created_at)}</span>
                        <ChevronRightIcon className="size-4 text-muted" />
                      </button>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Quick Actions" />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((a) => (
                  <button
                    key={a.title}
                    onClick={() => navigate(a.to)}
                    className={
                      a.primary
                        ? 'flex flex-col gap-2.5 rounded-[11px] border border-primary bg-primary p-3.5 text-left'
                        : 'flex flex-col gap-2.5 rounded-[11px] border border-border bg-surface p-3.5 text-left hover:bg-bg'
                    }
                  >
                    <span className={a.primary ? 'grid size-9 place-items-center rounded-md bg-white/[0.18] text-white' : `grid size-9 place-items-center rounded-md ${accentSurface[a.tone]}`}>
                      <span className="size-[18px]">{a.icon}</span>
                    </span>
                    <span className={a.primary ? 'font-display text-[13px] font-bold text-white' : 'font-display text-[13px] font-bold'}>
                      {a.title}
                    </span>
                    <span className={a.primary ? 'text-[11.5px] font-medium text-[#DBE6FB]' : 'text-[11.5px] font-medium text-muted'}>
                      {a.sub}
                    </span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
