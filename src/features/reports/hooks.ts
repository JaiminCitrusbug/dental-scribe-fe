import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateReport, getPublicReport, getSessionReport, listReports, shareReport } from './api'

export function useReports(
  page: number,
  search = '',
  sortBy = 'created_at',
  order: 'asc' | 'desc' = 'desc',
  dateFrom = '',
  dateTo = '',
) {
  return useQuery({
    queryKey: ['reports', { page, search, sortBy, order, dateFrom, dateTo }],
    queryFn: () => listReports({ page, pageSize: 10, search, sortBy, order, dateFrom, dateTo }),
    placeholderData: (prev) => prev,
  })
}

export function useSessionReport(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: ['report', sessionId],
    queryFn: () => getSessionReport(sessionId),
    enabled,
    retry: false,
  })
}

export function useGenerateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => generateReport(sessionId),
    onSuccess: (report) => {
      qc.invalidateQueries({ queryKey: ['reports'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.setQueryData(['report', report.scribe_session_id], report)
    },
  })
}

export function useShareReport() {
  return useMutation({ mutationFn: (reportId: string) => shareReport(reportId) })
}

export function usePublicReport(token: string) {
  return useQuery({
    queryKey: ['public-report', token],
    queryFn: () => getPublicReport(token),
    retry: false,
  })
}
