import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '@/api/http'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Card, CardBody, CardHeader } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { DownloadIcon, MicIcon, ReportIcon, TrashIcon } from '@/components/atoms/icons'
import { AudioPlayer } from '@/components/molecules/AudioPlayer'
import { CollapsibleCard } from '@/components/molecules/CollapsibleCard'
import { CopyButton } from '@/components/molecules/CopyButton'
import { Modal } from '@/components/organisms/Modal'
import { ReportView } from '@/features/reports/components/ReportView'
import {
  useGenerateReport,
  useRegenerateReport,
  useRegenerateSummary,
  useSessionReport,
} from '@/features/reports/hooks'
import { procedureLabel, sessionStatus } from './constants'
import { useDeleteSession, useFinishSession, useSession } from './hooks'

function prettySpeaker(label: string | null): string {
  if (!label) return 'Speaker'
  const m = label.match(/(\d+)/)
  return m ? `Speaker ${Number(m[1]) + 1}` : label
}

async function downloadAudio(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const objUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objUrl)
  } catch {
    window.open(url, '_blank')
  }
}

export function SessionDetailPage() {
  const { sessionId = '' } = useParams()
  const navigate = useNavigate()
  const { data: session, isLoading } = useSession(sessionId)
  const isCompleted = session?.status === 'completed'
  const { data: report, isLoading: reportLoading } = useSessionReport(sessionId, isCompleted)
  const generate = useGenerateReport()
  const regenSummary = useRegenerateSummary()
  const regenReport = useRegenerateReport()
  const finishMut = useFinishSession()
  const deleteMut = useDeleteSession()
  const [genError, setGenError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleGenerate() {
    setGenError(null)
    try {
      await generate.mutateAsync(sessionId)
    } catch (err) {
      setGenError(err instanceof ApiError ? err.message : 'Could not generate the report.')
    }
  }

  async function handleDelete() {
    await deleteMut.mutateAsync(sessionId)
    setConfirmDelete(false)
    navigate('/sessions')
  }

  if (isLoading || !session) {
    return (
      <div className="grid place-items-center py-24 text-primary">
        <Spinner className="size-7" />
      </div>
    )
  }

  const st = sessionStatus(session.status)
  const segments = session.segments ?? []
  const parts = session.audio_parts ?? []
  const isRecording = session.status === 'recording'
  const transcriptText = segments.map((s) => `${prettySpeaker(s.speaker_label)}: ${s.content}`).join('\n')
  const patientSlug = (session.patient_name ?? 'patient').replace(/[^a-z0-9]+/gi, '-').toLowerCase()

  return (
    <div className="mx-auto max-w-[820px]">
      <button onClick={() => navigate('/sessions')} className="mb-3 text-[12.5px] font-medium text-muted hover:text-primary">
        ‹ Back to sessions
      </button>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1.5 text-[24px] font-extrabold">{session.patient_name ?? 'Session'}</h1>
          <p className="flex items-center gap-2 text-[13.5px] text-muted">
            <Badge tone={st.tone}>{st.label}</Badge>
            <span>{new Date(session.created_at).toLocaleString()}</span>
            {session.procedure_type && <span>· {procedureLabel(session.procedure_type)}</span>}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isRecording && (
            <>
              <Button size="sm" leadingIcon={<MicIcon />} onClick={() => navigate(`/scribe?session=${session.id}`)}>
                Continue recording
              </Button>
              <Button size="sm" variant="ghost" onClick={() => finishMut.mutate(session.id)} disabled={finishMut.isPending}>
                {finishMut.isPending ? 'Finishing…' : 'Finish'}
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="text-rose-ink" leadingIcon={<TrashIcon />} onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Audio playback (one player per recorded sitting) */}
      <Card className="mb-4">
        <CardHeader title={parts.length > 1 ? `Recording · ${parts.length} parts` : 'Recording'} />
        <CardBody className="space-y-3">
          {parts.length === 0 ? (
            <p className="text-[13px] text-muted">No recording is available for this session.</p>
          ) : (
            parts.map((part) => (
              <div key={part.index} className="space-y-1">
                {parts.length > 1 && (
                  <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted">Part {part.index}</p>
                )}
                <div className="flex items-center gap-2">
                  <AudioPlayer src={part.url} className="w-full flex-1" />
                  <button
                    onClick={() =>
                      downloadAudio(
                        part.url,
                        parts.length > 1 ? `recording-${patientSlug}-part${part.index}.webm` : `recording-${patientSlug}.webm`,
                      )
                    }
                    className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted hover:bg-bg"
                    title="Download recording"
                    aria-label="Download recording"
                  >
                    <DownloadIcon className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Transcript */}
      <CollapsibleCard
        title="Transcript"
        className="mb-4"
        actions={segments.length > 0 ? <CopyButton text={transcriptText} label="Copy transcript" /> : undefined}
      >
        {segments.length === 0 ? (
          <p className="text-[13px] text-muted">No transcript captured.</p>
        ) : (
          <div className="space-y-3">
            {segments.map((seg) => (
              <div key={seg.id} className="flex gap-3">
                <span className="mt-0.5 w-[80px] shrink-0 text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                  {prettySpeaker(seg.speaker_label)}
                </span>
                <p className="text-[14px] leading-relaxed text-ink">{seg.content}</p>
              </div>
            ))}
          </div>
        )}
      </CollapsibleCard>

      {/* Report */}
      {report ? (
        <ReportView
          content={report.content}
          summary={report.summary}
          disclaimer={report.disclaimer}
          onRegenerateSummary={() => regenSummary.mutate(sessionId)}
          regeneratingSummary={regenSummary.isPending}
          onRegenerateReport={() => regenReport.mutate(sessionId)}
          regeneratingReport={regenReport.isPending}
        />
      ) : reportLoading ? (
        <div className="grid place-items-center py-8 text-primary">
          <Spinner className="size-6" />
        </div>
      ) : (
        <Card>
          <CardBody className="grid place-items-center gap-3 py-10 text-center">
            <p className="font-display text-[15px] font-bold">No report yet</p>
            <p className="max-w-md text-[13px] text-muted">
              {isCompleted
                ? 'Generate the summary and care report from this transcript.'
                : 'Finish this session to generate the summary and care report.'}
            </p>
            {genError && (
              <div className="rounded-md border border-rose-ink/25 bg-rose px-3 py-2 text-[13px] font-medium text-rose-ink">
                {genError}
              </div>
            )}
            {isCompleted && (
              <Button leadingIcon={<ReportIcon />} onClick={handleGenerate} disabled={generate.isPending}>
                {generate.isPending ? 'Generating…' : 'Generate care report'}
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete session?">
        <p className="text-[13.5px] text-muted">
          This permanently removes the session, its transcript, and any recording. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button className="bg-rose-ink hover:bg-rose-ink/90" onClick={handleDelete} disabled={deleteMut.isPending}>
            {deleteMut.isPending ? 'Deleting…' : 'Delete session'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
