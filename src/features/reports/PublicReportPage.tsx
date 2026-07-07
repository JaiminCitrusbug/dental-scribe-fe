import { useParams } from 'react-router-dom'
import { Spinner } from '@/components/atoms/Spinner'
import { ToothIcon } from '@/components/atoms/icons'
import { procedureLabel } from '@/features/scribe/constants'
import { ReportView } from './components/ReportView'
import { usePublicReport } from './hooks'

export function PublicReportPage() {
  const { token = '' } = useParams()
  const { data, isLoading, isError } = usePublicReport(token)

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[760px] items-center gap-2.5 px-5 py-4">
          <span className="grid size-9 place-items-center rounded-[10px] bg-primary">
            <ToothIcon className="size-5 text-white" />
          </span>
          <span className="font-display text-[16px] font-extrabold tracking-[-0.02em] text-ink">DentalScribe</span>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-5 py-8">
        {isLoading ? (
          <div className="grid place-items-center py-24 text-primary">
            <Spinner className="size-7" />
          </div>
        ) : isError || !data ? (
          <div className="grid place-items-center gap-2 py-24 text-center">
            <p className="font-display text-[16px] font-bold text-ink">Link unavailable</p>
            <p className="max-w-md text-[13px] text-muted">
              This shared report link is invalid or has expired. Please ask your clinic for a new link.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h1 className="mb-1 text-[24px] font-extrabold">Your care report</h1>
              <p className="text-[13.5px] text-muted">
                {data.patient_first_name ? `${data.patient_first_name} · ` : ''}
                {procedureLabel(data.procedure_type)}
                {data.clinic_name ? ` · ${data.clinic_name}` : ''}
              </p>
            </div>
            <ReportView content={data.content} summary={data.summary} disclaimer={data.disclaimer} />
          </>
        )}
      </main>
    </div>
  )
}
