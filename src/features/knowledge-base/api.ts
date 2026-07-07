import { http } from '@/api/http'
import type { KbDocumentDetail, KbDocumentSummary } from './types'

export function listKbDocuments(): Promise<KbDocumentSummary[]> {
  return http.get<KbDocumentSummary[]>('/knowledge-base/documents')
}

export function getKbDocument(id: string): Promise<KbDocumentDetail> {
  return http.get<KbDocumentDetail>(`/knowledge-base/documents/${id}`)
}
