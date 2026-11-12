import { useEffect, useState } from 'react'
import { decideCommunityReview, getCommunityReview, getCommunityReviews } from '../../api/community'
import GeneratedCardBody from './GeneratedCardBody'

export default function CommunityReviewPage({ id }) {
  const [notice, setNotice] = useState('')

  function finishReview(decision) {
    setNotice(decision === 'APPROVED' ? '카드를 승인했어요. 커뮤니티에서 볼 수 있어요.' : '카드를 반려했어요.')
    window.location.hash = '/community-review'
  }

  return (
    <main className="page-shell generated-cards-page" id="community-review-page" tabIndex={-1}>
      <a className="generated-cards-back" href={id ? '#/community-review' : '#/my-page'}>
        {id ? '← 검토 목록으로' : '← 마이페이지로'}
      </a>
      <h1>커뮤니티 검토</h1>
      {!id && notice && <p role="status">{notice}</p>}
      <ReviewQueue key={id ?? 'queue'} id={id} onDecision={finishReview} />
    </main>
  )
}

function ReviewQueue({ id, onDecision }) {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const result = id ? getCommunityReview(id, controller.signal) : getCommunityReviews(controller.signal)
    result.then(setData).catch((error) => {
      if (!controller.signal.aborted) setLoadError(error)
    })
    return () => controller.abort()
  }, [id, attempt])

  async function decide(decision) {
    setSaving(true)
    setActionError(null)
    try {
      await decideCommunityReview(id, decision)
      if (window.location.hash === '#/community-review/' + id) onDecision(decision)
    } catch (error) {
      setActionError(error)
    } finally {
      setSaving(false)
    }
  }

  if (loadError) return (
    <div className="generated-cards-panel">
      <p role="alert">{loadError.message}</p>
      {!loadError.status && (
        <button type="button" className="text-button" onClick={() => {
          setLoadError(null)
          setAttempt((current) => current + 1)
        }}>다시 불러오기</button>
      )}
    </div>
  )
  if (!data) return <p role="status">검토 요청을 불러오는 중이에요.</p>
  if (id) return (
    <article className="generated-cards-panel saved-generated-card">
      <p className="category-label">{data.category}</p>
      <h2>{data.title}</h2>
      <GeneratedCardBody card={data} />
      <div className="generated-card-actions">
        <button type="button" className="primary-button" disabled={saving || Boolean(actionError?.status)}
          onClick={() => decide('APPROVED')}>승인하고 공개</button>
        <button type="button" className="generated-delete" disabled={saving || Boolean(actionError?.status)}
          onClick={() => decide('REJECTED')}>반려</button>
      </div>
      {saving && <p role="status">검토 결과를 저장하는 중이에요.</p>}
      {actionError && <p className="generated-card-error" role="alert">{actionError.message}</p>}
    </article>
  )
  if (!data.length) return <p className="generated-cards-panel">검토를 기다리는 카드가 없어요.</p>
  return (
    <ul className="saved-generated-list">
      {data.map((card) => (
        <li className="generated-cards-panel" key={card.id}>
          <p className="category-label">{card.category}</p>
          <h2><a href={`#/community-review/${card.id}`}>{card.title}</a></h2>
          <p>{card.summary}</p>
        </li>
      ))}
    </ul>
  )
}
