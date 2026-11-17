import { useState } from 'react'
import { categories } from '../../data/sampleKnowledge'
import Icon from '../ui/Icon'
import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import KnowledgeCard from './KnowledgeCard'
import KnowledgeCategoryPicker from './KnowledgeCategoryPicker'
import CardPagination, { CARDS_PER_PAGE } from './CardPagination'

export default function KnowledgeFeed({ cards, error, bookmarks, savedCards, onRetry }) {
  const [category, setCategory] = useState('전체')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const saved = savedCards?.data ?? []
  const feedCards = [
    ...(cards ?? []).map((card) => ({ card, generated: false })),
    ...saved.map((card) => ({ card, generated: true })),
  ]
  const availableCategories = [...new Set([...categories, ...feedCards.map(({ card }) => card.category)])]
  const activeCategory = availableCategories.includes(category) ? category : '전체'
  const visible = feedCards.filter(({ card }) => {
    const matchesCategory = activeCategory === '전체' || card.category === activeCategory
    const searchableText = `${card.title.replaceAll('\n', ' ')} ${card.summary} ${card.category}`
    return matchesCategory && searchableText.includes(search.trim())
  })
  const pageCount = Math.max(1, Math.ceil(visible.length / CARDS_PER_PAGE))
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE
  const pageCards = visible.slice(startIndex, startIndex + CARDS_PER_PAGE)
  const loading = (cards === null && !error) || (savedCards?.data === null && !savedCards.error)
  const showEmptyState = !loading && !error && !savedCards?.error && visible.length === 0

  return (
    <section
      className="knowledge-section"
      id="knowledge-feed"
      aria-labelledby="feed-title"
    >
      <div className="section-top">
        <h2 id="feed-title">지식 둘러보기</h2>
        <label className="search-box">
          <Icon name="search" size={18} strokeWidth={1.5} />
          <span className="sr-only">지식 검색</span>
          <input
            type="search"
            placeholder="제목·주제 검색"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </label>
      </div>
      <div className="filter-bar">
        <KnowledgeCategoryPicker categories={availableCategories} value={activeCategory} onChange={(next) => {
          if (next === activeCategory) return
          setCategory(next)
          setPage(1)
        }} />
        {!loading && (cards !== null || savedCards?.data != null) && (
          <span className="result-count" role="status">
            총 <b>{visible.length}</b>개의 지식
          </span>
        )}
      </div>
      {error && <LoadError heading="h3" message="지식 목록을 불러오지 못했어요." onRetry={onRetry} />}
      {savedCards?.error && <LoadError heading="h3" message="저장한 카드를 불러오지 못했어요." onRetry={savedCards.retry} />}
      {bookmarks?.error && <LoadError heading="h3" message="북마크를 불러오지 못했어요." onRetry={bookmarks.retry} />}
      {loading && <LoadingSkeleton layout="cards" label="지식 목록을 불러오는 중이에요." />}
      <div className="card-grid">
        {pageCards.map(({ card, generated }) => (
          <KnowledgeCard key={`${generated ? 'saved' : 'knowledge'}:${card.id}`} card={card}
            href={generated ? `#/generated-cards/${card.id}` : undefined} bookmarks={generated ? null : bookmarks} />
        ))}
      </div>
      {!loading && (
        <CardPagination page={currentPage} pageCount={pageCount} onChange={setPage} label="지식 목록 페이지" />
      )}
      {showEmptyState && feedCards.length === 0 && (
        <div className="empty-state">
          <h3>아직 등록된 지식이 없어요</h3>
        </div>
      )}
      {showEmptyState && feedCards.length > 0 && (
        <div className="empty-state">
          <h3>검색 결과가 없어요</h3>
          <p>다른 단어로 검색하거나 카테고리를 바꿔보세요.</p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setSearch('')
              setCategory('전체')
              setPage(1)
            }}
          >
            전체 지식 보기
            <Icon name="arrow" size={16} />
          </button>
        </div>
      )}
    </section>
  )
}
