import { useState } from 'react'
import { categories, getCategoryStyle } from '../../data/sampleKnowledge'
import Icon from '../ui/Icon'
import BookmarkButton from './BookmarkButton'

export default function KnowledgeFeed({ cards, error, bookmarks }) {
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
        <div>
          <span className="eyebrow">YOUR DAILY DISCOVERY</span>
          <h2 id="feed-title">
            어떤 지식을 맛볼까요?<span className="heading-spark">✳</span>
          </h2>
          <p>마음이 가는 카드를 골라, 새로운 이야기를 만나보세요.</p>
        </div>
        <label className="search-box">
          <Icon name="search" size={19} />
          <span className="sr-only">지식 검색</span>
          <input
            type="search"
            placeholder="어떤 지식이 궁금하세요?"
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
              {c === '전체' && <Icon name="sparkle" size={15} />}
              {c}
            </button>
          ))}
        </div>
        <span className="result-count" role="status">
          총 <b>{visible.length}</b>개의 지식
        </span>
      </div>
      {error && <p role="alert">{error}</p>}
      {bookmarks?.error && <p role="alert">{bookmarks.error}</p>}
      {cards === null && !error && <p>불러오는 중...</p>}
      <div className="card-grid" key={`${category}-${search}`}>
        {visible.map((article, index) => {
          const { color, icon } = getCategoryStyle(article.category)
          return (
            <article className="knowledge-card" key={article.id} style={{ '--index': index }}>
              <div className="card-top">
                <span className={`topic-icon tint-${color} text-${color}`}>
                  <Icon name={icon} size={23} />
                </span>
                <span className={`category-label text-${color}`}>
                  {article.category}
                </span>
                {bookmarks ? <BookmarkButton card={article} bookmarks={bookmarks} compact />
                  : <span className="card-number">#{article.id}</span>}
              </div>
              <h3><a className="knowledge-card-link" href={`#/knowledge/${article.id}`}>{article.title}</a></h3>
              <p>{article.summary}</p>
              <div className="card-bottom">
                <span className="card-link">
                  한 입 읽기 <Icon name="arrow" size={16} />
                </span>
              </div>
            </article>
          )
        })}
      </div>
      {cards !== null && !error && visible.length === 0 && (
        <div className="empty-state">
          <Icon name="search" size={32} />
          <h3>아직 준비되지 않은 호기심이에요.</h3>
          <p>다른 단어를 검색하거나 전체 지식을 둘러보세요.</p>
          <button
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
