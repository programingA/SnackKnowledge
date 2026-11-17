import { useEffect } from 'react'
import './StatusToast.css'

export default function StatusToast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(onDismiss, 4000)
    return () => window.clearTimeout(timeout)
  }, [message, onDismiss])

  return <span className={message ? 'status-toast' : 'sr-only'} role="status">{message}</span>
}
