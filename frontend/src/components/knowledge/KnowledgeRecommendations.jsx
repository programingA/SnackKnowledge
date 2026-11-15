import { useEffect, useState } from 'react'
import { getRecommendations } from '../../api/recommendations'
import KnowledgeCard from './KnowledgeCard'
import './KnowledgeRecommendations.css'

export default function KnowledgeRecommendations({ bookmarks, paused = false }) {
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
        <h2 id="recommendations-title">나에게 맞는 지식</h2>
        {cards?.length > 0 && (
          <p>{cards.some((card) => card.matchedInterest)
            ? '관심 분야와 읽기·북마크 기록을 바탕으로 골랐어요.'
            : '아직 읽거나 저장하지 않은 카드부터 골랐어요.'}</p>
        )}
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
        <ul className="card-grid recommendations-list" role="list">
          {cards.map((card) => (
            <li key={card.id}>
              <KnowledgeCard card={card} bookmarks={bookmarks} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
