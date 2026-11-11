import { useEffect, useState } from 'react'
import { getBookmarkStatus, setBookmark } from '../../api/bookmarks'
import './Bookmarks.css'

export default function BookmarkButton({ id }) {
  const [saved, setSaved] = useState(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getBookmarkStatus(id, controller.signal)
      .then((result) => setSaved(result.saved))
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message)
      })
    return () => controller.abort()
  }, [id, attempt])

  async function handleClick() {
    setError('')
    if (saved === null) {
      setAttempt(attempt + 1)
      return
    }
    setPending(true)
    try {
      await setBookmark(id, !saved)
      setSaved(!saved)
    } catch (error) {
      setError(error.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="bookmark-control">
      <button
        type="button"
        className="bookmark-button"
        aria-pressed={saved ?? undefined}
        disabled={pending || (saved === null && !error)}
        onClick={handleClick}
      >
        {pending ? '처리 중...' : saved === null
          ? (error ? '북마크 다시 확인' : '북마크 확인 중...')
          : (saved ? '북마크 해제' : '북마크 저장')}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
