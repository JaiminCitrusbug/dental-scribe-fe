import { useState, type ReactNode } from 'react'
import { ChevronDownIcon } from '@/components/atoms/icons'
import { CollapsibleCard } from '@/components/molecules/CollapsibleCard'
import { CopyButton } from '@/components/molecules/CopyButton'
import { RegenButton } from '@/components/molecules/RegenButton'
import { cn } from '@/lib/cn'
import { additionalToText, doctorToText, summaryToText } from '../download'
import type { AdditionalSection, DoctorSection, ReportContent } from '../types'

function summaryPoints(summary: string): string[] {
  return summary
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink">
          <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-muted/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Field({ title, accent, children }: { title: string; accent: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 font-display text-[12.5px] font-bold uppercase tracking-wide text-muted">
        <span className={`size-2 rounded-full ${accent}`} />
        {title}
      </h4>
      {children}
    </div>
  )
}

/** A collapsible sub-card nested inside the outer Care report card. */
function SubSection({
  title,
  note,
  defaultOpen = true,
  children,
}: {
  title: string
  note?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between bg-bg/50 px-4 py-3 text-left hover:bg-bg"
      >
        <span className="font-display text-[13.5px] font-bold text-ink">{title}</span>
        <ChevronDownIcon className={cn('size-4 text-muted transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <div className="space-y-5 px-4 py-4">
          {note && <p className="-mt-1 text-[12px] text-muted">{note}</p>}
          {children}
        </div>
      )}
    </div>
  )
}

const ADDITIONAL_GROUPS: { key: keyof AdditionalSection; label: string; accent: string }[] = [
  { key: 'aftercare', label: 'Aftercare & precautions', accent: 'bg-amber-ink' },
  { key: 'preventive_care', label: 'Preventive care', accent: 'bg-mint-ink' },
  { key: 'follow_up', label: 'Follow-up & recall', accent: 'bg-sky-ink' },
  { key: 'clinic_offerings', label: 'Clinic offerings', accent: 'bg-violet-ink' },
  { key: 'warning_signs', label: 'Warning signs - when to contact the clinic', accent: 'bg-rose-ink' },
]

function normalizeDoctor(content: ReportContent | null): DoctorSection {
  const d = content?.doctor ?? {}
  return {
    chief_concern: d.chief_concern ?? null,
    assessment: d.assessment ?? null,
    treatment: d.treatment ?? null,
    recommendations: d.recommendations ?? [],
  }
}

function normalizeAdditional(content: ReportContent | null): AdditionalSection {
  const a = content?.additional ?? {}
  return {
    aftercare: a.aftercare ?? [],
    preventive_care: a.preventive_care ?? [],
    follow_up: a.follow_up ?? [],
    warning_signs: a.warning_signs ?? [],
    clinic_offerings: a.clinic_offerings ?? [],
  }
}

interface ReportViewProps {
  content: ReportContent | null
  summary?: string | null
  disclaimer?: string | null
  onRegenerateSummary?: () => void
  regeneratingSummary?: boolean
  onRegenerateReport?: () => void
  regeneratingReport?: boolean
}

export function ReportView({
  content,
  summary,
  disclaimer,
  onRegenerateSummary,
  regeneratingSummary,
  onRegenerateReport,
  regeneratingReport,
}: ReportViewProps) {
  const doctor = normalizeDoctor(content)
  const additional = normalizeAdditional(content)
  const citations = content?.citations ?? []

  const hasDoctor = Boolean(
    doctor.chief_concern || doctor.assessment || doctor.treatment || doctor.recommendations.length,
  )
  const hasAdditional = ADDITIONAL_GROUPS.some((g) => additional[g.key].length > 0)
  const hasReport = Boolean(content) && (hasDoctor || hasAdditional)

  const fullReportText = [
    hasDoctor ? `Doctor's recommendations\n${doctorToText(doctor)}` : '',
    hasAdditional ? `Additional recommendations\n${additionalToText(additional)}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  return (
    <div className="space-y-4">
      {summary && (
        <CollapsibleCard
          title="Visit summary"
          actions={
            <>
              {onRegenerateSummary && (
                <RegenButton onClick={onRegenerateSummary} loading={regeneratingSummary} label="Regenerate summary" />
              )}
              <CopyButton text={summaryToText(summary)} label="Copy summary" />
            </>
          }
        >
          <Bullets items={summaryPoints(summary)} />
        </CollapsibleCard>
      )}

      {summary && !hasReport && (
        <div className="rounded-card border border-amber-ink/25 bg-amber/40 px-4 py-4 shadow-card">
          <p className="font-display text-[14px] font-bold text-ink">No care report — insufficient data</p>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            There wasn't enough clinical detail discussed in this visit to generate a care report. The
            visit summary above reflects what was captured.
          </p>
          {onRegenerateReport && (
            <button
              onClick={onRegenerateReport}
              disabled={regeneratingReport}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink hover:bg-bg disabled:opacity-50"
            >
              {regeneratingReport ? 'Generating…' : 'Try regenerating report'}
            </button>
          )}
        </div>
      )}

      {hasReport && (
        <CollapsibleCard
          title="Care report"
          actions={
            <>
              {onRegenerateReport && (
                <RegenButton onClick={onRegenerateReport} loading={regeneratingReport} label="Regenerate report" />
              )}
              <CopyButton text={fullReportText} label="Copy report" />
            </>
          }
          bodyClassName="space-y-3"
        >
          {hasDoctor && (
            <SubSection
              title="Doctor's recommendations"
              note="What the clinician communicated during this visit."
            >
              {doctor.chief_concern && (
                <Field title="Major concerns" accent="bg-sky-ink">
                  <p className="text-[13.5px] leading-relaxed text-ink">{doctor.chief_concern}</p>
                </Field>
              )}
              {doctor.assessment && (
                <Field title="Findings & assessment" accent="bg-violet-ink">
                  <p className="text-[13.5px] leading-relaxed text-ink">{doctor.assessment}</p>
                </Field>
              )}
              {doctor.treatment && (
                <Field title="Treatment" accent="bg-primary">
                  <p className="text-[13.5px] leading-relaxed text-ink">{doctor.treatment}</p>
                </Field>
              )}
              {doctor.recommendations.length > 0 && (
                <Field title="Advised by the clinician" accent="bg-mint-ink">
                  <Bullets items={doctor.recommendations} />
                </Field>
              )}
            </SubSection>
          )}

          <SubSection
            title="Additional recommendations"
            note="Standard-of-care guidance for this visit that was not mentioned during the consultation."
          >
            {hasAdditional ? (
              ADDITIONAL_GROUPS.filter((g) => additional[g.key].length > 0).map((g) => (
                <Field key={g.key} title={g.label} accent={g.accent}>
                  <Bullets items={additional[g.key]} />
                </Field>
              ))
            ) : (
              <p className="text-[13px] text-muted">
                No additional considerations - the consultation covered the standard guidance for this visit.
              </p>
            )}
          </SubSection>

          {citations.length > 0 && (
            <div className="px-1 pt-1">
              <h4 className="mb-1.5 font-display text-[12px] font-bold uppercase tracking-wide text-muted">
                Sources
              </h4>
              <ul className="space-y-1">
                {citations.map((cit, i) => (
                  <li key={i} className="text-[12px] text-muted">
                    {cit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CollapsibleCard>
      )}

      {disclaimer && <p className="px-1 text-[11.5px] leading-relaxed text-muted">{disclaimer}</p>}
    </div>
  )
}
