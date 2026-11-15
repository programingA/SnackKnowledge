import { useEffect, useState } from 'react'
import { getCommunityCard, getCommunityCards } from '../../api/community'
import GeneratedArticle from './GeneratedArticle'
import KnowledgeCard from './KnowledgeCard'
import useArticleBackLinkRef from './useArticleBackLinkRef'

export default function CommunityPage({ id }) {
  return (
    <main className={id ? "page-shell article-page" : "page-shell generated-cards-page"} id="community-page" tabIndex={-1}>
      {!id && <h1>커뮤니티</h1>}
      <CommunityCards key={id ?? 'list'} id={id} />
    </main>
  )
}

function CommunityCards({ id }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const backLinkRef = useArticleBackLinkRef()
  const backLink = id && <a className="article-back" href="#/community" ref={backLinkRef}>← 커뮤니티 목록으로</a>

  useEffect(() => {
    const controller = new AbortController()
    const result = id ? getCommunityCard(id, controller.signal) : getCommunityCards(controller.signal)
    result.then(setData).catch((error) => {
      if (!controller.signal.aborted) setError(error.message)
    })
    return () => controller.abort()
  }, [id, attempt])

  if (error || data === null) return (
    <>
      {backLink}
      <div className="generated-cards-panel">
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button type="button" className="primary-button" onClick={() => {
              setError('')
              setAttempt((current) => current + 1)
            }}>다시 불러오기</button>
          </>
        ) : <p role="status">카드를 불러오는 중이에요.</p>}
      </div>
    </>
  )
  if (id) return <GeneratedArticle card={data} studyPath={`/api/study/generated/community/${id}`} headerActions={backLink} />
  if (!data.length) return <p className="generated-cards-panel">아직 공개된 카드가 없어요.</p>

  return (
    <ul className="knowledge-card-list" role="list">
      {data.map((card) => (
        <li key={card.id}>
          <KnowledgeCard card={card} href={`#/community/${card.id}`} heading="h2" />
        </li>
      ))}
    </ul>
  )
}
