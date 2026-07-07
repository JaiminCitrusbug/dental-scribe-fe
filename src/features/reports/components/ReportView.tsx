import type { ReactNode } from 'react'
import { Badge } from '@/components/atoms/Badge'
import { Card, CardBody } from '@/components/atoms/Card'
import { CollapsibleCard } from '@/components/molecules/CollapsibleCard'
import { CopyButton } from '@/components/molecules/CopyButton'
import type { Accent } from '@/lib/accent'
import { reportToText, summaryToText } from '../download'
import type { ReportContent } from '../types'

export const GROUNDING: Record<string, { label: string; tone: Accent }> = {
  kb: { label: 'KB-supported', tone: 'mint' },
  llm_fallback: { label: 'AI-generated', tone: 'sky' },
  insufficient: { label: 'Summary only', tone: 'amber' },
}

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

interface ReportViewProps {
  content: ReportContent | null
  groundingSource: string
  summary?: string | null
  disclaimer?: string | null
}

export function ReportView({ content, groundingSource, summary, disclaimer }: ReportViewProps) {
  const grounding = GROUNDING[groundingSource] ?? GROUNDING.insufficient

  // Normalize (tolerate older reports that lack some fields).
  const c = content
    ? {
        chief_concern: content.chief_concern ?? null,
        assessment: content.assessment ?? null,
        treatment: content.treatment ?? null,
        precautions: content.precautions ?? [],
        recommendations: content.recommendations ?? [],
        offerings: content.offerings ?? [],
        follow_up: content.follow_up ?? null,
        warning_signs: content.warning_signs ?? [],
        citations: content.citations ?? [],
      }
    : null

  return (
    <div className="space-y-4">
      {summary && (
        <CollapsibleCard
          title="Visit summary"
          actions={
            <>
              <Badge tone={grounding.tone}>{grounding.label}</Badge>
              <CopyButton text={summaryToText(summary)} label="Copy summary" />
            </>
          }
        >
          <Bullets items={summaryPoints(summary)} />
        </CollapsibleCard>
      )}

      {!c ? (
        <Card>
          <CardBody className="grid place-items-center gap-2 py-12 text-center">
            <p className="font-display text-[15px] font-bold text-ink">Summary only</p>
            <p className="max-w-md text-[13px] text-muted">
              This conversation didn't contain enough clinical detail for a full care report. The
              summary above reflects what was discussed.
            </p>
          </CardBody>
        </Card>
      ) : (
        <CollapsibleCard
          title="Care report"
          actions={<CopyButton text={reportToText(content)} label="Copy report" />}
          bodyClassName="space-y-5"
        >
          {c.chief_concern && (
              <Field title="Chief concern" accent="bg-sky-ink">
                <p className="text-[13.5px] leading-relaxed text-ink">{c.chief_concern}</p>
              </Field>
            )}
            {c.assessment && (
              <Field title="Findings & assessment" accent="bg-violet-ink">
                <p className="text-[13.5px] leading-relaxed text-ink">{c.assessment}</p>
              </Field>
            )}
            {c.treatment && (
              <Field title="Treatment" accent="bg-primary">
                <p className="text-[13.5px] leading-relaxed text-ink">{c.treatment}</p>
              </Field>
            )}
            {c.precautions.length > 0 && (
              <Field title="Precautions & aftercare" accent="bg-amber-ink">
                <Bullets items={c.precautions} />
              </Field>
            )}
            {c.recommendations.length > 0 && (
              <Field title="Recommendations & next steps" accent="bg-primary">
                <Bullets items={c.recommendations} />
              </Field>
            )}
            {c.offerings.length > 0 && (
              <Field title="Continued-care offerings" accent="bg-mint-ink">
                <Bullets items={c.offerings} />
              </Field>
            )}
            {c.follow_up && (
              <Field title="Follow-up" accent="bg-violet-ink">
                <p className="text-[13.5px] leading-relaxed text-ink">{c.follow_up}</p>
              </Field>
            )}
            {c.warning_signs.length > 0 && (
              <Field title="Warning signs - contact the clinic" accent="bg-rose-ink">
                <Bullets items={c.warning_signs} />
              </Field>
            )}
            {c.citations.length > 0 && (
              <div className="border-t border-border pt-4">
                <h4 className="mb-2 font-display text-[12.5px] font-bold uppercase tracking-wide text-muted">
                  Sources
                </h4>
                <ul className="space-y-1">
                  {c.citations.map((cit, i) => (
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
