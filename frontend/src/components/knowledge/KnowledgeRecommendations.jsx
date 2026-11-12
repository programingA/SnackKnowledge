import { useEffect, useState } from 'react'
import { getRecommendations } from '../../api/recommendations'
import Icon from '../ui/Icon'
import { getCategoryStyle } from '../../data/sampleKnowledge'
import BookmarkButton from './BookmarkButton'
import './KnowledgeRecommendations.css'

export default function KnowledgeRecommendations({ onOpenArticle, bookmarks, paused = false }) {
  const [cards, setCards] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (paused) return
    const controller = new AbortController()
    getRecommendations(controller.signal)
      .then((result) => {
        setCards(result)
        setError('')
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message)
      })
    return () => controller.abort()
  }, [attempt, paused])

  return (
    <section className="recommendations" aria-labelledby="recommendations-title">
      <header className="recommendations-heading">
        <span className="recommendations-icon"><Icon name="sparkle" size={21} /></span>
        <div>
          <h2 id="recommendations-title">나에게 맞는 지식</h2>
          {cards?.length > 0 && (
            <p>{cards.some((card) => card.matchedInterest)
              ? '관심 분야와 읽기·북마크 기록을 바탕으로 골랐어요.'
              : '아직 읽거나 저장하지 않은 카드부터 골랐어요.'}</p>
          )}
        </div>
      </header>
      {error && (
        <div className="recommendations-state">
          <p role="alert">{error}</p>
          <button type="button" className="text-button" onClick={() => {
            setError('')
            setAttempt((current) => current + 1)
          }}>다시 불러오기</button>
        </div>
      )}
      {!error && cards === null && <p className="recommendations-state" role="status">추천을 불러오는 중이에요.</p>}
      {!error && cards?.length === 0 && <p className="recommendations-state">추천할 새 카드가 아직 없어요.</p>}
      {cards?.length > 0 && (
        <ul className="recommendations-list">
          {cards.map((card) => {
            const { color, icon } = getCategoryStyle(card.category)
            return (
              <li key={card.id} className={bookmarks ? 'recommendation-with-bookmark' : undefined}>
                <button className="recommendations-card" type="button" onClick={() => onOpenArticle(card)}>
                  <span className={`category-label recommendation-category tint-${color} text-${color}`}>
                    <Icon name={icon} size={14} />{card.category}
                  </span>
                  <strong>{card.title}</strong>
                  <span className="recommendations-summary">{card.summary}</span>
                </button>
                {bookmarks && <BookmarkButton card={card} bookmarks={bookmarks} compact />}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
