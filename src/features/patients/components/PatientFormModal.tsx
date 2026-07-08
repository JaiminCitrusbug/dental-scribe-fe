import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '@/api/http'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Textarea } from '@/components/atoms/Textarea'
import { FormField } from '@/components/molecules/FormField'
import { Modal } from '@/components/organisms/Modal'
import { todayIso, validateDob } from '../dob'
import { useCreatePatient, useUpdatePatient } from '../hooks'
import type { Patient, PatientInput } from '../types'

const schema = z.object({
  first_name: z.string().min(1, 'Required').max(80),
  last_name: z.string().min(1, 'Required').max(80),
  email: z.string().email('Invalid email').max(320).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  date_of_birth: z.string().superRefine((v, ctx) => {
    const r = validateDob(v)
    if (!r.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: r.error ?? 'Invalid date' })
  }),
  medical_notes: z.string().optional().or(z.literal('')),
})
type Values = z.infer<typeof schema>

function blank(patient?: Patient | null): Values {
  return {
    first_name: patient?.first_name ?? '',
    last_name: patient?.last_name ?? '',
    email: patient?.email ?? '',
    phone: patient?.phone ?? '',
    date_of_birth: patient?.date_of_birth ?? '',
    medical_notes: patient?.medical_notes ?? '',
  }
}

function normalize(v: Values): PatientInput {
  const clean = (s?: string) => (s && s.trim() ? s.trim() : null)
  return {
    first_name: v.first_name.trim(),
    last_name: v.last_name.trim(),
    email: clean(v.email),
    phone: clean(v.phone),
    date_of_birth: clean(v.date_of_birth),
    medical_notes: clean(v.medical_notes),
  }
}

interface Props {
  open: boolean
  onClose: () => void
  patient?: Patient | null
}

export function PatientFormModal({ open, onClose, patient }: Props) {
  const isEdit = Boolean(patient)
  const create = useCreatePatient()
  const update = useUpdatePatient()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), values: blank(patient) })

  const pending = create.isPending || update.isPending

  async function onSubmit(v: Values) {
    setFormError(null)
    const input = normalize(v)
    try {
      if (isEdit && patient) await update.mutateAsync({ id: patient.id, input })
      else await create.mutateAsync(input)
      onClose()
    } catch (err) {
      setFormError(err instanceof ApiError ? (err.errors?.[0]?.message ?? err.message) : 'Failed to save')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit patient' : 'Add patient'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="patient-form" disabled={pending}>
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Add patient'}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-md border border-rose-ink/25 bg-rose px-3 py-2.5 text-[13px] font-medium text-rose-ink" role="alert">
            {formError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="first_name" error={errors.first_name?.message}>
            <Input id="first_name" {...register('first_name')} />
          </FormField>
          <FormField label="Last name" htmlFor="last_name" error={errors.last_name?.message}>
            <Input id="last_name" {...register('last_name')} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date of birth" htmlFor="date_of_birth" error={errors.date_of_birth?.message}>
            <Input id="date_of_birth" type="date" max={todayIso()} {...register('date_of_birth')} />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" placeholder="+1 555 0100" {...register('phone')} />
          </FormField>
        </div>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="patient@email.com" {...register('email')} />
        </FormField>
        <FormField label="Medical notes" htmlFor="medical_notes" error={errors.medical_notes?.message}>
          <Textarea id="medical_notes" placeholder="Allergies, history, ongoing treatment…" {...register('medical_notes')} />
        </FormField>
      </form>
    </Modal>
  )
}
