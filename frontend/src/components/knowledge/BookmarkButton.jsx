import { useState } from 'react'
import Icon from '../ui/Icon'
import './Bookmarks.css'

export default function BookmarkButton({ card, bookmarks, compact = false }) {
  const [error, setError] = useState('')
  const saved = bookmarks.cards?.some((item) => item.id === card.id)
  const pending = bookmarks.isPending(card.id)
  const label = pending ? '북마크 처리 중'
    : saved === undefined ? (bookmarks.error ? '북마크 다시 확인' : '북마크 확인 중')
      : saved ? '북마크 해제' : '북마크 저장'

  async function handleClick() {
    setError('')
    if (saved === undefined) {
      bookmarks.retry()
      return
    }

    try {
      await bookmarks.change(card, !saved)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className={compact ? 'bookmark-control bookmark-control--compact' : 'bookmark-control'}>
      <button
        type="button"
        className="bookmark-button bookmark-icon-button"
        aria-label={compact ? card.title + ' ' + label : label}
        title={label}
        aria-pressed={saved}
        disabled={pending || (saved === undefined && !bookmarks.error)}
        onClick={handleClick}
      >
        <Icon name="bookmark" size={20} fill={saved ? 'currentColor' : 'none'} />
      </button>
      {error && <p role="alert">{error}</p>}
      {!compact && bookmarks.error && <p role="alert">{bookmarks.error}</p>}
    </div>
  )
}
