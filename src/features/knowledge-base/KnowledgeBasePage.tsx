import { useState } from 'react'
import { Card, CardBody } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { ChevronRightIcon, KnowledgeIcon } from '@/components/atoms/icons'
import { Modal } from '@/components/organisms/Modal'
import { accentForKey, accentSurface } from '@/lib/accent'
import { useKbDocument, useKbDocuments } from './hooks'

function SectionContent({ content }: { content: string }) {
  const lines = content.split('\n').filter((l) => l.trim())
  const bullets = lines.filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '))
  if (bullets.length >= lines.length / 2 && bullets.length > 0) {
    return (
      <ul className="space-y-1.5">
        {lines.map((l, i) => {
          const t = l.trim()
          const isBullet = t.startsWith('- ') || t.startsWith('* ')
          return isBullet ? (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-muted/60" />
              <span>{t.replace(/^[-*]\s+/, '')}</span>
            </li>
          ) : (
            <p key={i} className="text-[13px] leading-relaxed text-ink">
              {t}
            </p>
          )
        })}
      </ul>
    )
  }
  return <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink">{content}</p>
}

export function KnowledgeBasePage() {
  const { data: documents, isLoading } = useKbDocuments()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: detail, isLoading: detailLoading } = useKbDocument(selectedId)

  return (
    <>
      <div className="mb-[22px]">
        <h1 className="mb-1.5 text-[25px] font-extrabold">Knowledge Base</h1>
        <p className="text-[13.5px] text-muted">
          The dental care library that grounds your patient reports. {documents?.length ?? 0} procedures.
        </p>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20 text-primary">
          <Spinner className="size-7" />
        </div>
      ) : (documents?.length ?? 0) === 0 ? (
        <Card>
          <CardBody className="grid place-items-center gap-2 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-amber text-amber-ink">
              <KnowledgeIcon className="size-6" />
            </span>
            <p className="font-display text-[15px] font-bold">Knowledge base is empty</p>
            <p className="max-w-md text-[13px] text-muted">
              Run <code className="rounded bg-bg px-1">python scripts/kb_ingest.py</code> in the backend to load the dental care library.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1">
          {documents!.map((doc) => (
            <button key={doc.id} onClick={() => setSelectedId(doc.id)} className="text-left">
              <Card className="h-full transition-colors hover:border-[#D5DBE4]">
                <CardBody className="flex h-full flex-col gap-3">
                  <span className={`grid size-10 place-items-center rounded-[11px] ${accentSurface[accentForKey(doc.id)]}`}>
                    <KnowledgeIcon className="size-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-[15px] font-bold leading-snug">{doc.title}</p>
                    <p className="mt-1 text-[12px] text-muted">
                      {doc.section_count} sections{doc.source_name ? ` · ${doc.source_name}` : ''}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[12.5px] font-semibold text-primary">
                    View care guide <ChevronRightIcon className="size-3.5" />
                  </span>
                </CardBody>
              </Card>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title={detail?.title ?? 'Care guide'}
        className="max-w-[640px]"
      >
        {detailLoading || !detail ? (
          <div className="grid place-items-center py-12 text-primary">
            <Spinner className="size-6" />
          </div>
        ) : (
          <div className="space-y-5">
            {detail.sections.map((s, i) => (
              <div key={i}>
                <h4 className="mb-2 font-display text-[13px] font-bold uppercase tracking-wide text-muted">
                  {s.section}
                </h4>
                <SectionContent content={s.content} />
              </div>
            ))}
            {detail.source_url && (
              <p className="border-t border-border pt-3 text-[12px] text-muted">
                Source:{' '}
                <a href={detail.source_url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                  {detail.source_name ?? detail.source_url}
                </a>
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
