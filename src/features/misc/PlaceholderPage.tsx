import { Card, CardBody } from '@/components/atoms/Card'

interface PlaceholderPageProps {
  title: string
  note?: string
}

/** Temporary page for routes wired but not yet implemented in a later slice. */
export function PlaceholderPage({ title, note }: PlaceholderPageProps) {
  return (
    <>
      <h1 className="mb-1.5 text-[25px] font-extrabold">{title}</h1>
      <p className="mb-[22px] text-[13.5px] text-muted">
        {note ?? 'This area is part of an upcoming build slice.'}
      </p>
      <Card>
        <CardBody className="grid place-items-center py-16 text-center">
          <p className="font-display text-base font-bold text-ink">Coming soon</p>
          <p className="mt-1 max-w-sm text-[13px] text-muted">
            The <span className="font-semibold text-ink">{title}</span> experience will be built in a
            later vertical slice, wired to the backend API.
          </p>
        </CardBody>
      </Card>
    </>
  )
}
