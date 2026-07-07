import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { ChevronDownIcon, DownloadIcon } from '@/components/atoms/icons'
import { Dropdown } from '@/components/organisms/Dropdown'
import { useAuth } from '@/features/auth/AuthProvider'
import { procedureLabel } from '@/features/scribe/constants'
import { ReportView } from './components/ReportView'
import { downloadReport, type ReportExport } from './download'
import { useSessionReport } from './hooks'

export function ReportDetailPage() {
  const { sessionId = '' } = useParams()
  const navigate = useNavigate()
  const { clinic } = useAuth()
  const { data: report, isLoading, isError } = useSessionReport(sessionId)

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24 text-primary">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="mx-auto max-w-[720px] py-16 text-center">
        <p className="mb-3 text-[13.5px] text-muted">No report found for this session yet.</p>
        <Button variant="ghost" onClick={() => navigate('/reports')}>
          Back to reports
        </Button>
      </div>
    )
  }

  const exportData: ReportExport = {
    patientName: report.patient_name,
    procedure: report.procedure_type ? procedureLabel(report.procedure_type) : null,
    clinicName: clinic?.clinic_name,
    generatedAt: report.created_at,
    summary: report.summary,
    content: report.content,
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <button onClick={() => navigate('/reports')} className="mb-3 text-[12.5px] font-medium text-muted hover:text-primary">
        ‹ Back to reports
      </button>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1.5 text-[24px] font-extrabold">Care report</h1>
          <p className="text-[13.5px] text-muted">
            {report.patient_name} · {procedureLabel(report.procedure_type)}
          </p>
        </div>
        <Dropdown
          triggerClassName="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-display text-[13.5px] font-bold text-white hover:bg-primary-ink"
          trigger={
            <>
              <DownloadIcon className="size-4" /> Download <ChevronDownIcon className="size-3.5" />
            </>
          }
          items={[
            { label: 'PDF (.pdf)', onClick: () => downloadReport('pdf', exportData) },
            { label: 'Word (.doc)', onClick: () => downloadReport('word', exportData) },
            { label: 'Text (.txt)', onClick: () => downloadReport('txt', exportData) },
          ]}
        />
      </div>

      <ReportView
        content={report.content}
        groundingSource={report.grounding_source}
        summary={report.summary}
        disclaimer={report.disclaimer}
      />
    </div>
  )
}
