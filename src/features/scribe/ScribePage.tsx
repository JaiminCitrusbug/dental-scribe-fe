import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '@/api/http'
import { Button } from '@/components/atoms/Button'
import { Card, CardBody, CardHeader } from '@/components/atoms/Card'
import { MicIcon, ReportIcon } from '@/components/atoms/icons'
import { useGenerateReport } from '@/features/reports/hooks'
import { startSession } from './api'
import { PatientStep, type PatientSelection } from './components/PatientStep'
import { useFinishSession, useSession } from './hooks'
import type { ScribeSession } from './types'
import { useScribeStream } from './useScribeStream'

function prettySpeaker(label: string | null): string {
  if (!label) return 'Speaker'
  const m = label.match(/(\d+)/)
  return m ? `Speaker ${Number(m[1]) + 1}` : label
}

function mmss(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ScribePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const continueId = searchParams.get('session')

  const [step, setStep] = useState<'setup' | 'recording' | 'done'>(continueId ? 'recording' : 'setup')
  const [selection, setSelection] = useState<PatientSelection | null>(null)
  const [session, setSession] = useState<ScribeSession | null>(null)
  const [startError, setStartError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [genError, setGenError] = useState<string | null>(null)

  const stream = useScribeStream()
  const startStream = stream.start
  const seedSegments = stream.seed
  const generate = useGenerateReport()
  const finishMut = useFinishSession()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: continueSession } = useSession(continueId ?? '')

  // Continue an existing (paused) session. `startStream` is a stable callback, so
  // this re-runs on a StrictMode remount and re-opens the socket the teardown closed.
  useEffect(() => {
    if (!continueId) return
    void startStream(continueId)
  }, [continueId, startStream])
  // Seed the existing transcript so continuing clearly appends to the same session.
  useEffect(() => {
    if (continueSession && !session) {
      setSession(continueSession)
      const existing = (continueSession.segments ?? []).map((s) => ({
        speaker: s.speaker_label,
        text: s.content,
      }))
      if (existing.length) seedSegments(existing)
    }
  }, [continueSession, session, seedSegments])

  const startMutation = useMutation({
    mutationFn: startSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['patients'] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  useEffect(() => {
    if (step === 'recording' && stream.status === 'done') setStep('done')
  }, [step, stream.status])

  useEffect(() => {
    if (stream.status === 'recording') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [stream.status])

  const activeId = session?.id ?? continueId ?? ''

  async function handleStart() {
    if (!selection) return
    setStartError(null)
    try {
      const created = await startMutation.mutateAsync({ ...selection })
      setSession(created)
      setElapsed(0)
      setStep('recording')
      void stream.start(created.id)
    } catch (err) {
      setStartError(err instanceof ApiError ? err.message : 'Could not start the session.')
    }
  }

  function handleResume() {
    if (activeId) void stream.start(activeId)
  }

  async function handleFinish() {
    if (!activeId) return
    if (stream.status === 'paused') {
      try {
        await finishMut.mutateAsync(activeId)
        stream.markDone()
      } catch {
        /* stay paused on failure */
      }
    } else {
      stream.finish()
    }
  }

  function handleStartAnother() {
    stream.reset()
    setSession(null)
    setSelection(null)
    setElapsed(0)
    setGenError(null)
    navigate('/scribe')
    setStep('setup')
  }

  async function handleGenerate() {
    if (!activeId) return
    setGenError(null)
    try {
      await generate.mutateAsync(activeId)
      navigate(`/reports/${activeId}`)
    } catch (err) {
      setGenError(err instanceof ApiError ? err.message : 'Could not generate the report.')
    }
  }

  // ---------- SETUP ----------
  if (step === 'setup') {
    return (
      <div className="mx-auto max-w-[640px]">
        <div className="mb-[22px]">
          <h1 className="mb-1.5 text-[25px] font-extrabold">Start Scribe</h1>
          <p className="text-[13.5px] text-muted">Choose the patient, then begin recording the visit.</p>
        </div>

        <Card>
          <CardHeader title="Patient" />
          <CardBody>
            <PatientStep onChange={setSelection} />
          </CardBody>
        </Card>

        <p className="mt-3 text-[12.5px] text-muted">
          No procedure is selected - the treatment and diagnosis are identified automatically from the
          conversation when the report is generated.
        </p>

        {startError && (
          <div className="mt-4 rounded-md border border-rose-ink/25 bg-rose px-3 py-2.5 text-[13px] font-medium text-rose-ink">
            {startError}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[12.5px] text-muted">Your microphone will be requested when recording starts.</p>
          <Button leadingIcon={<MicIcon />} disabled={!selection || startMutation.isPending} onClick={handleStart}>
            {startMutation.isPending ? 'Starting…' : 'Start recording'}
          </Button>
        </div>
      </div>
    )
  }

  // ---------- RECORDING ----------
  if (step === 'recording') {
    const paused = stream.status === 'paused' || stream.status === 'pausing'
    const statusText =
      stream.status === 'connecting'
        ? 'Connecting…'
        : paused
          ? 'Paused'
          : stream.status === 'stopping'
            ? 'Finishing…'
            : 'Recording'

    return (
      <div className="mx-auto max-w-[720px]">
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2.5">
                {stream.status === 'recording' ? (
                  <span className="size-2.5 animate-pulse rounded-full bg-rose-ink" />
                ) : (
                  <span className="size-2.5 rounded-full bg-amber-ink" />
                )}
                {statusText}
              </span>
            }
            action={<span className="font-display text-[15px] font-bold tabular-nums text-ink">{mmss(elapsed)}</span>}
          />
          <CardBody>
            {stream.error ? (
              <div className="space-y-3">
                <div className="rounded-md border border-rose-ink/25 bg-rose px-3 py-2.5 text-[13px] font-medium text-rose-ink">
                  {stream.error}
                </div>
                <Button variant="ghost" onClick={() => navigate('/sessions')}>
                  Back to sessions
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md bg-bg px-3.5 py-2.5">
                  <p className="text-[13px] font-medium text-muted">{session?.patient_name ?? 'Session'}</p>
                  <div className="flex gap-2">
                    {paused ? (
                      <Button size="sm" variant="ghost" onClick={handleResume}>
                        Resume
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={stream.pause} disabled={stream.status !== 'recording'}>
                        Pause
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-rose-ink hover:bg-rose-ink/90"
                      onClick={handleFinish}
                      disabled={stream.status === 'stopping' || finishMut.isPending}
                    >
                      Stop &amp; finish
                    </Button>
                  </div>
                </div>

                <div className="min-h-[280px] space-y-3">
                  {stream.segments.length === 0 && !stream.interim && (
                    <p className="py-16 text-center text-[13px] text-muted">
                      {paused ? 'Paused - resume to continue capturing.' : 'Listening… speak to see the live transcript appear.'}
                    </p>
                  )}
                  {stream.segments.map((seg, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="mt-0.5 w-[76px] shrink-0 text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                        {prettySpeaker(seg.speaker)}
                      </span>
                      <p className="text-[14px] leading-relaxed text-ink">{seg.text}</p>
                    </div>
                  ))}
                  {stream.interim && (
                    <div className="flex gap-3 opacity-60">
                      <span className="mt-0.5 w-[76px] shrink-0 text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                        {prettySpeaker(stream.interim.speaker)}
                      </span>
                      <p className="text-[14px] leading-relaxed text-ink">{stream.interim.text}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    )
  }

  // ---------- DONE ----------
  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-[22px]">
        <h1 className="mb-1.5 text-[25px] font-extrabold">Visit captured</h1>
        <p className="text-[13.5px] text-muted">{session?.patient_name} · transcript saved.</p>
      </div>

      <Card>
        <CardHeader title="Transcript" />
        <CardBody>
          {stream.segments.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-muted">No speech was captured.</p>
          ) : (
            <div className="space-y-3">
              {stream.segments.map((seg, i) => (
                <div key={i} className="flex gap-3">
                  <span className="mt-0.5 w-[76px] shrink-0 text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                    {prettySpeaker(seg.speaker)}
                  </span>
                  <p className="text-[14px] leading-relaxed text-ink">{seg.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="mt-4 rounded-card border border-border bg-sky/40 px-4 py-3 text-[13px] text-sky-ink">
        Generate the AI summary &amp; grounded care report from this transcript.
      </div>

      {genError && (
        <div className="mt-4 rounded-md border border-rose-ink/25 bg-rose px-3 py-2.5 text-[13px] font-medium text-rose-ink">
          {genError}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button onClick={handleGenerate} disabled={generate.isPending} leadingIcon={<ReportIcon />}>
          {generate.isPending ? 'Generating…' : 'Generate care report'}
        </Button>
        <Button variant="ghost" onClick={() => navigate(`/sessions/${activeId}`)}>
          View session
        </Button>
        <Button variant="ghost" onClick={handleStartAnother} leadingIcon={<MicIcon />}>
          Start another
        </Button>
      </div>
    </div>
  )
}
