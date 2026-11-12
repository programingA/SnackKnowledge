import { useEffect, useRef, useState } from 'react'
import { recordLearningActivity } from '../../api/learningHistory'

export default function useLearningActivity(id, username, hasKnowledge) {
  const activeRequest = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!username || !hasKnowledge) return

    const controller = new AbortController()
    activeRequest.current = controller
    recordLearningActivity(id, 'read', controller.signal).catch((error) => {
      if (!controller.signal.aborted) setError(error.message)
    })
    return () => {
      controller.abort()
      activeRequest.current = null
    }
  }, [id, username, hasKnowledge])

  function track(activity) {
    const signal = activeRequest.current?.signal
    if (!signal) return

    setError('')
    recordLearningActivity(id, activity, signal).catch((error) => {
      if (!signal.aborted) setError(error.message)
    })
  }

  return { track, error: username ? error : '' }
}
