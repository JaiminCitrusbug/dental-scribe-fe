import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '@/api/http'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Card, CardBody, CardHeader } from '@/components/atoms/Card'
import { KnowledgeIcon } from '@/components/atoms/icons'
import { FormField } from '@/components/molecules/FormField'
import { useAuth } from '@/features/auth/AuthProvider'
import { changePassword, updateProfile } from './api'

const profileSchema = z.object({
  clinic_name: z.string().min(2, 'Clinic name is required').max(150),
  contact_name: z.string().min(2, 'Your name is required').max(120),
})
type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Add an uppercase letter')
    .regex(/\d/, 'Add a number')
    .regex(/[^A-Za-z0-9]/, 'Add a symbol'),
})
type PasswordValues = z.infer<typeof passwordSchema>

function Banner({ tone, children }: { tone: 'ok' | 'err'; children: string }) {
  const cls =
    tone === 'ok'
      ? 'border-mint-ink/25 bg-mint text-mint-ink'
      : 'border-rose-ink/25 bg-rose text-rose-ink'
  return <div className={`rounded-md border px-3 py-2.5 text-[13px] font-medium ${cls}`}>{children}</div>
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { clinic, updateClinic } = useAuth()
  const [profileMsg, setProfileMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { clinic_name: clinic?.clinic_name ?? '', contact_name: clinic?.contact_name ?? '' },
  })
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  const profileMut = useMutation({
    mutationFn: (v: ProfileValues) => updateProfile(v.clinic_name, v.contact_name),
    onSuccess: (updated) => {
      updateClinic(updated)
      setProfileMsg({ tone: 'ok', text: 'Profile updated.' })
    },
    onError: (e) => setProfileMsg({ tone: 'err', text: e instanceof ApiError ? e.message : 'Failed to update.' }),
  })

  const passwordMut = useMutation({
    mutationFn: (v: PasswordValues) => changePassword(v.current_password, v.password),
    onSuccess: () => {
      passwordForm.reset({ current_password: '', password: '' })
      setPwMsg({ tone: 'ok', text: 'Password changed.' })
    },
    onError: (e) => setPwMsg({ tone: 'err', text: e instanceof ApiError ? e.message : 'Failed to change password.' }),
  })

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-[22px]">
        <h1 className="mb-1.5 text-[25px] font-extrabold">Settings</h1>
        <p className="text-[13.5px] text-muted">Manage your clinic profile and password.</p>
      </div>

      <Card className="mb-4">
        <CardHeader title="Clinic profile" />
        <CardBody>
          <form
            onSubmit={profileForm.handleSubmit((v) => {
              setProfileMsg(null)
              profileMut.mutate(v)
            })}
            className="space-y-4"
            noValidate
          >
            {profileMsg && <Banner tone={profileMsg.tone}>{profileMsg.text}</Banner>}
            <FormField label="Clinic name" htmlFor="clinic_name" error={profileForm.formState.errors.clinic_name?.message}>
              <Input id="clinic_name" {...profileForm.register('clinic_name')} />
            </FormField>
            <FormField label="Your name" htmlFor="contact_name" error={profileForm.formState.errors.contact_name?.message}>
              <Input id="contact_name" {...profileForm.register('contact_name')} />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <Input id="email" value={clinic?.email ?? ''} disabled />
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" disabled={profileMut.isPending}>
                {profileMut.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Knowledge base" />
        <CardBody className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-[11px] bg-amber text-amber-ink">
              <KnowledgeIcon className="size-5" />
            </span>
            <p className="text-[13px] text-muted">Browse the dental care library that grounds your reports.</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/knowledge-base')}>
            Open
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Change password" />
        <CardBody>
          <form
            onSubmit={passwordForm.handleSubmit((v) => {
              setPwMsg(null)
              passwordMut.mutate(v)
            })}
            className="space-y-4"
            noValidate
          >
            {pwMsg && <Banner tone={pwMsg.tone}>{pwMsg.text}</Banner>}
            <FormField label="Current password" htmlFor="current_password" error={passwordForm.formState.errors.current_password?.message}>
              <Input id="current_password" type="password" autoComplete="current-password" {...passwordForm.register('current_password')} />
            </FormField>
            <FormField label="New password" htmlFor="password" error={passwordForm.formState.errors.password?.message}>
              <Input id="password" type="password" autoComplete="new-password" {...passwordForm.register('password')} />
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" disabled={passwordMut.isPending}>
                {passwordMut.isPending ? 'Updating…' : 'Change password'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
