import { useState } from 'react'
import { categories } from '../../data/sampleKnowledge'
import Icon from '../ui/Icon'
import KnowledgeCard from './KnowledgeCard'

export default function KnowledgeFeed({ cards, error, bookmarks, onRetry }) {
  const [category, setCategory] = useState('전체')
  const [search, setSearch] = useState('')
  const visible = (cards ?? []).filter((article) => {
    const matchesCategory = category === '전체' || article.category === category
    const searchableText = `${article.title.replace('\n', ' ')} ${article.summary} ${article.category}`
    return matchesCategory && searchableText.includes(search.trim())
  })

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
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="filter-bar">
        <div className="category-tabs" aria-label="카테고리 필터">
          {categories.map((c) => (
            <button
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={category === c ? 'selected' : ''}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        {cards !== null && (
          <span className="result-count" role="status">
            총 <b>{visible.length}</b>개의 지식
          </span>
        )}
      </div>
      {error && (
        <div className="empty-state">
          <h3 role="alert">지식 목록을 불러오지 못했어요</h3>
          <button type="button" className="text-button" onClick={onRetry}>다시 불러오기</button>
        </div>
      )}
      {bookmarks?.error && <p role="alert">{bookmarks.error}</p>}
      {cards === null && !error && <p role="status">지식 목록을 불러오는 중이에요.</p>}
      <div className="card-grid">
        {visible.map((card) => (
          <KnowledgeCard key={card.id} card={card} bookmarks={bookmarks} />
        ))}
      </div>
      {cards?.length === 0 && (
        <div className="empty-state">
          <h3>아직 등록된 지식이 없어요</h3>
        </div>
      )}
      {cards?.length > 0 && visible.length === 0 && (
        <div className="empty-state">
          <h3>검색 결과가 없어요</h3>
          <p>다른 단어로 검색하거나 카테고리를 바꿔보세요.</p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setSearch('')
              setCategory('전체')
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
