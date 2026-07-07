import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Card, CardBody } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { ChevronRightIcon, MicIcon } from '@/components/atoms/icons'
import { DateRange, FilterSelect } from '@/components/molecules/FilterControls'
import { ListToolbar } from '@/components/molecules/ListToolbar'
import { SortHeader } from '@/components/molecules/SortHeader'
import { accentForKey } from '@/lib/accent'
import { initials } from '@/lib/initials'
import { useSort } from '@/lib/useSort'
import { procedureLabel, sessionStatus } from './constants'
import { useSessions } from './hooks'

function formatDate(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString()
}

export function SessionsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { sort, toggle, reset: resetSort, isDefault } = useSort({ by: '', order: 'desc' }, () => setPage(1))
  const { data, isLoading } = useSessions(page, search, sort.by, sort.order, status, from, to)
  const sessions = data?.items ?? []
  const meta = data?.meta

  const hasFilters = search !== '' || !isDefault || status !== '' || from !== '' || to !== ''

  function clearFilters() {
    setSearch('')
    setStatus('')
    setFrom('')
    setTo('')
    resetSort()
    setPage(1)
  }

  return (
    <>
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1.5 text-[25px] font-extrabold">Sessions</h1>
          <p className="text-[13.5px] text-muted">Every recorded scribe session.</p>
        </div>
        <Button leadingIcon={<MicIcon />} onClick={() => navigate('/scribe')}>
          Start Scribe
        </Button>
      </div>

      <Card>
        <ListToolbar
          search={search}
          onSearch={(v) => {
            setSearch(v)
            setPage(1)
          }}
          onClear={clearFilters}
          showClear={hasFilters}
          placeholder="Search by patient or topic…"
          extra={
            <>
              <FilterSelect
                ariaLabel="Filter by status"
                value={status}
                onChange={(v) => {
                  setStatus(v)
                  setPage(1)
                }}
                options={[
                  { value: '', label: 'All statuses' },
                  { value: 'recording', label: 'Recording' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />
              <DateRange
                from={from}
                to={to}
                onFrom={(v) => {
                  setFrom(v)
                  setPage(1)
                }}
                onTo={(v) => {
                  setTo(v)
                  setPage(1)
                }}
              />
            </>
          }
        />
        <CardBody className="pt-2">
          {isLoading ? (
            <div className="grid place-items-center py-16 text-primary">
              <Spinner className="size-6" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="grid place-items-center gap-2 py-16 text-center">
              <span className="grid size-12 place-items-center rounded-xl bg-sky text-sky-ink">
                <MicIcon className="size-6" />
              </span>
              <p className="font-display text-[15px] font-bold">No sessions yet</p>
              <p className="max-w-xs text-[13px] text-muted">Start a scribe to record your first visit.</p>
              <Button className="mt-1" size="sm" onClick={() => navigate('/scribe')}>
                Start Scribe
              </Button>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left">
                  <SortHeader label="Patient" column="patient" sort={sort} onSort={toggle} />
                  <th className="px-2.5 pb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Topics</th>
                  <SortHeader label="Status" column="status" sort={sort} onSort={toggle} />
                  <SortHeader label="Recorded" column="created_at" sort={sort} onSort={toggle} />
                  <th className="px-2.5 pb-3" />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const st = sessionStatus(s.status)
                  return (
                    <tr
                      key={s.id}
                      className="cursor-pointer border-t border-border text-[13px] hover:bg-bg"
                      onClick={() => navigate(`/sessions/${s.id}`)}
                    >
                      <td className="px-2.5 py-3">
                        <div className="flex items-center gap-[11px]">
                          <Avatar initials={initials(s.patient_name ?? '?')} tone={accentForKey(s.patient_id)} size="sm" />
                          <span className="font-semibold">{s.patient_name ?? '-'}</span>
                        </div>
                      </td>
                      <td className="px-2.5 py-3 font-medium">{procedureLabel(s.procedure_type)}</td>
                      <td className="px-2.5 py-3">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="px-2.5 py-3 font-medium tnum">{formatDate(s.created_at)}</td>
                      <td className="px-2.5 py-3 text-right">
                        <ChevronRightIcon className="ml-auto size-4 text-muted" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {meta && meta.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
              <p className="text-[12.5px] text-muted">
                Page {meta.page} of {meta.total_pages} · {meta.total} sessions
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="ghost" size="sm" disabled={page >= meta.total_pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  )
}
