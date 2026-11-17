import { getRecommendations } from '../../api/recommendations'
import useApiQuery from '../../api/useApiQuery'
import LoadError from '../ui/LoadError'
import KnowledgeCard from './KnowledgeCard'
import './KnowledgeRecommendations.css'

export default function KnowledgeRecommendations({ bookmarks, paused = false }) {
  const { data: cards, error, retry } = useApiQuery(getRecommendations, undefined, !paused)

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
      {error && <LoadError heading="h3" message="추천 지식을 불러오지 못했어요." onRetry={retry} />}
      {!error && cards === null && <p className="recommendations-state" role="status">추천을 불러오는 중이에요.</p>}
      {!error && cards?.length === 0 && (
        <div className="recommendations-empty">
          <h3>추천할 새 카드가 아직 없어요</h3>
          <p>아래 지식 목록에서 관심 있는 주제를 골라보세요.</p>
        </div>
      )}
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
