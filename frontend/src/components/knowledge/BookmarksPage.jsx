import { useEffect, useState } from 'react'
import { getBookmarks, setBookmark } from '../../api/bookmarks'
import './Bookmarks.css'

export default function BookmarksPage({ username, onSignIn, onOpenArticle }) {
  return (
    <main className="page-shell bookmarks-page" id="bookmarks-page" tabIndex={-1}>
      <a className="article-back" href="#knowledge-feed">← 지식 목록으로</a>
      <h1>내 북마크</h1>
      {username ? <BookmarkList key={username} onOpenArticle={onOpenArticle} /> : (
        <div className="bookmark-empty">
          <p>로그인하면 저장한 카드를 볼 수 있어요.</p>
          <button className="primary-button" type="button" onClick={onSignIn}>로그인</button>
        </div>
      )}
    </main>
  )
}

function BookmarkList({ onOpenArticle }) {
  const [cards, setCards] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [pendingId, setPendingId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getBookmarks(controller.signal)
      .then(setCards)
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message)
      })
    return () => controller.abort()
  }, [attempt])

  async function removeCard(id) {
    setPendingId(id)
    setError('')
    try {
      await setBookmark(id, false)
      setCards((current) => current.filter((card) => card.id !== id))
    } catch (error) {
      setError(error.message)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
      {cards === null && (error ? (
        <button className="bookmark-button" type="button" onClick={() => {
          setError('')
          setAttempt(attempt + 1)
        }}>
          목록 다시 불러오기
        </button>
      ) : <p role="status">북마크를 불러오는 중이에요.</p>)}
      {cards?.length === 0 && (
        <p className="bookmark-empty">아직 저장한 카드가 없어요. 카드 상세에서 북마크를 저장해보세요.</p>
      )}
      {cards?.length > 0 && (
        <ul className="bookmark-list">
          {cards.map((card) => (
            <li key={card.id}>
              <div>
                <p className="category-label">{card.category}</p>
                <h2><button className="bookmark-card-title" type="button" onClick={() => onOpenArticle(card)}>{card.title}</button></h2>
                <p>{card.summary}</p>
              </div>
              <button
                className="bookmark-button"
                type="button"
                aria-label={card.title + ' 북마크 해제'}
                disabled={pendingId !== null}
                onClick={() => removeCard(card.id)}
              >
                {pendingId === card.id ? '해제 중...' : '해제'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
