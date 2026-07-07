import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Card, CardBody, CardHeader } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { ChevronRightIcon, MicIcon } from '@/components/atoms/icons'
import { procedureLabel, sessionStatus } from '@/features/scribe/constants'
import { useSessionsForPatient } from '@/features/scribe/hooks'
import { accentForKey } from '@/lib/accent'
import { initials } from '@/lib/initials'
import { usePatient } from './hooks'

function formatDate(value: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[13.5px] font-medium text-ink">{value}</p>
    </div>
  )
}

export function PatientDetailPage() {
  const { patientId = '' } = useParams()
  const navigate = useNavigate()
  const { data: patient, isLoading } = usePatient(patientId)
  const { data: sessionsData, isLoading: sessionsLoading } = useSessionsForPatient(patientId)
  const sessions = sessionsData?.items ?? []

  if (isLoading || !patient) {
    return (
      <div className="grid place-items-center py-24 text-primary">
        <Spinner className="size-7" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[820px]">
      <button onClick={() => navigate('/patients')} className="mb-3 text-[12.5px] font-medium text-muted hover:text-primary">
        ‹ Back to patients
      </button>

      <div className="mb-5 flex items-center gap-3.5">
        <Avatar initials={initials(patient.full_name)} tone={accentForKey(patient.id)} size="md" />
        <div>
          <h1 className="text-[24px] font-extrabold">{patient.full_name}</h1>
          <p className="text-[13px] text-muted">#{patient.id.slice(0, 8)}</p>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader title="Patient details" />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Info label="Email" value={patient.email ?? '-'} />
            <Info label="Phone" value={patient.phone ?? '-'} />
            <Info label="Date of birth" value={formatDate(patient.date_of_birth)} />
          </div>
          {patient.medical_notes && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Medical notes</p>
              <p className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-ink">
                {patient.medical_notes}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Sessions"
          action={
            <Button size="sm" leadingIcon={<MicIcon />} onClick={() => navigate('/scribe')}>
              Start Scribe
            </Button>
          }
        />
        <CardBody className="pt-1.5">
          {sessionsLoading ? (
            <div className="grid place-items-center py-10 text-primary">
              <Spinner className="size-5" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-muted">No sessions recorded for this patient yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left">
                  {['Topics', 'Status', 'Recorded', ''].map((h) => (
                    <th key={h} className="px-2.5 pb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                      {h}
                    </th>
                  ))}
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
                      <td className="px-2.5 py-3 font-medium">{procedureLabel(s.procedure_type)}</td>
                      <td className="px-2.5 py-3">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="px-2.5 py-3 font-medium tnum">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="px-2.5 py-3 text-right">
                        <ChevronRightIcon className="ml-auto size-4 text-muted" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
