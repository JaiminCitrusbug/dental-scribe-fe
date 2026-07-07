import { useQuery } from '@tanstack/react-query'
import { getKbDocument, listKbDocuments } from './api'

export function useKbDocuments() {
  return useQuery({ queryKey: ['kb', 'documents'], queryFn: listKbDocuments })
}

export function useKbDocument(id: string | null) {
  return useQuery({
    queryKey: ['kb', 'document', id],
    queryFn: () => getKbDocument(id as string),
    enabled: Boolean(id),
  })
}
