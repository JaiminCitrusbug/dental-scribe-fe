import { useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/atoms/Spinner'
import { cn } from '@/lib/cn'

/**
 * Audio player for MediaRecorder/WebM recordings.
 *
 * Two problems it solves:
 *  1. WebM blobs carry no duration in their header, so the browser reports
 *     `Infinity` (scrubber jumps to the end, total time unknown). We seek to the
 *     end once, which forces the browser to read every cluster and compute the
 *     real duration, then reset to the start.
 *  2. While that metadata loads, the native controls show a misleading `0:00` and
 *     an empty bar. We show a loading skeleton and only reveal the player once the
 *     real duration is known.
 */
export function AudioPlayer({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const fixed = useRef(false)
  const [ready, setReady] = useState(false)

  // Reset when the source changes; reveal after a timeout as a safety net.
  useEffect(() => {
    setReady(false)
    fixed.current = false
    const t = setTimeout(() => setReady(true), 20000)
    return () => clearTimeout(t)
  }, [src])

  function onLoadedMetadata() {
    const audio = ref.current
    if (!audio) return
    if (audio.duration === Infinity || Number.isNaN(audio.duration)) {
      // Force the browser to scan to the end to establish the true duration.
      try {
        audio.currentTime = 1e101
      } catch {
        /* seeking not ready yet */
      }
    } else {
      fixed.current = true
      setReady(true)
    }
  }

  function onDurationChange() {
    const audio = ref.current
    if (!audio || fixed.current) return
    if (audio.duration !== Infinity && !Number.isNaN(audio.duration) && audio.duration > 0) {
      fixed.current = true
      audio.currentTime = 0
      setReady(true)
    }
  }

  return (
    <div className={className}>
      {!ready && (
        <div className="flex h-[42px] items-center gap-2 rounded-md border border-border bg-bg px-3 text-[12px] font-medium text-muted">
          <Spinner className="size-4" /> Loading recording…
        </div>
      )}
      <audio
        ref={ref}
        controls
        preload="metadata"
        src={src}
        className={cn('w-full', !ready && 'hidden')}
        onLoadedMetadata={onLoadedMetadata}
        onDurationChange={onDurationChange}
        onError={() => setReady(true)}
      >
        Your browser does not support audio playback.
      </audio>
    </div>
  )
}
