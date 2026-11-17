import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import KnowledgeCard from './KnowledgeCard'
import './Bookmarks.css'

export default function BookmarksPage({ bookmarks, onSignIn }) {
  return (
    <main className="page-shell bookmarks-page" id="bookmarks-page" tabIndex={-1}>
      <h1>내 북마크</h1>
      {bookmarks ? <BookmarkList bookmarks={bookmarks} /> : (
        <div className="bookmark-empty">
          <p>로그인하면 저장한 카드를 볼 수 있어요.</p>
          <button className="primary-button" type="button" onClick={onSignIn}>로그인</button>
        </div>
      )}
    </main>
  )
}

function BookmarkList({ bookmarks }) {
  const { cards, error, retry } = bookmarks

  if (error) return <LoadError message="북마크를 불러오지 못했어요." onRetry={retry} />

  if (!cards) return <LoadingSkeleton layout="rows" label="북마크를 불러오는 중이에요." />
  if (!cards.length) return <p className="bookmark-empty">아직 저장한 카드가 없어요. 지식 목록에서 북마크를 저장해보세요.</p>

  return (
    <ul className="knowledge-card-list" role="list">
      {cards.map((card) => (
        <li key={card.id}>
          <KnowledgeCard card={card} bookmarks={bookmarks} heading="h2" showReadLabel={false} />
        </li>
      ))}
    </ul>
  )
}
