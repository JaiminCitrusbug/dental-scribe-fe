import { useCallback, useEffect, useRef, useState } from 'react'
import { getAccessToken, wsBaseUrl } from '@/api/http'

export type ScribeStatus =
  | 'idle'
  | 'connecting'
  | 'recording'
  | 'pausing'
  | 'paused'
  | 'stopping'
  | 'done'
  | 'error'

export interface LiveSegment {
  speaker: string | null
  text: string
}

function pickMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

export function useScribeStream() {
  const [status, setStatus] = useState<ScribeStatus>('idle')
  const [segments, setSegments] = useState<LiveSegment[]>([])
  const [interim, setInterim] = useState<LiveSegment | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const teardownMedia = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    recorderRef.current = null
    streamRef.current = null
  }, [])

  const start = useCallback(
    async (sessionId: string) => {
      setStatus('connecting')
      setError(null)
      setInterim(null)

      const token = getAccessToken()
      if (!token) {
        setError('Your session expired. Please log in again.')
        setStatus('error')
        return
      }

      const ws = new WebSocket(`${wsBaseUrl()}/api/v1/scribe/ws/${sessionId}`)
      ws.binaryType = 'arraybuffer'
      wsRef.current = ws

      const beginCapture = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          streamRef.current = stream
          const mimeType = pickMimeType()
          const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
          recorderRef.current = recorder
          recorder.ondataavailable = async (e) => {
            if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
              ws.send(await e.data.arrayBuffer())
            }
          }
          recorder.start(250)
          setStatus('recording')
        } catch {
          setError('Microphone access was denied. Enable it and try again.')
          setStatus('error')
          try {
            ws.close()
          } catch {
            /* noop */
          }
        }
      }

      ws.onopen = () => {
        if (wsRef.current !== ws) return
        ws.send(JSON.stringify({ token }))
      }
      ws.onmessage = (e) => {
        if (wsRef.current !== ws) return
        let msg: { type: string; text?: string; speaker?: string | null; message?: string }
        try {
          msg = JSON.parse(e.data)
        } catch {
          return
        }
        if (msg.type === 'ready') void beginCapture()
        else if (msg.type === 'segment') {
          setSegments((prev) => [...prev, { speaker: msg.speaker ?? null, text: msg.text ?? '' }])
          setInterim(null)
        } else if (msg.type === 'partial') {
          setInterim({ speaker: msg.speaker ?? null, text: msg.text ?? '' })
        } else if (msg.type === 'error') {
          teardownMedia()
          setError(msg.message ?? 'Transcription service error.')
          setStatus('error')
        } else if (msg.type === 'paused') {
          teardownMedia()
          setStatus('paused')
        } else if (msg.type === 'done') {
          teardownMedia()
          setStatus('done')
        }
      }
      ws.onerror = () => {
        if (wsRef.current !== ws) return
        setError('Connection error during transcription.')
        setStatus((s) => (s === 'done' ? s : 'error'))
      }
      ws.onclose = () => {
        if (wsRef.current !== ws) return
        teardownMedia()
        setStatus((s) => (s === 'done' || s === 'error' ? s : 'paused'))
      }
    },
    [teardownMedia],
  )

  const pause = useCallback(() => {
    setStatus('pausing')
    teardownMedia()
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'pause' }))
    }
  }, [teardownMedia])

  const finish = useCallback(() => {
    setStatus('stopping')
    teardownMedia()
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'finish' }))
    } else {
      // No active connection (already paused) - caller finalizes via REST.
      setStatus('done')
    }
  }, [teardownMedia])

  const reset = useCallback(() => {
    setStatus('idle')
    setSegments([])
    setInterim(null)
    setError(null)
  }, [])

  // Preload already-captured segments (used when continuing a paused session) so
  // the live view shows the existing transcript with new lines appended below.
  const seed = useCallback((segs: LiveSegment[]) => {
    setSegments((prev) => {
      if (prev.length >= segs.length) return prev
      return [...segs, ...prev]
    })
  }, [])

  const markDone = useCallback(() => setStatus('done'), [])

  useEffect(() => {
    return () => {
      // Navigating away mid-recording pauses (keeps the session continuable).
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'pause' }))
        } catch {
          /* noop */
        }
      }
      teardownMedia()
      wsRef.current?.close()
    }
  }, [teardownMedia])

  return { status, segments, interim, error, start, pause, finish, reset, markDone, seed }
}
