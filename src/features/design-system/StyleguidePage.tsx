import type { ReactNode } from 'react'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Card, CardBody, CardHeader } from '@/components/atoms/Card'
import { Input } from '@/components/atoms/Input'
import { StatTile } from '@/components/molecules/StatTile'
import { MicIcon, PatientsIcon, PlusIcon, ReportIcon } from '@/components/atoms/icons'
import type { Accent } from '@/lib/accent'

const ACCENTS: Accent[] = ['mint', 'sky', 'amber', 'rose', 'violet']

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Card className="mb-4">
      <CardHeader title={title} action={<span className="text-[12.5px] text-muted">{subtitle}</span>} />
      <CardBody className="space-y-4">{children}</CardBody>
    </Card>
  )
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="text-center">
      <div className={`h-14 rounded-md border border-border ${className}`} />
      <p className="mt-1.5 text-[11px] font-medium text-muted">{name}</p>
    </div>
  )
}

export function StyleguidePage() {
  return (
    <>
      <div className="mb-[22px]">
        <h1 className="mb-1.5 text-[25px] font-extrabold">Design System</h1>
        <p className="text-[13.5px] text-muted">
          The locked visual language for DentalScribe - tokens, typography and components. Card depth
          with soft shadows, solid pastel accents. No gradients, no flat design.
        </p>
      </div>

      <Section title="Typography" subtitle="Plus Jakarta Sans (display) · Inter (UI)">
        <div className="space-y-2">
          <p className="font-display text-[32px] font-extrabold tracking-[-0.03em]">Dashboard Overview</p>
          <p className="font-display text-xl font-bold">Section heading - Plus Jakarta Sans 700</p>
          <p className="text-sm text-ink">Body text in Inter - clear, dense, legible for clinical UI.</p>
          <p className="text-[13px] font-medium text-muted">Muted supporting text · Inter 500</p>
          <p className="tnum text-2xl font-extrabold">1,248 · 64 · 24 min</p>
        </div>
      </Section>

      <Section title="Colors" subtitle="Surfaces, primary & accent tints">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          <Swatch name="bg" className="bg-bg" />
          <Swatch name="surface" className="bg-surface" />
          <Swatch name="sidebar" className="bg-sidebar" />
          <Swatch name="primary" className="bg-primary" />
          <Swatch name="ink" className="bg-ink" />
          <Swatch name="border" className="bg-border" />
          <Swatch name="mint" className="bg-mint" />
          <Swatch name="sky" className="bg-sky" />
          <Swatch name="amber" className="bg-amber" />
          <Swatch name="rose" className="bg-rose" />
          <Swatch name="violet" className="bg-violet" />
        </div>
      </Section>

      <Section title="Buttons" subtitle="primary · ghost · subtle">
        <div className="flex flex-wrap items-center gap-3">
          <Button leadingIcon={<MicIcon />}>Start Scribe</Button>
          <Button variant="ghost" leadingIcon={<PlusIcon />}>New Patient</Button>
          <Button variant="subtle">Cancel</Button>
          <Button size="sm">Small</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Inputs" subtitle="text fields">
        <div className="grid max-w-xl grid-cols-2 gap-3">
          <Input placeholder="Patient name" />
          <Input placeholder="Email" type="email" />
        </div>
      </Section>

      <Section title="Badges & Avatars" subtitle="status pills, initials">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="mint">KB-grounded</Badge>
          <Badge tone="amber">LLM fallback</Badge>
          <Badge tone="sky">Draft</Badge>
          <Badge tone="rose">Failed</Badge>
          <Badge tone="violet">Processing</Badge>
        </div>
        <div className="flex items-center gap-2">
          {ACCENTS.map((tone, i) => (
            <Avatar key={tone} initials={`P${i + 1}`} tone={tone} />
          ))}
        </div>
      </Section>

      <Section title="Stat tiles" subtitle="dashboard KPI cards">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile icon={<PatientsIcon />} tone="sky" label="Total Patients" value="1,248" delta={{ dir: 'up', text: 'vs last month' }} />
          <StatTile icon={<MicIcon />} tone="mint" label="Sessions" value="64" delta={{ dir: 'up', text: 'vs last week' }} />
          <StatTile icon={<ReportIcon />} tone="violet" label="Reports" value="57" delta={{ dir: 'flat', text: 'steady' }} />
          <StatTile icon={<ReportIcon />} tone="amber" label="Avg. Duration" value="24" unit="min" delta={{ dir: 'down', text: 'vs last month' }} />
        </div>
      </Section>
    </>
  )
}
