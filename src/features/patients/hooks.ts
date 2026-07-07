import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPatient, deletePatient, getPatient, listPatients, updatePatient } from './api'
import type { PatientInput } from './types'

export function usePatients(
  search: string,
  page: number,
  sortBy = 'created_at',
  order: 'asc' | 'desc' = 'desc',
  dateFrom = '',
  dateTo = '',
) {
  return useQuery({
    queryKey: ['patients', { search, page, sortBy, order, dateFrom, dateTo }],
    queryFn: () => listPatients({ search, page, pageSize: 10, sortBy, order, dateFrom, dateTo }),
    placeholderData: (prev) => prev,
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatient(id),
    enabled: Boolean(id),
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PatientInput) => createPatient(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatientInput }) => updatePatient(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
