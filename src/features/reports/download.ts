import { jsPDF } from 'jspdf'
import type { ReportContent } from './types'

export interface ReportExport {
  patientName?: string | null
  procedure?: string | null
  clinicName?: string | null
  generatedAt?: string | null
  summary?: string | null
  content: ReportContent | null
}

interface Section {
  title: string
  lines: string[]
}

function summaryPoints(summary: string): string[] {
  return summary
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}

function reportSections(content: ReportContent | null): Section[] {
  if (!content) return []
  const s: Section[] = []
  const add = (title: string, value?: string | null) => {
    if (value && value.trim()) s.push({ title, lines: [value.trim()] })
  }
  const addList = (title: string, list?: string[]) => {
    if (list && list.length) s.push({ title, lines: list })
  }
  add('Chief Concern', content.chief_concern)
  add('Findings & Assessment', content.assessment)
  add('Treatment', content.treatment)
  addList('Precautions & Aftercare', content.precautions)
  addList('Recommendations & Next Steps', content.recommendations)
  addList('Continued-care Offerings', content.offerings)
  add('Follow-up', content.follow_up)
  addList('Warning Signs', content.warning_signs)
  addList('Sources', content.citations)
  return s
}

function allSections(data: ReportExport): Section[] {
  const s: Section[] = []
  if (data.summary) s.push({ title: 'Visit Summary', lines: summaryPoints(data.summary) })
  s.push(...reportSections(data.content))
  return s
}

function metaLine(data: ReportExport): string {
  const bits = [data.patientName, data.procedure, data.clinicName].filter(Boolean)
  const date = data.generatedAt ? new Date(data.generatedAt).toLocaleDateString() : ''
  return [bits.join(' · '), date].filter(Boolean).join('  ·  ')
}

function fileBase(data: ReportExport): string {
  const name = (data.patientName ?? 'patient').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  return `care-report-${name}`
}

// ---- Plain text (also used for TXT + clipboard) ----
export function summaryToText(summary: string): string {
  return summaryPoints(summary)
    .map((p) => `• ${p}`)
    .join('\n')
}

export function reportToText(content: ReportContent | null): string {
  return reportSections(content)
    .map((sec) => `${sec.title}\n${sec.lines.map((l) => `• ${l}`).join('\n')}`)
    .join('\n\n')
}

function fullText(data: ReportExport): string {
  const header = `Care Report\n${metaLine(data)}\n`
  const body = allSections(data)
    .map((sec) => `${sec.title.toUpperCase()}\n${sec.lines.map((l) => `• ${l}`).join('\n')}`)
    .join('\n\n')
  return `${header}\n${body}\n`
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadTxt(data: ReportExport): void {
  triggerDownload(new Blob([fullText(data)], { type: 'text/plain;charset=utf-8' }), `${fileBase(data)}.txt`)
}

export function downloadWord(data: ReportExport): void {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const body = allSections(data)
    .map(
      (sec) =>
        `<h2 style="font-family:Arial;font-size:13px;color:#444">${esc(sec.title)}</h2>` +
        `<ul>${sec.lines.map((l) => `<li style="font-family:Arial;font-size:12px">${esc(l)}</li>`).join('')}</ul>`,
    )
    .join('')
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body style="font-family:Arial">` +
    `<h1 style="font-size:18px">Care Report</h1><p style="color:#666;font-size:12px">${esc(metaLine(data))}</p>${body}</body></html>`
  triggerDownload(new Blob([html], { type: 'application/msword' }), `${fileBase(data)}.doc`)
}

export function downloadPdf(data: ReportExport): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  const maxW = doc.internal.pageSize.getWidth() - margin * 2
  let y = margin

  const write = (text: string, size: number, style: 'normal' | 'bold', gap = 4) => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    for (const line of doc.splitTextToSize(text, maxW) as string[]) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += size + gap
    }
  }

  write('Care Report', 18, 'bold', 6)
  doc.setTextColor(120)
  write(metaLine(data), 10, 'normal', 10)
  doc.setTextColor(20)
  for (const sec of allSections(data)) {
    write(sec.title, 12, 'bold', 5)
    for (const line of sec.lines) write(`•  ${line}`, 10.5, 'normal', 4)
    y += 8
  }
  doc.save(`${fileBase(data)}.pdf`)
}

export type DownloadFormat = 'pdf' | 'word' | 'txt'

export function downloadReport(format: DownloadFormat, data: ReportExport): void {
  if (format === 'pdf') downloadPdf(data)
  else if (format === 'word') downloadWord(data)
  else downloadTxt(data)
}
