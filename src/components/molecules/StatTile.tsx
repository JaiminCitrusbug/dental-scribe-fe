import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { accentSurface, type Accent } from '@/lib/accent'
import { Card } from '@/components/atoms/Card'

export interface StatDelta {
  dir: 'up' | 'down' | 'flat'
  text: string
}

interface StatTileProps {
  icon: ReactNode
  tone: Accent
  label: string
  value: string
  unit?: string
  delta?: StatDelta
}

const deltaColor: Record<StatDelta['dir'], string> = {
  up: 'text-mint-ink',
  down: 'text-rose-ink',
  flat: 'text-muted',
}

export function StatTile({ icon, tone, label, value, unit, delta }: StatTileProps) {
  return (
    <Card className="p-[17px]">
      <div className="flex items-center gap-2.5">
        <span className={cn('grid size-8 place-items-center rounded-[9px]', accentSurface[tone])}>
          <span className="size-[17px]">{icon}</span>
        </span>
        <p className="text-[13px] font-semibold text-muted">{label}</p>
      </div>
      <p className="mt-3.5 font-display text-[30px] font-extrabold leading-none tracking-[-0.03em] tnum">
        {value}
        {unit && <span className="ml-1 text-[15px] font-semibold text-muted">{unit}</span>}
      </p>
      {delta && <p className={cn('mt-2 text-[12px] font-semibold', deltaColor[delta.dir])}>{delta.text}</p>}
    </Card>
  )
}
