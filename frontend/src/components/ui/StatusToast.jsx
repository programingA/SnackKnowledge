import { useEffect } from 'react'
import './StatusToast.css'

export default function StatusToast({ message, onDismiss, noticeKey }) {
  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(onDismiss, 4000)
    return () => window.clearTimeout(timeout)
  }, [message, onDismiss, noticeKey])

  const toastKey = noticeKey ?? message

  return (
    <>
      <span className="sr-only" role="status">
        {message && <span key={toastKey}>{message}</span>}
      </span>
      {message && (
        <span key={toastKey} className="status-toast" aria-hidden="true">{message}</span>
      )}
    </>
  )
}
