import { useEffect, useState } from 'react'
import { getCommunityCard, getCommunityCards } from '../../api/community'
import GeneratedCardBody from './GeneratedCardBody'
import './Community.css'

export default function CommunityPage({ id }) {
  return (
    <main className="page-shell generated-cards-page" id="community-page" tabIndex={-1}>
      <a className="generated-cards-back" href={id ? '#/community' : '#knowledge-feed'}>
        {id ? '← 커뮤니티 목록으로' : '← 지식 목록으로'}
      </a>
      <h1>커뮤니티</h1>
      <CommunityCards key={id ?? 'list'} id={id} />
    </main>
  )
}

function CommunityCards({ id }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const result = id ? getCommunityCard(id, controller.signal) : getCommunityCards(controller.signal)
    result.then(setData).catch((error) => {
      if (!controller.signal.aborted) setError(error.message)
    })
    return () => controller.abort()
  }, [id, attempt])

  if (error) return (
    <div className="generated-cards-panel">
      <p role="alert">{error}</p>
      <button type="button" className="primary-button" onClick={() => {
        setError('')
        setAttempt((current) => current + 1)
      }}>다시 불러오기</button>
    </div>
  )
  if (data === null) return <p className="generated-cards-panel" role="status">카드를 불러오는 중이에요.</p>
  if (id) return (
    <article className="generated-cards-panel saved-generated-card">
      <p className="category-label">{data.category}</p>
      <h2>{data.title}</h2>
      <GeneratedCardBody card={data} />
    </article>
  )
  if (!data.length) return <p className="generated-cards-panel">아직 공개된 카드가 없어요.</p>

  return (
    <ul className="saved-generated-list">
      {data.map((card) => (
        <li className="generated-cards-panel" key={card.id}>
          <p className="category-label">{card.category}</p>
          <h2><a href={`#/community/${card.id}`}>{card.title}</a></h2>
          <p>{card.summary}</p>
        </li>
      ))}
    </ul>
  )
}
