import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteSession, finishSession, getSession, listSessions } from './api'

export function useSessions(
  page: number,
  search = '',
  sortBy = 'created_at',
  order: 'asc' | 'desc' = 'desc',
  status = '',
  dateFrom = '',
  dateTo = '',
) {
  return useQuery({
    queryKey: ['sessions', { page, search, sortBy, order, status, dateFrom, dateTo }],
    queryFn: () => listSessions({ page, pageSize: 10, search, sortBy, order, status, dateFrom, dateTo }),
    placeholderData: (prev) => prev,
  })
}

export function useSessionsForPatient(patientId: string) {
  return useQuery({
    queryKey: ['sessions', 'patient', patientId],
    queryFn: () => listSessions({ page: 1, pageSize: 50, patientId }),
    enabled: Boolean(patientId),
  })
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => getSession(id),
    enabled: Boolean(id),
  })
}

export function useFinishSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => finishSession(id),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['session', s.id] })
    },
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
