import BookmarkButton from './BookmarkButton'
import './Bookmarks.css'

export default function BookmarksPage({ bookmarks, onSignIn, onOpenArticle }) {
  return (
    <main className="page-shell bookmarks-page" id="bookmarks-page" tabIndex={-1}>
      <h1>내 북마크</h1>
      {bookmarks ? <BookmarkList bookmarks={bookmarks} onOpenArticle={onOpenArticle} /> : (
        <div className="bookmark-empty">
          <p>로그인하면 저장한 카드를 볼 수 있어요.</p>
          <button className="primary-button" type="button" onClick={onSignIn}>로그인</button>
        </div>
      )}
    </main>
  )
}

function BookmarkList({ bookmarks, onOpenArticle }) {
  const { cards, error, retry } = bookmarks

  if (error) return (
    <>
      <p role="alert">{error}</p>
      <button className="bookmark-button" type="button" onClick={retry}>목록 다시 불러오기</button>
    </>
  )

  if (!cards) return <p role="status">북마크를 불러오는 중이에요.</p>
  if (!cards.length) return <p className="bookmark-empty">아직 저장한 카드가 없어요. 지식 목록에서 북마크를 저장해보세요.</p>

  return (
    <ul className="bookmark-list">
      {cards.map((card) => (
        <li key={card.id}>
          <div>
            <p className="category-label">{card.category}</p>
            <h2><button className="bookmark-card-title" type="button" onClick={() => onOpenArticle(card)}>{card.title}</button></h2>
            <p>{card.summary}</p>
          </div>
          <BookmarkButton card={card} bookmarks={bookmarks} compact />
        </li>
      ))}
    </ul>
  )
}
