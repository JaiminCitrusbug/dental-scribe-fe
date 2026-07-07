import { useRef } from 'react'

/**
 * Audio player that fixes MediaRecorder/WebM blobs reporting `Infinity` duration
 * (their headers carry no duration, so the scrubber jumps to the end and the total
 * time is unknown). On load we seek to the end once, which forces the browser to
 * read every cluster and compute the real duration, then we reset to the start.
 */
export function AudioPlayer({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const fixed = useRef(false)

  function onLoadedMetadata() {
    const audio = ref.current
    if (!audio) return
    fixed.current = false
    if (audio.duration === Infinity || Number.isNaN(audio.duration)) {
      // Force the browser to scan to the end to establish the true duration.
      try {
        audio.currentTime = 1e101
      } catch {
        /* seeking not ready yet */
      }
    } else {
      fixed.current = true
    }
  }

  function onDurationChange() {
    const audio = ref.current
    if (!audio || fixed.current) return
    if (audio.duration !== Infinity && !Number.isNaN(audio.duration) && audio.duration > 0) {
      fixed.current = true
      audio.currentTime = 0
    }
  }

  return (
    <audio
      ref={ref}
      controls
      preload="metadata"
      src={src}
      className={className}
      onLoadedMetadata={onLoadedMetadata}
      onDurationChange={onDurationChange}
    >
      Your browser does not support audio playback.
    </audio>
  )
}
