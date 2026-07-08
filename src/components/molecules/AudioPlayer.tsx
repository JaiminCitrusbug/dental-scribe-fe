import { useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/atoms/Spinner'
import { cn } from '@/lib/cn'

/**
 * Audio player for MediaRecorder/WebM recordings.
 *
 * WebM blobs carry no duration in their header, so the browser first reports
 * `Infinity`/`0`/provisional durations and only settles on the real value after
 * scanning to the end. We force that scan (seek to the end), and reveal the player
 * only once the duration has *settled* (debounced) — otherwise the native controls
 * briefly flash `0:00` before the real total appears.
 */
export function AudioPlayer({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const fixed = useRef(false)
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    fixed.current = false
    const safety = setTimeout(() => setReady(true), 30000) // never stay stuck on the loader
    return () => {
      clearTimeout(safety)
      if (revealTimer.current) clearTimeout(revealTimer.current)
    }
  }, [src])

  // Reveal only after the duration stops changing for a moment (settled), so the
  // total time is correct the instant the player appears.
  function tryReveal() {
    const a = ref.current
    if (!a || fixed.current) return
    if (a.duration === Infinity || Number.isNaN(a.duration) || a.duration <= 0) return
    if (revealTimer.current) clearTimeout(revealTimer.current)
    revealTimer.current = setTimeout(() => {
      const audio = ref.current
      if (!audio || fixed.current) return
      if (audio.duration === Infinity || Number.isNaN(audio.duration) || audio.duration <= 0) return
      fixed.current = true
      audio.currentTime = 0
      setReady(true)
    }, 400)
  }

  function onLoadedMetadata() {
    const a = ref.current
    if (!a) return
    if (a.duration === Infinity || Number.isNaN(a.duration) || a.duration <= 0) {
      // Force the browser to scan to the end to establish the true duration.
      try {
        a.currentTime = 1e101
      } catch {
        /* not seekable yet */
      }
    } else {
      tryReveal()
    }
  }

  return (
    <div className={className}>
      {!ready && (
        <div className="flex h-[42px] items-center gap-2 rounded-md border border-border bg-bg px-3 text-[12px] font-medium text-muted">
          <Spinner className="size-4" /> Loading recording - it might take some time…
        </div>
      )}
      <audio
        ref={ref}
        controls
        preload="metadata"
        src={src}
        className={cn('w-full', !ready && 'hidden')}
        onLoadedMetadata={onLoadedMetadata}
        onDurationChange={tryReveal}
        onError={() => setReady(true)}
      >
        Your browser does not support audio playback.
      </audio>
    </div>
  )
}
