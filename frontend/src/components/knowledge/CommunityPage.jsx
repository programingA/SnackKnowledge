import { useState } from 'react'
import { getCommunityCard, getCommunityCards } from '../../api/community'
import useApiQuery from '../../api/useApiQuery'
import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import GeneratedArticle from './GeneratedArticle'
import KnowledgeCard from './KnowledgeCard'
import useArticleBackLinkRef from './useArticleBackLinkRef'
import BookmarkButton from './BookmarkButton'
import CardPagination, { CARDS_PER_PAGE } from './CardPagination'

export default function CommunityPage({ id, bookmarks }) {
  const [page, setPage] = useState(1)
  return (
    <main className={id ? "page-shell article-page" : "page-shell generated-cards-page"} id="community-page" tabIndex={-1}>
      {!id && <h1>커뮤니티</h1>}
      <CommunityCards key={id ?? 'list'} id={id} bookmarks={bookmarks} page={page} onPageChange={setPage} />
    </main>
  )
}

function loadCommunityCards(signal, id) {
  return id ? getCommunityCard(id, signal) : getCommunityCards(signal)
}

function CommunityCards({ id, bookmarks, page, onPageChange }) {
  const { data, error, retry } = useApiQuery(loadCommunityCards, id)
  const backLinkRef = useArticleBackLinkRef()
  const backLink = id && <a className="article-back" href="#/community" ref={backLinkRef}>← 커뮤니티 목록으로</a>
  const errorMessage = id ? '공개 카드를 불러오지 못했어요.' : '커뮤니티 목록을 불러오지 못했어요.'

  if (error || data === null) {
    const status = error ? (
      <LoadError heading={id ? 'h1' : 'h2'} message={id && error.status === 404 ? error.message : errorMessage}
        onRetry={retry} />
    ) : <LoadingSkeleton layout={id ? 'article' : 'rows'} label="커뮤니티 카드를 불러오는 중이에요." />

    return id ? (
      <div className="article-page-card saved-card-status">
        <div className="saved-card-back">{backLink}</div>
        {status}
      </div>
    ) : status
  }
  if (id) {
    const card = { ...data, id: id.toLowerCase(), source: 'community' }
    return <GeneratedArticle card={card} studyPath={`/api/study/generated/community/${id}`} backLink={backLink}
      titleAction={bookmarks && <BookmarkButton card={card} bookmarks={bookmarks} />} />
  }
  if (!data.length) return <p className="generated-cards-panel">아직 공개된 카드가 없어요.</p>

  const pageCount = Math.ceil(data.length / CARDS_PER_PAGE)
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * CARDS_PER_PAGE
  return (
    <>
      <ul className="knowledge-card-list" role="list">
        {data.slice(start, start + CARDS_PER_PAGE).map((card) => (
          <li key={card.id}>
            <KnowledgeCard card={{ ...card, source: 'community' }} bookmarks={bookmarks}
              href={`#/community/${card.id}`} heading="h2" />
          </li>
        ))}
      </ul>
      <CardPagination page={currentPage} pageCount={pageCount} onChange={onPageChange} label="커뮤니티 목록 페이지" />
    </>
  )
}
