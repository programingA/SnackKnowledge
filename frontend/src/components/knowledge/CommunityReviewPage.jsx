import { useState } from 'react'
import { decideCommunityReview, getCommunityReview } from '../../api/community'
import useApiQuery from '../../api/useApiQuery'
import LoadError from '../ui/LoadError'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import GeneratedArticle from './GeneratedArticle'
import './CommunityReviewPage.css'

const dateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })

function Applicant({ applicant, submittedAt, showTimeLabel = false, className }) {
  return (
    <p className={className}>
      <span className="community-review-label">{showTimeLabel ? '신청자:' : '신청자'}</span> <strong>{applicant}</strong> ·{' '}
      {showTimeLabel && <><span className="community-review-label">신청 시각:</span>{' '}</>}
      <time dateTime={submittedAt}>{dateFormat.format(new Date(submittedAt))}</time>
    </p>
  )
}

export default function CommunityReviewPage({ id, username, canReview, isAdmin = false, onAdminDecision }) {
  const [notice, setNotice] = useState('')

  function finishReview(decision) {
    const message = decision === 'APPROVED' ? '카드를 승인하고 공개했어요.' : '카드를 반려했어요.'
    if (isAdmin) {
      onAdminDecision(message)
      window.location.hash = '/admin'
    } else {
      setNotice(message)
      window.location.hash = '/community-review'
    }
  }

  return (
    <main className={id ? 'page-shell article-page' : 'page-shell generated-cards-page'}
      id="community-review-page" tabIndex={-1}>
      <a className="article-back" href={isAdmin ? '#/admin' : id ? '#/community-review' : '#/my-page'}>
        {isAdmin ? '← 관리자 대시보드로' : id ? '← 검토 목록으로' : '← 마이페이지로'}
      </a>
      {(!id || !canReview) && <h1>커뮤니티 검토</h1>}
      {!id && notice && <p role="status">{notice}</p>}
      {canReview ? (
        <ReviewQueue key={id ?? 'queue'} id={id} onDecision={finishReview} />
      ) : (
        <p className="generated-cards-panel">
          {username ? '이 계정에는 커뮤니티 검토 권한이 없어요.' : '관리자 계정으로 로그인해 주세요.'}
        </p>
      )}
    </main>
  )
}

function ReviewQueue({ id, onDecision }) {
  const { data, error, retry } = useApiQuery(getCommunityReview, id)
  const [actionError, setActionError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function decide(decision) {
    setSaving(true)
    setActionError(null)
    try {
      await decideCommunityReview(id, decision)
      if (window.location.hash.toLowerCase() === '#/community-review/' + id.toLowerCase()) onDecision(decision)
    } catch (error) {
      setActionError(error)
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    if ([401, 403, 404].includes(error.status)) {
      return <p className="generated-cards-panel" role="alert">{error.message}</p>
    }
    return <LoadError message={error.message} onRetry={retry} />
  }
  if (!data) return <LoadingSkeleton label="검토 요청을 불러오는 중이에요." layout={id ? 'article' : 'rows'} />

  if (id) {
    const disabled = saving || [401, 403, 404, 409].includes(actionError?.status)
    return (
      <GeneratedArticle card={data.card}
        headerActions={<Applicant className="community-review-request" applicant={data.applicant}
          submittedAt={data.submittedAt} showTimeLabel />}>
        <div className="generated-card-actions">
          <button type="button" className="primary-button" disabled={disabled}
            onClick={() => decide('APPROVED')}>승인하고 공개</button>
          <button type="button" className="text-button" disabled={disabled}
            onClick={() => decide('REJECTED')}>반려</button>
        </div>
        {saving && <p role="status">검토 결과를 저장하는 중이에요.</p>}
        {actionError && <p className="generated-card-error" role="alert">{actionError.message}</p>}
      </GeneratedArticle>
    )
  }

  if (!data.length) return <p className="generated-cards-panel">검토를 기다리는 카드가 없어요.</p>
  return (
    <ul className="knowledge-card-list">
      {data.map((card) => (
        <li className="generated-cards-panel" key={card.id}>
          <p className="category-label">{card.category}</p>
          <h2><a href={`#/community-review/${card.id}`}>{card.title}</a></h2>
          <p>{card.summary}</p>
          <Applicant applicant={card.applicant} submittedAt={card.submittedAt} />
        </li>
      ))}
    </ul>
  )
}
