import { useEffect, useState } from 'react'

export default function useApiQuery(load, key, enabled = true) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const current = enabled && result?.key === key && result?.attempt === attempt ? result : null

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const { signal } = controller

    load(signal, key).then((data) => {
      if (!signal.aborted) setResult({ key, attempt, data })
    }).catch((error) => {
      if (!signal.aborted) setResult({ key, attempt, error })
    })

    return () => controller.abort()
  }, [load, key, enabled, attempt])

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    retry: () => setAttempt((value) => value + 1),
  }
}
