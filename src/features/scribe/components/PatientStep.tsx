import { useEffect, useState } from 'react'
import { Avatar } from '@/components/atoms/Avatar'
import { Input } from '@/components/atoms/Input'
import { Spinner } from '@/components/atoms/Spinner'
import { SearchIcon } from '@/components/atoms/icons'
import { FormField } from '@/components/molecules/FormField'
import { todayIso, validateDob } from '@/features/patients/dob'
import { usePatients } from '@/features/patients/hooks'
import type { Patient, PatientInput } from '@/features/patients/types'
import { accentForKey } from '@/lib/accent'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/initials'

export interface PatientSelection {
  patient_id?: string
  new_patient?: PatientInput
}

interface Props {
  onChange: (selection: PatientSelection | null) => void
}

export function PatientStep({ onChange }: Props) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')

  // Existing
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)
  const { data, isLoading } = usePatients(search, 1)

  // New
  const [np, setNp] = useState({ first_name: '', last_name: '', date_of_birth: '', email: '', phone: '' })

  useEffect(() => {
    if (mode === 'existing') {
      onChange(selected ? { patient_id: selected.id } : null)
    } else {
      const dob = validateDob(np.date_of_birth)
      const ready = Boolean(np.first_name.trim() && np.last_name.trim() && dob.ok)
      onChange(
        ready
          ? {
              new_patient: {
                first_name: np.first_name.trim(),
                last_name: np.last_name.trim(),
                date_of_birth: np.date_of_birth || null,
                email: np.email || null,
                phone: np.phone || null,
              },
            }
          : null,
      )
    }
  }, [mode, selected, np, onChange])

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-md border border-border bg-bg p-0.5 text-[13px] font-semibold">
        {(['existing', 'new'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'rounded-[6px] px-3.5 py-1.5 transition-colors',
              mode === m ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink',
            )}
          >
            {m === 'existing' ? 'Existing patient' : 'New patient'}
          </button>
        ))}
      </div>

      {mode === 'existing' ? (
        <div className="space-y-3">
          <label className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3 py-2.5">
            <SearchIcon className="size-4 text-muted" />
            <input
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/80"
              placeholder="Search patients by name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelected(null)
              }}
            />
          </label>

          <div className="max-h-[220px] overflow-auto rounded-md border border-border">
            {isLoading ? (
              <div className="grid place-items-center py-8 text-primary">
                <Spinner className="size-5" />
              </div>
            ) : (data?.items.length ?? 0) === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-muted">
                No patients found. Switch to “New patient” to add one.
              </p>
            ) : (
              data!.items.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-border px-3.5 py-2.5 text-left last:border-b-0',
                    selected?.id === p.id ? 'bg-sky' : 'hover:bg-bg',
                  )}
                >
                  <Avatar initials={initials(p.full_name)} tone={accentForKey(p.id)} size="sm" />
                  <div>
                    <p className="text-[13px] font-semibold">{p.full_name}</p>
                    <p className="text-[11.5px] text-muted">{p.email ?? `#${p.id.slice(0, 8)}`}</p>
                  </div>
                  {selected?.id === p.id && <span className="ml-auto text-[12px] font-semibold text-sky-ink">Selected</span>}
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name" htmlFor="np_first">
              <Input id="np_first" value={np.first_name} onChange={(e) => setNp({ ...np, first_name: e.target.value })} />
            </FormField>
            <FormField label="Last name" htmlFor="np_last">
              <Input id="np_last" value={np.last_name} onChange={(e) => setNp({ ...np, last_name: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Date of birth"
              htmlFor="np_dob"
              error={np.date_of_birth && !validateDob(np.date_of_birth).ok ? validateDob(np.date_of_birth).error : undefined}
            >
              <Input
                id="np_dob"
                type="date"
                max={todayIso()}
                value={np.date_of_birth}
                onChange={(e) => setNp({ ...np, date_of_birth: e.target.value })}
              />
            </FormField>
            <FormField label="Phone" htmlFor="np_phone">
              <Input id="np_phone" value={np.phone} onChange={(e) => setNp({ ...np, phone: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Email" htmlFor="np_email">
            <Input id="np_email" type="email" value={np.email} onChange={(e) => setNp({ ...np, email: e.target.value })} />
          </FormField>
        </div>
      )}
    </div>
  )
}
