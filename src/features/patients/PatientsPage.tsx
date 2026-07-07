import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { Card, CardBody } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { ChevronRightIcon, EditIcon, PatientsIcon, PlusIcon, TrashIcon } from '@/components/atoms/icons'
import { DateRange } from '@/components/molecules/FilterControls'
import { ListToolbar } from '@/components/molecules/ListToolbar'
import { SortHeader } from '@/components/molecules/SortHeader'
import { Modal } from '@/components/organisms/Modal'
import { accentForKey } from '@/lib/accent'
import { initials } from '@/lib/initials'
import { useSort } from '@/lib/useSort'
import { PatientFormModal } from './components/PatientFormModal'
import { useDeletePatient, usePatients } from './hooks'
import type { Patient } from './types'

function formatDate(value: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}

export function PatientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const { sort, toggle, reset: resetSort, isDefault } = useSort({ by: '', order: 'desc' }, () => setPage(1))
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading, isError, refetch } = usePatients(search, page, sort.by, sort.order, from, to)
  const del = useDeletePatient()

  const hasFilters = search !== '' || !isDefault || from !== '' || to !== ''

  function clearFilters() {
    setSearch('')
    resetSort()
    setFrom('')
    setTo('')
    setPage(1)
  }

  const patients = data?.items ?? []
  const meta = data?.meta

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(p: Patient) {
    setEditing(p)
    setFormOpen(true)
  }
  async function confirmDelete() {
    if (!deleteTarget) return
    await del.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1.5 text-[25px] font-extrabold">Patients</h1>
          <p className="text-[13.5px] text-muted">Manage your clinic's patient records.</p>
        </div>
        <Button leadingIcon={<PlusIcon />} onClick={openAdd}>
          Add patient
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
          placeholder="Search by name or email…"
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
            <div className="grid place-items-center py-16 text-muted">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : isError ? (
            <div className="grid place-items-center gap-3 py-16 text-center">
              <p className="text-[13.5px] text-muted">Couldn't load patients.</p>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : patients.length === 0 ? (
            <div className="grid place-items-center gap-2 py-16 text-center">
              <span className="grid size-12 place-items-center rounded-xl bg-sky text-sky-ink">
                <PatientsIcon className="size-6" />
              </span>
              <p className="font-display text-[15px] font-bold">No patients yet</p>
              <p className="max-w-xs text-[13px] text-muted">
                {search ? 'No patients match your search.' : 'Add your first patient to get started.'}
              </p>
              {!search && (
                <Button className="mt-1" size="sm" leadingIcon={<PlusIcon />} onClick={openAdd}>
                  Add patient
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left">
                  <SortHeader label="Patient" column="name" sort={sort} onSort={toggle} />
                  <th className="px-2.5 pb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Contact</th>
                  <SortHeader label="Date of birth" column="dob" sort={sort} onSort={toggle} />
                  <SortHeader label="Added" column="created_at" sort={sort} onSort={toggle} />
                  <th className="px-2.5 pb-3" />
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer border-t border-border text-[13px] hover:bg-bg"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    <td className="px-2.5 py-3">
                      <div className="flex items-center gap-[11px]">
                        <Avatar initials={initials(p.full_name)} tone={accentForKey(p.id)} size="sm" />
                        <div>
                          <p className="text-[13px] font-semibold">{p.full_name}</p>
                          <p className="text-[11.5px] font-medium text-muted">#{p.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2.5 py-3">
                      <p className="font-medium">{p.email ?? '-'}</p>
                      <p className="text-[11.5px] text-muted">{p.phone ?? '-'}</p>
                    </td>
                    <td className="px-2.5 py-3 font-medium tnum">{formatDate(p.date_of_birth)}</td>
                    <td className="px-2.5 py-3 font-medium tnum">{formatDate(p.created_at)}</td>
                    <td className="px-2.5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(p)
                          }}
                          aria-label={`Edit ${p.full_name}`}
                          className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface hover:text-primary"
                        >
                          <EditIcon className="size-[16px]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(p)
                          }}
                          aria-label={`Remove ${p.full_name}`}
                          className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface hover:text-rose-ink"
                        >
                          <TrashIcon className="size-[16px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {meta && meta.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
              <p className="text-[12.5px] text-muted">
                Page {meta.page} of {meta.total_pages} · {meta.total} patients
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= meta.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRightIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <PatientFormModal open={formOpen} onClose={() => setFormOpen(false)} patient={editing} />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remove patient"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-rose-ink hover:bg-rose-ink/90"
              onClick={confirmDelete}
              disabled={del.isPending}
            >
              {del.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-muted">
          Remove <span className="font-semibold text-ink">{deleteTarget?.full_name}</span> from your
          patient records? This can be restored later.
        </p>
      </Modal>
    </>
  )
}
