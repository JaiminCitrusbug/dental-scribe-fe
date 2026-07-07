import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/atoms/Button'
import { Card, CardBody } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { ChevronRightIcon, ReportIcon } from '@/components/atoms/icons'
import { DateRange } from '@/components/molecules/FilterControls'
import { ListToolbar } from '@/components/molecules/ListToolbar'
import { SortHeader } from '@/components/molecules/SortHeader'
import { procedureLabel } from '@/features/scribe/constants'
import { useSort } from '@/lib/useSort'
import { useReports } from './hooks'

function formatDate(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}

export function ReportsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { sort, toggle, reset: resetSort, isDefault } = useSort({ by: '', order: 'desc' }, () => setPage(1))
  const { data, isLoading, isError, refetch } = useReports(page, search, sort.by, sort.order, from, to)
  const reports = data?.items ?? []
  const meta = data?.meta

  const hasFilters = search !== '' || !isDefault || from !== '' || to !== ''

  function clearFilters() {
    setSearch('')
    setFrom('')
    setTo('')
    resetSort()
    setPage(1)
  }

  return (
    <>
      <div className="mb-[22px]">
        <h1 className="mb-1.5 text-[25px] font-extrabold">Reports</h1>
        <p className="text-[13.5px] text-muted">Grounded care reports generated from scribe sessions.</p>
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
          placeholder="Search by patient or procedure…"
          extra={
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
          }
        />
        <CardBody className="pt-2">
          {isLoading ? (
            <div className="grid place-items-center py-16 text-primary">
              <Spinner className="size-6" />
            </div>
          ) : isError ? (
            <div className="grid place-items-center gap-3 py-16 text-center">
              <p className="text-[13.5px] text-muted">Couldn't load reports.</p>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : reports.length === 0 ? (
            <div className="grid place-items-center gap-2 py-16 text-center">
              <span className="grid size-12 place-items-center rounded-xl bg-violet text-violet-ink">
                <ReportIcon className="size-6" />
              </span>
              <p className="font-display text-[15px] font-bold">No reports yet</p>
              <p className="max-w-xs text-[13px] text-muted">
                Complete a scribe session and generate a report to see it here.
              </p>
              <Button className="mt-1" size="sm" onClick={() => navigate('/scribe')}>
                Start a scribe
              </Button>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left">
                  <SortHeader label="Patient" column="patient" sort={sort} onSort={toggle} />
                  <SortHeader label="Procedure" column="procedure" sort={sort} onSort={toggle} />
                  <SortHeader label="Generated" column="created_at" sort={sort} onSort={toggle} />
                  <th className="px-2.5 pb-3" />
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer border-t border-border text-[13px] hover:bg-bg"
                    onClick={() => navigate(`/reports/${r.scribe_session_id}`)}
                  >
                    <td className="px-2.5 py-3 font-semibold">{r.patient_name ?? '-'}</td>
                    <td className="px-2.5 py-3 font-medium">{procedureLabel(r.procedure_type)}</td>
                    <td className="px-2.5 py-3 font-medium tnum">{formatDate(r.created_at)}</td>
                    <td className="px-2.5 py-3 text-right">
                      <ChevronRightIcon className="ml-auto size-4 text-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {meta && meta.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
              <p className="text-[12.5px] text-muted">
                Page {meta.page} of {meta.total_pages} · {meta.total} reports
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
