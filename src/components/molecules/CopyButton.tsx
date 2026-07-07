import { useState } from 'react'
import { CheckIcon, ClipboardIcon } from '@/components/atoms/icons'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          /* clipboard unavailable */
        }
      }}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
      className="grid size-8 place-items-center rounded-md border border-border text-muted hover:bg-bg"
    >
      {copied ? <CheckIcon className="size-4 text-mint-ink" /> : <ClipboardIcon className="size-4" />}
    </button>
  )
}
