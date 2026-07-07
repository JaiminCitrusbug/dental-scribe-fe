import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '@/api/http'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { useAuth } from './AuthProvider'
import { AuthShell } from './components/AuthShell'
import { registerSchema, type RegisterValues } from './schemas'

export function RegisterPage() {
  const { register: registerClinic } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterValues) {
    setFormError(null)
    try {
      await registerClinic(values)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.errors?.[0]?.message ?? err.message)
      } else {
        setFormError('Something went wrong. Try again.')
      }
    }
  }

  return (
    <AuthShell
      title="Create your clinic account"
      subtitle="Start scribing dental visits in minutes"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-md border border-rose-ink/25 bg-rose px-3 py-2.5 text-[13px] font-medium text-rose-ink" role="alert">
            {formError}
          </div>
        )}
        <FormField label="Clinic name" htmlFor="clinic_name" error={errors.clinic_name?.message}>
          <Input id="clinic_name" placeholder="Bright Smile Dental" {...register('clinic_name')} />
        </FormField>
        <FormField label="Your name" htmlFor="contact_name" error={errors.contact_name?.message}>
          <Input id="contact_name" placeholder="Dr. Sarah Mitchell" {...register('contact_name')} />
        </FormField>
        <FormField label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@clinic.com" {...register('email')} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" {...register('password')} />
        </FormField>
        <p className="text-[12px] text-muted">
          At least 8 characters with an uppercase letter, a number, and a symbol.
        </p>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
